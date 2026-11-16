const { useRef, useLayoutEffect, useEffect, useState } = React;
/* PORTALS · Brand trailer "Sophia". One isometric world in the gate mark's own projection, so every shape lines up with the logo:
   the point → the field grid → the plinth → the portal of light (the doorway of the mark) → through it, a corridor of nested portals →
   stillness and the three values → the gate builds around the portal → wordmark, tagline, lettermark. */
const W = 1920, H = 1080, CX = 960;
const NIGHT = '#0D0E10', WHITE = '#FAFAFA', MOON = '#E8ECCC', MR = '232,236,204';
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const eIn = t => t * t * t, eOut = t => 1 - Math.pow(1 - t, 3);
const hash = (i, k) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
const serif = { fontFamily: "'Satoshi', sans-serif", fontWeight: 300, letterSpacing: '-0.02em' };
const sans = { fontFamily: "'Satoshi', sans-serif", fontWeight: 500, letterSpacing: '-0.01em' };
const mono = { fontFamily: "'Satoshi', sans-serif", fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.32em' };
const RINGS = () => (window.SophiaAudio && window.SophiaAudio.RINGS) || [8, 11, 14, 17, 20.3, 24.6, 52, 57];
function glow(x, cx, cy, r, a, rgb = MR) { if (a <= 0 || r <= 0) return; const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); x.fillStyle = g; x.fillRect(cx - r, cy - r, r * 2, r * 2); }
function seg(x, p, q) { x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(q[0], q[1]); x.stroke(); }

/* ---------- camera: the mark's isometric projection, one continuous move ---------- */
function camAt(T, C) {
  let s = 16 + (6.6 - 16) * ss(C.Field, C.Portal + 4, T), cv = -30 * ss(C.Field + 2, C.Portal + 2, T), ay = 560 + (470 - 560) * ss(C.Field, C.Portal + 2, T);
  if (T < C.Through) s *= Math.pow(45, eIn(clamp((T - (C.Portal + 9)) / 3)));
  if (T >= C.Mark) { const m = ss(C.Mark + 3, C.Mark + 7, T); s = 6.6 + (4.6 - 6.6) * m; ay = 470 + (330 - 470) * m; cv = -30; }
  return { s, toS: (X, Y, Z) => [CX + (X - Y) * 0.8660254 * s, ay + ((X + Y) * 0.5 - Z - cv) * s] };
}
/* ---------- the field: isometric grid to every edge, drawing outward from the origin ---------- */
function isoGrid(x, toS, rev, amax, skip) {
  if (rev <= 0) return;
  const B = 12, bk = Array.from({ length: B }, () => []), top = amax * 3.4, Rr = rev * 460;
  for (let n = -24; n <= 24; n++) { const c = 2 + 12 * n, major = n % 4 === 0 ? 1.7 : 1;
    for (let m = -24; m < 24; m++) { const s0 = 2 + 12 * m, mid = s0 + 6;
      for (let dir = 0; dir < 2; dir++) { const mx = dir ? mid : c, my = dir ? c : mid; if (skip && Math.abs(mx) < 50 && Math.abs(my) < 50) continue;
        const d = Math.hypot(mx, my), front = rev < 1 ? Math.exp(-Math.pow((d - Rr + 30) / 34, 2)) : 0;
        const a = amax * major * ss(Rr, Rr - 60, d) * (0.4 + 0.6 * Math.exp(-d / 150)) + amax * 2 * front; if (a < 0.004) continue;
        bk[Math.min(B - 1, Math.floor(a / top * B))].push(dir ? s0 : c, dir ? c : s0, dir ? s0 + 12 : c, dir ? c : s0 + 12); } } }
  x.save(); x.lineWidth = 1;
  bk.forEach((arr, b) => { if (!arr.length) return; x.strokeStyle = `rgba(${MR},${((b + 0.5) / B * top).toFixed(4)})`; x.beginPath();
    for (let i = 0; i < arr.length; i += 4) { const p = toS(arr[i], arr[i + 1], 0), q = toS(arr[i + 2], arr[i + 3], 0); x.moveTo(p[0], p[1]); x.lineTo(q[0], q[1]); } x.stroke(); });
  x.restore();
}
function rings(x, toS, T) {
  x.save(); x.globalCompositeOperation = 'lighter';
  for (const t of RINGS()) { const a = T - t; if (a < 0 || a > 5) continue; const r = 52 + a * 110, o = 0.55 * Math.pow(1 - a / 5, 2);
    x.strokeStyle = `rgba(${MR},${o})`; x.lineWidth = 1.6; x.beginPath(); [[r, -r], [r, r], [-r, r], [-r, -r]].forEach((p, i) => { const q = toS(p[0], p[1], 0); i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]); }); x.closePath(); x.stroke(); }
  x.restore();
}
/* ---------- stone: isometric boxes with the mark's exact faces; wireframe while they build ---------- */
const STONE = { t: '#282728', l: '#171717', r: '#111214' }, LANTERN = { t: '#FAFAFA', l: MOON, r: '#C5C8AE' };
function box(x, toS, cx, cy, z0, hx, hy, h, fill, edge, col = STONE) {
  if (h <= 0.01) return; const X0 = cx - hx, X1 = cx + hx, Y0 = cy - hy, Y1 = cy + hy, z1 = z0 + h;
  const path = pts => { x.beginPath(); pts.forEach((p, i) => { const q = toS(p[0], p[1], p[2]); i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]); }); x.closePath(); };
  x.save();
  if (fill < 1 && edge > 0) { x.setLineDash([4, 5]); x.strokeStyle = `rgba(${MR},${0.4 * edge * (1 - fill)})`; x.lineWidth = 1;
    seg(x, toS(X0, Y0, z0), toS(X1, Y0, z0)); seg(x, toS(X0, Y0, z0), toS(X0, Y1, z0)); seg(x, toS(X0, Y0, z0), toS(X0, Y0, z1)); x.setLineDash([]); }
  const F = [[[[X1, Y0, z1], [X1, Y1, z1], [X1, Y1, z0], [X1, Y0, z0]], col.r], [[[X0, Y1, z1], [X1, Y1, z1], [X1, Y1, z0], [X0, Y1, z0]], col.l], [[[X0, Y0, z1], [X1, Y0, z1], [X1, Y1, z1], [X0, Y1, z1]], col.t]];
  if (fill > 0) F.forEach(([p, c]) => { path(p); x.globalAlpha = fill; x.fillStyle = c; x.fill(); x.globalAlpha = 1; });
  if (edge > 0) { x.strokeStyle = `rgba(${MR},${edge})`; x.lineWidth = 1; x.lineJoin = 'round'; F.forEach(([p]) => { path(p); x.stroke(); });
    x.strokeStyle = `rgba(250,250,250,${0.45 * edge})`; const a = toS(X0, Y1, z1), b = toS(X1, Y1, z1), c = toS(X1, Y0, z1); x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.lineTo(c[0], c[1]); x.stroke(); }
  x.restore();
}
/* ---------- the field inside the portal: two light sources and their confocal waves (ellipses travel, hyperbolas stand) ---------- */
const LUT = (() => { const a = new Uint8ClampedArray(256 * 3); for (let i = 0; i < 256; i++) { const b = i / 255 * 1.6, m = Math.min(b, 1), w = clamp((b - 1) / 0.6);
  const r = 13 + 219 * m, g = 14 + 222 * m, bl = 16 + 188 * m; a[i * 3] = r + (255 - r) * w; a[i * 3 + 1] = g + (255 - g) * w; a[i * 3 + 2] = bl + (255 - bl) * w; } return a; })();
