REVOKE ALL ON FUNCTION public.grant_prize_to_all() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.ensure_monthly_prize() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.grant_welcome_prize(bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_welcome_prize(bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.grant_prize_to_all() TO service_role;