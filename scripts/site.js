(() => {
  // -------------------------
  // Helpers
  // -------------------------
  const $ = (sel) => document.querySelector(sel);
  const $all = (sel) => Array.from(document.querySelectorAll(sel));
  const get = (obj, path) => path.split('.').reduce((a, k) => (a && k in a) ? a[k] : undefined, obj);

  let I18N = null;
  let i18nLoadPromise = null;

  // -------------------------
  // Menu (hamburger)
  // -------------------------
  function initMenu() {
    const menuBtn = $('#menuBtn');
    const menuClose = $('#menuClose');
    const menuBackdrop = $('#menuBackdrop');
    const menuPanel = $('#menuPanel');

    if (!menuBtn || !menuClose || !menuBackdrop || !menuPanel) return;
    if (menuPanel.dataset.menuInit === '1') return;
    menuPanel.dataset.menuInit = '1';

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

  // -------------------------
  // Render helpers used by multiple pages
  // -------------------------
  function populateList(ul, items) {
    if (!ul || !Array.isArray(items)) return;
    ul.innerHTML = '';
    items.forEach((txt) => {
      const li = document.createElement('li');
      li.textContent = txt;
      ul.appendChild(li);
    });
  }

  function populateOptions(selectEl, options) {
    if (!selectEl || !Array.isArray(options)) return;

    const current = selectEl.value;
    selectEl.innerHTML = '';

    // keep an empty placeholder first (optional)
    const empty = document.createElement('option');
    empty.value = '';
    empty.textContent = '—';
    selectEl.appendChild(empty);

    options.forEach((o) => {
      const opt = document.createElement('option');
      opt.value = o.value;
      opt.textContent = o.label;
      selectEl.appendChild(opt);
    });

    if (current) selectEl.value = current;
  }

  function populatePeriods(ul, periods) {
    if (!ul || !Array.isArray(periods)) return;
    ul.innerHTML = '';
    periods.slice(0, 6).forEach((p) => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${p.name}</strong> — ${p.summary}`;
      ul.appendChild(li);
    });
  }

  function populateFigures(ul, figures) {
    if (!ul || !Array.isArray(figures)) return;
    ul.innerHTML = '';
    figures.slice(0, 12).forEach((f) => {
      const born = f.born ? f.born : '';
      const died = (f.died && f.died !== '—') ? (' – ' + f.died) : '';
      const role = f.wingChunRole ? f.wingChunRole : '';
      const li = document.createElement('li');
      li.innerHTML = `<strong>${f.name || ''}</strong> <span class="muted">(${born}${died})</span> — ${role}`;
      ul.appendChild(li);
    });
  }

  // Used on wingchun pages if present
  function renderFusedList(items) {
    const container = document.getElementById('fusedListContainer');
    if (!container) return;

    if (!Array.isArray(items) || items.length === 0) {
      container.innerHTML = `<p class="muted">Aucun contenu.</p>`;
      return;
    }

    const list = document.createElement('div');
    list.style.display = 'grid';
    list.style.gap = '14px';

    items.forEach((it) => {
      const block = document.createElement('div');
      block.style.border = '1px solid #e8ecf3';
      block.style.borderRadius = '14px';
      block.style.padding = '14px 14px';
      block.style.background = '#fff';

      const h = document.createElement('div');
      h.style.fontWeight = '800';
      h.style.marginBottom = '6px';
      h.textContent = it.title || '';

      const p = document.createElement('div');
      p.style.color = '#334155';
      p.textContent = it.text || '';

      block.appendChild(h);
      block.appendChild(p);
      list.appendChild(block);
    });

    container.innerHTML = '';
    container.appendChild(list);
  }

    // pour les horaires de la page a-propos.html
  function populateSchedule(tbody, rows, emptyText) {
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!Array.isArray(rows) || rows.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="2" class="muted">${emptyText || 'Aucun horaire'}</td>`;
    tbody.appendChild(tr);
    return;
  }

  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.day}</td><td>${r.time}</td>`;
    tbody.appendChild(tr);
  });
}

  // -------------------------
  // i18n apply
  // -------------------------
  function applyTranslations(lang) {
    if (!I18N || !I18N[lang]) return;
    const dict = I18N[lang];

    document.documentElement.setAttribute('lang', lang);

    // Plain text replacement
    $all('[data-i18n]').forEach((el) => {
      // Skip nodes that are explicitly marked for HTML injection.
      if (el.hasAttribute('data-i18n-html')) return;
      const key = el.getAttribute('data-i18n');
      const val = get(dict, key);
      if (typeof val === 'string') el.textContent = val;
    });

    // HTML replacement (optional)
    $all('[data-i18n-html]').forEach((el) => {
      // Support both forms:
      // 1) data-i18n-html="some.key"
      // 2) data-i18n="some.key" data-i18n-html
      const key = el.getAttribute('data-i18n-html') || el.getAttribute('data-i18n');
      const val = get(dict, key);
      if (typeof val === 'string') el.innerHTML = val;
    });

    // Placeholders
    $all('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = get(dict, key);
      if (typeof val === 'string') el.setAttribute('placeholder', val);
    });

    // Select options
    $all('[data-i18n-options]').forEach((el) => {
      const key = el.getAttribute('data-i18n-options');
      const opts = get(dict, key);
      populateOptions(el, opts);
    });

    // Simple lists
    $all('[data-i18n-list]').forEach((ul) => {
      const key = ul.getAttribute('data-i18n-list');
      populateList(ul, get(dict, key));
    });

    // Periods / figures lists (wingchun page)
    $all('[data-i18n-periods]').forEach((ul) => {
      const key = ul.getAttribute('data-i18n-periods');
      populatePeriods(ul, get(dict, key));
    });

    $all('[data-i18n-figures]').forEach((ul) => {
      const key = ul.getAttribute('data-i18n-figures');
      populateFigures(ul, get(dict, key));
    });

    // Fused list (wingChunHistory.fusedList) if container exists
    renderFusedList(get(dict, 'wingChunHistory.fusedList'));

    // ---- A-PROPOS schedule tables (if present on the page) ----
    // Supports BOTH keys: aproposPage.* and apropos.*
    const root = dict.aproposPage ? 'aproposPage' : (dict.apropos ? 'apropos' : null);

    const wcBody = document.getElementById('wingchunScheduleBody');
    const lionBody = document.getElementById('lionScheduleBody');
    const taichiBody = document.getElementById('taichiScheduleBody');

    if (root && (wcBody || lionBody || taichiBody)) {
    const wcRows = get(dict, `${root}.schedule.wingchunRows`);
    const lionRows = get(dict, `${root}.schedule.lionRows`);
    const taichiRows = get(dict, `${root}.schedule.taichiRows`);

    // optional localized empty text
    const emptyText = (lang === 'fr') ? 'Aucun horaire' : 'No schedule';

    populateSchedule(wcBody, wcRows, emptyText);
    populateSchedule(lionBody, lionRows, emptyText);
    populateSchedule(taichiBody, taichiRows, emptyText);
    }


    // Toggle button label
    const langToggle = $('#langToggle');
    if (langToggle) langToggle.textContent = (lang === 'fr') ? 'English' : 'Français';

    try { localStorage.setItem('siteLang', lang); } catch (e) {}

    // Feather icons must be re-rendered after DOM text updates
    if (window.feather) window.feather.replace();
  }

  function resolveLanguage() {
    // Determine language
    let lang = 'fr';
    try {
      const saved = localStorage.getItem('siteLang');
      if (saved === 'fr' || saved === 'en') lang = saved;
      else {
        const nav = (navigator.language || 'fr').toLowerCase();
        lang = nav.startsWith('en') ? 'en' : 'fr';
      }
    } catch (e) {}
    return lang;
  }

  async function loadTranslations() {
    if (I18N) return;
    if (!i18nLoadPromise) {
      i18nLoadPromise = (async () => {
        try {
          const res = await fetch('translations.json', { cache: 'no-store' });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          I18N = await res.json();
        } catch (err) {
          console.warn('Unable to load translations.json', err);
          I18N = { fr: {}, en: {} };
        }
      })();
    }
    await i18nLoadPromise;
  }

  function bindLanguageToggle() {
    const langToggle = $('#langToggle');
    if (!langToggle || langToggle.dataset.langInit === '1') return;
    langToggle.dataset.langInit = '1';

    langToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('lang') || resolveLanguage();
      const next = (current === 'fr') ? 'en' : 'fr';
      applyTranslations(next);
    });
  }

  async function initI18n() {
    const lang = resolveLanguage();
    await loadTranslations();
    applyTranslations(lang);
    bindLanguageToggle();
  }

  async function initSiteUI() {
    initMenu();
    await initI18n();

    // Feather initial render (safe)
    if (window.feather) window.feather.replace();
  }

  // -------------------------
  // Boot
  // -------------------------
  window.SiteUI = { init: initSiteUI };

  document.addEventListener('DOMContentLoaded', () => {
    initSiteUI();
  });
})();
