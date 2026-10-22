/* Official SDK adapter. Loaded on proximity; SDK fetched only on selection. */
(function () {
  'use strict';
  var pending;
  function loadAMap(config) {
    if (window.AMap && window.AMap.Map) return Promise.resolve(window.AMap);
    if (pending) return pending;
    pending = new Promise(function (resolve, reject) {
      window._AMapSecurityConfig = {serviceHost:new URL(config.serviceHost, location.href).href};
      var script = document.createElement('script');
      var timeout = setTimeout(function () { pending = null; reject(new Error('SDK timeout')); }, 20000);
      window.__campusAMapLoaded = function () { clearTimeout(timeout); delete window.__campusAMapLoaded; resolve(window.AMap); };
      script.src = 'https://webapi.amap.com/maps?v=2.0&key='+encodeURIComponent(config.key)+'&callback=__campusAMapLoaded';
      script.onerror = function () { clearTimeout(timeout); pending = null; reject(new Error('SDK unavailable')); };
      document.head.appendChild(script);
    });
    return pending;
  }
  var tencentPending;
  function loadTencent(config) {
    if (window.TMap && window.TMap.Map) return Promise.resolve(window.TMap);
    if (tencentPending) return tencentPending;
    tencentPending = new Promise(function (resolve,reject) {
      var script = document.createElement('script');
      var timeout = setTimeout(function () { tencentPending = null;reject(new Error('SDK timeout')); },20000);
      window.__campusTencentLoaded = function () { clearTimeout(timeout);delete window.__campusTencentLoaded;resolve(window.TMap); };
      script.src = 'https://map.qq.com/api/gljs?v=1.exp&key='+encodeURIComponent(config.key)+'&callback=__campusTencentLoaded';
      script.onerror = function () { clearTimeout(timeout);tencentPending = null;reject(new Error('SDK unavailable')); };
      document.head.appendChild(script);
    });
    return tencentPending;
  }
  function mountTencent(host, provider, camera, spots, onPick, onReady, onError) {
    var disposed = false, map, TMap, requested, selected, pins = [], r = window.CampusMapSources;
    function point(coords) { var p = r.toMap(provider,coords);return new TMap.LatLng(p[1],p[0]); }
    function reposition() {
      pins.forEach(function (pin) {
        var p = map.projectToContainer(pin.position);
        pin.el.style.left = p.x+'px';pin.el.style.top = p.y+'px';
      });
    }
    var session = {
      camera:function () { var c = map && map.getCenter();return c ? {geographic:r.fromMap(provider,[c.lng,c.lat]),zoom:map.getZoom()} : camera; },
      focus:function (spot) {
        requested = spot;camera = {geographic:[spot.lng,spot.lat],zoom:Math.max(17.3,camera.zoom)};session.select(spot);
        if (map) { map.setCenter(point(camera.geographic));map.setZoom(Math.max(17.3,map.getZoom())); }
      },
      select:function (spot) { selected = spot;pins.forEach(function (pin) { pin.el.classList.toggle('on',pin.spot.img === spot.img); }); },
      home:function () { if (map) { map.setCenter(point([115.93216,28.72078]));map.setZoom(17.3);map.setPitch(provider.mode === '3d' ? 55 : 0);map.setRotation(provider.mode === '3d' ? -20 : 0); } },
      destroy:function () { disposed = true;if (map) map.destroy();host.textContent = ''; }
    };
    loadTencent(provider.config).then(function (sdk) {
      if (disposed) return;TMap = sdk;
      map = new TMap.Map(host,{center:point(camera.geographic),zoom:camera.zoom,minZoom:3,maxZoom:20,
        viewMode:provider.mode === '3d' ? '3D' : '2D',pitch:provider.mode === '3d' ? 55 : 0,rotation:provider.mode === '3d' ? -20 : 0,
        baseMap:provider.mode === 'satellite' ? {type:'satellite',features:['base','road']} : {type:'vector'}});
      // Project DOM buttons with the public SDK API to preserve keyboard access and photo links.
      var overlay = document.createElement('div');overlay.className = 'campus-tencent-pins';host.appendChild(overlay);
      spots.forEach(function (spot,i) {
        var pin = document.createElement('button');pin.type = 'button';pin.className = 'mm-pin';pin.title = spot.title;
        pin.setAttribute('aria-label',spot.title);overlay.appendChild(pin);
        pins.push({el:pin,spot:spot,position:point([spot.lng,spot.lat])});
        pin.addEventListener('click',function (e) { e.stopPropagation();onPick(i); });
      });
      ['center_changed','zoom','pitch','rotate','resize'].forEach(function (event) { map.on(event,reposition); });
      map.on('tilesloaded',function () { if (!disposed) { reposition();onReady(); } });
      map.on('context_lost',function () { if (!disposed) onError(); });
      if (requested) session.focus(requested);else if (selected) session.select(selected);
      reposition();
    }).catch(function () { if (!disposed) onError(); });
    return session;
  }
  function loadBaidu(config, doc, scope) {
    return new Promise(function (resolve,reject) {
      var script = doc.createElement('script');
      var timeout = setTimeout(function () { reject(new Error('SDK timeout')); },20000);
      scope.__campusBaiduLoaded = function () {
        clearTimeout(timeout);delete scope.__campusBaiduLoaded;
        if (!scope.BMapGL || !scope.BMapGL.Map) { reject(new Error('SDK unavailable'));return; }
        resolve({sdk:scope.BMapGL,scope:scope,doc:doc});
      };
      script.src = 'https://api.map.baidu.com/api?v=1.0&type=webgl&ak='+encodeURIComponent(config.key)+'&callback=__campusBaiduLoaded';
      script.onerror = function () { clearTimeout(timeout);reject(new Error('SDK unavailable')); };
      doc.head.appendChild(script);
    });
  }
  function mountBaidu(host, provider, camera, spots, onPick, onReady, onError) {
    var disposed = false, map, BMap, requested, selected, pins = [], r = window.CampusMapSources;
    function point(coords) { var p = r.toMap(provider,coords);return new BMap.Point(p[0],p[1]); }
    // Normalize Baidu's level numbering to the shared Web Mercator camera.
    var zoomOffset = 1;
    function view(coords,zoom) { map.setCenter(point(coords),{noAnimation:true});map.setZoom(zoom+zoomOffset); }
    var session = {
      camera:function () { var c = map && map.getCenter();return c ? {geographic:r.fromMap(provider,[c.lng,c.lat]),zoom:map.getZoom()-zoomOffset} : camera; },
      focus:function (spot) {
        requested = spot;camera = {geographic:[spot.lng,spot.lat],zoom:Math.max(17.3,camera.zoom)};session.select(spot);
        if (map) view(camera.geographic,Math.max(17.3,map.getZoom()-zoomOffset));
      },
      select:function (spot) { selected = spot;pins.forEach(function (pin) { pin.el.classList.toggle('on',pin.spot.img === spot.img);pin.label.setContent(pin.el.outerHTML); }); },
      home:function () {
        if (!map) return;view([115.93216,28.72078],17.3);
        map.setTilt(provider.mode === '3d' ? 55 : 0,{noAnimation:true});
        map.setHeading(provider.mode === '3d' ? -20 : 0,{noAnimation:true});
      },
      destroy:function () { disposed = true;if (map) map.destroy();host.textContent = ''; }
    };
    // Each SDK instance gets its own window: shared SDK state
    // can outlive destroy() and break later maps when switching providers quickly.
    var frame = document.createElement('iframe');frame.className = 'campus-baidu-frame';frame.title = 'Baidu Maps';
    frame.srcdoc = '<!doctype html><html><head><meta charset="utf-8"><style>html,body,#baiduMap{margin:0;width:100%;height:100%;overflow:hidden}#baiduMap .mm-pin{width:16px;height:16px;border-radius:50%;background:rgba(250,249,245,.88);border:1px solid rgba(0,0,0,.4);cursor:pointer;box-sizing:border-box;position:relative;transform:translate(-50%,-50%)}#baiduMap .mm-pin:after{content:"";position:absolute;inset:-14px}#baiduMap .mm-pin.on{width:24px;height:24px;background:#c15f3c;border:2.5px solid #faf9f5;box-shadow:0 0 0 4px rgba(217,119,87,.4),0 2px 8px rgba(0,0,0,.5)}</style></head><body><div id="baiduMap"></div></body></html>';
    new Promise(function (resolve,reject) {
      frame.onload = function () { frame.onload = null;if (disposed) return;loadBaidu(provider.config,frame.contentDocument,frame.contentWindow).then(resolve,reject); };
      host.appendChild(frame);
    }).then(function (loaded) {
      if (disposed) return;BMap = loaded.sdk;
      map = new BMap.Map(loaded.doc.getElementById('baiduMap'),{
        minZoom:3,maxZoom:21,enableAutoResize:true,fixCenterWhenResize:true,
        enableWheelZoom:true,enableTilt:provider.mode === '3d',enableRotate:provider.mode === '3d',
        tilt:provider.mode === '3d' ? 55 : 0,heading:provider.mode === '3d' ? -20 : 0,
        mapType:provider.mode === 'satellite' ? loaded.scope.BMAP_SATELLITE_MAP : loaded.scope.BMAP_NORMAL_MAP,
        displayOptions:{building:provider.mode === '3d',isFlat:provider.mode !== '3d'}});
      map.addControl(new BMap.NavigationControl3D());
      spots.forEach(function (spot,i) {
        var pin = document.createElement('button');pin.type = 'button';pin.className = 'mm-pin campus-baidu-pin';pin.title = spot.title;
        pin.setAttribute('aria-label',spot.title);
        // Native overlays handle layout during movement, rotation and resizing.
        // Serialize a DOM-created button to keep photo titles escaped.
        var label = new BMap.Label(pin.outerHTML,{position:point([spot.lng,spot.lat]),
          styles:{border:'none',background:'transparent',padding:'0',overflow:'visible'}});
        label.setStyle({border:'none',background:'transparent',padding:'0',overflow:'visible'});
        map.addOverlay(label);pins.push({el:pin,spot:spot,label:label});
        label.addEventListener('click',function () { if (!disposed) onPick(i); });
      });
      map.addEventListener('tilesloaded',function () { if (!disposed) onReady(); });
      // GL exposes map initialization via load; tilesloaded is not portable
      // across Baidu raster/vector modes. UI calls this state "Map ready".
      map.addEventListener('load',function () { if (!disposed) onReady(); });
      ['style_loaded_error','style_loaded_timeout'].forEach(function (event) { map.addEventListener(event,function () { if (!disposed) onError(); }); });
      map.centerAndZoom(point(camera.geographic),camera.zoom+zoomOffset);
      map.setMapType(provider.mode === 'satellite' ? loaded.scope.BMAP_SATELLITE_MAP : loaded.scope.BMAP_NORMAL_MAP);
      map.setDisplayOptions({building:provider.mode === '3d'});
      map.enableScrollWheelZoom();map.enableResizeOnCenter();
      map.setTilt(provider.mode === '3d' ? 55 : 0);map.setHeading(provider.mode === '3d' ? -20 : 0);
      if (requested) session.focus(requested);else if (selected) session.select(selected);
    }).catch(function () { if (!disposed) onError(); });
    return session;
  }
  function mount(host, provider, camera, spots, onPick, onReady, onError) {
    if (provider.engine === 'baidu') return mountBaidu(host,provider,camera,spots,onPick,onReady,onError);
    if (provider.engine === 'tencent') return mountTencent(host,provider,camera,spots,onPick,onReady,onError);
    var disposed = false, map, markers = [], selected, requested;
    var r = window.CampusMapSources;
    var session = {
      camera:function () {
        if (!map) return camera;
        var center = map.getCenter();
        return {geographic:r.fromMap(provider,[center.lng,center.lat]),zoom:map.getZoom()};
      },
      focus:function (spot) {
        requested = spot;
        camera = {geographic:[spot.lng,spot.lat],zoom:Math.max(17.3,camera.zoom)};
        session.select(spot);
        if (map) map.setZoomAndCenter(Math.max(17.3,map.getZoom()), r.toMap(provider,[spot.lng,spot.lat]), true);
      },
      select:function (spot) {
        selected = spot;
        markers.forEach(function (m) { m.el.classList.toggle('on', m.spot.img === spot.img); });
      },
      home:function () {
        if (!map) return;
        map.setZoomAndCenter(17.3,r.toMap(provider,[115.93216,28.72078]),true);
        map.setPitch(provider.mode === '3d' ? 55 : 0);map.setRotation(provider.mode === '3d' ? -20 : 0);
      },
      destroy:function () { disposed = true; if (map) map.destroy(); host.textContent = ''; }
    };
    loadAMap(provider.config).then(function (AMap) {
      if (disposed) return;
      var layers;
      if (provider.mode === 'satellite') layers = [new AMap.TileLayer.Satellite(),new AMap.TileLayer.RoadNet()];
      map = new AMap.Map(host, {center:r.toMap(provider,camera.geographic),zoom:camera.zoom,resizeEnable:true,
        zooms:[3,20],viewMode:provider.mode === '3d' ? '3D' : '2D',pitch:provider.mode === '3d' ? 55 : 0,
        rotation:provider.mode === '3d' ? -20 : 0,showBuildingBlock:true,layers:layers});
      AMap.plugin('AMap.ToolBar',function () {
        if (!disposed) map.addControl(new AMap.ToolBar({position:'RT'}));
      });
      spots.forEach(function (spot,i) {
        var pin = document.createElement('button');pin.type = 'button';pin.className = 'mm-pin';pin.title = spot.title;
        pin.setAttribute('aria-label',spot.title);
        var marker = new AMap.Marker({position:r.toMap(provider,[spot.lng,spot.lat]),content:pin,anchor:'center'});
        map.add(marker);markers.push({el:pin,spot:spot});
        pin.addEventListener('click',function (e) { e.stopPropagation();onPick(i); });
      });
      if (requested) session.focus(requested);else if (selected) session.select(selected);
      map.on('complete',function () { if (!disposed) onReady(); });
      map.on('error',function () { if (!disposed) onError(); });
    }).catch(function () { if (!disposed) onError(); });
    return session;
  }
  window.CampusNativeMaps = {mount:mount};
})();
