import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/hooks/use-toast";
import { supabase as typedSupabase } from "@/integrations/supabase/client";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = typedSupabase as any;
import { Button } from "@/components/ui/button";
import { completeTaskForTelegram, getReferralSummaryForTelegram, type ReferralSummary } from "@/lib/game-api";
import SpotlightHero from "@/components/hero/SpotlightHero";
import { swr } from "@/lib/cache";
import { artForTask } from "@/lib/task-art";
import AdsGramRewardCard from "@/components/AdsGramRewardCard";
import AdClickRewardCard from "@/components/AdClickRewardCard";

interface Task {
  id: string;
  title: string;
  reward_amount: number;
  reward_type: string;
  task_type: string;
  link: string | null;
  verification_type: string;
  is_pinned: boolean;
  image_url: string | null;
}

interface TaskCompletionResult {
  success?: boolean;
  error?: string;
  current?: number;
  alreadyCompleted?: boolean;
  rewardAmount?: number;
  rewardType?: string;
  balances?: { siri: number; ton: number; usdt: number };
}

const REWARD_LABEL: Record<string, string> = {
  ton: "Gram",
  usdt: "USDT",
  siri: "$NOVA",
};

const displayTaskTitle = (task: Task) => {
  const title = task.title.toLowerCase();
  if (title.includes("twitter") || title.includes("x.com") || title.includes("follow x") || title.includes("post on x")) {
    return "Post on X";
  }
  if (title.includes("story") && title.includes("telegram")) return "Share Telegram Story";
  return task.title;
};

