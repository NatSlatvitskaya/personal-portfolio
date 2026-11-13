/* =============================================================
   APP — логика. Vanilla JS, без зависимостей.
   Главная: кольцо из 8 карточек, телефон с печатающимся текстом,
            переключатель темы и языка, модалка кейса.
   Архив: фильтры.
   ============================================================= */
(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     STATE
     ============================================================ */
  const LS = { lang: 'nnz.lang', theme: 'nnz.theme' };

  let lang = localStorage.getItem(LS.lang) || 'ru';
  if (!I18N[lang]) lang = 'ru';

  let theme = localStorage.getItem(LS.theme) || 'light';
  if (!['light', 'dark'].includes(theme)) theme = 'light';

  const t  = (k) => I18N[lang][k] ?? I18N.ru[k] ?? k;
  const tx = (o) => (o && (o[lang] ?? o.ru)) || '';
  const byId = (slug) => PROJECTS.find((p) => p.slug === slug);

  /* ============================================================
     ТЕМА
     ============================================================ */
  function applyTheme(next, persist = true) {
    theme = next === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    if (persist) localStorage.setItem(LS.theme, theme);

    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#050505' : '#B98FEB');

    $$('[data-theme-toggle]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(theme === 'dark'));
      btn.setAttribute('aria-label', t('foot.theme'));
      btn.title = theme === 'dark' ? t('theme.light') : t('theme.dark');
    });
  }

  $$('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      applyTheme(theme === 'dark' ? 'light' : 'dark');
    });
  });

  /* ============================================================
     КАРТОЧКИ
     ============================================================ */
  function cardHTML(p, i) {
    const title = tx(p.title);
    const hasCover = !!p.cover;
    const cover = hasCover
      ? `<img src="${p.cover}" alt="${title}" loading="${i < 4 ? 'eager' : 'lazy'}" decoding="async">`
      : `<span class="card__empty"><span>${t('card.stub')}</span></span>`;

    return `<button class="card" type="button" data-slug="${p.slug}"
              aria-label="${title} — ${t('card.open')}">
      <span class="card__cover">${cover}</span>
      <span class="card__label">${title}</span>
    </button>`;
  }

  function archiveCardHTML(p, i) {
    const title = tx(p.title);
    const cat = t('cat.' + p.cat);
    const hasCover = !!p.cover;
    const media = hasCover
      ? `<img src="${p.cover}" alt="${title}" loading="lazy" decoding="async" width="800" height="600">`
      : `<span class="acard__empty"></span>`;

    return `<button class="acard" type="button" data-slug="${p.slug}"
              aria-label="${title} — ${cat} ${p.year}">
      <span class="acard__media">${media}</span>
      <span class="acard__body">
        <span class="acard__title">${title}</span>
      </span>
    </button>`;
  }

  function renderDeck() {
    const stage = $('.stage');
    const center = $('.stage__center');
    if (!stage || !center) return;

    // чистим старые карточки
    $$('.card', stage).forEach((c) => c.remove());

    const ring = PROJECTS.filter((p) => p.featured).slice(0, 8);
    ring.forEach((p, i) => {
      const wrap = document.createElement('div');
      wrap.innerHTML = cardHTML(p, i);
      stage.insertBefore(wrap.firstElementChild, center);
    });
  }

  /* ============================================================
     АРХИВ
     ============================================================ */
  let activeFilter = 'all';

  function renderArchive() {
    const host = $('#archiveGrid');
    if (!host) return;

    const list = PROJECTS
      .filter((p) => activeFilter === 'all' || p.cat === activeFilter)
      .sort((a, b) => b.year - a.year);

    $$('.filter').forEach((btn) => {
      const f = btn.dataset.filter;
      const n = f === 'all' ? PROJECTS.length : PROJECTS.filter((p) => p.cat === f).length;
      const c = btn.querySelector('.filter__count');
      if (c) c.textContent = n;
      const on = f === activeFilter;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', String(on));
    });

    const counter = $('#archiveCount');
    if (counter) counter.textContent = `${list.length} ${t('archive.count')}`;

    if (!list.length) {
      host.innerHTML = `<div class="archive-empty">
        <strong>${t('archive.empty.t')}</strong>
        <span>${t('archive.empty.d')}</span>
      </div>`;
      return;
    }

    host.innerHTML = list.map((p, i) => archiveCardHTML(p, i)).join('');
    $$('.acard', host).forEach((c, i) => {
      c.style.animationDelay = `${Math.min(i * 28, 220)}ms`;
      c.classList.add('is-entering');
    });
  }

  $$('.filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      renderArchive();
    });
  });

  // теги-фильтры на главной
  $$('[data-tag-filter]').forEach((tag) => {
    tag.addEventListener('click', () => {
      const f = tag.dataset.tagFilter;
      location.href = `archive.html?filter=${encodeURIComponent(f)}`;
    });
  });

  /* ============================================================
     МОДАЛКА
     ============================================================ */
  const modal = $('#modal');
  const modalScroll = $('#modalScroll');
  const modalState = { slug: null, trigger: null };

  function galleryHTML(p) {
    if (!p.images || !p.images.length) {
      return `<div class="archive-empty" style="border:0">
        <strong>${t('modal.soon')}</strong>
      </div>`;
    }
    return p.images.map((src, i) => `
      <figure>
        <img src="${src}" alt="${tx(p.full || p.title)} — ${i + 1}" loading="lazy" decoding="async">
      </figure>`).join('');
  }

  /* галерея макета: широкий, пара квадратов, широкий, пара, пара, широкий… */
  const PCASE_PATTERN = ['w', 'h', 'h', 'w', 'h', 'h', 'h', 'h', 'w'];
  function pcaseGalleryHTML(p) {
    if (!p.images || !p.images.length) return galleryHTML(p);
    return p.images.map((src, i) => {
      const k = PCASE_PATTERN[i % PCASE_PATTERN.length];
      return `<figure class="pcase__fig pcase__fig--${k}">
        <img src="${src}" alt="${tx(p.full || p.title)} — ${i + 1}" loading="lazy" decoding="async">
      </figure>`;
    }).join('');
  }

  function renderModalContent(p) {
    if (!p || !modal) return;
    const cat = t('cat.' + p.cat);
    const title = tx(p.full || p.title);

    const bar = $('#modalBarTitle');
    if (bar) bar.textContent = `${p.slug}.case`;

    const body = $('#modalBody');
    if (!body) return;

    const role = p.role ? tx(p.role) : cat;
    const tools = (p.tools || []).map((tl) => `<span class="pcase__tool">${tl}</span>`).join('');
    const more = `<a class="pcase__more" href="${p.external}" target="_blank" rel="noopener noreferrer">${t('modal.more')}</a>`;

    body.innerHTML = `
      <div class="pcase">
        <div class="pcase__head">
          <div class="pcase__info">
            <p class="pcase__cat">{${cat}}</p>
            <h2 class="pcase__title" id="modalTitle">${title}</h2>
            <p class="pcase__desc">${tx(p.desc)}</p>
          </div>
          <aside class="pcase__side">
            <div class="pcase__block">
              <span class="pcase__label">${t('modal.tools')}</span>
              <div class="pcase__tools">${tools}</div>
            </div>
            <div class="pcase__block">
              <span class="pcase__label">${t('modal.role')}</span>
              <span class="pcase__value">${role}</span>
            </div>
          </aside>
        </div>
        <div class="pcase__bar">
          <span class="pcase__handle">@NatSlatvitskaya</span>
          ${more}
        </div>
        <div class="pcase__gallery">${pcaseGalleryHTML(p)}</div>
        <div class="pcase__bar pcase__bar--foot">
          <span class="pcase__handle">@NatSlatvitskaya</span>
          ${more}
        </div>
      </div>`;
  }

  function openModal(slug, { push = true, trigger = null } = {}) {
    const p = byId(slug);
    if (!p || !modal) return;

    modalState.slug = slug;
    modalState.trigger = trigger || document.activeElement;

    renderModalContent(p);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    if (modalScroll) modalScroll.scrollTop = 0;

    if (push) {
      const url = new URL(location.href);
      url.searchParams.set('project', slug);
      history.pushState({ project: slug }, '', url);
    }

    requestAnimationFrame(() => {
      const c = $('[data-close-modal]');
      if (c) c.focus({ preventScroll: true });
    });
  }

  function closeModal({ fromHistory = false } = {}) {
    if (!modal || !modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    modalState.slug = null;

    if (!fromHistory) {
      const url = new URL(location.href);
      url.searchParams.delete('project');
      history.pushState({}, '', url);
    }
    if (modalState.trigger && document.contains(modalState.trigger)) {
      modalState.trigger.focus({ preventScroll: true });
    }
  }

  document.addEventListener('click', (e) => {
    const card = e.target.closest('[data-slug]');
    if (card) {
      e.preventDefault();
      openModal(card.dataset.slug, { trigger: card });
      return;
    }
    if (e.target.closest('[data-close-modal]')) closeModal();
  });

  $('#modalScrim')?.addEventListener('click', () => closeModal());

  window.addEventListener('popstate', () => {
    const slug = new URL(location.href).searchParams.get('project');
    if (slug && byId(slug)) openModal(slug, { push: false });
    else closeModal({ fromHistory: true });
  });

  /* ============================================================
     ТЕЛЕФОН: смена сообщений
     ============================================================ */
  const messages = ['phone.msg1', 'phone.msg2', 'phone.msg3', 'phone.msg4', 'phone.msg5', 'phone.msg6'];
  let msgIndex = 0;
  let typeTimer = null;
  let cycleTimer = null;
  const phoneText = $('#phoneText');

  function typeMessage(text, done) {
    if (!phoneText) return;
    if (reduceMotion) { phoneText.textContent = text; return; }

    let i = 0;
    phoneText.textContent = '';
    clearInterval(typeTimer);

    typeTimer = setInterval(() => {
      i += 1;
      phoneText.textContent = text.slice(0, i);
      if (i >= text.length) {
        clearInterval(typeTimer);
        if (done) setTimeout(done, 1700);
      }
    }, 118);
  }

  function eraseMessage(done) {
    if (!phoneText) return;
    if (reduceMotion) { done(); return; }

    let text = phoneText.textContent;
    clearInterval(typeTimer);
    typeTimer = setInterval(() => {
      text = text.slice(0, -1);
      phoneText.textContent = text;
      if (!text.length) {
        clearInterval(typeTimer);
        done();
      }
    }, 52);
  }

  function cycleMessages() {
    if (!phoneText) return;
    const next = () => {
      msgIndex = (msgIndex + 1) % messages.length;
      startMessage();
    };
    eraseMessage(next);
  }

  function startMessage() {
    const key = messages[msgIndex];
    const text = t(key);

    /* длинные фразы не влезают в экран телефона — уменьшаем кегль только им */
    if (phoneText) phoneText.classList.toggle('is-long', key === 'phone.msg6');

    typeMessage(text, () => {
      clearTimeout(cycleTimer);
      cycleTimer = setTimeout(cycleMessages, 2600);
    });
  }

  function restartMessages() {
    clearInterval(typeTimer);
    clearTimeout(cycleTimer);
    msgIndex = 0;
    startMessage();
  }

  /* ============================================================
     ЯЗЫК
     ============================================================ */
  function applyLang(next, persist = true) {
    lang = I18N[next] ? next : 'ru';
    if (persist) localStorage.setItem(LS.lang, lang);
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('data-lang', lang);   // для CSS: неактивный язык 50%

    $$('[data-i18n]').forEach((el) => {
      const val = t(el.dataset.i18n);
      if (el.dataset.i18nHtml === 'true') el.innerHTML = val;
      else el.textContent = val;
    });

    $$('[data-i18n-attr]').forEach((el) => {
      el.dataset.i18nAttr.split('|').forEach((pair) => {
        const [attr, key] = pair.split(':');
        if (attr && key) el.setAttribute(attr, t(key));
      });
    });

    $$('[data-i18n-title]').forEach((el) => { document.title = t(el.dataset.i18nTitle); });
    $$('[data-i18n-desc]').forEach((el) => { el.setAttribute('content', t(el.dataset.i18nDesc)); });

    $$('.lang__btn, button[data-lang]').forEach((b) => {
      if (!b.dataset.lang) return;
      const on = b.dataset.lang === lang;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });

    renderDeck();
    if ($('#archiveGrid')) renderArchive();
    if (modalState.slug) renderModalContent(byId(modalState.slug));
    applyTheme(theme, false);
    restartMessages();
  }

  document.documentElement.setAttribute('data-lang', lang);

  $$('.lang__btn, button[data-lang]').forEach((btn) => {
    if (!btn.dataset.lang) return;
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });

  /* ============================================================
     КОНТАКТЫ
     ============================================================ */
  $$('[data-contact]').forEach((a) => {
    const k = a.dataset.contact;
    if (CONTACTS[k]) a.href = CONTACTS[k];
  });

  /* ============================================================
     ТЕРМИНАЛ
     ============================================================ */
  const terminal = $('#terminal');
  const termOut = $('#termOut');
  const termField = $('#termField');

  function termPrint(text, cls = '') {
    if (!termOut) return;
    const line = document.createElement('div');
    if (cls) line.className = cls;
    line.textContent = text;
    termOut.appendChild(line);
    termOut.scrollTop = termOut.scrollHeight;
  }

  function openTerminal() {
    if (!terminal) return;
    terminal.classList.add('is-open');
    terminal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    if (termOut && !termOut.dataset.init) {
      termOut.dataset.init = '1';
      termPrint('nnz://portfolio v1.2 — Y2K build · modes', 'ok');
      termPrint(t('term.hint'), 'dim');
    }
    setTimeout(() => termField?.focus({ preventScroll: true }), 90);
  }

  function closeTerminal() {
    geekExit();
    terminal?.classList.remove('is-open');
    terminal?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
  }

  $$('[data-open-terminal]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openTerminal();
    });
  });
  $('#termClose')?.addEventListener('click', closeTerminal);

  function runCommand(raw) {
    const cmd = raw.trim().toLowerCase();
    termPrint(`> ${raw}`, 'dim');
    if (!cmd) return;
    switch (cmd) {
      case 'help':     termPrint(t('term.help'), 'ok');
                       termPrint(t('term.secret'), 'dim'); break;
      case 'projects': closeTerminal(); break;
      case 'archive':  closeTerminal(); location.href = 'archive.html'; break;
      case 'cv':       window.open(CONTACTS.cv, '_blank', 'noopener'); termPrint('opening cv…', 'ok'); break;
      case 'contact':  location.href = `mailto:${CONTACTS.email}`; break;
      case 'theme':    applyTheme(theme === 'dark' ? 'light' : 'dark'); termPrint(theme, 'ok'); break;
      case 'stamp':    stampStart(); break;
      case 'clear':    stampClear(); break;
      case 'destruct': destructRun(); break;
      case 'geek':     geekStart(); break;
      case 'exit':     geekExit(); break;
      default:         termPrint(`${t('term.unknown')}: ${cmd}`, 'warn');
    }
  }

  termField?.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    runCommand(termField.value);
    termField.value = '';
  });

  /* ============================================================
     ИНТЕРАКТИВНЫЕ РЕЖИМЫ: stamp · destruct · geek
     ============================================================ */

  let geekState = null;
  let geekRain = null;
  let countTimer = null;


  const RAIN_GLYPHS =
    'アイウエオカキクケコサシスセソタチツテト' +
    'ナニヌネノハヒフヘホマミムメモヤユヨラリ' +
    '0123456789ABCDEF{}[]<>/*+-=$#';

  /* ============================================================
     ДОЖДЬ ИЗ КОДА — canvas-движок для geek
     ============================================================ */
  function createRain(canvas, cfg) {
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = cfg.size || 15;
    const glyphs = cfg.glyphs;

    let cols = 0;
    let drops = [];
    let speeds = [];
    let W = 1;
    let H = 1;
    let raf = 0;
    let boost = 0;
    let dead = false;

    function measure() {
      const r = canvas.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = size + 'px ' + cfg.font;
      ctx.textBaseline = 'top';

      cols = Math.ceil(W / size);
      drops = new Array(cols);
      speeds = new Array(cols);
      for (let i = 0; i < cols; i += 1) {
        drops[i] = Math.random() * -H / size;
        speeds[i] = 0.45 + Math.random() * 0.95;
      }
    }

    function frame() {
      if (dead) return;

      if (cfg.clear) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = cfg.clear;
        ctx.fillRect(0, 0, W, H);
      } else {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,' + cfg.fade + ')';
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';
      }

      for (let i = 0; i < cols; i += 1) {
        const ch = glyphs[(Math.random() * glyphs.length) | 0];
        const x = i * size;
        const y = drops[i] * size;

        if (Math.random() > 0.982) {
          ctx.fillStyle = cfg.head;
          ctx.shadowColor = cfg.head;
          ctx.shadowBlur = size * 0.85;
        } else {
          ctx.fillStyle = cfg.color;
          ctx.shadowBlur = 0;
        }

        ctx.fillText(ch, x, y);
        ctx.shadowBlur = 0;

        drops[i] += speeds[i] * (1 + boost);

        if (y > H && Math.random() > 0.972) {
          drops[i] = 0;
          speeds[i] = 0.45 + Math.random() * 0.95;
        }
      }

      boost *= 0.945;
      raf = requestAnimationFrame(frame);
    }

    measure();
    window.addEventListener('resize', measure);
    raf = requestAnimationFrame(frame);

    return {
      burst(v) { boost = Math.min(7, boost + v); },
      stop() {
        if (dead) return;
        dead = true;
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', measure);
        if (canvas.parentNode) canvas.remove();
      }
    };
  }

  /* ------------------------------------------------------------
     2. destruct — обратный отсчёт и падение
     ------------------------------------------------------------ */

  function destructRun() {
    if (!termOut || document.body.classList.contains('is-destroying')) return;

    clearInterval(countTimer);
    document.querySelectorAll('.nnz-count').forEach((n) => n.remove());

    document.body.classList.add('is-alarm');
    terminal?.classList.add('is-spectate');

    const num = document.createElement('div');
    num.className = 'nnz-count';
    document.body.appendChild(num);

    let n = 5;

    const paint = () => {
      num.textContent = String(n);
      num.classList.remove('is-tick');
      void num.offsetWidth;
      num.classList.add('is-tick');
    };

    paint();
    n -= 1;

    countTimer = setInterval(() => {
      if (n < 0) {
        clearInterval(countTimer);
        num.remove();
        collapse();
        return;
      }
      paint();
      n -= 1;
    }, 700);
  }

  function collapse() {
    document.body.classList.remove('is-alarm');
    document.body.classList.add('is-destroying');

    const W = window.innerWidth;
    const H = window.innerHeight;
    const targets = $$('.screen > .topbar, .screen > .footbar, .stage .card, .stage .phone, .stage .design-on');

    /* у карточек и телефона CSS-свойство transform (центрирование).
       Оно применяется ПОСЛЕ translate и сбивает расчёт — снимаем на замер. */
    targets.forEach((el) => {
      const saved = el.style.transform;
      el.style.transform = 'none';
      const r = el.getBoundingClientRect();

      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;

      /* все центры сводим в нижнюю полосу экрана — получается куча */
      const targetX = cx; /* без сноса в сторону: падаем строго вниз */
      const targetY = H * 0.94 + (Math.random() - 0.5) * H * 0.09;

      const dx = targetX - cx;
      const dy = targetY - cy;

      el.style.transform = saved;

      el.style.setProperty('--fall-x', dx.toFixed(0) + 'px');
      el.style.setProperty('--fall-y', dy.toFixed(0) + 'px');
      el.style.setProperty('--fall-rot', '0deg');
      /* обвал, а не перелёт: короткая разбежка и быстрый разгон */
      el.style.setProperty('--fall-delay', (Math.random() * 110).toFixed(0) + 'ms');
      el.style.setProperty('--fall-dur', (470 + Math.random() * 170).toFixed(0) + 'ms');
      el.style.setProperty('--fall-z', String(Math.floor(Math.random() * 8)));
    });

    setTimeout(() => {
      termPrint("Oops. Use 'clear' or refresh page to rebuild.", 'warn');
    }, 1280);
  }

  function rebuildAll() {
    clearInterval(countTimer);
    document.body.classList.remove('is-destroying', 'is-alarm');
    terminal?.classList.remove('is-spectate');
    document.querySelectorAll('.nnz-count').forEach((n) => n.remove());
    $$('[style*="--fall-"]').forEach((el) => {
      ['--fall-x', '--fall-y', '--fall-rot', '--fall-delay', '--fall-dur']
        .forEach((prop) => el.style.removeProperty(prop));
    });
  }

  /* ------------------------------------------------------------
     3. geek — бесконечный набор кода
     ------------------------------------------------------------ */

  const GEEK_SNIPPETS = [
    '.design-on {\n' +
    '  filter: blur(2px)\n' +
    '          drop-shadow(0 0 8px #FAD9FF)\n' +
    '          drop-shadow(0 0 16px rgba(250, 217, 255, .7));\n' +
    '  mix-blend-mode: plus-lighter;\n' +
    '  will-change: filter;\n' +
    '}',

    "const messages = ['phone.msg1', 'phone.msg2',\n" +
    "                 'phone.msg3', 'phone.msg4', 'phone.msg5'];\n" +
    "let msgIndex = 0;\n" +
    "\n" +
    "function startMessage() {\n" +
    "  const text = t(messages[msgIndex]);\n" +
    "  typeMessage(text, () => {\n" +
    "    cycleTimer = setTimeout(cycleMessages, 2600);\n" +
    "  });\n" +
    "}",

    '.footbar {\n' +
    '  background-color: rgba(241, 228, 218, 0.20);\n' +
    '  background-image: linear-gradient(\n' +
    '    -45deg,\n' +
    '    rgba(255, 255, 255, .26) 0%,\n' +
    '    rgba(255, 255, 255, .10) 34%,\n' +
    '    rgba(241, 228, 218, .10) 100%\n' +
    '  );\n' +
    '  backdrop-filter: blur(7px) saturate(1.25) brightness(1.04);\n' +
    '  border-radius: 20px 20px 0 0;\n' +
    '}',

    ':root {\n' +
    '  --col-gap: var(--grid-gutter);\n' +
    '  --col-w: calc((100% - (var(--grid-margin) * 2)\n' +
    '                 - (var(--col-gap) * 2)) / 3);\n' +
    '  --col-2: calc(var(--grid-margin) + var(--col-w) + var(--col-gap));\n' +
    '}',

    'function typeMessage(text, done) {\n' +
    '  let i = 0;\n' +
    "  phoneText.textContent = '';\n" +
    '  typeTimer = setInterval(() => {\n' +
    '    i += 1;\n' +
    '    phoneText.textContent = text.slice(0, i);\n' +
    '    if (i >= text.length) {\n' +
    '      clearInterval(typeTimer);\n' +
    '      if (done) setTimeout(done, 1700);\n' +
    '    }\n' +
    '  }, 118);\n' +
    '}',

    '.design-on--design {\n' +
    '  --shift-x: calc(var(--col-w-vp) * -0.097);\n' +
    '}\n' +
    '\n' +
    '.design-on--on {\n' +
    '  --shift-y: calc(var(--col-w-vp) * 0.048);\n' +
    '}'
  ];

  function geekStart() {
    if (!termOut || geekState) return;

    terminal?.classList.add('is-geek');
    document.body.classList.add('is-geek');       /* перекраска сайта в монохром */

    /* отдельный слой: код струится по фону ПОД интерфейсом */
    let layer = document.querySelector('.nnz-geekfx');
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'nnz-geekfx';
      layer.innerHTML = '<canvas class="nnz-geekrain" aria-hidden="true"></canvas>' +
                        '<div class="nnz-scan"></div>';
      const screen = document.querySelector('.screen');
      if (screen && screen.parentNode) screen.parentNode.insertBefore(layer, screen);
      else document.body.appendChild(layer);
    }
    requestAnimationFrame(() => layer.classList.add('is-on'));

    geekRain = createRain(layer.querySelector('.nnz-geekrain'), {
      font: '"JetBrains Mono", ui-monospace, monospace',
      size: 14,
      color: 'rgba(150, 255, 235, 0.55)',
      head: '#E8FFFB',
      fade: 0.07,
      glyphs: RAIN_GLYPHS
    });

    termPrint('geek mode · type anything · exit to quit', 'dim');

    const line = document.createElement('div');
    line.className = 'geek-code';
    termOut.appendChild(line);

    geekState = { idx: 0, pos: 0, line: line, timer: null };
    geekState.timer = setInterval(() => geekStep(1), 16);
    if (termField) { termField.readOnly = true; termField.blur(); }
  }

  function geekStep(count) {
    if (!geekState || !termOut) return;

    const code = GEEK_SNIPPETS[geekState.idx % GEEK_SNIPPETS.length];

    for (let k = 0; k < count; k += 1) {
      if (geekState.pos >= code.length) {
        geekState.idx += 1;
        geekState.pos = 0;
        const next = document.createElement('div');
        next.className = 'geek-code';
        termOut.appendChild(next);
        geekState.line = next;
        break;
      }
      geekState.line.textContent += code[geekState.pos];
      geekState.pos += 1;
    }

    /* каждая напечатанная порция ускоряет дождь — «перепрограммируем» фон */
    if (geekRain) geekRain.burst(0.55 * count);

    termOut.scrollTop = termOut.scrollHeight;
    while (termOut.children.length > 300) termOut.firstElementChild.remove();
  }

  function geekExit() {
    if (!geekState) return;
    clearInterval(geekState.timer);
    geekState = null;
    terminal?.classList.remove('is-geek');
    document.body.classList.remove('is-geek');

    if (geekRain) { geekRain.stop(); geekRain = null; }
    const layer = document.querySelector('.nnz-geekfx');
    if (layer) {
      layer.classList.remove('is-on');
      setTimeout(() => layer.remove(), 520);
    }

    if (termField) termField.readOnly = false;
    if (termOut) termPrint('geek mode off', 'dim');
  }

  /* ============================================================
     ПРЕЛОАДЕР — чёрный экран с логотипом, пока грузятся ассеты
     ============================================================ */
  (function preloader() {
    const el = document.getElementById('nnzPreloader');
    if (!el) return;
    const fill = el.querySelector('.nnz-preloader__fill');

    let done = false;
    function hide() {
      if (done) return;
      done = true;
      el.classList.add('is-out');
      setTimeout(() => { el.style.display = 'none'; }, 460);
      document.body.classList.remove('is-preloading');
    }

    document.body.classList.add('is-preloading');

    const heavy = [...document.querySelectorAll('.phone__img, .design-on')];
    const MIN_MS = 900;
    let loaded = 0;
    const total = Math.max(heavy.length, 1);

    const setProgress = (v) => {
      if (fill) fill.style.clipPath = `inset(${(100 - v * 100).toFixed(2)}% 0 0 0)`;
    };

    const onLoaded = () => { loaded += 1; setProgress(loaded / total * 0.9); };
    const waits = heavy.map((img) => new Promise((res) => {
      if (img.complete && img.naturalWidth > 0) { onLoaded(); return res(); }
      const done1 = () => { onLoaded(); res(); };
      img.addEventListener('load', done1, { once: true });
      img.addEventListener('error', done1, { once: true });
    }));
    if (!heavy.length) setProgress(0.9);

    const ready = Promise.all(waits);
    const minTime = new Promise((res) => setTimeout(res, MIN_MS));
    const timeout = new Promise((res) => setTimeout(res, 6000));

    Promise.race([Promise.all([ready, minTime]), timeout]).then(() => {
      setProgress(1);
      requestAnimationFrame(() => requestAnimationFrame(hide));
    });
  })();

  document.addEventListener('keydown', (e) => {
    if (!geekState) return;
    if (e.key === 'Escape') { geekExit(); return; }
    if (e.key.length === 1 || e.key === 'Enter' || e.key === 'Backspace') {
      geekStep(3);
      if (geekRain) geekRain.burst(0.9);      /* живой отклик фона на каждую клавишу */
    }
  }, true);


  /* ============================================================
     STAMP — генератор стикеров NAT. Клик по экрану = стикер.
     ============================================================ */
  const STAMP_HUES = [
    { hue: 0,   label: 'acid' },     /* исходный зелёный логотипа */
    { hue: 175, label: 'violet' }    /* сдвиг в фиолетовый */
  ];
  let stampOn = false;
  let stampCount = 0;

  function stampStart() {
    if (stampOn) return;
    stampOn = true;
    document.body.classList.add('is-stamp');
    termPrint('Stamp mode ON. Click anywhere on the screen to drop NAT stickers. Type \'clear\' to clean up.', 'ok');
  }

  function stampDrop(x, y) {
    const img = document.createElement('img');
    img.className = 'nnz-sticker';
    img.src = 'assets/img/logo-nat.png';
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.decoding = 'async';

    const pick = STAMP_HUES[Math.floor(Math.random() * STAMP_HUES.length)];
    const rot = (Math.random() * 70 - 35).toFixed(1);       /* −35…+35° */
    const scale = (0.6 + Math.random() * 0.8).toFixed(2);   /* 0.6…1.4 */
    const w = 150;                                          /* базовая ширина, px */

    img.style.setProperty('--sx', x + 'px');
    img.style.setProperty('--sy', y + 'px');
    img.style.setProperty('--srot', rot + 'deg');
    img.style.setProperty('--sscale', scale);
    img.style.setProperty('--shue', pick.hue + 'deg');
    img.style.width = w + 'px';

    document.body.appendChild(img);
    stampCount += 1;
  }

  function stampClear() {
    const was = stampOn;
    stampOn = false;
    document.body.classList.remove('is-stamp');

    const stickers = [...document.querySelectorAll('.nnz-sticker')];
    stickers.forEach((s, i) => {
      s.style.animationDelay = (i * 18) + 'ms';
      s.classList.add('is-leaving');
    });
    const cleanup = () => { stickers.forEach((s) => s.remove()); };
    setTimeout(cleanup, 420 + stickers.length * 18);

    stampCount = 0;
    if (termOut) {
      termOut.innerHTML = '';
      termOut.dataset.init = '';
      rebuildAll();
    }
    if (was || stickers.length) termPrint('Stamps cleared. Stamp mode OFF.', 'ok');
  }

  /* клик по экрану в режиме stamp: не ставим стикер поверх терминала/модалки/кнопок-управления */
  document.addEventListener('click', (e) => {
    if (!stampOn) return;
    if (e.target.closest('.terminal, .modal, [data-open-terminal], .footbar, .topbar, .lang__btn, .themetoggle')) return;
    stampDrop(e.clientX, e.clientY);
  }, false);

  /* ============================================================
     КЛАВИАТУРА
     ============================================================ */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (terminal?.classList.contains('is-open')) return closeTerminal();
      if (modal?.classList.contains('is-open')) return closeModal();
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      terminal?.classList.contains('is-open') ? closeTerminal() : openTerminal();
      return;
    }
    if (e.key === 'Tab') trapFocus(e);
  });

  function trapFocus(e) {
    const host = modal?.classList.contains('is-open') ? modal
      : terminal?.classList.contains('is-open') ? terminal : null;
    if (!host) return;
    const f = $$('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])', host)
      .filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }


  /* ============================================================
     SVG-ИНТЕРФЕЙС — переключаемся на вектор, если файлы есть.
     Проверяем все четыре; если хотя бы один не найден —
     остаёмся на PNG, чтобы ничего не пропало.
     ============================================================ */
  /* ============================================================
     «design on» — если рядом с PNG появился SVG, берём его.
     Вектор чётче при любом размере.
     ============================================================ */
  (function designOnSVG() {
    return; // два слоя задаются в HTML
    const svg = 'assets/img/design-on.svg';
    const probe = new Image();
    probe.onload = () => { img.src = svg; };
    probe.onerror = () => {};
    probe.src = svg;
  })();

  (function svgUI() {
    const UI = 'assets/img/icons/ui/';

    // базовые пары — включают векторный вид
    const base = [
      { cls: 'lang-svg',  files: ['lang-light.svg', 'lang-dark.svg'] },
      { cls: 'theme-svg', files: ['theme-light.svg', 'theme-dark.svg'] }
    ];

    // 4 состояния языка: активный 100%, неактивный 50%
    const states = ['lang-light-ru.svg', 'lang-light-en.svg',
                    'lang-dark-ru.svg',  'lang-dark-en.svg'];

    base.forEach(({ cls, files }) => {
      let ok = 0;
      files.forEach((f) => {
        const probe = new Image();
        probe.onload = () => {
          ok += 1;
          if (ok === files.length) document.documentElement.classList.add(cls);
        };
        probe.onerror = () => {};
        probe.src = UI + f;
      });
    });

    let sOk = 0;
    states.forEach((f) => {
      const probe = new Image();
      probe.onload = () => {
        sOk += 1;
        if (sOk === states.length) document.documentElement.classList.add('lang-states');
      };
      probe.onerror = () => {};
      probe.src = UI + f;
    });
  })();

  /* ============================================================
     ТЕКСТУРА ФОНА — включается, только если файл есть
     ============================================================ */
  (function texture() {
    const layer = document.querySelector('.fx__texture');
    if (!layer) return;
    const probe = new Image();
    probe.onload = () => layer.classList.add('is-ready');
    probe.onerror = () => { layer.style.backgroundImage = 'none'; };
    probe.src = 'assets/img/texture-light.png';
  })();

  /* ============================================================
     INIT
     ============================================================ */
  applyTheme(theme, false);
  applyLang(lang, false);

  // фильтр из URL
  const fparam = new URL(location.href).searchParams.get('filter');
  if (fparam && $('#archiveGrid')) { activeFilter = fparam; renderArchive(); }

  // deep-link на кейс
  const initialSlug = new URL(location.href).searchParams.get('project');
  if (initialSlug && byId(initialSlug) && modal) {
    const clean = new URL(location.href);
    clean.searchParams.delete('project');
    history.replaceState({}, '', clean);
    setTimeout(() => openModal(initialSlug, { push: true }), 60);
  }
})();

/* предзагрузка иконок соцкнопок (обычные и hover): без моргания при первом наведении */
(function preloadSocialIcons() {
  ['cv', 'dprofile', 'behance', 'telegram'].forEach((n) => {
    ['', '-hover'].forEach((s) => {
      const img = new Image();
      img.src = 'assets/img/icons/ui/' + n + s + '.svg';
      if (img.decode) img.decode().catch(() => {});
    });
  });
  ['mail', 'mail-hover'].forEach((n) => {
    const img = new Image();
    img.src = 'assets/img/icons/ui/' + n + '.svg';
    if (img.decode) img.decode().catch(() => {});
  });
})();

