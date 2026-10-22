/*
 * Waymaking V20: one viewport-fixed original ink road.
 * The road is never toggled in/out while scrolling. The only scroll-driven
 * visual mutation is the SVG mask reveal (plus foreground copy emphasis).
 * It starts after "Where I add value" has cleared the fixed road origin,
 * draws continuously through the five Waymaking chapters, clamps at 100%,
 * and then remains fully painted at the same viewport position.
 */
(() => {
  const story = document.querySelector('[data-waymaking-story]');
  const beats = story ? [...story.querySelectorAll('.waymaking-beat')] : [];
  const road = story?.querySelector('.waymaking-road-wrap');
  const firstHeading = beats[0]?.querySelector('h3');
  const summary = story?.previousElementSibling;
  const finalCopy = beats[4]?.querySelector('.waymaking-copy');
  const revealPath = road?.querySelector('[data-waymaking-reveal]');

  if (!story || !road || !firstHeading || !summary || !finalCopy ||
      beats.length !== 5 || !revealPath) return;

  road.dataset.waymakingViewport = 'true';
  document.body.appendChild(road);

  const length = revealPath.getTotalLength();
  const feathers = [...revealPath.parentElement.querySelectorAll('[data-waymaking-feather]')];
  if (!(length > 0) || feathers.length !== 7) return;

  revealPath.style.strokeDasharray = length + ' ' + length;
  revealPath.style.strokeDashoffset = String(length);
  for (const feather of feathers) {
    feather.style.strokeDasharray = length + ' ' + length;
    feather.style.strokeDashoffset = String(length);
  }

  story.dataset.waymakingAnimated = 'true';
  road.dataset.waymakingReady = 'true';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = window.matchMedia('(max-width: 900px)');
  const clamp = value => Math.min(1, Math.max(0, value));
  const smooth = value => {
    const v = clamp(value);
    return v * v * (3 - 2 * v);
  };
  const pageTop = element => window.scrollY + element.getBoundingClientRect().top;

  const titleDim = [92, 107, 122];
  const titleActive = [11, 34, 61];
  const bodyDim = [81, 101, 121];
  const bodyActive = [38, 59, 83];
  const blend = (from, to, amount) =>
    'rgb(' + from.map((value, index) =>
      Math.round(value + (to[index] - value) * amount)).join(',') + ')';

  let frame = 0;
  let labels = [];
  let previousFraction = -1;
  let range = { start: 0, end: 1 };

  const resetText = () => {
    for (const item of labels) {
      item.heading.textContent = item.label;
      item.heading.removeAttribute('aria-label');
      item.paragraph.style.removeProperty('color');
    }
    labels = [];
    beats.forEach(beat => beat.classList.remove('is-current'));
  };

  const prepareText = () => {
    if (labels.length) return;
    labels = beats.map(beat => {
      const heading = beat.querySelector('h3');
      const paragraph = beat.querySelector('p');
      const label = heading?.textContent.trim() ?? '';
      if (!heading || !paragraph || !label) return null;

      const letters = [];
      const fragment = document.createDocumentFragment();
      for (const token of label.split(/(\s+)/)) {
        if (!token) continue;
        if (/^\s+$/.test(token)) {
          fragment.appendChild(document.createTextNode(token));
          continue;
        }
        const word = document.createElement('span');
        word.className = 'waymaking-heading-word';
        word.setAttribute('aria-hidden', 'true');
        for (const glyph of Array.from(token)) {
          const letter = document.createElement('span');
          letter.className = 'waymaking-letter';
          letter.textContent = glyph;
          word.appendChild(letter);
          letters.push(letter);
        }
        fragment.appendChild(word);
      }
      heading.setAttribute('aria-label', label);
      heading.replaceChildren(fragment);
      return { heading, paragraph, label, letters };
    }).filter(Boolean);
  };

  const glyphWeight = (phase, beat, index, count) => {
    const offset = (count <= 1 ? 0 : index / (count - 1)) * 0.48;
    const entering = beat === 0 ? 1 : smooth((phase - (beat - 1) - offset) / 0.52);
    const leaving = beat === beats.length - 1
      ? 1
      : 1 - smooth((phase - beat - offset) / 0.52);
    return Math.min(entering, leaving);
  };

  const measure = () => {
    const viewportHeight = Math.max(1, window.innerHeight);
    const introBounds = summary.getBoundingClientRect();
    const firstBounds = firstHeading.getBoundingClientRect();
    const finalBounds = finalCopy.getBoundingClientRect();

    const introBottom = window.scrollY + introBounds.bottom;
    const firstTop = window.scrollY + firstBounds.top;
    const finalCenter = window.scrollY + finalBounds.top + finalBounds.height * 0.5;

    // Do not reveal ink while "Where I add value" can still occupy the
    // fixed road origin. With the current rhythm this places the first ink
    // just above Creative Thinking rather than over the preceding copy.
    const introClearStart = introBottom - 16 + 12;
    const creativeStart = firstTop - Math.min(116, Math.max(72, viewportHeight * 0.11));
    const start = Math.max(0, introClearStart, creativeStart);

    // Complete while the fifth Waymaking chapter is still being read.
    // Beyond this point progress is clamped at 1 and never changes again.
    const end = Math.max(
      start + Math.max(720, viewportHeight * 1.35),
      finalCenter - viewportHeight * 0.18,
    );

    range = { start, end };
    road.dataset.waymakingStart = start.toFixed(2);
    road.dataset.waymakingEnd = end.toFixed(2);
  };

  const roadFraction = () => {
    if (reduced.matches) return window.scrollY >= range.start ? 1 : 0;
    return clamp((window.scrollY - range.start) /
      Math.max(1, range.end - range.start));
  };

  const paint = fraction => {
    if (Math.abs(fraction - previousFraction) <= 0.00025) return;

    const frontLength = reduced.matches
      ? 0
      : Math.min(fraction, 0.055, (1 - fraction) * 0.55);
    const solid = fraction - frontLength;

    revealPath.style.strokeDashoffset = String(length * (1 - solid));
    feathers.forEach((feather, index) => {
      const tip = solid + frontLength * ((index + 1) / feathers.length);
      feather.style.strokeDashoffset = String(length * (1 - tip));
    });

    previousFraction = fraction;
    story.dataset.waymakingProgress = fraction.toFixed(3);
    road.dataset.waymakingState =
      fraction <= 0 ? 'before' : fraction >= 1 ? 'complete' : 'drawing';
  };

  const textPhase = () => {
    const focus = window.innerHeight * 0.16;
    const centers = beats.map(beat => {
      const bounds = beat.getBoundingClientRect();
      return bounds.top + bounds.height * 0.5;
    });

    if (focus <= centers[0]) return 0;
    if (focus >= centers[centers.length - 1]) return beats.length - 1;

    for (let index = 0; index < centers.length - 1; index += 1) {
      if (focus <= centers[index + 1]) {
        const local = clamp((focus - centers[index]) /
          Math.max(1, centers[index + 1] - centers[index]));
        return index + local;
      }
    }
    return beats.length - 1;
  };

  const update = () => {
    frame = 0;
    paint(roadFraction());

    if (reduced.matches) {
      resetText();
      return;
    }

    prepareText();
    const phase = textPhase();
    const fromTitle = narrow.matches ? [55, 75, 94] : titleDim;
    const fromBody = narrow.matches ? [45, 63, 83] : bodyDim;

    for (let index = 0; index < labels.length; index += 1) {
      const item = labels[index];
      for (let glyph = 0; glyph < item.letters.length; glyph += 1) {
        const value = blend(
          fromTitle,
          titleActive,
          glyphWeight(phase, index, glyph, item.letters.length),
        );
        if (item.letters[glyph].style.color !== value) {
          item.letters[glyph].style.color = value;
        }
      }
      const value = blend(
        fromBody,
        bodyActive,
        smooth(1 - Math.abs(phase - index)),
      );
      if (item.paragraph.style.color !== value) item.paragraph.style.color = value;
      beats[index].classList.toggle('is-current', Math.round(phase) === index);
    }
  };

  const scheduleUpdate = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  const measureAndUpdate = () => {
    measure();
    previousFraction = -1;
    update();
  };

  addEventListener('scroll', scheduleUpdate, { passive: true });
  addEventListener('resize', measureAndUpdate, { passive: true });
  addEventListener('pageshow', measureAndUpdate);
  addEventListener('load', measureAndUpdate, { once: true });
  reduced.addEventListener('change', measureAndUpdate);
  narrow.addEventListener('change', measureAndUpdate);

  if (document.fonts?.ready) {
    document.fonts.ready.then(measureAndUpdate).catch(() => {});
  }

  measureAndUpdate();
})();
