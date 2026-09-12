/* =========================================================
   青山湖畔的纪念册 · 时光漫游 + 校园定位图（MapLibre GL）
   依赖：maplibre/maplibre-gl.js（在此脚本之前加载）
   双语：按 <html lang> 取 SPOTS 的中/英字段
   ========================================================= */
(function () {
  'use strict';

  var LOCALE = (document.documentElement.lang || '').toLowerCase();
  var EN = LOCALE.indexOf('en') === 0;
  var JA = LOCALE.indexOf('ja') === 0;
  var ZHT = LOCALE.indexOf('zh-tw') === 0 || LOCALE.indexOf('zh-hant') === 0;
  /* 资源基路径：以本脚本自身的 URL 为锚反推站点根。
     原先用 `location.pathname === '/' ? '' : '../'`，在 file:// 下打开根目录的
     index.html 时 pathname 不是 '/'，会得到 '../' 从而把 8 张漫游大图全部指到
     站点外（README 却写明 file:// 可浏览）。用 currentScript 反推则 http、
     file://、子目录部署三种情形都对。取不到时退回原逻辑。 */
  var BASE = (function () {
    var src = document.currentScript && document.currentScript.src;
    if (!src) return location.pathname === '/' ? '' : '../';
    return src.replace(/assets\/map\.js.*$/, '');
  })();

  /* ---------- 机位数据（维护者只改这里；name/desc 简体，Hant 繁體，En 英文，Ja 日文） ---------- */
  var SPOTS = [
    { name: '校门 · 门柱铭牌',       nameHant: '校門 · 門柱銘牌',           nameEn: 'The Gate · Nameplate',            nameJa: '校門・門柱の銘板',
      img: '01-gate.jpg', date: '2025.04', lat: 28.72075, lng: 115.93292, conf: 'estimated',
      desc: '粉砖门柱上「南昌十五中」五个银色大字，三年里进出千百次的坐标。',
      descHant: '粉磚門柱上「南昌十五中」五個銀色大字，三年裡進出千百次的座標。',
      descEn: 'Five silver characters on the pink-brick gate posts — the coordinates we passed a thousand times in three years.',
      descJa: 'ピンクレンガの門柱に輝く「南昌十五中」の五文字——三年間、何百回も行き交った座標。' },
    { name: '开学第一天的操场',       nameHant: '開學第一天的操場',           nameEn: 'The Playground, Day One',         nameJa: '新学期初日のグラウンド',
      img: '02-playground-firstday.jpg', date: '2022.08.31', lat: 28.72068, lng: 115.93181, conf: 'exact',
      desc: '清晨七点十八分，红色跑道迎来新高一学生的第一张照片。',
      descHant: '清晨七點十八分，紅色跑道迎來新高一學生的第一張照片。',
      descEn: '7:18 in the morning — the red track welcomes a new senior-high student’s first photograph.',
      descJa: '朝7時18分、赤い陸上トラックが新入生の最初の一枚を出迎えた。' },
    { name: '红砖教学楼 · 冬日黄昏', nameHant: '紅磚教學樓 · 冬日黃昏',       nameEn: 'Red-brick Building at Winter Dusk', nameJa: '赤煉瓦の校舎・冬の夕暮れ',
      img: '04-teaching-building-winter-dusk.jpg', date: '2022.12.19', lat: 28.72145, lng: 115.93193, conf: 'approx',
      desc: '冬日黄昏里的红砖教学楼与玻璃楼梯间。',
      descHant: '冬日黃昏裡的紅磚教學樓與玻璃樓梯間。',
      descEn: 'The red-brick teaching building and its glass stairwell in winter dusk.',
      descJa: '冬の夕暮れにたたずむ赤煉瓦の校舎とガラスの階段室。' },
    { name: '香樟林与老教学楼',       nameHant: '香樟林與老教學樓',           nameEn: 'Camphor Grove & Old Building',    nameJa: '樟の木と古い校舎',
      img: '09-camphor-grove.jpg', date: '2023.03.22', lat: 28.72025, lng: 115.93228, conf: 'estimated',
      desc: '香樟新叶红绿交织，老教学楼静立树下。',
      descHant: '香樟新葉紅綠交織，老教學樓靜立樹下。',
      descEn: 'Camphor leaves blushing red and green, with the old building resting beneath.',
      descJa: '樟の新芽が紅と緑を交え、古い校舎が静かにたたずむ。' },
    { name: '老水塔',                 nameHant: '老水塔',                     nameEn: 'The Old Water Tower',             nameJa: '古い給水塔',
      img: '11-water-tower.jpg', date: '2023.06.28', lat: 28.72145, lng: 115.93255, conf: 'estimated', landmark: true,
      desc: '比所有教学楼都年长的构筑物，替我们记着上课与下课。',
      descHant: '比所有教學樓都年長的構築物，替我們記著上課與下課。',
      descEn: 'Older than every teaching building — it kept time for our classes and our seasons.',
      descJa: 'どの校舎よりも年長の建造物が、授業の始まりと終わりを覚えている。' },
    { name: '俯瞰网球场',             nameHant: '俯瞰網球場',                 nameEn: 'Tennis Courts from Above',        nameJa: 'テニスコートを見下ろす',
      img: '08-tennis-court.jpg', date: '2023.03.22', lat: 28.72046, lng: 115.93269, conf: 'exact',
      desc: '绿红相间的网球场，收藏了所有课间的黄昏。',
      descHant: '綠紅相間的網球場，收藏了所有課間的黃昏。',
      descEn: 'Green and red courts that collected every after-class dusk.',
      descJa: '緑と赤のテニスコートに、休み時間の黄昏がすべて集まっている。' },
    { name: '广场 · 月牙雕塑',        nameHant: '廣場 · 月牙雕塑',            nameEn: 'The Plaza · Crescent Sculpture',  nameJa: '広場・三日月の彫刻',
      img: '18-plaza-summer.jpg', date: '2025.08.23', lat: 28.72110, lng: 115.93240, conf: 'estimated',
      desc: '暑假的广场空无一人，月牙雕塑仍指向天空。',
      descHant: '暑假的廣場空無一人，月牙雕塑仍指向天空。',
      descEn: 'An empty plaza in summer break — the crescent sculpture still points at the sky.',
      descJa: '夏休みの広場には誰もおらず、三日月の彫刻は今も空を指している。' },
    { name: '综合楼仰拍',             nameHant: '綜合樓仰拍',                 nameEn: 'Complex Building, Looking Up',    nameJa: '総合棟を見上げる',
      img: '19-library-building-sky.jpg', date: '2025.08.23', lat: 28.72078, lng: 115.93244, conf: 'approx',
      desc: '仰拍综合楼，蓝天上大朵积云。',
      descHant: '仰拍綜合樓，藍天上大朵積雲。',
      descEn: 'The complex building from below, cumulus clouds in a blue sky.',
      descJa: '総合棟を見上げれば、青空に大きな入道雲。' }
  ];
  function spotName(s) {
    if (EN) return s.nameEn || s.name;
    if (JA) return s.nameJa || s.name;
    if (ZHT) return s.nameHant || s.name;
    return s.name;
  }
  function spotDesc(s) {
    if (EN) return s.descEn || s.desc;
    if (JA) return s.descJa || s.desc;
    if (ZHT) return s.descHant || s.desc;
    return s.desc;
  }
  var ARIA = EN
    ? { viewSpot: 'View spot: ', tourTo: 'Tour to: ', prev: 'Previous', next: 'Next', mapRegion: 'Location map of the Qingshanhu campus, marking eight photo positions', attribution: 'Basemap © OpenStreetMap contributors' }
    : JA
    ? { viewSpot: '撮影スポット：', tourTo: 'この場所へ：', prev: '前の写真', next: '次の写真', mapRegion: '青山湖キャンパスの位置マップ（8つの撮影地点を表示）', attribution: 'Basemap © OpenStreetMap contributors' }
    : ZHT
    ? { viewSpot: '查看機位：', tourTo: '漫遊到：', prev: '上一張', next: '下一張', mapRegion: '南昌市第十五中學青山湖校區定位圖，標注八個照片拍攝位置', attribution: '底圖 © OpenStreetMap 貢獻者' }
    : { viewSpot: '查看机位：', tourTo: '漫游到：', prev: '上一张', next: '下一张', mapRegion: '南昌市第十五中学青山湖校区定位图，标注八个照片拍摄位置', attribution: '底图 © OpenStreetMap 贡献者' };

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var viewer = document.getElementById('tourViewer');
  var cur = 4, mmMarkers = [], slides = [];

  /* ---------- 全幅照片漫游 ---------- */
  if (viewer) {
    SPOTS.forEach(function (s) {
      var img = document.createElement('img');
      img.className = 'slide';
      img.src = BASE + 'images/full/' + s.img;
      img.alt = spotName(s);
      img.loading = 'lazy';
      img.addEventListener('error', function () { img.style.display = 'none'; });  /* 加载失败隐藏该帧，漫游跳到其他机位 */
      viewer.insertBefore(img, viewer.querySelector('.veil'));
    });
    slides = Array.prototype.slice.call(viewer.querySelectorAll('img.slide'));
  }
  var dotsWrap = document.getElementById('tourDots');
  var dots = [];
  if (dotsWrap) {
    SPOTS.forEach(function (s, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'dot';
      d.setAttribute('aria-label', ARIA.tourTo + spotName(s));
      d.addEventListener('click', function () { go(i); });
      dotsWrap.appendChild(d);
    });
    dots = Array.prototype.slice.call(dotsWrap.children);
  }

  function paint() {
    var vt = document.getElementById('tourTitle');
    var vd = document.getElementById('tourDate');
    var vn = document.getElementById('tourNum');
    slides.forEach(function (img, i) { img.classList.toggle('on', i === cur); });
    if (vt) vt.textContent = spotName(SPOTS[cur]);
    if (vd) vd.textContent = SPOTS[cur].date + ' · ' + spotDesc(SPOTS[cur]);
    if (vn) vn.textContent = (cur + 1) + ' / ' + SPOTS.length;
    dots.forEach(function (d, i) {
      d.classList.toggle('on', i === cur);
      if (i === cur) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
    });
    mmMarkers.forEach(function (mm, i) { mm.el.classList.toggle('on', i === cur); });
  }
  function go(i) {
    cur = (i + SPOTS.length) % SPOTS.length;
    paint();
    var s = SPOTS[cur];
    if (window.__campusMap) {
      if (!reduceMotion) __campusMap.flyTo({ center: [s.lng, s.lat], zoom: 16.5, duration: 1600, essential: true });
      else __campusMap.jumpTo({ center: [s.lng, s.lat], zoom: 16.5 });
    }
  }
  var prevBtn = document.getElementById('tourPrev');
  var nextBtn = document.getElementById('tourNext');
  if (prevBtn) prevBtn.addEventListener('click', function () { go(cur - 1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { go(cur + 1); });
  /* 方向键仅在漫游区临近视口时接管，避免在页面其他位置误触不可见的漫游 */
  var mapNear = false;
  if ('IntersectionObserver' in window && viewer) {
    new IntersectionObserver(function (entries) { mapNear = entries[0].isIntersecting; }, { rootMargin: '120px' }).observe(viewer);
  }
  document.addEventListener('keydown', function (ev) {
    if (!mapNear || document.body.classList.contains('lb-lock')) return;   /* 灯箱开启或不在地图区时让位 */
    var langMenu = document.getElementById('langMenu');
    if (langMenu && !langMenu.hidden) return;   /* 语言菜单展开时，←→ 归菜单用，不切漫游照片 */
    var tag = (ev.target && ev.target.tagName) || '';
    if (tag === 'TEXTAREA' || tag === 'INPUT' || (ev.target && ev.target.isContentEditable)) return;
    if (ev.key === 'ArrowLeft') go(cur - 1);
    if (ev.key === 'ArrowRight') go(cur + 1);
  });

  /* ---------- 定位图（MapLibre 矢量底图：OSM 栅格 + 中文地名，2D 俯视最清晰） ---------- */
  /* 先把「照片漫游」落地：它只依赖上面的 slides / dots 与机位数据，
     不能被定位图连坐——WebGL 不可用、瓦片被墙或 MapLibre 缺失时定位图会失败，
     但漫游必须照常显示（paint 原先排在定位图之后，会一起静默消失）。 */
  paint();

  var el = document.getElementById('campusMap');
  if (!el || el.getAttribute('data-map-ready')) return;
  if (typeof maplibregl === 'undefined') { el.setAttribute('data-map-failed', '1'); return; }
  el.setAttribute('data-map-ready', '1');

  var map;
  try {
    map = new maplibregl.Map({
      container: el,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256, maxzoom: 19,
            attribution: ARIA.attribution
          }
        },
        layers: [
          { id: 'bg', type: 'background', paint: { 'background-color': '#EDEAE0' } },
          { id: 'osm', type: 'raster', source: 'osm' }
        ]
      },
      center: [115.93216, 28.72078],
      zoom: 15.6, pitch: 0, bearing: 0,
      attributionControl: false
    });
  } catch (err) {
    el.setAttribute('data-map-failed', '1');   /* 定位图降级：漫游与其余区块不受影响 */
    return;
  }
  window.__campusMap = map;
  map.addControl(new maplibregl.AttributionControl({ compact: true }));
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

  SPOTS.forEach(function (s, i) {
    var pin = document.createElement('button');
    pin.type = 'button';
    pin.className = 'mm-pin';
    pin.title = spotName(s);
    pin.setAttribute('aria-label', ARIA.viewSpot + spotName(s));
    var m = new maplibregl.Marker({ element: pin, anchor: 'center' }).setLngLat([s.lng, s.lat]).addTo(map);
    mmMarkers.push({ el: pin, m: m, s: s });
    pin.addEventListener('click', function (ev) {
      ev.stopPropagation();
      go(i);
    });
  });

  /* 瓦片失败降级：WebGL 正常但瓦片拉不下来（OSM 被墙/限流）时，地图只剩灰底无任何说明。
     判定条件刻意收紧：10 秒内「一张瓦片都没成功加载」且「累计 ≥3 次瓦片错误」才标记，
     避免把偶发的网络抖动误报成失败。 */
  var tilesLoaded = false, tileErrors = 0;
  map.on('data', function (e) { if (e && e.tile) tilesLoaded = true; });
  map.on('error', function (e) { if (e && e.tile) tileErrors++; });
  setTimeout(function () {
    if (!tilesLoaded && tileErrors >= 3) el.setAttribute('data-map-tiles-failed', '1');
  }, 10000);

  window.addEventListener('load', function () { map.resize(); });
  paint();   /* 机位钉建好后重绘一次，让当前机位钉与漫游保持一致（paint 幂等） */
})();
