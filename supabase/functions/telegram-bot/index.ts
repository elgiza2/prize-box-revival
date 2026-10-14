import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildNotification, totalVariants, type NotificationTopic } from "../_shared/notification-texts.ts";

const APP_URL = "https://t.me/Noveaibot/App";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN_SS') || Deno.env.get('TELEGRAM_BOT_TOKEN_HELLO') || Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!TELEGRAM_BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN_SS not configured');

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

    const body = await req.json();

    // Scheduled broadcast (every 4 hours) — hosted here so it shares this
    // function's deployment. Telegram updates never contain a `task` field.
    if (body?.task === 'auto_notify') {
      const result: any = await runAutoNotifications(supabase, BASE_URL);
      // The 03:00 UTC run also publishes the daily channel post (once per day).
      if (new Date().getUTCHours() === 3) {
        try { result.channel_post = await runChannelPost(supabase, BASE_URL); } catch (e) { result.channel_post = { ok: false, error: String(e) }; }
      }
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // AI-personalised purchase offer, hosted here for the same reason.
    if (body?.task === 'smart_offer') {
      const result = await buildSmartOffer(
        supabase,
        Number(body?.telegram_id),
        String(body?.surface ?? 'general'),
      );
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ---- Welcome prize ($10,000, 48h) admin tasks ----
    const requireAdmin = async (tgId: number) => {
      const { data } = await supabase.rpc('is_telegram_admin', { _telegram_id: tgId });
      return data === true;
    };

    // Admin-triggered immediate channel post.
    if (body?.task === 'channel_post') {
      if (!(await requireAdmin(Number(body?.admin_telegram_id)))) {
        return new Response(JSON.stringify({ error: 'forbidden' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (body?.delete_message_id) {
        const d = await fetch(`${BASE_URL}/deleteMessage`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: CHANNEL_ID, message_id: Number(body.delete_message_id) }),
        });
        await supabase.from('daily_posts').delete().eq('telegram_message_id', Number(body.delete_message_id));
        return new Response(JSON.stringify(await d.json()), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const result = await runChannelPost(supabase, BASE_URL, body?.force === true);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Stores a base64 image in the public bucket so Telegram can serve it.
    if (body?.task === 'store_image') {
      if (!(await requireAdmin(Number(body?.admin_telegram_id)))) {
        return new Response(JSON.stringify({ error: 'forbidden' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const bytes = Uint8Array.from(atob(String(body?.data_base64 ?? '')), (c) => c.charCodeAt(0));
      const path = String(body?.name ?? `nova/${Date.now()}.jpg`);
      const { error: upErr } = await supabase.storage
        .from('ads-tasks')
        .upload(path, bytes, { contentType: 'image/jpeg', upsert: true });
      if (upErr) {
        return new Response(JSON.stringify({ error: upErr.message, host: new URL(Deno.env.get('SUPABASE_URL')!).host }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const { data: pub } = supabase.storage.from('ads-tasks').getPublicUrl(path);
      return new Response(JSON.stringify({ ok: true, url: pub.publicUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }







    // 100K milestone winner broadcast: runs in the background in batches and
    // re-invokes itself until every user has been messaged once.
    if (body?.task === 'winner_broadcast') {
      const adminId = Number(body?.admin_telegram_id);
      if (!(await requireAdmin(adminId))) {
        return new Response(JSON.stringify({ error: 'forbidden' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const run = async () => {
        const { data: cfg } = await supabase.from('winner_broadcast').select('*').eq('id', 1).maybeSingle();
        if (!cfg || cfg.status !== 'running') return;
        const doneSet = new Set<string>();
        for (let from = 0; ; from += 1000) {
          const { data: d } = await supabase.from('winner_broadcast_log').select('profile_id').range(from, from + 999);
          if (!d || d.length === 0) break;
          d.forEach((r: any) => doneSet.add(r.profile_id));
          if (d.length < 1000) break;
        }
        const targets: any[] = [];
        for (let from = 0; targets.length < 400; from += 1000) {
          const { data: page } = await supabase.from('profiles').select('id, telegram_id, is_banned')
            .order('created_at').range(from, from + 999);
          if (!page || page.length === 0) break;
          for (const p of page) if (!p.is_banned && !doneSet.has(p.id) && targets.length < 400) targets.push(p);
          if (page.length < 1000) break;
        }
        if (targets.length === 0) {
          await supabase.from('winner_broadcast').update({ status: 'done', updated_at: new Date().toISOString() }).eq('id', 1);
          return;
        }
        const caption =
          `<b>Welcome to Nova</b>\n\n` +
          `Nova has now reached <b>300,000 users</b> — thank you for being part of our community.\n\n` +
          `To celebrate, we are giving a <b>$9,999 reward</b> to one lucky user.\n\n` +
          `Open Nova now and check the prize box — the winner might be you.`;
        let sent = 0, failed = 0;
        for (const t of targets) {
          let ok = false;
          try {
            const r = await fetch(`${BASE_URL}/sendPhoto`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: t.telegram_id, photo: cfg.image_url, caption, parse_mode: 'HTML',
                reply_markup: { inline_keyboard: [[{ text: 'Open Nova', url: APP_URL }]] },
              }),
            });
            const j = await r.json();
            if (j?.error_code === 429) {
              await new Promise((res) => setTimeout(res, ((j?.parameters?.retry_after ?? 3) + 1) * 1000));
              continue;
            }
            ok = !!j?.ok;
          } catch { ok = false; }
          if (ok) sent++; else failed++;
          await supabase.from('winner_broadcast_log').upsert({ profile_id: t.id, delivered: ok });
          await new Promise((res) => setTimeout(res, 40));
        }
        await supabase.from('winner_broadcast').update({
          sent: (cfg.sent ?? 0) + sent, failed: (cfg.failed ?? 0) + failed, updated_at: new Date().toISOString(),
        }).eq('id', 1);
        await fetch(`${SUPABASE_URL}/functions/v1/telegram-bot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
          body: JSON.stringify({ task: 'winner_broadcast', admin_telegram_id: adminId }),
        }).catch(() => {});
      };
      // @ts-ignore EdgeRuntime is provided by Supabase
      EdgeRuntime.waitUntil(run());
      return new Response(JSON.stringify({ ok: true, started: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tg = async (method: string, payload: Record<string, unknown>) => {
      const r = await fetch(`${BASE_URL}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await r.json();
    };

    const isAdminUser = async (tgId: number) => {
      try {
        const { data } = await supabase.rpc('is_telegram_admin', { _telegram_id: tgId });
        return data === true;
      } catch {
        return false;
      }
    };

    const adminStats = async () => {
      const [users, tasks, tx] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('type', 'withdrawal').eq('status', 'pending'),
      ]);
      const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      const { count: newUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', since);
      return {
        users: users.count ?? 0,
        newUsers: newUsers ?? 0,
        tasks: tasks.count ?? 0,
        pendingWithdrawals: tx.count ?? 0,
      };
    };

    // ---- Admin draft state (button-driven task builder) ----
    const getDraft = async (tgId: number) => {
      const { data } = await supabase
        .from('telegram_task_drafts')
        .select('draft')
        .eq('telegram_id', tgId)
        .limit(1);
      return (data?.[0]?.draft ?? null) as any;
    };
    const setDraft = async (tgId: number, value: any) => {
      const { error } = await supabase
        .from('telegram_task_drafts')
        .upsert({ telegram_id: tgId, draft: value }, { onConflict: 'telegram_id' });
      if (error) console.error('setDraft failed:', error.message);
    };
    const clearDraft = async (tgId: number) => {
      await supabase.from('telegram_task_drafts').delete().eq('telegram_id', tgId);
    };


    const adminPanelText = async () => {
      const s = await adminStats();
      return (
        `<b>Nova Admin Panel</b>\n\n` +
        `Total users: ${s.users}\n` +
        `New users (24h): ${s.newUsers}\n` +
        `Active Nova tasks: ${s.tasks}\n` +
        `Pending withdrawals: ${s.pendingWithdrawals}\n\n` +
        `Use the buttons below to manage Nova tasks.`
      );
    };

    const adminKeyboard = {
      inline_keyboard: [
        [{ text: 'Add Nova task', callback_data: 'adm_add' }],
        [{ text: 'Nova tasks', callback_data: 'adm_tasks' }],
        [{ text: 'Delete all tasks', callback_data: 'adm_delall' }],
        [{ text: 'Refresh stats', callback_data: 'adm_stats' }],
      ],
    };

    const listTasks = async () => {
      const { data } = await supabase
        .from('tasks')
        .select('id, title, reward_amount, reward_type, is_active')
        .order('created_at', { ascending: true });
      const rows = data ?? [];
      if (rows.length === 0) {
        return {
          text: '<b>Nova Tasks</b>\n\nNo tasks yet.',
          markup: { inline_keyboard: [[{ text: 'Add Nova task', callback_data: 'adm_add' }]] },
        };
      }
      const text = rows
        .map((t: any, i: number) => `${i + 1}. ${t.title} - ${t.reward_amount} ${String(t.reward_type).toUpperCase()}${t.is_active ? '' : ' (inactive)'}`)
        .join('\n');
      const markup = {
        inline_keyboard: [
          ...rows.slice(0, 20).map((t: any, i: number) => [
            { text: `Delete ${i + 1}`, callback_data: `adm_del:${t.id}` },
          ]),
          [{ text: 'Add Nova task', callback_data: 'adm_add' }],
          [{ text: 'Delete all tasks', callback_data: 'adm_delall' }],
        ],
      };
      return { text: `<b>Nova Tasks</b>\n\n${text}`, markup };
    };

    const cancelRow = [{ text: 'Cancel', callback_data: 'adm_cancel' }];

    const draftSummary = (d: any) =>
      `<b>New Task</b>\n\n` +
      `1. Name: ${d.title || '-'}\n` +
      `2. Link: ${d.link || (d.step === 'link' || d.step === 'title' ? '-' : 'none')}\n` +
      `3. Image: ${d.image ? 'added' : (d.step === 'image' || d.step === 'link' || d.step === 'title' ? '-' : 'none')}\n` +
      `Reward: ${d.reward ?? '-'} ${(d.rewardType === 'siri' ? 'NOVA' : (d.rewardType || '')).toUpperCase()}`;

    const askStep = async (chat: number, d: any) => {
      if (d.step === 'title') {
        return tg('sendMessage', {
          chat_id: chat,
          text: `${draftSummary(d)}\n\nSend the task title as a message.`,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [cancelRow] },
        });
      }
      if (d.step === 'link') {
        return tg('sendMessage', {
          chat_id: chat,
          text: `${draftSummary(d)}\n\nSend the task link, or tap "No link".`,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [[{ text: 'No link', callback_data: 'adm_link_none' }], cancelRow] },
        });
      }
      if (d.step === 'type') {
        return tg('sendMessage', {
          chat_id: chat,
          text: `${draftSummary(d)}\n\nChoose the reward currency.`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '$NOVA', callback_data: 'adm_type:siri' },
                { text: 'TON', callback_data: 'adm_type:ton' },
                { text: 'USDT', callback_data: 'adm_type:usdt' },
              ],
              cancelRow,
            ],
          },
        });
      }
      if (d.step === 'reward') {
        return tg('sendMessage', {
          chat_id: chat,
          text: `${draftSummary(d)}\n\nChoose the reward amount, or send a custom number.`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '0.1', callback_data: 'adm_rew:0.1' },
                { text: '0.5', callback_data: 'adm_rew:0.5' },
                { text: '1', callback_data: 'adm_rew:1' },
              ],
              [
                { text: '5', callback_data: 'adm_rew:5' },
                { text: '10', callback_data: 'adm_rew:10' },
                { text: '100', callback_data: 'adm_rew:100' },
              ],
              cancelRow,
            ],
          },
        });
      }
      if (d.step === 'image') {
        return tg('sendMessage', {
          chat_id: chat,
          text: `${draftSummary(d)}\n\nSend the task image as a photo, or tap "Skip image".`,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [[{ text: 'Skip image', callback_data: 'adm_img_none' }], cancelRow] },
        });
      }
      const confirmText = `${draftSummary(d)}\n\nSave this task?`;
      const confirmMarkup = {
        inline_keyboard: [
          [{ text: 'Save task', callback_data: 'adm_save' }],
          [{ text: 'Change reward', callback_data: 'adm_reward' }],
          cancelRow,
        ],
      };
      if (d.image) {
        const r = await tg('sendPhoto', {
          chat_id: chat,
          photo: d.image,
          caption: confirmText,
          parse_mode: 'HTML',
          reply_markup: confirmMarkup,
        });
        if (r?.ok) return r;
      }
      return tg('sendMessage', {
        chat_id: chat,
        text: confirmText,
        parse_mode: 'HTML',
        reply_markup: confirmMarkup,
      });
    };

    // Downloads a Telegram file and stores it in the public bucket; returns its public URL.
    const uploadTelegramImage = async (fileId: string): Promise<string | null> => {
      try {
        const info = await tg('getFile', { file_id: fileId });
        const filePath: string | undefined = info?.result?.file_path;
        if (!filePath) return null;
        const res = await fetch(`https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`);
        if (!res.ok) return null;
        const bytes = new Uint8Array(await res.arrayBuffer());
        const ext = (filePath.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
        const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
        const path = `tasks/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from('ads-tasks').upload(path, bytes, { contentType, upsert: true });
        if (error) {
          console.error('task image upload failed', error);
          return null;
        }
        return supabase.storage.from('ads-tasks').getPublicUrl(path).data.publicUrl;
      } catch (e) {
        console.error('uploadTelegramImage error', e);
        return null;
      }
    };

    const saveDraft = async (chat: number, tgId: number, d: any) => {
      const { error } = await supabase.from('tasks').insert({
        title: d.title,
        link: d.link || null,
        reward_amount: Number(d.reward) || 0,
        reward_type: d.rewardType || 'siri',
        task_type: d.link ? 'link' : 'custom',
        verification_type: 'auto',
        is_active: true,
        image_url: d.image || null,
      });
      await clearDraft(tgId);
      await tg('sendMessage', {
        chat_id: chat,
        text: error ? `Failed: ${error.message}` : `Nova task added: ${d.title} - ${d.reward} ${String(d.rewardType).toUpperCase()}`,
        reply_markup: adminKeyboard,
      });
    };

    // Admin inline buttons
    if (body.callback_query) {
      const cq = body.callback_query;
      const cqChat = cq.message?.chat?.id;
      const cqUser = cq.from?.id;
      const data: string = cq.data || '';
      if (cqChat && cqUser && (await isAdminUser(cqUser))) {
        if (data === 'adm_stats') {
          await tg('sendMessage', { chat_id: cqChat, text: await adminPanelText(), parse_mode: 'HTML', reply_markup: adminKeyboard });
        } else if (data === 'adm_tasks') {
          const l = await listTasks();
          await tg('sendMessage', { chat_id: cqChat, text: l.text, parse_mode: 'HTML', reply_markup: l.markup });
        } else if (data === 'adm_add') {
          const d = { step: 'title', title: '', link: '', image: '', rewardType: 'siri', reward: 100 };
          await setDraft(cqUser, d);
          await askStep(cqChat, d);
        } else if (data === 'adm_cancel') {
          await clearDraft(cqUser);
          await tg('sendMessage', { chat_id: cqChat, text: 'Cancelled.', reply_markup: adminKeyboard });
        } else if (data === 'adm_link_none') {
          const d = (await getDraft(cqUser)) || {};
          d.link = '';
          d.step = 'image';
          await setDraft(cqUser, d);
          await askStep(cqChat, d);
        } else if (data === 'adm_img_none') {
          const d = (await getDraft(cqUser)) || {};
          d.image = '';
          d.step = 'confirm';
          await setDraft(cqUser, d);
          await askStep(cqChat, d);
        } else if (data === 'adm_reward') {
          const d = (await getDraft(cqUser)) || {};
          d.step = 'type';
          await setDraft(cqUser, d);
          await askStep(cqChat, d);
        } else if (data.startsWith('adm_type:')) {
          const d = (await getDraft(cqUser)) || {};
          d.rewardType = data.slice(9);
          d.step = 'reward';
          await setDraft(cqUser, d);
          await askStep(cqChat, d);
        } else if (data.startsWith('adm_rew:')) {
          const d = (await getDraft(cqUser)) || {};
          d.reward = Number(data.slice(8));
          d.step = 'confirm';
          await setDraft(cqUser, d);
          await askStep(cqChat, d);
        } else if (data === 'adm_save') {
          const d = await getDraft(cqUser);
          if (d?.title) await saveDraft(cqChat, cqUser, d);
          else await tg('sendMessage', { chat_id: cqChat, text: 'Draft expired.', reply_markup: adminKeyboard });
        } else if (data.startsWith('adm_del:')) {
          const id = data.slice(8);
          const { error } = await supabase.from('tasks').delete().eq('id', id);
          await tg('sendMessage', { chat_id: cqChat, text: error ? `Delete failed: ${error.message}` : 'Task deleted.', reply_markup: adminKeyboard });
        } else if (data === 'adm_delall') {
          await tg('sendMessage', {
            chat_id: cqChat,
            text: '<b>Delete ALL tasks?</b>\n\nThis removes every task and cannot be undone.',
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [[{ text: 'Yes, delete all', callback_data: 'adm_delall_yes' }], cancelRow] },
          });
        } else if (data === 'adm_delall_yes') {
          await supabase.from('user_tasks').delete().gte('completed_at', '1970-01-01');
          const { error } = await supabase.from('tasks').delete().gte('created_at', '1970-01-01');
          await tg('sendMessage', { chat_id: cqChat, text: error ? `Delete failed: ${error.message}` : 'All tasks deleted.', reply_markup: adminKeyboard });
        }
      }
      await tg('answerCallbackQuery', { callback_query_id: cq.id });
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (body.update_id) {

      const message = body.message;
      if (!message) {
        return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const chatId = message.chat?.id;
      const userId = message.from?.id;
      const firstName = message.from?.first_name || 'Player';

      if (!chatId || !userId) {
        return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const text: string = message.text || '';

      // Admin panel entry
      if (/^\/101\b/.test(text)) {
        if (!(await isAdminUser(userId))) {
          await tg('sendMessage', { chat_id: chatId, text: 'Access denied.' });
        } else {
          await clearDraft(userId);
          await tg('sendMessage', { chat_id: chatId, text: await adminPanelText(), parse_mode: 'HTML', reply_markup: adminKeyboard });
        }
        return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Task builder: image step accepts a photo (or an image sent as a document)
      const photoSizes: any[] = Array.isArray(message.photo) ? message.photo : [];
      const imageFileId: string | null = photoSizes.length
        ? photoSizes[photoSizes.length - 1].file_id
        : (message.document?.mime_type?.startsWith('image/') ? message.document.file_id : null);
      if (imageFileId && (await isAdminUser(userId))) {
        const d = await getDraft(userId);
        if (d && d.step === 'image') {
          const url = await uploadTelegramImage(imageFileId);
          if (!url) {
            await tg('sendMessage', { chat_id: chatId, text: 'Could not upload that image. Try another one or tap "Skip image".' });
          } else {
            d.image = url;
            d.step = 'confirm';
            await setDraft(userId, d);
            await askStep(chatId, d);
          }
          return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }

      // Button-driven task builder: capture free text for the active draft step
      if (text && !text.startsWith('/') && (await isAdminUser(userId))) {
        const d = await getDraft(userId);
        if (d) {
          if (d.step === 'title') {
            d.title = text.trim();
            d.step = 'link';
          } else if (d.step === 'link') {
            d.link = text.trim();
            d.step = 'image';
          } else if (d.step === 'reward') {
            const n = Number(text.trim());
            if (!Number.isFinite(n)) {
              await tg('sendMessage', { chat_id: chatId, text: 'Send a valid number.' });
              return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }
            d.reward = n;
            d.step = 'confirm';
          }
          await setDraft(userId, d);
          await askStep(chatId, d);
          return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }



      if (message.text?.startsWith('/start')) {
        // Acknowledge Telegram immediately; profile writes and welcome delivery
        // can otherwise exceed Telegram's webhook timeout and trigger retries.
        const startWork = (async () => {
          const lastName = message.from?.last_name || '';
          const username = message.from?.username || '';
          const parts = message.text.split(' ');
          const referralCode = parts.length > 1 ? parts[1] : null;

          try {
            const { data: existing } = await supabase
              .from('profiles')
              .select('id')
              .eq('telegram_id', userId)
              .limit(1);

            if (!existing || existing.length === 0) {
              const newReferralCode = `SIRI${userId}${Date.now().toString(36)}`.toUpperCase();
              const hex = Math.abs(Math.trunc(userId)).toString(16).padStart(32, '0').slice(-32);
              const scopedUserId = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;

              let referredBy = null;
              if (referralCode) {
                const { data: referrer } = await supabase
                  .from('profiles')
                  .select('id')
                  .eq('referral_code', referralCode)
                  .limit(1);
                if (referrer && referrer.length > 0) referredBy = referrer[0].id;
              }

              const { error: insertError } = await supabase.from('profiles').insert({
                telegram_id: userId,
                first_name: firstName,
                last_name: lastName,
                username,
                referral_code: newReferralCode,
                referred_by: referredBy,
                user_id: scopedUserId,
              });
              if (insertError && insertError.code !== '23505') {
                console.error('Profile insert error:', insertError);
              }
            }
          } catch (regError) {
            console.error('Registration error:', regError);
          }

          const DEFAULT_WELCOME_IMAGE = 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663964615372/pUhqRwCqipPIcFIm.png';
          let welcomeImageUrl = DEFAULT_WELCOME_IMAGE;
          try {
            const { data: adminConfig } = await supabase
              .from('telegram_admins')
              .select('welcome_image_url')
              .not('welcome_image_url', 'is', null)
              .neq('welcome_image_url', '')
              .limit(1);
            welcomeImageUrl = adminConfig?.[0]?.welcome_image_url || DEFAULT_WELCOME_IMAGE;
          } catch (e) {
            console.error('Failed to get welcome image:', e);
          }

          const welcomeText = '<b>Welcome to Nova</b>\n\nMine $NOVA, TON, and USDT every eight hours. Upgrade your mining capacity. Invite friends. Earn more. Simple. Powerful. Rewarding. Start today.';
          const welcomeMarkup = {
            inline_keyboard: [
              [{ text: 'Open Nova AI', url: APP_URL }],
              [{ text: 'Join Community', url: 'https://t.me/noveall' }],
            ],
          };
          const sendTextWelcome = async () => {
            const response = await fetch(`${BASE_URL}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: welcomeText,
                parse_mode: 'HTML',
                reply_markup: welcomeMarkup,
              }),
            });
            const result = await response.json().catch(() => null);
            if (!response.ok || !result?.ok) {
              throw new Error(result?.description || `sendMessage HTTP ${response.status}`);
            }
          };

          if (welcomeImageUrl) {
            let photoSent = false;
            try {
              const response = await fetch(`${BASE_URL}/sendPhoto`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  photo: welcomeImageUrl,
                  caption: welcomeText,
                  parse_mode: 'HTML',
                  reply_markup: welcomeMarkup,
                }),
              });
              const result = await response.json().catch(() => null);
              photoSent = response.ok && result?.ok === true;
              if (!photoSent) {
                console.error('Telegram sendPhoto rejected welcome:', result?.description || response.status);
              }
            } catch (sendError) {
              console.error('Telegram sendPhoto request failed:', sendError);
            }
            if (!photoSent) await sendTextWelcome();
          } else {
            await sendTextWelcome();
          }
        })();

        EdgeRuntime.waitUntil(
          startWork.catch((error) => console.error('Start processing failed:', error)),
        );
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const { action, chat_id, text, parse_mode } = body;

    let result;
    switch (action) {
      case 'sendMessage': {
        const response = await fetch(`${BASE_URL}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id, text, parse_mode: parse_mode || 'HTML' }),
        });
        result = await response.json();
        break;
      }
      case 'setWebhook': {
        const webhookUrl = body.webhook_url;
        const response = await fetch(`${BASE_URL}/setWebhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: webhookUrl,
            allowed_updates: ['message', 'callback_query'],
          }),
        });
        result = await response.json();
        break;
      }
      case 'getWebhookInfo': {
        const response = await fetch(`${BASE_URL}/getWebhookInfo`);
        result = await response.json();
        break;
      }
      case 'getMe': {
        const response = await fetch(`${BASE_URL}/getMe`);
        result = await response.json();
        break;
      }
      // NOTE: the legacy amount-only 'verifyTonTransaction' case was removed.
      // All TON payments are verified by the `verify-ton-transaction` function,
      // which matches the unique per-payment memo and marks the intent as used.

      default:
        result = { ok: false, error: 'Unknown action' };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Telegram bot error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ── Daily channel post (03:00 UTC, once per day) ────────────────────────────
