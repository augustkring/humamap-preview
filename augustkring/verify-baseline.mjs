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

const approved={"main":"18b21e8f","footer":"b1c59284","tokens":"79885db3","contact":"864e4a37","aboutMain":"56aecb66","aboutToolkit":"772637ca"};
const actual={
  main:digest(part(html,'<main','</main>')),
  footer:digest(part(html,'<footer','</footer>')),
  tokens:digest(part(css,':root {','\n}')),
  contact:digest(part(css,'/* Homepage closing signoff:','\n.home-footer {')),
  aboutMain:digest(part(aboutHtml,'<main','</main>')),
  aboutToolkit:digest(part(aboutHtml,'<section id="toolkit"','</section>'))
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
assert.ok(!css.includes('.thread-section { padding-bottom: 0; }'),'Homepage must not collapse the Purpose-to-Current-Focus section gap');
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
assert.ok(css.includes('.waymaking-beat:last-child {\n  padding-bottom: 0;')&&css.includes('.story-section {\n  padding: var(--section-space) 0;')&&css.includes('.work-section--waymaking-output {\n  padding-top: var(--section-space);'),'Purpose-to-current-focus spacing must use the full two-sided section rhythm');
for(const token of ['--font-body:','--font-display:','--accent:','--surface-card:','--measure-reading:','--measure-narrow:','--radius-sm:','--focus-ring-width:','--section-space:','--section-space-mobile:']) {
  assert.ok(css.includes(token),'Shared design-system token missing: '+token);
}
assert.ok(css.includes('/* About V7: personal belief, story, mindset, principles and reflection lenses. */'),'About V7 design marker missing');
assert.ok(aboutHtml.includes('<h1 id="about-page-title">Hi, I’m August.</h1>'),'About V7 personal H1 missing');
assert.ok(aboutHtml.includes('<p class="about-personal-belief">I believe the future is shaped by what we choose to build together.</p>'),'About V7 belief statement changed');
assert.ok(aboutHtml.includes('<h2 id="story-title">My story.</h2>'),'About V7 My story heading missing');
assert.ok(css.includes('.about-personal-belief {\n  max-width: 680px;'),'About V7 belief measure missing');
assert.ok(css.includes('.about-story {\n  display: grid;\n  grid-template-columns: minmax(0, .82fr) minmax(0, 1.18fr);')&&css.includes('.about-principles {\n  display: block;')&&css.includes('grid-template-columns: repeat(4, minmax(0, 1fr));'),'Story keeps editorial split and Principles spans one horizontal row');
assert.ok(aboutHtml.includes('<span>For the full chronology, see LinkedIn</span>'),'About V7 chronology CTA missing');
assert.ok(css.includes('.about-toolkit {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));'),'Skill Set and Mindset must remain equal desktop columns');
assert.ok(css.includes('grid-template-rows: repeat(5, minmax(0, 1fr));'),'Skill Set and Mindset rows must remain aligned');
assert.ok(!aboutHtml.includes('about-toolkit-intro'),'Redundant Skill Set and Mindset intros must not return');
assert.ok(css.includes('.about-toolkit-list h3,\n.about-principles-list h3 {')&&css.includes('.about-principles-list {\n  display: grid;'),'About typography and horizontal Principles system missing');
for(const mindset of ['Entrepreneurial','Strategic','Curious','Adaptive','Connective']) {
  assert.ok(aboutHtml.includes('<h3>'+mindset+'</h3>'),'About V7 mindset missing: '+mindset);
}
for(const principle of ['Think big. Start small. Scale fast.','Execution over fear.','Learn, unlearn, relearn.','People, planet &amp; profit.']) {
  assert.ok(aboutHtml.includes('<h3>'+principle+'</h3>'),'About V7 principle missing or rewritten: '+principle);
}
assert.equal((part(aboutHtml,'<section id="principles"','</section>').match(/<article>/g)||[]).length,4,'About V7 must contain exactly four Principles');
assert.ok(aboutHtml.includes('<h2 id="personality-title">Different lenses.</h2>'),'About V7 lens heading missing');
assert.ok(css.includes('.about-personality-explorer {\n  display: grid;\n  grid-template-columns: minmax(150px, 190px) minmax(0, 1fr);'),'Desktop lenses must use vertical index plus reading panel');
assert.ok(css.includes('@media (max-width: 840px) {')&&css.includes('.about-personality-tabs {\n    width: 100%;\n    margin: 0 0 28px;\n    flex-direction: row;'),'Compact lens navigation must switch to horizontal swipe');
assert.equal((aboutHtml.match(/data-personality-panel=/g)||[]).length,7,'About V7 must expose exactly seven reflection panels');
assert.equal((aboutHtml.match(/class="about-lens-copy"/g)||[]).length,7,'Each About V7 lens must use one descriptive copy block');
assert.ok(!aboutHtml.includes('about-profile-kicker')&&!aboutHtml.includes('about-personality-markers')&&!aboutHtml.includes('about-personality-meaning'),'About V7 must not reintroduce scores/source metadata/old meaning grids');
assert.ok(!aboutHtml.includes('—'),'About V7 must not contain em dashes');
// Approved changes are limited to the named About sections; Skill Set and Mindset stay headings-only.
// The seven Different lenses now report how each framework characterizes August, not his personal reflections.
const headingsOnlyToolkit = part(aboutHtml,'<section id="toolkit"','</section>');
const toolkitArticles = [...headingsOnlyToolkit.matchAll(/<article>([\s\S]*?)<\/article>/g)].map(match => match[1].trim());
assert.equal(toolkitArticles.length,10,'Five Skill Set and five Mindset items required');
assert.ok(toolkitArticles.every(article => /^<h3>[^<]+<\/h3>$/.test(article)),'Each Skill Set and Mindset item contains only its H3');
assert.equal((headingsOnlyToolkit.match(/<p(?:\s|>)/g)||[]).length,0,'No descriptions under Skill Set or Mindset');
assert.ok(css.includes('.about-toolkit-list h3 {\n  margin-bottom: 0;\n}'),'Headings-only lists must not retain unused paragraph margin');
const approvedStory = part(aboutHtml,'<section id="story"','</section>');
const approvedPrinciples = part(aboutHtml,'<section id="principles"','</section>');
const approvedLenses = part(aboutHtml,'<section id="personality"','</section>');
assert.equal((approvedStory.match(/<p>/g)||[]).length,5,'Approved story must retain five narrative paragraphs');
assert.ok(approvedStory.includes('I became responsible for a small team'),'User-approved small-team wording missing');
assert.ok(!approvedStory.includes('around 15 people'),'Unapproved team size has returned');
assert.ok(!approvedPrinciples.includes('A few principles I return to when choosing what to build and how to build it.'),'Removed Principles undertext has returned');
assert.ok(approvedPrinciples.includes('Aim high, but start small enough to test the idea.'),'Approved shortened Think big description changed');

assert.ok(approvedPrinciples.includes('Build for commercial success without overlooking people or the planet. All three shape how the business works.'),
  'Approved People, planet & profit copy changed');
assert.ok(css.includes('min-height: 2.2em;'), 'Two-line Principles title alignment is required');

// The Perspectives list must quote each article's actual introduction, not an invented teaser.
const listing = readFileSync(join(root,'perspectives/index.html'),'utf8');
assert.ok(!listing.includes('Read perspective') && !listing.includes('perspective-index-action'),
  'Redundant Read perspective CTA must remain removed');
for(const [title,slug] of [
  ['Rethinking the company','rethinking-the-company'],
  ['Europe at a crossroads','europe-at-a-crossroads']
]) {
  const article = readFileSync(join(root,'perspectives',slug,'index.html'),'utf8');
  const header = article.match(/<div class="article-heading">\s*<h1>([^<]+)<\/h1>\s*<p>([^<]+)<\/p>/);
  assert.ok(header && header[1] === title, 'Article headline/intro missing: '+slug);
  const match = listing.match(new RegExp('<h3 class="perspective-index-title">'+title+'<\\/h3>\\s*<p class="perspective-index-summary">([^<]+)<\\/p>'));
  assert.ok(match && match[1] === header[2], 'Perspective excerpt differs from article text: '+title);
}
assert.ok(css.includes('-webkit-line-clamp: 2;') && css.includes('text-overflow: ellipsis;'),
  'Perspective excerpts must be limited to two lines with ellipsis');

const expectedLenses = [
  ['big-five',"August's Big Five profile suggests someone curious",'organised'],
  ['high5','HIGH5 sees someone who spots the bigger picture','helping people grow'],
  ['via','VIA highlights creativity, perspective','a search for meaning'],
  ['bg5','BG5 calls August an Express Builder','movement and changing surroundings'],
  ['mbti',"In MBTI, August's ENFP type describes someone",'spontaneity'],
  ['enneagram','The Enneagram describes August as a 7w8','Eight wing'],
  ['human-design','Human Design calls August a Manifesting Generator',"not scientific findings"]
];
const lensPanels = [...approvedLenses.matchAll(/<article id="personality-panel-([^"]+)"[\s\S]*?<div class="about-lens-copy">([\s\S]*?)<\/div>\s*<\/article>/g)];
assert.equal(lensPanels.length,7,'All seven Different lenses profiles required');
assert.equal((approvedLenses.match(/class="about-lens-copy"/g)||[]).length,7,'Every lens has one profile copy block');
for(let i=0;i<expectedLenses.length;i++) {
  const [id,opening,marker]=expectedLenses[i];
  assert.equal(lensPanels[i][1],id,'Different lenses order changed: '+id);
  const paragraphs=[...lensPanels[i][2].matchAll(/<p>([^<]*)<\/p>/g)].map(x=>x[1]);
  assert.equal(paragraphs.length,2,'Exactly two report-viewpoint paragraphs required for '+id);
  assert.ok(paragraphs[0].startsWith(opening),'Source-viewpoint opening missing for '+id);
  assert.ok(paragraphs.join(' ').includes(marker),'Source classification missing for '+id);
  assert.ok(paragraphs.every(p=>!/\b(I|me|my|mine|we|our)\b/i.test(p)),
    'Different lenses must not become first-person reflections: '+id);
}
assert.ok(!/I recognise|What resonates|I treat it as|The risk is moving faster than the people around me/i.test(approvedLenses),
  'Old autobiographical Different lenses narration returned');

// The seven lenses must be readable and very close in length, including a literal-letter check.
const profiles=lensPanels.map(([,id,html])=>{
  const paragraphs=[...html.matchAll(/<p>([^<]*)<\/p>/g)].map(m=>m[1]);
  const text=paragraphs.join(' ');
  return {id,text,chars:text.length,letters:(text.match(/[A-Za-z]/g)||[]).length};
});
const spread=xs=>Math.max(...xs)-Math.min(...xs);
assert.ok(spread(profiles.map(p=>p.chars))<=10,
  'Different lenses exceed 10-character length spread: '+JSON.stringify(profiles.map(p=>[p.id,p.chars])));
assert.ok(spread(profiles.map(p=>p.letters))<=10,
  'Different lenses exceed 10-letter length spread: '+JSON.stringify(profiles.map(p=>[p.id,p.letters])));
assert.ok(css.includes('.about-toolkit {\n    gap: var(--section-space);\n  }') &&
  css.includes('.about-toolkit {\n    gap: var(--section-space-mobile);\n  }'),
  'Stacked Skill Set and Mindset must use one homepage section-spacing unit instead of two');
assert.ok(!css.includes('gap: calc(var(--section-space) + var(--section-space));') &&
  !css.includes('gap: calc(var(--section-space-mobile) + var(--section-space-mobile));'),
  'Excessive double section gap returned inside About Skill Set/Mindset');

assert.ok(css.includes(':where(a, button, input, select, textarea):focus-visible'),'Shared interactive focus default missing');
assert.ok(css.includes("width: .405em; height: .405em;")&&css.includes("top: -.105em;"),'August Kring wordmark dot must remain 25 percent smaller than the doubled state while preserving the original lower edge');
assert.ok(!css.includes('.wordmark-i::before'),'August Kring wordmark must not use a white clearing halo behind the red dot');
assert.ok(css.includes("--body-copy-size: 18px;")&&css.includes("--body-reading-size: 18px;")&&css.includes("--card-copy-size: 17px;"),'Mobile reading-size tokens must remain 18px / 17px');
assert.ok(css.includes(".work-card { --venture-copy-size: 17px;"),'Mobile venture copy must use the 17px compact reading size');
assert.ok(css.includes('.about-lens-copy p {\n  margin: 0;\n  color: var(--copy);\n  font-size: var(--body-copy-size);'),'About V7 lens body must inherit 18px reading copy');
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
  const expectedStyles='styles.css?v=20261027-shared-v19';
  assert.ok(page.includes(expectedStyles),'Shared stylesheet drift: '+path);
  assert.ok(page.includes('name="robots" content="noindex,nofollow"'),'Preview indexing protection missing: '+path);
  assert.ok(!page.includes('footer-wordmark'),'Footer branding must stay removed: '+path);
  const footer=part(page,'<footer class="home-footer"','</footer>');
  assert.ok(footer.includes('href="mailto:ak@augustkring.com">ak@augustkring.com</a>'),'Footer must show the actual email address: '+path);
  assert.ok(footer.includes('>Connect on LinkedIn</a>'),'Footer LinkedIn action missing: '+path);
  assert.ok(footer.includes('href="perspectives/#subscribe">Subscribe to Perspectives</a>'),'Footer Perspectives subscription action missing: '+path);
  assert.ok(!footer.includes('>About</a>')&&!footer.includes('>Perspectives</a>'),'Retired footer navigation returned: '+path);
}

console.log('PASS: homepage baseline and About V7 headings-only Skill Set/Mindset with approved Story, Principles and Lenses');
