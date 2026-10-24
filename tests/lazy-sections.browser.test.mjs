import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {pathToFileURL} from 'node:url';

// Opt-in: uses an existing Playwright installation and Chrome; installs nothing.
const modulePath=process.env.PLAYWRIGHT_MODULE;
test('real browser: lazy tour, navigation, wall refresh race, and no-JS fallback',
  {skip:!modulePath,timeout:90000}, async()=>{
  const {chromium}=await import(pathToFileURL(resolve(modulePath,'index.mjs')).href);
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const root=resolve(import.meta.dirname,'..');
  const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.avif':'image/avif','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2'};
  try {
    for(const width of [1280,390]){
      const context=await browser.newContext({viewport:{width,height:800},reducedMotion:'reduce',hasTouch:true});
      const page=await context.newPage();const errors=[],gets=[],writes=[],requests=[];let heldFirst=null;
      page.on('request',request=>requests.push(request.url()));
      page.on('pageerror',e=>errors.push(e.message));
      await page.route('**/*',async route=>{
        const url=new URL(route.request().url());
        if(url.pathname==='/comment/api/v2/comments'){
          if(route.request().method()==='POST'){writes.push(url.href);return route.fulfill({json:{id:1}});}
          gets.push(url.href);
          if(gets.length===1){heldFirst=route;return;}
          return route.fulfill({json:{comments:[],total:1}});
        }
        if(url.hostname!=='memorial.test'||url.pathname.includes('/maplibre/'))return route.abort();
        let path=resolve(root,decodeURIComponent(url.pathname.replace(/^\/nc15\//,''))||'.');
        if(url.pathname.endsWith('/'))path=resolve(path,'index.html');
        if(!path.startsWith(root+sep))return route.abort();
        try{return route.fulfill({body:await readFile(path),contentType:mime[extname(path)]||'application/octet-stream'});}catch{return route.fulfill({status:404,body:''});}
      });
      await page.goto('https://memorial.test/nc15/',{waitUntil:'load'});
      assert.equal(await page.locator('img.slide[src]').count(),0,'first screen must not fetch tour images');
      assert.equal(requests.some(url=>/assets\/(map|wall)\.js/.test(url)),false,'first screen must not fetch section interactions');
      const hero=page.locator('.hero-img-wrap img');
      assert.equal(await hero.evaluate(img=>img.complete&&img.naturalWidth>0),true);
      assert.ok((await hero.evaluate(img=>img.currentSrc)).endsWith(width<601?'18-plaza-summer-800.avif':'18-plaza-summer.avif'));
      await page.locator('.ph-img img').first().scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>{const img=document.querySelector('.ph-img img');return img.complete&&img.naturalWidth>0;});
      assert.ok((await page.locator('.ph-img img').first().evaluate(img=>img.currentSrc)).endsWith('.avif'));
      const photoBox=await page.locator('.ph-img img').first().boundingBox();
      assert.ok(photoBox.width>100&&photoBox.height>100,'picture wrapper preserves photo layout');
      assert.equal(gets.length,0,'first screen must not fetch comments');
      await page.locator('#tourViewer').scrollIntoViewIfNeeded();
      await page.waitForFunction(()=>document.querySelectorAll('img.slide[src]').length===3);
      assert.equal(await page.locator('img.slide[src]').count(),3,'only current and two neighbours');
      assert.equal(await page.locator('img.slide.on').evaluate(img=>img.complete&&img.naturalWidth>0),true);
      await page.locator('#tourDots').scrollIntoViewIfNeeded();
      for(const input of ['mouse','touch']){
        for(let i=0;i<8;i++){
          const box=await page.locator('#tourDots button').nth(i).boundingBox();
          const point={x:box.x+box.width/2,y:box.y+box.height/2};
          assert.equal(await page.evaluate(({x,y,i})=>document.elementFromPoint(x,y)===document.querySelectorAll('#tourDots button')[i],{...point,i}),true,`${width}px ${input} dot ${i+1} centre must hit itself`);
          if(input==='mouse')await page.mouse.click(point.x,point.y);else await page.touchscreen.tap(point.x,point.y);
          assert.equal(await page.locator('#tourNum').textContent(),`${i+1} / 8`);
        }
      }
      await page.locator('#tourDots button').first().click();
      await page.waitForFunction(()=>document.querySelectorAll('img.slide')[0].complete&&document.querySelectorAll('img.slide')[0].naturalWidth>0);
      await page.locator('#tourPrev').click();
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('#tourNum').textContent(),'1 / 8');
      await page.locator('a[href="#wall"]').first().click();
      await page.waitForFunction(()=>document.querySelector('#wall').getBoundingClientRect().top<innerHeight);
      await page.locator('#cmtNick').fill('browser-test');await page.locator('#cmtInput').fill('local route interception only');
      await page.locator('#cmtSubmit').click();
      await page.waitForFunction(()=>document.querySelector('#cmtInput').value==='');
      assert.equal(gets.length,1,'pending list GET must be shared until it ends');assert.equal(writes.length,1);
      await heldFirst.fulfill({json:{comments:[],total:0}});
      await page.waitForFunction(()=>document.querySelector('#cmtTotal').textContent==='1');
      assert.equal(gets.length,2,'write completion must cause a fresh list read');
      assert.deepEqual(errors,[]);
      console.log(JSON.stringify({width,initialTourImages:0,initialCommentRequests:0,tourImagesAfterVisit:3,listGetsWithWrite:gets.length,errors}));
      await context.close();
    }
    const context=await browser.newContext({javaScriptEnabled:false});
    const page=await context.newPage();
    await page.route('**/*',async route=>{
      const url=new URL(route.request().url());if(url.hostname!=='memorial.test')return route.abort();
      let path=resolve(root,url.pathname.replace(/^\/nc15\//,'')||'.');if(url.pathname.endsWith('/'))path=resolve(path,'index.html');
      if(!path.startsWith(root+sep))return route.abort();
      try{return route.fulfill({body:await readFile(path),contentType:mime[extname(path)]||'application/octet-stream'});}catch{return route.abort();}
    });
    await page.goto('https://memorial.test/nc15/');
    assert.ok(await page.locator('#gallery a[href*="images/full/"]').count()>0);
    assert.equal(await page.locator('a[href="#wall"]').first().isVisible(),true);
    assert.equal(await page.locator('noscript').count()>0,true);
    await context.close();
  } finally {await browser.close();}
});
