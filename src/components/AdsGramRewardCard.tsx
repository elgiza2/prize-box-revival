import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import {
  claimAdsGramRewardForTelegram,
  getAdWatchProgressForTelegram,
  incrementAdsGramWatchForTelegram,
} from "@/lib/game-api";

const ADSGRAM_BLOCK_ID = "43448";
const ADS_GOAL = 500;
type AdsgramController = { show: () => Promise<{ done?: boolean }> };
type AdsgramApi = { init: (options: { blockId: string }) => AdsgramController };

const AdsGramRewardCard = () => {
  const { user, setUser } = useApp();
  const { toast } = useToast();
  const [adsWatched, setAdsWatched] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadProgress = useCallback(async () => {
    try {
      const progress = await getAdWatchProgressForTelegram(user.telegramUser.id);
      setAdsWatched(Math.min(progress.adsWatchedB || 0, ADS_GOAL));
    } catch {
      // The card remains usable if progress loading is temporarily unavailable.
    }
  }, [user.telegramUser.id]);

  useEffect(() => {
    void loadProgress();
  }, [loadProgress]);

  const showAd = async () => {
    if (loading) return;
    const Adsgram = (window as unknown as { Adsgram?: AdsgramApi }).Adsgram;
    if (!Adsgram?.init) {
      toast({
        title: "Ads unavailable",
        description: "Please open the app inside Telegram and try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const controller = Adsgram.init({ blockId: ADSGRAM_BLOCK_ID });
      const result = await controller.show();
      if (result?.done === false) return;

      const progress = await incrementAdsGramWatchForTelegram(user.telegramUser.id);
      const nextCount = Math.min(progress.adsWatchedB || adsWatched + 1, ADS_GOAL);
      setAdsWatched(nextCount);

      if (nextCount >= ADS_GOAL) {
        const claim = await claimAdsGramRewardForTelegram(user.telegramUser.id);
        if (claim.success && claim.balances) {
          setUser((prev) => ({
            ...prev,
            siriBalance: claim.balances?.siri ?? prev.siriBalance,
            tonBalance: claim.balances?.ton ?? prev.tonBalance,
            usdtBalance: claim.balances?.usdt ?? prev.usdtBalance,
          }));
          setAdsWatched(Math.max(0, claim.adsWatched || 0));
          toast({ title: "Reward claimed!", description: "+5 Gram" });
        }
      }
    } catch {
      toast({
        title: "Ad not completed",
        description: "Watch the ad until the end to count it.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const percent = Math.round((adsWatched / ADS_GOAL) * 100);

  return (
    <div className="mb-6 rounded-2xl border border-primary/25 bg-primary/5 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            AdsGram reward
          </p>
          <h2 className="mt-1 font-display text-lg text-foreground">Watch 500 ads</h2>
          <p className="mt-1 text-xs text-muted-foreground">Complete the goal and claim 5 Gram.</p>
        </div>
        <button
          type="button"
          onClick={() => void showAd()}
          disabled={loading}
          className="btn-ink shrink-0 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-widest disabled:opacity-60"
        >
          {loading ? "Loading…" : "Watch ad"}
        </button>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>
          {adsWatched.toLocaleString()} / {ADS_GOAL.toLocaleString()} ads
        </span>
        <span>{percent}%</span>
      </div>
    </div>
  );
};

export default AdsGramRewardCard;
