(() => {
  const opener = document.querySelector('[data-mobile-nav-open]');
  const dialog = document.getElementById('mobile-menu');
  const closer = dialog?.querySelector('[data-mobile-nav-close]');
  if (!opener || !dialog || !closer || typeof dialog.showModal !== 'function') return;

  opener.addEventListener('click', () => {
    if (dialog.open) return;
    dialog.showModal();
    opener.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('nav-open');
  });
  closer.addEventListener('click', () => dialog.close());
  dialog.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => { if (dialog.open) dialog.close(); });
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('nav-open');
    opener.setAttribute('aria-expanded', 'false');
    opener.focus({ preventScroll: true });
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 840 && dialog.open) dialog.close();
  }, { passive: true });
})();
