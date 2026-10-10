import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { callRpc } from "@/lib/game-api";

const ADSGRAM_BLOCK_ID = "43448";
const ADS_GOAL = 100;
type AdsgramController = { show: () => Promise<{ done?: boolean }> };
type AdsgramApi = { init: (options: { blockId: string }) => AdsgramController };
type Balances = { siri: number; ton: number; usdt: number };

/** Watch 100 ads and tap each one -> 10 Gram. An ad only counts if the user tapped it
 *  (detected when the ad opens its link and the app loses focus during playback). */
const AdClickRewardCard = () => {
  const { user, setUser } = useApp();
  const { toast } = useToast();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const tgId = user.telegramUser.id;

  const load = useCallback(async () => {
    try {
      const p = await callRpc<{ adsClicked: number }>("ad_click_get_progress", { _telegram_id: tgId });
      setCount(Math.min(p.adsClicked || 0, ADS_GOAL));
    } catch { /* keep card usable */ }
  }, [tgId]);

  useEffect(() => { void load(); }, [load]);

  const showAd = async () => {
    if (loading) return;
    const Adsgram = (window as unknown as { Adsgram?: AdsgramApi }).Adsgram;
    if (!Adsgram?.init) {
      toast({ title: "Ads unavailable", description: "Please open the app inside Telegram and try again.", variant: "destructive" });
      return;
    }
    setLoading(true);
    let tapped = false;
    const markTap = () => { tapped = true; };
    const onVisibility = () => { if (document.hidden) tapped = true; };
    window.addEventListener("blur", markTap);
    document.addEventListener("visibilitychange", onVisibility);
    try {
      const result = await Adsgram.init({ blockId: ADSGRAM_BLOCK_ID }).show();
      if (result?.done === false) return;
      if (!tapped) {
        toast({ title: "Ad not counted", description: "You must tap on the ad while it is playing for it to count.", variant: "destructive" });
        return;
      }
      const p = await callRpc<{ adsClicked: number }>("ad_click_increment", { _telegram_id: tgId });
      const next = Math.min(p.adsClicked || count + 1, ADS_GOAL);
      setCount(next);
      if (next >= ADS_GOAL) {
        const claim = await callRpc<{ success: boolean; adsClicked?: number; balances?: Balances }>("ad_click_claim", { _telegram_id: tgId });
        if (claim.success && claim.balances) {
          const b = claim.balances;
          setUser((prev) => ({ ...prev, siriBalance: b.siri, tonBalance: b.ton, usdtBalance: b.usdt }));
          setCount(Math.max(0, claim.adsClicked || 0));
          toast({ title: "Reward claimed!", description: "+10 Gram" });
        }
      } else {
        toast({ title: "Ad counted ✓", description: `${next} / ${ADS_GOAL}` });
      }
    } catch {
      toast({ title: "Ad not completed", description: "Watch the ad until the end and tap on it to count.", variant: "destructive" });
    } finally {
      window.removeEventListener("blur", markTap);
      document.removeEventListener("visibilitychange", onVisibility);
      setLoading(false);
    }
  };

  const percent = Math.round((count / ADS_GOAL) * 100);

  return (
    <div className="mb-6 rounded-2xl border border-primary/25 bg-primary/5 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">New task</p>
          <h2 className="mt-1 font-display text-lg text-foreground">Watch 100 ads → 10 Gram</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Important:</span> tap on each ad while it plays. Only ads you tap on will count.
          </p>
        </div>
        <button type="button" onClick={() => void showAd()} disabled={loading}
          className="btn-ink shrink-0 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-widest disabled:opacity-60">
          {loading ? "Loading…" : "Watch ad"}
        </button>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>{count} / {ADS_GOAL} tapped ads</span>
        <span>{percent}%</span>
      </div>
    </div>
  );
};

export default AdClickRewardCard;
