(() => {
  const root = document.documentElement;
  root.classList.add('js');
  if ('ResizeObserver' in window) {
    new ResizeObserver(entries => {
      root.style.setProperty('--header-height', `${Math.ceil(entries[0].target.getBoundingClientRect().height)}px`);
    }).observe(document.querySelector('.site-header'));
  }
  const themeButton = document.querySelector('.theme-toggle');
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-nav');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let manualTheme = false;
  try { manualTheme = ['light', 'dark'].includes(localStorage.getItem('ar-theme')); } catch { /* Optional preference. */ }

  function syncThemeButton() {
    const dark = root.dataset.theme === 'dark';
    themeButton.setAttribute('aria-pressed', String(dark));
    themeButton.setAttribute('aria-label', dark ? 'Activar modo claro' : 'Activar modo oscuro');
    themeButton.title = dark ? 'Modo claro' : 'Modo oscuro';
  }
  themeButton.hidden = false;
  menuButton.hidden = false;
  syncThemeButton();
  themeButton.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    manualTheme = true;
    try { localStorage.setItem('ar-theme', root.dataset.theme); } catch { /* No persistence available. */ }
    syncThemeButton();
  });
  systemTheme.addEventListener('change', event => {
    if (!manualTheme) {
      root.dataset.theme = event.matches ? 'dark' : 'light';
      syncThemeButton();
    }
  });

  function setMenu(open, returnFocus = false) {
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.classList.toggle('is-open', open);
    if (returnFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false, true);
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) setMenu(false);
  });
  window.matchMedia('(min-width: 1061px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

  // Reveal collapsed content before navigating to a deep link (including on initial load).
  function revealTarget(hash) {
    if (!hash || hash === '#') return null;
    let id;
    try { id = decodeURIComponent(hash.slice(1)); } catch { return null; }
    const target = document.getElementById(id);
    if (!target) return null;
    for (let parent = target.parentElement; parent; parent = parent.parentElement) {
      if (parent.tagName === 'DETAILS') parent.open = true;
    }
    return target;
  }
  document.querySelectorAll('a[href]').forEach(link => link.addEventListener('click', () => {
    if (link.origin !== location.origin || link.pathname !== location.pathname) { setMenu(false); return; }
    const target = revealTarget(link.hash);
    const inMobileMenu = !!link.closest('#mobile-nav');
    setMenu(false);
    if (inMobileMenu && target) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  }));
  function handleHash() {
    const target = revealTarget(location.hash);
    if (target) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  }
  window.addEventListener('hashchange', handleHash);
  // Keep links shared before the portfolio was split into pages working.
  if (root.querySelector('body').dataset.page === 'home' && location.hash) {
    const id = location.hash.slice(1);
    if (/^(experience|teaching|education|skills|exp-[a-z-]+)$/.test(id)) location.replace(`cv.html#${id}`);
    else if (id.startsWith('project-') && !document.getElementById(id)) location.replace(`projects.html#${id}`);
    else handleHash();
  } else if (location.hash) handleHash();

  const filters = document.querySelector('.project-filters');
  if (filters) {
    const cards = [...document.querySelectorAll('.catalog-grid .portfolio-card')];
    const buttons = [...filters.querySelectorAll('button[data-filter]')];
    const status = document.querySelector('.filter-status');
    const selectFilter = value => {
      let count = 0;
      cards.forEach(card => {
        const match = value === 'all' || (value === 'esan' ? card.querySelector('.small-label').textContent.includes('ESAN') : card.dataset.category === value);
        card.hidden = !match;
        if (match) count++;
      });
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === value)));
      status.textContent = `${count} ${count === 1 ? 'ficha' : 'fichas'} · ${buttons.find(button => button.dataset.filter === value).textContent}`;
    };
    filters.hidden = false;
    buttons.forEach(button => button.addEventListener('click', () => {
      selectFilter(button.dataset.filter);
      if (location.hash) history.replaceState(null,'',location.pathname+location.search);
    }));
    const applyHash = () => selectFilter(location.hash === '#esan' ? 'esan' : 'all');
    applyHash();
    window.addEventListener('hashchange', applyHash);
  }

  document.querySelectorAll('[data-load-video]').forEach(button => button.addEventListener('click', () => {
    const box = button.closest('[data-video-src]');
    const frame = document.createElement('iframe');
    frame.src = box.dataset.videoSrc;
    frame.title = box.dataset.videoTitle;
    frame.className = 'video-frame';
    frame.allow = 'fullscreen; picture-in-picture';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    box.replaceWith(frame);
  }));

  if ('IntersectionObserver' in window) {
    const sections = [...document.querySelectorAll('main > section[id]')];
    const links = [...document.querySelectorAll('.desktop-nav a')];
    const observer = new IntersectionObserver(entries => {
      const visible = entries.find(entry => entry.isIntersecting);
      if (!visible) return;
      links.forEach(link => {
        if (link.getAttribute('aria-current') === 'page') return;
        if (document.body.dataset.page === 'home' && link.hash === `#${visible.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-15% 0px -65% 0px' });
    sections.forEach(section => observer.observe(section));
  }
})();
