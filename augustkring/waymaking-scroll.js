/*
 * Waymaking V17: exact original brush is extended and viewport FIXED.
 * Only the SVG mask draw length + entrance/exit opacity change with scroll.
 * Its screen coordinates NEVER change while the five shorter chapters pass.
 */
(() => {
  const story = document.querySelector('[data-waymaking-story]');
  const beats = story ? [...story.querySelectorAll('.waymaking-beat')] : [];
  const road = story?.querySelector('.waymaking-road-wrap');
  const summary = document.querySelector('.thread-summary');
  const signoff = story?.querySelector('.waymaking-resolution p');
  const revealPaths = story ? [...story.querySelectorAll('[data-waymaking-reveal]')] : [];
  if (!story || !road || !summary || !signoff || beats.length !== 5 || revealPaths.length !== 1) return;
  const strokes = revealPaths.map(path => {
    const length = path.getTotalLength();
    const feathers = [...path.parentElement.querySelectorAll('[data-waymaking-feather]')];
    if (!(length > 0) || feathers.length !== 7) return null;
    path.style.strokeDasharray = length + ' ' + length;
    for (const feather of feathers) {
      feather.style.strokeDasharray = length + ' ' + length;
    }
    return {path,length,feathers};
  }).filter(Boolean);
  if (strokes.length !== 1) return;
  road.dataset.waymakingViewport = 'true';
  document.body.appendChild(road);
  story.dataset.waymakingAnimated = 'true';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = window.matchMedia('(max-width: 900px)');
  const clamp = value => Math.min(1, Math.max(0, value));
  const smooth = x => { const v = clamp(x); return v * v * (3 - 2 * v); };
  const titleDim = [92, 107, 122];
  const titleActive = [11, 34, 61];
  const bodyDim = [81, 101, 121];
  const bodyActive = [38, 59, 83];
  const blend = (from, to, amount) =>
    'rgb(' + from.map((value, i) => Math.round(value + (to[i] - value) * amount)).join(',') + ')';

  let frame = 0;
  let labels = [];
  let previousFraction = -1;
  const paintStages = [0.16, 0.37, 0.59, 0.80, 1];

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

  const glyphWeight = (phase, beat, index, length) => {
    const offset = (length <= 1 ? 0 : index / (length - 1)) * 0.48;
    const entering = beat === 0 ? 1 : smooth((phase - (beat - 1) - offset) / 0.52);
    const leaving = beat === beats.length - 1
      ? 1 : 1 - smooth((phase - beat - offset) / 0.52);
    return Math.min(entering, leaving);
  };

  // The road is a fixed body child, and these are ONLY visibility gates.
  // No scroll handler writes its geometry or transforms.
  const updateVisibility = () => {
    const vh=window.innerHeight;
    const firstTop=beats[0].getBoundingClientRect().top;
    const summaryBottom=summary.getBoundingClientRect().bottom;
    const lastCopyBottom=beats[4].querySelector('.waymaking-copy').getBoundingClientRect().bottom;
    const signoffTop=signoff.getBoundingClientRect().top;
    const storyBottom=story.getBoundingClientRect().bottom;
    const arriving=smooth((vh*.97-firstTop)/Math.max(1,vh*.23))*
      smooth((vh*.84-summaryBottom)/Math.max(1,vh*.23));
    const departure=lastCopyBottom<vh*.36
      ?smooth((vh*.88-signoffTop)/Math.max(1,vh*.38)) :0;
    const alpha=Math.max(0,Math.min(1,arriving*(1-departure)));
    if(firstTop<vh&&storyBottom>0&&signoffTop>0&&alpha>.001)
      document.body.dataset.waymakingRoadActive='true';
    else delete document.body.dataset.waymakingRoadActive;
    road.style.setProperty('--waymaking-visibility-opacity',alpha.toFixed(4));
  };

  const update = () => {
    frame = 0;
    updateVisibility();
    if (reduced.matches) {
      /* Reduced motion keeps the fully painted original at this fixed point. */
      for (const {path,feathers} of strokes) {
        path.style.strokeDashoffset = '0';
        for (const feather of feathers) feather.style.strokeDashoffset = '0';
      }
      story.dataset.waymakingProgress = '1.000';
      previousFraction = 1;
      resetText();
      return;
    }
    prepareText();

    const focus = window.innerHeight * 0.51;
    const centers = beats.map(beat => {
      const bounds = beat.getBoundingClientRect();
      return bounds.top + bounds.height * 0.5;
    });

    let phase = 0;
    let fraction = 0;
    if (focus <= centers[0]) {
      // Start the ink as Creative Thinking ENTERS the viewport. Do not wait
      // until the heading is near the top and do not paint the completed road.
      const top = beats[0].getBoundingClientRect().top;
      const entry = smooth((window.innerHeight * 0.94 - top) /
        Math.max(1, window.innerHeight * 0.70));
      fraction = entry * paintStages[0];
    } else if (focus >= centers[centers.length - 1]) {
      phase = beats.length - 1;
      fraction = 1;
    } else {
      for (let i = 0; i < centers.length - 1; i++) {
        if (focus <= centers[i + 1]) {
          const local = clamp((focus - centers[i]) /
            Math.max(1, centers[i + 1] - centers[i]));
          phase = i + local;
          fraction = paintStages[i] + (paintStages[i + 1] - paintStages[i]) * local;
          break;
        }
      }
    }
    if (Math.abs(fraction - previousFraction) > 0.00025) {
      // Seven translucent brush layers feather the leading ink tip. The
      // geometric mask travels continuously, not in five jumped pieces.
      // Narrow the tip to zero at completion so the full road is crisp.
      const frontLength = Math.min(fraction, 0.055, (1 - fraction) * 0.55);
      const solid = fraction - frontLength;
      for (const {path,length,feathers} of strokes) {
        path.style.strokeDashoffset = String(length * (1 - solid));
        feathers.forEach((feather,index) => {
          const tip = solid + frontLength * ((index + 1) / feathers.length);
          feather.style.strokeDashoffset = String(length * (1 - tip));
        });
      }
      previousFraction = fraction;
      story.dataset.waymakingProgress = fraction.toFixed(3);
    }

    const fromTitle = narrow.matches ? [55, 75, 94] : titleDim;
    const fromBody = narrow.matches ? [45, 63, 83] : bodyDim;
    for (let i = 0; i < labels.length; i++) {
      const item = labels[i];
      for (let j = 0; j < item.letters.length; j++) {
        const value = blend(fromTitle, titleActive,
          glyphWeight(phase, i, j, item.letters.length));
        if (item.letters[j].style.color !== value) item.letters[j].style.color = value;
      }
      const value = blend(fromBody, bodyActive, smooth(1 - Math.abs(phase - i)));
      if (item.paragraph.style.color !== value) item.paragraph.style.color = value;
      beats[i].classList.toggle('is-current', Math.round(phase) === i);
    }
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  addEventListener('pageshow', schedule);
  reduced.addEventListener('change', schedule);
  narrow.addEventListener('change', schedule);
  // The mask is in the correct position from the first enhanced frame.
  update();
})();
