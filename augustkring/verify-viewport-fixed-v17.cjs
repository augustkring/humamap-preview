'use strict';
const assert=require('node:assert/strict');
const {mkdirSync}=require('node:fs');
const {join}=require('node:path');
const {chromium,firefox,webkit}=require('playwright');
const {PNG}=require('pngjs');
const base=process.env.ROAD_BASE||'http://127.0.0.1:8765/humamap-preview/augustkring/';
const output=process.env.ROAD_OUTPUT||'artifacts';
const engines=(process.env.ROAD_ENGINES||'chromium').split(',').map(x=>x.trim());
const widths=(process.env.ROAD_WIDTHS||'320,390,768,1024,1440').split(',').map(Number);
const types={chromium,firefox,webkit};
const labels=['Creative Thinking','Commercial Understanding','Strategic Judgment','AI-Native Building','Purpose Driven'];
mkdirSync(output,{recursive:true});

async function go(page,y) {
 const target=await page.evaluate(v=>{
  document.documentElement.style.setProperty('scroll-behavior','auto','important');
  document.body.style.setProperty('scroll-behavior','auto','important');
  const end=Math.max(0,document.documentElement.scrollHeight-innerHeight);
  const to=Math.min(end,Math.max(0,v));
  scrollTo({top:to,behavior:'auto'});
  return to;
 },y);
 await page.waitForFunction(v=>Math.abs(scrollY-v)<3,target,{timeout:7000});
 await page.evaluate(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))));
 await page.waitForTimeout(75);
}

async function info(page) {
 return page.evaluate(()=>{
  const q=s=>document.querySelector(s);
  const box=n=>{const r=n.getBoundingClientRect();return {
   top:r.top,bottom:r.bottom,left:r.left,right:r.right,
   width:r.width,height:r.height};};
  const story=q('[data-waymaking-story]');
  const road=q('.waymaking-road-wrap'),svg=q('.waymaking-extended-original');
  const mask=svg.querySelector('[data-waymaking-reveal]');
  const beats=[...q('.waymaking-scene').querySelectorAll('.waymaking-beat')];
  const pos=getComputedStyle(road);
  return {
   fixed:pos.position==='fixed',cssTop:pos.top,
   road:box(road),roadVisible:pos.visibility==='visible'&&pos.display!=='none',
   roadOpacity:Number(pos.opacity),active:document.body.dataset.waymakingRoadActive==='true',
   viewportHeight:innerHeight,clip:Number.parseFloat(road.style.getPropertyValue('--waymaking-entrance-clip'))||0,
   conclusionClip:Number.parseFloat(road.style.getPropertyValue('--waymaking-conclusion-clip'))||0,
   parentBody:road.parentElement===document.body,
   artBackground:getComputedStyle(svg).backgroundColor,
   artViewBox:svg.getAttribute('viewBox'),
   copies:[...svg.querySelectorAll('image')].map(x=>({href:x.getAttribute('href'),transform:x.getAttribute('transform')})),
   length:mask.getTotalLength(),dash:Number.parseFloat(mask.style.strokeDashoffset),
   featherCount:svg.querySelectorAll('[data-waymaking-feather]').length,
   fraction:Number(story.dataset.waymakingProgress),
   beatHeights:beats.map(x=>box(x).height),
   copyBoxes:beats.map(x=>box(x.querySelector('.waymaking-copy'))),
   titles:beats.map(x=>x.querySelector('h3').getAttribute('aria-label')||x.querySelector('h3').textContent.trim()),
   intro:box(q('.thread-summary')),introBottom:box(q('.thread-summary')).bottom,
   signoff:box(q('.waymaking-resolution')),
   lastCopy:box(beats.at(-1).querySelector('.waymaking-copy')),
   story:box(story),
   noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1,
   imgOriginal:road.querySelector('picture img')?.getAttribute('src'),
   sourceIsUnchanged:!!road.querySelector('source[srcset="assets/waymaking-editorial-ink.avif"]')
  };
 });
}
async function centers(page) {
 return page.evaluate(()=>[...document.querySelectorAll('.waymaking-beat')].map(el=>{
  const r=el.getBoundingClientRect();return scrollY+r.top+r.height/2;
 }));
}
const intersection=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*
  Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
