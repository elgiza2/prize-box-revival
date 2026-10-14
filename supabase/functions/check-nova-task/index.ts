const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const CHECKS = ["profile-exists", "mining-1-claimed"] as const;
type Check = (typeof CHECKS)[number];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET" && req.method !== "POST") {
    return json({ success: false, error: "METHOD_NOT_ALLOWED" }, 405);
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
      // Keep the exact partner-style contract: only success matters.
      return json({ success: false });
    }

    const check: Check = checkRaw === "mining-1-claimed" ? "mining-1-claimed" : "profile-exists";

    // Optional shared secret. If the project owner sets NOVA_PARTNER_API_KEY,
    // the partner must pass ?key=<same value>. While it is unset the endpoint
    // stays open (same style as the partner's own verification API).
    const requiredKey = Deno.env.get("NOVA_PARTNER_API_KEY") || "";
    if (requiredKey && keyRaw !== requiredKey) {
      return json({ success: false, error: "UNAUTHORIZED" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("check-nova-task is missing server configuration");
      return json({ success: false, error: "NOT_CONFIGURED" }, 503);
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
      return json({ success: false, error: "LOOKUP_FAILED" }, 500);
    }
    if (!profile || profile.is_banned) return json({ success: false });

    if (check === "profile-exists") return json({ success: true });

    const { count, error: miningError } = await admin
      .from("mining_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("claimed", true);
    if (miningError) {
      console.error("check-nova-task mining lookup failed", miningError.message);
      return json({ success: false, error: "LOOKUP_FAILED" }, 500);
    }
    return json({ success: (count ?? 0) >= 1 });
  } catch (error) {
    console.error("check-nova-task failed", error instanceof Error ? error.name : "unknown");
    return json({ success: false, error: "FAILED" }, 500);
  }
});

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
