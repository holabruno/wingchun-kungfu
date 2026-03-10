document.addEventListener('DOMContentLoaded', async () => {
  const mount = document.getElementById('site-topbar_menu');
  if (!mount) return;

  const res = await fetch('partials/topbar_menu.html', { cache: 'no-store' });
  if (!res.ok) return;

  mount.innerHTML = await res.text();

  // re-render feather icons after injection
  if (window.feather) feather.replace();

  // Re-run shared JS now that topbar/menu exists in the DOM.
  if (window.SiteUI && typeof window.SiteUI.init === 'function') {
    window.SiteUI.init();
  }

  // Re-apply hash scroll after topbar injection/layout shift.
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
