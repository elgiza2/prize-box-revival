ALTER TABLE public.profiles ALTER COLUMN reward_balance SET DEFAULT 0;
ALTER TABLE public.profiles ALTER COLUMN reward_expires_at DROP DEFAULT;

-- New accounts receive the prize once, only at signup
CREATE OR REPLACE FUNCTION public.ensure_monthly_prize()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.reward_expires_at IS NULL THEN
    NEW.reward_balance := 7777;
    NEW.reward_expires_at := now() + interval '48 hours';
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_ensure_monthly_prize ON public.profiles;
CREATE TRIGGER trg_ensure_monthly_prize BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.ensure_monthly_prize();

-- One-time prize per user (existing users can claim once)
CREATE OR REPLACE FUNCTION public.grant_welcome_prize(_telegram_id bigint)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_profile public.profiles%ROWTYPE; v_exp timestamptz := now() + interval '48 hours';
BEGIN
  SELECT * INTO v_profile FROM public.profiles WHERE telegram_id = _telegram_id LIMIT 1;
  IF v_profile.id IS NULL THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'no_profile');
  END IF;
  IF v_profile.reward_expires_at IS NOT NULL AND v_profile.reward_expires_at > now()
     AND COALESCE(v_profile.reward_balance,0) > 0 THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'already_active', 'expires_at', v_profile.reward_expires_at);
  END IF;
  IF v_profile.reward_expires_at IS NOT NULL THEN
    RETURN jsonb_build_object('granted', false, 'reason', 'already_used');
  END IF;
  UPDATE public.profiles SET reward_balance = 7777, reward_expires_at = v_exp WHERE id = v_profile.id;
  RETURN jsonb_build_object('granted', true, 'amount', 7777, 'expires_at', v_exp);
END;
$function$;

CREATE OR REPLACE FUNCTION public.grant_prize_to_all()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_count integer := 0; v_exp timestamptz := now() + interval '48 hours';
BEGIN
  UPDATE public.profiles SET reward_balance = 7777, reward_expires_at = v_exp WHERE telegram_id IS NOT NULL;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN jsonb_build_object('granted', v_count, 'amount', 7777, 'expires_at', v_exp);
END;
$function$;

-- Reset everyone so all current users can claim the prize once
UPDATE public.profiles SET reward_balance = 0, reward_expires_at = NULL
WHERE reward_balance IS DISTINCT FROM 0 OR reward_expires_at IS NOT NULL;

REVOKE ALL ON FUNCTION public.grant_prize_to_all() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.ensure_monthly_prize() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.grant_welcome_prize(bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_welcome_prize(bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.grant_prize_to_all() TO service_role;