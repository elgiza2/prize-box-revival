import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const TASKS: Record<string, { endpoint: string; params?: Record<string, string> }> = {
  gift_kombat_wins_100: {
    endpoint: "https://api.gift-kombat.com/api/characters/check-100-wins-exists",
  },
  gift_kombat_level_5: {
    endpoint: "https://api.gift-kombat.com/api/characters/check-exists",
  },
  gift_kombat_shop_purchase: {
    endpoint: "https://api.gift-kombat.com/api/characters/check-shop-purchases",
    // The user confirmed the partner API threshold and campaign start date.
    params: { amount: "4.25", after_date: "2026-10-13" },
  },
  megsy_monthly_subscription: {
    endpoint: "https://qdnqxjzjecaieuavagvq.supabase.co/functions/v1/check-megsy-subscription",
  },
};
const MAX_INIT_DATA_AGE_SECONDS = 24 * 60 * 60;
const encoder = new TextEncoder();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ success: false, error: "METHOD_NOT_ALLOWED" }, 405);

  try {
    const body = await req.json().catch(() => null);
    const initData = typeof body?.initData === "string" ? body.initData : "";
    const taskId = typeof body?.taskId === "string" ? body.taskId : "";
    if (!initData || initData.length > 10_000 || !/^[0-9a-f-]{36}$/i.test(taskId)) {
      return json({ success: false, error: "INVALID_REQUEST" }, 400);
    }

    const botToken =
      Deno.env.get("TELEGRAM_WEBAPP_BOT_TOKEN") ||
      Deno.env.get("TELEGRAM_BOT_TOKEN_SS") ||
      Deno.env.get("TELEGRAM_BOT_TOKEN_HELLO") ||
      Deno.env.get("TELEGRAM_BOT_TOKEN");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!botToken || !supabaseUrl || !serviceRoleKey) {
      console.error("Gift Kombat verifier is missing required server configuration");
      return json({ success: false, error: "VERIFIER_NOT_CONFIGURED" }, 503);
    }

    const telegramId = await validateTelegramInitData(initData, botToken);
    if (!telegramId) return json({ success: false, error: "INVALID_TELEGRAM_DATA" }, 401);

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: task, error: taskError } = await admin
      .from("tasks")
      .select("id,verification_type,is_active")
      .eq("id", taskId)
      .maybeSingle();
    if (taskError) {
      console.error("Gift Kombat verifier could not load task", taskError.message);
      return json({ success: false, error: "TASK_LOOKUP_FAILED" }, 500);
    }
    if (
      !task?.is_active ||
      !task.verification_type ||
      !Object.hasOwn(TASKS, task.verification_type)
    ) {
      return json({ success: false, error: "PARTNER_TASK_NOT_FOUND" }, 404);
    }

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("telegram_id")
      .eq("telegram_id", telegramId)
      .maybeSingle();
    if (profileError) {
      console.error("Gift Kombat verifier could not load profile", profileError.message);
      return json({ success: false, error: "PROFILE_LOOKUP_FAILED" }, 500);
    }
    if (!profile) return json({ success: false, error: "PROFILE_NOT_FOUND" }, 404);

    const { data: allowed, error: limitError } = await admin.rpc("partner_task_check_allowed", {
      _telegram_id: telegramId,
      _task_id: taskId,
    });
    if (limitError) {
      console.error("Gift Kombat verifier rate-limit check failed", limitError.message);
      return json({ success: false, error: "VERIFIER_NOT_CONFIGURED" }, 503);
    }
    if (allowed !== true) {
      return json({ success: false, error: "RATE_LIMITED", retry_after_seconds: 8 }, 429);
    }

    const config = TASKS[task.verification_type];
    const checkUrl = new URL(config.endpoint);
    for (const [key, value] of Object.entries(config.params ?? {}))
      checkUrl.searchParams.set(key, value);
    checkUrl.searchParams.set("tg_user_id", String(telegramId));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    let partnerStatus = 0;
    let partnerOk = false;
    let partnerResult: unknown;
    try {
      const partnerResponse = await fetch(checkUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      partnerStatus = partnerResponse.status;
      partnerOk = partnerResponse.ok;
      partnerResult = await partnerResponse.json().catch(() => null);
    } finally {
      clearTimeout(timeout);
    }
    if (
      !partnerOk ||
      !partnerResult ||
      typeof partnerResult !== "object" ||
      !("success" in partnerResult) ||
      typeof (partnerResult as { success?: unknown }).success !== "boolean"
    ) {
      console.error("Gift Kombat verification API returned an invalid response", partnerStatus);
      return json({ success: false, error: "PARTNER_UNAVAILABLE" }, 502);
    }
    if ((partnerResult as { success: boolean }).success !== true) {
      return json({ success: false, error: "TASK_NOT_COMPLETED", verified: false });
    }

    const { data: completion, error: completionError } = await admin.rpc(
      "complete_partner_task_for_telegram",
      {
        _telegram_id: telegramId,
        _task_id: taskId,
      },
    );
    if (completionError) {
      console.error("Gift Kombat task completion failed", completionError.message);
      return json({ success: false, error: "REWARD_FAILED" }, 500);
    }
    if (
      !completion ||
      typeof completion !== "object" ||
      (completion as { success?: boolean }).success !== true
    ) {
      return json({ success: false, error: "REWARD_FAILED" }, 500);
    }
    return json(completion);
  } catch (error) {
    console.error(
      "Gift Kombat task verifier failed",
      error instanceof Error ? error.name : "unknown error",
    );
    return json({ success: false, error: "VERIFICATION_FAILED" }, 502);
  }
});

async function validateTelegramInitData(
  initData: string,
  botToken: string,
): Promise<number | null> {
  const params = new URLSearchParams(initData);
  const receivedHash = params.get("hash");
  const authDate = Number(params.get("auth_date"));
  const userField = params.get("user");
  if (
    !receivedHash ||
    !/^[0-9a-f]{64}$/i.test(receivedHash) ||
    !Number.isFinite(authDate) ||
    !userField
  )
    return null;
  const now = Math.floor(Date.now() / 1000);
  if (authDate > now + 300 || now - authDate > MAX_INIT_DATA_AGE_SECONDS) return null;

  let user: unknown;
  try {
    user = JSON.parse(userField);
  } catch {
    return null;
  }
  const telegramId = Number((user as { id?: unknown } | null)?.id);
  if (!Number.isSafeInteger(telegramId) || telegramId <= 0) return null;

  const dataCheckString = [...params.entries()]
    .filter(([key]) => key !== "hash")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const webAppKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(botToken),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const secret = await crypto.subtle.sign("HMAC", webAppKey, encoder.encode("WebAppData"));
  const validationKey = await crypto.subtle.importKey(
    "raw",
    secret,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const expected = new Uint8Array(
    await crypto.subtle.sign("HMAC", validationKey, encoder.encode(dataCheckString)),
  );
  const expectedHex = [...expected].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  if (!constantTimeEqual(receivedHash.toLowerCase(), expectedHex)) return null;
  return telegramId;
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let i = 0; i < left.length; i += 1) difference |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return difference === 0;
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
