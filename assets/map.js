/* =========================================================
   青山湖畔的纪念册 · 时光漫游 + 校园定位图（MapLibre GL）
   依赖：maplibre/maplibre-gl.js（在此脚本之前加载）
   双语：按 <html lang> 取 SPOTS 的中/英字段
   ========================================================= */
(function () {
  'use strict';
  if (window.__mapJsLoaded) return;   /* eager 标签与惰性链路都可能执行本文件，只跑一次 */
  window.__mapJsLoaded = true;

  var LOCALE = (document.documentElement.lang || '').toLowerCase();
  var EN = LOCALE.indexOf('en') === 0;
  var JA = LOCALE.indexOf('ja') === 0;
  var ZHT = LOCALE.indexOf('zh-tw') === 0 || LOCALE.indexOf('zh-hant') === 0;
  var KO = LOCALE.indexOf('ko') === 0;
  var RU = LOCALE.indexOf('ru') === 0;
  var ES = LOCALE.indexOf('es') === 0;
  var FR = LOCALE.indexOf('fr') === 0;
  var PT = LOCALE.indexOf('pt') === 0;
  var AR = LOCALE.indexOf('ar') === 0;
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

  /* ---------- 坐标系：WGS84 → GCJ-02 ----------
     底图源从 OSM（WGS84）换成高德（GCJ-02 国测局加密坐标）后，所有经纬度都要做
     同样的偏移，否则整组标记会偏离实际位置约 500 米。下面是标准 GCJ-02 正算。 */
  var gcj02 = (function () {
    var A = 6378245.0, EE = 0.00669342162296594323;
    function outsideChina(lng, lat) { return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55); }
    function dLat(x, y) {
      var r = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
      r += (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3;
      r += (20 * Math.sin(y * Math.PI) + 40 * Math.sin(y / 3 * Math.PI)) * 2 / 3;
      r += (160 * Math.sin(y / 12 * Math.PI) + 320 * Math.sin(y * Math.PI / 30)) * 2 / 3;
      return r;
    }
    function dLng(x, y) {
      var r = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
      r += (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3;
      r += (20 * Math.sin(x * Math.PI) + 40 * Math.sin(x / 3 * Math.PI)) * 2 / 3;
      r += (150 * Math.sin(x / 12 * Math.PI) + 300 * Math.sin(x / 30 * Math.PI)) * 2 / 3;
      return r;
    }
    return function (lng, lat) {
      if (outsideChina(lng, lat)) return [lng, lat];
      var a = dLat(lng - 105, lat - 35), b = dLng(lng - 105, lat - 35);
      var radLat = lat / 180 * Math.PI, magic = Math.sin(radLat);
      magic = 1 - EE * magic * magic;
      var sq = Math.sqrt(magic);
      a = (a * 180) / ((A * (1 - EE)) / (magic * sq) * Math.PI);
      b = (b * 180) / (A / sq * Math.cos(radLat) * Math.PI);
      return [lng + b, lat + a];
    };
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
/* ---------- 五语机位补充数据（键为 img 文件名；不动 SPOTS 结构） ---------- */
  var I18N5 = {
    '01-gate.jpg': {
      ko: { n: '교문 · 문주 액자', d: '분홍 벽돌 문주에 빛나는 「난창 15중」 다섯 글자, 3년간 수백 번 오갔던 좌표.' },
      ru: { n: 'Ворота · Табличка', d: 'Пять серебряных знаков «Наньчан-15» на воротах из розового кирпича — координата тысяч приходов и уходов.' },
      es: { n: 'La puerta · La placa', d: 'Cinco caracteres plateados en los pilares de ladrillo rosa, la coordenada de mil idas y venidas.' },
      fr: { n: 'Le portail · La plaque', d: 'Cinq caractères argentés sur les piliers de brique rose, la coordonnée de mille allées et venues.' },
      pt: { n: 'O portão · A placa', d: 'Cinco caracteres prateados nos pilares de tijolo rosa, a coordenada de mil idas e vindas.' },
      ar: { n: 'البوابة · اللوحة', d: 'خمسة أحرف فضية «نانشانغ-15» على أعمدة البوابة الوردية — إحداثية عبرناها آلاف المرات في ثلاث سنوات.' }
    },
    '02-playground-firstday.jpg': {
      ko: { n: '개학 첫날의 운동장', d: '아침 7시 18분, 붉은 육상 트랙이 고등부 신입생의 첫 사진을 맞이했습니다.' },
      ru: { n: 'Стадион в первый день', d: 'В 7:18 утра красная дорожка встретила первый снимок нового старшеклассника.' },
      es: { n: 'El campo, primer día', d: 'A las 7:18 de la mañana, la pista roja recibió la primera fotografía de un estudiante nuevo.' },
      fr: { n: 'Le stade, le premier jour', d: 'À 7 h 18 du matin, la piste rouge a accueilli le premier cliché d\'un nouvel élève.' },
      pt: { n: 'O campo, primeiro dia', d: 'Às 7h18 da manhã, a pista vermelha recebeu a primeira foto de um aluno novo.' },
      ar: { n: 'الملعب في اليوم الأول', d: 'في الساعة 7:18 صباحاً، رحّب المضمار الأحمر بأول صورة لطالب جديد.' }
    },
    '04-teaching-building-winter-dusk.jpg': {
      ko: { n: '붉은 벽돌 학교 건물 · 겨울 황혼', d: '겨울 황혼 속 붉은 벽돌 학교 건물과 유리 계단실.' },
      ru: { n: 'Краснокирпичный корпус · зимние сумерки', d: 'Краснокирпичный корпус и стеклянная лестничная клетка в зимних сумерках.' },
      es: { n: 'Edificio de ladrillo rojo · crepúsculo de invierno', d: 'El edificio de ladrillo rojo y su escalera de cristal al anochecer de invierno.' },
      fr: { n: 'Bâtiment de brique rouge · crépuscule d\'hiver', d: 'Le bâtiment de brique rouge et sa cage d\'escalier de verre au crépuscule d\'hiver.' },
      pt: { n: 'Prédio de tijolo vermelho · crepúsculo de inverno', d: 'O prédio de tijolo vermelho e sua escada de vidro ao crepúsculo de inverno.' },
      ar: { n: 'مبنى التدريس · شفق الشتاء', d: 'مبنى التدريس الأحمر وبرج السلالم الزجاجي في شفق الشتاء.' }
    },
    '09-camphor-grove.jpg': {
      ko: { n: '녹나무 숲과 오래된 학교 건물', d: '녹나무 새 잎이 붉고 초록으로 물들고, 오래된 학교 건물이 나무 아래 고요히 서 있습니다.' },
      ru: { n: 'Роща камфорных деревьев и старый корпус', d: 'Новая листва краснеет и зеленеет, старый корпус тихо стоит под ними.' },
      es: { n: 'La arboleda y el edificio antiguo', d: 'Los brotes nuevos en rojo y verde, el edificio antiguo descansa bajo ellos.' },
      fr: { n: 'Le bosquet et le vieux bâtiment', d: 'Les jeunes feuilles se teintent de rouge et de vert, le vieux bâtiment repose sous eux.' },
      pt: { n: 'O bosque e o prédio antigo', d: 'Os brotos novos em vermelho e verde, o prédio antigo descansa sob eles.' },
      ar: { n: 'بستان الكافور والمبنى القديم', d: 'أوراق جديدة بالأحمر والأخضر، المبنى القديم يستريح تحتها.' }
    },
    '11-water-tower.jpg': {
      ko: { n: '오래된 급수탑', d: '모든 학교 건물보다 더 오래된 구조물이 수업의 시작과 끝을 기억해 줍니다.' },
      ru: { n: 'Старая водонапорная башня', d: 'Сооружение старше всех корпусов помнит начало и конец каждого урока.' },
      es: { n: 'La vieja torre de agua', d: 'Una estructura más vieja que todos los edificios recuerda el inicio y el fin de las clases.' },
      fr: { n: 'Le vieux château d\'eau', d: 'Une structure plus âgée que tous les bâtiments se souvient du début et de la fin des cours.' },
      pt: { n: 'A antiga torre de água', d: 'Uma estrutura mais velha que todos os prédios lembra o início e o fim das aulas.' },
      ar: { n: 'برج المياه القديم', d: 'بُنية أقدم من جميع مباني المدرسة، تتذكر بداية الحصص ونهايتها.' }
    },
    '08-tennis-court.jpg': {
      ko: { n: '내려다본 테니스 코트', d: '초록과 빨강의 테니스 코트에, 모든 쉬는 시간의 황혼이 모여 있습니다.' },
      ru: { n: 'Теннисные корты сверху', d: 'На зелёно-красных кортах собрались сумерки всех перемен.' },
      es: { n: 'Las pistas de tenis desde arriba', d: 'En las pistas verdes y rojas se reúnen los ocasos de todos los recreos.' },
      fr: { n: 'Les courts vus d\'en haut', d: 'Sur les courts verts et rouges se rassemblent les crépuscules de toutes les récréations.' },
      pt: { n: 'As quadras de tênis de cima', d: 'Nas quadras verdes e vermelhas se reúnem os entardeceres de todos os recreios.' },
      ar: { n: 'ملاعب التنس من الأعلى', d: 'في الملاعب الخضراء والحمراء يتراكم غسق كل استراحة.' }
    },
    '18-plaza-summer.jpg': {
      ko: { n: '광장 · 초승달 조각', d: '여름방학의 광장은 텅 비어 있고, 초승달 조각은 여전히 하늘을 가리킵니다.' },
      ru: { n: 'Площадь · скульптура полумесяца', d: 'Площадь в каникулы пуста, скульптура полумесяца по-прежнему указывает в небо.' },
      es: { n: 'La plaza · la escultura de la medialuna', d: 'La plaza en vacaciones está vacía, la escultura sigue apuntando al cielo.' },
      fr: { n: 'La place · la sculpture en croissant', d: 'La place des vacances est vide, la sculpture pointe toujours vers le ciel.' },
      pt: { n: 'A praça · a escultura de meia-lua', d: 'A praça nas férias está vazia, a escultura ainda aponta para o céu.' },
      ar: { n: 'الساحة · تمثال الهلال', d: 'ساحة العطلة فارغة، وتمثال الهلال لا يزال يشير إلى السماء.' }
    },
    '19-library-building-sky.jpg': {
      ko: { n: '종합동을 올려다보며', d: '종합동을 올려다보면 푸른 하늘에 큰 적란운이 떠 있습니다.' },
      ru: { n: 'Многофункциональный корпус снизу вверх', d: 'Взгляд вверх — большие кучевые облака в синем небе.' },
      es: { n: 'El edificio polivalente desde abajo', d: 'Mirando hacia arriba, grandes cúmulos en el cielo azul.' },
      fr: { n: 'Le bâtiment polyvalent vu d\'en bas', d: 'Vue vers le haut — gros cumulus dans un ciel bleu.' },
      pt: { n: 'O prédio polivalente de baixo para cima', d: 'Olhando para cima — grandes cúmulos no céu azul.' },
      ar: { n: 'المبنى متعدد الاستخدامات من الأسفل', d: 'النظر إلى الأعلى — سحب ركامية كبيرة في سماء زرقاء.' }
    }
  };

  function i18nSpot(s, key) {
    var x = I18N5[s.img];
    if (!x) return null;
    var v = KO ? x.ko : RU ? x.ru : ES ? x.es : FR ? x.fr : PT ? x.pt : AR ? x.ar : null;
    return (v && v[key]) || null;
  }
  function spotName(s) {
    if (EN) return s.nameEn || s.name;
    if (JA) return s.nameJa || s.name;
    if (ZHT) return s.nameHant || s.name;
    if (KO || RU || ES || FR || PT || AR) return i18nSpot(s, 'n') || s.name;
    return s.name;
  }
  function spotDesc(s) {
    if (EN) return s.descEn || s.desc;
    if (JA) return s.descJa || s.desc;
    if (ZHT) return s.descHant || s.desc;
    if (KO || RU || ES || FR || PT || AR) return i18nSpot(s, 'd') || s.desc;
    return s.desc;
  }
  var ARIA = EN
    ? { viewSpot: 'View spot: ', tourTo: 'Tour to: ', prev: 'Previous', next: 'Next', mapRegion: 'Location map of the Qingshanhu campus, marking eight photo positions', attribution: 'Basemap © AutoNavi (Gaode)' }
    : JA
    ? { viewSpot: '撮影スポット：', tourTo: 'この場所へ：', prev: '前の写真', next: '次の写真', mapRegion: '青山湖キャンパスの位置マップ（8つの撮影地点を表示）', attribution: '地図 © 高徳地図（AutoNavi）' }
    : ZHT
    ? { viewSpot: '查看機位：', tourTo: '漫遊到：', prev: '上一張', next: '下一張', mapRegion: '南昌市第十五中學青山湖校區定位圖，標注八個照片拍攝位置', attribution: '底圖 © 高德地圖' }
    : KO
    ? { viewSpot: '촬영 지점: ', tourTo: '이곳으로: ', prev: '이전 사진', next: '다음 사진', mapRegion: '난창시 제15중학교 칭산후 캠퍼스 위치 지도, 촬영 지점 8곳 표시', attribution: '© 가오더 지도 (AutoNavi)' }
    : RU
    ? { viewSpot: 'Точка съёмки: ', tourTo: 'Перейти к: ', prev: 'Предыдущее фото', next: 'Следующее фото', mapRegion: 'Карта кампуса Циншаньху Средней школы № 15 Наньчана, восемь точек съёмки', attribution: '© AutoNavi (Gaode)' }
    : ES
    ? { viewSpot: 'Punto de foto: ', tourTo: 'Ir a: ', prev: 'Foto anterior', next: 'Foto siguiente', mapRegion: 'Mapa del campus de Qingshanhu de la Escuela n.º 15 de Nanchang, ocho puntos fotográficos', attribution: '© AutoNavi (Gaode)' }
    : FR
    ? { viewSpot: 'Point de vue : ', tourTo: 'Aller à : ', prev: 'Photo précédente', next: 'Photo suivante', mapRegion: 'Plan du campus de Qingshanhu du lycée n° 15 de Nanchang, huit points de vue', attribution: '© AutoNavi (Gaode)' }
    : PT
    ? { viewSpot: 'Ponto de foto: ', tourTo: 'Ir para: ', prev: 'Foto anterior', next: 'Próxima foto', mapRegion: 'Mapa do campus de Qingshanhu da Escola n.º 15 de Nanchang, oito pontos fotográficos', attribution: '© AutoNavi (Gaode)' }
    : AR
    ? { viewSpot: 'نقطة التصوير: ', tourTo: 'الانتقال إلى: ', prev: 'الصورة السابقة', next: 'الصورة التالية', mapRegion: 'خريطة حرم تشينغشان هو للمدرسة الثانوية الخامسة عشرة بنانتشانغ، ثماني نقاط تصوير', attribution: '© AutoNavi (Gaode)' }
    : { viewSpot: '查看机位：', tourTo: '漫游到：', prev: '上一张', next: '下一张', mapRegion: '南昌市第十五中学青山湖校区定位图，标注八个照片拍摄位置', attribution: '底图 © 高德地图' };

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
      /* 底图是 GCJ-02，漫游目标点也要做同样偏移，否则相机与标记会错位 */
      if (!reduceMotion) __campusMap.flyTo({ center: gcj02(s.lng, s.lat), zoom: 16.5, duration: 1600, essential: true });
      else __campusMap.jumpTo({ center: gcj02(s.lng, s.lat), zoom: 16.5 });
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

  /* 定位图初始化：暴露为全局函数。map.js 提前加载（漫游不被连坐），
     而 MapLibre 由惰性加载器按需载入，加载完后调用此函数初始化定位图。 */
  window.__initCampusMap = function () {
    var el = document.getElementById('campusMap');
    if (!el || el.getAttribute('data-map-ready')) return;
    if (typeof maplibregl === 'undefined') return;   /* maplibre 还在惰性加载，等 onload 再进来；真失败由加载器 onerror 标记 */
    el.setAttribute('data-map-ready', '1');

    try {
      var map = new maplibregl.Map({
        container: el,
        style: {
          version: 8,
          sources: {
            /* 底图源：高德栅格瓦片（国内可直连、中文地名注记）。
               原先用 tile.openstreetmap.org —— 境外服务，国内移动网络（尤其微信内置
               浏览器）取不到瓦片，地图只剩空白底 + 标记点（2026-09-15 用户实测）。
               注意高德用 GCJ-02 坐标，故 center 与所有 marker 都要先过 gcj02()。 */
            base: {
              type: 'raster',
              tiles: [
                'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
                'https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
                'https://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
                'https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
              ],
              tileSize: 256, maxzoom: 18,
              attribution: ARIA.attribution
            }
          },
          layers: [
            { id: 'bg', type: 'background', paint: { 'background-color': '#EDEAE0' } },
            { id: 'base', type: 'raster', source: 'base' }
          ]
        },
        center: gcj02(115.93216, 28.72078),
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
        var mk = new maplibregl.Marker({ element: pin, anchor: 'center' }).setLngLat(gcj02(s.lng, s.lat)).addTo(map);
        mmMarkers.push({ el: pin, m: mk, s: s });
        pin.addEventListener('click', function (ev) {
          ev.stopPropagation();
          go(i);
        });
      });

      var tilesLoaded = false, tileErrors = 0;
      map.on('data', function (e) { if (e && e.tile) tilesLoaded = true; });
      map.on('error', function (e) { if (e && e.tile) tileErrors++; });
      setTimeout(function () {
        if (!tilesLoaded && tileErrors >= 3) el.setAttribute('data-map-tiles-failed', '1');
      }, 10000);

      window.addEventListener('load', function () { map.resize(); });
    } catch (err) {
      el.setAttribute('data-map-failed', '1');
    }
    paint();
  };

  /* 如果 maplibre 已经可用（例如脚本加载顺序恰好正确），立即初始化 */
  window.__initCampusMap();
  })();
