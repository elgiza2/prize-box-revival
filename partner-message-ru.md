# Сообщение партнёру Gift Kombat (готово к отправке)

Привет! Мы всё настроили на стороне Nova.

## Наши задачи для вашего приложения + API проверки

Базовый URL:

`https://iqosbhbbyzqozfgpthyj.supabase.co/functions/v1/check-nova-task`

1) Nova | Зайди в приложение
- Ссылка: `https://t.me/Noveaibot/App`
- Проверка: `https://iqosbhbbyzqozfgpthyj.supabase.co/functions/v1/check-nova-task?tg_user_id=<TG_ID>`
- Условие: пользователь хотя бы один раз открыл Nova.

2) Nova | Заверши 1 майнинг
- Ссылка: `https://t.me/Noveaibot/App`
- Проверка: `https://iqosbhbbyzqozfgpthyj.supabase.co/functions/v1/check-nova-task?check=mining-1-claimed&tg_user_id=<TG_ID>`
- Условие: минимум 1 завершённый майнинг в Nova.

Формат ответа такой же, как у вас:

`{"success":true}` или `{"success":false}`

## Ваши 3 задачи у нас — готово

Мы добавили все 3 задачи Gift Kombat в Nova:
- Win 100 battles
- Reach level 5
- Shop purchases 300⭐ — порог `$4.25` с `after_date=2026-10-13`, как ты подтвердил.

Что исправлено:
- Добавлена твоя картинка ко всем трём задачам.
- Проверка идёт только через наш сервер.
- Награда выдаётся только если твой API возвращает `success: true`.
- Награда выдаётся один раз, повторное получение невозможно.
- Исправлена подпись Telegram initData, теперь проверка стабильная.

Если хочешь, можем позже добавить секретный ключ для нашего API. Пока API открыто так же, как твоё.
