// <campus-stage> — Phase I campus model. Room-level layout follows the CYS01 Level 1 Conveyance Plan (T02-01, 08/28/2025); device IDs, cable routes and WAP positions on that sheet are intentionally omitted. No live data.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const SYS = { compute: 0x7765FF, cooling: 0x45D8FF, heat: 0xFF6747, power: 0xFF8A22, construction: 0xF6B73C, conceptual: 0x7A8797 };
const THEMES = {
  dark: { plate: 0x151A20, pad: 0x1B2129, grid: 0x1A2027, shell: 0x2B333D, roof: 0x3A424D, zone: 0x262D36, ghost: 0x3A4350, line: 0x3E4753, slab: 0x20262E, text: '#F4F6F8', muted: '#9CA6B2', label: 'rgba(20,24,31,0.86)', border: 'rgba(255,255,255,0.12)' },
  light: { plate: 0xD9DCD8, pad: 0xCDD1CC, grid: 0xCDD0CC, shell: 0xF6F7F5, roof: 0xFFFFFF, zone: 0xE3E5E1, ghost: 0xB4BBC4, line: 0x8F979F, slab: 0xBFC4BF, text: '#101214', muted: '#5B6470', label: 'rgba(242,243,241,0.92)', border: 'rgba(16,18,20,0.14)' },
};
// Layout (1 unit ≈ 10 m). Campus plate 76×61 ≈ 115 ac; Phase I pad 42×34.5 ≈ 36 ac; building 30×6 ≈ 184,000 SF footprint, long axis = plan grid 1→33 (+x = east, −z = north).
const B = { x: -15, z: 11, w: 30, d: 6, h: 1.5 };
const PAD = { x: -15, z: 11, w: 42, d: 34.5 };
const HX = [-8.4, 8.4]; // hall centers (rel): [Data Hall 102 / rm 180 (west), Data Hall 101 / rm 140 (east)]
const HW = 11.6;
const Z = { corridor: -2.65, mech: -1.95, hall: -0.3, elec: 1.65, pods: 3.7, yard: 4.6, gens: 6.2 };
const A = (rx, rz) => new THREE.Vector3(B.x + rx, 0, B.z + rz);
const P = {
  utility: new THREE.Vector3(-15, 0, 22),
  grid: new THREE.Vector3(-15, 0, 29.5),
  yard: A(0, Z.yard),
  hall102: A(HX[0], Z.hall), hall101: A(HX[1], Z.hall),
  elec102: A(HX[0], Z.elec), elec101: A(HX[1], Z.elec),
  mech102: A(HX[0], Z.mech), mech101: A(HX[1], Z.mech),
  pods102: A(HX[0], Z.pods), pods101: A(HX[1], Z.pods),
  gens102: A(HX[0], Z.gens), gens101: A(HX[1], Z.gens),
  core: A(0, Z.hall), idf: A(0, Z.corridor), poeE: A(14.55, Z.elec), poeW: A(-14.55, Z.elec),
  office: A(17, 0.3), chillerA: A(0, -4.6), chillerB: A(0, -6.0),
  request: new THREE.Vector3(4, 0, 22),
};
const PRESETS = {
  campus: { t: [0, 0, 2], r: 165, th: -0.72, ph: 0.98 },
  phase1: { t: [-15, 0, 11], r: 64, th: -0.72, ph: 0.95 },
  building: { t: [-15, 0.6, 11], r: 44, th: -0.62, ph: 0.9 },
  utility: { t: [-15, 0, 17], r: 56, th: -0.45, ph: 0.95 },
  thermal: { t: [-15, 0.4, 7], r: 50, th: 2.75, ph: 0.95 },
  community: { t: [0, 0, 0], r: 200, th: -0.72, ph: 1.08 },
};
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

