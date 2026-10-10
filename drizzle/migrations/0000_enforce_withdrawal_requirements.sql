CREATE OR REPLACE FUNCTION public.request_withdrawal_for_telegram(_telegram_id bigint, _amount numeric, _currency text, _wallet_address text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_profile uuid; v_balance numeric; v_verified boolean; v_has_nft boolean; v_has_deposit boolean; v_pending int; v_id uuid;
BEGIN
  SELECT id INTO v_profile FROM public.profiles WHERE telegram_id = _telegram_id LIMIT 1;
  IF v_profile IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'no_profile'); END IF;
  IF _currency NOT IN ('ton','usdt') THEN RETURN jsonb_build_object('success', false, 'error', 'bad_currency'); END IF;
  IF _amount IS NULL OR _amount <= 0 OR _amount > 1000000 THEN RETURN jsonb_build_object('success', false, 'error', 'bad_amount'); END IF;
  IF _wallet_address IS NULL OR length(_wallet_address) < 10 THEN RETURN jsonb_build_object('success', false, 'error', 'no_wallet'); END IF;
  v_verified := public.game_is_wallet_verified(_telegram_id);
  IF NOT v_verified THEN RETURN jsonb_build_object('success', false, 'error', 'wallet_not_verified'); END IF;
  SELECT EXISTS (
    SELECT 1 FROM public.user_servers WHERE user_id = v_profile AND ton_paid >= 5
    UNION ALL
    SELECT 1 FROM public.user_nfts WHERE telegram_id = _telegram_id AND price_ton >= 5
  ) INTO v_has_nft;
  IF NOT v_has_nft THEN RETURN jsonb_build_object('success', false, 'error', 'nft_required'); END IF;
  SELECT EXISTS (
    SELECT 1 FROM public.transactions
    WHERE user_id = v_profile AND type = 'deposit' AND currency = 'ton' AND status = 'completed' AND amount >= 50
  ) INTO v_has_deposit;
  IF NOT v_has_deposit THEN RETURN jsonb_build_object('success', false, 'error', 'deposit_required'); END IF;
  SELECT CASE WHEN _currency = 'ton' THEN COALESCE(ton_balance, 0) ELSE COALESCE(usdt_balance, 0) END
    INTO v_balance FROM public.profiles WHERE id = v_profile FOR UPDATE;
  IF v_balance < _amount THEN RETURN jsonb_build_object('success', false, 'error', 'insufficient_balance', 'balance', v_balance); END IF;
  SELECT count(*) INTO v_pending FROM public.transactions
    WHERE user_id = v_profile AND type = 'withdrawal' AND currency = _currency AND status = 'pending';
  IF v_pending > 0 THEN RETURN jsonb_build_object('success', false, 'error', 'pending_request_exists'); END IF;
  INSERT INTO public.transactions (user_id, type, amount, currency, status, wallet_address)
    VALUES (v_profile, 'withdrawal', _amount, _currency, 'pending', _wallet_address) RETURNING id INTO v_id;
  RETURN jsonb_build_object('success', true, 'id', v_id);
END; $$;
REVOKE ALL ON FUNCTION public.request_withdrawal_for_telegram(bigint, numeric, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_withdrawal_for_telegram(bigint, numeric, text, text) TO anon, authenticated, service_role;