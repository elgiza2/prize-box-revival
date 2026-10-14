-- Gift Kombat partner missions. The verification types are server-only: the
-- public task-claim RPC must never award these tasks without partner verification.
INSERT INTO public.tasks (
  title, description, reward_amount, reward_type, task_type, link,
  verification_type, is_active, is_pinned, image_url
)
SELECT
  v.title, v.description, 0.5, 'ton', 'social',
  'https://t.me/gift_kombat_bot?startapp=963796674utm_Noveaibot',
  v.verification_type, true, false, '/images/gift-kombat.jpg'
FROM (VALUES
  (
    'Gift Kombat | Win 100 battles',
    'Win 100 battles in Gift Kombat. Open the game, complete the requirement, then return here and tap Verify.',
    'gift_kombat_wins_100'
  ),
  (
    'Gift Kombat | Reach level 5',
    'Reach level 5 in Gift Kombat. Open the game, complete the requirement, then return here and tap Verify.',
    'gift_kombat_level_5'
  ),
  (
    'Gift Kombat | Shop purchases 300⭐',
    'Make qualifying shop purchases in Gift Kombat (partner API threshold: $4.25 since 2026-10-13). Return here and tap Verify.',
    'gift_kombat_shop_purchase'
  )
) AS v(title, description, verification_type)
WHERE NOT EXISTS (
  SELECT 1 FROM public.tasks existing WHERE existing.verification_type = v.verification_type
);

-- Attempts are rate-limited per Telegram user and task. Only Edge Functions
-- using the service role may read or write this table.
CREATE TABLE IF NOT EXISTS public.partner_task_verification_attempts (
  telegram_id bigint NOT NULL,
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  last_attempt_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (telegram_id, task_id)
);
ALTER TABLE public.partner_task_verification_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.partner_task_verification_attempts FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.partner_task_verification_attempts TO service_role;

CREATE OR REPLACE FUNCTION public.partner_task_check_allowed(_telegram_id bigint, _task_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE v_allowed boolean;
BEGIN
  INSERT INTO public.partner_task_verification_attempts (telegram_id, task_id, last_attempt_at)
  VALUES (_telegram_id, _task_id, now())
  ON CONFLICT (telegram_id, task_id) DO UPDATE
    SET last_attempt_at = now()
    WHERE public.partner_task_verification_attempts.last_attempt_at < now() - interval '8 seconds'
  RETURNING true INTO v_allowed;
  RETURN COALESCE(v_allowed, false);
END;
$function$;
REVOKE ALL ON FUNCTION public.partner_task_check_allowed(bigint, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.partner_task_check_allowed(bigint, uuid) TO service_role;

-- Atomic, idempotent reward path used only after Gift Kombat returns success=true.
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

  IF v_inserted_id IS NOT NULL THEN
    UPDATE public.profiles SET
      siri_balance = siri_balance + CASE WHEN v_task.reward_type = 'siri' THEN v_task.reward_amount ELSE 0 END,
      ton_balance  = ton_balance  + CASE WHEN v_task.reward_type = 'ton'  THEN v_task.reward_amount ELSE 0 END,
      usdt_balance = usdt_balance + CASE WHEN v_task.reward_type = 'usdt' THEN v_task.reward_amount ELSE 0 END
    WHERE id = v_uid;
  END IF;

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
REVOKE ALL ON FUNCTION public.complete_partner_task_for_telegram(bigint, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_partner_task_for_telegram(bigint, uuid) TO service_role;

-- Preserve existing internal task checks while blocking direct public claims of
-- partner tasks. Their only reward path is the Edge Function above.
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
  IF v_new THEN
    UPDATE public.profiles SET
      siri_balance = siri_balance + CASE WHEN v_t.reward_type = 'siri' THEN v_t.reward_amount ELSE 0 END,
      ton_balance  = ton_balance  + CASE WHEN v_t.reward_type = 'ton'  THEN v_t.reward_amount ELSE 0 END,
      usdt_balance = usdt_balance + CASE WHEN v_t.reward_type = 'usdt' THEN v_t.reward_amount ELSE 0 END
    WHERE id = v_uid;
  END IF;
  SELECT * INTO v_p FROM public.profiles WHERE id = v_uid;
  RETURN jsonb_build_object('success', true, 'alreadyCompleted', NOT v_new,
    'rewardAmount', v_t.reward_amount, 'rewardType', v_t.reward_type,
    'balances', jsonb_build_object('siri', v_p.siri_balance, 'ton', v_p.ton_balance, 'usdt', v_p.usdt_balance));
END;
$function$;