class CampusStage extends HTMLElement {
  constructor() {
    super();
    this.state = { theme: 'dark', section: 'overview', preset: 'campus', explode: 0, opacity: 1, roof: true, layers: { compute: true, power: true, thermal: true, liquid: true, future: true }, milestone: null, scenario: 'grid', campusView: 'current' };
    this.cam = { th: -0.72, ph: 0.98, r: 165, t: new THREE.Vector3(0, 0, 2) };
    this.goal = { th: -0.72, ph: 0.98, r: 165, t: new THREE.Vector3(0, 0, 2) };
    this.clock = new THREE.Clock();
    this.labels = [];
  }
  connectedCallback() {
    if (this._built) { this.dispatchEvent(new CustomEvent('stage-ready', { bubbles: true })); return; } this._built = true;
    this.style.cssText += 'display:block;position:relative;overflow:hidden;width:100%;height:100%;min-height:240px;';
    try { const saved = JSON.parse(this.getAttribute('data-state') || 'null'); if (this.getAttribute('theme')) this.state.theme = this.getAttribute('theme'); if (saved) { Object.assign(this.state, saved.state); const c = saved.cam; this.cam = { th: c.th, ph: c.ph, r: c.r, t: new THREE.Vector3(...c.t) }; this.goal = { th: c.th, ph: c.ph, r: c.r, t: new THREE.Vector3(...c.t) }; this._restored = true; } } catch (e) {}
    this.innerHTML = '<canvas style="position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;outline:none" tabindex="0" aria-label="Interactive campus model. Drag to orbit, scroll or pinch to zoom."></canvas><svg data-leaders style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible"></svg><div data-labels style="position:absolute;inset:0;pointer-events:none;overflow:hidden"></div>';
    const canvas = this.querySelector('canvas');
    try { this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' }); } catch (e) { this.fallback(); return; }
    if (!this.renderer.getContext()) { this.fallback(); return; }
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(26, 1, 0.1, 600);
    this.build();
    this.bind(canvas);
    this.ro = new ResizeObserver(() => { this.resize(); if (this.renderer) this.tick(); }); this.ro.observe(this);
    this.resize();
    this.applyState(this.state, true);
    this.loop = () => { this.raf = requestAnimationFrame(this.loop); this.tick(); };
    this.loop();
    this.dispatchEvent(new CustomEvent('stage-ready', { bubbles: true }));
  }
  disconnectedCallback() { cancelAnimationFrame(this.raf); this.ro && this.ro.disconnect(); }
  fallback() {
    this.innerHTML = '<div style="position:absolute;inset:0;display:grid;place-items:center;padding:32px;text-align:center;font:13px/1.5 IBM Plex Sans,sans-serif;color:#9CA6B2"><div><div style="width:120px;height:70px;margin:0 auto 16px;border:1px solid currentColor;transform:rotateX(60deg) rotateZ(45deg)"></div>3D VIEW UNAVAILABLE<br>WebGL could not start. The campus is described in the text panels.</div></div>';
  }
  resize() { const w = this.clientWidth || 800, h = this.clientHeight || 600; this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); }
  // ---------- scene ----------
  mat(color, o = {}) { return new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0.05 }, o)); }
  box(w, h, d, m, x = 0, y = 0, z = 0) { const g = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); g.position.set(x, y + h / 2, z); return g; }
  edges(mesh, color, op = 1) { const e = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color, transparent: true, opacity: op })); mesh.add(e); return e; }
  inst(geo, m, places, y) { const im = new THREE.InstancedMesh(geo, m, places.length), d = new THREE.Object3D(); places.forEach(([x, z], i) => { d.position.set(x, y, z); d.updateMatrix(); im.setMatrixAt(i, d.matrix); }); im.instanceMatrix.needsUpdate = true; return im; }
  build() {
    const s = this.scene, T = THEMES[this.state.theme];
    s.add(new THREE.HemisphereLight(0xffffff, 0x334455, 2.6));
    const key = new THREE.DirectionalLight(0xffffff, 3.0); key.position.set(-40, 60, 30); s.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 1.0); fill.position.set(50, 30, -40); s.add(fill);
    this.m = {}; this.o = {};
    this.o.grid = new THREE.GridHelper(400, 80, T.grid, T.grid); this.o.grid.position.y = -0.3; s.add(this.o.grid);
    this.m.plate = this.mat(T.plate);
    this.o.plate = this.box(76, 0.5, 61, this.m.plate, 0, -0.5, 0); s.add(this.o.plate);
    this.o.plateEdge = this.edges(this.o.plate, T.line, 0.9);
    this.m.pad = this.mat(T.pad);
    this.o.pad = this.box(PAD.w, 0.12, PAD.d, this.m.pad, PAD.x, 0, PAD.z); s.add(this.o.pad);
    this.o.padEdge = this.edges(this.o.pad, 0x45D8FF, 0.7);
    // Future pads (ghost)
    this.m.ghost = this.mat(T.ghost, { transparent: true, opacity: 0.18 });
    this.m.ghostWire = new THREE.LineBasicMaterial({ color: T.ghost, transparent: true, opacity: 0.5 });
    this.o.future = new THREE.Group();
    [[20, -14, 30, 24], [21, 15, 30, 22], [-14, -20, 34, 16]].forEach(([x, z, w, d]) => {
      const pad = this.box(w, 0.12, d, this.m.ghost, x, 0.02, z); this.o.future.add(pad);
      const mass = this.box(24, 1.4, 5, this.m.ghost, x, 0.14, z); mass.userData.id = 'future'; this.o.future.add(mass);
      mass.add(new THREE.LineSegments(new THREE.EdgesGeometry(mass.geometry), this.m.ghostWire));
    });
    s.add(this.o.future);
    // ---- Building group (rel coords) ----
    const bg = this.o.building = new THREE.Group(); bg.position.set(B.x, 0.12, B.z); s.add(bg);
    this.m.slab = this.mat(T.slab);
    this.o.slab = this.box(B.w, 0.15, B.d, this.m.slab); bg.add(this.o.slab);
    this.m.zone = this.mat(T.zone, { transparent: true, opacity: 0.95 });
    this.m.compute = this.mat(0x5A4BE0, { emissive: SYS.compute, emissiveIntensity: 0.25, transparent: true, opacity: 0.92 });
    this.m.elec = this.mat(T.zone, { emissive: SYS.power, emissiveIntensity: 0.0, transparent: true, opacity: 0.9 });
    this.m.therm = this.mat(T.zone, { emissive: SYS.cooling, emissiveIntensity: 0.0, transparent: true, opacity: 0.9 });
    this.m.net = this.mat(0x3E3680, { emissive: SYS.compute, emissiveIntensity: 0.3, transparent: true, opacity: 0.95 });
    this.o.zones = new THREE.Group(); this.o.zones.position.y = 0.15; bg.add(this.o.zones);
    const ZB = (w, h, d, m, x, z, id, ec = 0x000000, eo = 0.25) => { const b = this.box(w, h, d, m, x, 0, z); if (id) b.userData.id = id; this.edges(b, ec, eo); this.o.zones.add(b); return b; };
    // Corridor 110 (north, full length) + IDF rooms 196 · 184 · 154 · 144 · 129
    this.o.corridor = ZB(29.4, 0.3, 0.5, this.m.zone, 0, Z.corridor);
    this.o.idfs = [-14.3, -7.5, 0, 7.5, 14.3].map(x => ZB(0.7, 0.7, 0.55, this.m.net, x, Z.corridor, 'network', SYS.compute, 0.6));
    // Per hall: mechanical gallery (142/182) · data hall (140/180) · electrical gallery (141/181)
    this.o.halls = []; this.o.mechs = []; this.o.elecs = [];
    HX.forEach(hx => {
      this.o.mechs.push(ZB(HW, 0.7, 0.8, this.m.therm, hx, Z.mech, 'thermal'));
      this.o.halls.push(ZB(HW, 1.0, 2.4, this.m.compute, hx, Z.hall, 'compute'));
      this.o.elecs.push(ZB(HW, 0.8, 0.8, this.m.elec, hx, Z.elec, 'electrical'));
    });
    // Central core between the halls: NOC 163 · Conference 165 · Operations Storage · EPMS/BMS 155 — and the (45) 4" conduit bank
    this.o.core = [ZB(1.6, 0.8, 1.0, this.m.zone, -1.1, Z.hall - 0.5, 'ops'), ZB(1.6, 0.8, 1.0, this.m.zone, 1.1, Z.hall - 0.5, 'ops'), ZB(3.4, 0.6, 0.7, this.m.zone, 0, Z.mech, 'ops')];
    this.o.conduits = ZB(4.2, 0.12, 0.6, this.mat(T.line, { metalness: 0.3 }), 0, Z.hall + 0.9, null, SYS.power, 0.5);
    // POE 124 (east) · POE 194 (west) · Tenant Storage 195 (west end)
    this.o.poes = [14.55, -14.55].map(x => ZB(0.5, 0.8, 0.8, this.m.net, x, Z.elec, 'network', SYS.compute, 0.6));
    this.o.tenant = ZB(0.9, 0.6, 1.2, this.m.zone, -14.4, Z.hall - 0.6, 'ops');
    // Rack pods — 2 rows × 13 per hall (as drawn; equipment not modeled)
    const rackPlaces = []; HX.forEach(hx => { for (let i = 0; i < 13; i++) for (let j = 0; j < 2; j++) rackPlaces.push([hx - 5.4 + i * 0.9, Z.hall + (j - 0.5) * 1.2]); });
    this.o.racks = this.inst(new THREE.BoxGeometry(0.6, 0.4, 0.8), this.mat(0x2A2650, { emissive: SYS.compute, emissiveIntensity: 0.15, transparent: true, opacity: 0.95 }), rackPlaces, 1.0 + 0.2); this.o.zones.add(this.o.racks);
    // CDU / heat exchangers in the mechanical galleries + in-hall liquid manifolds
    this.m.cdu = this.mat(0x1E8FAE, { emissive: SYS.cooling, emissiveIntensity: 0.2, transparent: true, opacity: 0.95 });
    this.m.manifold = new THREE.MeshBasicMaterial({ color: SYS.cooling, transparent: true, opacity: 0.55 });
    this.m.manifoldHot = new THREE.MeshBasicMaterial({ color: SYS.heat, transparent: true, opacity: 0.55 });
    this.o.cdus = new THREE.Group(); this.o.zones.add(this.o.cdus);
    HX.forEach(hx => {
      [-3, 3].forEach(dx => { const c = this.box(1.0, 0.75, 0.6, this.m.cdu, hx + dx, 0, Z.mech); c.userData.id = 'capture'; this.edges(c, SYS.cooling, 0.6); this.o.cdus.add(c); });
      [-0.6, 0.6].forEach(dz => { this.o.cdus.add(this.box(10.8, 0.06, 0.06, this.m.manifold, hx, 1.36, Z.hall + dz - 0.2), this.box(10.8, 0.06, 0.06, this.m.manifoldHot, hx, 1.36, Z.hall + dz + 0.2)); });
      [-3, 3].forEach(dx => this.o.cdus.add(this.box(0.08, 0.6, 0.08, this.m.manifold, hx + dx - 0.25, 0.75, Z.mech + 0.4), this.box(0.08, 0.6, 0.08, this.m.manifoldHot, hx + dx + 0.25, 0.75, Z.mech + 0.4)));
    });
    // Fan walls along each hall's mechanical-gallery side
    this.m.fanwall = this.mat(T.line, { metalness: 0.2, transparent: true, opacity: 0.95 });
    this.o.fanwalls = new THREE.Group(); this.o.zones.add(this.o.fanwalls);
    const fanM = this.mat(SYS.cooling, { emissive: SYS.cooling, emissiveIntensity: 0.25 });
    HX.forEach(hx => { this.o.fanwalls.add(this.box(11, 0.8, 0.15, this.m.fanwall, hx, 1.0, Z.hall - 1.15)); for (let i = 0; i < 13; i++) { const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.06, 12), fanM); fan.rotation.x = Math.PI / 2; fan.position.set(hx - 5.4 + i * 0.9, 1.42, Z.hall - 1.26); this.o.fanwalls.add(fan); } });
    // HAC hoods over the rack rows
    this.m.plenum = this.mat(SYS.heat, { transparent: true, opacity: 0.0, emissive: SYS.heat, emissiveIntensity: 0.3, depthWrite: false });
    this.o.plenum = new THREE.Group(); this.o.zones.add(this.o.plenum);
    HX.forEach(hx => [-0.6, 0.6].forEach(dz => { const hood = this.box(11.4, 0.4, 1.0, this.m.plenum, hx, 1.0, Z.hall + dz); this.edges(hood, SYS.heat, 0.5); this.o.plenum.add(hood); }));
    // Shell walls + roof
    this.m.shell = this.mat(T.shell, { transparent: true, opacity: 1 });
    this.o.walls = new THREE.Group(); this.o.walls.position.y = 0.15; bg.add(this.o.walls);
    const tw = 0.18;
    [[B.w, tw, 0, -B.d / 2 + tw / 2], [B.w, tw, 0, B.d / 2 - tw / 2], [tw, B.d, -B.w / 2 + tw / 2, 0], [tw, B.d, B.w / 2 - tw / 2, 0]].forEach(([w, dd, x, z]) => { const wall = this.box(w, B.h, dd, this.m.shell, x, 0, z); wall.userData.id = 'building'; this.o.walls.add(wall); this.edges(wall, T.line, 0.8); });
    this.m.roof = this.mat(T.roof, { transparent: true, opacity: 1 });
    this.o.roof = new THREE.Group(); this.o.roof.position.y = 0.15 + B.h; bg.add(this.o.roof);
    const roofSlab = this.box(B.w + 0.2, 0.18, B.d + 0.2, this.m.roof); roofSlab.userData.id = 'building'; this.o.roof.add(roofSlab); this.edges(roofSlab, T.line, 0.9);
    [[-11, 1.4], [-5.5, -1.4], [0, 1.4], [5.5, -1.4], [11, 1.4]].forEach(([x, z]) => this.o.roof.add(this.box(1.4, 0.4, 1.4, this.m.roof, x, 0.18, z)));
    const parapet = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(B.w - 0.6, 0.3, B.d - 0.6)), new THREE.LineBasicMaterial({ color: T.line, transparent: true, opacity: 0.5 })); parapet.position.y = 0.33; this.o.roof.add(parapet); this.o.parapet = parapet;
    this.o.buildEdge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(B.w, B.h + 0.2, B.d)), new THREE.LineBasicMaterial({ color: SYS.construction, transparent: true, opacity: 0 }));
    this.o.buildEdge.position.y = 0.15 + (B.h + 0.2) / 2; bg.add(this.o.buildEdge);
    // Office block (east end): Vestibule 100 · Lobby 101 · Conference 107/127 · Break Room 133 · Tenant Office 111 · Loading Dock 120 · RMA Cage 145
    this.m.office = this.mat(T.shell, { transparent: true, opacity: 1 });
    this.o.office = new THREE.Group(); bg.add(this.o.office);
    const off = this.box(4.0, 1.0, 4.5, this.m.office, 17.0, 0.15, 0.3); off.userData.id = 'office'; this.edges(off, T.line, 0.8); this.o.office.add(off);
    const dock = this.box(1.6, 0.9, 1.3, this.m.office, 15.6, 0.15, Z.pods); dock.userData.id = 'office'; this.edges(dock, T.line, 0.8); this.o.office.add(dock);
    // POD electrical rooms along the south wall — 25 per hall (POD-A11…J13 / A21…J23 per BMS & EPMS submittal)
    this.m.pod = this.mat(T.shell, { emissive: SYS.power, emissiveIntensity: 0, transparent: true, opacity: 1 });
    this.o.pods = new THREE.Group(); bg.add(this.o.pods);
    HX.forEach(hx => { for (let i = 0; i < 25; i++) { const p = this.box(0.36, 1.0, 1.4, this.m.pod, hx - 5.4 + i * 0.45, 0.15, Z.pods); p.userData.id = 'electrical'; this.edges(p, SYS.power, 0.45); this.o.pods.add(p); } });
    // Generator yard behind the POD rooms (one per POD as drawn; engine count per permit reporting, not modeled)
    this.m.gen = this.mat(T.shell, { emissive: SYS.power, emissiveIntensity: 0, transparent: true, opacity: 1 });
    const genPlaces = []; HX.forEach(hx => { for (let i = 0; i < 25; i++) genPlaces.push([B.x + hx - 5.4 + i * 0.45, B.z + Z.gens]); });
    this.o.gens = this.inst(new THREE.BoxGeometry(0.36, 1.0, 1.4), this.m.gen, genPlaces, 0.12 + 0.5); this.o.gens.userData.id = 'backup'; s.add(this.o.gens);
    this.o.genStacks = this.inst(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 8), this.m.gen, genPlaces.map(([x, z]) => [x, z - 0.45]), 0.12 + 1.0 + 0.25); s.add(this.o.genStacks);
    this.o.genPad = this.box(28, 0.06, 2.0, this.mat(T.slab), B.x, 0.12, B.z + Z.gens); s.add(this.o.genPad); this.edges(this.o.genPad, SYS.power, 0.35);
    // Electrical Yard 001 (center-south) with symbolic transformers
    this.o.yard = new THREE.Group(); s.add(this.o.yard);
    this.o.yardPad = this.box(3.6, 0.08, 3.0, this.mat(T.slab), P.yard.x, 0.12, P.yard.z); this.edges(this.o.yardPad, SYS.power, 0.6); this.o.yard.add(this.o.yardPad);
    [-0.9, 0.9].forEach(dx => { const t = this.box(0.9, 0.9, 1.2, this.m.gen, P.yard.x + dx, 0.2, P.yard.z); t.userData.id = 'electrical'; this.edges(t, SYS.power, 0.6); this.o.yard.add(t); });
    // Buried service: utility interface → Electrical Yard 001
    const trench = [new THREE.Vector3(P.utility.x, 0.16, P.utility.z - 1.6), new THREE.Vector3(P.utility.x, 0.16, P.yard.z + 1.6)];
    this.o.trench = new THREE.Line(new THREE.BufferGeometry().setFromPoints(trench), new THREE.LineDashedMaterial({ color: SYS.power, dashSize: 0.6, gapSize: 0.4, transparent: true, opacity: 0.55 })); this.o.trench.computeLineDistances(); s.add(this.o.trench);
    // ACCH air-cooled chillers — 42 per hall (ACCH-01…42), two rows of 21 per hall, Mechanical Yard 002 (north)
    this.m.chiller = this.mat(T.shell, { transparent: true, opacity: 1 });
    const chPlaces = []; [P.chillerA.z, P.chillerB.z].forEach(z => { for (let i = 0; i < 42; i++) chPlaces.push([B.x - 13.75 + i * (27.5 / 41), z]); });
    this.chPlaces = chPlaces;
    this.o.chillers = this.inst(new THREE.BoxGeometry(0.56, 1.0, 0.9), this.m.chiller, chPlaces, 0.12 + 0.5); this.o.chillers.userData.id = 'chiller'; s.add(this.o.chillers);
    this.o.fans = this.inst(new THREE.CylinderGeometry(0.22, 0.22, 0.1, 14), this.mat(T.line, { metalness: 0.2 }), chPlaces, 0.12 + 1.0 + 0.05); s.add(this.o.fans);
    this.o.chillerPad = this.box(30, 0.08, 3.4, this.mat(T.slab), B.x, 0.12, (P.chillerA.z + P.chillerB.z) / 2); s.add(this.o.chillerPad); this.edges(this.o.chillerPad, 0x45D8FF, 0.5);
    // Chiller ↔ mechanical gallery pipe runs (one hot/cold pair per hall)
    this.o.pipes = [];
    HX.forEach(hx => [[-0.5, SYS.heat], [0.5, SYS.cooling]].forEach(([dx, col]) => {
      const x = B.x + hx + dx, pts = [new THREE.Vector3(x, 0.5, P.chillerA.z + 0.5), new THREE.Vector3(x, 0.5, B.z - B.d / 2 + 0.3)];
      const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 4, 0.12, 8, false), this.mat(col, { emissive: col, emissiveIntensity: 0.15, roughness: 0.6 })); s.add(tube); this.o.pipes.push(tube);
    }));
    // Utility interface + grid node
    this.m.util = this.mat(T.shell, { emissive: SYS.power, emissiveIntensity: 0 });
    this.o.util = this.box(3, 1.6, 3, this.m.util, P.utility.x, 0.0, P.utility.z); this.o.util.userData.id = 'utility'; s.add(this.o.util); this.edges(this.o.util, SYS.power, 0.7);
    this.o.gridNode = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 2.4, 10), this.mat(SYS.power, { emissive: SYS.power, emissiveIntensity: 0.4 })); this.o.gridNode.position.set(P.grid.x, 1.2, P.grid.z); s.add(this.o.gridNode);
    this.o.gridPad = this.box(2.4, 0.08, 1.4, this.mat(T.slab), P.grid.x, 0.0, P.grid.z); s.add(this.o.gridPad); this.edges(this.o.gridPad, SYS.power, 0.6);
    // Fiber handoff (symbolic) → POE 124; (4) 4" conduits to each POE as drawn
    this.o.netNode = this.box(1.2, 0.8, 0.8, this.mat(SYS.compute, { emissive: SYS.compute, emissiveIntensity: 0.35 }), P.request.x, 0.08, P.request.z); this.o.netNode.userData.id = 'network'; s.add(this.o.netNode);
    this.o.netPad = this.box(2.4, 0.08, 1.4, this.mat(T.slab), P.request.x, 0.0, P.request.z); s.add(this.o.netPad); this.edges(this.o.netPad, SYS.compute, 0.6);
    const fiber = [new THREE.Vector3(P.request.x, 0.16, P.request.z - 1.2), new THREE.Vector3(P.request.x, 0.16, 16.5), new THREE.Vector3(P.poeE.x, 0.16, 16.5), new THREE.Vector3(P.poeE.x, 0.16, B.z + B.d / 2 + 0.2)];
    this.o.fiber = new THREE.Line(new THREE.BufferGeometry().setFromPoints(fiber), new THREE.LineDashedMaterial({ color: SYS.compute, dashSize: 0.6, gapSize: 0.4, transparent: true, opacity: 0.55 })); this.o.fiber.computeLineDistances(); s.add(this.o.fiber);
    // ---- flows ----
    this.flows = [];
    const y2 = 0.12 + 0.15 + 0.5;
    const V = (p, y, dx = 0, dz = 0) => new THREE.Vector3(p.x + dx, y, p.z + dz);
    const podY = 0.12 + 0.15 + 1.0, corrY = y2 - 0.1;
    this.o.flowPower = this.flowGroup([
      [[V(P.utility, 0.9), V(P.utility, 0.5, 0, -1.6), V(P.yard, 0.5, 0, 1.6), V(P.yard, 1.1)], SYS.power, 'grid'],
      [[V(P.yard, 1.1), V(P.pods102, podY, 5.4), V(P.pods102, podY, -5.4)], SYS.power, 'internal'],
      [[V(P.yard, 1.1), V(P.pods101, podY, -5.4), V(P.pods101, podY, 5.4)], SYS.power, 'internal'],
      [[V(P.gens102, 1.1), V(P.pods102, podY, 0, 0.7)], SYS.power, 'emergency'],
      [[V(P.gens101, 1.1), V(P.pods101, podY, 0, 0.7)], SYS.power, 'emergency'],
      [[V(P.pods102, podY, 0, -0.7), V(P.elec102, y2 + 0.3), V(P.hall102, y2 + 0.4, 0, 0.6)], SYS.power, 'critical'],
      [[V(P.pods101, podY, 0, -0.7), V(P.elec101, y2 + 0.3), V(P.hall101, y2 + 0.4, 0, 0.6)], SYS.power, 'critical'],
    ]); s.add(this.o.flowPower);
    const thermalDefs = [];
    [[P.hall102, P.mech102], [P.hall101, P.mech101]].forEach(([hall, mech]) => {
      thermalDefs.push([[V(hall, y2 + 0.5, 0, -0.3), V(mech, y2 + 0.3, -0.5), new THREE.Vector3(mech.x - 0.5, 0.5, B.z - B.d / 2 - 0.3), new THREE.Vector3(mech.x - 0.5, 0.6, P.chillerA.z + 0.5)], SYS.heat, 'hot']);
      thermalDefs.push([[new THREE.Vector3(mech.x + 0.5, 0.6, P.chillerA.z + 0.5), new THREE.Vector3(mech.x + 0.5, 0.5, B.z - B.d / 2 - 0.3), V(mech, y2 + 0.3, 0.5), V(hall, y2 + 0.5, 0, 0.3)], SYS.cooling, 'cool']);
    });
    this.o.flowThermal = this.flowGroup(thermalDefs); s.add(this.o.flowThermal);
    this.o.flowCompute = this.flowGroup([
      [[V(P.request, 0.9), V(P.request, 0.5, 0, -1.2), new THREE.Vector3(P.request.x, 0.5, 16.5), new THREE.Vector3(P.poeE.x, 0.5, 16.5), V(P.poeE, y2 + 0.3), V(P.elec101, y2 + 0.4, 5.4), V(P.hall101, y2 + 0.6)], SYS.compute, 'compute'],
      [[V(P.poeE, y2 + 0.3), V(P.idf, corrY, 14.3), V(P.idf, corrY, 0), V(P.idf, corrY, -7.5), V(P.hall102, y2 + 0.6)], SYS.compute, 'compute'],
    ]); s.add(this.o.flowCompute);
    const hg = new THREE.SphereGeometry(0.07, 6, 6), hm = new THREE.MeshBasicMaterial({ color: SYS.heat, transparent: true, opacity: 0.6 });
    this.o.heatRise = new THREE.InstancedMesh(hg, hm, 45); this.o.heatRise.userData.seed = Array.from({ length: 45 }, () => Math.random()); s.add(this.o.heatRise);
    // ---- labels ----
    const L = (id, pos, text, sub, color, show) => this.labels.push({ id, pos, text, sub, color, show, el: null });
    const lay = this.querySelector('[data-labels]');
    const sys = s => ['thermal', 'liquid', 'compute', 'power'].includes(s.section);
    const inside = s => !s.roof || s.opacity < 0.5 || s.explode > 0.5;
    L('campus', new THREE.Vector3(30, 0, 27), 'Campus', '115 acres · generalized plate', null, s => !sys(s) && s.section !== 'construction' && s.preset !== 'building' && s.preset !== 'thermal');
    L('pad', new THREE.Vector3(PAD.x - PAD.w / 2 + 3, 0, PAD.z + PAD.d / 2 - 2), 'Phase I', '36 acres · conceptual area', '#45D8FF', s => s.preset !== 'building' && s.preset !== 'thermal' && !sys(s));
    L('bldg', new THREE.Vector3(B.x, 1.9, B.z), 'Phase I Building · CYS01', '184,000 SF · Level 1 plan T02-01', null, s => s.explode < 0.3 && !sys(s) && !inside(s));
    L('future', new THREE.Vector3(20, 1.6, -14), 'Future Phase', 'conceptual · masterplan not public', null, s => s.layers.future && s.preset !== 'building' && s.preset !== 'thermal' && s.campusView !== 'zones');
    L('util', new THREE.Vector3(P.utility.x, 0.2, P.utility.z + 3.5), 'Utility Interface', 'Black Hills Energy service · symbolic', '#FF8A22', s => (s.section === 'power' || s.preset === 'utility' || s.campusView === 'zones') && s.milestone === null);
    L('yard', new THREE.Vector3(P.yard.x, 1.2, P.yard.z), 'Electrical Yard 001', 'center-south · per plan', '#FF8A22', s => s.section === 'power' && s.milestone === null);
    L('pods', new THREE.Vector3(P.pods102.x, 1.4, P.pods102.z), 'POD Electrical Rooms', '25 per hall · 50 total · prefab blocks', '#FF8A22', s => (s.section === 'power' || s.explode > 0.5) && s.milestone === null);
    L('gen', new THREE.Vector3(P.gens101.x, 0.2, P.gens101.z + 2.4), 'Generator Yard', 'backup-only · one per POD · 50 + house gen', '#FF8A22', s => (s.section === 'power' || s.campusView === 'zones') && s.milestone === null);
    L('chill', new THREE.Vector3(B.x + 8, 0.2, P.chillerB.z - 2.2), 'Air-Cooled Chillers · ACCH', 'Mechanical Yard 002 · 42 per hall · 84 total', '#45D8FF', s => ((s.section === 'thermal' || s.section === 'liquid') || s.preset === 'thermal' || s.campusView === 'zones') && s.milestone === null);
    L('capture', new THREE.Vector3(P.mech102.x - 3, 1.5, P.mech102.z), 'CDU · Heat Exchanger', 'Mechanical Gallery 182 · reported', '#45D8FF', s => (s.section === 'thermal' || s.section === 'liquid') && inside(s) && s.layers.liquid);
    L('mech', new THREE.Vector3(P.mech101.x, 1.4, P.mech101.z), 'Mechanical Gallery 142 · 182', 'fan walls + CDUs · north side', '#45D8FF', s => (s.explode > 0.5 || s.section === 'liquid') && inside(s));
    L('hac', new THREE.Vector3(P.hall101.x + 3, 1.9, P.hall101.z + 0.6), 'HAC · Hot Air Containment', 'rack chimneys exhaust here', '#FF6747', s => s.section === 'liquid' && inside(s));
    L('liquid', new THREE.Vector3(P.hall102.x + 2, 1.9, P.hall102.z + 0.6), 'Liquid Cooling', 'direct-to-chip · reported · capture at the rack', '#45D8FF', s => (s.section === 'thermal' || s.section === 'liquid' || s.section === 'compute') && inside(s) && s.layers.liquid);
    L('hall102', new THREE.Vector3(P.hall102.x, 1.6, P.hall102.z), 'Data Hall 102 · Room 180', 'plan grids 1–15 · 2 rows × 13 pods', '#7765FF', s => (s.section === 'compute' || s.explode > 0.5 || s.campusView === 'zones' || s.section === 'phase-one') && inside(s));
    L('hall101', new THREE.Vector3(P.hall101.x, 1.6, P.hall101.z), 'Data Hall 101 · Room 140', 'plan grids 19–31 · 2 rows × 13 pods', '#7765FF', s => (s.section === 'compute' || s.explode > 0.5 || s.campusView === 'zones' || s.section === 'phase-one') && inside(s));
    L('elec', new THREE.Vector3(P.elec101.x, 1.5, P.elec101.z), 'Electrical Gallery 141 · 181', 'south side · feeds the hall from the PODs', '#FF8A22', s => (s.explode > 0.5 || s.section === 'power') && inside(s));
    L('core', new THREE.Vector3(P.core.x, 1.4, P.core.z - 0.5), 'NOC 163 · EPMS/BMS 155 · Conference 165', 'central core between the halls', null, s => (s.explode > 0.5 || s.section === 'phase-one') && inside(s));
    L('office', new THREE.Vector3(P.office.x, 1.3, P.office.z), 'Office Block', 'Lobby 101 · Tenant Office 111 · Loading Dock 120', null, s => (s.explode > 0.5 || s.section === 'phase-one') && s.milestone === null);
    L('idf', new THREE.Vector3(P.idf.x, 1.1, P.idf.z), 'Corridor 110 · IDF ×5', '196 · 184 · 154 · 144 · 129', '#7765FF', s => s.section === 'compute' && inside(s));
    L('poeE', new THREE.Vector3(P.poeE.x, 1.2, P.poeE.z), 'POE 124', '(4) 4" conduits in · east', '#7765FF', s => s.section === 'compute' && inside(s));
    L('poeW', new THREE.Vector3(P.poeW.x, 1.2, P.poeW.z), 'POE 194', '(4) 4" conduits in · west', '#7765FF', s => s.section === 'compute' && inside(s));
    L('roof', new THREE.Vector3(B.x + 10, 0, B.z - 4), 'Roof', 'generalized', null, s => s.explode > 0.5 && s.roof);
    L('shell', new THREE.Vector3(B.x - 10, 0, B.z + 4), 'Shell', 'generalized', null, s => s.explode > 0.5);
    L('request', new THREE.Vector3(P.request.x, 1.2, P.request.z), 'Fiber Handoff · Property Line', 'symbolic · route not public', '#7765FF', s => s.section === 'compute');
    this.labels.forEach(l => {
      const el = document.createElement('div');
      el.style.cssText = 'position:absolute;left:0;top:0;display:flex;flex-direction:column;gap:2px;padding:6px 8px;border:1px solid;border-radius:2px;font:500 10px/1.2 "IBM Plex Sans",sans-serif;letter-spacing:.08em;white-space:nowrap;transition:opacity .25s;will-change:transform;backdrop-filter:blur(4px)';
      el.innerHTML = `<span data-t></span><span data-s style="font-weight:400;letter-spacing:.02em;opacity:.75;text-transform:none"></span>`;
      el.querySelector('[data-t]').textContent = l.text; el.querySelector('[data-s]').textContent = (l.sub || '').replace(/[A-Za-z][A-Za-z'’]*/g, w => /^[A-Z0-9]+$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1));
      lay.appendChild(el); l.el = el;
      const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line'); ln.setAttribute('stroke', l.color || T.muted); ln.setAttribute('stroke-width', '1'); ln.setAttribute('opacity', '0'); this.querySelector('[data-leaders]').appendChild(ln); l.line = ln;
    });
    this.pickables = [...this.o.walls.children, ...this.o.roof.children, this.o.util, this.o.gens, this.o.chillers, ...this.o.pods.children, ...this.o.office.children, ...this.o.yard.children.filter(c => c.userData.id), ...this.o.cdus.children.filter(c => c.userData.id), ...this.o.zones.children.filter(c => c.userData.id), ...this.o.future.children.filter(c => c.userData.id)];
  }
  flowGroup(defs) {
    const g = new THREE.Group();
    defs.forEach(([pts, color, tag]) => {
      const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.05);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.07, 6, false), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35 }));
      const n = Math.max(8, Math.round(curve.getLength() / 1.1));
      const pm = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 }), n);
      const f = { curve, tube, pm, n, tag, speed: 0.045 + Math.random() * 0.01, active: 1 };
      g.add(tube); g.add(pm); this.flows.push(f);
    });
    return g;
  }
  // ---------- state ----------
  update(partial) { Object.assign(this.state, partial); if (partial.layers) this.state.layers = Object.assign({}, this.state.layers, partial.layers); try { this.applyState(this.state); if (this.renderer) { this._n = (this._n || 0) + 1; if (this._n <= 2 || performance.now() - (this._lastFrame || 0) > 300) { const g = this.goal; this.cam = { th: g.th, ph: g.ph, r: g.r, t: g.t.clone() }; this._ex = this.state.explode; } this.tick(); } } catch (e) { console.error('[campus-stage] applyState failed', e); } }
  applyState(s, instant) {
    if (!this.renderer) return;
    const T = THEMES[s.theme];
    if (this._theme !== s.theme) { this._theme = s.theme; this.applyTheme(T); }
    const pr = PRESETS[s.preset] || PRESETS.campus;
    if (this._preset !== s.preset || instant) { this._preset = s.preset; this._lastInput = performance.now(); this.goal.th = pr.th; this.goal.ph = pr.ph; this.goal.r = pr.r; this.goal.t.set(...pr.t); }
    if (instant || REDUCED) { this.cam.th = pr.th; this.cam.ph = pr.ph; this.cam.r = pr.r; this.cam.t.copy(this.goal.t); }
    if (this._restored && instant) { this._restored = false; const c = JSON.parse(this.getAttribute('data-state')).cam; this.goal = { th: c.th, ph: c.ph, r: c.r, t: new THREE.Vector3(...c.t) }; this.cam = { th: c.th, ph: c.ph, r: c.r, t: new THREE.Vector3(...c.t) }; }
    const m = s.milestone, con = m !== null && m !== undefined;
    this.o.walls.visible = !con || m >= 1;
    this.o.office.visible = !con || m >= 1;
    this.o.roof.visible = s.roof && (!con || m >= 2);
    this.o.roof.scale.x = con && m === 2 ? 0.55 : 1;
    this.o.roof.position.x = con && m === 2 ? -B.w * 0.225 : 0;
    this.o.chillers.visible = this.o.fans.visible = this.o.gens.visible = this.o.genStacks.visible = !con || m >= 4;
    this.o.pods.visible = this.o.yard.visible = this.o.trench.visible = this.o.genPad.visible = !con || m >= 6;
    this.o.pipes.forEach(p => p.visible = !con || m >= 6);
    this.m.util.emissiveIntensity = con ? (m >= 5 ? 0.35 : 0) : (s.section === 'power' ? 0.35 : 0.08);
    const zonesOn = !con || m >= 7;
    this.o.zones.visible = zonesOn;
    const zoneOp = con ? (m >= 9 ? 1 : m === 8 ? 0.75 : 0.35) : 1;
    [this.m.compute, this.m.elec, this.m.therm, this.m.zone, this.m.net].forEach(mm => mm.opacity = zoneOp * (mm === this.m.compute ? 0.92 : 0.9));
    this.o.racks.visible = zonesOn && (!con || m >= 9) && s.layers.compute;
    this.o.cdus.visible = zonesOn && (!con || m >= 9) && s.layers.liquid;
    this.o.fanwalls.visible = zonesOn && (!con || m >= 9);
    this.m.cdu.emissiveIntensity = s.section === 'liquid' ? 0.7 : ((s.section === 'thermal') ? 0.45 : 0.15);
    this.m.manifold.opacity = this.m.manifoldHot.opacity = (s.section === 'thermal' || s.section === 'liquid') ? 0.9 : 0.4;
    this.o.buildEdge.material.opacity = con && m < 9 ? 0.9 : 0;
    this.m.shell.opacity = this.m.roof.opacity = this.m.office.opacity = s.opacity;
    this.m.shell.depthWrite = this.m.roof.depthWrite = this.m.office.depthWrite = s.opacity > 0.6;
    const power = s.section === 'power', thermal = (s.section === 'thermal' || s.section === 'liquid'), compute = s.section === 'compute';
    this.m.compute.emissiveIntensity = compute ? 0.5 : (thermal ? 0.35 : 0.2);
    this.m.elec.emissiveIntensity = power ? 0.3 : 0; this.m.pod.emissiveIntensity = power ? 0.3 : 0;
    this.m.elec.color.set(power ? 0xB35F12 : T.zone);
    this.m.therm.emissiveIntensity = thermal ? 0.25 : 0;
    this.m.therm.color.set(thermal ? 0x1E8FAE : T.zone);
    this.m.net.emissiveIntensity = compute ? 0.6 : 0.2;
    const amb = !con && !power && !thermal && !compute && s.explode < 0.5;
    this._amb = amb;
    this.o.flowPower.visible = (power || amb) && s.layers.power && !con;
    this.o.flowThermal.visible = (thermal || amb) && s.layers.thermal && !con;
    this.o.flowCompute.visible = (compute || amb) && s.layers.compute && !con;
    this.o.heatRise.visible = (thermal || amb) && !con;
    this.o.heatRise.material.opacity = thermal ? 0.6 : 0.25;
    this.m.plenum.opacity = s.section === 'liquid' ? 0.3 : (thermal ? 0.14 : 0.06); this.o.plenum.visible = !con && !s.roof;
    this.o.trench.material.opacity = power ? 0.8 : 0.3;
    this.o.gridNode.visible = this.o.gridPad.visible = false;
    this.o.netNode.visible = this.o.netPad.visible = this.o.fiber.visible = (compute || amb) && s.layers.compute && !con;
    this.o.fiber.material.opacity = compute ? 0.8 : 0.3;
    const outage = s.scenario === 'outage';
    this.flows.forEach(f => {
      if (f.tag === 'grid') f.active = outage ? 0.12 : 1;
      if (f.tag === 'emergency') f.active = outage ? 1 : 0.0;
      if (f.tag === 'critical' || f.tag === 'internal') f.active = 1;
      const k = amb ? 0.4 : 1;
      f.tube.material.opacity = 0.28 * k * Math.max(f.active, 0.0); f.pm.material.opacity = 0.95 * k * f.active; f.pm.visible = f.active > 0.05; f.tube.visible = f.active > 0.05;
    });
    this.m.gen.emissiveIntensity = power && outage ? 0.5 : 0;
    this.o.gridNode.material.emissiveIntensity = outage ? 0.05 : 0.4; this.o.gridNode.material.color.set(outage ? T.ghost : SYS.power);
    this.o.future.visible = s.layers.future && s.campusView !== 'zones' && !con;
    this.m.ghost.opacity = s.campusView === 'future' ? 0.4 : 0.18; this.m.ghostWire.opacity = s.campusView === 'future' ? 0.9 : 0.5;
    this.o.padEdge.material.opacity = s.campusView === 'future' ? 0.3 : 0.7;
    this.renderer.setClearColor(0x000000, 0);
  }
  applyTheme(T) {
    this.o.grid.material.color.set(T.grid);
    this.m.plate.color.set(T.plate); this.m.pad.color.set(T.pad); this.m.slab.color.set(T.slab); this.m.shell.color.set(T.shell); this.m.roof.color.set(T.roof); this.m.office.color.set(T.shell);
    this.m.zone.color.set(T.zone); this.m.ghost.color.set(T.ghost); this.m.ghostWire.color.set(T.ghost); this.m.chiller.color.set(T.shell); this.m.gen.color.set(T.shell); this.m.util.color.set(T.shell); this.m.pod.color.set(T.shell); this.m.fanwall.color.set(T.line);
    this.o.fans.material.color.set(T.line); this.o.parapet.material.color.set(T.line); this.o.genPad.material.color.set(T.slab); this.o.yardPad.material.color.set(T.slab); this.o.chillerPad.material.color.set(T.slab); this.o.gridPad.material.color.set(T.slab); this.o.netPad.material.color.set(T.slab); this.o.conduits.material.color.set(T.line);
    this.o.plateEdge.material.color.set(T.line);
    this.o.walls.children.forEach(w => w.children[0].material.color.set(T.line));
    this.o.office.children.forEach(w => w.children[0].material.color.set(T.line));
    this.o.roof.children[0].children[0].material.color.set(T.line);
    this.labels.forEach(l => { l.el.style.background = T.label; l.el.style.borderColor = T.border; l.el.style.color = l.color || T.text; l.el.querySelector('[data-s]').style.color = T.muted; l.line.setAttribute('stroke', l.color || T.muted); });
  }
  // ---------- interaction ----------
  bind(canvas) {
    let down = null, moved = false, pinch = null;
    const pos = e => ({ x: e.clientX, y: e.clientY });
    const touch = () => { this._lastInput = performance.now(); };
    ['pointerdown', 'wheel', 'keydown', 'touchstart'].forEach(ev => canvas.addEventListener(ev, touch, { passive: true }));
    canvas.addEventListener('pointerdown', e => { down = pos(e); moved = false; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e => {
      if (!down || pinch) return; const p = pos(e); const dx = p.x - down.x, dy = p.y - down.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      this.goal.th -= dx * 0.006; this.goal.ph = Math.min(1.45, Math.max(0.25, this.goal.ph - dy * 0.005)); down = p;
      if (REDUCED) { this.cam.th = this.goal.th; this.cam.ph = this.goal.ph; }
    });
    canvas.addEventListener('pointerup', e => { if (down && !moved) this.pick(e); down = null; });
    canvas.addEventListener('pointercancel', () => { down = null; });
    canvas.addEventListener('wheel', e => { e.preventDefault(); this.zoom(Math.exp(e.deltaY * 0.0012)); }, { passive: false });
    canvas.addEventListener('touchstart', e => { if (e.touches.length === 2) pinch = this.dist(e); }, { passive: true });
    canvas.addEventListener('touchmove', e => { if (e.touches.length === 2 && pinch) { const d = this.dist(e); this.zoom(pinch / d); pinch = d; } }, { passive: true });
    canvas.addEventListener('touchend', () => { pinch = null; });
    canvas.addEventListener('keydown', e => {
      const k = e.key; const step = 0.12;
      if (k === 'ArrowLeft') this.goal.th += step; else if (k === 'ArrowRight') this.goal.th -= step;
      else if (k === 'ArrowUp') this.goal.ph = Math.max(0.25, this.goal.ph - 0.08); else if (k === 'ArrowDown') this.goal.ph = Math.min(1.45, this.goal.ph + 0.08);
      else if (k === '+' || k === '=') this.zoom(0.85); else if (k === '-') this.zoom(1.18); else return; e.preventDefault();
    });
  }
  dist(e) { const a = e.touches[0], b = e.touches[1]; return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
  zoom(f) { this.goal.r = Math.min(320, Math.max(12, this.goal.r * f)); if (REDUCED) this.cam.r = this.goal.r; }
  pick(e) {
    const r = this.getBoundingClientRect();
    const v = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    const rc = new THREE.Raycaster(); rc.setFromCamera(v, this.camera);
    const hits = rc.intersectObjects(this.pickables.filter(o => { let p = o; while (p) { if (!p.visible) return false; p = p.parent; } return true; }), false);
    if (hits.length) this.dispatchEvent(new CustomEvent('stage-select', { detail: { id: hits[0].object.userData.id }, bubbles: true }));
  }
  reset() { this._lastInput = performance.now(); const pr = PRESETS[this.state.preset] || PRESETS.campus; this.goal.th = pr.th; this.goal.ph = pr.ph; this.goal.r = pr.r; this.goal.t.set(...pr.t); }
  // ---------- frame ----------
  tick() {
    const s = this.state, dt = Math.min(this.clock.getDelta(), 0.05), t = this.clock.elapsedTime;
    if (!REDUCED && performance.now() - (this._lastInput || 0) > 5000) this.goal.th += dt * 0.025;
    const k = REDUCED ? 1 : 1 - Math.pow(0.001, dt);
    this.cam.th += (this.goal.th - this.cam.th) * k; this.cam.ph += (this.goal.ph - this.cam.ph) * k; this.cam.r += (this.goal.r - this.cam.r) * k; this.cam.t.lerp(this.goal.t, k);
    const c = this.cam;
    this.camera.position.set(c.t.x + c.r * Math.sin(c.ph) * Math.sin(c.th), c.t.y + c.r * Math.cos(c.ph), c.t.z + c.r * Math.sin(c.ph) * Math.cos(c.th));
    this.camera.lookAt(c.t);
    const ex = s.explode, ek = REDUCED ? 1 : 1 - Math.pow(0.002, dt);
    this._ex = this._ex === undefined ? ex : this._ex + (ex - this._ex) * ek;
    this.o.walls.position.y = 0.15 + this._ex * 2.6;
    this.o.roof.position.y = 0.15 + B.h + this._ex * 5.6;
    this.o.zones.position.y = 0.15 + this._ex * 0.6;
    this.o.pods.position.z = this._ex * 1.2; this.o.office.position.x = this._ex * 1.6;
    const anim = !REDUCED;
    const d = new THREE.Object3D();
    this.flows.forEach(f => {
      if (!f.pm.visible || !f.pm.parent.visible) return;
      for (let i = 0; i < f.n; i++) { const u = anim ? (t * f.speed + i / f.n) % 1 : i / f.n; f.curve.getPointAt(u, d.position); const sc = 0.7 + 0.3 * Math.sin(u * Math.PI); d.scale.setScalar(sc); d.updateMatrix(); f.pm.setMatrixAt(i, d.matrix); }
      f.pm.instanceMatrix.needsUpdate = true;
    });
    if (this.o.heatRise.visible) {
      const seeds = this.o.heatRise.userData.seed;
      for (let i = 0; i < 45; i++) { const u = anim ? (t * 0.12 + seeds[i]) % 1 : seeds[i], [px, pz] = this.chPlaces[i]; d.position.set(px + Math.sin(i) * 0.2, 1.3 + u * 3.0, pz + Math.cos(i * 1.7) * 0.2); d.scale.setScalar(1 - u * 0.8); d.updateMatrix(); this.o.heatRise.setMatrixAt(i, d.matrix); }
      this.o.heatRise.instanceMatrix.needsUpdate = true;
    }
    if (!REDUCED) this.m.compute.emissiveIntensity += Math.sin(t * 1.4) * 0.002;
    this.renderer.render(this.scene, this.camera);
    this._lastFrame = performance.now();
    if ((this._frame = (this._frame || 0) + 1) % 20 === 0) this.setAttribute('data-state', JSON.stringify({ state: s, cam: { th: c.th, ph: c.ph, r: c.r, t: [c.t.x, c.t.y, c.t.z] } }));
    const w = this.clientWidth, h = this.clientHeight, v = new THREE.Vector3();
    const small = w < 1000; if (this._small !== small) { this._small = small; this.labels.forEach(l => { l.el.style.fontSize = small ? '9px' : '10px'; l.el.style.padding = small ? '4px 6px' : '6px 8px'; }); }
    const hud = this.parentElement && this.parentElement.querySelector('[data-hud]');
    const placed = [];
    if (hud) { const r = hud.getBoundingClientRect(), me = this.getBoundingClientRect(); placed.push({ x: r.left - me.left, y: r.top - me.top, w: r.width, h: r.height }); } else placed.push({ x: 0, y: 0, w: Math.min(w, 340), h: 70 });
    const vis = []; const narrowW = w < 700; let shown = 0;
    const zoneIds = ['hall101', 'hall102', 'elec', 'mech', 'core', 'capture', 'liquid', 'hac', 'idf', 'poeE', 'poeW'];
    this.labels.forEach(l => {
      const show = l.show(s);
      v.copy(l.pos); if (l.id === 'roof') v.y = this.o.roof.position.y + 0.3 + this.o.building.position.y; if (l.id === 'shell') v.y = this.o.walls.position.y + 1.7;
      if (zoneIds.includes(l.id)) v.y += this.o.zones.position.y - 0.15;
      if (l.id === 'pods') v.z += this.o.pods.position.z; if (l.id === 'office') v.x += this.o.office.position.x;
      v.project(this.camera);
      const off = v.z > 1 || Math.abs(v.x) > 1.1 || Math.abs(v.y) > 1.1;
      if (!(show && !off)) { l.el.style.opacity = 0; l.line.setAttribute('opacity', '0'); return; }
      vis.push({ l, x: (v.x + 1) / 2 * w, y: (1 - v.y) / 2 * h });
    });
    const overlaps = (x0, y0, lw, lh) => placed.some(p => x0 < p.x + p.w + 4 && x0 + lw > p.x - 4 && y0 < p.y + p.h + 4 && y0 + lh > p.y - 4);
    vis.sort((a, b) => a.y - b.y).forEach(it => {
      const lw = it.l.el.offsetWidth || 160, lh = it.l.el.offsetHeight || 40, ax = it.x, ay = it.y;
      const cands = [[ax - lw / 2, ay - lh - 10], [ax + 14, ay - lh / 2], [ax - lw - 14, ay - lh / 2], [ax - lw / 2, ay + 12], [ax + 14, ay - lh - 24], [ax - lw - 14, ay - lh - 24], [ax + 14, ay + 12], [ax - lw - 14, ay + 12], [ax - lw / 2, ay - lh - 60], [ax - lw / 2, ay + 60]];
      let box = null;
      for (const [cx, cy] of cands) { const x0 = Math.max(4, Math.min(w - lw - 4, cx)), y0 = Math.max(4, Math.min(h - lh - 4, cy)); if (!overlaps(x0, y0, lw, lh)) { box = [x0, y0]; break; } }
      if (narrowW && (!box || shown >= 3)) { it.l.el.style.opacity = 0; it.l.line.setAttribute('opacity', '0'); return; }
      shown++;
      if (!box) { const [cx, cy] = cands[0]; box = [Math.max(4, Math.min(w - lw - 4, cx)), Math.max(4, Math.min(h - lh - 4, cy))]; }
      placed.push({ x: box[0], y: box[1], w: lw, h: lh });
      it.l.el.style.opacity = 1;
      it.l.el.style.transform = `translate(${box[0].toFixed(1)}px, ${box[1].toFixed(1)}px)`;
      const bx = Math.max(box[0], Math.min(box[0] + lw, ax)), by = Math.max(box[1], Math.min(box[1] + lh, ay));
      const dist = Math.hypot(bx - ax, by - ay);
      if (dist > 6) { it.l.line.setAttribute('x1', bx); it.l.line.setAttribute('y1', by); it.l.line.setAttribute('x2', ax); it.l.line.setAttribute('y2', ay); it.l.line.setAttribute('opacity', '0.7'); } else it.l.line.setAttribute('opacity', '0');
    });
  }
}
customElements.define('campus-stage', CampusStage);
