-- Task balances are nullable in legacy profiles. If a profile has NULL balances,
-- arithmetic updates silently stay NULL. Rebuild only NULL balances from the
-- idempotent user_tasks ledger; increment non-NULL balances only for new claims.
ALTER TABLE public.user_tasks
  ADD COLUMN IF NOT EXISTS reward_amount numeric,
  ADD COLUMN IF NOT EXISTS reward_type text;

UPDATE public.user_tasks ut
SET reward_amount = t.reward_amount,
    reward_type = t.reward_type
FROM public.tasks t
WHERE t.id = ut.task_id
  AND (ut.reward_amount IS NULL OR ut.reward_type IS NULL);

CREATE OR REPLACE FUNCTION public.complete_task_for_telegram(_telegram_id bigint, _task_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid; v_t public.tasks%ROWTYPE; v_p public.profiles%ROWTYPE; v_new boolean := true;
  v_ver text; v_n integer;
BEGIN
  v_uid := public.game_profile_id(_telegram_id);
  IF v_uid IS NULL THEN RETURN jsonb_build_object('success', false); END IF;
  SELECT * INTO v_t FROM public.tasks WHERE id = _task_id AND is_active = true;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'TASK_NOT_FOUND'); END IF;
  v_ver := COALESCE(v_t.verification_type, 'none');
  IF v_ver LIKE 'gift_kombat_%' THEN
    RETURN jsonb_build_object('success', false, 'error', 'PARTNER_VERIFICATION_REQUIRED');
  ELSIF v_ver = 'referral_count' THEN
    SELECT COUNT(*) INTO v_n FROM public.profiles WHERE referred_by = v_uid;
    IF v_n < 3 THEN RETURN jsonb_build_object('success', false, 'error', 'NEED_3_REFERRALS', 'current', v_n, 'required', 3); END IF;
  ELSIF v_ver = 'mining_hours' THEN
    SELECT COUNT(*) INTO v_n FROM public.mining_sessions WHERE user_id = v_uid AND claimed = true;
    IF v_n < 3 THEN RETURN jsonb_build_object('success', false, 'error', 'NEED_3_MINING_SESSIONS', 'current', v_n, 'required', 3); END IF;
  ELSIF v_ver = 'server_purchase' THEN
    SELECT COUNT(*) INTO v_n FROM public.user_servers WHERE user_id = v_uid;
    IF v_n < 1 THEN RETURN jsonb_build_object('success', false, 'error', 'NEED_SERVER_PURCHASE', 'current', v_n, 'required', 1); END IF;
  ELSIF v_ver = 'kill_monster' THEN
    SELECT COUNT(*) INTO v_n FROM public.attacks WHERE user_id = v_uid AND is_killing_blow = true;
    IF v_n < 1 THEN RETURN jsonb_build_object('success', false, 'error', 'NEED_MONSTER_KILL', 'current', v_n, 'required', 1); END IF;
  END IF;

  INSERT INTO public.user_tasks (user_id, task_id, reward_amount, reward_type)
  VALUES (v_uid, _task_id, v_t.reward_amount, v_t.reward_type)
  ON CONFLICT (user_id, task_id) DO NOTHING;
  IF NOT FOUND THEN v_new := false; END IF;

  UPDATE public.profiles p SET
    siri_balance = CASE WHEN p.siri_balance IS NULL THEN (
      SELECT COALESCE(SUM(ut.reward_amount), 0) FROM public.user_tasks ut
      WHERE ut.user_id = v_uid AND ut.reward_type = 'siri'
    ) ELSE p.siri_balance + CASE WHEN v_new AND v_t.reward_type = 'siri' THEN v_t.reward_amount ELSE 0 END END,
    ton_balance = CASE WHEN p.ton_balance IS NULL THEN (
      SELECT COALESCE(SUM(ut.reward_amount), 0) FROM public.user_tasks ut
      WHERE ut.user_id = v_uid AND ut.reward_type = 'ton'
    ) ELSE p.ton_balance + CASE WHEN v_new AND v_t.reward_type = 'ton' THEN v_t.reward_amount ELSE 0 END END,
    usdt_balance = CASE WHEN p.usdt_balance IS NULL THEN (
      SELECT COALESCE(SUM(ut.reward_amount), 0) FROM public.user_tasks ut
      WHERE ut.user_id = v_uid AND ut.reward_type = 'usdt'
    ) ELSE p.usdt_balance + CASE WHEN v_new AND v_t.reward_type = 'usdt' THEN v_t.reward_amount ELSE 0 END END
  WHERE p.id = v_uid;

  SELECT * INTO v_p FROM public.profiles WHERE id = v_uid;
  RETURN jsonb_build_object('success', true, 'alreadyCompleted', NOT v_new,
    'rewardAmount', CASE WHEN v_new THEN v_t.reward_amount ELSE 0 END,
    'rewardType', v_t.reward_type,
    'balances', jsonb_build_object('siri', v_p.siri_balance, 'ton', v_p.ton_balance, 'usdt', v_p.usdt_balance));
