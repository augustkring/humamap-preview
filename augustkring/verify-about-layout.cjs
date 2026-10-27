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
        const home = await page.evaluate(() => {
          const type = el => {
            const s = getComputedStyle(el);
            return {size:s.fontSize, family:s.fontFamily, weight:s.fontWeight, lineHeight:s.lineHeight, tracking:s.letterSpacing};
          };
          const purpose = document.querySelector('.waymaking-purpose');
          const work = document.querySelector('#work');
          return {
            h1: parseFloat(getComputedStyle(document.querySelector('.hero-copy h1')).fontSize),
            h2: parseFloat(getComputedStyle(document.querySelector('.thread-lead h2')).fontSize),
            sectionSpace: parseFloat(getComputedStyle(document.querySelector('.story-section')).paddingTop),
            heading: type(document.querySelector('.waymaking-copy h3')),
            body: type(document.querySelector('.waymaking-copy p')),
            heroFocus: type(document.querySelector('.hero-focus')),
            purposeToWork: work.getBoundingClientRect().top - purpose.getBoundingClientRect().bottom
          };
        });
        close(home.purposeToWork, 2 * home.sectionSpace, 1, engine+' '+width+' Purpose-to-Current-Focus matches section rhythm');

        await page.goto(base + 'about/', { waitUntil: 'networkidle', timeout: 45000 });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForFunction(() => document.querySelector('.about-personality-explorer')?.classList.contains('is-enhanced'));

        const state = await page.evaluate(() => {
          const q = s => document.querySelector(s);
          const qa = s => [...document.querySelectorAll(s)];
          const cs = s => getComputedStyle(q(s));
          const rect = s => q(s).getBoundingClientRect();
          const toolkit = cs('.about-toolkit');
          const principles = cs('.about-principles-list');
          const explorer = cs('.about-personality-explorer');
          const tabs = qa('.about-personality-tab');
          const tablist = q('.about-personality-tabs');
          const activePanel = q('.about-personality-panel:not([hidden])');
          const skillRows = qa('.about-toolkit-skills .about-toolkit-list article').map(el => el.getBoundingClientRect());
          const mindsetRows = qa('.about-toolkit-mindset .about-toolkit-list article').map(el => el.getBoundingClientRect());
          const storyParagraphs = qa('.about-story-prose p');
          const panels = qa('.about-personality-panel');
          const mainText = q('main').innerText;
          const chars = selector => qa(selector).map(el => el.textContent.trim().length);
          const type = el => {
            const s = getComputedStyle(el);
            return {size:s.fontSize, family:s.fontFamily, weight:s.fontWeight, lineHeight:s.lineHeight, tracking:s.letterSpacing};
          };

          return {
            heroTitle: q('#about-page-title').textContent.trim(),
            heroH1Size: parseFloat(cs('#about-page-title').fontSize),
            belief: q('.about-personal-belief').textContent.trim(),
            beliefWidth: rect('.about-personal-belief').width,
            beliefType: type(q('.about-personal-belief')),
            heroPaddingTop: parseFloat(cs('.about-personal-hero').paddingTop),
            storyTitle: q('#story-title').textContent.trim(),
            storyH2Size: parseFloat(cs('#story-title').fontSize),
            sectionPads: ['#story','#toolkit','#principles','#personality'].map(id => {
              const style = getComputedStyle(q(id));
              return [parseFloat(style.paddingTop), parseFloat(style.paddingBottom)];
            }),
            order: ['story','toolkit','principles','personality'].map(id => q('#'+id).getBoundingClientRect().top + scrollY),
            storyParagraphCount: storyParagraphs.length,
            storyWidth: rect('.about-story-prose').width,
            chronologyText: q('.about-story-link').textContent.trim(),
            chronologyTop: rect('.about-story-link').top,
            storyLastBottom: storyParagraphs.at(-1).getBoundingClientRect().bottom,
            toolkitIntroCount: qa('.about-toolkit-intro').length,
            headingStyles: qa('.about-toolkit-list h3,.about-principles-list h3').map(type),
            bodyStyles: qa('.about-toolkit-list p,.about-principles-list p').map(type),
            skillTitles: qa('.about-toolkit-skills .about-toolkit-list h3').map(el => el.textContent.trim()),
            mindsetTitles: qa('.about-toolkit-mindset .about-toolkit-list h3').map(el => el.textContent.trim()),
            skillLengths: chars('.about-toolkit-skills .about-toolkit-list p'),
            mindsetLengths: chars('.about-toolkit-mindset .about-toolkit-list p'),
            toolkitColumns: toolkit.gridTemplateColumns.split(' ').filter(Boolean).length,
            skillRows: skillRows.map(r => ({top:r.top,height:r.height})),
            mindsetRows: mindsetRows.map(r => ({top:r.top,height:r.height})),
            principlesTitle: q('#principles-title').textContent.trim(),
            principlesIntro: q('#principles .about-section-lead > p').textContent.trim(),
            principlesTitles: qa('.about-principles-list h3').map(el => el.textContent.trim()),
            principlesLengths: chars('.about-principles-list p'),
            principlesColumns: principles.gridTemplateColumns.split(' ').filter(Boolean).length,
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
            lensH3Count: qa('.about-personality-panel h3').length,
            lensCopyCount: qa('.about-lens-copy').length,
            lensParagraphCounts: panels.map(panel => panel.querySelectorAll('.about-lens-copy p').length),
            activeParagraphs: qa('.about-personality-panel:not([hidden]) .about-lens-copy p').map(p => p.textContent.trim()),
            metadataCount: qa('.about-profile-kicker,.about-personality-markers,.about-personality-meaning,.about-lens-layout').length,
            hasEmDash: mainText.includes('—'),
            overflow: document.documentElement.scrollWidth > innerWidth + 1
          };
        });

        assert.equal(state.heroTitle, 'Hi, I’m August.');
        close(state.heroH1Size, home.h1, .2, engine+' '+width+' About H1 matches homepage H1');
        assert.equal(state.belief, 'I believe the future is shaped by what we choose to build together.');
        assert.ok(state.beliefWidth <= 680.5, engine+' '+width+' belief measure');
        assert.equal(state.beliefType.family, home.heroFocus.family, engine+' '+width+' belief uses homepage hero Figtree');
        assert.equal(state.beliefType.weight, home.heroFocus.weight, engine+' '+width+' belief uses homepage body weight');
        close(parseFloat(state.beliefType.lineHeight)/parseFloat(state.beliefType.size),
          parseFloat(home.heroFocus.lineHeight)/parseFloat(home.heroFocus.size), .01,
          engine+' '+width+' belief uses homepage hero leading');
        close(parseFloat(state.beliefType.tracking)||0,parseFloat(home.heroFocus.tracking)||0,.01,
          engine+' '+width+' belief uses homepage tracking');
        assert.equal(state.toolkitIntroCount,0,'Redundant Toolkit introduction lines must stay removed');
        for(const heading of state.headingStyles) assert.deepEqual(heading,home.heading,engine+' '+width+' About heading typography parity');
        for(const body of state.bodyStyles) assert.deepEqual(body,home.body,engine+' '+width+' About body typography parity');
        assert.equal(state.storyTitle, 'My story.');
        close(state.storyH2Size, home.h2, .2, engine+' '+width+' story H2 matches homepage H2');
        assert.equal(state.storyParagraphCount, 5);
        assert.ok(state.storyWidth <= 620.5, engine+' '+width+' story reading measure');
        assert.equal(state.chronologyText, 'For the full chronology, see LinkedIn');
        assert.ok(state.chronologyTop >= state.storyLastBottom + 22, engine+' '+width+' chronology CTA spacing');
        assert.deepEqual(state.order.slice().sort((a,b)=>a-b), state.order);

        assert.deepEqual(state.skillTitles, ['Agentic AI & Strategy','Strategic Innovation','Business Development','Product Development','Market Validation & GTM']);
        assert.deepEqual(state.mindsetTitles, ['Entrepreneurial','Strategic','Curious','Adaptive','Connective']);
        assert.ok(Math.max(...state.skillLengths)-Math.min(...state.skillLengths) <= 16, engine+' '+width+' Skill Set copy stays balanced');
        assert.ok(Math.max(...state.mindsetLengths)-Math.min(...state.mindsetLengths) <= 10, engine+' '+width+' Mindset copy stays balanced');

        assert.equal(state.principlesTitle, 'Principles.');
        assert.equal(state.principlesIntro, 'A few principles I return to when choosing what to build and how to build it.');
        assert.deepEqual(state.principlesTitles, [
          'Think big. Start small. Scale fast.',
          'Execution over fear.',
          'Learn, unlearn, relearn.',
          'People, planet & profit.'
        ]);
        assert.ok(Math.max(...state.principlesLengths)-Math.min(...state.principlesLengths) <= 14, engine+' '+width+' Principles copy stays balanced');
        assert.equal(state.principlesColumns,width>920?4:width>600?2:1,
          engine+' '+width+' Principles must reflow 4/2/1 without hiding content');

        assert.equal(state.personalityTitle, 'Different lenses.');
        assert.deepEqual(state.tabLabels, ['Big Five','HIGH5','VIA','BG5','MBTI','Enneagram','Human Design']);
        assert.ok(state.tabHeights.every(h => h >= (width<=840?47.5:43.5)), engine+' '+width+' lens targets');
        assert.ok(state.tabBorders.every(v => v < .5));
        assert.ok(state.tabBackgrounds.every(v => v === 'rgba(0, 0, 0, 0)'));
        assert.equal(state.activeColor, 'rgb(218, 56, 49)');
        assert.equal(state.panelBackground, 'rgba(0, 0, 0, 0)');
        assert.ok(state.panelPaddingTop < .5);
        assert.equal(state.lensH3Count, 0);
        assert.equal(state.lensCopyCount, 7);
        assert.ok(state.lensParagraphCounts.every(count => count === 2));
        assert.ok(state.activeParagraphs[0].startsWith('The clearest pattern in my Big Five results'));
        assert.equal(state.metadataCount, 0);
        assert.equal(state.hasEmDash, false);
        assert.equal(state.overflow, false);

        if (width <= 760) close(state.heroPaddingTop, 42, .2, engine+' '+width+' hero top');
        else assert.ok(state.heroPaddingTop >= 53.5 && state.heroPaddingTop <= 72.5, engine+' '+width+' hero top');

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
        const high5Text = await page.locator('.about-personality-panel:not([hidden])').innerText();
        assert.ok(high5Text.includes('Strategist') && high5Text.includes('Coach') && high5Text.includes('Catalyst') && high5Text.includes('Philomath') && high5Text.includes('Commander'));

        if (output && (width === 390 || width === 1440)) {
          await page.locator('.about-personal-hero').screenshot({path:output+'/about-v7-hero-'+engine+'-'+width+'.png'});
          await page.locator('#story').screenshot({path:output+'/about-v7-story-'+engine+'-'+width+'.png'});
          await page.locator('#toolkit').screenshot({path:output+'/about-v7-toolkit-'+engine+'-'+width+'.png'});
          await page.locator('#principles').screenshot({path:output+'/about-v7-principles-'+engine+'-'+width+'.png'});
          await page.locator('#personality').screenshot({path:output+'/about-v7-personality-'+engine+'-'+width+'.png'});
        }

        await page.close();
      }
    } finally {
      await browser.close();
    }
  }

  console.log('PASS: About V7 separates belief, mindset, principles and reflection lenses');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
