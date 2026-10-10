ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_verified boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.request_withdrawal_for_telegram(_telegram_id bigint, _amount numeric, _currency text, _wallet_address text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_profile uuid; v_balance numeric; v_pending int; v_id uuid;
BEGIN
  SELECT id INTO v_profile FROM public.profiles WHERE telegram_id = _telegram_id LIMIT 1;
  IF v_profile IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'no_profile'); END IF;
  IF _currency NOT IN ('ton','usdt') THEN RETURN jsonb_build_object('success', false, 'error', 'bad_currency'); END IF;
  IF _amount IS NULL OR _amount <= 0 OR _amount > 1000000 THEN
    RETURN jsonb_build_object('success', false, 'error', 'bad_amount');
  END IF;
  IF _wallet_address IS NULL OR length(_wallet_address) < 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'no_wallet');
  END IF;

  IF NOT public.game_is_wallet_verified(_telegram_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'wallet_not_verified');
  END IF;
  IF NOT (EXISTS (SELECT 1 FROM public.user_servers WHERE user_id = v_profile AND ton_paid >= 5)
       OR EXISTS (SELECT 1 FROM public.user_nfts WHERE telegram_id = _telegram_id AND price_ton >= 5)) THEN
    RETURN jsonb_build_object('success', false, 'error', 'nft_required');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.transactions WHERE user_id = v_profile AND type = 'deposit'
                 AND currency = 'ton' AND status = 'completed' AND amount >= 50) THEN
    RETURN jsonb_build_object('success', false, 'error', 'deposit_required');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_profile AND subscription_verified) THEN
    RETURN jsonb_build_object('success', false, 'error', 'subscription_required');
  END IF;

  SELECT CASE WHEN _currency = 'ton' THEN COALESCE(ton_balance, 0) ELSE COALESCE(usdt_balance, 0) END
  INTO v_balance FROM public.profiles WHERE id = v_profile FOR UPDATE;
  IF v_balance < _amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient_balance', 'balance', v_balance);
  END IF;

  SELECT count(*) INTO v_pending FROM public.transactions
  WHERE user_id = v_profile AND type = 'withdrawal' AND currency = _currency AND status = 'pending';
  IF v_pending > 0 THEN RETURN jsonb_build_object('success', false, 'error', 'pending_request_exists'); END IF;

  INSERT INTO public.transactions (user_id, type, amount, currency, status, wallet_address)
  VALUES (v_profile, 'withdrawal', _amount, _currency, 'pending', _wallet_address)
  RETURNING id INTO v_id;
  RETURN jsonb_build_object('success', true, 'id', v_id);
END; $function$;

CREATE OR REPLACE FUNCTION public.admin_verify_subscription_for_telegram(_admin_telegram_id bigint, _target_telegram_id bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_telegram_admin(_admin_telegram_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'forbidden');
  END IF;
  UPDATE public.profiles SET subscription_verified = true, updated_at = now()
  WHERE telegram_id = _target_telegram_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'no_profile'); END IF;
  RETURN jsonb_build_object('success', true);
END; $function$;