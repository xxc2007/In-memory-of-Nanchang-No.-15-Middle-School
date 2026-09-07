/* =========================================================
   青山湖畔的纪念册 · 主交互
   进度条 / scrollspy / 滚动显现 / 数字滚动 /
   Hero 视差 / 惯性滚动 / 时间线 / 灯箱
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 统一滚动驱动（rAF 节流） ---------- */
  var topbar = document.getElementById('topbar');
  var progress = document.getElementById('progress');
  var updaters = [];
  var ticking = false;
  function requestTick() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      for (var i = 0; i < updaters.length; i++) updaters[i]();
    });
  }
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick);

  /* 顶栏状态 + 阅读进度条 */
  updaters.push(function () {
    topbar.classList.toggle('scrolled', window.scrollY > 8);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0).toFixed(4) + ')';
    }
  });

  /* ---------- 导航高亮（scrollspy） ---------- */
  (function () {
    var links = Array.prototype.slice.call(document.querySelectorAll('nav.toc a[href^="#"]'));
    var sections = [];
    links.forEach(function (a) {
      var sec = document.getElementById(a.getAttribute('href').slice(1));
      if (sec) sections.push({ link: a, sec: sec });
    });
    if (!sections.length) return;
    updaters.push(function () {
      var active = null;
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        active = sections[sections.length - 1];
      } else {
        for (var i = 0; i < sections.length; i++) {
          if (sections[i].sec.getBoundingClientRect().top <= 96) active = sections[i];
        }
      }
      sections.forEach(function (s) { s.link.classList.toggle('active', s === active); });
    });
  })();

  /* ---------- 滚动显现 ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: .12, rootMargin: '0px 0px -4% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- 画廊图片加载渐显 ---------- */
  (function () {
    var imgs = document.querySelectorAll('.ph-img img');
    imgs.forEach(function (img) {
      if (reduceMotion) { img.classList.add('ld'); return; }
      if (img.complete && img.naturalWidth > 0) { img.classList.add('ld'); }
      else {
        img.addEventListener('load', function () { img.classList.add('ld'); });
        img.addEventListener('error', function () { img.classList.add('ld'); });
      }
    });
  })();

  /* ---------- 卡片 3D 微倾（仅桌面精确指针） ---------- */
  (function () {
    if (reduceMotion || !finePointer) return;
    document.querySelectorAll('.ph').forEach(function (card) {
      card.addEventListener('mousemove', function (ev) {
        var r = card.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width - .5;
        var y = (ev.clientY - r.top) / r.height - .5;
        card.style.transform = 'perspective(700px) translateY(-3px) rotateX(' + (-y * 4.5).toFixed(2) + 'deg) rotateY(' + (x * 4.5).toFixed(2) + 'deg)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  })();

  /* ---------- 关键数字滚动 ---------- */
  (function () {
    var nums = document.querySelectorAll('.stat-n[data-count]');
    if (!nums.length || reduceMotion || !('IntersectionObserver' in window)) return;
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        nio.unobserve(e.target);
        var el = e.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        var t0 = null;
        function step(ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min(1, (ts - t0) / 1600);
          el.textContent = String(Math.round((1 - Math.pow(1 - p, 4)) * target));
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: .5 });
    nums.forEach(function (el) { el.textContent = '0'; nio.observe(el); });
  })();

  /* ---------- Hero 大图视差 + 光标惯性视差（Oryzo 式景深响应） ---------- */
  (function () {
    if (reduceMotion) return;
    var fig = document.querySelector('.hero-figure');
    var img = fig ? fig.querySelector('img') : null;
    if (!img) return;
    var mx = 0, my = 0, cmx = 0, cmy = 0;   /* 光标目标/当前（惯性跟随） */
    if (finePointer) {
      window.addEventListener('mousemove', function (ev) {
        mx = (ev.clientX / window.innerWidth - .5) * 16;
        my = (ev.clientY / window.innerHeight - .5) * 10;
        requestTick();
      });
    }
    updaters.push(function () {
      cmx += (mx - cmx) * .08;
      cmy += (my - cmy) * .08;
      var r = fig.getBoundingClientRect();
      var vh = window.innerHeight;
      if (r.bottom < -80 || r.top > vh + 80) return;
      var p = (vh - r.top) / (vh + r.height);
      p = Math.max(0, Math.min(1, p));
      img.style.transform = 'translate(' + cmx.toFixed(1) + 'px,' + ((p - .5) * 52 + cmy).toFixed(1) + 'px) scale(1.09)';
    });
  })();

  /* ---------- 惯性平滑滚动（Oryzo/Lusion 手感核心） ----------
     桌面滚轮 → 惯性插值滚动；触屏/地图/输入框/灯箱开启时不劫持 */
  (function () {
    if (reduceMotion || !finePointer) return;
    var target = window.scrollY, current = window.scrollY, raf = null;
    var MAX_STEP = 240;   /* 单次滚轮冲量上限，防飞掠 */
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    function maxScroll() { return document.documentElement.scrollHeight - window.innerHeight; }
    function loop() {
      current += (target - current) * .12;             /* 惯性插值 */
      if (Math.abs(target - current) < .6) {
        current = target;
        window.scrollTo({ top: current, behavior: 'instant' });
        raf = null;
        return;
      }
      window.scrollTo({ top: Math.round(current), behavior: 'instant' });
      raf = requestAnimationFrame(loop);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(loop); }
    window.addEventListener('wheel', function (ev) {
      if (ev.ctrlKey) return;                          /* 缩放手势不劫持 */
      if (document.body.classList.contains('lb-lock')) return;   /* 灯箱开启时交给灯箱 */
      if (ev.target.closest('#campusMap, .maplibregl-canvas, textarea, input, .atk-editor')) return;
      ev.preventDefault();
      var max = maxScroll();
      target = clamp(target + clamp(ev.deltaY, -MAX_STEP, MAX_STEP), 0, max);
      current = clamp(current, 0, max);
      kick();
    }, { passive: false });
    /* 锚点跳转 / 键盘 / 拖动滚动条（无 rAF 在跑时）→ 同步目标 */
    window.addEventListener('scroll', function () {
      if (!raf) { target = window.scrollY; current = window.scrollY; }
    }, { passive: true });
  })();

  /* ---------- 时间线生长 ---------- */
  (function () {
    if (reduceMotion) return;
    var tl = document.querySelector('.timeline');
    if (!tl) return;
    var fill = document.createElement('span');
    fill.className = 't-fill';
    tl.insertBefore(fill, tl.firstChild);
    var items = Array.prototype.slice.call(tl.querySelectorAll('.t-item'));
    updaters.push(function () {
      var r = tl.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var p = (window.innerHeight * .72 - r.top) / r.height;
      p = Math.max(0, Math.min(1, p));
      var h = p * (r.height - 16);
      fill.style.height = h.toFixed(1) + 'px';
      items.forEach(function (item) {
        item.classList.toggle('lit', item.offsetTop + 13 <= h + 8);
      });
    });
  })();

  /* ---------- 灯箱 ---------- */
  /* 图集按文件去重：水塔区两张与画廊重复，去重后计数与全站「25 张实景照片」口径一致；
     重复图卡点击时打开画廊原卡（同一文件） */
  var figures = [];
  var figIndex = new Map();
  document.querySelectorAll('.ph').forEach(function (fig) {
    var href = fig.querySelector('a').getAttribute('href');
    if (!figIndex.has(href)) { figIndex.set(href, figures.length); figures.push(fig); }
  });
  var box = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCount = document.getElementById('lbCount');
  var lbCapT = document.getElementById('lbCapT');
  var lbCapD = document.getElementById('lbCapD');
  var cur = -1, lastFocus = null;
  var stage = box.querySelector('.lb-stage');

  /* ---------- 灯箱缩放与平移状态 ---------- */
  var zoom = 1, tx = 0, ty = 0;
  var pointers = new Map();
  var pinch = null, pan = null, suppressSwipe = false;

  function clampPan() {
    var maxX = Math.max(0, (lbImg.clientWidth * zoom - stage.clientWidth) / 2);
    var maxY = Math.max(0, (lbImg.clientHeight * zoom - stage.clientHeight) / 2);
    tx = Math.max(-maxX, Math.min(maxX, tx));
    ty = Math.max(-maxY, Math.min(maxY, ty));
  }
  function syncCursor() {
    lbImg.classList.toggle('grab', zoom > 1 && !pan);
  }
  function applyTransform() {
    lbImg.style.transform = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + zoom.toFixed(3) + ')';
  }
  function resetZoom() {
    zoom = 1; tx = 0; ty = 0;
    lbImg.classList.remove('grab', 'grabbing');
    applyTransform();
  }

  function preload(i) {
    if (i < 0 || i >= figures.length) return;
    var im = new Image();
    im.src = figures[i].querySelector('a').getAttribute('href');
  }
  function show(i) {
    if (!figures.length) return;
    cur = (i + figures.length) % figures.length;
    var fig = figures[cur];
    var link = fig.querySelector('a');
    var full = link.getAttribute('href');
    var thumb = fig.querySelector('img');
    lbImg.classList.remove('show');
    resetZoom();
    lbImg.onload = function () {
      requestAnimationFrame(function () { lbImg.classList.add('show'); });
    };
    lbImg.src = full;
    lbImg.alt = thumb ? thumb.alt : '';
    lbCount.textContent = (cur + 1) + ' / ' + figures.length;
    lbCapT.textContent = fig.getAttribute('data-cap') || '';
    lbCapD.textContent = fig.getAttribute('data-date') || '';
    preload(cur + 1);
    preload(cur - 1);
  }
  function open(i) {
    lastFocus = document.activeElement;
    box.hidden = false;
    document.body.classList.add('lb-lock');
    show(i);
    requestAnimationFrame(function () { box.classList.add('open'); });
    document.getElementById('lbClose').focus();
  }
  function close() {
    box.classList.remove('open');
    document.body.classList.remove('lb-lock');
    setTimeout(function () { box.hidden = true; }, 300);
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll('.ph').forEach(function (fig) {
    var link = fig.querySelector('a');
    var idx = figIndex.get(link.getAttribute('href'));
    link.addEventListener('click', function (ev) {
      ev.preventDefault();
      open(idx);
    });
  });

  document.getElementById('lbClose').addEventListener('click', close);
  document.getElementById('lbPrev').addEventListener('click', function () { show(cur - 1); });
  document.getElementById('lbNext').addEventListener('click', function () { show(cur + 1); });

  lbImg.draggable = false;

  /* 滚轮缩放（以光标为中心） */
  box.addEventListener('wheel', function (ev) {
    ev.preventDefault();
    var prev = zoom;
    zoom = Math.max(1, Math.min(4, zoom * (ev.deltaY < 0 ? 1.18 : 1 / 1.18)));
    if (zoom === prev) return;
    if (zoom === 1) {
      tx = 0; ty = 0;
    } else {
      var r = lbImg.getBoundingClientRect();
      tx += (ev.clientX - (r.left + r.width / 2)) * (1 - zoom / prev);
      ty += (ev.clientY - (r.top + r.height / 2)) * (1 - zoom / prev);
      clampPan();
    }
    syncCursor();
    applyTransform();
  }, { passive: false });

  /* 双击：放大 / 复位 */
  lbImg.addEventListener('dblclick', function (ev) {
    ev.preventDefault();
    if (zoom > 1) { resetZoom(); return; }
    var r = lbImg.getBoundingClientRect();
    var z2 = 2.5;
    tx += (ev.clientX - (r.left + r.width / 2)) * (1 - z2 / zoom);
    ty += (ev.clientY - (r.top + r.height / 2)) * (1 - z2 / zoom);
    zoom = z2;
    clampPan();
    syncCursor();
    applyTransform();
  });

  /* 指针：拖拽平移 + 双指捏合 */
  function ptrDist() {
    var ps = Array.from(pointers.values());
    return Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y);
  }
  stage.addEventListener('pointerdown', function (ev) {
    if (ev.target !== lbImg) return;
    if (lbImg.setPointerCapture) { try { lbImg.setPointerCapture(ev.pointerId); } catch (err) { } }
    pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (pointers.size === 2) {
      pinch = { d: ptrDist(), z: zoom };
      pan = null;
      if (ev.pointerType !== 'mouse') suppressSwipe = true;
      lbImg.classList.remove('grabbing');
    } else if (pointers.size === 1 && zoom > 1) {
      pan = { x: ev.clientX, y: ev.clientY, tx: tx, ty: ty };
      if (ev.pointerType !== 'mouse') suppressSwipe = true;
      lbImg.classList.add('grabbing');
      lbImg.classList.remove('grab');
    }
  });
  stage.addEventListener('pointermove', function (ev) {
    if (!pointers.has(ev.pointerId)) return;
    pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (pinch && pointers.size >= 2) {
      zoom = Math.max(1, Math.min(4, pinch.z * (ptrDist() / (pinch.d || 1))));
      if (zoom === 1) { tx = 0; ty = 0; } else clampPan();
      syncCursor();
      applyTransform();
    } else if (pan) {
      tx = pan.tx + (ev.clientX - pan.x);
      ty = pan.ty + (ev.clientY - pan.y);
      clampPan();
      applyTransform();
    }
  });
  function endPointer(ev) {
    if (!pointers.delete(ev.pointerId)) return;
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 0) {
      pan = null;
      lbImg.classList.remove('grabbing');
      syncCursor();
    } else if (pointers.size === 1 && zoom > 1) {
      var rest = Array.from(pointers.values())[0];
      pan = { x: rest.x, y: rest.y, tx: tx, ty: ty };
      lbImg.classList.add('grabbing');
      lbImg.classList.remove('grab');
    }
  }
  stage.addEventListener('pointerup', endPointer);
  stage.addEventListener('pointercancel', endPointer);
  box.addEventListener('click', function (ev) {
    if (ev.target === box || ev.target.classList.contains('lb-stage')) close();
  });

  document.addEventListener('keydown', function (ev) {
    if (box.hidden) return;
    if (ev.key === 'Escape') close();
    else if (ev.key === 'ArrowLeft') show(cur - 1);
    else if (ev.key === 'ArrowRight') show(cur + 1);
  });

  /* 触摸滑动翻页（缩放/平移手势时让位） */
  var touchX = null;
  box.addEventListener('touchstart', function (ev) {
    if (ev.touches.length > 1 || suppressSwipe) { touchX = null; return; }
    touchX = ev.touches[0].clientX;
  }, { passive: true });
  box.addEventListener('touchend', function (ev) {
    if (suppressSwipe) { suppressSwipe = false; touchX = null; return; }
    if (touchX === null) return;
    var dx = ev.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 48) { if (dx < 0) show(cur + 1); else show(cur - 1); }
    touchX = null;
  }, { passive: true });

  /* 初始驱动一次，保证首屏状态正确 */
  requestTick();
})();
