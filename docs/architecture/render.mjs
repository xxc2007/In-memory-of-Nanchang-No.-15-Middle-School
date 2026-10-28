// Edit bilingual copy and layout in spec; run: node docs/architecture/render.mjs
const spec = {
  "title": [
    "校园纪念册 · 内容、地图与留言如何协作",
    "Campus memorial · Content, maps and guestbook"
  ],
  "subtitle": [
    "十个静态语言页面，共享照片、交互代码与同一面留言墙。",
    "Ten static language pages share photographs, interaction code and one guestbook."
  ],
  "height": 1530,
  "nodes": [
    [
      "entry",
      600,
      215,
      "访问 /nc15/ 或对应语言路径",
      "Visit /nc15/ or a language path"
    ],
    [
      "html",
      600,
      350,
      "服务对应语言的静态 HTML\n各页有独立内容与 SEO 元数据",
      "Serve the matching static HTML\nEach edition has its own content and SEO"
    ],
    [
      "shared",
      600,
      485,
      "共享 CSS 与原生 JavaScript\n按 html lang 选择动态文案",
      "Share CSS and vanilla JavaScript\nUse html lang for dynamic messages"
    ],
    [
      "photos",
      220,
      665,
      "浏览照片、时间轴与水塔\n缩略图 / 全幅照片 + main.js",
      "Browse photos, history and water tower\nThumbnails / full photos + main.js"
    ],
    [
      "tour",
      600,
      665,
      "滚动接近校园寻踪\n加载漫游照片与 MapLibre 地图",
      "Scroll near the campus tour\nLoad tour photos and MapLibre map"
    ],
    [
      "wall",
      980,
      665,
      "滚动接近留言墙\nwall.js 请求 /comment/api/v2",
      "Scroll near the guestbook\nwall.js requests /comment/api/v2"
    ],
    [
      "lightbox",
      220,
      830,
      "灯箱缩放、拖拽与键盘操作\n滚动动画遵循减少动态效果设置",
      "Lightbox zoom, drag and keyboard use\nScroll motion respects user preferences"
    ],
    [
      "spots",
      600,
      830,
      "map.js 的 SPOTS 为共同索引\n八个机位连接照片、坐标与文案",
      "SPOTS in map.js is the shared index\nEight views link photos, locations and text"
    ],
    [
      "artalk",
      980,
      830,
      "nginx 反向代理到 Artalk\nSQLite 保存留言与审核状态",
      "nginx proxies requests to Artalk\nSQLite stores messages and review state"
    ],
    [
      "photoresult",
      220,
      995,
      "在本地静态预览中也能浏览\n照片、正文和时间轴",
      "Readable in a local static preview\nPhotographs, text and timeline",
      "result"
    ],
    [
      "mapok",
      600,
      995,
      "地图资源可用？",
      "Map resources available?",
      "decision"
    ],
    [
      "action",
      980,
      995,
      "读取还是提交？",
      "Read or submit?",
      "decision"
    ],
    [
      "mapfallback",
      220,
      1170,
      "地图失败可重试\n静态内容与照片漫游仍可访问",
      "Retry a failed map load\nStatic content and photo tour remain",
      "guard"
    ],
    [
      "mapresult",
      600,
      1170,
      "底图 / 影像 / 建筑图层\n机位标记与当前照片联动",
      "Basemaps / imagery / building layers\nMarkers track the selected photograph",
      "result"
    ],
    [
      "moderate",
      980,
      1170,
      "新留言进入待审核状态\n站长审核通过后才公开显示",
      "New messages await moderation\nVisible after webmaster approval",
      "guard"
    ],
    [
      "readwall",
      600,
      1350,
      "只显示已公开留言\n十种语言共用 /guestbook page_key",
      "Show published messages\nAll editions share /guestbook page_key",
      "result"
    ],
    [
      "wallfail",
      980,
      1350,
      "接口失败显示错误 / 重试\n本地静态预览说明服务限制",
      "Show errors / retry on API failure\nExplain limits in local static previews",
      "guard"
    ]
  ],
  "edges": [
    [
      "entry",
      "html"
    ],
    [
      "html",
      "shared"
    ],
    [
      "shared",
      "photos",
      "阅读",
      "Read"
    ],
    [
      "shared",
      "tour",
      "地图与漫游",
      "Map and tour"
    ],
    [
      "shared",
      "wall",
      "留言",
      "Guestbook"
    ],
    [
      "photos",
      "lightbox"
    ],
    [
      "lightbox",
      "photoresult"
    ],
    [
      "tour",
      "spots"
    ],
    [
      "spots",
      "mapok"
    ],
    [
      "mapok",
      "mapresult",
      "是",
      "Yes"
    ],
    [
      "mapok",
      "mapfallback",
      "否",
      "No"
    ],
    [
      "wall",
      "artalk"
    ],
    [
      "artalk",
      "action"
    ],
    [
      "action",
      "moderate",
      "提交",
      "Submit"
    ],
    [
      "action",
      "readwall",
      "读取",
      "Read",
      "gutter"
    ],
    [
      "moderate",
      "readwall",
      "审核通过",
      "Approved"
    ],
    [
      "artalk",
      "wallfail",
      "接口不可用",
      "API unavailable",
      "outer"
    ]
  ],
  "notes": [],
  "foot": [
    "地图瓦片与留言服务需要网络。建筑轮廓和估计高度不等于实测校园模型。",
    "Map tiles and guestbook service require network access. Building heights are estimates, not a surveyed campus model."
  ],
  "sources": [
    "index.html",
    "assets/main.js",
    "assets/map.js",
    "assets/map-sources.js",
    "assets/wall.js",
    "docs/MAP-SOURCES.md",
    "docs/MIGRATION.md"
  ],
  "intro": [
    "这张图把静态阅读、地图漫游和留言服务分成三条路径：照片与正文由静态资源提供；地图按需加载并与机位数据联动；留言通过独立服务存储和审核。绿色表示读者可见结果，橙色表示审核、失败处理或约束。",
    "The diagram separates static reading, the map tour and the guestbook: photographs and text use static assets; the map loads on demand and follows the viewpoint data; messages use a separate service for storage and moderation. Green marks reader-visible results; amber marks moderation, failure handling or constraints."
  ],
  "anchor": [
    "## ⚙️ 技术栈",
    "## ⚙️ Tech stack"
  ]
};


