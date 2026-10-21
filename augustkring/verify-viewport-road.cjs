'use strict';
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { join } = require('node:path');
const { chromium, firefox, webkit } = require('playwright');
const { PNG } = require('pngjs');

const base = process.env.ROAD_BASE || 'http://127.0.0.1:8765/humamap-preview/augustkring/';
const output = process.env.ROAD_OUTPUT || 'artifacts';
const engines = (process.env.ROAD_ENGINES || 'chromium').split(',').map(s => s.trim());
const widths = (process.env.ROAD_WIDTHS || '320,390,768,1024,1440').split(',').map(Number);
const browserTypes = { chromium, firefox, webkit };
const labels = [
  'Creative Thinking', 'Commercial Understanding', 'Strategic Judgment',
  'AI-Native Building', 'Purpose Driven'
];
mkdirSync(output, { recursive: true });

async function jump(page, y) {
  await page.evaluate(top => window.scrollTo({ top: Math.max(0, top), behavior: 'instant' }), y);
  await page.waitForTimeout(150);
}

function intersectionArea(a, b) {
  const horizontal = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const vertical = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return horizontal * vertical;
}

async function geometry(page) {
  return page.evaluate(() => {
    const scene = document.querySelector('.waymaking-scene');
    const artspace = document.querySelector('.waymaking-artspace');
    const road = document.querySelector('.waymaking-road-wrap');
    const bitmap = document.querySelector('.waymaking-road-art img');
    const svg = document.querySelector('.waymaking-paint-art');
    const chapters = [...scene.querySelectorAll('.waymaking-beat')];
    const boxes = selector => {
      const rect = selector.getBoundingClientRect();
      return {
        left: rect.left, right: rect.right, top: rect.top,
        bottom: rect.bottom, width: rect.width, height: rect.height
      };
    };
    const picture = document.querySelector('.waymaking-road-art');
    const styles = getComputedStyle(road);
    return {
      road: boxes(road),
      artspace: boxes(artspace),
      summary: boxes(document.querySelector('.thread-summary')),
      scene: boxes(scene),
      copies: chapters.map(chapter => boxes(chapter.querySelector('.waymaking-copy'))),
      chapterBoxes: chapters.map(chapter => boxes(chapter)),
      titles: chapters.map(chapter => {
        const h = chapter.querySelector('h3');
        return h.getAttribute('aria-label') || h.textContent.trim();
      }),
      parentIsArtspace: road.parentElement === artspace,
      sticky: styles.position === 'sticky',
      topCSS: styles.top,
      opacity: Number(styles.opacity),
      imageOpacity: Number(getComputedStyle(picture).opacity),
      svgDisplay: getComputedStyle(svg).display,
      bitmapLoaded: bitmap.complete && bitmap.naturalWidth > 0,
      currentSrc: bitmap.currentSrc,
      overflow: document.documentElement.scrollWidth > innerWidth + 1
    };
  });
}

function pngDifference(aBuffer, bBuffer, threshold = 8) {
  const a = PNG.sync.read(aBuffer), b = PNG.sync.read(bBuffer);
  assert.equal(a.width,b.width);
  assert.equal(a.height,b.height);
  let count=0;
  for(let i=0;i<a.data.length;i+=4){
    const difference = Math.abs(a.data[i]-b.data[i])+
      Math.abs(a.data[i+1]-b.data[i+1])+
      Math.abs(a.data[i+2]-b.data[i+2]);
    if(difference>threshold)count++;
  }
  return count;
}

async function paintedPixels(page) {
  const road = page.locator('.waymaking-road-wrap');
  const before=await page.screenshot({ animations:'disabled' });
  await road.evaluate(el=>el.style.setProperty('visibility','hidden','important'));
  const after=await page.screenshot({ animations:'disabled' });
  await road.evaluate(el=>el.style.removeProperty('visibility'));
  return pngDifference(before,after);
}

async function coords(page) {
  return page.evaluate(()=>{
    const elements=[...document.querySelectorAll('.waymaking-beat')];
    return elements.map(el=>{
      const r=el.getBoundingClientRect();
      return scrollY+r.top+r.height/2;
    });
  });
}

