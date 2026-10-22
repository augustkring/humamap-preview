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
const labels=['Creative Thinking','Commercial Understanding','Strategic Judgment','Hands-On Execution','Purpose Driven'];
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
    const drawPath=art.querySelector('[data-waymaking-reveal-path]');
    const paintOverlays=art.querySelectorAll(
      '[data-waymaking-brush-tip],[data-waymaking-complete],radialGradient');
    const end=qs('.waymaking-scene');
    const roadBox=box(road);
    const artspaceBox=box(artspace);
    const introBox=box(qs('.thread-summary'));
    const style=getComputedStyle(road);
    return {
      fraction:Number(story.dataset.waymakingProgress),
      animated:story.dataset.waymakingAnimated==='true',
      maskOffset:Number(drawPath.getAttribute('stroke-dashoffset')),
      maskWidth:Number(drawPath.getAttribute('stroke-width')),
      maskCap:drawPath.getAttribute('stroke-linecap'),
      overlayCount:paintOverlays.length,
      featherCount:art.querySelectorAll('[data-waymaking-feather]').length,
      emphasis:beats.map(x=>Number(x.dataset.waymakingEmphasis)),
      headingColors:beats.map(x=>getComputedStyle(x.querySelector('h3')).color),
      bodyColors:beats.map(x=>getComputedStyle(x.querySelector('p')).color),
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
      opaqueRect:!!art.querySelector('[data-waymaking-original-pixels] rect,foreignObject'),
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
    assert.equal(initial.imagePieces,1,'Exactly one high-resolution ink image must be in the SVG');
    assert.equal(initial.maskWidth,190,'Only a narrow source-fitting mask may reveal the ink');
    assert.equal(initial.maskCap,'butt','No sudden round paint cap at the beginning');
    assert.equal(initial.overlayCount,0,'No additional brush-tip or completion overlay may appear');
    assert.equal(initial.imageSource,'assets/waymaking-ink-v25.webp');
    assert.equal(initial.animatedOriginal,'assets/waymaking-ink-v25.webp');
    assert.equal(initial.opaqueRect,false,'Road may not have a rectangular backing');
    assert.equal(initial.overflow,false,'No horizontal overflow');
    assert.ok(Math.abs(initial.roadDocumentTop-initial.artspaceDocumentTop)<1,
      'Road is not anchored to the Waymaking artspace top');
    const endInset=initial.artspaceDocumentBottom-initial.roadDocumentBottom;
    assert.ok(endInset>=40&&endInset<=83,
      'Tapered road must end naturally before the section boundary: '+endInset);
    assert.ok(initial.roadDocumentTop>=initial.introDocumentBottom-2,
      'Road begins inside the preceding Where I add value copy');

    const chapterSpacing=await page.locator('.waymaking-copy-column').evaluate(el=>({
      direction:getComputedStyle(el).flexDirection,
      gap:parseFloat(getComputedStyle(el).gap)
    }));
    assert.equal(chapterSpacing.direction,'column');
    assert.ok(chapterSpacing.gap>=8&&chapterSpacing.gap<=12);
    assert.ok(initial.textWidth>=145,'Mobile text is too narrow');
    if(width<=900) {
      assert.ok(initial.textWidth>=initial.artspace.width*.94,
        'Mobile text must occupy full available width');
      assert.ok(Math.abs(initial.road.left+initial.road.width*.5-
        (initial.artspace.left+initial.artspace.width*.5))<2,
        'Mobile road must be centred behind the reading content');
      const beatHeights=await page.locator('.waymaking-beat').evaluateAll(nodes=>
        nodes.map(el=>el.getBoundingClientRect().height));
      const minimum=width<=600?190:196;
      assert.ok(beatHeights.every(height=>height>=minimum-1),
        'Mobile chapter spacing is no longer consistent: '+beatHeights.join(','));
    }

    const stages=[];
    let anchoredDocumentTop=null;
    let previousViewportTop=null;
    let previousScrollY=null;

    for(let i=0;i<5;i++) {
      await scroll(page,middles[i]-900*.52);
      await page.waitForTimeout(400);
      const state=await checkpoint(page);
      assert.equal(state.animated,true,'No working motion controller');
      assert.equal(state.position,'absolute','Road became fixed/sticky during scrolling');
      assert.equal(state.roadParent,true,'Road escaped its document artspace');
      const staticOpacity=width<=600?.21:width<=900?.24:1;
      assert.ok(Math.abs(state.opacity-staticOpacity)<.011,
        'Road opacity must remain constant during scrolling');
      assert.equal(state.visible,true,'Road must remain renderable inside its own section');
      assert.equal(state.overflow,false);
      assert.ok(state.fraction>=0&&state.fraction<=1,'Road must remain clamped');
      if(i===0) assert.ok(state.fraction>.015,'First brush segment missing at Creative Thinking');
      console.log('Waymaking reading stage',engine,width,i,state.fraction,state.emphasis);
      if(i>0) assert.ok(state.fraction>stages[i-1].fraction+.045,
        'Road is stalling between chapters instead of painting continuously');
      assert.equal(state.featherCount,0,'Expensive legacy feather paths returned');
      assert.ok(Math.abs(state.maskOffset-(1-state.fraction))<0.003,
        'Path dashoffset must match continuous scroll progress');
      assert.equal(state.overlayCount,0,'Additional reveal layers must never return');
      for(let previous=0;previous<=i;previous++) {
        assert.ok(state.emphasis[previous]>.975,
          'Already-read heading/body faded out at '+labels[i]);
      }

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
      if(width>900) for(const [index,copy] of state.texts.entries()) {
        assert.equal(overlap(state.road,copy),0,
          'Desktop ink overlaps readable copy '+labels[index]+' at '+width+'px');
      }
      if(width<=900) {
        assert.ok(state.textWidth>=state.artspace.width*.94,
          'Mobile text collapsed into a narrow side rail');
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

    assert.ok(stages[4].fraction-stages[0].fraction>.45,
      'Road did not grow continuously across all five chapters');

    // Once the reader reaches the next section, the road must have naturally
    // scrolled out with Waymaking. It is not hidden; it is simply above view.
    const workY=await page.locator('#work-title').evaluate(el=>
      scrollY+el.getBoundingClientRect().top-innerHeight*.30);
    await scroll(page,workY);
    await page.waitForTimeout(400);
    const after=await checkpoint(page);
    assert.equal(after.position,'absolute');
    assert.equal(after.fraction,1,'Completed road must commit the exact 100% state');
    assert.equal(after.maskOffset,0,'Finished path must be fully painted');
    assert.equal(after.overlayCount,0,'Completion cannot flash in a second full-frame layer');
    const workTitleTop=await page.locator('#work-title').evaluate(el=>el.getBoundingClientRect().top);
    assert.ok(after.road.bottom<=workTitleTop-24,
      'Ink overlaps My current focus instead of ending above its heading');
    await scroll(page,workY+900*.55);
    await page.waitForTimeout(240);
    const farAfter=await checkpoint(page);
    assert.ok(farAfter.road.bottom<=1,
      'Ink remains visible deep inside My current focus');
    assert.equal(await paintedPixels(page),0,
      'Ink still renders behind the current-focus cards');

    // Reverse scrolling restores the same chapter fraction while the road
    // remains anchored to the exact same document coordinates.
    await scroll(page,middles[2]-900*.52);
    await page.waitForTimeout(400);
    const restored=await checkpoint(page);
    assert.ok(Math.abs(restored.fraction-stages[2].fraction)<0.020);
    assert.ok(restored.emphasis[0]>.975&&restored.emphasis[1]>.975,
      'Previously read text incorrectly dimmed during the chapter');
    assert.ok(Math.abs(restored.roadDocumentTop-anchoredDocumentTop)<1,
      'Road document anchor changed after reverse scroll');


    // Sample between the named chapters. The old implementation looked jerky
    // because it was gated to five discrete waypoints.
    const inBetween=[];
    const from=middles[0]-900*.52;
    const to=middles[4]-900*.52;
    for(let step=0;step<=16;step++) {
      await scroll(page,from+(to-from)*step/16);
      await page.waitForTimeout(215);
      const state=await checkpoint(page);
      inBetween.push(state.fraction);
    }
    for(let step=1;step<inBetween.length;step++) {
      assert.ok(inBetween[step]>=inBetween[step-1]-.003,
        'Paint reversed while scrolling downward');
      assert.ok(inBetween[step]-inBetween[step-1]<.13,
        'Paint jumped ahead instead of progressing smoothly');
    }
    assert.ok(new Set(inBetween.map(x=>x.toFixed(3))).size>=14,
      'Road is still appearing in discrete steps');
    // Scroll back through the chapters without losing the document anchor.
    await scroll(page,middles[2]-900*.52);
    await page.waitForTimeout(350);
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
      assert.equal(resized.animatedOriginal,'assets/waymaking-ink-v25.webp');
    }

    if(width<=840){
      // The 390px scenario resizes to 1024px above. Restore the phone
      // viewport before testing the mobile-only navigation toggle.
      await page.setViewportSize({width,height:900});
      await page.waitForTimeout(150);
      await page.locator('[data-mobile-nav-open]').click();
      const link=page.locator('.mobile-navigation-panel a').first();
      const props=await link.evaluate(el=>{
        const style=getComputedStyle(el);
        const sample=document.createElement('span');
        sample.style.color='var(--red)';
        document.body.append(sample);
        const red=getComputedStyle(sample).color;
        sample.remove();
        return {tap:style.webkitTapHighlightColor,red};
      });
      // Firefox does not expose the WebKit-only computed style property.
      // In Safari/WebKit it must be transparent, never a navy tap overlay.
      if(typeof props.tap==='string' && props.tap.length>0) {
        assert.ok(/(?:rgba\(0,\s*0,\s*0,\s*0\)|transparent)/.test(props.tap),
          'Dark Safari tap highlight still visible: '+props.tap);
      }
      await link.hover();
      assert.equal(await link.evaluate(el=>getComputedStyle(el).color),props.red,
        'Navigation hover must be exclusively red');
      await page.locator('[data-mobile-nav-close]').click();
      assert.equal(await page.locator('#mobile-menu').evaluate(el=>el.open),false);
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
      await reduced.waitForTimeout(380);
      const reducedState=await checkpoint(reduced);
      assert.equal(reducedState.fraction,1,'Reduced-motion must show completed static road');
      assert.equal(reducedState.maskOffset,0,'Reduced-motion should show a fully drawn road');
      assert.equal(reducedState.overlayCount,0,'Reduced-motion must use the same single-path mask');
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
