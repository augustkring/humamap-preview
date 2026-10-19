/*
 * Waymaking road — art-directed stretch-brush renderer.
 *
 * Uses svg-brush 0.1.5 (MIT, Citizen Codex), an open-source brush deformation
 * engine preloaded with Figma Draw brush geometry. The page uses Figma
 * Grindhouse for the road edges and Figma Blockbuster for the centre marks.
 * No animation.
 */
import { createBrushStroke } from 'https://cdn.jsdelivr.net/npm/svg-brush@0.1.5/+esm';

const svg = document.querySelector('[data-waymaking-brush-road]');

if (svg) {
  const ns = 'http://www.w3.org/2000/svg';

  const left = [
    {x: 30, y: 0}, {x: 27, y: 110}, {x: 34, y: 235}, {x: 25, y: 365},
    {x: 30, y: 505}, {x: 36, y: 640}, {x: 27, y: 775}, {x: 31, y: 920},
    {x: 35, y: 1060}, {x: 28, y: 1190}, {x: 30, y: 1280}
  ];

  const right = [
    {x: 70, y: 0}, {x: 67, y: 112}, {x: 74, y: 233}, {x: 65, y: 368},
    {x: 70, y: 502}, {x: 76, y: 643}, {x: 67, y: 772}, {x: 71, y: 923},
    {x: 75, y: 1057}, {x: 68, y: 1193}, {x: 70, y: 1280}
  ];

  const centre = left.map((point, index) => ({
    x: (point.x + right[index].x) / 2,
    y: point.y
  }));

  const addBrush = (points, options, className) => {
    const d = createBrushStroke(points, options);
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', className);
    path.setAttribute('aria-hidden', 'true');
    svg.appendChild(path);
    return path;
  };

  addBrush(left, {
    brush: 'Figma Grindhouse',
    strokeWidth: 0.42,
    simplificationTolerance: 0.14,
    brushAugmentation: true
  }, 'waymaking-painted-edge');

  addBrush(right, {
    brush: 'Figma Grindhouse',
    strokeWidth: 0.42,
    simplificationTolerance: 0.14,
    brushAugmentation: true
  }, 'waymaking-painted-edge');

  const dashRanges = [
    [52, 104], [180, 235], [310, 365], [444, 502], [585, 638],
    [720, 776], [856, 910], [994, 1047], [1125, 1180]
  ];

  const sampleCentre = y => {
    for (let i = 1; i < centre.length; i += 1) {
      const a = centre[i - 1];
      const b = centre[i];
      if (y <= b.y) {
        const t = (y - a.y) / (b.y - a.y);
        return {x: a.x + (b.x - a.x) * t, y};
      }
    }
    return {x: centre.at(-1).x, y};
  };

  dashRanges.forEach(([start, end], index) => {
    const a = sampleCentre(start);
    const b = sampleCentre(end);
    const mid = sampleCentre((start + end) / 2);
    mid.x += index % 2 === 0 ? -0.7 : 0.8;

    addBrush([a, mid, b], {
      brush: 'Figma Blockbuster',
      strokeWidth: 0.13,
      simplificationTolerance: 0.1,
      brushAugmentation: true
    }, 'waymaking-painted-mark');
  });

  const fallback = svg.querySelector('[data-waymaking-fallback]');
  if (fallback) fallback.setAttribute('hidden', '');
  svg.classList.add('is-painted');
}
