'use strict';

const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { join } = require('node:path');
const { chromium, firefox, webkit } = require('playwright');
const { PNG } = require('pngjs');

const base = process.env.ROAD_BASE || 'http://127.0.0.1:8765/humamap-preview/augustkring/';
const output = process.env.ROAD_OUTPUT || 'artifacts';
const modes = (process.env.ROAD_ENGINES || 'chromium').split(',').map(s => s.trim());
const widths = (process.env.ROAD_WIDTHS || '320,390,768,1024,1440')
  .split(',').map(Number);
const browserTypes = { chromium, firefox, webkit };
const headingNames = [
  'Creative Thinking', 'Commercial Understanding', 'Strategic Judgment',
  'AI-Native Building', 'Purpose Driven'
];
mkdirSync(output, { recursive: true });

async function jump(page, y) {
  await page.evaluate(top => scrollTo({ top: Math.max(0, top), behavior: 'instant' }), y);
  await page.waitForTimeout(120);
}

async function sceneCoordinates(page) {
  return page.evaluate(() => {
    const story = document.querySelector('[data-waymaking-scene]');
    const art = document.querySelector('.waymaking-road-wrap').getBoundingClientRect();
    const beats = [...story.querySelectorAll('.waymaking-beat')];
    const conclusion = document.querySelector('.waymaking-resolution p');
    return {
      sceneStart: scrollY + story.getBoundingClientRect().top,
      conclusionTop: scrollY + conclusion.getBoundingClientRect().top,
      roadTop: art.top,
      roadHeight: art.height,
      beats: beats.map(beat => {
        const box = beat.getBoundingClientRect();
        return scrollY + box.top + box.height / 2;
      })
    };
  });
}

async function state(page) {
  return page.evaluate(() => {
    const road = document.querySelector('.waymaking-road-wrap');
    const image = road.querySelector('.waymaking-road-art');
    const bitmap = image.querySelector('img');
    const picture = road.querySelector('.waymaking-paint-art');
    const box = road.getBoundingClientRect();
    const css = getComputedStyle(road);
    return {
      parentIsBody: road.parentElement === document.body,
      fixed: css.position === 'fixed',
      top: box.top, left: box.left, width: box.width, height: box.height,
      opacity: Number(css.opacity),
      imageOpacity: Number(getComputedStyle(image).opacity),
      imageVisible: getComputedStyle(image).visibility === 'visible',
      svgDisplay: getComputedStyle(picture).display,
      clipTop: Number.parseFloat(road.style.getPropertyValue('--waymaking-clip-top')),
      clipBottom: Number.parseFloat(road.style.getPropertyValue('--waymaking-clip-bottom')),
      clipPath: css.clipPath,
      currentSrc: bitmap.currentSrc,
      imageLoaded: bitmap.complete && bitmap.naturalWidth > 0,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      titles: [...document.querySelectorAll('.waymaking-beat h3')].map(h =>
        h.getAttribute('aria-label') || h.textContent.trim())
    };
  });
}

function assertStationary(s, first, width, where) {
  assert.ok(s.parentIsBody, where + ': road must be a body-level viewport fixture');
  assert.ok(s.fixed, where + ': position must be fixed');
  assert.ok(Math.abs(s.top - 16) < 0.8, where + ': road top drifted ' + s.top);
  assert.ok(Math.abs(s.left - first.left) < 0.8, where + ': road left drifted');
  assert.ok(Math.abs(s.width - first.width) < 0.8, where + ': image resized on scroll');
  assert.equal(s.opacity, 1, where + ': root opacity must never animate');
  assert.equal(s.imageOpacity, width <= 900 ? 0.42 : 1, where + ': image opacity must be constant');
  assert.equal(s.svgDisplay, 'none', where + ': moving SVG paint must be OFF');
  assert.ok(s.imageLoaded, where + ': bitmap not decoded');
  assert.ok(s.imageVisible, where + ': full source bitmap must be visible');
  assert.ok(s.clipPath !== 'none', where + ': section clipping missing');
  assert.ok(!s.overflow, where + ': horizontal overflow');
  assert.deepEqual(s.titles, headingNames, where + ': approved chapter content changed');
}

