/* =========================================================
   青山湖畔的纪念册 · 时光漫游 + 校园定位图（MapLibre GL）
   依赖：maplibre/maplibre-gl.js（在此脚本之前加载）
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 机位数据（维护者只改这里） ---------- */
  var SPOTS = [
    { name: '校门 · 门柱铭牌',       img: '01-gate.jpg',                         date: '2025.04',    lat: 28.72075, lng: 115.93292, conf: 'estimated', desc: '粉砖门柱上「南昌十五中」五个银色大字，三年里进出千百次的坐标。' },
    { name: '开学第一天的操场',       img: '02-playground-firstday.jpg',          date: '2022.08.31', lat: 28.72068, lng: 115.93181, conf: 'exact',     desc: '清晨七点十八分，红色跑道迎来新高一学生的第一张照片。' },
    { name: '红砖教学楼 · 冬日黄昏', img: '04-teaching-building-winter-dusk.jpg', date: '2022.12.19', lat: 28.72145, lng: 115.93193, conf: 'approx',    desc: '冬日黄昏里的红砖教学楼与玻璃楼梯间。' },
    { name: '香樟林与老教学楼',       img: '09-camphor-grove.jpg',                date: '2023.03.22', lat: 28.72025, lng: 115.93228, conf: 'estimated', desc: '香樟新叶红绿交织，老教学楼静立树下。' },
    { name: '老水塔',                 img: '11-water-tower.jpg',                  date: '2023.06.28', lat: 28.72145, lng: 115.93255, conf: 'estimated', landmark: true, desc: '比所有教学楼都年长的构筑物，替我们记着上课与下课。' },
    { name: '俯瞰网球场',             img: '08-tennis-court.jpg',                 date: '2023.03.22', lat: 28.72046, lng: 115.93269, conf: 'exact',     desc: '绿红相间的网球场，收藏了所有课间的黄昏。' },
    { name: '广场 · 月牙雕塑',        img: '18-plaza-summer.jpg',                 date: '2025.08.23', lat: 28.72110, lng: 115.93240, conf: 'estimated', desc: '暑假的广场空无一人，月牙雕塑仍指向天空。' },
    { name: '综合楼仰拍',             img: '19-library-building-sky.jpg',         date: '2025.08.23', lat: 28.72078, lng: 115.93244, conf: 'approx',    desc: '仰拍综合楼，蓝天上大朵积云。' }
  ];

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var viewer = document.getElementById('tourViewer');
  var cur = 4, mmMarkers = [], slides = [];

  /* ---------- 全幅照片漫游 ---------- */
  if (viewer) {
    SPOTS.forEach(function (s) {
      var img = document.createElement('img');
      img.className = 'slide';
      img.src = 'images/full/' + s.img;
      img.alt = s.name;
      img.loading = 'lazy';
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
      d.setAttribute('aria-label', '漫游到：' + s.name);
      d.addEventListener('click', function () { go(i); });
      dotsWrap.appendChild(d);
    });
    dots = Array.prototype.slice.call(dotsWrap.children);
  }

  function paint() {
    slides.forEach(function (img, i) { img.classList.toggle('on', i === cur); });
    document.getElementById('tourTitle').textContent = SPOTS[cur].name;
    document.getElementById('tourDate').textContent = SPOTS[cur].date + ' · ' + SPOTS[cur].desc;
    document.getElementById('tourNum').textContent = (cur + 1) + ' / ' + SPOTS.length;
    dots.forEach(function (d, i) { d.classList.toggle('on', i === cur); });
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
  document.addEventListener('keydown', function (ev) {
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
          attribution: '底图 © OpenStreetMap 贡献者'
        }
      },
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
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
    pin.title = s.name;
    pin.setAttribute('aria-label', '查看机位：' + s.name);
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
