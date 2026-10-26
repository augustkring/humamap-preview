(() => {
  const carousel = document.querySelector('[data-work-carousel]');
  if (!carousel) return;
  const track = carousel.querySelector('[data-work-track]');
  const pagination = carousel.querySelector('[data-work-pagination]');
  const status = carousel.querySelector('[data-work-status]');
  const cards = Array.from(track.querySelectorAll('.work-card'));
  if (!track || !pagination || cards.length < 2) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clampIndex = value => Math.max(0, Math.min(cards.length - 1, value));
  const maxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);
  const targetFor = index => {
    const last = maxScroll();
    return cards.length <= 1 ? 0 : last * (clampIndex(index) / (cards.length - 1));
  };
  const indexForScroll = () => {
    const last = maxScroll();
    if (last < 2) return 0;
    return clampIndex(Math.round((track.scrollLeft / last) * (cards.length - 1)));
  };

  let activeIndex = 0;
  let animationFrame = 0;
  let announcementTimer = 0;
  const dots = cards.map((card, index) => {
    const label = card.dataset.workLabel || 'Current focus ' + (index + 1);
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'work-carousel-dot';
    dot.dataset.workDot = '';
    dot.setAttribute('aria-label', 'Show ' + label + ' (' + (index + 1) + ' of ' + cards.length + ')');
    dot.setAttribute('aria-controls', track.id);
    dot.addEventListener('click', () => goTo(index, true));
    dot.addEventListener('keydown', event => {
      let nextIndex = null;
      if (event.key === 'ArrowLeft') nextIndex = activeIndex - 1;
      if (event.key === 'ArrowRight') nextIndex = activeIndex + 1;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = cards.length - 1;
      if (nextIndex === null) return;
      event.preventDefault();
      const targetIndex = clampIndex(nextIndex);
      goTo(targetIndex, true);
      dots[targetIndex].focus();
    });
    pagination.append(dot);
    return dot;
  });

  const setActive = index => {
    activeIndex = clampIndex(index);
    dots.forEach((dot, dotIndex) => {
      if (dotIndex === activeIndex) {
        dot.setAttribute('aria-current', 'true');
        dot.tabIndex = 0;
      } else {
        dot.removeAttribute('aria-current');
        dot.tabIndex = -1;
      }
    });
  };
  const announce = () => {
    const label = cards[activeIndex].dataset.workLabel || 'Current focus ' + (activeIndex + 1);
    status.textContent = label + ', card ' + (activeIndex + 1) + ' of ' + cards.length;
  };
  function goTo(index, shouldAnnounce = false) {
    const nextIndex = clampIndex(index);
    setActive(nextIndex);
    track.scrollTo({ left: targetFor(nextIndex), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    if (shouldAnnounce) {
      window.clearTimeout(announcementTimer);
      announcementTimer = window.setTimeout(announce, reducedMotion.matches ? 0 : 220);
    }
  }
  track.addEventListener('scroll', () => {
    if (!animationFrame) {
      animationFrame = window.requestAnimationFrame(() => { animationFrame = 0; setActive(indexForScroll()); });
    }
    window.clearTimeout(announcementTimer);
    announcementTimer = window.setTimeout(announce, 180);
  }, { passive: true });
  track.addEventListener('keydown', event => {
    if (event.target !== track || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
    event.preventDefault();
    goTo(activeIndex + (event.key === 'ArrowRight' ? 1 : -1), true);
  });

  track.setAttribute('data-work-enhanced', '');
  pagination.hidden = maxScroll() < 2;
  setActive(indexForScroll());
  const syncAfterResize = () => {
    pagination.hidden = maxScroll() < 2;
    track.scrollTo({ left: targetFor(activeIndex), behavior: 'auto' });
    setActive(activeIndex);
  };
  if (typeof ResizeObserver === 'function') new ResizeObserver(() => window.requestAnimationFrame(syncAfterResize)).observe(track);
  else window.addEventListener('resize', syncAfterResize);
})();
