/* Fixed-version, same-origin MapLibre. Photo tours remain independent of WebGL. */
(function () {
  'use strict';
  var base = new URL('../', document.currentScript.src);
  function boot() {
    var section = document.getElementById('map');
    if (!section) return;
    var started = false, observer;
    function load() {
      if (started) return;
      started = true;
      window.removeEventListener('scroll', near);
      if (observer) observer.disconnect();
      var el = document.getElementById('campusMap');
      var css = document.createElement('link');
      css.rel = 'stylesheet'; css.href = new URL('maplibre/maplibre-gl.css?v=6.14.0', base).href;
      document.head.appendChild(css);
      var timeout = setTimeout(function () {
        if (el && !el.hasAttribute('data-map-ready')) el.setAttribute('data-map-timeout', '1');
      }, 20000);
      import(new URL('maplibre/maplibre-gl.mjs?v=6.14.0', base).href).then(function (lib) {
        lib.setWorkerUrl(new URL('maplibre/maplibre-gl-worker.mjs?v=6.14.0', base).href);
        lib.setWorkerCount(1);
        window.maplibregl = lib;
        if (window.__initCampusMap) window.__initCampusMap();
        if (el) el.removeAttribute('data-map-timeout');
      }).catch(function () {
        if (el) el.setAttribute('data-map-failed', '1');
      }).finally(function () { clearTimeout(timeout); });
    }
    function near() { var r=section.getBoundingClientRect(); if(r.top < innerHeight+800 && r.bottom > -800) load(); }
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(function (entries) {
        if (entries.some(function (entry) { return entry.isIntersecting; })) load();
      }, {rootMargin:'600px 0px'});
      observer.observe(section);
    }
    window.addEventListener('scroll', near, {passive:true}); near();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true}); else boot();
})();