function pixelDiff(a,b,rect) {
 const p=PNG.sync.read(a),q=PNG.sync.read(b);
 assert.equal(p.width,q.width);assert.equal(p.height,q.height);
 const L=Math.max(0,Math.floor(rect.left)-2),R=Math.min(p.width,Math.ceil(rect.right)+2);
 const T=Math.max(0,Math.floor(rect.top)-2),B=Math.min(p.height,Math.ceil(rect.bottom)+2);
 let n=0;
 for(let y=T;y<B;y++)for(let x=L;x<R;x++){
  const k=(y*p.width+x)*4;
  const delta=Math.abs(p.data[k]-q.data[k])+Math.abs(p.data[k+1]-q.data[k+1])+Math.abs(p.data[k+2]-q.data[k+2]);
  if(delta>9)n++;
 }
 return n;
}
async function painted(page) {
 const state=await info(page),r=state.road,v=page.viewportSize();
 if(!state.roadVisible||r.bottom<=0||r.top>=v.height||r.right<=0||r.left>=v.width)return 0;
 const before=await page.screenshot({animations:'disabled'});
 await page.locator('.waymaking-road-wrap').evaluate(el=>el.style.setProperty('visibility','hidden','important'));
 const after=await page.screenshot({animations:'disabled'});
 await page.locator('.waymaking-road-wrap').evaluate(el=>el.style.removeProperty('visibility'));
 return pixelDiff(before,after,r);
}
function fixedInvariant(state,width,name) {
 assert.equal(state.parentBody,true,name+' road is still inside scrolling story');
 assert.equal(state.fixed,true,name+' road uses STICKY rather than FIXED');
 assert.ok(Math.abs(state.road.top-Math.min(270,.30*state.viewportHeight))<1.1,name+' artwork MOVED: '+state.road.top);
 assert.ok(state.roadVisible,name+' original road is invisible');
 assert.ok(state.roadOpacity>.95,name+' original road faded under chapter');
 assert.equal(state.artViewBox,'0 0 948 2130',name+' road was not lengthened');
 assert.equal(state.copies.length,2,name+' wrong number of long original image segments');
 assert.ok(state.copies.every(x=>x.href==='assets/waymaking-editorial-ink.webp'),name+' substitute art found');
 assert.equal(state.imgOriginal,'assets/waymaking-editorial-ink.webp',name+' original image removed');
 assert.equal(state.sourceIsUnchanged,true,name+' approved AVIF fallback removed');
 assert.equal(state.featherCount,7,name+' matched original brush layering changed');
 assert.ok(state.noHorizontalOverflow,name+' horizontal overflow');
 assert.equal(state.artBackground,'rgba(0, 0, 0, 0)',name+' framed background is not transparent');
 assert.ok(state.road.width>30,name+' road is too small');
 for(let i=0;i<state.copyBoxes.length;i++)
  assert.equal(intersection(state.road,state.copyBoxes[i]),0,name+' ink overlaps '+labels[i]+' text');
 // The introduction can intersect the full FIXED rectangle but MUST be
 // excluded by cropping the ink while that introductory text remains.
 if(state.introBottom>state.road.top+1) {
  assert.ok(state.clip>=state.introBottom-state.road.top-22,
   name+' original ink intersects Where I add value intro');
 }
 if(state.signoff.top<state.road.bottom) {
  assert.ok(state.conclusionClip>=state.road.bottom-state.signoff.top+27,
   name+' extended ink overlaps the Waymaker conclusion');
 }
}
async function runOne(browser,engine,width) {
 const page=await browser.newPage({viewport:{width,height:900}});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try {
  await page.goto(base,{waitUntil:'networkidle',timeout:45000});
  await page.evaluate(()=>document.fonts.ready);
  const stageY=await page.locator('.waymaking-scene').evaluate(el=>scrollY+el.getBoundingClientRect().top);
  await go(page,stageY-180);
  let stat=await info(page);
  assert.deepEqual(stat.titles,labels,'Approved five competency paragraphs or headings changed');
  assert.equal(stat.parentBody,true,'Artwork failed to escape scroll ancestors');
  assert.equal(stat.fixed,true,'Fixed route required even before first chapter');
  assert.equal(stat.copies.length,2,'Long winding original road has not been constructed');
  const middles=await centers(page);
  const stages=[];
  for(let i=0;i<5;i++){
   await go(page,middles[i]-900*.49);
   stat=await info(page);
   fixedInvariant(stat,width,engine+'/'+width+'/'+labels[i]);
   assert.ok(stat.fraction>.03&&stat.fraction<=1,'Route never started drawing: '+stat.fraction);
   const front=Math.min(stat.fraction,.055,(1-stat.fraction)*.55);
   const expected=stat.length*(1-(stat.fraction-front));
   assert.ok(Math.abs(stat.dash-expected)<stat.length*.009,'Ink mask progression drifted '+labels[i]);
   if(i>0){
    assert.ok(stat.fraction>stages[i-1].progress+.1,'Road did not extend between chapter '+labels[i-1]+' and '+labels[i]);
    assert.ok(Math.abs(stat.road.left-stages[i-1].left)<1,'Road drifted horizontally');
   }
   const ink=await painted(page);
   assert.ok(ink>160,'The longer original brush has no visible pixels '+labels[i]+' '+ink);
   stages.push({chapter:labels[i],progress:stat.fraction,ink,top:stat.road.top,left:stat.road.left});
   if([320,390,1440].includes(width))
    await page.screenshot({path:join(output,engine+'-'+width+'-chapter-'+i+'.png'),animations:'disabled'});
  }
  assert.ok(stages[3].ink>stages[0].ink*1.25,'The original painting did not visibly GROW');
  // Twenty-six moving frames across the four transitions. Fixed means pixel
  // coordinates never move; the brush alone advances without jumps.
  let count=0;
  for(let i=0;i<4;i++)for(let j=1;j<=6;j++) {
   const y=middles[i]+(middles[i+1]-middles[i])*(j/7);
   await go(page,y-900*.49);
   const mid=await info(page);
   fixedInvariant(mid,width,'intermediate-'+i+'-'+j);
   assert.ok(mid.fraction>=stages[i].progress && mid.fraction<=stages[i+1].progress,
     'Brush jumped or reversed during continuous scrolling');
   count++;
  }
  const heights=(await info(page)).beatHeights;
  const old=width<=600?366:width<=900?387:414;
  const avg=heights.reduce((x,y)=>x+y,0)/5;
  assert.ok(avg<=old*.79,'Gaps are not reduced to 50–75% of V16: '+avg+' / '+old);
  assert.ok(Math.max(...heights)-Math.min(...heights)<=85,
    'The five chapter heights are not uniform: '+JSON.stringify(heights));
  // Separate real signoff reading-position screenshot is required: five
  // chapter screenshots alone allowed the ink to bleed across this line.
  const signoffY=await page.locator('.waymaking-resolution').evaluate(el=>
    scrollY+el.getBoundingClientRect().top);
  await go(page,signoffY-900*.55);
  const signoffState=await info(page);
  assert.ok(signoffState.road.bottom-signoffState.conclusionClip <= signoffState.signoff.top-25,
    'Visible route covers the Waymaker line during signoff reading');
  if([320,390,1440].includes(width))
    await page.screenshot({path:join(output,engine+'-'+width+'-waymaker-signoff.png'),animations:'disabled'});
  const gap=await page.evaluate(()=>{
   const end=document.querySelector('.waymaking-resolution').getBoundingClientRect();
   const last=document.querySelector('.waymaking-purpose .waymaking-copy').getBoundingClientRect();
   return end.top-last.bottom;
  });
  assert.ok(gap>=0&&gap<420,'Waymaker conclusion gap is too large '+gap);
  await go(page,middles[1]-900*.49);
  assert.ok(Math.abs((await info(page)).fraction-stages[1].progress)<.008,'Reverse scroll did not rewind the brush');
  for(const sel of ['#work','#perspective','.homepage-contact','.home-footer']){
   const y=await page.locator(sel).first().evaluate(el=>scrollY+el.getBoundingClientRect().top-innerHeight*.4);
   await go(page,y);
   assert.equal(await painted(page),0,'Original road leaked into '+sel);
  }
  await go(page,middles[2]-900*.49);
  fixedInvariant(await info(page),width,'reverse after handoff');
  if(width===320){
   await page.evaluate(()=>{
    for(const n of document.querySelectorAll('.waymaking-copy h3,.waymaking-copy p')){
     n.style.fontSize=(parseFloat(getComputedStyle(n).fontSize)*2)+'px';
     n.style.lineHeight='1.5';
    }
   });
   const reflow=await info(page);
   assert.equal(reflow.noHorizontalOverflow,true,'200% mobile type produced horizontal scrolling');
  }
  assert.deepEqual(errors,[],'Browser JS errors');
  console.log('PASS '+engine+' '+width+' '+JSON.stringify({stages,intermediateFrames:count,gap,heights,old:old,avg,neverMoved:true,source:'original-unchanged-extended'}));
 } finally{await page.close();}
}
(async()=>{
 for(const engine of engines) {
  assert.ok(types[engine],'Unsupported browser '+engine);
  const opts=engine==='chromium'&&process.env.CHROME_BIN?
   {executablePath:process.env.CHROME_BIN,headless:true,args:['--no-sandbox']}:
   {headless:true};
  const browser=await types[engine].launch(opts);
  try{
   for(const width of widths)await runOne(browser,engine,width);
   const reduced=await browser.newPage({viewport:{width:390,height:900},reducedMotion:'reduce'});
   await reduced.goto(base,{waitUntil:'networkidle'});
   const center=await centers(reduced);await go(reduced,center[2]-441);
   const state=await info(reduced);
   assert.equal(state.fraction,1,'Reduced motion should not animate the long road');
   assert.equal(state.dash,0,'Reduced motion should show complete road');
   assert.equal(await reduced.locator('.waymaking-letter').count(),0,'Reduced motion animates heading');
   await reduced.close();
   const noJs=await browser.newPage({viewport:{width:390,height:900},javaScriptEnabled:false});
   await noJs.goto(base,{waitUntil:'load'});
   assert.deepEqual(await noJs.locator('.waymaking-beat h3').allTextContents(),labels);
   assert.equal(await noJs.locator('.waymaking-original-source').isVisible(),true,'No-JS should show approved original static road');
   await noJs.close();
   console.log('PASS '+engine+' reduced-motion/no-JS');
  }finally{await browser.close();}
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
