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
const approved={"main":"5e26e724","footer":"7bea4e97","tokens":"3fe414f6","contact":"c102b368"};
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
assert.ok(thread.includes('assets/waymaking-editorial-ink.avif'),'Approved original ink illustration missing');
assert.ok(!thread.includes('<canvas') && !html.includes('waymaking-brush.js'),'Runtime Canvas renderer must be retired');
for(const label of ['Creative Thinking','Commercial Understanding','Strategic Judgment','AI-Native Building','Purpose Driven']){
 assert.ok(thread.includes(label),'Waymaking story beat missing: '+label);
}
let previous=-1;
for(const label of ['Creative Thinking','Commercial Understanding','Strategic Judgment','AI-Native Building','Purpose Driven',"For me, that's what it means to be a"]){
 const offset=thread.indexOf(label);
 assert.ok(offset>previous,'Waymaking story order wrong: '+label);
 previous=offset;
}
for(const name of ['waymaking-ink-road-brush.png','waymaking-ink-road-brush-mobile.png']){
 const art=readFileSync(join(root,'assets',name));
 assert.ok(art.length>100000 && art[0]===0x89 && art[1]===0x50 && art[2]===0x4e && art[3]===0x47,'High-resolution ink PNG missing or invalid: '+name);
}
const editorialInk=readFileSync(join(root,'assets/waymaking-editorial-ink.avif'));
assert.ok(editorialInk.length>4000 && editorialInk.subarray(4,12).toString('ascii')==='ftypavif','Approved ink AVIF missing or corrupt');
const inkFallback=readFileSync(join(root,'assets/waymaking-editorial-ink.webp'));
assert.ok(inkFallback.length>10000 && inkFallback.toString('ascii',0,4)==='RIFF' && inkFallback.toString('ascii',8,12)==='WEBP','Approved original illustration WebP fallback missing');
assert.ok(thread.includes('src="assets/waymaking-editorial-ink.webp"'),'Matching original artwork fallback reference missing');
assert.ok(thread.includes('loading="eager" fetchpriority="low"'),'Ink must start loaded while its parent is visually hidden');
assert.ok(html.includes('waymaking-scroll.js?v=20261021-continuous-backdrop-v12'),'Continuous scroll story enhancement missing');
assert.ok(thread.includes('data-waymaking-paint-path') && thread.includes('stroke-dashoffset="1000"'),'Curved SVG painter path missing');
assert.equal((thread.match(/<h3>/g)||[]).length,5,'Five semantic chapter headings required');
assert.ok(thread.includes('stroke-width="468"') && thread.includes('waymaking-brush-edge') && thread.includes('data-waymaking-feather="7"'),'Original painting aligned mask with seven organic feather layers missing');
assert.ok(thread.includes('filterUnits="userSpaceOnUse" x="-180" y="-270" width="1100" height="1640"'),'Full brush filter region required to prevent hard clipping');
assert.ok(!part(html,'<section class="waymaking-narrative"','</section>').includes('—'),'Waymaking copy must contain no em dashes');
const license=readFileSync(join(root,'assets/waymaking-dry-brush-LICENSE.txt'),'utf8');
assert.ok(license.includes('MIT License') && license.includes('Copyright (c) 2026 nomagicln'),'MIT artwork source attribution missing');
assert.ok(html.includes("Where I'm putting that way of thinking to work today."),'My current focus bridge copy missing');
assert.ok(html.indexOf('id="work"') < html.indexOf('id="perspective"'),'My current focus must lead into The shift I see');
assert.ok(!html.includes('<h2 id="about-title">My story</h2>'),'Homepage My story must remain removed');
assert.ok(css.includes('.waymaking-scene') && css.includes('position: sticky;'),'Editorial sticky image composition missing');
assert.ok(css.includes('.waymaking-beat:nth-child(odd)') && css.includes('.waymaking-beat:nth-child(even)'),'Alternate chapters on either side of centered road');
assert.ok(css.includes('margin-inline: auto;') && css.includes('width: min(33.5%, 390px);'),'Centered ink road corridor missing');
assert.ok(css.includes('body > .waymaking-road-wrap[data-waymaking-viewport="true"]'),'Portal-only viewport road rule missing');
assert.ok(css.includes('body[data-waymaking-road-active="true"] > .waymaking-road-wrap'),'Scoped viewport activation rule missing');
assert.ok(css.includes('position: fixed;') && css.includes('visibility: hidden;'),'Fixed viewport road must stay hidden outside its five-chapter story');
assert.ok(css.includes('.home-main,\n.home-footer {\n  position: relative;\n  z-index: 1;'),'Text must stay above permanently painted background');
const scrollController=readFileSync(join(root,'waymaking-scroll.js'),'utf8');
assert.ok(scrollController.includes('document.body.appendChild(road)'),'Painting must be portaled outside scrolling/overflow containers');
assert.ok(scrollController.includes("document.body.dataset.waymakingRoadActive = 'true'"),'Body road activation missing');
assert.ok(scrollController.includes('const updatePin = () =>') && scrollController.includes('const startReached = entryTop <= startLine()'),'Creative Thinking start controller missing');
assert.ok(scrollController.includes('const startLine = () => window.innerHeight * 0.88;'),'Ink must enter before Creative Thinking is read, while its top is CSS-fixed');
assert.ok(css.includes('top: 16px;') && !css.includes('--waymaking-viewport-top'),'Never interpolate or mutate the visual ink position');
assert.ok(!scrollController.includes('--waymaking-viewport-top') && !scrollController.includes('const position = Math.max('),'Scroll-driven top position mutation must never return');
assert.ok(scrollController.includes('const paintStart = firstDocY - startLine()'),'Paint reveal must start at first-title alignment');
assert.ok(scrollController.includes('const finalCopyBottom = finalCopy.getBoundingClientRect().bottom'),'Fifth chapter must remain visible while fixed road stays');
assert.ok(scrollController.includes('const departure = smooth(-finalCopyBottom / fadeDistance);'),'Fade only after Purpose Driven copy has exited');
assert.ok(scrollController.includes('signoffTop > window.innerHeight * 0.5;'),'Waymaker signoff must remain free of ink');
assert.ok(scrollController.includes("road.style.setProperty('--waymaking-handoff-opacity'"),'Stationary blank-space handoff missing');
assert.ok(!scrollController.includes("!picture.currentSrc.endsWith('.avif')"),'AVIF-only animation gate must never return');
assert.ok(thread.includes('<image href="assets/waymaking-editorial-ink.webp"'),'SVG paint should use widely supported approved WebP artwork');
assert.ok(!scrollController.includes("through the ENTIRE rest of the page") && !scrollController.includes("all subsequent sections"),'Page-wide road rendering must not return');
assert.ok(css.includes('opacity: var(--waymaking-handoff-opacity, 1);'),'Scoped road must fade without moving at its end');
assert.ok(css.includes('display: none;\n  visibility: hidden;\n  opacity: 0;'),'Offstage road must not render even if children force visibility:visible');
assert.ok(css.includes('opacity: .58;') && css.includes('opacity: .42;'),'Approved original must be continuously visible under SVG pigment');
assert.ok(css.includes('display: block;\n  visibility: visible;\n  opacity: var(--waymaking-handoff-opacity, 1);'),'The viewport road may display only while story is active');

assert.ok(!css.includes('body[data-waymaking-road-active="true"] .perspective-copy') && !css.includes('box-shadow: 0 0 34px'),'Downstream white patchwork masking must be removed');
assert.ok(scrollController.includes("word.className = 'waymaking-heading-word'"),'Heading words must not inherit Venture logo typography');
assert.ok(css.includes('.waymaking-copy .waymaking-heading-word') && css.includes('.waymaking-word { font-size: 32px'),'Heading/brand wordmark namespaces must be distinct');
assert.ok(css.includes('.waymaking-road-art'),'Authored ink road artwork styling missing');
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
 const expectedStyles=path==='index.html'?'styles.css?v=20261021-continuous-backdrop-v12':'styles.css?v=20261014-subtitle-width-v1';
 assert.ok(page.includes(expectedStyles),'Shared stylesheet drift: '+path);
 assert.ok(page.includes('name="robots" content="noindex,nofollow"'),'Preview indexing protection missing: '+path);
 assert.ok(!page.includes('footer-wordmark'),'Footer branding must stay removed: '+path);
}
console.log('PASS: protected homepage, unified footers, shared fonts and preview metadata');
