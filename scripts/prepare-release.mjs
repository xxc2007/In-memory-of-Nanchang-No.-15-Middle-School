// Run before committing; CI and deployment use --check to reject stale immutable URLs.
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resourceBytes} from './resource-bytes.mjs';
const files=execFileSync('git',['ls-files','--cached','--others','--exclude-standard'],{encoding:'utf8'}).trim().split('\n');
// Lazy modules have immutable caching too; version them before hashing the loader.
const loaderPath='assets/map-loader.js';const oldLoader=readFileSync(loaderPath,'utf8');let loader=oldLoader;
for(const path of ['assets/map-sources.js','assets/map-controls.js','assets/map-native.js']) {
  const moduleVersion=createHash('sha256').update(resourceBytes(path)).digest('hex').slice(0,8);
  loader=loader.replace(new RegExp('('+path.replaceAll('.','\\.')+'\\?v=)[0-9a-z]+','g'),'$1'+moduleVersion);
}
if(loader!==oldLoader) {
  if(process.argv.includes('--check'))throw Error('Stale map modules: run node scripts/prepare-release.mjs');
  writeFileSync(loaderPath,loader);
}
// Section interactions also use immutable URLs; hash them before their loader.
const sectionLoaderPath='assets/section-loader.js';
const oldSectionLoader=readFileSync(sectionLoaderPath,'utf8');let sectionLoader=oldSectionLoader;
for(const path of ['assets/map.js','assets/wall.js']) {
  const moduleVersion=createHash('sha256').update(resourceBytes(path)).digest('hex').slice(0,8);
  sectionLoader=sectionLoader.replace(new RegExp('('+path.replaceAll('.','\\.')+'\\?v=)[0-9a-z]+','g'),'$1'+moduleVersion);
}
if(sectionLoader!==oldSectionLoader) {
  if(process.argv.includes('--check'))throw Error('Stale section modules: run node scripts/prepare-release.mjs');
  writeFileSync(sectionLoaderPath,sectionLoader);
}
const hash=createHash('sha256');
for(const path of files.filter(p=>/^(assets|images|maplibre)\//.test(p)&&!p.endsWith('.html')).sort()){hash.update(path);hash.update(resourceBytes(path));}
const version=hash.digest('hex').slice(0,8);let stale=[];
for(const path of files.filter(p=>p.endsWith('.html'))){const old=readFileSync(path,'utf8');const next=old.replace(/([?&]v=)[0-9a-z]{4,12}(?=["'&])/g,'$1'+version);if(old!==next){stale.push(path);if(!process.argv.includes('--check'))writeFileSync(path,next);}}
if(process.argv.includes('--check')&&stale.length)throw Error('Stale immutable resource URLs: run node scripts/prepare-release.mjs before committing: '+stale.join(', '));
console.log('Resource fingerprint',version,stale.length?'updated':'current');
