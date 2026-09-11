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
  /* fetch + 超时兜底：网络挂起时由 AbortController 中断，避免按钮永久卡在等待态 */
  function fetchJSON(url, opts, timeoutMs) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, timeoutMs || 15000);
    opts = opts || {};
    opts.signal = ctrl.signal;
    return fetch(url, opts).then(function (r) {
      clearTimeout(timer);
      return r.json();
    }, function (err) {
      clearTimeout(timer);
      throw err;
    });
  }
  function randToken() {
    /* 匿名邮箱唯一化：crypto 随机，无 Math.random */
    var bytes = new Uint8Array(8);
    window.crypto.getRandomValues(bytes);
    var out = '';
    for (var i = 0; i < bytes.length; i++) out += ('0' + bytes[i].toString(16)).slice(-2);
    return out;
  }
  function fmtTime(s) { var m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/.exec(s || ''); return m ? (m[1] + '年' + (+m[2]) + '月' + (+m[3]) + '日 ' + m[4] + ':' + m[5]) : (s || ''); }
  /* 头像只放行本站 Artalk 上传资源——最终一律归一化为以 /comment/ 开头的同源相对路径，
     与页面协议/域名无关（http/https、apex/www 均可渲染）；
     即使 link 含外部域名，截取后仍是本站路径，不会向外部发请求（防泄露 IP/可追踪） */
  function avatarImgSrc(link) {
    if (typeof link !== 'string' || link.indexOf('/static/images/') === -1) return '';
    var i = link.indexOf('/comment/');
    if (i !== -1) return link.slice(i);
    if (link.indexOf('/static/images/') === 0) return '/comment' + link;
    return '';
  }
  /* 入库归一化：Artalk 服务端要求 link 为合法绝对 URL（相对路径会被拒：「无效的链接」）。
     用「当前 origin + 同源相对路径」拼回绝对地址提交；渲染端 avatarImgSrc 会再做
     与 origin 无关的宽容归一化，因此 http/https、apex/www 打开都能正常显示头像 */
  function toLink(u) {
    var rel = avatarImgSrc(u);
    return rel ? (location.origin + rel) : '';
  }
  function avatarEl(nick, link) {
    var d = document.createElement('div'); d.className = 'bili-avatar';
    var src = avatarImgSrc(link);
    if (src) {
      var img = document.createElement('img');
      img.src = src;
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
    var src = avatarImgSrc(avatarURL);
    if (src) {
      myAvatar.innerHTML = '';
      var img = document.createElement('img');
      img.src = src;
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
          fetchJSON(API + '/upload', { method: 'POST', body: fd })
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
            .catch(function (err) { showNotice(err && err.name === 'AbortError' ? '头像上传超时，请检查网络后重试。' : '头像上传失败，请稍后重试。'); });
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

  var THUMB_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>';

  /* 线程化：rid=0 为根评论，rid=N 为对评论 N 的回复（回复的回复也归到同一根下，@ 指向被回复人） */
  function buildThreads(list) {
    var byId = {};
    list.forEach(function (cm) { byId[cm.id] = cm; });
    function rootId(cm, depth) {
      if (!cm.rid || cm.rid === 0 || depth > 8) return cm.id;
      var p = byId[cm.rid];
      return p ? rootId(p, depth + 1) : cm.id;
    }
    var roots = [], repliesByRoot = {};
    list.forEach(function (cm) {
      if (!cm.rid || cm.rid === 0) { roots.push(cm); return; }
      var r = rootId(cm, 0);
      (repliesByRoot[r] = repliesByRoot[r] || []).push(cm);
    });
    roots.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    Object.keys(repliesByRoot).forEach(function (k) {
      repliesByRoot[k].sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    });
    return { roots: roots, repliesByRoot: repliesByRoot, byId: byId };
  }

  function actionsRow(cm, targetNick) {
    var bar = document.createElement('div'); bar.className = 'bili-actions';
    var like = document.createElement('button');
    like.type = 'button'; like.className = 'bili-like';
    like.setAttribute('aria-label', '赞同这条留言');
    like.innerHTML = THUMB_SVG + '<span>' + (cm.vote_up || 0) + '</span>';
    like.addEventListener('click', function () {
      if (like.dataset.busy) return;
      like.dataset.busy = '1';
      like.classList.add('voting');
      /* Artalk 投票为切换语义：同访客重复点击=取消赞；响应携带最新计数与状态 */
      fetchJSON(API + '/votes/comment/' + cm.id + '/up', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}'
      })
        .then(function (d) {
          delete like.dataset.busy;
          like.classList.remove('voting');
          like.querySelector('span').textContent = d.up || 0;
          like.classList.toggle('voted', !!d.is_up);
        })
        .catch(function () { delete like.dataset.busy; like.classList.remove('voting'); });
    });
    bar.appendChild(like);
    var rep = document.createElement('button');
    rep.type = 'button'; rep.className = 'bili-reply-btn'; rep.textContent = '回复';
    rep.setAttribute('aria-label', '回复 ' + (cm.nick || '路过的同学'));
    rep.addEventListener('click', function () { toggleReplyEditor(cm, targetNick, bar); });
    bar.appendChild(rep);
    return bar;
  }

  /* 内联回复编辑器：出现在被回复条目的操作行下方，B站式迷你框 */
  function toggleReplyEditor(cm, targetNick, anchorBar) {
    var exist = anchorBar.parentNode.querySelector('.bili-reply-editor');
    if (exist) { exist.remove(); return; }
    var box = anchorBar.parentNode.querySelector('.bili-reply-editor-active');
    if (box) box.remove();
    var ed = document.createElement('div'); ed.className = 'bili-reply-editor bili-reply-editor-active';
    var ta = document.createElement('textarea');
    ta.rows = 2; ta.maxLength = 500;
    ta.placeholder = '回复 @' + (targetNick || cm.nick || '路过的同学') + '：';
    ta.setAttribute('aria-label', ta.placeholder);
    var foot = document.createElement('div'); foot.className = 'bili-reply-foot';
    var cnt = document.createElement('span'); cnt.className = 'bili-reply-cnt'; cnt.textContent = '0 / 500';
    var cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'bili-reply-cancel'; cancel.textContent = '取消';
    var submit = document.createElement('button'); submit.type = 'button'; submit.className = 'bili-reply-submit'; submit.textContent = '发布';
    foot.appendChild(cnt); foot.appendChild(cancel); foot.appendChild(submit);
    ed.appendChild(ta); ed.appendChild(foot);
    ta.addEventListener('input', function () { cnt.textContent = ta.value.length + ' / 500'; });
    ta.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); submit.click(); }
    });
    cancel.addEventListener('click', function () { ed.remove(); });
    submit.addEventListener('click', function () {
      var text = ta.value.trim();
      if (!text) { ta.focus(); return; }
      submit.disabled = true;
      var name = ((nickInput.value || '').trim()) || '路过的同学';
      var email = (nickInput.value || '').trim()
        ? ('anon-' + hash(name).toString(36) + '@local.xxc2007.me')
        : ('anon-' + randToken() + '@local.xxc2007.me');
      fetchJSON(API + '/comments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_key: PAGE, page_title: '留言墙', site_name: SITE, name: name, email: email, link: toLink(avatarURL), content: text, rid: cm.id })
      })
        .then(function (d) {
          if (d.id) { ed.remove(); showNotice('<b>回复已提交。</b>站长审核通过后就会出现在这里 ✦'); load(); }
          else { submit.disabled = false; showNotice('回复失败：' + esc(d.msg || '未知错误')); }
        })
        .catch(function (err) {
          submit.disabled = false;
          showNotice(err && err.name === 'AbortError' ? '回复超时，请检查网络后重试。' : '网络异常，回复失败，请稍后重试。');
        });
    });
    anchorBar.insertAdjacentElement('afterend', ed);
    ta.focus();
  }

  function replyItem(cm, targetNick, byId) {
    var row = document.createElement('div'); row.className = 'bili-item bili-reply';
    row.appendChild(avatarEl(cm.nick, cm.link));
    var col = document.createElement('div'); col.className = 'bili-c';
    var head = document.createElement('div'); head.className = 'bili-c-head';
    var at = '';
    if (targetNick && targetNick !== cm.nick) at = '<span class="bili-reply-at">回复 @' + esc(targetNick) + '</span>';
    head.innerHTML = '<span class="bili-nick">' + esc(cm.nick || '路过的同学') + '</span>' + at
      + '<span class="bili-time">' + fmtTime(cm.date) + '</span>'
      + (cm.ip_region ? '<span class="bili-ip">IP属地：' + esc(cm.ip_region) + '</span>' : '');
    col.appendChild(head);
    var body = document.createElement('div'); body.className = 'bili-content';
    body.innerHTML = esc(cm.content).replace(/\n/g, '<br>');
    col.appendChild(body);
    var target = byId[cm.rid];
    col.appendChild(actionsRow(cm, target ? target.nick : ''));
    row.appendChild(col);
    return row;
  }

  function render(list, total) {
    var wrap = document.getElementById('cmtList');
    wrap.innerHTML = '';
    var t = buildThreads(list);
    t.roots.forEach(function (cm) {
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
      var replies = t.repliesByRoot[cm.id] || [];
      col.appendChild(actionsRow(cm, ''));
      if (replies.length) {
        var repWrap = document.createElement('div'); repWrap.className = 'bili-replies';
        replies.forEach(function (rc) {
          var target = t.byId[rc.rid];
          repWrap.appendChild(replyItem(rc, target ? target.nick : '', t.byId));
        });
        col.appendChild(repWrap);
      }
      row.appendChild(col);
      wrap.appendChild(row);
    });
    document.getElementById('cmtEmpty').hidden = list.length > 0;
    document.getElementById('cmtTotal').textContent = (typeof total === 'number' && total >= list.length) ? total : list.length;
  }

  /* limit=100 为单次拉取上限，超出后老留言暂不做分页（纪念册体量足够）；
     total 为服务端真实计数，有则优先显示，防止「全部留言」口径失真 */
  function load() {
    fetchJSON(API + '/comments?page_key=' + encodeURIComponent(PAGE) + '&site_name=' + encodeURIComponent(SITE) + '&limit=100')
      .then(function (d) {
        document.getElementById('cmtLoading').hidden = true;
        render(d.comments || [], d.total);
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
    fetchJSON(API + '/comments', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_key: PAGE, page_title: '留言墙', site_name: SITE, name: name, email: email, link: toLink(avatarURL), content: text })
    })
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
      .catch(function (err) {
        submitting = false;
        document.getElementById('cmtSubmit').disabled = false;
        showNotice(err && err.name === 'AbortError' ? '发布超时，请检查网络后重试。' : '网络异常，发布失败，请稍后重试。');
      });
  });

  load();
})();