import fs from 'node:fs';
import { exportDiagram } from './raster.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const directory = path.dirname(fileURLToPath(import.meta.url));
const escape = s => String(s).replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const height = n => n[5] === 'decision' ? (n[3].includes('\n') || n[4].includes('\n') ? 156 : 104) : 86;
const units = line => Array.from(line).reduce((sum,c)=>sum+(/[^\u0000-\u00ff]/.test(c)?1:.56),0);
for (let lang=0; lang<2; lang++) {
 const language=lang?'en':'zh', elements=[], labels=[];
 const text=(x,y,lines,size=20,weight=400,anchor='middle',fill='#252a2e',attrs='')=>{
   const rows=String(lines).split('\n');
   elements.push('<text '+attrs+' x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" font-size="'+size+'" font-weight="'+weight+'" fill="'+fill+'">'+rows.map((s,i)=>'<tspan x="'+x+'" dy="'+(i?27:0)+'">'+escape(s)+'</tspan>').join('')+'</text>');
 };
 const nodes=new Map(spec.nodes.map(n=>[n[0],n]));
 const colors={result:['#edf6ee','#267349'],guard:['#fff5e9','#aa681f'],decision:['#ffffff','#68737b']};
 for (const [from,to,zh,en,kind] of spec.edges) {
  const a=nodes.get(from),b=nodes.get(to); let d,lx,ly,anchor='middle';
  const fork=['base','shared','pub'].includes(from);
  if(kind==='side') {
   d='M '+(a[1]+165)+' '+a[2]+' H '+(b[1]-165);lx=(a[1]+b[1])/2;ly=a[2]-height(a)/2-16;
  } else if(kind==='gutter') {
   d='M '+(a[1]-165)+' '+a[2]+' H 790 V '+(b[2]-90)+' H '+b[1]+' V '+(b[2]-height(b)/2);lx=774;ly=1065;anchor='end';
  } else if(kind==='outer') {
   const x=1182; d='M '+(a[1]+165)+' '+a[2]+' H '+x+' V '+b[2]+' H '+(b[1]+165);lx=x-16;ly=1080;anchor='end';
  } else {
   const y1=a[2]+height(a)/2,y2=b[2]-height(b)/2,mid=(y1+y2)/2;
   d='M '+a[1]+' '+y1+' V '+mid+' H '+b[1]+' V '+y2;
   lx=fork?b[1]:a[1]===b[1]?a[1]+18:(a[1]+b[1])/2;ly=mid-12;
   if(a[1]===b[1]){anchor='start';if(fork)lx=b[1]+18;else if(y2-y1<60)ly=mid+5;}
   // This horizontal label shares a gutter with the read path; keep it entirely to its left.
   if(from==='moderate' && to==='readwall'){lx=768;anchor='end';}
  }
  elements.push('<path data-edge="'+from+'-'+to+'" d="'+d+'" fill="none" stroke="#4e585f" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#arrow)"/>');
  if(zh)labels.push({from,to,x:lx,y:ly,copy:lang?en:zh,anchor});
 }
 elements.push('<circle cx="600" cy="146" r="7" fill="#252a2e"/><path d="M 600 153 V 172" stroke="#4e585f" stroke-width="1.7" marker-end="url(#arrow)"/>');
 for (const n of spec.nodes) {
   const [id,x,y,zh,en,type]=n,[fill,stroke]=colors[type]||['#f4f5f6','#899198'],half=height(n)/2;
   elements.push('<g data-node="'+id+'" data-kind="'+(type||'process')+'" data-cx="'+x+'" data-cy="'+y+'" data-half-height="'+half+'">');
   if(type==='decision')elements.push('<path d="M '+x+' '+(y-half)+' L '+(x+165)+' '+y+' L '+x+' '+(y+half)+' L '+(x-165)+' '+y+' Z" fill="'+fill+'" stroke="'+stroke+'" stroke-width="1.7"/>');
   else elements.push('<rect x="'+(x-165)+'" y="'+(y-half)+'" width="330" height="'+height(n)+'" rx="7" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+(type?2:1.5)+'"/>');
   const copy=lang?en:zh,lines=copy.split('\n');
   let size=lang?17:20;
   // Fit every line to the available diamond width at its top AND bottom, with padding.
   // A rectangle-width check alone misses text touching the diagonal border.
   for(;size>10;size-=.25){
    const fits=lines.every((line,i)=>{
     const baseline=(i-(lines.length-1)/2)*27+size*.32;
     const edge=Math.max(Math.abs(baseline-size*.9),Math.abs(baseline+size*.3));
     const available=type==='decision'?330*(1-edge/half)-28:300;
     return units(line)*size<=available;
    });
    if(fits)break;
   }
   text(x,y-(lines.length-1)*13.5+size*.32,copy,size,type==='decision'?500:400,'middle','#252a2e','data-node-label="'+id+'"');
   elements.push('</g>');
 }
 // Labels are placed in clear gutters with explicit anchors; no line runs through their text.
 for(const label of labels)text(label.x,label.y,label.copy,16,400,label.anchor,'#252a2e','data-edge-label="'+label.from+'-'+label.to+'"');
 for(const [id,zh,en] of spec.notes||[]) { const n=nodes.get(id);text(600,n[2]-64,lang?en:zh,16,400,'middle','#626c74'); }
 text(600,45,spec.title[lang],30,600);
 text(600,82,spec.subtitle[lang],18,400,'middle','#59646c');
 const legend=lang?['Process','Decision','Visible result','Guard / fallback']:['处理步骤','条件判断','可见结果','约束 / 后备路径'];
 for(let i=0;i<4;i++){
  const x=190+i*245,[fill,stroke]=i===2?colors.result:i===3?colors.guard:['#f4f5f6','#899198'];
  if(i===1)elements.push('<path d="M '+x+' 102 l 13 11 l -13 11 l -13 -11 Z" fill="white" stroke="'+stroke+'"/>');
  else elements.push('<rect x="'+(x-13)+'" y="103" width="26" height="21" rx="3" fill="'+fill+'" stroke="'+stroke+'"/>');
  text(x+23,119,legend[i],16,400,'start','#59646c');
 }
 // The Chinese editions omit the bottom annotations requested for removal.
 const outputHeight=lang?spec.height:Math.max(...spec.nodes.map(n=>n[2]+height(n)/2))+55;
 if(lang){
  text(600,outputHeight-67,spec.foot?.[1]||'Logical flow based on repository source. Each website has its own release boundary.',16,400,'middle','#626c74');
  text(600,outputHeight-35,'Documentation illustration · 22 October 2026 · SVG, editable text and paths',15,400,'middle','#78838b');
 }
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="'+outputHeight+'" viewBox="0 0 1200 '+outputHeight+'" role="img" aria-labelledby="title description" xml:lang="'+language+'"><title id="title">'+escape(spec.title[lang])+'</title><desc id="description">'+escape(spec.intro[lang])+'</desc><defs><marker id="arrow" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><path d="M 0 0 L 9 3.5 L 0 7 L 2 3.5 Z" fill="#4e585f"/></marker></defs><rect width="1200" height="'+outputHeight+'" fill="#ffffff"/><g font-family="Segoe UI, Microsoft YaHei, Noto Sans CJK SC, Arial, sans-serif">'+elements.join('')+'</g></svg>\n';
 fs.writeFileSync(path.join(directory,'flow.'+language+'.svg'),svg);
 exportDiagram({directory,language,svg,svgFilename:'flow.'+language+'.svg'});
 console.log('Rendered flow.'+language+'.svg');
}
