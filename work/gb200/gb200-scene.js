import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'https://esm.sh/three@0.160.0/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'https://esm.sh/three@0.160.0/examples/jsm/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/OutputPass.js';
import { CSS2DRenderer, CSS2DObject } from 'https://esm.sh/three@0.160.0/examples/jsm/renderers/CSS2DRenderer.js';

const CY = 0x7fe3f5, GR = 0x76b900, OR = 0xff8a4c, WH = 0xdff8ff, AM = 0xffd27a;
const BOX = new THREE.BoxGeometry(1, 1, 1);
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const std = (c, r, m, x = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, ...x });
const phys = (c, r, m, x = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: r, metalness: m, ...x });
const glow = (c, op = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: op, toneMapped: false });
const C_CY = new THREE.Color(CY), C_GR = new THREE.Color(GR);
const H1 = new THREE.Color(0x3fb8d6), H2 = new THREE.Color(0xffb84a), H3 = new THREE.Color(0xff3a22);
const heatInto = (o, t) => { const k = clamp((t - 42) / 40); return k < .5 ? o.copy(H1).lerp(H2, k / .5) : o.copy(H2).lerp(H3, (k - .5) / .5); };
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

export function mount(el, cb = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;outline:none;cursor:grab;touch-action:none';
  el.appendChild(renderer.domElement);
  const labelR = new CSS2DRenderer();
  labelR.domElement.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
  el.appendChild(labelR.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07090b);
  scene.fog = new THREE.Fog(0x07090b, 160, 420);
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 1200);
  camera.position.set(40, 34, 50);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = .07; controls.enableZoom = false;
  controls.maxPolarAngle = Math.PI * .47; controls.minDistance = 6; controls.maxDistance = 320;
  controls.autoRotate = true; controls.autoRotateSpeed = .35;
  let lastInteract = 0;
  controls.addEventListener('start', () => { controls.autoRotate = false; lastInteract = performance.now(); });

  scene.add(new THREE.HemisphereLight(0xbfe9f5, 0x0b0f12, .45));
  const key = new THREE.DirectionalLight(0xffffff, 2.0);
  key.position.set(40, 90, 30); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -70, right: 70, top: 110, bottom: -40, near: 1, far: 300 }); key.shadow.bias = -0.0004;
  scene.add(key);
  const rimC = new THREE.DirectionalLight(CY, 1.1); rimC.position.set(-60, 30, -40); scene.add(rimC);
  const rimG = new THREE.DirectionalLight(GR, .7); rimG.position.set(60, 18, -50); scene.add(rimG);

  const floorTex = canvasTex(512, 512, (x, w, h) => {
    const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(127,227,245,.10)'); g.addColorStop(.5, 'rgba(118,185,0,.03)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), new THREE.MeshBasicMaterial({ map: floorTex, transparent: true, depthWrite: false }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -.48; scene.add(floor);
  const shadowCatcher = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShadowMaterial({ opacity: .45 }));
  shadowCatcher.rotation.x = -Math.PI / 2; shadowCatcher.position.y = -.5; shadowCatcher.receiveShadow = true; scene.add(shadowCatcher);
  const grid = new THREE.GridHelper(300, 75, CY, 0x1a3a44);
  grid.material.transparent = true; grid.material.opacity = .16; grid.position.y = -.49; scene.add(grid);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .5, .45, .9);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const dieTex = canvasTex(128, 768, (x, w, h) => {
    x.fillStyle = '#1a2026'; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(127,227,245,.28)'; x.lineWidth = 1.5;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) {
      const gx = 8 + c * 58, gy = 40 + r * 172 + (r > 1 ? 30 : 0), gw = 54, gh = 140;
      x.strokeRect(gx, gy, gw, gh);
      x.fillStyle = 'rgba(118,185,0,.16)';
      for (let i = 0; i < 2; i++) for (let j = 0; j < 6; j++) x.fillRect(gx + 4 + i * 25, gy + 6 + j * 22, 21, 17);
    }
    x.fillStyle = 'rgba(127,227,245,.16)'; x.fillRect(8, 366, 112, 34);
    x.fillStyle = 'rgba(255,138,76,.18)'; x.fillRect(8, 6, 112, 24); x.fillRect(8, h - 30, 112, 24);
  });
  const ventTex = canvasTex(256, 64, (x, w, h) => {
    x.fillStyle = '#1b2025'; x.fillRect(0, 0, w, h); x.fillStyle = '#05070a';
    for (let i = 0; i < w; i += 6) for (let j = 0; j < h; j += 6) { x.beginPath(); x.arc(i + 3 + ((j / 6) % 2) * 3, j + 3, 1.6, 0, 7); x.fill(); }
  });
  const sprite = canvasTex(64, 64, (x, w) => {
    const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.3, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, w);
  });

  // ---------- level infrastructure ----------
  const levels = {}; let uid = 0;
  function mkLevel(name) {
    const g = new THREE.Group(); g.visible = false; scene.add(g);
    return (levels[name] = { name, g, meshes: [], pick: [], labels: [], paths: [], layers: null, cam: null, psize: .6 });
  }
  function add(L, parent, geo, mat, o = {}) {
    const { w = 1, h = 1, d = 1, x = 0, y = 0, z = 0, part = null, temp = null, drill = null, dbl = null, data = null, shadow = true, center = false, ry = 0, rz = 0 } = o;
    const m = new THREE.Mesh(geo, mat); m.scale.set(w, h, d); m.position.set(x, center ? y : y + h / 2, z);
    if (ry) m.rotation.y = ry; if (rz) m.rotation.z = rz;
    m.castShadow = shadow; m.receiveShadow = true;
    m.userData = { part, temp, drill, dbl, data, op: mat.opacity ?? 1, tb: !!mat.transparent && (mat.opacity ?? 1) < 1, glow: !mat.emissive, id: uid++, baseEm: mat.emissive ? mat.emissive.clone() : null, baseOp: mat.opacity ?? 1 };
    parent.add(m); L.meshes.push(m); if (part) L.pick.push(m); return m;
  }
  function label(L, parent, text, x, y, z, color = '#7fe3f5') {
    const d = document.createElement('div');
    d.style.cssText = `font:500 10px 'Geist Mono',ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:${color};white-space:nowrap;display:flex;align-items:center;gap:6px;pointer-events:none;text-shadow:0 0 6px #000,0 0 2px #000`;
    d.innerHTML = `<span style="display:block;width:18px;height:1px;background:${color};box-shadow:0 0 4px ${color}"></span>${text}`;
    const o = new CSS2DObject(d); o.position.set(x, y, z); o.center.set(0, .5); o.visible = false;
    parent.add(o); L.labels.push(o); return o;
  }
  const V = (x, y, z, l) => ({ v: new THREE.Vector3(x, y, z), l });
  const path = (L, pts, color, n = 8, speed = 6) => L.paths.push({ pts, color: new THREE.Color(color), n, speed });
  const tube = (pts, r) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), 48, r, 12, false);

  // ---------- RACK ----------
  (function buildRack() {
    const L = mkLevel('rack'); L.cam = { pos: [70, 62, 96], tgt: [0, 44, 0] }; L.psize = 1.1;
    const g = L.g, frame = std(0x15191d, .45, .8);
    add(L, g, BOX, frame, { w: 27, h: 1.5, d: 47, part: 'rack' });
    [-12.6, 12.6].forEach(x => [-22.6, 22.6].forEach(z => add(L, g, BOX, frame, { w: 1.2, h: 92, d: 1.2, x, z, y: 1.5, part: 'rack' })));
    add(L, g, BOX, frame, { w: 27, h: 1.2, d: 47, y: 93.5, part: 'rack' });
    let y = 1.8, ct = 0, sw = 0;
    const slot = (kind, hU) => {
      const h = hU * 2.6 - .25, idx = kind === 'compute' ? ++ct : kind === 'switch' ? ++sw : 0;
      const isC = kind === 'compute', isS = kind === 'switch';
      const body = std(isS ? 0x1d1a18 : 0x1a1f24, .42, .75);
      const dataObj = { idx };
      add(L, g, BOX, body, { w: 23.4, h, d: 41, y, part: kind, temp: isC ? 72 : isS ? 55 : 48, drill: isC ? 'tray' : null, data: dataObj });
      add(L, g, BOX, std(0xffffff, .5, .4, { map: ventTex }), { w: 23.4, h: h * .92, d: .3, y: y + h * .04, z: 20.6, part: kind, temp: isC ? 72 : 48, drill: isC ? 'tray' : null, data: dataObj });
      add(L, g, BOX, glow(isS ? OR : kind === 'psu' ? CY : GR, .95), { w: 3.4, h: .28, d: .08, x: -8.5, y: y + h / 2 - .14, z: 20.8, part: kind, shadow: false, drill: isC ? 'tray' : null, data: dataObj });
      [-11, 11].forEach(x => add(L, g, BOX, std(0x9aa4ab, .3, .9), { w: .5, h: h * .7, d: .6, x, y: y + h * .15, z: 20.9, part: kind, drill: isC ? 'tray' : null, data: dataObj }));
      y += hU * 2.6;
    };
    slot('psu', 3); for (let i = 0; i < 8; i++) slot('compute', 1); for (let i = 0; i < 9; i++) slot('switch', 1); for (let i = 0; i < 10; i++) slot('compute', 1); slot('psu', 3);
    const cu = std(0xb5763f, .35, .9);
    for (let i = 0; i < 30; i++) add(L, g, new THREE.CylinderGeometry(.2, .2, 86, 8), cu, { x: -10 + i * .69, y: 47, z: -22 - (i % 3) * .45, center: true, part: 'spine', temp: 40 });
    for (let j = 0; j < 6; j++) add(L, g, BOX, std(0x101316, .5, .4), { w: 22, h: 3, d: 1.2, y: 10 + j * 14, z: -23.4, part: 'spine', temp: 40 });
    add(L, g, new THREE.CylinderGeometry(.8, .8, 88, 20), std(0x2f7f93, .3, .7), { x: -11.6, y: 47, z: -21.5, center: true, part: 'cool', temp: 30 });
    add(L, g, new THREE.CylinderGeometry(.8, .8, 88, 20), std(0x93523a, .3, .7), { x: 11.6, y: 47, z: -21.5, center: true, part: 'cool', temp: 45 });
    label(L, g, 'Compute Trays ×18', 14, 66, 21); label(L, g, 'NVLink Switch Trays ×9', 14, 35, 21, '#ffb287');
    label(L, g, 'Power Shelves', 14, 89, 21); label(L, g, 'NVLink Spine · Copper', 13, 70, -23, '#ffb287'); label(L, g, 'Coolant Manifold', -12, 18, -21);
    for (let i = 0; i < 6; i++) { const x = -9 + i * 3.6; path(L, i % 2 ? [V(x, 4, -22.6), V(x, 90, -22.6)] : [V(x, 90, -22.6), V(x, 4, -22.6)], OR, 18, 14); }
    path(L, [V(-11.6, 3, -20.4), V(-11.6, 91, -20.4)], CY, 22, 12); path(L, [V(11.6, 91, -20.4), V(11.6, 3, -20.4)], OR, 22, 12);
    for (let i = 0; i < 18; i += 3) { const yy = (i < 8 ? 9.8 : 33.2) + (i % 8) * 2.6 + 1.2; path(L, [V(0, yy, 18), V(0, yy, -21)], GR, 5, 10); }
  })();

  // ---------- TRAY ----------
  (function buildTray() {
    const L = mkLevel('tray'); L.cam = { pos: [52, 46, 66], tgt: [0, 0, 0] }; L.psize = .65;
    const g = L.g, steel = std(0x2b3238, .45, .8);
    add(L, g, BOX, steel, { w: 46, h: .5, d: 74, part: 'chassis' });
    [-23, 23].forEach(x => add(L, g, BOX, steel, { w: .5, h: 3.2, d: 74, x, part: 'chassis' }));
    [-11, 11].forEach((mx, mi) => {
      const o = { part: 'module', drill: 'superchip', data: { mod: mi }, temp: 70 };
      add(L, g, BOX, std(0x0a1a0f, .55, .3), { w: 19, h: .5, d: 32, x: mx, y: .5, z: -6, ...o });
      add(L, g, new RoundedBoxGeometry(15, 1.4, 18, 3, .3), std(0xc8794a, .28, 1), { x: mx, y: 1.7, z: -12, center: true, ...o });
      for (let k = 0; k < 9; k++) add(L, g, BOX, std(0xa35f36, .32, 1), { w: 13, h: .3, d: .5, x: mx, y: 2.4, z: -19.5 + k * 1.9, ...o });
      add(L, g, new RoundedBoxGeometry(9, 1.2, 8, 3, .3), std(0xc8794a, .28, 1), { x: mx, y: 1.6, z: 5, center: true, ...o });
      add(L, g, tube([[mx + 5, 2.4, -16], [mx + 5, 4.5, -22], [mx + 4, 3.5, -32], [mx + 4, 1.6, -36]], .45), std(0x14181b, .55, .1), { part: 'cool', temp: 45 });
      add(L, g, tube([[mx - 5, 2.4, -16], [mx - 5, 4.5, -22], [mx - 4, 3.5, -32], [mx - 4, 1.6, -36]], .45), std(0x14181b, .55, .1), { part: 'cool', temp: 52 });
      add(L, g, tube([[mx, 2.4, -3], [mx, 3.6, 0], [mx, 2.3, 1.2]], .35), std(0x14181b, .55, .1), { part: 'cool', temp: 48 });
      label(L, g, `GB200 · ${'AB'[mi]}`, mx + 7.6, 3, -2, '#9be15d');
      path(L, [V(mx + 5, 4.6, -22), V(mx + 4, 3.6, -32), V(mx + 4, 1.8, -36)], OR, 7, 7);
      path(L, [V(mx - 4, 1.8, -36), V(mx - 4, 3.6, -32), V(mx - 5, 4.6, -22), V(mx - 5, 2.6, -16)], CY, 7, 7);
      path(L, [V(mx, 1.2, -6), V(mx, 1.2, -30), V(mx * 1.1, 1.2, -36)], GR, 6, 9);
    });
    for (let i = 0; i < 4; i++) {
      const x = -15 + i * 10;
      add(L, g, BOX, std(0x0f3a1a, .5, .3), { w: 7, h: .3, d: 9, x, y: .5, z: 24, part: 'nic', temp: 52 });
      for (let k = 0; k < 6; k++) add(L, g, BOX, std(0x9aa4ab, .35, .9), { w: .25, h: 1.2, d: 5, x: x - 2.5 + k, y: .8, z: 24, part: 'nic', temp: 52 });
      path(L, [V(x, 1.4, 20), V(x, 1.4, 36.5)], GR, 4, 8);
    }
    add(L, g, BOX, std(0xffffff, .5, .4, { map: ventTex }), { w: 46, h: 3.2, d: .8, z: 37, part: 'front', temp: 35 });
    for (let i = 0; i < 4; i++) add(L, g, BOX, std(0x0e1114, .4, .5), { w: 5, h: 2, d: .3, x: 8 + i * 3.6 - 5, y: .6, z: 37.5, part: 'front' });
    add(L, g, BOX, glow(GR), { w: 8, h: .25, d: .1, x: -15, y: 2.4, z: 37.45, part: 'front', shadow: false });
    for (let i = 0; i < 4; i++) {
      const x = -4 + i * 6.5;
      add(L, g, BOX, std(0x0d0f12, .45, .2), { w: 5, h: 2.2, d: 2.4, x, y: .5, z: -36, part: 'rearnvl', temp: 41 });
      add(L, g, BOX, glow(OR, .95), { w: 4.4, h: .2, d: .1, x, y: 2.2, z: -37.25, part: 'rearnvl', shadow: false });
    }
    add(L, g, BOX, std(0xc8794a, .25, 1), { w: 6, h: 2.4, d: 2.2, x: -17, y: .5, z: -36, part: 'busbar', temp: 44 });
    label(L, g, 'Rear · NVLink To Spine', 24, 2, -36, '#ffb287'); label(L, g, 'Front · Network I/O', 24, 2, 36); label(L, g, '48 V Busbar Clip', -24, 2, -36, '#ffb287');
  })();

  // ---------- SUPERCHIP ----------
  (function buildSuperchip() {
    const L = mkLevel('superchip'); L.cam = { pos: [42, 36, 52], tgt: [0, 7, 0] }; L.psize = .55;
    const Lr = L.layers = Array.from({ length: 8 }, () => { const gg = new THREE.Group(); L.g.add(gg); return gg; });
    const X = p => (p / 100 - .5) * 48, Z = p => (p / 100 - .5) * 30;
    const R = r => ({ x: X(r.x + r.w / 2), z: Z(r.y + r.h / 2), w: r.w * .48, d: r.h * .30 });
    const PKG = [{ x: 26, y: 8, w: 29, h: 84 }, { x: 58, y: 8, w: 29, h: 84 }];
    const DIES = PKG.flatMap(p => [0, 1].map(d => ({ x: p.x + p.w * (0.31 + d * 0.195), y: p.y + p.h * 0.2, w: p.w * 0.185, h: p.h * 0.6, pk: p })));
    const HBM = PKG.flatMap((p, pi) => [0, 1, 2, 3].flatMap(i => [{ x: p.x + p.w * 0.06, y: p.y + p.h * (0.06 + i * 0.225), w: p.w * 0.2, h: p.h * 0.19, pi }, { x: p.x + p.w * 0.74, y: p.y + p.h * (0.06 + i * 0.225), w: p.w * 0.2, h: p.h * 0.19, pi }]));
    const NVL = [0, 1, 2, 3].map(i => ({ x: 91.5, y: 8 + i * 21.5, w: 7, h: 18 }));
    const GRR = R({ x: 5, y: 22, w: 14, h: 56 });
    const LP = [0, 1, 2, 3].flatMap(i => [{ x: 5 + i * 3.6, y: 8, w: 3, h: 10 }, { x: 5 + i * 3.6, y: 82, w: 3, h: 10 }]).concat([0, 1, 2].map(i => ({ x: 1, y: 24 + i * 18, w: 2.6, h: 14 })));
    const PK = PKG.map(R);
    // L7 PCB + NVLink
    add(L, Lr[7], BOX, std(0x0a1a0f, .55, .3), { w: 49, h: .8, d: 31, part: 'pcb', temp: 50 });
    [-23, 23].forEach(x => [-14, 14].forEach(z => add(L, Lr[7], new THREE.CylinderGeometry(.55, .55, .84, 20), std(0xc9a24a, .3, 1), { x, z, y: .42, center: true, part: 'pcb', temp: 50 })));
    add(L, Lr[7], BOX, std(0x101316, .5, .3), { w: 1.2, h: 1.6, d: 12, x: -23.8, y: .8, part: 'pcie', temp: 44 });
    const gxe = GRR.x + GRR.w / 2;
    PK.forEach((r, gi) => [-1.2, -.4, .4, 1.2].forEach(dz => add(L, Lr[7], BOX, glow(GR, .75), { w: r.x - gxe, h: .03, d: .12, x: (gxe + r.x) / 2, y: .8, z: dz + (gi ? 3.2 : -3.2), part: 'c2c', temp: 45, shadow: false })));
    NVL.forEach((n, i) => {
      const r = R(n);
      add(L, Lr[7], BOX, std(0x0d0f12, .45, .2), { w: r.w, h: 2.2, d: r.d, x: r.x, z: r.z, y: .8, part: 'nvlink', temp: 41 + i });
      add(L, Lr[7], BOX, std(0xd8a94a, .25, 1), { w: r.w * .7, h: .12, d: r.d * .85, x: r.x, z: r.z, y: 3.0, part: 'nvlink', temp: 41 + i });
      add(L, Lr[7], BOX, glow(OR, .95), { w: .1, h: .3, d: r.d * .9, x: r.x - r.w / 2 - .05, z: r.z, y: 1.9, part: 'nvlink', temp: 41 + i, shadow: false });
      PK.forEach((pr, gi) => { const x1 = r.x - r.w / 2; add(L, Lr[7], BOX, glow(OR, .5), { w: x1 - pr.x, h: .03, d: .1, x: (pr.x + x1) / 2, y: .8, z: r.z + (gi ? .35 : -.35), part: 'nvlink', temp: 41, shadow: false }); });
    });
    // L6 power
    const ind = () => std(0x7d868c, .35, .85), vrm = () => std(0x121519, .5, .3);
    [4, 96].forEach(zp => { for (let i = 0; i < 9; i++) { const x = X(26.5 + i * 6.4 + 2.5), z = Z(zp); add(L, Lr[6], BOX, vrm(), { w: 2.2, h: .5, d: 1.3, x, z, y: .8, part: 'vrm', temp: 69 }); add(L, Lr[6], BOX, ind(), { w: 1.7, h: .8, d: 1.1, x, z, y: 1.3, part: 'vrm', temp: 69 }); } });
    [22.25, 89.5].forEach(xp => { for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) add(L, Lr[6], BOX, ind(), { w: 1.3, h: .9, d: 1.5, x: X(xp), z: Z(10 + i * 28 + 3 + j * 6.5), y: .8, part: 'vrm', temp: 68 + i }); });
    const capG = new THREE.CylinderGeometry(.28, .28, .7, 14), capM = std(0x8f979c, .3, .9);
    for (let i = 0; i < 10; i++) add(L, Lr[6], capG, capM, { x: X(56.5), z: -10 + i * 2.2, y: 1.15, center: true, part: 'vrm', temp: 60 });
    add(L, Lr[6], BOX, vrm(), { w: 2.8, h: .4, d: 1.6, x: X(12), z: Z(4), y: .8, part: 'vrm', temp: 55 });
    // L5 substrates
    const capR = std(0xb08d57, .35, .8);
    PK.forEach(r => {
      add(L, Lr[5], BOX, std(0x1a221c, .55, .2), { w: r.w - .3, h: .6, d: r.d - .3, x: r.x, z: r.z, y: .8, part: 'substrate', temp: 55 });
      for (let k = 0; k < 10; k++) [-1, 1].forEach(s => add(L, Lr[5], BOX, capR, { w: .5, h: .25, d: .3, x: r.x - r.w / 2 + .8 + k * (r.w - 1.6) / 9, z: r.z + s * (r.d / 2 - .45), y: 1.4, part: 'substrate', temp: 55 }));
    });
    add(L, Lr[5], BOX, std(0x1a221c, .55, .2), { w: GRR.w - .3, h: .6, d: GRR.d - .3, x: GRR.x, z: GRR.z, y: .8, part: 'substrate', temp: 49 });
    // L4 interposer
    PK.forEach(r => {
      add(L, Lr[4], BOX, phys(0x2c3944, .2, .6, { iridescence: .8, iridescenceIOR: 1.5, clearcoat: .8 }), { w: r.w - 1.1, h: .3, d: r.d - 1.6, x: r.x, z: r.z, y: 1.4, part: 'interposer', temp: 66 });
      add(L, Lr[4], BOX, glow(CY, .55), { w: .5, h: .04, d: r.d * .55, x: r.x, z: r.z, y: 1.7, part: 'interposer', temp: 66, shadow: false });
    });
    // L3 HBM + LPDDR
    HBM.forEach((hb, i) => {
      const r = R(hb), t = 64 + ((i * 7) % 5) - 2;
      for (let s = 0; s < 8; s++) add(L, Lr[3], BOX, std(s % 2 ? 0x2a3034 : 0x1f2428, .4, .55), { w: r.w, h: .12, d: r.d, x: r.x, z: r.z, y: 1.7 + s * .135, part: 'hbm', temp: t });
      add(L, Lr[3], BOX, std(0x6f787e, .45, .6), { w: r.w, h: .1, d: r.d, x: r.x, z: r.z, y: 1.7 + 8 * .135, part: 'hbm', temp: t });
    });
    LP.forEach((m, i) => { const r = R(m); add(L, Lr[3], BOX, std(0x0f1214, .5, .25), { w: r.w, h: .45, d: r.d, x: r.x, z: r.z, y: .8, part: 'lpddr', temp: 46 + i % 3 }); });
    // L2 dies
    DIES.forEach((dd, i) => { const r = R(dd); add(L, Lr[2], BOX, phys(0xffffff, .18, .5, { map: dieTex, clearcoat: 1, clearcoatRoughness: .1 }), { w: r.w, h: .9, d: r.d, x: r.x, z: r.z, y: 1.7, part: 'die', temp: 72 + (i % 2) * 1.5, dbl: 'die' }); });
    PKG.forEach(p => { const r = R({ x: p.x + p.w * .4935, y: p.y + p.h * .22, w: p.w * .013, h: p.h * .56 }); add(L, Lr[2], BOX, glow(CY), { w: r.w, h: .95, d: r.d, x: r.x, z: r.z, y: 1.7, part: 'hbi', temp: 70, shadow: false }); });
    const gd = R({ x: 8.5, y: 34, w: 7, h: 32 });
    add(L, Lr[2], BOX, phys(0xffffff, .18, .5, { map: dieTex, clearcoat: 1 }), { w: gd.w, h: .9, d: gd.d, x: gd.x, z: gd.z, y: 1.4, part: 'grace', temp: 58 });
    // L1 SM hologram
    DIES.forEach(dd => {
      const r = R(dd);
      for (let i = 0; i < 8; i++) {
        const cx = i % 2, cy = Math.floor(i / 2);
        const m = add(L, Lr[1], BOX, glow(GR, .42), { w: r.w * .42, h: .05, d: r.d * .2, x: r.x + (cx ? 1 : -1) * r.w * .24, z: r.z - r.d * .5 + r.d * (.14 + cy * .24), y: 2.9, part: 'sm', temp: 74, shadow: false, dbl: 'die' });
        m.userData.holo = true;
      }
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(r.w, .05, r.d)), new THREE.LineBasicMaterial({ color: GR, transparent: true, opacity: .7, toneMapped: false }));
      e.position.set(r.x, 2.93, r.z); e.userData = { holoLine: true }; Lr[1].add(e); (L.holoLines ||= []).push(e);
    });
    // L0 cold plates
    const gp = { x: X(56), w: 31.7, d: 28.2 }, cpX = X(11.5);
    add(L, Lr[0], new RoundedBoxGeometry(gp.w, 1.6, gp.d, 3, .4), std(0xc8794a, .28, 1), { x: gp.x, y: 3.8, center: true, part: 'coldplate', temp: 38 });
    for (let k = 0; k < 16; k++) add(L, Lr[0], BOX, std(0xa35f36, .32, 1), { w: gp.w - 4, h: .35, d: .55, x: gp.x - 1, z: -gp.d / 2 + 1.6 + k * (gp.d - 3.2) / 15, y: 4.6, part: 'coldplate', temp: 38 });
    add(L, Lr[0], new RoundedBoxGeometry(9.1, 1.4, 21.6, 3, .35), std(0xc8794a, .28, 1), { x: cpX, y: 3.7, center: true, part: 'coldplate', temp: 36 });
    for (let k = 0; k < 5; k++) add(L, Lr[0], BOX, std(0xa35f36, .32, 1), { w: .5, h: .3, d: 19, x: cpX - 3.2 + k * 1.6, y: 4.4, part: 'coldplate', temp: 36 });
    const scr = new THREE.CylinderGeometry(.35, .35, .3, 16), scrM = std(0xb9c2c8, .25, 1);
    [[gp.x - gp.w / 2 + 1, -gp.d / 2 + 1], [gp.x + gp.w / 2 - 1, -gp.d / 2 + 1], [gp.x - gp.w / 2 + 1, gp.d / 2 - 1], [gp.x + gp.w / 2 - 1, gp.d / 2 - 1], [cpX, -9.8], [cpX, 9.8]].forEach(([x, z]) => add(L, Lr[0], scr, scrM, { x, z, y: 4.75, center: true, part: 'coldplate' }));
    const fx = gp.x + gp.w / 2 - 2.6;
    [-5, 5].forEach(z => {
      add(L, Lr[0], new THREE.CylinderGeometry(.85, .85, 1.4, 20), std(0xb9c2c8, .25, 1), { x: fx, z, y: 5.3, center: true, part: 'coolant', temp: z < 0 ? 45 : 52 });
      const pts = [[fx, 5.9, z], [fx, 8.6, z], [fx + 5, 10.6, z], [fx + 15, 10.6, z]];
      add(L, Lr[0], tube(pts, .48), std(0x14181b, .55, .1), { part: 'coolant', temp: z < 0 ? 45 : 52 });
      const pp = pts.map(p => V(p[0], p[1], p[2], 0)); path(L, z < 0 ? pp.reverse() : pp, z < 0 ? CY : OR, 12, 8);
    });
    add(L, Lr[0], tube([[gp.x - gp.w / 2 + 1.4, 4.7, 8], [gp.x - gp.w / 2 + .6, 6.6, 8], [cpX + 2.4, 6.4, 8], [cpX + 2.4, 4.6, 8]], .38), std(0x14181b, .55, .1), { part: 'coolant', temp: 48 });
    path(L, [V(fx, 4.7, -5, 0), V(gp.x - gp.w / 2 + 2, 4.7, -5, 0), V(gp.x - gp.w / 2 + 2, 4.7, 5, 0), V(fx, 4.7, 5, 0)], CY, 16, 7);
    // layer labels
    const LBL = ['01 · Cold Plates', '02 · SM / Tensor Array', '03 · Blackwell Dies + Grace', '04 · HBM3e + LPDDR5X', '05 · CoWoS-L Interposer', '06 · Package Substrate', '07 · Power Delivery', '08 · Module PCB + NVLink'];
    const LY = [4.6, 2.95, 2.6, 2.8, 1.7, 1.4, 2.0, .8];
    L.layerLabels = LBL.map((t, i) => label(L, Lr[i], t, 25.4, LY[i], 15.8, i === 1 ? '#9be15d' : i === 7 ? '#ffb287' : '#7fe3f5'));
    // flows
    HBM.forEach(hb => { const r = R(hb), pr = PK[hb.pi], tw = r.x < pr.x ? 1 : -1; path(L, [V(r.x, 2.9, r.z, 3), V(r.x + tw * (r.w / 2 + 1), 2.62, r.z, 2)], CY, 5, 4); });
    PK.forEach(pr => { [-4, 0, 4].forEach(dz => { path(L, [V(pr.x - 2.6, 2.65, dz, 2), V(pr.x + 2.6, 2.65, dz, 2)], WH, 4, 5); path(L, [V(pr.x + 2.6, 2.68, dz + 1.5, 2), V(pr.x - 2.6, 2.68, dz + 1.5, 2)], WH, 4, 5); }); });
    PK.forEach((pr, gi) => { const z = gi ? 3.2 : -3.2; path(L, [V(gd.x, 2.4, 0, 2), V(gxe, .86, z, 7), V(pr.x, .86, z, 7), V(pr.x, 2.6, z, 2)], GR, 14, 7); });
    NVL.forEach((n, i) => { const r = R(n), pr = PK[i % 2]; path(L, [V(pr.x, 2.6, r.z, 2), V(pr.x, .86, r.z, 7), V(r.x - r.w / 2, .86, r.z, 7), V(r.x, 3.1, r.z, 7)], OR, 10, 8); });
    DIES.forEach(dd => { const r = R(dd); path(L, [V(r.x, 2.1, Z(4), 6), V(r.x, 2.6, r.z - r.d / 2, 2)], AM, 4, 4); });
  })();

  // ---------- DIE ----------
  (function buildDie() {
    const L = mkLevel('die'); L.cam = { pos: [0, 50, 50], tgt: [0, 0, 2] }; L.psize = .9;
    const g = L.g;
    add(L, g, BOX, std(0x1a221c, .55, .2), { w: 62, h: 1.2, d: 40, part: 'interposer', temp: 55 });
    add(L, g, BOX, phys(0x2c3944, .2, .6, { iridescence: .8, iridescenceIOR: 1.5, clearcoat: .8 }), { w: 56, h: .8, d: 36, y: 1.2, part: 'interposer', temp: 64 });
    const DW = 17.2, DD = 30, top = 3.2;
    [0, 1].forEach(d => {
      const x0 = d === 0 ? -17.6 : .4;
      add(L, g, BOX, phys(0x1b2127, .2, .6, { clearcoat: 1 }), { w: DW, h: 1.2, d: DD, x: x0 + DW / 2, y: 2.0, part: 'die', temp: 70 });
      const blk = (lx, ly, w, h, part, mat, ht, temp, ex = {}) => {
        const lxx = d === 0 ? lx : 100 - lx - w;
        return add(L, g, BOX, mat, { w: w / 100 * DW, h: ht, d: h / 100 * DD, x: x0 + (lxx + w / 2) / 100 * DW, z: -DD / 2 + (ly + h / 2) / 100 * DD, y: top, part, temp, ...ex });
      };
      for (let i = 0; i < 4; i++) blk(0, 4 + i * 23.5, 5, 21, 'phy', std(0x3a4a55, .3, .8), .3, 64);
      blk(7, 0, 93, 7, 'io', std(0x3a2a22, .35, .6), .3, 58); blk(7, 93, 93, 7, 'io', std(0x3a2a22, .35, .6), .3, 58);
      blk(10, 2.5, 87, 2, 'io', glow(OR, .8), .32, 58, { shadow: false }); blk(10, 95.5, 87, 2, 'io', glow(OR, .8), .32, 58, { shadow: false });
      blk(7, 45, 59, 10, 'l2', std(0x24404c, .3, .7), .35, 68);
      for (let k = 0; k < 6; k++) blk(9 + k * 9.5, 46, .6, 8, 'l2', glow(CY, .5), .37, 68, { shadow: false });
      blk(68, 45, 15, 10, 'eng', std(0x3b4651, .3, .7), .4, 62); blk(85, 45, 15, 10, 'eng', std(0x3b4651, .3, .7), .4, 62);
      [9, 27, 57, 75].forEach(gy => [7, 54].forEach(gx => {
        blk(gx, gy, 46, 16, 'gpc', std(0x1e262c, .35, .6), .2, 72, { dbl: 'sm' });
        for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) {
          const t = blk(gx + 1.5 + c * 8.8, gy + 1.5 + r * 6.8, 7.6, 6, 'gpc', std(0x35452c, .3, .7), .45, 74, { dbl: 'sm' });
          t.position.y += .2;
        }
        blk(gx + 1.5, gy + 14.9, 43, .3, 'gpc', glow(GR, .45), .48, 74, { shadow: false, dbl: 'sm' });
      }));
      label(L, g, `Die ${d} · 104 B`, x0 + (d ? DW + 2 : -14), 3.6, -16.5);
    });
    [-10.5, -3.5, 3.5, 10.5].forEach(z => [-22.8, 22.8].forEach(x => {
      for (let s = 0; s < 12; s++) add(L, g, BOX, std(s % 2 ? 0x2a3034 : 0x1f2428, .4, .55), { w: 6.2, h: .2, d: 6.4, x, z, y: 2.0 + s * .22, part: 'hbm', temp: 62 });
      add(L, g, BOX, std(0x6f787e, .45, .6), { w: 6.2, h: .18, d: 6.4, x, z, y: 2.0 + 12 * .22, part: 'hbm', temp: 62 });
    }));
    add(L, g, BOX, glow(CY), { w: .7, h: 1.25, d: 28, y: 2.0, part: 'hbi', temp: 70, shadow: false });
    label(L, g, 'NV-HBI · 10 TB/s', 1, 4.5, 15.5); label(L, g, 'HBM3e ×8', 26.4, 4.8, -10.5); label(L, g, 'L2 · Crossbar', 18.4, 3.8, 0.5);
    label(L, g, 'NVLink 5 PHY', 18.4, 3.6, -14.2, '#ffb287'); label(L, g, 'GPC · SM Array', 18.4, 3.8, -8, '#9be15d');
    [-10.5, -3.5, 3.5, 10.5].forEach((z, i) => [-1, 1].forEach(s => {
      const hx = s * 22.8, ex = s * 17.4, gz = [-10.5, -5, 4.5, 10][i];
      path(L, [V(hx, 4.8, z), V(ex, 3.7, z), V(s * 9, 3.8, 0), V(s * (i % 2 ? 4.5 : 13), 4.0, gz)], CY, 9, 9);
    }));
    [-12, -6, 0, 6, 12].forEach((z, i) => path(L, i % 2 ? [V(-6, 3.7, z), V(6, 3.7, z)] : [V(6, 3.7, z), V(-6, 3.7, z)], WH, 6, 8));
    [-9, 9].forEach(x => { path(L, [V(x, 3.6, -14.5), V(x, 3.0, -21)], OR, 5, 5); path(L, [V(x, 3.6, 14.5), V(x, 3.0, 21)], OR, 5, 5); });
  })();

  // ---------- SM ----------
  (function buildSM() {
    const L = mkLevel('sm'); L.cam = { pos: [0, 44, 42], tgt: [0, 0, 1] }; L.psize = .75;
    const g = L.g;
    add(L, g, BOX, std(0x12171b, .4, .6), { w: 34, h: .8, d: 36, part: 'sm', temp: 70 });
    add(L, g, BOX, std(0x2a3a45, .3, .7), { w: 30, h: .4, d: 2, z: -14.6, y: .8, part: 'icache', temp: 60 });
    add(L, g, BOX, std(0x3a5a20, .3, .7), { w: 30, h: .5, d: .9, z: -1.2, y: .8, part: 'tmem', temp: 70 });
    add(L, g, BOX, glow(GR, .8), { w: 30, h: .52, d: .12, z: -1.2, y: .8, part: 'tmem', shadow: false });
    add(L, g, BOX, std(0x2a4f5c, .25, .8), { w: 24, h: .5, d: 3, x: -3, z: 12.6, y: .8, part: 'l1', temp: 64 });
    for (let k = 0; k < 10; k++) add(L, g, BOX, glow(CY, .45), { w: .14, h: .52, d: 2.6, x: -13.5 + k * 2.3, z: 12.6, y: .8, part: 'l1', shadow: false });
    add(L, g, BOX, std(0x3b4651, .3, .7), { w: 5, h: .7, d: 3, x: 12.5, z: 12.6, y: .8, part: 'tma', temp: 60 });
    [[-7.6, -7.6], [7.6, -7.6], [-7.6, 5.2], [7.6, 5.2]].forEach(([qx, qz], qi) => {
      add(L, g, BOX, std(0x1a2127, .4, .6), { w: 14.4, h: .3, d: 10.6, x: qx, z: qz, y: .8, part: 'sm', temp: 70 });
      add(L, g, BOX, std(0x30566a, .3, .7), { w: 13, h: .35, d: 1.0, x: qx, z: qz - 4.5, y: 1.1, part: 'sched', temp: 66 });
      add(L, g, BOX, glow(CY, .8), { w: 13, h: .02, d: .12, x: qx, z: qz - 4.5, y: 1.46, part: 'sched', shadow: false });
      add(L, g, BOX, std(0x24364a, .3, .7), { w: 13, h: .55, d: 1.3, x: qx, z: qz - 3.0, y: 1.1, part: 'rf', temp: 68 });
      for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) add(L, g, BOX, std(0x2c3a33, .35, .7), { w: .62, h: .5, d: .7, x: qx - 6.2 + c * .85, z: qz - 1.6 + r * .95, y: 1.1, part: 'cuda', temp: 72 });
      add(L, g, BOX, phys(0x2b3a12, .25, .6, { emissive: new THREE.Color(GR), emissiveIntensity: .12, clearcoat: 1 }), { w: 5.2, h: 1.3, d: 3.6, x: qx + 3.4, z: qz - .5, y: 1.1, part: 'tensor', temp: 78 });
      add(L, g, BOX, glow(GR, .9), { w: 4.6, h: .03, d: 3.0, x: qx + 3.4, z: qz - .5, y: 2.42, part: 'tensor', shadow: false });
      for (let k = 0; k < 12; k++) add(L, g, BOX, std(0x3b4651, .3, .7), { w: .8, h: .4, d: 1.0, x: qx - 6 + k * 1.08, z: qz + 3.4, y: 1.1, part: 'ldst', temp: 62 });
      path(L, [V(qx, 1.4, 12.6), V(qx, 1.6, qz - 3.0), V(qx + 3.4, 2.5, qz - .5)], CY, 7, 6);
      path(L, [V(qx - 4, 1.5, qz - 4.5), V(qx - 4, 1.7, qz - 1.6), V(qx - 4, 1.7, qz + 1.4)], GR, 4, 4);
      path(L, [V(qx + 3.4, 1.4, -1.2), V(qx + 3.4, 2.5, qz - .5)], GR, 3, 3);
      if (qi === 1) { label(L, g, '5th-Gen Tensor Core', qx + 6.6, 2.4, qz - .5, '#9be15d'); label(L, g, 'Warp Scheduler', qx + 7.3, 1.4, qz - 4.5); }
      if (qi === 3) { label(L, g, 'CUDA Cores', qx + 7.3, 1.4, qz + 1.2); label(L, g, 'LD/ST · SFU', qx + 7.3, 1.4, qz + 3.4); }
    });
    label(L, g, 'L1 / Shared Memory', 15.4, 1.4, 12.6); label(L, g, 'Tensor Memory (TMEM)', 15.4, 1.4, -1.2, '#9be15d'); label(L, g, 'Instruction Cache', 15.4, 1.4, -14.6);
  })();

  // ---------- flows ----------
  const MAXP = 3000, ppos = new Float32Array(MAXP * 3), pcol = new Float32Array(MAXP * 3);
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(ppos, 3)); pg.setAttribute('color', new THREE.BufferAttribute(pcol, 3)); pg.setDrawRange(0, 0);
  const pts = new THREE.Points(pg, new THREE.PointsMaterial({ size: .6, map: sprite, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  pts.frustumCulled = false; scene.add(pts);
  const wp = Array.from({ length: 8 }, () => new THREE.Vector3()), segL = new Float32Array(8);
  function updateFlows(L) {
    if (!opts.flow || !L.paths.length) { pg.setDrawRange(0, 0); return; }
    let k = 0; const sp = .35 + .9 * opts.load, dens = .35 + .65 * opts.load;
    for (const P of L.paths) {
      const n = P.pts.length; let tot = 0;
      for (let i = 0; i < n; i++) { wp[i].copy(P.pts[i].v); if (P.pts[i].l != null && L.layers) wp[i].y += L.layers[P.pts[i].l].position.y; if (i) { segL[i] = wp[i].distanceTo(wp[i - 1]); tot += segL[i]; } }
      if (tot <= 0) continue;
      const cnt = Math.max(1, Math.round(P.n * dens));
      for (let j = 0; j < cnt && k < MAXP; j++, k++) {
        let s = (time * P.speed * sp + j / cnt * tot) % tot, i = 1;
        while (i < n - 1 && s > segL[i]) { s -= segL[i]; i++; }
        const t = segL[i] ? s / segL[i] : 0, a = wp[i - 1], b = wp[i];
        ppos[k * 3] = a.x + (b.x - a.x) * t; ppos[k * 3 + 1] = a.y + (b.y - a.y) * t; ppos[k * 3 + 2] = a.z + (b.z - a.z) * t;
        const f = .55 + .45 * Math.sin(j * 1.7 + time * 3);
        pcol[k * 3] = P.color.r * f; pcol[k * 3 + 1] = P.color.g * f; pcol[k * 3 + 2] = P.color.b * f;
      }
    }
    pg.setDrawRange(0, k); pg.attributes.position.needsUpdate = true; pg.attributes.color.needsUpdate = true;
  }

  // ---------- state + loop ----------
  const opts = { shiftX: 0, level: null, heat: false, flow: true, load: .6, selected: null, hover: null };
  let cur = null, time = 0, E = .55, Et = .55, tw = null, first = true;
  let ptrHover = null, ptrObj = null, ndc = new THREE.Vector2(9, 9), moved = false;
  const tmp = new THREE.Color(), tmp2 = new THREE.Color();
  const tempOf = (b, id) => 30 + (b - 30) * (.62 + .38 * opts.load) + Math.sin(time * .9 + id) * .8;

  function goLevel(name) {
    const L = levels[name]; if (!L || cur === L) return;
    if (cur) { cur.g.visible = false; cur.labels.forEach(o => o.visible = false); }
    cur = L; L.g.visible = true; L.labels.forEach(o => o.visible = true);
    pts.material.size = L.psize; ptrHover = null; ptrObj = null;
    const t1 = new THREE.Vector3(...L.cam.tgt), fit = 1.3 * Math.max(1, 1.9 / camera.aspect);
    const p1 = new THREE.Vector3(...L.cam.pos).sub(t1).multiplyScalar(fit).add(t1);
    const p0 = first ? t1.clone().add(p1.clone().sub(t1).multiplyScalar(1.8)) : t1.clone().add(p1.clone().sub(t1).multiplyScalar(.28));
    camera.position.copy(p0); controls.target.copy(t1);
    tw = { t: 0, p0, p1 }; first = false; L.g.scale.setScalar(.94);
    controls.autoRotate = false; lastInteract = performance.now() - 6000;
  }

  function updateMats(L) {
    const sel = opts.selected, hov = ptrHover || opts.hover;
    for (const m of L.meshes) {
      const u = m.userData, mat = m.material;
      let op = u.baseOp;
      if (u.holo) op *= clamp((E - .08) * 3);
      if (sel && u.part !== sel) op *= .12;
      m.visible = op > .01;
      mat.opacity = op; mat.transparent = op < .999 || u.tb; mat.depthWrite = op > .5;
      if (!u.glow) {
        tmp.setRGB(0, 0, 0);
        if (opts.heat && u.temp != null) tmp.add(heatInto(tmp2, tempOf(u.temp, u.id)).multiplyScalar(.34));
        if (hov && u.part === hov) tmp.add(tmp2.copy(u.drill || u.dbl ? C_GR : C_CY).multiplyScalar(m === ptrObj ? .45 : .22));
        if (sel && u.part === sel) tmp.add(tmp2.copy(C_GR).multiplyScalar(.3));
        if (u.baseEm) tmp.add(u.baseEm);
        mat.emissive.copy(tmp);
      }
    }
    if (L.holoLines) L.holoLines.forEach(e => { e.material.opacity = .7 * clamp((E - .08) * 3) * (sel && sel !== 'sm' ? .15 : 1); e.visible = e.material.opacity > .01; });
  }

  const ray = new THREE.Raycaster();
  function pickAt() {
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(cur.pick, false);
    for (const h of hits) if (h.object.visible && h.object.material.opacity > .05) return h.object;
    return null;
  }

  const clock = new THREE.Clock(); let raf = 0;
  function loop() {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(.05, clock.getDelta()); time += dt;
    if (!cur) return;
    E += (Et - E) * .1;
    if (cur.layers) cur.layers.forEach((g, i) => g.position.y = (7 - i) * E * 3.4);
    if (cur.layerLabels) cur.layerLabels.forEach(o => o.visible = E > .18);
    if (tw) {
      tw.t = Math.min(1, tw.t + dt / 1.4); const k = ease(tw.t);
      camera.position.lerpVectors(tw.p0, tw.p1, k);
      if (tw.t >= 1) tw = null;
    }
    cur.g.scale.setScalar(cur.g.scale.x + (1 - cur.g.scale.x) * .08);
    if (cur.name === 'superchip' && !tw) controls.target.y += ((1.5 + E * 11) - controls.target.y) * .04;
    if (!controls.autoRotate && !tw && performance.now() - lastInteract > 9000 && !opts.selected) controls.autoRotate = true;
    if (moved) {
      moved = false; const o = pickAt(), p = o ? o.userData.part : null;
      ptrObj = o; renderer.domElement.style.cursor = o ? 'pointer' : 'grab';
      if (p !== ptrHover) { ptrHover = p; cb.onHover && cb.onHover(p); }
    }
    updateMats(cur); updateFlows(cur);
    controls.update();
    const sx = opts.shiftX || 0, w = el.clientWidth, h = el.clientHeight;
    if (sx) camera.setViewOffset(w, h, -w * sx, 0, w, h); else camera.clearViewOffset();
    composer.render(); labelR.render(scene, camera);
  }

  const dom = renderer.domElement; let down = null;
  const setNdc = e => { const r = dom.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); moved = true; };
  dom.addEventListener('pointermove', setNdc);
  dom.addEventListener('pointerleave', () => { ndc.set(9, 9); moved = true; });
  dom.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
  dom.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5 || !cur) return; down = null;
    setNdc(e); const o = pickAt();
    if (o && o.userData.drill) { cb.onDrill && cb.onDrill(o.userData.drill, o.userData.data); return; }
    cb.onSelect && cb.onSelect(o ? o.userData.part : null);
  });
  dom.addEventListener('dblclick', e => { setNdc(e); const o = cur && pickAt(); if (o && o.userData.dbl) cb.onDrill && cb.onDrill(o.userData.dbl); });
  dom.addEventListener('wheel', e => {
    if (!(e.ctrlKey || e.metaKey || e.altKey)) return;
    e.preventDefault(); const f = Math.exp(e.deltaY * .002);
    const off = camera.position.clone().sub(controls.target).multiplyScalar(f);
    const len = clamp(off.length(), controls.minDistance, controls.maxDistance); off.setLength(len);
    camera.position.copy(controls.target).add(off); controls.autoRotate = false; lastInteract = performance.now();
  }, { passive: false });

  function resize() {
    const w = Math.max(1, el.clientWidth), h = Math.max(1, el.clientHeight);
    renderer.setSize(w, h, false); composer.setSize(w, h); labelR.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize); ro.observe(el); resize();
  loop();

  return {
    set(o) { Object.assign(opts, o); if (o.explode != null) Et = o.explode; if (o.level && (!cur || cur.name !== o.level)) goLevel(o.level); if (o.selected) controls.autoRotate = false; },
    zoom(f) { const off = camera.position.clone().sub(controls.target).multiplyScalar(f); off.setLength(clamp(off.length(), controls.minDistance, controls.maxDistance)); camera.position.copy(controls.target).add(off); },
    snapshot(name, w = 960, h = 720) {
      const L = levels[name]; if (!L) return null;
      const sv = { E, sel: opts.selected, hov: opts.hover, ph: ptrHover, po: ptrObj, bg: scene.background };
      E = .62; opts.selected = null; opts.hover = null; ptrHover = null; ptrObj = null;
      Object.values(levels).forEach(l => l.g.visible = l === L);
      const sc = L.g.scale.x; L.g.scale.setScalar(1);
      if (L.layers) L.layers.forEach((g, i) => g.position.y = (7 - i) * E * 3.4);
      const t = new THREE.Vector3(...L.cam.tgt); if (L.name === 'superchip') t.y = 1.5 + E * 11;
      const cam = new THREE.PerspectiveCamera(30, w / h, .1, 1200);
      cam.position.set(...L.cam.pos).sub(t).multiplyScalar(1.12).add(t); cam.lookAt(t);
      updateMats(L); updateFlows(L);
      renderer.setSize(w, h, false); composer.setSize(w, h);
      composer.passes[0].camera = cam; composer.render();
      const url = renderer.domElement.toDataURL('image/jpeg', .9);
      composer.passes[0].camera = camera;
      L.g.scale.setScalar(sc); E = sv.E; opts.selected = sv.sel; opts.hover = sv.hov; ptrHover = sv.ph; ptrObj = sv.po;
      Object.values(levels).forEach(l => l.g.visible = l === cur);
      resize(); return url;
    },
    reset() { if (cur) { const n = cur.name; cur.labels.forEach(o => o.visible = false); cur.g.visible = false; cur = null; goLevel(n); } },
    dispose() { cancelAnimationFrame(raf); ro.disconnect(); controls.dispose(); renderer.dispose(); el.innerHTML = ''; }
  };
}
