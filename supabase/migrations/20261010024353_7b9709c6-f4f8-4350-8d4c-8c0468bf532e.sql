CREATE TABLE public.winner_broadcast (
  id int PRIMARY KEY DEFAULT 1,
  winner_profile_id uuid,
  winner_username text,
  image_url text NOT NULL,
  status text NOT NULL DEFAULT 'running',
  sent int NOT NULL DEFAULT 0,
  failed int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.winner_broadcast TO service_role;
ALTER TABLE public.winner_broadcast ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.winner_broadcast_log (
  profile_id uuid PRIMARY KEY,
  delivered boolean NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.winner_broadcast_log TO service_role;
ALTER TABLE public.winner_broadcast_log ENABLE ROW LEVEL SECURITY;

INSERT INTO public.winner_broadcast (winner_profile_id, winner_username, image_url)
SELECT id, username, 'https://iqosbhbbyzqozfgpthyj.supabase.co/storage/v1/object/public/ads-tasks/nova/winner-100k.jpg'
FROM public.profiles
WHERE username IS NOT NULL AND username <> '' AND NOT COALESCE(is_banned, false)
ORDER BY random() LIMIT 1;