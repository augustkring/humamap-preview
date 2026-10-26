// Approved homepage baseline. Update digests only with explicit user-approved changes.
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

const approved={"main":"f3116a48","footer":"7bea4e97","tokens":"3fe414f6","contact":"c102b368"};
const actual={
  main:digest(part(html,'<main','</main>')),
  footer:digest(part(html,'<footer','</footer>')),
  tokens:digest(part(css,':root {','\n}')),
  contact:digest(part(css,'/* Homepage closing note:','.home-footer {\n  padding: 34px'))
};
for(const [key,val] of Object.entries(approved)) {
  assert.equal(actual[key],val,'Approved homepage/CSS changed: '+key);
}

const perspective=part(html,'<section id="perspective"','</section>');
assert.ok(
  perspective.includes("<p>But greater capacity doesn't automatically make a company more competitive. AI raises the stakes: it amplifies the value of what a company gets right and the cost of what it gets wrong.</p>"),
  'Approved The shift I see argument changed'
);

const thread=part(html,'<section id="thread"','</section>');
const threadSummary=thread.slice(0,thread.indexOf('<section class="waymaking-narrative"'));
for(const sentence of [
  "I do my best work when something new is taking shape and a challenge calls for fresh thinking and clear direction.",
  "I combine creative thinking with commercial understanding and strategic judgement to spot opportunities and find better ways forward.",
  "I enjoy giving ambitious ideas direction and bringing people together around a shared vision.",
  "But I also like getting hands-on, experimenting and building things myself, using AI to turn ideas into reality.",
  "build towards a positive future together with bold people",
  "leaving the world a little better than I found it."
]) {
  assert.ok(threadSummary.includes(sentence),'Approved Where I add value copy drift: '+sentence);
}
assert.equal((threadSummary.match(/<p>/g)||[]).length,3,'Where I add value should have three paragraphs');

// Waymaking is five parallel editorial facets, not a process and not a scroll illustration.
assert.ok(thread.includes('aria-label="Waymaking"'),'Waymaking semantic section missing');
assert.ok(thread.includes('class="waymaking-copy-column" role="list"'),'Waymaking list semantics missing');
assert.equal((thread.match(/role="listitem"/g)||[]).length,5,'Waymaking must have five parallel list items');
assert.ok(!thread.includes('What I mean by Waymaker')&&!thread.includes('class="waymaking-intro"'),'Removed Waymaker intro returned');
assert.ok(!html.includes('waymaking-scroll.js'),'Retired Waymaking scroll controller must not be loaded');
for(const forbidden of [
  'waymaking-road-wrap','waymaking-artspace','waymaking-original-source','waymaking-original-reveal',
  'data-waymaking-reveal-path','data-waymaking-animated','waymaking-scene'
]) {
  assert.ok(!thread.includes(forbidden),'Retired road/animation markup returned: '+forbidden);
}

const labels=['Creative Thinking','Commercial Understanding','Strategic Judgement','Hands-On Execution','Purpose &amp; Impact'];
let previous=-1;
for(const label of labels){
  const offset=thread.indexOf(label);
  assert.ok(offset>previous,'Waymaking story order wrong: '+label);
  previous=offset;
}
assert.equal((thread.match(/<h3>/g)||[]).length,5,'Five semantic Waymaking headings required');

