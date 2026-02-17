# Дуров: Путь к легенде

Полноценная игра в духе Douchebag для Telegram Mini App: ты оказываешься дома у молодого Павла Дурова (без богатства), а состояние смотришь в телефоне.

## Как играть
- **Старт:** квартира Павла. Есть телефон (открыть — статы и приложения), комп (кодить Telegram), гантель (качаться), кровать (мечты о детях), дверь (переход по локациям).
- **Телефон:** уровень Дурова, накаченность, дети, Telegram %, TON $; вкладка «Приложения» — Знакомства (+дети), TON (+курс).
- **Локации:** Квартира → Зал (качалка) → Подвал (сервера, код, график TON). Переход через «Выйти» → выбор локации.
- **Цели:** уровень 100, дети 100, мышцы 100, Telegram 100%, TON $1000.

## Запуск локально
Раздай папку по HTTP (нужен HTTPS для продакшена Telegram). Например:

```bash
npx serve .
# или
python -m http.server 8080
```

Открой `http://localhost:3000` (или 8080) — игра работает и без Telegram.

## Деплой на Vercel
1. Зайди на [vercel.com](https://vercel.com), Import Git Repository → выбери `ViberKoder/beceo`.
2. Root Directory оставь пустым (корень репо), Framework Preset — Other (или None). Deploy.
3. После деплоя получишь URL вида `https://beceo-xxx.vercel.app` — его указываешь в BotFather как URL Mini App.

## Подключение к Telegram
1. Создай бота через [@BotFather](https://t.me/BotFather): `/newbot`.
2. Создай Mini App: в BotFather — `/newapp`, привяжи к боту, укажи URL (HTTPS) с Vercel.
3. Либо через [@BotFather](https://t.me/BotFather) → `/myapps` или Menu Button задай URL веб-приложения.

Скрипт `telegram-web-app.js` и тема (цвета) подхватываются автоматически в клиенте Telegram.

## Файлы
- `index.html` — разметка и кнопки
- `style.css` — стили, переменные темы Telegram
- `app.js` — состояние, сохранение в localStorage, проверка победы
- `ANALYSIS.md` — разбор трёх игр Douchebag с Gameflare