function fieldImage(cache, w, h, p) {
  if (!cache.c) { cache.c = document.createElement('canvas'); cache.c.width = w; cache.c.height = h; cache.x = cache.c.getContext('2d'); cache.img = cache.x.createImageData(w, h); }
  const rip = p.rip || 0, swl = p.swirl || 0, rt = p.t * 4.2, d = cache.img.data, ar = w / h, ang = p.rot + p.t * 0.12 * p.spin, sx = p.spread * Math.cos(ang), sy = p.spread * Math.sin(ang), K = p.k, ph = p.ph, wt = p.t * 0.45, wa = p.warp;
  let o = 0;
  for (let j = 0; j < h; j++) { const y0 = (1 - 2 * (j + 0.5) / h) / p.zoom;
    for (let i = 0; i < w; i++) { const x0 = (2 * (i + 0.5) / w - 1) * ar / p.zoom;
      // a portal's surface: concentric ripples running out from the centre, and a slow vortex turning the field
      const q0 = x0 * x0 + y0 * y0, rr = Math.sqrt(q0), wave = Math.sin(rr * 26 - rt), dsp = 1 + rip * wave * Math.exp(-rr * 1.6), sa = swl * Math.exp(-q0 * 2.2) + p.t * 0.25 * (swl ? 1 : 0), cs = Math.cos(sa), sn = Math.sin(sa);
      const x = (x0 * cs - y0 * sn) * dsp, y = (x0 * sn + y0 * cs) * dsp;
      const ax = x - sx, ay = y - sy, bx = x + sx, by = y + sy, d1 = Math.sqrt(ax * ax + ay * ay), d2 = Math.sqrt(bx * bx + by * by), r2 = x * x + y * y;
      const wp = wa * Math.sin(x * 3.1 + wt) * Math.sin(y * 2.3 - wt * 0.8);
      const le = Math.max(0, 1 - Math.abs(Math.cos((d1 + d2) * K - ph + wp)) * 4.5), lh = Math.max(0, 1 - Math.abs(Math.cos((d1 - d2) * K * 1.3 + wp * 0.5)) * 6);
      const fade = Math.exp(-r2 * p.fall), b = p.base * (0.55 + 0.45 * fade) + le * 0.6 * (0.3 + 0.7 * fade) + lh * 0.3 * fade + p.core * Math.exp(-r2 * 9) + p.core * 0.5 * (Math.exp(-(ax * ax + ay * ay) * 60) + Math.exp(-(bx * bx + by * by) * 60)) + rip * 4 * Math.max(0, wave) * Math.max(0, wave) * Math.exp(-rr * 1.2);
      const q = Math.min(255, (b / 1.6 * 255) | 0) * 3; d[o] = LUT[q]; d[o + 1] = LUT[q + 1]; d[o + 2] = LUT[q + 2]; d[o + 3] = 255; o += 4; } }
  cache.x.putImageData(cache.img, 0, 0); return cache.c;
}
const DOORF = {}, WORLDF = {};
/* ---------- the portal: the doorway of the mark holding its own field; local units (u ±7.8, w ±12, w up); k = px per unit ---------- */
function portalFace(x, T, a, open, k) {
  if (a <= 0) return; const hw = 7.8 * Math.max(open, 0.01), hh = 12, px = v => v / k;
  x.save(); x.beginPath(); x.rect(-hw, -hh, hw * 2, hh * 2); x.clip(); x.globalAlpha = a;
  const img = fieldImage(DOORF, 120, 185, { t: T, ph: T * 1.1, k: 13, spread: 0.42, rot: Math.PI / 2, spin: 0.5, base: 0.5, zoom: 1, fall: 0.7, core: 1.1, warp: 0.35, rip: 0.07, swirl: 1.6 });
  x.imageSmoothingEnabled = true; x.drawImage(img, -7.8, -12, 15.6, 24);
  x.globalCompositeOperation = 'lighter'; const r = x.createRadialGradient(0, 0, 0, 0, 0, 13); r.addColorStop(0, 'rgba(255,255,255,.35)'); r.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = r; x.fillRect(-hw, -hh, hw * 2, hh * 2);
  x.restore();
  x.save(); x.globalAlpha = a; x.strokeStyle = 'rgba(255,255,255,.95)'; x.lineWidth = px(2); x.strokeRect(-hw, -hh, hw * 2, hh * 2); x.restore();
}
function ticks(x, x0, y0, x1, y1, L, o, lw) { x.lineWidth = lw; [[x0, y0, -1, -1], [x1, y0, 1, -1], [x1, y1, 1, 1], [x0, y1, -1, 1]].forEach(([cx, cy, dx, dy]) => { const ox = cx + dx * o, oy = cy + dy * o; x.beginPath(); x.moveTo(ox - dx * L, oy); x.lineTo(ox, oy); x.lineTo(ox, oy - dy * L); x.stroke(); }); }
function doorPortal(x, cm, T, st) {
  const s = cm.s, c = cm.toS(0, 0, 30), M = [0.8660254 * s, 0.5 * s, 0, -s, c[0], c[1]];
  if (st.fill > 0) { const p0 = cm.toS(0, 0, 18), p1 = cm.toS(0, 26, 18), g = x.createLinearGradient(p0[0], p0[1], p1[0], p1[1]); g.addColorStop(0, `rgba(${MR},${0.34 * st.fill})`); g.addColorStop(1, `rgba(${MR},0)`);
    x.save(); x.globalCompositeOperation = 'lighter'; x.fillStyle = g; x.beginPath(); [[-7.8, 0], [7.8, 0], [11.8, 26], [-11.8, 26]].forEach(([X, Y], i) => { const q = cm.toS(X, Y, 18); i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]); }); x.closePath(); x.fill();
    glow(x, c[0], c[1], 44 * s, 0.11 * st.fill); glow(x, c[0], c[1], 18 * s, 0.22 * st.fill); x.restore(); }
  if (st.line > 0) { const L = 24 * st.line; x.save(); x.setTransform(...M); x.globalCompositeOperation = 'lighter'; x.globalAlpha = 1 - st.fill; x.fillStyle = '#FFFFFF'; x.fillRect(-1 / s, -12, 2 / s, L); x.restore();
    if (st.open < 1) { const h = cm.toS(0, 0, 18 + L); x.save(); x.globalCompositeOperation = 'lighter'; glow(x, h[0], h[1], 60, 0.7 * (1 - st.open)); x.restore(); } }
  if (st.open > 0) { x.save(); x.setTransform(...M); portalFace(x, T, st.fill, st.open, s);
    if (st.fill < 1) { x.strokeStyle = `rgba(255,255,255,${1 - st.fill})`; x.lineWidth = 1.6 / s; x.strokeRect(-7.8 * st.open, -12, 15.6 * st.open, 24); }
    x.strokeStyle = `rgba(${MR},${0.8 * ss(0.7, 1, st.open)})`; ticks(x, -7.8, -12, 7.8, 12, 2.2, 1.3, 1.5 / s); x.restore(); }
}
function motes(x, toS, T, a) {
  if (a <= 0) return; x.save(); x.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 70; i++) { const u = (hash(i, 3) + T * (0.035 + 0.05 * hash(i, 4))) % 1, p = toS((hash(i, 1) - 0.5) * 18, hash(i, 2) * 16, 18 + u * 56), sz = 1.5 + 2.2 * hash(i, 5);
    x.fillStyle = `rgba(250,250,250,${a * Math.sin(u * Math.PI) * (0.4 + 0.5 * hash(i, 6))})`; x.fillRect(p[0] - sz / 2, p[1] - sz / 2, sz, sz); }
  x.restore();
}
function label(x, p, text, a, dx) {
  if (a <= 0) return; x.save(); x.globalAlpha = a; x.strokeStyle = `rgba(${MR},.6)`; x.fillStyle = `rgba(${MR},.85)`; x.lineWidth = 1;
  x.fillRect(p[0] - 2.5, p[1] - 2.5, 5, 5); seg(x, p, [p[0] + dx, p[1]]);
  x.font = "500 15px 'Satoshi', sans-serif"; x.letterSpacing = '4px'; x.textBaseline = 'middle'; x.textAlign = dx > 0 ? 'left' : 'right'; const [t1, t2] = text.split(' — '), w1 = x.measureText(t1).width; x.save(); x.font = "400 12px 'Satoshi', sans-serif"; x.letterSpacing = '3px'; const w2 = t2 ? x.measureText(t2).width : 0; x.restore(); const tw = Math.max(w1, w2);
  let tx = p[0] + dx + (dx > 0 ? 12 : -12); if (dx > 0) tx = Math.min(tx, W * 0.95 - tw); else tx = Math.max(tx, W * 0.05 + tw);   // title-safe: inside the central 90%
  x.fillText(t1, tx, t2 ? p[1] - 9 : p[1]);
  if (t2) { x.font = "400 12px 'Satoshi', sans-serif"; x.letterSpacing = '3px'; x.fillStyle = 'rgba(250,250,250,.6)'; x.fillText(t2, tx, p[1] + 12); } x.restore();
}
/* ---------- the Matrix, in our own code: pixel glyphs built on the lettermark's grid — Solfeggio digits, the P, the gate, the doorway ---------- */
const GLY = ['..#..,.##..,..#..,..#..,.###.', '####.,....#,.###.,#....,#####', '####.,....#,.###.,....#,####.', '#..#.,#..#.,#####,...#.,...#.', '#####,#....,####.,....#,####.', '.###.,#....,####.,#...#,.###.', '#####,...#.,..#..,.#...,.#...', '.###.,#...#,.###.,#...#,.###.', '.###.,#...#,.####,....#,.###.', '####.,#..##,####.,#....,#....', '#####,.#.#.,#####,.#.#.,.#.#.', '#####,#...#,#.#.#,#...#,#####', '.....,.###.,.#.#.,.###.,.....', '#.#.#,.....,#.#.#,.....,#.#.#'].map(g => g.split(','));
let ATLAS = null;
function atlas() { if (ATLAS) return ATLAS; const c = document.createElement('canvas'); c.width = GLY.length * 20; c.height = 40; const g = c.getContext('2d');
  ['#FFFFFF', MOON].forEach((col, ri) => { g.fillStyle = col; GLY.forEach((rows, gi) => rows.forEach((r, y) => { for (let k = 0; k < 5; k++) if (r[k] === '#') g.fillRect(gi * 20 + k * 4, ri * 20 + y * 4, 3, 3); })); }); return (ATLAS = c); }
function matrixCode(x, T, F0) {
  const A = ss(0, 1.4, T); if (A <= 0 || T > F0 + 3) return; const at = atlas(), P = 26, cols = Math.ceil(W / P), rows = Math.ceil(H / P) + 1, x0 = (W - cols * P) / 2 + 3, NG = GLY.length;
  x.save();
  for (let c = 0; c < cols; c++) { const X = x0 + c * P, dc = Math.abs(X + 10 - CX) / CX;
    // the code parts from the centre outward, clearing a space for the signal
    const ca = A * (1 - ss(4.6 + 3.2 * dc, 6.2 + 3.2 * dc, T)) * (0.4 + 0.6 * ss(0.06, 0.32, dc)); if (ca <= 0.01) continue;
    for (let st = 0; st < 2; st++) { const v = 4 + 9 * hash(c, 1 + st), L = 7 + Math.floor(16 * hash(c, 2 + st)), per = rows + L + 12 * hash(c, 3 + st), head = (T * v + hash(c, 4 + st * 7) * per + st * per * 0.5) % per;
      for (let k = 0; k <= L; k++) { const r = Math.floor(head) - k; if (r < 0 || r >= rows) continue;
        const a = Math.pow(1 - k / (L + 1), 1.5) * ca, gi = Math.floor(hash(c * 31 + r, Math.floor(T * (1.5 + 5 * hash(c, r)) + hash(r, c) * 9)) * NG);
        if (k === 0) { x.globalCompositeOperation = 'lighter'; glow(x, X + 10, r * P + 10, 22, 0.35 * ca); x.globalCompositeOperation = 'source-over'; }
        x.globalAlpha = a * (k === 0 ? 1 : 0.75); x.drawImage(at, gi * 20, k === 0 ? 0 : 20, 20, 20, X, r * P, 20, 20); } } }
  x.restore();
}
const TIERS = [[50, 0, 6], [38, 6, 6], [26, 12, 6]], LAMPS = [[-44, -44], [44, 44], [-44, 44], [44, -44]];

