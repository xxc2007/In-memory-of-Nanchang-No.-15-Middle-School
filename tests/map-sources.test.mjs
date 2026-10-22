import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

function resources() {
  const window = {};
  vm.runInNewContext(readFileSync(new URL('../assets/map-sources.js', import.meta.url), 'utf8'), {window});
  return window.CampusMapSources;
}

test('campus camera round trips through GCJ-02 without losing its geographic position', () => {
  const r = resources(), road = r.providers()[0];
  for (const point of [[115.93216, 28.72078], [115.93181, 28.72068], [115.93269, 28.72046]]) {
    const projected = r.toMap(road, point), restored = r.fromMap(road, projected);
    assert.ok(Math.abs(projected[0] - point[0]) > .001, 'Gaode requires a coordinate shift');
    assert.ok(Math.abs(restored[0] - point[0]) < 1e-8);
    assert.ok(Math.abs(restored[1] - point[1]) < 1e-8);
  }
});

test('satellite sources use unshifted coordinates and distinguish archive publication date', () => {
  const r = resources(), sources = r.providers();
  assert.deepEqual(Array.from(sources, p => p.id), ['gaode', 'esri', 'wayback-2023', 'openfreemap-3d']);
  for (const source of sources.filter(p => p.mode === 'satellite')) {
    assert.deepEqual(Array.from(r.toMap(source, [115.93216, 28.72078])), [115.93216, 28.72078]);
    const style = r.style(source, 'base-3');
    assert.equal(style.sources['base-3'].maxzoom, 19);
    assert.ok(style.sources['base-3'].attribution.includes('Esri'));
    assert.equal(style.layers[1].source, 'base-3');
  }
  assert.equal(sources[2].published, '2023-06-29');
  assert.match(sources[2].tiles[0], /tile\/47963\/\{z\}\/\{y\}\/\{x\}/);
});

test('Tianditu appears only with a valid public key and adds roads, imagery and labels', () => {
  const r = resources();
  assert.equal(r.providers('   ').length, 4);
  assert.equal(r.providers('invalid?&key').length, 4);
  const sources = r.providers('0123456789abcdef0123456789abcdef');
  assert.equal(sources.length, 7);
  for (const source of sources.filter(p=>p.id.startsWith('tianditu-') && p.mode!=='3d')) {
    const style = r.style(source, 'base-8');
    assert.equal(style.layers.length, 3);
    assert.equal(style.layers[2].source, 'base-8-labels');
    assert.match(source.tiles[0], /TILECOL=\{x\}.*TILEROW=\{y\}/);
    assert.equal(r.toMap(source, [115, 28])[0], 115);
  }
  const three=sources.find(p=>p.id==='tianditu-3d');
  assert.ok(three.buildings);
  assert.equal(r.style(three,'three').layers.length,4);
});

test('3D buildings use a real vector dataset and retain imagery and attribution',()=>{
  const r=resources(), source=r.providers().find(p=>p.mode==='3d'), style=r.style(source,'base-9');
  assert.equal(style.sources['base-9-buildings'].type,'vector');
  assert.equal(style.sources['base-9-buildings'].url,'https://tiles.openfreemap.org/planet');
  const buildings=style.layers.find(l=>l.type==='fill-extrusion');
  assert.equal(buildings['source-layer'],'building');
  assert.ok(JSON.stringify(buildings.paint).includes('render_height'));
  assert.match(style.sources['base-9-buildings'].attribution,/OpenStreetMap/);
});

test('official SDK options appear only when both a browser key and a proxy are configured',()=>{
  const r=resources();
  assert.equal(r.providers('',{amap:{key:'0123456789abcdef0123456789abcdef'}}).length,4);
  const configured=r.providers('',{amap:{key:'0123456789abcdef0123456789abcdef',serviceHost:'/_AMapService'}});
  const native=configured.filter(p=>p.engine==='amap');
  assert.deepEqual(Array.from(native,p=>p.mode),['road','satellite','3d']);
  assert.ok(native.every(p=>p.crs==='gcj02'));
  assert.ok(native.every(p=>!('securityCode' in p.config)));
});

test('Tencent SDK providers require a valid public key and preserve campus coordinate alignment',()=>{
  const r=resources();
  assert.equal(r.providers('',{tencent:{key:'invalid'}}).length,4);
  const options=r.providers('',{tencent:{key:'ABCDE-12345-ABCDE-12345-ABCDE-12345'}}).filter(p=>p.engine==='tencent');
  assert.deepEqual(Array.from(options,p=>p.mode),['road','satellite','3d']);
  for(const p of options) {
    const source=[115.93216,28.72078], restored=r.fromMap(p,r.toMap(p,source));
    assert.ok(Math.abs(restored[0]-source[0])<1e-7 && Math.abs(restored[1]-source[1])<1e-7);
  }
});
