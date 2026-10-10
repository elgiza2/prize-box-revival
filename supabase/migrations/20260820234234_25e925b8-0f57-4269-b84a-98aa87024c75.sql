REVOKE ALL ON FUNCTION public.grant_prize_to_all() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.all_prize_broadcast_targets(integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_prize_to_all() TO service_role;
GRANT EXECUTE ON FUNCTION public.all_prize_broadcast_targets(integer, integer) TO service_role;