(() => {
  const opener = document.querySelector('[data-mobile-nav-open]');
  const dialog = document.getElementById('mobile-menu');
  const closer = dialog?.querySelector('[data-mobile-nav-close]');
  if (!opener || !dialog || !closer || typeof dialog.showModal !== 'function') return;

  let lockedScrollY = 0;
  const bodyStyle = {
    position: '',
    top: '',
    left: '',
    right: '',
    width: '',
  };

  const lockPage = () => {
    lockedScrollY = window.scrollY;
    bodyStyle.position = document.body.style.position;
    bodyStyle.top = document.body.style.top;
    bodyStyle.left = document.body.style.left;
    bodyStyle.right = document.body.style.right;
    bodyStyle.width = document.body.style.width;

    document.documentElement.classList.add('nav-open');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  };

  const unlockPage = () => {
    document.documentElement.classList.remove('nav-open');
    document.body.style.position = bodyStyle.position;
    document.body.style.top = bodyStyle.top;
    document.body.style.left = bodyStyle.left;
    document.body.style.right = bodyStyle.right;
    document.body.style.width = bodyStyle.width;
    window.scrollTo(0, lockedScrollY);
  };

  const closeMenu = () => {
    if (dialog.open) dialog.close();
  };

  opener.addEventListener('click', () => {
    if (dialog.open) return;
    lockPage();
    opener.setAttribute('aria-expanded', 'true');
    dialog.showModal();
    queueMicrotask(() => closer.focus({ preventScroll: true }));
  });

  closer.addEventListener('click', closeMenu);

  dialog.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  dialog.addEventListener('close', () => {
    unlockPage();
    opener.setAttribute('aria-expanded', 'false');
    requestAnimationFrame(() => opener.focus({ preventScroll: true }));
  });

  window.matchMedia('(min-width: 841px)').addEventListener('change', (event) => {
    if (event.matches) closeMenu();
  });
})();