import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';

test('release fingerprint matches Git index blobs and CRLF working copies',()=>{
  const root=resolve(import.meta.dirname,'..');
  const exported=mkdtempSync(join(tmpdir(),'nc15-git-fingerprint-'));
  const git=(args,cwd=root)=>execFileSync('git',args,{cwd,encoding:'utf8'});
  try {
    // Export the real staged blobs, rather than copying the local working tree.
    git(['-c','core.autocrlf=false','checkout-index','--all','--prefix='+exported.replaceAll('\\','/')+'/']);
    git(['init','--quiet'],exported);
    git(['add','--all'],exported);
    const check=()=>execFileSync(process.execPath,['scripts/prepare-release.mjs','--check'],{cwd:exported,encoding:'utf8'});
    const canonical=check();
    assert.match(canonical,/Resource fingerprint [a-f0-9]{8} current/);
    const files=git(['ls-files'],exported).trim().split('\n');
    for(const file of files.filter(path=>/^(assets|images|maplibre)\//.test(path)&&/\.(?:js|mjs|css|svg|json|txt)$/.test(path))) {
      const path=join(exported,file);
      writeFileSync(path,readFileSync(path,'utf8').replace(/\r\n/g,'\n').replace(/\n/g,'\r\n'));
    }
    assert.equal(check(),canonical,'line endings must not change any immutable URL');
    console.log(canonical.trim()+' from real Git blobs and CRLF copy');
  } finally {
    // Only the literal directory returned by mkdtemp is removed.
    rmSync(exported,{recursive:true,force:true});
  }
});
