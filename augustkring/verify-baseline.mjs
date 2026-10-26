// Approved homepage baseline. Update digests only with explicit user-approved changes.
import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root=dirname(fileURLToPath(import.meta.url));
const html=readFileSync(join(root,'index.html'),'utf8');
const aboutHtml=readFileSync(join(root,'about/index.html'),'utf8');
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

const approved={"main":"18b21e8f","footer":"b1c59284","tokens":"79885db3","contact":"864e4a37","aboutMain":"bb2b0b6d"};
const actual={
  main:digest(part(html,'<main','</main>')),
  footer:digest(part(html,'<footer','</footer>')),
  tokens:digest(part(css,':root {','\n}')),
  contact:digest(part(css,'/* Homepage closing signoff:','\n.home-footer {')),
  aboutMain:digest(part(aboutHtml,'<main','</main>'))
};
for(const [key,val] of Object.entries(approved)) {
  assert.equal(actual[key],val,'Approved homepage/CSS changed: '+key);
}

const perspective=part(html,'<section id="perspective"','</section>');
assert.ok(perspective.includes('<p class="perspective-statement">The real opportunity isn\'t AI itself. It\'s the companies we can build around it.</p>'),'The Shift I See statement must sit directly under its heading');
assert.ok(!perspective.includes('The next decade will test even the strongest market positions.'),'Retired Shift subtitle returned');
assert.ok(
  perspective.includes("<p>But greater capacity doesn't automatically make a company more competitive. AI raises the stakes: it amplifies the value of what a company gets right and the cost of what it gets wrong.</p>"),
  'Approved The shift I see argument changed'
);

