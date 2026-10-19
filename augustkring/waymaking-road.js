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
    [104, 0, .54], [98, 76, .72], [112, 150, .43], [84, 224, .78],
    [76, 310, .51], [108, 386, .74], [122, 466, .45], [91, 546, .80],
    [78, 628, .49], [111, 706, .76], [126, 786, .44], [94, 868, .79],
    [80, 950, .50], [109, 1028, .75], [123, 1107, .46], [101, 1187, .77],
    [108, 1280, .55]
  ];

  const rightEdge = [
    [256, 0, .66], [248, 82, .45], [266, 156, .79], [232, 228, .52],
    [224, 314, .73], [258, 390, .47], [272, 470, .81], [240, 550, .50],
    [228, 632, .74], [262, 710, .46], [276, 790, .79], [244, 872, .49],
    [231, 954, .76], [260, 1032, .44], [273, 1111, .80], [251, 1191, .48],
    [258, 1280, .67]
  ];

  const centre = [
    [180, 0, .55], [173, 79, .62], [190, 153, .47], [158, 226, .70],
    [150, 312, .52], [183, 388, .68], [197, 468, .46], [165, 548, .72],
    [152, 630, .49], [186, 708, .69], [201, 788, .45], [169, 870, .71],
    [155, 952, .50], [184, 1030, .69], [198, 1109, .47], [176, 1189, .70],
    [183, 1280, .57]
  ];

  const edgeOptions = {
    size: 22,
    thinning: .42,
    smoothing: .28,
    streamline: .10,
    simulatePressure: false,
    last: true,
    start: { cap: true, taper: 0 },
    end: { cap: true, taper: 0 }
  };

  addStroke(leftEdge, edgeOptions, 'waymaking-road-edge waymaking-road-edge--left', '#5f7184', .60);
  addStroke(rightEdge, edgeOptions, 'waymaking-road-edge waymaking-road-edge--right', '#5f7184', .60);

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
        size: 7.4,
        thinning: .24,
        smoothing: .32,
        streamline: .10,
        simulatePressure: false,
        last: true,
        start: { cap: true, taper: 0 },
        end: { cap: true, taper: 0 }
      },
      'waymaking-road-centre',
      '#8795a5',
      .52
    );
  });

  if (fallback) fallback.setAttribute('hidden', '');
  svg.classList.add('is-freehand');
}