END;
$function$;

CREATE OR REPLACE FUNCTION public.complete_partner_task_for_telegram(_telegram_id bigint, _task_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid;
  v_task public.tasks%ROWTYPE;
  v_profile public.profiles%ROWTYPE;
  v_inserted_id uuid;
BEGIN
  v_uid := public.game_profile_id(_telegram_id);
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'PROFILE_NOT_FOUND');
  END IF;

  SELECT * INTO v_task
  FROM public.tasks
  WHERE id = _task_id AND is_active = true
    AND verification_type IN ('gift_kombat_wins_100', 'gift_kombat_level_5', 'gift_kombat_shop_purchase')
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'PARTNER_TASK_NOT_FOUND');
  END IF;

  INSERT INTO public.user_tasks (user_id, task_id, reward_amount, reward_type)
  VALUES (v_uid, _task_id, v_task.reward_amount, v_task.reward_type)
  ON CONFLICT (user_id, task_id) DO NOTHING
  RETURNING id INTO v_inserted_id;

  UPDATE public.profiles p SET
    siri_balance = CASE WHEN p.siri_balance IS NULL THEN (
      SELECT COALESCE(SUM(ut.reward_amount), 0) FROM public.user_tasks ut
      WHERE ut.user_id = v_uid AND ut.reward_type = 'siri'
    ) ELSE p.siri_balance + CASE WHEN v_inserted_id IS NOT NULL AND v_task.reward_type = 'siri' THEN v_task.reward_amount ELSE 0 END END,
    ton_balance = CASE WHEN p.ton_balance IS NULL THEN (
      SELECT COALESCE(SUM(ut.reward_amount), 0) FROM public.user_tasks ut
      WHERE ut.user_id = v_uid AND ut.reward_type = 'ton'
    ) ELSE p.ton_balance + CASE WHEN v_inserted_id IS NOT NULL AND v_task.reward_type = 'ton' THEN v_task.reward_amount ELSE 0 END END,
    usdt_balance = CASE WHEN p.usdt_balance IS NULL THEN (
      SELECT COALESCE(SUM(ut.reward_amount), 0) FROM public.user_tasks ut
      WHERE ut.user_id = v_uid AND ut.reward_type = 'usdt'
    ) ELSE p.usdt_balance + CASE WHEN v_inserted_id IS NOT NULL AND v_task.reward_type = 'usdt' THEN v_task.reward_amount ELSE 0 END END
  WHERE p.id = v_uid;

  SELECT * INTO v_profile FROM public.profiles WHERE id = v_uid;
  RETURN jsonb_build_object(
    'success', true,
    'alreadyCompleted', v_inserted_id IS NULL,
    'rewardAmount', CASE WHEN v_inserted_id IS NULL THEN 0 ELSE v_task.reward_amount END,
    'rewardType', v_task.reward_type,
    'balances', jsonb_build_object('siri', v_profile.siri_balance, 'ton', v_profile.ton_balance, 'usdt', v_profile.usdt_balance)
  );
END;
$function$;