const thread=part(html,'<section id="thread"','</section>');
const threadSummary=thread.slice(0,thread.indexOf('<section class="waymaking-narrative"'));
for(const sentence of [
  "I do my best work when something new is taking shape or a challenge calls for fresh thinking and clear direction.",
  "I combine creative thinking with commercial understanding and strategic judgement to spot opportunities and find better ways forward.",
  "I enjoy giving ambitious ideas direction and bringing people together around a shared vision.",
  "But I also like getting hands-on, experimenting and building things myself, using AI to turn ideas into reality.",
  "What drives me is building towards a positive future together with bold people",
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
assert.ok(css.includes('grid-template-columns: minmax(0, .82fr) minmax(0, 1.18fr);'),'Waymaking desktop grid must align with Where I add value');
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

assert.ok(!html.includes("How that shows up in what I'm building today.")&&!html.includes("What I'm building and working on today."),'My current focus must not have a subtitle');
assert.ok(html.indexOf('id="work"') < html.indexOf('id="perspective"'),'My current focus must lead into The shift I see');
const threadClose=html.indexOf('</section>',html.indexOf('</section>',html.indexOf('<section class="waymaking-narrative"'))+10);
assert.ok(threadClose>=0&&threadClose<html.indexOf('<section id="work"'),'Where I add value must close before My current focus');
assert.ok(!html.includes('<h2 id="about-title">My story</h2>'),'Homepage My story must remain removed');
assert.ok(thread.includes('<h3>Hands-On Execution</h3>')&&!thread.includes('<h3>AI-Native Building</h3>'),'Hands-On Execution remains the fourth facet');
assert.ok(thread.includes('class="waymaking-beat waymaking-purpose"')&&thread.includes('<h3>Purpose &amp; Impact</h3>'),'Purpose & Impact remains the fifth facet');
assert.ok(html.includes("Blentera gives companies a shared foundation for AI."),'Approved Blentera positioning copy missing');

const work=part(html,'<section id="work"','</section>');
const workParagraphs=[...work.matchAll(/<p>([^<]+)<\/p>/g)].map(match=>match[1]);
assert.equal(workParagraphs.length,4,'My current focus must contain exactly four venture descriptions');
for(const copy of workParagraphs){
  const letters=letterCount(copy);
  assert.ok(letters>=220&&letters<=230,
    'Each My current focus description must stay within the approved 220-230 letter range: '+letters);
}

assert.ok(css.includes('-webkit-tap-highlight-color: transparent;')&&css.includes('.mobile-menu-toggle:focus-visible svg'),'Mobile menu must keep pointer feedback clean and keyboard focus visible');
assert.ok(!css.includes('outline: 2px solid var(--red); outline-offset: 2px; background: transparent; color: var(--red);'),'Mobile menu controls must never use the retired red focus ring');
assert.ok(css.includes('.homepage-contact-content { display: block; }'),'Homepage signoff must remain one cohesive personal block');
assert.ok(html.includes('<p class="signoff-note">With curiosity and optimism,</p>'),'Approved personal signoff missing');
assert.ok(!html.includes('Let’s connect'),'Retired contact heading returned');
assert.ok(html.includes('data-work-pagination')&&!html.includes('data-work-prev')&&!html.includes('data-work-next'),'Current focus must use dots instead of arrows');
assert.equal((html.match(/data-work-label=/g)||[]).length,4,'Each current-focus card needs one navigation label');
assert.ok(css.includes('.work-carousel-dot[aria-current="true"]')&&css.includes('width: 44px;')&&css.includes('height: 44px;'),'Current-focus dot states/touch targets missing');
assert.ok(css.includes('.work-brand-august { height: 40px; }')&&css.includes('.work-brand-humamap { height: 40px; }'),'August Works and HumaMap must retain their optically compensated logo height');
assert.ok(css.includes('.work-brand-blentera { height: 37px; filter: none; }'),'Blentera reference logo height drifted');
assert.ok(css.includes('.homepage-contact-actions { width: 100%; margin: 16px 0 0; display: grid;'),'Signoff actions must stay attached below the personal block');
assert.ok(html.includes('Read my perspectives')&&!html.includes('Explore my perspectives'),'Homepage perspective link wording drift');
assert.ok(!html.includes('class="perspective-links"'),'Homepage perspective preview cards must remain removed');
assert.ok(!html.includes('waymaking-ventures')&&!html.includes('<sup>™</sup>'),'Waymaking focus logo must remain free of Ventures and TM');
assert.ok(css.includes('.waymaking-beat:last-child {\n  padding-bottom: 0;')&&css.includes('.work-section--waymaking-output {\n  padding-top: var(--section-space);'),'Purpose-to-current-focus spacing must use one section gap');
for(const token of ['--font-body:','--font-display:','--accent:','--surface-card:','--measure-reading:','--measure-narrow:','--radius-sm:','--focus-ring-width:','--section-space:','--section-space-mobile:']) {
  assert.ok(css.includes(token),'Shared design-system token missing: '+token);
}
assert.ok(css.includes('/* About V5: story-first profile, balanced toolkit, responsive lens index. */'),'About V5 design marker missing');
assert.ok(!aboutHtml.includes('about-personal-hero')&&!aboutHtml.includes('Hi, I’m August.'),'About V5 hero must be removed');
assert.ok(aboutHtml.includes('<h1 id="story-title">How I got here.</h1>'),'About V5 must begin with How I got here as the page H1');
assert.ok(css.includes('.about-story-first {\n  padding-top: clamp(54px, 5.5vw, 72px);'),'About V5 first-section rhythm missing');
assert.ok(css.includes('.about-story {\n  display: grid;\n  grid-template-columns: minmax(0, .82fr) minmax(0, 1.18fr);'),'About V5 story must use editorial heading/prose grid');
assert.ok(css.includes('.about-story-prose p + p {\n  margin-top: 20px;'),'About V5 story must keep normal prose paragraph rhythm');
assert.ok(aboutHtml.includes('<span>For the full chronology, see LinkedIn</span>'),'About V5 chronology CTA missing');
assert.ok(css.includes('.about-toolkit {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));'),'Skill Set and Mindset must be equal desktop columns');
assert.ok(css.includes('grid-template-rows: repeat(5, minmax(0, 1fr));'),'Skill Set and Mindset rows must stay aligned');
assert.ok(css.includes('.about-personality-explorer {\n  display: grid;\n  grid-template-columns: minmax(150px, 190px) minmax(0, 1fr);'),'Desktop lenses must use vertical index plus reading panel');
assert.ok(css.includes('.about-personality-tabs {\n  display: none;\n  margin: 0;\n  padding: 0;\n  flex-direction: column;'),'Desktop lens navigation must be vertical');
assert.ok(css.includes('@media (max-width: 840px) {')&&css.includes('.about-personality-tabs {\n    width: 100%;\n    margin: 0 0 28px;\n    flex-direction: row;'),'Compact lens navigation must switch to horizontal swipe');
assert.ok(aboutHtml.includes('data-personality-tab="high5">HIGH5</button>'),'HIGH5 lens missing');
assert.ok(aboutHtml.includes('data-personality-tab="via">VIA</button>'),'VIA lens missing');
assert.equal((aboutHtml.match(/data-personality-panel=/g)||[]).length,7,'About V5 must expose exactly seven reflection panels');
assert.ok(!aboutHtml.includes('about-profile-kicker')&&!aboutHtml.includes('about-personality-markers')&&!aboutHtml.includes('about-personality-meaning'),'About V5 must not reintroduce scores/source metadata/old meaning grids');
assert.ok(!aboutHtml.includes('about-profile-cta')&&!aboutHtml.includes('about-hero-link'),'About V5 must not keep old LinkedIn CTA placements');
assert.ok(!aboutHtml.includes('—'),'About V5 must not contain em dashes');
assert.ok(css.includes(':where(a, button, input, select, textarea):focus-visible'),'Shared interactive focus default missing');
assert.ok(css.includes("width: .405em; height: .405em;")&&css.includes("top: -.105em;"),'August Kring wordmark dot must remain 25 percent smaller than the doubled state while preserving the original lower edge');
assert.ok(!css.includes('.wordmark-i::before'),'August Kring wordmark must not use a white clearing halo behind the red dot');
assert.ok(css.includes("--body-copy-size: 18px;")&&css.includes("--body-reading-size: 18px;")&&css.includes("--card-copy-size: 17px;"),'Mobile reading-size tokens must remain 18px / 17px');
assert.ok(css.includes(".work-card { --venture-copy-size: 17px;"),'Mobile venture copy must use the 17px compact reading size');
assert.ok(css.includes('.about-lens-copy p {\n  margin: 0;\n  color: var(--copy);\n  font-size: var(--body-copy-size);'),'About V5 lens body must inherit 18px reading copy');
assert.ok(css.includes(".perspective-index-summary { font-size: var(--body-reading-size); }"),'Perspective summaries must inherit 18px mobile reading copy');
assert.ok(css.includes(".article-comparison td { font-size: var(--card-copy-size); }"),'Article comparison cells must inherit the 17px compact mobile size');
assert.ok(css.includes("/* Homepage section subtitles keep the approved narrow editorial measure. */\n.home-main .thread-lead > p,\n.home-main .perspective-lead > p,\n.home-main .values-lead > p {\n  max-width: min(100%, var(--measure-narrow));\n}"),'Homepage 390px subtitle measure missing');
assert.ok(css.includes('.hero-copy > .hero-focus {\n  width: 100%;\n  max-width: none;'),'Approved full-column homepage hero description missing');
assert.ok(css.includes('max-width: 900px;\n  margin-inline: auto;\n  padding: clamp(50px, 5vw, 66px) 0 clamp(68px, 7vw, 92px);\n  text-align: center;'),'Perspectives hero must stay centred');
assert.ok(css.includes('.perspectives-library { width: min(100%, 840px); margin-inline: auto;'),'Perspectives article column must stay centred');
assert.ok(css.includes('.homepage-contact-actions { width: 100%; margin: 16px 0 0; display: grid;'),'Contact mobile action stack missing');
assert.ok(css.includes('@media (max-width: 760px) {\n  .homepage-contact .personal-signoff .signoff-signature { width: 164px; }'),'Contact mobile signature scale missing');

const workCarousel=readFileSync(join(root,'work-carousel.js'),'utf8');
assert.ok(workCarousel.includes("dot.dataset.workDot = ''")&&workCarousel.includes("aria-current")&&workCarousel.includes("prefers-reduced-motion"),'Dot carousel interaction/accessibility contract missing');
assert.ok(!workCarousel.includes('data-work-prev')&&!workCarousel.includes('data-work-next'),'Retired arrow control logic returned');

const license=readFileSync(join(root,'assets','waymaking-dry-brush-LICENSE.txt'),'utf8');
assert.ok(license.includes('MIT License'),'Waymaking brush license attribution must remain preserved');

for(const path of ['index.html','about/index.html','perspectives/index.html','perspectives/rethinking-the-company/index.html','perspectives/europe-at-a-crossroads/index.html','privacy/index.html','unsubscribe/index.html']){
  const page=readFileSync(join(root,path),'utf8');
  const expectedStyles='styles.css?v=20261026-shared-v13';
  assert.ok(page.includes(expectedStyles),'Shared stylesheet drift: '+path);
  assert.ok(page.includes('name="robots" content="noindex,nofollow"'),'Preview indexing protection missing: '+path);
  assert.ok(!page.includes('footer-wordmark'),'Footer branding must stay removed: '+path);
  const footer=part(page,'<footer class="home-footer"','</footer>');
  assert.ok(footer.includes('href="mailto:ak@augustkring.com">ak@augustkring.com</a>'),'Footer must show the actual email address: '+path);
  assert.ok(footer.includes('>Connect on LinkedIn</a>'),'Footer LinkedIn action missing: '+path);
  assert.ok(footer.includes('href="perspectives/#subscribe">Subscribe to Perspectives</a>'),'Footer Perspectives subscription action missing: '+path);
  assert.ok(!footer.includes('>About</a>')&&!footer.includes('>Perspectives</a>'),'Retired footer navigation returned: '+path);
}

console.log('PASS: homepage baseline plus story-first, seven-lens About V5 system');
