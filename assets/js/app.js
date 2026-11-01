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
      : `<span class="acard__empty">${title}</span>`;

    return `<button class="acard" type="button" data-slug="${p.slug}"
              aria-label="${title} — ${cat} ${p.year}">
      <span class="acard__media">${media}</span>
      <span class="acard__body">
        <span class="acard__title">${title}</span>
        <span class="acard__year">${p.year}</span>
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
  const messages = ['phone.msg1', 'phone.msg2', 'phone.msg3', 'phone.msg4'];
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
    const text = t(messages[msgIndex]);
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

    $$('.lang__btn, [data-lang]').forEach((b) => {
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

  $$('.lang__btn, [data-lang]').forEach((btn) => {
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
      termPrint('nnz://portfolio v1.0 — Y2K build', 'ok');
      termPrint(t('term.hint'), 'dim');
    }
    setTimeout(() => termField?.focus({ preventScroll: true }), 90);
  }

  function closeTerminal() {
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
      case 'help':     termPrint(t('term.help'), 'ok'); break;
      case 'projects': closeTerminal(); break;
      case 'archive':  closeTerminal(); location.href = 'archive.html'; break;
      case 'cv':       window.open(CONTACTS.cv, '_blank', 'noopener'); termPrint('opening cv…', 'ok'); break;
      case 'contact':  location.href = `mailto:${CONTACTS.email}`; break;
      case 'theme':    applyTheme(theme === 'dark' ? 'light' : 'dark'); termPrint(theme, 'ok'); break;
      case 'clear':    termOut.innerHTML = ''; break;
      default:         termPrint(`${t('term.unknown')}: ${cmd}`, 'warn');
    }
  }

  termField?.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    runCommand(termField.value);
    termField.value = '';
  });

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