function differentPixels(imageA, imageB, threshold = 8) {
  const a = PNG.sync.read(imageA), b = PNG.sync.read(imageB);
  assert.equal(a.width, b.width);
  assert.equal(a.height, b.height);
  let count = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    const delta = Math.abs(a.data[i] - b.data[i]) +
      Math.abs(a.data[i + 1] - b.data[i + 1]) +
      Math.abs(a.data[i + 2] - b.data[i + 2]);
    if (delta > threshold) count++;
  }
  return count;
}

async function renderedRoadPixels(page) {
  const road = page.locator('.waymaking-road-wrap');
  const withRoad = await page.screenshot({ animations: 'disabled' });
  await road.evaluate(el => el.style.setProperty('display', 'none', 'important'));
  const withoutRoad = await page.screenshot({ animations: 'disabled' });
  await road.evaluate(el => el.style.removeProperty('display'));
  return differentPixels(withRoad, withoutRoad);
}

async function oneViewport(browser, engine, width) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  try {
    await page.goto(base, { waitUntil: 'networkidle', timeout: 45000 });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.waymaking-road-art img').evaluate(img => img.decode());
    const first = await state(page);
    const positions = await sceneCoordinates(page);
    assertStationary(first, first, width, engine + '/' + width + '/initial');

    // Full artwork must already be visible by the time the first text
    // occupies the reading zone, without opacity or painted-mask jumps.
    const samples = [];
    for (let i = 0; i < positions.beats.length; i++) {
      await jump(page, positions.beats[i] - 450);
      const s = await state(page);
      assertStationary(s, first, width, engine + '/' + width + '/chapter-' + i);
      assert.ok(s.clipTop <= 1 && s.clipBottom <= 1,
        'The COMPLETE stationary road must be visible throughout chapter ' + headingNames[i] +
        ', got crop ' + s.clipTop + '/' + s.clipBottom);
      const pixels = await renderedRoadPixels(page);
      assert.ok(pixels > 220, 'Road disappeared while reading ' + headingNames[i] +
        ' (' + engine + '/' + width + ', pixels ' + pixels + ')');
      samples.push({ name: headingNames[i], pixels, x: s.left, y: s.top, opacity: s.imageOpacity });
      if (width === 390 || width === 1440) {
        await page.screenshot({ path: join(output, engine + '-' + width + '-chapter-' + i + '.png') });
      }
    }

    // Pixel identity: when unrelated foreground text is suppressed,
    // scrolling past successive chapters must not move or repaint ANY
    // single pixel of the complete road.
    await page.evaluate(() => {
      for (const selector of ['.home-main', '.home-header', '.home-footer']) {
        const node = document.querySelector(selector);
        if (node) node.style.visibility = 'hidden';
      }
    });
    await jump(page, positions.beats[1] - 450);
    const pureImageA = await page.screenshot({ animations: 'disabled' });
    await jump(page, positions.beats[2] - 450);
    const pureImageB = await page.screenshot({ animations: 'disabled' });
    const delta = differentPixels(pureImageA, pureImageB, 8);
    assert.ok(delta <= 16, 'Stationary road pixels MOVED/REPAINTED between chapters: ' +
      delta + ' differences for ' + engine + '/' + width);
    await page.evaluate(() => {
      for (const selector of ['.home-main', '.home-header', '.home-footer']) {
        const node = document.querySelector(selector);
        if (node) node.style.removeProperty('visibility');
      }
    });

    // It must not reach the following sections, including after scroll-back.
    for (const selector of ['#work', '#perspective', '.homepage-contact', '.home-footer']) {
      const y = await page.locator(selector).evaluate(el =>
        scrollY + el.getBoundingClientRect().top - innerHeight * 0.4);
      await jump(page, y);
      const region = await state(page);
      const rendered = await renderedRoadPixels(page);
      if (rendered > 0) {
        console.log('OUTSIDE_FAIL', engine, width, selector, JSON.stringify({
          roadTop: region.top, roadHeight: region.height,
          clipTop: region.clipTop, clipBottom: region.clipBottom,
          clipPath: region.clipPath, sourceOpacity: region.imageOpacity,
          renderedPixels: rendered
        }));
        await page.screenshot({ path: join(output, engine + '-' + width + '-outside-debug.png') });
      }
      assert.equal(rendered, 0, engine + '/' + width +
        ': road leaked into ' + selector);
    }
    await jump(page, positions.beats[1] - 450);
    const back = await state(page);
    assertStationary(back, first, width, 'reverse-scroll');
    assert.ok(await renderedRoadPixels(page) > 220, 'The road did not return when scrolling back');
    assert.deepEqual(errors, [], 'Browser JS console errors');
    console.log('PASS ' + engine + ' ' + width + ' ' + JSON.stringify({
      fixedTop: first.top, sourceOpacity: first.imageOpacity,
      unmovingPixelDifferences: delta, allFiveChapters: samples.map(x => x.pixels),
      hiddenLater: true
    }));
  } finally {
    await page.close();
  }
}

