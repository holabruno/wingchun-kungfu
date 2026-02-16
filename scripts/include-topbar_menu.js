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
});
