-- Add the music partner missions without duplicating existing rows.
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
  'Join Music App',
  'Open the Music app on Telegram',
  0.5,
  'ton',
  'social',
  'http://t.me/Mosuclbot/App',
  'none',
  true,
  false
WHERE NOT EXISTS (
  SELECT 1 FROM public.tasks WHERE link = 'http://t.me/Mosuclbot/App'
);

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
  'Join Music Community',
  'Join the Music community on Telegram',
  0.5,
  'ton',
  'social',
  'https://t.me/muscox',
  'none',
  true,
  false
WHERE NOT EXISTS (
  SELECT 1 FROM public.tasks WHERE link = 'https://t.me/muscox'
);
