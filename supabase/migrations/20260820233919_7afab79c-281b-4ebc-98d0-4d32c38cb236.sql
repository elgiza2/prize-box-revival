CREATE OR REPLACE FUNCTION public.grant_prize_to_all()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count integer := 0;
  v_expires timestamptz := now() + interval '24 hours';
BEGIN
  UPDATE public.profiles
  SET reward_balance = 10000,
      reward_expires_at = v_expires
  WHERE telegram_id IS NOT NULL;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN jsonb_build_object('granted', v_count, 'amount', 10000, 'expires_at', v_expires);
END;
$$;

GRANT EXECUTE ON FUNCTION public.grant_prize_to_all() TO service_role;

CREATE OR REPLACE FUNCTION public.all_prize_broadcast_targets(_limit integer, _offset integer DEFAULT 0)
RETURNS TABLE(id uuid, telegram_id bigint, first_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.id, p.telegram_id, p.first_name
  FROM public.profiles p
  WHERE p.telegram_id IS NOT NULL
    AND COALESCE(p.is_banned, false) = false
  ORDER BY p.created_at
  LIMIT greatest(1, least(_limit, 5000))
  OFFSET greatest(0, _offset);
$$;

GRANT EXECUTE ON FUNCTION public.all_prize_broadcast_targets(integer, integer) TO service_role;

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.unschedule('prize-10k-broadcast-every-4h') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'prize-10k-broadcast-every-4h');

SELECT cron.schedule(
  'prize-10k-broadcast-every-4h',
  '10 */4 * * *',
  $$
  SELECT net.http_post(
    url := 'https://ltgampdtawuefwwayncx.supabase.co/functions/v1/telegram-bot',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{"task": "prize_broadcast_all", "source": "cron"}'::jsonb
  );
  $$
);