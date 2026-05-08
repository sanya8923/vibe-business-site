/* ═══════════════════════════════════════════════════════════════
   Automate At — Platform shell
   Инжектит sidebar (collapsible) + subscription banner + mobile UI.
   Не зависит от /rag-agent/ shared.js (та автоматически инжектит свой
   header/footer для rag-agent pages — здесь нам не нужен).

   Использование на странице:
     <body class="aa-platform" data-aa-page="dashboard">
       <div class="aa-shell">
         <main class="aa-main"><div class="aa-main-inner">…контент…</div></main>
       </div>
       <script src="/automate-at/assets/shell.js"></script>
     </body>

   `data-aa-page` определяет какой пункт sidebar активен.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Lucide-style SVGs (inline, минимальный набор) ─────────
  const ICON = {
    home: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    target: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    wrench: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
    list: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',
    book: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',
    creditCard: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>',
    settings: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
    chevronLeft: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    sun: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
    moon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    menu: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>',
    x: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    alert: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    play: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="6 3 20 12 6 21"/></svg>',
    arrowRight: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>'
  };

  // ─── Sidebar nav configuration ──────────────────────────────
  const NAV_SECTIONS = [
    {
      label: 'Обучение',
      items: [
        { id: 'dashboard', label: 'Главная',  href: '/automate-at/dashboard/', icon: ICON.home },
        { id: 'courses',   label: 'Курсы',    href: '/automate-at/courses/',   icon: ICON.target,
          sub: 'тренажёр' },
        { id: 'products',  label: 'Продукты', href: '/automate-at/products/',  icon: ICON.wrench,
          sub: 'каталог решений' }
      ]
    },
    {
      label: 'Работа',
      items: [
        { id: 'tasks',     label: 'Задачи',      href: '/automate-at/tasks/',     icon: ICON.list },
        { id: 'knowledge', label: 'База знаний', href: '/automate-at/knowledge/', icon: ICON.book }
      ]
    },
    {
      label: 'Аккаунт',
      items: [
        { id: 'billing',  label: 'Подписка',  href: '/automate-at/billing/',  icon: ICON.creditCard },
        { id: 'settings', label: 'Настройки', href: '/automate-at/settings/', icon: ICON.settings }
      ]
    }
  ];

  // ─── Utils ───────────────────────────────────────────────────
  const $ = (sel, root) => (root || document).querySelector(sel);
  function escapeHtml(text) {
    if (text == null) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  // ─── Sidebar render ─────────────────────────────────────────
  function renderSidebar(activeId) {
    const sidebar = document.createElement('aside');
    sidebar.className = 'aa-sidebar';
    if (localStorage.getItem('aa-sidebar-collapsed') === '1') {
      sidebar.classList.add('is-collapsed');
    }

    const sectionsHtml = NAV_SECTIONS.map(sec => {
      const itemsHtml = sec.items.map(item => {
        const isActive = item.id === activeId;
        return `
          <a class="aa-sidebar-nav-item${isActive ? ' is-active' : ''}"
             href="${item.href}" data-nav-id="${item.id}">
            <span class="aa-sidebar-nav-item-icon">${item.icon}</span>
            <span class="aa-sidebar-nav-item-label">${escapeHtml(item.label)}</span>
          </a>`;
      }).join('');
      return `
        <div class="aa-sidebar-nav-section-label">${escapeHtml(sec.label)}</div>
        ${itemsHtml}`;
    }).join('');

    sidebar.innerHTML = `
      <a class="aa-sidebar-brand" href="/automate-at/dashboard/">
        <div class="aa-sidebar-brand-mark">aa</div>
        <div class="aa-sidebar-brand-text">
          <span class="aa-sidebar-brand-name">Automate At</span>
          <span class="aa-sidebar-brand-sub">Profy Conveyor</span>
        </div>
      </a>
      <button class="aa-sidebar-collapse-btn" type="button" aria-label="Свернуть">
        ${ICON.chevronLeft}
      </button>
      <nav class="aa-sidebar-nav">${sectionsHtml}</nav>
      <div class="aa-sidebar-bottom">
        <button class="aa-sidebar-bottom-row" type="button" data-action="theme-toggle" aria-label="Сменить тему">
          ${ICON.moon}<span>Тёмная тема</span>
        </button>
        <div class="aa-user-card">
          <div class="aa-user-avatar">A</div>
          <div class="aa-user-info">
            <span class="aa-user-name">Александр</span>
            <span class="aa-user-role">студент</span>
          </div>
        </div>
      </div>`;
    return sidebar;
  }

  // ─── Mobile topbar render ───────────────────────────────────
  function renderMobileTopbar() {
    const bar = document.createElement('div');
    bar.className = 'aa-mobile-topbar';
    bar.innerHTML = `
      <button class="aa-mobile-burger" type="button" aria-label="Открыть меню" data-action="mobile-open">
        ${ICON.menu}
      </button>
      <div class="aa-mobile-brand">
        <div class="aa-sidebar-brand-mark" style="width:28px;height:28px;border-radius:6px;font-size:11px;">aa</div>
        Automate At
      </div>
      <button class="aa-mobile-burger" type="button" aria-label="Профиль">A</button>`;
    return bar;
  }

  // ─── Subscription banner ────────────────────────────────────
  // states: free | active | active-warn | past_due | expired | onboarding | onboarding-failed
  const BANNER_PRESETS = {
    free: {
      type: 'info',
      icon: ICON.info,
      title: 'Открой все курсы',
      text: 'Подписка снимает ограничения — большинство задач становятся доступны.',
      cta: { label: 'Оформить подписку', href: '/automate-at/billing/' }
    },
    'active-warn': {
      type: 'warn',
      icon: ICON.alert,
      title: 'Подписка истекает через 5 дней',
      text: 'Продли заранее, чтобы не потерять доступ к задачам и ревью.',
      cta: { label: 'Продлить', href: '/automate-at/billing/' }
    },
    past_due: {
      type: 'error',
      icon: ICON.alert,
      title: 'Подписка истекла',
      text: 'Доступ есть ещё 7 дней — продли, чтобы не потерять прогресс.',
      cta: { label: 'Продлить', href: '/automate-at/billing/' }
    },
    expired: {
      type: 'error',
      icon: ICON.alert,
      title: 'Подписка закончилась',
      text: 'Открой её снова — продолжишь с той задачи, на которой остановился.',
      cta: { label: 'Оформить', href: '/automate-at/billing/' }
    },
    onboarding: {
      type: 'info',
      icon: ICON.info,
      title: 'Готовлю тебе n8n',
      text: 'Займёт минут 5. Пока почитай вводный модуль.',
      cta: { label: 'Открыть M0', href: '/automate-at/courses/' }
    },
    'onboarding-failed': {
      type: 'error',
      icon: ICON.alert,
      title: 'Что-то сломалось при настройке',
      text: 'Напиши в поддержку — починим. Прогресс не потеряется.',
      cta: { label: 'Открыть Telegram', href: 'https://t.me/profy_conveyor' }
    }
  };

  function renderSubscriptionBanner(state) {
    const preset = BANNER_PRESETS[state];
    if (!preset) return null;
    const banner = document.createElement('div');
    banner.className = `aa-subscription-banner is-${preset.type}`;
    banner.dataset.bannerState = state;
    banner.innerHTML = `
      <div class="aa-subscription-banner-icon">${preset.icon}</div>
      <div class="aa-subscription-banner-body">
        <div class="aa-subscription-banner-title">${escapeHtml(preset.title)}</div>
        <div class="aa-subscription-banner-text">${escapeHtml(preset.text)}</div>
      </div>
      ${preset.cta ? `
        <div class="aa-subscription-banner-cta">
          <a class="btn btn-primary btn-sm" href="${preset.cta.href}">${escapeHtml(preset.cta.label)}</a>
        </div>` : ''}
      <button class="aa-subscription-banner-close" type="button" aria-label="Закрыть" data-action="dismiss-banner">${ICON.x}</button>`;
    return banner;
  }

  // ─── Theme ───────────────────────────────────────────────────
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('aa-theme', theme);
  }
  function initTheme() {
    const saved = localStorage.getItem('aa-theme') || 'dark';
    applyTheme(saved);
  }

  // ─── Favicon injection ──────────────────────────────────────
  function ensureFavicon() {
    if (document.querySelector('link[rel="icon"]')) return;
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = '/automate-at/assets/favicon.svg';
    document.head.appendChild(link);
  }

  // ─── Boot ────────────────────────────────────────────────────
  function init() {
    if (document.documentElement.dataset.aaShellInjected === '1') return;
    document.documentElement.dataset.aaShellInjected = '1';

    ensureFavicon();
    initTheme();

    const shell = document.querySelector('.aa-shell');
    if (!shell) {
      console.warn('[aa-shell] .aa-shell not found — sidebar not injected');
      return;
    }

    const activeId = document.body.dataset.aaPage || '';
    const sidebar = renderSidebar(activeId);
    shell.insertBefore(sidebar, shell.firstChild);

    // backdrop for mobile
    const backdrop = document.createElement('div');
    backdrop.className = 'aa-sidebar-backdrop';
    shell.appendChild(backdrop);

    // mobile topbar
    const main = shell.querySelector('.aa-main');
    if (main) {
      const topbar = renderMobileTopbar();
      main.insertBefore(topbar, main.firstChild);
    }

    // subscription banner — query param ?banner=<state> drives demo
    const bannerState = getQueryParam('banner');
    if (bannerState) {
      const banner = renderSubscriptionBanner(bannerState);
      if (banner && main) {
        const inner = main.querySelector('.aa-main-inner');
        const target = inner || main;
        target.insertBefore(banner, target.firstChild);
      }
    }

    initInlineArticleVideos();

    // Event delegation
    document.addEventListener('click', (e) => {
      const collapseBtn = e.target.closest('.aa-sidebar-collapse-btn');
      if (collapseBtn) {
        sidebar.classList.toggle('is-collapsed');
        localStorage.setItem('aa-sidebar-collapsed',
          sidebar.classList.contains('is-collapsed') ? '1' : '0');
        return;
      }
      const mobileOpen = e.target.closest('[data-action="mobile-open"]');
      if (mobileOpen) {
        sidebar.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        return;
      }
      if (e.target.closest('.aa-sidebar-backdrop')) {
        sidebar.classList.remove('is-open');
        document.body.style.overflow = '';
        return;
      }
      const navItem = e.target.closest('.aa-sidebar-nav-item');
      if (navItem && sidebar.classList.contains('is-open')) {
        sidebar.classList.remove('is-open');
        document.body.style.overflow = '';
        // не возвращаемся — позволяем обычной навигации сработать
      }
      const themeToggle = e.target.closest('[data-action="theme-toggle"]');
      if (themeToggle) {
        const cur = document.documentElement.dataset.theme || 'dark';
        applyTheme(cur === 'dark' ? 'light' : 'dark');
        return;
      }
      const dismiss = e.target.closest('[data-action="dismiss-banner"]');
      if (dismiss) {
        const banner = dismiss.closest('.aa-subscription-banner');
        if (banner) banner.remove();
        return;
      }
      const copyBtn = e.target.closest('.aa-code-copy-btn');
      if (copyBtn) {
        const targetId = copyBtn.dataset.copyTarget;
        const source = targetId ? document.getElementById(targetId) : copyBtn.closest('.aa-setup-step-curl')?.querySelector('pre');
        if (!source) return;
        navigator.clipboard.writeText(source.innerText).then(() => {
          const label = copyBtn.querySelector('.aa-code-copy-btn-label');
          const orig = label ? label.textContent : '';
          if (label) label.textContent = 'Скопировано!';
          copyBtn.classList.add('is-copied');
          setTimeout(() => {
            if (label) label.textContent = orig;
            copyBtn.classList.remove('is-copied');
          }, 2000);
        });
        return;
      }
    });
  }

  // ─── Inline article videos ──────────────────────────────────
  // Usage: add data-video="YOUTUBE_ID" to <details class="aa-inline-article">
  // JS injects iframe lazily (on open) + adds ▶ видео badge to summary.
  function initInlineArticleVideos() {
    document.querySelectorAll('.aa-inline-article[data-video]').forEach(article => {
      const vid = escapeHtml(article.dataset.video);
      if (!vid) return;

      // Badge in summary
      const arrow = article.querySelector('.aa-inline-article-arrow');
      const badge = document.createElement('span');
      badge.className = 'aa-inline-article-video-badge';
      badge.textContent = '▶ видео';
      if (arrow) arrow.before(badge);

      // Video container — inject before article body content
      const body = article.querySelector('.aa-inline-article-body');
      if (!body) return;

      const wrap = document.createElement('div');
      wrap.className = 'aa-inline-article-video is-embed';
      const iframe = document.createElement('iframe');
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('loading', 'lazy');
      wrap.appendChild(iframe);
      body.prepend(wrap);

      // Load iframe src only when article is opened (avoid network requests on page load)
      article.addEventListener('toggle', function onToggle() {
        if (article.open && !iframe.src) {
          iframe.src = `https://www.youtube.com/embed/${vid}?rel=0&modestbranding=1`;
        }
      });
    });
  }

  // ─── Public API for pages ────────────────────────────────────
  window.AaShell = {
    ICON,
    escapeHtml,
    getQueryParam,
    renderSubscriptionBanner
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
