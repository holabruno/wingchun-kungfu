(() => {
  // ---------- Helpers ----------
  const $ = (sel) => document.querySelector(sel);
  const $all = (sel) => Array.from(document.querySelectorAll(sel));
  const get = (obj, path) => path.split('.').reduce((a,k) => (a && k in a) ? a[k] : undefined, obj);

  // ---------- Menu ----------
  function initMenu() {
    const menuBtn = $('#menuBtn');
    const menuClose = $('#menuClose');
    const menuBackdrop = $('#menuBackdrop');
    const menuPanel = $('#menuPanel');

    if (!menuBtn || !menuClose || !menuBackdrop || !menuPanel) return;

    const openMenu = () => {
      document.body.classList.add('menu-open');
      menuBtn.setAttribute('aria-expanded', 'true');
    };
    const closeMenu = () => {
      document.body.classList.remove('menu-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    };

    menuBtn.addEventListener('click', () => {
      document.body.classList.contains('menu-open') ? closeMenu() : openMenu();
    });
    menuClose.addEventListener('click', closeMenu);
    menuBackdrop.addEventListener('click', closeMenu);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
    menuPanel.addEventListener('click', (e) => {
      if (e.target.closest('a')) closeMenu();
    });
  }

  // ---------- i18n ----------
  let I18N = null;

  function populateList(ul, items){
    if (!Array.isArray(items)) return;
    ul.innerHTML = '';
    items.forEach(txt => {
      const li = document.createElement('li');
      li.textContent = txt;
      ul.appendChild(li);
    });
  }

  function populatePeriods(ul, periods){
    if (!Array.isArray(periods)) return;
    ul.innerHTML = '';
    periods.slice(0, 6).forEach(p => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${p.name}</strong> — ${p.summary}`;
      ul.appendChild(li);
    });
  }

  function populateFigures(ul, figures){
    if (!Array.isArray(figures)) return;
    ul.innerHTML = '';
    figures.slice(0, 12).forEach(f => {
      const born = f.born ? f.born : '';
      const died = (f.died && f.died !== '—') ? (' – ' + f.died) : '';
      const role = f.wingChunRole ? f.wingChunRole : '';
      const li = document.createElement('li');
      li.innerHTML = `<strong>${f.name || ''}</strong> <span class="muted">(${born}${died})</span> — ${role}`;
      ul.appendChild(li);
    });
  }

  function applyTranslations(lang){
    if (!I18N || !I18N[lang]) return;
    const dict = I18N[lang];

    document.documentElement.setAttribute('lang', lang);

    // plain text
    $all('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = get(dict, key);
      if (typeof val === 'string') el.textContent = val;
    });

    // HTML content (if you use it)
    $all('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const val = get(dict, key);
      if (typeof val === 'string') el.innerHTML = val;
    });

    // lists
    $all('[data-i18n-list]').forEach(ul => {
      populateList(ul, get(dict, ul.getAttribute('data-i18n-list')));
    });

    // period/figure lists
    $all('[data-i18n-periods]').forEach(ul => {
      populatePeriods(ul, get(dict, ul.getAttribute('data-i18n-periods')));
    });
    $all('[data-i18n-figures]').forEach(ul => {
      populateFigures(ul, get(dict, ul.getAttribute('data-i18n-figures')));
    });

    // Update toggle label
    const langToggle = $('#langToggle');
    if (langToggle) langToggle.textContent = (lang === 'fr') ? 'English' : 'Français';

    // Persist language
    try { localStorage.setItem('siteLang', lang); } catch(e) {}

    // Feather icons: re-render after i18n changes (important!)
    if (window.feather) window.feather.replace();
  }

  async function initI18n(){
    let lang = 'fr';
    try {
      const saved = localStorage.getItem('siteLang');
      if (saved === 'fr' || saved === 'en') lang = saved;
      else {
        const nav = (navigator.language || 'fr').toLowerCase();
        lang = nav.startsWith('en') ? 'en' : 'fr';
      }
    } catch(e) {}

    try{
      const res = await fetch('../translations.json', { cache: 'no-store' }); // ✅ plural
      if (!res.ok) throw new Error('HTTP ' + res.status);
      I18N = await res.json();
    } catch(err){
      console.warn('Unable to load translations.json', err);
      I18N = { fr:{}, en:{} };
    }

    applyTranslations(lang);

    const langToggle = $('#langToggle');
    if (langToggle) {
      langToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('lang') || lang;
        applyTranslations(current === 'fr' ? 'en' : 'fr');
      });
    }
  }

  // ---------- Boot ----------
  document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    initI18n();

    // Feather initial render (safe)
    if (window.feather) window.feather.replace();
  });
})();
