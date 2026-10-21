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
const approved={"main":"cf240120","footer":"7bea4e97","tokens":"3fe414f6","contact":"c102b368"};
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
for(const sentence of [
 "I do my best work in the early stages, when a challenge calls for fresh thinking and clear direction.",
 "I combine creative thinking with commercial understanding and strategic judgment to spot opportunities and find better ways forward.",
 "I enjoy giving ambitious ideas direction and bringing people together around a shared vision.",
 "But I also like getting hands-on, experimenting and building things myself, using AI to turn ideas into reality.",
 "build towards a positive future, together with bold people",
 "leave the world a little better than I found it."
]) assert.ok(threadSummary.includes(sentence),'Approved Where I add value copy drift: '+sentence);
assert.equal((threadSummary.match(/<p>/g)||[]).length,3,'Where I add value should have three paragraphs');
assert.ok(thread.includes('aria-label="Waymaking"') && !thread.includes('id="waymaking-title"'),'Waymaking should continue without a visible section title');
assert.ok(thread.includes("For me, that's what it means to be a <span>waymaker"),'Waymaker definition missing');
assert.ok(!html.includes('roughjs@4.6.6'),'Rough.js dependency should stay removed');
assert.ok(!html.includes('perfect-freehand'),'perfect-freehand dependency should stay removed');
assert.ok(!html.includes('waymaking-road.js'),'Waymaking road must stay static and dependency-free');
assert.ok(!thread.includes('<canvas') && !html.includes('waymaking-brush.js'),'Runtime Canvas renderer must stay retired');
for(const label of ['Creative Thinking','Commercial Understanding','Strategic Judgment','AI-Native Building','Purpose Driven']){
 assert.ok(thread.includes(label),'Waymaking story beat missing: '+label);
}
let previous=-1;
for(const label of ['Creative Thinking','Commercial Understanding','Strategic Judgment','AI-Native Building','Purpose Driven',"For me, that's what it means to be a"]){
 const offset=thread.indexOf(label);
 assert.ok(offset>previous,'Waymaking story order wrong: '+label);
 previous=offset;
}
assert.equal((thread.match(/<h3>/g)||[]).length,5,'Five semantic chapter headings required');
assert.ok(thread.includes('data-waymaking-vector="desktop"') && thread.includes('data-waymaking-vector="mobile"'),'Independent authored desktop/mobile vector roads are required');
assert.equal((thread.match(/<path data-waymaking-reveal /g)||[]).length,2,'SVG brush reveal paths missing');
assert.ok(!thread.includes('assets/waymaking-editorial-ink.webp'),'No low-resolution raster image may be used for Waymaking');
for(const name of ['waymaking-vector-road-desktop-v15.svg','waymaking-vector-road-mobile-v15.svg']) {
 const vector=readFileSync(join(root,'assets',name),'utf8');
 assert.ok(vector.includes('viewBox=') && vector.includes('<mask') && vector.includes('data-waymaking-reveal'),'Authored scalable vector missing: '+name);
 assert.ok(!vector.includes('<image') && !vector.includes('<rect fill='),'No raster or rectangular photo background allowed: '+name);
}
assert.ok(html.includes('waymaking-scroll.js?v=20261021-waymaking-drawn-vector-v15'),'New scroll drawing controller missing');
assert.ok(!part(html,'<section class="waymaking-narrative"','</section>').includes('—'),'Waymaking copy must contain no em dashes');
const license=readFileSync(join(root,'assets/waymaking-dry-brush-LICENSE.txt'),'utf8');
assert.ok(license.includes('MIT License'),'Existing original artwork license attribution must remain preserved');
assert.ok(html.includes("Where I'm putting that way of thinking to work today."),'My current focus bridge copy missing');
assert.ok(html.indexOf('id="work"') < html.indexOf('id="perspective"'),'My current focus must lead into The shift I see');
assert.ok(!html.includes('<h2 id="about-title">My story</h2>'),'Homepage My story must remain removed');
assert.ok(css.includes('.waymaking-scene') && css.includes('position: sticky;'),'Editorial sticky image composition missing');
assert.ok(css.includes('.waymaking-beat:nth-child(odd)') && css.includes('.waymaking-beat:nth-child(even)'),'Alternate copy layout missing');
assert.ok(css.includes('waymaking-vector--mobile'),'Responsive vector art direction missing');
assert.ok(!css.includes('.waymaking-copy-column::before') && !css.includes('.waymaking-copy-column::after'),'Wrong pre/post viewport spacers returned');
assert.ok(css.includes('margin: clamp(30px, 5svh, 70px) auto 0;'),'Waymaker transition must not be a blank viewport');
const scrollController=readFileSync(join(root,'waymaking-scroll.js'),'utf8');
assert.ok(scrollController.includes('paintStages = [0.16, 0.37, 0.59, 0.80, 1]'),'Progressive drawing must track five chapter checkpoints');
assert.ok(scrollController.includes('getTotalLength()') && scrollController.includes('strokeDashoffset'),'SVG drawing must track real path distances');
assert.ok(scrollController.includes("reduced.matches"),'Reduced motion preference missing');
for(const forbidden of ['document.body.appendChild(road)','updateBackdropClip','--waymaking-clip-top','road.style.top','brush.setAttribute']){
 assert.ok(!scrollController.includes(forbidden),'Deprecated road moving/portaling logic returned: '+forbidden);
}
assert.ok(!css.includes('body[data-waymaking-road-active="true"] .perspective-copy') && !css.includes('box-shadow: 0 0 34px'),'Downstream white patchwork masking must be removed');
assert.ok(scrollController.includes("word.className = 'waymaking-heading-word'"),'Heading words must not inherit Venture logo typography');
assert.ok(css.includes('.waymaking-copy .waymaking-heading-word') && css.includes('.waymaking-word { font-size: 32px'),'Heading/brand wordmark namespaces must be distinct');
assert.ok(css.includes('.waymaking-vector'),'Authored vector artwork styling missing');
assert.ok(thread.includes('class="waymaking-beat waymaking-purpose"') && thread.includes('<h3>Purpose Driven</h3>'),'Purpose Driven should share competency typography');
assert.ok(!css.includes('.waymaking-painted-edge--body'),'Obsolete vector brush body returned');
assert.ok(!css.includes('.waymaking-painted-edge--texture'),'Obsolete vector brush texture returned');
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
 const expectedStyles=path==='index.html'?'styles.css?v=20261021-waymaking-drawn-vector-v15':'styles.css?v=20261014-subtitle-width-v1';
 assert.ok(page.includes(expectedStyles),'Shared stylesheet drift: '+path);
 assert.ok(page.includes('name="robots" content="noindex,nofollow"'),'Preview indexing protection missing: '+path);
 assert.ok(!page.includes('footer-wordmark'),'Footer branding must stay removed: '+path);
}
console.log('PASS: protected homepage, unified footers, shared fonts and preview metadata');
