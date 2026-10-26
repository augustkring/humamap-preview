const assert = require('node:assert/strict');
const { chromium, firefox, webkit } = require('playwright');

const base = process.env.ABOUT_BASE || 'http://127.0.0.1:8765/humamap-preview/augustkring/';
const engines = (process.env.ABOUT_ENGINES || 'chromium').split(',').map(v => v.trim()).filter(Boolean);
const widths = (process.env.ABOUT_WIDTHS || '320,390,768,1024,1440').split(',').map(Number).filter(Boolean);
const output = process.env.ABOUT_OUTPUT || '';

const launch = async name => {
  const launcher = { chromium, firefox, webkit }[name];
  if (!launcher) throw new Error('Unsupported engine: ' + name);
  const options = { headless: true };
  if (name === 'chromium' && process.env.CHROME_BIN) {
    options.executablePath = process.env.CHROME_BIN;
    options.args = ['--no-sandbox'];
  }
  return launcher.launch(options);
};

const close = (actual, expected, tolerance, label) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, label + ': ' + actual + ' vs ' + expected);
};

(async () => {
  for (const engine of engines) {
    const browser = await launch(engine);
    try {
      for (const width of widths) {
        const page = await browser.newPage({ viewport: { width, height: 1000 } });

        await page.goto(base, { waitUntil: 'networkidle', timeout: 45000 });
        await page.evaluate(() => document.fonts.ready);
        const home = await page.evaluate(() => ({
          h1: parseFloat(getComputedStyle(document.querySelector('.hero-copy h1')).fontSize),
          h2: parseFloat(getComputedStyle(document.querySelector('.thread-lead h2')).fontSize),
          sectionSpace: parseFloat(getComputedStyle(document.querySelector('.story-section')).paddingTop)
        }));

        await page.goto(base + 'about/', { waitUntil: 'networkidle', timeout: 45000 });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForFunction(() => document.querySelector('.about-personality-explorer')?.classList.contains('is-enhanced'));

        const state = await page.evaluate(() => {
          const q = s => document.querySelector(s);
          const qa = s => [...document.querySelectorAll(s)];
          const cs = s => getComputedStyle(q(s));
          const rect = s => q(s).getBoundingClientRect();
          const toolkit = cs('.about-toolkit');
          const explorer = cs('.about-personality-explorer');
          const tabs = qa('.about-personality-tab');
          const tablist = q('.about-personality-tabs');
          const activePanel = q('.about-personality-panel:not([hidden])');
          const skillRows = qa('.about-toolkit-skills .about-toolkit-list article').map(el => el.getBoundingClientRect());
          const mindsetRows = qa('.about-toolkit-mindset .about-toolkit-list article').map(el => el.getBoundingClientRect());
          const storyParagraphs = qa('.about-story-prose p');
          const panels = qa('.about-personality-panel');
          const mainText = q('main').innerText;

          return {
            heroCount: qa('.about-personal-hero').length,
            pageH1: q('#story-title').textContent.trim(),
            h1Size: parseFloat(cs('#story-title').fontSize),
            storyPaddingTop: parseFloat(cs('#story').paddingTop),
            storyPaddingBottom: parseFloat(cs('#story').paddingBottom),
            sectionPads: ['#toolkit','#personality'].map(id => {
              const style = getComputedStyle(q(id));
              return [parseFloat(style.paddingTop), parseFloat(style.paddingBottom)];
            }),
            order: ['story','toolkit','personality'].map(id => q('#'+id).getBoundingClientRect().top + scrollY),
            storyParagraphCount: storyParagraphs.length,
            storyWidth: rect('.about-story-prose').width,
            storyHasSubheads: qa('#story h3').length > 0,
            chronologyText: q('.about-story-link').textContent.trim(),
            chronologyTop: rect('.about-story-link').top,
            storyLastBottom: storyParagraphs.at(-1).getBoundingClientRect().bottom,
            skillCount: skillRows.length,
            mindsetCount: mindsetRows.length,
            toolkitColumns: toolkit.gridTemplateColumns.split(' ').filter(Boolean).length,
            skillRows: skillRows.map(r => ({top:r.top,height:r.height})),
            mindsetRows: mindsetRows.map(r => ({top:r.top,height:r.height})),
            personalityTitle: q('#personality-title').textContent.trim(),
            explorerDisplay: explorer.display,
            explorerColumns: explorer.gridTemplateColumns.split(' ').filter(Boolean).length,
            tabOrientation: tablist.getAttribute('aria-orientation'),
            tabDirection: getComputedStyle(tablist).flexDirection,
            tabOverflowX: getComputedStyle(tablist).overflowX,
            tabScrollable: tablist.scrollWidth > tablist.clientWidth + 1,
            tabLabels: tabs.map(t => t.textContent.trim()),
            tabHeights: tabs.map(t => t.getBoundingClientRect().height),
            tabBorders: tabs.map(t => parseFloat(getComputedStyle(t).borderTopWidth)),
            tabBackgrounds: tabs.map(t => getComputedStyle(t).backgroundColor),
            activeColor: getComputedStyle(q('.about-personality-tab[aria-selected="true"]')).color,
            panelBackground: getComputedStyle(activePanel).backgroundColor,
            panelPaddingTop: parseFloat(getComputedStyle(activePanel).paddingTop),
            lensWidth: rect('.about-lens-layout').width,
            lensHeadings: panels.map(panel => panel.querySelector('h3')?.textContent.trim()),
            lensParagraphCounts: panels.map(panel => panel.querySelectorAll('.about-lens-copy p').length),
            metadataCount: qa('.about-profile-kicker,.about-personality-markers,.about-personality-meaning').length,
            hasEmDash: mainText.includes('—'),
            overflow: document.documentElement.scrollWidth > innerWidth + 1
          };
        });

        assert.equal(state.heroCount, 0, engine+' '+width+' About hero is removed');
        assert.equal(state.pageH1, 'How I got here.');
        close(state.h1Size, home.h1, .2, engine+' '+width+' About story H1 matches homepage H1');
        assert.equal(state.storyParagraphCount, 5);
        assert.ok(state.storyWidth <= 620.5, engine+' '+width+' story reading measure');
        assert.equal(state.storyHasSubheads, false);
        assert.equal(state.chronologyText, 'For the full chronology, see LinkedIn');
        assert.ok(state.chronologyTop >= state.storyLastBottom + 22, engine+' '+width+' chronology CTA follows prose with breathing room');
        assert.deepEqual(state.order.slice().sort((a,b)=>a-b), state.order);

        assert.equal(state.skillCount, 5);
        assert.equal(state.mindsetCount, 5);
        assert.equal(state.personalityTitle, 'Different lenses. Same person.');
        assert.deepEqual(state.tabLabels, ['Big Five','HIGH5','VIA','BG5','MBTI','Enneagram','Human Design']);
        assert.ok(state.tabHeights.every(h => h >= (width<=840?47.5:43.5)), engine+' '+width+' lens targets');
        assert.ok(state.tabBorders.every(v => v < .5));
        assert.ok(state.tabBackgrounds.every(v => v === 'rgba(0, 0, 0, 0)'));
        assert.equal(state.activeColor, 'rgb(218, 56, 49)');
        assert.equal(state.panelBackground, 'rgba(0, 0, 0, 0)');
        assert.ok(state.panelPaddingTop < .5);
        assert.ok(state.lensWidth <= 760.5);
        assert.deepEqual(state.lensHeadings, [
          'Highly open, extraverted, structured and unusually direct.',
          'Strategist. Coach. Catalyst. Philomath. Commander.',
          'Creativity. Perspective. Beauty. Spirituality. Learning.',
          'Express Builder',
          'ENFP',
          '7w8',
          'Manifesting Generator, 2/4'
        ]);
        assert.ok(state.lensParagraphCounts.every(count => count === 2));
        assert.equal(state.metadataCount, 0);
        assert.equal(state.hasEmDash, false);
        assert.equal(state.overflow, false);

        if (width <= 760) {
          close(state.storyPaddingTop, 42, .2, engine+' '+width+' first section top rhythm');
        } else {
          assert.ok(state.storyPaddingTop >= 53.5 && state.storyPaddingTop <= 72.5, engine+' '+width+' first section top rhythm');
        }
        close(state.storyPaddingBottom, home.sectionSpace, .5, engine+' '+width+' story bottom rhythm');
        for (const [top,bottom] of state.sectionPads) {
          close(top, home.sectionSpace, .5, engine+' '+width+' section top rhythm');
          close(bottom, home.sectionSpace, .5, engine+' '+width+' section bottom rhythm');
        }

        if (width <= 840) {
          assert.equal(state.toolkitColumns, 1);
          assert.equal(state.explorerDisplay, 'block');
          assert.equal(state.tabOrientation, 'horizontal');
          assert.equal(state.tabDirection, 'row');
          assert.equal(state.tabOverflowX, 'auto');
        } else {
          assert.equal(state.toolkitColumns, 2);
          assert.equal(state.explorerDisplay, 'grid');
          assert.equal(state.explorerColumns, 2);
          assert.equal(state.tabOrientation, 'vertical');
          assert.equal(state.tabDirection, 'column');
          for (let i=0;i<5;i++) {
            close(state.skillRows[i].top, state.mindsetRows[i].top, 1.5, engine+' '+width+' toolkit row '+i+' top');
            close(state.skillRows[i].height, state.mindsetRows[i].height, 1.5, engine+' '+width+' toolkit row '+i+' height');
          }
        }

        if (width <= 390) {
          assert.equal(state.tabScrollable, true, engine+' '+width+' lens bar must swipe horizontally');
          const last = page.locator('.about-personality-tab').last();
          await last.click();
          await page.waitForTimeout(250);
          assert.equal(await last.getAttribute('aria-selected'),'true');
          assert.ok(await page.locator('.about-personality-tabs').evaluate(el => el.scrollLeft > 0));
        }

        const first = page.locator('.about-personality-tab').first();
        const second = page.locator('.about-personality-tab').nth(1);
        await second.hover();
        await page.waitForTimeout(180);
        assert.equal(await second.evaluate(el => getComputedStyle(el).color), 'rgb(218, 56, 49)');

        await first.focus();
        await page.keyboard.press(width<=840 ? 'ArrowRight' : 'ArrowDown');
        assert.equal(await second.getAttribute('aria-selected'),'true', engine+' '+width+' orientation-aware keyboard navigation');
        assert.equal(await page.locator('.about-personality-panel:not([hidden]) h3').textContent(),'Strategist. Coach. Catalyst. Philomath. Commander.');

        if (output && (width === 390 || width === 1440)) {
          await page.locator('#story').screenshot({path:output+'/about-v5-story-'+engine+'-'+width+'.png'});
          await page.locator('#toolkit').screenshot({path:output+'/about-v5-toolkit-'+engine+'-'+width+'.png'});
          await page.locator('#personality').screenshot({path:output+'/about-v5-personality-'+engine+'-'+width+'.png'});
        }

        await page.close();
      }
    } finally {
      await browser.close();
    }
  }

  console.log('PASS: About V5 starts with story and uses seven responsive reflection lenses');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
