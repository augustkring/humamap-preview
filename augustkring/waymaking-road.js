/*
 * Waymaking road renderer.
 * Uses Rough.js 4.6.6 (MIT, Preet Shihn / rough-stuff) for the actual
 * hand-drawn stroke generation. The SVG keeps a lightweight fallback
 * so the narrative remains intact if the external library is unavailable.
 * https://roughjs.com/
 */
(() => {
  const svg = document.querySelector('[data-waymaking-road]');
  if (!svg || !window.rough || typeof window.rough.svg !== 'function') return;

  const rc = window.rough.svg(svg);
  const fallback = svg.querySelector('[data-waymaking-road-fallback]');
  const leftEdgePath = 'M137 0 C67 136 223 247 121 360 C39 470 230 568 130 690 C44 806 226 914 114 1038 C52 1118 190 1210 133 1280';
  const rightEdgePath = 'M223 0 C155 144 309 240 207 360 C126 465 315 575 218 690 C130 800 311 919 201 1038 C139 1116 279 1204 220 1280';
  const centrePath = 'M180 0 C112 140 265 244 164 360 C82 468 272 570 174 690 C86 804 268 915 158 1038 C96 1118 234 1208 177 1280';
  const edgeColour = '#586a7d';
  const centreColour = '#748397';

  const decorate = (node, className, opacity, transform) => {
    node.setAttribute('class', className);
    if (opacity != null) node.setAttribute('opacity', String(opacity));
    if (transform) node.setAttribute('transform', transform);

    node.querySelectorAll('path').forEach(path => {
      path.setAttribute('vector-effect', 'non-scaling-stroke');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
    });

    svg.appendChild(node);
    return node;
  };

  const edgeOptions = seed => ({
    stroke: edgeColour,
    strokeWidth: 3.4,
    roughness: 2.65,
    bowing: 2.15,
    maxRandomnessOffset: 3.6,
    preserveVertices: true,
    seed
  });

  // Two independently generated edges make the road read as a drawing,
  // rather than a single styled line or a filled graphic shape.
  decorate(
    rc.path(leftEdgePath, edgeOptions(41)),
    'waymaking-road-edge waymaking-road-edge--left',
    0.74
  );
  decorate(
    rc.path(rightEdgePath, edgeOptions(67)),
    'waymaking-road-edge waymaking-road-edge--right',
    0.74
  );

  // Rough.js supports native dash arrays, so the centre markings inherit
  // the same hand-drawn geometry instead of being perfect CSS dashes.
  decorate(
    rc.path(centrePath, {
      stroke: centreColour,
      strokeWidth: 2.1,
      roughness: 1.75,
      bowing: 1.2,
      maxRandomnessOffset: 2,
      preserveVertices: true,
      disableMultiStroke: false,
      strokeLineDash: [16, 22, 9, 18, 14, 24],
      strokeLineDashOffset: 5,
      seed: 83
    }),
    'waymaking-road-centre',
    0.6
  );

  if (fallback) fallback.setAttribute('hidden', '');
  svg.classList.add('is-rough');
})();
