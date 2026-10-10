/* Nobodyssey Book One beta: the tester agreement gate. Shown once per device before the page or the game can be used;
 * the acceptance (name, time, a receipt code) is kept in this browser's storage and shown back as a receipt. */
(function () {
  var KEY = 'nb_beta_agreement_v1';
  var VERSION = 'Beta Test Agreement v1, 10 October 2026';
  function saved() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function receipt(name, ts) {   // a short code from the name and the time, so a screenshot of the receipt is checkable later
    var s = name + '|' + ts + '|' + VERSION, h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return 'NB1-' + h.toString(16).toUpperCase().padStart(8, '0');
  }
  var AGREEMENT = [
    ['What you are getting', 'A private, unreleased test build of Nobodyssey, Book One ("the Build"), owned by AZTMM HLDGS LLC ("AZTMM"). It is given to you personally, for the purpose of playing it and telling us what you think. It stays our property.'],
    ['Confidentiality', 'Until AZTMM releases Book One publicly, you agree to keep the Build and everything in it confidential: the link, the game itself, its story, art, music, text, code, levels, mechanics, screenshots and recordings. You will not share the link or any part of the Build with anyone, post about it, stream or record it, or describe its contents in public, unless AZTMM says in writing that you may. The one exception: the official clip on the Book One page, which you may share as it is.'],
    ['No copying', 'You will not copy, download, extract, decompile, reverse-engineer, modify, or reuse any part of the Build, its code or its assets, and you will not make anything based on it. Playing it in your browser is the only use you are allowed.'],
    ['Your feedback', 'Anything you tell us about the Build (notes, bug reports, ideas, suggestions) may be used by AZTMM freely, in the game or otherwise, without payment or credit, and you confirm it is yours to give.'],
    ['If you break this', 'You understand that a breach would cause AZTMM real harm that money alone may not repair, and that AZTMM may seek an injunction as well as damages and its legal costs against you.'],
    ['Privacy', 'The Build runs entirely in your browser. It sends nothing to any server: no account, no analytics, no tracking. Your saved game, your settings and this agreement (the name you type, the time, and a receipt code) are stored only on this device, in your browser’s local storage, and you can clear them at any time. If you email us feedback, we keep that email to act on it and do not share it.'],
    ['As is', 'This is a test build. It may have bugs, change or stop working, and may be withdrawn at any time. It is provided as is, with no warranty of any kind.'],
    ['The rest', 'You must be 13 or older. This agreement is between you and AZTMM HLDGS LLC, is governed by the laws of the State of New York, United States, and lasts until AZTMM releases Book One publicly or tells you it has ended, whichever comes first. The confidentiality and no-copying terms continue for anything that remains unreleased.']
  ];
  var CSS = '#nbgate{position:fixed;inset:0;z-index:9999;background:rgba(6,4,12,.94);display:flex;align-items:center;justify-content:center;padding:14px;font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;color:#ece4d0}' +
    '#nbgate .box{background:#120d1f;border:2px solid #3a2d5c;max-width:620px;width:100%;max-height:100%;display:flex;flex-direction:column}' +
    '#nbgate .hd{padding:16px 18px 12px;border-bottom:1px solid #3a2d5c}' +
    '#nbgate .px{font-family:"Silkscreen",ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase}' +
    '#nbgate h2{margin:0;font-size:15px;color:#f2c14e}#nbgate .k{color:#e24a3b;font-size:11px;margin-bottom:6px}' +
    '#nbgate .sc{overflow:auto;padding:12px 18px;flex:1;min-height:0}' +
    '#nbgate h3{margin:12px 0 4px;font-size:12px;color:#3fa7b5}#nbgate p{margin:0;color:#b9b0c9;font-size:14px}' +
    '#nbgate .ft{padding:12px 18px 16px;border-top:1px solid #3a2d5c;display:flex;flex-direction:column;gap:10px}' +
    '#nbgate input[type=text]{width:100%;padding:11px 12px;background:#0c0816;border:1px solid #3a2d5c;color:#ece4d0;font-size:16px}' +
    '#nbgate label.ck{display:flex;gap:10px;align-items:flex-start;color:#ece4d0;font-size:14px}#nbgate label.ck input{margin-top:4px;width:18px;height:18px}' +
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
      '<h3 class="px">Version</h3><p>' + VERSION + '</p></div>' +
      '<div class="ft"><input type="text" id="nbg-n" placeholder="Your full name" autocomplete="name" maxlength="80">' +
      '<label class="ck"><input type="checkbox" id="nbg-c"> I have read the agreement above. I am signing it with my name, and I agree to be bound by it.</label>' +
      '<div class="err" id="nbg-e"></div><div class="row"><button class="px" id="nbg-ok" disabled>Sign and continue</button><button class="px no" id="nbg-no" type="button">I do not agree</button></div></div></div>';
    document.body.appendChild(g);
    document.documentElement.style.overflow = 'hidden';
    var n = g.querySelector('#nbg-n'), c = g.querySelector('#nbg-c'), ok = g.querySelector('#nbg-ok'), err = g.querySelector('#nbg-e');
    function check() { ok.disabled = !(c.checked && n.value.trim().length >= 3); }
    n.addEventListener('input', check); c.addEventListener('change', check);
    g.querySelector('#nbg-no').addEventListener('click', function () { location.href = 'https://aztmm.com/'; });
    ok.addEventListener('click', function () {
      var name = n.value.trim(); if (name.length < 3 || !c.checked) { err.textContent = 'Type your full name and tick the box.'; return; }
      var ts = new Date().toISOString(), rec = { name: name, ts: ts, version: VERSION, receipt: receipt(name, ts), ua: navigator.userAgent.slice(0, 120) };
      try { localStorage.setItem(KEY, JSON.stringify(rec)); } catch (e) { err.textContent = 'Your browser blocks storage; allow it (not a private window) and try again.'; return; }
      g.querySelector('.sc').innerHTML = '<h3 class="px">Signed</h3><p>' + esc(name) + ', ' + esc(ts.replace('T', ' ').slice(0, 16)) + ' UTC.</p><p class="rc">Receipt ' + rec.receipt + '. Keep a screenshot of this if you like; we can check it against your name and time.</p><p style="margin-top:10px">Thank you. Play it through, then write to game@aztmm.com with what annoyed you, what you could not work out, and where you stopped.</p>';
      g.querySelector('.ft').innerHTML = '<div class="row"><button class="px" id="nbg-go">Continue</button></div>';
      g.querySelector('#nbg-go').addEventListener('click', function () { g.remove(); document.documentElement.style.overflow = ''; onDone(rec); });
    });
    n.focus();
  }
  window.NB_GATE = {
    saved: saved,
    require: function (onDone) { var r = saved(); if (r && r.version === VERSION) { onDone(r); return; } if (document.body) show(onDone); else document.addEventListener('DOMContentLoaded', function () { show(onDone); }); },
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } location.reload(); }
  };
})();
