/* Load section interactions shortly before use, keeping the first screen light. */
(function () {
  'use strict';
  var base = new URL('../', document.currentScript.src);
  function watch(id, paths) {
    var section = document.getElementById(id);
    if (!section) return;
    var started = false, observer;
    function load() {
      if (started) return;
      started = true;
      if (observer) observer.disconnect();
      paths.forEach(function (path) {
        var script = document.createElement('script');
        script.src = new URL(path, base).href;
        document.head.appendChild(script);
      });
    }
    if (!('IntersectionObserver' in window)) { load(); return; }
    observer = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; })) load();
    }, {rootMargin:'900px 0px'});
    observer.observe(section);
    // Anchor entry and later navigation must also initialize without a scroll event.
    function hashEntry() { if (location.hash === '#' + id) load(); }
    window.addEventListener('hashchange', hashEntry);
    hashEntry();
  }
  watch('map', ['assets/map.js?v=6c66a689']);
  watch('wall', ['assets/wall.js?v=a44e9f8c']);
})();
