/*
 * Waymaking: reveal the approved painting along its actual winding path.
 *
 * The inline SVG mask uses a brush-width painted path, not a rectangular
 * crop, and responds to natural document scrolling. The DOM text is always
 * present. Mobile, no-JS and reduced-motion visitors see the static artwork.
 */
(() => {
  const story = document.querySelector('[data-waymaking-story]');
  const scene = story?.querySelector('[data-waymaking-scene]');
  const brush = scene?.querySelector('[data-waymaking-paint-path]');
  const beats = scene ? [...scene.querySelectorAll('.waymaking-beat')] : [];

  if (!story || !scene || !brush || beats.length !== 5) return;

  const desktop = window.matchMedia('(min-width: 901px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  let frame = 0;

  const reset = () => {
    delete story.dataset.waymakingPainted;
    delete story.dataset.waymakingComplete;
    brush.setAttribute('stroke-dashoffset', '1000');
    beats.forEach(beat => beat.classList.remove('is-current'));
  };

  const update = () => {
    frame = 0;

    if (!desktop.matches || reducedMotion.matches) {
      reset();
      return;
    }

    const focus = window.innerHeight * 0.55;
    const first = beats[0].getBoundingClientRect();
    const last = beats[beats.length - 1].getBoundingClientRect();
    const start = first.top + first.height / 2;
    const end = last.top + last.height / 2;
    const progress = clamp((focus - start) / Math.max(1, end - start), 0, 1);

    // The broad SVG stroke paints its own organic path across the picture.
    // Its round moving brush tip avoids the old straight horizontal crop.
    const revealed = clamp(0.035 + progress * 1.01, 0, 1);
    brush.setAttribute('stroke-dashoffset', String(Math.round(1000 * (1 - revealed))));
    if (revealed >= 0.995) story.dataset.waymakingComplete = 'true';
    else delete story.dataset.waymakingComplete;

    let selected = 0;
    let distance = Infinity;
    beats.forEach((beat, i) => {
      const rect = beat.getBoundingClientRect();
      const delta = Math.abs(rect.top + rect.height / 2 - focus);
      if (delta < distance) {
        distance = delta;
        selected = i;
      }
    });

    story.dataset.waymakingPainted = 'true';
    beats.forEach((beat, i) => beat.classList.toggle('is-current', i === selected));
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  addEventListener('pageshow', schedule);
  desktop.addEventListener('change', schedule);
  reducedMotion.addEventListener('change', schedule);
  schedule();
})();
