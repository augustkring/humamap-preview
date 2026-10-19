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
    strokeWidth: 3,
    roughness: 1.85,
    bowing: 1.35,
    maxRandomnessOffset: 2.2,
    preserveVertices: true,
    seed
  });

  // Two independently generated edges make the road read as a drawing,
  // rather than a single styled line or a filled graphic shape.
  decorate(
    rc.path(centrePath, edgeOptions(41)),
    'waymaking-road-edge waymaking-road-edge--left',
    0.82,
    'translate(-42 0)'
  );
  decorate(
    rc.path(centrePath, edgeOptions(67)),
    'waymaking-road-edge waymaking-road-edge--right',
    0.82,
    'translate(42 0)'
  );

  // Rough.js supports native dash arrays, so the centre markings inherit
  // the same hand-drawn geometry instead of being perfect CSS dashes.
  decorate(
    rc.path(centrePath, {
      stroke: centreColour,
      strokeWidth: 2,
      roughness: 1.2,
      bowing: 0.9,
      maxRandomnessOffset: 1.45,
      preserveVertices: true,
      disableMultiStroke: true,
      strokeLineDash: [16, 22, 9, 18, 14, 24],
      strokeLineDashOffset: 5,
      seed: 83
    }),
    'waymaking-road-centre',
    0.72
  );

  if (fallback) fallback.setAttribute('hidden', '');
  svg.classList.add('is-rough');
})();
