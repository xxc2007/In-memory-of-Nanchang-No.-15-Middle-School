// Install the NC15-only map proxy. Credentials travel over SSH stdin, never Git or argv.
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {homedir} from 'node:os';
function envFile(path) {
  return Object.fromEntries(readFileSync(path,'utf8').split(/\r?\n/).filter(l=>/^\s*[A-Z_]+=/.test(l)).map(l=>{
    const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).replace(/^['"]|['"]$/g,'')];
  }));
}
const deploy=envFile('.deploy.env'), keys=envFile('.map-dev.env');
if(deploy.DEPLOY_ROOT!=='/var/www/nc15')throw Error('Wrong deployment target');
if(!keys.AMAP_BROWSER_KEY||!keys.AMAP_SECURITY_CODE)throw Error('Missing AMap credentials');
const files={
  'map-preview.mjs':readFileSync('tools/map-preview.mjs','utf8'),
  'server.mjs':`import {createMapPreviewServer} from './map-preview.mjs';
const config={amap:{key:process.env.AMAP_BROWSER_KEY,securityCode:process.env.AMAP_SECURITY_CODE},tencent:{key:process.env.TENCENT_BROWSER_KEY}};
createMapPreviewServer({root:'/var/www/nc15',config,basePath:'/nc15'}).listen(4186,'127.0.0.1');\n`,
  'map.env':Object.entries(keys).filter(([k])=>['AMAP_BROWSER_KEY','AMAP_SECURITY_CODE','TENCENT_BROWSER_KEY'].includes(k)).map(([k,v])=>k+'='+v).join('\n')+'\n'
};
const unit=`[Unit]
Description=NC15 official map security proxy
After=network.target
[Service]
Type=simple
User=www-data
Group=www-data
EnvironmentFile=/etc/nc15-map.env
ExecStart=/usr/bin/node /opt/nc15-map/server.mjs
Restart=on-failure
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
ProtectHome=true
ProtectSystem=strict
UMask=0077
[Install]
WantedBy=multi-user.target
`;
const snippet=`# NC15 map service only; fixed loopback upstream, credentials remain in the service.
location = /nc15/map-runtime.json {
    proxy_pass http://127.0.0.1:4186;
    proxy_set_header Host $host;
    proxy_cache off;
    add_header Cache-Control "no-store" always;
    add_header X-Content-Type-Options "nosniff" always;
}
location ^~ /nc15/_AMapService/ {
    proxy_pass http://127.0.0.1:4186;
    proxy_set_header Host $host;
    proxy_cache off;
    proxy_connect_timeout 5s;
    proxy_read_timeout 25s;
    add_header Cache-Control "no-store" always;
    add_header X-Content-Type-Options "nosniff" always;
}
`;
const code=`import pathlib,os,subprocess,datetime,json,hashlib,urllib.request
files=json.loads(${JSON.stringify(JSON.stringify(files))})
base=pathlib.Path('/opt/nc15-map');base.mkdir(exist_ok=True,mode=0o755)
for name,content in files.items():
 path=pathlib.Path('/etc/nc15-map.env') if name=='map.env' else base/name
 path.write_text(content);os.chown(path,0,0);path.chmod(0o600 if name=='map.env' else 0o644)
pathlib.Path('/etc/systemd/system/nc15-map-proxy.service').write_text(${JSON.stringify(unit)})
snippet=pathlib.Path('/etc/nginx/snippets/nc15-map-proxy.conf');snippet.write_text(${JSON.stringify(snippet)})
config=pathlib.Path('/etc/nginx/sites-available/xxc2007.me');original=config.read_text()
include=${JSON.stringify('    include /etc/nginx/snippets/nc15-map-proxy.conf;\n')}
anchor='    location ^~ /nc15/ {'
assert original.count(anchor)==2,'Unexpected vhost structure'
updated=original if include in original else original.replace(anchor,include+anchor)
assert updated.replace(include,'')==original.replace(include,''),'Unrelated vhost change'
backup=pathlib.Path('/var/backups/nc15-map-'+datetime.datetime.now().strftime('%Y%m%d%H%M%S')+'.conf')
backup.write_text(original);backup.chmod(0o600)
subprocess.run(['systemctl','daemon-reload'],check=True)
subprocess.run(['systemctl','enable','--now','nc15-map-proxy.service'],check=True,stdout=subprocess.DEVNULL)
subprocess.run(['systemctl','restart','nc15-map-proxy.service'],check=True)
config.write_text(updated)
try:
 subprocess.run(['nginx','-t'],check=True,capture_output=True)
 subprocess.run(['systemctl','reload','nginx'],check=True)
except Exception:
 config.write_text(original);subprocess.run(['nginx','-t'],check=True,capture_output=True);subprocess.run(['systemctl','reload','nginx'],check=True);raise
print(json.dumps({'proxy_installed':True,'vhost_change':'NC15 locations only','backup':str(backup)}))
`;
const options=['-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','-o','UserKnownHostsFile='+(deploy.DEPLOY_KNOWN_HOSTS||homedir()+'/.ssh/known_hosts'),'-i',deploy.DEPLOY_KEY.replace(/^~/,homedir()),deploy.DEPLOY_USER+'@'+deploy.DEPLOY_HOST];
process.stdout.write(execFileSync(process.platform==='win32'?'C:/Program Files/Git/usr/bin/ssh.exe':'ssh',[...options,'sudo python3 -'],{input:code,timeout:120000,maxBuffer:100000}));
