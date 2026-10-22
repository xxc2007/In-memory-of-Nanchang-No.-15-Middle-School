/* Multi-source UI. Loaded only when the map approaches the viewport. */
(function () {
  'use strict';
  var copy = {
    zh:['校园地图','卫星影像','地图来源','回到校园','重新加载','正在加载底图…','底图已加载','底图暂时无法加载，请重试或切换来源。','来源详情','高德地图','Esri · 当前影像','Esri · 历史版本 2023','天地图','历史底图发布于 2023-06-29，不代表影像拍摄日期。','照片标记包含估计位置，仅供校园回忆参考。'],
    'zh-hant':['校園地圖','衛星影像','地圖來源','回到校園','重新載入','正在載入底圖…','底圖已載入','底圖暫時無法載入，請重試或切換來源。','來源詳情','高德地圖','Esri · 目前影像','Esri · 歷史版本 2023','天地圖','歷史底圖發布於 2023-06-29，不代表影像拍攝日期。','照片標記包含估計位置，僅供校園回憶參考。'],
    en:['Campus map','Satellite','Map source','Back to campus','Retry','Loading basemap…','Basemap loaded','Basemap unavailable. Retry or choose another source.','Source details','AutoNavi','Esri · Current imagery','Esri · Archive 2023','Tianditu','Basemap published on 2023-06-29; this is not the image capture date.','Some photo positions are estimated; use them as a guide to campus memories.'],
    ja:['キャンパス地図','衛星画像','地図ソース','キャンパスへ','再読み込み','地図を読み込み中…','地図を読み込みました','地図を読み込めません。再試行するかソースを変更してください。','ソースの詳細','高徳地図','Esri · 現在の画像','Esri · 過去の版 2023','天地图','地図の公開日：2023-06-29。画像の撮影日ではありません。','写真の位置には推定が含まれます。キャンパスの思い出をたどる目安です。'],
    ko:['캠퍼스 지도','위성 영상','지도 출처','캠퍼스로','다시 시도','지도를 불러오는 중…','지도 로드 완료','지도를 불러올 수 없습니다. 다시 시도하거나 출처를 변경하세요.','출처 정보','가오더 지도','Esri · 현재 영상','Esri · 과거 버전 2023','톈디투','지도 발행일은 2023-06-29이며 영상 촬영일과 다릅니다.','일부 사진 위치는 추정치이며 캠퍼스 추억을 위한 참고 자료입니다.'],
    ru:['Карта кампуса','Спутник','Источник карты','К кампусу','Повторить','Загрузка карты…','Карта загружена','Карта недоступна. Повторите или смените источник.','Об источнике','AutoNavi','Esri · Текущие снимки','Esri · Архив 2023','Tianditu','Карта опубликована 2023-06-29. Это не дата съёмки.','Некоторые точки съёмки указаны приблизительно, для воспоминаний о кампусе.'],
    es:['Mapa del campus','Satélite','Fuente del mapa','Volver al campus','Reintentar','Cargando mapa…','Mapa cargado','Mapa no disponible. Reintenta o cambia la fuente.','Sobre la fuente','AutoNavi','Esri · Imágenes actuales','Esri · Archivo 2023','Tianditu','Mapa publicado el 2023-06-29; no es la fecha de captura de las imágenes.','Algunas posiciones son aproximadas y sirven como guía de recuerdos del campus.'],
    fr:['Plan du campus','Satellite','Source du plan','Revenir au campus','Réessayer','Chargement du plan…','Plan chargé','Plan indisponible. Réessayez ou changez de source.','Détails de la source','AutoNavi','Esri · Images actuelles','Esri · Archives 2023','Tianditu','Plan publié le 2023-06-29 ; cette date ne correspond pas à la prise de vue.','Certaines positions sont approximatives et servent de repères pour les souvenirs du campus.'],
    pt:['Mapa do campus','Satélite','Fonte do mapa','Voltar ao campus','Tentar novamente','A carregar o mapa…','Mapa carregado','Mapa indisponível. Tente novamente ou altere a fonte.','Sobre a fonte','AutoNavi','Esri · Imagens atuais','Esri · Arquivo 2023','Tianditu','Mapa publicado em 2023-06-29; esta não é a data de captura das imagens.','Algumas posições são aproximadas e servem de referência para as memórias do campus.'],
    ar:['خريطة الحرم','صور الأقمار الصناعية','مصدر الخريطة','العودة إلى الحرم','إعادة المحاولة','جارٍ تحميل الخريطة…','تم تحميل الخريطة','الخريطة غير متاحة. أعد المحاولة أو غيّر المصدر.','تفاصيل المصدر','AutoNavi','Esri · الصور الحالية','Esri · أرشيف 2023','Tianditu','نُشرت الخريطة في 2023-06-29، وهذا ليس تاريخ التقاط الصور.','بعض مواقع الصور تقديرية، وهي دليل لذكريات الحرم.']
  };
  var threeCopy = {
    zh:['3D 视图','Esri 影像 + OpenFreeMap 建筑','建筑轮廓来自开放数据；楼高包含默认估计值，不代表实测楼高，也不是校园实景模型。'],
    'zh-hant':['3D 視圖','Esri 影像 + OpenFreeMap 建築','建築輪廓來自開放資料；樓高包含預設估計值，不代表實測樓高，也並非校園實景模型。'],
    en:['3D view','Esri imagery + OpenFreeMap buildings','Building footprints come from open data. Heights include default estimates, not measured heights or a photorealistic campus model.'],
    ja:['3D 建物','OpenFreeMap · 建物と衛星画像','建物の範囲と高さは公開データに基づき、一部は推定値です。キャンパスの実写3Dモデルではありません。'],
    ko:['3D 건물','OpenFreeMap · 건물 + 위성','건물 범위와 높이는 공개 데이터 기반이며 일부는 추정치입니다. 캠퍼스 실사 모델이 아닙니다.'],
    ru:['3D-здания','OpenFreeMap · Здания и снимки','Контуры и высоты взяты из открытых данных; некоторые высоты приблизительны. Это схема зданий, а не фотореалистичная модель кампуса.'],
    es:['Edificios 3D','OpenFreeMap · Edificios e imágenes','Los edificios y sus alturas proceden de datos abiertos; algunas alturas son estimadas. Es una representación, no un modelo fotorrealista del campus.'],
    fr:['Bâtiments 3D','OpenFreeMap · Bâtiments et images','Les bâtiments et hauteurs proviennent de données ouvertes ; certaines hauteurs sont estimées. Ce plan ne constitue pas un modèle photoréaliste du campus.'],
    pt:['Edifícios 3D','OpenFreeMap · Edifícios e imagens','Os edifícios e alturas vêm de dados abertos; algumas alturas são estimadas. Esta representação não é um modelo fotorrealista do campus.'],
    ar:['مبانٍ ثلاثية الأبعاد','OpenFreeMap · مبانٍ وصور','حدود المباني وارتفاعاتها من بيانات مفتوحة وبعض الارتفاعات تقديرية. هذا تصور للمباني وليس نموذجاً واقعياً للحرم.']
  };
  function localeKey(locale) {
    locale = (locale || 'zh').toLowerCase();
    return /^zh-(hant|tw)/.test(locale) ? 'zh-hant' : locale.split('-')[0];
  }
  function localeText(locale) {
    locale = (locale || 'zh').toLowerCase();
    if (/^zh-(hant|tw)/.test(locale)) return copy['zh-hant'];
    return copy[locale.split('-')[0]] || copy.en;
  }
  function mount(map, el, providers, onProviderChanged, reduceMotion, tour) {
    var r = window.CampusMapSources, t = localeText(document.documentElement.lang);
    var three = threeCopy[localeKey(document.documentElement.lang)] || threeCopy.en;
    var provider = providers[0], revision = 0, sourceId = 'base-0', timer, sawTile = false, errors = 0;
    var remembered = {road:provider.id, satellite:'esri', '3d':'openfreemap-3d'};
    ['road','satellite','3d'].forEach(function (mode) {
      if (providers.some(function (p) { return p.id === 'amap-'+mode; })) remembered[mode] = 'amap-'+mode;
    });
    var sourceIds = ['base-0'], seenSources = {};
    var nativeSession = null, nativeHost = document.createElement('div');
    nativeHost.className = 'campus-native-map';nativeHost.hidden = true;el.appendChild(nativeHost);
    tour = tour || {spots:[],onPick:function () {},current:function () { return null; }};
    function node(tag, className, text) {
      var n = document.createElement(tag);
      if (className) n.className = className;
      if (text) n.textContent = text;
      return n;
    }
    function button(text, action) {
      var n = node('button', 'map-button', text); n.type = 'button';
      n.addEventListener('click', action); return n;
    }
    var toolbar = node('div', 'map-toolbar');
    toolbar.setAttribute('role', 'group'); toolbar.setAttribute('aria-label', t[2]);
    var modes = node('div', 'map-modes');
    var road = button(t[0], function () { selectMode('road'); });
    var satellite = button(t[1], function () { selectMode('satellite'); });
    var buildings = button(three[0], function () { selectMode('3d'); });
    road.setAttribute('data-map-mode', 'road'); satellite.setAttribute('data-map-mode', 'satellite');
    buildings.setAttribute('data-map-mode', '3d');
    modes.appendChild(road); modes.appendChild(satellite); modes.appendChild(buildings); toolbar.appendChild(modes);
    var label = node('label', 'map-source-label', t[2]);
    var select = node('select', 'map-source-select'); select.id = 'campusMapSource';
    label.setAttribute('for', select.id); label.appendChild(select); toolbar.appendChild(label);
    var home = button(t[3], function () {
      if (nativeSession) { nativeSession.home(); return; }
      map.stop();
      var options = {center:r.toMap(provider, [115.93216,28.72078]), zoom:17.3, bearing:provider.mode === '3d' ? -20 : 0, pitch:provider.mode === '3d' ? 55 : 0};
      if (reduceMotion) map.jumpTo(options); else map.easeTo(Object.assign({duration:600}, options));
    });
    toolbar.appendChild(home);
    var feedback = node('div', 'map-feedback');
    var status = node('span', 'map-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    var retry = button(t[4], function () { switchTo(provider); }); retry.hidden = true;
    var details = node('a', 'map-source-details', t[8]); details.target = '_blank'; details.rel = 'noopener noreferrer';
    var note = node('p', 'map-source-note');
    feedback.appendChild(status); feedback.appendChild(retry); feedback.appendChild(details);
    var container = el.parentNode;
    container.parentNode.insertBefore(toolbar, container);
    container.parentNode.insertBefore(feedback, container.nextSibling);
    container.parentNode.insertBefore(note, feedback.nextSibling);

    function title(p) { return p.engine === 'tencent' ? (/^zh/i.test(document.documentElement.lang) ? '腾讯地图' : 'Tencent Maps') + ' · JS API' : p.engine === 'amap' ? t[9] + ' · JS API' : p.mode === '3d' ? (p.id === 'tianditu-3d' ? t[12] + ' + OpenFreeMap' : three[1]) : p.id === 'gaode' ? t[9] : p.id === 'esri' ? t[10] : p.published ? t[11] : t[12]; }
    function updateUI() {
      road.setAttribute('aria-pressed', String(provider.mode === 'road'));
      satellite.setAttribute('aria-pressed', String(provider.mode === 'satellite'));
      buildings.setAttribute('aria-pressed', String(provider.mode === '3d'));
      select.textContent = '';
      providers.filter(function (p) { return p.mode === provider.mode; }).forEach(function (p) {
        var option = node('option', '', title(p)); option.value = p.id; select.appendChild(option);
      });
      select.value = provider.id;
      details.href = provider.info;
      note.textContent = (provider.published ? t[13] + ' ' : provider.mode === '3d' && !provider.engine ? three[2] + ' ' : '') + t[14];
      el.setAttribute('data-map-mode', provider.mode);
      el.setAttribute('data-map-provider', provider.id);
    }
    function setState(state) {
      el.setAttribute('data-map-state', state);
      el.setAttribute('aria-busy', String(state === 'loading'));
      status.textContent = title(provider) + ' · ' + t[state === 'ready' ? 6 : state === 'failed' ? 7 : 5];
      retry.hidden = state !== 'failed';
      if (state !== 'loading') clearTimeout(timer);
    }
    function loading() {
      clearTimeout(timer); sawTile = false; seenSources = {}; errors = 0; setState('loading');
      var current = sourceId;
      timer = setTimeout(function () { if (sourceId === current) setState('failed'); }, 15000);
    }
    function switchTo(next) {
      map.stop();
      var center = map.getCenter();
      var camera = nativeSession ? nativeSession.camera() : {geographic:r.fromMap(provider,[center.lng,center.lat]),zoom:map.getZoom()};
      var geographic = camera.geographic, zoom = camera.zoom;
      if (nativeSession) { nativeSession.destroy(); nativeSession = null; }
      window.__campusNativeFocus = null;
      provider = next; remembered[provider.mode] = provider.id; sourceId = 'base-' + (++revision);
      sourceIds = [];
      updateUI(); loading();
      try {
        if (provider.engine) {
          nativeHost.hidden = false;el.setAttribute('data-map-engine',provider.engine);
          onProviderChanged(provider);
          var requestId = sourceId;
          nativeSession = window.CampusNativeMaps.mount(nativeHost,provider,camera,tour.spots,tour.onPick,
            function () { if (sourceId === requestId) setState('ready'); },
            function () { if (sourceId === requestId) setState('failed'); });
          var current = tour.current();if (current) nativeSession.select(current);
          window.__campusNativeFocus = function (spot) { if (nativeSession) nativeSession.focus(spot); };
          return;
        }
        nativeHost.hidden = true;el.removeAttribute('data-map-engine');
        // New IDs isolate late source events from the previous basemap.
        var nextStyle = r.style(provider, sourceId);
        sourceIds = Object.keys(nextStyle.sources);
        map.setStyle(nextStyle, {diff:false});
        map.jumpTo({center:r.toMap(provider, geographic), zoom:zoom, bearing:provider.mode === '3d' ? -20 : 0, pitch:provider.mode === '3d' ? 55 : 0});
        onProviderChanged(provider);
      } catch (error) { setState('failed'); }
    }
    function selectMode(mode) {
      if (mode === provider.mode) return;
      var next = providers.find(function (p) { return p.id === remembered[mode]; });
      if (next) switchTo(next);
    }
    select.addEventListener('change', function () {
      var next = providers.find(function (p) { return p.id === select.value && p.mode === provider.mode; });
      if (next && next !== provider) switchTo(next);
    });
    map.on('sourcedata', function (e) {
      // MapLibre 6 raster tile events omit sourceDataType; inspect the tile itself.
      if (sourceIds.indexOf(e.sourceId) < 0 || !e.tile || e.tile.state !== 'loaded') return;
      sawTile = true;
      seenSources[e.sourceId] = true;
      if (!errors && sourceIds.every(function (id) { return seenSources[id] && map.isSourceLoaded(id); })) setState('ready');
    });
    map.on('idle', function () { if (!errors && sawTile && sourceIds.every(function (id) { return seenSources[id]; }) && map.areTilesLoaded()) setState('ready'); });
    map.on('error', function (e) {
      if (sourceIds.indexOf(e.sourceId) >= 0) { errors++; setState('failed'); }
    });
    map.on('remove', function () {
      clearTimeout(timer);if (nativeSession) nativeSession.destroy();window.__campusNativeFocus = null;
      nativeHost.remove();toolbar.remove();feedback.remove();note.remove();
    });
    var initial = providers.find(function (p) { return p.id === remembered.road; });
    if (initial && initial !== provider) switchTo(initial);else { updateUI(); loading(); }
    return {switchTo:switchTo};
  }
  window.CampusMapControls = {mount:mount};
})();
