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

  function renderModalContent(p) {
    if (!p || !modal) return;
    const cat = t('cat.' + p.cat);
    const title = tx(p.full || p.title);

    const bar = $('#modalBarTitle');
    if (bar) bar.textContent = `${p.slug}.case`;

    const body = $('#modalBody');
    if (!body) return;

    body.innerHTML = `
      <div class="case">
        <div class="case__top">
          <div>
            <p class="case__cat">${cat} · ${p.year}</p>
            <h2 class="case__title" id="modalTitle">${title}</h2>
            <p class="case__desc">${tx(p.desc)}</p>
          </div>
          <dl class="case__meta">
            <div><dt>${t('modal.client')}</dt><dd>${cat}</dd></div>
            <div><dt>${t('modal.year')}</dt><dd>${p.year}</dd></div>
          </dl>
        </div>
        <div class="case__actions">
          <a class="pill pill--accent" href="${p.external}" target="_blank" rel="noopener noreferrer">
            ${t('modal.more')}
          </a>
          <button class="pill pill--ghost" type="button" data-close-modal>${t('modal.close')}</button>
          <span class="mono" style="margin-left:auto">${t('modal.note')}</span>
        </div>
      </div>
      <div class="case__gallery">${galleryHTML(p)}</div>`;
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
      case 'clear':    termOut.innerHTML = ''; rebuildAll(); break;
      case 'hack_nat': hackRun(); break;
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
     ИНТЕРАКТИВНЫЕ РЕЖИМЫ: hack_nat · destruct · geek
     ============================================================ */

  let geekState = null;
  let geekRain = null;
  let hackRain = null;
  let countTimer = null;


  /* ============================================================
     ДОЖДЬ ИЗ КОДА — canvas-движок для hack_nat и geek
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
     1. hack_nat — пиксельное окно взлома
     ------------------------------------------------------------ */

  const HACK_LOGS = [
    'Downloading project_1.svg... <b>100%</b>',
    'Accessing archive databases... <b>OK</b>',
    'Bypassing firewall... <b>Success</b>',
    'Mapping nnz.studio nodes... <b>14</b>',
    'Downloading project_2.svg... <b>100%</b>',
    'Decrypting brand_assets.zip... <b>OK</b>',
    'Injecting payload into /css/tune.css... <b>200</b>',
    'Accessing archive databases... <i>retry</i>',
    'Enumerating subdomains... <b>7</b>',
    'Downloading project_3.svg... <b>100%</b>',
    'Spoofing handshake token... <b>Success</b>',
    'Reading /js/i18n.js ... <b>6 KB</b>',
    'Bypassing firewall... <b>Success</b>',
    'Downloading project_4.svg... <b>100%</b>',
    'Escalating privileges... <i>root</i>',
    'Traversing /assets/img ... <b>142 files</b>',
    'Overwriting gravity.js ... <b>OK</b>',
    'Downloading project_5.svg... <b>100%</b>',
    'Compiling neon_shader.wasm ... <b>OK</b>',
    'Accessing archive databases... <b>Success</b>',
    'Downloading project_6.svg... <b>100%</b>',
    'Disabling motion guards ... <b>OK</b>',
    'Bypassing firewall... <b>Success</b>',
    'Downloading project_7.svg... <b>100%</b>',
    'Cloning repository nnz/portfolio ... <b>OK</b>',
    'Downloading project_8.svg... <b>100%</b>',
    'Rendering silhouette ... <b>blur(2px)</b>',
    'Accessing archive databases... <b>Success</b>',
    'Exfiltrating palette.json ... <b>OK</b>',
    'Downloading design-word-on.svg... <b>100%</b>',
    'Patching drop-shadow ... <b>#FAD9FF</b>',
    'Downloading phone.png ... <b>100%</b>',
    'Bypassing firewall... <b>Success</b>',
    'Injecting terminal hook ... <b>OK</b>',
    'Compiling finale ... <b>Done</b>'
  ];

  /* глифы для дождя — катакана, цифры, обрывки кода */
  const RAIN_GLYPHS =
    'アイウエオカキクケコサシスセソタチツテト' +
    'ナニヌネノハヒフヘホマミムメモヤユヨラリ' +
    '0123456789ABCDEF{}[]<>/*+-=$#';

  /* ------------------------------------------------------------
     ПИКСЕЛЬНЫЙ РАСПАД — элементы сайта рассыпаются на квадраты
     и поднимаются вверх пылью. Без затемнения фона.
     ------------------------------------------------------------ */
  function pixelDecay(delay, span) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return { restore() {} };

    const DUST_PALETTE = ['#242424', '#11FFB0', '#FFFFFF', '#BA71FF', '#0B3A2C'];
    const TARGETS = '.screen > .topbar, .screen > .footbar, .stage .card, .stage .phone, .stage .design-on';

    let els = $$(TARGETS).filter((el) => el.getBoundingClientRect().width > 0);
    for (let k = els.length - 1; k > 0; k -= 1) {          /* хаотичный порядок */
      const j = (Math.random() * (k + 1)) | 0;
      [els[k], els[j]] = [els[j], els[k]];
    }
    const rects = els.map((el) => el.getBoundingClientRect());
    const area = rects.reduce((s, r) => s + r.width * r.height, 0);
    const cell = Math.max(7, Math.round(Math.sqrt(area / 5000)));

    const canvas = document.createElement('canvas');
    canvas.className = 'nnz-dust';
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cells = [];
    const timers = [];
    els.forEach((el, idx) => {
      const r = rects[idx];
      const t0 = delay + (idx / els.length) * span;         /* волна по элементам */
      timers.push(setTimeout(() => { el.style.visibility = 'hidden'; }, t0));
      for (let y = r.top; y < r.bottom; y += cell) {
        for (let x = r.left; x < r.right; x += cell) {
          cells.push({
            x, y, s: cell - 1,
            t: t0 + Math.random() * 180,
            life: 380 + Math.random() * 480,
            c: DUST_PALETTE[(Math.random() * DUST_PALETTE.length) | 0],
            drift: -(0.04 + Math.random() * 0.12),
            sway: (Math.random() - 0.5) * 0.05
          });
        }
      }
    });

    const begin = performance.now();
    const finish = delay + span + 900;
    let raf = 0;
    let alive = true;

    const frame = (now) => {
      if (!alive) return;
      const t = now - begin;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let n = 0; n < cells.length; n += 1) {
        const c = cells[n];
        const age = t - c.t;
        if (age < 0 || age > c.life) continue;
        ctx.globalAlpha = 1 - age / c.life;
        ctx.fillStyle = c.c;
        ctx.fillRect(c.x + c.sway * age, c.y + c.drift * age, c.s, c.s);
      }
      ctx.globalAlpha = 1;
      if (t < finish) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return {
      restore() {
        alive = false;
        cancelAnimationFrame(raf);
        timers.forEach((id) => clearTimeout(id));
        els.forEach((el) => { el.style.visibility = ''; });
        canvas.remove();
      }
    };
  }

  function hackRun() {
    if (!termOut || document.querySelector('.nnz-fx')) return;

    /* --- 1. глитч-тряска сайта --- */
    document.body.classList.add('is-hacking');
    setTimeout(() => document.body.classList.remove('is-hacking'), 900);

    /* --- 2. захват: код-дождь, логотип по центру, окно логов сбоку --- */
    const fx = document.createElement('div');
    fx.className = 'nnz-fx is-hack';
    fx.innerHTML =
      '<canvas class="nnz-rain" aria-hidden="true"></canvas>' +
      '<div class="nnz-hacklogo"><img src="assets/img/logo-nat.png" alt="" aria-hidden="true"></div>' +
      '<div class="nnz-win">' +
        '<div class="nnz-win__bar">' +
          '<span class="nnz-win__dots"><i></i><i></i><i></i></span>' +
          '<span>CRITICAL ERROR: SYSTEM COMPROMISED</span>' +
        '</div>' +
        '<div class="nnz-win__body">' +
          '<div class="nnz-log" id="nnzLog"></div>' +
          '<div class="nnz-grant" id="nnzGrant">ACCESS GRANTED</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(fx);
    requestAnimationFrame(() => fx.classList.add('is-on'));

    hackRain = createRain(fx.querySelector('.nnz-rain'), {
      font: '"Silkscreen", "JetBrains Mono", monospace',
      size: 16,
      color: 'rgba(17, 255, 176, 0.85)',
      head: '#D6FFEE',
      fade: 0.075,
      glyphs: RAIN_GLYPHS
    });

    /* --- 3. распад интерфейса в пиксели --- */
    const decay = pixelDecay(1100, 1500);

    /* --- 4. логотип дергается в такт строкам лога --- */
    const logoWrap = fx.querySelector('.nnz-hacklogo');
    const logoImg = logoWrap.querySelector('img');
    const beat = (hard) => {
      logoImg.classList.remove('is-beat', 'is-hard');
      void logoImg.offsetWidth;
      logoImg.classList.add(hard ? 'is-hard' : 'is-beat');

      logoWrap.classList.remove('is-split');
      void logoWrap.offsetWidth;
      logoWrap.classList.add('is-split');
      setTimeout(() => logoWrap.classList.remove('is-split'), 110);
    };

    const logEl = fx.querySelector('#nnzLog');
    const grant = fx.querySelector('#nnzGrant');

    let i = 0;
    const logTimer = setInterval(() => {
      if (i >= HACK_LOGS.length) { clearInterval(logTimer); return; }
      const raw = HACK_LOGS[i];
      const line = document.createElement('div');
      line.innerHTML = '&gt; ' + raw;
      logEl.appendChild(line);
      logEl.scrollTop = logEl.scrollHeight;
      beat(raw.includes('<i>'));                 /* <i> — красные строки «retry / root» */
      i += 1;
    }, 78);

    /* --- 5. финал: вспышка логотипа, ACCESS GRANTED, перезагрузка --- */
    setTimeout(() => logoWrap.classList.add('is-flare'), 3450);
    setTimeout(() => grant.classList.add('is-on'), 3750);

    setTimeout(() => {
      clearInterval(logTimer);
      fx.classList.add('is-out');

      if (hackRain) { hackRain.stop(); hackRain = null; }

      const flash = document.createElement('div');
      flash.className = 'nnz-flash';
      document.body.appendChild(flash);
      requestAnimationFrame(() => flash.classList.add('is-on'));

      document.body.classList.add('is-rebooting');
      setTimeout(() => document.body.classList.remove('is-rebooting'), 1000);

      setTimeout(() => flash.remove(), 1100);
      setTimeout(() => fx.remove(), 420);
      setTimeout(() => decay.restore(), 300);   /* элементы возвращаются под вспышкой */
      termPrint('Done. Website optimized.', 'ok');
    }, 5150);
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

    let done = false;

    function hide() {
      if (done) return;
      done = true;
      el.classList.add('is-out');
      setTimeout(() => { el.style.display = 'none'; }, 460);
      document.body.classList.remove('is-preloading');
    }

    document.body.classList.add('is-preloading');

    /* ждём телефон и щупальца — самые тяжёлые картинки */
    const heavy = [...document.querySelectorAll('.phone__img, .design-on')];
    const waits = heavy.map((img) => new Promise((res) => {
      if (img.complete && img.naturalWidth > 0) return res();
      img.addEventListener('load', res, { once: true });
      img.addEventListener('error', res, { once: true });
    }));

    const ready = Promise.all(waits);
    const minDelay = new Promise((res) => setTimeout(res, 900));   /* показать логотип */
    const timeout = new Promise((res) => setTimeout(res, 6000));   /* страховка */

    Promise.race([Promise.all([ready, minDelay]), timeout]).then(() => {
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
