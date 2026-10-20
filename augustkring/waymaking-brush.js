/*
 * Waymaking road — continuous dry-brush texture warped along the road.
 *
 * Brush source: src/assets/ink/dry-brush.png from nomagicln/gomoko-must-win
 * (MIT, copyright 2026 nomagicln). The source is one long transparent
 * sumi-style dry-brush stroke. Instead of stamping or slicing the texture,
 * this renderer samples the original brush continuously along the road curve,
 * preserving real fibres and pigment breaks without digital banding.
 *
 * No animation and no external runtime dependency.
 */
(() => {
  const canvas = document.querySelector('[data-waymaking-ink-road]');
  if (!canvas) return;

  const fallback = document.querySelector('[data-waymaking-fallback]');
  const brushImage = new Image();
  brushImage.decoding = 'async';
  brushImage.src = 'assets/waymaking-dry-brush.png?v=20261020-ink-v1';

  const ink = { r: 67, g: 86, b: 108 }; // --muted

  const prepareBrush = image => {
    const source = document.createElement('canvas');
    source.width = image.naturalWidth;
    source.height = image.naturalHeight;
    const sctx = source.getContext('2d', { willReadFrequently: true });
    sctx.drawImage(image, 0, 0);

    const pixels = sctx.getImageData(0, 0, source.width, source.height);
    const d = pixels.data;
    let minX = source.width;
    let minY = source.height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < source.height; y += 1) {
      for (let x = 0; x < source.width; x += 1) {
        const i = (y * source.width + x) * 4;
        const alpha = d[i + 3] / 255;
        const lum = (d[i] + d[i + 1] + d[i + 2]) / (3 * 255);
        const density = alpha * (1 - lum);
        if (density > 0.018) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    if (maxX < minX || maxY < minY) return null;

    const pad = 3;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(source.width - 1, maxX + pad);
    maxY = Math.min(source.height - 1, maxY + pad);

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    const cropped = sctx.getImageData(minX, minY, width, height);
    const cd = cropped.data;
    const alphaField = new Float32Array(width * height);

    for (let p = 0; p < width * height; p += 1) {
      const i = p * 4;
      const alpha = cd[i + 3] / 255;
      const lum = (cd[i] + cd[i + 1] + cd[i + 2]) / (3 * 255);
      alphaField[p] = Math.pow(Math.max(0, alpha * (1 - lum)), 0.72);
    }

    return { width, height, alpha: alphaField };
  };

  const centreX = t =>
    0.50 +
    0.182 * Math.sin(t * Math.PI * 2 - 0.78) +
    0.034 * Math.sin(t * Math.PI * 4 + 0.52);

  const halfRoad = t =>
    0.123 +
    0.006 * Math.sin(t * Math.PI * 2 + 0.72);

  const edgeX = (t, side) => {
    const wobble = side < 0
      ? 0.006 * Math.sin(t * Math.PI * 6 + 0.28) + 0.0027 * Math.sin(t * Math.PI * 10 + 0.48)
      : 0.0055 * Math.sin(t * Math.PI * 6 + 1.62) + 0.0025 * Math.sin(t * Math.PI * 10 + 2.18);
    return centreX(t) + side * halfRoad(t) + wobble;
  };

  const sampleBrush = (brush, sx, sy) => {
    if (sx < 0 || sy < 0 || sx >= brush.width - 1 || sy >= brush.height - 1) return 0;

    const x0 = Math.floor(sx);
    const y0 = Math.floor(sy);
    const x1 = x0 + 1;
    const y1 = y0 + 1;
    const fx = sx - x0;
    const fy = sy - y0;
    const row0 = y0 * brush.width;
    const row1 = y1 * brush.width;
    const a00 = brush.alpha[row0 + x0];
    const a10 = brush.alpha[row0 + x1];
    const a01 = brush.alpha[row1 + x0];
    const a11 = brush.alpha[row1 + x1];
    const top = a00 + (a10 - a00) * fx;
    const bottom = a01 + (a11 - a01) * fx;
    return top + (bottom - top) * fy;
  };

  const compositeAlpha = (field, index, value) => {
    field[index] = 1 - (1 - field[index]) * (1 - value);
  };

  const paintWarpedStroke = (
    field,
    brush,
    width,
    height,
    {
      pointX,
      t0 = 0,
      t1 = 1,
      source0 = 0.02,
      source1 = 0.98,
      reverse = false,
      thickness,
      opacity,
      phase = 0
    }
  ) => {
    const yStart = Math.max(0, Math.floor(t0 * (height - 1)));
    const yEnd = Math.min(height - 1, Math.ceil(t1 * (height - 1)));
    const radius = Math.ceil(thickness * 0.72);

    for (let y = yStart; y <= yEnd; y += 1) {
      const t = y / (height - 1);
      const u = Math.max(0, Math.min(1, (t - t0) / Math.max(0.0001, t1 - t0)));
      const sourceU = reverse
        ? source1 - (source1 - source0) * u
        : source0 + (source1 - source0) * u;
      const sx = sourceU * (brush.width - 1);
      const cx = pointX(t) * width;
      const pressure = 0.94 + 0.06 * Math.sin(t * Math.PI * 3.4 + phase);
      const localThickness = thickness * pressure;

      for (let x = Math.max(0, Math.floor(cx - radius)); x <= Math.min(width - 1, Math.ceil(cx + radius)); x += 1) {
        const sy = (brush.height - 1) * 0.5 + (x - cx) * ((brush.height - 1) / localThickness);
        const pigment = sampleBrush(brush, sx, sy);
        if (pigment <= 0.001) continue;
        compositeAlpha(field, y * width + x, Math.min(1, pigment * opacity));
      }
    }
  };

  const paintRoad = (field, brush, width, height) => {
    const edgeThickness = Math.max(16, Math.min(28, width * 0.105));

    paintWarpedStroke(field, brush, width, height, {
      pointX: t => edgeX(t, -1),
      reverse: false,
      thickness: edgeThickness,
      opacity: 0.37,
      phase: 0.28
    });

    paintWarpedStroke(field, brush, width, height, {
      pointX: t => edgeX(t, 1),
      reverse: true,
      thickness: edgeThickness * 0.94,
      opacity: 0.35,
      phase: 1.62
    });
  };

  const paintCentreMarks = (field, brush, width, height) => {
    const ranges = [
      [0.065, 0.105],
      [0.194, 0.235],
      [0.325, 0.366],
      [0.458, 0.500],
      [0.594, 0.635],
      [0.728, 0.770],
      [0.864, 0.905]
    ];
    const thickness = Math.max(7, Math.min(12, width * 0.040));

    ranges.forEach(([a, b], index) => {
      paintWarpedStroke(field, brush, width, height, {
        pointX: t => centreX(t) + 0.0017 * Math.sin(t * Math.PI * 8 + index * 0.83),
        t0: a,
        t1: b,
        source0: 0.18,
        source1: 0.78,
        reverse: index % 2 === 1,
        thickness,
        opacity: 0.31,
        phase: index * 0.7
      });
    });
  };

  const render = brush => {
    const rect = canvas.getBoundingClientRect();
    if (!brush || rect.width < 1 || rect.height < 1) return;

    // 1.5x is enough to retain real fibre detail at the rendered size while
    // avoiding unnecessary multi-megapixel work on every responsive reflow.
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    const alphaField = new Float32Array(width * height);
    paintRoad(alphaField, brush, width, height);
    paintCentreMarks(alphaField, brush, width, height);

    const ctx = canvas.getContext('2d');
    const image = ctx.createImageData(width, height);
    const out = image.data;

    for (let p = 0; p < alphaField.length; p += 1) {
      const i = p * 4;
      out[i] = ink.r;
      out[i + 1] = ink.g;
      out[i + 2] = ink.b;
      out[i + 3] = Math.round(Math.min(1, alphaField[p]) * 255);
    }

    ctx.putImageData(image, 0, 0);

    canvas.dataset.paintReady = 'true';
    canvas.dataset.brushMaterial = 'continuous-dry-ink';
    canvas.dataset.brushVersion = 'v5-continuous-warp';
    if (fallback) fallback.setAttribute('hidden', '');
  };

  brushImage.addEventListener('load', () => {
    const brush = prepareBrush(brushImage);
    requestAnimationFrame(() => render(brush));

    if ('ResizeObserver' in window) {
      let raf = 0;
      const observer = new ResizeObserver(() => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => render(brush));
      });
      observer.observe(canvas);
    }
  }, { once: true });
})();
