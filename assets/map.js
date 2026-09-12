/* =========================================================
   青山湖畔的纪念册 · 时光漫游 + 校园定位图（MapLibre GL）
   依赖：maplibre/maplibre-gl.js（在此脚本之前加载）
   双语：按 <html lang> 取 SPOTS 的中/英字段
   ========================================================= */
(function () {
  'use strict';

  var EN = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0;

  /* ---------- 机位数据（维护者只改这里；name/desc 中文，nameEn/descEn 英文） ---------- */
  var SPOTS = [
    { name: '校门 · 门柱铭牌',       nameEn: 'The Gate · Nameplate',            img: '01-gate.jpg',                         date: '2025.04',    lat: 28.72075, lng: 115.93292, conf: 'estimated', desc: '粉砖门柱上「南昌十五中」五个银色大字，三年里进出千百次的坐标。', descEn: 'Five silver characters on the pink-brick gate posts — the coordinates we passed a thousand times in three years.' },
    { name: '开学第一天的操场',       nameEn: 'The Playground, Day One',         img: '02-playground-firstday.jpg',          date: '2022.08.31', lat: 28.72068, lng: 115.93181, conf: 'exact',     desc: '清晨七点十八分，红色跑道迎来新高一学生的第一张照片。', descEn: '7:18 in the morning — the red track welcomes a new senior-high student’s first photograph.' },
    { name: '红砖教学楼 · 冬日黄昏', nameEn: 'Red-brick Building at Winter Dusk', img: '04-teaching-building-winter-dusk.jpg', date: '2022.12.19', lat: 28.72145, lng: 115.93193, conf: 'approx',    desc: '冬日黄昏里的红砖教学楼与玻璃楼梯间。', descEn: 'The red-brick teaching building and its glass stairwell in winter dusk.' },
    { name: '香樟林与老教学楼',       nameEn: 'Camphor Grove & Old Building',    img: '09-camphor-grove.jpg',                date: '2023.03.22', lat: 28.72025, lng: 115.93228, conf: 'estimated', desc: '香樟新叶红绿交织，老教学楼静立树下。', descEn: 'Camphor leaves blushing red and green, with the old building resting beneath.' },
    { name: '老水塔',                 nameEn: 'The Old Water Tower',             img: '11-water-tower.jpg',                  date: '2023.06.28', lat: 28.72145, lng: 115.93255, conf: 'estimated', landmark: true, desc: '比所有教学楼都年长的构筑物，替我们记着上课与下课。', descEn: 'Older than every teaching building — it kept time for our classes and our seasons.' },
    { name: '俯瞰网球场',             nameEn: 'Tennis Courts from Above',        img: '08-tennis-court.jpg',                 date: '2023.03.22', lat: 28.72046, lng: 115.93269, conf: 'exact',     desc: '绿红相间的网球场，收藏了所有课间的黄昏。', descEn: 'Green and red courts that collected every after-class dusk.' },
    { name: '广场 · 月牙雕塑',        nameEn: 'The Plaza · Crescent Sculpture',  img: '18-plaza-summer.jpg',                 date: '2025.08.23', lat: 28.72110, lng: 115.93240, conf: 'estimated', desc: '暑假的广场空无一人，月牙雕塑仍指向天空。', descEn: 'An empty plaza in summer break — the crescent sculpture still points at the sky.' },
    { name: '综合楼仰拍',             nameEn: 'Complex Building, Looking Up',    img: '19-library-building-sky.jpg',         date: '2025.08.23', lat: 28.72078, lng: 115.93244, conf: 'approx',    desc: '仰拍综合楼，蓝天上大朵积云。', descEn: 'The complex building from below, cumulus clouds in a blue sky.' }
  ];
  function spotName(s) { return EN && s.nameEn ? s.nameEn : s.name; }
  function spotDesc(s) { return EN && s.descEn ? s.descEn : s.desc; }
  var ARIA = EN
    ? { viewSpot: 'View spot: ', tourTo: 'Tour to: ', prev: 'Previous', next: 'Next', mapRegion: 'Location map of the Qingshanhu campus, marking eight photo positions', attribution: 'Basemap © OpenStreetMap contributors' }
    : { viewSpot: '查看机位：', tourTo: '漫游到：', prev: '上一张', next: '下一张', mapRegion: '南昌市第十五中学青山湖校区定位图，标注八个照片拍摄位置', attribution: '底图 © OpenStreetMap 贡献者' };

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var viewer = document.getElementById('tourViewer');
  var cur = 4, mmMarkers = [], slides = [];

  /* ---------- 全幅照片漫游 ---------- */
  if (viewer) {
    SPOTS.forEach(function (s) {
      var img = document.createElement('img');
      img.className = 'slide';
      img.src = 'images/full/' + s.img;
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
    slides.forEach(function (img, i) { img.classList.toggle('on', i === cur); });
    document.getElementById('tourTitle').textContent = spotName(SPOTS[cur]);
    document.getElementById('tourDate').textContent = SPOTS[cur].date + ' · ' + spotDesc(SPOTS[cur]);
    document.getElementById('tourNum').textContent = (cur + 1) + ' / ' + SPOTS.length;
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
    var tag = (ev.target && ev.target.tagName) || '';
    if (tag === 'TEXTAREA' || tag === 'INPUT' || (ev.target && ev.target.isContentEditable)) return;
    if (ev.key === 'ArrowLeft') go(cur - 1);
    if (ev.key === 'ArrowRight') go(cur + 1);
  });

  /* ---------- 定位图（MapLibre 矢量底图：OSM 栅格 + 中文地名，2D 俯视最清晰） ---------- */
  var el = document.getElementById('campusMap');
  if (!el || el.getAttribute('data-map-ready')) return;
  el.setAttribute('data-map-ready', '1');

  var map = new maplibregl.Map({
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

  window.addEventListener('load', function () { map.resize(); });
  paint();
})();
