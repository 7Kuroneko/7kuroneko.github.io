/* The Kuroneko Company — branded loading screen. One brand, a unique stage per project (data-variant). */
(function () {
  if (window.__knLoader) return; window.__knLoader = true;
  var me = document.currentScript || document.querySelector('script[src*="kn-loader"]');
  var d = (me && me.dataset) || {};
  var bg = d.bg || '#0A0908', acc = d.accent || '#E8ECCC', acc2 = d.accent2 || acc, ink = d.ink || '#F2EFE8', mute = d.mute || 'rgba(242,239,232,.55)';
  var title = d.title || document.title || '', kind = d.kind || 'Interactive Study', V = d.variant || 'line';
  var font = d.font || "'Geist','Helvetica Neue',sans-serif", mono = d.mono || "'Geist Mono',ui-monospace,monospace";
  var steps = (d.steps || 'Loading').split('|'), wait = d.wait || 'load', MIN = +d.min || 1500, MAX = +d.max || 9000;
  var CAT = 'M11.2 5.5h5v4.6h-5zM84 5.5h5v4.6h-5zM11.6 13h15.4v4.6h-15.4zM73.2 13h15.4v4.6h-15.4zM12.2 20.5h25.8v4.6h-25.8zM62.2 20.5h25.8v4.6h-25.8zM12.6 28h75v4.6h-75zM11.2 35.5h77.8v4.6h-77.8zM9.2 43h81.8v4.6h-81.8zM8.2 50.5h13.4v4.6h-13.4zM40.2 50.5h19.8v4.6h-19.8zM78.6 50.5h13.4v4.6h-13.4zM8.2 58h24v4.6h-24zM39.4 58h21.4v4.6h-21.4zM68 58h24v4.6h-24zM9 65.5h82.2v4.6h-82.2zM12.2 73h75.8v4.6h-75.8zM18.4 80.5h63.4v4.6h-63.4zM31.2 88h37.8v4.6h-37.8z';
  var cat = function (s) { return '<svg viewBox="0 0 100 100" width="' + s + '" height="' + s + '" style="display:block;flex:none"><path d="' + CAT + '" fill="' + (d.cat || '#E8ECCC') + '"></path></svg>'; };
  var M = function (sz, c, ls) { return 'font:500 ' + sz + 'px/1.3 ' + mono + ';letter-spacing:' + (ls || '.2em') + ';text-transform:uppercase;color:' + (c || mute); };
  var brand = '<span style="' + M(10.5) + '">The Kuroneko Company · Portfolio</span>';
  var T = function (sz, al) { return '<span style="font-weight:600;font-size:' + sz + ';line-height:1.02;letter-spacing:-.04em;text-wrap:balance;color:' + ink + ';text-align:' + (al || 'center') + '">' + title + '</span>'; };
  var K = '<span style="' + M(10.5, acc, '.18em') + '">' + kind + '</span>';
  var meta = '<div style="display:flex;justify-content:space-between;' + M(10, mute, '.16em') + '"><span data-k="step">' + steps[0] + '</span><span data-k="pct">00%</span></div>';
  var html = '', bgx = bg, setP = function () {}, anim = null;

  if (V === 'teardown') {
    bgx = bg + ';background-image:linear-gradient(' + acc + '14 1px,transparent 1px),linear-gradient(90deg,' + acc + '14 1px,transparent 1px);background-size:44px 44px;background-position:center';
    var br = function (pos) { return '<span style="position:absolute;' + pos + ';width:16px;height:16px;border-color:' + acc + ';border-style:solid;border-width:0"></span>'; };
    html = '<div style="position:relative;display:flex;flex-direction:column;align-items:center;gap:26px;padding:44px 52px;width:min(520px,88vw);background:' + bg + 'e6">' +
      br('left:0;top:0;border-left-width:1px;border-top-width:1px') + br('right:0;top:0;border-right-width:1px;border-top-width:1px') + br('left:0;bottom:0;border-left-width:1px;border-bottom-width:1px') + br('right:0;bottom:0;border-right-width:1px;border-bottom-width:1px') +
      '<div style="position:absolute;left:0;right:0;height:1px;background:' + acc + ';opacity:.5;box-shadow:0 0 12px ' + acc + '" data-k="scan"></div>' +
      cat(64) + '<div style="display:flex;flex-direction:column;align-items:center;gap:12px">' + brand + T('clamp(28px,4vw,40px)') + K + '</div>' +
      '<div style="width:100%;display:flex;flex-direction:column;gap:6px" data-k="log"></div>' +
      '<div style="width:100%;display:flex;flex-direction:column;gap:10px"><div style="height:2px;background:' + acc + '22;position:relative"><div data-k="fill" style="position:absolute;inset:0 auto 0 0;width:0;background:repeating-linear-gradient(90deg,' + acc + ' 0 6px,transparent 6px 9px)"></div></div>' + meta + '</div></div>';
    setP = function (p, q) { var lg = q('log'); var n = Math.min(steps.length, Math.floor(p / 100 * steps.length) + 1);
      lg.innerHTML = steps.slice(0, n).map(function (s, i) { var ok = i < n - 1 || p > 99; return '<div style="display:flex;gap:10px;' + M(10, ok ? ink : acc, '.14em') + '"><span style="color:' + mute + '">' + String(i + 1).padStart(2, '0') + '</span><span style="flex:1;overflow:hidden;white-space:nowrap">' + s + ' ' + '.'.repeat(40) + '</span><span style="color:' + (ok ? acc : mute) + '">' + (ok ? 'OK' : '··') + '</span></div>'; }).join(''); };
    anim = function (t, q) { q('scan').style.top = (8 + (t / 18 % 100) * .84) + '%'; };
  } else if (V === 'saber') {
    html = '<div style="display:flex;flex-direction:column;align-items:center;gap:40px;width:min(760px,90vw)">' +
      '<div style="display:flex;flex-direction:column;align-items:center;gap:14px">' + cat(56) + brand + T('clamp(30px,4.6vw,48px)') + K + '</div>' +
      '<div style="position:relative;width:100%;height:30px;display:flex;align-items:center">' +
        '<div style="width:15%;height:12px;flex:none;background:linear-gradient(90deg,#3a3b3e,#a9adb2 40%,#d9dcdf 60%,#5a5c61);border-radius:2px;position:relative"><span style="position:absolute;left:30%;top:-3px;width:16%;height:4px;background:#121212"></span></div>' +
        '<div style="flex:1;height:30px;position:relative"><div data-k="fill" style="position:absolute;left:0;top:50%;height:5px;width:0;transform:translateY(-50%);border-radius:0 3px 3px 0;background:#fff;box-shadow:0 0 3px 1px ' + acc + ',0 0 10px 3px ' + acc + ',0 0 26px 7px ' + acc + '88"></div></div></div>' +
      '<div style="width:100%">' + meta + '</div></div>';
  } else if (V === 'planner') {
    bgx = bg + ';background-image:radial-gradient(ellipse 70% 60% at 70% 40%,' + acc + '22,transparent 70%)';
    var dots = ''; for (var i = 0; i < 96; i++) dots += '<span data-dot style="width:9px;height:9px;border-radius:2px;background:' + acc + '22;transition:background .25s,box-shadow .25s"></span>';
    html = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:48px 64px;align-items:end;width:min(1000px,88vw)">' +
      '<div style="display:flex;flex-direction:column;gap:22px"><div style="display:flex;align-items:center;gap:12px">' + cat(30) + brand + '</div>' + T('clamp(40px,6.4vw,84px)', 'left') + K + '</div>' +
      '<div style="display:flex;flex-direction:column;gap:14px"><div style="display:grid;grid-template-columns:repeat(16,9px);gap:7px;justify-content:start">' + dots + '</div>' +
      '<div style="' + M(10, mute, '.14em') + '"><span data-k="nodes">0</span> / 96 Nodes Provisioned</div>' + '<div style="height:1px;background:' + acc + '33;position:relative"><div data-k="fill" style="position:absolute;inset:0 auto 0 0;width:0;background:' + acc + '"></div></div>' + meta + '</div></div>';
    setP = function (p, q, el) { var n = Math.round(p / 100 * 96); q('nodes').textContent = n; var ds = el.querySelectorAll('[data-dot]'); for (var i = 0; i < ds.length; i++) { var on = i < n; ds[i].style.background = on ? (i === n - 1 ? '#fff' : acc) : acc + '22'; } };
  } else if (V === 'genetics') {
    var N = 30, pairs = ''; for (var j = 0; j < N; j++) pairs += '<div data-pair style="position:relative;flex:1;height:120px"><span data-a style="position:absolute;left:50%;width:7px;height:7px;margin-left:-3.5px;border-radius:50%"></span><span data-b style="position:absolute;left:50%;width:7px;height:7px;margin-left:-3.5px;border-radius:50%"></span><span data-l style="position:absolute;left:50%;width:1px;margin-left:-.5px"></span></div>';
    bgx = bg + ';background-image:radial-gradient(ellipse 60% 50% at 50% 55%,' + acc + '1c,transparent 70%)';
    html = '<div style="display:flex;flex-direction:column;align-items:center;gap:30px;width:min(680px,90vw)">' +
      '<div style="display:flex;flex-direction:column;align-items:center;gap:12px">' + cat(52) + brand + T('clamp(30px,4.6vw,46px)') + K + '</div>' +
      '<div style="display:flex;width:100%;gap:2px" data-k="helix">' + pairs + '</div>' +
      '<div style="width:100%;display:flex;flex-direction:column;gap:10px"><div style="' + M(10, mute, '.14em') + ';text-align:center">Sequenced <span data-k="bp" style="color:' + acc + '">0</span> / ' + N + ' Base Pairs</div>' + meta + '</div></div>';
    var gp = 0; setP = function (p) { gp = p; };
    anim = function (t, q, el) { var ps = el.querySelectorAll('[data-pair]'), n = Math.round(gp / 100 * N); q('bp').textContent = n;
      for (var i = 0; i < ps.length; i++) { var ph = t / 650 + i * .42, s = Math.sin(ph), c = Math.cos(ph), y1 = 60 + s * 44, y2 = 60 - s * 44, on = i < n;
        var a = ps[i].children[0], b = ps[i].children[1], l = ps[i].children[2];
        a.style.top = (y1 - 3.5) + 'px'; b.style.top = (y2 - 3.5) + 'px';
        a.style.background = on ? acc : acc + '40'; b.style.background = on ? acc2 : acc2 + '40';
        a.style.opacity = .45 + .55 * (c > 0 ? 1 : .4); b.style.opacity = .45 + .55 * (c < 0 ? 1 : .4);
        var lo = Math.min(y1, y2), hi = Math.max(y1, y2); l.style.top = lo + 'px'; l.style.height = (hi - lo) + 'px'; l.style.background = on ? 'linear-gradient(' + acc + ',' + acc2 + ')' : mute; l.style.opacity = on ? .7 : .15; } };
  } else if (V === 'field') {
    var pts = [], y = 120, seed = 7; for (var k = 0; k <= 60; k++) { seed = (seed * 9301 + 49297) % 233280; y += (seed / 233280 - .62) * 14; y = Math.max(18, Math.min(150, y)); pts.push((k * 10) + ',' + y.toFixed(1)); }
    var grid = ''; for (var g = 1; g < 4; g++) grid += '<line x1="0" x2="600" y1="' + g * 40 + '" y2="' + g * 40 + '" stroke="' + mute + '" stroke-opacity=".18" stroke-dasharray="2 4"></line>';
    html = '<div style="display:flex;flex-direction:column;gap:30px;width:min(760px,90vw)">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap"><div style="display:flex;flex-direction:column;gap:14px"><div style="display:flex;align-items:center;gap:12px">' + cat(30) + brand + '</div>' + T('clamp(32px,5vw,56px)', 'left') + K + '</div>' +
      '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px"><span style="' + M(10, mute, '.14em') + '">Index</span><span data-k="idx" style="font:600 28px/1 ' + mono + ';color:' + acc + ';letter-spacing:-.02em">0.00</span></div></div>' +
      '<svg viewBox="0 0 600 160" preserveAspectRatio="none" style="width:100%;height:160px;display:block;overflow:visible">' + grid +
        '<polyline data-k="line" points="' + pts.join(' ') + '" fill="none" stroke="' + acc + '" stroke-width="2" vector-effect="non-scaling-stroke" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"></polyline>' +
        '<circle data-k="dot" r="4" fill="' + acc + '" cx="0" cy="120"></circle></svg>' + meta + '</div>';
    setP = function (p, q) { q('line').setAttribute('stroke-dashoffset', (100 - p).toFixed(2)); var i = Math.min(pts.length - 1, Math.round(p / 100 * (pts.length - 1))), xy = pts[i].split(','); q('dot').setAttribute('cx', xy[0]); q('dot').setAttribute('cy', xy[1]); q('idx').textContent = ((160 - xy[1]) / 10).toFixed(2); };
  } else if (V === 'wand') {
    var RC = 205, RCY = 112, RR = 66, ticks = '', runes = '';
    for (var ti = 0; ti < 36; ti++) { var ang = ti / 36 * Math.PI * 2, r1 = RR + 6, r2 = RR + (ti % 3 ? 10 : 15); ticks += '<line data-tick x1="' + (RC + Math.sin(ang) * r1).toFixed(1) + '" y1="' + (RCY - Math.cos(ang) * r1).toFixed(1) + '" x2="' + (RC + Math.sin(ang) * r2).toFixed(1) + '" y2="' + (RCY - Math.cos(ang) * r2).toFixed(1) + '" stroke="' + mute + '" stroke-width=".8"></line>'; }
    for (var ri = 0; ri < 6; ri++) { var ra = ri / 6 * Math.PI * 2 + .52, rx2 = RC + Math.sin(ra) * (RR - 22), ry2 = RCY - Math.cos(ra) * (RR - 22); runes += '<g data-rune opacity=".2" transform="translate(' + rx2.toFixed(1) + ' ' + ry2.toFixed(1) + ') rotate(' + (ra * 57.3).toFixed(0) + ')"><path d="M0 -6 L0 6 M-4 -2 L4 2 M-3 4 L3 -4" stroke="' + acc + '" stroke-width="1" fill="none"></path></g>'; }
    var sparkC = ''; for (var si = 0; si < 10; si++) sparkC += '<circle data-sp r="' + (2.2 - si * .18).toFixed(2) + '" fill="' + acc + '" opacity="0"></circle>';
    html = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:36px 64px;align-items:center;width:min(1000px,88vw)">' +
      '<div style="display:flex;flex-direction:column;gap:20px;min-width:0"><div style="display:flex;align-items:center;gap:12px">' + cat(30) + brand + '</div>' + T('clamp(40px,6vw,76px)', 'left') + K +
        '<div style="display:grid;grid-template-columns:auto 1fr;gap:8px 18px;padding:14px 0;border-top:1px solid ' + ink + '1f;border-bottom:1px solid ' + ink + '1f;' + M(10, mute, '.14em') + '"><span>Wood</span><span data-k="wd" style="color:' + ink + '">—</span><span>Core</span><span data-k="cr" style="color:' + ink + '">—</span><span>Length</span><span data-k="ln" style="color:' + acc2 + '">—</span></div></div>' +
      '<div style="display:flex;flex-direction:column;gap:14px;min-width:0"><svg viewBox="0 0 320 210" style="width:100%;display:block;overflow:visible">' +
        '<circle cx="' + RC + '" cy="' + RCY + '" r="' + RR + '" fill="none" stroke="' + ink + '" stroke-opacity=".1"></circle>' +
        '<circle cx="' + RC + '" cy="' + RCY + '" r="' + (RR - 34) + '" fill="none" stroke="' + ink + '" stroke-opacity=".08" stroke-dasharray="2 3"></circle>' + ticks + runes +
        '<path data-k="arc" d="M' + RC + ' ' + (RCY - RR) + ' a' + RR + ' ' + RR + ' 0 1 1 -.01 0" fill="none" stroke="' + acc + '" stroke-width="1.6" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" style="filter:drop-shadow(0 0 3px ' + acc + ')"></path>' +
        '<line data-k="wand" x1="34" y1="196" x2="' + RC + '" y2="' + (RCY - RR) + '" stroke="' + acc2 + '" stroke-width="3.2" stroke-linecap="round"></line>' +
        '<line data-k="wand2" x1="34" y1="196" x2="70" y2="176" stroke="' + ink + '" stroke-opacity=".35" stroke-width="4.4" stroke-linecap="round"></line>' + sparkC +
        '<circle data-k="tipg" r="9" fill="' + acc + '" opacity=".18"></circle><circle data-k="tip" r="2.6" fill="#fff"></circle>' +
      '</svg><div style="height:1px;background:' + acc + '33;position:relative"><div data-k="fill" style="position:absolute;inset:0 auto 0 0;width:0;background:' + acc + '"></div></div>' + meta + '</div></div>';
    var WD = ['Holly', 'Yew', 'Elder', 'Vine', 'Willow', 'Ash', 'Hawthorn', 'Walnut', 'Cherry', 'Rowan', 'Ebony', 'Larch', 'Cedar'], CR = ['Phoenix Feather', 'Dragon Heartstring', 'Unicorn Hair'], gp = 0, hist = [];
    setP = function (p, q, el) { gp = p; q('arc').setAttribute('stroke-dashoffset', (100 - p).toFixed(2)); var tk = el.querySelectorAll('[data-tick]'), n = Math.floor(p / 100 * tk.length); for (var i = 0; i < tk.length; i++) { tk[i].setAttribute('stroke', i < n ? acc : mute); tk[i].setAttribute('stroke-opacity', i < n ? '.9' : '.35'); }
      var rn = el.querySelectorAll('[data-rune]'); for (var j = 0; j < rn.length; j++) rn[j].setAttribute('opacity', p > (j + 1) * 15 ? '.95' : '.2');
      var lock = p > 99; q('wd').textContent = lock ? 'Chosen' : WD[Math.floor(p * 1.7) % WD.length]; q('cr').textContent = lock ? 'Bonded' : CR[Math.floor(p / 9) % CR.length]; q('ln').textContent = lock ? 'Perfect Fit' : (9 + (Math.floor(p * 2.3) % 25) / 4).toFixed(2).replace(/\.?0+$/, '') + '″'; };
    anim = function (t, q, el) { var a = gp / 100 * Math.PI * 2 + Math.sin(t / 240) * .015, x = RC + Math.sin(a) * RR, y = RCY - Math.cos(a) * RR;
      q('wand').setAttribute('x2', x.toFixed(1)); q('wand').setAttribute('y2', y.toFixed(1)); q('tip').setAttribute('cx', x.toFixed(1)); q('tip').setAttribute('cy', y.toFixed(1)); q('tipg').setAttribute('cx', x.toFixed(1)); q('tipg').setAttribute('cy', y.toFixed(1)); q('tipg').setAttribute('r', (8 + Math.sin(t / 120) * 2).toFixed(1));
      var dx = x - 34, dy = y - 196, dl = Math.hypot(dx, dy); q('wand2').setAttribute('x2', (34 + dx / dl * 42).toFixed(1)); q('wand2').setAttribute('y2', (196 + dy / dl * 42).toFixed(1));
      hist.unshift([x, y]); if (hist.length > 40) hist.pop(); var sp = el.querySelectorAll('[data-sp]'); for (var i = 0; i < sp.length; i++) { var h = hist[Math.min(hist.length - 1, i * 3 + 2)]; if (!h) continue; var jx = Math.sin(t / 90 + i * 2) * (1 + i * .5), jy = Math.cos(t / 110 + i) * (1 + i * .5); sp[i].setAttribute('cx', (h[0] + jx).toFixed(1)); sp[i].setAttribute('cy', (h[1] + jy).toFixed(1)); sp[i].setAttribute('opacity', (.8 - i * .07).toFixed(2)); } };
  } else if (V === 'campus') {
    bgx = bg + ';background-image:linear-gradient(' + acc2 + '12 1px,transparent 1px),linear-gradient(90deg,' + acc2 + '12 1px,transparent 1px),linear-gradient(' + acc2 + '07 1px,transparent 1px),linear-gradient(90deg,' + acc2 + '07 1px,transparent 1px);background-size:120px 120px,120px 120px,24px 24px,24px 24px;background-position:center';
    var IS = 7, CX = 268, CY = 160;
    var iso = function (x, y, z) { return [CX + (x - y) * .866 * IS, CY + (x + y) * .5 * IS - z * IS]; };
    var pp = function (a) { return a.map(function (v) { var r = iso(v[0], v[1], v[2]); return r[0].toFixed(1) + ',' + r[1].toFixed(1); }).join(' '); };
    var box = function (x, y, w, d, h) { return { t: pp([[x, y, h], [x + w, y, h], [x + w, y + d, h], [x, y + d, h]]), r: pp([[x + w, y, 0], [x + w, y + d, 0], [x + w, y + d, h], [x + w, y, h]]), l: pp([[x, y + d, 0], [x + w, y + d, 0], [x + w, y + d, h], [x, y + d, h]]) }; };
    var solid = function (b, top, r, l, st, sw, extra) { return '<polygon points="' + b.l + '" fill="' + l + '" stroke="' + st + '" stroke-width="' + sw + '"' + (extra || '') + '></polygon><polygon points="' + b.r + '" fill="' + r + '" stroke="' + st + '" stroke-width="' + sw + '"' + (extra || '') + '></polygon><polygon points="' + b.t + '" fill="' + top + '" stroke="' + st + '" stroke-width="' + sw + '"' + (extra || '') + '></polygon>'; };
    var HALLS = [[-19, -15], [-8, -15], [3, -15], [-19, -1], [-8, -1], [3, -1]], HW = 9, HD = 11.5, HH = 4.8, NAMES = 'ABCDEF';
    var sv = '';
    var pad = box(-23, -19, 48, 37, .7);
    sv += solid(pad, '#171B21', '#0E1115', '#12151A', ink + '40', '.6');
    sv += '<polygon points="' + pp([[-21, -17, .7], [23, -17, .7], [23, 16, .7], [-21, 16, .7]]) + '" fill="none" stroke="' + acc2 + '" stroke-width=".9" stroke-dasharray="3 3" data-k="fiber" opacity=".8"></polygon>';
    for (var gx = -20; gx <= 22; gx += 3.5) sv += '<line x1="' + iso(gx, -18, .7)[0].toFixed(1) + '" y1="' + iso(gx, -18, .7)[1].toFixed(1) + '" x2="' + iso(gx, 17, .7)[0].toFixed(1) + '" y2="' + iso(gx, 17, .7)[1].toFixed(1) + '" stroke="' + ink + '" stroke-opacity=".05"></line>';
    var a0 = iso(-23, 18, 0), a1 = iso(25, 18, 0);
    sv += '<line x1="' + (a0[0] - 6).toFixed(1) + '" y1="' + (a0[1] + 3.4).toFixed(1) + '" x2="' + (a1[0] - 6).toFixed(1) + '" y2="' + (a1[1] + 3.4).toFixed(1) + '" stroke="' + mute + '" stroke-opacity=".6" stroke-width=".6"></line>';
    sv += '<text x="' + ((a0[0] + a1[0]) / 2 - 14).toFixed(1) + '" y="' + ((a0[1] + a1[1]) / 2 + 14).toFixed(1) + '" fill="' + mute + '" transform="rotate(30 ' + ((a0[0] + a1[0]) / 2 - 14).toFixed(1) + ' ' + ((a0[1] + a1[1]) / 2 + 14).toFixed(1) + ')" style="font:500 6px ' + mono + ';letter-spacing:.2em">SITE PAD · NOT TO SCALE</text>';
    for (var gi = 0; gi < 9; gi++) { var gb = box(-19 + gi * 3.4, 12.2, 2.4, 2.2, 1.6); sv += '<g data-gen="' + gi + '" opacity=".25">' + solid(gb, '#2A3038', '#181C22', '#1F242B', ink + '55', '.4') + '</g>'; }
    var order = [0, 1, 3, 2, 4, 5];
    order.forEach(function (i) { var H = HALLS[i], gh = box(H[0], H[1], HW, HD, HH);
      sv += '<polygon points="' + pp([[H[0], H[1], HH], [H[0] + HW, H[1], HH], [H[0] + HW, H[1] + HD, HH], [H[0], H[1] + HD, HH]]) + '" fill="none" stroke="' + acc2 + '" stroke-opacity=".35" stroke-width=".6" stroke-dasharray="2 2"></polygon>';
      [[H[0], H[1]], [H[0] + HW, H[1]], [H[0] + HW, H[1] + HD], [H[0], H[1] + HD]].forEach(function (c) { var b0 = iso(c[0], c[1], 0), b1 = iso(c[0], c[1], HH); sv += '<line x1="' + b0[0].toFixed(1) + '" y1="' + b0[1].toFixed(1) + '" x2="' + b1[0].toFixed(1) + '" y2="' + b1[1].toFixed(1) + '" stroke="' + acc2 + '" stroke-opacity=".3" stroke-width=".5" stroke-dasharray="2 2"></line>'; });
      var roof = ''; [[1.6, 2.2], [1.6, 6.4], [5.2, 2.2], [5.2, 6.4]].forEach(function (o) { roof += solid(box(H[0] + o[0], H[1] + o[1], 2.2, 2.8, HH + .9), '#3A424D', '#20252C', '#2A3038', ink + '66', '.35'); });
      var lp = iso(H[0] + HW / 2, H[1] + HD + 1.6, 0);
      sv += '<g data-hall="' + i + '"><polygon fill="#1C2027" stroke="' + acc + '" stroke-width=".7"></polygon><polygon fill="#161A1F" stroke="' + acc + '" stroke-width=".7"></polygon><polygon fill="' + acc + '" fill-opacity=".25" stroke="' + acc + '" stroke-width=".9"></polygon><g data-roof opacity="0">' + roof + '</g></g>' +
        '<text x="' + lp[0].toFixed(1) + '" y="' + lp[1].toFixed(1) + '" text-anchor="middle" fill="' + mute + '" style="font:600 6.5px ' + mono + ';letter-spacing:.1em">' + NAMES[i] + '</text>'; });
    var sub = '<g data-k="sub" opacity=".3">' + solid(box(15, -15, 8, 9, .4), '#1A1E24', '#111418', '#15181D', acc2 + '88', '.5');
    [[16, -13.5], [16, -10], [19.5, -13.5], [19.5, -10]].forEach(function (o) { sub += solid(box(o[0], o[1], 2.2, 2.4, 2.4), '#2E353F', '#1A1E24', '#232830', acc2, '.45'); });
    [[15.6, -14.4], [22.4, -14.4], [22.4, -6.6]].forEach(function (o) { var b0 = iso(o[0], o[1], .4), b1 = iso(o[0], o[1], 5.4); sub += '<line x1="' + b0[0].toFixed(1) + '" y1="' + b0[1].toFixed(1) + '" x2="' + b1[0].toFixed(1) + '" y2="' + b1[1].toFixed(1) + '" stroke="' + acc2 + '" stroke-width=".7"></line>'; });
    sub += '</g>'; sv += sub;
    var TX = [[37, -30, 12], [29, -22, 10], [22.4, -14.4, 5.4]], txp = TX.map(function (v) { return iso(v[0], v[1], v[2]); });
    TX.slice(0, 2).forEach(function (v) { var b0 = iso(v[0], v[1], 0), b1 = iso(v[0], v[1], v[2]), l0 = iso(v[0] - 1.6, v[1] + 1.6, v[2] - 1), l1 = iso(v[0] + 1.6, v[1] - 1.6, v[2] - 1); sv += '<line x1="' + b0[0].toFixed(1) + '" y1="' + b0[1].toFixed(1) + '" x2="' + b1[0].toFixed(1) + '" y2="' + b1[1].toFixed(1) + '" stroke="' + ink + '" stroke-opacity=".45" stroke-width=".8"></line><line x1="' + l0[0].toFixed(1) + '" y1="' + l0[1].toFixed(1) + '" x2="' + l1[0].toFixed(1) + '" y2="' + l1[1].toFixed(1) + '" stroke="' + ink + '" stroke-opacity=".45" stroke-width=".8"></line>'; });
    sv += '<polyline data-k="tline" points="' + txp.map(function (v) { return v[0].toFixed(1) + ',' + v[1].toFixed(1); }).join(' ') + '" fill="none" stroke="' + acc + '" stroke-width="1" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"></polyline><circle data-k="pulse" r="2" fill="#fff" opacity="0"></circle>';
    sv += '<g data-k="crane" stroke="' + ink + '" stroke-width=".9" stroke-linecap="round"><line data-c="mast"></line><line data-c="jib"></line><line data-c="cjib" stroke-width="1.6"></line><line data-c="hook" stroke="' + acc + '" stroke-width=".6"></line></g>';
    var c0 = iso(-23, -19, 0);
    sv += '<text x="' + (c0[0] - 70).toFixed(1) + '" y="' + (c0[1] - 26).toFixed(1) + '" fill="' + acc2 + '" style="font:500 6.5px ' + mono + ';letter-spacing:.2em">CHEYENNE, WY · 41.14° N 104.82° W</text>';
    sv += '<rect data-k="scan" x="10" y="10" width="600" height="1.2" fill="' + acc2 + '" opacity=".35"></rect>';
    var br = function (pos) { return '<span style="position:absolute;' + pos + ';width:14px;height:14px;border-color:' + acc2 + ';border-style:solid;border-width:0;opacity:.7"></span>'; };
    html = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:36px 56px;align-items:center;width:min(1180px,92vw)">' +
      '<div style="display:flex;flex-direction:column;gap:20px;min-width:0"><div style="display:flex;align-items:center;gap:12px">' + cat(30) + brand + '</div>' + T('clamp(32px,4.4vw,56px)', 'left') + K +
        '<div style="display:grid;grid-template-columns:repeat(3,auto);gap:24px;justify-content:start;padding:14px 0;border-top:1px solid ' + ink + '1f;border-bottom:1px solid ' + ink + '1f">' +
          '<div style="display:flex;flex-direction:column;gap:6px"><span data-k="hn" style="font:600 28px/1 ' + mono + ';color:' + acc + ';letter-spacing:-.03em">0/6</span><span style="' + M(9, mute, '.14em') + '">Data Halls</span></div>' +
          '<div style="display:flex;flex-direction:column;gap:6px"><span data-k="ph" style="font:600 28px/1 ' + mono + ';color:' + ink + ';letter-spacing:-.03em">P1</span><span style="' + M(9, mute, '.14em') + '">Phase</span></div>' +
          '<div style="display:flex;flex-direction:column;gap:6px"><span data-k="sp" style="font:600 28px/1 ' + mono + ';color:' + acc2 + ';letter-spacing:-.03em">0%</span><span style="' + M(9, mute, '.14em') + '">Site Built</span></div></div>' +
        '<div data-k="log" style="display:flex;flex-direction:column;gap:6px;min-height:84px"></div></div>' +
      '<div style="position:relative;padding:18px;min-width:0">' + br('left:0;top:0;border-left-width:1px;border-top-width:1px') + br('right:0;top:0;border-right-width:1px;border-top-width:1px') + br('left:0;bottom:0;border-left-width:1px;border-bottom-width:1px') + br('right:0;bottom:0;border-right-width:1px;border-bottom-width:1px') +
        '<svg viewBox="10 10 600 330" style="width:100%;display:block;overflow:visible">' + sv + '</svg>' +
        '<div style="display:flex;flex-direction:column;gap:10px;margin-top:8px"><div style="height:1px;background:' + acc + '33;position:relative"><div data-k="fill" style="position:absolute;inset:0 auto 0 0;width:0;background:' + acc + '"></div></div>' + meta + '</div></div></div>';
    var gp = 0;
    setP = function (p, q, el) { gp = p; var f = p / 100 * 6.6, n = 0;
      for (var i = 0; i < 6; i++) { var k = Math.max(0, Math.min(1, f - i)), g = el.querySelector('[data-hall="' + i + '"]'), H = HALLS[i], b = box(H[0], H[1], HW, HD, Math.max(.02, HH * k)), ps = g.children, done = k >= 1; if (done) n++;
        ps[0].setAttribute('points', b.l); ps[1].setAttribute('points', b.r); ps[2].setAttribute('points', b.t);
        ps[0].setAttribute('stroke', done ? ink + '40' : acc); ps[1].setAttribute('stroke', done ? ink + '40' : acc); ps[2].setAttribute('stroke', done ? acc2 + '99' : acc);
        ps[2].setAttribute('fill', done ? '#232830' : acc); ps[2].setAttribute('fill-opacity', done ? '1' : (.12 + .2 * k).toFixed(2)); ps[3].setAttribute('opacity', done ? '1' : '0'); g.style.opacity = k > 0 ? '1' : '.4'; }
      q('hn').textContent = n + '/6'; q('ph').textContent = 'P' + Math.min(4, 1 + Math.floor(p / 26)); q('sp').textContent = Math.round(p) + '%';
      var gens = el.querySelectorAll('[data-gen]'); for (var j = 0; j < gens.length; j++) gens[j].setAttribute('opacity', p > 55 + j * 3 ? '1' : '.25');
      var en = Math.max(0, Math.min(1, (p - 62) / 30)); q('tline').setAttribute('stroke-dashoffset', (100 - en * 100).toFixed(1)); q('sub').setAttribute('opacity', p > 88 ? '1' : (.3 + en * .4).toFixed(2));
      var lg = q('log'), m = Math.min(steps.length, Math.floor(p / 100 * steps.length) + 1);
      lg.innerHTML = steps.slice(Math.max(0, m - 4), m).map(function (s, ii, arr) { var idx = Math.max(0, m - 4) + ii, ok = idx < m - 1 || p > 99; return '<div style="display:flex;gap:10px;' + M(9.5, ok ? ink : acc, '.14em') + '"><span style="color:' + mute + '">' + String(idx + 1).padStart(2, '0') + '</span><span style="flex:1;overflow:hidden;white-space:nowrap">' + s + ' ' + '.'.repeat(60) + '</span><span style="color:' + (ok ? acc2 : mute) + '">' + (ok ? 'OK' : '··') + '</span></div>'; }).join(''); };
    anim = function (t, q, el) {
      q('fiber').setAttribute('stroke-dashoffset', (-(t / 60) % 600).toFixed(1));
      q('scan').setAttribute('y', (10 + ((t / 22) % 330)).toFixed(1));
      var f = gp / 100 * 6.6, cur = Math.min(5, Math.floor(f)), H = HALLS[cur], mx = H[0] + HW + 1.4, my = H[1] - 1.4, top = 13;
      var a = Math.sin(t / 1600) * 1.1 + .6, jx = mx - Math.cos(a) * 11, jy = my + Math.sin(a) * 11, cx2 = mx + Math.cos(a) * 3.5, cy2 = my - Math.sin(a) * 3.5;
      var P0 = iso(mx, my, 0), P1 = iso(mx, my, top), J = iso(jx, jy, top), C2 = iso(cx2, cy2, top), hk = iso(mx - Math.cos(a) * 7.5, my + Math.sin(a) * 7.5, top), hb = iso(mx - Math.cos(a) * 7.5, my + Math.sin(a) * 7.5, top - 4 - Math.sin(t / 420) * 1.2);
      var cr = el.querySelector('[data-k="crane"]').children, set = function (ln, A, B) { ln.setAttribute('x1', A[0].toFixed(1)); ln.setAttribute('y1', A[1].toFixed(1)); ln.setAttribute('x2', B[0].toFixed(1)); ln.setAttribute('y2', B[1].toFixed(1)); };
      set(cr[0], P0, P1); set(cr[1], P1, J); set(cr[2], P1, C2); set(cr[3], hk, hb);
      el.querySelector('[data-k="crane"]').setAttribute('opacity', gp > 98 ? '0' : '1');
      var pu = q('pulse'); if (gp > 75) { var u = (t / 1300) % 1, sg = u < .5 ? 0 : 1, lu = sg ? (u - .5) * 2 : u * 2, A2 = txp[sg], B2 = txp[sg + 1]; pu.setAttribute('cx', (A2[0] + (B2[0] - A2[0]) * lu).toFixed(1)); pu.setAttribute('cy', (A2[1] + (B2[1] - A2[1]) * lu).toFixed(1)); pu.setAttribute('opacity', '1'); } else pu.setAttribute('opacity', '0'); };
  } else if (V === 'cursed') {
    bgx = '#05060C;background-image:radial-gradient(ellipse 60% 55% at 50% 60%,' + acc2 + '1f,transparent 70%)';
    html = '<div style="display:flex;flex-direction:column;align-items:center;gap:22px;width:min(720px,92vw)">' +
      '<div style="display:flex;flex-direction:column;align-items:center;gap:12px">' + cat(44) + brand + T('clamp(32px,5vw,52px)') + K + '</div>' +
      '<div style="position:relative;width:min(100%,calc((100vh - 300px) * 1.78));aspect-ratio:16/9;-webkit-mask:radial-gradient(ellipse 50% 50% at 50% 50%,#000 55%,transparent 100%);mask:radial-gradient(ellipse 50% 50% at 50% 50%,#000 55%,transparent 100%)"><canvas data-k="cv" width="960" height="540" style="position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity .8s"></canvas></div>' +
      '<div style="width:100%;max-width:520px;display:flex;flex-direction:column;gap:10px"><div style="height:1px;background:' + acc + '22;position:relative"><div data-k="fill" style="position:absolute;inset:0 auto 0 0;width:0;background:linear-gradient(90deg,' + acc2 + ',#fff);box-shadow:0 0 8px ' + acc2 + '"></div></div>' + meta + '</div></div>';
    var gp = 0, cx = null, T0 = 540;
    setP = function (p) { gp = p; };
    anim = function (t, q) {
      var S = window.CursedScene; if (!S || !S.draw) return;
      var cvs = q('cv'); if (!cx) { cx = cvs.getContext('2d'); cvs.style.opacity = '1'; }
      cx.setTransform(.5, 0, 0, .5, 0, 0);
      try { S.draw(cx, T0 + t / 1000, { palette: 'cursed', glow: .35 + .65 * gp / 100, wave: 0, depth: 1, density: 1 }); } catch (e) {}
    };
  } else if (V === 'mirror') {
    bgx = '#05060C;background-image:radial-gradient(ellipse 60% 55% at 50% 60%,' + acc2 + '1c,transparent 70%)';
    html = '<div style="display:flex;flex-direction:column;align-items:center;gap:22px;width:min(720px,92vw)">' +
      '<div style="display:flex;flex-direction:column;align-items:center;gap:12px">' + cat(44) + brand + T('clamp(32px,5vw,52px)') + K + '</div>' +
      '<div style="position:relative;width:min(100%,calc((100vh - 300px) * 1.78));aspect-ratio:16/9;-webkit-mask:radial-gradient(ellipse 50% 50% at 50% 50%,#000 55%,transparent 100%);mask:radial-gradient(ellipse 50% 50% at 50% 50%,#000 55%,transparent 100%)"><canvas data-k="cv" width="960" height="540" style="position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity .8s"></canvas></div>' +
      '<div style="width:100%;max-width:520px;display:flex;flex-direction:column;gap:10px"><div style="height:1px;background:' + acc + '22;position:relative"><div data-k="fill" style="position:absolute;inset:0 auto 0 0;width:0;background:linear-gradient(90deg,' + acc2 + ',#fff);box-shadow:0 0 8px ' + acc2 + '"></div></div>' + meta + '</div></div>';
    var mx = null, src = d.mirror || 'canvas#field', px = +d.pixel || 0, spd = +d.sceneSpeed || 1, sm = null, smx = null;
    anim = function (t, q) { var s = document.querySelector(src); if (!s || !s.width) return; var cvs = q('cv'); if (!mx) { mx = cvs.getContext('2d'); if (px) cvs.style.imageRendering = 'pixelated'; }
      try { var fn = window[d.sceneFn || 'renderScene']; if (typeof fn === 'function') fn((+d.sceneT || 120) + t / 1000 * spd);
        if (px) {
          var p = px;
          var w = Math.ceil(960 / p), h = Math.ceil(540 / p); if (!sm) { sm = document.createElement('canvas'); smx = sm.getContext('2d'); } if (sm.width !== w) { sm.width = w; sm.height = h; }
          smx.imageSmoothingEnabled = true; smx.fillStyle = '#05060C'; smx.fillRect(0, 0, w, h); smx.save(); smx.translate(w / 2, h / 2); smx.rotate(t / 1000 * Math.PI * 2 / 45); var sc = 1.25 * w / s.width; smx.scale(sc, sc); smx.drawImage(s, -s.width / 2, -s.height / 2); smx.restore();
          mx.imageSmoothingEnabled = false; mx.clearRect(0, 0, 960, 540); mx.drawImage(sm, 0, 0, w, h, 0, 0, w * p, h * p);
        } else mx.drawImage(s, 0, 0, 960, 540);
        if (cvs.style.opacity !== '1') cvs.style.opacity = '1'; } catch (e) {} };
  } else if (V === 'atlas') {
    bgx = bg + ';background-image:linear-gradient(' + ink + '08 1px,transparent 1px),linear-gradient(90deg,' + ink + '08 1px,transparent 1px);background-size:48px 48px';
    var camp = [[214, 128, 22, 16], [242, 120, 18, 22], [222, 152, 26, 14], [256, 146, 20, 18]], cs = '';
    camp.forEach(function (c, i) { cs += '<rect data-camp x="' + c[0] + '" y="' + c[1] + '" width="' + c[2] + '" height="' + c[3] + '" fill="' + acc + '" fill-opacity="0" stroke="' + mute + '" stroke-opacity=".5" stroke-width=".8" style="transition:fill-opacity .4s,stroke .4s"></rect>'; });
    var cty = ''; for (var gx = 1; gx < 6; gx++) cty += '<line x1="' + (20 + gx * 28) + '" y1="40" x2="' + (20 + gx * 28) + '" y2="150" stroke="' + mute + '" stroke-opacity=".14"></line>'; for (var gy = 1; gy < 4; gy++) cty += '<line x1="20" y1="' + (40 + gy * 27.5) + '" x2="188" y2="' + (40 + gy * 27.5) + '" stroke="' + mute + '" stroke-opacity=".14"></line>';
    html = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:40px 64px;align-items:center;width:min(1040px,88vw)">' +
      '<div style="display:flex;flex-direction:column;gap:20px"><div style="display:flex;align-items:center;gap:12px">' + cat(30) + brand + '</div>' + T('clamp(34px,5.2vw,64px)', 'left') + K +
        '<div style="display:flex;gap:32px"><div style="display:flex;flex-direction:column;gap:6px"><span data-k="mw" style="font:600 34px/1 ' + mono + ';color:' + acc2 + ';letter-spacing:-.03em">0</span><span style="' + M(9.5, mute, '.14em') + '">MW Energized</span></div><div style="display:flex;flex-direction:column;gap:6px"><span data-k="cn" style="font:600 34px/1 ' + mono + ';color:' + acc + ';letter-spacing:-.03em">0/4</span><span style="' + M(9.5, mute, '.14em') + '">Campuses Online</span></div></div></div>' +
      '<div style="display:flex;flex-direction:column;gap:14px"><svg viewBox="0 0 300 190" style="width:100%;display:block;overflow:visible">' +
        '<rect x="20" y="40" width="168" height="110" fill="' + ink + '06" stroke="' + ink + '" stroke-opacity=".55" stroke-width="1"></rect>' + cty +
        '<text x="24" y="34" fill="' + mute + '" style="font:500 8px ' + mono + ';letter-spacing:.2em">WYOMING</text>' +
        '<circle cx="180" cy="143" r="3" fill="' + acc + '"></circle><circle data-k="ping" cx="180" cy="143" r="3" fill="none" stroke="' + acc + '"></circle>' +
        '<polyline points="183,143 200,143 200,110 205,110" fill="none" stroke="' + acc + '" stroke-opacity=".6" stroke-width=".8" stroke-dasharray="2 2"></polyline>' +
        '<rect x="205" y="100" width="82" height="72" fill="' + bg + '" stroke="' + acc + '" stroke-opacity=".6" stroke-width=".8"></rect>' +
        '<text x="208" y="94" fill="' + acc + '" style="font:500 7px ' + mono + ';letter-spacing:.18em">CHEYENNE · LARAMIE CO.</text>' +
        '<path data-k="line" d="M212 112 L280 112 L280 166" fill="none" stroke="' + acc2 + '" stroke-width="1.2" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"></path>' + cs +
      '</svg><div style="height:1px;background:' + acc + '33;position:relative"><div data-k="fill" style="position:absolute;inset:0 auto 0 0;width:0;background:' + acc + '"></div></div>' + meta + '</div></div>';
    setP = function (p, q, el) { var rs = el.querySelectorAll('[data-camp]'), n = Math.min(4, Math.floor(p / 100 * 4.2)); q('cn').textContent = n + '/4'; q('mw').textContent = Math.round(p / 100 * 1800).toLocaleString(); q('line').setAttribute('stroke-dashoffset', (100 - p).toFixed(1));
      for (var i = 0; i < rs.length; i++) { rs[i].setAttribute('fill-opacity', i < n ? '.85' : '0'); rs[i].setAttribute('stroke', i < n ? acc : mute); } };
    anim = function (t, q) { var k = (t / 1400) % 1; q('ping').setAttribute('r', 3 + k * 14); q('ping').setAttribute('stroke-opacity', (1 - k).toFixed(2)); };
  } else if (V === 'retail') {
    var MASK = ["..............##......",".............####.....","............######....","...........#######....","..........########....",".........#########....","....###############...","..#################...","####################..","####################..",".##################...","..............###.....","..............###.####","...............#######"], cols = 22, rows = MASK.length, cells = '', seed = 11, on = [];
    var shape = function (c, r) { return MASK[r][c] === '#'; };
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) { var inS = shape(c, r); if (inS) { seed = (seed * 9301 + 49297) % 233280; on.push(seed / 233280); } cells += '<span ' + (inS ? 'data-cell' : '') + ' style="width:10px;height:10px;border-radius:50%;background:' + (inS ? acc + '26' : 'transparent') + ';transition:background .3s,transform .3s"></span>'; }
    var TOT = +d.total || 482;
    html = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:40px 64px;align-items:center;width:min(980px,88vw)">' +
      '<div style="display:flex;flex-direction:column;gap:20px"><div style="display:flex;align-items:center;gap:12px">' + cat(30) + brand + '</div>' + T('clamp(38px,6vw,76px)', 'left') + K +
        '<div style="display:flex;align-items:baseline;gap:10px"><span data-k="count" style="font:600 44px/1 ' + mono + ';color:' + acc + ';letter-spacing:-.03em">0</span><span style="' + M(10, mute, '.14em') + '">Licensed Retailers Mapped</span></div></div>' +
      '<div style="display:flex;flex-direction:column;gap:14px"><div style="display:grid;grid-template-columns:repeat(' + cols + ',10px);gap:6px;justify-content:start">' + cells + '</div>' +
        '<div style="height:1px;background:' + acc + '33;position:relative"><div data-k="fill" style="position:absolute;inset:0 auto 0 0;width:0;background:' + acc + '"></div></div>' + meta + '</div></div>';
    setP = function (p, q, el) { q('count').textContent = Math.round(p / 100 * TOT); var cs = el.querySelectorAll('[data-cell]'), th = p / 100; for (var i = 0; i < cs.length; i++) { var lit = on[i] < th; cs[i].style.background = lit ? (on[i] > th - .04 ? acc2 : acc) : acc + '26'; cs[i].style.transform = lit && on[i] > th - .04 ? 'scale(1.35)' : 'scale(1)'; } };
  } else {
    html = '<div style="display:flex;flex-direction:column;align-items:center;gap:30px;width:min(440px,84vw)">' + cat(80) + '<div style="display:flex;flex-direction:column;align-items:center;gap:12px">' + brand + T('clamp(28px,4.2vw,40px)') + K + '</div>' +
      '<div style="width:100%;display:flex;flex-direction:column;gap:10px"><div style="height:2px;background:rgba(128,128,128,.2);position:relative"><div data-k="fill" style="position:absolute;inset:0 auto 0 0;width:0;background:' + acc + '"></div></div>' + meta + '</div></div>';
  }

  var el = document.createElement('div');
  el.id = 'kn-loader'; el.setAttribute('role', 'status'); el.setAttribute('aria-label', 'Loading ' + title);
  el.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:' + bgx + ';color:' + ink + ';display:flex;align-items:center;justify-content:center;transition:opacity .6s ease,visibility .6s;font-family:' + font;
  el.innerHTML = '<style>@keyframes knIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}</style><div style="animation:knIn .7s cubic-bezier(.2,.8,.2,1) both;display:flex;justify-content:center;width:100%">' + html + '</div>';
  (document.body || document.documentElement).appendChild(el);
  var q = function (k) { return el.querySelector('[data-k="' + k + '"]'); };
  var fill = q('fill'), pct = q('pct'), stp = q('step');
  var t0 = performance.now(), p = 0, ready = false, done = false;
  var go = function () { ready = true; };
  var loadP = new Promise(function (r) { document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true }); });
  var fontP = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  var evP = wait === 'event' ? new Promise(function (r) { if (window.__knReadyFired) r(); else addEventListener('kn-ready', r, { once: true }); }) : Promise.resolve();
  Promise.all([loadP, fontP, evP]).then(go); setTimeout(go, MAX);
  var lastShown = -1;
  function tick(now) {
    if (done) return;
    var target = ready && now - t0 > MIN ? 100 : 92;
    p += (target - p) * (target === 100 ? .14 : .02);
    if (fill) fill.style.width = p.toFixed(1) + '%';
    if (pct) pct.textContent = String(Math.round(p)).padStart(2, '0') + '%';
    if (stp) stp.textContent = p > 99 ? 'Ready' : steps[Math.min(steps.length - 1, Math.floor(p / 92 * steps.length))];
    var r = Math.round(p); if (r !== lastShown) { lastShown = r; setP(p, q, el); }
    if (anim) anim(now - t0, q, el);
    if (p > 99.5) { done = true; setP(100, q, el); setTimeout(function () { el.style.opacity = '0'; el.style.visibility = 'hidden'; setTimeout(function () { el.remove(); }, 700); }, 260); return; }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