const CHANNEL_ID = -1002616088306;
const POST_IMG = (n: number) => `https://iqosbhbbyzqozfgpthyj.supabase.co/storage/v1/object/public/ads-tasks/channel-posts/p${n}.jpg`;
const CHANNEL_POSTS = [
  { topic: "mining", img: 1, title: "MINE EVERY 8 HOURS", lines: ["Start a mining session and collect your rewards.", "One tap. Every 8 hours. No equipment needed."] },
  { topic: "referral", img: 2, title: "INVITE FRIENDS, EARN MORE", lines: ["Share your personal link with friends.", "Every friend who joins increases your rewards."] },
  { topic: "tasks", img: 3, title: "COMPLETE TASKS, GET REWARDED", lines: ["New missions are added to the app every day.", "Finish them and claim your rewards instantly."] },
];
const ASTRO_SCENES = [
  "an astronaut drilling glowing purple crystals on a dark volcanic planet",
  "an astronaut floating beside a giant dark ringed planet, holding a glowing coin",
  "two astronauts planting a NOVA flag on a black moon with a violet nebula behind",
  "an astronaut riding a small rover across a dark red desert planet under two moons",
  "an astronaut repairing a satellite in orbit above a deep indigo gas giant",
  "an astronaut sitting on a cliff edge looking at a dark planet eclipse with a purple halo",
  "an astronaut piloting a sleek spaceship through an asteroid field near a dark blue planet",
  "an astronaut carrying a glowing energy cube inside a futuristic mining base on a dark moon",
  "a team of astronauts high-fiving next to a mining machine on a black icy planet",
  "an astronaut surfing a beam of light between two dark planets in deep space",
  "an astronaut exploring a cave of glowing violet crystals on a dark alien world",
  "an astronaut waving from the window of a space station orbiting a shadowed planet",
  "an astronaut jumping in low gravity over craters on a dark grey moon with stars",
  "an astronaut launching a small rocket from a dark planet surface toward a purple galaxy",
];
const BACKDROPS = [
  "a frozen ice planet with blue auroras", "a neon cyberpunk city on Mars at night", "a golden desert planet at sunset with three suns",
  "a lush alien jungle with glowing plants", "an ocean planet with giant waves and floating islands", "inside a glowing crypto mining data center in orbit",
  "a floating sky city above pink clouds", "a volcanic world with rivers of lava", "a crystal canyon reflecting rainbow light",
  "a retro synthwave grid landscape", "a busy futuristic space port with ships", "a peaceful moon garden with cherry blossom trees",
  "a stormy gas giant with lightning", "an underwater alien city", "a snowy mountain observatory under the milky way",
];
const ACTIONS = [
  "skateboarding down a ramp", "playing electric guitar on stage", "lifting a giant golden coin over their head", "fishing from a floating rock",
  "racing a hoverbike", "dancing with a robot", "cooking space noodles", "reading a holographic chart that goes up", "parachuting with a glowing parachute",
  "painting a mural of a coin", "meditating while coins orbit around", "playing chess against an alien", "surfing a giant wave", "driving a monster truck rover",
  "taking a selfie with a friendly alien", "fighting a dragon made of light", "building a robot", "shooting a basketball through a ring of fire",
];
const STYLES = ["cinematic 3D render", "vibrant Pixar-like 3D", "glossy anime illustration", "painterly concept art", "bold comic book art", "soft clay 3D"];
const pickOne = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
async function generateDailyImage(supabase: any, title: string, _scene: string, today: string): Promise<string | null> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return null;
  try {
    const scene = `an astronaut ${pickOne(ACTIONS)}, in ${pickOne(BACKDROPS)}`;
    const prompt = `Wide 3:2 poster, ${pickOne(STYLES)}: ${scene}. Fresh unique composition, rich colors, dramatic lighting. On the left side, large clean bold white sans-serif text that reads exactly "${title}" and below it smaller text "NOVA". No other text, no logos, no watermark.`;
    const r = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "openai/gpt-image-2.5-sunburst", prompt, size: "1536x1024" }),
    });
    if (!r.ok) { console.error("daily image failed", r.status, await r.text()); return null; }
    const j = await r.json();
    const b64: string | undefined = j?.data?.[0]?.b64_json;
    if (!b64) return null;
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const path = `channel-posts/daily-${today}-${Date.now()}.png`;
    const { error } = await supabase.storage.from("ads-tasks").upload(path, bytes, { contentType: "image/png", upsert: true });
    if (error) return null;
    return supabase.storage.from("ads-tasks").getPublicUrl(path).data.publicUrl;
  } catch (e) { console.error("daily image error", e); return null; }
}