/* ---------- 0–2 · VOID · FIELD · PORTAL, and 5 · MARK: the isometric world ---------- */
function actWorld(x, T, C) {
  x.fillStyle = NIGHT; x.fillRect(0, 0, W, H);
  const cm = camAt(T, C), toS = cm.toS, F0 = C.Field, P = C.Portal, M = C.Mark, mark = T >= M;
  const tP = i => mark ? 1 : ss(F0 + 4 + 1.4 * i, F0 + 6 + 1.4 * i, T), tF = i => mark ? 1 : ss(F0 + 6 + 1.4 * i, F0 + 8.5 + 1.4 * i, T);
  if (!mark) matrixCode(x, T, F0);
  isoGrid(x, toS, mark ? 1 : ss(F0, F0 + 7, T), 0.12, tF(0) > 0.5);
  rings(x, toS, T);
  // the signal: one point of light, held in two breathing diamonds that echo the plinth's tiers
  const p0 = ss(0.3, 2, T) * (1 - ss(F0 + 1, F0 + 3.5, T)), pd = ss(5, 7, T) * (1 - ss(F0 + 1, F0 + 3.5, T));
  if (p0 > 0) { const o = toS(0, 0, 0); x.save();
    if (pd > 0) { x.globalAlpha = pd; [[4, 0], [8, 1]].forEach(([r, k]) => { const br = r * (1 + 0.06 * Math.sin(T * 2.2 - k)); x.strokeStyle = 'rgba(' + MR + ',' + (k ? 0.28 : 0.55) + ')'; x.lineWidth = 1; x.beginPath(); [[br, -br], [br, br], [-br, br], [-br, -br]].forEach((q0, n) => { const q = toS(q0[0], q0[1], 0); n ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]); }); x.closePath(); x.stroke(); });
      x.font = "500 14px 'Satoshi', sans-serif"; x.letterSpacing = '5px'; x.textAlign = 'center'; x.fillStyle = 'rgba(' + MR + ',.75)'; x.fillText('THE SIGNAL', o[0] + 2.5, o[1] + 8 * cm.s + 44); }
    x.globalAlpha = p0; x.globalCompositeOperation = 'lighter'; const br = 0.8 + 0.2 * Math.sin(T * 2.2); glow(x, o[0], o[1], 120 * br, 0.4); glow(x, o[0], o[1], 26, 0.9); x.fillStyle = '#FFFFFF'; x.fillRect(o[0] - 2, o[1] - 2, 4, 4);
    x.restore(); }
  const lp = mark ? 1 : ss(F0 + 9, F0 + 10.5, T);
  const lamp = ([X, Y]) => { box(x, toS, X, Y, 6, 2.2, 2.2, 2.2 * eOut(lp), lp, 0.5, LANTERN); const q = toS(X, Y, 8.2); x.save(); x.globalCompositeOperation = 'lighter'; glow(x, q[0], q[1], 7 * cm.s, 0.3 * lp); x.restore(); };
  TIERS.forEach(([h, z, d], i) => { const p = tP(i); if (p > 0) box(x, toS, 0, 0, z, h, h, d * eOut(p), tF(i), 0.28 + 0.45 * p * (1 - tF(i))); if (i === 0 && lp > 0) box(x, toS, -44, -44, 6, 2.2, 2.2, 2.2 * eOut(lp), lp, 0.5, LANTERN); });
  if (lp > 0) LAMPS.slice(1).forEach(([X, Y]) => { box(x, toS, X, Y, 6, 2.2, 2.2, 2.2 * eOut(lp), lp, 0.5, LANTERN); const q = toS(X, Y, 8.2); x.save(); x.globalCompositeOperation = 'lighter'; glow(x, q[0], q[1], 7 * cm.s, 0.3 * lp); x.restore(); });
  const g = k => mark ? 1 : ss(P + 0.2 + k * 0.55, P + 1.9 + k * 0.55, T), g1 = g(0);
  if (g1 > 0) box(x, toS, -9.5, 0, 18, 1.7, 1.7, 32 * eOut(g1), g1, 0.35);
  const dive = T < C.Through ? clamp((T - (P + 9)) / 3) : 0;
  doorPortal(x, cm, T, mark ? { line: 1, open: 1, fill: 1 } : { line: ss(P + 0.3, P + 2.4, T), open: ss(P + 2.4, P + 4.6, T), fill: ss(P + 4.6, P + 6.4, T) });
  if (g1 > 0) box(x, toS, 9.5, 0, 18, 1.7, 1.7, 32 * eOut(g1), g1, 0.35);
  [[0, 42, 13.5, 1.275, 2.6], [0, 44.6, 1.2, 1.19, 5.4], [0, 50, 15.5, 1.955, 2.4], [0, 52.4, 17, 2.38, 1.8]].forEach(([cx, z, hx, hy, h], i) => { const b = g(i + 1); if (b > 0) box(x, toS, cx, 0, z + 8 * (1 - eOut(b)), hx, hy, h, b, 0.35 * b); });
  if (!mark) { const la = ss(F0 + 6.5, F0 + 8, T) * (1 - ss(P + 7, P + 8.5, T));
    label(x, toS(50, -50, 3), 'TIER I · STILLNESS — QUIET THE MIND', la * tP(0), 64); label(x, toS(38, -38, 9), 'TIER II · SOVEREIGNTY — REGAIN YOUR FOCUS', la * tP(1), 64 + 12 * 6.6 * 0.866 * 1.2); label(x, toS(26, -26, 15), 'TIER III · PURPOSE — START YOUR MISSION', la * tP(2), 64 + 24 * 6.6 * 0.866 * 1.2);
    label(x, toS(-7.8, 0, 42), 'THE PORTAL · YOUR WAY OUT OF THE MATRIX', ss(P + 5, P + 6, T) * (1 - ss(P + 8.5, P + 9.2, T)), -70); }
  if (lp > 0) { const q = toS(-44, -44, 8.2); x.save(); x.globalCompositeOperation = 'lighter'; glow(x, q[0], q[1], 7 * cm.s, 0.3 * lp); x.restore(); }
  motes(x, toS, T, mark ? 0.9 : ss(P + 5, P + 7, T) * (1 - dive));
  if (T < C.Through) { const w = ss(C.Through - 0.8, C.Through, T); if (w > 0) { x.globalAlpha = w; x.fillStyle = WHITE; x.fillRect(0, 0, W, H); x.globalAlpha = 1; } }
  else { const f = 1 - ss(M, M + 1.6, T); if (f > 0) { x.globalAlpha = f; x.fillStyle = WHITE; x.fillRect(0, 0, W, H); x.globalAlpha = 1; } }
}
/* ---------- 3–4 · THROUGH · STILL: inside the portal. Its field becomes the world: a bloom of light, a double helix of energy
   streaming past, pixel dust in depth, shockwaves on every bowl strike, a star at the heart. Then it all settles. ---------- */