const waymakingEntries=[...thread.matchAll(/<h3>([^<]+)<\/h3>\s*<p>([^<]+)<\/p>/g)];
assert.equal(waymakingEntries.length,5,'Exactly five complete Waymaking facets required');
const normalize=(value)=>value.replaceAll('&amp;','&').toLowerCase().match(/[a-z0-9]+(?:['-][a-z0-9]+)*/g)||[];
const ngrams=(words,n)=>{
  const values=new Set();
  for(let i=0;i<=words.length-n;i++)values.add(words.slice(i,i+n).join(' '));
  return values;
};
const priorWords=normalize(threadSummary);
const letterCount=(value)=>(value.match(/\p{L}/gu)||[]).length;
for(const entry of waymakingEntries){
  const words=normalize(entry[2]);
  const letters=letterCount(entry[2]);
  assert.ok(letters>=140&&letters<=150,
    'Each Waymaking paragraph must stay within the approved 140-150 letter range: '+entry[1]+' / '+letters);
  const overlap=ngrams(words,5);
  assert.ok([...overlap].every(phrase=>!ngrams(priorWords,5).has(phrase)),
    'Waymaking facet repeats an entire phrase from Where I add value: '+entry[1]);
  priorWords.push(...words);
}
for(const essential of [
  'Seeing connections, possibilities and new angles',
  'customer value, sound economics',
  'decisions and priorities that matter most',
  'create clarity so people understand the goal',
  'I use AI to build and test ideas quickly',
  'commercial success with positive impact'
]) {
  assert.ok(thread.includes(essential),'Missing approved Waymaking positioning language: '+essential);
}

// Editorial art direction: hierarchy, hairlines, whitespace, one quiet brand signature.
assert.ok(css.includes('/* Waymaking editorial: five parallel facets, hierarchy before decoration. */'),'Editorial Waymaking design marker missing');
assert.ok(css.includes('.waymaking-copy-column {\n  position: relative;'),'Waymaking editorial container missing');
assert.ok(css.includes('.waymaking-beat + .waymaking-beat {\n  border-top: 1px solid var(--line);'),'Waymaking must use only internal hairline dividers');
assert.ok(!css.includes('.waymaking-copy-column {\n  border-top: 1px solid var(--line);')&&!css.includes('border-bottom: 1px solid var(--line);\n}'),'Waymaking must not be boxed by top/bottom rules');
assert.ok(css.includes('grid-template-columns: minmax(230px, .78fr) minmax(0, 1.22fr);'),'Desktop editorial two-column grid missing');
assert.ok(css.includes('.thread-section { padding-bottom: 0; }'),'Corrected homepage thread must not add duplicate bottom spacing');
assert.ok(css.includes('@media (max-width: 700px) {')&&css.includes('grid-template-columns: minmax(0, 1fr);'),'Mobile editorial stack missing');
assert.ok(!thread.includes('waymaking-signature'),'Decorative Waymaking signature must remain removed');
assert.ok(!css.includes('.waymaking-signature'),'Decorative Waymaking signature styling must remain removed');
assert.ok(css.includes('font-size: clamp(21px, calc(2vw - 2px), 26px);'),'Waymaking headings must stay within the established secondary heading scale');
assert.ok(css.includes('font-size: var(--card-copy-size);'),'Waymaking body copy must reuse the established card-copy size');
for(const forbidden of [
  '.waymaking-road-wrap','.waymaking-artspace','.waymaking-original-source','.waymaking-original-reveal',
  '.waymaking-beat:nth-child(odd)','.waymaking-beat:nth-child(even)'
]) {
  assert.ok(!css.includes(forbidden),'Retired road/zig-zag styling returned: '+forbidden);
}
assert.ok(!css.includes('.waymaking-resolution')&&!css.includes('.waymaking-intro'),'Removed Waymaker intro/conclusion styling returned');

assert.ok(html.includes("How that shows up in what I'm building today."),'My current focus bridge copy missing');
assert.ok(html.indexOf('id="work"') < html.indexOf('id="perspective"'),'My current focus must lead into The shift I see');
const threadClose=html.indexOf('</section>',html.indexOf('</section>',html.indexOf('<section class="waymaking-narrative"'))+10);
assert.ok(threadClose>=0&&threadClose<html.indexOf('<section id="work"'),'Where I add value must close before My current focus');
assert.ok(!html.includes('<h2 id="about-title">My story</h2>'),'Homepage My story must remain removed');
assert.ok(thread.includes('<h3>Hands-On Execution</h3>')&&!thread.includes('<h3>AI-Native Building</h3>'),'Hands-On Execution remains the fourth facet');
assert.ok(thread.includes('class="waymaking-beat waymaking-purpose"')&&thread.includes('<h3>Purpose &amp; Impact</h3>'),'Purpose & Impact remains the fifth facet');
assert.ok(html.includes("Blentera is the company’s AI foundation."),'Approved Blentera positioning copy missing');

const work=part(html,'<section id="work"','</section>');
const workParagraphs=[...work.matchAll(/<p>([^<]+)<\/p>/g)]
  .map(match=>match[1])
  .filter(value=>!value.includes("How that shows up in what I'm building today."));
assert.equal(workParagraphs.length,4,'My current focus must contain exactly four venture descriptions');
for(const copy of workParagraphs){
  const letters=letterCount(copy);
  assert.ok(letters>=220&&letters<=230,
    'Each My current focus description must stay within the approved 220-230 letter range: '+letters);
}

assert.ok(css.includes('-webkit-tap-highlight-color: transparent;')&&css.includes('mobile-navigation-panel a:active'),'Mobile menu must use red-only navigation feedback');
assert.ok(css.includes('grid-template-columns: var(--contact-columns);'),'Approved two-group close missing');
assert.ok(css.includes("/* Home + About section subtitles share one readable measure.\n   The homepage hero description intentionally keeps its approved full-column width. */\n.home-main .thread-lead > p,\n.home-main .perspective-lead > p,\n.home-main .values-lead > p,\n.home-main .about-home-lead > p,\n.home-main .about-principles-intro > p,\n.home-main .about-story-intro > p,\n.home-main .about-personal-lead {\n  max-width: min(100%, 390px);\n}"),'Shared 390px subtitle measure missing');
assert.ok(css.includes('.hero-copy > .hero-focus {\n  width: 100%;\n  max-width: none;'),'Approved full-column homepage hero description missing');
assert.ok(css.includes('max-width: 900px;\n  margin-inline: auto;\n  padding: clamp(50px, 5vw, 66px) 0 clamp(68px, 7vw, 92px);\n  text-align: center;'),'Perspectives hero must stay centred');
assert.ok(css.includes('.perspectives-library { width: min(100%, 840px); margin-inline: auto;'),'Perspectives article column must stay centred');
assert.ok(css.includes('@media (max-width: 760px) {\n  .homepage-contact-content'),'Contact mobile stacking missing');

const license=readFileSync(join(root,'assets','waymaking-dry-brush-LICENSE.txt'),'utf8');
assert.ok(license.includes('MIT License'),'Waymaking brush license attribution must remain preserved');

for(const path of ['index.html','about/index.html','perspectives/index.html','perspectives/rethinking-the-company/index.html','perspectives/europe-at-a-crossroads/index.html','privacy/index.html','unsubscribe/index.html']){
  const page=readFileSync(join(root,path),'utf8');
  const expectedStyles=path==='index.html'?'styles.css?v=20261026-waymaking-editorial-v37':'styles.css?v=20261026-nav-focus-v2';
  assert.ok(page.includes(expectedStyles),'Shared stylesheet drift: '+path);
  assert.ok(page.includes('name="robots" content="noindex,nofollow"'),'Preview indexing protection missing: '+path);
  assert.ok(!page.includes('footer-wordmark'),'Footer branding must stay removed: '+path);
}

console.log('PASS: editorial Waymaking, protected homepage copy, responsive structure and shared site baseline');
