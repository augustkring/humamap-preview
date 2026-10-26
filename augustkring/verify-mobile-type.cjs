const assert = require('node:assert/strict');
const { chromium, firefox, webkit } = require('playwright');

const base = process.env.TYPE_BASE || 'http://127.0.0.1:8765/humamap-preview/augustkring/';
const engines = (process.env.TYPE_ENGINES || 'chromium').split(',').map(v => v.trim()).filter(Boolean);
const widths = (process.env.TYPE_WIDTHS || '320,390').split(',').map(Number).filter(Boolean);
const output = process.env.TYPE_OUTPUT || '';

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

const targets = [
  { path:'', selector:'.thread-copy p', size:18, label:'homepage body' },
  { path:'', selector:'.perspective-copy > p:not(.perspective-statement)', size:18, label:'homepage perspective body' },
  { path:'', selector:'.waymaking-copy p', size:17, label:'Waymaking compact copy' },
  { path:'', selector:'.work-card p', size:17, label:'Current Focus card copy' },
  { path:'about/', selector:'.about-story-beat p', size:18, label:'About story body' },
  { path:'about/', selector:'.about-lens-copy p', size:18, label:'About personality body' },
  { path:'about/', selector:'.about-toolkit-list p', size:17, label:'About toolkit compact copy' },
  { path:'about/', selector:'.about-personality-meaning p', size:17, label:'About personality compact copy' },
  { path:'perspectives/', selector:'.perspective-index-summary', size:18, label:'Perspectives summary' },
  { path:'perspectives/rethinking-the-company/', selector:'.article-prose > p:not(.article-lead)', size:18, label:'Article body' },
  { path:'perspectives/rethinking-the-company/', selector:'.article-comparison td', size:17, label:'Article comparison compact copy' },
  { path:'perspectives/europe-at-a-crossroads/', selector:'.article-prose > p:not(.article-lead)', size:18, label:'Europe article body' },
  { path:'privacy/', selector:'.legal-content p', size:18, label:'Privacy body' }
];

(async () => {
  for (const engine of engines) {
    const browser = await launch(engine);
    try {
      for (const width of widths) {
        const page = await browser.newPage({ viewport: { width, height: 940 } });
        let currentPath = null;

        for (const target of targets) {
          if (currentPath !== target.path) {
            currentPath = target.path;
            await page.goto(base + target.path, { waitUntil:'networkidle', timeout:45000 });
            await page.evaluate(() => document.fonts.ready);
          }
          const metrics = await page.locator(target.selector).first().evaluate(el => {
            const style=getComputedStyle(el);
            const rect=el.getBoundingClientRect();
            return {
              fontSize:parseFloat(style.fontSize),
              lineHeight:parseFloat(style.lineHeight),
              width:rect.width,
              height:rect.height,
              overflow:document.documentElement.scrollWidth>innerWidth+1
            };
          });
          assert.ok(Math.abs(metrics.fontSize-target.size)<.1, engine+' '+width+' '+target.label+' expected '+target.size+'px, got '+metrics.fontSize);
          assert.ok(metrics.lineHeight/metrics.fontSize>=1.45, engine+' '+width+' '+target.label+' keeps readable line-height');
          assert.ok(metrics.width>0&&metrics.height>0, engine+' '+width+' '+target.label+' is visible');
          assert.equal(metrics.overflow,false, engine+' '+width+' '+target.path+' must not overflow horizontally');
        }

        await page.goto(base, { waitUntil:'networkidle', timeout:45000 });
        await page.evaluate(() => document.fonts.ready);
        const wordmark=await page.evaluate(() => {
          const i=document.querySelector('.header-wordmark .wordmark-i');
          const dot=getComputedStyle(i,'::after');
          const before=getComputedStyle(i,'::before');
          const parent=getComputedStyle(document.querySelector('.header-wordmark'));
          return {
            fontSize:parseFloat(parent.fontSize),
            dotWidth:parseFloat(dot.width),
            dotHeight:parseFloat(dot.height),
            dotTop:parseFloat(dot.top),
            beforeContent:before.content,
            beforeBackground:before.backgroundColor
          };
        });
        const dotRatio=wordmark.dotWidth/wordmark.fontSize;
        const dotBottomRatio=(wordmark.dotTop+wordmark.dotHeight)/wordmark.fontSize;
        assert.ok(dotRatio>=.40&&dotRatio<=.41, engine+' '+width+' wordmark dot renders at the approved .405em diameter');
        assert.ok(wordmark.dotTop<0, engine+' '+width+' wordmark dot starts above the i');
        assert.ok(dotBottomRatio>=.295&&dotBottomRatio<=.305, engine+' '+width+' wordmark dot preserves the original .30em lower-edge spacing');
        assert.ok(wordmark.beforeContent==='none'||wordmark.beforeContent==='normal', engine+' '+width+' wordmark has no ::before halo content');
        assert.ok(wordmark.beforeBackground==='rgba(0, 0, 0, 0)'||wordmark.beforeBackground==='transparent', engine+' '+width+' wordmark has no white halo background');
        if(output && (width===390 || width===1440)) {
          await page.locator('.header-wordmark').screenshot({
            path:output+'/wordmark-'+engine+'-'+width+'.png',
            animations:'disabled'
          });
        }

        await page.close();
      }
    } finally {
      await browser.close();
    }
  }
  console.log('PASS: mobile reading sizes are 18px primary / 17px compact across pages; August Kring dot is optically reduced, halo-free and correctly spaced');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