async function runChannelPost(supabase: any, BASE_URL: string, force = false) {
  const today = new Date().toISOString().slice(0, 10);
  if (!force) {
    const { data: ex } = await supabase.from("daily_posts").select("id").eq("app", "nova").eq("post_date", today).limit(1);
    if (ex && ex.length) return { ok: true, skipped: "already_posted" };
  }
  const day = Math.floor(Date.now() / 86400_000);
  const base = CHANNEL_POSTS[day % CHANNEL_POSTS.length];
  const scene = ASTRO_SCENES[day % ASTRO_SCENES.length];
  const genImg = await generateDailyImage(supabase, base.title, scene, today);
  const p = { ...base, photo: genImg || POST_IMG(base.img) };
  const caption = `<b>${p.title}</b>\n\n${p.lines.join("\n")}\n\n<b>Open the app and start now.</b>`;
  const reply_markup = { inline_keyboard: [[{ text: "Open App", url: APP_URL }]] };
  let res = await fetch(`${BASE_URL}/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHANNEL_ID, photo: p.photo, caption, parse_mode: "HTML", reply_markup }),
  });
  let json = await res.json();
  if (!json.ok) {
    res = await fetch(`${BASE_URL}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHANNEL_ID, text: caption, parse_mode: "HTML", reply_markup }),
    });
    json = await res.json();
  }
  if (!json.ok) return { ok: false, error: json.description };
  await supabase.from("daily_posts").insert({
    app: "nova", post_date: today, topic: p.topic, text: caption,
    image_url: p.photo, telegram_message_id: json.result?.message_id ?? null,
  });
  return { ok: true, message_id: json.result?.message_id };
}

