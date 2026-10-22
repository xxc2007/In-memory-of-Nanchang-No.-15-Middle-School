import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

function harness(lang = 'zh-CN', key = '', native = false) {
  const ids = new Map(), timers = new Map(); let timerId = 0;
  function element(tag = 'DIV') {
    const attrs = {}, events = {}, classes = new Set();
    const n = {tagName:tag.toUpperCase(), children:[], style:{}, hidden:false,
      classList:{toggle(c,on){if(on)classes.add(c);else classes.delete(c);},contains(c){return classes.has(c);}},
      setAttribute(k,v){attrs[k]=String(v);},getAttribute(k){return attrs[k] ?? null;},removeAttribute(k){delete attrs[k];},
      addEventListener(k,fn){(events[k] ||= []).push(fn);},
      fire(k,event={}){for(const fn of events[k] || [])fn(event);},
      appendChild(child){child.parentNode=this;this.children.push(child);return child;},
      insertBefore(child,ref){child.parentNode=this;const i=this.children.indexOf(ref);this.children.splice(i<0?this.children.length:i,0,child);},
      remove(){const i=this.parentNode.children.indexOf(this);this.parentNode.children.splice(i,1);},
      contains(child){return child===this || this.children.some(n=>n.contains(child));},
      querySelector(){return null;},querySelectorAll(){return [];},
      getBoundingClientRect(){return {top:0,bottom:420};}
    };
    Object.defineProperty(n,'textContent',{get(){return n.text||'';},set(v){n.text=v;n.children=[];}});
    Object.defineProperty(n,'nextSibling',{get(){const siblings=n.parentNode?.children||[];return siblings[siblings.indexOf(n)+1]||null;}});
    Object.defineProperty(n,'id',{get(){return n._id;},set(v){n._id=v;ids.set(v,n);}});
    return n;
  }
  const section = element(), container = element(), el = element();
  el.id='campusMap';if(key)el.setAttribute('data-tianditu-key',key);
  section.appendChild(container);container.appendChild(el);
  const document = {documentElement:{lang},currentScript:{src:'https://example.test/nc15/assets/map.js'},
    body:element(),createElement:element,getElementById:id=>ids.get(id)||null,addEventListener(){}};
  const markers = [];
  class MapView {
    constructor(options){this.options=options;this.center=options.center;this.zoom=options.zoom;this.style=options.style;this.events={};}
    on(k,fn){(this.events[k] ||= []).push(fn);}
    fire(k,e={}){for(const fn of this.events[k]||[])fn(e);}
    addControl(){} stop(){} resize(){}
    getCenter(){return {lng:this.center[0],lat:this.center[1]};} getZoom(){return this.zoom;}
    getBearing(){return this.bearing||0;} getPitch(){return this.pitch||0;}
    setStyle(style){this.style=style;}
    jumpTo(opts){this.center=opts.center;this.zoom=opts.zoom;this.pitch=opts.pitch||0;this.bearing=opts.bearing||0;}
    flyTo(opts){this.jumpTo(opts);} easeTo(opts){this.jumpTo(opts);}
    isSourceLoaded(){return true;} areTilesLoaded(){return true;}
  }
  class Marker {
    constructor(options){this.el=options.element;markers.push(this);}
    setLngLat(point){this.point=point;return this;} addTo(){return this;}
  }
  const window = {matchMedia:()=>({matches:true}),addEventListener(){}};
  const nativeSessions = [];
  if(native){
    window.CampusNativeConfig={amap:{key:'0123456789abcdef0123456789abcdef',serviceHost:'/_AMapService'}};
    window.CampusNativeMaps={mount(host,provider,camera,spots,onPick,ready,failed){
      const session={provider,ready,failed,onPick,destroyed:false,
        camera(){return camera;},select(){},home(){},
        focus(spot){camera={geographic:[spot.lng,spot.lat],zoom:17.3};},
        destroy(){this.destroyed=true;}};
      nativeSessions.push(session);return session;
    }};
  }
  const context = {window,document,location:{pathname:'/nc15/'},
    maplibregl:{Map:MapView,Marker,AttributionControl:class{},NavigationControl:class{}},
    setTimeout(fn){const id=++timerId;timers.set(id,fn);return id;},clearTimeout(id){timers.delete(id);}};
  const ctx=vm.createContext(context);
  for(const file of ['map-sources.js','map-controls.js','map.js']) {
    vm.runInContext(readFileSync(new URL('../assets/'+file,import.meta.url),'utf8'),ctx);
  }
  const map=window.__campusMap;
  assert.ok(map,'map initialized');
  return {window,map,el,markers,section,ids,nativeSessions,
    mode(mode){section.children.find(n=>n.className==='map-toolbar').children[0].children.find(n=>n.getAttribute('data-map-mode')===mode).fire('click');},
    source(id){const select=ids.get('campusMapSource');select.value=id;select.fire('change');},
    tile(sourceId){map.fire('sourcedata',{sourceId,tile:{state:'loaded'}});},
    timeout(){for(const fn of Array.from(timers.values()))fn();},
    retry(){section.children.find(n=>n.className==='map-feedback').children[1].fire('click');}
  };
}

test('switching sources preserves the real campus center and selected photo marker',()=>{
  const h=harness(), r=h.window.CampusMapSources, providers=r.providers();
  h.markers[2].el.fire('click',{stopPropagation(){}});
  const before=r.fromMap(providers[0],h.map.center), zoom=h.map.zoom;
  h.mode('satellite');
  assert.equal(h.el.getAttribute('data-map-provider'),'esri');
  assert.ok(Math.abs(h.map.center[0]-before[0])<1e-8);
  assert.equal(h.map.zoom,zoom);
  assert.equal(h.markers[2].point[0],115.93193);
  assert.ok(h.markers[2].el.classList.contains('on'));
  h.source('wayback-2023');h.mode('road');h.mode('satellite');
  assert.equal(h.el.getAttribute('data-map-provider'),'wayback-2023','mode remembers its source');
  assert.ok(Math.abs(h.map.center[0]-before[0])<1e-8);
  h.markers[5].el.fire('click',{stopPropagation(){}});
  assert.equal(h.map.center[0],115.93269,'photo navigation uses the active source coordinate system');
});