async function verifyViewport(browser,engine,width){
  const page=await browser.newPage({ viewport:{width,height:900} });
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  try{
    await page.goto(base,{waitUntil:'networkidle',timeout:45000});
    await page.evaluate(()=>document.fonts.ready);
    await page.locator('.waymaking-road-art img').evaluate(img=>img.decode());
    const centers=await coords(page);
    const captured=[];
    for(let i=0;i<centers.length;i++){
      await jump(page,centers[i]-450);
      const g=await geometry(page);
      assert.deepEqual(g.titles,labels,'Chapter content or headings changed');
      assert.equal(g.parentIsArtspace,true,'Road MUST stay inside real story grid, not body portal');
      assert.equal(g.sticky,true,'Road must use native sticky rather than fixed scroll controller');
      assert.ok(g.topCSS === '16px','Road CSS top must be 16px');
      assert.equal(g.opacity,1,'Road opacity must never animate');
      assert.equal(g.imageOpacity,1,'Original approved image must not fade on mobile');
      assert.equal(g.svgDisplay,'none','Obsolete animated SVG must not paint');
      assert.equal(g.bitmapLoaded,true,'Approved source bitmap must load');
      assert.equal(g.overflow,false,'No horizontal overflow');
      for (const [copyIndex,copy] of g.copies.entries()) {
        const overlap=intersectionArea(g.road,copy);
        assert.equal(overlap,0,
          'Graphic OBSCURES chapter '+labels[copyIndex]+' ('+width+'px, area '+overlap+')');
      }
      assert.equal(intersectionArea(g.road,g.summary),0,
        'Graphic overlaps introductory Where I add value paragraphs');
      const pixels=await paintedPixels(page);
      assert.ok(pixels>1000,'The road is invisible while chapter '+labels[i]+' is being read');
      if(i>=1){
        assert.ok(Math.abs(g.road.top-16)<1.2,
          'Road failed to stay at top=16 through chapters: '+labels[i]+' at '+g.road.top);
      }
      captured.push({chapter:labels[i],roadTop:g.road.top,visiblePixels:pixels,
        copyRect:g.copies[i],roadRect:g.road});
      if (width===320||width===390||width===1440) {
        await page.screenshot({
          path:join(output,engine+'-'+width+'-chapter-'+i+'.png'),animations:'disabled'
        });
      }
    }
    // Compare the art without foreground text at successive central chapters.
    await page.evaluate(()=>{
      for(const selector of ['.home-main','.home-header','.home-footer']){
        const element=document.querySelector(selector);
        if(element)element.style.visibility='hidden';
      }
      // Restore artwork when main becomes hidden: it is inside main.
      const artspace=document.querySelector('.waymaking-artspace');
      if(artspace)artspace.style.visibility='visible';
    });
    await jump(page,centers[1]-450);
    const a=await page.screenshot({animations:'disabled'});
    await jump(page,centers[2]-450);
    const b=await page.screenshot({animations:'disabled'});
    assert.ok(pngDifference(a,b,8)<35,
      'Artwork moves or changes during middle chapters (background-only pixel regression)');
    await page.evaluate(()=>{
      for(const selector of ['.home-main','.home-header','.home-footer','.waymaking-artspace']){
        const element=document.querySelector(selector);
        if(element)element.style.removeProperty('visibility');
      }
    });
    // No image should remain physically visible once later content begins.
    for(const selector of ['#work','#perspective','.homepage-contact','.home-footer']){
      const readPosition=await page.locator(selector).evaluate(element=>
        scrollY+element.getBoundingClientRect().top-innerHeight*0.4);
      await jump(page,readPosition);
      const visible=await paintedPixels(page);
      if(visible>0){
        const diagnostic=await geometry(page);
        console.log('EXIT_DIAGNOSTIC',engine,width,selector,JSON.stringify({
          visible,road:diagnostic.road,scene:diagnostic.scene,
          viewportHeight:900,readingY:readPosition
        }));
        await page.screenshot({path:join(output,engine+'-'+width+'-exit-failed.png')});
      }
      assert.equal(visible,0,'Road still visible while reading '+selector+' ('+visible+' pixels)');
    }
    // Backwards scrolling restores the same art without a fade.
    await jump(page,centers[2]-450);
    const returned=await geometry(page);
    assert.equal(returned.imageOpacity,1);
    assert.equal(returned.sticky,true);
    assert.ok(await paintedPixels(page)>1000,'Road missing after reverse scroll');
    assert.deepEqual(errors,[],'Browser console errors');
    console.log('PASS '+engine+' '+width+' '+JSON.stringify({
      pinnedTop: captured.map(x=>x.roadTop),
      visiblePixels:captured.map(x=>x.visiblePixels),
      textOverlaps:0,summaryOverlaps:0,subsequentSectionsHidden:true
    }));
  }finally{
    await page.close();
  }
}

(async()=>{
  for(const engine of engines){
    assert.ok(browserTypes[engine],'Browser engine not recognized '+engine);
    const options=engine==='chromium'&&process.env.CHROME_BIN?
      { executablePath:process.env.CHROME_BIN,headless:true,args:['--no-sandbox'] }:
      { headless:true };
    const browser=await browserTypes[engine].launch(options);
    try{
      for(const width of widths)await verifyViewport(browser,engine,width);
      const reduced=await browser.newPage({ viewport:{width:390,height:900},reducedMotion:'reduce' });
      await reduced.goto(base,{waitUntil:'networkidle'});
      await reduced.locator('.waymaking-beat').nth(2).scrollIntoViewIfNeeded();
      await reduced.waitForTimeout(140);
      assert.equal((await geometry(reduced)).imageOpacity,1);
      assert.equal(await reduced.locator('.waymaking-letter').count(),0,
        'Reduced motion must not split semantic heading text');
      await reduced.close();
      const webp=await browser.newPage({ viewport:{width:390,height:900} });
      await webp.goto(base+'no-avif.html',{waitUntil:'networkidle'});
      await webp.locator('.waymaking-beat').nth(2).scrollIntoViewIfNeeded();
      await webp.waitForTimeout(140);
      assert.ok((await geometry(webp)).currentSrc.endsWith('.webp'),
        'WebP-only first-load variant must load approved illustration');
      await webp.close();
      const noJS=await browser.newPage({ viewport:{width:390,height:900},javaScriptEnabled:false });
      await noJS.goto(base,{waitUntil:'load'});
      assert.deepEqual(await noJS.locator('.waymaking-beat h3').allTextContents(),labels);
      assert.equal(await noJS.locator('.waymaking-road-art').isVisible(),true);
      await noJS.close();
      console.log('PASS '+engine+' reduced-motion + no-JS + first-load WebP');
    }finally{await browser.close();}
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
