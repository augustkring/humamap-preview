const assert = require('node:assert/strict');
const { chromium, firefox, webkit } = require('playwright');

const base = process.env.PERSPECTIVES_BASE || 'http://127.0.0.1:8765/humamap-preview/augustkring/';
const engines = (process.env.PERSPECTIVES_ENGINES || 'chromium').split(',').map(x => x.trim()).filter(Boolean);
const widths = (process.env.PERSPECTIVES_WIDTHS || '320,390,768,1024,1440').split(',').map(Number);
const output = process.env.PERSPECTIVES_OUTPUT || '';
const articles = [
  { slug:'rethinking-the-company', title:'Rethinking the company', date:'2026-09-15' },
  { slug:'europe-at-a-crossroads', title:'Europe at a crossroads', date:'2026-08-12' }
];

const launch = name => {
  const launcher = { chromium, firefox, webkit }[name];
  if (!launcher) throw new Error('Unknown browser '+name);
  const options = { headless:true };
  if (name === 'chromium' && process.env.CHROME_BIN) {
    options.executablePath=process.env.CHROME_BIN;
    options.args=['--no-sandbox'];
  }
  return launcher.launch(options);
};

(async () => {
  for (const engine of engines) {
    const browser = await launch(engine);
    try {
      for (const width of widths) {
        const page = await browser.newPage({ viewport:{width,height:980} });
        await page.goto(base+'perspectives/',{waitUntil:'networkidle',timeout:45000});
        await page.evaluate(() => document.fonts.ready);

        const listing = await page.evaluate(() => {
          const items = [...document.querySelectorAll('.perspective-index-item')];
          return {
            count:items.length,
            buttons:document.querySelectorAll('.perspective-index-action').length,
            readCopy:document.querySelector('#perspectives-list').textContent.includes('Read perspective'),
            overflow:document.documentElement.scrollWidth>innerWidth+1,
            cards:items.map(el => {
              const link=el.querySelector('.perspective-index-link');
              const title=el.querySelector('.perspective-index-title');
              const summary=el.querySelector('.perspective-index-summary');
              const style=getComputedStyle(summary);
              const rect=summary.getBoundingClientRect();
              return {
                href:link.getAttribute('href'),
                title:title.textContent.trim(),
                copy:summary.textContent.trim(),
                date:el.querySelector('time')?.getAttribute('datetime'),
                cardClickable:link.tagName==='A' && link.getBoundingClientRect().height>=44,
                display:style.display,
                lineClamp:style.webkitLineClamp,
                overflow:style.overflow,
                textOverflow:style.textOverflow,
                height:rect.height,
                lineHeight:parseFloat(style.lineHeight),
                scrollHeight:summary.scrollHeight,
                clientHeight:summary.clientHeight
              };
            })
          };
        });
        console.log('Perspectives measured cards',engine,width,JSON.stringify(listing.cards));
        assert.equal(listing.count,2,engine+' '+width+' two Perspectives');
        assert.equal(listing.buttons,0,engine+' '+width+' no redundant Read perspective CTA');
        assert.equal(listing.readCopy,false,engine+' '+width+' no Read perspective text');
        assert.equal(listing.overflow,false,engine+' '+width+' no horizontal overflow');

        for (let i=0;i<articles.length;i++) {
          const expected=articles[i],card=listing.cards[i];
          assert.equal(card.href,'perspectives/'+expected.slug+'/',engine+' '+width+' article link');
          assert.equal(card.title,expected.title,engine+' '+width+' headline');
          assert.equal(card.date,expected.date,engine+' '+width+' byline unchanged');
          assert.ok(card.cardClickable,engine+' '+width+' article card remains clickable');
          assert.ok(['-webkit-box','flow-root'].includes(card.display),engine+' '+width+' computed layout supports clamped excerpt');
          assert.equal(card.lineClamp,'2',engine+' '+width+' two-line excerpt clamp');
          assert.equal(card.overflow,'hidden',engine+' '+width+' no overflow beyond clamp');
          assert.equal(card.textOverflow,'ellipsis',engine+' '+width+' excerpt uses ellipsis');
          assert.ok(card.height <= card.lineHeight*2+1,engine+' '+width+' excerpt max two rendered lines');
          assert.ok(card.height > card.lineHeight,engine+' '+width+' excerpt has meaningful visible content');

          await page.goto(base+'perspectives/'+expected.slug+'/',{waitUntil:'networkidle',timeout:45000});
          const article = await page.evaluate(() => ({
            title:document.querySelector('.article-heading h1').textContent.trim(),
            intro:document.querySelector('.article-heading > p').textContent.trim()
          }));
          assert.equal(article.title,card.title,engine+' '+width+' article and index titles agree');
          assert.equal(article.intro,card.copy,engine+' '+width+' index shows verbatim article introduction');
        }

        if (output && (width===390 || width===1440)) {
          await page.goto(base+'perspectives/',{waitUntil:'networkidle',timeout:45000});
          await page.evaluate(() => document.fonts.ready);
          await page.locator('#perspectives-list').screenshot({
            path:output+'/perspectives-index-'+engine+'-'+width+'.png',
            animations:'disabled'
          });
        }

        console.log('PASS',engine,width,'exact article intros and two-line ellipsis; no Read perspective actions');
        await page.close();
      }
    } finally {
      await browser.close();
    }
  }
})().catch(error => {
  console.error(error);
  process.exitCode=1;
});
