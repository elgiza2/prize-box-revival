import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const APP_URL = "https://t.me/Noveaibot/App";
const DEFAULT_WELCOME_IMAGE =
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663964615372/pUhqRwCqipPIcFIm.png";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const botToken =
    Deno.env.get("TELEGRAM_BOT_TOKEN_SS") ||
    Deno.env.get("TELEGRAM_BOT_TOKEN_HELLO") ||
    Deno.env.get("TELEGRAM_BOT_TOKEN");
  if (!supabaseUrl || !serviceRoleKey || !botToken) {
    console.error("Telegram start router is missing required project secrets");
    return new Response(JSON.stringify({ error: "server_not_configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const message = body?.message;
  const startText = typeof message?.text === "string" && message.text.startsWith("/start");
  if (!body?.update_id || !startText) {
    try {
      const forwarded = await fetch(`${supabaseUrl}/functions/v1/telegram-bot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify(body),
      });
      return new Response(await forwarded.text(), {
        status: forwarded.status,
        headers: {
          ...corsHeaders,
          "Content-Type": forwarded.headers.get("content-type") || "application/json",
        },
      });
    } catch (error) {
      console.error("Telegram update forwarding failed:", error);
      return new Response(JSON.stringify({ ok: false }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const chatId = message.chat?.id;
  const userId = message.from?.id;
  if (!chatId || !userId) {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const telegramApi = `https://api.telegram.org/bot${botToken}`;
  const startWork = (async () => {
    const lastName = message.from?.last_name || "";
    const username = message.from?.username || "";
    const args = message.text.split(" ");
    const referralCode = args.length > 1 ? args[1] : null;

    try {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("telegram_id", userId)
        .limit(1);
      if (!existing?.length) {
        const referral = `SIRI${userId}${Date.now().toString(36)}`.toUpperCase();
        const hex = Math.abs(Math.trunc(userId)).toString(16).padStart(32, "0").slice(-32);
        const scopedUserId = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
        let referredBy: string | null = null;
        if (referralCode) {
          const { data: referrer } = await supabase
            .from("profiles")
            .select("id")
            .eq("referral_code", referralCode)
            .limit(1);
          if (referrer?.length) referredBy = referrer[0].id;
        }
        const { error } = await supabase.from("profiles").insert({
          telegram_id: userId,
          first_name: message.from?.first_name || "Player",
          last_name: lastName,
          username,
          referral_code: referral,
          referred_by: referredBy,
          user_id: scopedUserId,
        });
        if (error && error.code !== "23505") console.error("Profile insert error:", error.message);
      }
    } catch (error) {
      console.error("Start registration failed:", error);
    }

    let imageUrl = DEFAULT_WELCOME_IMAGE;
    try {
      const { data } = await supabase
        .from("telegram_admins")
        .select("welcome_image_url")
        .not("welcome_image_url", "is", null)
        .neq("welcome_image_url", "")
        .limit(1);
      imageUrl = data?.[0]?.welcome_image_url || DEFAULT_WELCOME_IMAGE;
    } catch (error) {
      console.error("Welcome image lookup failed:", error);
    }

    const text =
      "<b>Welcome to Nova</b>\n\nMine $NOVA, TON, and USDT every eight hours. Upgrade your mining capacity. Invite friends. Earn more. Simple. Powerful. Rewarding. Start today.";
    const replyMarkup = {
      inline_keyboard: [
        [{ text: "Open Nova AI", url: APP_URL }],
        [{ text: "Join Community", url: "https://t.me/noveall" }],
      ],
    };
    const sendText = async () => {
      const response = await fetch(`${telegramApi}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", reply_markup: replyMarkup }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok) {
        throw new Error(result?.description || `sendMessage HTTP ${response.status}`);
      }
    };

    let photoSent = false;
    try {
      const response = await fetch(`${telegramApi}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          photo: imageUrl,
          caption: text,
          parse_mode: "HTML",
          reply_markup: replyMarkup,
        }),
      });
      const result = await response.json().catch(() => null);
      photoSent = response.ok && result?.ok === true;
      if (!photoSent) console.error("Telegram rejected welcome photo:", result?.description || response.status);
    } catch (error) {
      console.error("Telegram sendPhoto request failed:", error);
    }
    if (!photoSent) await sendText();
  })();

  // The Telegram webhook ACK must not wait for database or Telegram API calls.
  EdgeRuntime.waitUntil(startWork.catch((error) => console.error("Start welcome task failed:", error)));
  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
