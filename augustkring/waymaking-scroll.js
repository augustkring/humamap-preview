/*
 * Waymaking V14: the complete approved road is a native CSS sticky illustration
 * within a tall grid row. Only letter/paragraph focus is enhanced with JS.
 * No JavaScript writes to the road, masks, clipping or visibility.
 */
(() => {
  const story = document.querySelector('[data-waymaking-story]');
  const beats = story ? [...story.querySelectorAll('.waymaking-beat')] : [];
  if (!story || beats.length !== 5) return;

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

  const update = () => {
    frame = 0;
    if (reduced.matches) {
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
    if (focus >= centers[centers.length - 1]) {
      phase = beats.length - 1;
    } else if (focus > centers[0]) {
      for (let i = 0; i < centers.length - 1; i++) {
        if (focus <= centers[i + 1]) {
          phase = i + (focus - centers[i]) / Math.max(1, centers[i + 1] - centers[i]);
          break;
        }
      }
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
  schedule();
})();
