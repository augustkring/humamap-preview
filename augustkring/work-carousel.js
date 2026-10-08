(() => {
  const carousel = document.querySelector('[data-work-carousel]');
  if (!carousel) return;

  const track = carousel.querySelector('[data-work-track]');
  const controls = carousel.querySelector('[data-work-controls]');
  const previous = carousel.querySelector('[data-work-prev]');
  const next = carousel.querySelector('[data-work-next]');
  const status = carousel.querySelector('[data-work-status]');
  const cards = Array.from(track.querySelectorAll('.work-card'));
  if (cards.length < 2) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const maxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);
  const step = () => cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left;
  const visible = () => {
    const increment = step();
    if (!increment) return cards.length;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    return Math.min(cards.length, Math.max(1, Math.round((track.clientWidth + gap) / increment)));
  };

  const updateControls = () => {
    const last = maxScroll();
    controls.hidden = last < 2;
    previous.disabled = track.scrollLeft < 2;
    next.disabled = track.scrollLeft >= last - 2;
  };

  const announce = () => {
    const count = visible();
    const current = Math.max(0, Math.min(cards.length - count, Math.round(track.scrollLeft / step())));
    status.textContent = 'Showing ventures ' + (current + 1) + ' to ' + (current + count) + ' of ' + cards.length;
  };

  const move = direction => {
    const increment = step();
    if (!increment) return;
    track.scrollTo({
      left: Math.max(0, Math.min(maxScroll(), track.scrollLeft + direction * increment)),
      behavior: reducedMotion.matches ? 'auto' : 'smooth'
    });
  };

  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  let animationFrame = 0;
  let announcementTimer = 0;
  track.addEventListener('scroll', () => {
    if (!animationFrame) {
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;
        updateControls();
      });
    }
    window.clearTimeout(announcementTimer);
    announcementTimer = window.setTimeout(announce, 180);
  }, { passive: true });

  track.setAttribute('data-work-enhanced', '');
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(updateControls).observe(track);
  } else {
    window.addEventListener('resize', updateControls);
  }
  updateControls();
})();
