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
const expectedStages=[0.16,0.37,0.59,0.80,1];
mkdirSync(output,{recursive:true});

async function scroll(page,y) {
  const target=await page.evaluate(top=>{
    document.documentElement.style.setProperty('scroll-behavior','auto','important');
    document.body.style.setProperty('scroll-behavior','auto','important');
    const end=Math.max(0,document.documentElement.scrollHeight-innerHeight);
    const clamped=Math.max(0,Math.min(top,end));
    window.scrollTo({top:clamped,behavior:'auto'});
    return clamped;
  },y);
  await page.waitForFunction(top=>Math.abs(window.scrollY-top)<3,target,{timeout:7000});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
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
    const artspace=qs('.waymaking-artspace');
    const story=qs('[data-waymaking-story]');
    const beats=[...document.querySelectorAll('.waymaking-beat')];
    const art=qs('.waymaking-original-reveal');
    const mask=art.querySelector('[data-waymaking-reveal]');
    const end=qs('.waymaking-resolution');
    const roadBox=box(road);
    const artspaceBox=box(artspace);
    const introBox=box(qs('.thread-summary'));
    const style=getComputedStyle(road);
    return {
      fraction:Number(story.dataset.waymakingProgress),
      animated:story.dataset.waymakingAnimated==='true',
      dashOffset:parseFloat(mask.style.strokeDashoffset),
      length:mask.getTotalLength(),
      featherCount:art.querySelectorAll('[data-waymaking-feather]').length,
      scrollY:window.scrollY,
      road:roadBox,
      artspace:artspaceBox,
      scene:box(qs('.waymaking-scene')),
      intro:introBox,
      texts:beats.map(x=>box(x.querySelector('.waymaking-copy'))),
      headings:beats.map(x=>box(x.querySelector('h3'))),
      titles:beats.map(x=>x.querySelector('h3').getAttribute('aria-label')||x.querySelector('h3').textContent.trim()),
      endTop:scrollY+end.getBoundingClientRect().top,
      lastCopyBottom:scrollY+beats[4].querySelector('.waymaking-copy').getBoundingClientRect().bottom,
      position:style.position,
      opacity:Number(style.opacity),
      visible:style.display!=='none'&&style.visibility==='visible',
      roadDocumentTop:window.scrollY+roadBox.top,
      roadDocumentBottom:window.scrollY+roadBox.bottom,
      artspaceDocumentTop:window.scrollY+artspaceBox.top,
      artspaceDocumentBottom:window.scrollY+artspaceBox.bottom,
      introDocumentBottom:window.scrollY+introBox.bottom,
      imagePieces:art.querySelectorAll('image').length,
      sourceViewHeight:art.viewBox.baseVal.height,
      scaling:art.preserveAspectRatio.baseVal.align,
      opaqueRect:!!art.querySelector('rect,foreignObject'),
      imageSource:road.querySelector('.waymaking-original-source img')?.getAttribute('src'),
      animatedOriginal:art.querySelector('image')?.getAttribute('href'),
      roadParent:road.parentElement?.classList.contains('waymaking-artspace')===true,
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
  const left=Math.max(0,Math.floor(rect.left)-2);
  const right=Math.min(x.width,Math.ceil(rect.right)+2);
  const top=Math.max(0,Math.floor(rect.top)-2);
  const bottom=Math.min(x.height,Math.ceil(rect.bottom)+2);
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
  if(!state.visible||state.road.bottom<=0||state.road.top>=view.height) return 0;
  const before=await page.screenshot({animations:'disabled'});
  await page.locator('.waymaking-road-wrap').evaluate(x=>x.style.setProperty('visibility','hidden','important'));
  const after=await page.screenshot({animations:'disabled'});
  await page.locator('.waymaking-road-wrap').evaluate(x=>x.style.removeProperty('visibility'));
  return changedPixels(before,after,state.road);
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
    const initial=await checkpoint(page);
    assert.deepEqual(initial.titles,labels);
    assert.equal(initial.position,'absolute','Road must belong to the document, not viewport positioning');
    assert.equal(initial.roadParent,true,'Road must stay inside .waymaking-artspace');
    assert.equal(initial.sourceViewHeight,2148,'Extended original artwork changed');
    assert.equal(initial.scaling,1,'SVG must use preserveAspectRatio="none"');
    assert.equal(initial.imagePieces,1,'Road must use one unbroken original image');
    assert.equal(initial.imageSource,'assets/waymaking-editorial-ink.webp');
    assert.equal(initial.animatedOriginal,'assets/waymaking-editorial-ink.webp');
    assert.equal(initial.opaqueRect,false,'Road may not have a rectangular backing');
    assert.equal(initial.overflow,false,'No horizontal overflow');
    assert.ok(Math.abs(initial.roadDocumentTop-initial.artspaceDocumentTop)<1,
      'Road is not anchored to the Waymaking artspace top');
    assert.ok(Math.abs(initial.roadDocumentBottom-initial.artspaceDocumentBottom)<1,
      'Road is not anchored to the Waymaking artspace bottom');
    assert.ok(initial.roadDocumentTop>=initial.introDocumentBottom-2,
      'Road begins inside the preceding Where I add value copy');

    const chapterSpacing=await page.locator('.waymaking-copy-column').evaluate(el=>({
      direction:getComputedStyle(el).flexDirection,
      gap:parseFloat(getComputedStyle(el).gap)
    }));
    assert.equal(chapterSpacing.direction,'column');
    assert.ok(chapterSpacing.gap>=8&&chapterSpacing.gap<=12);
    assert.ok(initial.textWidth>=145,'Mobile text is too narrow');

    const stages=[];
    let anchoredDocumentTop=null;
    let previousViewportTop=null;
    let previousScrollY=null;

    for(let i=0;i<5;i++) {
      await scroll(page,middles[i]-900*.16);
      const state=await checkpoint(page);
      assert.equal(state.animated,true,'No working motion controller');
      assert.equal(state.position,'absolute','Road became fixed/sticky during scrolling');
      assert.equal(state.roadParent,true,'Road escaped its document artspace');
      assert.equal(state.opacity,1,'Whole road must not fade');
      assert.equal(state.visible,true,'Road must remain renderable inside its own section');
      assert.equal(state.overflow,false);
      assert.ok(Math.abs(state.fraction-expectedStages[i])<0.035,
        'Wrong road progress at '+labels[i]+': '+state.fraction);
      assert.equal(state.featherCount,7);

      const brushFront=Math.min(state.fraction,.055,(1-state.fraction)*.55);
      const expectedOffset=state.length*(1-(state.fraction-brushFront));
      assert.ok(Math.abs(state.dashOffset-expectedOffset)<state.length*.008,
        'SVG mask progress mismatch at '+labels[i]);

      if(anchoredDocumentTop===null) anchoredDocumentTop=state.roadDocumentTop;
      assert.ok(Math.abs(state.roadDocumentTop-anchoredDocumentTop)<1,
        'Road changed DOCUMENT position while scrolling');

      if(previousViewportTop!==null) {
        assert.ok(state.scrollY>previousScrollY,'Chapter scroll did not advance');
        assert.ok(state.road.top<previousViewportTop-40,
          'Road is sticking to the viewport instead of scrolling with the page');
      }
      previousViewportTop=state.road.top;
      previousScrollY=state.scrollY;

      assert.ok(Math.abs(state.roadDocumentTop-state.artspaceDocumentTop)<1,
        'Road drifted away from artspace');
      for(const [index,text] of state.texts.entries()) {
        assert.equal(overlap(state.road,text),0,
          'Road overlaps readable copy '+labels[index]+' at '+width+'px');
      }

      const pixels=await paintedPixels(page);
      assert.ok(pixels>120,'No visible painted road pixels at '+labels[i]);

      stages.push({
        chapter:labels[i],
        fraction:state.fraction,
        scrollY:state.scrollY,
        viewportTop:state.road.top,
        documentTop:state.roadDocumentTop,
        pixels
      });
      if([320,390,1440].includes(width)) {
        await page.screenshot({path:join(output,engine+'-'+width+'-chapter-'+i+'.png'),animations:'disabled'});
      }
    }

    assert.ok(stages[4].fraction-stages[0].fraction>.80,
      'Road did not grow across all five chapters');

    // Once the reader reaches the next section, the road must have naturally
    // scrolled out with Waymaking. It is not hidden; it is simply above view.
    const workY=await page.locator('#work-title').evaluate(el=>
      scrollY+el.getBoundingClientRect().top-innerHeight*.30);
    await scroll(page,workY);
    const after=await checkpoint(page);
    assert.equal(after.position,'absolute');
    assert.equal(after.fraction,1,'Completed road must stay at 100%');
    assert.ok(after.road.bottom<=1,
      'Road leaked into My current focus instead of scrolling out with Waymaking');
    assert.equal(await paintedPixels(page),0,
      'Road still renders on-screen under My current focus');

    // Reverse scrolling restores the same chapter fraction while the road
    // remains anchored to the exact same document coordinates.
    await scroll(page,middles[2]-900*.16);
    const restored=await checkpoint(page);
    assert.ok(Math.abs(restored.fraction-expectedStages[2])<0.035);
    assert.ok(Math.abs(restored.roadDocumentTop-anchoredDocumentTop)<1,
      'Road document anchor changed after reverse scroll');

    if(width===320) {
      await page.evaluate(()=>{
        for(const node of document.querySelectorAll('.waymaking-copy h3, .waymaking-copy p')) {
          const size=parseFloat(getComputedStyle(node).fontSize);
          node.style.fontSize=(2*size)+'px';
          node.style.lineHeight='1.5';
        }
      });
      await page.waitForTimeout(140);
      const reflow=await checkpoint(page);
      assert.equal(reflow.overflow,false,'200% mobile text creates horizontal scrolling');
    }

    if(width===390) {
      await page.setViewportSize({width:1024,height:900});
      await page.waitForTimeout(180);
      const resized=await checkpoint(page);
      assert.equal(resized.overflow,false,'Responsive resize introduced overflow');
      assert.equal(resized.position,'absolute','Resize changed road to viewport positioning');
      assert.equal(resized.roadParent,true);
      assert.equal(resized.animatedOriginal,'assets/waymaking-editorial-ink.webp');
    }

    assert.deepEqual(problems,[],'Browser JS errors');
    console.log('PASS '+engine+' '+width+' '+JSON.stringify({
      stages,
      anchoredToDocument:true,
      viewportFixed:false,
      cleanHandoffToWork:true
    }));
  } finally {
    await page.close();
  }
}

