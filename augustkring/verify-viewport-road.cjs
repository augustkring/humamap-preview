const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { join } = require('node:path');
const { chromium, firefox, webkit } = require('playwright');

const base = process.env.ROAD_BASE || 'http://127.0.0.1:8765/humamap-preview/augustkring/';
const output = process.env.ROAD_OUTPUT || 'artifacts';
const engines = (process.env.ROAD_ENGINES || 'chromium').split(',').map(x=>x.trim()).filter(Boolean);
const widths = (process.env.ROAD_WIDTHS || '320,390,768,1024,1440').split(',').map(Number).filter(Boolean);
const labels = ['Creative Thinking','Commercial Understanding','Strategic Judgement','Hands-On Execution','Purpose & Impact'];

mkdirSync(output,{recursive:true});

const launchers={chromium,firefox,webkit};

async function launch(engine){
  const type=launchers[engine];
  assert.ok(type,'Unknown browser engine: '+engine);
  if(engine==='chromium'&&process.env.CHROME_BIN){
    return type.launch({headless:true,executablePath:process.env.CHROME_BIN,args:['--no-sandbox']});
  }
  return type.launch({headless:true});
}

async function runOne(engine,width){
  const browser=await launch(engine);
  try{
    const page=await browser.newPage({viewport:{width,height:1000}});
    await page.goto(base,{waitUntil:'networkidle',timeout:45000});
    await page.evaluate(()=>document.fonts.ready);

    const state=await page.evaluate(()=>{
      const section=document.querySelector('.waymaking-narrative');
      const beats=[...document.querySelectorAll('.waymaking-beat')];
      const box=el=>{
        const r=el.getBoundingClientRect();
        return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};
      };
      return {
        overflow:document.documentElement.scrollWidth>innerWidth+1,
        section:box(section),
        hasRoad:!!document.querySelector('.waymaking-road-wrap,.waymaking-artspace,.waymaking-original-reveal'),
        hasRoadScript:[...document.scripts].some(s=>s.src.includes('waymaking-scroll.js')),
        titles:beats.map(x=>x.querySelector('h3').textContent.trim()),
        rows:beats.map(x=>{
          const copy=x.querySelector('.waymaking-copy');
          const heading=x.querySelector('h3');
          const paragraph=x.querySelector('p');
          const style=getComputedStyle(copy);
          const beatStyle=getComputedStyle(x);
          return {
            row:box(x),
            copy:box(copy),
            heading:box(heading),
            paragraph:box(paragraph),
            display:style.display,
            columns:style.gridTemplateColumns,
            borderTop:beatStyle.borderTopWidth,
            headingSize:parseFloat(getComputedStyle(heading).fontSize),
            paragraphSize:parseFloat(getComputedStyle(paragraph).fontSize)
          };
        })
      };
    });

    assert.equal(state.overflow,false,engine+' '+width+': horizontal overflow');
    assert.equal(state.hasRoad,false,engine+' '+width+': retired central road returned');
    assert.equal(state.hasRoadScript,false,engine+' '+width+': retired road script still loaded');
    assert.deepEqual(state.titles,labels,engine+' '+width+': Waymaking facet order drift');
    assert.equal(state.rows.length,5);

    const heights=state.rows.map(x=>x.row.height);
    assert.ok(Math.max(...heights)-Math.min(...heights)<=95,
      engine+' '+width+': editorial row rhythm is too uneven: '+heights.join(','));

    for(const [i,row] of state.rows.entries()){
      assert.equal(row.display,'grid',engine+' '+width+': row '+i+' copy is not grid');
      if(i===0) assert.ok(parseFloat(row.borderTop)<.5,engine+' '+width+': first row must not have a top divider');
      else assert.ok(parseFloat(row.borderTop)>=.5,engine+' '+width+': internal divider missing before row '+i);
      assert.ok(row.headingSize>=20.9&&row.headingSize<=26.1,engine+' '+width+': heading scale drift');
      assert.ok(row.paragraphSize>=15.9&&row.paragraphSize<=16.1,engine+' '+width+': body copy must reuse 16px card scale');

      if(width>700){
        assert.ok(row.heading.right<=row.paragraph.left-20,
          engine+' '+width+': heading/copy columns collide at '+labels[i]);
        assert.ok(Math.abs(row.heading.top-row.paragraph.top)<=8,
          engine+' '+width+': heading/copy top alignment drift at '+labels[i]);
        assert.ok(row.paragraph.width>=280,
          engine+' '+width+': body copy column too narrow at '+labels[i]);
      }else{
        assert.ok(row.paragraph.top>=row.heading.bottom+10,
          engine+' '+width+': mobile heading/copy must stack at '+labels[i]);
        assert.ok(Math.abs(row.heading.left-row.paragraph.left)<=2,
          engine+' '+width+': mobile heading/copy left edges drift at '+labels[i]);
        assert.ok(row.paragraph.width>=state.section.width*.92,
          engine+' '+width+': mobile copy does not use available width');
      }
    }

    await page.locator('.waymaking-narrative').screenshot({
      path:join(output,`waymaking-editorial-${engine}-${width}.png`),
      animations:'disabled'
    });
    console.log('PASS',engine,width,state.rows.map(x=>Math.round(x.row.height)).join('/'));
  } finally {
    await browser.close();
  }
}

(async()=>{
  for(const engine of engines){
    for(const width of widths) await runOne(engine,width);
  }
})().catch(err=>{console.error(err);process.exit(1);});
