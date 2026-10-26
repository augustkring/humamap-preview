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

const px = value => Number.parseFloat(value) || 0;
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
          const root = getComputedStyle(document.documentElement);
          const h1 = getComputedStyle(document.querySelector('.hero-copy h1'));
          const h2 = getComputedStyle(document.querySelector('.thread-lead h2'));
          const lead = getComputedStyle(document.querySelector('.hero-focus'));
          const card = getComputedStyle(document.querySelector('.work-card'));
          return {
            h1: parseFloat(h1.fontSize),
            h2: parseFloat(h2.fontSize),
            lead: parseFloat(lead.fontSize),
            leadFamily: lead.fontFamily,
            sectionSpace: parseFloat(root.getPropertyValue('--section-space')),
            mobileSectionSpace: parseFloat(root.getPropertyValue('--section-space-mobile')),
            cardSurface: card.backgroundColor
          };
        });

        await page.goto(base + 'about/', { waitUntil: 'networkidle', timeout: 45000 });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForFunction(() => document.querySelector('.about-personality-explorer')?.classList.contains('is-enhanced'));

        const about = await page.evaluate(() => {
          const q = selector => document.querySelector(selector);
          const cs = selector => getComputedStyle(q(selector));
          const rect = selector => q(selector).getBoundingClientRect();
          const section = cs('.about-home-section');
          const story = cs('.about-story-bottom');
          const personality = cs('.about-personality');
          const hero = cs('.about-personal-hero');
          const tabs = [...document.querySelectorAll('.about-personality-tab')];
          const subtitles = [...document.querySelectorAll('.about-personal-lead, .about-home-lead > p, .about-story-intro > p')];
          const skillHeadings = [...document.querySelectorAll('.about-skill-grid h3, .about-principle h3')];
          return {
            h1: parseFloat(cs('.about-personal-copy h1').fontSize),
            h2: parseFloat(cs('.about-home-lead h2').fontSize),
            lead: parseFloat(cs('.about-personal-lead').fontSize),
            leadFamily: cs('.about-personal-lead').fontFamily,
            heroPaddingTop: parseFloat(hero.paddingTop),
            heroPaddingBottom: parseFloat(hero.paddingBottom),
            sectionPaddingTop: parseFloat(section.paddingTop),
            sectionPaddingBottom: parseFloat(section.paddingBottom),
            personalityPaddingTop: parseFloat(personality.paddingTop),
            personalityPaddingBottom: parseFloat(personality.paddingBottom),
            storyPaddingTop: parseFloat(story.paddingTop),
            storyPaddingBottom: parseFloat(story.paddingBottom),
            storyGap: parseFloat(story.rowGap),
            storyWidth: rect('.about-story-content').width,
            subtitleWidths: subtitles.map(el => el.getBoundingClientRect().width),
            tabHeights: tabs.map(el => el.getBoundingClientRect().height),
            tabFontSizes: tabs.map(el => parseFloat(getComputedStyle(el).fontSize)),
            panelSurface: cs('.about-personality-panel').backgroundColor,
            skillHeadingSizes: skillHeadings.map(el => parseFloat(getComputedStyle(el).fontSize)),
            skillsColumns: cs('.about-skill-grid').gridTemplateColumns.split(' ').filter(Boolean).length,
            principlesColumns: cs('.about-principles-grid').gridTemplateColumns.split(' ').filter(Boolean).length,
            overflow: document.documentElement.scrollWidth > innerWidth + 1
          };
        });

        close(about.h1, home.h1, .2, engine + ' ' + width + ' About H1 matches homepage');
        close(about.h2, home.h2, .2, engine + ' ' + width + ' About H2 matches homepage');
        close(about.lead, home.lead, .2, engine + ' ' + width + ' About lead matches homepage');
        assert.equal(about.leadFamily, home.leadFamily, engine + ' ' + width + ' About lead family matches homepage');
        assert.equal(about.panelSurface, home.cardSurface, engine + ' ' + width + ' personality panel uses shared card surface');
        assert.ok(about.subtitleWidths.every(v => v <= 390.5), engine + ' ' + width + ' About subtitles stay within 390px measure');
        assert.ok(about.storyWidth <= 620.5, engine + ' ' + width + ' story stays within 620px reading measure');
        assert.ok(about.tabHeights.every(v => v >= 43.5), engine + ' ' + width + ' personality tabs have 44px targets');
        assert.ok(about.tabFontSizes.every(v => v >= 13.9), engine + ' ' + width + ' personality tabs use 14px text');
        assert.ok(about.skillHeadingSizes.every(v => v >= 19.9 && v <= 22.1), engine + ' ' + width + ' tertiary headings stay on compact editorial scale');
        assert.equal(about.overflow, false, engine + ' ' + width + ' About must not overflow horizontally');

        if (width <= 760) {
          close(about.heroPaddingTop, 42, .2, engine + ' ' + width + ' mobile About hero top');
          close(about.heroPaddingBottom, 62, .2, engine + ' ' + width + ' mobile About hero bottom');
          close(about.sectionPaddingTop, home.mobileSectionSpace, .2, engine + ' ' + width + ' mobile About section top rhythm');
          close(about.sectionPaddingBottom, home.mobileSectionSpace, .2, engine + ' ' + width + ' mobile About section bottom rhythm');
          close(about.personalityPaddingTop, home.mobileSectionSpace, .2, engine + ' ' + width + ' mobile personality rhythm');
          close(about.storyPaddingTop, home.mobileSectionSpace, .2, engine + ' ' + width + ' mobile story top rhythm');
          close(about.storyPaddingBottom, home.mobileSectionSpace, .2, engine + ' ' + width + ' mobile story bottom rhythm');
          close(about.storyGap, 24, .2, engine + ' ' + width + ' mobile story column gap');
          assert.equal(about.skillsColumns, 1, engine + ' ' + width + ' skills stack on mobile');
          assert.equal(about.principlesColumns, 1, engine + ' ' + width + ' principles stack on mobile');
        } else {
          close(about.heroPaddingBottom, home.sectionSpace, .5, engine + ' ' + width + ' About hero bottom uses shared section rhythm');
          close(about.sectionPaddingTop, home.sectionSpace, .5, engine + ' ' + width + ' About section top rhythm');
          close(about.sectionPaddingBottom, home.sectionSpace, .5, engine + ' ' + width + ' About section bottom rhythm');
          close(about.personalityPaddingTop, home.sectionSpace, .5, engine + ' ' + width + ' personality top rhythm');
          close(about.storyPaddingTop, home.sectionSpace, .5, engine + ' ' + width + ' story top rhythm');
          close(about.storyPaddingBottom, home.sectionSpace, .5, engine + ' ' + width + ' story bottom rhythm');
          if (width >= 841) {
            assert.equal(about.skillsColumns, 2, engine + ' ' + width + ' skills use two-column desktop grid');
            assert.equal(about.principlesColumns, 2, engine + ' ' + width + ' principles use two-column desktop grid');
          }
        }

        if (output && (width === 390 || width === 1440)) {
          await page.locator('.about-personal-hero').screenshot({ path: output + '/about-hero-' + engine + '-' + width + '.png' });
          await page.locator('#skills').screenshot({ path: output + '/about-skills-' + engine + '-' + width + '.png' });
          await page.locator('#personality').screenshot({ path: output + '/about-personality-' + engine + '-' + width + '.png' });
          await page.locator('#story').screenshot({ path: output + '/about-story-' + engine + '-' + width + '.png' });
        }

        await page.close();
      }
    } finally {
      await browser.close();
    }
  }

  console.log('PASS: About matches homepage design-system typography, spacing, measures, surfaces and responsive rhythm');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
