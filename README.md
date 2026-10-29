# NNZ.STUDIO — портфолио (Y2K / ретро-футуризм)

Готовый статический сайт. Без сборки, без npm, без библиотек.
Открывается двойным кликом по `index.html` — или заливай папку на любой хостинг.

## Структура

```
index.html                  — главная (hero + top-6 + опыт + футер + модалка + about)
archive.html                — сквозной архив с фильтрами
assets/
  css/
    tokens.css              — ВСЯ дизайн-система: цвета, шрифты, тени, тайминги
    base.css                — reset, типографика, кнопки, reveal-анимации
    components.css          — таскбар, hero, карточки, модалка, архив, about
  js/
    data.js                 — массив PROJECTS (единственный источник правды)
    i18n.js                 — тексты RU/EN + блок CONTACTS
    app.js                  — логика: язык, модалка, фильтры, терминал
  img/
    logo.png                — твой логотип (обработан: чёрный фон убран)
    favicon.png
    portrait.jpg            — заглушка портрета, замени своей
    projects/<slug>/NN.jpg  — визуалы кейсов (заглушки, замени своими)
```

## Как менять контент

**Проекты** — только `assets/js/data.js`. Один объект = один проект.
Добавил объект → он сам появился в архиве. Поставил `featured: true` → попал в Top-6 на главной.

```js
{
  slug: 'my-project',            // латиница, без пробелов — идёт в ?project=my-project
  cat: 'branding',               // 'branding' | 'illustration' | 'web' (можно массив)
  year: 2026,
  featured: true,                // Top-6 на главной
  title:    { ru: '...', en: '...' },
  subtitle: { ru: '...', en: '...' },
  client:   { ru: '...', en: '...' },
  role:     { ru: '...', en: '...' },
  desc:     { ru: '...', en: '...' },   // 1–3 предложения для модалки
  external: 'https://www.behance.net/...',  // кнопка «Подробнее»
  cover:  'assets/img/projects/my-project/00.jpg',
  images: ['assets/img/projects/my-project/00.jpg', ...]  // 8–12 для masonry
}
```

**Тексты интерфейса** — `assets/js/i18n.js`, блоки `ru` и `en`.
Каждый ключ есть в обоих языках — если добавишь новый, добавь в оба.

**Контакты** (Behance, Dprofile, Telegram, email, CV) — `CONTACTS` в конце `i18n.js`:

```js
const CONTACTS = {
  behance: 'https://www.behance.net/nnzuzu5f5d',
  dprofile: 'https://dprofile.ru/nat_slatvitskaya',
  telegram: 'https://t.me/ВАШ_НИК',        // ← вписать
  email: 'hello@example.com',               // ← вписать
  cv: 'https://disk.yandex.ru/...'          // ← ссылка на PDF
};
```

**Цвета и тени** — `assets/css/tokens.css`. Хочешь другой неон — меняешь `--accent`,
`--accent-2`, `--accent-ice` и всё перекрашивается само.

## Шрифты

Сейчас подключены **Unbounded** (дисплейный) + **Inter Tight** (заголовки) +
**Inter** (текст) + **JetBrains Mono** (техно-акценты) через Google Fonts.

**Про Actay:** он не в Google Fonts — это коммерческая гарнитура.
Если лицензия есть, положи `.woff2` в `assets/fonts/` и раскомментируй блок
`@font-face` в конце `tokens.css` — он уже прописан, подхватится автоматически
вторым в стеке `--font-display`.

## Как это работает

- **Модалка кейса** — `?project=slug` в URL. Ссылку можно отправлять клиенту.
  Кнопка «назад» в браузере закрывает модалку, а не уводит со страницы.
- **«Обо мне»** — отдельное окно `about.exe` поверх страницы, не секция.
  Открывается кнопкой в таскбаре, по Esc, кликом в фон. Фокус возвращается на кнопку.
- **Архив** — фильтр работает на клиенте, без перезагрузки. Пагинация не нужна до ~60 проектов.
- **Язык** — RU/EN, выбор запоминается в localStorage.
- **Пасхалка** — кнопка `v1.0 / console` в футере или `Ctrl/Cmd + K`.
  Команды: `help`, `about`, `projects`, `archive`, `cv`, `contact`, `clear`.

## Производительность и доступность

- Нулевые зависимости. CSS ~28 КБ, JS ~24 КБ (несжатые).
- Изображения: `loading="lazy"` кроме первых двух, `decoding="async"`, указаны `width/height`.
- Анимации на `transform`/`opacity` — не дёргают layout.
- `prefers-reduced-motion` всё отключает.
- Полная клавиатурная навигация: Tab-ловушка в окнах, Esc закрывает, фокус возвращается.
- `aria-modal`, `aria-hidden`, `aria-pressed`, `aria-live` на сетке архива.

## Что заменить перед публикацией

1. `CONTACTS` — Telegram, email, ссылка на CV.
2. Тексты в `i18n.js` — сейчас там черновик, написанный под тебя.
3. `assets/img/portrait.jpg` — твой портрет.
4. Визуалы в `assets/img/projects/*` — заглушки, сгенерированные под палитру.
   Формат: JPEG, длинная сторона 1200–1600px, вес до 300 КБ на файл.
5. `data.js` — реальные проекты.

## Деплой

Любой статический хостинг: Netlify (drag & drop папки), Vercel, Cloudflare Pages,
GitHub Pages, обычный shared-хостинг по FTP. Сборка не нужна.