test('old source responses cannot mark a new source ready or failed; timeout supports retry and recovery',()=>{
  const h=harness();h.mode('satellite');
  h.tile('base-0');
  for(let i=0;i<4;i++)h.map.fire('error',{sourceId:'base-0'});
  assert.equal(h.el.getAttribute('data-map-state'),'loading');
  h.timeout();assert.equal(h.el.getAttribute('data-map-state'),'failed');
  h.retry();assert.equal(h.el.getAttribute('data-map-state'),'loading');
  h.tile('base-1');assert.equal(h.el.getAttribute('data-map-state'),'loading');
  h.tile('base-2');assert.equal(h.el.getAttribute('data-map-state'),'ready');
  h.mode('road');assert.equal(h.el.getAttribute('data-map-provider'),'gaode');
  assert.equal(h.markers.length,8,'switching does not duplicate photo markers');
});

test('MapLibre 6 raster events load without sourceDataType; errored tiles never signal success',()=>{
  const h=harness();
  h.map.fire('sourcedata',{sourceId:'base-0',tile:{state:'errored'}});
  assert.equal(h.el.getAttribute('data-map-state'),'loading');
  h.tile('base-0');
  assert.equal(h.el.getAttribute('data-map-state'),'ready');
});

test('partially loaded maps report tile failures instead of claiming full success',()=>{
  const h=harness();h.tile('base-0');
  h.map.fire('error',{sourceId:'base-0'});
  h.tile('base-0');h.map.fire('idle');
  assert.equal(h.el.getAttribute('data-map-state'),'failed');
});

test('all ten languages expose translated controls and explain historical publication dates',()=>{
  for(const lang of ['zh-CN','zh-Hant','en','ja','ko','ru','es','fr','pt','ar']){
    const h=harness(lang);h.mode('satellite');h.source('wayback-2023');
    const note=h.section.children.find(n=>n.className==='map-source-note');
    assert.match(note.textContent,/2023-06-29/);
    assert.equal(h.ids.get('campusMapSource').children.length,2);
  }
});

test('a configured Tianditu key exposes both modes and moves markers back to unshifted coordinates',()=>{
  const h=harness('zh-CN','0123456789abcdef0123456789abcdef');
  h.source('tianditu-road');assert.equal(h.markers[0].point[0],115.93292);
  assert.ok(h.map.style.sources['base-1-labels']);
  h.mode('satellite');h.source('tianditu-satellite');
  assert.equal(h.el.getAttribute('data-map-provider'),'tianditu-satellite');
});

test('3D switches preserve location, show an honest model note, and wait for both imagery and buildings',()=>{
  const h=harness();h.mode('3d');
  assert.equal(h.map.getPitch(),55);
  assert.equal(h.el.getAttribute('data-map-provider'),'openfreemap-3d');
  assert.ok(Math.abs(h.map.center[0]-115.93216)<1e-8);
  h.tile('base-1');h.map.fire('idle');
  assert.equal(h.el.getAttribute('data-map-state'),'loading','vector data must load too');
  h.tile('base-1-buildings');assert.equal(h.el.getAttribute('data-map-state'),'ready');
  const note=h.section.children.find(n=>n.className==='map-source-note');
  assert.match(note.textContent,/估计值/);
  h.mode('satellite');assert.equal(h.map.getPitch(),0);
});

test('Tianditu does not claim readiness before labels have loaded',()=>{
  const h=harness('zh-CN','0123456789abcdef0123456789abcdef');h.source('tianditu-road');
  h.tile('base-1');h.map.fire('idle');
  assert.equal(h.el.getAttribute('data-map-state'),'loading');
  h.tile('base-1-labels');assert.equal(h.el.getAttribute('data-map-state'),'ready');
});

test('native SDK switching preserves photo navigation and ignores completions after switching away',()=>{
  const h=harness('zh-CN','',true);
  h.source('amap-road');
  assert.equal(h.el.getAttribute('data-map-engine'),'amap');
  assert.equal(h.el.getAttribute('data-map-state'),'loading');
  const native=h.nativeSessions[0];native.ready();
  assert.equal(h.el.getAttribute('data-map-state'),'ready');
  native.onPick(5);
  h.mode('satellite');
  assert.equal(h.el.getAttribute('data-map-provider'),'amap-satellite');
  h.source('esri');
  assert.equal(native.destroyed,true);
  assert.equal(h.window.__campusNativeFocus,null);
  assert.equal(h.map.center[0],115.93269);
  assert.equal(h.el.getAttribute('data-map-engine'),null);
  native.ready();native.failed();
  assert.equal(h.el.getAttribute('data-map-state'),'loading');
  h.tile('base-3');assert.equal(h.el.getAttribute('data-map-state'),'ready');
});

test('all three modes initially use official AMap when runtime configuration is present',()=>{
  const h=harness('zh-CN','',true);
  assert.equal(h.el.getAttribute('data-map-provider'),'amap-road');
  h.mode('satellite');assert.equal(h.el.getAttribute('data-map-provider'),'amap-satellite');
  h.mode('3d');assert.equal(h.el.getAttribute('data-map-provider'),'amap-3d');
  h.mode('road');assert.equal(h.el.getAttribute('data-map-provider'),'amap-road');
});
