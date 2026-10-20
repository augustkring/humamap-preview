/*
 * Waymaking road — continuous dry-brush texture mapped along the road.
 *
 * Brush source: src/assets/ink/dry-brush.png from nomagicln/gomoko-must-win
 * (MIT, copyright 2026 nomagicln). The source is one long, transparent,
 * sumi-style dry-brush stroke. We crop its real alpha bounds, tint it to the
 * site's muted ink colour, then bend narrow sequential slices along each road
 * edge. The source texture is used once per edge, not tiled or repeatedly
 * stamped, so its real bristle fissures and pressure variation survive.
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

  const cropAndTintBrush = image => {
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

    // This asset is dark ink on transparency. Measure effective pigment rather
    // than raw alpha so faint transparent padding does not inflate the brush.
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

    if (maxX < minX || maxY < minY) return source;

    const pad = 3;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(source.width - 1, maxX + pad);
    maxY = Math.min(source.height - 1, maxY + pad);

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    const croppedData = sctx.getImageData(minX, minY, width, height);
    const cd = croppedData.data;

    for (let i = 0; i < cd.length; i += 4) {
      const alpha = cd[i + 3] / 255;
      const lum = (cd[i] + cd[i + 1] + cd[i + 2]) / (3 * 255);
      const density = Math.pow(Math.max(0, alpha * (1 - lum)), 0.72);
      cd[i] = ink.r;
      cd[i + 1] = ink.g;
      cd[i + 2] = ink.b;
      cd[i + 3] = Math.round(Math.min(1, density) * 255);
    }

    const tinted = document.createElement('canvas');
    tinted.width = width;
    tinted.height = height;
    const tctx = tinted.getContext('2d');
    tctx.putImageData(croppedData, 0, 0);
    return tinted;
  };

  const centreX = t =>
    0.50 +
    0.15 * Math.sin(t * Math.PI * 2 - 0.62) +
    0.045 * Math.sin(t * Math.PI * 4 + 0.38) +
    0.012 * Math.sin(t * Math.PI * 6 + 1.08);

  const halfRoad = t =>
    0.17 +
    0.012 * Math.sin(t * Math.PI * 2 + 0.85) +
    0.006 * Math.sin(t * Math.PI * 5 - 0.35);

  const edgePoint = (t, side, w, h) => {
    const independentWobble = side < 0
      ? 0.018 * Math.sin(t * Math.PI * 6 + 0.32)
      : 0.014 * Math.sin(t * Math.PI * 5 + 1.12);
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

  const drawBrushAlong = (
    ctx,
    brush,
    pointFn,
    w,
    h,
    {
      t0 = 0,
      t1 = 1,
      source0 = 0.035,
      source1 = 0.965,
      reverse = false,
      thickness,
      alpha,
      normalOffset = 0,
      phase = 0
    }
  ) => {
    const targetLength = Math.max(1, (t1 - t0) * h * 1.06);
    const stepPx = Math.max(11, Math.min(15, w * 0.095));
    const steps = Math.max(12, Math.ceil(targetLength / stepPx));
    const sourceSpan = Math.max(0.01, source1 - source0);
    const sourceStep = sourceSpan * brush.width / steps;
    const targetSliceLength = targetLength / steps * 1.24;
    const sourceSliceWidth = Math.max(12, sourceStep * 1.48);

    for (let i = 0; i <= steps; i += 1) {
      const u = i / steps;
      const t = t0 + (t1 - t0) * u;
      const sourceU = reverse
        ? source1 - sourceSpan * u
        : source0 + sourceSpan * u;

      let sx = sourceU * brush.width - sourceSliceWidth * 0.5;
      sx = Math.max(0, Math.min(brush.width - sourceSliceWidth, sx));

      const p = pointFn(t, w, h);
      const angle = tangentAngle(pointFn, t, w, h);
      const normal = angle + Math.PI / 2;
      const micro = Math.sin((i + phase) * 0.37) * 0.34;
      const pressure = 0.94 + 0.075 * Math.sin((i + phase) * 0.11);

      ctx.save();
      ctx.translate(
        p.x + Math.cos(normal) * (normalOffset + micro),
        p.y + Math.sin(normal) * (normalOffset + micro)
      );
      ctx.rotate(angle);
      ctx.globalAlpha = alpha;
      ctx.drawImage(
        brush,
        sx,
        0,
        sourceSliceWidth,
        brush.height,
        -targetSliceLength * 0.5,
        -thickness * pressure * 0.5,
        targetSliceLength,
        thickness * pressure
      );
      ctx.restore();
    }
  };

  const paintRoad = (ctx, brush, w, h) => {
    const edgeThickness = Math.max(9.5, Math.min(23, w * 0.155));

    drawBrushAlong(
      ctx,
      brush,
      (t, ww, hh) => edgePoint(t, -1, ww, hh),
      w,
      h,
      {
        reverse: false,
        thickness: edgeThickness,
        alpha: 0.205,
        normalOffset: -0.35,
        phase: 11
      }
    );

    drawBrushAlong(
      ctx,
      brush,
      (t, ww, hh) => edgePoint(t, 1, ww, hh),
      w,
      h,
      {
        reverse: true,
        thickness: edgeThickness * 0.96,
        alpha: 0.195,
        normalOffset: 0.45,
        phase: 47
      }
    );

  };

  const paintCentreMarks = (ctx, brush, w, h) => {
    const ranges = [
      [0.065, 0.103],
      [0.205, 0.243],
      [0.347, 0.386],
      [0.492, 0.530],
      [0.638, 0.676],
      [0.782, 0.820],
      [0.912, 0.950]
    ];
    const thickness = Math.max(3.1, Math.min(5.2, w * 0.035));

    ranges.forEach(([a, b], index) => {
      const sourceStart = 0.24 + (index % 4) * 0.11;
      drawBrushAlong(
        ctx,
        brush,
        centrePoint,
        w,
        h,
        {
          t0: a,
          t1: b,
          source0: sourceStart,
          source1: Math.min(0.90, sourceStart + 0.18),
          reverse: index % 2 === 1,
          thickness,
          alpha: 0.185,
          normalOffset: (index % 2 ? 0.3 : -0.25),
          phase: 17 + index * 13
        }
      );
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
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    paintRoad(ctx, brush, rect.width, rect.height);
    paintCentreMarks(ctx, brush, rect.width, rect.height);

    canvas.dataset.paintReady = 'true';
    canvas.dataset.brushMaterial = 'continuous-dry-ink';
    canvas.dataset.brushVersion = 'v3-wide-slices';
    if (fallback) fallback.setAttribute('hidden', '');
  };

  brushImage.addEventListener('load', () => {
    const tinted = cropAndTintBrush(brushImage);
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
