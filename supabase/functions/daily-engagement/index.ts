import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const APP_URL = "https://t.me/Noveaibot/App";

// Rotating clean English messages about NFT, staking, mining, referrals, battles.
const MESSAGES: { title: string; message: string }[] = [
  {
    title: "NOVA | Stake and Grow",
    message:
      "Your NOVA works best when it works for you. Stake your balance and watch your rewards grow every day. Open the app and start staking now.",
  },
  {
    title: "NOVA | NFT Servers",
    message:
      "NFT servers multiply your mining power. Upgrade your setup, boost your hourly output, and earn more NOVA while you sleep.",
  },
  {
    title: "NOVA | Mining Reminder",
    message:
      "Your mining session may be ready to collect. Open NOVA, claim your rewards, and start a new session to keep earning.",
  },
  {
    title: "NOVA | Battle Monsters",
    message:
      "Monsters are waiting. Win battles, earn rewards, and climb the leaderboard. Every victory brings you closer to the top.",
  },
  {
    title: "NOVA | Invite and Earn",
    message:
      "Invite your friends to NOVA and earn a share of their activity forever. The bigger your team, the bigger your rewards.",
  },
  {
    title: "NOVA | Daily Tasks",
    message:
      "Fresh tasks are waiting for you. Complete them in minutes and collect free NOVA, TON, and USDT rewards.",
  },
  {
    title: "NOVA | Your Wallet",
    message:
      "Check your NOVA wallet today. Track your balances, review your earnings, and plan your next move in the ecosystem.",
  },
  {
    title: "NOVA | Community Growth",
    message:
      "Thousands of players are already earning with NOVA. Stay active, keep mining, and grow with the community every day.",
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Pick message by rotation: one per 6h slot (4 slots/day).
  const slot = Math.floor(Date.now() / (6 * 3600 * 1000)) % MESSAGES.length;
  const picked = MESSAGES[slot];

  // Queue one notification per active user, skipping anyone notified in last 5h
  // (avoids overlap if cron fires early or retries).
  const cutoff = new Date(Date.now() - 5 * 3600 * 1000).toISOString();
  const { data: queued, error } = await supabase.rpc("queue_engagement_notifications", {
    _title: picked.title,
    _message: picked.message,
    _cutoff: cutoff,
  });

  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Trigger the sender to start delivering the new batch.
  const senderUrl = `${supabaseUrl}/functions/v1/send-notifications`;
  fetch(senderUrl, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  }).catch(() => {});

  return new Response(
    JSON.stringify({ ok: true, queued: queued ?? 0, title: picked.title, appUrl: APP_URL }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
