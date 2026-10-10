SELECT cron.unschedule('prize-broadcast-worker-every-minute') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'prize-broadcast-worker-every-minute');

SELECT cron.schedule(
  'prize-broadcast-worker-every-minute',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://ltgampdtawuefwwayncx.supabase.co/functions/v1/telegram-bot',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{"task": "prize_broadcast_send", "limit": 300}'::jsonb,
    timeout_milliseconds := 55000
  );
  $$
);