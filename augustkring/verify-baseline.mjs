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
const approved={"main":"249509e8","footer":"7bea4e97","tokens":"3fe414f6","contact":"c102b368"};
const actual={
 main:digest(part(html,'<main','</main>')),
 footer:digest(part(html,'<footer','</footer>')),
 tokens:digest(part(css,':root {','\n}')),
 contact:digest(part(css,'/* Homepage closing note:','.home-footer {\n  padding: 34px'))
};
for(const [key,val] of Object.entries(approved))assert.equal(actual[key],val,'Approved homepage/CSS changed: '+key);
assert.ok(css.includes('grid-template-columns: var(--contact-columns);'),'Approved two-group close missing');
assert.ok(css.includes('@media (max-width: 760px) {\n  .homepage-contact-content'),'Contact mobile stacking missing');
for(const path of ['index.html','about/index.html','perspectives/index.html','perspectives/rethinking-the-company/index.html','perspectives/europe-at-a-crossroads/index.html','privacy/index.html','unsubscribe/index.html']){
 const page=readFileSync(join(root,path),'utf8');
 assert.ok(page.includes('styles.css?v=20261011-unified-v1'),'Shared stylesheet drift: '+path);
 assert.ok(page.includes('name="robots" content="noindex,nofollow"'),'Preview indexing protection missing: '+path);
 assert.ok(!page.includes('footer-wordmark'),'Footer branding must stay removed: '+path);
}
console.log('PASS: protected homepage, unified footers, shared fonts and preview metadata');
