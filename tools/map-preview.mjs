// Local preview with a same-origin AMap security proxy. Never serves secrets.
import {createServer} from 'node:http';
import {readFile,realpath} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

export function createMapPreviewServer({root,config={},fetchImpl=fetch,basePath=''}) {
  const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml'};
  return createServer(async(req,res)=>{
    res.setHeader('Cache-Control','no-store');
    const fail=(status,text)=>{res.writeHead(status,{'Content-Type':'text/plain; charset=utf-8'});res.end(text);};
    if(!['GET','HEAD'].includes(req.method))return fail(405,'Method not allowed');
    const url=new URL(req.url,'http://127.0.0.1');
    if(basePath) {
      if(!url.pathname.startsWith(basePath+'/'))return fail(404,'Not found');
      url.pathname=url.pathname.slice(basePath.length);
    }
    if(url.pathname==='/map-runtime.json') {
      const amap=config.amap?.key&&config.amap?.securityCode?{key:config.amap.key,serviceHost:basePath+'/_AMapService'}:undefined;
      const tencent=config.tencent?.key?{key:config.tencent.key}:undefined;
      res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({amap,tencent}));
    }
    if(url.pathname.startsWith('/_AMapService/')) {
      if(!config.amap?.key||!config.amap?.securityCode)return fail(503,'Map proxy is not configured');
      if(req.headers.origin && req.headers.origin!=='http://'+req.headers.host)return fail(403,'Origin not allowed');
      const path=url.pathname.slice('/_AMapService'.length);
      const host=path.startsWith('/v4/map/styles')?'webapi.amap.com':path.startsWith('/v3/vectormap')?'fmap01.amap.com':'restapi.amap.com';
      const upstream=new URL(path,'https://'+host);
      if(upstream.hostname!==host)return fail(400,'Invalid proxy path');
      upstream.search=url.search;
      upstream.searchParams.set('key',config.amap.key);
      upstream.searchParams.set('jscode',config.amap.securityCode);
      try {
        const response=await fetchImpl(upstream,{redirect:'error',signal:AbortSignal.timeout(20000),headers:{Referer:'http://'+req.headers.host+'/'}});
        const body=Buffer.from(await response.arrayBuffer());
        // A security-code echo in a vendor error must never reach the client.
        if(body.includes(Buffer.from(config.amap.securityCode)))return fail(502,'Map service returned an invalid response');
        res.writeHead(response.status,{'Content-Type':response.headers.get('content-type')||'application/octet-stream'});
        return res.end(req.method==='HEAD'?undefined:body);
      } catch {return fail(502,'Map service unavailable');}
    }
    let pathname;
    try{pathname=decodeURIComponent(url.pathname);}catch{return fail(400,'Invalid path');}
    if(pathname.split('/').some(p=>p.startsWith('.')))return fail(404,'Not found');
    let file=resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));
    try {
      file=await realpath(file);
      if(!file.startsWith(root+sep))return fail(404,'Not found');
      const body=await readFile(file);
      res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});
      res.end(req.method==='HEAD'?undefined:body);
    } catch {fail(404,'Not found');}
  });
}

if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const root=resolve(import.meta.dirname,'..');
  const env=resolve(root,'.map-dev.env');if(existsSync(env))process.loadEnvFile(env);
  const config={amap:{key:process.env.AMAP_BROWSER_KEY,securityCode:process.env.AMAP_SECURITY_CODE},tencent:{key:process.env.TENCENT_BROWSER_KEY}};
  const server=createMapPreviewServer({root,config});
  server.listen(4176,'127.0.0.1',()=>console.log('Map preview: http://127.0.0.1:4176/#map'));
}
