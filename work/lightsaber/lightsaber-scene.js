import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'https://esm.sh/three@0.160.0/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/OutputPass.js';
import { CSS2DRenderer, CSS2DObject } from 'https://esm.sh/three@0.160.0/examples/jsm/renderers/CSS2DRenderer.js';

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const MOON = new THREE.Color(0xe8eccc), WHITE = new THREE.Color(0xffffff);
const std = (c, r, m, x = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, ...x });
const phys = (c, r, m, x = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: r, metalness: m, ...x });
const H1 = new THREE.Color(0x3f8fd6), H2 = new THREE.Color(0xffb84a), H3 = new THREE.Color(0xff4a22);
const heatInto = (o, t) => { const k = clamp((t - 30) / 60); return k < .5 ? o.copy(H1).lerp(H2, k / .5) : o.copy(H2).lerp(H3, (k - .5) / .5); };
const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);

function lathe(pts, mat, seg = 72) {
  const g = new THREE.LatheGeometry(pts.map(([r, x]) => new THREE.Vector2(r, x)), seg);
  g.rotateZ(-Math.PI / 2); g.computeVertexNormals(); return new THREE.Mesh(g, mat);
}
const ring = (r, tube, mat, x = 0) => { const t = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 12, 96), mat); t.rotation.y = Math.PI / 2; t.position.x = x; return t; };

