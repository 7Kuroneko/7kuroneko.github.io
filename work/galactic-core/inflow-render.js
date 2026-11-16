/* FOCUSFIELD · INFLOW — a galaxy funnel of star-dust spiralling into a white mouth, crossed by
 * star-trail streaks, smoke wisps and rare light-arcs. Pure function of t. Canvas 2D. */
window.SurferScene = (function () {
  const W = 1920, H = 1080, TAU = Math.PI * 2, SS = 1.75, OSC = 6, VT = 210, ANG = -0.36;
  const PAL = {
    cosmos: { bg: '#03040a', bg2: '#0a0f1f', pc: ['#ffffff', '#9fb8ff', '#f0c08a'], core: '#f4f6ff', rim: '#a9c9ff', bolt: '#cfe0ff', streak: '#e4ecff', env: '#6f8cc8', ink: '#020308' },
    sunset: { bg: '#070308', bg2: '#170a12', pc: ['#ffe2b8', '#ff8a45', '#b98aff'], core: '#ffd9a0', rim: '#ff9a55', bolt: '#ffd08a', streak: '#ffe6cc', env: '#c26a3a', ink: '#050204' },
    pulp: { bg: '#000000', bg2: '#0b0b0b', pc: ['#ffffff', '#cfcfcf', '#8a8a8a'], core: '#ffffff', rim: '#ffffff', bolt: '#ffffff', streak: '#f2f2f2', env: '#8a8a8a', ink: '#000000' },
    seafoam: { bg: '#010710', bg2: '#04142a', pc: ['#e6fdff', '#5fd0ff', '#b7fff0'], core: '#e6fdff', rim: '#7fe4ff', bolt: '#bff6ff', streak: '#dcfbff', env: '#3aa6c8', ink: '#01040a' },
  };
  const hx = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const rgba = (c, a) => 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + Math.max(0, Math.min(1, a)).toFixed(3) + ')';
  const mix = (a, b, k) => [0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i]) * k));
  Object.keys(PAL).forEach(k => { const p = PAL[k]; p.pcRGB = p.pc.map(hx); p.coreRGB = hx(p.core); p.rimRGB = hx(p.rim); p.boltRGB = hx(p.bolt); p.streakRGB = hx(p.streak); p.envRGB = hx(p.env); p.inkRGB = hx(p.ink); });
  const hash = i => { let x = (Math.imul(i | 0, 2654435761) + 0x9E3779B9) >>> 0; x = Math.imul(x ^ x >>> 15, 2246822519) >>> 0; x = Math.imul(x ^ x >>> 13, 3266489917) >>> 0; return ((x ^ x >>> 16) >>> 0) / 4294967296; };
  function rng(s) { let a = s >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const glowC = {};
  function glow(hex) {
    if (glowC[hex]) return glowC[hex];
    const c = mk(128, 128), x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64), r = hx(hex);
    g.addColorStop(0, rgba(r, 1)); g.addColorStop(.2, rgba(r, .5)); g.addColorStop(.5, rgba(r, .15)); g.addColorStop(1, rgba(r, 0));
    x.fillStyle = g; x.fillRect(0, 0, 128, 128); return glowC[hex] = c;
  }
  function dg(ctx, hex, x, y, r, a) { if (a <= .002 || r < .5) return; ctx.globalAlpha = Math.min(1, a); ctx.drawImage(glow(hex), x - r, y - r, 2 * r, 2 * r); ctx.globalAlpha = 1; }

  // vortex geometry: outer rim centred at VC, inner rings slide toward the mouth (VC+DEP)
  const VC = [W * .46, H * .44], DEP = [130, 80], RMAX = 1250, SQ = .42, TILT = -.32, CT = Math.cos(TILT), STl = Math.sin(TILT);
  const MOUTH = [VC[0] + DEP[0], VC[1] + DEP[1]];
  let SEED = 7, PARTS = [], STREAKS = [], EV = [];

  function vortexXY(rr, th) {
    const k = 1 - rr, r = 30 + RMAX * rr, cx = VC[0] + DEP[0] * k * k, cy = VC[1] + DEP[1] * k * k;
    const ex = Math.cos(th) * r, ey = Math.sin(th) * r * SQ;
    return [cx + ex * CT - ey * STl, cy + ex * STl + ey * CT, k];
  }

  // smoke wisps sprite, laid out in stream space (horizontally tileable)
  const WW = 3200, WH = 2000, wispC = {};
  function wisps(key, P) {
    const k = key + '|' + SEED; if (wispC[k]) return wispC[k];
    const c = mk(WW, WH), x = c.getContext('2d'), R = rng(SEED * 613 + 9), col = P.streakRGB;
    const pass = (n, blur, rx0, rx1, ry0, ry1, a0, a1) => {
      x.filter = 'blur(' + blur + 'px)';
      for (let i = 0; i < n; i++) {
        const px = R() * WW, py = (R() * .8 + .1) * WH, rx = rx0 + R() * (rx1 - rx0), ry = ry0 + R() * (ry1 - ry0), a = a0 + R() * (a1 - a0), ro = (R() - .5) * .08;
        x.fillStyle = rgba(col, a);
        for (const ox of [0, -WW, WW]) { if (px + ox + rx < -100 || px + ox - rx > WW + 100) continue; x.beginPath(); x.ellipse(px + ox, py, rx, ry, ro, 0, TAU); x.fill(); }
      }
    };
    pass(26, 60, 300, 700, 30, 90, .04, .1);
    pass(60, 14, 120, 420, 3, 12, .05, .16);
    x.filter = 'none';
    return wispC[k] = c;
  }

  // deep static field: tiny stars + faint dust, horizontally tileable
  const DW = 2600, DH = 1200, deepC = {};
  function deep(key, P) {
    const k = key + '|' + SEED; if (deepC[k]) return deepC[k];
    const c = mk(DW, DH), x = c.getContext('2d'), R = rng(SEED * 211 + 77);
    x.fillStyle = P.bg; x.fillRect(0, 0, DW, DH);
    x.filter = 'blur(70px)';
    for (let i = 0; i < 40; i++) { const px = R() * DW, py = R() * DH, r = 120 + R() * 380, col = i % 3 ? P.envRGB : P.pcRGB[2]; x.fillStyle = rgba(col, .012 + R() * .022); for (const ox of [0, -DW, DW]) { x.beginPath(); x.ellipse(px + ox, py, r * 1.6, r * .7, ANG + (R() - .5) * .4, 0, TAU); x.fill(); } }
    x.filter = 'none';
    for (let i = 0; i < 9000; i++) { const q = R(), a = .08 + Math.pow(R(), 3) * .9, s = q < .9 ? .7 + R() * .6 : 1.3 + R() * 1.1, col = R() < .8 ? [235, 240, 255] : P.pcRGB[1 + Math.floor(R() * 2)]; x.fillStyle = rgba(col, a); x.fillRect(R() * DW, R() * DH, s, s); }
    return deepC[k] = c;
  }
  let BL = null, BLX = null;
  let GRAIN = null;
  function grain() {
    if (GRAIN) return GRAIN;
    const c = mk(256, 256), x = c.getContext('2d'), id = x.createImageData(256, 256), d = id.data;
    for (let i = 0; i < d.length; i += 4) { const v = Math.floor(hash(i * 3 + 7) * 255); d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    x.putImageData(id, 0, 0); return GRAIN = c;
  }

  function bolt(R, x0, y0, x1, y1, depth) {
    let pts = [[x0, y0], [x1, y1]], disp = Math.hypot(x1 - x0, y1 - y0) * .2;
    for (let d = 0; d < depth; d++) { const np = [pts[0]]; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, o = (R() - .5) * 2 * disp; np.push([(a[0] + b[0]) / 2 - dy / l * o, (a[1] + b[1]) / 2 + dx / l * o], b); } pts = np; disp *= .52; }
    return pts;
  }
  function flashAt(dt) {
    if (dt < 0 || dt > 2.2) return 0;
    let f = 0; [[0, 1], [.1, .65], [.27, .9], [.52, .4]].forEach(([k, a]) => { if (dt >= k) f = Math.max(f, a * Math.exp(-(dt - k) * 9)); });
    return Math.min(1, f + .15 * Math.exp(-dt * 2.2));
  }

  function build(seed, density, dur) {
    SEED = seed | 0; const R = rng(SEED * 31 + 5), dn = density || 1;
    PARTS = [];
    for (let i = 0; i < Math.round(16000 * dn); i++) { const q = R(); const arm = R() < .8, th0 = arm ? Math.floor(R() * 6) * TAU / 6 + (R() + R() + R() - 1.5) * .32 : R() * TAU; /* six tight spiral arms */ PARTS.push({ u0: R(), th: th0, c: q < .58 ? 0 : q < .82 ? 1 : 2, s: .6 + R() * R() * R() * 3.2, a: .35 + R() * .65 }); }
    STREAKS = [];
    [[420, 90, 14, .5, .9], [200, 230, 60, .9, 1.4], [60, 520, 180, 1.4, 2.4]].forEach(([n, v, len, w0, w1], li) => {
      for (let i = 0; i < Math.round(n * dn); i++) STREAKS.push({ x: R() * 2900, y: R() * 2000 - 1000, v: v * (.8 + R() * .4), len: len * (.6 + R() * .8), w: w0 + R() * (w1 - w0), a: .4 + R() * .6, li });
    });
    EV = []; let t = 42 + R() * 15;
    while (t < dur - 15) {
      const an = Math.PI * .6 + R() * Math.PI * 1.1, x0 = MOUTH[0] + (R() - .5) * 120, y0 = MOUTH[1] + (R() - .5) * 60, l = 500 + R() * 600;
      const x1 = x0 + Math.cos(an) * l, y1 = y0 + Math.sin(an) * l * .6;
      const main = bolt(R, x0, y0, x1, y1, 6), br = [];
      for (let b = 0; b < 3; b++) { const p = main[Math.floor(main.length * (.2 + R() * .5))], a2 = an + (R() - .5) * 1.4, l2 = 100 + R() * 200; br.push(bolt(R, p[0], p[1], p[0] + Math.cos(a2) * l2, p[1] + Math.sin(a2) * l2, 4)); }
      EV.push({ t, main, br, pan: Math.max(-1, Math.min(1, ((x0 + x1) / 2 - W / 2) / (W / 2))) });
      t += 55 + R() * 65;
    }
  }
  const events = () => EV.map(e => ({ t: e.t, k: 'bolt', pan: e.pan }));

  // ---------------- rider: athletic chrome figure in a side-on surf stance, built as
  // anatomical limb volumes + muscle bumps, shaded per pixel as one mirror-silver surface
  const spos = t => [W * .3 + 60 * Math.sin(t * .05) + 26 * Math.sin(t * .13 + 1), H * .7 + 34 * Math.sin(t * .07 + .5) + 14 * Math.sin(t * .21)];
  const heading = t => -.12 + .035 * Math.sin(t * .3) + .02 * Math.sin(t * .11 + 2);
  const SX0 = 95, SY0 = 140, SPW = 190, SPH = 160;
  function cr(x, pts, closed) {
    const n = pts.length; x.moveTo(pts[0][0], pts[0][1]);
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[closed ? (i + 2) % n : Math.min(n - 1, i + 2)];
      x.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
    }
    if (closed) x.closePath();
  }
  // tapered limb outline; prof = [[ra, rb]...] along A->B, ra on the (-dy,dx) side
  function limb(A, B, prof) {
    const dx = B[0] - A[0], dy = B[1] - A[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l, nx = -uy, ny = ux, n = prof.length, L = [], R = [];
    for (let i = 0; i < n; i++) { const s = i / (n - 1), px = A[0] + dx * s, py = A[1] + dy * s; L.push([px + nx * prof[i][0], py + ny * prof[i][0]]); R.push([px - nx * prof[i][1], py - ny * prof[i][1]]); }
    const e = prof[n - 1], st = prof[0];
    return L.concat([[B[0] + ux * (e[0] + e[1]) * .4, B[1] + uy * (e[0] + e[1]) * .4]], R.reverse(), [[A[0] - ux * (st[0] + st[1]) * .4, A[1] - uy * (st[0] + st[1]) * .4]]);
  }
  const HIP = [0, -56], NK = [12, -103], SH = [11, -96], SH2 = [7, -95];
  const THIGH = [[7, 7.4], [7.2, 8.4], [6.6, 7.8], [5.6, 6.4], [4.6, 5]];
  const FOOT = [[2.8, 3], [2.3, 2.7], [1.8, 2], [1.2, 1.3]];
  const PARTS_F = [
    // [outline, gain, near]
    [limb(SH, [30, -89], [[5.6, 6.4], [4.8, 5.6], [4.4, 4.8], [3.6, 3.8], [3.2, 3.3]]), 2, 0],
    [limb([30, -89], [46, -95], [[3.4, 3.6], [3.9, 4.1], [3.4, 3.5], [2.7, 2.9], [2.2, 2.3]]), 1.9, 0],
    [limb([46, -95], [53, -97.5], [[2.2, 2.5], [2.5, 2.7], [2, 2.1], [1.2, 1.3]]), 1.6, 0],
    [limb(HIP, [-6, -28], THIGH), 2.2, 0],
    [limb([-6, -28], [-24, -5], [[4.6, 4.2], [6, 3.9], [5.2, 3.5], [3.6, 3], [2.7, 2.6]]), 2, 0],
    [limb([-24, -5], [-13, -1.5], FOOT), 1.4, 0],
    [limb(HIP, NK, [[7, 10.6], [6.2, 8.2], [6.6, 6.9], [8, 8.6], [9.4, 9.6], [5.6, 6.2]]), 2.4, 0],
    [limb([12, -102], [14, -110], [[4.8, 4.8], [4.4, 4.5]]), 2, 0],
    [limb([13, -106], [19, -127], [[4.2, 4.6], [6.6, 7], [7.6, 8.2], [7.4, 8.6], [6.4, 7.4], [4, 4.5]]), 2.3, 0],
    [limb(HIP, [24, -30], THIGH), 2.2, 1],
    [limb([24, -30], [21, -5], [[4.4, 4.2], [6, 3.8], [5.2, 3.4], [3.6, 2.9], [2.6, 2.6]]), 2, 1],
    [limb([21, -5], [31, -1.5], FOOT), 1.4, 1],
    [limb(SH2, [-12, -82], [[6.4, 5.4], [5.4, 4.8], [5, 4.4], [3.8, 3.6], [3.2, 3.2]]), 2, 1],
    [limb([-12, -82], [-26, -71], [[3.8, 3.6], [4.2, 3.8], [3.6, 3.2], [2.8, 2.6], [2.2, 2.2]]), 1.9, 1],
    [limb([-26, -71], [-32, -67], [[2.2, 2.4], [2.5, 2.6], [2, 2], [1.2, 1.2]]), 1.6, 1],
  ];
  // muscle bumps: x, y, rx, ry, rot, amp
  const BUMPS = [[17, -92, 6, 4, .25, 2.6], [8, -95, 6, 5, 0, 2.6], [12, -96, 5, 4.5, 0, 2], [21, -91, 5, 2.6, .3, 1.8], [24, -87, 5, 2.4, .3, 1.2], [38, -93, 4.5, 2.2, -.3, 1.2],
    [13, -81, 3.2, 2.6, 0, 1.3], [11.5, -74, 3.2, 2.6, 0, 1.3], [10, -66, 3.2, 2.6, 0, 1.2], [6, -70, 3, 8, .2, 1.4], [1, -84, 4, 10, .25, 2], [-1, -97, 6, 4, -.2, 1.6],
    [-8, -58, 6, 6.5, 0, 2.4], [16, -43, 4, 9.5, -.78, 2.4], [10, -48, 3, 7, -.78, 1.4], [18.5, -20, 2.6, 6.5, .12, 2], [-1, -40, 3.6, 9, .2, 2.2], [-17, -17, 2.6, 6, -.65, 1.8],
    [-4, -86, 5, 2.4, -.55, 1.8], [-1, -90, 4, 2.2, -.55, 1.2], [-19, -76, 4, 2, -.65, 1.1], [19, -118, 4, 3.5, 0, 1], [14, -112, 2.5, 2, .5, .8]];
  const FIG = {};
  function buildFigure(key, P) {
    if (FIG[key]) return FIG[key];
    const WP = SPW * OSC, HP = SPH * OSC, N = WP * HP;
    const Hh = new Float32Array(N), D = new Float32Array(N);
    const mc = mk(WP, HP), mx = mc.getContext('2d');
    for (const [pts, gain, near] of PARTS_F) {
      mx.setTransform(1, 0, 0, 1, 0, 0); mx.clearRect(0, 0, WP, HP); mx.setTransform(OSC, 0, 0, OSC, SX0 * OSC, SY0 * OSC);
      mx.fillStyle = '#fff'; mx.beginPath(); cr(mx, pts, true); mx.fill();
      const al = mx.getImageData(0, 0, WP, HP).data, dd = new Float32Array(N);
      for (let i = 0; i < N; i++) dd[i] = al[i * 4 + 3] > 127 ? 1e6 : 0;
      for (let y = 1; y < HP - 1; y++) for (let x = 1; x < WP - 1; x++) { const i = y * WP + x; if (!dd[i]) continue; dd[i] = Math.min(dd[i], dd[i - 1] + 1, dd[i - WP] + 1, dd[i - WP - 1] + 1.414, dd[i - WP + 1] + 1.414); }
      for (let y = HP - 2; y > 0; y--) for (let x = WP - 2; x > 0; x--) { const i = y * WP + x; if (!dd[i]) continue; dd[i] = Math.min(dd[i], dd[i + 1] + 1, dd[i + WP] + 1, dd[i + WP + 1] + 1.414, dd[i + WP - 1] + 1.414); }
      for (let i = 0; i < N; i++) {
        const A = al[i * 4 + 3] / 255; if (A <= 0) continue; if (A > D[i]) D[i] = A;
        const h = gain * Math.sqrt(Math.max(.05, dd[i]) / OSC);
        Hh[i] = near ? (dd[i] > 0 ? h + Hh[i] * .35 : Math.max(Hh[i], h)) : Math.max(Hh[i], h);
      }
    }
    for (const [cx, cy, rx, ry, ro, amp] of BUMPS) {
      const R = Math.max(rx, ry), x0 = Math.max(0, Math.floor((cx - R + SX0) * OSC)), x1 = Math.min(WP - 1, Math.ceil((cx + R + SX0) * OSC));
      const y0 = Math.max(0, Math.floor((cy - R + SY0) * OSC)), y1 = Math.min(HP - 1, Math.ceil((cy + R + SY0) * OSC)), c = Math.cos(ro), sn = Math.sin(ro);
      for (let py = y0; py <= y1; py++) { const uy = py / OSC - SY0 - cy; for (let px = x0; px <= x1; px++) {
        const i = py * WP + px; if (D[i] <= 0) continue;
        const ux = px / OSC - SX0 - cx, lx = ux * c + uy * sn, ly = -ux * sn + uy * c, q = lx * lx / (rx * rx) + ly * ly / (ry * ry);
        if (q < 1) { const w = 1 - q; Hh[i] += amp * w * w; }
      } }
    }
    const blur = (src, r) => { const tmp = new Float32Array(N), out = new Float32Array(N);
      for (let y = 0; y < HP; y++) { let acc = 0; const o = y * WP; for (let x = -r; x < WP; x++) { if (x + r < WP) acc += src[o + x + r]; if (x - r - 1 >= 0) acc -= src[o + x - r - 1]; if (x >= 0) tmp[o + x] = acc / (2 * r + 1); } }
      for (let x = 0; x < WP; x++) { let acc = 0; for (let y = -r; y < HP; y++) { if (y + r < HP) acc += tmp[(y + r) * WP + x]; if (y - r - 1 >= 0) acc -= tmp[(y - r - 1) * WP + x]; if (y >= 0) out[y * WP + x] = acc / (2 * r + 1); } }
      return out; };
    const Hs = blur(blur(Hh, 2), 1); for (let i = 0; i < N; i++) if (D[i] > 0) Hh[i] = Hs[i];
    const Hb = blur(blur(Hh, 6), 6);
    const c = mk(WP, HP), x = c.getContext('2d'), img = x.createImageData(WP, HP), px = img.data;
    const L = [.5, -.55, .67], L2 = [.85, -.2, .5], core = P.coreRGB, rim = P.rimRGB, env = P.envRGB;
    const sm = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
    for (let py = 1; py < HP - 1; py++) for (let qx = 1; qx < WP - 1; qx++) {
      const i = py * WP + qx; if (D[i] <= 0) continue;
      const gx = (Hh[i + 1] - Hh[i - 1]) * .5 * OSC, gy = (Hh[i + WP] - Hh[i - WP]) * .5 * OSC;
      let nx = -gx, ny = -gy, nz = 1; const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
      const rx = 2 * nz * nx, ry = 2 * nz * ny, rz = 2 * nz * nz - 1, up = -ry;
      // studio-silver environment: bright sky, soft grey horizon, cool reflected space below
      let r_, g_, b_;
      if (up > .05) { const k = sm(.05, .75, up); r_ = 175 + 80 * k; g_ = 182 + 73 * k; b_ = 198 + 57 * k; }
      else if (up > -.2) { const k = sm(-.2, .05, up); r_ = 52 + 90 * k; g_ = 56 + 94 * k; b_ = 70 + 100 * k; }
      else { const k = sm(-.2, -.9, up); r_ = 52 + (env[0] * .9 - 52) * k; g_ = 56 + (env[1] * .9 - 56) * k; b_ = 70 + (env[2] * .9 - 70) * k; }
      const side = Math.max(0, rx); r_ += core[0] * side * side * .6; g_ += core[1] * side * side * .6; b_ += core[2] * side * side * .6;
      const lam = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]), shadeK = .42 + .58 * lam;
      const cav = Math.max(0, Math.min(1, (Hb[i] - Hh[i]) * .6)), ao = 1 - cav * .8;
      const sp = Math.pow(Math.max(0, rx * L[0] + ry * L[1] + rz * L[2]), 36) * 255, sp2 = Math.pow(Math.max(0, rx * L2[0] + ry * L2[1] + rz * L2[2]), 10);
      const fres = Math.pow(1 - nz, 3) * .5, f = shadeK * ao, j = i * 4;
      px[j] = Math.min(255, r_ * f + sp + rim[0] * (sp2 * .65 + fres)); px[j + 1] = Math.min(255, g_ * f + sp + rim[1] * (sp2 * .65 + fres)); px[j + 2] = Math.min(255, b_ * f + sp + rim[2] * (sp2 * .65 + fres)); px[j + 3] = Math.round(Math.min(1, D[i]) * 255);
    }
    x.putImageData(img, 0, 0);
    return FIG[key] = c;
  }
  function boardPath(x) { x.moveTo(70, -1); x.bezierCurveTo(42, -9, -52, -9, -66, -1); x.bezierCurveTo(-70, 3, -60, 8, -46, 8); x.bezierCurveTo(-10, 9, 40, 7, 70, -1); x.closePath(); }
  let OFF = null, OFX = null, RIDER = null;
  function riderSprite(t, P, BA, flash) {
    if (!OFF) { OFF = mk(SPW * OSC, SPH * OSC); OFX = OFF.getContext('2d'); }
    const x = OFX; x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, OFF.width, OFF.height);
    x.setTransform(OSC, 0, 0, OSC, SX0 * OSC, SY0 * OSC);
    x.save(); x.translate(0, 2.4); x.fillStyle = '#05060b'; x.beginPath(); boardPath(x); x.fill(); x.restore();
    const bg = x.createLinearGradient(0, -9, 0, 9); bg.addColorStop(0, '#6a7389'); bg.addColorStop(.3, '#eef2f9'); bg.addColorStop(.45, '#ffffff'); bg.addColorStop(.58, rgba(mix(P.envRGB, [255, 255, 255], .4), 1)); bg.addColorStop(.82, '#3a4152'); bg.addColorStop(1, '#9aa3b8');
    x.fillStyle = bg; x.beginPath(); boardPath(x); x.fill();
    x.strokeStyle = 'rgba(255,255,255,.95)'; x.lineWidth = .5; x.beginPath(); x.moveTo(-56, -5); x.bezierCurveTo(-20, -7.6, 36, -7, 66, -1.4); x.stroke();
    if (RIDER) { const h = 130, w = h * RIDER.width / RIDER.height; x.drawImage(RIDER, -w / 2, -h + 1, w, h); return OFF; }
    const key = Object.keys(PAL).find(k => PAL[k] === P) || 'cosmos', F = buildFigure(key, P);
    x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(F, 0, 0);
    x.globalCompositeOperation = 'source-atop';
    const gp = ((t * .045) % 1) * 2.4 - .7, gg = x.createLinearGradient(OFF.width * gp, 0, OFF.width * (gp + .35), OFF.height * .6);
    gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(.5, 'rgba(255,255,255,.12)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gg; x.fillRect(0, 0, OFF.width, OFF.height);
    if (flash > .01) { x.fillStyle = 'rgba(255,255,255,' + (.4 * flash).toFixed(3) + ')'; x.fillRect(0, 0, OFF.width, OFF.height); }
    x.globalCompositeOperation = 'source-over';
    return OFF;
  }

  // ---------------- light ribbon behind the board
  const DX = Math.cos(ANG), DY = Math.sin(ANG);
  function trailPts(t, sp, wv) {
    const N = 90, out = [];
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1), tau = u * 7, tt = t - tau, p = spos(tt), ba = heading(tt);
      const tx = -64 * SS, ty = 1 * SS, ox = 0, oy = 0;
      out.push([p[0] + ox + tx * Math.cos(ba) - ty * Math.sin(ba) - DX * VT * sp * tau, p[1] + oy + tx * Math.sin(ba) + ty * Math.cos(ba) - DY * VT * sp * tau, u]);
    }
    for (let i = 0; i < N; i++) { const a = out[Math.max(0, i - 1)], b = out[Math.min(N - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, u = out[i][2], wob = Math.sin(u * 8 - t * 1.6) * u * 22 * wv; out[i].push(dy / l, -dx / l); out[i][0] += out[i][3] * wob; out[i][1] += out[i][4] * wob; }
    return out;
  }
  const tw = u => 5 + 70 * Math.pow(u, .85);
  function ribbon(ctx, pts, wk, col, aF) {
    const N = pts.length, CH = 6;
    for (let s = 0; s < N - 1; s += CH) {
      const e = Math.min(N - 1, s + CH), um = pts[Math.min(N - 1, s + CH / 2)][2]; ctx.fillStyle = rgba(col, aF(um));
      ctx.beginPath();
      for (let i = s; i <= e; i++) { const p = pts[i], w = tw(p[2]) * wk; ctx.lineTo(p[0] + p[3] * w * .5, p[1] + p[4] * w * .5); }
      for (let i = e; i >= s; i--) { const p = pts[i], w = tw(p[2]) * wk; ctx.lineTo(p[0] - p[3] * w * .5, p[1] - p[4] * w * .5); }
      ctx.closePath(); ctx.fill();
    }
  }

  function draw(ctx, t, twk) {
    const key = PAL[twk.palette] ? twk.palette : 'cosmos', P = PAL[key];
    const gl = twk.glow == null ? 1 : twk.glow, sp = .5 + .5 * (twk.depth == null ? 1 : twk.depth), wv = twk.wave == null ? 1 : twk.wave;
    ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.imageSmoothingEnabled = true;
    const dp = deep(key, P), doff = ((t * 3 * sp) % DW + DW) % DW, dw1 = Math.min(W, DW - doff);
    ctx.drawImage(dp, doff, 0, dw1, DH, 0, -60, dw1, DH); if (dw1 < W) ctx.drawImage(dp, 0, 0, W - dw1, DH, dw1, -60, W - dw1, DH);
    ctx.globalCompositeOperation = 'lighter';
    const bgG = ctx.createRadialGradient(MOUTH[0], MOUTH[1], 0, MOUTH[0], MOUTH[1], 1300); bgG.addColorStop(0, rgba(hx(P.bg2), .4)); bgG.addColorStop(1, rgba(hx(P.bg2), 0)); ctx.fillStyle = bgG; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';

    // smoke wisps (stream space)
    ctx.globalCompositeOperation = 'lighter';
    const wsp = wisps(key, P), woff = ((t * 26 * sp) % WW + WW) % WW;
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(ANG); ctx.globalAlpha = Math.min(1, .55 * gl);
    for (const ox of [-woff, WW - woff]) ctx.drawImage(wsp, ox - WW / 2 + 400, -WH / 2);
    ctx.globalAlpha = 1; ctx.restore();

    // funnel wall rings (drift inward)
    const INF = .006 * sp;
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 16; i++) {
      const u = ((i / 16 + t * INF) % 1 + 1) % 1, rr = Math.pow(1 - u, 1.7), k = 1 - rr, r = 30 + RMAX * rr;
      const cx = VC[0] + DEP[0] * k * k, cy = VC[1] + DEP[1] * k * k, a = Math.min(1, u * 10) * Math.min(1, (1 - u) * 6) * (.012 + .05 * k) * gl;
      ctx.strokeStyle = rgba(P.coreRGB, a); ctx.beginPath(); ctx.ellipse(cx, cy, r, r * SQ, TILT, 0, TAU); ctx.stroke();
    }
    // vortex star-dust, binned by colour × brightness
    const LV = 6, bins = [];
    for (let i = 0; i < 3 * LV; i++) bins.push([]);
    const pos = (p, tt) => { const u = ((p.u0 + tt * INF) % 1 + 1) % 1, rr = Math.pow(1 - u, 1.7); return [u, rr, vortexXY(rr, p.th + tt * .03 * sp - 2.4 * Math.log((30 + RMAX * rr) / RMAX))]; };
    for (const p of PARTS) {
      const [u, rr, [X, Y, k]] = pos(p, t);
      if (X < -40 || X > W + 40 || Y < -40 || Y > H + 40) continue;
      const a = p.a * Math.min(1, u * 12) * Math.min(1, (1 - u) * 14) * (.3 + .7 * Math.pow(k, 1.1));
      if (a < .03) continue;
      const q = pos(p, t - 1.6)[2];
      if (Math.hypot(q[0] - X, q[1] - Y) > 260) continue;
      const lv = Math.min(LV - 1, Math.floor(a * LV)), s = p.s * (.55 + .8 * (1 - k));
      bins[p.c * LV + lv].push(X, Y, q[0], q[1], s);
    }
    ctx.lineCap = 'round';
    for (let c = 0; c < 3; c++) for (let lv = 0; lv < LV; lv++) {
      const b = bins[c * LV + lv]; if (!b.length) continue;
      ctx.strokeStyle = rgba(P.pcRGB[c], Math.min(1, (lv + .6) / LV * .75 * gl)); ctx.fillStyle = rgba(P.pcRGB[c], Math.min(1, (lv + .8) / LV * gl));
      ctx.lineWidth = .9; ctx.beginPath();
      for (let i = 0; i < b.length; i += 5) { ctx.moveTo(b[i + 2], b[i + 3]); ctx.lineTo(b[i], b[i + 1]); }
      ctx.stroke(); ctx.beginPath();
      for (let i = 0; i < b.length; i += 5) ctx.rect(b[i] - b[i + 4] / 2, b[i + 1] - b[i + 4] / 2, b[i + 4], b[i + 4]);
      ctx.fill();
    }
    // the mouth
    const pul = .94 + .06 * Math.sin(t * .4);
    dg(ctx, P.core, MOUTH[0], MOUTH[1], 900 * pul, .26 * gl); dg(ctx, P.core, MOUTH[0], MOUTH[1], 380 * pul, .55 * gl); dg(ctx, '#ffffff', MOUTH[0], MOUTH[1], 130, .95);

    // lightning arcs out of the mouth
    let flash = 0;
    for (const e of EV) {
      const f = flashAt(t - e.t); if (f < .003) continue; flash = Math.max(flash, f);
      const line = (pts, w, col, a) => { ctx.strokeStyle = rgba(col, a); ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); };
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      line(e.main, 18, P.boltRGB, .1 * f * gl); line(e.main, 6, P.boltRGB, .35 * f * gl); line(e.main, 2, [255, 255, 255], f);
      for (const b of e.br) { line(b, 6, P.boltRGB, .18 * f * gl); line(b, 1.2, [255, 255, 255], .7 * f); }
    }
    if (flash > 0) { ctx.fillStyle = rgba(P.boltRGB, .06 * flash * gl); ctx.fillRect(0, 0, W, H); }

    if (!BL) { BL = mk(320, 180); BLX = BL.getContext('2d'); }
    BLX.globalCompositeOperation = 'copy'; BLX.filter = 'blur(3px)'; BLX.drawImage(ctx.canvas, 0, 0, 320, 180); BLX.filter = 'none';
    BLX.globalCompositeOperation = 'multiply'; BLX.drawImage(BL, 0, 0); BLX.drawImage(BL, 0, 0); BLX.globalCompositeOperation = 'source-over';
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, .35 * gl); ctx.drawImage(BL, 0, 0, W, H); ctx.globalAlpha = 1;
    // star-trail streaks (far + mid layers)
    const streaks = (li0, li1) => {
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(ANG); ctx.lineCap = 'round';
      for (let li = li0; li <= li1; li++) {
        const tails = [], heads = [];
        for (const s of STREAKS) {
          if (s.li !== li) continue;
          const X = ((s.x - t * s.v * sp) % 2900 + 2900) % 2900 - 1450, L = s.len * (.6 + .4 * sp);
          tails.push(X, s.y, L, s.w); heads.push(X, s.y, s.w);
        }
        const A = [.22, .3, .38][li] * gl, Ah = [.75, .9, 1][li];
        for (const [arr, isHead] of [[tails, 0], [heads, 1]]) {
          if (isHead) { ctx.fillStyle = rgba(P.streakRGB, Ah); ctx.beginPath(); for (let i = 0; i < arr.length; i += 3) { const w = arr[i + 2] * 1.6; ctx.rect(arr[i] - w / 2, arr[i + 1] - w / 2, w, w); } ctx.fill(); }
          else { ctx.strokeStyle = rgba(P.streakRGB, A); ctx.lineWidth = [.8, 1.1, 1.8][li]; ctx.beginPath(); for (let i = 0; i < arr.length; i += 4) { ctx.moveTo(arr[i], arr[i + 1]); ctx.lineTo(arr[i] + arr[i + 2], arr[i + 1]); } ctx.stroke(); }
        }
      }
      ctx.restore();
    };
    streaks(0, 1);

    // near streaks pass in front
    ctx.globalCompositeOperation = 'lighter'; streaks(2, 2);

    ctx.globalCompositeOperation = 'source-over';
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * .4, W / 2, H / 2, H * 1.05); vg.addColorStop(0, rgba(P.inkRGB, 0)); vg.addColorStop(.6, rgba(P.inkRGB, .25)); vg.addColorStop(1, rgba(P.inkRGB, .85)); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    const fr = Math.floor(t * 24), gx = Math.floor(hash(fr) * 256), gy = Math.floor(hash(fr * 7 + 1) * 256), gimg = grain();
    ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .08;
    for (let y = -gy; y < H; y += 256) for (let x = -gx; x < W; x += 256) ctx.drawImage(gimg, x, y);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  return { build, draw, events, setRiderImage: img => { RIDER = img || null; } };
})();
window.SurferScene.ORACLE_B = ['...#####...', '..####.##..', '.######.##.', '.#######.#.', '#######.###', '###########', '#...###...#', '##..###..##', '###########', '#####.#####', '####...####', '###########', '.##.....##.', '.##.#.#.##.', '..#######..', '...#####...', '....###....', '.....#.....'];
window.SurferScene.ORACLE_A = window.SurferScene.ORACLE = ["....#######...","..##########..",".############.","#############.","###...........","##.##########.","##.#########..","##.#....##....","##.#...###....","##.##..###....","##.#######....","##.#######....","##.#####......","##..######....","##..#####.....","##...##.##....","###...####....","####..###.....","#####..##.....","#######....###","#######...####","##############","##############","##############"]; // hooded Oracle (14×24)
window.SurferScene.drawOracle = function (ctx, cx, cy, cell, alpha, color) {
  const G = window.SurferScene.ORACLE, w = G[0].length, h = G.length, x0 = cx - w * cell / 2, y0 = cy - h * cell / 2;
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color || '#FAFAFA';
  for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) if (G[r][c] === '#') ctx.fillRect(Math.round(x0 + c * cell), Math.round(y0 + r * cell), Math.ceil(cell), Math.ceil(cell));
  ctx.restore();
};
window.SurferScene.oracleSVG = function () {
  const G = window.SurferScene.ORACLE, w = G[0].length, h = G.length; let d = '';
  for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) if (G[r][c] === '#') d += 'M' + c + ' ' + r + 'h1v1h-1z';
  return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="100%" style="display:block" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="' + d + '"></path></svg>';
};
