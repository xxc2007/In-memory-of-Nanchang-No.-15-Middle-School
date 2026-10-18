import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

function harness(file, {hash = '', observer = true} = {}) {
  const requests = [], observers = [], ids = new Map(), handlers = {};
  function node(tag = 'DIV') {
    const attrs = {}, events = {};
    return {tagName:tag, children:[], style:{}, value:'', hidden:true,
      classList:{toggle(){},contains(){return false;}},
      addEventListener(k,fn){(events[k] ||= []).push(fn);},
      emit(k,e={}){return Promise.all((events[k] || []).map(fn=>fn.call(this,e)));},
      setAttribute(k,v){attrs[k]=v;},getAttribute(k){return attrs[k] ?? null;},removeAttribute(k){delete attrs[k];},
      appendChild(n){this.children.push(n);},insertBefore(n){this.children.push(n);},
      querySelector(){return null;},querySelectorAll(){return this.children;},
      getBoundingClientRect(){return {top:10000,bottom:11000};},
      set src(v){attrs.src=v;requests.push(v);},get src(){return attrs.src;}, focus(){},
    };
  }
  const document = {documentElement:{lang:'zh-CN'},currentScript:{src:'https://example.test/nc15/assets/map.js'},
    body:node(),createElement:tag=>node(tag.toUpperCase()),
    getElementById(id){if(id==='campusMap'||id==='langMenu')return null;if(!ids.has(id))ids.set(id,node());return ids.get(id);},
    addEventListener(k,fn){(handlers[k] ||= []).push(fn);},
    removeEventListener(k,fn){handlers[k]=(handlers[k]||[]).filter(x=>x!==fn);},
  };
  const window = {matchMedia:()=>({matches:false}),addEventListener:document.addEventListener,removeEventListener(){}};
  if(observer) window.IntersectionObserver = function(fn,opts){this.observe=el=>observers.push({el,fn,opts});this.disconnect=()=>{};};
  const pending = [];
  const context = {window,document,location:{hostname:'example.test',pathname:'/nc15/',hash,origin:'https://example.test'},
    innerHeight:800,localStorage:{getItem(){return null;}},setTimeout,clearTimeout,AbortController,
    fetch(url,opts){let resolve;const promise=new Promise(r=>resolve=r);pending.push({url,opts,resolve(data){resolve({ok:true,status:200,text:()=>Promise.resolve(JSON.stringify(data))});}});return promise;},
    IntersectionObserver:window.IntersectionObserver,
  };
  vm.runInNewContext(readFileSync(new URL('../assets/'+file,import.meta.url),'utf8'),context);
  return {ids,requests,pending,observers,handlers,
    near(id){const o=observers.find(x=>x.el===ids.get(id));assert.ok(o,'observer for '+id);o.fn([{isIntersecting:true}]);},
    fire(k,e){for(const fn of handlers[k]||[])fn(e);},
  };
}
const flush = () => new Promise(r=>setImmediate(r));

test('tour defers every full image; current success warms only adjacent frames',()=>{
  const h=harness('map.js');
  assert.equal(h.requests.length,0);
  h.near('tourViewer');
  assert.equal(h.requests.length,1);
  const slides=h.ids.get('tourViewer').children;
  slides[4].emit('load');
  assert.equal(h.requests.length,3);
  h.ids.get('tourDots').children[0].emit('click');
  assert.equal(h.requests.length,4);
  slides[4].emit('load');
  assert.equal(h.requests.length,4,'stale load must not prefetch obsolete neighbours');
  slides[0].emit('load');
  assert.equal(h.requests.length,6);
});

test('direct tour selection loads immediately, and no observer still works',()=>{
  const h=harness('map.js',{observer:false});
  assert.ok(h.requests.length>=1);
  h.ids.get('tourDots').children[0].emit('click');
  assert.ok(h.ids.get('tourViewer').children[0].src);
});

test('wall waits for proximity; concurrent retries share a GET',async()=>{
  const h=harness('wall.js');
  assert.equal(h.pending.length,0);
  h.near('wall');
  const loading=h.ids.get('cmtLoading');loading.setAttribute('data-failed','1');loading.emit('click');
  assert.equal(h.pending.length,1);
  h.pending[0].resolve({comments:[],total:0});await flush();
  assert.equal(loading.hidden,true);
});

test('wall direct hash and no observer initialize without a scroll',()=>{
  for(const options of [{hash:'#wall'},{observer:false}]){
    const h=harness('wall.js',options);assert.equal(h.pending.length,1);h.pending[0].resolve({comments:[]});
  }
});

test('posting while an old GET is pending queues a fresh GET after it',async()=>{
  const h=harness('wall.js',{hash:'#wall'});
  h.ids.get('cmtInput').value='test';h.ids.get('cmtNick').value='visitor';
  h.ids.get('cmtSubmit').emit('click');assert.equal(h.pending.length,2);
  h.pending[1].resolve({id:1});await flush();
  assert.equal(h.pending.length,2,'do not overlap list requests');
  h.pending[0].resolve({comments:[],total:0});await flush();
  assert.equal(h.pending.length,3,'write must trigger a post-write list request');
  assert.equal(h.pending[2].opts.cache,'no-store','fresh list must not reuse the browser HTTP cache');
  h.pending[2].resolve({comments:[],total:1});await flush();
  assert.equal(h.ids.get('cmtTotal').textContent,1);
});
