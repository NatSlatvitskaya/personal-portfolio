/* =============================================================
   APP — логика интерфейса. Vanilla JS, без зависимостей.
   Модули: Lang · Render · Modal · Archive · About · Terminal · UI
   ============================================================= */
(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     STATE
     ============================================================ */
  const STORE_KEY = 'nnz.lang';
  let lang = localStorage.getItem(STORE_KEY) || 'ru';
  if (!I18N[lang]) lang = 'ru';

  const t = (key) => I18N[lang][key] ?? I18N.ru[key] ?? key;
  const tx = (obj) => (obj && (obj[lang] ?? obj.ru)) || '';
  const byId = (slug) => PROJECTS.find((p) => p.slug === slug);

  /* ============================================================
     LANG — переключение языка
     ============================================================ */
  function applyLang(next, persist = true) {
    lang = I18N[next] ? next : 'ru';
    if (persist) localStorage.setItem(STORE_KEY, lang);
    document.documentElement.lang = lang;

    // тексты по data-i18n / data-i18n-attr
    $$('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      const val = t(key);
      if (el.dataset.i18nHtml === 'true') el.innerHTML = val;
      else el.textContent = val;
    });

    $$('[data-i18n-attr]').forEach((el) => {
      // формат: "aria-label:key|title:key2"
      el.dataset.i18nAttr.split('|').forEach((pair) => {
        const [attr, key] = pair.split(':');
        if (attr && key) el.setAttribute(attr, t(key));
      });
    });

    $$('[data-i18n-title]').forEach((el) => {
      document.title = t(el.dataset.i18nTitle);
    });
    $$('[data-i18n-desc]').forEach((el) => {
      el.setAttribute('content', t(el.dataset.i18nDesc));
    });

    $$('.lang__btn').forEach((b) => {
      const on = b.dataset.lang === lang;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });

    renderProjects();
    renderArchive();
    renderAboutDynamics();
    if (modalState.slug) renderModalContent(byId(modalState.slug));
  }

  $$('.lang__btn').forEach((btn) => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });

  /* ============================================================
     PROJECT CARDS — главная
     ============================================================ */
  const RHYTHM = ['card-project--wide', '', 'card-project--tall', '', '', 'card-project--wide'];

  function cardHTML(p, i, variant) {
    const cardClass = variant === 'archive' ? 'archive-card' : 'card-project';
    const extra = variant === 'archive' ? '' : ' ' + (RHYTHM[i % RHYTHM.length] || '');
    const catLabel = t('cat.' + (Array.isArray(p.cat) ? p.cat[0] : p.cat));
    const media = variant === 'archive'
      ? `<div class="archive-card__media"><img src="${p.cover}" alt="${tx(p.title)}" loading="lazy" decoding="async" width="800" height="600"></div>`
      : `<div class="card-project__media">
           <img src="${p.cover}" alt="${tx(p.title)}" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async" width="1200" height="800">
           <span class="card-project__tag">${catLabel}</span>
           <span class="card-project__year">${p.year}</span>
         </div>`;

    if (variant === 'archive') {
      return `<button class="${cardClass}" data-slug="${p.slug}" type="button" aria-label="${tx(p.title)} — ${catLabel}">
        ${media}
        <div class="archive-card__body">
          <div class="archive-card__title">${tx(p.title)}</div>
          <div class="archive-card__row">
            <span class="archive-card__cat">${catLabel}</span>
            <span>${p.year}</span>
          </div>
        </div>
      </button>`;
    }

    return `<button class="${cardClass}${extra}" data-slug="${p.slug}" data-reveal type="button" aria-label="${tx(p.title)} — ${t('projects.open')}">
      <div class="card-project__bar">
        <span class="card-project__dots"><i></i><i></i><i></i></span>
        <span class="card-project__file">${p.slug}.case</span>
        <span class="card-project__idx">[${String(i + 1).padStart(2, '0')}]</span>
      </div>
      ${media}
      <div class="card-project__body">
        <div class="card-project__title">${tx(p.title)}</div>
        <div class="card-project__sub">${tx(p.subtitle)}</div>
        <span class="card-project__open">${t('projects.open')} →</span>
      </div>
    </button>`;
  }

  function renderProjects() {
    const host = $('#projectsGrid');
    if (!host) return;
    const featured = PROJECTS.filter((p) => p.featured).slice(0, 6);
    host.innerHTML = featured.map((p, i) => cardHTML(p, i, 'featured')).join('');
    observeReveal(host);
  }

  /* ============================================================
     ARCHIVE — фильтры
     ============================================================ */
  let activeFilter = 'all';

  function renderArchive() {
    const host = $('#archiveGrid');
    if (!host) return;

    const list = PROJECTS
      .filter((p) => activeFilter === 'all' || [].concat(p.cat).includes(activeFilter))
      .sort((a, b) => b.year - a.year);

    // счётчики в фильтрах
    $$('.filter').forEach((btn) => {
      const f = btn.dataset.filter;
      const n = f === 'all' ? PROJECTS.length : PROJECTS.filter((p) => [].concat(p.cat).includes(f)).length;
      const countEl = btn.querySelector('.filter__count');
      if (countEl) countEl.textContent = n;
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

    host.innerHTML = list.map((p, i) => cardHTML(p, i, 'archive')).join('');

    const cards = $$('.archive-card', host);
    cards.forEach((c, i) => {
      c.style.animationDelay = `${Math.min(i * 32, 260)}ms`;
      c.classList.add('is-entering');
    });
    observeReveal(host);
  }

  $$('.filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      $$('.filter').forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      renderArchive();
    });
  });

  /* ============================================================
     MODAL — кейс, с поддержкой ?project=slug
     ============================================================ */
  const modal = $('#modal');
  const modalScroll = $('#modalScroll');
  const modalState = { slug: null, trigger: null };

  function galleryHTML(p) {
    return p.images.map((src, i) => `
      <figure>
        <img src="${src}" alt="${tx(p.title)} — ${i + 1}" loading="lazy" decoding="async">
        <figcaption>${String(i + 1).padStart(2, '0')} / ${p.slug}</figcaption>
      </figure>`).join('');
  }

  function renderModalContent(p) {
    if (!p || !modal) return;
    const catLabel = [].concat(p.cat).map((c) => t('cat.' + c)).join(' · ');

    const bar = $('#modalBarTitle');
    if (bar) bar.textContent = `${p.slug}.case — ${tx(p.title)}`;

    const body = $('#modalBody');
    if (!body) return;

    body.innerHTML = `
      <div class="case">
        <div class="case__top">
          <div>
            <p class="mono" style="margin-bottom:10px">${catLabel} · ${p.year}</p>
            <h2 class="case__title" id="modalTitle">${tx(p.title)}</h2>
            <p class="case__desc">${tx(p.desc)}</p>
          </div>
          <dl class="case__meta">
            <div><dt>${t('modal.client')}</dt><dd>${tx(p.client)}</dd></div>
            <div><dt>${t('modal.year')}</dt><dd>${p.year}</dd></div>
            <div><dt>${t('modal.role')}</dt><dd>${tx(p.role)}</dd></div>
            <div><dt>${t('modal.cat')}</dt><dd>${catLabel}</dd></div>
          </dl>
        </div>
        <div class="case__actions">
          <a class="btn btn--solid" href="${p.external}" target="_blank" rel="noopener noreferrer">
            ${t('modal.more')}
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"/>
            </svg>
          </a>
          <button class="btn btn--ghost" type="button" data-close-modal>${t('modal.close')}</button>
          <span class="mono" style="align-self:center; margin-left:auto">${t('modal.more.note')}</span>
        </div>
      </div>
      <div class="case__gallery" aria-label="${t('modal.gallery')}">
        ${galleryHTML(p)}
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
      url.hash = '';
      history.pushState({ project: slug }, '', url);
    }

    // фокус — на кнопку закрытия
    requestAnimationFrame(() => {
      const closeBtn = $('[data-close-modal]');
      if (closeBtn) closeBtn.focus({ preventScroll: true });
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

  // делегирование клика по карточкам
  document.addEventListener('click', (e) => {
    const card = e.target.closest('[data-slug]');
    if (card) {
      e.preventDefault();
      openModal(card.dataset.slug, { trigger: card });
      return;
    }
    if (e.target.closest('[data-close-modal]')) closeModal();
  });

  // клик по фону
  $('#modalScrim')?.addEventListener('click', () => closeModal());

  // история: назад/вперёд
  window.addEventListener('popstate', () => {
    const slug = new URL(location.href).searchParams.get('project');
    if (slug && byId(slug)) openModal(slug, { push: false });
    else closeModal({ fromHistory: true });
  });

  /* ============================================================
     ABOUT — оверлей-окно
     ============================================================ */
  const aboutOverlay = $('#aboutOverlay');
  let aboutReturnFocus = null;

  function openAbout(trigger) {
    if (!aboutOverlay) return;
    aboutReturnFocus = trigger || document.activeElement;
    aboutOverlay.classList.add('is-open');
    aboutOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    requestAnimationFrame(() => {
      const closeBtn = aboutOverlay.querySelector('[data-close-about]');
      if (closeBtn) closeBtn.focus({ preventScroll: true });
    });
  }

  function closeAbout() {
    if (!aboutOverlay) return;
    aboutOverlay.classList.remove('is-open');
    aboutOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    if (aboutReturnFocus && document.contains(aboutReturnFocus)) {
      aboutReturnFocus.focus({ preventScroll: true });
    }
  }

  $$('[data-open-about]').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeMobileNav();
      openAbout(btn);
    });
  });
  $$('[data-close-about]').forEach((btn) => btn.addEventListener('click', closeAbout));
  $('#aboutScrim')?.addEventListener('click', closeAbout);

  // соцсети + контакты
  function renderAboutDynamics() {
    const mail = $('#contactEmail');
    if (mail) {
      mail.href = `mailto:${CONTACTS.email}`;
      mail.textContent = CONTACTS.email;
    }
  }
  $$('[data-contact]').forEach((a) => {
    const k = a.dataset.contact;
    if (CONTACTS[k]) a.href = CONTACTS[k];
  });

  /* ============================================================
     ESC — глобальное закрытие
     ============================================================ */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (terminal?.classList.contains('is-open')) return closeTerminal();
      if (modal?.classList.contains('is-open')) return closeModal();
      if (aboutOverlay?.classList.contains('is-open')) return closeAbout();
      closeMobileNav();
    }
    // фокус-trap внутри открытых окон
    if (e.key === 'Tab') trapFocus(e);
  });

  function trapFocus(e) {
    const host = modal?.classList.contains('is-open') ? modal
      : aboutOverlay?.classList.contains('is-open') ? aboutOverlay
      : terminal?.classList.contains('is-open') ? terminal
      : null;
    if (!host) return;

    const focusables = $$(
      'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      host
    ).filter((el) => el.offsetParent !== null);
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  /* ============================================================
     MOBILE NAV
     ============================================================ */
  const burger = $('#burger');
  const mobileNav = $('#mobileNav');

  function closeMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove('is-open');
    burger?.setAttribute('aria-expanded', 'false');
  }

  burger?.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });

  $$('#mobileNav a').forEach((a) => a.addEventListener('click', closeMobileNav));

  /* ============================================================
     CLOCK — реальное время в таскбаре
     ============================================================ */
  function tickClock() {
    const el = $('#clock');
    if (!el) return;
    const d = new Date();
    el.textContent = d.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-GB', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ============================================================
     REVEAL — IntersectionObserver
     ============================================================ */
  const revealObserver = reduceMotion ? null : new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  function observeReveal(root) {
    if (!revealObserver) {
      $$('[data-reveal]', root).forEach((el) => el.classList.add('is-in'));
      return;
    }
    $$('[data-reveal]', root).forEach((el, i) => {
      if (el.classList.contains('is-in')) return;
      el.style.setProperty('--d', `${Math.min(i * 50, 320)}ms`);
      revealObserver.observe(el);
    });
  }

  $$('[data-reveal]').forEach((el, i) => {
    el.style.setProperty('--d', `${Math.min(i * 50, 320)}ms`);
    if (!revealObserver) el.classList.add('is-in');
    else revealObserver.observe(el);
  });

  /* ============================================================
     TERMINAL — пасхалка
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
    document.body.classList.add('is-locked');
    if (termOut && !termOut.dataset.init) {
      termOut.dataset.init = '1';
      termPrint('nnz://portfolio v1.0 — Y2K build', 'ok');
      termPrint(t('term.hint'), 'dim');
    }
    setTimeout(() => termField?.focus({ preventScroll: true }), 120);
  }

  function closeTerminal() {
    terminal?.classList.remove('is-open');
    document.body.classList.remove('is-locked');
  }

  $$('[data-open-terminal]').forEach((el) => el.addEventListener('click', openTerminal));
  $('#termClose')?.addEventListener('click', closeTerminal);

  function runCommand(raw) {
    const cmd = raw.trim().toLowerCase();
    termPrint(`> ${raw}`, 'dim');
    if (!cmd) return;

    switch (cmd) {
      case 'help':
        termPrint(t('term.help'), 'ok');
        break;
      case 'about':
        closeTerminal(); openAbout($('#aboutBtn'));
        break;
      case 'projects':
        closeTerminal();
        $('#projects')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
        break;
      case 'archive':
        location.href = 'archive.html';
        break;
      case 'cv':
        window.open(CONTACTS.cv, '_blank', 'noopener');
        termPrint('opening cv…', 'ok');
        break;
      case 'contact':
        window.location.href = `mailto:${CONTACTS.email}`;
        termPrint(CONTACTS.email, 'ok');
        break;
      case 'clear':
        termOut.innerHTML = '';
        break;
      default:
        termPrint(`${t('term.unknown')}: ${cmd}`, 'warn');
    }
  }

  termField?.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    runCommand(termField.value);
    termField.value = '';
  });

  // скрытая команда: Ctrl/Cmd + K
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      terminal?.classList.contains('is-open') ? closeTerminal() : openTerminal();
    }
  });

  /* ============================================================
     INIT
     ============================================================ */
  applyLang(lang, false);
  renderAboutDynamics();

  // авто-открытие кейса по прямой ссылке.
  // Приём: текущая запись истории превращается в «чистую» (без ?project),
  // поверх неё кладём запись с кейсом. Тогда «назад» закрывает модалку,
  // а не выкидывает посетителя со страницы.
  const initialSlug = new URL(location.href).searchParams.get('project');
  if (initialSlug && byId(initialSlug)) {
    const clean = new URL(location.href);
    clean.searchParams.delete('project');
    history.replaceState({}, '', clean);
    setTimeout(() => openModal(initialSlug, { push: true }), 60);
  }
})();
