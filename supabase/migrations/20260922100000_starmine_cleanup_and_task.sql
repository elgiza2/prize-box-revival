-- StarMine launch: remove the legacy cash prize and seed the new partner mission.
-- This migration is intentionally explicit so the cleanup is auditable and repeatable.
UPDATE public.profiles
SET reward_balance = 0,
    reward_expires_at = NULL
WHERE COALESCE(reward_balance, 0) <> 0
   OR reward_expires_at IS NOT NULL;

-- Keep the legacy grant RPC unavailable to client roles after the prize is removed.
REVOKE ALL ON FUNCTION public.grant_welcome_prize(bigint) FROM PUBLIC, anon, authenticated;

INSERT INTO public.tasks (
  title,
  description,
  reward_amount,
  reward_type,
  task_type,
  link,
  verification_type,
  is_active,
  is_pinned
)
SELECT
  'StarMine',
  'Discover StarMine on Telegram',
  0.5,
  'ton',
  'social',
  'https://t.me/StarMinesr_bot?start=r6657246146',
  'none',
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.tasks
  WHERE title = 'StarMine'
     OR link = 'https://t.me/StarMinesr_bot?start=r6657246146'
);