const TasksPage = () => {
  const { user, setUser } = useApp();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [partnerTaskOpened, setPartnerTaskOpened] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = JSON.parse(window.sessionStorage.getItem("gift-kombat-opened-tasks") || "[]");
      return Array.isArray(saved) ? saved.filter((id: unknown) => typeof id === "string") : [];
    } catch { return []; }
  });
  const [referralSummary, setReferralSummary] = useState<ReferralSummary>({ count: 0, ton_earned: 0, users: [], rewards: [] });

  const referralLink = `https://t.me/Noveaibot/App?startapp=${user.referralCode}`;

  useEffect(() => {
    void Promise.all([loadTasks(), loadCompletedTasks(), loadReferralSummary()]);
  }, [user.profileId]);

  const loadTasks = async () => {
    await swr<Task[]>(
      "tasks",
      async () => {
        const { data } = await supabase
          .from("tasks")
          .select("id, title, description, reward_amount, reward_type, task_type, link, verification_type, is_pinned, image_url")
          .eq("is_active", true)
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: true });
        return (data || []) as Task[];
      },
      (rows) => {
        setTasks(rows);
        setLoading(false);
      },
      5 * 60 * 1000,
    );
    setLoading(false);
  };

  const loadCompletedTasks = async () => {
    if (!user.profileId) return;
    const { data } = await supabase.from("user_tasks").select("task_id").eq("user_id", user.profileId);
    if (data) setCompletedTaskIds(data.map((t: any) => t.task_id));
  };

  const loadReferralSummary = async () => {
    const summary = await getReferralSummaryForTelegram(user.telegramUser.id);
    setReferralSummary(summary);
  };

  const handleTask = async (task: Task) => {
    if (completedTaskIds.includes(task.id) || claiming) return;
    const isGiftKombatTask = task.verification_type.startsWith("gift_kombat_");
    const isFirstGiftKombatOpen = isGiftKombatTask && !partnerTaskOpened.includes(task.id);

    // Open the task link immediately so popup blockers don't fire
    if (task.link && (!isGiftKombatTask || isFirstGiftKombatOpen)) {
      try {
        const tg = (window as any).Telegram?.WebApp;
        const isTelegramLink = /^(https?:\/\/)?(t\.me|telegram\.me|telegram\.dog)\//i.test(task.link);
        const isStoryTask = /story/i.test(`${task.title} ${task.task_type}`);
        if (isStoryTask && tg?.shareToStory) {
          const mediaUrl = `${window.location.origin}/images/nova-icon.jpg`;
          tg.shareToStory(mediaUrl, {
            text: "StarMine — explore TON staking and earn with a smarter crypto community.",
          });
        } else if (tg?.openTelegramLink && isTelegramLink) {
          tg.openTelegramLink(task.link);
        } else if (tg?.openLink) {
          tg.openLink(task.link, { try_instant_view: false });
        } else {
          window.open(task.link, "_blank", "noopener,noreferrer");
        }
      } catch {
        window.open(task.link, "_blank", "noopener,noreferrer");
      }
    }

    if (isFirstGiftKombatOpen) {
      setPartnerTaskOpened((prev) => {
        const next = prev.includes(task.id) ? prev : [...prev, task.id];
        try { window.sessionStorage.setItem("gift-kombat-opened-tasks", JSON.stringify(next)); } catch { /* ignore */ }
        return next;
      });
      toast({ title: "Gift Kombat opened", description: "Complete the mission, return here, and tap Verify." });
      return;
    }

    setClaiming(task.id);

    try {
      let result: TaskCompletionResult | null;
      if (isGiftKombatTask) {
        const telegramWebApp = (window as Window & { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp;
        const initData = telegramWebApp?.initData;
        if (!initData) {
          toast({ title: "Open in Telegram", description: "Verification requires a valid Telegram session.", variant: "destructive" });
          return;
        }
        const { data, error } = await supabase.functions.invoke("verify-gift-kombat-task", {
          body: { initData, taskId: task.id },
        });
        if (error) throw error;
        result = data as TaskCompletionResult | null;
      } else {
        result = await completeTaskForTelegram(user.telegramUser.id, task.id);
      }
      if (result?.error) {
        const errorMsg = result.error;
        if (errorMsg === "TASK_NOT_COMPLETED") {
          toast({ title: "Not verified yet", description: "Finish the Gift Kombat mission, then try again.", variant: "destructive" });
        } else if (errorMsg === "RATE_LIMITED") {
          toast({ title: "Please wait", description: "Wait a few seconds before checking again.", variant: "destructive" });
        } else if (errorMsg === 'NEED_3_REFERRALS') {
          toast({ title: "Not yet!", description: `You need 3 referrals (current: ${result.current ?? 0})`, variant: "destructive" });
        } else if (errorMsg === 'NEED_3_MINING_SESSIONS') {
          toast({ title: "Not yet!", description: `Complete 3 mining sessions (current: ${result.current ?? 0})`, variant: "destructive" });
        } else if (errorMsg === 'NEED_SERVER_PURCHASE') {
          toast({ title: "Not yet!", description: "Buy a server first!", variant: "destructive" });
        } else if (errorMsg === 'NEED_MONSTER_KILL') {
          toast({ title: "Not yet!", description: "Kill a monster first!", variant: "destructive" });
        } else {
          toast({ title: "Task failed", variant: "destructive" });
        }
        return;
      }
      if (!result?.success) {
        toast({ title: "Task failed", description: "We could not verify this task right now.", variant: "destructive" });
        return;
      }
      const balances = result.balances;
      if (balances) setUser((prev) => ({
        ...prev,
        siriBalance: balances.siri,
        tonBalance: balances.ton,
        usdtBalance: balances.usdt,
      }));
      setCompletedTaskIds((prev) => prev.includes(task.id) ? prev : [...prev, task.id]);
      if (result.alreadyCompleted) {
        toast({ title: "Task already completed", description: "Your balances have been refreshed." });
        return;
      }
      toast({ title: "Task Completed!", description: `+${result.rewardAmount ?? 0} ${(result.rewardType ?? "").toUpperCase()}` });
    } catch {
      toast({ title: "Task failed", variant: "destructive" });
    } finally {
      setClaiming(null);
    }
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({ title: "Copied!", description: "Referral link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferral = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("Join Nova AI and earn Gram & USDT!")}`);
    } else {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent("Join Nova AI and earn Gram & USDT!")}`, "_blank");
    }
  };

  const availableTasks = tasks.filter((t) => !completedTaskIds.includes(t.id));

  return (
    <div className="min-h-screen pb-28">
      <SpotlightHero title="Tasks">
      <div id="tasks" className="px-5 pt-6">

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="mb-6 h-11 w-full rounded-full border border-border bg-muted/70 p-1">
          <TabsTrigger value="tasks" className="flex-1 rounded-full text-xs font-semibold tracking-wide data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">Tasks</TabsTrigger>
          <TabsTrigger value="referral" className="flex-1 rounded-full text-xs font-semibold tracking-wide data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">Invite</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <AdClickRewardCard />
          <AdsGramRewardCard />
          {loading ? (
            <div className="text-center text-muted-foreground py-8 animate-pulse">Loading tasks...</div>
          ) : availableTasks.length === 0 ? (
            <motion.div className="text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-lg font-display text-foreground mb-1">All Done!</p>
              <p className="text-sm text-muted-foreground">Check back later for new tasks</p>
            </motion.div>
          ) : (
            <div className="pt-2">
              <div className="mb-3 flex items-end justify-between px-1">
                <h2 className="paper-eyebrow">Missions</h2>
                <span className="text-[11px] text-muted-foreground">{availableTasks.length} available</span>
              </div>
              <div className="space-y-3">
              <AnimatePresence>
                {availableTasks.map((task, i) => {
                  const label = REWARD_LABEL[task.reward_type] || "$NOVA";
                  const busy = claiming === task.id;
                  const verifyPartnerTask = task.verification_type.startsWith("gift_kombat_") && partnerTaskOpened.includes(task.id);

                  return (
                    <motion.button
                      type="button"
                      key={task.id}
                      layout
                      disabled={busy}
                      className="group flex w-full items-center gap-4 rounded-3xl border border-border bg-card/60 p-3 text-left backdrop-blur-md transition-colors hover:bg-card/90 active:scale-[0.99] disabled:opacity-70"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1], delay: Math.min(i, 8) * 0.035 }}
                      onClick={() => void handleTask(task)}
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted">
                        <img
                          src={task.image_url || artForTask(task.title)}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          width={128}
                          height={128}
                          className="h-full w-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = artForTask(task.title); }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-foreground">{displayTaskTitle(task)}</p>
                        <span className="mt-1.5 inline-flex items-center rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                          +{task.reward_amount} {label}
                        </span>
                      </div>

                      <span className="flex h-9 min-w-[56px] shrink-0 items-center justify-center rounded-full bg-action px-4 text-[11px] font-bold uppercase tracking-widest text-action-foreground">
                        {busy ? "…" : verifyPartnerTask ? "Verify" : "Go"}
                      </span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
              </div>
            </div>
          )}
        </TabsContent>


        <TabsContent value="referral">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <motion.div className="glass rounded-2xl p-4 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <p className="text-3xl font-display font-bold text-primary">{referralSummary.count}</p>
                <p className="text-xs text-muted-foreground mt-1">Invited Users</p>
              </motion.div>
              <motion.div className="glass rounded-2xl p-4 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <p className="text-3xl font-display font-bold text-ton-blue">{Number(referralSummary.ton_earned || 0).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">Gram Earned</p>
              </motion.div>
            </div>

            <motion.div className="glass rounded-2xl p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h3 className="text-sm font-display font-bold text-foreground mb-2">Your Referral Link</h3>
              <div className="glass rounded-xl p-3 mb-3 break-all text-xs text-muted-foreground font-mono">{referralLink}</div>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={copyReferral} variant="outline" className="rounded-xl font-display text-xs h-10 gap-2">
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
                <Button onClick={shareReferral} className="rounded-xl font-display text-xs h-10 gap-2 glow-primary">
                  Share
                </Button>
              </div>
            </motion.div>

            <motion.div className="glass rounded-2xl p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h3 className="text-sm font-display font-bold text-foreground mb-3">How It Works</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <p className="text-xs text-muted-foreground">Share your referral link with friends</p>
                </div>
                <div className="flex items-start gap-3">
                  <p className="text-xs text-muted-foreground">They join Nova AI and start playing</p>
                </div>
                <div className="flex items-start gap-3">
                  <p className="text-xs text-muted-foreground">Earn <span className="text-ton-blue font-bold">50%</span> of every Gram purchase they make!</p>
                </div>
              </div>
            </motion.div>

            <motion.div className="glass rounded-2xl p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <h3 className="text-sm font-display font-bold text-foreground mb-3">Invited Users</h3>
              {referralSummary.users.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">No referrals yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Share your link to start earning!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {referralSummary.users.map((member) => (
                    <div key={member.id} className="flex items-center justify-between gap-3 py-2 border-b border-border/30 last:border-0">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{member.first_name}</p>
                          <p className="text-xs text-muted-foreground">{member.username ? `@${member.username}` : "Player"}</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-primary font-display">Active</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </SpotlightHero>
    </div>
  );
};

export default TasksPage;
