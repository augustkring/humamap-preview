// Approved 2026-10-10 site baseline. Update digests only with user approval.
import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const root=dirname(fileURLToPath(import.meta.url));
const html=readFileSync(join(root,'index.html'),'utf8');
const css=readFileSync(join(root,'styles.css'),'utf8');
function part(s,a,b) {
 const i=s.indexOf(a),j=s.indexOf(b,i);
 assert.ok(i>=0&&j>i,'Missing approved section: '+a);
 return s.slice(i,j+b.length);
}
function digest(s) {
 let h=2166136261;
 for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}
 return (h>>>0).toString(16).padStart(8,'0');
}
const approved={"main":"5842daa3","footer":"7bea4e97","tokens":"3fe414f6","contact":"c102b368"};
const actual={
 main:digest(part(html,'<main','</main>')),
 footer:digest(part(html,'<footer','</footer>')),
 tokens:digest(part(css,':root {','\n}')),
 contact:digest(part(css,'/* Homepage closing note:','.home-footer {\n  padding: 34px'))
};
for(const [key,val] of Object.entries(approved))assert.equal(actual[key],val,'Approved homepage/CSS changed: '+key);
const perspective=part(html,'<section id="perspective"','</section>');
assert.ok(perspective.includes("<p>But greater capacity doesn't automatically make a company more competitive. AI raises the stakes: it amplifies the value of what a company gets right and the cost of what it gets wrong.</p>"),'Approved The shift I see argument changed');
assert.ok(!perspective.includes("But greater capacity doesn't automatically make a company more competitive. When companies put products before customers, AI can amplify that mistake many times over."),'Obsolete The shift I see text restored');
const thread=part(html,'<section id="thread"','</section>');
const threadSummary=thread.slice(0,thread.indexOf('<section class="waymaking-narrative"'));
for(const sentence of ["I combine creative thinking with strategic judgement and commercial understanding. I think holistically, looking for ways people, planet and profit can reinforce one another.","I can give ambitious ideas direction, bring people together and inspire them to work towards a shared goal. I'm equally capable of going deep into the details and building things myself.","AI is at the heart of everything I do. I'm quick to adapt and willing to change course radically when new perspectives or technologies open up better opportunities."]) assert.ok(threadSummary.includes(sentence),'Approved Where I add value text drift: '+sentence);
assert.equal((threadSummary.match(/<p>/g)||[]).length,4,'Approved Where I add value paragraph count drift');
assert.ok(thread.includes('<h3 id="waymaking-title">Waymaking</h3>'),'Waymaking narrative missing');
assert.ok(thread.includes('For me, that is what it means to be a Waymaker.'),'Waymaker definition missing');
assert.ok(!html.includes('roughjs@4.6.6'),'Rough.js dependency should stay removed');
assert.ok(!html.includes('perfect-freehand'),'perfect-freehand dependency should stay removed');
assert.ok(!html.includes('waymaking-road.js'),'Waymaking road must stay static and dependency-free');
assert.ok(thread.includes('data-waymaking-brush-road'),'Figma brush road target missing');
assert.ok(html.includes('waymaking-brush.js?v=20261019-figma-v4'),'Figma brush renderer missing');
assert.ok(html.includes("Where I'm putting that way of thinking to work today."),'My current focus bridge copy missing');
assert.ok(html.indexOf('id="work"') < html.indexOf('id="perspective"'),'My current focus must lead into The shift I see');
assert.ok(!html.includes('<h2 id="about-title">My story</h2>'),'Homepage My story must remain removed');
assert.ok(css.includes('width: clamp(76px, 8vw, 88px);'),'Waymaking road must remain visually secondary');
assert.ok(css.includes('.waymaking-painted-edge'),'Figma brush edge style missing');
assert.ok(css.includes('.waymaking-painted-edge--body'),'Waymaking painted body missing');
assert.ok(css.includes('.waymaking-painted-edge--texture'),'Waymaking dry-brush texture missing');
assert.ok(!css.includes('.waymaking-road-surface'),'Dark filled road treatment must not return');
assert.ok(!css.includes('.waymaking-road-underlay'),'Dark road underlay treatment must not return');
assert.ok(css.includes('grid-template-columns: var(--contact-columns);'),'Approved two-group close missing');
assert.ok(css.includes("/* Home + About section subtitles share one readable measure.\n   The homepage hero description intentionally keeps its approved full-column width. */\n.home-main .thread-lead > p,\n.home-main .perspective-lead > p,\n.home-main .values-lead > p,\n.home-main .about-home-lead > p,\n.home-main .about-principles-intro > p,\n.home-main .about-story-intro > p,\n.home-main .about-personal-lead {\n  max-width: min(100%, 390px);\n}"),'Shared 390px subtitle measure missing');
assert.ok(css.includes('.hero-copy > .hero-focus {\n  width: 100%;\n  max-width: none;'),'Approved full-column homepage hero description missing');
assert.ok(css.includes('max-width: 900px;\n  margin-inline: auto;\n  padding: clamp(50px, 5vw, 66px) 0 clamp(68px, 7vw, 92px);\n  text-align: center;'),'Perspectives hero must stay centred');
assert.ok(css.includes('.perspectives-library { width: min(100%, 840px); margin-inline: auto;'),'Perspectives article column must stay centred');
assert.ok(css.includes('@media (max-width: 760px) {\n  .homepage-contact-content'),'Contact mobile stacking missing');
for(const path of ['index.html','about/index.html','perspectives/index.html','perspectives/rethinking-the-company/index.html','perspectives/europe-at-a-crossroads/index.html','privacy/index.html','unsubscribe/index.html']){
 const page=readFileSync(join(root,path),'utf8');
 const expectedStyles=path==='index.html'?'styles.css?v=20261019-figma-brush-v4':'styles.css?v=20261014-subtitle-width-v1';
 assert.ok(page.includes(expectedStyles),'Shared stylesheet drift: '+path);
 assert.ok(page.includes('name="robots" content="noindex,nofollow"'),'Preview indexing protection missing: '+path);
 assert.ok(!page.includes('footer-wordmark'),'Footer branding must stay removed: '+path);
}
console.log('PASS: protected homepage, unified footers, shared fonts and preview metadata');
