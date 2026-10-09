(() => {
  const opener = document.querySelector('[data-mobile-nav-open]');
  const dialog = document.getElementById('mobile-menu');
  const closer = dialog?.querySelector('[data-mobile-nav-close]');
  if (!opener || !dialog || !closer || typeof dialog.showModal !== 'function') return;

  const desktop = window.matchMedia('(min-width: 841px)');
  const root = document.documentElement;
  let needsCloseCleanup = false;

  // Focus the dialog itself after pointer opening: no unsolicited ring around the X.
  // Keyboard and assistive-technology activation retains a visible, non-red focus cue.
  dialog.tabIndex = -1;

  const finishClose = () => {
    if (dialog.open || !needsCloseCleanup) return;
    needsCloseCleanup = false;
    root.classList.remove('nav-open');
    opener.setAttribute('aria-expanded', 'false');
    if (!desktop.matches) opener.focus({ preventScroll: true });
  };

  const closeMenu = () => {
    if (!dialog.open) return;
    dialog.close();
    finishClose();
  };

  opener.addEventListener('click', (event) => {
    if (dialog.open || desktop.matches) return;

    dialog.showModal();
    needsCloseCleanup = true;
    root.classList.add('nav-open');
    opener.setAttribute('aria-expanded', 'true');

    if (event.detail === 0) {
      closer.focus({ preventScroll: true });
    } else {
      dialog.focus({ preventScroll: true });
    }
  });

  closer.addEventListener('click', closeMenu);

  dialog.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Native Escape/Cancel dispatches a close event; explicit close updates immediately.
  dialog.addEventListener('close', finishClose);

  desktop.addEventListener('change', (event) => {
    if (event.matches) closeMenu();
  });
})();
