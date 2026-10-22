/* Shared by the lazy map loader; photo coordinates remain WGS84. */
(function () {
  'use strict';
  var A = 6378245.0, EE = 0.00669342162296594323;
  function gcj02(point) {
    var lng = point[0], lat = point[1];
    if (!(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55)) return point.slice();
    var x = lng - 105, y = lat - 35;
    var a = -100 + 2*x + 3*y + .2*y*y + .1*x*y + .2*Math.sqrt(Math.abs(x));
    var b = 300 + x + 2*y + .1*x*x + .1*x*y + .1*Math.sqrt(Math.abs(x));
    var waves = (20*Math.sin(6*x*Math.PI) + 20*Math.sin(2*x*Math.PI))*2/3;
    a += waves + (20*Math.sin(y*Math.PI) + 40*Math.sin(y/3*Math.PI))*2/3;
    a += (160*Math.sin(y/12*Math.PI) + 320*Math.sin(y*Math.PI/30))*2/3;
    b += waves + (20*Math.sin(x*Math.PI) + 40*Math.sin(x/3*Math.PI))*2/3;
    b += (150*Math.sin(x/12*Math.PI) + 300*Math.sin(x/30*Math.PI))*2/3;
    var rad = lat/180*Math.PI, magic = 1 - EE*Math.pow(Math.sin(rad), 2), sq = Math.sqrt(magic);
    return [lng + b*180/(A/sq*Math.cos(rad)*Math.PI), lat + a*180/((A*(1-EE))/(magic*sq)*Math.PI)];
  }
  function bd09(point) {
    var x = point[0], y = point[1], pi = Math.PI*3000/180;
    var radius = Math.sqrt(x*x+y*y)+0.00002*Math.sin(y*pi);
    var angle = Math.atan2(y,x)+0.000003*Math.cos(x*pi);
    return [radius*Math.cos(angle)+0.0065,radius*Math.sin(angle)+0.006];
  }
  function toMap(provider, point) { return provider.crs === 'bd09' ? bd09(gcj02(point)) : provider.crs === 'gcj02' ? gcj02(point) : point.slice(); }
  function fromMap(provider, point) {
    var result = point.slice();
    if (provider.crs === 'bd09') {
      result = [point[0]-0.0065,point[1]-0.006];
      for (var b = 0; b < 5; b++) {
        var baidu = bd09(result);result[0] -= baidu[0]-point[0];result[1] -= baidu[1]-point[1];
      }
      point = result.slice();
    }
    if (provider.crs === 'gcj02' || provider.crs === 'bd09') {
      for (var i = 0; i < 5; i++) {
        var projected = gcj02(result);
        result[0] -= projected[0] - point[0];
        result[1] -= projected[1] - point[1];
      }
    }
    return result;
  }
  var esriCredit = 'Tiles &copy; <a href="https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9" target="_blank" rel="noopener noreferrer">Esri</a> &mdash; Esri, Vantor, Earthstar Geographics, and the GIS User Community';
  function providers(key, nativeConfig) {
    var items = [
      {id:'gaode', mode:'road', crs:'gcj02', maxzoom:18,
        tiles:[1,2,3,4].map(function (i) { return 'https://webrd0'+i+'.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'; }),
        attribution:'&copy; <a href="https://www.amap.com/" target="_blank" rel="noopener noreferrer">高德地图 / AutoNavi</a>',
        info:'https://www.amap.com/'},
      {id:'esri', mode:'satellite', crs:'wgs84', maxzoom:19,
        tiles:['https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        attribution:esriCredit, info:'https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9'},
      {id:'wayback-2023', mode:'satellite', crs:'wgs84', maxzoom:19, published:'2023-06-29',
        tiles:['https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/47963/{z}/{y}/{x}'],
        attribution:esriCredit, info:'https://www.arcgis.com/home/item.html?id=992178c4e2cb416384dfb6339de5ac7a'}
    ];
    key = (key || '').trim();
    if (/^[a-f0-9]{32}$/i.test(key)) {
      function wmts(layer) {
        return [0,1,2,3].map(function (i) {
          return 'https://t'+i+'.tianditu.gov.cn/'+layer+'_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER='+layer+'&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILECOL={x}&TILEROW={y}&tk='+key;
        });
      }
      ['road', 'satellite', '3d'].forEach(function (mode) {
        items.push({id:'tianditu-'+mode, mode:mode, crs:'wgs84', maxzoom:18,
          tiles:wmts(mode === 'road' ? 'vec' : 'img'), labels:wmts(mode === 'road' ? 'cva' : 'cia'),
          buildings:mode === '3d' ? 'https://tiles.openfreemap.org/planet' : undefined,
          attribution:'&copy; <a href="https://www.tianditu.gov.cn/" target="_blank" rel="noopener noreferrer">天地图 / Tianditu</a>',
          info:'https://www.tianditu.gov.cn/'});
      });
    }
    items.push({id:'openfreemap-3d', mode:'3d', crs:'wgs84', maxzoom:19,
      tiles:items[1].tiles,
      buildings:'https://tiles.openfreemap.org/planet',
      attribution:esriCredit,
      info:'https://openfreemap.org/quick_start/'});
    if (nativeConfig && nativeConfig.amap && /^[a-f0-9]{32}$/i.test(nativeConfig.amap.key || '') && nativeConfig.amap.serviceHost) {
      ['road','satellite','3d'].forEach(function (mode) {
        items.push({id:'amap-'+mode, mode:mode, crs:'gcj02', engine:'amap', config:nativeConfig.amap,
          info:'https://lbs.amap.com/api/javascript-api-v2/guide/layers/official-layers'});
      });
    }
    if (nativeConfig && nativeConfig.tencent && /^[A-Z0-9]{5}(?:-[A-Z0-9]{5}){5}$/.test(nativeConfig.tencent.key || '')) {
      ['road','satellite','3d'].forEach(function (mode) {
        items.push({id:'tencent-'+mode, mode:mode, crs:'gcj02', engine:'tencent', config:nativeConfig.tencent,
          info:'https://lbs.qq.com/webApi/javascriptGL/glGuide/glBasic'});
      });
    }
    if (nativeConfig && nativeConfig.baidu && /^[a-z0-9]{32}$/i.test(nativeConfig.baidu.key || '')) {
      ['road','satellite','3d'].forEach(function (mode) {
        items.push({id:'baidu-'+mode, mode:mode, crs:'bd09', engine:'baidu', config:nativeConfig.baidu,
          info:'https://lbs.baidu.com/docs/jsapi?title=jspopularGL/guide/maptype'});
      });
    }
    return items;
  }
  function style(provider, sourceId) {
    var sources = {}, layers = [{id:'background', type:'background', paint:{'background-color':'#EDEAE0'}}];
    sources[sourceId] = {type:'raster', tiles:provider.tiles, tileSize:256, maxzoom:provider.maxzoom, attribution:provider.attribution};
    layers.push({id:'basemap', type:'raster', source:sourceId, paint:{'raster-fade-duration':0}});
    if (provider.labels) {
      sources[sourceId+'-labels'] = {type:'raster', tiles:provider.labels, tileSize:256, maxzoom:provider.maxzoom};
      layers.push({id:'labels', type:'raster', source:sourceId+'-labels'});
    }
    if (provider.buildings) {
      sources[sourceId+'-buildings'] = {type:'vector', url:provider.buildings,
        attribution:'<a href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> &copy; OpenMapTiles &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>'};
      layers.push({id:'campus-buildings', type:'fill-extrusion', source:sourceId+'-buildings',
        'source-layer':'building', minzoom:14, filter:['!=', ['get','hide_3d'], true],
        paint:{'fill-extrusion-color':'#e7d9c5','fill-extrusion-height':['coalesce',['get','render_height'],0],
          'fill-extrusion-base':['coalesce',['get','render_min_height'],0],'fill-extrusion-opacity':0.9}});
    }
    return {version:8, sources:sources, layers:layers};
  }
  window.CampusMapSources = {providers:providers, toMap:toMap, fromMap:fromMap, style:style};
})();
