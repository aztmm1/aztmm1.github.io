/* Emberhold tester agreement: the gate. Shown once per device before the tester page or the game can be used.
 * The acceptance (typed name, age bracket, a parent's name for 13 to 17, time, a receipt code) is kept in this browser's
 * storage, shown back as a receipt, and posted once to AZTMM's signature record. The record stores any version string. */
(function () {
  var KEY = 'aztmm.emberhold.agreement.v1';
  var VERSION = 'Emberhold Tester Agreement v1, 12 November 2026';
  var FULL = (function () { var s = document.currentScript && document.currentScript.src; return s ? s.replace(/gate\.js[^\/]*$/, 'agreement.html') : '/game/emberhold/agreement.html'; })();
  var ENDPOINT = 'https://nobodyssey-beta.aztmmhldgs.workers.dev';   // the signature record; the same Worker as the other tester gate
  var PEND = 'aztmm.emberhold.pending';   // a signed record not yet received by AZTMM (no signal); sent again on the next visit
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
    return 'EMB-' + h.toString(16).toUpperCase().padStart(8, '0');
  }
  var AGREEMENT = [
    ['What you are getting', 'A private, unfinished test copy of Emberhold from AZTMM HLDGS LLC. It is lent to you to play and to tell us what you think. It stays ours.'],
    ['Keep it to yourself', 'Until Emberhold is released, don’t share the link, and don’t stream, record, screenshot or post about what is inside, anywhere, including group chats. You may say you are a tester. What is already public on the Emberhold page of aztmm.com is not secret. Screenshots sent only to us are fine.'],
    ['Play it, don’t copy it', 'Play it in your browser; that’s all. No downloading, copying, pulling the code apart, modding, or feeding any of it to an AI.'],
    ['Your feedback', 'What you tell us (bugs, notes, ideas) we may use freely, in the game or anywhere, without paying you or naming you. Please don’t send us anything you want to keep.'],
    ['If it goes wrong', 'It’s a test build: it may break, change or disappear, and comes with no promises. If you break these rules, we can ask a court to stop it and claim our losses and legal costs.'],
    ['Age, privacy and the rest', 'You must be 13 or older; under 18, a parent or guardian must agree below. Your signature (the name you type, the time, your age bracket and a receipt code) is sent to AZTMM as our record that you agreed; your save and settings stay on this device and nothing else about you is collected. New York law applies. This is a summary; the full agreement is the one you sign, and it is linked below.']
  ];
  var CSS = '#embgate{position:fixed;inset:0;z-index:9999;background:rgba(14,17,21,.93);display:flex;align-items:center;justify-content:center;padding:14px;font:17px/1.5 "Crimson Pro",Georgia,"Times New Roman",serif;color:#efe6d6}' +
    '#embgate .box{background:#1b2026;border:1px solid #3d4651;border-top:3px solid #c4404a;border-radius:3px;max-width:620px;width:100%;max-height:100%;display:flex;flex-direction:column;box-shadow:0 24px 60px rgba(0,0,0,.55)}' +
    '#embgate .hd{padding:18px 20px 12px;border-bottom:1px solid #313942}' +
    '#embgate h2{margin:0;font-size:25px;line-height:1.15;font-weight:600;color:#efe6d6;letter-spacing:-.005em}' +
    '#embgate .k{color:#e8883a;font-size:15px;font-weight:600;margin-bottom:4px}' +
    '#embgate .sc{overflow:auto;padding:10px 20px 14px;flex:1;min-height:0}' +
    '#embgate h3{margin:16px 0 2px;font-size:18px;font-weight:700;color:#e8883a}' +
    '#embgate p{margin:0;color:#c8c0b1;font-size:17px}' +
    '#embgate a{color:#f0a45a}#embgate .full{margin-top:16px}' +
    '#embgate .ft{padding:12px 20px 18px;border-top:1px solid #313942;display:flex;flex-direction:column;gap:10px;overflow:auto;max-height:62%}' +
    '#embgate input[type=text]{width:100%;padding:11px 12px;background:#11151a;border:1px solid #3d4651;border-radius:2px;color:#efe6d6;font:18px "Crimson Pro",Georgia,serif}' +
    '#embgate input[type=text]:focus{outline:2px solid #e8883a;outline-offset:1px}' +
    '#embgate label.ck{display:flex;gap:10px;align-items:flex-start;color:#efe6d6;font-size:16px;line-height:1.4}#embgate label.ck input{margin-top:3px;width:18px;height:18px;flex:none;accent-color:#c4404a}' +
    '#embgate .age{display:flex;flex-direction:column;gap:6px}#embgate .age label{display:flex;gap:10px;align-items:center;font-size:17px;color:#efe6d6}#embgate .age input{width:18px;height:18px;flex:none;accent-color:#c4404a}' +
    '#embgate .kid{display:none;flex-direction:column;gap:10px;padding:10px 12px;border:1px solid #3d4651;background:#11151a}#embgate .kid.on{display:flex}' +
    '#embgate .young{display:none;color:#f0a45a;font-size:17px}#embgate .young.on{display:block}' +
    '#embgate button{padding:12px 20px;background:#c4404a;color:#fff4ec;border:1px solid #c4404a;border-radius:2px;font:700 18px "Crimson Pro",Georgia,serif;cursor:pointer}' +
    '#embgate button:hover:not([disabled]){background:#d34c56}' +
    '#embgate button[disabled]{opacity:.4;cursor:not-allowed}#embgate .err{color:#f08a8a;font-size:15px;min-height:1em}' +
    '#embgate .rc{color:#b3ab9d;font-size:16px}#embgate .rcode{display:inline-block;margin:4px 0;padding:4px 10px;border:1px dashed #e8883a;color:#f0a45a;font:600 22px/1.2 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.08em}' +
    '#embgate .no{background:none;border-color:#3d4651;color:#b3ab9d;font-weight:600;font-size:16px}#embgate .no:hover:not([disabled]){background:#232a32}' +
    '#embgate .row{display:flex;gap:10px;flex-wrap:wrap}#embgate .row button{flex:1}';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function show(onDone) {
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var g = document.createElement('div'); g.id = 'embgate';
    g.innerHTML = '<div class="box" role="dialog" aria-modal="true" aria-labelledby="embg-t"><div class="hd"><div class="k">Emberhold · tester build</div><h2 id="embg-t">Before you play: the tester agreement</h2></div>' +
      '<div class="sc">' + AGREEMENT.map(function (a) { return '<h3>' + a[0] + '</h3><p>' + a[1] + '</p>'; }).join('') +
      '<p class="full"><a href="' + FULL + '" target="_blank" rel="noopener">Read the full agreement (Emberhold Tester Agreement v1)</a>. It opens in a new tab; you can save or print it.</p>' +
      '<h3>Version</h3><p>' + VERSION + '</p></div>' +
      '<div class="ft"><input type="text" id="embg-n" placeholder="Your full name" autocomplete="name" maxlength="80" aria-label="Your full name">' +
      '<div class="age"><label><input type="radio" name="embg-age" value="adult"> I am 18 or older</label>' +
      '<label><input type="radio" name="embg-age" value="teen"> I am 13 to 17, and my parent or guardian is here</label>' +
      '<label><input type="radio" name="embg-age" value="child"> I am under 13</label></div>' +
      '<div class="young" id="embg-y">Sorry, the tester build is for players 13 and up. Emberhold will be here when you’re older.</div>' +
      '<div class="kid" id="embg-k"><input type="text" id="embg-p" placeholder="Parent or guardian’s full name" autocomplete="off" maxlength="80" aria-label="Parent or guardian’s full name">' +
      '<label class="ck"><input type="checkbox" id="embg-pc"> I am this tester’s parent or legal guardian. I have read the agreement, I agree to it for them and for myself, and I’ll make sure they keep to it.</label></div>' +
      '<label class="ck"><input type="checkbox" id="embg-c"> I have read the tester agreement (the summary above and the full agreement linked here). I am signing it by typing my name, and I agree to be bound by it.</label>' +
      '<div class="err" id="embg-e" role="alert"></div><div class="row"><button id="embg-ok" disabled>Sign and continue</button><button class="no" id="embg-no" type="button">I do not agree</button></div></div></div>';
    document.body.appendChild(g);
    document.documentElement.style.overflow = 'hidden';
    var n = g.querySelector('#embg-n'), c = g.querySelector('#embg-c'), ok = g.querySelector('#embg-ok'), err = g.querySelector('#embg-e');
    var kid = g.querySelector('#embg-k'), young = g.querySelector('#embg-y'), pn = g.querySelector('#embg-p'), pc = g.querySelector('#embg-pc');
    function age() { var r = g.querySelector('input[name=embg-age]:checked'); return r ? r.value : ''; }
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
    g.querySelector('#embg-no').addEventListener('click', function () { location.href = '../../work/emberhold/index.html'; });
    ok.addEventListener('click', function () {
      var a = age(), name = n.value.trim(), parent = a === 'teen' ? pn.value.trim() : '';
      if (!valid()) { err.textContent = 'Type your full name, choose your age and tick the box.' + (a === 'teen' ? ' A parent or guardian needs to type their name and tick theirs too.' : ''); return; }
      var ts = new Date().toISOString();
      var rec = { name: name, parent: parent, age: a === 'teen' ? '13-17' : '18+', ts: ts, version: VERSION, receipt: receipt(name, parent, a, ts), ua: navigator.userAgent.slice(0, 120) };
      try { localStorage.setItem(KEY, JSON.stringify(rec)); } catch (e) { err.textContent = 'Your browser blocks storage; allow it (not a private window) and try again.'; return; }
      g.querySelector('.k').textContent = 'Emberhold · signed';
      g.querySelector('h2').textContent = 'Your receipt';
      g.querySelector('.sc').innerHTML = '<h3>Signed</h3><p>' + esc(name) + ', ' + esc(ts.replace('T', ' ').slice(0, 16)) + ' UTC.' + (parent ? ' With the consent of ' + esc(parent) + '.' : '') + '</p>' +
        '<h3>Receipt</h3><p><span class="rcode" id="embg-rc">' + rec.receipt + '</span></p><p class="rc" id="embg-s">Recording your signature…</p>' +
        '<p style="margin-top:14px">Thank you. Play the first chapter through, then write to <a href="mailto:game@aztmm.com">game@aztmm.com</a> with what annoyed you, what you could not work out, and where you stopped.</p>';
      send(rec, function (ok) { var el = g.querySelector('#embg-s'); if (el) el.textContent = ok ? 'Recorded.' : (ENDPOINT ? 'Not sent yet (no signal); it will be sent next time you open the game.' : ''); });
      g.querySelector('.ft').innerHTML = '<div class="row"><button id="embg-go">Continue</button></div>';
      g.querySelector('#embg-go').addEventListener('click', function () { g.remove(); document.documentElement.style.overflow = ''; onDone(rec); });
    });
    n.focus();
  }
  window.EMB_GATE = {
    saved: function () { var r = saved(); return r && r.version === VERSION ? r : null; },
    version: VERSION,
    require: function (onDone) { var r = saved(); if (r && r.version === VERSION) { resend(); onDone(r); return; } if (document.body) show(onDone); else document.addEventListener('DOMContentLoaded', function () { show(onDone); }); },
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } location.reload(); }
  };
})();
