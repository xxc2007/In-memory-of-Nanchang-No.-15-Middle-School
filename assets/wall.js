/* =========================================================
   青山湖畔的纪念册 · 留言墙
   依赖：自托管 Artalk（/comment/api/v2）
   ========================================================= */
(function () {
  'use strict';
  var API = '/comment/api/v2';   /* 相对路径：http/https、有无 www 均同源，手机端不会跨域 */
  var SITE = '青山湖畔的纪念册';
  var PAGE = '/guestbook';
  var AVATAR_GRADS = [
    'linear-gradient(135deg,#D97757,#B05633)',
    'linear-gradient(135deg,#5B8A72,#3D6A54)',
    'linear-gradient(135deg,#6B8AB3,#4A6A94)',
    'linear-gradient(135deg,#C9A227,#A07E18)',
    'linear-gradient(135deg,#B37A9E,#8F5A7E)',
    'linear-gradient(135deg,#7A9EB3,#55778E)',
    'linear-gradient(135deg,#D98A6B,#B0563F)',
    'linear-gradient(135deg,#94A86B,#6E7E4A)'
  ];
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function randToken() {
    /* 匿名邮箱唯一化：crypto 随机，无 Math.random */
    var bytes = new Uint8Array(8);
    (window.crypto || window.msCrypto).getRandomValues(bytes);
    var out = '';
    for (var i = 0; i < bytes.length; i++) out += ('0' + bytes[i].toString(16)).slice(-2);
    return out;
  }
  function fmtTime(s) { var m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/.exec(s || ''); return m ? (m[1] + '年' + (+m[2]) + '月' + (+m[3]) + '日 ' + m[4] + ':' + m[5]) : (s || ''); }
  function avatarEl(nick, link) {
    var d = document.createElement('div'); d.className = 'bili-avatar';
    if (link && link.indexOf('/static/images/') !== -1) {
      var img = document.createElement('img');
      img.src = link.indexOf('http') === 0 ? link : '/comment' + link;
      img.alt = (nick || '访客') + '的头像';
      d.appendChild(img);
      return d;
    }
    var ch = (nick || '访').trim().charAt(0).toUpperCase() || '访';
    d.textContent = ch;
    d.style.background = AVATAR_GRADS[hash(nick || '访') % AVATAR_GRADS.length]; return d;
  }

  /* 昵称：可自定义，本地记忆，头像首字随动 */
  var nickInput = document.getElementById('cmtNick');
  var myAvatar = document.getElementById('myAvatar');
  try { nickInput.value = localStorage.getItem('wallNick') || ''; } catch (e) { }
  function syncMyAvatar() {
    var n = (nickInput.value || '').trim();
    var ch = n ? n.charAt(0).toUpperCase() : '访';
    myAvatar.textContent = ch;
    myAvatar.style.background = AVATAR_GRADS[hash(n || '访') % AVATAR_GRADS.length];
  }
  nickInput.addEventListener('input', function () {
    syncMyAvatar();
    try { localStorage.setItem('wallNick', nickInput.value.trim()); } catch (e) { }
  });
  syncMyAvatar();

  /* 自定义头像：点击上传 → 本地居中裁剪 128×128 → 传到自托管 Artalk → 本地记住 */
  var avatarURL = '';
  try { avatarURL = localStorage.getItem('wallAvatar') || ''; } catch (e) { }
  function applyMyAvatar() {
    syncMyAvatar();
    if (avatarURL) {
      myAvatar.innerHTML = '';
      var img = document.createElement('img');
      img.src = '/comment' + avatarURL;
      img.alt = '我的头像';
      myAvatar.appendChild(img);
    }
  }
  var fileInput = document.getElementById('cmtAvatarInput');
  myAvatar.setAttribute('role', 'button');
  myAvatar.setAttribute('tabindex', '0');
  myAvatar.setAttribute('aria-label', '上传自定义头像');
  myAvatar.addEventListener('click', function () { fileInput.click(); });
  myAvatar.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); fileInput.click(); }
  });
  fileInput.addEventListener('change', function () {
    var f = fileInput.files && fileInput.files[0];
    fileInput.value = '';
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var cv = document.createElement('canvas');
        cv.width = 128; cv.height = 128;
        var ctx = cv.getContext('2d');
        var side = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 128, 128);
        cv.toBlob(function (blob) {
          if (!blob) { showNotice('头像处理失败，请换一张图片。'); return; }
          var fd = new FormData();
          fd.append('file', blob, 'avatar.jpg');
          fetch(API + '/upload', { method: 'POST', body: fd })
            .then(function (r) { return r.json(); })
            .then(function (d) {
              if (d.public_url) {
                avatarURL = d.public_url;
                try { localStorage.setItem('wallAvatar', avatarURL); } catch (e) { }
                applyMyAvatar();
                showNotice('<b>头像已更新。</b>发布留言时将展示你的自定义头像 ✦');
              } else {
                showNotice('头像上传失败：' + esc(d.msg || '未知错误'));
              }
            })
            .catch(function () { showNotice('头像上传失败，请稍后重试。'); });
        }, 'image/jpeg', 0.85);
      };
      img.onerror = function () { showNotice('图片读取失败，请换一张图片。'); };
      img.src = reader.result;
    };
    reader.readAsDataURL(f);
  });
  applyMyAvatar();

  var ta = document.getElementById('cmtInput'), count = document.getElementById('cmtCount');
  ta.addEventListener('input', function () { count.textContent = ta.value.length + ' / 500'; });

  var notice = document.getElementById('cmtNotice');
  function showNotice(html) { notice.innerHTML = html; notice.hidden = false; }

  function render(list) {
    var wrap = document.getElementById('cmtList');
    wrap.innerHTML = '';
    list.forEach(function (cm) {
      var row = document.createElement('div'); row.className = 'bili-item';
      row.appendChild(avatarEl(cm.nick, cm.link));
      var col = document.createElement('div'); col.className = 'bili-c';
      var head = document.createElement('div'); head.className = 'bili-c-head';
      head.innerHTML = '<span class="bili-nick">' + esc(cm.nick || '路过的同学') + '</span>'
        + '<span class="bili-time">' + fmtTime(cm.date) + '</span>'
        + (cm.ip_region ? '<span class="bili-ip">IP属地：' + esc(cm.ip_region) + '</span>' : '');
      col.appendChild(head);
      var body = document.createElement('div'); body.className = 'bili-content';
      body.innerHTML = esc(cm.content).replace(/\n/g, '<br>');
      col.appendChild(body);
      var like = document.createElement('div'); like.className = 'bili-like';
      like.textContent = '赞同 ' + (cm.vote_up || 0);
      col.appendChild(like);
      row.appendChild(col);
      wrap.appendChild(row);
    });
    document.getElementById('cmtEmpty').hidden = list.length > 0;
    document.getElementById('cmtTotal').textContent = list.length;
  }

  function load() {
    fetch(API + '/comments?page_key=' + encodeURIComponent(PAGE) + '&site_name=' + encodeURIComponent(SITE) + '&limit=100')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        document.getElementById('cmtLoading').hidden = true;
        render(d.comments || []);
      })
      .catch(function () {
        var el = document.getElementById('cmtLoading');
        el.hidden = false;
        el.setAttribute('data-failed', '1');
        el.style.cursor = 'pointer';
        el.textContent = '留言加载失败，点击这里重试。';
      });
  }
  document.getElementById('cmtLoading').addEventListener('click', function () {
    if (this.getAttribute('data-failed') === '1') {
      this.removeAttribute('data-failed');
      this.textContent = '加载中……';
      this.style.cursor = 'default';
      load();
    }
  });
  document.getElementById('cmtLoading').style.cursor = 'default';

  var submitting = false;
  document.getElementById('cmtSubmit').addEventListener('click', function () {
    if (submitting) return;
    var text = ta.value.trim();
    if (!text) { ta.focus(); return; }
    submitting = true;
    document.getElementById('cmtSubmit').disabled = true;
    var nick = (nickInput.value || '').trim();
    var name = nick || '路过的同学';
    var email = nick
      ? ('anon-' + hash(name).toString(36) + '@local.xxc2007.me')
      : ('anon-' + randToken() + '@local.xxc2007.me');
    fetch(API + '/comments', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_key: PAGE, page_title: '留言墙', site_name: SITE, name: name, email: email, link: avatarURL ? ('https://xxc2007.me/comment' + avatarURL) : '', content: text })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        submitting = false;
        document.getElementById('cmtSubmit').disabled = false;
        if (d.id) {
          ta.value = ''; count.textContent = '0 / 500';
          showNotice('<b>留言已提交。</b>站长审核通过后就会出现在这里，感谢你的声音 ✦');
          load();
        } else {
          showNotice('发布失败：' + esc(d.msg || '未知错误'));
        }
      })
      .catch(function () {
        submitting = false;
        document.getElementById('cmtSubmit').disabled = false;
        showNotice('网络异常，发布失败，请稍后重试。');
      });
  });

  load();
})();
