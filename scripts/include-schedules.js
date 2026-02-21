document.addEventListener('DOMContentLoaded', async () => {
  const mount = document.getElementById('schedules');
  if (!mount) return;

  const res = await fetch('partials/schedules.html', { cache: 'no-store' });
  if (!res.ok) return;

  mount.innerHTML = await res.text();

  // re-render feather icons after injection
  if (window.feather) feather.replace();

  // Re-run shared JS so i18n can populate injected schedule rows.
  if (window.SiteUI && typeof window.SiteUI.init === 'function') {
    window.SiteUI.init();
  }

  // If URL has a hash for an element injected in this partial
  // (e.g. #horaires), scroll again after injection/layout.
  const scrollToHashTarget = () => {
    const hash = window.location.hash;
    if (!hash || hash === '#') return;
    const id = decodeURIComponent(hash.slice(1));
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: 'auto', block: 'start' });
  };

  scrollToHashTarget();
  setTimeout(scrollToHashTarget, 120);
});
