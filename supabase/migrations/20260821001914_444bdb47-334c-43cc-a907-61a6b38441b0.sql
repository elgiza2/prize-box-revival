CREATE OR REPLACE FUNCTION public.grant_prize_to_all()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer := 0;
  v_expires timestamptz := now() + interval '48 hours';
BEGIN
  UPDATE public.profiles
  SET reward_balance = 10000,
      reward_expires_at = v_expires
  WHERE telegram_id IS NOT NULL;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN jsonb_build_object('granted', v_count, 'amount', 10000, 'expires_at', v_expires);
END;
$function$;

CREATE OR REPLACE FUNCTION public.grant_welcome_prize(_telegram_id bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_profile public.profiles%ROWTYPE;
BEGIN
  SELECT * INTO v_profile FROM public.profiles WHERE telegram_id = _telegram_id LIMIT 1;
  IF v_profile.id IS NULL THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'no_profile');
  END IF;

  IF COALESCE(v_profile.reward_balance, 0) > 0
     AND v_profile.reward_expires_at IS NOT NULL
     AND v_profile.reward_expires_at > now() THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'already_active',
                              'expires_at', v_profile.reward_expires_at);
  END IF;

  IF v_profile.reward_expires_at IS NOT NULL THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'already_used');
  END IF;

  UPDATE public.profiles
  SET reward_balance = 10000,
      reward_expires_at = now() + interval '48 hours'
  WHERE id = v_profile.id;

  RETURN jsonb_build_object('granted', true, 'amount', 10000,
                            'expires_at', now() + interval '48 hours');
END;
$function$;

REVOKE ALL ON FUNCTION public.grant_prize_to_all() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_prize_to_all() TO service_role;