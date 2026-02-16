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
});
