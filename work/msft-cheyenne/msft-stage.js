// <msft-stage> — procedural public-information model of Microsoft's Cheyenne footprint. City-scale, generalized. No survey geometry, no live data.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const SYS = { compute: 0x7765FF, water: 0x45D8FF, heat: 0xFF6747, power: 0xFF8A22, gas: 0xF6B73C, construction: 0xF6B73C, ghost: 0x7A8797, wind: 0x30D187 };
const THEMES = {
  dark: { plate: 0x151A20, pad: 0x1B2129, grid: 0x1A2027, shell: 0x2B333D, roof: 0x3A424D, road: 0x2A313B, ghost: 0x3A4350, line: 0x3E4753, slab: 0x20262E, town: 0x232A33, text: '#F4F6F8', muted: '#9CA6B2', label: 'rgba(20,24,31,0.86)', border: 'rgba(255,255,255,0.12)' },
  light: { plate: 0xD9DCD8, pad: 0xCDD1CC, grid: 0xCDD0CC, shell: 0xF6F7F5, roof: 0xFFFFFF, road: 0xB9BEBA, ghost: 0xB4BBC4, line: 0x8F979F, slab: 0xBFC4BF, town: 0xC9CDC8, text: '#101214', muted: '#5B6470', label: 'rgba(242,243,241,0.92)', border: 'rgba(16,18,20,0.14)' },
};
// 1 unit ≈ 100 m. Positions are generalized relative placements around downtown Cheyenne (0,0); x east, z south.
const C = {
  nr:    { id: 'nr',    x: -34, z: 10, w: 9,  d: 8,  n: 5, label: 'North Range Business Park', sub: 'original campus · since 2012 · Logistics Drive' },
  cbp:   { id: 'cbp',   x: 34,  z: 14, w: 7,  d: 6,  n: 3, label: 'Cheyenne Business Parkway', sub: 'opened 2021 · east Cheyenne' },
  bison: { id: 'bison', x: 12,  z: 40, w: 7,  d: 6,  n: 3, label: 'Bison Business Park', sub: 'opened 2021 · Wapiti Trail' },
  hr:    { id: 'hr',    x: 58,  z: 30, w: 8,  d: 7,  n: 3, label: 'HR Ranch Road', sub: 'under construction · groundbreaking 2025' },
};
const PARCELS = [
  { id: 'se3000', x: 34, z: 60, w: 36, d: 34, label: 'Southeast Cheyenne · 3,000 Acres', sub: 'announced April 2026 · design phase' },
  { id: 'bison200', x: 14, z: 49, w: 10, d: 8, label: 'Bison Business Park · 200 Acres', sub: 'announced April 2026' },
  { id: 'cd385', x: 46, z: 20, w: 13, d: 12, label: 'East Of College Drive · 385 Acres', sub: 'reported May 2026' },
  { id: 'nr920', x: -36, z: -2, w: 19, d: 19, label: 'North Range Expansion · 920+ Acres', sub: 'annexed 2024' },
  { id: 'hj35', x: -28, z: 3, w: 4, d: 3.5, label: 'South Of Happy Jack Road · 35 Acres', sub: 'reported May 2026' },
];
const P = {
  genStation: new THREE.Vector3(66, 0, 25),
  wwtp: new THREE.Vector3(55, 0, 38),
  bopu: new THREE.Vector3(-46, 0, -18),
  windA: new THREE.Vector3(-74, 0, -8), windB: new THREE.Vector3(-70, 0, 10),
  fiberW: new THREE.Vector3(-90, 0, 18.5), fiberE: new THREE.Vector3(96, 0, 18.5),
};
const PRESETS = {
  city: { t: [10, 0, 22], r: 210, th: -0.55, ph: 0.9 },
  nr: { t: [-34, 0, 8], r: 40, th: -0.7, ph: 0.9 },
  cbp: { t: [34, 0, 14], r: 32, th: -0.5, ph: 0.9 },
  bison: { t: [12, 0, 40], r: 32, th: -0.6, ph: 0.9 },
  hr: { t: [58, 0, 30], r: 36, th: -0.9, ph: 0.9 },
  expansion: { t: [30, 0, 50], r: 130, th: -0.4, ph: 0.85 },
  power: { t: [16, 0, 20], r: 230, th: -0.35, ph: 0.8 },
  wind: { t: [-30, 0, 8], r: 190, th: -1.1, ph: 0.95 },
};
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

