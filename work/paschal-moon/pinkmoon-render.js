/* ============================================================================
 * FOCUSFIELD · PINK MOON — point-field renderer (Portals house style)
 * The Moon built the way every FocusField world is built: single light points
 * on pure black, additively blended. No surfaces, no paint — only points.
 *   · DISC    ~230k points on the near hemisphere. Albedo from point-built
 *             maria, ~320 power-law craters (dark floors, bright rims, ejecta)
 *             and three young ray craters. Lit almost face-on, a soft
 *             terminator on one limb, faint earthshine beyond it.
 *             She turns: one revolution every 7 min on a nodding, tilted axis;
 *             the camera circles, rises and breathes in and out; the light
 *             swings so the terminator moves across her face.
 *   · HALO    a shell of rose points that brightens only at the limb.
 *   · DUST    a wide, sparse pink corona drifting around the disc.
 *   · SKY     pale stars + a faint point Milky Way, rare pixel meteors.
 * WebGL2 soft point sprites · every frame a pure function of t.
 * API: PinkMoonScene.init() → bool · .draw(ctx2d, t, opts) · .resize(w, h)
 * ==========================================================================*/
window.PinkMoonScene = (function () {
  const W = 1920, H = 1080, TAU = Math.PI * 2;
  const S = { ready: false };
  let gl, glc, prog, U = {}, vaoStatic, vaoMet, nStatic = 0, metData;
  const MET_MAX = 400;
  function rngF(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const hex = h => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];

  const VS = `#version 300 es
precision highp float;
layout(location=0) in vec3 aP; layout(location=1) in vec3 aC; layout(location=2) in vec3 aK; // kind, size, seed
uniform vec3 uCam, uF, uR, uU, uSun; uniform float uFocal, uAsp, uPx, uT; uniform mat3 uLib;
out vec3 vC;
float hitT(vec3 ro, vec3 rd){ float b = dot(ro, rd), c = dot(ro, ro) - 1., h = b * b - c; if (h < 0.) return -1.; return -b - sqrt(h); }
void main(){
  float kind = aK.x, sz = aK.y, sd = aK.z;
  vec3 p, col = aC; float br = 1.;
  if (kind < .5) { p = aP; br = 1.25 * (.72 + .28 * sin(uT * (.3 + sd * 1.4) + sd * 90.)); }
  else if (kind < 1.5) {
    p = uLib * aP; vec3 n = p, toCam = normalize(uCam - p);
    float facing = dot(n, toCam);
    if (facing < -.01) { gl_Position = vec4(2., 2., 2., 1.); gl_PointSize = 0.; return; }
    float mu = dot(n, uSun);
    float day = smoothstep(-.04, .32, mu) * (.62 + .38 * max(mu, 0.));
    col = aC * (.07 + .9 * day) + vec3(.22, .05, .14) * .16 * (1. - smoothstep(-.1, .2, mu));
    br = clamp(facing * 1.05, 0., 1.);
  } else if (kind < 2.5) {
    p = aP; vec3 n = normalize(p), toCam = normalize(uCam - p);
    float f = abs(dot(n, toCam)), mu = dot(n, uSun);
    br = pow(1. - f, 3.) * (.45 + .55 * smoothstep(-.3, .5, mu)) * 3.6;
    if (br < .01) { gl_Position = vec4(2., 2., 2., 1.); gl_PointSize = 0.; return; }
  } else if (kind < 3.5) {
    float a = aP.x + uT * (.0016 + .0022 * sd) * (sd > .5 ? 1. : -1.), r = aP.y;
    p = (uR * cos(a) + uU * sin(a)) * r + uF * aP.z;
    br = .55 + .45 * sin(uT * (.2 + sd) + sd * 40.);
  } else { p = aP; }
  vec3 rel = p - uCam; float dist = length(rel);
  if (kind != 1.) { float th = hitT(uCam, rel / dist); if (th > 0. && th < dist - .001) { gl_Position = vec4(2., 2., 2., 1.); gl_PointSize = 0.; return; } }
  vec3 v = vec3(dot(rel, uR), dot(rel, uU), dot(rel, uF));
  if (v.z < .05) { gl_Position = vec4(2., 2., 2., 1.); gl_PointSize = 0.; return; }
  gl_Position = vec4(uFocal * v.x / v.z, uFocal * v.y / v.z * uAsp, 0., 1.);
  gl_PointSize = (sz + 0.85) * uPx;
  vC = col * br;
}`;
  const FS = `#version 300 es
precision highp float; in vec3 vC; out vec4 o; void main(){ vec2 q = gl_PointCoord * 2. - 1.; float w = exp(-dot(q, q) * 3.6); if (w < .03) discard; o = vec4(vC * w, 1.); }`;

  function compile() {
    const mk = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    prog = gl.createProgram(); gl.attachShader(prog, mk(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    ['uCam', 'uF', 'uR', 'uU', 'uSun', 'uFocal', 'uAsp', 'uPx', 'uT', 'uLib'].forEach(k => U[k] = gl.getUniformLocation(prog, k));
  }

  function noise3(seed) {
    const P = new Uint8Array(512), r = rngF(seed), p = []; for (let i = 0; i < 256; i++) p.push(i);
    for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
    for (let i = 0; i < 512; i++) P[i] = p[i & 255];
    const h = (x, y, z) => P[(P[(P[x & 255] + y) & 255] + z) & 255] / 255;
    return (x, y, z) => {
      const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi;
      const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf), L = (a, b, t) => a + (b - a) * t;
      return L(L(L(h(xi, yi, zi), h(xi + 1, yi, zi), u), L(h(xi, yi + 1, zi), h(xi + 1, yi + 1, zi), u), v),
               L(L(h(xi, yi, zi + 1), h(xi + 1, yi, zi + 1), u), L(h(xi, yi + 1, zi + 1), h(xi + 1, yi + 1, zi + 1), u), v), w);
    };
  }
  const PAL = ['#1c0614', '#3e0f2e', '#7a2354', '#b5427c', '#e0559a', '#ec65aa', '#f478b8', '#fa8cc6'].map(hex);
  function palette(v) {
    v = Math.max(0, Math.min(0.9999, v)) * (PAL.length - 1);
    const i = Math.floor(v), f = v - i, e = f * f * (3 - 2 * f);
    return [0, 1, 2].map(k => PAL[i][k] + (PAL[i + 1][k] - PAL[i][k]) * e);
  }
  const norm = a => { const l = Math.hypot(...a); return a.map(v => v / l); };
  function makeCraters(r) {
    const out = [];
    for (let i = 0; i < 420; i++) {
      let c; do { c = norm([r() * 2 - 1, r() * 2 - 1, r() * 2 - 1]); } while (false);
      const rad = 0.01 + 0.085 * Math.pow(r(), 3.8);
      out.push({ c, rad, cos2: Math.cos(rad * 2.2), depth: 0.5 + 0.5 * r(), ray: 0 });
    }
    [[-0.12, -0.55, 0.83, 0.03], [0.38, 0.2, 0.9, 0.024], [-0.5, 0.3, 0.81, 0.02], [0.3, -0.25, -0.92, 0.026], [-0.7, 0.45, -0.55, 0.022]].forEach(([x, y, z, rad]) =>
      { const c = norm([x, y, z]), tx = norm([-c[1], c[0], 0]), ty = [c[1] * tx[2] - c[2] * tx[1], c[2] * tx[0] - c[0] * tx[2], c[0] * tx[1] - c[1] * tx[0]];
        out.push({ c, rad, cos2: Math.cos(rad * 14), reach: rad * 14, depth: 0.9, ray: 1, seed: r() * 100, tx, ty }); });
    // bucket craters on an 8³ direction grid so each point only tests nearby craters
    const GN = 8, grid = Array.from({ length: GN * GN * GN }, () => []), cellOf = v => Math.min(GN - 1, Math.max(0, Math.floor((v + 1) / 2 * GN)));
    for (const k of out) {
      const reach = k.reach || k.rad * 2.2, lo = k.c.map(v => cellOf(v - reach)), hi = k.c.map(v => cellOf(v + reach));
      for (let a = lo[0]; a <= hi[0]; a++) for (let b = lo[1]; b <= hi[1]; b++) for (let e = lo[2]; e <= hi[2]; e++) grid[(a * GN + b) * GN + e].push(k);
    }
    return n => grid[(cellOf(n[0]) * GN + cellOf(n[1])) * GN + cellOf(n[2])];
  }
  function albedo(n, N1, N2, CR) {
    const [x, y, z] = n;
    const m = N1(x * 1.7 + 4, y * 1.7, z * 1.7) * 0.65 + N1(x * 3.8, y * 3.8 + 9, z * 3.8) * 0.35;
    const mare = Math.min(1, Math.max(0, (m - 0.48) / 0.1)) * (0.75 + 0.25 * N2(x * 9, y * 9, z * 9));
    let v = 0.8 - 0.42 * mare + 0.1 * (N2(x * 22 + 3, y * 22, z * 22) - 0.5);
    for (const k of CR(n)) {
      const d = x * k.c[0] + y * k.c[1] + z * k.c[2];
      if (d < k.cos2) continue;
      if (k.ray) {
        const a = Math.acos(Math.min(1, d)), u = a / k.rad;
        if (u < 1) v += (u < 0.75 ? -0.05 : 0.22);
        else if (u < 14) {
          const tx = k.tx, ty = k.ty;
          const az = Math.atan2(x * ty[0] + y * ty[1] + z * ty[2], x * tx[0] + y * tx[1] + z * tx[2]);
          const ray = Math.pow(N2(Math.cos(az) * 5 + k.seed, Math.sin(az) * 5, k.seed), 6) * 9;
          v += Math.min(0.4, ray * 0.12) * Math.exp(-u / 5) + 0.12 * Math.exp(-(u - 1) * 0.9);
        }
        continue;
      }
      const u = Math.acos(Math.min(1, d)) / k.rad;
      if (u < 0.78) v -= 0.2 * k.depth * (1 - u * 0.4);
      else if (u < 1.12) v += 0.28 * k.depth * Math.exp(-Math.pow((u - 0.95) / 0.1, 2));
      else if (u < 2.2) v += 0.05 * k.depth * (2.2 - u);
    }
    return v;
  }

  const N_TOTAL = 38000 + 46000 + 280000;
  function* buildStatic(out) {
    const P = out.P, C = out.C, K = out.K, r = rngF(9187); let w = 0;
    const push = (p, c, k) => { const o = w * 3; P[o] = p[0]; P[o + 1] = p[1]; P[o + 2] = p[2]; C[o] = c[0]; C[o + 1] = c[1]; C[o + 2] = c[2]; K[o] = k[0]; K[o + 1] = k[1]; K[o + 2] = k[2]; w++; };
    const mw = norm([-0.55, 0.7, -0.45]), e1 = norm([mw[1], -mw[0], 0]), e2 = [mw[1] * e1[2] - mw[2] * e1[1], mw[2] * e1[0] - mw[0] * e1[2], mw[0] * e1[1] - mw[1] * e1[0]];
    const mwc = ['#ffffff', '#ffe4ef', '#f3d9ff', '#ffd0e4'].map(hex);
    for (let i = 0; i < 38000; i++) {
      const a = r() * TAU, off = (r() + r() + r() - 1.5) * 0.2 * (0.7 + 0.6 * Math.sin(a * 3 + 1) * Math.sin(a * 5));
      const d = norm([0, 1, 2].map(k => Math.cos(a) * e1[k] + Math.sin(a) * e2[k] + mw[k] * off));
      const c = mwc[Math.floor(r() * mwc.length)], b = 0.1 + 0.32 * Math.pow(r(), 3);
      push(d.map(v => v * 80), c.map(v => v * b), [0, 1, r()]);
    }
    const sky = ['#ffffff', '#ffffff', '#fff0f6', '#ffd6e6', '#ffb3d1', '#f6c8ff', '#ff8cc0', '#ffe9d6'].map(hex);
    for (let i = 0; i < 46000; i++) {
      const u = r() * 2 - 1, a = r() * TAU, s = Math.sqrt(1 - u * u), m = Math.pow(r(), 3.4);
      const c = sky[Math.floor(r() * sky.length)], b = 0.7 + 1.2 * m;
      push([s * Math.cos(a) * 80, u * 80, s * Math.sin(a) * 80], c.map(v => v * b), [0, r() < 0.06 ? 2.4 : 1.3, r()]);
    }
    const N1 = noise3(311), N2 = noise3(312), CR = makeCraters(r);
    const NF = 280000, GA = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < NF; i++) {
      const u = 1 - 2 * (i + 0.5 + (r() - 0.5) * 0.9) / NF; 
      const a = i * GA + (r() - 0.5) * 0.0032 / Math.max(0.05, Math.sqrt(1 - u * u)), s = Math.sqrt(1 - u * u), n = [s * Math.cos(a), s * Math.sin(a), u];
      const c = palette(albedo(n, N1, N2, CR) * (0.96 + 0.08 * r()));
      push(n, c, [1, r() < 0.015 ? 5.6 : 4.7, r()]);
      if (i % 12000 === 11999) yield;
    }
    const hIn = hex('#ff8cc0'), hOut = hex('#c45488');
    for (let i = 0; i < 0; i++) {
      const n = norm([r() * 2 - 1, r() * 2 - 1, r() * 2 - 1]), h = -Math.log(1 - r() * 0.985) / 3.2, rad = 1.004 + h * 0.09;
      const k = Math.min(1, h / 0.9), c = [0, 1, 2].map(j => hIn[j] + (hOut[j] - hIn[j]) * k), b = 0.42 * Math.exp(-h * 1.0);
      push(n.map(v => v * rad), c.map(v => v * b), [2, 1, r()]);
    }
    const dc = ['#ffb3d1', '#ff8cc0', '#ffe0ec', '#e984b0'].map(hex);
    for (let i = 0; i < 0; i++) {
      const rad = 1.08 + Math.pow(r(), 1.6) * 2.8, b = 0.22 * Math.exp(-(rad - 1.08) * 0.8) * (0.4 + 0.6 * r());
      const c = dc[Math.floor(r() * dc.length)];
      push([r() * TAU, rad, (r() - 0.5) * 0.6], c.map(v => v * b), [3, r() < 0.05 ? 1.6 : 0.9, r()]);
    }
    nStatic = w;
  }
  function vao(P, C, K, dyn) {
    const v = gl.createVertexArray(); gl.bindVertexArray(v);
    const bufs = [P, C, K].map((d, i) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, d, dyn ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW); gl.enableVertexAttribArray(i); gl.vertexAttribPointer(i, 3, gl.FLOAT, false, 0, 0); return b; });
    gl.bindVertexArray(null);
    return { v, bufs };
  }
  S.init = function () {
    glc = document.createElement('canvas'); glc.width = W; glc.height = H;
    gl = glc.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' });
    if (!gl) return false;
    compile();
    metData = { P: new Float32Array(MET_MAX * 3), C: new Float32Array(MET_MAX * 3), K: new Float32Array(MET_MAX * 3) };
    vaoMet = vao(metData.P, metData.C, metData.K, true);
    const g = { P: new Float32Array(N_TOTAL * 3), C: new Float32Array(N_TOTAL * 3), K: new Float32Array(N_TOTAL * 3) }, it = buildStatic(g);
    S.whenReady = new Promise(res => { const step = () => { if (it.next().done) { vaoStatic = vao(g.P, g.C, g.K, false); S.ready = true; res(); } else setTimeout(step, 0); }; setTimeout(step, 0); });
    return true;
  };
  S.resize = function (w, h) { glc.width = w; glc.height = h; };

  const FOCAL = 2.25;
  function camera(t) {
    const phi = 0.42 * Math.sin(TAU * t / 960) + 0.12 * Math.sin(TAU * t / 410 + 1.3), el = 0.16 * Math.sin(TAU * t / 740 + 0.7);
    const D = 6.3 - 0.5 * (1 - Math.exp(-t / 500)) + 0.75 * Math.sin(TAU * t / 620 + 2.1);
    const cam = [D * Math.cos(el) * Math.sin(phi), D * Math.sin(el), D * Math.cos(el) * Math.cos(phi)];
    const f = norm(cam.map(v => -v)), rr = norm([-f[2], 0, f[0]]);
    const u = [rr[1] * f[2] - rr[2] * f[1], rr[2] * f[0] - rr[0] * f[2], rr[0] * f[1] - rr[1] * f[0]];
    const roll = 0.09 * Math.sin(TAU * t / 830), cr = Math.cos(roll), sr = Math.sin(roll);
    return { cam, f, r: rr.map((v, i) => v * cr + u[i] * sr), u: u.map((v, i) => v * cr - rr[i] * sr) };
  }
  function buildMeteors(t, C, freq) {
    const SL = 5, cur = Math.floor(t / SL), asp = H / W; let n = 0;
    const put = (ux, uy, c, b, sz) => {
      if (n >= MET_MAX) return;
      const d = [0, 1, 2].map(i => C.f[i] * FOCAL + C.r[i] * ux + C.u[i] * uy), l = Math.hypot(...d);
      for (let i = 0; i < 3; i++) { metData.P[n * 3 + i] = C.cam[i] + d[i] / l * 60; metData.C[n * 3 + i] = c[i] * b; }
      metData.K[n * 3] = 4; metData.K[n * 3 + 1] = sz; metData.K[n * 3 + 2] = 0; n++;
    };
    for (let k = cur - 1; k <= cur; k++) {
      if (k < 3) continue;
      const r = rngF(k * 77291 + 13);
      if (freq <= 0) continue;
      const t0 = k * SL + r() * 1.2, dur = 0.8 + r() * 0.9, u = (t - t0) / dur;
      if (u < 0 || u > 1) continue;
      const sx = -0.92 + r() * 1.84, sy = asp * (0.1 + r() * 0.85), dir = r() < 0.5 ? -1 : 1, ang = 0.3 + r() * 0.45;
      const L = 0.22 + r() * 0.26, dist = L * 1.6, dx = Math.cos(ang) * dir, dy = -Math.sin(ang), e = 1 - Math.pow(1 - u, 2);
      const hx = sx + dx * dist * e, hy = sy + dy * dist * e, fade = Math.sin(Math.PI * Math.min(1, u * 1.1)), tl = L * (0.35 + 0.65 * Math.min(1, u * 3));
      put(hx, hy, [1, 0.8, 0.92], fade * 1.7, 3.2); put(hx, hy, [1, 0.45, 0.72], fade * 0.6, 6);
      for (let i = 1; i < 160; i++) { const f = i / 160; put(hx - dx * tl * f, hy - dy * tl * f, [1, 0.38 + 0.2 * (1 - f), 0.7], fade * Math.pow(1 - f, 1.3) * 1.4, 2); }
    }
    return n;
  }
  S.draw = function (x, t, o) {
    o = o || {}; t = Math.max(0, t || 0);
    x.fillStyle = '#000'; x.fillRect(0, 0, W, H);
    if (!S.ready) return;
    const C = camera(t);
    const sa = 0.3 + 0.45 * Math.sin(TAU * t / 1150), se = 0.12 + 0.12 * Math.sin(TAU * t / 1700);
    const sun = [Math.sin(sa) * Math.cos(se), Math.sin(se), Math.cos(sa) * Math.cos(se)];
    // she turns: one full revolution every 7 min on a tilted axis that slowly nods
    const ly = t * TAU / 420, lx = 0.24 + 0.1 * Math.sin(TAU * t / 1100);
    const cy = Math.cos(ly), sy = Math.sin(ly), cx = Math.cos(lx), sx = Math.sin(lx);
    // Ry(ly) * Rx(lx), column-major
    const lib = [cy, 0, -sy, sy * sx, cx, cy * sx, sy * cx, -sx, cy * cx];
    gl.viewport(0, 0, glc.width, glc.height);
    gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(prog);
    gl.uniform3fv(U.uCam, C.cam); gl.uniform3fv(U.uF, C.f); gl.uniform3fv(U.uR, C.r); gl.uniform3fv(U.uU, C.u); gl.uniform3fv(U.uSun, sun);
    gl.uniform1f(U.uFocal, FOCAL); gl.uniform1f(U.uAsp, glc.width / glc.height); gl.uniform1f(U.uPx, glc.height / 1080); gl.uniform1f(U.uT, t);
    gl.uniformMatrix3fv(U.uLib, false, lib);
    gl.bindVertexArray(vaoStatic.v); gl.drawArrays(gl.POINTS, 0, nStatic);
    const nm = buildMeteors(t, C, o.meteors == null ? 1 : o.meteors);
    if (nm) {
      gl.bindVertexArray(vaoMet.v);
      [metData.P, metData.C, metData.K].forEach((d, i) => { gl.bindBuffer(gl.ARRAY_BUFFER, vaoMet.bufs[i]); gl.bufferSubData(gl.ARRAY_BUFFER, 0, d, 0, nm * 3); });
      gl.drawArrays(gl.POINTS, 0, nm);
    }
    gl.bindVertexArray(null);
    x.drawImage(glc, 0, 0, W, H);
  };
  return S;
})();