(async()=>{
  for(const engine of engines) {
    assert.ok(browserTypes[engine],'Unknown engine '+engine);
    const opts=engine==='chromium'&&process.env.CHROME_BIN
      ? {executablePath:process.env.CHROME_BIN,headless:true,args:['--no-sandbox']}
      : {headless:true};
    const browser=await browserTypes[engine].launch(opts);
    try {
      for(const width of widths) await runOne(browser,engine,width);

      const reduced=await browser.newPage({viewport:{width:390,height:900},reducedMotion:'reduce'});
      await reduced.goto(base,{waitUntil:'networkidle'});
      await reduced.locator('.waymaking-beat').nth(2).scrollIntoViewIfNeeded();
      await reduced.waitForTimeout(130);
      const reducedState=await checkpoint(reduced);
      assert.equal(reducedState.fraction,1,'Reduced-motion must show completed static road');
      assert.ok(Math.abs(reducedState.dashOffset)<.01,'Reduced-motion road must be fully revealed');
      assert.equal(reducedState.position,'absolute');
      assert.equal(await reduced.locator('.waymaking-letter').count(),0);
      await reduced.close();

      const nojs=await browser.newPage({viewport:{width:390,height:900},javaScriptEnabled:false});
      await nojs.goto(base,{waitUntil:'load'});
      assert.deepEqual(await nojs.locator('.waymaking-beat h3').allTextContents(),labels);
      assert.equal(await nojs.locator('.waymaking-original-source').isVisible(),true);
      await nojs.close();

      console.log('PASS '+engine+' no-JS, reduced motion, semantic content');
    } finally {
      await browser.close();
    }
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
