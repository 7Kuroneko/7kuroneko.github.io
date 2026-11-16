/* Kuroneko · footer game — "NEKO FIGHT"
 * An original pixel fighting game: two ninja cats duel on an open grass field
 * under the moon. The view opens in the night sky and drops to the field.
 * You are KURO (black cat). CPU is SHIRO (white cat). Best of three rounds.
 * Mounts into [data-kn-game]. Keys only while focused (click to play).
 * ← → move · ↑ jump · A punch · S kick · D ninja star · F / ↓ block · Esc pause */
(function () {
  if (window.__knFight) return; window.__knFight = 1;
  const VH = 160, SCALE = 2, GY = 134, FONT = "'VT323',monospace";
  const C = { ink: '#0A0908', moon: '#E8ECCC', bone: '#F2EFE8', mute: '#8E8980', d1: '#1C1A17', d2: '#2E2B27', g0: '#0D100B', g1: '#161B12', g2: '#232A1C', g3: '#3B4630', tip: '#C9CFAE', glow: 'rgba(232,236,204,' };
  const PAL = {
    kuro: { body: '#1E1C19', gi: '#121110', band: C.moon, eye: C.moon, line: C.moon },
    shiro: { body: '#CFCAC0', gi: '#2E2B27', band: '#E8ECCC', eye: C.ink, line: '#0A0908' }
  };
  const rnd = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(11);
  function mount(host) {
    if (host.__kn) return; host.__kn = 1; host.style.position = 'relative';
    const cv = document.createElement('canvas'); cv.tabIndex = 0; cv.setAttribute('aria-label', 'Neko Fight, a small fighting game. Click to play.');
    cv.style.cssText = 'display:block;width:100%;height:' + VH * SCALE + 'px;image-rendering:pixelated;image-rendering:crisp-edges;outline:none';
    host.appendChild(cv); const g = cv.getContext('2d'); let VW = 320;
    const fit = () => { VW = Math.max(240, Math.floor(host.clientWidth / SCALE)); cv.width = VW; cv.height = VH; g.imageSmoothingEnabled = false; if (M) { M.a.x = Math.min(M.a.x, VW - 16); M.b.x = Math.min(M.b.x, VW - 16); } };
    // ---------- world dressing
    const stars = [...Array(140)].map(() => ({ x: rnd() * 1600, y: -160 + rnd() * 250, b: rnd(), s: rnd() < .08 ? 2 : 1 }));
    const clouds = [...Array(9)].map((_, i) => ({ x: rnd() * 1600, y: -140 + i * 18 + rnd() * 10, w: 50 + rnd() * 90, sp: .05 + rnd() * .12 }));
    const flies = [...Array(16)].map(() => ({ x: rnd() * 1600, y: 96 + rnd() * 34, p: rnd() * 6.28, s: .3 + rnd() * .6 }));
    const leaves = [...Array(10)].map(() => ({ x: rnd() * 1600, y: rnd() * 130, v: .2 + rnd() * .4, p: rnd() * 6.28 }));
    const blades = [...Array(800)].map((_, i) => ({ x: i * 2 + (rnd() * 2 | 0), h: 2 + rnd() * 6, f: rnd() < .4, lit: rnd() < .18 }));
    let keys = {}, prev = {}, focused = false, visible = true, M = null, hitstop = 0, shake = 0, camY = -150, panned = false, fx = [], stars2 = [];
    // ---------- fighters
    const mk = (x, face, pal, name) => ({ x, y: 0, vx: 0, vy: 0, face, hp: 100, trail: 100, act: 'idle', t: 0, cd: 0, stun: 0, hit: false, pal, name, wins: 0, aiT: 0, plan: 'wait', blockT: 0 });
    function newMatch(human) { M = { a: mk(VW * .3, 1, PAL.kuro, 'KURO'), b: mk(VW * .7, -1, PAL.shiro, 'SHIRO'), round: 1, phase: panned ? 'round' : 'sky', pt: 0, time: 60 * 60, human, stars: [], winner: null, lvl: 0 }; fx = []; }
    function newRound() { const a = M.a, b = M.b; Object.assign(a, { x: VW * .3, y: 0, vx: 0, vy: 0, face: 1, hp: 100, trail: 100, act: 'idle', t: 0, stun: 0, cd: 0 }); Object.assign(b, { x: VW * .7, y: 0, vx: 0, vy: 0, face: -1, hp: 100, trail: 100, act: 'idle', t: 0, stun: 0, cd: 0 }); M.stars = []; M.time = 60 * 60; M.phase = 'round'; M.pt = 0; }
    fit(); new ResizeObserver(fit).observe(host); newMatch(false);
    new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; })).observe(host);
    cv.addEventListener('focus', () => { focused = true; if (!M.human) { newMatch(true); } else if (M.phase === 'pause') M.phase = M.resume || 'fight'; });
    cv.addEventListener('blur', () => { focused = false; keys = {}; if (M.human && (M.phase === 'fight' || M.phase === 'round')) { M.resume = M.phase; M.phase = 'pause'; } });
    cv.addEventListener('pointerdown', () => cv.focus());
    const K = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'j', ' ': 'j', ArrowDown: 'b', a: 'p', A: 'p', s: 'k', S: 'k', d: 'x', D: 'x', f: 'b', F: 'b' };
    cv.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') { cv.blur(); return; } const k = K[e.key]; if (k) { e.preventDefault(); keys[k] = true; } if ((M.phase === 'end') && (e.key === 'Enter' || e.key === ' ')) newMatch(true); });
    cv.addEventListener('keyup', e => { e.stopPropagation(); const k = K[e.key]; if (k) keys[k] = false; });
    if (matchMedia('(hover:none)').matches) {
      const pad = document.createElement('div'); pad.style.cssText = 'position:absolute;left:0;right:0;bottom:8px;display:flex;justify-content:space-between;padding:0 10px;pointer-events:none';
      const b = (lab, k) => { const n = document.createElement('button'); n.textContent = lab; n.style.cssText = `pointer-events:auto;width:46px;height:46px;border:1px solid ${C.moon};background:rgba(10,9,8,.7);color:${C.moon};font:16px ${FONT};touch-action:none`;
        n.addEventListener('pointerdown', e => { e.preventDefault(); cv.focus(); keys[k] = true; }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => n.addEventListener(ev, () => keys[k] = false)); return n; };
      const row = (...xs) => { const d = document.createElement('div'); d.style.cssText = 'display:flex;gap:6px'; d.append(...xs); return d; };
      pad.append(row(b('◀', 'l'), b('▲', 'j'), b('▶', 'r')), row(b('拳', 'p'), b('蹴', 'k'), b('✦', 'x'), b('守', 'b'))); host.appendChild(pad);
    }
    // ---------- combat
    function hurt(o, f, dmg, kx) {
      const blocking = o.act === 'block' && o.face === -Math.sign(kx || f.face);
      if (blocking) { o.hp -= 1; o.vx = Math.sign(kx || f.face) * 1.6; spark(o.x - o.face * 6, GY - 18 + o.y, 4); return; }
      o.hp = Math.max(0, o.hp - dmg); o.stun = 16; o.act = 'hit'; o.vx = Math.sign(kx || f.face) * 2.4; if (o.y < 0) o.vy = -1.5;
      hitstop = 4; shake = 5; spark(o.x - o.face * 4, GY - 20 + o.y, 9);
      if (o.hp <= 0) { o.act = 'ko'; o.vy = -3.2; o.vx = Math.sign(kx || f.face) * 2.2; M.phase = 'ko'; M.pt = 0; hitstop = 14; shake = 9; }
    }
    function spark(x, y, n) { for (let i = 0; i < n; i++) { const a = rnd() * 6.28, s = .8 + rnd() * 2.2; fx.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - .4, t: 0, life: 14 + rnd() * 10 }); } }
    function aiInput(f, o) {
      const d = Math.abs(o.x - f.x), dir = Math.sign(o.x - f.x) || 1, inp = {}, lvl = M.lvl;
      if ((o.act === 'punch' || o.act === 'kick') && d < 36 && f.blockT <= 0 && rnd() < .06 + lvl * .03) f.blockT = 14 + (rnd() * 10 | 0);
      if (M.stars.some(s => s.o !== f && Math.abs(s.x - f.x) < 50 && Math.sign(s.vx) === -dir) && rnd() < .08) { if (rnd() < .5) f.blockT = 16; else inp.j = 1; }
      if (f.blockT > 0) { f.blockT--; inp.b = 1; return inp; }
      if (--f.aiT <= 0) { f.aiT = 16 + rnd() * 26 - lvl * 4; const r = rnd(); f.plan = d > 80 ? (r < .3 && f.cd <= 0 ? 'throw' : 'go') : d > 28 ? (r < .18 ? 'jump' : r < .3 && f.cd <= 0 ? 'throw' : 'go') : (r < .45 ? 'punch' : r < .75 ? 'kick' : r < .88 ? 'back' : 'jump'); }
      switch (f.plan) {
        case 'go': inp[dir > 0 ? 'r' : 'l'] = 1; if (d < 24) f.plan = rnd() < .6 ? 'punch' : 'kick'; break;
        case 'back': inp[dir > 0 ? 'l' : 'r'] = 1; break;
        case 'jump': inp.j = 1; inp[dir > 0 ? 'r' : 'l'] = 1; f.plan = rnd() < .5 ? 'kick' : 'go'; break;
        case 'punch': inp.p = 1; f.plan = 'wait'; break; case 'kick': inp.k = 1; f.plan = 'wait'; break; case 'throw': inp.x = 1; f.plan = 'wait'; break;
      } return inp;
    }
    function upd(f, o, inp, ed) {
      if (f.act === 'ko') { f.vy += .25; f.y = Math.min(0, f.y + f.vy); if (f.y === 0) f.vy = 0; f.x += f.vx; f.vx *= .9; f.x = Math.max(12, Math.min(VW - 12, f.x)); return; }
      f.trail += (f.hp - f.trail) * .04; if (f.cd > 0) f.cd--;
      const ground = f.y >= 0;
      if (f.stun > 0) { f.stun--; f.x += f.vx; f.vx *= .82; f.vy += .25; f.y = Math.min(0, f.y + f.vy); if (!f.stun) f.act = 'idle'; f.x = Math.max(12, Math.min(VW - 12, f.x)); return; }
      const atk = f.act === 'punch' || f.act === 'kick' || f.act === 'throw';
      if (atk) {
        f.t++; const P = f.act === 'punch' ? [4, 8, 16, 20, 5] : f.act === 'kick' ? [7, 12, 24, 27, 8] : [6, 6, 20, 0, 0];
        if (f.act === 'throw' && f.t === 6) { M.stars.push({ x: f.x + f.face * 10, y: GY - 20 + f.y, vx: f.face * 3, o: f, t: 0 }); f.cd = 80; }
        if (f.act !== 'throw' && f.t >= P[0] && f.t <= P[1] && !f.hit) { const dx = (o.x - f.x) * f.face; if (dx > 0 && dx < P[3] && Math.abs(o.y - f.y) < 18 && o.act !== 'ko') { f.hit = true; hurt(o, f, P[4]); } }
        if (f.t >= P[2]) f.act = 'idle';
        if (!ground) { f.vy += .25; f.y = Math.min(0, f.y + f.vy); f.x += f.vx; if (f.y === 0) f.vy = 0; } else f.vx *= .7;
      } else {
        if (ground) f.face = o.x > f.x ? 1 : -1;
        if (inp.b && ground) { f.act = 'block'; f.vx = 0; }
        else {
          const mv = (inp.r ? 1 : 0) - (inp.l ? 1 : 0);
          if (ground) f.vx = mv * 1.7; else f.vx += mv * .08;
          if (ed.j && ground) { f.vy = -4.9; f.vx = mv * 2; }
          if (ed.p) { f.act = 'punch'; f.t = 0; f.hit = false; } else if (ed.k) { f.act = 'kick'; f.t = 0; f.hit = false; } else if (ed.x && f.cd <= 0) { f.act = 'throw'; f.t = 0; }
          else f.act = f.y < 0 ? 'jump' : mv ? 'walk' : 'idle';
        }
        f.vy += .25; f.y = Math.min(0, f.y + f.vy); if (f.y === 0) f.vy = 0; f.x += f.vx;
      }
      f.x = Math.max(12, Math.min(VW - 12, f.x));
      const gap = o.x - f.x; if (Math.abs(gap) < 12 && Math.abs(o.y - f.y) < 16 && o.act !== 'ko') { const push = (12 - Math.abs(gap)) / 2 * Math.sign(gap || 1); f.x -= push; o.x += push; }
    }
    function edge(inp, mem) { const e = {}; ['j', 'p', 'k', 'x'].forEach(k => { e[k] = inp[k] && !mem[k]; mem[k] = inp[k]; }); return e; }
    const memA = {}, memB = {};
    let T = 0;
    function step() {
      T++;
      flies.forEach(f => { f.p += .03; }); leaves.forEach(l => { l.x += l.v + .2; l.y += .15 + Math.sin(T * .03 + l.p) * .15; if (l.y > GY) { l.y = -10; l.x = rnd() * VW; } });
      fx = fx.filter(p => { p.x += p.vx; p.y += p.vy; p.vy += .12; p.vx *= .95; return ++p.t < p.life; });
      if (shake > 0) shake *= .8; if (shake < .3) shake = 0;
      if (M.phase === 'sky') { M.pt++; camY = -150 + 150 * (1 - Math.pow(1 - Math.min(1, M.pt / 170), 3)); if (M.pt > 180) { panned = true; camY = 0; M.phase = 'round'; M.pt = 0; } return; }
      if (M.phase === 'pause') return;
      if (hitstop > 0) { hitstop--; return; }
      M.pt++;
      const a = M.a, b = M.b;
      const ia = M.human ? { l: keys.l, r: keys.r, j: keys.j, b: keys.b, p: keys.p, k: keys.k, x: keys.x } : aiInput(a, b), ib = aiInput(b, a);
      const live = M.phase === 'fight';
      upd(a, b, live ? ia : {}, live ? edge(ia, memA) : {}); upd(b, a, live ? ib : {}, live ? edge(ib, memB) : {});
      M.stars = M.stars.filter(s => { s.x += s.vx; s.t++; const o = s.o === a ? b : a; if (o.act !== 'ko' && Math.abs(o.x - s.x) < 7 && Math.abs((GY - 18 + o.y) - s.y) < 12) { hurt(o, s.o, 6, s.vx); return false; } return s.x > -10 && s.x < VW + 10; });
      if (M.phase === 'round' && M.pt > 110) { M.phase = 'fight'; M.pt = 0; }
      if (M.phase === 'fight') { if (--M.time <= 0) { M.phase = 'ko'; M.pt = 0; M.timeout = true; } }
      if (M.phase === 'ko' && M.pt > 130) {
        const w = M.timeout ? (a.hp >= b.hp ? a : b) : (a.act === 'ko' ? b : a); w.wins++; M.timeout = false;
        if (w.wins >= 2) { M.phase = 'end'; M.pt = 0; M.winner = w; } else { M.round++; M.lvl = Math.min(3, M.lvl + 1); newRound(); }
      }
      if (M.phase === 'end' && M.pt > (M.human ? 420 : 240)) { newMatch(M.human && focused); if (!focused) M.human = false; }
    }
    // ---------- drawing
    function cat(f, ox, oy) {
      const P = f.pal, F = f.face, rs = [], R = (x, y, w, h, c) => rs.push([x, y, w, h, c]);
      const bob = f.act === 'idle' ? Math.round(Math.sin(T * .12 + (F > 0 ? 0 : 2)) * .6) : 0, s = Math.sin(T * .3);
      if (f.act === 'ko') {
        R(-14, -7, 10, 7, P.body); R(-15, -9, 2, 2, P.body); R(-9, -9, 2, 2, P.body); R(-14, -5, 10, 1, P.band); R(-4, -6, 12, 6, P.gi); R(-4, -3, 12, 1, P.band); R(8, -4, 9, 3, P.gi); R(17, -3, 6, 1, P.body); R(-10, -4, 2, 1, P.eye);
      } else {
        const air = f.y < 0, hitL = f.act === 'hit' ? -2 : 0, ph = f.t;
        // legs
        if (f.act === 'kick' && ph >= 5) { R(-5, -8, 3, 8, P.gi); R(2 + hitL, -13, 12, 3, P.gi); R(14, -14, 3, 4, P.body); }
        else if (air) { R(-5, -11, 3, 5, P.gi); R(2, -12, 3, 5, P.gi); }
        else if (f.act === 'walk') { R(-5 + Math.round(2 * s), -8, 3, 8, P.gi); R(2 - Math.round(2 * s), -8, 3, 8, P.gi); }
        else { R(-5, -8, 3, 8, P.gi); R(2, -8, 3, 8, P.gi); }
        const by = (air ? -3 : 0) + bob;
        // tail
        for (let i = 0; i < 7; i++) R(Math.round(-7 - i * .9) + hitL, Math.round(-12 + by - i * 1.1 + Math.sin(T * .1 + i * .6) * 1.3), 2, 2, P.body);
        // torso + belt
        R(-6 + hitL, -19 + by, 12, 11, P.gi); R(-6 + hitL, -12 + by, 12, 1, P.band); R(-1 + hitL, -12 + by, 2, 3, P.band);
        // back arm
        R(-8 + hitL, -18 + by, 2, 5, P.gi);
        // head
        const hx = -6 + hitL * 1.5, hy = -29 + by;
        R(hx, hy, 12, 10, P.body); R(hx, hy - 2, 3, 2, P.body); R(hx, hy - 3, 1, 1, P.body); R(hx + 9, hy - 2, 3, 2, P.body); R(hx + 11, hy - 3, 1, 1, P.body);
        R(hx, hy + 2, 12, 1, P.band); R(hx + 7, hy + 4, 2, 1, P.eye); R(hx + 10, hy + 4, 2, 1, P.eye); R(hx + 4, hy + 6, 8, 4, P.gi);
        for (let i = 0; i < 6; i++) { const w = Math.sin(T * .25 + i * .9); R(hx - 1 - i, hy + 2 + Math.round(w + i * .35), 1, 1, P.band); R(hx - 1 - i, hy + 3 + Math.round(Math.sin(T * .22 + i * .9 + 1) + i * .5), 1, 1, P.band); }
        // front arm by action
        if (f.act === 'punch') { if (ph >= 3 && ph <= 10) { R(5 + hitL, -18 + by, 11, 3, P.gi); R(15, -19 + by, 3, 4, P.body); } else { R(0, -18 + by, 4, 3, P.gi); } }
        else if (f.act === 'block') { R(5, -27 + by, 3, 10, P.gi); R(7, -25 + by, 3, 8, P.gi); R(5, -28 + by, 3, 2, P.body); }
        else if (f.act === 'throw') { if (ph < 6) R(-2, -24 + by, 4, 3, P.gi); else { R(5, -22 + by, 9, 3, P.gi); R(13, -23 + by, 2, 3, P.body); } }
        else if (f.act === 'hit') { R(-4, -24 + by, 3, 5, P.gi); }
        else { R(4 + hitL, -18 + by, 3, 5, P.gi); R(4 + hitL, -13 + by, 3, 2, P.body); }
      }
      const X = (x, w) => F > 0 ? ox + x : ox - x - w;
      g.fillStyle = P.line; rs.forEach(([x, y, w, h]) => g.fillRect(X(x, w) - 1, oy + y - 1, w + 2, h + 2));
      rs.forEach(([x, y, w, h, c]) => { g.fillStyle = c; g.fillRect(X(x, w), oy + y, w, h); });
    }
    function moonDisc(cx, cy, r) {
      for (let k = 3; k >= 1; k--) { g.fillStyle = C.glow + (.035 * k) + ')'; circ(cx, cy, r + k * 7); }
      g.fillStyle = C.moon; circ(cx, cy, r); g.fillStyle = '#D3D6BC'; circ(cx - r * .3, cy - r * .2, r * .22); circ(cx + r * .35, cy + r * .3, r * .16); circ(cx + r * .1, cy - r * .5, r * .1);
    }
    function circ(cx, cy, r) { for (let y = -r; y <= r; y++) { const w = Math.round(Math.sqrt(r * r - y * y)); g.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2, 1); } }
    function bar(x, y, w, f, right) { g.fillStyle = C.d2; g.fillRect(x - 1, y - 1, w + 2, 6); g.fillStyle = C.ink; g.fillRect(x, y, w, 4); const tw = Math.round(w * f.trail / 100), hw = Math.round(w * f.hp / 100);
      g.fillStyle = C.mute; g.fillRect(right ? x + w - tw : x, y, tw, 4); g.fillStyle = f.hp < 25 && (T >> 3) & 1 ? C.bone : C.moon; g.fillRect(right ? x + w - hw : x, y, hw, 4); }
    const text = (t, x, y, sz, col, al) => { g.font = sz + 'px ' + FONT; g.fillStyle = col; const w = g.measureText(t).width; g.fillText(t, Math.round(al === 'c' ? x - w / 2 : al === 'r' ? x - w : x), y); };
    function draw() {
      const sx = shake ? Math.round((rnd() - .5) * shake) : 0, sy = shake ? Math.round((rnd() - .5) * shake) : 0;
      g.setTransform(1, 0, 0, 1, sx, sy - Math.round(camY));
      g.fillStyle = C.ink; g.fillRect(-10, camY - 10, VW + 20, VH + 20);
      // sky bands
      [['#0B0B0D', -170], ['#0D0E10', -60], ['#0F1012', 30], ['#121411', 90]].forEach(([c, y]) => { g.fillStyle = c; g.fillRect(-10, y, VW + 20, 200); });
      stars.forEach(s => { const x = s.x % (VW + 40); g.fillStyle = C.glow + (.2 + .7 * s.b * (.6 + .4 * Math.sin(T * .04 + s.x))) + ')'; g.fillRect(x, s.y, s.s, s.s); });
      moonDisc(VW * .74, 22, 17);
      clouds.forEach(c => { const x = ((c.x + T * c.sp) % (VW + 200)) - 100; g.fillStyle = 'rgba(232,236,204,.05)'; g.fillRect(x, c.y, c.w, 2); g.fillRect(x + 10, c.y - 1, c.w * .6, 1); g.fillRect(x + 20, c.y + 2, c.w * .5, 1); });
      // distant hills
      g.fillStyle = '#131611'; for (let x = 0; x < VW; x++) { const h = 16 + Math.sin(x * .021 + 1) * 8 + Math.sin(x * .053) * 4; g.fillRect(x, GY - h, 1, h); }
      g.fillStyle = '#171B14'; for (let x = 0; x < VW; x++) { const h = 7 + Math.sin(x * .04 + 3) * 4 + Math.sin(x * .11) * 1.5; g.fillRect(x, GY - h, 1, h); }
      // field
      g.fillStyle = C.g1; g.fillRect(0, GY, VW, VH - GY + 10); g.fillStyle = C.g2; g.fillRect(0, GY, VW, 1); g.fillStyle = C.g0; g.fillRect(0, GY + 12, VW, 20);
      blades.forEach(b => { if (b.x > VW || !b.f) return; const sw = Math.round(Math.sin(T * .035 + b.x * .07) * 1.5); g.fillStyle = b.lit ? C.tip : C.g3; g.fillRect(b.x + sw, GY - b.h + 1, 1, b.h * .4); g.fillStyle = C.g3; g.fillRect(b.x, GY - b.h * .6 + 1, 1, b.h * .6); });
      // shadows
      [M.a, M.b].forEach(f => { const w = Math.max(6, 14 + f.y * .2); g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(Math.round(f.x - w / 2), GY - 1, Math.round(w), 2); });
      cat(M.b, Math.round(M.b.x), Math.round(GY + M.b.y)); cat(M.a, Math.round(M.a.x), Math.round(GY + M.a.y));
      M.stars.forEach(s => { const x = Math.round(s.x), y = Math.round(s.y), r = (s.t >> 2) & 1; g.fillStyle = C.moon; g.fillRect(x - 1, y - 1, 3, 3); if (r) { g.fillRect(x - 3, y, 2, 1); g.fillRect(x + 2, y, 2, 1); g.fillRect(x, y - 3, 1, 2); g.fillRect(x, y + 2, 1, 2); } else { g.fillRect(x - 2, y - 2, 1, 1); g.fillRect(x + 2, y - 2, 1, 1); g.fillRect(x - 2, y + 2, 1, 1); g.fillRect(x + 2, y + 2, 1, 1); } });
      // foreground grass
      blades.forEach(b => { if (b.x > VW || b.f) return; const sw = Math.round(Math.sin(T * .04 + b.x * .09) * 2); g.fillStyle = b.lit ? C.tip : C.g2; g.fillRect(b.x + sw, VH - b.h - 2, 1, b.h * .5); g.fillStyle = C.g2; g.fillRect(b.x, VH - b.h * .5 - 2, 1, b.h * .5 + 2); });
      flies.forEach(f => { const x = (f.x % VW) + Math.sin(f.p) * 8, y = f.y + Math.cos(f.p * .7) * 5, a = .4 + .6 * Math.max(0, Math.sin(f.p * 2.3)); g.fillStyle = C.glow + a * .25 + ')'; g.fillRect(x - 1, y - 1, 3, 3); g.fillStyle = C.glow + a + ')'; g.fillRect(x, y, 1, 1); });
      leaves.forEach(l => { g.fillStyle = 'rgba(232,236,204,.5)'; g.fillRect(Math.round(l.x % VW), Math.round(l.y), 2, 1); });
      fx.forEach(p => { g.fillStyle = C.glow + (1 - p.t / p.life) + ')'; g.fillRect(Math.round(p.x), Math.round(p.y), p.t < 4 ? 2 : 1, p.t < 4 ? 2 : 1); });
      g.setTransform(1, 0, 0, 1, 0, 0);
      if (M.phase === 'sky') { text('NEKO FIGHT', VW / 2, 60 - camY * .0, 22, C.glow + Math.min(1, M.pt / 40) + ')', 'c'); return; }
      // HUD
      g.textBaseline = 'top'; const bw = Math.min(140, Math.floor(VW / 2 - 30));
      bar(8, 8, bw, M.a, false); bar(VW - 8 - bw, 8, bw, M.b, true);
      text(M.a.name, 8, 15, 10, C.bone); text(M.b.name, VW - 8, 15, 10, C.bone, 'r');
      for (let i = 0; i < 2; i++) { g.fillStyle = M.a.wins > i ? C.moon : C.d2; g.fillRect(8 + bw - 6 - i * 7, 16, 4, 4); g.fillStyle = M.b.wins > i ? C.moon : C.d2; g.fillRect(VW - 8 - bw + 2 + i * 7, 16, 4, 4); }
      text(String(Math.ceil(M.time / 60)).padStart(2, '0'), VW / 2, 4, 16, C.moon, 'c');
      if (!M.human) { g.fillStyle = 'rgba(10,9,8,.55)'; g.fillRect(0, 54, VW, 64); text('NEKO FIGHT', VW / 2, 58, 22, C.moon, 'c'); text('CLICK TO PLAY · YOU ARE KURO', VW / 2, 80, 11, (T >> 5) & 1 ? C.bone : C.mute, 'c'); text('← → MOVE · ↑ JUMP · ↓ BLOCK', VW / 2, 92, 11, C.bone, 'c'); text('A PUNCH · S KICK · D NINJA STAR · F BLOCK', VW / 2, 104, 11, C.bone, 'c'); }
      if (M.phase === 'round' && M.human) { text(M.pt < 60 ? 'ROUND ' + M.round : '始め · FIGHT', VW / 2, 62, M.pt < 60 ? 22 : 26, C.moon, 'c'); }
      if (M.phase === 'ko' && M.pt < 110 && M.human) text(M.timeout ? 'TIME' : 'K.O.', VW / 2, 60, 30, C.moon, 'c');
      if (M.phase === 'end' && M.human) { const won = M.winner === M.a; text(won ? 'YOU WIN' : 'DEFEATED', VW / 2, 54, 26, C.moon, 'c'); text(won ? '勝利 · KURO TAKES THE FIELD' : 'SHIRO HOLDS THE FIELD', VW / 2, 82, 11, C.bone, 'c'); text('PRESS SPACE TO FIGHT AGAIN', VW / 2, 96, 10, (T >> 5) & 1 ? C.bone : C.mute, 'c'); }
      if (M.phase === 'pause') { g.fillStyle = 'rgba(10,9,8,.7)'; g.fillRect(0, 0, VW, VH); text('PAUSED', VW / 2, 60, 24, C.moon, 'c'); text('CLICK TO RESUME', VW / 2, 86, 11, C.bone, 'c'); }
    }
    let last = performance.now(), acc = 0;
    (function frame(now) { requestAnimationFrame(frame); if (!visible && !focused) { last = now; return; } acc += Math.min(100, now - last); last = now; while (acc >= 1000 / 60) { step(); acc -= 1000 / 60; } draw(); })(last);
  }
  const scan = () => document.querySelectorAll('[data-kn-game]').forEach(mount);
  scan(); new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
