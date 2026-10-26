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
          lead: parseFloat(getComputedStyle(document.querySelector('.hero-focus')).fontSize),
          leadFamily: getComputedStyle(document.querySelector('.hero-focus')).fontFamily,
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
          const lens = cs('.about-lens-layout');
          const tabs = qa('.about-personality-tab');
          const tablist = q('.about-personality-tabs');
          const activePanel = q('.about-personality-panel:not([hidden])');
          const skillRows = qa('.about-toolkit-skills .about-toolkit-list article').map(el => el.getBoundingClientRect());
          const mindsetRows = qa('.about-toolkit-mindset .about-toolkit-list article').map(el => el.getBoundingClientRect());
          const visibleText = q('main').innerText;

          return {
            h1: parseFloat(cs('.about-personal-copy h1').fontSize),
            h2: parseFloat(cs('.about-section-lead h2').fontSize),
            lead: parseFloat(cs('.about-personal-lead').fontSize),
            leadFamily: cs('.about-personal-lead').fontFamily,
            heroLeadWidth: rect('.about-personal-lead').width,
            heroText: q('.about-personal-lead').textContent.trim(),
            heroPaddingTop: parseFloat(cs('.about-personal-hero').paddingTop),
            heroPaddingBottom: parseFloat(cs('.about-personal-hero').paddingBottom),
            sectionPads: ['#story','#toolkit','#personality'].map(id => {
              const style = getComputedStyle(q(id));
              return [parseFloat(style.paddingTop), parseFloat(style.paddingBottom)];
            }),
            order: ['story','toolkit','personality'].map(id => q('#'+id).getBoundingClientRect().top + scrollY),
            storyTitle: q('#story-title').textContent.trim(),
            storyBeatTitles: qa('.about-story-beat h3').map(el => el.textContent.trim()),
            storyWidth: rect('.about-story-beats').width,
            skillHeading: q('.about-toolkit-skills > h2').textContent.trim(),
            mindsetHeading: q('.about-toolkit-mindset > h2').textContent.trim(),
            skillIntro: q('.about-toolkit-skills .about-toolkit-intro').textContent.trim(),
            mindsetIntro: q('.about-toolkit-mindset .about-toolkit-intro').textContent.trim(),
            skillCount: skillRows.length,
            mindsetCount: mindsetRows.length,
            toolkitColumns: toolkit.gridTemplateColumns.split(' ').filter(Boolean).length,
            skillRows: skillRows.map(r => ({top:r.top,bottom:r.bottom,height:r.height})),
            mindsetRows: mindsetRows.map(r => ({top:r.top,bottom:r.bottom,height:r.height})),
            personalityTitle: q('#personality-title').textContent.trim(),
            personalityLead: q('#personality .about-section-lead > p').textContent.trim(),
            tabLabels: tabs.map(t => t.textContent.trim()),
            tabHeights: tabs.map(t => t.getBoundingClientRect().height),
            tabBorders: tabs.map(t => parseFloat(getComputedStyle(t).borderTopWidth)),
            tabBackgrounds: tabs.map(t => getComputedStyle(t).backgroundColor),
            tabWrap: getComputedStyle(tablist).flexWrap,
            tabOverflow: getComputedStyle(tablist).overflowX,
            tabScrollable: tablist.scrollWidth > tablist.clientWidth + 1,
            activeColor: getComputedStyle(q('.about-personality-tab[aria-selected="true"]')).color,
            panelBackground: getComputedStyle(activePanel).backgroundColor,
            panelPaddingTop: parseFloat(getComputedStyle(activePanel).paddingTop),
            panelRadius: parseFloat(getComputedStyle(activePanel).borderTopLeftRadius),
            lensColumns: lens.gridTemplateColumns.split(' ').filter(Boolean).length,
            activeLensTitle: q('.about-personality-panel:not([hidden]) h3').textContent.trim(),
            lensParagraphCount: qa('.about-personality-panel:not([hidden]) .about-lens-copy p').length,
            metadataCount: qa('.about-profile-kicker,.about-personality-markers,.about-personality-meaning').length,
            profileLink: q('.about-profile-link').textContent.trim(),
            hasEmDash: visibleText.includes('—'),
            overflow: document.documentElement.scrollWidth > innerWidth + 1
          };
        });

        close(state.h1, home.h1, .2, engine+' '+width+' About H1');
        close(state.h2, home.h2, .2, engine+' '+width+' About H2');
        close(state.lead, home.lead, .2, engine+' '+width+' About lead');
        assert.equal(state.leadFamily, home.leadFamily);
        assert.ok(state.heroLeadWidth <= 620.5, engine+' '+width+' hero measure');
        assert.equal(state.heroText, 'I’ve always been drawn to building things and figuring out how they could work better. Today, that curiosity sits where people, business and technology meet.');
        assert.equal(state.storyTitle, 'How I got here.');
        assert.deepEqual(state.storyBeatTitles, ['Started early','At 18','Learning my limits','Back to building']);
        assert.ok(state.storyWidth <= 620.5, engine+' '+width+' story measure');
        assert.deepEqual(state.order.slice().sort((a,b)=>a-b), state.order, engine+' '+width+' About order');
        assert.equal(state.skillHeading, 'Skill Set');
        assert.equal(state.mindsetHeading, 'Mindset');
        assert.equal(state.skillIntro, 'What I know how to do.');
        assert.equal(state.mindsetIntro, 'How I approach the work.');
        assert.equal(state.skillCount, 5);
        assert.equal(state.mindsetCount, 5);
        assert.equal(state.personalityTitle, 'Different lenses. Same person.');
        assert.equal(state.personalityLead, 'None of these define me. I use them to notice patterns in how I think and work, and I pay most attention to where they overlap.');
        assert.deepEqual(state.tabLabels, ['Big Five','BG5','MBTI','Enneagram','Human Design']);
        assert.ok(state.tabHeights.every(h => h >= 47.5), engine+' '+width+' 48px tabs');
        assert.ok(state.tabBorders.every(v => v < .5), engine+' '+width+' tabs borderless');
        assert.ok(state.tabBackgrounds.every(v => v === 'rgba(0, 0, 0, 0)'), engine+' '+width+' tabs transparent');
        assert.equal(state.tabWrap, 'nowrap');
        assert.equal(state.tabOverflow, 'auto');
        assert.equal(state.activeColor, 'rgb(218, 56, 49)');
        assert.equal(state.panelBackground, 'rgba(0, 0, 0, 0)');
        assert.ok(state.panelPaddingTop < .5 && state.panelRadius < .5, engine+' '+width+' lens panel no card treatment');
        assert.equal(state.activeLensTitle, 'Curious, energetic, structured and direct.');
        assert.equal(state.lensParagraphCount, 2);
        assert.equal(state.metadataCount, 0, engine+' '+width+' no scores/source metadata/old meaning grids');
        assert.equal(state.profileLink, 'View my LinkedIn profile');
        assert.equal(state.hasEmDash, false, engine+' '+width+' no em dashes on About');
        assert.equal(state.overflow, false, engine+' '+width+' no horizontal overflow');

        if (width <= 760) {
          close(state.heroPaddingTop, 42, .2, engine+' '+width+' mobile hero top');
          close(state.heroPaddingBottom, 62, .2, engine+' '+width+' mobile hero bottom');
        } else {
          close(state.heroPaddingBottom, home.sectionSpace, .5, engine+' '+width+' hero bottom rhythm');
        }
        for (const [top,bottom] of state.sectionPads) {
          close(top, home.sectionSpace, .5, engine+' '+width+' section top rhythm');
          close(bottom, home.sectionSpace, .5, engine+' '+width+' section bottom rhythm');
        }

        if (width <= 840) {
          assert.equal(state.toolkitColumns, 1, engine+' '+width+' toolkit stacks');
          assert.equal(state.lensColumns, 1, engine+' '+width+' lens stacks');
        } else {
          assert.equal(state.toolkitColumns, 2, engine+' '+width+' toolkit columns');
          assert.equal(state.lensColumns, 2, engine+' '+width+' lens columns');
          for (let i=0;i<5;i++) {
            close(state.skillRows[i].top, state.mindsetRows[i].top, 1.5, engine+' '+width+' toolkit row '+i+' top alignment');
            close(state.skillRows[i].height, state.mindsetRows[i].height, 1.5, engine+' '+width+' toolkit row '+i+' height alignment');
          }
        }

        if (width <= 390) {
          assert.equal(state.tabScrollable, true, engine+' '+width+' tabs must be swipeable');
          const last = page.locator('.about-personality-tab').last();
          await last.click();
          await page.waitForTimeout(250);
          assert.equal(await last.getAttribute('aria-selected'),'true');
          assert.ok(await page.locator('.about-personality-tabs').evaluate(el => el.scrollLeft > 0), engine+' '+width+' selected tab reveals');
        }

        const second = page.locator('.about-personality-tab').nth(1);
        await second.hover();
        await page.waitForTimeout(180);
        assert.equal(await second.evaluate(el => getComputedStyle(el).color), 'rgb(218, 56, 49)', engine+' '+width+' hover red');

        await page.locator('.about-personality-tab').first().focus();
        await page.keyboard.press('ArrowRight');
        assert.equal(await second.getAttribute('aria-selected'),'true', engine+' '+width+' keyboard activates next tab');
        assert.equal(await page.locator('.about-personality-panel:not([hidden]) h3').textContent(),'Express Builder');

        if (output && (width === 390 || width === 1440)) {
          await page.locator('.about-personal-hero').screenshot({path:output+'/about-v3-hero-'+engine+'-'+width+'.png'});
          await page.locator('#story').screenshot({path:output+'/about-v3-story-'+engine+'-'+width+'.png'});
          await page.locator('#toolkit').screenshot({path:output+'/about-v3-toolkit-'+engine+'-'+width+'.png'});
          await page.locator('#personality').screenshot({path:output+'/about-v3-personality-'+engine+'-'+width+'.png'});
        }

        await page.close();
      }
    } finally {
      await browser.close();
    }
  }

  console.log('PASS: About V3 is balanced, minimal, em-dash-free and responsive across browsers');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
