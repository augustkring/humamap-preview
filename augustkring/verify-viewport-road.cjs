'use strict';
const assert=require('node:assert/strict');
const {mkdirSync}=require('node:fs');
const {join}=require('node:path');
const {chromium,firefox,webkit}=require('playwright');
const {PNG}=require('pngjs');
const base=process.env.ROAD_BASE||'http://127.0.0.1:8765/humamap-preview/augustkring/';
const output=process.env.ROAD_OUTPUT||'artifacts';
const engines=(process.env.ROAD_ENGINES||'chromium').split(',');
const widths=(process.env.ROAD_WIDTHS||'320,390,768,1024,1440').split(',').map(Number);
const browserTypes={chromium,firefox,webkit};
const labels=['Creative Thinking','Commercial Understanding','Strategic Judgment','AI-Native Building','Purpose Driven'];
mkdirSync(output,{recursive:true});

async function scroll(page,y) {
 // WebKit can still be mid-smooth-scroll when the old nonstandard
 // behavior:'instant' scrollTo option returns. That produced false chapter
 // checkpoints with identical progress. Disable CSS scroll smoothing ONLY
 // in the QA browser session and verify actual final scroll coordinates.
 const target=await page.evaluate(top=>{
   document.documentElement.style.setProperty('scroll-behavior','auto','important');
   document.body.style.setProperty('scroll-behavior','auto','important');
   const end=Math.max(0,document.documentElement.scrollHeight-innerHeight);
   const clamped=Math.max(0,Math.min(top,end));
   window.scrollTo({top:clamped,behavior:'auto'});
   return clamped;
 },y);
 await page.waitForFunction(top=>Math.abs(window.scrollY-top)<3,target,{timeout:7000});
 await page.evaluate(()=>new Promise(resolve=>
   requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await page.waitForTimeout(65);
}
async function checkpoint(page) {
 return page.evaluate(()=>{
  const qs=s=>document.querySelector(s);
  const box=el=>{
   const r=el.getBoundingClientRect();
   return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};
  };
  const road=qs('.waymaking-road-wrap');
  const story=qs('[data-waymaking-story]');
  const beats=[...document.querySelectorAll('.waymaking-beat')];
  const art=qs('.waymaking-original-reveal');
  const mask=art.querySelector('[data-waymaking-reveal]');
  const surface=getComputedStyle(art);
  const end=qs('.waymaking-resolution');
  return {
   fraction:Number(story.dataset.waymakingProgress),
   animated:story.dataset.waymakingAnimated==='true',
   dashOffset:parseFloat(mask.style.strokeDashoffset),
   rawOffset:mask.style.strokeDashoffset,
   length:mask.getTotalLength(),
   featherCount:art.querySelectorAll('[data-waymaking-feather]').length,
   scrollY:window.scrollY,road:box(road),art:box(art),scene:box(qs('.waymaking-scene')),
   intro:box(qs('.thread-summary')),
   texts:beats.map(x=>box(x.querySelector('.waymaking-copy'))),
   headings:beats.map(x=>box(x.querySelector('h3'))),
   titles:beats.map(x=>x.querySelector('h3').getAttribute('aria-label')||x.querySelector('h3').textContent.trim()),
   endTop:scrollY+end.getBoundingClientRect().top,
   lastCopyBottom:scrollY+beats[4].querySelector('.waymaking-copy').getBoundingClientRect().bottom,
   sticky:getComputedStyle(road).position==='sticky',
   roadOpacity:Number(getComputedStyle(road).opacity),
   clipTop:Number.parseFloat(road.style.getPropertyValue('--waymaking-safe-top'))||0,
   clipBottom:Number.parseFloat(road.style.getPropertyValue('--waymaking-safe-bottom'))||0,
   topCSS:getComputedStyle(road).top,
   background:surface.backgroundColor,
   fixed:getComputedStyle(road).position==='fixed',
   visible:getComputedStyle(road).display!=='none'&&getComputedStyle(road).visibility==='visible',
   imagePieces:art.querySelectorAll('image').length,
   sourceViewHeight:art.viewBox.baseVal.height,
   scaling:art.preserveAspectRatio.baseVal.align,
   visibleHeight:road.getBoundingClientRect().height,
   opaqueRect:!!art.querySelector('rect,foreignObject'),
   imageSource:road.querySelector('.waymaking-original-source img')?.getAttribute('src'),
   animatedOriginal:art.querySelector('image')?.getAttribute('href'),
   bitmap:!!road.querySelector('img,picture,canvas'),
   roadParent:road.parentElement===document.body,
   overflow:document.documentElement.scrollWidth>innerWidth+1,
   bodyWidth:document.documentElement.scrollWidth,
   textWidth:beats[0].querySelector('.waymaking-copy').getBoundingClientRect().width
  };
 });
}
function overlap(a,b) {
 return Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*
        Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
}
function changedPixels(a,b,rect) {
 const x=PNG.sync.read(a),y=PNG.sync.read(b);
 assert.equal(x.width,y.width);assert.equal(x.height,y.height);
 let changes=0;
 const left=rect?Math.max(0,Math.floor(rect.left)-2):0;
 const right=rect?Math.min(x.width,Math.ceil(rect.right)+2):x.width;
 const top=rect?Math.max(0,Math.floor(rect.top)-2):0;
 const bottom=rect?Math.min(x.height,Math.ceil(rect.bottom)+2):x.height;
 for(let j=top;j<bottom;j++)for(let i=left;i<right;i++) {
  const pos=(j*x.width+i)*4;
  const delta=Math.abs(x.data[pos]-y.data[pos])+
    Math.abs(x.data[pos+1]-y.data[pos+1])+
    Math.abs(x.data[pos+2]-y.data[pos+2]);
  if(delta>9)changes++;
 }
 return changes;
}
async function paintedPixels(page) {
 const state=await checkpoint(page);
 const view=page.viewportSize();
 if(state.road.bottom<=0||state.road.top>=view.height) return 0;
 const before=await page.screenshot({animations:'disabled'});
 await page.locator('.waymaking-road-wrap').evaluate(x=>x.style.setProperty('visibility','hidden','important'));
 const after=await page.screenshot({animations:'disabled'});
 await page.locator('.waymaking-road-wrap').evaluate(x=>x.style.removeProperty('visibility'));
 return changedPixels(before,after,state.road);
}
async function paintedCoverage(page) {
  const s=await checkpoint(page),rect=s.road,viewport=page.viewportSize();
  if(rect.bottom<=0||rect.top>=viewport.height||!s.visible)
    return {count:0,minY:null,maxY:null};
  const before=PNG.sync.read(await page.screenshot({animations:'disabled'}));
  await page.locator('.waymaking-road-wrap').evaluate(e=>e.style.setProperty('visibility','hidden','important'));
  const after=PNG.sync.read(await page.screenshot({animations:'disabled'}));
  await page.locator('.waymaking-road-wrap').evaluate(e=>e.style.removeProperty('visibility'));
  const l=Math.max(0,Math.floor(rect.left)),r=Math.min(before.width,Math.ceil(rect.right));
  const t=Math.max(0,Math.floor(rect.top)),b=Math.min(before.height,Math.ceil(rect.bottom));
  let count=0,minY=Infinity,maxY=-Infinity;
  for(let y=t;y<b;y++)for(let x=l;x<r;x++){
    const i=(y*before.width+x)*4;
    const delta=Math.abs(before.data[i]-after.data[i])+
      Math.abs(before.data[i+1]-after.data[i+1])+
      Math.abs(before.data[i+2]-after.data[i+2]);
    if(delta>12){count++;minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
  }
  return {count,minY:minY===Infinity?null:minY,maxY:maxY===-Infinity?null:maxY};
}
async function centers(page) {
 return page.evaluate(()=>[...document.querySelectorAll('.waymaking-beat')].map(beat=>{
  const r=beat.getBoundingClientRect();
  return scrollY+r.top+r.height*.5;
 }));
}
async function runOne(browser,engine,width) {
 const page=await browser.newPage({viewport:{width,height:900}});
 const problems=[];
 page.on('pageerror',e=>problems.push(e.message));
 page.on('console',e=>{if(e.type()==='error')problems.push(e.text());});
 try {
  await page.goto(base,{waitUntil:'networkidle',timeout:45000});
  await page.evaluate(()=>document.fonts.ready);
  const middles=await centers(page);
  const storyTop=await page.locator('.waymaking-scene').evaluate(el=>
    scrollY+el.getBoundingClientRect().top);
  await scroll(page,storyTop-110);
  const first=await checkpoint(page);
  assert.deepEqual(first.titles,labels);
  assert.ok(first.headings[0].top-first.scene.top<=95,
    'Creative Thinking starts too far BELOW the route ('+(first.headings[0].top-first.scene.top)+'px)');
  assert.equal(first.opaqueRect,false,'Original ink must have no rectangular background');
  assert.equal(first.bitmap,true,'Original picture element missing');
  assert.equal(first.imageSource,'assets/waymaking-editorial-ink.webp','Approved original not restored');
  assert.equal(first.animatedOriginal,'assets/waymaking-editorial-ink.webp','Progressive mask paints wrong artwork');
  assert.equal(first.background,'rgba(0, 0, 0, 0)','Artwork SVG background must be transparent');
  assert.equal(first.roadParent,true,'Road must be portaled to viewport body');
  assert.equal(first.sticky,false,'Road must be FIXED, never sticky');
  assert.equal(first.fixed,true,'Road is not CSS fixed to viewport');
  assert.equal(first.sourceViewHeight,2148,'Artwork must be the extended original, not its old short copy');
  assert.equal(first.scaling,1,'SVG must fill its full fixed viewport (SVG_PRESERVEASPECTRATIO_NONE=1)');
  assert.equal(first.imagePieces,1,'Must be exactly ONE unbroken original ink image, not a repeated seam');
  assert.equal(first.overflow,false,'No horizontal scrollbar');
  const chapterSpacing=await page.locator('.waymaking-copy-column').evaluate(el=>({
    direction:getComputedStyle(el).flexDirection,
    gap:parseFloat(getComputedStyle(el).gap)
  }));
  assert.equal(chapterSpacing.direction,'column','Competency chapters must remain one flex track');
  assert.ok(chapterSpacing.gap>=8&&chapterSpacing.gap<=12,
    'Equal chapter-to-chapter gap must be 8-12px, not individually assigned');
  // Paragraphs have different lengths; requiring equal *box heights* would
  // make short and long copy awkward, while CSS gap stays exactly uniform.
  assert.ok(first.textWidth>=145,'Mobile text is too narrow');
  const storyGap=first.endTop-first.lastCopyBottom;
  // The original artwork remains completely hidden while introductory text
  // is being read. No opacity/fade should affect its five-chapter visibility.
  assert.ok(storyGap>10&&storyGap<340,
    'Too much blank space before Waymaker conclusion: '+storyGap+'px');
  const stages=[];
  for(let i=0;i<5;i++) {
   await scroll(page,middles[i]-900*.16);
   const state=await checkpoint(page);
   assert.equal(state.animated,true,'No working motion controller');
   assert.equal(state.roadOpacity,1,'Road opacity MUST remain 1 during all five chapters');
   assert.equal(state.visible,true,'The ORIGINAL road is not visible with '+labels[i]);
   assert.ok(Number.isFinite(state.fraction),'Progress missing');
   assert.ok(state.fraction>.035&&state.fraction<=1,'Invalid road progress '+state.fraction);
   const frontLength=Math.min(state.fraction,.055,(1-state.fraction)*.55);
   const expectedOffset=state.length*(1-(state.fraction-frontLength));
   assert.equal(state.featherCount,7,'The leading road brush must have seven feather layers');
   assert.ok(Math.abs(state.dashOffset-expectedOffset)<state.length*.006,
     'Stroke mask progress mismatch at '+labels[i]+': '+JSON.stringify({
       rawOffset:state.rawOffset,dashOffset:state.dashOffset,length:state.length,
       fraction:state.fraction,expected:expectedOffset}));
   assert.equal(state.opaqueRect,false,'Restored art has a rectangular backing');
   assert.equal(state.imageSource,'assets/waymaking-editorial-ink.webp','Wrong original asset');
   assert.equal(state.roadParent,true);
   assert.equal(state.sticky,false,'Road may not move with the narrative container');
   assert.ok(Math.abs(state.road.top-16)<1,'Fixed road moved away from viewport top: '+state.road.top);
   assert.equal(state.overflow,false);
   for(const [index,text] of state.texts.entries()) {
    const collision=overlap(state.road,text);
    assert.equal(collision,0,'Road overlays paragraph '+labels[index]+' at '+width+'px');
   }
   assert.ok(state.intro.bottom<=state.road.top+1,'Road activated while introduction remains visible');
   if(i===4){
     const signature=await page.locator('.waymaking-resolution p').evaluate(el=>{
       const r=el.getBoundingClientRect();
       return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};
     });
     assert.equal(overlap(state.road,signature),0,'Fixed ink obscures Waymaker conclusion');
     const heading=await page.locator('#work-title').evaluate(el=>{
       const r=el.getBoundingClientRect();
       return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};
     });
     assert.equal(overlap(state.road,heading),0,'Fixed ink obscures My current focus heading');
   }
   if(i>0)assert.ok(state.fraction>stages[i-1].fraction+.10,
     'Road did NOT grow into '+labels[i]+', previous '+stages[i-1].fraction+' next '+state.fraction);
   const coverage=await paintedCoverage(page);
   const pixels=coverage.count;
   assert.ok(pixels>150,'Original road rendered no ink at '+labels[i]+' ('+pixels+' pixels)');
   assert.ok(coverage.maxY!==null,'Painted road boundary missing');
   if(i>0){
     assert.ok(coverage.maxY>=stages[i-1].paintedBottom-5,
       'The painted road SHORTENED while scrolling: '+labels[i]+', '+coverage.maxY+
       ' vs '+stages[i-1].paintedBottom);
   }
   if(i===4){
     const achieved=(coverage.maxY-state.road.top)/state.road.height;
     assert.ok(achieved>=.63,
       'The completed road is TOO SHORT on screen: '+Math.round(achieved*100)+'% of fixed stage');
   }
   stages.push({chapter:labels[i],fraction:state.fraction,pixels,top:state.road.top,paintedBottom:coverage.maxY});
   if([320,390,1440].includes(width)) {
    await page.screenshot({path:join(output,engine+'-'+width+'-chapter-'+i+'.png'),animations:'disabled'});
   }
  }
  // The mask MUST grow visible black painted pixels, not merely change a number.
  // This comparison is taken while the SVG geometry is pinned on screen.
  const earlier=stages[0].pixels,later=stages[3].pixels;
  // Real pixels (not just dash attribute values) must increase substantially
  // while artwork geometry remains fixed in viewport.
  assert.ok(later>earlier*1.35,'Road is NOT becoming visibly longer: '+earlier+' -> '+later);
  assert.ok(stages[4].paintedBottom>stages[0].paintedBottom+180,
    'Original ink did not materially EXTEND down screen while story advanced');
  // Reverse scrub: revisit previous chapters and measure actual mask rewind.
  await scroll(page,middles[1]-900*.16);
  const rewind=await checkpoint(page);
  assert.ok(Math.abs(rewind.fraction-stages[1].fraction)<.008,
    'Reverse scrolling must deterministically redraw same path fraction');
  await scroll(page,middles[4]-900*.16);
  // Following sections MUST be clean; crop test to on-screen road region only.
  for(const selector of ['#work','#perspective','.homepage-contact','.home-footer']) {
   const pos=await page.locator(selector).first().evaluate(el=>
    scrollY+el.getBoundingClientRect().top-innerHeight*.42);
   await scroll(page,pos);
   const pixels=await paintedPixels(page);
   if(pixels>0){
    const state=await checkpoint(page);
    const coords=await page.evaluate(()=>({scrollY,viewportHeight:innerHeight}));
    console.log('EXIT_FAIL_DIAGNOSTIC',engine,width,selector,JSON.stringify({pixels,road:state.road,scene:state.scene,intro:state.intro,coords,storyGap:state.endTop-state.lastCopyBottom}));
    await page.screenshot({path:join(output,engine+'-'+width+'-exit-debug.png'),animations:'disabled'});
   }
   assert.equal(pixels,0,'Road continued under '+selector+': '+pixels+' rendered pixels');
  }
  // A real visitor can scroll BACK from later sections; mask and road
  // must return to their exact previous state, not remain faded or hidden.
  await scroll(page,middles[2]-900*.16);
  const restored=await checkpoint(page);
  assert.ok(restored.roadOpacity>.99,'Road did not reappear after reverse scroll from later content');
  assert.ok(Math.abs(restored.fraction-stages[2].fraction)<.008,
    'Road did not rewind to Strategic Judgment after leaving story');

  // 200% copy enlargement: normal HTML reflows without a horizontally
  // scrolling page or text obscured by the decorative SVG.
  if(width===320){
    await page.evaluate(()=>{
      for(const node of document.querySelectorAll('.waymaking-copy h3, .waymaking-copy p')){
        const size=parseFloat(getComputedStyle(node).fontSize);
        node.style.fontSize=(2*size)+'px';
        node.style.lineHeight='1.5';
      }
    });
    await page.waitForTimeout(140);
    const reflow=await checkpoint(page);
    assert.equal(reflow.overflow,false,'200% mobile text should reflow without horizontal scrolling');
  }

  // Live viewport changes: switching between authored mobile and desktop
  // vector art must preserve a valid progressive SVG mask and readable copy.
  if(width===390){
    await page.setViewportSize({width:1024,height:900});
    await page.waitForTimeout(180);
    const resized=await checkpoint(page);
    assert.equal(resized.overflow,false,'Responsive resize introduced horizontal overflow');
    assert.ok(resized.fraction>.10&&resized.fraction<=1,'Road stopped drawing after responsive resize');
    assert.ok(resized.length>100,'Original winding mask should remain valid');
    assert.equal(resized.scaling,1,'Responsive changes must still show the entire road height');
    assert.equal(resized.animatedOriginal,'assets/waymaking-editorial-ink.webp','Resize must preserve exact original art');
    for(const text of resized.texts){
      assert.equal(overlap(resized.road,text),0,'Road obscures copy after 390→1024 resizing');
    }
  }

  assert.deepEqual(problems,[],'Browser JS errors');
  console.log('PASS '+engine+' '+width+' '+JSON.stringify({stages,storyGap,bitmap:'approved-original',opaqueRect:false,overlaps:0,noLaterInk:true,reverseFromExit:true}));
 }finally {await page.close();}
}
(async()=>{
 for(const engine of engines) {
  assert.ok(browserTypes[engine],'Unknown engine '+engine);
  const opts=engine==='chromium'&&process.env.CHROME_BIN?
   {executablePath:process.env.CHROME_BIN,headless:true,args:['--no-sandbox']}:
   {headless:true};
  const browser=await browserTypes[engine].launch(opts);
  try {
   for(const width of widths)await runOne(browser,engine,width);
   const reduced=await browser.newPage({viewport:{width:390,height:900},reducedMotion:'reduce'});
   await reduced.goto(base,{waitUntil:'networkidle'});
   await reduced.locator('.waymaking-beat').nth(2).scrollIntoViewIfNeeded();
   await reduced.waitForTimeout(130);
   const reducedState=await checkpoint(reduced);
   assert.equal(reducedState.fraction,1,'Reduced-motion must show COMPLETE static illustration');
   assert.ok(Math.abs(reducedState.dashOffset)<.01,'Reduced-motion mask must be fully revealed');
   assert.equal(await reduced.locator('.waymaking-letter').count(),0);
   await reduced.close();
   const nojs=await browser.newPage({viewport:{width:390,height:900},javaScriptEnabled:false});
   await nojs.goto(base,{waitUntil:'load'});
   assert.deepEqual(await nojs.locator('.waymaking-beat h3').allTextContents(),labels);
   assert.equal(await nojs.locator('.waymaking-original-source').isVisible(),true);
   await nojs.close();
   console.log('PASS '+engine+' no-JS, reduced motion, semantic content');
  }finally {await browser.close();}
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
