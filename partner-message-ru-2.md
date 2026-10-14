# Сообщение партнёру Gift Kombat — наши 2 задачи + ваши задачи у нас

Привет! Ваши 3 задачи уже настроены в Nova, первая задача (Win 100 battles) отключена по нашей договорённости — сейчас активны 2:

- Reach level 5 — проверка через ваш API `check-exists`
- Shop purchases 300⭐ — проверка через ваш API `check-shop-purchases` (порог `$4.25` с `after_date=2026-10-13`)
- Твоя картинка добавлена к обеим задачам, награда выдаётся только при `success: true` и только один раз.

## Наши 2 задачи для твоего приложения

Базовый URL:

`https://iqosbhbbyzqozfgpthyj.supabase.co/functions/v1/check-nova-task`

1) Nova | Сделай стейкинг на 5 TON
- Ссылка: `https://t.me/Noveaibot/App`
- Проверка: `https://iqosbhbbyzqozfgpthyj.supabase.co/functions/v1/check-nova-task?check=staking-5-ton&tg_user_id=<TG_ID>`
- Условие: владение сервером от 5 TON (например Spark Node).

2) Nova | Подписка Megsy AI на месяц ($7)
- Ссылка: `https://t.me/Noveaibot/App`
- Проверка: `https://iqosbhbbyzqozfgpthyj.supabase.co/functions/v1/check-nova-task?check=megsy-monthly&tg_user_id=<TG_ID>`
- Условие: активная месячная подписка Megsy AI ($7).

Формат ответа такой же, как у тебя:

`{"success":true}` или `{"success":false}`

Замени `<TG_ID>` на Telegram ID пользователя. Если хочешь, добавим секретный ключ позже.