const BLOOM = {}, WAVES = [32, 36, 40, 44];
function rushField(x, T, C) {
  const lt = T - C.Through, dur = C.Still + 2 - C.Through, u = clamp(lt / dur), calm = ss(C.Still - 1, C.Still + 3, T), rush = 1 - calm;
  const surge = ss(0, 3, lt) * (0.75 + 0.25 * Math.sin(lt * 0.9)) * rush + 0.35 * calm, CY = 540;
  const ph = 70 * (1 - Math.pow(1 - u, 2.4)) + T * 1.1, img = fieldImage(WORLDF, 400, 225, { t: T, ph, k: 9 - 3 * calm, spread: 0.55 - 0.38 * calm, rot: Math.PI / 2, spin: 1.6 * rush + 0.4, base: 0.08 - 0.03 * calm, zoom: 0.75 + 0.5 * u, fall: 1.1, core: 0.55 - 0.15 * calm, warp: 0.45 * rush + 0.1, rip: 0.05 + 0.03 * calm, swirl: 1.2 });
  x.imageSmoothingEnabled = true; x.drawImage(img, 0, 0, W, H);
  // bloom: the field downsampled twice and laid back over itself in light
  if (!BLOOM.a) { BLOOM.a = document.createElement('canvas'); BLOOM.a.width = 120; BLOOM.a.height = 68; BLOOM.b = document.createElement('canvas'); BLOOM.b.width = 40; BLOOM.b.height = 23; }
  const ba = BLOOM.a.getContext('2d'), bb = BLOOM.b.getContext('2d'); ba.drawImage(img, 0, 0, 120, 68); bb.drawImage(BLOOM.a, 0, 0, 40, 23);
  x.save(); x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.12 + 0.08 * surge; x.drawImage(BLOOM.a, 0, 0, W, H); x.globalAlpha = 0.16 + 0.1 * surge; x.drawImage(BLOOM.b, 0, 0, W, H); x.restore();
  x.save(); x.globalCompositeOperation = 'lighter'; x.lineCap = 'round';
  // shockwaves on the bowl strikes
  for (const t0 of WAVES) { const a = T - t0; if (a < 0 || a > 2.8) continue; const r = 60 + Math.pow(a / 2.8, 0.7) * 1300, o = Math.pow(1 - a / 2.8, 2);
    x.strokeStyle = 'rgba(250,250,250,' + (0.55 * o) + ')'; x.lineWidth = 2 + 6 * o; x.beginPath(); x.ellipse(CX, CY, r, r * 0.62, 0, 0, 7); x.stroke();
    x.strokeStyle = 'rgba(' + MR + ',' + (0.25 * o) + ')'; x.lineWidth = 18 * o + 2; x.beginPath(); x.ellipse(CX, CY, r * 0.97, r * 0.6, 0, 0, 7); x.stroke(); }
  // the double helix: filaments of energy spiralling outward past you, two families turning against each other
  const NF = 72; for (let i = 0; i < NF; i++) { const dir = i % 2 ? 1 : -1, th0 = (i / NF) * 6.283 + hash(i, 1) * 0.4, sp = 0.16 + 0.14 * hash(i, 2), p0 = (lt * sp * (0.6 + 1.6 * rush) + hash(i, 3)) % 1, tw = 1.15 * dir;
    const al = (0.35 + 0.5 * hash(i, 4)) * (0.25 + 0.75 * rush) * surge; if (al < 0.02) continue;
    x.beginPath(); let first = true;
    for (let k = 0; k <= 12; k++) { const pp = p0 - 0.14 + k * 0.14 / 12; if (pp <= 0) continue; const r = 36 * Math.exp(pp * 3.5), th = th0 + tw * Math.log(r / 36) * 0.55 + T * 0.12 * dir, X = CX + Math.cos(th) * r, Y = CY + Math.sin(th) * r * 0.7; first ? x.moveTo(X, Y) : x.lineTo(X, Y); first = false; }
    x.strokeStyle = (i % 3 ? 'rgba(250,250,250,' : 'rgba(' + MR + ',') + (al * Math.sin(p0 * Math.PI)) + ')'; x.lineWidth = 0.6 + p0 * 2.6; x.stroke(); }
  // pixel dust in depth, flying outward
  for (let i = 0; i < 260; i++) { const a = hash(i, 11) * 6.283, rb = 0.15 + hash(i, 12) * 0.85, z = 1 - ((lt * (0.12 + 0.3 * rush) * (0.5 + hash(i, 13)) + hash(i, 14)) % 1) * 0.96, r = rb * 260 / z;
    const X = CX + Math.cos(a) * r, Y = CY + Math.sin(a) * r * 0.7; if (X < -10 || X > W + 10 || Y < -10 || Y > H + 10) continue; const sz = 1 + 2.6 * (1 - z), al = (1 - z) * 0.9 * (0.35 + 0.65 * rush);
    x.fillStyle = i % 4 ? 'rgba(250,250,250,' + al + ')' : 'rgba(' + MR + ',' + al + ')'; x.fillRect(X - sz / 2, Y - sz / 2, sz, sz); }
  // the star at the heart: core, rays, anamorphic streak
  const pul = 0.85 + 0.15 * Math.sin(T * 2.1); glow(x, CX, CY, 520 * pul, 0.06 + 0.06 * surge); glow(x, CX, CY, 120 * pul, 0.22); glow(x, CX, CY, 18, 0.95, '255,255,255');
  const ray = (len, wdt, rot, a) => { x.save(); x.translate(CX, CY); x.rotate(rot); const g = x.createLinearGradient(-len, 0, len, 0); g.addColorStop(0, 'rgba(250,250,250,0)'); g.addColorStop(0.5, 'rgba(255,255,255,' + a + ')'); g.addColorStop(1, 'rgba(250,250,250,0)'); x.fillStyle = g; x.fillRect(-len, -wdt / 2, len * 2, wdt); x.restore(); };
  ray(900 * pul, 3, 0, 0.55); ray(900 * pul, 26, 0, 0.08); ray(330 * pul, 2, Math.PI / 2, 0.4); ray(220 * pul, 1.5, Math.PI / 4 + T * 0.05, 0.22); ray(220 * pul, 1.5, -Math.PI / 4 + T * 0.05, 0.22);
  x.restore();
  const g = x.createRadialGradient(CX, CY, 340, CX, CY, 1150); g.addColorStop(0, 'rgba(13,14,16,0)'); g.addColorStop(1, 'rgba(13,14,16,.82)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  if (calm > 0) { const sh = x.createLinearGradient(0, 740, 0, H); sh.addColorStop(0, 'rgba(13,14,16,0)'); sh.addColorStop(0.35, 'rgba(13,14,16,' + (0.85 * calm) + ')'); sh.addColorStop(1, 'rgba(13,14,16,' + (0.95 * calm) + ')'); x.fillStyle = sh; x.fillRect(0, 740, W, H - 740); }
  const f = 1 - ss(0, 1.2, lt); if (f > 0) { x.globalAlpha = f; x.fillStyle = WHITE; x.fillRect(0, 0, W, H); x.globalAlpha = 1; }
}
/* ---------- the still: you come out of the portal into open space — nebula, stars, stardust, the light at the centre ---------- */
const vn1 = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i, 7) * (1 - u) + hash(i + 1, 7) * u; };
const fbm1 = (x, s) => { let a = 0.5, v = 0, f = 1; for (let o = 0; o < 5; o++) { v += a * vn1(x * f + s * 17.3 + o * 31.7); a *= 0.5; f *= 2.03; } return v; };
const vn2 = (x, y) => { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash(i + j * 157, 3), b = hash(i + 1 + j * 157, 3), c = hash(i + (j + 1) * 157, 3), d = hash(i + 1 + (j + 1) * 157, 3); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
const HY = 600;
const STARS = Array.from({ length: 560 }, (_, i) => [hash(i, 201) * W, Math.pow(hash(i, 202), 1.25) * (HY - 40), 0.6 + 1.7 * Math.pow(hash(i, 203), 3), hash(i, 204)]);
const DUST = Array.from({ length: 1500 }, (_, i) => { const t = hash(i, 211), off = (hash(i, 212) + hash(i, 213) + hash(i, 214) - 1.5) * 120; return [t * W * 1.2 - W * 0.1 + off * 0.45, 40 + t * 340 + off, hash(i, 215)]; });
const CLOUD = {};
function cloudSea(T, gain) {
  const w = 256, h = 84; if (!CLOUD.c) { CLOUD.c = document.createElement('canvas'); CLOUD.c.width = w; CLOUD.c.height = h; CLOUD.x = CLOUD.c.getContext('2d'); CLOUD.img = CLOUD.x.createImageData(w, h); }
  const d = CLOUD.img.data; let o = 0;
  for (let j = 0; j < h; j++) { const v = (j + 0.5) / h, z = 1 / (v * 1.5 + 0.04), haze = Math.exp(-v * 6);
    for (let i = 0; i < w; i++) { const u = (i + 0.5) / w - 0.5, X = u * z * 2.2, Z = z * 0.8 + T * 0.12;
      const n = 0.5 * vn2(X, Z) + 0.25 * vn2(X * 2.1 + 5.2, Z * 2.1 + 1.3) + 0.125 * vn2(X * 4.3 + 9.1, Z * 4.3 + 7.7) + 0.0625 * vn2(X * 8.7 + 3.3, Z * 8.7 + 2.9);
      const cl = ss(0.32, 0.78, n), lit = Math.exp(-u * u / (0.012 + v * 0.06)), path = Math.exp(-u * u / (0.00025 + v * v * 0.02));
      const b = gain * ((0.05 + 0.2 * cl) * (0.5 + 0.5 * (1 - v)) + 0.55 * cl * lit * (1 - 0.5 * v) + 0.42 * path * (0.35 + 0.65 * cl) * (1 - 0.4 * v) + 0.45 * haze * (0.4 + 0.6 * Math.exp(-u * u / 0.04)));
      const q = Math.min(255, (b / 1.6 * 255) | 0) * 3; d[o] = LUT[q]; d[o + 1] = LUT[q + 1]; d[o + 2] = LUT[q + 2]; d[o + 3] = 255; o += 4; } }
  CLOUD.x.putImageData(CLOUD.img, 0, 0); return CLOUD.c;
}
function rimStroke(x, pts, lx, a, lw = 1.4) {
  const g = x.createLinearGradient(lx - 900, 0, lx + 900, 0); g.addColorStop(0, 'rgba(' + MR + ',' + a * 0.15 + ')'); g.addColorStop(0.5, 'rgba(255,255,255,' + a + ')'); g.addColorStop(1, 'rgba(' + MR + ',' + a * 0.15 + ')');
  x.save(); x.globalCompositeOperation = 'lighter'; x.strokeStyle = g; x.lineJoin = 'round'; x.lineWidth = lw; x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke();
  x.globalAlpha = 0.25; x.lineWidth = lw * 6; x.stroke(); x.restore();
}
function fillBelow(x, pts, top, bot, c0, c1) {
  const g = x.createLinearGradient(0, top, 0, bot); g.addColorStop(0, c0); g.addColorStop(1, c1); x.fillStyle = g;
  x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.lineTo(pts[pts.length - 1][0], H + 40); x.lineTo(pts[0][0], H + 40); x.closePath(); x.fill();
}
const NEB = {}, fb2 = (x, y) => 0.5 * vn2(x, y) + 0.25 * vn2(x * 2.07 + 5.2, y * 2.07 + 1.3) + 0.125 * vn2(x * 4.1 + 9.1, y * 4.1 + 7.7) + 0.0625 * vn2(x * 8.3 + 3.3, y * 8.3 + 2.9);
const SKY = Array.from({ length: 1100 }, (_, i) => [hash(i, 501) * W, hash(i, 502) * H, 0.5 + 1.9 * Math.pow(hash(i, 503), 4), hash(i, 504), hash(i, 505)]);
const BAND = Array.from({ length: 2600 }, (_, i) => { const t = hash(i, 511), off = (hash(i, 512) + hash(i, 513) + hash(i, 514) - 1.5) * 170; return [-100 + t * (W + 200), H * 0.92 - t * H * 0.84 + off, hash(i, 515)]; });
const MOTE = Array.from({ length: 240 }, (_, i) => [hash(i, 521), hash(i, 522), hash(i, 523), hash(i, 524)]);
const TINT = ['255,255,255', '250,250,250', MR, '240,242,225', MR];
function nebula(T, gain) {
  const w = 240, h = 135; if (!NEB.c) { NEB.c = document.createElement('canvas'); NEB.c.width = w; NEB.c.height = h; NEB.x = NEB.c.getContext('2d'); NEB.img = NEB.x.createImageData(w, h); }
  const d = NEB.img.data, tt = T * 0.018; let o = 0;
  for (let j = 0; j < h; j++) { const v = j / h;
    for (let i = 0; i < w; i++) { const u = i / w, bd = (v - (0.92 - u * 0.84)) * 0.9, band = Math.exp(-bd * bd / 0.035);
      const n1 = fb2(u * 3.2 + tt, v * 3.2), n2 = fb2(u * 2.4 + 7 - tt * 0.7, v * 2.4 + 3), n3 = fb2(u * 6 + 2, v * 6 + 11 + tt);
      const lane = 1 - 0.75 * ss(0.5, 0.72, n3) * band, cr = (u - 0.5) * (u - 0.5) * 3.2 + (v - 0.44) * (v - 0.44) * 5, core = Math.exp(-cr / 0.05);
      const vi = ss(0.42, 0.82, n1) * (0.25 + band), te = ss(0.48, 0.86, n2) * (0.2 + 0.8 * band), mg = ss(0.55, 0.85, n1 * 0.6 + n2 * 0.5) * band;
      let r = (110 * vi + 30 * te + 210 * mg) * lane + 255 * core * 0.55, g = (50 * vi + 130 * te + 70 * mg) * lane + 200 * core * 0.5, bl = (190 * vi + 210 * te + 160 * mg) * lane + 170 * core * 0.45;
      r = 6 + r * gain * 0.62; g = 8 + g * gain * 0.62; bl = 20 + bl * gain * 0.62;
      d[o] = r > 255 ? 255 : r; d[o + 1] = g > 255 ? 255 : g; d[o + 2] = bl > 255 ? 255 : bl; d[o + 3] = 255; o += 4; } }
  NEB.x.putImageData(NEB.img, 0, 0); return NEB.c;
}
/* ---------- the fabric of consciousness: a woven field of light threads, gathered into one point; thoughts run along the weave toward the source, diamonds of resonance ripple outward ---------- */
function fabPt(wx, zw, T) { const dz = zw - 7, X = wx * (1 - 0.62 * Math.exp(-dz * dz / 6) * Math.exp(-wx * wx / 50));
  const y = 2.5 * Math.exp(-(X * X + dz * dz) / 2.2) + 0.22 * Math.sin(wx * 0.8 + T * 0.7) * Math.cos(zw * 0.45 - T * 0.5) + 0.12 * Math.sin(zw * 1.1 - T * 1.1 + wx * 0.3);
  return [CX + X / zw * 700, HY + (1.2 - y) / zw * 700, Math.exp(-(X * X + dz * dz) / 3)]; }
const FCOL = t => { const S = [[255, 248, 225], [120, 225, 235], [140, 110, 255], [225, 110, 200]], f = clamp(t) * 3, i = Math.min(2, Math.floor(f)), k = f - i, a = S[i], b = S[i + 1]; return ((a[0] + (b[0] - a[0]) * k) | 0) + ',' + ((a[1] + (b[1] - a[1]) * k) | 0) + ',' + ((a[2] + (b[2] - a[2]) * k) | 0); };
const ZW = k => 0.8 * Math.pow(20, k / 89);
function fabric(x, T, lt) {
  const fi = ss(0.3, 3.2, lt); if (fi <= 0) return; x.save(); x.globalCompositeOperation = 'lighter'; x.lineJoin = 'round';
  const dep = zw => (1 - ss(7, 16, zw)) * ss(0.8, 1.6, zw);
  for (let i = -40; i <= 40; i++) { const wx = i * 0.35, col = FCOL(Math.abs(wx) / 14); x.lineWidth = i % 5 === 0 ? 1.4 : 0.9;
    for (let c = 0; c < 9; c++) { let P = null, pk = 0; x.beginPath(); for (let k = c * 10; k <= c * 10 + 10 && k < 90; k++) { P = fabPt(wx, ZW(k), T); pk = Math.max(pk, P[2]); k === c * 10 ? x.moveTo(P[0], P[1]) : x.lineTo(P[0], P[1]); }
      const a = fi * dep(ZW(c * 10 + 5)) * (i % 5 === 0 ? 0.42 : 0.24) * (1 + 1.6 * pk); if (a < 0.01) continue; x.strokeStyle = 'rgba(' + col + ',' + Math.min(1, a) + ')'; x.stroke(); } }
  for (let j = 0; j < 46; j++) { const zw = 0.9 * Math.pow(18, j / 45), a0 = fi * dep(zw) * (j % 5 === 0 ? 0.36 : 0.2); if (a0 < 0.01) continue;
    const g = x.createLinearGradient(0, 0, W, 0); [0, 0.25, 0.5, 0.75, 1].forEach(t => g.addColorStop(t, 'rgba(' + FCOL(Math.abs(t - 0.5) * 2) + ',' + Math.min(1, a0 * (1 + 1.4 * Math.exp(-Math.pow((t - 0.5) / 0.12, 2)) * Math.exp(-Math.pow(zw - 7, 2) / 6))) + ')'));
    x.strokeStyle = g; x.lineWidth = j % 5 === 0 ? 1.3 : 0.8; x.beginPath(); for (let wx = -14; wx <= 14.01; wx += 0.25) { const P = fabPt(wx, zw, T); wx === -14 ? x.moveTo(P[0], P[1]) : x.lineTo(P[0], P[1]); } x.stroke(); }
  // knots in the weave, flickering awake
  for (let i = -40; i <= 40; i += 1) for (let j = 4; j < 40; j += 1) { const h = hash(i * 61 + j, 541); if (h < 0.965) continue; const zw = 0.9 * Math.pow(18, j / 45), P = fabPt(i * 0.35, zw, T), a = fi * dep(zw) * Math.pow(0.5 + 0.5 * Math.sin(T * (1.2 + 2 * hash(i, j)) + h * 40), 3);
    if (a < 0.03) continue; const sz = 2.4 * Math.min(2.2, 4 / zw + 0.6); x.fillStyle = 'rgba(255,255,255,' + a + ')'; x.fillRect(P[0] - sz / 2, P[1] - sz / 2, sz, sz); glow(x, P[0], P[1], sz * 7, 0.35 * a, FCOL(Math.abs(i) / 40)); }
  // thoughts: pulses of light running along the threads into the source
  for (let n = 0; n < 64; n++) { const i = Math.round((hash(n, 551) - 0.5) * 70), per = 3 + 3 * hash(n, 552), u = ((lt + hash(n, 553) * per) % per) / per, k = 8 + u * 56, wx = i * 0.35;
    const zw = ZW(k), P = fabPt(wx, zw, T), Q = fabPt(wx, ZW(k - 4), T), a = fi * Math.sin(u * Math.PI) * dep(zw), col = FCOL(Math.abs(wx) / 14); if (a < 0.02) continue;
    const g = x.createLinearGradient(P[0], P[1], Q[0], Q[1]); g.addColorStop(0, 'rgba(255,255,255,' + a + ')'); g.addColorStop(1, 'rgba(' + col + ',0)'); x.strokeStyle = g; x.lineWidth = 2; seg(x, P, Q); glow(x, P[0], P[1], 16, 0.5 * a, col); }
  // resonance: diamonds widening across the weave from the source
  for (let r = 0; r < 4; r++) { const R = (lt * 1.1 + r * 2.6) % 10.4, a = fi * Math.pow(1 - R / 10.4, 1.4) * ss(0, 0.8, R) * 0.7; if (a < 0.01) continue; x.strokeStyle = 'rgba(' + MR + ',' + a + ')'; x.lineWidth = 1.6; x.beginPath(); let st = true;
    for (let q = 0; q <= 160; q++) { const an = q / 160 * Math.PI * 2, c = Math.cos(an), sn = Math.sin(an), m = Math.abs(c) + Math.abs(sn), wx = R * c / m * 1.4, zw = 7 + R * sn / m; if (zw < 1) { st = true; continue; } const P = fabPt(wx, zw, T); st ? x.moveTo(P[0], P[1]) : x.lineTo(P[0], P[1]); st = false; } x.stroke(); }
  x.restore();
}
/* ---------- the fabric of consciousness: every thread a circle, every circle linked through every other (a Hopf weave) — light flows along each fiber into the still point at its heart ---------- */
const HPAL = ['255,248,225', '120,225,235', '120,150,255', '160,110,255', '225,110,200', '255,190,130'];
function hopf(x, T, lt) {
  const fi = ss(0.2, 3.4, lt); if (fi <= 0) return; const ry = T * 0.09, tl = 0.46 + 0.08 * Math.sin(T * 0.2), cy = Math.cos(ry), sy = Math.sin(ry), ct = Math.cos(tl), st = Math.sin(tl), flow = T * 0.32, oy = 470;
  x.save(); x.globalCompositeOperation = 'lighter'; const NL = 7, NM = 22, NK = 84;
  for (let L = 0; L < NL; L++) { const c = clamp(-0.5 + L * 0.23 + 0.04 * Math.sin(T * 0.4 + L * 1.3), -0.9, 0.98), al = Math.sqrt((1 + c) / 2), be = Math.sqrt((1 - c) / 2);
    for (let m = 0; m < NM; m++) { const phi = m / NM * Math.PI * 2 + L * 0.3, col = HPAL[(m + L * 2) % HPAL.length]; x.fillStyle = 'rgba(' + col + ',1)';
      for (let k = 0; k < NK; k++) { const t = k / NK * Math.PI * 2 + flow, x3 = be * Math.sin(t + phi), d = 1 - x3; if (d < 0.04) continue;
        const X = al * Math.cos(t) / d, Y = al * Math.sin(t) / d, Z = be * Math.cos(t + phi) / d, r2 = X * X + Y * Y + Z * Z, fade = 1 - ss(4, 9, r2); if (fade <= 0) continue;
        const X1 = cy * X + sy * Z, Z1 = -sy * X + cy * Z, Y1 = ct * Y - st * Z1, Z2 = st * Y + ct * Z1, kk = 1050 / (7 - Z2), px = CX + X1 * kk, py = oy + Y1 * kk, dp = clamp((Z2 + 3) / 6);
        let ph = (k / NK + m * 0.137 + L * 0.31 - lt * 0.22) % 1; if (ph < 0) ph += 1; const pu = Math.exp(-ph * ph / 0.0009);
        const a = fi * fade * (0.22 + 0.6 * dp) * (0.75 + 0.25 * Math.sin(T * 1.4 + k * 0.3 + m)) + fi * fade * pu, sz = 1 + 1.8 * dp + 1.6 * pu; if (a < 0.02) continue;
        x.globalAlpha = Math.min(1, a); x.fillRect(px - sz / 2, py - sz / 2, sz, sz); if (pu > 0.5) { x.globalAlpha = 1; glow(x, px, py, 14 + 10 * dp, 0.45 * fi * fade * pu, col); x.fillStyle = 'rgba(' + col + ',1)'; } } } }
  x.restore();
}
/* ---------- the code, transformed: outside the Matrix its code is still there, but ordered — two infinite planes of our glyphs meeting at the light; streams run home into it, diamond waves pass through the grid ---------- */
function codeHallTrailer(x, T, lt) {
  const fi = ss(0.2, 3, lt); if (fi <= 0) return; const at = atlas(), NG = GLY.length, cell = 0.3, f = 900, oy = 470, sp = 0.55, sh = lt * sp / cell, base = Math.floor(sh), fr = sh - base;
  x.save(); x.globalCompositeOperation = 'lighter'; x.imageSmoothingEnabled = false;
  for (const sg of [1, -1]) {
    x.strokeStyle = 'rgba(' + MR + ',' + 0.07 * fi + ')'; x.lineWidth = 1;
    for (let i = -60; i <= 60; i += 4) { const X = (i - 0.5) * cell; seg(x, [CX + X * f / 0.9, oy + sg * f / 0.9], [CX, oy]); }
    for (let j = 0; j < 80; j += 4) { const z = 0.9 + (j + fr - (base % 4) - 0.5) * cell; if (z < 0.9) continue; const y = oy + sg * f / z; x.globalAlpha = 1 - ss(8, 22, z); seg(x, [0, y], [W, y]); } x.globalAlpha = 1;
    for (let j = 0; j < 62; j++) { const z = 1.2 + (j + fr) * cell, jj = j - base, kk = f / z, py = oy + sg * kk, gs = cell * kk * 0.62, df = fi * (1 - ss(9, 21, z)) * Math.pow(ss(1.2, 3.6, z), 1.6); if (df < 0.02) continue;
      const half = Math.ceil((CX / kk + cell) / cell);
      for (let i = -half; i <= half; i++) { const X = i * cell, px = CX + X * kk, hv = hash(i * 173 + jj * 7 + (sg > 0 ? 0 : 999), 9); if (hv < 0.3) continue;
        const dd = Math.abs(X) + Math.abs(z - 7), wv = Math.pow(0.5 + 0.5 * Math.cos(dd * 1.1 - lt * 2.1), 8);
        let st = 0; if (hash(i, sg > 0 ? 5 : 6) > 0.72) { const zh = (lt * 2.4 * (0.6 + hash(i, 8)) + hash(i, 4) * 30) % 22, dz = z - zh; st = dz < 0 ? Math.exp(dz / 1.6) : Math.exp(-dz / 0.25); }
        const b = df * Math.min(1, 0.1 + 0.25 * hv + 0.6 * wv + 0.95 * st); if (b < 0.03) continue;
        if (gs < 3) { x.fillStyle = 'rgba(' + MR + ',' + b + ')'; x.fillRect(px - 0.8, py - 0.8, 1.6, 1.6); continue; }
        const gi = (Math.floor(hv * 97) + (hv > 0.8 ? Math.floor(T * (1 + 3 * hv)) : 0)) % NG, hi = st > 0.45 || wv > 0.6;
        x.globalAlpha = b; x.drawImage(at, gi * 20, hi ? 0 : 20, 20, 20, px - gs / 2, py - gs / 2, gs, gs); x.globalAlpha = 1;
        if (st > 0.8 && gs > 5) glow(x, px, py, gs * 2.4, 0.35 * b, '255,255,255'); } } }
  x.restore();
}
/* the thumbnail kit sets window.__SOPHIA_CLEAN: an even, straight grid with no overlaps, and only the centre light */
const CLEAN = !!window.__SOPHIA_CLEAN;
function codeHall(x, T, lt) {
  if (!CLEAN) return codeHallTrailer(x, T, lt);
  const fi = ss(0.2, 3, lt); if (fi <= 0) return; const at = atlas(), NG = GLY.length, cell = 0.12, f = 900, oy = 470, K = 0.12, z0 = 1.2;
  // rows step geometrically in depth, so the gap between rows on screen always stays wider than the glyphs: no overlaps
  const rs = lt * 1.1, base = Math.floor(rs), fr = rs - base, zAt = n => z0 * Math.pow(1 + K, n + fr);
  x.save(); x.globalCompositeOperation = 'lighter'; x.imageSmoothingEnabled = false;
  for (const sg of [1, -1]) {
    const near = z => ss(1.2, 2.2, z);   // both planes reach the frame edges, so the corners stay filled
    x.strokeStyle = 'rgba(' + MR + ',' + 0.06 * fi + ')'; x.lineWidth = 1;
    for (let i = -120; i <= 120; i += 8) { const X = (i - 0.5) * cell; x.globalAlpha = 1; seg(x, [CX + X * f / 1.2, oy + sg * f / 1.2], [CX, oy]); }
    for (let n = 0; n < 40; n += 4) { const z = z0 * Math.pow(1 + K, n + fr - (base % 4) - 0.5); if (z < 1.2) continue; const y = oy + sg * f / z; x.globalAlpha = (1 - ss(6, 12, z)) * near(z); seg(x, [0, y], [W, y]); } x.globalAlpha = 1;
    for (let n = 0; n < 40; n++) { const z = zAt(n), jj = n - base, kk = f / z, py = Math.round(oy + sg * kk), gs = Math.round(Math.min(cell * kk * 0.5, kk * K / (1 + K) * 0.6));
      if (gs < 5) break; const df = fi * (1 - ss(6, 11, z)) * near(z); if (df < 0.02) continue; const half = Math.ceil((CX * 1.4 / kk + cell) / cell);
      for (let i = -half; i <= half; i++) { const X = i * cell, px = CX + X * kk, hv = hash(i * 173 + jj * 7 + (sg > 0 ? 0 : 999), 9); if (hv < 0.06) continue;
        const dd = Math.abs(X) * 2.5 + Math.abs(z - 5), wv = Math.pow(0.5 + 0.5 * Math.cos(dd * 1.1 - lt * 2.1), 8);
        let st = 0; if (hash(i, sg > 0 ? 5 : 6) > 0.8) { const zh = (lt * 2 * (0.6 + hash(i, 8)) + hash(i, 4) * 30) % 12, dz = z - zh; st = dz < 0 ? Math.exp(dz / 1.4) : Math.exp(-dz / 0.25); }
        const bv = df * Math.min(1, 0.38 + 0.22 * hv + 0.2 * Math.min(1, Math.abs(px - CX) / CX) + 0.5 * wv + 0.95 * st); if (bv < 0.03) continue;
        const gi = (Math.floor(hv * 97) + (hv > 0.8 ? Math.floor(T * (1 + 3 * hv)) : 0)) % NG, hi = st > 0.45 || wv > 0.6;
        x.globalCompositeOperation = 'source-over'; x.globalAlpha = Math.min(1, bv * 1.4) * 0.7; x.fillStyle = '#000'; x.fillRect(Math.round(px - gs * 0.6), py - Math.round(gs * 0.6), Math.round(gs * 1.2), Math.round(gs * 1.2)); x.globalCompositeOperation = 'lighter';
        x.globalAlpha = bv; x.drawImage(at, gi * 20, hi ? 0 : 20, 20, 20, Math.round(px - gs / 2), py - Math.round(gs / 2), gs, gs); x.globalAlpha = 1; } } }
  x.restore();
}
function vista(x, T, C, cut) {
  const lt = T - cut, ex = 1 + 0.6 * (1 - ss(0, 2.4, lt)), zm = 1.06 + 0.07 * ss(0, C.Mark - cut, lt), ly = 470, rise = ss(0.4, 4, lt);
  x.fillStyle = '#000'; x.fillRect(0, 0, W, H);
  x.save(); x.translate(CX, ly); x.scale(zm, zm); x.translate(-CX, -ly);
  x.save(); x.globalCompositeOperation = 'lighter';
  if (0) BAND.forEach(([X, Y, h], i) => { const a = (0.1 + 0.4 * h) * (0.75 + 0.25 * Math.sin(T * (0.8 + h) + i)); x.fillStyle = 'rgba(' + TINT[i % 5] + ',' + a + ')'; x.fillRect(X, Y, 1.3, 1.3); });
  SKY.forEach(([X, Y, sz, h, c], i) => { const a = 0.5 * (0.35 + 0.65 * h) * (0.6 + 0.4 * Math.sin(T * (0.7 + 2.2 * h) + i * 1.3)); x.fillStyle = 'rgba(' + TINT[(c * 5) | 0] + ',' + a + ')'; x.fillRect(X - sz / 2, Y - sz / 2, sz, sz);
    if (!CLEAN && sz > 1.8) { glow(x, X, Y, 6 + sz * 4, 0.3 * a, TINT[(c * 5) | 0]); if (sz > 2.15) { x.globalAlpha = a * 0.55; x.fillRect(X - sz * 6, Y - 0.4, sz * 12, 0.8); x.fillRect(X - 0.4, Y - sz * 6, 0.8, sz * 12); x.globalAlpha = 1; } } });
  x.restore(); if (!CLEAN) codeHall(x, T, lt); x.save(); x.globalCompositeOperation = 'lighter';
  // the light: a star at the centre of everything, with soft rays
  const br = 1 + 0.05 * Math.sin(T * 1.3), rg = x.createRadialGradient(CX, ly, 0, CX, ly, 1400); rg.addColorStop(0, 'rgba(255,255,255,.45)'); rg.addColorStop(0.3, 'rgba(' + MR + ',.08)'); rg.addColorStop(1, 'rgba(' + MR + ',0)'); x.fillStyle = rg;
  for (let i = 0; i < (CLEAN ? 0 : 36); i++) { const an = (i + 0.5) / 36 * Math.PI * 2 + 0.02 * Math.sin(T * 0.15 + i * 1.7) + T * 0.006, w = 0.01 + 0.026 * hash(i, 301);
    x.globalAlpha = (0.25 + 0.75 * hash(i, 302)) * (0.55 + 0.45 * Math.sin(T * 0.4 + i)) * 0.08 * rise; x.beginPath(); x.moveTo(CX, ly); x.lineTo(CX + Math.cos(an - w) * 1500, ly + Math.sin(an - w) * 1500); x.lineTo(CX + Math.cos(an + w) * 1500, ly + Math.sin(an + w) * 1500); x.closePath(); x.fill(); }
  x.globalAlpha = 1;
  glow(x, CX, ly, 520 * br, 0.12 * ex * rise); glow(x, CX, ly, 220 * br, 0.4 * rise); glow(x, CX, ly, 60, 0.95 * rise, '255,255,255');
  (CLEAN ? [[0, 420, 0.45], [Math.PI / 2, 240, 0.35]] : [[0, 900, 0.55], [Math.PI / 2, 520, 0.45], [Math.PI / 4, 200, 0.3], [-Math.PI / 4, 200, 0.3]]).forEach(([an, L, a]) => { const c = Math.cos(an), sn = Math.sin(an), g = x.createLinearGradient(CX - c * L, ly - sn * L, CX + c * L, ly + sn * L);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,250,240,' + a * rise + ')'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.strokeStyle = g; x.lineWidth = 2; seg(x, [CX - c * L, ly - sn * L], [CX + c * L, ly + sn * L]); });
  x.fillStyle = 'rgba(255,255,255,' + rise + ')'; x.beginPath(); x.arc(CX, ly, 11, 0, 7); x.fill();
  if (CLEAN) { x.restore(); codeHall(x, T, lt); x.save(); x.globalCompositeOperation = 'lighter'; }   // thumbnail: the glow and its streaks sit behind the code
  // shooting stars
  for (let k = 0; k < (CLEAN ? 0 : 2); k++) { const t0 = 3 + k * 6 + hash(k, 531) * 1.2, m = (lt - t0) / (0.7 + 0.4 * hash(k, 532)); if (m <= 0 || m >= 1) continue;
    const an = 0.35 + 0.5 * hash(k, 533), dir = hash(k, 534) > 0.5 ? 1 : -1, sx = dir > 0 ? 200 + hash(k, 535) * 900 : W - 200 - hash(k, 535) * 900, sy = 60 + hash(k, 536) * 380, L = 620;
    const hx = sx + dir * Math.cos(an) * L * m, hy = sy + Math.sin(an) * L * m, tl = 170 + 90 * hash(k, 537), g = x.createLinearGradient(hx, hy, hx - dir * Math.cos(an) * tl, hy - Math.sin(an) * tl), fa = Math.sin(m * Math.PI);
    g.addColorStop(0, 'rgba(255,255,255,' + 0.95 * fa + ')'); g.addColorStop(1, 'rgba(200,210,255,0)'); x.strokeStyle = g; x.lineWidth = 1.8; seg(x, [hx, hy], [hx - dir * Math.cos(an) * tl, hy - Math.sin(an) * tl]); glow(x, hx, hy, 14, 0.6 * fa, '255,255,255'); }
  x.restore(); x.restore();
  // stardust drifting through the frame, nearer motes larger and softer
  x.save(); x.globalCompositeOperation = 'lighter';
  if (!CLEAN) MOTE.forEach(([a, b, z, c], i) => { const depth = 0.3 + 1.7 * z, X = ((a * (W + 200) + T * (6 + 18 * depth) * (c > 0.5 ? 1 : -0.6)) % (W + 200) + W + 200) % (W + 200) - 100, Y = ((b * (H + 200) - T * (4 + 10 * depth)) % (H + 200) + H + 200) % (H + 200) - 100;
    const tw = 0.55 + 0.45 * Math.sin(T * (0.9 + c * 2) + i), al = (0.25 + 0.5 * c) * tw * ss(0, 2.5, lt), col = TINT[(i * 7) % 5];
    if (depth > 1.4) glow(x, X, Y, 6 * depth, 0.35 * al, col); else { x.fillStyle = 'rgba(' + col + ',' + al + ')'; x.fillRect(X, Y, depth * 1.6, depth * 1.6); } });
  x.restore();
  const sh = ss(C.Still - 1, C.Still + 1, T); if (sh > 0) { const g = x.createLinearGradient(0, 760, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.4, 'rgba(0,0,0,' + 0.55 * sh + ')'); g.addColorStop(1, 'rgba(0,0,0,' + 0.8 * sh + ')'); x.fillStyle = g; x.fillRect(0, 760, W, H - 760); }
}
function actThrough(x, T, C) {
  const cut = C.Through + 4.6, wh = a => { if (a > 0) { x.globalAlpha = a; x.fillStyle = WHITE; x.fillRect(0, 0, W, H); x.globalAlpha = 1; } };
  if (T < cut) { rushField(x, T, C); wh(ss(cut - 0.9, cut, T)); return; }
  vista(x, T, C, cut); wh(1 - ss(cut, cut + 1.8, T)); wh(ss(C.Mark - 1.6, C.Mark, T));
}
function drawFrame(x, T, C) {
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  if (T >= C.Through && T < C.Mark) actThrough(x, T, C); else actWorld(x, T, C);
  x.fillStyle = 'rgba(250,250,250,.016)'; for (let y = 0; y < H; y += 4) x.fillRect(0, y, W, 1);
}
function Field({ T, CUES, still }) {
  const ref = useRef(null), [url, setUrl] = useState(null);
  // draw every frame straight to the canvas; the still snapshot (for exports) is only taken once the playhead has rested, so scrubbing stays smooth
  useLayoutEffect(() => { const c = ref.current; if (!c) return; drawFrame(c.getContext('2d'), T, CUES); setUrl(null);
    if (!still) return; const id = setTimeout(() => setUrl(c.toDataURL('image/jpeg', 0.92)), 350); return () => clearTimeout(id); }, [T, still]);
  return (<>
    <canvas ref={ref} width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, width: W, height: H }} />
    {still && url && <img src={url} alt="" style={{ position: 'absolute', left: 0, top: 0, width: W, height: H }} />}
  </>);
}

