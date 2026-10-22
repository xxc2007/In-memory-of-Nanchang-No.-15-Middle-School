import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {createMapPreviewServer} from '../tools/map-preview.mjs';

async function server(t,fetchImpl) {
  const app=createMapPreviewServer({root:resolve(import.meta.dirname,'..'),
    config:{amap:{key:'public-browser-key',securityCode:'private-test-value'},tencent:{key:'public-tencent-key'}},fetchImpl});
  await new Promise(r=>app.listen(0,'127.0.0.1',r));
  t.after(()=>new Promise(r=>app.close(r)));
  return 'http://127.0.0.1:'+app.address().port;
}

test('runtime configuration contains the public key and proxy path, never the security code',async t=>{
  const base=await server(t);
  const response=await fetch(base+'/map-runtime.json');const body=await response.text();
  assert.equal(response.headers.get('cache-control'),'no-store');
  assert.deepEqual(JSON.parse(body),{amap:{key:'public-browser-key',serviceHost:'/_AMapService'},tencent:{key:'public-tencent-key'}});
  assert.ok(!body.includes('private-test-value'));
  for(const path of ['/.map-dev.env','/.git/config','/%2e%2e/.map-dev.env']) {
    assert.equal((await fetch(base+path)).status,404,path);
  }
});

test('proxy fixes the upstream destination and injects credentials only server-side',async t=>{
  let request;
  const base=await server(t,async(url,options)=>{request={url:new URL(url),options};return new Response('map data',{'headers':{'content-type':'application/json'}});});
  assert.equal(await (await fetch(base+'/_AMapService/v3/vectormap?key=other&jscode=other&x=1')).text(),'map data');
  assert.equal(request.url.hostname,'fmap01.amap.com');
  assert.equal(request.url.searchParams.get('key'),'public-browser-key');
  assert.equal(request.url.searchParams.get('jscode'),'private-test-value');
  assert.equal(request.url.searchParams.get('x'),'1');
  assert.equal(request.options.redirect,'error');
  assert.equal((await fetch(base+'/_AMapService//untrusted.example/')).status,400);
  assert.equal((await fetch(base+'/_AMapService/v3/vectormap',{headers:{Origin:'https://untrusted.example'}})).status,403);
});

test('vendor errors cannot echo the security code back to the browser',async t=>{
  const base=await server(t,async()=>new Response('error private-test-value'));
  const response=await fetch(base+'/_AMapService/v4/map/styles');
  assert.equal(response.status,502);
  assert.ok(!(await response.text()).includes('private-test-value'));
});

test('production subpath returns a matching same-origin proxy path',async t=>{
  const app=createMapPreviewServer({root:resolve(import.meta.dirname,'..'),basePath:'/nc15',config:{amap:{key:'public',securityCode:'private'}}});
  await new Promise(r=>app.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.close(r)));
  const base='http://127.0.0.1:'+app.address().port;
  const result=await (await fetch(base+'/nc15/map-runtime.json')).json();
  assert.equal(result.amap.serviceHost,'/nc15/_AMapService');
  assert.equal((await fetch(base+'/map-runtime.json')).status,404);
  assert.equal((await fetch(base+'/nc15/.map-dev.env')).status,404);
});
