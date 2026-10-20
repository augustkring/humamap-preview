/*
 * Waymaking V5: native-scroll, centered editorial chapters and painted road.
 * CSS sticky holds the existing ink artwork in the viewport. Scroll only
 * changes paint progress and readable color emphasis, never document position.
 * Reduced-motion and no-JavaScript visitors see the complete illustration and
 * ordinary semantic headings. The artwork retains its original pixels.
 */
(() => {
  const story = document.querySelector('[data-waymaking-story]');
  const scene = story?.querySelector('[data-waymaking-scene]');
  const brush = scene?.querySelector('[data-waymaking-paint-path]');
  const picture = scene?.querySelector('.waymaking-road-art img');
  const featherPaths = scene ? [...scene.querySelectorAll('[data-waymaking-feather]')] : [];
  const beats = scene ? [...scene.querySelectorAll('.waymaking-beat')] : [];
  if (!story || !scene || !brush || !picture || beats.length !== 5 || featherPaths.length !== 7) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = window.matchMedia('(max-width: 900px)');
  const clamp = (n, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
  const smooth = x => { const v = clamp(x); return v * v * (3 - 2 * v); };
  const dimTitle = [92, 107, 122];
  const activeTitle = [11, 34, 61];
  const dimBody = [81, 101, 121];
  const activeBody = [38, 59, 83];
  const blend = (from, to, amount) =>
    'rgb(' + from.map((n, i) => Math.round(n + (to[i] - n) * amount)).join(',') + ')';
  let frame = 0;
  let enhanced = false;
  let labels = [];

  const makeLetters = () => {
    if (enhanced) return;
    labels = beats.map(beat => {
      const heading = beat.querySelector('h3');
      const label = heading.textContent.trim();
      const tokens = label.split(/(\s+)/);
      const spans = [];
      heading.setAttribute('aria-label', label);
      heading.textContent = '';
      for (const token of tokens) {
        if (!token) continue;
        if (/^\s+$/.test(token)) {
          heading.appendChild(document.createTextNode(token));
          continue;
        }
        const word = document.createElement('span');
        word.className = 'waymaking-word';
        word.setAttribute('aria-hidden', 'true');
        for (const glyph of Array.from(token)) {
          const letter = document.createElement('span');
          letter.className = 'waymaking-letter';
          letter.textContent = glyph;
          word.appendChild(letter);
          spans.push(letter);
        }
        heading.appendChild(word);
      }
      return { heading, label, spans, paragraph: beat.querySelector('p') };
    });
    enhanced = true;
  };

  const clearEnhancement = () => {
    delete story.dataset.waymakingPainted;
    delete story.dataset.waymakingComplete;
    brush.setAttribute('stroke-dashoffset', '1000');
    featherPaths.forEach(path => path.setAttribute('stroke-dashoffset', '1000'));
    beats.forEach(beat => beat.classList.remove('is-current'));
    if (!enhanced) return;
    for (const item of labels) {
      item.heading.textContent = item.label;
      item.heading.removeAttribute('aria-label');
      item.paragraph.style.removeProperty('color');
    }
    labels = [];
    enhanced = false;
  };

  const letterWeight = (phase, beatIndex, glyphIndex, glyphCount) => {
    const order = glyphCount <= 1 ? 0 : glyphIndex / (glyphCount - 1);
    // Each word of the previous heading dims from its first glyph onward,
    // while the next heading becomes dark along the same reading direction.
    const offset = order * 0.48;
    const entering = beatIndex === 0 ? 1 : smooth((phase - (beatIndex - 1) - offset) / 0.52);
    const leaving = beatIndex === beats.length - 1
      ? 1
      : 1 - smooth((phase - beatIndex - offset) / 0.52);
    return Math.min(entering, leaving);
  };

  const update = () => {
    frame = 0;
    // If AVIF cannot load inside SVG, preserve the static matching WebP.
    if (reduced.matches || !picture.currentSrc.endsWith('.avif')) {
      clearEnhancement();
      return;
    }
    makeLetters();

    const focus = window.innerHeight * 0.51;
    const centers = beats.map(beat => {
      const rect = beat.getBoundingClientRect();
      return rect.top + rect.height / 2;
    });

    // Continuous progression across real section centres, in either direction.
    // No threshold-based beat jumps or scroll hijacking.
    let phase = 0;
    if (focus <= centers[0]) phase = 0;
    else if (focus >= centers[centers.length - 1]) phase = beats.length - 1;
    else for (let i = 0; i < centers.length - 1; i++) {
      if (focus <= centers[i + 1]) {
        phase = i + (focus - centers[i]) / Math.max(1, centers[i + 1] - centers[i]);
        break;
      }
    }

    const fraction = phase / (beats.length - 1);
    const revealed = clamp(0.025 + fraction * 0.975);
    // A fully opaque stroke paints the completed route. Seven increasingly
    // transparent brush layers feather the moving tip into the white paper.
    // This avoids the abrupt flat cut visible in the earlier single cap.
    // Gradually narrow the translucent brush tip as the road completes,
    // so the final unmasked original appears without a sudden visual jump.
    const frontLength = Math.min(revealed, 0.11, (1 - revealed) * 0.5);
    const solid = revealed - frontLength;
    brush.setAttribute('stroke-dashoffset', String(Math.round(1000 * (1 - solid))));
    featherPaths.forEach((path, index) => {
      const partial = solid + frontLength * ((index + 1) / featherPaths.length);
      path.setAttribute('stroke-dashoffset', String(Math.round(1000 * (1 - partial))));
    });
    story.dataset.waymakingPainted = 'true';
    if (revealed >= 0.999) story.dataset.waymakingComplete = 'true';
    else delete story.dataset.waymakingComplete;

    // Darker muted colors on mobile preserve paragraph contrast when ink sits
    // behind the words (normal body text stays above 4.5:1 even over the brush).
    const fromHeading = narrow.matches ? [55, 75, 94] : dimTitle;
    const fromBody = narrow.matches ? [45, 63, 83] : dimBody;
    for (let i = 0; i < labels.length; i++) {
      const item = labels[i];
      const n = item.spans.length;
      for (let j = 0; j < n; j++) {
        const ink = letterWeight(phase, i, j, n);
        const color = blend(fromHeading, activeTitle, ink);
        if (item.spans[j].style.color !== color) item.spans[j].style.color = color;
      }
      // Body text has a gentler, still high-contrast transition.
      const weight = smooth(1 - Math.abs(phase - i));
      const bodyColor = blend(fromBody, activeBody, weight);
      if (item.paragraph.style.color !== bodyColor) item.paragraph.style.color = bodyColor;
      beats[i].classList.toggle('is-current', Math.round(phase) === i);
    }
  };

  const requestUpdate = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', requestUpdate, { passive: true });
  addEventListener('pageshow', requestUpdate);
  reduced.addEventListener('change', requestUpdate);
  narrow.addEventListener('change', requestUpdate);
  picture.addEventListener('load', requestUpdate);
  requestUpdate();
})();
