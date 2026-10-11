/* Nobodyssey Book One beta: the tester agreement gate (v2). Shown once per device before the page or the game can be
 * used; the acceptance (name, age bracket, a parent's name for 13 to 17, time, a receipt code) is kept in this
 * browser's storage and shown back as a receipt, and posted once to AZTMM's signature record (tools/beta_sign). */
(function () {
  var KEY = 'nb_beta_agreement_v1';   // same key, new VERSION: everyone signs v2 once
  var VERSION = 'Beta Test Agreement v2, 10 October 2026';
  var FULL = '/game/book-1/agreement.html';
  var ENDPOINT = 'https://nobodyssey-beta.aztmmhldgs.workers.dev';   // the signature record (tools/beta_sign in GAME1); '' until the Worker is deployed, then its URL
  var PEND = 'nb_beta_pending';   // a signed record not yet received by AZTMM (no signal); sent again on the next visit
  function send(rec, cb) {   // post the signature to AZTMM's record; keep it queued until the server says ok
    if (!ENDPOINT || !window.fetch) { cb && cb(false); return; }
    fetch(ENDPOINT + '/sign', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: rec.name, parent: rec.parent || '', age: rec.age, ts: rec.ts, version: rec.version, receipt: rec.receipt, ua: rec.ua || '' }), keepalive: true })
      .then(function (r) { return r.json(); }).then(function (j) { var ok = !!(j && j.ok); try { if (ok) localStorage.removeItem(PEND); else localStorage.setItem(PEND, '1'); } catch (e) { /* ignore */ } cb && cb(ok); })
      .catch(function () { try { localStorage.setItem(PEND, '1'); } catch (e) { /* ignore */ } cb && cb(false); });
  }
  function resend() { var r = saved(); var p = false; try { p = !!localStorage.getItem(PEND); } catch (e) { /* ignore */ } if (r && p && r.version === VERSION) send(r); }
  function saved() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function receipt(name, parent, age, ts) {   // a short code from the names, the age bracket, the time and the version, checkable later
    var s = name + '|' + (parent || '') + '|' + age + '|' + ts + '|' + VERSION, h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return 'NB2-' + h.toString(16).toUpperCase().padStart(8, '0');
  }
  var AGREEMENT = [
    ['What you are getting', 'A private, unfinished test copy of Nobodyssey, Book One, from AZTMM HLDGS LLC. It is lent to you to play and to tell us what you think. It stays ours.'],
    ['Keep it to yourself', 'Until Book One is released, don’t share the link, and don’t stream, record, screenshot or post about what is inside, anywhere, including group chats. You may say you are a tester. The one thing you may share is the official trailer on the Book One page, unchanged. Screenshots sent only to us are fine.'],
    ['Play it, don’t copy it', 'Play it in your browser; that’s all. No downloading, copying, pulling the code apart, modding, or feeding any of it to an AI.'],
    ['Your feedback', 'What you tell us (bugs, notes, ideas) we may use freely, in the game or anywhere, without paying you or naming you. Please don’t send us anything you want to keep.'],
    ['If it goes wrong', 'It’s a test build: it may break, change or disappear, and comes with no promises. If you break these rules, we can ask a court to stop it and claim our losses and legal costs.'],
    ['Age, privacy and the rest', 'You must be 13 or older; under 18, a parent or guardian must agree below. Your signature (the names you type, the time, your age bracket and a receipt code) is sent to AZTMM as our record that you agreed; your save and settings stay on this device and nothing else about you is collected. New York law applies. This is a summary; the full agreement is the one you sign, and it is linked below.']
  ];
  var CSS = '#nbgate{position:fixed;inset:0;z-index:9999;background:rgba(6,4,12,.94);display:flex;align-items:center;justify-content:center;padding:14px;font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;color:#ece4d0}' +
    '#nbgate .box{background:#120d1f;border:2px solid #3a2d5c;max-width:620px;width:100%;max-height:100%;display:flex;flex-direction:column}' +
    '#nbgate .hd{padding:16px 18px 12px;border-bottom:1px solid #3a2d5c}' +
    '#nbgate .px{font-family:"Silkscreen",ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase}' +
    '#nbgate h2{margin:0;font-size:15px;color:#f2c14e}#nbgate .k{color:#e24a3b;font-size:11px;margin-bottom:6px}' +
    '#nbgate .sc{overflow:auto;padding:12px 18px;flex:1;min-height:0}' +
    '#nbgate h3{margin:12px 0 4px;font-size:12px;color:#3fa7b5}#nbgate p{margin:0;color:#b9b0c9;font-size:14px}' +
    '#nbgate a{color:#f2c14e}#nbgate .full{margin-top:14px;font-size:14px}' +
    '#nbgate .ft{padding:12px 18px 16px;border-top:1px solid #3a2d5c;display:flex;flex-direction:column;gap:10px;overflow:auto;max-height:62%}' +
    '#nbgate input[type=text]{width:100%;padding:11px 12px;background:#0c0816;border:1px solid #3a2d5c;color:#ece4d0;font-size:16px}' +
    '#nbgate label.ck{display:flex;gap:10px;align-items:flex-start;color:#ece4d0;font-size:14px}#nbgate label.ck input{margin-top:4px;width:18px;height:18px;flex:none}' +
    '#nbgate .age{display:flex;flex-direction:column;gap:6px}#nbgate .age label{display:flex;gap:10px;align-items:center;font-size:14px;color:#ece4d0}#nbgate .age input{width:18px;height:18px;flex:none}' +
    '#nbgate .kid{display:none;flex-direction:column;gap:10px;padding:10px 12px;border:1px solid #3a2d5c;background:#0c0816}#nbgate .kid.on{display:flex}' +
    '#nbgate .young{display:none;color:#f2c14e;font-size:14px}#nbgate .young.on{display:block}' +
    '#nbgate button{padding:13px 18px;background:#f2c14e;color:#0c0816;border:2px solid #f2c14e;font-family:"Silkscreen",ui-monospace,monospace;letter-spacing:.1em;font-size:13px;cursor:pointer}' +
    '#nbgate button[disabled]{opacity:.4;cursor:not-allowed}#nbgate .err{color:#e24a3b;font-size:13px;min-height:1em}' +
    '#nbgate .rc{color:#8a809e;font-size:12px}' +
    '#nbgate .no{background:none;border-color:#3a2d5c;color:#8a809e;font-size:11px}' +
    '#nbgate .row{display:flex;gap:10px;flex-wrap:wrap}#nbgate .row button{flex:1}';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function show(onDone) {
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var g = document.createElement('div'); g.id = 'nbgate';
    g.innerHTML = '<div class="box" role="dialog" aria-modal="true" aria-labelledby="nbg-t"><div class="hd"><div class="k px">Nobodyssey · Book One · private beta</div><h2 class="px" id="nbg-t">Before you play: the tester agreement</h2></div>' +
      '<div class="sc">' + AGREEMENT.map(function (a) { return '<h3 class="px">' + a[0] + '</h3><p>' + a[1] + '</p>'; }).join('') +
      '<p class="full"><a href="' + FULL + '" target="_blank" rel="noopener">Read the full agreement (Beta Test Agreement v2)</a>. It opens in a new tab; you can save or print it.</p>' +
      '<h3 class="px">Version</h3><p>' + VERSION + '</p></div>' +
      '<div class="ft"><input type="text" id="nbg-n" placeholder="Your full name" autocomplete="name" maxlength="80">' +
      '<div class="age"><label><input type="radio" name="nbg-age" value="adult"> I am 18 or older</label>' +
      '<label><input type="radio" name="nbg-age" value="teen"> I am 13 to 17, and my parent or guardian is here</label>' +
      '<label><input type="radio" name="nbg-age" value="child"> I am under 13</label></div>' +
      '<div class="young" id="nbg-y">Sorry, the beta is for players 13 and up. Nobodyssey will be here when you’re older.</div>' +
      '<div class="kid" id="nbg-k"><input type="text" id="nbg-p" placeholder="Parent or guardian’s full name" autocomplete="off" maxlength="80">' +
      '<label class="ck"><input type="checkbox" id="nbg-pc"> I am this tester’s parent or legal guardian. I have read the agreement, I agree to it for them and for myself, and I’ll make sure they keep to it.</label></div>' +
      '<label class="ck"><input type="checkbox" id="nbg-c"> I have read the tester agreement (the summary above and the full agreement linked here). I am signing it by typing my name, and I agree to be bound by it.</label>' +
      '<div class="err" id="nbg-e"></div><div class="row"><button class="px" id="nbg-ok" disabled>Sign and continue</button><button class="px no" id="nbg-no" type="button">I do not agree</button></div></div></div>';
    document.body.appendChild(g);
    document.documentElement.style.overflow = 'hidden';
    var n = g.querySelector('#nbg-n'), c = g.querySelector('#nbg-c'), ok = g.querySelector('#nbg-ok'), err = g.querySelector('#nbg-e');
    var kid = g.querySelector('#nbg-k'), young = g.querySelector('#nbg-y'), pn = g.querySelector('#nbg-p'), pc = g.querySelector('#nbg-pc');
    function age() { var r = g.querySelector('input[name=nbg-age]:checked'); return r ? r.value : ''; }
    function valid() {
      var a = age();
      if (!(c.checked && n.value.trim().length >= 3 && (a === 'adult' || a === 'teen'))) return false;
      return a === 'adult' || (pc.checked && pn.value.trim().length >= 3);
    }
    function check() {
      var a = age(); kid.classList.toggle('on', a === 'teen'); young.classList.toggle('on', a === 'child');
      ok.disabled = !valid(); err.textContent = '';
    }
    g.addEventListener('input', check); g.addEventListener('change', check);
    g.querySelector('#nbg-no').addEventListener('click', function () { location.href = 'https://aztmm.com/'; });
    ok.addEventListener('click', function () {
      var a = age(), name = n.value.trim(), parent = a === 'teen' ? pn.value.trim() : '';
      if (!valid()) { err.textContent = 'Type your full name, choose your age and tick the box.' + (a === 'teen' ? ' A parent or guardian needs to type their name and tick theirs too.' : ''); return; }
      var ts = new Date().toISOString();
      var rec = { name: name, parent: parent, age: a === 'teen' ? '13-17' : '18+', ts: ts, version: VERSION, receipt: receipt(name, parent, a, ts), ua: navigator.userAgent.slice(0, 120) };
      try { localStorage.setItem(KEY, JSON.stringify(rec)); } catch (e) { err.textContent = 'Your browser blocks storage; allow it (not a private window) and try again.'; return; }
      g.querySelector('.sc').innerHTML = '<h3 class="px">Signed</h3><p>' + esc(name) + ', ' + esc(ts.replace('T', ' ').slice(0, 16)) + ' UTC.' + (parent ? ' With the consent of ' + esc(parent) + '.' : '') + '</p>' +
        '<p class="rc">Receipt ' + rec.receipt + '. <span id="nbg-s">Recording your signature…</span></p>' +
        '<p style="margin-top:10px">Thank you. Play it through, then write to <a href="mailto:game@aztmm.com">game@aztmm.com</a> with what annoyed you, what you could not work out, and where you stopped.</p>';
      send(rec, function (ok) { var el = g.querySelector('#nbg-s'); if (el) el.textContent = ok ? 'Recorded.' : (ENDPOINT ? 'Not sent yet (no signal); it will be sent next time you open the game.' : ''); });
      g.querySelector('.ft').innerHTML = '<div class="row"><button class="px" id="nbg-go">Continue</button></div>';
      g.querySelector('#nbg-go').addEventListener('click', function () { g.remove(); document.documentElement.style.overflow = ''; onDone(rec); });
    });
    n.focus();
  }
  window.NB_GATE = {
    saved: saved,
    version: VERSION,
    require: function (onDone) { var r = saved(); if (r && r.version === VERSION) { resend(); onDone(r); return; } if (document.body) show(onDone); else document.addEventListener('DOMContentLoaded', function () { show(onDone); }); },
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } location.reload(); }
  };
})();