/* ---------- interface layer ---------- */
const PMARK = (w, c) => <svg viewBox="0 0 6 8" width={w} height={w * 4 / 3} style={{ display: 'block' }}><path fill={c} fillRule="evenodd" d="M0 0H5V1H6V4H5V5H2V8H0Z M2 1H4V3H2Z"></path></svg>;
const SECT = [['Void', 'The Noise'], ['Field', 'The Field'], ['Portal', 'The Portal'], ['Through', 'Crossing'], ['Still', 'Stillness'], ['Mark', 'Portals']];
const fmt = s => { s = Math.max(0, Math.floor(s)); return '0' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
function Hud({ T, CUES, end }) {
  const a = ss(1.2, 3.2, T); if (a <= 0) return null; let sec = SECT[0][1]; for (const [k, l] of SECT) if (T >= CUES[k]) sec = l;
  const s = { ...mono, fontSize: 14, color: 'rgba(250,250,250,.6)' }, L = { position: 'absolute', width: 22, height: 22, borderColor: `rgba(${MR},.55)`, borderStyle: 'solid', borderWidth: 0 };
  return (<div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: a }}>
    <div style={{ ...L, left: 36, top: 36, borderLeftWidth: 1, borderTopWidth: 1 }}></div><div style={{ ...L, right: 36, top: 36, borderRightWidth: 1, borderTopWidth: 1 }}></div>
    <div style={{ ...L, left: 36, bottom: 36, borderLeftWidth: 1, borderBottomWidth: 1 }}></div><div style={{ ...L, right: 36, bottom: 36, borderRightWidth: 1, borderBottomWidth: 1 }}></div>
    <div style={{ position: 'absolute', left: 72, top: 58, display: 'flex', alignItems: 'center', gap: 16 }}>{PMARK(12, 'rgba(250,250,250,.7)')}<span style={s}>Portals · FocusField</span></div>
    <div style={{ position: 'absolute', right: 72, top: 64, width: 220, height: 1, background: 'rgba(250,250,250,.18)' }}><div style={{ width: `${clamp(T / end) * 100}%`, height: 1, background: MOON }}></div></div>
    <div style={{ position: 'absolute', left: 72, bottom: 58, ...s }}>{sec}</div>
    <div style={{ position: 'absolute', right: 72, bottom: 58, display: 'flex', alignItems: 'center', gap: 14 }}><span style={{ width: 6, height: 6, background: MOON }}></span><span style={{ ...s, color: MOON }}>The Signal</span></div>
  </div>);
}
const LINES = [
  ['Void', 1.6, 6.6, 'The Matrix Was Engineered to Make You Crave the Very Thing Keeping You Captive.', 470],
  ['Field', 1.2, 5.8, 'But Something in You Always Knew the Matrix Was Never the Whole Truth.', 150],
  ['Portal', 0.6, 3.6, 'Follow That Instinct.', 150],
  ['Portal', 4.4, 8.8, 'Beyond This Portal, the World Goes Quiet, and What Matters Becomes Clear.', 150],
  ['Through', 0.6, 5.4, 'Our Mission Is to Guide You Out of the Matrix.', 890],
  ['Through', 6.2, 11.2, 'Yours Is to Honor Your Ambitions Through the Work You Do Today.', 890],
];
function Line({ T, CUES }) {
  let cur = null; for (const [k, a, b, s, y] of LINES) { const s0 = CUES[k] + a, e0 = CUES[k] + b; if (T > s0 - 0.1 && T < e0 + 1) cur = { s0, e0, s, y }; }
  if (!cur) return null; const inn = ss(cur.s0, cur.s0 + 1.2, T), o = inn * (1 - ss(cur.e0, cur.e0 + 0.9, T)); if (o <= 0) return null;
  return (<div style={{ position: 'absolute', left: 0, right: 0, top: cur.y, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - inn) * 12}px)`, filter: `blur(${(1 - o) * 6}px)` }}>
    <div style={{ ...sans, fontSize: 56, lineHeight: 1.15, color: WHITE, textAlign: 'center', maxWidth: 1500, textWrap: 'balance', textShadow: '0 0 30px rgba(13,14,16,.9)' }}>{cur.s}</div>
  </div>);
}
const VALUES = [['I', 'Stillness', 'Quiet The Mind.'], ['II', 'Sovereignty', 'Regain Your Focus.'], ['III', 'Purpose', 'Become Who You Were Meant To Be.']];
function Values({ T, CUES }) {
  const m = CUES.Still; if (T < m + 1 || T > CUES.Mark) return null; const out = 1 - ss(CUES.Mark - 2.4, CUES.Mark - 1.4, T);
  return (<div style={{ position: 'absolute', left: 0, right: 0, top: 838, display: 'flex', justifyContent: 'center', gap: 96 }}>
    {VALUES.map(([n, h, s], i) => { const a = ss(m + 1.4 + i * 1.3, m + 2.6 + i * 1.3, T) * out; return (
      <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: 400, opacity: a, transform: `translateY(${(1 - a) * 10}px)` }}>
        <span style={{ width: 9, height: 9, border: `1px solid ${MOON}`, transform: 'rotate(45deg)' }}></span>
        <span style={{ ...sans, fontSize: 50, lineHeight: 1, color: WHITE }}>{h}</span>
        <span style={{ ...mono, fontSize: 13, letterSpacing: '0.24em', color: 'rgba(250,250,250,.72)', textAlign: 'center' }}>{s}</span>
      </div>); })}
  </div>);
}
function Lockup({ T, CUES }) {
  const m = CUES.Mark; if (T < m + 4.5) return null;
  const a = ss(m + 5, m + 6.2, T), b = ss(m + 6.4, m + 7.4, T), c = ss(m + 7.8, m + 8.8, T);
  return (<div style={{ position: 'absolute', left: 0, right: 0, top: 722, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div style={{ ...serif, fontSize: 128, lineHeight: 1, letterSpacing: '0.02em', color: WHITE, opacity: a, transform: `translateY(${(1 - a) * 14}px)` }}>Portals</div>
    <div style={{ ...mono, fontSize: 18, letterSpacing: '0.5em', color: 'rgba(250,250,250,.72)', marginTop: 22, paddingLeft: '0.5em', opacity: b }}>Your Path Out Of The Matrix.</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginTop: 50, opacity: c }}>
      {PMARK(24, WHITE)}
      <span style={{ width: 1, height: 26, background: 'rgba(250,250,250,.24)' }}></span>
      <span style={{ ...sans, fontSize: 38, color: MOON }}>Enter The Portal.</span>
      <span style={{ width: 1, height: 26, background: 'rgba(250,250,250,.24)' }}></span>
      <span style={{ ...mono, fontSize: 15, color: WHITE }}>Subscribe</span>
    </div>
  </div>);
}

/* ---------- score ---------- */
function Score({ time, playing, on, unlocked, src }) {
  const ref = useRef(null), last = useRef({ time: -1, at: 0 }), onR = useRef(on); onR.current = on;
  // one controller: the score plays only while the picture's playhead is moving, and follows it on every pause, scrub or restart
  if (time !== last.current.time) last.current = { time, at: performance.now() };
  useEffect(() => { const id = setInterval(() => {
    const v = ref.current; if (!v || !v.src) return; const L = last.current, moving = performance.now() - L.at < 450 && L.time < 63.9;
    v.muted = !onR.current || v.dataset.blocked === '1';
    if (!moving) { if (!v.paused) v.pause(); if (Math.abs(v.currentTime - L.time) > 0.05) v.currentTime = Math.min(Math.max(0, L.time), 63.9); return; }
    if (Math.abs(v.currentTime - L.time) > 0.35) v.currentTime = L.time;
    if (v.paused && !v.dataset.pending) { v.dataset.pending = '1'; v.play().then(() => { delete v.dataset.pending; }, e => { delete v.dataset.pending; if (e && e.name === 'NotAllowedError') { v.dataset.blocked = '1'; v.muted = true; v.play().catch(() => {}); } }); }
  }, 80); return () => clearInterval(id); }, []);
  return <video id="sophia-score" ref={ref} src={src || undefined} preload="auto" playsInline data-om-exportable-video-play-start="0" data-om-exportable-video-play-end="64" style={{ position: 'absolute', width: 2, height: 2, opacity: 0, pointerEvents: 'none' }} />;
}
function Trailer({ sound, unlocked, src }) {
  const { T, CUES, time, playing, authoredTotal } = useComposition();
  const end = authoredTotal || 64, fade = ss(0, 0.8, T) * (1 - ss(end - 1.2, end, T));
  return (<div style={{ position: 'absolute', inset: 0, background: '#000', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', inset: 0, opacity: fade }}>
      <Field T={T} CUES={CUES} still={!playing} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(13,14,16,0) 58%, rgba(13,14,16,.62) 100%)', pointerEvents: 'none' }} />
      <Hud T={T} CUES={CUES} end={end} />
      <Line T={T} CUES={CUES} />
      <Values T={T} CUES={CUES} />
      <Lockup T={T} CUES={CUES} />
    </div>
    <Score time={time} playing={playing} on={sound} unlocked={unlocked} src={src} />
  </div>);
}
// every load starts the trailer from 0:00, so the frame waiting behind the loading screen is the black opening, not the last stop
try { localStorage.setItem('animstage-v3:t', '0'); } catch (e) {}
function App() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  const [unlocked, setUnlocked] = useState(true), [src, setSrc] = useState(null), [ready, setReady] = useState(!window.SophiaAudio);
  useEffect(() => { window.SophiaAudio && window.SophiaAudio.ready.then(u => { setSrc(u); setReady(true); }); }, []);
  // the trailer holds still until the loading screen has fully gone, then starts
  const [go, setGo] = useState(false);
  useEffect(() => { if (go || !ready) return; const id = setInterval(() => { const l = document.getElementById('pl-load'); if (!l || l.classList.contains('out')) { try { localStorage.setItem('animstage-v3:t', '0'); } catch (e) {} setGo(true); clearInterval(id); } }, 50); return () => clearInterval(id); }, [ready, go]);
  // sound starts on its own; if the browser blocks unmuted autoplay, the first click or key anywhere turns it on
  const unlock = () => { const v = document.getElementById('sophia-score'); if (v) { delete v.dataset.blocked; v.muted = !t.sound; } };
  useEffect(() => { const h = () => unlock(); window.addEventListener('pointerdown', h, { once: true }); window.addEventListener('keydown', h, { once: true }); return () => { window.removeEventListener('pointerdown', h); window.removeEventListener('keydown', h); }; }, [src]);
  return (<>
    {/* the stage mounts at once; until the score is rendered a veil covers it and blocks the player, so nothing plays (or exports) without the audio */}
    <CompositionStage key={go ? 'go' : 'wait'} autoplay={go} width={1920} height={1080} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg="#000">
      <Trailer sound={t.sound} unlocked={unlocked} src={src} />
    </CompositionStage>
    {!ready && <div style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,.86)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, font: "400 13px/1.6 'Satoshi', sans-serif", letterSpacing: '.3em', textTransform: 'uppercase', color: '#E8ECCC', textAlign: 'center' }}><span>Tuning the score…</span><span style={{ color: 'rgba(250,250,250,.6)', letterSpacing: '.2em', fontSize: 11 }}>About a minute. The trailer plays once it is ready.</span></div>}
    <TweaksPanel>
      <TweakToggle label="Motion editor" value={t.motionEditor} onChange={v => setTweak('motionEditor', v)} />
      <TweakToggle label="Sound" value={t.sound} onChange={v => setTweak('sound', v)} />
    </TweaksPanel>
  </>);
}
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
