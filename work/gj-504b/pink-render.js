/* ============================================================================
 * FOCUSFIELD · PINK PLANET (GJ 504 b) — point-field renderer (Portals style)
 * GJ 504 b is a young gas giant ~57 light-years away that glows a deep
 * magenta-pink from its own heat. Built like every FocusField world: ~200k
 * single light points on black, additively blended.
 *   · GLOBE   ~170k points coloured by a banded, turbulent cloud field with
 *             swirling storms. Each latitude turns at its own rate
 *             (differential rotation), so the bands slowly slide past each
 *             other and the storms drift. Night side glows faintly (the
 *             planet is still hot from its formation).
 *   · HAZE    a thin shell of rose-violet points that lights up at the limb.
 *   · SKY     brand-palette stars, a point-built Milky Way, pixel meteors.
 * WebGL2 soft point sprites · every frame a pure function of t.
 * API: PinkScene.init() → bool · .draw(ctx2d, t, opts) · .resize(w, h)
 * ==========================================================================*/
window.PinkScene = (function () {
  const W = 1920, H = 1080, TAU = Math.PI * 2;
  const S = { ready: false };
  let gl, glc, prog, U = {}, vaoStatic, vaoMet, nStatic = 0, metData;
  const MET_MAX = 400;

  function rngF(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const hex = h => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];

  const VS = `#version 300 es
precision highp float;
layout(location=0) in vec3 aP; layout(location=1) in vec3 aC; layout(location=2) in vec3 aK; // kind, size, seed
uniform vec3 uCam, uF, uR, uU, uSun; uniform float uFocal, uAsp, uPx, uT, uSpin; uniform mat3 uTilt;
out vec3 vC;
const float FL = 0.965;
float hitT(vec3 ro, vec3 rd){
  vec3 o = vec3(ro.x, ro.y / FL, ro.z), d = vec3(rd.x, rd.y / FL, rd.z);
  float a = dot(d, d), b = dot(o, d), c = dot(o, o) - 1., h = b * b - a * c;
  if (h < 0.) return -1.; return (-b - sqrt(h)) / a;
}
vec3 sph(float lat, float lon, float r){ return vec3(cos(lat) * cos(lon), sin(lat) * FL, cos(lat) * sin(lon)) * r; }
float omega(float lat){ return 6.2832 / 4000. * (1. + .06 * cos(lat * 11.) * (1. - .5 * abs(sin(lat))) + .02 * cos(lat * 27. + 1.3)); }
void main(){
  float kind = aK.x, sz = aK.y, sd = aK.z;
  vec3 p, col = aC; float br = 1.;
  if (kind < .5) { p = aP; br = .82 + .18 * sin(uT * (.35 + sd * 1.6) + sd * 90.); }
  else if (kind < 1.5) {
    float lat = aP.x, lon = aP.y + uSpin + uT * omega(lat);
    p = uTilt * sph(lat, lon, 1.);
    vec3 n = normalize(p), toCam = normalize(uCam - p);
    float facing = dot(n, toCam);
    if (facing < -.02) { gl_Position = vec4(2., 2., 2., 1.); gl_PointSize = 0.; return; }
    float mu = dot(n, uSun);
    float day = smoothstep(-.12, .6, mu) * (.55 + .45 * max(mu, 0.));
    vec3 glow = vec3(.42, .05, .3) * .12;
    col = aC * (.7 + 2.6 * day) + glow * 1.8 * (1. - smoothstep(-.1, .35, mu));
    col *= 1.9 / max(1.9, max(col.r, max(col.g, col.b)));
    col += vec3(1., .22, .66) * pow(1. - max(facing, 0.), 3.) * .16 * (.3 + .7 * smoothstep(-.2, .5, mu));
    br = mix(.7, 1., smoothstep(0., .3, facing));
  } else if (kind < 2.5) {
    float lat = aP.x, lon = aP.y + uSpin * 1.02 + uT * omega(lat);
    p = uTilt * sph(lat, lon, aP.z);
    vec3 n = normalize(p), toCam = normalize(uCam - p);
    float f = abs(dot(n, toCam)), mu = dot(n, uSun);
    br = pow(1. - f, 3.2) * (.3 + .7 * smoothstep(-.4, .45, mu)) * 2.2;
    if (br < .01) { gl_Position = vec4(2., 2., 2., 1.); gl_PointSize = 0.; return; }
  } else { p = aP; }
  vec3 rel = p - uCam; float dist = length(rel);
  if (kind != 1.) { float th = hitT(uCam, rel / dist); if (th > 0. && th < dist - .001) { gl_Position = vec4(2., 2., 2., 1.); gl_PointSize = 0.; return; } }
  vec3 v = vec3(dot(rel, uR), dot(rel, uU), dot(rel, uF));
  if (v.z < .05) { gl_Position = vec4(2., 2., 2., 1.); gl_PointSize = 0.; return; }
  gl_Position = vec4(uFocal * v.x / v.z, uFocal * v.y / v.z * uAsp, 0., 1.);
  gl_PointSize = (sz + 0.9) * uPx;
  vC = col * br * (sz > 1.5 ? 1.1 : 1.) * (kind == 1. ? 1.15 : 1.);
}`;
  const FS = `#version 300 es
precision highp float; in vec3 vC; out vec4 o; void main(){ vec2 q = gl_PointCoord * 2. - 1.; float w = exp(-dot(q, q) * 3.4); if (w < .03) discard; o = vec4(vC * w * 1.15, 1.); }`;

  function compile() {
    const mk = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    prog = gl.createProgram(); gl.attachShader(prog, mk(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    ['uCam', 'uF', 'uR', 'uU', 'uSun', 'uFocal', 'uAsp', 'uPx', 'uT', 'uSpin', 'uTilt'].forEach(k => U[k] = gl.getUniformLocation(prog, k));
  }

  // --------------------------------------------------------------- cloud field
  function noise3(seed) {
    const P = new Uint8Array(512), r = rngF(seed), p = []; for (let i = 0; i < 256; i++) p.push(i);
    for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
    for (let i = 0; i < 512; i++) P[i] = p[i & 255];
    const h = (x, y, z) => P[(P[(P[x & 255] + y) & 255] + z) & 255] / 255;
    return (x, y, z) => {
      const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi;
      const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
      const L = (a, b, t) => a + (b - a) * t;
      return L(L(L(h(xi, yi, zi), h(xi + 1, yi, zi), u), L(h(xi, yi + 1, zi), h(xi + 1, yi + 1, zi), u), v),
               L(L(h(xi, yi, zi + 1), h(xi + 1, yi, zi + 1), u), L(h(xi, yi + 1, zi + 1), h(xi + 1, yi + 1, zi + 1), u), v), w);
    };
  }
  const PAL = ['#1a0118', '#4a0440', '#940868', '#d80c84', '#ff1896', '#ff32a6', '#ff52b6', '#ff78c6'].map(hex);
  function palette(v) {
    v = Math.max(0, Math.min(0.9999, v)) * (PAL.length - 1);
    const i = Math.floor(v), f = v - i, e = f * f * (3 - 2 * f);
    return [0, 1, 2].map(k => PAL[i][k] + (PAL[i + 1][k] - PAL[i][k]) * e);
  }
  const STORMS = [[0.32, 1.1, 0.16], [-0.46, 3.6, 0.12], [0.08, 5.0, 0.09], [-0.18, 2.2, 0.07], [0.62, 4.3, 0.1]];
  function cloud(lat, lon, N1, N2) {
    let x = Math.cos(lat) * Math.cos(lon), y = Math.sin(lat), z = Math.cos(lat) * Math.sin(lon);
    let sw = 0, glow = 0;
    for (const [sl, sn, sr] of STORMS) {
      const dl = lat - sl, dn = Math.atan2(Math.sin(lon - sn), Math.cos(lon - sn)) * Math.cos(sl), d = Math.hypot(dl, dn * 0.7);
      if (d < sr * 2.2) { const k = Math.exp(-Math.pow(d / sr, 2)); sw += k * 5 * (sl > 0 ? 1 : -1); glow = Math.max(glow, k); }
    }
    if (sw) { const c = Math.cos(sw * 0.3), s = Math.sin(sw * 0.3); const nx = x * c - z * s, nz = x * s + z * c; x = nx; z = nz; }
    const warp = (N1(x * 2.2 + 3, y * 2.2, z * 2.2) - 0.5) * 0.9;
    const t1 = N1(x * 4 + 11, y * 9, z * 4) - 0.5, t2 = N2(x * 11, y * 22 + 5, z * 11) - 0.5;
    const band = Math.sin((lat + warp * 0.12 + t1 * 0.05) * 11) * 0.5 + 0.5;
    const band2 = Math.sin((lat + t1 * 0.08) * 27 + 1.3) * 0.5 + 0.5;
    let v = 0.12 + 0.62 * band + 0.16 * band2 + 0.14 * t2 + 0.1 * t1;
    v = v * (1 - 0.35 * Math.pow(Math.abs(y), 3));
    v = v + glow * 0.35 * (0.6 + 0.4 * Math.sin(sw * 2));
    return palette(v);
  }

  function buildStatic() {
    const P = [], C = [], K = [], r = rngF(5051);
    const push = (p, c, k) => { P.push(p[0], p[1], p[2]); C.push(c[0], c[1], c[2]); K.push(k[0], k[1], k[2]); };
    // Milky Way made of points
    const mwN = [0.35, 0.82, -0.45], ml = Math.hypot(...mwN), mw = mwN.map(v => v / ml);
    const e1 = [mw[1], -mw[0], 0].map(v => v / Math.hypot(mw[1], mw[0])), e2 = [mw[1] * e1[2] - mw[2] * e1[1], mw[2] * e1[0] - mw[0] * e1[2], mw[0] * e1[1] - mw[1] * e1[0]];
    const mwc = ['#eef4ff', '#ffe9a8', '#ffc0e0', '#b8ccff', '#ffffff', '#d8b8ff'].map(hex);
    for (let i = 0; i < 60000; i++) {
      const a = r() * TAU, off = (r() + r() + r() - 1.5) * 0.22 * (0.7 + 0.6 * Math.sin(a * 3 + 1) * Math.sin(a * 7));
      const d = [0, 1, 2].map(k => Math.cos(a) * e1[k] + Math.sin(a) * e2[k] + mw[k] * off), dl = Math.hypot(...d);
      const c = mwc[Math.floor(r() * mwc.length)], b = 0.14 + 0.4 * Math.pow(r(), 3);
      push(d.map(v => v / dl * 80), c.map(v => v * b), [0, 1, r()]);
    }
    const sky = ['#7cc1ff', '#eef4ff', '#eef4ff', '#ffffff', '#ffc04d', '#ffe9a8', '#ff5fae', '#b07cff'].map(hex);
    for (let i = 0; i < 32000; i++) {
      const u = r() * 2 - 1, a = r() * TAU, s = Math.sqrt(1 - u * u), m = Math.pow(r(), 3.2);
      const c = sky[Math.floor(r() * sky.length)], b = 0.45 + 0.75 * m;
      push([s * Math.cos(a) * 80, u * 80, s * Math.sin(a) * 80], c.map(v => v * b), [0, r() < 0.035 ? 2 : 1, r()]);
    }
    // globe
    const N1 = noise3(71), N2 = noise3(72), NG = 140000, ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < NG; i++) {
      const lat = Math.asin(r() * 2 - 1), lon = r() * TAU;
      const c = cloud(lat, lon, N1, N2), j = 0.94 + 0.12 * r();
      push([lat, lon, 0], c.map(v => Math.min(1, v * j)), [1, r() < 0.015 ? 2 : 1, r()]);
    }
    // haze shell
    const hzIn = hex('#ff4fa8'), hzOut = hex('#8a5cff');
    for (let i = 0; i < 70000; i++) {
      const u = r() * 2 - 1, lat = Math.asin(u), lon = r() * TAU, h = -Math.log(1 - r() * 0.985) / 4.2, rad = 1.004 + h * 0.07;
      const k = Math.min(1, h / 0.9), c = [0, 1, 2].map(j => hzIn[j] + (hzOut[j] - hzIn[j]) * k), b = 0.34 * Math.exp(-h * 1.1);
      push([lat, lon, rad], c.map(v => v * b), [2, 1, r()]);
    }
    nStatic = P.length / 3;
    return { P: new Float32Array(P), C: new Float32Array(C), K: new Float32Array(K) };
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
    const g = buildStatic();
    vaoStatic = vao(g.P, g.C, g.K, false);
    metData = { P: new Float32Array(MET_MAX * 3), C: new Float32Array(MET_MAX * 3), K: new Float32Array(MET_MAX * 3) };
    vaoMet = vao(metData.P, metData.C, metData.K, true);
    S.ready = true;
    return true;
  };
  S.resize = function (w, h) { glc.width = w; glc.height = h; };

  function camera(t, sway) {
    const phi = 0.4 + t * TAU / 8000 + 0.3 * Math.sin(TAU * t / 1800) * sway;
    const el = 0.16 + 0.06 * Math.sin(TAU * t / 1400 + 0.5) * sway;
    const D = 5.2 + 0.25 * Math.sin(TAU * t / 2000 + 1.4) * sway;
    const cam = [D * Math.cos(el) * Math.sin(phi), D * Math.sin(el), D * Math.cos(el) * Math.cos(phi)];
    let f = cam.map(v => -v); const fl = Math.hypot(...f); f = f.map(v => v / fl);
    let rr = [-f[2], 0, f[0]]; const rl = Math.hypot(...rr); rr = rr.map(v => v / rl);
    const u = [rr[1] * f[2] - rr[2] * f[1], rr[2] * f[0] - rr[0] * f[2], rr[0] * f[1] - rr[1] * f[0]];
    const roll = 0.12 + 0.025 * Math.sin(TAU * t / 1100) * sway, cr = Math.cos(roll), sr = Math.sin(roll);
    return { cam, f, r: rr.map((v, i) => v * cr + u[i] * sr), u: u.map((v, i) => v * cr - rr[i] * sr), phi };
  }
  const FOCAL = 2.25;

  function buildMeteors(t, C, freq) {
    const SL = 6, cur = Math.floor(t / SL), asp = H / W; let n = 0;
    const put = (ux, uy, c, b, sz) => {
      if (n >= MET_MAX) return;
      const d = [0, 1, 2].map(i => C.f[i] * FOCAL + C.r[i] * ux + C.u[i] * uy), l = Math.hypot(...d);
      for (let i = 0; i < 3; i++) { metData.P[n * 3 + i] = C.cam[i] + d[i] / l * 60; metData.C[n * 3 + i] = c[i] * b; }
      metData.K[n * 3] = 4; metData.K[n * 3 + 1] = sz; metData.K[n * 3 + 2] = 0; n++;
    };
    for (let k = cur - 1; k <= cur; k++) {
      if (k < 3) continue;
      const r = rngF(k * 130363 + 29);
      if (r() > 0.42 * freq) continue;
      const t0 = k * SL + r() * 3.5, dur = 0.7 + r() * 0.9, u = (t - t0) / dur;
      if (u < 0 || u > 1) continue;
      const sx = -0.92 + r() * 1.84, sy = asp * (0.05 + r() * 0.9), dir = r() < 0.5 ? -1 : 1, ang = 0.25 + r() * 0.5;
      const L = 0.17 + r() * 0.28, dist = L * 1.7, warm = r() < 0.45;
      const dx = Math.cos(ang) * dir, dy = -Math.sin(ang), e = 1 - Math.pow(1 - u, 2);
      const hx = sx + dx * dist * e, hy = sy + dy * dist * e, fade = Math.sin(Math.PI * Math.min(1, u * 1.1)), tl = L * (0.35 + 0.65 * Math.min(1, u * 3));
      const col = warm ? [1, 0.7, 0.88] : [0.8, 0.88, 1];
      put(hx, hy, [1, 1, 1], fade, 2);
      for (let i = 1; i < 120; i++) { const f = i / 120; put(hx - dx * tl * f, hy - dy * tl * f, col, fade * Math.pow(1 - f, 1.6) * 0.9, 1); }
    }
    return n;
  }

  S.draw = function (x, t, o) {
    o = o || {};
    x.fillStyle = '#000'; x.fillRect(0, 0, W, H);
    if (!S.ready) return;
    const C = camera(t, o.sway == null ? 1 : o.sway);
    // host star light follows the orbit loosely so the planet stays mostly lit
    const sa = C.phi + 0.62 + 0.2 * Math.sin(TAU * t / 1700), se = 0.3;
    const sun = [Math.cos(se) * Math.sin(sa), Math.sin(se), Math.cos(se) * Math.cos(sa)];
    gl.viewport(0, 0, glc.width, glc.height);
    gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(prog);
    gl.uniform3fv(U.uCam, C.cam); gl.uniform3fv(U.uF, C.f); gl.uniform3fv(U.uR, C.r); gl.uniform3fv(U.uU, C.u); gl.uniform3fv(U.uSun, sun);
    gl.uniform1f(U.uFocal, FOCAL); gl.uniform1f(U.uAsp, glc.width / glc.height); gl.uniform1f(U.uPx, glc.height / 1080); gl.uniform1f(U.uT, t);
    // steady rotation: constant spin, fixed axis with a very slow precession
    const spin = t * TAU / 210;
    const tilt = 0.34, prec = TAU * t / 420;
    const ct = Math.cos(tilt), st = Math.sin(tilt), cp = Math.cos(prec), sp = Math.sin(prec);
    // Ry(prec) * Rz(tilt), column-major
    gl.uniformMatrix3fv(U.uTilt, false, [cp * ct, st, -sp * ct, -cp * st, ct, sp * st, sp, 0, cp]);
    gl.uniform1f(U.uSpin, spin);
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
