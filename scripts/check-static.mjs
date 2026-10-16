import {readFileSync,existsSync} from 'node:fs';
import {resolve,sep} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..');let references=0;
for(const lang of ['','en','zh-Hant','ja','ko','ru','es','fr','pt','ar']) {
  const path=resolve(root,lang,'index.html');const html=readFileSync(path,'utf8');
  assert.equal((html.match(/assets\/map-loader\.js/g)||[]).length,1);
  assert.ok(!html.includes('maplibre-gl.js'));
  const base='https://test.invalid/nc15/'+(lang?lang+'/':'');
  for(const match of html.matchAll(/(src|href)="([^"#]+)"/g)) {
    if(/^[a-z]+:/i.test(match[2])||match[2].startsWith('//'))continue;
    const url=new URL(match[2],base);
    if(!url.pathname.startsWith('/nc15/')) {assert.equal(match[1],'href','Only navigation may leave the site namespace');continue;}
    const resource=resolve(root,decodeURIComponent(url.pathname.slice('/nc15/'.length)));
    assert.ok(resource===root||resource.startsWith(root+sep),'Resource leaves repository');
    assert.ok(existsSync(resource),lang+': '+match[2]);references++;
  }
}
assert.ok(references>100);console.log('10 language pages:',references,'local resources resolve');
