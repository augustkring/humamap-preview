/*
 * Waymaking V27. The ink remains in its document-anchored artspace.
 * One high-resolution tapered ink source is revealed along its own curved midline.
 * Text becomes legible near the middle of the reading viewport and never
 * dims after being passed. State follows scroll in either direction.
 */
(() => {
  'use strict';

  const story = document.querySelector('[data-waymaking-story]');
  const road = story?.querySelector('.waymaking-road-wrap');
  const revealPath = road?.querySelector('[data-waymaking-reveal-path]');
  const beats = story ? [...story.querySelectorAll('.waymaking-beat')] : [];

  if (!story || !road || !revealPath || beats.length !== 5) return;

  const content = beats.map(beat => ({
    beat,
    heading: beat.querySelector('h3'),
    paragraph: beat.querySelector('p'),
    progress: Number.NaN
  }));
  if (content.some(item => !item.heading || !item.paragraph)) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = window.matchMedia('(max-width: 900px)');
  const clamp = value => Math.min(1, Math.max(0, value));
  const easing = value => {
    const x = clamp(value);
    return x * x * (3 - 2 * x);
  };
  const mix = (from, to, amount) =>
    'rgb(' + from.map((value, index) =>
      Math.round(value + (to[index] - value) * amount)).join(', ') + ')';

  const TITLE_MUTED = [101, 116, 131];
  const TITLE_ACTIVE = [11, 34, 61];
  const BODY_MUTED = [95, 111, 127];
  const BODY_ACTIVE = [38, 59, 83];
  if (revealPath.getTotalLength() <= 0) return;

  let frame = 0;
  let lastTime = 0;
  let roadProgress = Number.NaN;
  let renderedProgress = Number.NaN;

  const roadTarget = () => {
    if (reducedMotion.matches) {
      return beats[0].getBoundingClientRect().top < window.innerHeight * 0.84 ? 1 : 0;
    }
    const viewportHeight = Math.max(1, window.innerHeight);
    const roadBounds = road.getBoundingClientRect();
    if (roadBounds.height <= 0) return 0;

    // Enter at zero ink when Creative Thinking reaches the lower reading area,
    // and finish only once the final paragraph has been read. The anchors
    // adapt to copy length, viewport height, font reflow and mobile spacing.
    const firstHeadingTop =
      window.scrollY + content[0].heading.getBoundingClientRect().top;
    const lastParagraphBottom =
      window.scrollY + content[content.length - 1].paragraph.getBoundingClientRect().bottom;
    const startScroll = firstHeadingTop -
      viewportHeight * (narrow.matches ? 0.76 : 0.82);
    const finishScroll = Math.max(
      startScroll + viewportHeight * 1.2,
      lastParagraphBottom - viewportHeight * (narrow.matches ? 0.36 : 0.43)
    );
    const raw = clamp((window.scrollY - startScroll) /
      Math.max(1, finishScroll - startScroll));
    return easing(raw);
  };

  const textTarget = heading => {
    if (reducedMotion.matches) return 1;
    const height = Math.max(1, window.innerHeight);
    const top = heading.getBoundingClientRect().top;
    const start = height * 0.78;
    const complete = height * 0.48;
    return easing((start - top) / Math.max(1, start - complete));
  };

  const paintRoad = progress => {
    const fraction = clamp(progress);
    if (fraction > 0 && fraction < 1 &&
        Math.abs(fraction - renderedProgress) < 0.00015) return;

    // One persistent path mask only. The source artwork's alpha already
    // contains the natural dry-brush fibres. The narrower 190-unit mask
    // covers the visible ink without a radial overlay or 100%-state flash.
    revealPath.setAttribute('stroke-dashoffset', (1 - fraction).toFixed(6));

    renderedProgress = fraction;
    story.dataset.waymakingProgress = fraction.toFixed(4);
    road.dataset.waymakingState =
      fraction <= 0 ? 'before' : fraction >= 1 ? 'complete' : 'drawing';
  };

  const frameUpdate = timestamp => {
    frame = 0;
    const elapsed = lastTime ? Math.max(1, timestamp - lastTime) : 16;
    lastTime = timestamp;
    const factor = reducedMotion.matches ? 1 : 1 - Math.exp(-elapsed / 32);
    const textFactor = reducedMotion.matches ? 1 : 1 - Math.exp(-elapsed / 58);
    let needsAnotherFrame = false;

    const desiredRoad = roadTarget();
    if (!Number.isFinite(roadProgress)) roadProgress = desiredRoad;
    if (Math.abs(desiredRoad - roadProgress) > 0.0003) {
      roadProgress += (desiredRoad - roadProgress) * factor;
      needsAnotherFrame = true;
    } else {
      roadProgress = desiredRoad;
    }
    if (desiredRoad === 1 && roadProgress > 0.998) roadProgress = 1;
    if (desiredRoad === 0 && roadProgress < 0.002) roadProgress = 0;
    paintRoad(roadProgress);

    for (const item of content) {
      const target = textTarget(item.heading);
      if (!Number.isFinite(item.progress)) item.progress = target;
      if (Math.abs(target - item.progress) > 0.001) {
        item.progress += (target - item.progress) * textFactor;
        needsAnotherFrame = true;
      } else {
        item.progress = target;
      }
      const weight = item.progress;
      const dimTitle = narrow.matches ? [90, 106, 123] : TITLE_MUTED;
      const dimBody = narrow.matches ? [78, 94, 112] : BODY_MUTED;
      const titleColor = mix(dimTitle, TITLE_ACTIVE, weight);
      const bodyColor = mix(dimBody, BODY_ACTIVE, weight);
      if (item.heading.style.color !== titleColor) item.heading.style.color = titleColor;
      if (item.paragraph.style.color !== bodyColor) item.paragraph.style.color = bodyColor;
      item.beat.classList.toggle('is-current', weight >= 0.999);
      item.beat.dataset.waymakingEmphasis = weight.toFixed(4);
    }

    if (needsAnotherFrame) frame = requestAnimationFrame(frameUpdate);
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(frameUpdate);
  };

  story.dataset.waymakingAnimated = 'true';
  road.dataset.waymakingDocument = 'true';
  // Apply the correct state synchronously on first load, including deep links.
  frameUpdate(performance.now());

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  addEventListener('pageshow', schedule);
  addEventListener('load', schedule, { once: true });
  reducedMotion.addEventListener('change', schedule);
  narrow.addEventListener('change', schedule);
  if (document.fonts?.ready) document.fonts.ready.then(schedule).catch(() => {});
})();