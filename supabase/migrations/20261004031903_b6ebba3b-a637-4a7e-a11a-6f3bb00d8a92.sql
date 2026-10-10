-- Remove the $7,777 welcome prize entirely
ALTER TABLE public.profiles ALTER COLUMN reward_balance SET DEFAULT 0;

-- Stop the trigger from forcing a 10,000 prize on every write
CREATE OR REPLACE FUNCTION public.ensure_monthly_prize()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN NEW;
END;
$function$;

-- Disable all prize granting functions
CREATE OR REPLACE FUNCTION public.grant_welcome_prize(_telegram_id bigint)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$ SELECT jsonb_build_object('granted', false, 'reason', 'disabled') $function$;

CREATE OR REPLACE FUNCTION public.grant_prize_to_all()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$ SELECT jsonb_build_object('granted', 0, 'amount', 0) $function$;

-- Wipe the prize balance from every account
UPDATE public.profiles
SET reward_balance = 0, reward_expires_at = NULL
WHERE reward_balance IS DISTINCT FROM 0 OR reward_expires_at IS NOT NULL;
