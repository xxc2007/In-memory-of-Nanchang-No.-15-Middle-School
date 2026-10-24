import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const source=readFileSync(new URL('../assets/section-loader.js',import.meta.url),'utf8');
function harness({observer=true,hash=''}={}) {
  const requests=[],observers=[],handlers={};
  const window={addEventListener(event,fn){handlers[event]=fn;}};
  if(observer)window.IntersectionObserver=function(fn){this.observe=node=>observers.push({fn,node});this.disconnect=()=>{};};
  const location={hash};
  vm.runInNewContext(source,{window,IntersectionObserver:window.IntersectionObserver,location,URL,document:{currentScript:{src:'https://example.test/nc15/assets/section-loader.js'},getElementById:id=>({id}),createElement:()=>({}),head:{appendChild(script){requests.push(script.src);}}}});
  return {requests,observers,hash(value){location.hash=value;handlers.hashchange();}};
}
test('section loader defers scripts, deduplicates observer signals, and accepts hash entry',()=>{
  const h=harness();assert.equal(h.requests.length,0);
  h.observers[0].fn([{isIntersecting:true}]);h.observers[0].fn([{isIntersecting:true}]);
  assert.equal(h.requests.length,1);assert.ok(h.requests[0].includes('/nc15/assets/map.js?v='));
  h.hash('#wall');assert.equal(h.requests.length,2);
  h.hash('#wall');assert.equal(h.requests.length,2);
  assert.equal(harness({hash:'#wall'}).requests.length,1);
  assert.equal(harness({observer:false}).requests.length,2);
});
test('section loader immutable module URLs match source contents',()=>{
  for(const path of ['assets/map.js','assets/wall.js']) {
    const hash=createHash('sha256').update(readFileSync(new URL('../'+path,import.meta.url))).digest('hex').slice(0,8);
    assert.ok(source.includes(path+'?v='+hash));
  }
});
test('all locales retain JPEG originals and use existing AVIF picture sources',()=>{
  for(const locale of ['','en','zh-Hant','ja','ko','ru','es','fr','pt','ar']) {
    const base=new URL('../'+(locale?locale+'/':''),import.meta.url);
    const html=readFileSync(new URL('index.html',base),'utf8');
    assert.ok(html.includes('assets/section-loader.js?v='));
    assert.ok(!/<script[^>]+assets\/(map|wall)\.js/.test(html));
    const pictures=[...html.matchAll(/<source[^>]+srcset="([^"]+\.avif)"/g)];
    assert.equal(pictures.length,29);
    for(const [,path] of pictures)assert.ok(existsSync(new URL(path,base)),path);
    assert.equal((html.match(/href="[^"]*images\/full\/[^"]+\.jpg"/g)||[]).length,27);
  }
});
