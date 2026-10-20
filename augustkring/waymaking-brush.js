/*
 * Waymaking road — artist brush-tip renderer.
 *
 * The brush tip is David Revoy's 3_rake.png from his CC0 Krita brush kit
 * (public domain), mirrored at taro-0/krita-brushes.
 * We stamp the real rake-brush texture along two controlled S-curves.
 * No animation and no external runtime dependency.
 */
(() => {
  const canvas = document.querySelector('[data-waymaking-rake-road]');
  if (!canvas) return;

  const fallback = document.querySelector('[data-waymaking-fallback]');
  const brushImage = new Image();
  brushImage.decoding = 'async';
  brushImage.src = 'assets/waymaking-rake-brush.png?v=20261019-rake-v1';

  const ink = { r: 67, g: 86, b: 108 }; // --muted

  const makeTintedBrush = image => {
    const source = document.createElement('canvas');
    source.width = image.naturalWidth;
    source.height = image.naturalHeight;
    const sctx = source.getContext('2d', { willReadFrequently: true });
    sctx.drawImage(image, 0, 0);

    const pixels = sctx.getImageData(0, 0, source.width, source.height);
    const d = pixels.data;

    let alphaPixels = 0;
    let lumSum = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] > 8) {
        alphaPixels += 1;
        lumSum += (d[i] + d[i + 1] + d[i + 2]) / 3;
      }
    }
    const meanLum = alphaPixels ? lumSum / alphaPixels : 0;
    const lightInk = meanLum > 128;

    for (let i = 0; i < d.length; i += 4) {
      const sourceAlpha = d[i + 3] / 255;
      const lum = (d[i] + d[i + 1] + d[i + 2]) / (3 * 255);
      const density = sourceAlpha * (lightInk ? lum : 1 - lum);
      d[i] = ink.r;
      d[i + 1] = ink.g;
      d[i + 2] = ink.b;
      d[i + 3] = Math.round(Math.max(0, Math.min(1, density)) * 255);
    }
    sctx.putImageData(pixels, 0, 0);
    return source;
  };

  const centreX = t =>
    0.50 +
    0.165 * Math.sin(t * Math.PI * 2 - 0.62) +
    0.048 * Math.sin(t * Math.PI * 4 + 0.38) +
    0.016 * Math.sin(t * Math.PI * 6 + 1.08);

  const halfRoad = t =>
    0.17 +
    0.012 * Math.sin(t * Math.PI * 2 + 0.85) +
    0.006 * Math.sin(t * Math.PI * 5 - 0.35);

  const edgePoint = (t, side, w, h) => {
    const independentWobble = side < 0
      ? 0.012 * Math.sin(t * Math.PI * 6 + 0.32)
      : 0.009 * Math.sin(t * Math.PI * 5 + 1.12);
    return {
      x: (centreX(t) + side * halfRoad(t) + independentWobble) * w,
      y: t * h
    };
  };

  const centrePoint = (t, w, h) => ({
    x: centreX(t) * w,
    y: t * h
  });

  const tangentAngle = (pointFn, t, w, h) => {
    const e = 0.0012;
    const a = pointFn(Math.max(0, t - e), w, h);
    const b = pointFn(Math.min(1, t + e), w, h);
    return Math.atan2(b.y - a.y, b.x - a.x);
  };

  const stamp = (ctx, brush, x, y, angle, size, alpha, stretch = 1) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;
    ctx.drawImage(
      brush,
      -size * stretch * 0.5,
      -size * 0.5,
      size * stretch,
      size
    );
    ctx.restore();
  };

  const paintEdge = (ctx, brush, side, w, h, seedOffset) => {
    const spacing = Math.max(4.8, w * 0.038);
    const steps = Math.ceil(h / spacing);
    const baseSize = Math.max(15, w * 0.16);

    for (let i = 0; i <= steps; i += 1) {
      // Intentional dry gaps stop the edge becoming one synthetic vector rail.
      const dryPhase = (i + seedOffset) % 23;
      if (dryPhase === 10 || dryPhase === 11) continue;

      const t = i / steps;
      const p = edgePoint(t, side, w, h);
      const angle = tangentAngle(
        (tt, ww, hh) => edgePoint(tt, side, ww, hh),
        t,
        w,
        h
      );

      const wave = Math.sin((i + seedOffset) * 0.61);
      const slow = Math.sin((i + seedOffset) * 0.11);
      const size = baseSize * (0.90 + 0.12 * wave + 0.055 * slow);
      const normal = angle + Math.PI / 2;
      const drift = 1.15 * Math.sin((i + seedOffset) * 0.37);
      const angleJitter = 0.045 * Math.sin((i + seedOffset) * 0.47);

      // Main pigment. Fewer, larger stamps preserve the real rake texture.
      stamp(
        ctx,
        brush,
        p.x + Math.cos(normal) * drift,
        p.y + Math.sin(normal) * drift,
        angle + angleJitter,
        size,
        0.056 + 0.020 * (wave + 1) / 2,
        0.84
      );

      // Sparse dry-brush echo sits slightly outside the road edge.
      if (i % 4 === 0) {
        const echo = side * (1.6 + 0.7 * Math.sin(i * 0.23));
        stamp(
          ctx,
          brush,
          p.x + Math.cos(normal) * echo,
          p.y + Math.sin(normal) * echo,
          angle - angleJitter * 0.55,
          size * 0.88,
          0.026,
          0.96
        );
      }
    }
  };

  const paintCentreMarks = (ctx, brush, w, h) => {
    const ranges = [
      [0.065, 0.102],
      [0.205, 0.242],
      [0.347, 0.385],
      [0.492, 0.529],
      [0.638, 0.675],
      [0.782, 0.819],
      [0.912, 0.948]
    ];
    const size = Math.max(7.2, w * 0.066);

    ranges.forEach(([a, b], index) => {
      const lengthPx = (b - a) * h;
      const steps = Math.max(3, Math.ceil(lengthPx / Math.max(4.2, w * 0.029)));
      for (let i = 0; i <= steps; i += 1) {
        const t = a + (b - a) * (i / steps);
        const p = centrePoint(t, w, h);
        const angle = tangentAngle(centrePoint, t, w, h);
        const wiggle = Math.sin((i + index * 7) * 0.63) * 0.35;
        stamp(
          ctx,
          brush,
          p.x + Math.cos(angle + Math.PI / 2) * wiggle,
          p.y + Math.sin(angle + Math.PI / 2) * wiggle,
          angle,
          size * (0.92 + 0.08 * Math.sin(i * 0.71)),
          0.042,
          0.58
        );
      }
    });
  };

  const render = brush => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.round(rect.width * dpr);
    const height = Math.round(rect.height * dpr);
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.scale(dpr, dpr);

    paintEdge(ctx, brush, -1, rect.width, rect.height, 11);
    paintEdge(ctx, brush, 1, rect.width, rect.height, 43);
    paintCentreMarks(ctx, brush, rect.width, rect.height);

    canvas.dataset.paintReady = 'true';
    if (fallback) fallback.setAttribute('hidden', '');
  };

  brushImage.addEventListener('load', () => {
    const tinted = makeTintedBrush(brushImage);
    requestAnimationFrame(() => render(tinted));

    if ('ResizeObserver' in window) {
      let raf = 0;
      const observer = new ResizeObserver(() => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => render(tinted));
      });
      observer.observe(canvas);
    }
  }, { once: true });
})();
