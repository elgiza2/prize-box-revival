-- Owner request: re-enable Win 100 battles, disable the shop purchase task.
UPDATE public.tasks
SET is_active = true
WHERE verification_type = 'gift_kombat_wins_100';

UPDATE public.tasks
SET is_active = false
WHERE verification_type = 'gift_kombat_shop_purchase';

-- Megsy monthly subscription task: server-verified only, 1 TON reward.
INSERT INTO public.tasks (
  title, description, reward_amount, reward_type, task_type, link,
  verification_type, is_active, is_pinned, image_url
)
SELECT
  'Megsy AI | Monthly subscription ($7)',
  'Subscribe to the Megsy AI monthly plan ($7). Open Megsy, activate the monthly subscription, then return here and tap Verify.',
  1.0, 'ton', 'social',
  'https://t.me/Noveaibot/App',
  'megsy_monthly_subscription', true, false, '/images/nova-icon.jpg'
WHERE NOT EXISTS (
  SELECT 1 FROM public.tasks WHERE verification_type = 'megsy_monthly_subscription'
);

-- Allow the atomic partner reward path for the Megsy subscription task too.
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
    AND verification_type IN ('gift_kombat_wins_100', 'gift_kombat_level_5', 'gift_kombat_shop_purchase', 'megsy_monthly_subscription')
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
