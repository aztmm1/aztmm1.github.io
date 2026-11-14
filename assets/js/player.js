/* AZTMM Gaming Labs: the Lea music bar. Plays the music of Lea, and only that.
 * Nothing is requested before the music starts: the first pointerdown or keydown anywhere on the page starts the first track, once.
 * It keeps two things in the browser, in sessionStorage for this visit only: whether the visitor paused or closed it, and the track and second it
 * had reached, so that the next page carries on from there. It sends nothing anywhere.
 * To add a track, add one line to TRACKS. © 2026 AZTMM HLDGS LLC. */
(function () {
  'use strict';

  var TRACKS = [   /* title, file (in media/lea/music/), seconds */
    { title: 'Piece I: The Silver Highlands and Sunskin', file: 'piece-1-the-silver-highlands-and-sunskin.mp3', seconds: 140 },
    { title: 'Piece II: The Rust Dunes and The Long Swell', file: 'piece-2-the-rust-dunes-and-the-long-swell.mp3', seconds: 140 },
    { title: 'Piece III: The Glass Comet and The Hexagon', file: 'piece-3-the-glass-comet-and-the-hexagon.mp3', seconds: 140 },
    { title: 'Piece IV: Under the Rings and The Twilight Line', file: 'piece-4-under-the-rings-and-the-twilight-line.mp3', seconds: 140 },
    { title: 'Piece V: The Nebula Garden and The Lighthouse', file: 'piece-5-the-nebula-garden-and-the-lighthouse.mp3', seconds: 140 },
    { title: 'Piece VI: The Event Horizon and Someone’s Sun', file: 'piece-6-the-event-horizon-and-someones-sun.mp3', seconds: 140 },
    { title: 'Event Horizon', file: 'event-horizon.mp3', seconds: 57 },
    { title: 'Neon Orbit', file: 'neon-orbit.mp3', seconds: 54 },
    { title: 'The Long Way Home', file: 'the-long-way-home.mp3', seconds: 52 },
    { title: 'The Long Way Home, with organ', file: 'the-long-way-home-with-organ.mp3', seconds: 52 },
    { title: 'The Long Way Home, all organ', file: 'the-long-way-home-all-organ.mp3', seconds: 64 },
    { title: 'Small Suns', file: 'small-suns.mp3', seconds: 54 },
    { title: 'Trailer three', file: 'trailer-three.mp3', seconds: 44 },
    { title: 'The first trailer', file: 'the-first-trailer.mp3', seconds: 44 },
    { title: 'The Silver Highlands', file: 'world-silver-highlands.mp3', seconds: 46 },
    { title: 'The Rust Dunes', file: 'world-rust-dunes.mp3', seconds: 43 },
    { title: 'The Glass Comet', file: 'world-glass-comet.mp3', seconds: 44 },
    { title: 'Under the Rings', file: 'world-under-the-rings.mp3', seconds: 40 },
    { title: 'The Nebula Garden', file: 'world-nebula-garden.mp3', seconds: 48 },
    { title: 'The Event Horizon', file: 'world-the-event-horizon.mp3', seconds: 53 },
    { title: 'Between the worlds', file: 'world-between-the-worlds.mp3', seconds: 38 }
  ];

  var KEY = 'lea-player';                 /* 'closed' or 'paused', for this visit only */
  var KEY_AT = 'lea-player-at';           /* 'track|second', for this visit only */
  var ARTIST = 'Lea · AZTMM Gaming Labs';
  var script = document.currentScript;
  var BASE = new URL('../../media/lea/music/', script ? script.src : location.href).href;

  function store(v) { try { if (v) sessionStorage.setItem(KEY, v); else sessionStorage.removeItem(KEY); } catch (e) {} }
  function stored() { try { return sessionStorage.getItem(KEY); } catch (e) { return null; } }
  if (stored() === 'closed' || !TRACKS.length) return;
  function reached() {
    try {
      var v = (sessionStorage.getItem(KEY_AT) || '').split('|'), track = parseInt(v[0], 10), second = parseInt(v[1], 10);
      return track >= 0 && track < TRACKS.length ? { track: track, second: second > 0 ? second : 0 } : null;
    } catch (e) { return null; }
  }
  function remember(second) { try { sessionStorage.setItem(KEY_AT, at + '|' + second); } catch (e) {} }

  var saveData = !!(navigator.connection && navigator.connection.saveData);
  var ICON = {
    play: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M5 3.5v9l7.5-4.5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M5 3.5v9M11 3.5v9" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    prev: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M4 3v10" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M13 3.5v9L6.5 8z" fill="currentColor"/></svg>',
    next: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M12 3v10" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3 3.5v9L9.5 8z" fill="currentColor"/></svg>',
    list: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 4h10M3 8h10M3 12h6" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    close: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'
  };

  function clock(s) { s = Math.round(s); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function btn(cls, label, icon) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = cls; b.setAttribute('aria-label', label); b.innerHTML = icon;
    return b;
  }

  var was = reached();
  var at = was ? was.track : 0, resumeAt = was ? was.second : 0, kept = -1, started = false, audio = null, errors = 0;

  /* ---- the bar ---- */
  var bar = document.createElement('div');
  bar.className = 'lp'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Lea music');
  var line = document.createElement('div'); line.className = 'lp-line'; line.setAttribute('aria-hidden', 'true');
  var fill = document.createElement('i'); line.appendChild(fill);
  var row = document.createElement('div'); row.className = 'lp-row';
  var bPlay = btn('lp-b lp-play', 'Play', ICON.play);
  var bPrev = btn('lp-b', 'Previous track', ICON.prev);
  var bNext = btn('lp-b', 'Next track', ICON.next);
  var now = document.createElement('div'); now.className = 'lp-now';
  now.innerHTML = '<span class="lp-eye">Lea</span><span class="lp-title" role="status" aria-live="polite"></span>';
  var eTitle = now.querySelector('.lp-title');
  var bList = btn('lp-b lp-tracks', 'Track list', ICON.list);
  bList.setAttribute('aria-expanded', 'false'); bList.setAttribute('aria-controls', 'lp-list');
  var bClose = btn('lp-b', 'Close the music player', ICON.close);
  row.appendChild(bPlay); row.appendChild(bPrev); row.appendChild(bNext); row.appendChild(now); row.appendChild(bList); row.appendChild(bClose);

  var panel = document.createElement('div');
  panel.className = 'lp-panel'; panel.id = 'lp-list'; panel.hidden = true;
  var ol = document.createElement('ol'); ol.setAttribute('aria-label', 'Lea tracks');
  var items = TRACKS.map(function (t, i) {
    var li = document.createElement('li'), b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = '<span class="lp-n"></span><span class="lp-t"></span><span class="lp-d"></span>';
    b.querySelector('.lp-n').textContent = i + 1;
    b.querySelector('.lp-t').textContent = t.title;
    b.querySelector('.lp-d').textContent = clock(t.seconds);
    b.setAttribute('aria-label', t.title + ', ' + clock(t.seconds).replace(':', ' minutes ') + ' seconds');
    b.addEventListener('click', function () { load(i); play(); });
    li.appendChild(b); ol.appendChild(li);
    return b;
  });
  panel.appendChild(ol);
  bar.appendChild(line); bar.appendChild(panel); bar.appendChild(row);

  /* ---- playing ---- */
  function mark() {
    eTitle.textContent = TRACKS[at].title;
    items.forEach(function (b, i) { if (i === at) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    fill.style.width = '0%';
    if ('mediaSession' in navigator && window.MediaMetadata) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: TRACKS[at].title, artist: ARTIST, album: 'Lea' });
    }
  }
  function ensureAudio() {
    if (audio) return audio;
    audio = document.createElement('audio');
    audio.preload = 'none';
    audio.addEventListener('ended', function () { errors = 0; step(1); play(); });
    audio.addEventListener('error', function () { if (++errors < TRACKS.length) { step(1); play(); } else { sync(); } });
    audio.addEventListener('timeupdate', function () {
      var d = audio.duration && isFinite(audio.duration) ? audio.duration : TRACKS[at].seconds;
      fill.style.width = Math.min(100, audio.currentTime / d * 100) + '%';
      var second = Math.floor(audio.currentTime);
      if (second !== kept) { kept = second; remember(second); }
    });
    audio.addEventListener('play', sync); audio.addEventListener('pause', sync);
    bar.appendChild(audio);
    return audio;
  }
  function load(i, second) {               /* a track's file is requested only here, when it is about to play */
    at = (i + TRACKS.length) % TRACKS.length;
    var a = ensureAudio();
    a.src = BASE + TRACKS[at].file;
    if (second > 0) a.addEventListener('loadedmetadata', function () { if (second < a.duration - 2) a.currentTime = second; }, { once: true });
    kept = -1; remember(second > 0 ? second : 0);
    mark();
  }
  function step(n) { at = (at + n + TRACKS.length) % TRACKS.length; load(at); }
  function play() {
    started = true; store(null);
    var a = ensureAudio();
    if (!a.getAttribute('src')) { load(at, resumeAt); resumeAt = 0; }
    var p = a.play();
    if (p && p.catch) p.catch(function () { sync(); });
  }
  function pause() { started = true; store('paused'); if (audio) audio.pause(); sync(); }
  function sync() {
    var on = !!audio && !audio.paused;
    bPlay.innerHTML = on ? ICON.pause : ICON.play;
    bPlay.setAttribute('aria-label', on ? 'Pause' : 'Play');
    bar.classList.toggle('on', on);
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = on ? 'playing' : 'paused';
  }
  function toggle() { if (audio && !audio.paused) pause(); else play(); }

  bPlay.addEventListener('click', toggle);
  bNext.addEventListener('click', function () { step(1); play(); });
  bPrev.addEventListener('click', function () {
    if (audio && audio.currentTime > 3) { audio.currentTime = 0; play(); } else { step(-1); play(); }
  });
  bClose.addEventListener('click', function () {
    if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); }
    store('closed'); started = true;
    try { sessionStorage.removeItem(KEY_AT); } catch (e) {}
    if ('mediaSession' in navigator) { navigator.mediaSession.metadata = null; navigator.mediaSession.playbackState = 'none'; }
    bar.remove(); document.documentElement.classList.remove('has-lp');
    removeEventListener('pointerdown', first, true); removeEventListener('keydown', first, true);
  });

  /* ---- the list ---- */
  function openList(on) {
    panel.hidden = !on; bList.setAttribute('aria-expanded', on ? 'true' : 'false');
    if (on) items[at].focus();
  }
  bList.addEventListener('click', function () { openList(panel.hidden); });
  panel.addEventListener('keydown', function (e) {
    var i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    else if (e.key === 'Home') { e.preventDefault(); items[0].focus(); }
    else if (e.key === 'End') { e.preventDefault(); items[items.length - 1].focus(); }
  });
  bar.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { openList(false); bList.focus(); } });
  document.addEventListener('pointerdown', function (e) { if (!panel.hidden && !bar.contains(e.target)) openList(false); });

  /* ---- other sound on the page, and the game, take the floor ---- */
  function loud(m) { return m !== audio && m.tagName && /^(VIDEO|AUDIO)$/.test(m.tagName) && !m.muted && m.volume > 0; }
  document.addEventListener('play', function (e) { if (loud(e.target) && audio && !audio.paused) pause(); }, true);
  document.addEventListener('volumechange', function (e) { if (loud(e.target) && !e.target.paused && audio && !audio.paused) pause(); }, true);
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="play/lea.html"]');
    if (a && audio && !audio.paused) pause();
  }, true);

  if ('mediaSession' in navigator) {
    [['play', play], ['pause', pause], ['previoustrack', function () { step(-1); play(); }], ['nexttrack', function () { step(1); play(); }]].forEach(function (h) {
      try { navigator.mediaSession.setActionHandler(h[0], h[1]); } catch (e) {}
    });
  }

  /* ---- the first tap ---- */
  function first(e) {
    if (started || bar.contains(e.target)) return;      /* a press on the bar itself does its own work */
    removeEventListener('pointerdown', first, true); removeEventListener('keydown', first, true);
    if (saveData || stored() === 'paused') return;
    play();
  }

  function show() {
    document.body.appendChild(bar);
    document.documentElement.classList.add('has-lp');
    mark(); sync();
    if (saveData || stored() === 'paused') return;
    addEventListener('pointerdown', first, true); addEventListener('keydown', first, true);
  }
  if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
})();
