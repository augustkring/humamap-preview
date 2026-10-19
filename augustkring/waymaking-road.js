/*
 * Waymaking road renderer.
 * Uses perfect-freehand 1.2.3 (MIT, Steve Ruiz) to turn deliberately
 * imperfect point sequences into variable-width marker strokes.
 * https://github.com/steveruizok/perfect-freehand
 */
import { getStroke } from 'https://unpkg.com/perfect-freehand@1.2.3/dist/esm/index.mjs';

const SVG_NS = 'http://www.w3.org/2000/svg';
const svg = document.querySelector('[data-waymaking-road]');

if (svg) {
  const fallback = svg.querySelector('[data-waymaking-road-fallback]');

  const average = (a, b) => (a + b) / 2;

  // Adapted from perfect-freehand's MIT-licensed SVG rendering example.
  const getSvgPathFromStroke = points => {
    if (points.length < 4) return '';

    let a = points[0];
    let b = points[1];
    const c = points[2];

    let result =
      `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(2)} ` +
      `${average(b[0], c[0]).toFixed(2)},${average(b[1], c[1]).toFixed(2)} T`;

    for (let i = 2; i < points.length - 1; i += 1) {
      a = points[i];
      b = points[i + 1];
      result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(2)} `;
    }

    return result + 'Z';
  };

  const addStroke = (points, options, className, fill, opacity) => {
    const outline = getStroke(points, options);
    const d = getSvgPathFromStroke(outline);
    if (!d) return null;

    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('class', className);
    path.setAttribute('d', d);
    path.setAttribute('fill', fill);
    path.setAttribute('opacity', String(opacity));
    path.setAttribute('aria-hidden', 'true');
    svg.appendChild(path);
    return path;
  };

  // Separate point sets are intentional: the two edges should feel drawn
  // independently, not like one mathematically offset curve.
  const leftEdge = [
    [137, 0, .56], [118, 72, .66], [96, 160, .48], [116, 242, .72],
    [121, 360, .57], [83, 452, .69], [112, 536, .47], [130, 690, .73],
    [92, 796, .53], [120, 892, .68], [114, 1038, .51], [100, 1112, .74],
    [148, 1202, .49], [133, 1280, .61]
  ];

  const rightEdge = [
    [223, 0, .63], [204, 78, .47], [184, 166, .71], [207, 250, .54],
    [207, 360, .65], [169, 450, .48], [202, 548, .74], [218, 690, .58],
    [176, 798, .70], [204, 900, .50], [201, 1038, .68], [184, 1118, .54],
    [232, 1200, .72], [220, 1280, .56]
  ];

  const centre = [
    [180, 0, .55], [160, 74, .62], [140, 160, .50], [162, 248, .66],
    [164, 360, .54], [126, 452, .64], [156, 542, .48], [174, 690, .67],
    [134, 798, .52], [162, 896, .65], [158, 1038, .50], [142, 1116, .68],
    [190, 1200, .51], [177, 1280, .61]
  ];

  const edgeOptions = {
    size: 14,
    thinning: .32,
    smoothing: .55,
    streamline: .22,
    simulatePressure: false,
    last: true,
    start: { cap: true, taper: 0 },
    end: { cap: true, taper: 0 }
  };

  addStroke(leftEdge, edgeOptions, 'waymaking-road-edge waymaking-road-edge--left', '#53667a', .66);
  addStroke(rightEdge, edgeOptions, 'waymaking-road-edge waymaking-road-edge--right', '#53667a', .66);

  // The centre markings are individual marker strokes rather than a CSS
  // dash pattern, so their length, angle and pressure vary naturally.
  const dashGroups = [
    centre.slice(0, 2),
    centre.slice(1, 3),
    centre.slice(2, 4),
    centre.slice(3, 5),
    centre.slice(4, 6),
    centre.slice(5, 7),
    centre.slice(6, 8),
    centre.slice(7, 9),
    centre.slice(8, 10),
    centre.slice(9, 11),
    centre.slice(10, 12),
    centre.slice(11, 13),
    centre.slice(12, 14)
  ];

  dashGroups.forEach((points, index) => {
    // Shorten alternating segments so the centre line never looks typeset.
    const start = points[0];
    const end = points[points.length - 1];
    const t1 = index % 3 === 0 ? .18 : .24;
    const t2 = index % 2 === 0 ? .54 : .62;
    const p1 = [
      start[0] + (end[0] - start[0]) * t1,
      start[1] + (end[1] - start[1]) * t1,
      .46 + (index % 4) * .06
    ];
    const p2 = [
      start[0] + (end[0] - start[0]) * t2,
      start[1] + (end[1] - start[1]) * t2,
      .58 - (index % 3) * .05
    ];

    addStroke(
      [p1, [(p1[0] + p2[0]) / 2 + (index % 2 ? 1.8 : -1.4), (p1[1] + p2[1]) / 2, .55], p2],
      {
        size: 6.2,
        thinning: .24,
        smoothing: .45,
        streamline: .18,
        simulatePressure: false,
        last: true,
        start: { cap: true, taper: 0 },
        end: { cap: true, taper: 0 }
      },
      'waymaking-road-centre',
      '#7b8b9d',
      .56
    );
  });

  if (fallback) fallback.setAttribute('hidden', '');
  svg.classList.add('is-freehand');
}