// ── Automated notifications (every 7 hours) ─────────────────────────────────
const COOLDOWN_HOURS = 6;
async function runAutoNotifications(supabase: any, BASE_URL: string) {
  const nowIso = new Date().toISOString();
  const cooldownIso = new Date(Date.now() - COOLDOWN_HOURS * 3600_000).toISOString();

  const { data: active } = await supabase
    .from("mining_sessions")
    .select("user_id")
    .gt("ends_at", nowIso);
  const mining = new Set((active || []).map((r: any) => r.user_id));

  const { data: recent } = await supabase
    .from("auto_notification_log")
    .select("profile_id")
    .gt("last_sent_at", cooldownIso);
  const recentlySent = new Set((recent || []).map((r: any) => r.profile_id));

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, telegram_id, first_name")
    .eq("is_banned", false)
    .limit(5000);
  if (error) return { ok: false, error: error.message };

  const targets = (profiles || []).filter((p: any) => p.telegram_id && !recentlySent.has(p.id));

  let sent = 0;
  let failed = 0;
  const CHUNK = 25;

  for (let i = 0; i < targets.length; i += CHUNK) {
    const chunk = targets.slice(i, i + CHUNK);
    const okRows: { profile_id: string; topic: string; last_sent_at: string }[] = [];

    await Promise.all(chunk.map(async (p: any) => {
      const topic: NotificationTopic = mining.has(p.id) ? "ai" : Math.random() < 0.7 ? "mining" : "ai";
      const text = buildNotification(topic, p.first_name);
      const buttonText = topic === "mining" ? "Start Mining" : "Open Nova AI";
      const url = APP_URL;
      try {
        const res = await fetch(`${BASE_URL}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: p.telegram_id,
            text,
            parse_mode: "HTML",
            disable_web_page_preview: true,
            reply_markup: { inline_keyboard: [[{ text: buttonText, url }]] },
          }),
        });
        const json = await res.json();
        if (json.ok) okRows.push({ profile_id: p.id, topic, last_sent_at: new Date().toISOString() });
        else failed++;
      } catch {
        failed++;
      }
    }));

    if (okRows.length) {
      await supabase.from("auto_notification_log").upsert(
        okRows.map((r) => ({ ...r, updated_at: new Date().toISOString() })),
        { onConflict: "profile_id" },
      );
      sent += okRows.length;
    }
    if (i + CHUNK < targets.length) await new Promise((r) => setTimeout(r, 1100));
  }

  return { ok: true, candidates: targets.length, sent, failed, variants: totalVariants() };
}

