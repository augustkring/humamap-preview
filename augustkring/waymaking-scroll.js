/*
 * Waymaking: native-scroll editorial reveal.
 *
 * No scroll interception, no pinning the document and no animation when
 * reduced motion is requested. Content and full artwork remain available
 * with JavaScript disabled.
 */
(() => {
  const story = document.querySelector('[data-waymaking-story]');
  const scene = story?.querySelector('[data-waymaking-scene]');
  const image = scene?.querySelector('.waymaking-road-art img');
  const beats = scene ? [...scene.querySelectorAll('.waymaking-beat')] : [];
  if (!story || !scene || !image || beats.length !== 5) return;

  const desktop = window.matchMedia('(min-width: 901px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;

  const reset = () => {
    story.removeAttribute('data-waymaking-active');
    image.style.clipPath = '';
    beats.forEach(beat => beat.classList.remove('is-current'));
  };

  const update = () => {
    frame = 0;
    if (!desktop.matches || reduced.matches) {
      reset();
      return;
    }

    const bounds = scene.getBoundingClientRect();
    if (bounds.bottom < -120 || bounds.top > window.innerHeight + 120) {
      reset();
      return;
    }

    // Reveal the existing painted artwork; never resample or bend its pixels.
    const focusY = window.innerHeight * 0.53;
    const fraction = Math.max(0, Math.min(1,
      (focusY - bounds.top) / Math.max(1, bounds.height)
    ));
    const reveal = Math.max(0.30, Math.min(1, 0.30 + fraction * 0.90));
    image.style.clipPath = `inset(0 0 ${(100 * (1 - reveal)).toFixed(2)}% 0)`;

    let selected = -1;
    let closest = Infinity;
    beats.forEach((beat, index) => {
      const rect = beat.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - focusY);
      if (distance < closest) {
        closest = distance;
        selected = index;
      }
    });

    story.dataset.waymakingActive = 'true';
    beats.forEach((beat, index) =>
      beat.classList.toggle('is-current', index === selected)
    );
  };

  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(update);
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  desktop.addEventListener('change', schedule);
  reduced.addEventListener('change', schedule);
  window.addEventListener('pageshow', schedule);
  schedule();
})();
