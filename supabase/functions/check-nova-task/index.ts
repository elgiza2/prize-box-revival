const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Partner checks for Nova tasks. Response contract matches the partner style:
// {"success":true} or {"success":false} — no sensitive data is ever returned.
const CHECKS = ["profile-exists", "mining-1-claimed", "staking-5-ton", "nft-1-owned", "megsy-monthly", "megsy-registered", "nova-1000"] as const;
type Check = (typeof CHECKS)[number];

const MEGSY_CHECK_URL = "https://qdnqxjzjecaieuavagvq.supabase.co/functions/v1/check-megsy-subscription";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET" && req.method !== "POST") {
    return json({ success: false });
  }

  try {
    const url = new URL(req.url);
    let tgUserIdRaw = url.searchParams.get("tg_user_id");
    let checkRaw = url.searchParams.get("check");
    let keyRaw = url.searchParams.get("key");

    if (req.method === "POST") {
      const body = await req.json().catch(() => null);
      if (typeof body?.tg_user_id !== "undefined" && !tgUserIdRaw) tgUserIdRaw = String(body.tg_user_id);
      if (typeof body?.check === "string" && !checkRaw) checkRaw = body.check;
      if (typeof body?.key === "string" && !keyRaw) keyRaw = body.key;
    }

    const tgUserId = Number(tgUserIdRaw);
    if (!Number.isSafeInteger(tgUserId) || tgUserId <= 0) {
      return json({ success: false });
    }

    const check: Check = (CHECKS as readonly string[]).includes(checkRaw ?? "")
      ? (checkRaw as Check)
      : "profile-exists";

    const requiredKey = Deno.env.get("NOVA_PARTNER_API_KEY") || "";
    if (requiredKey && keyRaw !== requiredKey) {
      return json({ success: false });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("check-nova-task is missing server configuration");
      return json({ success: false });
    }

    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id,is_banned")
      .eq("telegram_id", tgUserId)
      .maybeSingle();
    if (profileError) {
      console.error("check-nova-task profile lookup failed", profileError.message);
      return json({ success: false });
    }
    if (!profile || profile.is_banned) return json({ success: false });

    if (check === "profile-exists") return json({ success: true });

    if (check === "mining-1-claimed") {
      const { count, error } = await admin
        .from("mining_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .eq("claimed", true);
      if (error) {
        console.error("check-nova-task mining lookup failed", error.message);
        return json({ success: false });
      }
      return json({ success: (count ?? 0) >= 1 });
    }

    if (check === "staking-5-ton") {
      // A "stake" in Nova is owning a server worth >= 5 TON (e.g. Spark Node 5 TON+).
      const { data: owned, error } = await admin
        .from("user_servers")
        .select("server_id, servers!inner(price_ton)")
        .eq("user_id", profile.id)
        .limit(20);
      if (error) {
        console.error("check-nova-task staking lookup failed", error.message);
        return json({ success: false });
      }
      const ok = (owned ?? []).some((row: { servers?: unknown }) => {
        const s = row.servers as { price_ton?: unknown } | { price_ton?: unknown }[] | null;
        const price = Array.isArray(s) ? Number(s[0]?.price_ton) : Number(s?.price_ton);
        return Number.isFinite(price) && price >= 5;
      });
      return json({ success: ok });
    }

    if (check === "nft-1-owned") {
      const { count, error } = await admin
        .from("user_nfts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .limit(1);
      if (error) {
        console.error("check-nova-task nft lookup failed", error.message);
        return json({ success: false });
      }
      return json({ success: (count ?? 0) >= 1 });
    }

    if (check === "nova-1000") {
      const { data: balance, error } = await admin
        .from("profiles")
        .select("siri_balance")
        .eq("id", profile.id)
        .maybeSingle();
      if (error) {
        console.error("check-nova-task balance lookup failed", error.message);
        return json({ success: false });
      }
      return json({ success: Number(balance?.siri_balance ?? 0) >= 1000 });
    }

    // check === "megsy-monthly": proxy to the Megsy subscription verifier.
    if (check === "megsy-registered") {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        let ok = false;
        try {
          const res = await fetch(`${MEGSY_CHECK_URL}?tg_user_id=${tgUserId}&mode=registered`, {
            headers: { Accept: "application/json" },
            signal: controller.signal,
          });
          const body = await res.json().catch(() => null);
          ok = res.ok && !!body && (body as { success?: unknown }).success === true;
        } finally {
          clearTimeout(timeout);
        }
        return json({ success: ok });
      } catch {
        return json({ success: false });
      }
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      let ok = false;
      try {
        const res = await fetch(`${MEGSY_CHECK_URL}?tg_user_id=${tgUserId}`, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        const body = await res.json().catch(() => null);
        ok = res.ok && !!body && (body as { success?: unknown }).success === true;
      } finally {
        clearTimeout(timeout);
      }
      return json({ success: ok });
    } catch {
      return json({ success: false });
    }
  } catch {
    return json({ success: false });
  }
});

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
