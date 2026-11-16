/* The Kuroneko Company — welcome screen. The moon waxes while the page loads; moon-dust gathers into the cat; click to enter. */
(function () {
  if (window.__knWelcome) return; window.__knWelcome = true;
  if (/[?&]nointro\b/.test(location.search)) return;
  var BG = '#0A0908', ACC = '#E8ECCC', INK = '#F2EFE8', MUT = 'rgba(242,239,232,.55)';
  var MONO = "'Geist Mono',ui-monospace,monospace", SANS = "'Satoshi','Geist','Helvetica Neue',sans-serif";
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CAT = [[11.2,5.5,5,4.6],[84,5.5,5,4.6],[11.6,13,15.4,4.6],[73.2,13,15.4,4.6],[12.2,20.5,25.8,4.6],[62.2,20.5,25.8,4.6],[12.6,28,75,4.6],[11.2,35.5,77.8,4.6],[9.2,43,81.8,4.6],[8.2,50.5,13.4,4.6],[40.2,50.5,19.8,4.6],[78.6,50.5,13.4,4.6],[8.2,58,24,4.6],[39.4,58,21.4,4.6],[68,58,24,4.6],[9,65.5,82.2,4.6],[12.2,73,75.8,4.6],[18.4,80.5,63.4,4.6],[31.2,88,37.8,4.6]];
  var EYES = new Path2D('M21.5 56.2Q29 46.6 39 52.6Q31.5 62.4 21.5 56.2ZM78.5 56.2Q71 46.6 61 52.6Q68.5 62.4 78.5 56.2Z');
  var STEPS = ['Gathering moonlight', 'Waxing', 'Full moon'];

  var root = document.createElement('div');
  root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'Welcome to The Kuroneko Company');
  root.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:' + BG + ';color:' + INK + ';overflow:hidden;cursor:default;-webkit-font-smoothing:antialiased';
  var cv = document.createElement('canvas'); cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
  var M = function (c, ls) { return 'font:500 11px/1.3 ' + MONO + ';letter-spacing:' + (ls || '.18em') + ';text-transform:uppercase;color:' + (c || MUT); };
  var fade = 'opacity:0;transform:translateY(10px);transition:opacity .9s cubic-bezier(.2,.8,.2,1),transform .9s cubic-bezier(.2,.8,.2,1)';
  root.innerHTML =
    '<div style="position:absolute;top:28px;left:32px;right:32px;display:flex;justify-content:space-between;gap:16px;' + M() + '"><span style="display:flex;align-items:center;gap:12px"><svg viewBox="0 0 100 100" width="22" height="22" style="display:block;flex:none"><path fill="' + INK + '" d="' + CAT.map(function (r) { return 'M' + r[0] + ' ' + r[1] + 'h' + r[2] + 'v' + r[3] + 'h-' + r[2] + 'z'; }).join('') + '"></path></svg><span style="color:' + INK + '">The Kuroneko Company</span></span><span data-k="clock"></span></div>' +
    '<div data-k="welcome" style="position:absolute;left:0;right:0;display:flex;flex-direction:column;align-items:center;gap:22px;text-align:center;padding:0 24px;pointer-events:none">' +
      '<div data-k="w1" style="' + fade + ';' + M(ACC, '.32em') + '">Welcome</div>' +
      '<div data-k="w2" style="' + fade + ';font:700 clamp(30px,4.6vw,58px)/1.02 ' + SANS + ';letter-spacing:-.04em;color:' + INK + ';text-wrap:balance">The Kuroneko Company</div>' +
      '<div data-k="w3" style="' + fade + ';font:400 15px/1.6 ' + SANS + ';color:rgba(242,239,232,.66);max-width:440px;text-wrap:pretty">An Independent Design Studio.</div>' +
      '<button data-k="enter" style="' + fade + ';pointer-events:auto;position:relative;margin-top:10px;display:inline-flex;align-items:center;gap:14px;padding:16px 30px;border:1px solid ' + ACC + ';background:transparent;color:' + ACC + ';cursor:pointer;' + M(ACC, '.24em') + ';font-size:12px">Enter<span style="position:relative;display:inline-grid;place-items:center;width:16px;height:16px"><span data-k="arr" style="grid-area:1/1;transition:opacity .25s,transform .3s">→</span><span data-k="paw" style="grid-area:1/1;opacity:0;transform:scale(.4) rotate(-20deg);transition:opacity .25s,transform .35s cubic-bezier(.3,1.6,.5,1)"><svg viewBox="0 0 24 24" width="16" height="16" style="display:block" fill="currentColor"><ellipse cx="6" cy="10" rx="2.1" ry="2.7"></ellipse><ellipse cx="10" cy="6" rx="2.1" ry="2.8"></ellipse><ellipse cx="14.5" cy="6" rx="2.1" ry="2.8"></ellipse><ellipse cx="18.5" cy="10" rx="2.1" ry="2.7"></ellipse><path d="M12.2 11.5c-2.6 0-6 3.6-6 6.3 0 1.9 1.6 2.6 3 2.6 1.2 0 2-.6 3-.6s1.8.6 3 .6c1.4 0 3-.7 3-2.6 0-2.7-3.4-6.3-6-6.3z"></path></svg></span></span></button>' +
      '<div data-k="w4" style="' + fade + ';' + M('rgba(242,239,232,.38)', '.16em') + ';font-size:10px">Click or press Enter</div>' +
    '</div>' +
    '<div data-k="bar" style="position:absolute;left:32px;right:32px;bottom:28px;display:flex;flex-direction:column;gap:12px;transition:opacity .6s">' +
      '<div style="display:flex;justify-content:space-between;' + M() + '"><span data-k="step">' + STEPS[0] + '</span><span data-k="pct">000</span></div>' +
      '<div style="height:1px;background:rgba(232,236,204,.14);position:relative"><div data-k="fill" style="position:absolute;left:0;top:0;bottom:0;width:0;background:' + ACC + ';box-shadow:0 0 10px ' + ACC + '"></div></div>' +
    '</div>';
  root.insertBefore(cv, root.firstChild);
  var q = function (k) { return root.querySelector('[data-k="' + k + '"]'); };
  var btn = q('enter');
  btn.onmouseenter = function () { btn.style.background = ACC; btn.style.color = BG; btn.style.boxShadow = '0 0 28px rgba(232,236,204,.45)'; q('arr').style.opacity = '0'; q('arr').style.transform = 'translateX(6px)'; q('paw').style.opacity = '1'; q('paw').style.transform = 'none'; };
  btn.onmouseleave = function () { btn.style.background = 'transparent'; btn.style.color = ACC; btn.style.boxShadow = 'none'; q('arr').style.opacity = '1'; q('arr').style.transform = 'none'; q('paw').style.opacity = '0'; q('paw').style.transform = 'scale(.4) rotate(-20deg)'; };

  var mount = function () { (document.body || document.documentElement).appendChild(root); document.documentElement.style.overflow = 'hidden'; layout(); };
  var mountNow = function () { if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount); };

  var ctx = cv.getContext('2d'), W = 0, H = 0, DPR = 1, S = 0, cx = 0, cy = 0;
  var moon = document.createElement('canvas'), mctx = moon.getContext('2d');
  var stars = [], dust = [], mx = -1e4, my = -1e4, ex = 0, ey = 0;
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var pts = [];
  CAT.forEach(function (r) { for (var x = r[0] + 0.8; x < r[0] + r[2]; x += 1.6) for (var y = r[1] + 0.75; y < r[1] + r[3]; y += 1.55) pts.push([x, y]); });
  pts.sort(function () { return Math.random() - 0.5; }); pts.length = 240;
  pts.forEach(function (p, i) { dust.push({ tx: p[0], ty: p[1], x: 0, y: 0, vx: 0, vy: 0, o: i / pts.length, seed: Math.random() * 6.28 }); });
  for (var i = 0; i < 460; i++) stars.push({ x: Math.random(), y: Math.pow(Math.random(), 1.35) * .84, r: Math.random() < .06 ? rnd(1.2, 1.9) : rnd(.3, 1.1), t: Math.random() * 6.28, s: rnd(.4, 1.6) });

  // Scene: moonlit gorge, cascading falls over rock, mirrored night pool, meadow grass
  var FALLS = false;   // the waterfall and its cliff are retired; the gorge is now an open meadow pool
  var mkc = function () { return document.createElement('canvas'); };
  var sky = mkc(), sb = mkc(), sf = mkc(), up = mkc(), uctx = up.getContext('2d'), G = {}, clumps = [], irises = [], glints = [], streaks = [], spray = [];
  var nz = function (x, s) { return Math.sin(x * 1.3 + s) * .5 + Math.sin(x * 2.9 + s * 1.7) * .28 + Math.sin(x * 6.1 + s * 2.3) * .14 + Math.sin(x * 13.7 + s * .7) * .08; };
  var gauss = function () { return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; };
  function genClump(x, y, size) { var n = 10 + Math.floor(Math.random() * 8), bl = []; for (var i = 0; i < n; i++) { var a = -Math.PI / 2 + gauss() * .7; bl.push({ ox: (Math.random() - .5) * size * .16, a: a, len: size * (.5 + Math.random() * .5) * (1 - Math.abs(a + Math.PI / 2) * .3), bend: (a + Math.PI / 2) * (.5 + Math.random() * .7) + (Math.random() - .5) * .12, w: size * (.02 + Math.random() * .016), lit: Math.random() < .35 }); } return { x: x, y: y, p: rnd(0, 6.28), bl: bl }; }
  function bladeTo(c, bx, by, b2, sw, rim) {
    var a = b2.a, a2 = a + b2.bend + sw, len = b2.len, mx = bx + Math.cos(a + sw * .4) * len * .55, my = by + Math.sin(a + sw * .4) * len * .55, tx = bx + Math.cos(a2) * len, ty = by + Math.sin(a2) * len + b2.bend * b2.bend * len * .25, nx = -Math.sin(a), ny = Math.cos(a), w = b2.w;
    if (rim) { c.moveTo(bx - nx * w * .5, by - ny * w * .5); c.quadraticCurveTo(mx - nx * w * .4, my - ny * w * .4, tx, ty); return; }
    c.moveTo(bx - nx * w, by - ny * w); c.quadraticCurveTo(mx - nx * w * .6, my - ny * w * .6, tx, ty); c.quadraticCurveTo(mx + nx * w * .6, my + ny * w * .6, bx + nx * w, by + ny * w);
  }
  function paintClumps(c, list, col, rimA, swf) {
    c.fillStyle = col; c.beginPath(); list.forEach(function (cl) { var sw = swf ? swf(cl) : 0; cl.bl.forEach(function (b2) { bladeTo(c, cl.x + b2.ox, cl.y, b2, sw * (b2.len / 30), false); }); }); c.fill();
    if (rimA) { c.strokeStyle = 'rgba(222,228,200,' + rimA + ')'; c.lineWidth = .7; c.beginPath(); list.forEach(function (cl) { var sw = swf ? swf(cl) : 0; cl.bl.forEach(function (b2) { if (b2.lit && b2.a < -Math.PI * .45) bladeTo(c, cl.x + b2.ox, cl.y, b2, sw * (b2.len / 30), true); }); }); c.stroke(); }
  }
  function buildScene() {
    var nar = W < 700, wl = Math.round(H * .79), fw = Math.max(18, Math.min(W * .05, 80)), fx = W * (nar ? .76 : .72), fy = H * (nar ? .44 : .3), ly = fy + (wl - fy) * .47, fx2 = fx + fw * .3;
    G = { wl: wl, fx: fx, fw: fw, fy: fy, ly: ly, fx2: fx2, tx: fx + fw * 2.5, ty: fy - H * .035, rx: fx2 + fw * .08, ry: ly + (wl - ly) * .5, rr: fw * .42, tt: G.tt };
    [sky, sb, sf, up].forEach(function (c) { c.width = W * DPR; c.height = H * DPR; });
    var k = sky.getContext('2d'); k.setTransform(DPR, 0, 0, DPR, 0, 0);
    var sg = k.createLinearGradient(0, 0, 0, H); sg.addColorStop(0, '#050608'); sg.addColorStop(.45, '#090B0D'); sg.addColorStop(wl / H, '#151A18'); sg.addColorStop(1, '#0A0B0A'); k.fillStyle = sg; k.fillRect(0, 0, W, H);
    var ang = -.42, mx0 = W * .32, my0 = H * .3;
    k.save(); k.translate(mx0, my0); k.rotate(ang); k.scale(1, .16); var mg = k.createRadialGradient(0, 0, 0, 0, 0, W * .75); mg.addColorStop(0, 'rgba(205,212,198,.075)'); mg.addColorStop(.5, 'rgba(205,212,198,.03)'); mg.addColorStop(1, 'rgba(205,212,198,0)'); k.fillStyle = mg; k.beginPath(); k.arc(0, 0, W * .75, 0, 6.2832); k.fill(); k.restore();
    for (var i = 0; i < 1400; i++) { var u = rnd(-1, 1) * W * .85, v = gauss() * H * .07, x = mx0 + u * Math.cos(ang) - v * Math.sin(ang), y = my0 + u * Math.sin(ang) + v * Math.cos(ang); if (y > wl - H * .1 || y < 0) continue; k.fillStyle = 'rgba(236,238,226,' + rnd(.04, .3).toFixed(2) + ')'; var r = rnd(.4, .9); k.fillRect(x, y, r, r); }
    var hg = k.createRadialGradient(W * .5, wl, 0, W * .5, wl, W * .6); hg.addColorStop(0, 'rgba(232,236,204,.06)'); hg.addColorStop(1, 'rgba(232,236,204,0)'); k.fillStyle = hg; k.fillRect(0, 0, W, H);
    var b = sb.getContext('2d'); b.setTransform(DPR, 0, 0, DPR, 0, 0); b.clearRect(0, 0, W, H);
    [[wl - H * .015, H * .3, .18, .2, 2.2, 1, '#1A1E1D', .1], [wl - H * .005, H * .19, .46, .26, 3, 4, '#141817', .07], [wl, H * .11, .08, .3, 4.6, 7, '#0F1211', .04], [wl, H * .055, .4, .5, 7.5, 10, '#0B0D0C', 0]].forEach(function (L, li) {
      var yy = function (x) { var e = Math.exp(-Math.pow((x / W - L[2]) / L[3], 2)); return L[0] - L[1] * (e * .72 + .28) * (.62 + .38 * (.5 + .5 * nz(x / W * L[4] * 3, L[5]))); };
      b.fillStyle = L[6]; b.beginPath(); b.moveTo(0, wl); for (var x = 0; x <= W; x += 3) b.lineTo(x, yy(x)); b.lineTo(W, wl); b.closePath(); b.fill();
      if (L[7]) { b.strokeStyle = 'rgba(232,236,204,' + L[7] + ')'; b.lineWidth = 1; b.beginPath(); for (var x2 = 0; x2 <= W; x2 += 3) b.lineTo(x2, yy(x2)); b.stroke(); }
      var fg = b.createLinearGradient(0, L[0] - L[1] * .45, 0, L[0]); fg.addColorStop(0, 'rgba(180,188,174,0)'); fg.addColorStop(1, 'rgba(180,188,174,' + (.09 - li * .02).toFixed(3) + ')'); b.fillStyle = fg; b.fillRect(0, L[0] - L[1] * .45, W, L[1] * .45);
    });
    var sd = 11, SR = function () { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
    b.fillStyle = '#0B0C0B'; b.beginPath(); b.moveTo(0, wl); for (var x5 = 0; x5 <= fx - fw * 2.4; x5 += 4) b.lineTo(x5, wl - H * .008 - SR() * 2.5); b.lineTo(fx - fw * 2.4, wl); b.closePath(); b.fill();
    if (FALLS) {
    var cl = [[fx - fw * .7, fy], [fx - fw * .2, fy - 2], [fx + fw * .75, fy - 3], [fx + fw * 1.6, fy - H * .03], [fx + fw * 2.6, fy - H * .045], [fx + fw * 4, fy - H * .085], [W + 2, fy - H * .11], [W + 2, wl], [fx - fw * 2.7, wl], [fx - fw * 2.1, wl - (wl - ly) * .45], [fx - fw * 2.0, ly + 7], [fx - fw * 1.35, ly], [fx - fw * 1.1, ly - (ly - fy) * .5], [fx - fw * .85, fy + (ly - fy) * .15]];
    var cpath = function () { b.beginPath(); b.moveTo(cj[0][0], cj[0][1]); cj.forEach(function (p) { b.lineTo(p[0], p[1]); }); b.closePath(); };
    // break every straight run of the cliff outline into an irregular rock edge
    var cj = []; cl.forEach(function (p, i) { var q = cl[(i + 1) % cl.length], seg = Math.hypot(q[0] - p[0], q[1] - p[1]), n = Math.max(1, Math.round(seg / 14)), offEdge = p[0] > W || q[0] > W || (p[1] === wl && q[1] === wl); for (var s = 0; s < n; s++) { var u = s / n, j = offEdge || s === 0 ? 0 : (SR() - .5) * 9; cj.push([p[0] + (q[0] - p[0]) * u + j, p[1] + (q[1] - p[1]) * u + (offEdge || s === 0 ? 0 : (SR() - .5) * 7)]); } });
    var X0 = fx - fw * 2.9;
    b.fillStyle = '#0E100D'; cpath(); b.fill();
    b.save(); cpath(); b.clip();
    // rocks packed on a jittered, staggered lattice so the cliff reads as one continuous rock face, larger toward the pool
    var bldr = [], cs = Math.max(30, Math.min(46, W * .028)), rowI = 0;
    for (var gyy = fy - H * .13; gyy < wl + cs; gyy += cs * .6, rowI++) for (var gxx = X0 - cs + (rowI % 2) * cs * .4; gxx < W + cs; gxx += cs * .8) { var dpt = Math.max(0, (gyy - fy) / (wl - fy)); bldr.push([gxx + (SR() - .5) * cs * .6, gyy + (SR() - .5) * cs * .45, (cs * .48 + SR() * cs * .5) * (1 + dpt * .45), SR() * 6.28]); }
    for (var bi = 0; bi < 26; bi++) { var bx0 = X0 + SR() * (W - X0 + 40), by0 = fy + SR() * (wl - fy); bldr.push([bx0, by0, cs * (1.1 + SR() * .7) * (1 + (by0 - fy) / (wl - fy) * .4), SR() * 6.28]); }
    bldr.sort(function (p, q) { return p[1] - q[1]; });
    var rock = function (bd) { var n = 9, pts = []; for (var vi = 0; vi < n; vi++) { var an = bd[3] + vi / n * 6.2832, rr = bd[2] * (.72 + SR() * .38); pts.push([bd[0] + Math.cos(an) * rr * 1.25, bd[1] + Math.sin(an) * rr * .85]); }
      var t = Math.max(0, Math.min(1, (bd[0] - X0) / (W - X0))), v = 40 - 24 * t + SR() * 6;
      var gb = b.createRadialGradient(bd[0] - bd[2] * .5, bd[1] - bd[2] * .5, bd[2] * .1, bd[0], bd[1], bd[2] * 1.4); gb.addColorStop(0, 'rgb(' + Math.round(v + 8) + ',' + Math.round(v + 11) + ',' + Math.round(v + 3) + ')'); gb.addColorStop(1, 'rgb(' + Math.round(v * .35) + ',' + Math.round(v * .38) + ',' + Math.round(v * .32) + ')');
      b.fillStyle = gb; b.beginPath(); for (var pi = 0; pi <= n; pi++) { var p0 = pts[pi % n], p1 = pts[(pi + 1) % n], mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2; if (!pi) b.moveTo(mx, my); else b.quadraticCurveTo(p0[0], p0[1], mx, my); } b.closePath(); b.fill();
      b.strokeStyle = 'rgba(232,236,204,' + (.16 * (1 - t) + .04).toFixed(3) + ')'; b.lineWidth = 1; b.beginPath(); var st = Math.floor(n * .5), en = Math.floor(n * .85); for (var pj = st; pj <= en; pj++) { var a0 = pts[pj % n], a1 = pts[(pj + 1) % n], m0 = (a0[0] + a1[0]) / 2, m1 = (a0[1] + a1[1]) / 2; if (pj === st) b.moveTo(m0, m1); else b.quadraticCurveTo(a0[0], a0[1], m0, m1); } b.stroke();
      if (SR() < .45) { b.fillStyle = 'rgba(72,94,54,' + (.22 + SR() * .2).toFixed(2) + ')'; for (var mm = 0; mm < 8; mm++) { var ma = Math.PI * (1.15 + SR() * .7); b.beginPath(); b.ellipse(bd[0] + Math.cos(ma) * bd[2] * .9, bd[1] + Math.sin(ma) * bd[2] * .6 + 2, 1.5 + SR() * 3.5, .8 + SR() * 1.4, 0, 0, 6.2832); b.fill(); } }
      if (SR() < .35) { b.strokeStyle = 'rgba(0,0,0,.35)'; b.lineWidth = 1; b.beginPath(); var cx1 = bd[0] + (SR() - .5) * bd[2], cy1 = bd[1] - bd[2] * .3; b.moveTo(cx1, cy1); b.lineTo(cx1 + (SR() - .5) * 8, cy1 + bd[2] * .3); b.lineTo(cx1 + (SR() - .5) * 12, cy1 + bd[2] * .55); b.stroke(); } };
    bldr.forEach(rock);
    b.strokeStyle = 'rgba(0,0,0,.4)'; b.lineWidth = 1.4; [-1.3, -.9, .95, 1.4].forEach(function (o) { var xx = fx + o * fw; b.beginPath(); b.moveTo(xx, fy); for (var yy = fy; yy < wl; yy += 10) { xx += (SR() - .5) * 4; b.lineTo(xx, yy); } b.stroke(); });
    var wt = b.createLinearGradient(fx - fw * 1.6, 0, fx + fw * 1.9, 0); wt.addColorStop(0, 'rgba(0,0,0,0)'); wt.addColorStop(.25, 'rgba(0,0,0,.45)'); wt.addColorStop(.75, 'rgba(0,0,0,.45)'); wt.addColorStop(1, 'rgba(0,0,0,0)'); b.fillStyle = wt; b.fillRect(fx - fw * 1.6, fy, fw * 3.5, wl - fy);
    b.strokeStyle = 'rgba(232,236,204,.07)'; b.lineWidth = 1; for (var gl = 0; gl < 26; gl++) { var gx = fx + (SR() - .5) * fw * 3, gy = fy + SR() * (wl - fy); b.beginPath(); b.moveTo(gx, gy); b.lineTo(gx + (SR() - .5) * 2, gy + 8 + SR() * 26); b.stroke(); }
    var sh = b.createLinearGradient(X0, 0, W, 0); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.5)'); b.fillStyle = sh; b.fillRect(0, 0, W, H);
    for (var v1 = 0; v1 < 22; v1++) { var vx = X0 + fw * .5 + SR() * (W - X0), vy = fy - H * .06 + SR() * (wl - fy) * .85; if (Math.abs(vx - fx) < fw * 1.4 || Math.abs(vx - G.tx) < fw * .5) continue; var vl = 18 + SR() * 50, sw2 = (SR() - .5) * 10;
      b.strokeStyle = '#141B12'; b.lineWidth = 1; b.beginPath(); b.moveTo(vx, vy); b.quadraticCurveTo(vx + sw2, vy + vl * .5, vx + sw2 * .4, vy + vl); b.stroke();
      for (var lf = 0; lf < vl; lf += 4) { var tq = lf / vl, lx = vx + sw2 * 2 * tq * (1 - tq) + sw2 * .4 * tq * tq, side = (lf / 4) % 2 ? 1 : -1, ls = 3.2 * (1 - tq * .5); b.fillStyle = '#18211A'; b.beginPath(); b.ellipse(lx + side * ls * .8, vy + lf + 1, ls, ls * .45, side * .6, 0, 6.2832); b.fill(); if (side < 0 && SR() < .5) { b.strokeStyle = 'rgba(222,228,200,.14)'; b.lineWidth = .6; b.beginPath(); b.ellipse(lx + side * ls * .8, vy + lf + 1, ls, ls * .45, side * .6, Math.PI, Math.PI * 1.7); b.stroke(); } } }
    b.restore();
    // the cliff's left flank ends in tumbled boulders that spill past the outline, not a cut line
    for (var ei = 8; ei < cl.length; ei++) { var e0 = cl[ei], e1 = cl[(ei + 1) % cl.length], el = Math.hypot(e1[0] - e0[0], e1[1] - e0[1]); for (var es = 0; es < el; es += cs * .55) { var eu = es / el, ex = e0[0] + (e1[0] - e0[0]) * eu, ey = e0[1] + (e1[1] - e0[1]) * eu, dd = Math.max(0, (ey - fy) / (wl - fy)); rock([ex + (SR() - .3) * cs * .5, ey + (SR() - .5) * cs * .3, cs * (.42 + SR() * .4) * (1 + dd * .5), SR() * 6.28]); } }
    // boulders scattered on the pool's edge below the flank
    for (var pb = 0; pb < 7; pb++) rock([cl[8][0] - cs * .4 + SR() * cs * 2.4, wl - cs * (.15 + SR() * .25), cs * (.4 + SR() * .45), SR() * 6.28]);
    // each fall leaves the cliff through a gap between rocks, over a worn lip
    var spout = function (x, y, w) { rock([x - w * .62 - cs * .35, y - cs * .12, cs * (.55 + SR() * .2), SR() * 6.28]); rock([x + w * .62 + cs * .35, y - cs * .18, cs * (.6 + SR() * .2), SR() * 6.28]); var lg = b.createLinearGradient(0, y - 5, 0, y + 9); lg.addColorStop(0, '#2C3029'); lg.addColorStop(1, '#0D0E0B'); b.fillStyle = lg; b.beginPath(); b.moveTo(x - w * .7, y + 2); b.quadraticCurveTo(x, y - 4, x + w * .7, y + 2); b.lineTo(x + w * .55, y + 9); b.lineTo(x - w * .55, y + 9); b.closePath(); b.fill(); b.strokeStyle = 'rgba(232,236,204,.28)'; b.lineWidth = 1; b.beginPath(); b.moveTo(x - w * .7, y + 2); b.quadraticCurveTo(x, y - 4, x + w * .7, y + 2); b.stroke(); };
    spout(fx, fy, fw); spout(G.tx, G.ty, fw * .4);
    // moonlit rim only along the jagged top edge; the flank is defined by its boulders
    b.strokeStyle = 'rgba(232,236,204,.2)'; b.lineWidth = 1.1; b.beginPath(); var rimOn = false; cj.forEach(function (p) { var top = p[1] < fy + 6 && p[0] >= cl[0][0] - 1 && p[0] <= W; if (top) { if (!rimOn) b.moveTo(p[0], p[1]); else b.lineTo(p[0], p[1]); } rimOn = top; }); b.stroke();
    var shelf = function (x0, x1, y0, dp) { var g = b.createLinearGradient(0, y0 - 4, 0, y0 + dp); g.addColorStop(0, '#2A2E26'); g.addColorStop(.2, '#151712'); g.addColorStop(1, '#090A08'); b.fillStyle = g; b.beginPath(); b.moveTo(x0, y0 + 2); b.quadraticCurveTo((x0 + x1) / 2, y0 - 5, x1, y0 + 1); b.lineTo(x1 - 6, y0 + dp); b.lineTo(x0 + 8, y0 + dp); b.closePath(); b.fill(); b.strokeStyle = 'rgba(232,236,204,.25)'; b.lineWidth = 1; b.beginPath(); b.moveTo(x0, y0 + 2); b.quadraticCurveTo((x0 + x1) / 2, y0 - 5, x1, y0 + 1); b.stroke(); };
    shelf(fx - fw * 1.5, fx + fw * 1.5, ly, 16);
    var topCl = []; for (var tx0 = fx - fw * .6; tx0 < W; tx0 += rnd(3, 6)) { if (Math.abs(tx0 - fx) < fw * .55 || Math.abs(tx0 - G.tx) < fw * .2) continue; var tt0 = 0; for (var ci = 0; ci < 6; ci++) if (cl[ci][0] <= tx0 && cl[ci + 1][0] > tx0) tt0 = cl[ci][1] + (cl[ci + 1][1] - cl[ci][1]) * (tx0 - cl[ci][0]) / (cl[ci + 1][0] - cl[ci][0]); if (!tt0) continue; topCl.push(genClump(tx0, tt0 + 3, rnd(10, 22) * (nar ? .8 : 1))); }
    paintClumps(b, topCl, '#151913', .16);
    }
    var bm = b.createLinearGradient(0, wl - H * .12, 0, wl); bm.addColorStop(0, 'rgba(205,212,196,0)'); bm.addColorStop(1, 'rgba(205,212,196,.08)'); b.fillStyle = bm; b.fillRect(fx - fw * 5, wl - H * .12, W, H * .12);
    var f = sf.getContext('2d'); f.setTransform(DPR, 0, 0, DPR, 0, 0); f.clearRect(0, 0, W, H);
    var d = H - wl, bank = function (x) { var l = d * 1.25 * Math.pow(Math.max(0, 1 - x / (W * (nar ? .55 : .42))), 1.4), r = d * .9 * Math.pow(Math.max(0, 1 - (W - x) / (W * (nar ? .3 : .24))), 1.4); return H - Math.max(l, r) + nz(x / 60, 3) * 3; };
    if (FALLS) [[fx - fw * 2.3, wl + d * .2, fw * .95], [fx + fw * 1.7, wl + d * .14, fw * .62], [fx - fw * 3.9, wl + d * .34, fw * .55], [fx + fw * .4, wl + d * .42, fw * .4]].forEach(function (s) { var rg = f.createLinearGradient(s[0] - s[2], s[1] - s[2] * .5, s[0] + s[2], s[1]); rg.addColorStop(0, '#22251F'); rg.addColorStop(1, '#090A08'); f.fillStyle = rg; f.beginPath(); f.moveTo(s[0] - s[2], s[1]); f.bezierCurveTo(s[0] - s[2], s[1] - s[2] * .55, s[0] + s[2] * .8, s[1] - s[2] * .6, s[0] + s[2], s[1]); f.closePath(); f.fill(); f.strokeStyle = 'rgba(232,236,204,.24)'; f.lineWidth = 1; f.beginPath(); f.moveTo(s[0] - s[2] * .9, s[1] - s[2] * .12); f.bezierCurveTo(s[0] - s[2] * .8, s[1] - s[2] * .46, s[0] - s[2] * .1, s[1] - s[2] * .5, s[0] + s[2] * .2, s[1] - s[2] * .44); f.stroke(); });
    f.fillStyle = '#0B0D0A'; f.beginPath(); f.moveTo(0, H); for (var x3 = 0; x3 <= W; x3 += 3) f.lineTo(x3, Math.min(H + 1, bank(x3) + 10)); f.lineTo(W, H); f.closePath(); f.fill();
    var rows = []; for (var ro = 0; ro < 9; ro++) rows.push([]);
    for (var x4 = -10; x4 < W + 10; x4 += rnd(3, 6)) { var by = bank(x4), hb = H - by; if (hb < 8) continue; for (var ro2 = 1; ro2 < 9; ro2++) { var yy2 = by + ro2 * 18 + rnd(-5, 5); if (yy2 > H + 30) break; rows[ro2].push(genClump(x4 + rnd(-3, 3), yy2, (26 + Math.min(1, hb / d) * 30 + ro2 * 3) * (nar ? .8 : 1))); } }
    for (var ro3 = 1; ro3 < 9; ro3++) { var lv = Math.max(4, 16 - ro3 * 1.5) | 0; paintClumps(f, rows[ro3], 'rgb(' + lv + ',' + (lv + 3) + ',' + (lv - 1) + ')', (.12 - ro3 * .01).toFixed(3)); }
    clumps = []; for (var x6 = -10; x6 < W + 10; x6 += rnd(2.5, 5)) { var by6 = bank(x6), hb6 = H - by6; if (hb6 < 5) continue; clumps.push(genClump(x6, by6 + 6, (16 + Math.min(1, hb6 / d) * 34) * (nar ? .8 : 1) * rnd(.8, 1.2))); }
    irises = []; [W * .05, W * .17, W * .3, W * .85, W * .95].forEach(function (ix) { var by2 = bank(ix); if (H - by2 < 14) return; var lvs = []; for (var q4 = 0; q4 < 7; q4++) lvs.push({ a: -Math.PI / 2 + (q4 - 3) * .1 + gauss() * .08, len: H * (.09 + Math.random() * .07) * (nar ? .8 : 1), w: rnd(2.6, 4.2), fold: Math.random() < .35 ? rnd(.25, .5) * (q4 < 3 ? -1 : 1) : (q4 - 3) * .03 }); irises.push({ x: ix, y: by2 + 8, p: rnd(0, 6.28), lv: lvs }); });
    streaks = []; for (var s2 = 0; s2 < 320; s2++) { var tr = s2 < 130 ? 1 : s2 < 290 ? 2 : 3; streaks.push({ tr: tr, u: rnd(-.5, .5), t: Math.random(), v: rnd(.006, .013), l: rnd(.05, .16), a: rnd(.12, .55), w: rnd(.6, 1.8) }); }
    glints = []; for (var g2 = 0; g2 < 90; g2++) glints.push({ x: rnd(0, W), y: rnd(wl + 3, H - 4), p: rnd(0, 6.28), s: rnd(.8, 2.2) });
    spray = [];
  }
  function drawFall(c, T) {
    if (!FALLS) return;
    var g = G, tiers = { 1: [g.fx, g.fy, g.ly, g.fw, 1.12], 2: [g.fx2, g.ly + 3, g.wl, g.fw * 1.2, 1.32], 3: [g.tx, g.ty, g.wl, g.fw * .24, 1.5] };
    c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    [1, 2, 3].forEach(function (k) { var q2 = tiers[k], x = q2[0], top = q2[1], bot = q2[2], w = q2[3], sp = q2[4], a = k === 3 ? .14 : k === 1 ? .3 : .24;
      var gr = c.createLinearGradient(x - w * sp / 2, 0, x + w * sp / 2, 0); gr.addColorStop(0, 'rgba(232,236,204,0)'); gr.addColorStop(.2, 'rgba(232,236,204,' + (a * .5).toFixed(3) + ')'); gr.addColorStop(.5, 'rgba(240,243,222,' + a + ')'); gr.addColorStop(.8, 'rgba(232,236,204,' + (a * .5).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(232,236,204,0)');
      c.fillStyle = gr; c.beginPath(); c.moveTo(x - w / 2, top); c.bezierCurveTo(x - w / 2, top + (bot - top) * .04, x - w * .55, top + (bot - top) * .08, x - w * .52, top + (bot - top) * .12); c.lineTo(x - w * sp / 2, bot); c.lineTo(x + w * sp / 2, bot); c.lineTo(x + w * .52, top + (bot - top) * .12); c.bezierCurveTo(x + w * .55, top + (bot - top) * .08, x + w / 2, top + (bot - top) * .04, x + w / 2, top); c.closePath(); c.fill();
      var gl = c.createLinearGradient(0, top - 2, 0, top + (bot - top) * .14); gl.addColorStop(0, 'rgba(255,255,246,.5)'); gl.addColorStop(.35, 'rgba(244,246,228,.22)'); gl.addColorStop(1, 'rgba(244,246,228,0)'); c.fillStyle = gl; c.fillRect(x - w * .55, top - 2, w * 1.1, (bot - top) * .14 + 2);
      c.strokeStyle = 'rgba(255,255,246,.7)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x - w / 2, top + 1); c.quadraticCurveTo(x, top - 3, x + w / 2, top + 1); c.stroke(); });
    c.globalCompositeOperation = 'source-over';
    var rg = c.createRadialGradient(g.rx - g.rr * .4, g.ry - g.rr * .5, 1, g.rx, g.ry, g.rr * 1.4); rg.addColorStop(0, '#30342C'); rg.addColorStop(1, '#090A08'); c.fillStyle = rg; c.beginPath(); c.moveTo(g.rx - g.rr * 1.25, g.ry + g.rr * .55); c.bezierCurveTo(g.rx - g.rr * 1.3, g.ry - g.rr * .1, g.rx - g.rr * .7, g.ry - g.rr * .62, g.rx - g.rr * .1, g.ry - g.rr * .58); c.bezierCurveTo(g.rx + g.rr * .5, g.ry - g.rr * .7, g.rx + g.rr * 1.2, g.ry - g.rr * .2, g.rx + g.rr * 1.2, g.ry + g.rr * .55); c.closePath(); c.fill();
    c.globalCompositeOperation = 'lighter';
    streaks.forEach(function (s) { var q2 = tiers[s.tr]; if (!RM) s.t += s.v * (s.tr === 3 ? .8 : 1); if (s.t > 1) { s.t -= 1; s.u = rnd(-.5, .5); } var t = s.t, e = t * t * .55 + t * .45, fh = q2[2] - q2[1], x = q2[0] + s.u * q2[3] * (1 + e * (q2[4] - 1)), y0 = q2[1] + fh * e, len = s.l * fh * (.5 + t), y1 = Math.max(q2[1], y0 - len), y2 = Math.min(q2[2], y0);
      if (s.tr === 2 && Math.abs(x - g.rx) < g.rr * .7 && y2 > g.ry - g.rr * .6 && y1 < g.ry + g.rr * .45) { if (y1 < g.ry - g.rr * .6) y2 = g.ry - g.rr * .6; else return; if (Math.random() < .15 && spray.length < 420) spray.push({ x: x, y: g.ry - g.rr * .6, vx: (x - g.rx) * .08 + rnd(-.6, .6), vy: rnd(-1.6, -.4), l: 1 }); }
      c.strokeStyle = 'rgba(244,246,228,' + (s.a * Math.min(1, t / .06) * (s.tr === 3 ? .7 : 1)).toFixed(3) + ')'; c.lineWidth = s.w * (s.tr === 3 ? .7 : 1); c.beginPath(); c.moveTo(x, y1); c.lineTo(x + Math.sin(T * 3 + s.u * 9) * .5, y2); c.stroke(); });
    if (!RM) { for (var i = 0; i < 7; i++) spray.push({ x: g.fx + rnd(-.6, .6) * g.fw * 1.1, y: g.ly, vx: rnd(-1.4, 1.4), vy: rnd(-2.4, -.6), l: 1 }); for (i = 0; i < 9; i++) spray.push({ x: g.fx2 + rnd(-.6, .6) * g.fw * 1.6, y: g.wl, vx: rnd(-1.6, 1.6), vy: rnd(-2.8, -.6), l: 1 }); for (i = 0; i < 2; i++) spray.push({ x: g.tx + rnd(-.5, .5) * g.fw * .4, y: g.wl, vx: rnd(-.8, .8), vy: rnd(-1.4, -.4), l: 1 }); }
    if (spray.length > 420) spray.splice(0, spray.length - 420);
    for (i = spray.length - 1; i >= 0; i--) { var p = spray[i]; p.vy += .09; p.x += p.vx; p.y += p.vy; p.l -= .022; if (p.l <= 0) { spray.splice(i, 1); continue; } c.fillStyle = 'rgba(250,251,238,' + (p.l * .7).toFixed(3) + ')'; c.fillRect(p.x, p.y, 1.3, 1.3); }
    c.strokeStyle = 'rgba(250,251,238,.75)'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(g.rx - g.rr * .95, g.ry - g.rr * .25); c.bezierCurveTo(g.rx - g.rr * .6, g.ry - g.rr * .66, g.rx + g.rr * .4, g.ry - g.rr * .72, g.rx + g.rr * .95, g.ry - g.rr * .25); c.stroke();
    for (i = 0; i < 7; i++) { var cxr = g.rx + (i / 6 - .5) * g.rr * 1.7, cyr = g.ry - g.rr * (.55 - Math.pow(Math.abs(i / 6 - .5) * 2, 2) * .3) - Math.abs(Math.sin(T * 3 + i)) * 3, crr = g.rr * (.22 + .08 * Math.sin(T * 2.3 + i)), cg2 = c.createRadialGradient(cxr, cyr, 0, cxr, cyr, crr); cg2.addColorStop(0, 'rgba(250,251,238,.35)'); cg2.addColorStop(1, 'rgba(250,251,238,0)'); c.fillStyle = cg2; c.fillRect(cxr - crr, cyr - crr, crr * 2, crr * 2); }
    for (i = 0; i < 8; i++) { var sx = (i % 2 ? 1 : -1), ox = g.rx + sx * g.rr * (.75 + Math.random() * .35); c.strokeStyle = 'rgba(244,246,228,' + rnd(.2, .45).toFixed(2) + ')'; c.lineWidth = 1; c.beginPath(); c.moveTo(ox, g.ry - g.rr * .35); c.quadraticCurveTo(ox + sx * 4, g.ry + g.rr * .1, ox + sx * 3, g.ry + g.rr * .6 + Math.random() * 12); c.stroke(); }
    [[g.fx, g.ly, g.fw * 1.3], [g.fx2, g.wl, g.fw * 1.8], [g.tx, g.wl, g.fw * .5]].forEach(function (fm, fi) { for (var j = 0; j < 9; j++) { var bx = fm[0] + Math.sin(T * (1.3 + j * .3) + j * 2.1 + fi) * fm[2] * .45, by = fm[1] - 2 - Math.abs(Math.sin(T * 2 + j)) * 4, r = fm[2] * (.18 + .1 * Math.sin(T * 1.7 + j)), gg = c.createRadialGradient(bx, by, 0, bx, by, r); gg.addColorStop(0, 'rgba(250,251,238,.28)'); gg.addColorStop(1, 'rgba(250,251,238,0)'); c.fillStyle = gg; c.fillRect(bx - r, by - r, r * 2, r * 2); } });
    for (i = 0; i < 5; i++) { var mx2 = g.fx + Math.sin(T * .4 + i * 1.9) * g.fw * .9, my2 = g.ly - 4 - i * 4, mr = g.fw * (1 + i * .35), mg = c.createRadialGradient(mx2, my2, 0, mx2, my2, mr); mg.addColorStop(0, 'rgba(232,236,204,.09)'); mg.addColorStop(1, 'rgba(232,236,204,0)'); c.fillStyle = mg; c.fillRect(mx2 - mr, my2 - mr, mr * 2, mr * 2); }
    c.globalCompositeOperation = 'source-over';
  }
  function drawScene(now, k) {
    var wl = G.wl, fx = G.fx2, fw = G.fw, T = now / 1000, i, Hd = H - wl, kk = Math.max(1.2, (wl - cy) / (.55 * Hd)), MR = S * .6;
    uctx.setTransform(DPR, 0, 0, DPR, 0, 0); uctx.clearRect(0, 0, W, H); uctx.drawImage(sb, 0, 0, W, H); drawFall(uctx, T);
    ctx.globalAlpha = k; ctx.drawImage(up, 0, 0, W, H);
    ctx.fillStyle = '#070807'; ctx.fillRect(0, wl, W, Hd);
    for (var y = wl; y < H; y += 2) { var dd = (y - wl) / Hd, src = wl - (y - wl) * kk - 1, off = Math.sin(y * .23 + T * 1.6) * (.8 + dd * 5) + Math.sin(y * .07 - T * .9) * dd * 3, sh = Math.max(1, 2 * kk); if (src - sh < 0) break; ctx.globalAlpha = k * .8 * (1 - dd * .45); ctx.drawImage(sky, 0, (src - sh) * DPR, W * DPR, sh * DPR, off, y, W, 2); ctx.drawImage(up, 0, (src - sh) * DPR, W * DPR, sh * DPR, off, y, W, 2); }
    ctx.globalAlpha = k;
    var dk = ctx.createLinearGradient(0, wl, 0, H); dk.addColorStop(0, 'rgba(6,7,6,.05)'); dk.addColorStop(1, 'rgba(6,7,6,.5)'); ctx.fillStyle = dk; ctx.fillRect(0, wl, W, Hd);
    ctx.globalCompositeOperation = 'lighter';
    stars.forEach(function (s) { var sy = s.y * H; if (sy > wl) return; var ry = wl + (wl - sy) / kk; if (ry > H) return; var a = .32 * (.5 + .5 * Math.sin(T * s.s * 2 + s.t)); ctx.fillStyle = 'rgba(242,239,232,' + a.toFixed(3) + ')'; ctx.fillRect(s.x * W + Math.sin(ry * .15 + T * 1.5) * 2.5, ry, s.r * 1.8, s.r * .6); });
    if (moon.width) { var mw = moon.width / DPR, mc = mw / 2, sc = Math.min(1, Hd * .7 / (2 * MR)), mry = wl + Hd * .5, glw = .25 + .75 * prog;
      var hg = ctx.createRadialGradient(cx, mry, 0, cx, mry, MR * 2.2 * sc); hg.addColorStop(0, 'rgba(232,236,204,' + (.12 * glw).toFixed(3) + ')'); hg.addColorStop(1, 'rgba(232,236,204,0)'); ctx.fillStyle = hg; ctx.save(); ctx.translate(cx, mry); ctx.scale(1.5, 1); ctx.translate(-cx, -mry); ctx.fillRect(cx - MR * 2.2 * sc, mry - MR * 2.2 * sc, MR * 4.4 * sc, MR * 4.4 * sc); ctx.restore();
      var rxm = MR * sc * 1.05, rym = MR * sc * .8;
      for (y = Math.max(wl + 1, mry - rym); y < Math.min(H, mry + rym); y += 2) { var dy = (y - mry) / rym, hw = Math.sqrt(Math.max(0, 1 - dy * dy)) * rxm, br2 = Math.sin(y * 1.1 + T * 2.5); if (br2 < -.45) continue; var off2 = Math.sin(y * .45 + T * 2) * (2 + Math.abs(dy) * 3); ctx.fillStyle = 'rgba(240,243,220,' + ((.34 - Math.abs(dy) * .14) * glw * (.6 + .4 * br2)).toFixed(3) + ')'; ctx.fillRect(cx - hw * (.9 + .1 * br2) + off2, y, hw * 2 * (.9 + .1 * br2), 1.4); }
      ctx.globalAlpha = k; }
    var mb = .25 + .75 * prog;
    for (y = wl + 2; y < H; y += 2.5) { var d1 = (y - wl) / Hd, n = Math.sin(y * 1.7 + T * 2.4) * Math.sin(y * .31 - T * 1.1); if (n < .1) continue; var w = S * .32 * (1 - d1 * .2) * Math.abs(n), xo = Math.sin(y * .09 - T * 1.3) * 8 * d1, a = (.22 * (1 - d1) + .04) * mb * Math.abs(n); ctx.fillStyle = 'rgba(236,240,212,' + a.toFixed(3) + ')'; ctx.fillRect(cx - w / 2 + xo, y, w, 1); }
    glints.forEach(function (g) { var a = Math.pow(Math.max(0, Math.sin(T * g.s + g.p)), 10) * .85; if (a < .02) return; ctx.fillStyle = 'rgba(255,255,246,' + a.toFixed(3) + ')'; ctx.fillRect(g.x - 2.5, g.y, 5, .8); ctx.fillRect(g.x - .4, g.y - 1.5, .8, 3.5); });
    if (FALLS) for (i = 0; i < 6; i++) { var mx2 = fx + Math.sin(T * .3 + i * 1.7) * fw * 1.5, my2 = wl - i * 5, mr = fw * (1.4 + i * .5), mg = ctx.createRadialGradient(mx2, my2, 0, mx2, my2, mr); mg.addColorStop(0, 'rgba(232,236,204,.1)'); mg.addColorStop(1, 'rgba(232,236,204,0)'); ctx.fillStyle = mg; ctx.fillRect(mx2 - mr, my2 - mr, mr * 2, mr * 2); }
    if (FALLS) for (i = 0; i < 5; i++) { var p = (T * .38 + i / 5) % 1, rx = fw * (.9 + p * 3.6); ctx.strokeStyle = 'rgba(232,236,204,' + ((1 - p) * .24).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(fx, wl + 6, rx, rx * .11, 0, 0, 6.2832); ctx.stroke(); }
    ctx.fillStyle = 'rgba(232,236,204,.1)'; ctx.fillRect(0, wl, W, 1);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(sf, 0, 0, W, H);
    var swf = function (o) { return RM ? 0 : Math.sin(T * 1.0 + o.p + o.x * .008) * .07 + Math.sin(T * 2.1 + o.x * .03) * .025; };
    paintClumps(ctx, clumps, '#0A0C09', .2, swf);
    irises.forEach(function (ir) { var sw = swf(ir) * .5;
      [['#050605', false], ['rgba(222,228,200,.22)', true]].forEach(function (m) { if (m[1]) { ctx.strokeStyle = m[0]; ctx.lineWidth = .8; } else ctx.fillStyle = m[0]; ctx.beginPath(); ir.lv.forEach(function (lv, li) { if (m[1] && li % 2) return; var a = lv.a + sw, bx = ir.x, by = ir.y, mx3 = bx + Math.cos(a) * lv.len * .6, my3 = by + Math.sin(a) * lv.len * .6, a2 = a + lv.fold, tx = mx3 + Math.cos(a2) * lv.len * .4, ty = my3 + Math.sin(a2) * lv.len * .4 + Math.abs(lv.fold) * lv.len * .2, nx = -Math.sin(a), ny = Math.cos(a); if (m[1]) { ctx.moveTo(bx - nx * lv.w * .4, by - lv.len * .15); ctx.quadraticCurveTo(mx3 - nx * lv.w * .8, my3 - ny * lv.w * .8, tx, ty); } else { ctx.moveTo(bx - nx * lv.w * .6, by); ctx.quadraticCurveTo(mx3 - nx * lv.w, my3 - ny * lv.w, tx, ty); ctx.quadraticCurveTo(mx3 + nx * lv.w, my3 + ny * lv.w, bx + nx * lv.w * .6, by); } }); if (m[1]) ctx.stroke(); else ctx.fill(); }); });
    if (G.tt) { var sr = Math.max(280, W * .34), scg = ctx.createRadialGradient(W / 2, G.tt + 110, 0, W / 2, G.tt + 110, sr); scg.addColorStop(0, 'rgba(8,9,9,.74)'); scg.addColorStop(.6, 'rgba(8,9,9,.4)'); scg.addColorStop(1, 'rgba(8,9,9,0)'); ctx.fillStyle = scg; ctx.fillRect(W / 2 - sr, G.tt + 110 - sr, sr * 2, sr * 2); }
    ctx.globalAlpha = 1;
  }
  var layout = function () {
    var nw = innerWidth || document.documentElement.clientWidth, nh = innerHeight || document.documentElement.clientHeight;
    if (!nw || !nh) return;
    var first = !W; DPR = Math.min(2, devicePixelRatio || 1); W = nw; H = nh;
    cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var bh = q('welcome').offsetHeight || 270;
    S = Math.max(120, Math.min(W * 0.62, (H - bh - 150) / 1.24, 380));
    var stack = S * 1.24 + 34 + bh, top0 = Math.max(70, (H - stack) / 2 - 10);
    cx = W / 2; cy = top0 + S * 0.62;
    moon.width = Math.ceil(S * 1.6 * DPR); moon.height = moon.width;
    q('welcome').style.top = (cy + S * 0.62 + 34) + 'px'; G.tt = cy + S * 0.62 + 34; buildScene();
    dust.forEach(function (d) { if (first || !d.x) { var a = Math.random() * 6.28, r = rnd(.35, .9) * Math.max(W, H); d.x = cx + Math.cos(a) * r; d.y = cy + Math.sin(a) * r; } });
  };
  // night ambience: crickets and the odd frog, synthesised; starts when the browser allows sound, fades out on enter
  var amb = (function () {
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return { go: function () {}, stop: function () {} };
    var ac = null, out = null, tm = null, started = false, nextFrog = 0, crickets = [];
    function chirp(c, t) { var o = ac.createOscillator(), g = ac.createGain(), pn = ac.createStereoPanner(); o.type = 'sine'; o.frequency.value = c.f; pn.pan.value = c.pan; g.gain.value = 0; o.connect(g).connect(pn).connect(out);
      for (var k = 0; k < c.n; k++) { var a = t + k * c.gap; g.gain.setValueAtTime(0, a); g.gain.linearRampToValueAtTime(c.amp, a + .004); g.gain.linearRampToValueAtTime(0, a + c.len); }
      o.start(t); o.stop(t + c.n * c.gap + .05); }
    function frog(t) { var dur = .16 + Math.random() * .14, reps = 1 + (Math.random() * 3 | 0), base = 95 + Math.random() * 70, pan = Math.random() * 1.6 - .8;
      for (var r = 0; r < reps; r++) { var a = t + r * (dur + .07), o = ac.createOscillator(), am = ac.createOscillator(), amg = ac.createGain(), bp = ac.createBiquadFilter(), g = ac.createGain(), pn = ac.createStereoPanner();
        o.type = 'sawtooth'; o.frequency.setValueAtTime(base * 1.08, a); o.frequency.exponentialRampToValueAtTime(base * .92, a + dur); am.frequency.value = 26 + Math.random() * 10; amg.gain.value = .5; am.connect(amg).connect(g.gain);
        bp.type = 'bandpass'; bp.frequency.value = 380 + Math.random() * 260; bp.Q.value = 4; pn.pan.value = pan;
        g.gain.setValueAtTime(0, a); g.gain.linearRampToValueAtTime(.5, a + .02); g.gain.setValueAtTime(.5, a + dur - .04); g.gain.linearRampToValueAtTime(0, a + dur);
        o.connect(bp).connect(g).connect(pn).connect(out); o.start(a); am.start(a); o.stop(a + dur + .02); am.stop(a + dur + .02); } }
    function tick() { var now = ac.currentTime, ahead = now + .6;
      crickets.forEach(function (c) { while (c.t < ahead) { if (Math.random() > .12) chirp(c, c.t); c.t += c.per * (.92 + Math.random() * .16); } });
      if (now >= nextFrog) { frog(now + .1); nextFrog = now + 2.5 + Math.random() * 6; } }
    function go() { if (started) { if (ac && ac.state === 'suspended') ac.resume(); return; } try { ac = new AC(); } catch (e) { return; } started = true;
      out = ac.createGain(); out.gain.value = 0; var hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 60; out.connect(hp).connect(ac.destination);
      out.gain.setTargetAtTime(.1, ac.currentTime, 1.2);
      for (var i = 0; i < 6; i++) crickets.push({ f: 3900 + Math.random() * 1100, pan: Math.random() * 1.8 - .9, amp: .05 + Math.random() * .06, n: 2 + (Math.random() * 3 | 0), gap: .028 + Math.random() * .012, len: .018, per: .55 + Math.random() * .7, t: ac.currentTime + Math.random() });
      nextFrog = ac.currentTime + 1.5; tm = setInterval(tick, 200); if (ac.state === 'suspended') ac.resume(); }
    function stop() { if (!ac) return; out.gain.setTargetAtTime(0, ac.currentTime, .35); setTimeout(function () { clearInterval(tm); try { ac.close(); } catch (e) {} }, 1600); }
    return { go: go, stop: stop };
  })();
  // ambience retired: synthesised crickets and frogs did not sound natural; drop in a real field recording here if wanted
  layout(); mountNow(); addEventListener('resize', layout);
  root.addEventListener('pointermove', function (e) { mx = e.clientX; my = e.clientY; });
  root.addEventListener('pointerleave', function () { mx = my = -1e4; });

  var tex = null;
  function buildTex(MR) {
    var D = Math.ceil(MR * 2 * DPR), c = document.createElement('canvas'); c.width = c.height = D; var x = c.getContext('2d'), r = D / 2;
    var seed = 7; var R = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    x.save(); x.beginPath(); x.arc(r, r, r, 0, 6.2832); x.clip();
    var g = x.createRadialGradient(r * .78, r * .72, r * .05, r, r, r); g.addColorStop(0, '#FBFBF2'); g.addColorStop(.55, '#EBEED6'); g.addColorStop(1, '#C7CBB0'); x.fillStyle = g; x.fillRect(0, 0, D, D);
    var lg = x.createRadialGradient(r, r, r * .55, r, r, r); lg.addColorStop(0, 'rgba(40,42,30,0)'); lg.addColorStop(1, 'rgba(40,42,30,.22)'); x.fillStyle = lg; x.fillRect(0, 0, D, D);
    x.restore(); c.__r = MR; tex = c;
  }
  var t0 = performance.now(), loaded = document.readyState === 'complete', MIN = RM ? 300 : 2900;
  addEventListener('load', function () { loaded = true; });
  setTimeout(function () { loaded = true; }, 9000);
  var prog = 0, readyAt = 0, exitAt = 0, raf = 0, tick = 0;
  var ease = function (x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  var clamp = function (x) { return Math.max(0, Math.min(1, x)); };
  var mix = function (a, b, t) { return a + (b - a) * t; };

  var clock = q('clock'), stepEl = q('step'), pctEl = q('pct'), fillEl = q('fill');
  var setClock = function () { var d = new Date(); clock.textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) + ' · Local'; };
  setClock(); var clk = setInterval(setClock, 15000);

  var frame = function (now) {
    raf = requestAnimationFrame(frame); tick++;
    if (W !== (innerWidth || document.documentElement.clientWidth) || H !== (innerHeight || document.documentElement.clientHeight)) layout();
    if (!W || !H || !moon.width) return;
    var tp = clamp((now - t0) / MIN), target = loaded ? ease(tp) : Math.min(ease(tp), 0.92);
    prog += (target - prog) * 0.12; if (target === 1 && prog > 0.998) prog = 1;
    var P = Math.round(prog * 100);
    if (tick % 3 === 0) { pctEl.textContent = String(P).padStart(3, '0'); fillEl.style.width = (prog * 100) + '%'; stepEl.textContent = STEPS[Math.min(2, Math.floor(prog * 3))]; }
    if (prog === 1 && !readyAt) { readyAt = now; ready(); }
    var R = readyAt ? clamp((now - readyAt) / 1100) : 0, Re = ease(R);
    var X = exitAt ? clamp((now - exitAt) / 1100) : 0, Xe = ease(X);
    var u = S / 100, ox = cx - S / 2, oy = cy - S / 2;

    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1 - Xe; ctx.drawImage(sky, 0, 0, W, H); ctx.globalAlpha = 1;
    stars.forEach(function (s) { var a = (.25 + .45 * (.5 + .5 * Math.sin(now / 1000 * s.s + s.t))) * (1 - Xe); ctx.fillStyle = 'rgba(242,239,232,' + a.toFixed(3) + ')'; ctx.fillRect(s.x * W, s.y * H, s.r, s.r); if (s.r > 1.2 && a > .5) { ctx.fillStyle = 'rgba(242,239,232,' + ((a - .5) * .9).toFixed(3) + ')'; ctx.fillRect(s.x * W - 3, s.y * H + s.r / 2 - .3, 6 + s.r, .6); ctx.fillRect(s.x * W + s.r / 2 - .3, s.y * H - 3, .6, 6 + s.r); } });
    drawScene(now, 1 - Xe);

    // moon — waxes with progress
    var MR = S * 0.6, mw = moon.width / DPR, mc = mw / 2;
    if (!tex || tex.__r !== MR) buildTex(MR);
    var glow = (.2 + .8 * prog) * (1 - Xe), br = 1 + .04 * Math.sin(now / 2600);
    ctx.save(); ctx.translate(cx, cy); var ms = 1 + Xe * 2.4; ctx.scale(ms, ms);
    ctx.globalCompositeOperation = 'lighter';
    [[1.0, 3.0 * br, .07], [1.0, 1.6, .1]].forEach(function (h) { var gg = ctx.createRadialGradient(0, 0, MR * h[0], 0, 0, MR * h[1]); gg.addColorStop(0, 'rgba(232,236,204,' + (h[2] * glow).toFixed(3) + ')'); gg.addColorStop(1, 'rgba(232,236,204,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(0, 0, MR * h[1], 0, 6.2832); ctx.fill(); });
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = .07 * (1 - Xe); ctx.drawImage(tex, -MR, -MR, MR * 2, MR * 2);
    mctx.setTransform(DPR, 0, 0, DPR, 0, 0); mctx.clearRect(0, 0, mw, mw); mctx.globalCompositeOperation = 'source-over'; mctx.filter = 'none';
    mctx.drawImage(tex, mc - MR, mc - MR, MR * 2, MR * 2);
    mctx.globalCompositeOperation = 'destination-out'; mctx.filter = 'blur(' + (MR * .05).toFixed(1) + 'px)';
    var sh = prog * 2.2 * MR; mctx.beginPath(); mctx.arc(mc - sh, mc - sh * .1, MR * 1.04, 0, 6.2832); mctx.fill(); mctx.filter = 'none';
    ctx.globalAlpha = (.4 + .6 * prog) * (1 - Xe * .4);
    ctx.shadowColor = 'rgba(232,236,204,' + (.35 * glow).toFixed(3) + ')'; ctx.shadowBlur = 18 + 10 * Re;
    ctx.drawImage(moon, -mc, -mc, mw, mw);
    ctx.restore();

    // dust → cat
    var cap = -1, k = RM ? 1 : 0.075;
    var catCol = Re; // 0 = moonlight dust, 1 = black silhouette
    dust.forEach(function (d) {
      var tx = ox + d.tx * u, ty = oy + d.ty * u, on = d.o < cap;
      if (X) { var a = Math.atan2(d.y - cy, d.x - cx) + d.seed * .1; d.vx += Math.cos(a) * 1.6; d.vy += Math.sin(a) * 1.6; d.x += d.vx; d.y += d.vy; }
      else if (on) { d.vx = (d.vx + (tx - d.x) * k) * .78; d.vy = (d.vy + (ty - d.y) * k) * .78; d.x += d.vx; d.y += d.vy; }
      else { var a2 = now / 2400 + d.seed; d.x += Math.cos(a2) * .35 + (cx - d.x) * .0015; d.y += Math.sin(a2 * 1.3) * .35 + (cy - d.y) * .0015; }
      var dx = d.x - mx, dy = d.y - my, dd = dx * dx + dy * dy;
      if (dd < 9000 && !X) { var f = (1 - dd / 9000) * 4; var l = Math.sqrt(dd) || 1; d.x += dx / l * f; d.y += dy / l * f; }
      var sz = on ? mix(1.6, u * 1.62, clamp((1 - Math.hypot(tx - d.x, ty - d.y) / 60))) : 1.4;
      var c = on ? Math.round(mix(232, 0, catCol)) : 232, c2 = on ? Math.round(mix(236, 0, catCol)) : 236, c3 = on ? Math.round(mix(204, 0, catCol)) : 204;
      ctx.fillStyle = 'rgba(' + c + ',' + c2 + ',' + c3 + ',' + ((on ? 1 : .55) * (1 - Xe)).toFixed(3) + ')';
      ctx.fillRect(d.x - sz / 2, d.y - sz / 2, sz, sz);
    });

    if (X >= 1) done();
  };
  raf = requestAnimationFrame(frame);
  var safety = setInterval(function () { if (!readyAt && performance.now() - t0 > 11000) { prog = 1; readyAt = performance.now(); ready(); } }, 500);

  function ready() {
    q('bar').style.opacity = '0';
    ['w1', 'w2', 'w3', 'enter', 'w4'].forEach(function (k, i) { var el = q(k); el.style.transitionDelay = (0.7 + i * 0.14) + 's'; el.style.opacity = '1'; el.style.transform = 'none'; });
    setTimeout(function () { try { btn.focus({ preventScroll: true }); } catch (e) {} }, 1500);
    root.style.cursor = 'pointer';
    root.addEventListener('click', enter); addEventListener('keydown', key);
  }
  function key(e) { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') { e.preventDefault(); enter(); } }
  function enter() {
    if (exitAt) return; exitAt = performance.now(); amb.stop();
    removeEventListener('keydown', key);
    q('welcome').style.transition = 'opacity .5s'; q('welcome').style.opacity = '0';
    root.style.transition = 'opacity .7s .5s'; root.style.opacity = '0'; root.style.pointerEvents = 'none';
    document.documentElement.style.overflow = '';
    setTimeout(done, 1500);
  }
  function done() { if (!root.isConnected) return; clearInterval(safety); cancelAnimationFrame(raf); clearInterval(clk); removeEventListener('resize', layout); root.remove(); }
})();