class MsftStage extends HTMLElement {
  constructor() {
    super();
    this.state = { theme: 'dark', section: 'overview', preset: 'city', layers: { power: true, backup: true, water: true, network: true, expansion: true }, milestone: null, scenario: 'grid', season: 'cool', campusView: 'all', roof: true, explode: 0 };
    this.rv = { ry: 0, ro: 1, wy: 0, wo: 1 };
    this.cam = { th: -0.55, ph: 0.9, r: 210, t: new THREE.Vector3(10, 0, 22) };
    this.goal = { th: -0.55, ph: 0.9, r: 210, t: new THREE.Vector3(10, 0, 22) };
    this.clock = new THREE.Clock(); this.labels = [];
  }
  connectedCallback() {
    if (this._built) { this.dispatchEvent(new CustomEvent('stage-ready', { bubbles: true })); return; } this._built = true;
    this.style.cssText += 'display:block;position:relative;overflow:hidden;width:100%;height:100%;min-height:240px;';
    try { const saved = JSON.parse(this.getAttribute('data-state') || 'null'); if (this.getAttribute('theme')) this.state.theme = this.getAttribute('theme'); if (saved) { Object.assign(this.state, saved.state); const c = saved.cam; this.cam = { th: c.th, ph: c.ph, r: c.r, t: new THREE.Vector3(...c.t) }; this.goal = { th: c.th, ph: c.ph, r: c.r, t: new THREE.Vector3(...c.t) }; this._restored = true; } } catch (e) {}
    this.innerHTML = '<canvas style="position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;outline:none" tabindex="0" aria-label="Interactive conceptual model of the Microsoft Cheyenne campuses. Drag to orbit, scroll to zoom."></canvas><svg data-leaders style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible"></svg><div data-labels style="position:absolute;inset:0;pointer-events:none;overflow:hidden"></div>';
    const canvas = this.querySelector('canvas');
    try { this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' }); } catch (e) { this.fallback(); return; }
    if (!this.renderer.getContext()) { this.fallback(); return; }
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(26, 1, 0.1, 900);
    this.build(); this.bind(canvas);
    this.ro = new ResizeObserver(() => { this.resize(); if (this.renderer) this.tick(); }); this.ro.observe(this);
    this.resize(); this.applyState(this.state, true);
    this.loop = () => { this.raf = requestAnimationFrame(this.loop); this.tick(); }; this.loop();
    this.dispatchEvent(new CustomEvent('stage-ready', { bubbles: true }));
  }
  disconnectedCallback() { cancelAnimationFrame(this.raf); this.ro && this.ro.disconnect(); }
  fallback() { this.innerHTML = '<div style="position:absolute;inset:0;display:grid;place-items:center;padding:32px;text-align:center;font:13px/1.5 IBM Plex Sans,sans-serif;color:#9CA6B2"><div><div style="width:120px;height:70px;margin:0 auto 16px;border:1px solid currentColor;transform:rotateX(60deg) rotateZ(45deg)"></div>3D VIEW UNAVAILABLE<br>WebGL could not start. The model is described in the text panels.</div></div>'; }
  resize() { const w = this.clientWidth || 800, h = this.clientHeight || 600; this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); }
  mat(color, o = {}) { return new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0.05 }, o)); }
  box(w, h, d, m, x = 0, y = 0, z = 0) { const g = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); g.position.set(x, y + h / 2, z); return g; }
  edges(mesh, color, op = 1) { const e = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color, transparent: true, opacity: op })); mesh.add(e); return e; }
  build() {
    const s = this.scene, T = THEMES[this.state.theme];
    s.add(new THREE.HemisphereLight(0xffffff, 0x334455, 2.6));
    const key = new THREE.DirectionalLight(0xffffff, 3.0); key.position.set(-60, 90, 40); s.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 1.0); fill.position.set(80, 40, -60); s.add(fill);
    this.m = {}; this.o = {}; this.flows = [];
    this.o.grid = new THREE.GridHelper(700, 70, T.grid, T.grid); this.o.grid.position.y = -0.3; s.add(this.o.grid);
    this.m.plate = this.mat(T.plate); this.o.plate = this.box(230, 0.5, 170, this.m.plate, 10, -0.5, 22); s.add(this.o.plate); this.o.plateEdge = this.edges(this.o.plate, T.line, 0.9);
    // campuses
    this.m.pad = this.mat(T.pad); this.m.shell = this.mat(T.shell); this.m.roof = this.mat(T.roof, { transparent: true, opacity: 1 });
    this.m.wall = this.mat(T.shell, { transparent: true, opacity: 1 }); this.m.slab = this.mat(T.slab);
    this.m.build = this.mat(T.shell, { transparent: true, opacity: 0.4 });
    this.m.sub = this.mat(T.shell, { emissive: SYS.power, emissiveIntensity: 0.1 });
    this.m.gas = this.mat(T.shell, { emissive: SYS.gas, emissiveIntensity: 0 });
    this.m.diesel = this.mat(T.shell, { emissive: SYS.heat, emissiveIntensity: 0 });
    this.m.evap = new THREE.MeshBasicMaterial({ color: SYS.water, transparent: true, opacity: 0.0 });
    // interiors
    const zone = c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.2, depthWrite: false });
    this.m.zPower = zone(SYS.power); this.m.zNet = zone(SYS.compute); this.m.zComp = zone(SYS.compute); this.m.zWater = zone(SYS.water);
    this.m.rack = this.mat(0x2A2650, { emissive: SYS.compute, emissiveIntensity: 0.3 });
    this.m.hood = new THREE.MeshBasicMaterial({ color: SYS.heat, transparent: true, opacity: 0.22, depthWrite: false });
    this.m.ups = this.mat(T.shell, { emissive: SYS.power, emissiveIntensity: 0.25 });
    this.m.net = this.mat(T.shell, { emissive: SYS.compute, emissiveIntensity: 0.3 });
    this.m.fan = this.mat(T.shell, { emissive: SYS.water, emissiveIntensity: 0.3 });
    this.m.tank = this.mat(T.shell, { emissive: SYS.water, emissiveIntensity: 0.12 });
    const door = c => new THREE.MeshBasicMaterial({ color: c });
    this.m.dPower = door(SYS.power); this.m.dNet = door(SYS.compute); this.m.dWater = door(SYS.water); this.m.dReturn = door(0x1E8FAE); this.m.dEntry = door(0xE6E9EC); this.m.dDock = door(0x9CA6B2);
    this.campus = {}; this.buildings = [];
    const BD = 1.8, BH = 0.9, WT = 0.05;
    Object.values(C).forEach(c => {
      const g = new THREE.Group(); g.position.set(c.x, 0, c.z); s.add(g);
      const pad = this.box(c.w, 0.12, c.d, this.m.pad); pad.userData.id = c.id; g.add(pad); const padEdge = this.edges(pad, c.id === 'hr' ? SYS.construction : SYS.compute, 0.7);
      const bldgs = [], evaps = [], units = [];
      const cols = Math.min(c.n, 3), bw = (c.w - 1.2 - (cols - 1) * 0.5) / cols;
      const under = c.id === 'hr';
      for (let i = 0; i < c.n; i++) {
        const col = i % cols, row = Math.floor(i / cols), bx = -c.w / 2 + 0.6 + bw / 2 + col * (bw + 0.5), bz = -c.d / 2 + 1.5 + row * 2.6;
        const bg = new THREE.Group(); bg.position.set(bx, 0.12, bz); g.add(bg);
        const slab = this.box(bw, 0.04, BD, this.m.slab); slab.userData.id = c.id; bg.add(slab);
        // shell walls
        const walls = new THREE.Group(); bg.add(walls); const wm = under ? this.m.build : this.m.wall;
        [[bw, WT, 0, -BD / 2 + WT / 2], [bw, WT, 0, BD / 2 - WT / 2], [WT, BD, -bw / 2 + WT / 2, 0], [WT, BD, bw / 2 - WT / 2, 0]].forEach(([w, d, x, z]) => { const wl = this.box(w, BH, d, wm, x, 0.04, z); wl.userData.id = c.id; walls.add(wl); this.edges(wl, under ? SYS.construction : T.line, under ? 0.9 : 0.8); });
        // roof
        const roofG = new THREE.Group(); roofG.position.y = BH + 0.04; bg.add(roofG);
        const rs = this.box(bw + 0.08, 0.08, BD + 0.08, this.m.roof); rs.userData.id = c.id; roofG.add(rs); this.edges(rs, T.line, 0.9);
        const par = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(bw - 0.3, 0.12, BD - 0.3)), new THREE.LineBasicMaterial({ color: T.line, transparent: true, opacity: 0.5 })); par.position.y = 0.14; roofG.add(par);
        const nu = Math.max(2, Math.floor(bw / 0.5)); for (let k = 0; k < nu; k++) { roofG.add(this.box(0.26, 0.14, 0.26, this.m.roof, -bw / 2 + 0.4 + k * ((bw - 0.8) / Math.max(1, nu - 1)), 0.08, -0.45)); roofG.add(this.box(0.26, 0.14, 0.26, this.m.roof, -bw / 2 + 0.4 + k * ((bw - 0.8) / Math.max(1, nu - 1)), 0.08, 0.45)); }
        // interior
        const inner = new THREE.Group(); bg.add(inner); const EW = 0.45, NW = 0.3;
        inner.add(this.box(EW, 0.015, BD - 0.14, this.m.zPower, -bw / 2 + WT + EW / 2, 0.04, 0));
        [-0.6, -0.2, 0.2, 0.6].forEach(z => { const u = this.box(0.14, 0.3, 0.26, this.m.ups, -bw / 2 + WT + 0.2, 0.05, z); inner.add(u); this.edges(u, SYS.power, 0.5); });
        inner.add(this.box(NW, 0.015, BD - 0.14, this.m.zNet, bw / 2 - WT - NW / 2, 0.04, 0));
        [-0.35, 0.35].forEach(z => { const u = this.box(0.12, 0.34, 0.4, this.m.net, bw / 2 - WT - 0.15, 0.05, z); inner.add(u); this.edges(u, SYS.compute, 0.5); });
        const hx0 = -bw / 2 + WT + EW + 0.1, hx1 = bw / 2 - WT - NW - 0.1, hw = hx1 - hx0, hc = (hx0 + hx1) / 2;
        [-0.48, 0.48].forEach(hz => {
          inner.add(this.box(hw, 0.015, 0.7, this.m.zComp, hc, 0.04, hz));
          const nr = Math.max(2, Math.floor((hw - 0.1) / 0.18)), sp = (hw - 0.14) / Math.max(1, nr - 1);
          for (let k = 0; k < nr; k++) { const rx = hx0 + 0.07 + k * sp; const rk = this.box(0.08, 0.24, 0.58, this.m.rack, rx, 0.05, hz); inner.add(rk); if (k % 2 === 1) inner.add(this.box(0.2, 0.05, 0.58, this.m.hood, rx - sp / 2, 0.34, hz)); }
        });
        // evaporative air-handling galleries along both long walls
        [-1, 1].forEach(sg => { const gz = sg * (BD / 2 - WT - 0.09); inner.add(this.box(hw, 0.015, 0.16, this.m.zWater, hc, 0.04, gz)); const nf = Math.max(2, Math.floor(hw / 0.32)); for (let k = 0; k < nf; k++) { const f = this.box(0.14, 0.22, 0.12, this.m.fan, hx0 + 0.12 + k * ((hw - 0.24) / Math.max(1, nf - 1)), 0.05, gz); inner.add(f); } });
        // entries
        const pwX = -bw / 2 + 0.25, neX = bw / 2 - 0.17, wiX = -bw / 4, woX = bw / 4;
        const E = (w, h, m, x, z) => { const d = this.box(w, h, 0.09, m, x, 0.04, z); bg.add(d); return d; };
        E(0.16, 0.3, this.m.dPower, pwX, BD / 2 - WT / 2); E(0.14, 0.3, this.m.dNet, neX, BD / 2 - WT / 2);
        E(0.26, 0.36, this.m.dEntry, 0, BD / 2 - WT / 2); bg.add(this.box(0.5, 0.03, 0.3, this.m.roof, 0, 0.42, BD / 2 + 0.12));
        E(0.34, 0.42, this.m.dDock, bw / 4 + 0.1, BD / 2 - WT / 2); bg.add(this.box(0.4, 0.1, 0.25, this.m.slab, bw / 4 + 0.1, 0.04, BD / 2 + 0.12));
        E(0.12, 0.2, this.m.dWater, wiX, -BD / 2 + WT / 2); E(0.12, 0.2, this.m.dReturn, woX, -BD / 2 + WT / 2);
        const ol = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(bw, BH, BD)), new THREE.LineBasicMaterial({ color: SYS.construction, transparent: true, opacity: 0 })); ol.position.set(0, BH / 2 + 0.04, 0); bg.add(ol);
        const ev = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 8, 1, true), this.m.evap); ev.position.set(bx, 2.0, bz); g.add(ev); evaps.push(ev);
        const W = (x, y, z) => new THREE.Vector3(c.x + x, y, c.z + z);
        const sz = bz + BD / 2 + 0.4, nz = bz - BD / 2 - 0.4;
        const b = { g: bg, slab, walls, roofG, inner, ol, def: c, i, bw, bx, bz, sz, nz, wallM: wm,
          pw: W(bx + pwX, 0.3, bz + BD / 2), ne: W(bx + neX, 0.3, bz + BD / 2), wi: W(bx + wiX, 0.3, bz - BD / 2), wo: W(bx + woX, 0.3, bz - BD / 2),
          elec: W(bx - bw / 2 + 0.28, 0.42, bz), netr: W(bx + bw / 2 - 0.2, 0.42, bz), gN: W(bx + wiX, 0.3, bz - BD / 2 + 0.3), gS: W(bx + woX, 0.3, bz - BD / 2 + 0.3), ctr: W(bx, 0.6, bz), W };
        bldgs.push(b); this.buildings.push(b);
      }
      // substation: fenced pad with three transformers and a mast
      const subX = -c.w / 2 - 1.4, subZ = c.d / 2 - 1;
      const sub = this.box(1.6, 0.06, 1.6, this.m.slab, subX, 0, subZ); sub.userData.id = 'power'; g.add(sub); this.edges(sub, SYS.power, 0.7);
      const subG = new THREE.Group(); g.add(subG);
      [-0.45, 0, 0.45].forEach(dx => { const tr = this.box(0.3, 0.4, 0.42, this.m.sub, subX + dx, 0.06, subZ + 0.2); tr.userData.id = 'power'; subG.add(tr); this.edges(tr, SYS.power, 0.5); });
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6), this.mat(SYS.power, { emissive: SYS.power, emissiveIntensity: 0.4 })); mast.position.set(subX, 0.76, subZ - 0.5); g.add(mast);
      // generator yard
      const gens = []; const gm = c.id === 'hr' ? this.m.diesel : this.m.gas; const gn = c.id === 'hr' ? 8 : (c.id === 'nr' ? 6 : 4);
      for (let i = 0; i < gn; i++) { const ge = this.box(0.42, 0.32, 0.8, gm, -c.w / 2 + 0.6 + i * 0.6, 0.12, c.d / 2 - 0.9); ge.userData.id = 'backup'; g.add(ge); this.edges(ge, c.id === 'hr' ? SYS.heat : SYS.gas, 0.5); gens.push(ge); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6), gm); st.position.set(-c.w / 2 + 0.6 + i * 0.6, 0.6, c.d / 2 - 1.2); g.add(st); gens.push(st); }
      if (c.id === 'hr') for (let i = 0; i < 3; i++) { const tk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.9, 10), this.m.diesel); tk.rotation.z = Math.PI / 2; tk.position.set(-c.w / 2 + 1.2 + i * 1.1, 0.3, c.d / 2 - 0.3); tk.userData.id = 'backup'; g.add(tk); gens.push(tk); }
      // cooling water tanks north of the pad
      const tanks = new THREE.Group(); g.add(tanks); const tkX = -c.w / 2 + 1, tkZ = -c.d / 2 - 1.1;
      [0, 0.75].forEach(dx => { const tk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.5, 14), this.m.tank); tk.position.set(tkX + dx, 0.25, tkZ); tanks.add(tk); tanks.add(this.edges(tk, SYS.water, 0.4)); });
      const tankPos = new THREE.Vector3(c.x + tkX + 0.37, 0.3, c.z + tkZ);
      // fence + gate
      const fence = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(c.w + 0.6, 0.02, c.d + 0.6)), new THREE.LineBasicMaterial({ color: T.line, transparent: true, opacity: 0.5 })); fence.position.y = 0.14; g.add(fence);
      const gate = this.box(0.6, 0.02, 0.12, this.m.dDock, 0, 0.13, c.d / 2 + 0.3); g.add(gate);
      this.campus[c.id] = { g, pad, padEdge, bldgs, evaps, sub, subG, mast, gens, tanks, tankPos, fence, def: c, subPos: new THREE.Vector3(c.x + subX, 0.4, c.z + subZ), wx: -c.w / 2 - 0.4, ex: c.w / 2 + 0.4 };
    });
    // expansion parcels (ghost)
    this.m.ghost = this.mat(T.ghost, { transparent: true, opacity: 0.16 }); this.m.ghostWire = new THREE.LineBasicMaterial({ color: T.ghost, transparent: true, opacity: 0.55 });
    this.parcels = {}; this.o.parcels = new THREE.Group(); s.add(this.o.parcels);
    PARCELS.forEach(p => { const pad = this.box(p.w, 0.1, p.d, this.m.ghost, p.x, 0.02, p.z); pad.userData.id = 'parcel:' + p.id; pad.add(new THREE.LineSegments(new THREE.EdgesGeometry(pad.geometry), this.m.ghostWire)); this.o.parcels.add(pad); this.parcels[p.id] = pad; });
    // conceptual future massing on the 3,000-acre parcel
    this.o.future = new THREE.Group(); s.add(this.o.future);
    for (let i = 0; i < 6; i++) { const b = this.box(6, 0.9, 3, this.m.ghost, 34 - 12 + (i % 3) * 12, 0.12, 60 - 6 + Math.floor(i / 3) * 12); b.add(new THREE.LineSegments(new THREE.EdgesGeometry(b.geometry), this.m.ghostWire)); this.o.future.add(b); }
    // Cheyenne Prairie Generation Station (Black Hills) — context
    this.o.gen = new THREE.Group(); this.o.gen.position.copy(P.genStation); s.add(this.o.gen);
    const gs = this.box(4, 1.2, 3, this.mat(T.shell), 0, 0, 0); gs.userData.id = 'grid'; this.o.gen.add(gs); this.edges(gs, SYS.power, 0.8);
    [-1, 0.2, 1.4].forEach(dx => { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.6, 8), this.mat(T.shell)); st.position.set(dx, 1.2 + 0.8, -0.8); this.o.gen.add(st); });
    // Dry Creek WWTP — context
    this.o.wwtp = new THREE.Group(); this.o.wwtp.position.copy(P.wwtp); s.add(this.o.wwtp);
    [[-1.2, 0], [1.2, 0], [0, 1.6]].forEach(([x, z]) => { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.3, 16), this.mat(T.slab)); t.position.set(x, 0.15, z); this.o.wwtp.add(t); const rim = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.03, 6, 24), new THREE.MeshBasicMaterial({ color: SYS.water, transparent: true, opacity: 0.6 })); rim.rotation.x = Math.PI / 2; rim.position.set(x, 0.32, z); this.o.wwtp.add(rim); });
    // BOPU water treatment — context
    this.o.bopu = this.box(3, 0.7, 2.2, this.mat(T.shell), P.bopu.x, 0, P.bopu.z); s.add(this.o.bopu); this.edges(this.o.bopu, SYS.water, 0.7);
    // wind turbines (Happy Jack / Silver Sage — symbolic)
    this.o.wind = new THREE.Group(); s.add(this.o.wind); this.turbines = [];
    [P.windA, P.windB].forEach((p, k) => { for (let i = 0; i < 4; i++) { const tw = new THREE.Group(); tw.position.set(p.x + (i % 2) * 4 - 2, 0, p.z + Math.floor(i / 2) * 4 - 2); const mastM = this.mat(T.shell); const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 3.2, 8), mastM); mast.position.y = 1.6; tw.add(mast); const hub = new THREE.Group(); hub.position.set(0, 3.2, 0.15); for (let b = 0; b < 3; b++) { const bl = this.box(0.12, 1.4, 0.04, mastM, 0, 0, 0); bl.position.set(0, 0.7, 0); const piv = new THREE.Group(); piv.rotation.z = b * Math.PI * 2 / 3; piv.add(bl); hub.add(piv); } tw.add(hub); this.o.wind.add(tw); this.turbines.push({ hub, speed: 0.8 + k * 0.2 + i * 0.07 }); } });
    // grid trunk (Black Hills) — generalized transmission line along the south edge of I-80 to each substation
    this.m.trunk = new THREE.LineDashedMaterial({ color: SYS.power, dashSize: 1.5, gapSize: 1, transparent: true, opacity: 0.45 });
    const trunkPts = [new THREE.Vector3(P.genStation.x, 0.2, P.genStation.z), new THREE.Vector3(P.genStation.x, 0.2, 21), new THREE.Vector3(-45, 0.2, 21)];
    this.o.trunk = new THREE.Line(new THREE.BufferGeometry().setFromPoints(trunkPts), this.m.trunk); this.o.trunk.computeLineDistances(); s.add(this.o.trunk);
    // fiber backbone along I-80 (symbolic) — West Central US region interconnect
    this.m.fiber = new THREE.LineDashedMaterial({ color: SYS.compute, dashSize: 0.9, gapSize: 0.7, transparent: true, opacity: 0.45 });
    this.o.fiber = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(P.fiberW.x, 0.25, 16.6), new THREE.Vector3(P.fiberE.x, 0.25, 16.6)]), this.m.fiber); this.o.fiber.computeLineDistances(); s.add(this.o.fiber);
    // flows — utilities enter each building at a marked door, never through the walls
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const IDS = ['nr', 'cbp', 'bison', 'hr'];
    const cw = (id, x, y, z) => V(C[id].x + x, y, C[id].z + z);
    // grid trunk → substation (campus scale)
    this.o.flowPower = this.flowGroup(IDS.map(id => { const sp = this.campus[id].subPos; return [[V(sp.x, 0.4, 21), V(sp.x, 0.4, sp.z + (sp.z < 21 ? 1.2 : -1.2)), sp], SYS.power, 'grid:' + id]; })); s.add(this.o.flowPower);
    // substation → west corridor → south service corridor → power door → electrical room
    this.o.flowFeed = this.flowGroup(this.buildings.map(b => { const c = this.campus[b.def.id], id = b.def.id; return [[c.subPos, cw(id, c.wx, 0.25, c.subPos.z - C[id].z), cw(id, c.wx, 0.25, b.sz), V(b.pw.x, 0.25, b.pw.z + 0.4), b.pw, b.elec], SYS.power, 'grid:' + id + ':' + b.i]; }), 0.05, 0.1); s.add(this.o.flowFeed);
    this.o.flowWind = this.flowGroup([[[V(P.windA.x, 1.5, P.windA.z), V(-60, 0.6, 12), V(-45, 0.4, 21)], SYS.wind, 'wind'], [[V(P.windB.x, 1.5, P.windB.z), V(-58, 0.6, 18), V(-45, 0.4, 21)], SYS.wind, 'wind']]); s.add(this.o.flowWind);
    // generators → west edge of pad → service corridor → power door
    this.o.flowGas = this.flowGroup(this.buildings.map(b => { const id = b.def.id, c = C[id]; return [[cw(id, -c.w / 2 + 2, 0.3, c.d / 2 - 0.9), cw(id, -c.w / 2 + 0.25, 0.3, c.d / 2 - 0.9), cw(id, -c.w / 2 + 0.25, 0.3, b.sz), V(b.pw.x, 0.3, b.pw.z + 0.4), b.pw, b.elec], id === 'hr' ? SYS.heat : SYS.gas, 'backup:' + id + ':' + b.i]; }), 0.05, 0.1); s.add(this.o.flowGas);
    // fiber backbone → east corridor → service corridor → fiber door → network room
    this.o.flowNet = this.flowGroup(this.buildings.map(b => { const id = b.def.id, c = this.campus[id]; return [[cw(id, c.ex, 0.32, P.fiberW.z - C[id].z), cw(id, c.ex, 0.32, b.sz), V(b.ne.x, 0.32, b.ne.z + 0.4), b.ne, b.netr], SYS.compute, 'net:' + id + ':' + b.i]; }), 0.05, 0.1); s.add(this.o.flowNet);
    // water: BOPU → campus tanks → west corridor → north corridor → inlet → evaporative gallery; return → outlet → east corridor → WWTP
    this.o.flowSupply = this.flowGroup(IDS.map(id => { const c = this.campus[id]; return [[V(P.bopu.x, 0.5, P.bopu.z), V(P.bopu.x, 0.35, c.tankPos.z), c.tankPos], SYS.water, 'water:' + id]; })); s.add(this.o.flowSupply);
    this.o.flowWater = this.flowGroup(this.buildings.map(b => { const id = b.def.id, c = this.campus[id]; return [[c.tankPos, cw(id, c.wx, 0.18, c.tankPos.z - C[id].z), cw(id, c.wx, 0.18, b.nz), V(b.wi.x, 0.18, b.wi.z - 0.4), b.wi, b.gN], SYS.water, 'water:' + id + ':' + b.i]; }).concat(this.buildings.map(b => { const id = b.def.id, c = this.campus[id]; return [[b.gS, b.wo, V(b.wo.x, 0.18, b.wo.z - 0.4), cw(id, c.ex, 0.18, b.nz), cw(id, c.ex, 0.18, C[id].d / 2 + 0.6), V(P.wwtp.x, 0.4, P.wwtp.z + 2)], 0x1E8FAE, 'return:' + id + ':' + b.i]; })), 0.05, 0.1); s.add(this.o.flowWater);
    // evaporation particles (hot days)
    this.o.evap = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshBasicMaterial({ color: SYS.water, transparent: true, opacity: 0.5 }), 56); this.o.evap.userData.seed = Array.from({ length: 56 }, () => Math.random()); s.add(this.o.evap);
    // labels
    const L = (id, pos, text, sub, color, show) => this.labels.push({ id, pos, text, sub, color, show, el: null });
    const lay = this.querySelector('[data-labels]');
    Object.values(C).forEach(c => L(c.id, new THREE.Vector3(c.x, 1.6, c.z), c.label, c.sub, c.id === 'hr' ? '#F6B73C' : null, s => this.campusVisible(c.id, s) && (s.preset === 'city' || s.preset === c.id || s.preset === 'power' || s.section === 'campuses')));
    PARCELS.forEach(p => L('p:' + p.id, new THREE.Vector3(p.x, 0.4, p.z), p.label, p.sub, '#7A8797', s => s.layers.expansion && this.parcelVisible(p.id, s) && (s.section === 'expansion' || s.preset === 'expansion' || s.campusView === 'planned')));
    L('gen', new THREE.Vector3(P.genStation.x, 2.4, P.genStation.z), 'Cheyenne Prairie Generation Station', 'Black Hills Energy · context · not a project asset', '#FF8A22', s => s.section === 'power' || s.preset === 'power' || s.preset === 'hr');
    L('wind', new THREE.Vector3(P.windA.x, 3.6, P.windA.z + 2), 'Happy Jack + Silver Sage Wind', '59 MW renewable energy credits · reported · symbolic', '#30D187', s => s.section === 'environment' || s.section === 'power' || s.preset === 'wind');
    L('wwtp', new THREE.Vector3(P.wwtp.x, 0.8, P.wwtp.z), 'Dry Creek Wastewater Plant', 'cooling water discharged here · context', '#45D8FF', s => s.section === 'cooling' || s.preset === 'hr');
    L('bopu', new THREE.Vector3(P.bopu.x, 1.2, P.bopu.z), 'BOPU Water Supply', 'water purchased from the city utility · symbolic location', '#45D8FF', s => s.section === 'cooling');
    L('fiber', new THREE.Vector3(70, 0.4, P.fiberW.z), 'West Central US · Fiber Backbone', 'symbolic route · not public', '#7765FF', s => s.section === 'compute');
    const inside = s => !s.roof || s.explode > 0.5;
    Object.values(this.campus).forEach(c => {
      const id = c.def.id, b = c.bldgs[0], foc = s => s.preset === id && this.campusVisible(id, s);
      L('sub:' + id, c.subPos.clone().setY(1.2), 'Substation + Transformers', 'symbolic · one per campus', '#FF8A22', s => foc(s) && (s.section === 'power' || s.layers.power && s.section === 'campuses'));
      L('tank:' + id, c.tankPos.clone().setY(0.9), 'Cooling Water Storage', 'BOPU water · symbolic', '#45D8FF', s => foc(s) && (s.section === 'cooling' || s.section === 'campuses'));
      L('gen:' + id, new THREE.Vector3(c.def.x - c.def.w / 2 + 2, 0.9, c.def.z + c.def.d / 2 - 0.9), id === 'hr' ? 'Emergency Diesel Generators' : 'Natural-Gas Generators', id === 'hr' ? '128 permitted 2025 · symbolic count' : (id === 'nr' ? '30 engines permitted 2026 · symbolic count' : 'symbolic count'), id === 'hr' ? '#FF6747' : '#F6B73C', s => (s.section === 'backup' && (s.preset === id || s.preset === 'city')) || (foc(s) && s.section === 'campuses'));
      L('halls:' + id, b.ctr.clone().setY(0.55), 'Data Halls · Rack Rows', 'hot-aisle containment · layout not public', '#7765FF', s => foc(s) && inside(s));
      L('elec:' + id, b.elec.clone().setY(0.6), 'Electrical Room', 'switchgear · UPS · conceptual', '#FF8A22', s => foc(s) && inside(s));
      L('netr:' + id, b.netr.clone().setY(0.6), 'Network Room', 'fiber meet-me · conceptual', '#7765FF', s => foc(s) && inside(s));
      L('ahu:' + id, b.gN.clone().setY(0.5), 'Evaporative Air Handling', 'outside air · water above 85°F · confirmed method', '#45D8FF', s => foc(s) && inside(s));
      L('pw:' + id, b.pw.clone().setY(0.5), 'Power Entry', 'from substation · symbolic door', '#FF8A22', s => foc(s) && !inside(s) && (s.section === 'power' || s.section === 'backup' || s.section === 'campuses'));
      L('ne:' + id, b.ne.clone().setY(0.5), 'Fiber Entry', 'symbolic door', '#7765FF', s => foc(s) && !inside(s) && (s.section === 'compute' || s.section === 'campuses'));
      L('wi:' + id, b.wi.clone().setY(0.5), 'Water Inlet · Outlet', 'supply and return · symbolic', '#45D8FF', s => foc(s) && !inside(s) && s.section === 'cooling');
      L('ent:' + id, b.W(b.bx, 0.5, b.bz + 0.9), 'Main Entrance · Loading Dock', 'conceptual placement', null, s => foc(s) && !inside(s) && s.section === 'campuses');
    });
    this.labels.forEach(l => {
      const el = document.createElement('div');
      el.style.cssText = 'position:absolute;left:0;top:0;display:flex;flex-direction:column;gap:2px;padding:6px 8px;border:1px solid;border-radius:2px;font:500 10px/1.2 "IBM Plex Sans",sans-serif;letter-spacing:.08em;white-space:nowrap;transition:opacity .25s;will-change:transform;backdrop-filter:blur(4px)';
      el.innerHTML = '<span data-t></span><span data-s style="font-weight:400;letter-spacing:.02em;opacity:.75;text-transform:none"></span>';
      el.querySelector('[data-t]').textContent = l.text; el.querySelector('[data-s]').textContent = (l.sub || '').replace(/[A-Za-z][A-Za-z'’]*/g, w => /^[A-Z0-9]+$/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1));
      lay.appendChild(el); l.el = el;
      const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line'); ln.setAttribute('stroke', l.color || T.muted); ln.setAttribute('stroke-width', '1'); ln.setAttribute('opacity', '0'); this.querySelector('[data-leaders]').appendChild(ln); l.line = ln;
    });
    this.pickables = [];
    Object.values(this.campus).forEach(c => { this.pickables.push(c.pad, c.sub, ...c.subG.children, ...c.gens.filter(o => o.userData.id)); c.bldgs.forEach(b => this.pickables.push(b.slab, ...b.walls.children, b.roofG.children[0])); });
    this.pickables.push(...Object.values(this.parcels), gs);
  }
  flowGroup(defs, rad = 0.12, prad = 0.22) {
    const g = new THREE.Group();
    defs.forEach(([pts, color, tag]) => {
      const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.05);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, rad, 6, false), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 }));
      const n = Math.max(4, Math.round(curve.getLength() / (rad < 0.1 ? 1.6 : 3)));
      const pm = new THREE.InstancedMesh(new THREE.SphereGeometry(prad, 8, 8), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 }), n);
      const f = { curve, tube, pm, n, tag, speed: 0.03 + Math.random() * 0.01, active: 1 };
      g.add(tube); g.add(pm); this.flows.push(f);
    });
    return g;
  }
  // milestone gating: which campuses/parcels exist at a given timeline step
  campusVisible(id, s) {
    const m = s.milestone; const con = m !== null && m !== undefined;
    if (s.campusView === 'planned') return false;
    if (s.campusView === 'construction') return id === 'hr';
    if (s.campusView === 'operating' && id === 'hr') return false;
    if (!con) return true;
    return { nr: 0, cbp: 4, bison: 4, hr: 6 }[id] <= m;
  }
  buildingCount(id, s) {
    const m = s.milestone; if (m === null || m === undefined) return C[id].n;
    if (id === 'nr') return m >= 2 ? 5 : (m >= 1 ? 3 : 1);
    return C[id].n;
  }
  parcelVisible(id, s) {
    const m = s.milestone; const con = m !== null && m !== undefined;
    if (s.campusView === 'operating' || s.campusView === 'construction') return false;
    if (!con) return true;
    return { nr920: 5, se3000: 7, bison200: 7, cd385: 8, hj35: 8 }[id] <= m;
  }
  update(partial) { Object.assign(this.state, partial); if (partial.layers) this.state.layers = Object.assign({}, this.state.layers, partial.layers); try { this.applyState(this.state); if (this.renderer) { this._n = (this._n || 0) + 1; if (this._n <= 2 || performance.now() - (this._lastFrame || 0) > 300) { const g = this.goal; this.cam = { th: g.th, ph: g.ph, r: g.r, t: g.t.clone() }; } this.tick(); } } catch (e) { console.error('[msft-stage] applyState failed', e); } }
  applyState(s, instant) {
    if (!this.renderer) return;
    const T = THEMES[s.theme];
    if (this._theme !== s.theme) { this._theme = s.theme; this.applyTheme(T); }
    const pr = PRESETS[s.preset] || PRESETS.city;
    if (this._preset !== s.preset || instant) { this._preset = s.preset; this._lastInput = performance.now(); this.goal.th = pr.th; this.goal.ph = pr.ph; this.goal.r = pr.r; this.goal.t.set(...pr.t); }
    if (instant || REDUCED) { this.cam.th = pr.th; this.cam.ph = pr.ph; this.cam.r = pr.r; this.cam.t.copy(this.goal.t); }
    if (this._restored && instant) { this._restored = false; const c = JSON.parse(this.getAttribute('data-state')).cam; this.goal = { th: c.th, ph: c.ph, r: c.r, t: new THREE.Vector3(...c.t) }; this.cam = { th: c.th, ph: c.ph, r: c.r, t: new THREE.Vector3(...c.t) }; }
    const m = s.milestone, con = m !== null && m !== undefined;
    const power = s.section === 'power', backup = s.section === 'backup', cooling = s.section === 'cooling', compute = s.section === 'compute', env = s.section === 'environment', exp = s.section === 'expansion';
    const hot = s.season === 'hot', peak = s.scenario === 'peak';
    // camera: focus the first building of the selected campus when looking inside
    const inside = !s.roof || s.explode > 0.5;
    if ((this._inside !== inside) && this._inside !== undefined && this.campus[s.preset]) { const b = this.campus[s.preset].bldgs[0]; if (inside) { this.goal.t.copy(b.ctr).setY(0.3); this.goal.r = 17; this.goal.ph = 0.72; } else { this.goal.t.set(...pr.t); this.goal.r = pr.r; this.goal.ph = pr.ph; } this._lastInput = performance.now(); }
    this._inside = inside;
    // campuses
    Object.values(this.campus).forEach(c => {
      const vis = this.campusVisible(c.def.id, s); c.g.visible = vis; if (!vis) return;
      const n = this.buildingCount(c.def.id, s);
      const underCon = c.def.id === 'hr' && (!con || m < 9) && s.campusView !== 'operating';
      c.bldgs.forEach((b, i) => { b.g.visible = i < n; b.walls.children.forEach(w => { w.material = underCon ? this.m.build : this.m.wall; }); b.roofShown = !underCon; b.roofG.visible = !underCon && this.rv.ro > 0.03; b.inner.visible = !underCon || s.explode > 0.5; b.ol.material.opacity = underCon ? 0.9 : 0; });
      c.evaps.forEach((e, i) => { e.visible = i < n; });
      c.padEdge.material.color.set(underCon ? SYS.construction : SYS.compute);
      c.gens.forEach(g => { g.visible = s.layers.backup && (c.def.id !== 'hr' || !con || m >= 6); });
      c.sub.visible = c.subG.visible = c.mast.visible = s.layers.power; c.tanks.visible = s.layers.water;
    });
    this.m.sub.emissiveIntensity = power ? 0.4 : 0.1;
    this.m.gas.emissiveIntensity = backup || peak ? 0.55 : 0.05; this.m.diesel.emissiveIntensity = backup ? 0.45 : 0.0;
    // parcels
    Object.entries(this.parcels).forEach(([id, p]) => { p.visible = s.layers.expansion && this.parcelVisible(id, s); });
    this.m.ghost.opacity = exp || s.campusView === 'planned' ? 0.32 : 0.16; this.m.ghostWire.opacity = exp || s.campusView === 'planned' ? 0.9 : 0.55;
    this.o.future.visible = s.layers.expansion && (exp || s.campusView === 'planned' || (con && m >= 9));
    // context
    this.o.wind.visible = s.layers.power;
    // flows
    const amb = !power && !backup && !cooling && !compute && !env && !exp && !con;
    this.o.flowPower.visible = s.layers.power && (power || amb || env); this.o.flowFeed.visible = this.o.flowPower.visible; this.o.trunk.visible = s.layers.power; this.o.trunk.material.opacity = power ? 0.8 : 0.35;
    this.o.flowWind.visible = s.layers.power && (power || env);
    this.o.flowGas.visible = s.layers.backup && (backup || (power && peak));
    this.o.flowNet.visible = s.layers.network && (compute || amb); this.o.fiber.visible = s.layers.network; this.o.fiber.material.opacity = compute ? 0.85 : 0.3;
    this.o.flowWater.visible = this.o.flowSupply.visible = s.layers.water && cooling && hot;
    this.o.evap.visible = s.layers.water && cooling && hot;
    this.m.evap.opacity = cooling && hot ? 0.12 : 0;
    this.flows.forEach(f => {
      const [kind, id, bi] = f.tag.split(':');
      let a = 1;
      if (id && this.campus[id] && !this.campusVisible(id, s)) a = 0;
      if (bi !== undefined && Number(bi) >= this.buildingCount(id, s)) a = 0;
      if (kind === 'grid') a *= peak ? 0.35 : 1;
      if (kind === 'backup' && power) a *= peak ? 1 : 0;
      const k = amb ? 0.45 : 1;
      f.active = a; f.tube.material.opacity = 0.28 * k * a; f.pm.material.opacity = 0.95 * k * a; f.pm.visible = f.tube.visible = a > 0.05;
    });
    this.renderer.setClearColor(0x000000, 0);
  }
  applyTheme(T) {
    this.o.grid.material.color.set(T.grid);
    this.m.plate.color.set(T.plate); this.m.pad.color.set(T.pad); this.m.shell.color.set(T.shell); this.m.roof.color.set(T.roof); this.m.wall.color.set(T.shell); this.m.slab.color.set(T.slab); this.m.ups.color.set(T.shell); this.m.net.color.set(T.shell); this.m.fan.color.set(T.shell); this.m.tank.color.set(T.shell); this.m.build.color.set(T.shell); this.m.sub.color.set(T.shell); this.m.gas.color.set(T.shell); this.m.diesel.color.set(T.shell); this.m.ghost.color.set(T.ghost); this.m.ghostWire.color.set(T.ghost);
    this.o.plateEdge.material.color.set(T.line);
    this.o.bopu.material.color.set(T.shell); this.o.gen.children[0].material.color.set(T.shell);
    Object.values(this.campus).forEach(c => { c.fence.material.color.set(T.line); c.bldgs.forEach(b => { if (b.def.id !== 'hr') b.walls.children.forEach(w => w.children[0].material.color.set(T.line)); b.roofG.children[0].children[0].material.color.set(T.line); b.roofG.children[1].material.color.set(T.line); }); });
    this.o.wind.traverse(o => { if (o.isMesh) o.material.color.set(T.shell); });
    this.labels.forEach(l => { l.el.style.background = T.label; l.el.style.borderColor = T.border; l.el.style.color = l.color || T.text; l.el.querySelector('[data-s]').style.color = T.muted; l.line.setAttribute('stroke', l.color || T.muted); });
  }
  bind(canvas) {
    let down = null, moved = false, pinch = null;
    const pos = e => ({ x: e.clientX, y: e.clientY });
    const touch = () => { this._lastInput = performance.now(); };
    ['pointerdown', 'wheel', 'keydown', 'touchstart'].forEach(ev => canvas.addEventListener(ev, touch, { passive: true }));
    canvas.addEventListener('pointerdown', e => { down = pos(e); moved = false; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e => { if (!down || pinch) return; const p = pos(e); const dx = p.x - down.x, dy = p.y - down.y; if (Math.abs(dx) + Math.abs(dy) > 3) moved = true; this.goal.th -= dx * 0.006; this.goal.ph = Math.min(1.45, Math.max(0.25, this.goal.ph - dy * 0.005)); down = p; if (REDUCED) { this.cam.th = this.goal.th; this.cam.ph = this.goal.ph; } });
    canvas.addEventListener('pointerup', e => { if (down && !moved) this.pick(e); down = null; });
    canvas.addEventListener('pointercancel', () => { down = null; });
    canvas.addEventListener('wheel', e => { e.preventDefault(); this.zoom(Math.exp(e.deltaY * 0.0012)); }, { passive: false });
    canvas.addEventListener('touchstart', e => { if (e.touches.length === 2) pinch = this.dist(e); }, { passive: true });
    canvas.addEventListener('touchmove', e => { if (e.touches.length === 2 && pinch) { const d = this.dist(e); this.zoom(pinch / d); pinch = d; } }, { passive: true });
    canvas.addEventListener('touchend', () => { pinch = null; });
    canvas.addEventListener('keydown', e => { const k = e.key, step = 0.12; if (k === 'ArrowLeft') this.goal.th += step; else if (k === 'ArrowRight') this.goal.th -= step; else if (k === 'ArrowUp') this.goal.ph = Math.max(0.25, this.goal.ph - 0.08); else if (k === 'ArrowDown') this.goal.ph = Math.min(1.45, this.goal.ph + 0.08); else if (k === '+' || k === '=') this.zoom(0.85); else if (k === '-') this.zoom(1.18); else return; e.preventDefault(); });
  }
  dist(e) { const a = e.touches[0], b = e.touches[1]; return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
  zoom(f) { this.goal.r = Math.min(420, Math.max(4, this.goal.r * f)); if (REDUCED) this.cam.r = this.goal.r; }
  pick(e) {
    const r = this.getBoundingClientRect();
    const v = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    const rc = new THREE.Raycaster(); rc.setFromCamera(v, this.camera);
    const hits = rc.intersectObjects(this.pickables.filter(o => { let p = o; while (p) { if (!p.visible) return false; p = p.parent; } return true; }), false);
    if (hits.length) this.dispatchEvent(new CustomEvent('stage-select', { detail: { id: hits[0].object.userData.id }, bubbles: true }));
  }
  reset() { this._lastInput = performance.now(); const pr = PRESETS[this.state.preset] || PRESETS.city; this.goal.th = pr.th; this.goal.ph = pr.ph; this.goal.r = pr.r; this.goal.t.set(...pr.t); }
  tick() {
    const s = this.state, dt = Math.min(this.clock.getDelta(), 0.05), t = this.clock.elapsedTime;
    if (!REDUCED && performance.now() - (this._lastInput || 0) > 5000) this.goal.th += dt * 0.02;
    const k = REDUCED ? 1 : 1 - Math.pow(0.001, dt);
    this.cam.th += (this.goal.th - this.cam.th) * k; this.cam.ph += (this.goal.ph - this.cam.ph) * k; this.cam.r += (this.goal.r - this.cam.r) * k; this.cam.t.lerp(this.goal.t, k);
    const c = this.cam;
    this.camera.position.set(c.t.x + c.r * Math.sin(c.ph) * Math.sin(c.th), c.t.y + c.r * Math.cos(c.ph), c.t.z + c.r * Math.sin(c.ph) * Math.cos(c.th));
    this.camera.lookAt(c.t);
    const anim = !REDUCED, d = new THREE.Object3D();
    { const rv = this.rv, ex = s.explode || 0, tg = { ry: ex * 1.5, ro: s.roof ? 1 : 0, wy: ex * 0.7, wo: (s.roof && ex < 0.5) ? 1 : 0.28 }, k2 = REDUCED ? 1 : 1 - Math.pow(0.002, dt);
      let moving = false; ['ry', 'ro', 'wy', 'wo'].forEach(p => { const nv = rv[p] + (tg[p] - rv[p]) * k2; if (Math.abs(nv - rv[p]) > 0.0005) moving = true; rv[p] = nv; });
      if (moving || this._rvDirty) { this._rvDirty = moving; this.m.roof.opacity = rv.ro; this.m.wall.opacity = rv.wo; this.buildings.forEach(b => { b.roofG.position.y = 0.94 + rv.ry; b.walls.position.y = rv.wy; b.roofG.visible = !!b.roofShown && rv.ro > 0.03; }); }
    }
    this.flows.forEach(f => { if (!f.pm.visible || !f.pm.parent.visible) return; for (let i = 0; i < f.n; i++) { const u = anim ? (t * f.speed + i / f.n) % 1 : i / f.n; f.curve.getPointAt(u, d.position); d.scale.setScalar(0.7 + 0.3 * Math.sin(u * Math.PI)); d.updateMatrix(); f.pm.setMatrixAt(i, d.matrix); } f.pm.instanceMatrix.needsUpdate = true; });
    if (this.o.evap.visible) {
      const seeds = this.o.evap.userData.seed; const ids = ['nr', 'cbp', 'bison', 'hr'];
      for (let i = 0; i < 56; i++) { const cid = ids[i % 4], cc = C[cid], vis = this.campusVisible(cid, s); const u = anim ? (t * 0.1 + seeds[i]) % 1 : seeds[i]; d.position.set(cc.x + Math.sin(i * 2.3) * cc.w * 0.35, 1.3 + u * 5, cc.z + Math.cos(i * 1.7) * cc.d * 0.3); d.scale.setScalar(vis ? 1.2 - u : 0); d.updateMatrix(); this.o.evap.setMatrixAt(i, d.matrix); }
      this.o.evap.instanceMatrix.needsUpdate = true;
    }
    if (anim && this.o.wind.visible) this.turbines.forEach(tb => { tb.hub.rotation.z += dt * tb.speed; });
    this.renderer.render(this.scene, this.camera);
    this._lastFrame = performance.now();
    if ((this._frame = (this._frame || 0) + 1) % 20 === 0) this.setAttribute('data-state', JSON.stringify({ state: s, cam: { th: c.th, ph: c.ph, r: c.r, t: [c.t.x, c.t.y, c.t.z] } }));
    // labels
    const w = this.clientWidth, h = this.clientHeight, v = new THREE.Vector3();
    const small = w < 1000; if (this._small !== small) { this._small = small; this.labels.forEach(l => { l.el.style.fontSize = small ? '9px' : '10px'; l.el.style.padding = small ? '4px 6px' : '6px 8px'; }); }
    const hud = this.parentElement && this.parentElement.querySelector('[data-hud]');
    const placed = [];
    if (hud) { const r = hud.getBoundingClientRect(), me = this.getBoundingClientRect(); placed.push({ x: r.left - me.left, y: r.top - me.top, w: r.width, h: r.height }); } else placed.push({ x: 0, y: 0, w: Math.min(w, 340), h: 70 });
    const vis = [];
    this.labels.forEach(l => {
      const show = l.show(s); v.copy(l.pos); v.project(this.camera);
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
      if (!box) { const [cx, cy] = cands[0]; box = [Math.max(4, Math.min(w - lw - 4, cx)), Math.max(4, Math.min(h - lh - 4, cy))]; }
      placed.push({ x: box[0], y: box[1], w: lw, h: lh });
      it.l.el.style.opacity = 1; it.l.el.style.transform = `translate(${box[0].toFixed(1)}px, ${box[1].toFixed(1)}px)`;
      const bx = Math.max(box[0], Math.min(box[0] + lw, ax)), by = Math.max(box[1], Math.min(box[1] + lh, ay));
      if (Math.hypot(bx - ax, by - ay) > 6) { it.l.line.setAttribute('x1', bx); it.l.line.setAttribute('y1', by); it.l.line.setAttribute('x2', ax); it.l.line.setAttribute('y2', ay); it.l.line.setAttribute('opacity', '0.7'); } else it.l.line.setAttribute('opacity', '0');
    });
  }
}
customElements.define('msft-stage', MsftStage);
