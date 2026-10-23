// Approved 2026-10-10 site baseline. Update digests only with user approval.
import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
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
const approved={"main":"503ae853","footer":"7bea4e97","tokens":"3fe414f6","contact":"c102b368"};
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
assert.ok(!thread.includes("For me, that's what it means to be a") && !thread.includes('class="waymaking-resolution"'),'Redundant Waymaker conclusion must remain removed');
assert.ok(!html.includes('roughjs@4.6.6'),'Rough.js dependency should stay removed');
assert.ok(!html.includes('perfect-freehand'),'perfect-freehand dependency should stay removed');
assert.ok(!html.includes('waymaking-road.js'),'Waymaking road must stay static and dependency-free');
assert.ok(!thread.includes('<canvas') && !html.includes('waymaking-brush.js'),'Runtime Canvas renderer must stay retired');
for(const label of ['Define the Opportunity','Check the Business Case','Choose a Direction','Test and Build','Build Something Worthwhile']){
 assert.ok(thread.includes(label),'Waymaking story beat missing: '+label);
}
let previous=-1;
for(const label of ['Define the Opportunity','Check the Business Case','Choose a Direction','Test and Build','Build Something Worthwhile']){
 const offset=thread.indexOf(label);
 assert.ok(offset>previous,'Waymaking story order wrong: '+label);
 previous=offset;
}
assert.equal((thread.match(/<h3>/g)||[]).length,5,'Five semantic chapter headings required');
// Waymaking extends the introduction with five different, usable decisions
// rather than restating the same personal traits and mission in new words.
const waymakingEntries=[...thread.matchAll(/<article class="waymaking-beat(?: waymaking-purpose)?"[^>]*>[\\s\\S]*?<h3>([^<]+)<\\/h3>\\s*<p>([^<]+)<\\/p>/g)];
assert.equal(waymakingEntries.length,5,'Exactly five complete Waymaking chapters required');
const normalize=(value)=>value.replaceAll('&amp;','&').toLowerCase()
  .match(/[a-z0-9]+(?:['-][a-z0-9]+)*/g)||[];
const ngrams=(words,n)=>{
  const values=new Set();
  for(let i=0;i<=words.length-n;i++)values.add(words.slice(i,i+n).join(' '));
  return values;
};
const priorWords=normalize(threadSummary);
for(const [index,entry] of waymakingEntries.entries()){
  const words=normalize(entry[2]);
  assert.ok(words.length>=30&&words.length<=43,
    'Each Waymaking paragraph must be short and comparable in length: '+entry[1]+' / '+words.length);
  const overlap=ngrams(words,5);
  assert.ok([...overlap].every(phrase=>!ngrams(priorWords,5).has(phrase)),
    'Waymaking chapter repeats an entire phrase from Where I add value: '+entry[1]);
  priorWords.push(...words);
}
for(const essential of [
 'an unmet need', 'a market shift', 'P&amp;L', 'customer acquisition',
 'how to get to market', 'proceed, change course or stop',
 'a quick pretotype to test demand', 'first working product',
 'people, planet and profit in practice'
])assert.ok(thread.includes(essential),'Missing concrete capability, reason-to-believe or outcome: '+essential);

assert.ok(thread.includes('class="waymaking-original-source"'),'Approved original artwork picture missing');
assert.ok(!thread.includes('waymaking-editorial-ink.avif'),'Obsolete low-resolution AVIF must not be rendered');
assert.ok(thread.includes('src="assets/waymaking-ink-v25.webp"'),'High-resolution generated WebP fallback missing');
assert.ok(thread.includes('href="assets/waymaking-ink-v25.webp"'),'SVG mask must reveal new generated WebP');
assert.ok(thread.includes('class="waymaking-original-reveal"'),'Original artwork reveal is missing');
assert.equal((thread.match(/<path data-waymaking-reveal-path /g)||[]).length,1,'Exactly one curve-following paint path required');
assert.ok(!thread.includes('data-waymaking-brush-tip'),'No independent brush-tip overlay may appear over ink');
assert.ok(thread.includes('mask-type="alpha"') && thread.includes('stroke-dasharray="1 1"') && thread.includes('stroke-width="190"') && thread.includes('stroke-linecap="round"') && thread.includes('M 294,-132'),'One narrow, off-canvas-started, naturally capped alpha-mask stroke required');
assert.ok(!thread.includes('data-waymaking-complete'),'No full-frame completion overlay may flash into view');
assert.ok(!thread.includes('waymaking-brush-head-v24.png'),'Legacy artificial brushhead must not render');
assert.ok(thread.includes('viewBox="0 0 720 2148"'),'Full-height artwork viewBox missing');
assert.ok(thread.includes('maskUnits="userSpaceOnUse"'),'Native SVG mask missing');
assert.ok(!thread.includes('feTurbulence') && !thread.includes('data-waymaking-feather'),'Expensive legacy SVG filters must be absent');
for(const [filename,sha] of [
 ['waymaking-editorial-ink.webp','1f728a4ba55dbedb9b559257f906b841dc660496'],
 ['waymaking-ink-v22.webp','2a540d51d3ac40c951f13a8d8c5417599e9de97c'],
 ['waymaking-ink-v25.webp','a064cc8ece52a57dacf4dcbc2b50786d6828bba5'],
 ['waymaking-brush-head-v24.png','ceb5bf8a31684d2f8c2d054c2bbf0694f02dde4b']
]) {
 const bytes=readFileSync(join(root,'assets',filename));
 const actualSha=createHash('sha1').update('blob '+bytes.length+String.fromCharCode(0)).update(bytes).digest('hex');
 assert.equal(actualSha,sha,'APPROVED SOURCE ARTWORK HAS CHANGED: '+filename);
}
assert.ok(html.includes('waymaking-scroll.js?v=20261022-waymaking-v28'),'Original artwork controller missing');
assert.ok(!part(html,'<section class="waymaking-narrative"','</section>').includes('—'),'Waymaking copy must contain no em dashes');
const license=readFileSync(join(root,'assets/waymaking-dry-brush-LICENSE.txt'),'utf8');
assert.ok(license.includes('MIT License'),'Existing original artwork license attribution must remain preserved');
assert.ok(html.includes("Where I'm putting that way of thinking to work today."),'My current focus bridge copy missing');
assert.ok(html.indexOf('id="work"') < html.indexOf('id="perspective"'),'My current focus must lead into The shift I see');
assert.ok(!html.includes('<h2 id="about-title">My story</h2>'),'Homepage My story must remain removed');
assert.ok(css.includes('.waymaking-scene') && css.includes('.waymaking-artspace') && css.includes('.waymaking-road-wrap {\n  position: absolute;'),'Document-anchored Waymaking composition missing');
assert.ok(css.includes('.waymaking-beat:nth-child(odd)') && css.includes('.waymaking-beat:nth-child(even)'),'Alternate copy layout missing');
assert.ok(css.includes('.waymaking-original-source')&&css.includes('.waymaking-original-reveal'),'Restored source/fallback styling missing');
assert.ok(css.includes('.waymaking-road-wrap {\n  position: absolute;') && css.includes('bottom: clamp(48px, 5svh, 80px);'),'Tapered road must be document-anchored and end before next section');
assert.ok(!css.includes('.waymaking-copy-column::before') && !css.includes('.waymaking-copy-column::after'),'Wrong pre/post viewport spacers returned');
assert.ok(css.includes('/* V23: a single reading column;') && css.includes('grid-template-columns: minmax(0, 1fr);'),'Mobile must use full-width reading column with centered background road');
assert.ok(css.includes('-webkit-tap-highlight-color: transparent;') && css.includes('mobile-navigation-panel a:active'),'Mobile menu must use red-only navigation feedback');
assert.ok(css.includes('min-height: clamp(190px, 29svh, 254px);') && css.includes('min-height: clamp(196px, 30svh, 260px);'),'Consistent breathing room restored for mobile Waymaking');
assert.ok(!css.includes('.waymaking-resolution'),'Deleted Waymaker conclusion must not reserve spacing');
assert.ok(!html.includes('class="waymaking-vector '),'Unapproved V15 vector must not appear');
const scrollController=readFileSync(join(root,'waymaking-scroll.js'),'utf8');
assert.ok(scrollController.includes('const roadTarget = () =>') && scrollController.includes('lastParagraphBottom') && scrollController.includes('return easing(raw)'),'Continuous painted route must begin gradually and finish after the final paragraph');
assert.ok(scrollController.includes("revealPath.setAttribute('stroke-dashoffset'") && !scrollController.includes('getPointAtLength'),'One SVG stroke should follow the native path without a trailing secondary layer');
assert.ok(!scrollController.includes('completedMask') && !scrollController.includes('brushTip'),'Scroll drawing must not have additional overlay layers');
assert.ok(scrollController.includes('Math.exp(-elapsed / 32)') && scrollController.includes('Math.exp(-elapsed / 58)'),'Frame-time smoothing should follow the finger without a delayed second stroke');
assert.ok(scrollController.includes('const textTarget = heading =>') && scrollController.includes('const complete = height * 0.48'),'Reading activation must happen near the viewport middle');
assert.ok(!scrollController.includes('glyphWeight') && !scrollController.includes('replaceChildren'),'Per-letter fade-out and DOM rewrites must not return');
assert.ok(!scrollController.includes('road.style.opacity'),'Entire ink must never fade in/out');
assert.ok(!scrollController.includes('document.body.appendChild(road)'),'Road cannot be portaled to body');
assert.ok(!scrollController.includes('data-waymaking-viewport'),'Viewport-fixed road mode cannot return');
assert.ok(!scrollController.includes('waymakingRoadActive'),'Road cannot be display-toggled');
assert.ok(!scrollController.includes('--waymaking-safe-top'),'Original picture may NOT be progressively clipped behind the intro');
assert.ok(scrollController.includes("reducedMotion.matches"),'Reduced motion preference missing');
for(const forbidden of ['updateBackdropClip','--waymaking-clip-top','road.style.top','brush.setAttribute']){
 assert.ok(!scrollController.includes(forbidden),'Deprecated road moving/portaling logic returned: '+forbidden);
}
assert.ok(!css.includes('body[data-waymaking-road-active="true"] .perspective-copy') && !css.includes('box-shadow: 0 0 34px'),'Downstream white patchwork masking must be removed');
assert.ok(!scrollController.includes('waymaking-heading-word'),'Plain semantic headings must remain unfragmented');
assert.ok(!thread.includes('AI-Native Building</h3>'),'Fourth chapter must emphasize hands-on execution');
assert.ok(thread.includes('quick pretotypes') && thread.includes('P&amp;L'),'Execution and commercial experience must be communicated plainly');
assert.ok(css.includes('.waymaking-copy h3 {') && css.includes('.waymaking-word { font-size: 32px'),'Heading/brand namespaces must be distinct');
assert.ok(css.includes('.waymaking-original-reveal'),'Approved original scroll-reveal artwork styling missing');
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
 const expectedStyles=path==='index.html'?'styles.css?v=20261022-waymaking-v28':'styles.css?v=20261014-subtitle-width-v1';
 assert.ok(page.includes(expectedStyles),'Shared stylesheet drift: '+path);
 assert.ok(page.includes('name="robots" content="noindex,nofollow"'),'Preview indexing protection missing: '+path);
 assert.ok(!page.includes('footer-wordmark'),'Footer branding must stay removed: '+path);
}
console.log('PASS: protected homepage, unified footers, shared fonts and preview metadata');
