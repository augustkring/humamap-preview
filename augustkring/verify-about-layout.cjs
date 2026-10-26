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
          const h1 = getComputedStyle(document.querySelector('.hero-copy h1'));
          const h2 = getComputedStyle(document.querySelector('.thread-lead h2'));
          const lead = getComputedStyle(document.querySelector('.hero-focus'));
          return {
            h1: parseFloat(h1.fontSize),
            h2: parseFloat(h2.fontSize),
            lead: parseFloat(lead.fontSize),
            leadFamily: lead.fontFamily,
            sectionSpace: parseFloat(getComputedStyle(document.querySelector('.story-section')).paddingTop),
            red: getComputedStyle(document.documentElement).getPropertyValue('--red').trim()
          };
        });

        await page.goto(base + 'about/', { waitUntil: 'networkidle', timeout: 45000 });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForFunction(() => document.querySelector('.about-personality-explorer')?.classList.contains('is-enhanced'));

        const about = await page.evaluate(() => {
          const q = selector => document.querySelector(selector);
          const cs = selector => getComputedStyle(q(selector));
          const rect = selector => q(selector).getBoundingClientRect();
          const tabs = [...document.querySelectorAll('.about-personality-tab')];
          const active = document.querySelector('.about-personality-tab[aria-selected="true"]');
          const tablist = q('.about-personality-tabs');
          const panel = q('.about-personality-panel:not([hidden])');
          const panelStyle = getComputedStyle(panel);
          const skillColumn = cs('.about-toolkit-skills');
          const mindsetColumn = cs('.about-toolkit-mindset');
          const hero = cs('.about-personal-hero');
          const story = cs('.about-story');
          const toolkit = cs('.about-toolkit');
          const personality = cs('.about-personality');

          return {
            heroTitle: q('#about-page-title').textContent.trim(),
            storyTitle: q('#story-title').textContent.trim(),
            personalityTitle: q('#personality-title').textContent.trim(),
            h1: parseFloat(cs('.about-personal-copy h1').fontSize),
            h2: parseFloat(cs('.about-section-lead h2').fontSize),
            lead: parseFloat(cs('.about-personal-lead').fontSize),
            leadFamily: cs('.about-personal-lead').fontFamily,
            heroLeadWidth: rect('.about-personal-lead').width,
            heroPaddingTop: parseFloat(hero.paddingTop),
            heroPaddingBottom: parseFloat(hero.paddingBottom),
            storyPaddingTop: parseFloat(story.paddingTop),
            storyPaddingBottom: parseFloat(story.paddingBottom),
            toolkitPaddingTop: parseFloat(toolkit.paddingTop),
            toolkitPaddingBottom: parseFloat(toolkit.paddingBottom),
            personalityPaddingTop: parseFloat(personality.paddingTop),
            personalityPaddingBottom: parseFloat(personality.paddingBottom),
            storyWidth: rect('.about-story-beats').width,
            storyBeatCount: document.querySelectorAll('.about-story-beat').length,
            storyBeatTitles: [...document.querySelectorAll('.about-story-beat h3')].map(el => el.textContent.trim()),
            order: ['story','toolkit','personality'].map(id => q('#' + id).getBoundingClientRect().top + scrollY),
            toolkitColumns: toolkit.gridTemplateColumns.split(' ').filter(Boolean).length,
            skillCount: document.querySelectorAll('.about-toolkit-skills .about-toolkit-list article').length,
            mindsetCount: document.querySelectorAll('.about-toolkit-mindset .about-toolkit-list article').length,
            skillHeading: q('.about-toolkit-skills > h2').textContent.trim(),
            mindsetHeading: q('.about-toolkit-mindset > h2').textContent.trim(),
            skillColumnWidth: rect('.about-toolkit-skills').width,
            mindsetColumnWidth: rect('.about-toolkit-mindset').width,
            tabs: tabs.map(tab => {
              const style = getComputedStyle(tab);
              return {
                text: tab.textContent.trim(),
                height: tab.getBoundingClientRect().height,
                borderTop: parseFloat(style.borderTopWidth),
                background: style.backgroundColor,
                color: style.color,
                selected: tab.getAttribute('aria-selected') === 'true'
              };
            }),
            tabFlexWrap: getComputedStyle(tablist).flexWrap,
            tabOverflowX: getComputedStyle(tablist).overflowX,
            tabScrollable: tablist.scrollWidth > tablist.clientWidth + 1,
            activeColor: getComputedStyle(active).color,
            panelBackground: panelStyle.backgroundColor,
            panelBorderRadius: parseFloat(panelStyle.borderTopLeftRadius),
            panelPaddingTop: parseFloat(panelStyle.paddingTop),
            panelPaddingLeft: parseFloat(panelStyle.paddingLeft),
            meaningColumns: cs('.about-personality-meaning').gridTemplateColumns.split(' ').filter(Boolean).length,
            profileLink: q('.about-profile-link').textContent.trim(),
            profileLinkTop: rect('.about-profile-link').top,
            personalityBottom: rect('#personality').bottom,
            overflow: document.documentElement.scrollWidth > innerWidth + 1
          };
        });

        close(about.h1, home.h1, .2, engine + ' ' + width + ' About H1 matches homepage');
        close(about.h2, home.h2, .2, engine + ' ' + width + ' About H2 matches homepage');
        close(about.lead, home.lead, .2, engine + ' ' + width + ' About lead matches homepage');
        assert.equal(about.leadFamily, home.leadFamily, engine + ' ' + width + ' About lead family matches homepage');
        assert.ok(about.heroLeadWidth <= 620.5, engine + ' ' + width + ' About hero lead stays within 620px reading measure');
        assert.ok(about.storyWidth <= 620.5, engine + ' ' + width + ' About story stays within 620px reading measure');
        assert.deepEqual(about.order.slice().sort((a,b)=>a-b), about.order, engine + ' ' + width + ' About order must be Story -> Skill Set/Mindset -> Personality');
        assert.equal(about.storyBeatCount, 4, engine + ' ' + width + ' About story uses four narrative beats');
        assert.deepEqual(about.storyBeatTitles, ['Early years','At 18','A reset','Building again']);
        assert.equal(about.skillHeading, 'Skill Set');
        assert.equal(about.mindsetHeading, 'Mindset');
        assert.equal(about.skillCount, 6);
        assert.equal(about.mindsetCount, 5);
        assert.deepEqual(about.tabs.map(tab => tab.text), ['Big Five','BG5','MBTI','Enneagram','Human Design']);
        assert.equal(about.tabFlexWrap, 'nowrap', engine + ' ' + width + ' Personality tabs stay on one horizontal line');
        assert.equal(about.tabOverflowX, 'auto', engine + ' ' + width + ' Personality tab bar is horizontally scrollable');
        assert.ok(about.tabs.every(tab => tab.height >= 47.5), engine + ' ' + width + ' Personality tabs use 48px touch targets');
        assert.ok(about.tabs.every(tab => tab.borderTop < .5), engine + ' ' + width + ' Personality tabs have no borders');
        assert.ok(about.tabs.every(tab => tab.background === 'rgba(0, 0, 0, 0)'), engine + ' ' + width + ' Personality tabs have no backgrounds');
        assert.equal(about.activeColor, 'rgb(218, 56, 49)', engine + ' ' + width + ' Selected personality tab is red');
        assert.equal(about.panelBackground, 'rgba(0, 0, 0, 0)', engine + ' ' + width + ' Personality panel is borderless/transparent');
        assert.ok(about.panelBorderRadius < .5 && about.panelPaddingTop < .5 && about.panelPaddingLeft < .5,
          engine + ' ' + width + ' Personality panel has no card treatment');
        assert.equal(about.profileLink, 'View my LinkedIn profile');
        assert.equal(about.overflow, false, engine + ' ' + width + ' About must not overflow horizontally');

        if (width <= 760) {
          close(about.heroPaddingTop, 42, .2, engine + ' ' + width + ' mobile About hero top');
          close(about.heroPaddingBottom, 62, .2, engine + ' ' + width + ' mobile About hero bottom');
        } else {
          close(about.heroPaddingBottom, home.sectionSpace, .5, engine + ' ' + width + ' About hero bottom uses shared section rhythm');
        }

        close(about.storyPaddingTop, home.sectionSpace, .5, engine + ' ' + width + ' story top rhythm');
        close(about.storyPaddingBottom, home.sectionSpace, .5, engine + ' ' + width + ' story bottom rhythm');
        close(about.toolkitPaddingTop, home.sectionSpace, .5, engine + ' ' + width + ' toolkit top rhythm');
        close(about.toolkitPaddingBottom, home.sectionSpace, .5, engine + ' ' + width + ' toolkit bottom rhythm');
        close(about.personalityPaddingTop, home.sectionSpace, .5, engine + ' ' + width + ' personality top rhythm');
        close(about.personalityPaddingBottom, home.sectionSpace, .5, engine + ' ' + width + ' personality bottom rhythm');

        if (width <= 840) {
          assert.equal(about.toolkitColumns, 1, engine + ' ' + width + ' Skill Set/Mindset stack below 840px');
          assert.equal(about.meaningColumns, 1, engine + ' ' + width + ' Personality meaning stacks below 840px');
        } else {
          assert.equal(about.toolkitColumns, 2, engine + ' ' + width + ' Skill Set/Mindset use two desktop columns');
          assert.equal(about.meaningColumns, 2, engine + ' ' + width + ' Personality meaning uses two desktop columns');
          assert.ok(Math.abs(about.skillColumnWidth-about.mindsetColumnWidth)<2, engine + ' ' + width + ' Skill Set/Mindset columns remain equal');
        }

        if (width <= 390) {
          assert.equal(about.tabScrollable, true, engine + ' ' + width + ' Mobile personality tab bar must expose horizontal swipe');
          const lastTab = page.locator('.about-personality-tab').last();
          await lastTab.click();
          await page.waitForTimeout(250);
          assert.equal(await lastTab.getAttribute('aria-selected'), 'true', engine + ' ' + width + ' Last personality tab activates');
          assert.ok(await page.locator('.about-personality-tabs').evaluate(el => el.scrollLeft > 0), engine + ' ' + width + ' Selecting offscreen tab advances horizontal tab bar');
        }

        const secondTab = page.locator('.about-personality-tab').nth(1);
        await secondTab.hover();
        await page.waitForTimeout(180);
        const hoverColor = await secondTab.evaluate(el => getComputedStyle(el).color);
        assert.equal(hoverColor, 'rgb(218, 56, 49)', engine + ' ' + width + ' Personality hover is red');
        await page.locator('.about-personality-tab').first().focus();
        await page.keyboard.press('ArrowRight');
        assert.equal(await secondTab.getAttribute('aria-selected'), 'true', engine + ' ' + width + ' ArrowRight activates next personality tab');

        if (output && (width === 390 || width === 1440)) {
          await page.locator('.about-personal-hero').screenshot({ path: output + '/about-v2-hero-' + engine + '-' + width + '.png' });
          await page.locator('#story').screenshot({ path: output + '/about-v2-story-' + engine + '-' + width + '.png' });
          await page.locator('#toolkit').screenshot({ path: output + '/about-v2-toolkit-' + engine + '-' + width + '.png' });
          await page.locator('#personality').screenshot({ path: output + '/about-v2-personality-' + engine + '-' + width + '.png' });
        }

        await page.close();
      }
    } finally {
      await browser.close();
    }
  }

  console.log('PASS: About V2 narrative order, Skill Set/Mindset, borderless swipe tabs and homepage design-system rhythm');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
