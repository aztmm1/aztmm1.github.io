/* AZTMM Gaming Labs. Plain script, no library. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s, el) { return Array.prototype.slice.call((el || d).querySelectorAll(s)); };
  var IO = 'IntersectionObserver' in window;

  /* ---- bar: solid once the opening has scrolled past, colour of the project in view ---- */
  var bar = d.getElementById('bar');
  var solid = false;
  function onScroll() {
    var s = window.scrollY > 60;
    if (s !== solid) { solid = s; bar.classList.toggle('solid', s); }
  }
  if (bar) { window.addEventListener('scroll', onScroll, { passive: true }); onScroll(); }
  function tint(bg, ink) {
    if (!bar) return;
    bar.style.setProperty('--bar-bg', bg);
    bar.style.setProperty('--bar-ink', ink);
  }
  var cs = getComputedStyle(d.body);
  if (html.classList.contains('proj')) tint(cs.getPropertyValue('--p-bg2'), cs.getPropertyValue('--p-ink'));
  if (html.classList.contains('home') || html.classList.contains('labpage')) tint('#1f1a17', '#f5ecdc');

  /* ---- clips play while they are in view ---- */
  function startAt(v) {
    var st = parseFloat(v.getAttribute('data-start') || '0');
    if (st && !v._st) { v._st = 1; try { v.currentTime = st; } catch (e) {} }
  }
  if (IO) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (v.preload === 'none') v.preload = 'auto';
          if (still || v._userPaused) return;
          startAt(v);
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else if (!v.paused) { v._auto = 1; v.pause(); }
      });
    }, { threshold: 0.35 });
    $$('video[data-auto]').forEach(function (v) {
      vio.observe(v);
      v.addEventListener('pause', function () { if (!v._auto && v.hasAttribute('controls')) v._userPaused = 1; v._auto = 0; });
      v.addEventListener('play', function () { v._userPaused = 0; });
    });
  }

  /* ---- the reel ---- */
  var reel = d.querySelector('.reel');
  if (reel) (function () {
    var layers = $$('.reel-layer', reel), btns = $$('.reel-names button', reel);
    var pauseBtn = reel.querySelector('.reel-pause');
    var cur = 0, t0 = 0, dur = 6000, raf = 0, paused = still, visible = true;
    if (still) { pauseBtn.hidden = true; }
    function vid(i) { return layers[i].querySelector('video'); }
    function show(i) {
      var old = vid(cur); if (old && i !== cur) old.pause();
      layers[cur].classList.remove('on'); btns[cur].removeAttribute('aria-current'); btns[cur].style.removeProperty('--prog');
      cur = i;
      var L = layers[i]; L.classList.add('on'); btns[i].setAttribute('aria-current', 'true');
      dur = parseFloat(L.getAttribute('data-secs') || '6') * 1000;
      L.style.setProperty('--secs', (dur / 1000) + 's');
      var v = vid(i);
      if (v) {
        if (!v.src && v.getAttribute('data-src')) { v.src = v.getAttribute('data-src'); v.preload = 'auto'; }
        try { v.currentTime = parseFloat(v.getAttribute('data-start') || '0'); } catch (e) {}
        if (!still) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      }
      // warm the next one
      var n = vid((i + 1) % layers.length);
      if (n && !n.src && n.getAttribute('data-src')) { n.preload = 'metadata'; n.src = n.getAttribute('data-src'); }
      t0 = performance.now();
    }
    function tick(now) {
      raf = 0;
      if (paused || !visible) return;
      var k = Math.min(1, (now - t0) / dur);
      btns[cur].style.setProperty('--prog', k.toFixed(3));
      if (k >= 1) show((cur + 1) % layers.length);
      raf = requestAnimationFrame(tick);
    }
    function run() { if (!raf && !paused && visible) { t0 = performance.now() - (parseFloat(btns[cur].style.getPropertyValue('--prog') || 0) * dur); raf = requestAnimationFrame(tick); } }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { show(i); if (!paused) run(); });
    });
    pauseBtn.addEventListener('click', function () {
      paused = !paused;
      pauseBtn.setAttribute('aria-pressed', String(paused));
      pauseBtn.textContent = paused ? 'Play the reel' : 'Pause the reel';
      var v = vid(cur);
      reel.classList.toggle('held', paused);
      if (paused) { if (v) v.pause(); } else { if (v) v.play().catch(function () {}); run(); }
    });
    if (IO) new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      var v = vid(cur);
      if (!visible) { if (v) v.pause(); } else { if (v && !paused && !still) v.play().catch(function () {}); run(); }
    }, { threshold: 0.15 }).observe(reel);
    show(0); run();
  })();

  /* ---- home: the colour follows the project in view ---- */
  var work = d.querySelector('.work');
  var LINE = '-64px 0px ' + (66 - window.innerHeight) + 'px 0px';
  if (work && IO) {
    var stio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var st = getComputedStyle(e.target);
        tint(st.getPropertyValue('--p-bg'), st.getPropertyValue('--p-ink'));
        work.style.setProperty('--now-bg', st.getPropertyValue('--p-bg'));
        work.style.setProperty('--now-ink', st.getPropertyValue('--p-ink'));
        work.style.setProperty('--now-acc', st.getPropertyValue('--p-acc'));
        work.style.setProperty('--now-accink', st.getPropertyValue('--p-accink'));
      });
    }, { rootMargin: LINE });
    $$('.stage', work).forEach(function (st) { stio.observe(st); });
    $$('.artroom,.board-sec,.statement,.foot,.reel,.work>.sec-head').forEach(function (sec) {
      new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        var c = getComputedStyle(sec);
        tint(sec.classList.contains('reel') ? '#1f1a17' : c.backgroundColor === 'rgba(0, 0, 0, 0)' ? getComputedStyle(d.body).backgroundColor : c.backgroundColor, c.color);
        if (sec.classList.contains('sec-head')) { work.style.removeProperty('--now-bg'); work.style.removeProperty('--now-ink'); }
      }, { rootMargin: LINE }).observe(sec);
    });
  }

  /* ---- filters on the work ---- */
  function filterSet(btns, items, test, after) {
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        var key = b.getAttribute('data-filter') || b.getAttribute('data-wall');
        var shown = 0;
        items.forEach(function (it) {
          var on = test(it, key);
          if (on) shown++;
          if (still) { it.classList.toggle('is-gone', !on); it.classList.remove('is-out'); return; }
          if (on && it.classList.contains('is-gone')) {
            it.classList.add('is-out'); it.classList.remove('is-gone');
            requestAnimationFrame(function () { requestAnimationFrame(function () { it.classList.remove('is-out'); }); });
          } else if (!on && !it.classList.contains('is-gone')) {
            it.classList.add('is-out');
            setTimeout(function () { if (it.classList.contains('is-out')) it.classList.add('is-gone'); }, 420);
          }
        });
        if (after) after(shown, b);
      });
    });
  }
  var wf = $$('.work .filters .chip');
  if (wf.length) {
    var count = d.querySelector('.filter-count');
    var shown = function (st, k) {
      if (k === 'all') return true;
      if (k === 'lab') return st.getAttribute('data-lab') === '1';
      return st.getAttribute('data-genre') === k.slice(2);
    };
    filterSet(wf, $$('.stage'), shown, function (n, b) {
      var k = b.getAttribute('data-filter');
      count.textContent = k === 'all' ? '' : (n === 1 ? 'One project' : n + ' projects');
      $$('.genre').forEach(function (g) {
        g.classList.toggle('is-empty', !$$('.stage', g).some(function (st) { return shown(st, k); }));
      });
      $$('.shelf-head').forEach(function (h) { h.classList.toggle('is-empty', k === 'lab'); });
    });
  }
  var wallBtns = $$('.artroom .chip');
  if (wallBtns.length) {
    var wall = d.querySelector('.wall'), more = d.querySelector('[data-more]');
    filterSet(wallBtns, $$('.wall-i'), function (it, k) {
      var on = k === 'all' || it.getAttribute('data-p') === k || it.getAttribute('data-k') === k;
      it.classList.toggle('match', on && k !== 'all');
      return on;
    }, function (n, b) { if (more) more.parentNode.hidden = b.getAttribute('data-wall') !== 'all' || wall.classList.contains('open-all'); });
    if (more) more.addEventListener('click', function () { wall.classList.add('open-all'); more.parentNode.hidden = true; });
  }

  /* ---- swipe helper ---- */
  function swipe(el, fn) {
    var x0 = null, y0 = 0;
    el.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') { x0 = e.clientX; y0 = e.clientY; } });
    el.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) fn(dx < 0 ? 1 : -1);
    });
    el.addEventListener('pointercancel', function () { x0 = null; });
  }
  function closeOn(dlg) {
    $$('[data-lb-close]', dlg).forEach(function (b) { b.addEventListener('click', function () { dlg.close(); }); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  }

  /* ---- lightbox ---- */
  var lb = d.getElementById('lb');
  if (lb && lb.showModal) (function () {
    var im = lb.querySelector('img'), cap = lb.querySelector('.lb-cap'), cnt = lb.querySelector('.lb-count');
    var list = [], i = 0, opener = null;
    function set(k, dir) {
      i = (k + list.length) % list.length;
      var b = list[i];
      var go = function () {
        im.src = b.getAttribute('data-full');
        im.alt = (b.querySelector('img') || {}).alt || '';
        cap.textContent = b.getAttribute('data-cap') || '';
        cnt.textContent = list.length > 1 ? (i + 1) + ' of ' + list.length : '';
        im.classList.remove('swap');
      };
      if (dir && !still) { im.style.setProperty('--sx', (dir * 24) + 'px'); im.classList.add('swap'); setTimeout(go, 160); } else go();
    }
    function visibleIn(g) {
      return $$('[data-lb="' + g + '"]').filter(function (b) { return !b.closest('.is-gone'); });
    }
    d.addEventListener('click', function (e) {
      var b = e.target.closest('[data-lb]');
      if (!b) return;
      list = visibleIn(b.getAttribute('data-lb')); opener = b;
      lb.querySelector('[data-lb-prev]').hidden = lb.querySelector('[data-lb-next]').hidden = list.length < 2;
      set(list.indexOf(b)); lb.showModal();
    });
    lb.querySelector('[data-lb-prev]').addEventListener('click', function () { set(i - 1, -1); });
    lb.querySelector('[data-lb-next]').addEventListener('click', function () { set(i + 1, 1); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { set(i + 1, 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { set(i - 1, -1); e.preventDefault(); }
    });
    swipe(lb.querySelector('.lb-stage'), function (dir) { if (list.length > 1) set(i + dir, dir); });
    lb.addEventListener('close', function () { im.removeAttribute('src'); if (opener) opener.focus(); });
    closeOn(lb);
  })();

  /* ---- map viewer: pan and zoom ---- */
  var zm = d.getElementById('zm');
  if (zm && zm.showModal) (function () {
    var stage = zm.querySelector('.zm-stage'), im = stage.querySelector('img'), cap = zm.querySelector('.lb-cap');
    var s = 1, x = 0, y = 0, fit = 1, opener = null, pts = {}, last = null, pinch = 0;
    function apply() { im.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')'; }
    function fitIt() {
      var W = stage.clientWidth, H = stage.clientHeight, w = im.naturalWidth || 1, h = im.naturalHeight || 1;
      fit = Math.min(W / w, H / h); s = fit; x = (W - w * s) / 2; y = (H - h * s) / 2; apply();
    }
    function zoomAt(f, cx, cy) {
      var ns = Math.max(fit, Math.min(fit * 6, s * f));
      x = cx - (cx - x) * (ns / s); y = cy - (cy - y) * (ns / s); s = ns; apply();
    }
    d.addEventListener('click', function (e) {
      var b = e.target.closest('[data-zoom]');
      if (!b) return;
      opener = b;
      im.onload = fitIt;
      im.src = b.getAttribute('data-full'); im.alt = (b.querySelector('img') || {}).alt || '';
      cap.textContent = b.getAttribute('data-cap') || '';
      zm.showModal(); if (im.complete) fitIt(); stage.focus();
    });
    $$('[data-zm]', zm).forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-zm'), W = stage.clientWidth / 2, H = stage.clientHeight / 2;
        if (k === 'fit') fitIt(); else zoomAt(k === 'in' ? 1.5 : 1 / 1.5, W, H);
      });
    });
    stage.addEventListener('wheel', function (e) {
      e.preventDefault(); var r = stage.getBoundingClientRect();
      zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });
    stage.addEventListener('pointerdown', function (e) { stage.setPointerCapture(e.pointerId); pts[e.pointerId] = [e.clientX, e.clientY]; last = null; pinch = 0; });
    stage.addEventListener('pointermove', function (e) {
      if (!pts[e.pointerId]) return;
      var prev = pts[e.pointerId]; pts[e.pointerId] = [e.clientX, e.clientY];
      var ids = Object.keys(pts);
      if (ids.length === 2) {
        var a = pts[ids[0]], b = pts[ids[1]], dist = Math.hypot(a[0] - b[0], a[1] - b[1]);
        var r = stage.getBoundingClientRect();
        if (pinch) zoomAt(dist / pinch, (a[0] + b[0]) / 2 - r.left, (a[1] + b[1]) / 2 - r.top);
        pinch = dist;
      } else { x += e.clientX - prev[0]; y += e.clientY - prev[1]; apply(); }
    });
    function up(e) { delete pts[e.pointerId]; pinch = 0; }
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    stage.addEventListener('keydown', function (e) {
      var m = { ArrowLeft: [40, 0], ArrowRight: [-40, 0], ArrowUp: [0, 40], ArrowDown: [0, -40] }[e.key];
      if (m) { x += m[0]; y += m[1]; apply(); e.preventDefault(); }
      if (e.key === '+' || e.key === '=') zoomAt(1.3, stage.clientWidth / 2, stage.clientHeight / 2);
      if (e.key === '-') zoomAt(1 / 1.3, stage.clientWidth / 2, stage.clientHeight / 2);
    });
    window.addEventListener('resize', function () { if (zm.open) fitIt(); });
    zm.addEventListener('close', function () { im.removeAttribute('src'); if (opener) opener.focus(); });
    closeOn(zm);
  })();

  /* ---- the film ---- */
  var film = d.getElementById('film');
  if (film && film.showModal) (function () {
    var v = film.querySelector('video'), cap = film.querySelector('.lb-cap'), opener = null;
    d.addEventListener('click', function (e) {
      var b = e.target.closest('[data-film]');
      if (!b) return;
      opener = b;
      v.src = b.getAttribute('data-film'); v.poster = b.getAttribute('data-poster') || '';
      cap.textContent = b.getAttribute('data-cap') || '';
      film.showModal(); v.play().catch(function () {});
    });
    film.addEventListener('close', function () { v.pause(); v.removeAttribute('src'); v.load(); if (opener) opener.focus(); });
    closeOn(film);
  })();

  /* ---- storyboard viewers ---- */
  $$('.viewer').forEach(function (V) {
    if (!V.querySelector('.v-strip')) return;
    var frames = $$('.vf', V), thumbs = $$('.vs', V), capEl = V.querySelector('.v-cap'), nEl = V.querySelector('.v-n');
    var caps = []; try { caps = JSON.parse(V.querySelector('.v-caps').textContent); } catch (e) {}
    var i = 0;
    function go(k) {
      k = (k + frames.length) % frames.length; if (k === i) return;
      var fwd = k > i;
      frames[i].classList.remove('on'); frames[i].classList.toggle('prev', fwd);
      thumbs[i].removeAttribute('aria-current');
      i = k;
      frames[i].classList.remove('prev'); frames[i].classList.add('on');
      thumbs[i].setAttribute('aria-current', 'true');
      var img = frames[i].querySelector('img'); if (img.loading === 'lazy') img.loading = 'eager';
      capEl.textContent = caps[i] || ''; nEl.textContent = i + 1;
      var t = thumbs[i], strip = t.parentNode;
      strip.scrollTo({ left: t.offsetLeft - strip.clientWidth / 2 + t.clientWidth / 2, behavior: still ? 'auto' : 'smooth' });
    }
    $$('[data-v]', V).forEach(function (b) { b.addEventListener('click', function () { go(i + parseInt(b.getAttribute('data-v'), 10)); }); });
    thumbs.forEach(function (t, k) { t.addEventListener('click', function () { go(k); }); });
    V.addEventListener('keydown', function (e) {
      if (e.target.closest('dialog')) return;
      if (e.key === 'ArrowRight') { go(i + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { go(i - 1); e.preventDefault(); }
    });
    swipe(V.querySelector('.v-stage'), function (dir) { V._sw = 1; setTimeout(function () { V._sw = 0; }, 400); go(i + dir); });
    // a swipe should not also open the lightbox
    V.querySelector('.v-stage').addEventListener('click', function (e) { if (V._sw) { e.stopPropagation(); e.preventDefault(); V._sw = 0; } }, true);
  });

  /* ---- sticky index follows the section in view ---- */
  var idx = $$('.pindex a');
  if (idx.length && IO) {
    var map = {}; idx.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var a = map[e.target.id]; if (!a) return;
        idx.forEach(function (x) { x.removeAttribute('aria-current'); });
        a.setAttribute('aria-current', 'true');
        var ol = a.closest('ol');
        if (ol.scrollWidth > ol.clientWidth) ol.scrollTo({ left: a.parentNode.offsetLeft - 16, behavior: still ? 'auto' : 'smooth' });
      });
    }, { rootMargin: '-30% 0px -65% 0px' });
    $$('.psec, #next').forEach(function (s) { sio.observe(s); });
  }

  /* ---- tabs ---- */
  $$('.tabs').forEach(function (T) {
    var tabs = $$('[role=tab]', T);
    function sel(t) {
      tabs.forEach(function (x) {
        var on = x === t; x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1;
        d.getElementById(x.getAttribute('aria-controls')).hidden = !on;
      });
    }
    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { sel(t); });
      t.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' ? k + 1 : e.key === 'ArrowLeft' ? k - 1 : null;
        if (n === null) return;
        n = (n + tabs.length) % tabs.length; sel(tabs[n]); tabs[n].focus(); e.preventDefault();
      });
    });
  });

  /* ---- sound tracks ---- */
  var tracks = $$('.track');
  function fmt(t) { t = Math.floor(t || 0); return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2); }
  tracks.forEach(function (T) {
    var a = T.querySelector('audio'), b = T.querySelector('.tr-play'), bar = T.querySelector('.tr-bar'), tm = T.querySelector('.tr-time');
    b.addEventListener('click', function () {
      if (a.paused) { tracks.forEach(function (o) { var x = o.querySelector('audio'); if (x !== a) x.pause(); }); a.play().catch(function () {}); } else a.pause();
    });
    a.addEventListener('play', function () { b.setAttribute('aria-pressed', 'true'); });
    a.addEventListener('pause', function () { b.setAttribute('aria-pressed', 'false'); });
    a.addEventListener('timeupdate', function () {
      var k = a.duration ? a.currentTime / a.duration : 0;
      bar.style.setProperty('--tp', k.toFixed(4)); bar.setAttribute('aria-valuenow', Math.round(k * 100)); tm.textContent = fmt(a.currentTime);
    });
    function seek(k) { if (a.duration) a.currentTime = Math.max(0, Math.min(1, k)) * a.duration; }
    bar.addEventListener('click', function (e) { var r = bar.getBoundingClientRect(); seek((e.clientX - r.left) / r.width); });
    bar.addEventListener('keydown', function (e) {
      if (!a.duration) return;
      if (e.key === 'ArrowRight') { a.currentTime = Math.min(a.duration, a.currentTime + 5); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { a.currentTime = Math.max(0, a.currentTime - 5); e.preventDefault(); }
    });
  });

  /* ---- counters count up once ---- */
  var nums = $$('[data-count]');
  if (nums.length && IO && !still) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var el = e.target, to = parseInt(el.getAttribute('data-count'), 10), t0 = performance.now(), D = 1200;
        (function step(now) {
          var k = Math.min(1, (now - t0) / D), q = 1 - Math.pow(1 - k, 3);
          el.textContent = Math.round(to * q);
          if (k < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { n.textContent = '0'; cio.observe(n); });
  }
})();
