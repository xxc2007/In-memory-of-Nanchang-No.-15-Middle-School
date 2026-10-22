import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
test('all language pages load the common map loader from the correct directory',()=>{for(const lang of ['','en','zh-Hant','ja','ko','ru','es','fr','pt','ar']){const html=readFileSync(new URL('../'+(lang?lang+'/':'')+'index.html',import.meta.url),'utf8');assert.ok(html.includes('src="'+(lang?'../':'')+'assets/map-loader.js?v='));assert.ok(!html.includes('maplibre-gl.js'));}});
test('lazy map module cache versions match the shipped source files',()=>{
  const loader=readFileSync(new URL('../assets/map-loader.js',import.meta.url),'utf8');
  for(const path of ['assets/map-sources.js','assets/map-controls.js','assets/map-native.js']){
    const hash=createHash('sha256').update(readFileSync(new URL('../'+path,import.meta.url))).digest('hex').slice(0,8);
    assert.ok(loader.includes(path+'?v='+hash),path+' has a stale immutable URL');
  }
});
test('all language pages share the configured browser Tianditu key',()=>{
  const keys=['','en','zh-Hant','ja','ko','ru','es','fr','pt','ar'].map(lang=>{
    const html=readFileSync(new URL('../'+(lang?lang+'/':'')+'index.html',import.meta.url),'utf8');
    return html.match(/id="campusMap" data-tianditu-key="([a-f0-9]{32})"/)?.[1];
  });
  assert.ok(keys[0],'browser key is configured');
  assert.ok(keys.every(key=>key===keys[0]),'each locale must use the same application');
});
