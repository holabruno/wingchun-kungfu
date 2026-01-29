document.addEventListener('DOMContentLoaded', async () => {
  const mount = document.getElementById('site-footer');
  if (!mount) return;

  const res = await fetch('../partials/footer.html', { cache: 'no-store' });
  if (!res.ok) return;

  mount.innerHTML = await res.text();

  // re-render feather icons after injection
  if (window.feather) feather.replace();
});