(async () => {
  for (const engine of modes) {
    assert.ok(browserTypes[engine], 'Unsupported engine ' + engine);
    const type = browserTypes[engine];
    const options = engine === 'chromium' && process.env.CHROME_BIN
      ? { executablePath: process.env.CHROME_BIN, headless: true, args: ['--no-sandbox'] }
      : { headless: true };
    const browser = await type.launch(options);
    try {
      for (const width of widths) await oneViewport(browser, engine, width);
      // No dynamic image painting even when the user requests reduced motion.
      const reduced = await browser.newPage({
        viewport: { width: 390, height: 900 },
        reducedMotion: 'reduce'
      });
      await reduced.goto(base, { waitUntil: 'networkidle' });
      await reduced.locator('.waymaking-beat').nth(2).scrollIntoViewIfNeeded();
      await reduced.waitForTimeout(130);
      const s = await state(reduced);
      assertStationary(s, s, 390, engine + ' reduced motion');
      assert.ok(await renderedRoadPixels(reduced) > 220, 'Reduced-motion art absent');
      assert.equal(await reduced.locator('.waymaking-letter').count(), 0,
        'Reduced motion must avoid animated glyphs');
      await reduced.close();

      // First-load WebP-only source, not a mid-decode source swap.
      const webp = await browser.newPage({ viewport: { width: 390, height: 900 } });
      await webp.goto(base + 'no-avif.html', { waitUntil: 'networkidle' });
      await webp.locator('.waymaking-beat').nth(2).scrollIntoViewIfNeeded();
      await webp.waitForTimeout(130);
      const fallback = await state(webp);
      assert.ok(fallback.currentSrc.endsWith('.webp'), 'WebP fallback did not load');
      assertStationary(fallback, fallback, 390, engine + ' WebP');
      assert.ok(await renderedRoadPixels(webp) > 220, 'WebP-only art absent');
      await webp.close();

      // Non-JS readers still get an in-flow static illustration and all text.
      const fallbackPage = await browser.newPage({
        viewport: { width: 390, height: 900 }, javaScriptEnabled: false
      });
      await fallbackPage.goto(base, { waitUntil: 'load' });
      assert.deepEqual(await fallbackPage.locator('.waymaking-beat h3').allTextContents(), headingNames);
      assert.equal(await fallbackPage.locator('.waymaking-road-art').evaluate(el =>
        getComputedStyle(el).display), 'block', 'No-JS full bitmap missing');
      await fallbackPage.close();
      console.log('PASS ' + engine + ' reduced-motion, no-JS, first-load WebP');
    } finally {
      await browser.close();
    }
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