export function mount(el, cb = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .92;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;outline:none;cursor:grab;touch-action:none';
  el.appendChild(renderer.domElement);
  const labelR = new CSS2DRenderer();
  labelR.domElement.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
  el.appendChild(labelR.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0908);
  scene.fog = new THREE.Fog(0x0a0908, 90, 260);
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, .1, 1000);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = .08; controls.enableZoom = false; controls.enablePan = false;
  controls.minDistance = 8; controls.maxDistance = 140; controls.autoRotateSpeed = .45;
  let lastInteract = performance.now();
  controls.addEventListener('start', () => { lastInteract = performance.now(); controls.autoRotate = false; camAnim = null; });

  scene.add(new THREE.HemisphereLight(0xdfe4d0, 0x0a0908, .35));
  const key = new THREE.DirectionalLight(0xfff6e8, 2.2); key.position.set(18, 30, 22); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -45, right: 45, top: 30, bottom: -30, near: 1, far: 140 }); key.shadow.bias = -.0004;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xc8d4ff, 1.3); rim.position.set(-25, 10, -20); scene.add(rim);
  const kLight = new THREE.PointLight(0xe8eccc, 0, 60, 1); scene.add(kLight);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.ShadowMaterial({ opacity: .5 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -7; floor.receiveShadow = true; scene.add(floor);
  const grid = new THREE.GridHelper(260, 65, 0x2a2724, 0x1a1917); grid.position.y = -6.99; grid.material.transparent = true; grid.material.opacity = .55; scene.add(grid);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(512, 512), .65, .35, 1.0));
  composer.addPass(new OutputPass());

  const opts = { config: 'single', finish: 'chrome', dark: false, level: 'saber', explode: .5, power: .7, color: '#E8ECCC', heat: false, flow: true, selected: null, hover: null, temps: {}, shiftX: 0 };
  const KY = new THREE.Color(opts.color);
  const colorMats = [], bladeMats = [], crystalMats = [];
  const glowBase = op => new THREE.MeshBasicMaterial({ color: KY.clone(), transparent: true, opacity: op, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending });
  const cg = (op = 1) => { const m = glowBase(op); m.userData.op = op; colorMats.push(m); return m; };
  const bg = (op = 1) => { const m = glowBase(op); m.userData.op = op; bladeMats.push(m); return m; };
  const glowMat = (op, pw) => { const m = new THREE.ShaderMaterial({ uniforms: { uColor: { value: KY.clone() }, uOp: { value: op }, uPow: { value: pw } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 uColor; uniform float uOp; uniform float uPow; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0), uPow); gl_FragColor = vec4(uColor * f * uOp, 1.0); }',
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }); m.userData.op = op; bladeMats.push(m); return m; };
  const crystalMat = () => { const m = phys(0xffffff, .06, 0, { transmission: .5, thickness: 1.2, ior: 2.0, emissive: KY.clone(), emissiveIntensity: 1, flatShading: true, transparent: true, opacity: .96, clearcoat: 1 }); m.userData.noClone = true; crystalMats.push(m); return m; };
  const M = { steel: std(0xa9adb2, .3, 1), chrome: std(0xe8eaec, .12, 1), gun: std(0x2b2c2f, .42, .85), black: std(0x121212, .8, .15), rubber: std(0x161616, .92, 0), brass: std(0xc2a15e, .28, 1), copper: std(0xb87a4b, .3, 1), dark: std(0x1c1c1e, .55, .6), leather: std(0x3b2618, .85, 0) };
  const glass = () => phys(0xffffff, .02, 0, { transmission: 1, thickness: .5, ior: 1.52, transparent: true });

  const dotTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  function mkFlow(parent, n = 70, size = .5) {
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    const m = new THREE.PointsMaterial({ color: KY.clone(), size, map: dotTex, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
    m.userData.op = 1; colorMats.push(m);
    const p = new THREE.Points(geo, m); p.renderOrder = 10; p.frustumCulled = false; parent.add(p); return { p, n, geo };
  }
  function runFlow(F, fn, speed = .22) {
    F.p.visible = opts.flow && P > .02; if (!F.p.visible) return;
    const a = F.geo.attributes.position;
    for (let i = 0; i < F.n; i++) { const u = (i / F.n + T * speed * (.4 + P)) % 1; const v = fn(u, i); a.setXYZ(i, v.x, v.y, v.z); }
    a.needsUpdate = true;
  }

  const levels = {}; let cur = null, first = true;
  function mkLevel(name, cam) { const L = { name, g: new THREE.Group(), meshes: [], labels: [], cam, update: () => {} }; L.g.visible = false; scene.add(L.g); levels[name] = L; return L; }
  function tag(obj, part, L) {
    obj.traverse(o => {
      if (!o.isMesh) return; o.userData.part = part; const m = o.material;
      if (!o.userData.tagged) {
        if (m.isMeshStandardMaterial && !m.userData.noClone) { const mk = Object.keys(M).find(k => M[k] === m); if (mk) o.userData.mk = mk; o.material = m.clone(); o.userData.hl = true; }
        if (!m.isMeshBasicMaterial && !m.isShaderMaterial) { o.castShadow = true; o.receiveShadow = true; }
        o.userData.tagged = true;
      }
      L.meshes.push(o);
    });
  }
  function label(L, parent, part, num, text, pos) {
    const d = document.createElement('div');
    d.style.cssText = "font:500 9.5px/1 'Geist Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:#9A958C;white-space:nowrap;padding:4px 7px;background:rgba(10,9,8,.66);border-left:1px solid rgba(232,236,204,.35);transition:color .25s,border-color .25s";
    d.innerHTML = `<span style="color:#E8ECCC;margin-right:6px">${num}</span>${text}`;
    const w = document.createElement('div'); w.appendChild(d); d.style.transition += ',transform .25s ease';
    const o = new CSS2DObject(w); o.position.copy(pos); o.visible = false; parent.add(o);
    L.labels.push({ o, d, part, dy: 0, dx: 0 });
  }

  const HV = { emitter: 'classic', lens: 'sealed', chamber: 'caged', activation: 'stud', grip: 'ribbed', pommel: 'rounded' };
  const TIP = { classic: 10.4, hooded: 9.6, crown: 9.5, ring: 8.9 };
  const box = (w, h, d, m, x, y, z, rx = 0) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.rotation.x = rx; return b; };
  const around = (n, r, fn, off = 0) => { for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + off; fn(Math.cos(a) * r, Math.sin(a) * r, a); } };
  const matrix = (g, gk, x) => { g.add(ring(.45, .05, cg(1 * gk), x)); const md = new THREE.Mesh(new THREE.CircleGeometry(.4, 32), cg(.55 * gk)); md.rotation.y = Math.PI / 2; md.position.x = x + .01; g.add(md); };
  const B = {
    pommel: {
      rounded: g => { g.add(lathe([[0, -14.2], [.72, -14.2], [.95, -14.02], [1.05, -13.6], [1.05, -13.1], [.92, -12.95], [1.12, -12.72], [1.12, -11.9], [1.0, -11.75], [1.0, -11.4], [0, -11.4]], M.steel)); g.add(lathe([[0, -14.26], [.48, -14.26], [.52, -14.18], [0, -14.18]], M.brass)); for (let i = 0; i < 3; i++) g.add(ring(1.11, .035, M.dark, -12.55 + i * .25)); },
      flat: g => { g.add(lathe([[0, -12.7], [1.08, -12.7], [1.08, -11.4], [0, -11.4]], M.steel)); g.add(lathe([[0, -12.78], [.8, -12.78], [.8, -12.7], [0, -12.7]], M.brass)); g.add(ring(1.09, .04, M.dark, -12.2)); },
      talon: g => { g.add(lathe([[0, -12.9], [.9, -12.9], [1.1, -12.5], [1.1, -11.4], [0, -11.4]], M.steel)); around(4, .62, (y, z) => { const c = new THREE.Mesh(new THREE.ConeGeometry(.26, 1.5, 4), M.chrome); c.rotation.z = Math.PI / 2; c.position.set(-13.6, y, z); g.add(c); }, Math.PI / 4); },
      dring: g => { g.add(lathe([[0, -13.0], [.8, -13.0], [1.04, -12.7], [1.04, -11.4], [0, -11.4]], M.steel)); const p = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, .5, 16), M.chrome); p.rotation.z = Math.PI / 2; p.position.x = -13.2; g.add(p); const t = new THREE.Mesh(new THREE.TorusGeometry(.6, .1, 12, 48), M.chrome); t.position.x = -14.0; g.add(t); },
    },
    grip: {
      ribbed: g => { g.add(lathe([[0, -11.4], [.98, -11.4], [.98, -4], [0, -4]], M.gun)); for (let i = 0; i < 9; i++) { const x0 = -11.05 + i * .78; g.add(lathe([[.98, x0], [1.12, x0 + .08], [1.15, x0 + .3], [1.12, x0 + .52], [.98, x0 + .6]], M.rubber, 64)); } },
      leather: g => { g.add(lathe([[0, -11.4], [.98, -11.4], [.98, -4], [0, -4]], M.gun)); for (let i = 0; i < 16; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(1.03, .11, 10, 64), M.leather); t.rotation.set(0, Math.PI / 2 - .14, 0); t.position.x = -11.0 + i * .44; g.add(t); } },
      ridged: g => { g.add(lathe([[0, -11.4], [.98, -11.4], [.98, -4], [0, -4]], M.gun)); around(8, 1.02, (y, z, a) => g.add(box(6.8, .16, .24, M.steel, -7.7, y, z, -a))); g.add(ring(1.05, .08, M.steel, -11.2)); g.add(ring(1.05, .08, M.steel, -4.2)); },
      smooth: g => { g.add(lathe([[0, -11.4], [1.0, -11.4], [1.0, -4], [0, -4]], M.steel)); g.add(ring(1.01, .04, M.dark, -9.5)); g.add(ring(1.01, .04, M.dark, -6)); },
    },
    activation: {
      stud: (g, gk) => { g.add(lathe([[0, -4], [1.0, -4], [1.07, -3.9], [1.07, -1.1], [1.0, -1], [0, -1]], M.chrome)); g.add(box(2.2, .14, .9, M.gun, -2.5, 1.08, 0)); g.add(box(1.15, .3, .58, M.black, -2.5, 1.3, 0)); g.add(box(.5, .05, .26, cg(1 * gk), -2.5, 1.47, 0)); const sw = new THREE.Mesh(new THREE.CylinderGeometry(.18, .18, .3, 24), M.brass); sw.rotation.x = Math.PI / 2; sw.position.set(-1.6, 0, 1.12); g.add(sw); },
      slide: (g, gk) => { g.add(lathe([[0, -4], [1.0, -4], [1.07, -3.9], [1.07, -1.1], [1.0, -1], [0, -1]], M.chrome)); g.add(box(2.6, .12, .5, M.gun, -2.5, 1.08, 0)); g.add(box(2.2, .04, .14, cg(.8 * gk), -2.5, 1.15, 0)); g.add(box(.6, .26, .46, M.black, -3.1, 1.28, 0)); },
      ring: (g, gk) => { g.add(lathe([[0, -4], [1.0, -4], [1.07, -3.9], [1.07, -1.1], [1.0, -1], [0, -1]], M.chrome)); g.add(lathe([[1.07, -3.0], [1.22, -2.9], [1.22, -2.1], [1.07, -2.0]], M.gun)); around(8, 1.22, (y, z, a) => g.add(box(.6, .1, .1, M.dark, -2.5, y, z, -a))); g.add(ring(1.235, .025, cg(.9 * gk), -2.5)); },
      twin: (g, gk) => { g.add(lathe([[0, -4], [1.0, -4], [1.07, -3.9], [1.07, -1.1], [1.0, -1], [0, -1]], M.chrome)); g.add(box(2.8, .12, .8, M.gun, -2.5, 1.08, 0)); g.add(box(.6, .28, .5, M.black, -3.3, 1.26, 0)); g.add(box(.6, .28, .5, M.brass, -1.7, 1.26, 0)); g.add(box(.3, .05, .2, cg(1 * gk), -3.3, 1.42, 0)); },
    },
    chamber: {
      caged: g => { g.add(lathe([[0, -1], [1.04, -1], [1.04, -.5], [0, -.5]], M.steel)); g.add(lathe([[0, 3.5], [1.04, 3.5], [1.04, 4], [0, 4]], M.steel)); around(6, .97, (y, z, a) => g.add(box(4.0, .2, .26, M.steel, 1.5, y, z, -a))); const tube = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, 4, 48, 1, true), phys(0x9aa0a0, .1, 0, { transmission: .9, transparent: true, opacity: .35, side: THREE.DoubleSide })); tube.rotation.z = Math.PI / 2; tube.position.x = 1.5; g.add(tube); g.add(ring(.46, .05, M.brass, .9)); g.add(ring(.46, .05, M.brass, 2.1)); },
      sealed: (g, gk) => { g.add(lathe([[0, -1], [1.04, -1], [1.04, 4], [0, 4]], M.steel)); [0, 1.5, 3].forEach(x => g.add(ring(1.05, .035, M.dark, x))); const port = new THREE.Mesh(new THREE.CircleGeometry(.22, 24), cg(.8 * gk)); port.rotation.x = -Math.PI / 2; port.position.set(1.5, 1.05, 0); g.add(port); },
      window: (g, gk) => { g.add(lathe([[0, -1], [1.02, -1], [1.02, 4], [0, 4]], M.gun)); g.add(box(3.0, .05, .55, phys(0xffffff, .02, 0, { transmission: 1, transparent: true }), 1.5, 1.03, 0)); g.add(box(2.8, .02, .35, cg(.7 * gk), 1.5, 1.0, 0)); g.add(ring(1.04, .06, M.steel, -.8)); g.add(ring(1.04, .06, M.steel, 3.8)); },
    },
    lens: {
      sealed: (g, gk) => { g.add(lathe([[0, 4], [.97, 4], [1.0, 4.2], [1.0, 6.8], [.97, 7], [0, 7]], M.steel)); g.add(ring(1.01, .03, cg(.85 * gk), 5.5)); },
      vented: g => { g.add(lathe([[0, 4], [.97, 4], [1.0, 4.2], [1.0, 6.8], [.97, 7], [0, 7]], M.steel)); around(8, 1.0, (y, z, a) => g.add(box(2.2, .08, .2, M.dark, 5.5, y, z, -a)), Math.PI / 8); },
      exposed: g => { g.add(lathe([[0, 4], [1.0, 4], [1.0, 4.4], [0, 4.4]], M.steel)); g.add(lathe([[0, 6.6], [1.0, 6.6], [1.0, 7], [0, 7]], M.steel)); around(3, .97, (y, z, a) => g.add(box(2.4, .14, .18, M.steel, 5.5, y, z, -a))); const gl = new THREE.Mesh(new THREE.CylinderGeometry(.93, .93, 2.2, 48, 1, true), phys(0xffffff, .02, 0, { transmission: 1, transparent: true, side: THREE.DoubleSide })); gl.rotation.z = Math.PI / 2; gl.position.x = 5.5; g.add(gl); },
    },
    emitter: {
      classic: (g, gk) => { g.add(lathe([[0, 7], [.98, 7], [1.0, 7.6], [1.06, 8.0], [1.3, 9.7], [1.34, 10.15], [1.2, 10.4], [.72, 10.4], [.72, 10.26], [0, 10.26]], M.chrome)); around(6, 1.17, (y, z, a) => g.add(box(1.1, .1, .26, M.dark, 8.9, y, z, -a)), .26); matrix(g, gk, 10.32); },
      hooded: (g, gk) => { g.add(lathe([[0, 7], [.98, 7], [1.02, 8.0], [1.08, 9.6], [.72, 9.6], [0, 9.6]], M.chrome)); const hood = new THREE.Mesh(new THREE.CylinderGeometry(1.16, 1.16, 2.0, 32, 1, true, 0, Math.PI), M.chrome); hood.material = M.chrome; hood.rotation.set(Math.PI / 2, 0, Math.PI / 2); hood.position.x = 9.0; g.add(hood); g.add(ring(1.1, .06, M.dark, 8.1)); matrix(g, gk, 9.55); },
      crown: (g, gk) => { g.add(lathe([[0, 7], [.98, 7], [1.05, 9.4], [.7, 9.4], [0, 9.4]], M.chrome)); around(6, 1.05, (y, z, a) => { const pr = box(1.5, .18, .24, M.steel, 9.6, y * 1.05, z * 1.05, -a); g.add(pr); }); matrix(g, gk, 9.45); },
      ring: (g, gk) => { g.add(lathe([[0, 7], [1.0, 7], [1.0, 8.4], [1.14, 8.5], [1.14, 8.9], [.7, 8.9], [0, 8.9]], M.chrome)); g.add(ring(1.0, .05, M.dark, 7.8)); matrix(g, gk, 8.85); },
    },
  };
  function fill(H, n, v) { const geo = H.S[n].userData.geo; while (geo.children.length) { const c = geo.children.pop(); c.traverse(o => o.geometry && o.geometry.dispose()); } (B[n][v] || Object.values(B[n])[0])(geo, H.gk); }
  function buildHilt(gk = 1) {
    const root = new THREE.Group(), S = {};
    ['pommel', 'grip', 'cell', 'activation', 'chamber', 'crystal', 'lens', 'lenses', 'emitter'].forEach(n => { const g = new THREE.Group(); g.userData.geo = new THREE.Group(); g.add(g.userData.geo); root.add(g); S[n] = g; });
    let g = S.cell.userData.geo;
    g.add(lathe([[0, -11.0], [.6, -11.0], [.66, -10.8], [.66, -4.6], [.6, -4.4], [0, -4.4]], M.dark));
    g.add(lathe([[0, -11.1], [.4, -11.1], [.4, -10.95], [0, -10.95]], M.brass)); g.add(lathe([[0, -4.45], [.4, -4.45], [.4, -4.3], [0, -4.3]], M.brass));
    for (let i = 0; i < 4; i++) g.add(ring(.675, .045, cg(.95 * gk), -9.6 + i * 1.5));
    g = S.crystal.userData.geo;
    g.add(lathe([[0, .55], [.38, 1.05], [.38, 1.95], [0, 2.45]], crystalMat(), 6));
    const core = new THREE.Mesh(new THREE.SphereGeometry(.18, 16, 12), cg(.9 * gk)); core.position.x = 1.5; g.add(core);
    g = S.lenses.userData.geo; S.discs = [];
    [4.6, 5.5, 6.4].forEach(x => { const d = new THREE.Group(); const disc = new THREE.Mesh(new THREE.CylinderGeometry(.58, .58, .12, 48), glass()); disc.rotation.z = Math.PI / 2; d.add(disc); d.add(ring(.6, .05, M.brass)); d.position.x = x; d.userData.x = x; g.add(d); S.discs.push(d); });
    const H = { root, S, gk };
    Object.keys(HV).forEach(n => fill(H, n, HV[n]));
    return H;
  }
  function explodeHilt(H, E) {
    const k = 3.4 * E, S = H.S;
    S.pommel.position.set(-3 * k, 0, 0); S.grip.position.set(-2 * k, 0, 0); S.cell.position.set(-2 * k, -3.1 * E, 0);
    S.activation.position.set(-k, 0, 0); S.chamber.position.set(0, 0, 0); S.crystal.position.set(0, 3.0 * E, 0);
    S.lens.position.set(k, 0, 0); S.lenses.position.set(k, 2.8 * E, 0); S.emitter.position.set(2 * k, 0, 0);
    S.discs.forEach((d, i) => d.position.x = d.userData.x + (i - 1) * 1.3 * E);
  }
  function retag(L) { L.meshes = []; L.tagList.forEach(([o, p]) => tag(o, p, L)); }

  // 01 · Saber
  const Ls = mkLevel('saber', { pos: [3, 10, 84], tgt: [3, 3, 0], r: 29 });
  const Hs = buildHilt(.28); Hs.root.position.x = -8; Ls.g.add(Hs.root); Ls.g.rotation.set(0, -.3, .42); Ls.g.position.y = 2.5;
  const cyl = r => { const g = new THREE.CylinderGeometry(r, r, 1, 32, 1, true); g.rotateZ(-Math.PI / 2); g.translate(.5, 0, 0); return g; };
  const bCore = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const glowDefs = [[.28, 1.3, 1.0], [.5, 2.2, .5], [.85, 3.2, .22], [1.35, 5.0, .08]];
  const gMats = glowDefs.map(([r, pw, op]) => glowMat(op, pw));
  const shellDefs = [[.17, bCore], ...glowDefs.map((d, i) => [d[0], gMats[i]])];
  function mkBlade(parent, x, z, rotY, max) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rotY; parent.add(g);
    const cs = shellDefs.map(([r, m]) => { const c = new THREE.Mesh(cyl(r), m); g.add(c); return c; });
    const ts = shellDefs.map(([r, m]) => { const sg = new THREE.SphereGeometry(r, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2); sg.rotateZ(-Math.PI / 2); const s = new THREE.Mesh(sg, m); s.scale.x = 1.35; g.add(s); return s; });
    return { g, on: true, max, set(len) { const L = Math.max(.001, len * this.max / 30); g.visible = this.on && len > .05; cs.forEach(c => c.scale.x = L); ts.forEach(s => s.position.x = L); } };
  }
  const blades = { main: mkBlade(Hs.root, 10.4, 0, 0, 30), staff: mkBlade(Hs.root, -14.8, 0, Math.PI, 30), crossA: mkBlade(Hs.root, 9.0, 1.75, -Math.PI / 2, 4.2), crossB: mkBlade(Hs.root, 9.0, -1.75, Math.PI / 2, 4.2) };
  const blade = blades.main.g;
  const guard = new THREE.Group(); const gbar = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, 3.5, 32), M.chrome); gbar.rotation.x = Math.PI / 2; guard.add(gbar);
  [1, -1].forEach(s => { const v = new THREE.Mesh(new THREE.CylinderGeometry(.52, .42, .36, 32), M.dark); v.rotation.x = Math.PI / 2; v.position.set(0, 0, s * 1.6); guard.add(v); });
  Hs.root.add(guard);
  const emit2 = new THREE.Group(); emit2.scale.x = -1; emit2.position.x = -4.4; emit2.userData.geo = new THREE.Group(); emit2.add(emit2.userData.geo); Hs.root.add(emit2); emit2.visible = false; blades.staff.on = false;
  const fillEmit2 = () => { const g = emit2.userData.geo; while (g.children.length) g.children.pop(); B.emitter[HV.emitter](g, Hs.gk); };
  fillEmit2();
  Ls.tagList = [[blades.main.g, 'blade'], [blades.staff.g, 'blade'], [emit2, 'pommel'], [blades.crossA.g, 'blade'], [blades.crossB.g, 'blade'], [guard, 'emitter'], ...[['pommel', 'pommel'], ['grip', 'grip'], ['cell', 'grip'], ['activation', 'activation'], ['chamber', 'chamber'], ['crystal', 'chamber'], ['lens', 'lens'], ['lenses', 'lens'], ['emitter', 'emitter']].map(([s, p]) => [Hs.S[s], p])];
  retag(Ls);
  const saberLabels = [['blade', 'Blade', V(26, 2.4)], ['emitter', 'Emitter', V(8.8, -3.6)], ['lens', 'Lens Housing', V(5.5, 3.6)], ['chamber', 'Crystal Chamber', V(1.5, -3.6)], ['activation', 'Activation', V(-2.5, 3.6)], ['grip', 'Grip', V(-7.7, -3.6)], ['pommel', 'Pommel', V(-12.8, 3.6)]];
  saberLabels.forEach(([p, n, v], i) => label(Ls, Hs.root, p, String(i + 1).padStart(2, '0'), n, v));
  const Fs = mkFlow(Hs.root, 90, .4);
  Ls.fitObj = Hs.S.emitter.parent;
  Ls.fitExtra = () => [blades.main, blades.staff, blades.crossA, blades.crossB].filter(b => b.on).flatMap(b => [b.g.localToWorld(V(b.max + 1.2, 1.2, 0)), b.g.localToWorld(V(b.max + 1.2, -1.2, 0))]);
  let bladeLen = 0;
  function placeBlades() {
    const tip = TIP[HV.emitter] || 10.4; blades.main.g.position.x = tip; blades.staff.g.position.x = -tip - 4.4;
    guard.position.x = tip - 1.4; blades.crossA.g.position.x = blades.crossB.g.position.x = tip - 1.4;
    Ls.labels[0].o.position.x = tip + blades.main.max * .55;
  }
  function applyConfig() {
    const c = opts.config; blades.crossA.on = blades.crossB.on = c === 'cross'; guard.visible = c === 'cross';
    const st = c === 'staff'; blades.staff.on = st; emit2.visible = st; Hs.S.pommel.visible = !st; Hs.root.position.x = st ? 2.2 : -8; Ls.g.rotation.z = st ? .1 : .42; blades.main.max = c === 'shoto' ? 17 : 30; placeBlades();
    if (cur === Ls) { const p1 = fitPos(Ls); camAnim = { t: 0, p0: camera.position.clone(), t0: controls.target.clone(), p1, t1: Ls.target.clone() }; applyOffset(Math.max(1, el.clientWidth), Math.max(1, el.clientHeight)); }
  }
  applyConfig.init = true; guard.visible = false; blades.crossA.on = blades.crossB.on = false;
  const FIN = { chrome: { steel: [0xa9adb2, .3, 1], chrome: [0xe8eaec, .12, 1], gun: [0x2b2c2f, .42, .85] }, black: { steel: [0x3c3d41, .34, .9], chrome: [0x5a5c61, .2, 1], gun: [0x141416, .5, .7] }, brass: { steel: [0xb89b62, .3, 1], chrome: [0xdcc07e, .16, 1], gun: [0x3a2f22, .45, .8] } };
  function applyFinish() { const F = FIN[opts.finish] || FIN.chrome; Object.values(levels).forEach(L => L.meshes.forEach(o => { const f = F[o.userData.mk]; if (f) { o.material.color.setHex(f[0]); o.material.roughness = f[1]; o.material.metalness = f[2]; } })); }
  function setVariant(part, v) { if (!B[part] || !B[part][v] || HV[part] === v) return; HV[part] = v; fill(Hs, part, v); fill(Hh, part, v); if (part === 'emitter') fillEmit2(); retag(Ls); retag(Lh); applyFinish(); placeBlades(); }
  Ls.update = () => {
    Object.values(blades).forEach(b => b.set(bladeLen));
    const un = opts.config === 'cross'; [blades.main, blades.crossA, blades.crossB].forEach((b, i) => b.g.scale.set(1, un ? 1 + .14 * Math.sin(T * 53 + i * 2) * Math.sin(T * 17 + i) : 1, un ? 1 + .14 * Math.sin(T * 41 + i) : 1));
    const tip = blades.main.g.position.x, len = bladeLen * blades.main.max / 30;
    runFlow(Fs, u => V(tip + .2 + u * Math.max(.1, len - .4), 0, 0), .3); Fs.p.visible = Fs.p.visible && len > 1;
  };

  // 02 · Hilt
  const Lh = mkLevel('hilt', { pos: [3, 16, 66], tgt: [0, 0, 0], r: 24 });
  const Hh = buildHilt(); Lh.g.add(Hh.root); Lh.g.rotation.set(0, -.2, 0);
  Lh.tagList = [['emitter', 'emitter'], ['lens', 'lens'], ['lenses', 'lens'], ['chamber', 'chamber'], ['crystal', 'crystal'], ['activation', 'activation'], ['cell', 'cell'], ['grip', 'grip'], ['pommel', 'pommel']].map(([s, p]) => [Hh.S[s], p]);
  retag(Lh);
  [['emitter', 'emitter', 'Emitter Shroud', V(8.8, 2.2)], ['lenses', 'lens', 'Focusing Lens Array', V(5.5, 3.4)], ['chamber', 'chamber', 'Crystal Chamber', V(1.5, -4.2)], ['crystal', 'crystal', 'Kyber Crystal', V(1.5, 1.1)], ['activation', 'activation', 'Activation Matrix', V(-2.5, -2.4)], ['cell', 'cell', 'Diatium Power Cell', V(-7.7, -1.5)], ['grip', 'grip', 'Grip Section', V(-7.7, 3.6)], ['pommel', 'pommel', 'Pommel Cap', V(-12.8, -2.2)]]
    .forEach(([s, p, n, v], i) => label(Lh, Hh.S[s], p, String(i + 1).padStart(2, '0'), n, v));
  const Fh = mkFlow(Hh.root, 80, .5); let hCurve = null;
  Lh.update = () => {
    explodeHilt(Hh, E); const k = 3.4 * E; Hh.root.position.x = 1.8 + .5 * k;
    hCurve = new THREE.CatmullRomCurve3([V(-10.8 - 2 * k, -3.1 * E), V(-7.7 - 2 * k, -3.1 * E), V(-2.5 - k, .3), V(1.5, 3.0 * E), V(5.5 + k, 2.8 * E), V(10.3 + 2 * k, 0), V(13 + 2 * k, 0)]);
    runFlow(Fh, u => hCurve.getPointAt(u), .22);
  };

  // 03 · Chamber
  const Lc = mkLevel('chamber', { pos: [7, 10, 34], tgt: [-1.2, 0, 0], r: 13.5 });
  const cG = new THREE.Group(); Lc.g.add(cG);
  const conduitCurve = new THREE.CatmullRomCurve3([V(-13, -2.2, 0), V(-9, -2.0, 0), V(-6, -.4, 0), V(-3.4, 0, 0)]);
  const cond = new THREE.Group(); cond.add(new THREE.Mesh(new THREE.TubeGeometry(conduitCurve, 64, .38, 20), M.copper));
  const condGlow = new THREE.Mesh(new THREE.TubeGeometry(conduitCurve, 64, .42, 12), cg(.12)); cond.add(condGlow);
  const plug = new THREE.Mesh(new THREE.CylinderGeometry(.7, .7, .8, 32), M.steel); plug.rotation.z = Math.PI / 2; plug.position.set(-3.2, 0, 0); cond.add(plug);
  cG.add(cond); tag(cond, 'conduit', Lc);
  const ener = new THREE.Group();
  for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2 + Math.PI / 4; const y = Math.cos(a) * 2.3, z = Math.sin(a) * 2.3;
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(.17, .17, 7, 20), M.steel); rod.rotation.z = Math.PI / 2; rod.position.set(0, y, z); ener.add(rod);
    [-2.2, 0, 2.2].forEach(x => { const r = new THREE.Mesh(new THREE.TorusGeometry(.26, .06, 10, 32), cg(.9)); r.rotation.y = Math.PI / 2; r.position.set(x, y, z); ener.add(r); });
    [-3.6, 3.6].forEach(x => { const c = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .3, 20), M.gun); c.rotation.z = Math.PI / 2; c.position.set(x, y, z); ener.add(c); }); }
  cG.add(ener); tag(ener, 'energizers', Lc);
  const crad = new THREE.Group();
  [-2.4, 2.4].forEach(x => { crad.add(ring(1.6, .13, M.brass, x)); for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; const p = new THREE.Mesh(new THREE.BoxGeometry(.22, .9, .22), M.brass); p.position.set(x, Math.cos(a) * 1.15, Math.sin(a) * 1.15); p.rotation.x = -a; crad.add(p); } });
  cG.add(crad); tag(crad, 'cradle', Lc);
  const cry = new THREE.Group();
  cry.add(lathe([[0, -2.9], [1.15, -1.15], [1.15, 1.15], [0, 2.9]], crystalMat(), 6));
  const cCore = new THREE.Mesh(new THREE.SphereGeometry(.45, 24, 16), cg(.9)); cry.add(cCore);
  cG.add(cry); tag(cry, 'crystal', Lc);
  const lensG = new THREE.Group();
  [5.0, 6.3, 7.6].forEach((x, i) => { const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.35 - i * .12, 1.35 - i * .12, .22, 64), glass()); disc.rotation.z = Math.PI / 2; disc.position.x = x; lensG.add(disc); lensG.add(ring(1.4 - i * .12, .08, M.brass, x)); });
  const beam = new THREE.Mesh(cyl(.12), cg(.8)); beam.position.x = 2.9; beam.scale.x = 7; lensG.add(beam);
  const beamGlow = new THREE.Mesh(cyl(.32), cg(.18)); beamGlow.position.x = 2.9; beamGlow.scale.x = 7; lensG.add(beamGlow);
  cG.add(lensG); tag(lensG, 'lenses', Lc);
  const mat = new THREE.Group();
  mat.add(ring(1.3, .16, M.chrome, 10)); mat.add(ring(.7, .06, cg(1), 10.05));
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; const s = new THREE.Mesh(new THREE.BoxGeometry(.12, .6, .08), M.steel); s.position.set(10, Math.cos(a) * 1.0, Math.sin(a) * 1.0); s.rotation.x = -a; mat.add(s); }
  const mDisc = new THREE.Mesh(new THREE.CircleGeometry(.62, 48), cg(.5)); mDisc.rotation.y = -Math.PI / 2; mDisc.position.x = 10.06; mat.add(mDisc);
  cG.add(mat); tag(mat, 'matrix', Lc);
  [['crystal', 'Kyber Crystal', V(0, 3.4)], ['cradle', 'Crystal Cradle', V(-2.4, -2.3)], ['energizers', 'Field Energizers', V(2.2, 3.2, 1.6)], ['conduit', 'Power Conduit', V(-9, -3.2)], ['lenses', 'Focusing Lenses', V(6.3, 2.1)], ['matrix', 'Emitter Matrix', V(10, -2.2)]]
    .forEach(([p, n, v], i) => label(Lc, cG, p, String(i + 1).padStart(2, '0'), n, v));
  const Fc = mkFlow(cG, 90, .5);
  const cCurve = new THREE.CatmullRomCurve3([V(-13, -2.2), V(-9, -2.0), V(-6, -.4), V(-3.4, 0), V(0, 0), V(5, 0), V(10.2, 0)]);
  Lc.update = () => { cry.rotation.x = T * .35; runFlow(Fc, u => cCurve.getPointAt(u), .2); };

  // 04 · Kyber
  const Lk = mkLevel('crystal', { pos: [0, 4, 30], tgt: [0, 1, 0], r: 8 });
  const kG = new THREE.Group(); kG.position.y = 1.2; kG.scale.setScalar(.85); Lk.g.add(kG);
  const facetsGeo = new THREE.LatheGeometry([[0, -7], [2.6, -2.6], [2.6, 2.6], [0, 7]].map(([r, y]) => new THREE.Vector2(r, y)), 6);
  const facets = new THREE.Group(); const fm = crystalMat(); fm.opacity = .5; fm.transmission = .85; facets.add(new THREE.Mesh(facetsGeo, fm));
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(facetsGeo), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .8 })); facets.add(edges);
  kG.add(facets); tag(facets, 'facets', Lk);
  const core2 = new THREE.Group();
  core2.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.9, 0), cg(.9)));
  const coreHalo = new THREE.Mesh(new THREE.SphereGeometry(1.7, 32, 24), cg(.1)); core2.add(coreHalo);
  kG.add(core2); tag(core2, 'core', Lk);
  const pts = [];
  for (let y = -5.4; y <= 5.4; y += .9) { const R = 2.25 * (1 - Math.max(0, Math.abs(y) - 2.6) / 4.4); for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) { const x = (i + j * .5) * .78, z = j * .78 * .866; if (Math.hypot(x, z) < R && Math.hypot(x, y, z) > 1.9) pts.push([x, y, z]); } }
  const lat = new THREE.InstancedMesh(new THREE.SphereGeometry(.07, 8, 6), cg(.9), pts.length);
  const dm = new THREE.Object3D(); pts.forEach((p, i) => { dm.position.set(...p); dm.updateMatrix(); lat.setMatrixAt(i, dm.matrix); });
  const latG = new THREE.Group(); latG.add(lat); kG.add(latG); tag(latG, 'lattice', Lk);
  const field = new THREE.Group(); const fRings = [4.6, 5.8, 7.0].map(r => { const t = new THREE.Mesh(new THREE.TorusGeometry(r, .035, 8, 160), cg(.55)); t.rotation.x = Math.PI / 2; field.add(t); return t; });
  kG.add(field); tag(field, 'field', Lk);
  [['facets', 'Facet Shell', V(2.9, 3.8)], ['lattice', 'Crystal Lattice', V(-2.6, -3.2)], ['core', 'Resonance Core', V(0, -1.6, 2.2)], ['field', 'Harmonic Field', V(6.4, .6)]]
    .forEach(([p, n, v], i) => label(Lk, kG, p, String(i + 1).padStart(2, '0'), n, v));
  const Fk = mkFlow(kG, 120, .32);
  Lk.update = () => {
    facets.rotation.y = latG.rotation.y = T * .18;
    fRings.forEach((r, i) => { const s = 1 + .04 * Math.sin(T * (1.6 + i * .5) + i) * (.3 + P); r.scale.setScalar(s); r.position.y = Math.sin(T * .8 + i * 2) * .4; });
    core2.rotation.set(T * .4, T * .6, 0); coreHalo.scale.setScalar(1 + .08 * Math.sin(T * 6) * P);
    runFlow(Fk, (u, i) => { const a = i * 2.39996 + u * 6; const r = 7.2 * (1 - u); return V(Math.cos(a) * r, (i % 2 ? 1 : -1) * 6 * (1 - u), Math.sin(a) * r); }, .12);
  };

  // runtime
  let E = .5, Et = .5, P = .7, T = 0, ptrHover = null, camAnim = null, intro = 1;
  const tmp = new THREE.Color(), hlC = MOON.clone().multiplyScalar(.22);
  function paint(L, f) {
    const gk = .22 + .78 * P;
    colorMats.forEach(m => { m.color.copy(KY).multiplyScalar(.85); m.opacity = m.userData.op * gk; });
    gMats.forEach((m, i) => { m.uniforms.uColor.value.copy(KY).multiplyScalar(opts.dark && i === 0 ? .2 : 1); m.uniforms.uOp.value = m.userData.op * f; });
    if (opts.dark) bCore.color.setRGB(0, 0, 0); else bCore.color.copy(KY).lerp(WHITE, .8).multiplyScalar(1.9);
    crystalMats.forEach(m => { m.color.copy(KY).lerp(WHITE, .55); m.emissive.copy(KY); m.emissiveIntensity = .12 + .45 * P * f; });
    const act = opts.selected || ptrHover || opts.hover;
    L.meshes.forEach(o => { if (!o.userData.hl) return; tmp.setRGB(0, 0, 0); if (opts.heat) heatInto(tmp, opts.temps[o.userData.part] ?? 40).multiplyScalar(.45); if (act && o.userData.part === act) tmp.add(hlC); o.material.emissive.lerp(tmp, .18); });
    L.labels.forEach(l => { const on = act === l.part; l.d.style.color = on ? '#FFFFFF' : '#9A958C'; l.d.style.borderLeftColor = on ? '#E8ECCC' : 'rgba(232,236,204,.35)'; });
  }
  const safe = { l: 0, t: 0, r: 0, b: 0 };
  const tmpCam = new THREE.PerspectiveCamera(30, 1, .1, 2000), _v = new THREE.Vector3();
  function fitPts(L) {
    L.g.updateMatrixWorld(true); const pts = [], bx = new THREE.Box3().setFromObject(L.fitObj || L.g);
    [bx.min.x, bx.max.x].forEach(x => [bx.min.y, bx.max.y].forEach(y => [bx.min.z, bx.max.z].forEach(z => pts.push(V(x, y, z)))));
    if (L.fitExtra) pts.push(...L.fitExtra()); return pts;
  }
  function fitPos(L) {
    const W = Math.max(1, el.clientWidth), H = Math.max(1, el.clientHeight);
    const sw = Math.max(140, W - safe.l - safe.r - 56), sh = Math.max(140, H - safe.t - safe.b - 70);
    const pts = fitPts(L), c = new THREE.Box3().setFromPoints(pts).getCenter(new THREE.Vector3());
    const dir = V(...L.cam.pos).sub(V(...L.cam.tgt)).normalize();
    tmpCam.fov = camera.fov; tmpCam.aspect = W / H; tmpCam.updateProjectionMatrix();
    const measure = d => { tmpCam.position.copy(c).addScaledVector(dir, d); tmpCam.lookAt(c); tmpCam.updateMatrixWorld(); let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (const q of pts) { _v.copy(q).project(tmpCam); if (_v.z > 1 || _v.z < -1) return null; const px = (_v.x + 1) / 2 * W, py = (1 - _v.y) / 2 * H; x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); }
      return { x0, x1, y0, y1 }; };
    let lo = 2, hi = 800; for (let i = 0; i < 32; i++) { const m = (lo + hi) / 2, r = measure(m); if (r && r.x1 - r.x0 <= sw && r.y1 - r.y0 <= sh) hi = m; else lo = m; }
    const r = measure(hi) || { x0: 0, x1: W, y0: 0, y1: H };
    L.target = c.clone();
    L.off = { x: (safe.l + (W - safe.l - safe.r) / 2) - (r.x0 + r.x1) / 2, y: (safe.t + (H - safe.t - safe.b) / 2) - (r.y0 + r.y1) / 2 };
    return c.clone().addScaledVector(dir, hi);
  }
  function refit(force) {
    if (!cur) return; const p = fitPos(cur);
    if (camAnim) { camAnim.p1 = p; camAnim.t1 = cur.target.clone(); }
    else if (force || performance.now() - lastInteract > 400) { camera.position.copy(p); controls.target.copy(cur.target); }
    applyOffset(Math.max(1, el.clientWidth), Math.max(1, el.clientHeight));
  }
  function declutter() {
    if (!cur) return; const W = el.clientWidth, pad = 8, placed = [];
    const hb = el.getBoundingClientRect(); placed.push({ left: hb.left - 999, right: hb.left + safe.l + 6, top: hb.top + safe.t, bottom: hb.bottom - safe.b }, { left: hb.left - 999, right: hb.right + 999, top: hb.top - 999, bottom: hb.top + safe.t + 4 }, { left: hb.left - 999, right: hb.right + 999, top: hb.bottom - safe.b - 4, bottom: hb.bottom + 999 });
    const items = cur.labels.map(l => { const r = l.o.element.getBoundingClientRect(); return { l, r }; }).filter(x => x.r.width).sort((a, b) => a.r.left - b.r.left);
    const host = el.getBoundingClientRect();
    items.forEach(({ l, r }) => {
      const base = { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
      let dx = 0; if (base.right > host.left + W - pad) dx = host.left + W - pad - base.right; if (base.left + dx < host.left + pad) dx = host.left + pad - base.left;
      const h = base.bottom - base.top + 4; let dy = 0;
      for (const step of [0, -1, 1, -2, 2, -3, 3, -4, 4]) { dy = step * h; const a = { left: base.left + dx, right: base.right + dx, top: base.top + dy, bottom: base.bottom + dy };
        if (!placed.some(b => a.left < b.right + 6 && a.right > b.left - 6 && a.top < b.bottom + 2 && a.bottom > b.top - 2)) { placed.push(a); break; } }
      if (Math.abs(dy - l.dy) > .5 || Math.abs(dx - l.dx) > .5) { l.dy = dy; l.dx = dx; l.d.style.transform = `translate(${dx}px,${dy}px)`; }
    });
  }
  let dcl = 0;
  function goLevel(name) {
    const L = levels[name]; if (!L) return;
    if (cur) { cur.g.visible = false; cur.labels.forEach(l => l.o.visible = false); }
    cur = L; L.g.visible = true; L.labels.forEach(l => l.o.visible = true); ptrHover = null; intro = 0;
    const p1 = fitPos(L), t1 = L.target.clone();
    if (first) { camera.position.copy(p1); controls.target.copy(t1); first = false; camAnim = null; }
    else camAnim = { t: 0, p0: camera.position.clone(), t0: controls.target.clone(), p1, t1 };
    applyOffset(Math.max(1, el.clientWidth), Math.max(1, el.clientHeight));
    controls.autoRotate = false; lastInteract = performance.now();
  }
  function step(dt) {
    T += dt; E += (Et - E) * Math.min(1, dt * 7); P += (opts.power - P) * Math.min(1, dt * 4);
    const target = opts.power > 0 ? 30 : 0; bladeLen += (target - bladeLen) * Math.min(1, dt * (target > bladeLen ? 5.5 : 7));
    if (camAnim) { camAnim.t = Math.min(1, camAnim.t + dt / 1.1); const k = ease(camAnim.t); camera.position.lerpVectors(camAnim.p0, camAnim.p1, k); controls.target.lerpVectors(camAnim.t0, camAnim.t1, k); if (camAnim.t >= 1) camAnim = null; }
    if (cur) { intro = Math.min(1, intro + dt / .7); cur.g.scale.setScalar(.94 + .06 * ease(intro)); }
    if (!camAnim && performance.now() - lastInteract > 9000 && !opts.selected) controls.autoRotate = true;
    const f = 1 + (opts.power >= 1 ? .09 : .03) * Math.sin(T * 47) * Math.sin(T * 13.3);
    if (cur) { cur.update(dt); paint(cur, f); }
    kLight.color.copy(KY);
    if (cur === Ls) { kLight.intensity = (bladeLen / 30) * 2.2 * f; blade.getWorldPosition(kLight.position); kLight.position.x += 12; }
    else if (cur) { kLight.intensity = 1.6 * P; kLight.position.set(0, 4, 6); }
  }

  const ray = new THREE.Raycaster(), mp = new THREE.Vector2(); let down = null;
  function pick(e) {
    if (!cur) return null; const r = renderer.domElement.getBoundingClientRect();
    mp.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(mp, camera);
    const wv = o => { while (o) { if (!o.visible) return false; o = o.parent; } return true; };
    const list = cur.meshes.filter(o => !(o.userData.part === 'blade' && bladeLen < .5) && wv(o));
    const h = ray.intersectObjects(list, false).find(h => h.object.userData.part); return h ? h.object.userData.part : null;
  }
  const cvs = renderer.domElement;
  cvs.addEventListener('pointermove', e => { if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 4) return; const p = pick(e); if (p !== ptrHover) { ptrHover = p; cb.onHover && cb.onHover(p); cvs.style.cursor = p ? 'pointer' : 'grab'; } });
  cvs.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; });
  cvs.addEventListener('pointerup', e => { if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 5) { const p = pick(e); cb.onSelect && cb.onSelect(p); } down = null; });
  cvs.addEventListener('dblclick', e => { const p = pick(e); if (p) cb.onDrill && cb.onDrill(p); });
  cvs.addEventListener('pointerleave', () => { if (ptrHover) { ptrHover = null; cb.onHover && cb.onHover(null); } });
  cvs.addEventListener('wheel', e => {
    if (!(e.ctrlKey || e.metaKey)) return; e.preventDefault();
    const f = e.deltaY > 0 ? 1.08 : .93, off = camera.position.clone().sub(controls.target).multiplyScalar(f);
    off.setLength(clamp(off.length(), controls.minDistance, controls.maxDistance)); camera.position.copy(controls.target).add(off);
    controls.autoRotate = false; camAnim = null; lastInteract = performance.now();
  }, { passive: false });

  function applyOffset(w, h) { const o = cur && cur.off; if (o) camera.setViewOffset(w, h, -o.x, -o.y, w, h); else camera.clearViewOffset(); camera.updateProjectionMatrix(); }
  function resize() {
    const w = Math.max(1, el.clientWidth), h = Math.max(1, el.clientHeight);
    renderer.setSize(w, h, false); composer.setSize(w, h); labelR.setSize(w, h);
    camera.aspect = w / h; applyOffset(w, h);
    if (cur) refit();
  }
  const ro = new ResizeObserver(resize); ro.observe(el); resize();
  let raf, last = performance.now(), motion = 0; const prevDir = new THREE.Vector3();
  function loop() { raf = requestAnimationFrame(loop); const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now; step(dt); controls.update(); { const d = camera.position.clone().sub(controls.target).normalize(); const v = d.angleTo(prevDir) / Math.max(dt, 1e-3); prevDir.copy(d); motion += (v - motion) * .2; cb.onMotion && cb.onMotion(motion); } composer.render(); labelR.render(scene, camera); if (++dcl % 8 === 0) declutter(); }
  goLevel(opts.level); loop();

  return {
    set(o) {
      const sx = o.safe && (o.safe.l !== safe.l || o.safe.t !== safe.t || o.safe.r !== safe.r || o.safe.b !== safe.b); if (o.safe) Object.assign(safe, o.safe);
      const cfg = o.config && o.config !== opts.config, fin = o.finish && o.finish !== opts.finish;
      Object.assign(opts, o); if (o.explode != null) Et = o.explode; if (o.color) KY.set(o.color);
      if (cfg) applyConfig(); if (o.parts) Object.entries(o.parts).forEach(([k, v]) => setVariant(k, v)); if (fin || o.parts) applyFinish();
      if (o.level && (!cur || cur.name !== o.level)) goLevel(o.level);
      if (o.selected) controls.autoRotate = false;
      if (sx) refit(true);
    },
    zoom(f) { const off = camera.position.clone().sub(controls.target).multiplyScalar(f); off.setLength(clamp(off.length(), controls.minDistance, controls.maxDistance)); camera.position.copy(controls.target).add(off); camAnim = null; },
    reset() { if (cur) { const n = cur.name; cur.g.visible = false; cur.labels.forEach(l => l.o.visible = false); cur = null; goLevel(n); } },
    snapshot(name, w = 960, h = 720) {
      const L = levels[name]; if (!L) return null;
      const sv = { E, P, bladeLen, sel: opts.selected, hov: opts.hover, ph: ptrHover, flow: opts.flow, heat: opts.heat };
      E = .62; P = .8; bladeLen = 30; opts.selected = null; opts.hover = null; ptrHover = null; opts.flow = true; opts.heat = false;
      Object.values(levels).forEach(l => l.g.visible = l === L); const sc = L.g.scale.x; L.g.scale.setScalar(1);
      L.update(0); paint(L, 1); L.meshes.forEach(o => o.userData.hl && o.material.emissive.setRGB(0, 0, 0));
      const cam = new THREE.PerspectiveCamera(30, w / h, .1, 1000), t = V(...L.cam.tgt);
      cam.position.set(...L.cam.pos).sub(t).multiplyScalar(L === Ls ? 1.0 : 1.04).add(t); cam.lookAt(t);
      if (L === Ls) { kLight.intensity = 2; blade.getWorldPosition(kLight.position); kLight.position.x += 12; }
      renderer.setSize(w, h, false); composer.setSize(w, h);
      composer.passes[0].camera = cam; composer.render();
      const url = renderer.domElement.toDataURL('image/jpeg', .9);
      composer.passes[0].camera = camera;
      L.g.scale.setScalar(sc); E = sv.E; P = sv.P; bladeLen = sv.bladeLen; Object.assign(opts, { selected: sv.sel, hover: sv.hov, flow: sv.flow, heat: sv.heat }); ptrHover = sv.ph;
      Object.values(levels).forEach(l => l.g.visible = l === cur);
      resize(); return url;
    },
    dispose() { cancelAnimationFrame(raf); ro.disconnect(); controls.dispose(); renderer.dispose(); el.innerHTML = ''; }
  };
}
