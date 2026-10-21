/*
 * Waymaking V5: native-scroll, centered editorial chapters and painted road.
 * The approved road is always the SAME complete image, at a fixed
 * viewport coordinate. Neither opacity, paint progression nor image
 * position changes with scrolling. The story's viewport intersection
 * merely CLIPS this stationary image at the scene's beginning/end.
 * Only the optional foreground heading emphasis responds to scroll.
 * Reduced-motion and no-JavaScript visitors see the complete illustration and
 * ordinary semantic headings. The artwork retains its original pixels.
 */
(() => {
  const story = document.querySelector('[data-waymaking-story]');
  const scene = story?.querySelector('[data-waymaking-scene]');
  // The authored SVG mask remains in the DOM for asset provenance but is
  // never displayed or animated. The source <picture> is the full artwork.
  const picture = scene?.querySelector('.waymaking-road-art img');
  const road = scene?.querySelector('.waymaking-road-wrap');
  const beats = scene ? [...scene.querySelectorAll('.waymaking-beat')] : [];
  const firstBeat = beats[0];
  const firstHeading = firstBeat?.querySelector('h3');
  const conclusion = story?.querySelector('.waymaking-resolution');
  if (!story || !scene || !road || !picture || !firstHeading ||
      !firstBeat || !conclusion || beats.length !== 5) return;

  // CSS alone owns the artwork coordinates and constant pixel opacity.
  // Updating a clip boundary does not move or repaint the artwork itself.
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
        // A separate class is crucial. The Waymaking Ventures logo also
        // uses "waymaking-word" and gives it a fixed 32px font size.
        word.className = 'waymaking-heading-word';
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
    delete road.dataset.waymakingPainted;
    delete road.dataset.waymakingComplete;
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

  // The artwork is a persistent viewport fixture, not a section-bound
  // sticky element. Moving the existing DOM node directly under body keeps it
  // out of Waymaking's clipping/stacking context and preserves the exact ink.
  // This runs only with JS; the original in-flow artwork is the no-JS fallback.
  road.dataset.waymakingViewport = 'true';
  document.body.appendChild(road);

  // A single FULL illustration is fixed behind the scrolling copy.
  // Clip it to the portion of the viewport occupied by the story, so it
  // neither pops into existence at an arbitrary threshold nor leaks into
  // the final Waymaker statement or the following page sections.
  const updateBackdropClip = () => {
    const illustration = road.getBoundingClientRect();
    const sceneTop = scene.getBoundingClientRect().top;
    const signoffTop = conclusion.querySelector('p').getBoundingClientRect().top;
    // Pre-roll the stationary background into view before the first heading
    // reaches the reading area; it is fully visible across all chapter centres.
    // This is viewport clipping, not image movement or opacity animation.
    const visualEntry = sceneTop - illustration.height * 0.45;
    const visibleTop = Math.max(illustration.top, visualEntry);
    const visibleBottom = Math.min(illustration.bottom, signoffTop - 64);

    if (visibleBottom <= visibleTop) {
      road.style.setProperty('--waymaking-clip-top', illustration.height + 'px');
      road.style.setProperty('--waymaking-clip-bottom', '0px');
      return;
    }

    road.style.setProperty('--waymaking-clip-top',
      Math.max(0, visibleTop - illustration.top).toFixed(2) + 'px');
    road.style.setProperty('--waymaking-clip-bottom',
      Math.max(0, illustration.bottom - visibleBottom).toFixed(2) + 'px');
  };
  const update = () => {
    frame = 0;
    updateBackdropClip();
    // AVIF and WebP are both legitimate image sources. The old guard
    // silently DISABLED painting on browsers that select the WebP fallback.
    // The SVG's image source uses WebP for cross-browser consistency.
    if (reduced.matches) {
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

    // The approved road pixels never change with scroll. Only the text focus
    // below can change; all SVG painting is intentionally retired.
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
  // Only JavaScript-enhanced sessions hide the off-stage illustration;
  // no-JavaScript visitors retain the original static document rendering.
  story.dataset.waymakingReady = 'true';
  // Avoid a one-frame empty flash on initial load and restored scroll pages.
  update();
})();
