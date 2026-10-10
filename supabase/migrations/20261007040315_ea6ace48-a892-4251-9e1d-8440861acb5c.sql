ALTER TABLE public.ad_watch_progress
  ADD COLUMN IF NOT EXISTS ads_clicked_c integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_claims_c integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.ad_click_get_progress(_telegram_id bigint)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid; v_c integer; v_t integer;
BEGIN
  v_uid := public.game_profile_id(_telegram_id);
  IF v_uid IS NULL THEN RETURN jsonb_build_object('success', false, 'adsClicked', 0); END IF;
  SELECT ads_clicked_c, total_claims_c INTO v_c, v_t FROM public.ad_watch_progress WHERE user_id = v_uid;
  RETURN jsonb_build_object('success', true, 'adsClicked', COALESCE(v_c, 0), 'totalClaims', COALESCE(v_t, 0));
END; $$;

CREATE OR REPLACE FUNCTION public.ad_click_increment(_telegram_id bigint)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid; v_c integer;
BEGIN
  v_uid := public.game_profile_id(_telegram_id);
  IF v_uid IS NULL THEN RETURN jsonb_build_object('success', false, 'adsClicked', 0); END IF;
  INSERT INTO public.ad_watch_progress (user_id, ads_clicked_c) VALUES (v_uid, 1)
  ON CONFLICT (user_id) DO UPDATE
    SET ads_clicked_c = LEAST(public.ad_watch_progress.ads_clicked_c + 1, 100), updated_at = now()
  RETURNING ads_clicked_c INTO v_c;
  RETURN jsonb_build_object('success', true, 'adsClicked', COALESCE(v_c, 0));
END; $$;

CREATE OR REPLACE FUNCTION public.ad_click_claim(_telegram_id bigint)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid; v_c integer; v_p public.profiles%ROWTYPE;
BEGIN
  v_uid := public.game_profile_id(_telegram_id);
  IF v_uid IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'NO_PROFILE'); END IF;
  UPDATE public.ad_watch_progress
     SET ads_clicked_c = ads_clicked_c - 100, total_claims_c = total_claims_c + 1, updated_at = now()
   WHERE user_id = v_uid AND ads_clicked_c >= 100
  RETURNING ads_clicked_c INTO v_c;
  IF NOT FOUND THEN RETURN jsonb_build_object('success', false, 'error', 'NOT_ENOUGH_ADS'); END IF;
  UPDATE public.profiles SET ton_balance = ton_balance + 10 WHERE id = v_uid;
  SELECT * INTO v_p FROM public.profiles WHERE id = v_uid;
  RETURN jsonb_build_object('success', true, 'rewardAmount', 10, 'adsClicked', v_c,
    'balances', jsonb_build_object('siri', v_p.siri_balance, 'ton', v_p.ton_balance, 'usdt', v_p.usdt_balance));
END; $$;

GRANT EXECUTE ON FUNCTION public.ad_click_get_progress(bigint) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.ad_click_increment(bigint) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.ad_click_claim(bigint) TO anon, authenticated, service_role;