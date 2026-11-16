/* Portals · shared loading screen. PortalLoader.mount({title, accent, glow, minMs}) */
(function (g) {
  function mount(o) {
    if (!document.getElementById('pl-iserif')) { const l2 = document.createElement('link'); l2.id = 'pl-iserif'; l2.rel = 'stylesheet'; l2.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap'; document.head.appendChild(l2); }
    if (!document.getElementById('pl-satoshi')) { const l = document.createElement('link'); l.id = 'pl-satoshi'; l.rel = 'stylesheet'; l.href = 'https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500&display=swap'; document.head.appendChild(l); }
    const A = o.accent, G = o.glow || A, title = o.title, MIN = o.minMs || 2800, mode = o.mode || 'arc';
    const css = `
#pl-load{position:fixed;inset:0;z-index:200;background:#0A0A0A;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;transition:opacity .9s ease;font-family:'JetBrains Mono',ui-monospace,monospace;overflow:hidden}
#pl-load.out{opacity:0;pointer-events:none}
#pl-load .pl-ring{position:relative;width:64px;height:96px;z-index:1}
#pl-load .pl-ring i{position:absolute;inset:0;border:1.5px solid ${A};border-radius:50%;opacity:0;animation:plpulse 2.4s ease-out infinite}
#pl-load .pl-ring i:nth-child(2){animation-delay:.8s}#pl-load .pl-ring i:nth-child(3){animation-delay:1.6s}
#pl-load .pl-core{position:absolute;inset:30% 32%;border-radius:50%;background:${A};box-shadow:0 0 30px 8px ${G}}
@keyframes plpulse{0%{transform:scale(.4);opacity:0}30%{opacity:.9}100%{transform:scale(1.6);opacity:0}}
#pl-load .pl-eb{display:flex;align-items:center;gap:12px;font-size:11px;letter-spacing:.34em;text-transform:uppercase;color:#C9C9C8;z-index:1}
#pl-load .pl-eb b{width:5px;height:5px;background:${A}}
#pl-load .pl-t{font-family:${o.titleFont || "'Instrument Serif',Georgia,serif"};font-weight:${o.titleWeight || 400};font-size:clamp(32px,4vw,56px);color:#FAFAFA;letter-spacing:-.01em;margin:-8px 0 0;z-index:1}
#pl-load .pl-bar{width:min(240px,60vw);height:1px;background:#242424;overflow:hidden;z-index:1}
#pl-load .pl-bar span{display:block;height:100%;width:0;background:${A};transition:width .3s linear}
#pl-load .pl-pc{font-size:10px;letter-spacing:.3em;color:#6B6B70;margin-top:-14px;z-index:1}
#pl-load .pl-hz{position:absolute;left:50%;top:100%;width:max(220vw,220vh);height:max(220vw,220vh);border-radius:50%;transform:translateX(-50%);background:radial-gradient(circle at 50% 50%,${G} 0%,rgba(0,0,0,0) 62%);opacity:0;z-index:0;animation:plrise 2.6s cubic-bezier(.2,.6,.2,1) .2s forwards}
#pl-load .pl-hz::before{content:'';position:absolute;inset:0;border-radius:50%;background:#0A0A0A;box-shadow:0 0 2px 1px ${A},0 0 24px 4px ${G},0 0 90px 30px ${G},inset 0 0 120px 40px rgba(0,0,0,.9)}
#pl-load .pl-hz::after{content:'';position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 50% 0%,${G} 0%,rgba(0,0,0,0) 28%);opacity:.55;mix-blend-mode:screen}
@keyframes plrise{to{opacity:1;top:82%}}
#pl-load .pl-mi{position:absolute;left:0;right:0;bottom:0;height:44%;z-index:0;opacity:0;transform:translateY(14%);animation:plmi 3s cubic-bezier(.2,.6,.2,1) .2s forwards;-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 45%,#000 100%);mask-image:linear-gradient(to bottom,transparent 0,#000 45%,#000 100%)}
#pl-load .pl-mi canvas{position:absolute;left:50%;bottom:0;width:120%;transform:translateX(-50%) translateY(${o.offset == null ? 30 : o.offset}%);display:block}
#pl-load .pl-mi::after{content:'';position:absolute;inset:0;background:linear-gradient(to right,#0A0A0A,transparent 22%,transparent 78%,#0A0A0A)}
#pl-load .pl-st{position:absolute;inset:0;z-index:0;opacity:0;animation:plst 2.4s ease .3s forwards}
#pl-load .pl-rain{position:absolute;inset:0;z-index:0;opacity:0;animation:plst 2s ease .2s forwards;-webkit-mask-image:radial-gradient(ellipse 60% 45% at 50% 50%,rgba(0,0,0,.12) 0,rgba(0,0,0,.25) 30%,#000 65%);mask-image:radial-gradient(ellipse 60% 45% at 50% 50%,rgba(0,0,0,.12) 0,rgba(0,0,0,.25) 30%,#000 65%)}
#pl-load .pl-t.decode{font-family:'JetBrains Mono',monospace;letter-spacing:.02em}
#pl-load .pl-t{letter-spacing:0}
#pl-load .pl-portal{position:absolute;inset:0;z-index:0;opacity:0;animation:plst 1.6s ease .1s forwards}
#pl-load.portal .pl-ring{display:none}
#pl-load .pl-vx{position:absolute;inset:0;z-index:0;opacity:0;animation:plst 2s ease .1s forwards}
#pl-load .pl-gl{position:absolute;inset:0;z-index:0;opacity:0;animation:plst 2.2s ease .1s forwards}
#pl-load.glory .pl-ring{display:none}
#pl-load .pl-cv{position:absolute;inset:0;z-index:0;opacity:0;animation:plst 2s ease .1s forwards;-webkit-mask-image:radial-gradient(ellipse 60% 50% at 50% 50%,rgba(0,0,0,.25) 0,rgba(0,0,0,.45) 30%,#000 75%);mask-image:radial-gradient(ellipse 60% 50% at 50% 50%,rgba(0,0,0,.25) 0,rgba(0,0,0,.45) 30%,#000 75%)}
#pl-load.deepfield .pl-ring,#pl-load.saturn .pl-ring,#pl-load.nova .pl-ring{display:none}
#pl-load.entangle{background:#06080f}
#pl-load.vortex .pl-ring{display:none}#pl-load.vortex .pl-t,#pl-load.vortex .pl-eb,#pl-load.vortex .pl-bar,#pl-load.vortex .pl-pc{position:relative}
#pl-load .pl-cu{position:relative;z-index:1;width:96px;height:120px;image-rendering:pixelated;image-rendering:crisp-edges;opacity:0;animation:plst 1.2s ease .1s forwards}
#pl-load.cursed .pl-ring{display:none}
#pl-load .pl-pp{position:relative;z-index:1;width:132px;height:132px;image-rendering:pixelated;image-rendering:crisp-edges;opacity:0;animation:plst 1.2s ease .1s forwards}
#pl-load.pplanet .pl-ring{display:none}
#pl-load.pmoon .pl-ring{display:none}
#pl-load.pspiral .pl-ring{display:none}
#pl-load.puni .pl-ring{display:none}#pl-load.puni .pl-pp{width:min(400px,74vw);height:min(400px,74vw);background:transparent}
#pl-load.pgalaxy .pl-ring{display:none}#pl-load.pgalaxy .pl-pp{width:min(300px,62vw);height:min(300px,62vw);filter:drop-shadow(0 0 22px rgba(160,190,255,.35))}
#pl-load.psun .pl-ring{display:none}#pl-load.psun .pl-pp{width:192px;height:192px;filter:drop-shadow(0 0 26px rgba(255,255,255,.45))}#pl-load.pmark .pl-ring{display:none}#pl-load.pmark .pl-pp{width:144px;height:144px;filter:drop-shadow(0 0 16px rgba(232,236,204,.35))}
#pl-load.pportal .pl-ring{display:none}#pl-load.pportal .pl-pp{width:168px;height:168px;filter:drop-shadow(0 0 18px rgba(196,120,255,.35))}
#pl-load.pghost .pl-ring{display:none}#pl-load.pghost .pl-pp{width:192px;height:192px;filter:drop-shadow(0 0 16px rgba(125,245,236,.28))}
#pl-load.pcell .pl-ring{display:none}#pl-load.pdm .pl-ring{display:none}#pl-load.pmana .pl-ring{display:none}#pl-load.pmana .pl-pp{width:216px;height:216px;filter:drop-shadow(0 0 18px rgba(255,170,60,.35))}#pl-load.pdm .pl-pp{width:216px;height:216px;filter:drop-shadow(0 0 22px rgba(106,61,255,.28))}#pl-load.pcell .pl-pp{width:192px;height:192px;filter:drop-shadow(0 0 16px rgba(255,138,216,.22))}
@keyframes plst{to{opacity:1}}
@keyframes plmi{to{opacity:1;transform:none}}`;
    const el = document.createElement('div'); el.id = 'pl-load';
    el.innerHTML = `<style>${css}</style>${(mode === 'mirror' || mode === 'cursed') ? '<div class="pl-mi"><canvas width="960" height="540"></canvas></div>' : mode === 'dawn' ? '<canvas class="pl-st"></canvas><div class="pl-hz"></div>' : mode === 'rain' ? '<canvas class="pl-rain"></canvas>' : mode === 'portal' ? '<canvas class="pl-portal"></canvas>' : mode === 'vortex' ? '<canvas class="pl-vx"></canvas>' : mode === 'glory' ? '<canvas class="pl-gl"></canvas>' : (mode === 'entangle' || mode === 'deepfield' || mode === 'saturn' || mode === 'nova' || mode === 'genesis' || mode === 'halo') ? '<canvas class="pl-cv"></canvas>' : mode === 'none' ? '' : '<div class="pl-hz"></div>'}<div class="pl-ring"><i></i><i></i><i></i><div class="pl-core"></div></div>${mode === 'cursed' ? '<canvas class="pl-cu" width="32" height="40"></canvas>' : ''}${(o.pixel === 'planet' || o.pixel === 'moon' || o.pixel === 'spiral' || o.pixel === 'galaxy' || o.pixel === 'universe' || o.pixel === 'portal' || o.pixel === 'cell' || o.pixel === 'darkmatter' || o.pixel === 'mana' || o.pixel === 'mark' || o.pixel === 'ghost' || o.pixel === 'sun') ? '<canvas class="pl-pp" width="44" height="44"></canvas>' : ''}<div class="pl-eb"><b></b>${o.eyebrow || 'Portals · FocusField'}</div><div class="pl-t">${title}</div><div class="pl-bar"><span id="pl-fill"></span></div><div class="pl-pc" id="pl-pc">ENTERING THE PORTAL · 0%</div>`;
    document.body.prepend(el);
    // mirror the video's own render canvas (the real planet / the real Divine Energy) into the horizon
    let alive = true;
    if (mode === 'saturn') { // Saturn: banded golden globe and the real ring structure (C · B · Cassini · A), tilted, slowly turning
      el.classList.add('saturn'); const sc = el.querySelector('.pl-cv'), sx = sc.getContext('2d'); let w = 0, h = 0; const size = () => { w = sc.width = innerWidth; h = sc.height = innerHeight; }; size(); addEventListener('resize', size); const t0s = performance.now(); const TAU = 6.283185;
      let sd = 21; const rng = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; };
      const BANDS = [[0,'#8c8a80'],[.12,'#c2b08c'],[.23,'#d6c29a'],[.33,'#e2cfa4'],[.43,'#ecdcb4'],[.5,'#f7ecce'],[.565,'#e2c998'],[.66,'#e6d2a6'],[.74,'#d6c198'],[.85,'#9ea4a0'],[1,'#708aa6']];
      const band = v => { let k = 0; while (k < BANDS.length - 2 && BANDS[k + 1][0] < v) k++; return v - BANDS[k][0] < BANDS[k + 1][0] - v ? BANDS[k][1] : BANDS[k + 1][1]; };
      const globe = Array.from({ length: 2600 }, () => { const u = rng() * 2 - 1, a = rng() * TAU, sp = Math.sqrt(1 - u * u); return { p: [sp * Math.cos(a), u * .9, sp * Math.sin(a)], c: band(u * .5 + .5 + (rng() - .5) * .02), j: .8 + rng() * .3 }; });
      const prof = R => R < 1.236 ? 0 : R < 1.527 ? .18 : R < 1.95 ? .9 : R < 2.025 ? .04 : R < 2.27 ? .5 : 0;
      const rings = []; while (rings.length < 4200) { const R = 1.2 + rng() * 1.1; if (rng() < prof(R)) rings.push({ R, a: rng() * TAU, c: R < 1.527 ? '#a8927a' : R < 1.95 ? (R > 1.7 ? '#f0e2c4' : '#e2cca4') : '#d6c8ac', j: .7 + rng() * .4 }); }
      const stars = Array.from({ length: 320 }, () => ({ x: rng(), y: rng(), c: ['#7cc1ff', '#eef4ff', '#ffc04d', '#ffe9a8'][Math.floor(rng() * 4)], a: .2 + rng() * .5, ph: rng() * TAU }));
      const TILT = .46, ct = Math.cos(TILT), st = Math.sin(TILT); const sun = [.6, .35, .72];
      const draw = (now) => { if (!alive) return; const t = (now - t0s) / 1000; sx.fillStyle = '#0A0A0A'; sx.fillRect(0, 0, w, h); const cx = w / 2, cy = h * .5, SC = Math.min(w * .22, h * .3); const ease = u => u < 0 ? 0 : u > 1 ? 1 : 1 - Math.pow(1 - u, 3); const open = ease(t / 2.4), ry = t * TAU / 160, cr = Math.cos(ry), sr = Math.sin(ry);
        for (const q of stars) { sx.globalAlpha = q.a * (.7 + .3 * Math.sin(t * 1.1 + q.ph)) * open; sx.fillStyle = q.c; sx.fillRect(q.x * w, q.y * h, 1, 1); }
        const pts = []; const push = (p, c, al, sz) => { const X = p[0] * cr + p[2] * sr, Z = -p[0] * sr + p[2] * cr; pts.push({ x: X, y: p[1] * ct - Z * st, z: p[1] * st + Z * ct, c, al, sz }); };
        for (const g of globe) { const n = g.p, mu = (n[0] * sun[0] + n[1] * sun[1] + n[2] * sun[2]); const lit = Math.max(0, mu) * .85 + .1; push(g.p, g.c, lit * g.j, 1.3); }
        for (const r of rings) { const ang = r.a + t * .03 * Math.pow(r.R, -1.5); push([r.R * Math.cos(ang), 0, r.R * Math.sin(ang)], r.c, .55 * r.j, 1); }
        pts.sort((a, b) => a.z - b.z); sx.save(); sx.globalCompositeOperation = 'lighter';
        for (const p of pts) { const X = cx + p.x * SC * open, Y = cy + p.y * SC * open; if (p.sz === 1 && Math.hypot(p.x, p.y / .9) < 1 && p.z < 0) continue; sx.globalAlpha = p.al * open; sx.fillStyle = p.c; sx.fillRect(X, Y, p.sz, p.sz); }
        sx.restore(); requestAnimationFrame(draw); }; requestAnimationFrame(draw); }
    if (mode === 'entangle') { // Quantum Entanglement: Bell pairs mirrored through the origin in an indigo void; one pair measured, collapsing to white
      el.classList.add('entangle'); const qc = el.querySelector('.pl-cv'), qx = qc.getContext('2d'); let w = 0, h = 0; const size = () => { w = qc.width = innerWidth; h = qc.height = innerHeight; }; size(); addEventListener('resize', size); const t0q = performance.now(); const TAU = 6.283185;
      let sd = 7; const rng = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; };
      const pairs = Array.from({ length: 60 }, (_, i) => { const u = rng() * 2 - 1, a = rng() * TAU, sp = Math.sqrt(1 - u * u), r = .35 + Math.pow(rng(), .7) * .65; return { d: [sp * Math.cos(a) * r, u * r, sp * Math.sin(a) * r], ph: rng() * TAU, cloud: Array.from({ length: 14 }, () => [rng() * 2 - 1, rng() * 2 - 1, rng() * TAU]), coll: 2.5 + i * 1.9 + rng() }; });
      const TILT = .3, ct = Math.cos(TILT), st = Math.sin(TILT);
      const proj = (p, ry) => { const cr = Math.cos(ry), sr = Math.sin(ry); const X = p[0] * cr + p[2] * sr, Z = -p[0] * sr + p[2] * cr; return [X, p[1] * ct - Z * st, p[1] * st + Z * ct]; };
      const draw = (now) => { if (!alive) return; const t = (now - t0q) / 1000; qx.fillStyle = '#06080f'; qx.fillRect(0, 0, w, h); const cx = w / 2, cy = h * .5, SC = Math.max(w, h) * .42; const ease = u => u < 0 ? 0 : u > 1 ? 1 : 1 - Math.pow(1 - u, 3); const open = ease(t / 2.2), ry = t * TAU / 90;
        qx.save(); qx.globalCompositeOperation = 'lighter';
        for (const p of pairs) { const A = proj(p.d, ry), B = [-A[0], -A[1], -A[2]]; const pa = 1 / (1 + A[2] * .35), pb = 1 / (1 + B[2] * .35); const ax = cx + A[0] * SC * pa * open, ay = cy + A[1] * SC * pa * open, bx = cx + B[0] * SC * pb * open, by = cy + B[1] * SC * pb * open;
          const age = ((t - p.coll) % 36 + 36) % 36; const collapsing = age > 0 && age < 2.4; const spread = collapsing ? Math.max(.08, 1 - age / .5) : 1; const flash = collapsing ? Math.max(0, 1 - age / 1.6) : 0;
          qx.strokeStyle = `rgba(140,160,220,${(.06 + .25 * flash) * open})`; qx.lineWidth = .8; qx.beginPath(); qx.moveTo(ax, ay); qx.lineTo(bx, by); qx.stroke();
          const puff = (x, y, col, ps) => { for (const c of p.cloud) { const sh = .55 + .45 * Math.sin(t * 1.6 + c[2]); const r = 9 * ps * spread; qx.globalAlpha = (.18 + .3 * sh) * open; qx.fillStyle = col; qx.fillRect(x + c[0] * r, y + c[1] * r, 1.2 * ps, 1.2 * ps); } qx.globalAlpha = (.75 + .25 * flash) * open; qx.fillStyle = flash > 0 ? `rgba(255,255,255,${.6 + .4 * flash})` : col; qx.fillRect(x - ps, y - ps, 2 * ps, 2 * ps); if (collapsing && age > .3) { const rr = (age - .3) * 42 * ps; qx.globalAlpha = Math.max(0, .5 - (age - .3) / 4) * open; qx.strokeStyle = '#ffffff'; qx.lineWidth = 1; qx.beginPath(); qx.arc(x, y, rr, 0, TAU); qx.stroke(); } };
          puff(ax, ay, '#5BD7F5', pa); puff(bx, by, '#9D7BFF', pb); }
        qx.restore(); requestAnimationFrame(draw); }; requestAnimationFrame(draw); }
    if (mode === 'deepfield') { // The Known Universe: a slow-tumbling deep field of tiny galaxies in the video's astronomy palette
      el.classList.add('deepfield'); const uc = el.querySelector('.pl-cv'), ux = uc.getContext('2d'); let w = 0, h = 0; const size = () => { w = uc.width = innerWidth; h = uc.height = innerHeight; }; size(); addEventListener('resize', size); const t0u = performance.now(); const TAU = 6.283185;
      let sd = 2; const rng = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; };
      const COLS = ['#4f9bff', '#ff5fae', '#ffc04d', '#fff3c8', '#ff9533', '#7cc1ff', '#eef4ff', '#b07cff', '#3fe0e0'];
      const gals = Array.from({ length: 140 }, () => { const u = rng() * 2 - 1, a = rng() * TAU, sp = Math.sqrt(1 - u * u), r = Math.pow(rng(), .6); const kind = rng(); const n = kind < .55 ? 46 : 26; return { p: [sp * Math.cos(a) * r, u * r, sp * Math.sin(a) * r], sz: .05 + rng() * .11, tilt: rng() * TAU, inc: .25 + rng() * 1.2, kind, arm: COLS[Math.floor(rng() * COLS.length)], core: rng() < .5 ? '#fff3c8' : '#ffc04d', pts: Array.from({ length: n }, (_, i) => ({ f: (i + .5) / n, j: (rng() - .5) * .18, side: i % 2 ? 1 : -1 })) }; });
      const stars = Array.from({ length: 520 }, () => ({ x: rng(), y: rng(), c: ['#7cc1ff', '#eef4ff', '#ffc04d', '#ff5a5f'][Math.floor(rng() * 4)], a: .2 + rng() * .6, ph: rng() * TAU }));
      const TILT = .35, ct = Math.cos(TILT), st = Math.sin(TILT);
      const draw = (now) => { if (!alive) return; const t = (now - t0u) / 1000; ux.fillStyle = '#0A0A0A'; ux.fillRect(0, 0, w, h); const cx = w / 2, cy = h * .5, SC = Math.max(w, h) * .62; const ease = u => u < 0 ? 0 : u > 1 ? 1 : 1 - Math.pow(1 - u, 3); const open = ease(t / 2.4), ry = t * TAU / 140, cr = Math.cos(ry), sr = Math.sin(ry);
        for (const s of stars) { ux.globalAlpha = s.a * (.7 + .3 * Math.sin(t * 1.3 + s.ph)) * open; ux.fillStyle = s.c; ux.fillRect(s.x * w, s.y * h, 1, 1); }
        const list = gals.map(g => { const X = g.p[0] * cr + g.p[2] * sr, Z = -g.p[0] * sr + g.p[2] * cr; return { g, x: X, y: g.p[1] * ct - Z * st, z: g.p[1] * st + Z * ct }; }).sort((a, b) => b.z - a.z);
        for (const o of list) { const g = o.g, persp = 1 / (1 + o.z * .5), gx0 = cx + o.x * SC * persp * open, gy0 = cy + o.y * SC * persp * open, R = g.sz * SC * persp * open, ci = Math.cos(g.inc), ca = Math.cos(g.tilt), sa = Math.sin(g.tilt); const depth = .45 + .55 * persp;
          if (g.kind < .55) { for (const q of g.pts) { const ang = q.f * TAU * 1.1 + (q.side > 0 ? 0 : Math.PI) + t * .05; const rr = R * (.15 + q.f * .85) * (1 + q.j); const lx = Math.cos(ang) * rr, ly = Math.sin(ang) * rr * ci; const x = gx0 + lx * ca - ly * sa, y = gy0 + lx * sa + ly * ca; ux.globalAlpha = (.35 + .5 * (1 - q.f)) * depth * open; ux.fillStyle = q.f < .25 ? g.core : g.arm; ux.fillRect(x, y, 1, 1); } }
          else if (g.kind < .8) { for (const q of g.pts) { const ang = q.f * TAU * 3.7, rr = R * .75 * Math.pow(Math.abs(q.j) * 5.5, .5); const lx = Math.cos(ang) * rr, ly = Math.sin(ang) * rr * .7; ux.globalAlpha = .5 * depth * open; ux.fillStyle = q.f < .5 ? '#fff3c8' : '#ffc04d'; ux.fillRect(gx0 + lx * ca - ly * sa, gy0 + lx * sa + ly * ca, 1, 1); } }
          else { for (const q of g.pts) { const lx = (q.f - .5) * 2 * R, ly = q.j * R * .5; ux.globalAlpha = .55 * depth * open; ux.fillStyle = Math.abs(q.f - .5) < .12 ? g.core : g.arm; ux.fillRect(gx0 + lx * ca - ly * sa, gy0 + lx * sa + ly * ca, 1, 1); } }
          ux.globalAlpha = .9 * depth * open; ux.fillStyle = g.core; ux.fillRect(gx0 - .5, gy0 - .5, 1.5, 1.5); }
        requestAnimationFrame(draw); }; requestAnimationFrame(draw); }
    if (mode === 'nova') { // Supernova: a white-ice core igniting, rose/violet filaments blooming outward, one shock ring
      el.classList.add('nova'); const nc = el.querySelector('.pl-cv'), nx = nc.getContext('2d'); let w = 0, h = 0; const size = () => { w = nc.width = innerWidth; h = nc.height = innerHeight; }; size(); addEventListener('resize', size); const t0n = performance.now(); const TAU = 6.283185;
      let sd = 77; const rng = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; };
      const F = Array.from({ length: 420 }, (_, i) => ({ th: (i % 12) / 12 * TAU + (rng() - .5) * .5, curl: (rng() - .5) * 1.4, ph: rng(), v: .6 + rng() * .5, sz: 3 + rng() * 9, c: i % 3 === 0 ? '255,211,122' : i % 3 === 1 ? '255,143,184' : '157,123,255', a: .25 + rng() * .5 }));
      const stars = Array.from({ length: 220 }, () => ({ x: rng(), y: rng(), a: .15 + rng() * .5 }));
      const draw = (now) => { if (!alive) return; const t = Math.max(0, (now - t0n) / 1000); nx.fillStyle = '#0A0A0A'; nx.fillRect(0, 0, w, h); const cx = w / 2, cy = h * .46, SC = Math.min(w, h) * .32; const ease = u => u < 0 ? 0 : u > 1 ? 1 : 1 - Math.pow(1 - u, 3); const open = ease(t / 2.2), br = .5 + .5 * Math.sin(t * TAU / 9);
        for (const q of stars) { nx.globalAlpha = q.a * open; nx.fillStyle = '#dfe8ff'; nx.fillRect(q.x * w, q.y * h, 1, 1); }
        nx.save(); nx.globalCompositeOperation = 'lighter';
        let g = nx.createRadialGradient(cx, cy, 0, cx, cy, SC * 2.2); g.addColorStop(0, `rgba(255,200,225,${.2 * open})`); g.addColorStop(.4, `rgba(157,123,255,${.08 * open})`); g.addColorStop(1, 'rgba(60,40,120,0)'); nx.globalAlpha = 1; nx.fillStyle = g; nx.fillRect(0, 0, w, h);
        for (const p of F) { const age = (((t / 14 * p.v + p.ph) % 1) + 1) % 1, e = Math.sqrt(age), r = SC * (.15 + e * 1.3) * open, th = p.th + p.curl * e; const x = cx + Math.cos(th) * r * 1.2, y = cy + Math.sin(th) * r * .8, s = Math.max(.5, p.sz * (.5 + e)); const fade = age < .15 ? age / .15 : 1 - (age - .15) / .85; g = nx.createRadialGradient(x, y, 0, x, y, s); g.addColorStop(0, `rgba(${p.c},${p.a * fade * open})`); g.addColorStop(1, `rgba(${p.c},0)`); nx.fillStyle = g; nx.fillRect(x - s, y - s, s * 2, s * 2); }
        const ring = (t % 6) / 6, R = SC * (.3 + ring * 2.4); nx.globalAlpha = Math.sin(ring * Math.PI) * .35 * open; nx.lineWidth = 1 + (1 - ring) * 3; nx.strokeStyle = '#BFE8FF'; nx.beginPath(); nx.ellipse(cx, cy, R * 1.2, R * .8, 0, 0, TAU); nx.stroke();
        nx.globalAlpha = 1; nx.translate(cx, cy); nx.rotate(t * .02); for (let i = 0; i < 6; i++) { const L = SC * (i % 2 ? 1.1 : 1.7) * open; const rg = nx.createLinearGradient(0, 0, L, 0); rg.addColorStop(0, `rgba(230,245,255,${.35 * open})`); rg.addColorStop(1, 'rgba(230,245,255,0)'); nx.fillStyle = rg; nx.beginPath(); nx.moveTo(0, -1.5); nx.lineTo(L, 0); nx.lineTo(0, 1.5); nx.fill(); nx.rotate(TAU / 6); } nx.setTransform(1, 0, 0, 1, 0, 0);
        const cr = SC * (.42 + .06 * br) * open; g = nx.createRadialGradient(cx, cy, 0, cx, cy, cr); g.addColorStop(0, '#fff'); g.addColorStop(.2, 'rgba(240,250,255,.95)'); g.addColorStop(.5, 'rgba(191,232,255,.45)'); g.addColorStop(1, 'rgba(255,160,200,0)'); nx.fillStyle = g; nx.beginPath(); nx.arc(cx, cy, cr, 0, TAU); nx.fill();
        nx.restore(); requestAnimationFrame(draw); }; requestAnimationFrame(draw); }
    if (mode === 'genesis') { // Big Bang: one white point in the void, breathing; faint rings of first light ride out from it; plasma dust cools gold → violet as it flies
      el.classList.add('genesis'); const gc = el.querySelector('.pl-cv'), gx = gc.getContext('2d'); let w = 0, h = 0; const size = () => { w = gc.width = innerWidth; h = gc.height = innerHeight; }; size(); addEventListener('resize', size); const t0g = performance.now(); const TAU = 6.283185;
      let sd = 41; const rng = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; };
      const D = Array.from({ length: 520 }, () => { const a = rng() * TAU, e = Math.acos(rng() * 2 - 1); return { dx: Math.sin(e) * Math.cos(a), dy: Math.cos(e) * .7, ph: rng(), v: .7 + rng() * .6, sz: 1.5 + rng() * 5, a: .25 + rng() * .5 }; });
      const draw = (now) => { if (!alive) return; const t = Math.max(0, (now - t0g) / 1000); gx.fillStyle = '#0A0A0A'; gx.fillRect(0, 0, w, h); const cx = w / 2, cy = h * .46, SC = Math.min(w, h) * .3; const ease = u => u < 0 ? 0 : u > 1 ? 1 : 1 - Math.pow(1 - u, 3); const open = ease(t / 2.4), br = .5 + .5 * Math.sin(t * TAU / 7);
        gx.save(); gx.globalCompositeOperation = 'lighter';
        let g = gx.createRadialGradient(cx, cy, 0, cx, cy, SC * 2.4); g.addColorStop(0, `rgba(157,123,255,${.14 * open})`); g.addColorStop(.5, `rgba(42,26,140,${.08 * open})`); g.addColorStop(1, 'rgba(10,10,10,0)'); gx.fillStyle = g; gx.fillRect(0, 0, w, h);
        for (const p of D) { const age = (((t / 11 * p.v + p.ph) % 1) + 1) % 1, e = 1 - Math.pow(1 - age, 2.2), r = SC * e * 2.1 * open; const x = cx + p.dx * r * 1.25, y = cy + p.dy * r; const fade = age < .08 ? age / .08 : 1 - (age - .08) / .92; const c = age < .12 ? '255,236,180' : age < .3 ? '255,170,120' : age < .6 ? '255,95,174' : '157,123,255'; const s = Math.max(.6, p.sz * (.4 + .6 * e)); g = gx.createRadialGradient(x, y, 0, x, y, s); g.addColorStop(0, `rgba(${c},${p.a * fade * open})`); g.addColorStop(1, `rgba(${c},0)`); gx.fillStyle = g; gx.fillRect(x - s, y - s, s * 2, s * 2); }
        for (let i = 0; i < 2; i++) { const ring = ((t + i * 3.5) % 7) / 7, R = SC * (.05 + ring * 2.6) * open; gx.globalAlpha = Math.sin(ring * Math.PI) * .3 * open; gx.lineWidth = 1 + (1 - ring) * 2; gx.strokeStyle = '#FFE9A8'; gx.beginPath(); gx.ellipse(cx, cy, R * 1.25, R, 0, 0, TAU); gx.stroke(); }
        const cr = SC * (.16 + .03 * br) * open; gx.globalAlpha = 1; g = gx.createRadialGradient(cx, cy, 0, cx, cy, cr); g.addColorStop(0, '#fff'); g.addColorStop(.18, 'rgba(255,250,240,.95)'); g.addColorStop(.5, 'rgba(255,224,138,.4)'); g.addColorStop(1, 'rgba(157,123,255,0)'); gx.fillStyle = g; gx.beginPath(); gx.arc(cx, cy, cr, 0, TAU); gx.fill();
        gx.restore(); requestAnimationFrame(draw); }; requestAnimationFrame(draw); }
    if (mode === 'halo') { // Dark Matter: a few warm galaxies orbiting an empty centre; the unseen halo breathes faintly into view around them; thin ice arcs of lensed light
      el.classList.add('halo'); const hc = el.querySelector('.pl-cv'), hx = hc.getContext('2d'); let w = 0, h = 0; const size = () => { w = hc.width = innerWidth; h = hc.height = innerHeight; }; size(); addEventListener('resize', size); const t0h = performance.now(); const TAU = 6.283185;
      let sd = 19; const rng = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; };
      const HP = Array.from({ length: 900 }, () => { const r = Math.pow(rng(), .55), a = rng() * TAU; return { r, a, v: .12 / Math.max(.2, r), sz: .6 + rng() * 1.6, al: .08 + rng() * .22 }; });
      const GL = Array.from({ length: 9 }, (_, i) => ({ r: .18 + rng() * .62, a: rng() * TAU, v: .22, sz: 5 + rng() * 9, c: ['255,236,190', '255,217,138', '255,179,122', '243,246,255'][i % 4] }));
      const AR = Array.from({ length: 7 }, () => ({ a: rng() * TAU, w: .25 + rng() * .5, ph: rng() * TAU }));
      const draw = (now) => { if (!alive) return; const t = Math.max(0, (now - t0h) / 1000); hx.fillStyle = '#0A0A0A'; hx.fillRect(0, 0, w, h); const cx = w / 2, cy = h * .46, SC = Math.min(w, h) * .3; const ease = u => u < 0 ? 0 : u > 1 ? 1 : 1 - Math.pow(1 - u, 3); const open = ease(t / 2.4), rev = .5 + .5 * Math.sin(t * TAU / 9 - 1.6);
        hx.save(); hx.globalCompositeOperation = 'lighter';
        let g = hx.createRadialGradient(cx, cy, 0, cx, cy, SC * 1.9); g.addColorStop(0, `rgba(106,61,255,${(.05 + .12 * rev) * open})`); g.addColorStop(.6, `rgba(43,179,177,${(.03 + .07 * rev) * open})`); g.addColorStop(1, 'rgba(10,10,10,0)'); hx.fillStyle = g; hx.fillRect(0, 0, w, h);
        for (const p of HP) { const a = p.a + t * p.v, X = cx + Math.cos(a) * p.r * SC * 1.8, Y = cy + Math.sin(a) * p.r * SC * 1.05; hx.globalAlpha = p.al * (.25 + .75 * rev) * open; hx.fillStyle = p.r < .5 ? '#8a6bff' : '#3fd3c6'; hx.fillRect(X, Y, p.sz, p.sz); }
        for (const q of AR) { const R = SC * 1.15, a0 = q.a + t * .01; hx.globalAlpha = (.18 + .22 * rev) * open; hx.lineWidth = 1.4; hx.strokeStyle = '#BFE8FF'; hx.beginPath(); hx.ellipse(cx, cy, R * 1.8, R * 1.05, 0, a0 - q.w / 2, a0 + q.w / 2); hx.stroke(); }
        for (const gl of GL) { const a = gl.a + t * gl.v / Math.max(.25, gl.r), X = cx + Math.cos(a) * gl.r * SC * 1.8, Y = cy + Math.sin(a) * gl.r * SC * 1.05; g = hx.createRadialGradient(X, Y, 0, X, Y, gl.sz); g.addColorStop(0, `rgba(${gl.c},${.95 * open})`); g.addColorStop(.35, `rgba(${gl.c},${.35 * open})`); g.addColorStop(1, `rgba(${gl.c},0)`); hx.globalAlpha = 1; hx.fillStyle = g; hx.fillRect(X - gl.sz, Y - gl.sz, gl.sz * 2, gl.sz * 2); }
        hx.restore(); requestAnimationFrame(draw); }; requestAnimationFrame(draw); }
    if (mode === 'glory') { // Divine Energy: a miniature of the video's own glory — white-gold rays into the 9-colour palette, three helical streams, dark heart, coral halo, turning in 3D
      el.classList.add('glory'); const gc = el.querySelector('.pl-gl'), gx = gc.getContext('2d'); let w = 0, h = 0; const size = () => { w = gc.width = innerWidth; h = gc.height = innerHeight; }; size(); addEventListener('resize', size); const t0g = performance.now();
      let sd = 12; const rng = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; }; const TAU = 6.283185;
      const PAL = ['#FF2B9C', '#FF1818', '#FFA401', '#FFFF00', '#27FF00', '#00FFF9', '#05C1FF', '#9D41FF', '#FF14FF'], INNER = .42, SPAN = 2.25;
      const rays = Array.from({ length: 130 }, (_, i) => { const u = rng() * 2 - 1, a = rng() * TAU, sp = Math.sqrt(1 - u * u); return { d: [sp * Math.cos(a), u, sp * Math.sin(a)], ph: rng() * TAU, sf: .5 + rng() * .8, len: .82 + rng() * .36, ci: Math.floor(i * 2.6 + rng() * 1.4) % PAL.length }; });
      const streams = [0, 1, 2].map(s => ({ base: s / 3 * TAU, ca: Math.cos(.6 + s * .5), sa: Math.sin(.6 + s * .5), turns: 2.4 + s * .4, col: ['#00FFF9', '#FF14FF', '#FFFF00'][s], dir: s % 2 ? -1 : 1, seeds: Array.from({ length: 110 }, (_, i) => (i + rng() * .5) / 150) }));
      const heart = Array.from({ length: 200 }, () => { const u = rng() * 2 - 1, a = rng() * TAU, sp = Math.sqrt(1 - u * u); return [sp * Math.cos(a), u, sp * Math.sin(a)]; });
      
      const TILT = .42, ct = Math.cos(TILT), st = Math.sin(TILT); const pts = [];
      const draw = (now) => { if (!alive) return; const t = (now - t0g) / 1000; gx.fillStyle = '#0A0A0A'; gx.fillRect(0, 0, w, h); const cx = w / 2, cy = h * .37, SC = Math.min(w, h) * .095; const ease = u => u < 0 ? 0 : u > 1 ? 1 : 1 - Math.pow(1 - u, 3); const open = ease(t / 2.4), ry = t * TAU / 40, cr = Math.cos(ry), sr = Math.sin(ry);
        pts.length = 0; const push = (x, y, z, col, sz, al) => { const X = x * cr + z * sr, Z = -x * sr + z * cr, Y = y * ct - Z * st, Zd = y * st + Z * ct; pts.push({ x: X, y: Y, z: Zd, col, sz, al }); };
        for (const r of rays) { const L = r.len * (1 + .13 * Math.sin(t * r.sf + r.ph)); for (let j = 0; j < 11; j++) { const f = (j + .5) / 11, rad = (INNER + f * SPAN * L) * open; push(r.d[0] * rad, r.d[1] * rad, r.d[2] * rad, f < .3 ? '#FFF6E0' : PAL[r.ci], f < .3 ? 1.6 : 1.1, f < .3 ? .9 : .32 + .3 * (1 - f)); } }
        for (const s of streams) { const spin = t * .18 * s.dir; for (const f of s.seeds) { const rad = (INNER + f * SPAN * .96) * open, ang = s.base + spin + f * s.turns * TAU, x = rad * Math.cos(ang), yz = rad * Math.sin(ang); push(x, yz * s.ca, yz * s.sa, s.col, 1.1, .6); } }
        const br = .46 * (1 + .06 * Math.sin(t * .95)) * open; for (const c of heart) push(c[0] * br, c[1] * br, c[2] * br, '#3a3a46', 1, .9);
        pts.sort((p, q) => p.z - q.z); gx.save(); gx.globalCompositeOperation = 'lighter';
        const core = gx.createRadialGradient(cx, cy, 0, cx, cy, SC * 1.2); core.addColorStop(0, 'rgba(255,246,224,.7)'); core.addColorStop(.3, 'rgba(255,240,170,.22)'); core.addColorStop(.6, 'rgba(255,247,56,.06)'); core.addColorStop(1, 'rgba(255,247,56,0)'); gx.globalAlpha = open; gx.fillStyle = core; gx.fillRect(cx - SC * 1.3, cy - SC * 1.3, SC * 2.6, SC * 2.6);
        for (const p of pts) { const persp = 1 / (1 + p.z * .12), X = cx + p.x * SC * persp, Y = cy + p.y * SC * persp, s = p.sz * persp; if (p.col === '#3a3a46') { gx.globalCompositeOperation = 'source-over'; gx.globalAlpha = p.al * open; gx.fillStyle = p.col; gx.fillRect(X, Y, s, s); gx.globalCompositeOperation = 'lighter'; continue; } gx.globalAlpha = p.al * open * (.6 + .4 * persp); gx.fillStyle = p.col; gx.fillRect(X - s / 2, Y - s / 2, s, s); }
        gx.restore(); requestAnimationFrame(draw); }; requestAnimationFrame(draw); }
    if (mode === 'vortex') { // the Portal video: violet energy ring with coloured spiral arms, breathing
      el.classList.add('vortex'); const vc = el.querySelector('.pl-vx'), vx = vc.getContext('2d'); let w = 0, h = 0; const size = () => { w = vc.width = innerWidth; h = vc.height = innerHeight; }; size(); addEventListener('resize', size); const t0v = performance.now();
      const N = 1400, P = Array.from({ length: N }, (_, i) => ({ a: Math.random() * 6.283, r: .78 + Math.random() * .44, s: (Math.random() - .5) * .25, k: i % 7 }));
      const ARMS = [['#00E5FF', 1.3], ['#FF66E0', -1.15], ['#5BFFC9', .95], ['#B070FF', -.8]];
      const draw = (now) => { if (!alive) return; const t = (now - t0v) / 1000; vx.fillStyle = '#0A0A0A'; vx.fillRect(0, 0, w, h); const cx = w / 2, cy = h * .36, R = Math.min(w, h) * .19 * (1 + .035 * Math.sin(t * .9)); const ease = u => u < 0 ? 0 : u > 1 ? 1 : 1 - Math.pow(1 - u, 3); const open = ease(t / 2.2);
        vx.save(); vx.globalCompositeOperation = 'lighter';
        const gl = vx.createRadialGradient(cx, cy, 0, cx, cy, R * 2.4); gl.addColorStop(0, 'rgba(168,108,255,.22)'); gl.addColorStop(.45, 'rgba(168,108,255,.06)'); gl.addColorStop(1, 'rgba(168,108,255,0)'); vx.fillStyle = gl; vx.globalAlpha = open; vx.fillRect(cx - R * 2.5, cy - R * 2.5, R * 5, R * 5);
        for (const p of P) { const ang = p.a + t * .18 * (p.k % 2 ? 1 : -1) + p.s * t; const rr = R * p.r * open; const x = cx + Math.cos(ang) * rr, y = cy + Math.sin(ang) * rr * .62; const e = Math.abs(p.r - 1); const col = e < .06 ? '255,255,255' : e < .18 ? '213,176,255' : '168,108,255'; vx.globalAlpha = (e < .06 ? .95 : .55 - e) * open; vx.fillStyle = `rgb(${col})`; vx.fillRect(x, y, e < .06 ? 1.8 : 1.3, e < .06 ? 1.8 : 1.3); }
        vx.globalAlpha = open * .9; vx.lineWidth = 1.5; vx.strokeStyle = '#fff'; vx.shadowColor = '#D5B0FF'; vx.shadowBlur = 18; vx.beginPath(); vx.ellipse(cx, cy, R, R * .62, 0, 0, 6.283); vx.stroke(); vx.shadowBlur = 0;
        vx.restore(); requestAnimationFrame(draw); }; requestAnimationFrame(draw); }
    if (mode === 'portal') { // the brand symbol: grid field, white light plate, portal rings opening
      el.classList.add('portal'); const pcv = el.querySelector('.pl-portal'), px = pcv.getContext('2d'); let w = 0, h = 0; const size = () => { w = pcv.width = innerWidth; h = pcv.height = innerHeight; }; size(); addEventListener('resize', size); const t0p = performance.now();
      const dia = (cx, cy, rw, rh) => { px.beginPath(); px.moveTo(cx, cy - rh); px.lineTo(cx + rw, cy); px.lineTo(cx, cy + rh); px.lineTo(cx - rw, cy); px.closePath(); };
      const draw = (now) => { if (!alive) return; const t = (now - t0p) / 1000; px.fillStyle = '#0A0A0A'; px.fillRect(0, 0, w, h);
        const g = Math.max(36, Math.round(w / 40)); px.strokeStyle = 'rgba(242,243,241,.045)'; px.lineWidth = 1; px.beginPath(); for (let x = (w / 2) % g; x < w; x += g) { px.moveTo(x, 0); px.lineTo(x, h); } for (let y = (h / 2) % g; y < h; y += g) { px.moveTo(0, y); px.lineTo(w, y); } px.stroke();
        const cx = w / 2, base = h * .42, pw = Math.min(w, h) * .34, ph = pw * .446, lw = Math.max(1, pw / 280);
        const ease = u => u < 0 ? 0 : u > 1 ? 1 : 1 - Math.pow(1 - u, 3); const pl = ease((t - .2) / 1.6), ry = Math.min(h, w) * .17 * ease((t - 1.1) / 1.8);
        px.save(); px.lineCap = 'round'; px.lineJoin = 'round'; const seg = pl * 4; const tot = 2 * Math.hypot(pw, ph) * 2;
        if (pl > 0) { px.setLineDash([tot * pl, tot]); px.shadowColor = '#fff'; [[lw * 10, .07, 40], [lw * 5, .16, 22], [lw * 2.4, .36, 10], [lw, .95, 0]].forEach(([W, A, B]) => { px.shadowBlur = B; px.lineWidth = W; px.strokeStyle = `rgba(255,255,255,${A})`; dia(cx, base, pw, ph); px.stroke(); }); px.setLineDash([lw * 4, lw * 4]); px.shadowBlur = 6; px.lineWidth = lw; px.strokeStyle = `rgba(255,255,255,${.5 * ease((t - 1) / 1)})`; dia(cx, base, pw * .64, ph * .64); px.stroke(); }
        px.restore();
        if (ry > 0) { const rx0 = ry * .62, cy = base - ry; px.save(); px.globalCompositeOperation = 'lighter'; const gl = px.createRadialGradient(cx, cy, 0, cx, cy, ry * 1.9); gl.addColorStop(0, 'rgba(255,247,56,.42)'); gl.addColorStop(.5, 'rgba(255,247,56,.08)'); gl.addColorStop(1, 'rgba(255,247,56,0)'); px.fillStyle = gl; px.fillRect(cx - ry * 2, cy - ry * 2, ry * 4, ry * 4); px.restore();
          const pulse = .5 + .5 * Math.sin(t * 1.4); for (let i = 6; i >= 1; i--) { const f = i / 6; px.beginPath(); px.ellipse(cx, cy, rx0 * f, ry * f, 0, 0, 6.283); px.lineWidth = i === 6 ? 2 : 1.2; px.strokeStyle = `rgba(255,247,56,${(.25 + .75 * (1 - f) * (.7 + .3 * pulse)).toFixed(2)})`; px.stroke(); }
          px.beginPath(); px.ellipse(cx, cy, rx0 * .22, ry * .22, 0, 0, 6.283); px.fillStyle = '#FFF738'; px.shadowColor = 'rgba(255,247,56,.9)'; px.shadowBlur = 24; px.fill(); px.shadowBlur = 0;
          const ell = px.createRadialGradient(cx, base, 0, cx, base, pw * .6); ell.addColorStop(0, 'rgba(255,247,56,.16)'); ell.addColorStop(1, 'rgba(255,247,56,0)'); px.save(); px.scale(1, .446); px.fillStyle = ell; px.beginPath(); px.arc(cx, base / .446, pw * .6, 0, 6.283); px.fill(); px.restore(); }
        requestAnimationFrame(draw); }; requestAnimationFrame(draw); }
    if (mode === 'rain') { // sparse code rain + title decode
      const rc = el.querySelector('.pl-rain'), rx = rc.getContext('2d'); const CH = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ{}<>[]()+-*/=:;|.?!#@$%&^~';
      let w = 0, h = 0, cols = [], fs = 15; const size = () => { w = rc.width = innerWidth; h = rc.height = innerHeight; fs = Math.max(12, Math.round(w / 110)); const n = Math.floor(w / (fs * 1.1)); cols = Array.from({ length: n }, (_, i) => ({ x: i * fs * 1.1, y: -Math.random() * h * .35, v: (fs * 1.1) * (5 + Math.random() * 8), len: 14 + Math.floor(Math.random() * 26), on: Math.random() < .92 })); };
      size(); addEventListener('resize', size); let last = performance.now();
      const rain = (now) => { if (!alive) return; const dt = Math.min(.05, (now - last) / 1000); last = now; rx.fillStyle = '#0A0A0A'; rx.fillRect(0, 0, w, h); rx.font = fs + "px 'JetBrains Mono',monospace"; rx.textBaseline = 'top';
        for (const c of cols) { if (!c.on) continue; c.y += c.v * dt; const rowH = fs * 1.15, head = Math.floor(c.y / rowH); for (let k = 0; k < c.len; k++) { const r = head - k, y = r * rowH; if (y < -rowH || y > h) continue; const f = 1 - k / c.len; const seed = (r * 92821 + Math.round(c.x) * 68917) >>> 0; const ch = CH[(seed ^ (seed >>> 7)) % CH.length]; rx.fillStyle = k === 0 ? 'rgba(233,255,238,.95)' : `rgba(0,${Math.round(90 + 160 * f)},${Math.round(40 + 30 * f)},${(.12 + .6 * f).toFixed(2)})`; rx.fillText(ch, c.x, y); } if ((head - c.len) * rowH > h) { c.y = -Math.random() * h * .25; c.len = 14 + Math.floor(Math.random() * 26); c.on = Math.random() < .95; } else if (!c.on) {} }
        for (const c of cols) if (!c.on && Math.random() < .03) { c.on = true; c.y = -fs; }
        requestAnimationFrame(rain); }; requestAnimationFrame(rain);
      const tEl = el.querySelector('.pl-t'); tEl.classList.add('decode'); const target = title; const t0d = performance.now();
      const dec = () => { if (!alive) return; const e = (performance.now() - t0d) / 1000; let out = '', done = true; for (let i = 0; i < target.length; i++) { const ch = target[i]; if (ch === ' ') { out += ' '; continue; } const lock = .4 + i * .09; if (e > lock) out += ch; else { done = false; out += CH[Math.floor(Math.random() * CH.length)]; } } tEl.textContent = out; if (done) tEl.classList.remove('decode'); else setTimeout(dec, 55); }; dec(); }
    if (mode === 'dawn') { // slow golden dust rising past the horizon
      const sc = el.querySelector('.pl-st'), sx = sc.getContext('2d'); let w = 0, h = 0, pts = [];
      const size = () => { w = sc.width = innerWidth; h = sc.height = innerHeight; pts = Array.from({ length: Math.round(w * h / 9000) }, () => ({ x: Math.random() * w, y: Math.random() * h, r: .6 + Math.random() * 1.4, v: 6 + Math.random() * 14, a: .25 + Math.random() * .6, p: Math.random() * 6.28 })); };
      size(); addEventListener('resize', size); let last = performance.now();
      const dust = (now) => { if (!alive) return; const dt = Math.min(.05, (now - last) / 1000); last = now; sx.clearRect(0, 0, w, h);
        for (const q of pts) { q.y -= q.v * dt; q.p += dt; if (q.y < -4) { q.y = h + 4; q.x = Math.random() * w; } const tw = .6 + .4 * Math.sin(q.p * 1.7); const warm = q.y > h * .6 ? (q.y - h * .6) / (h * .4) : 0; sx.fillStyle = `rgba(${Math.round(250 + 5 * warm)},${Math.round(250 - 3 * warm)},${Math.round(250 - 194 * warm)},${q.a * tw})`; sx.beginPath(); sx.arc(q.x, q.y, q.r, 0, 6.283); sx.fill(); }
        requestAnimationFrame(dust); }; requestAnimationFrame(dust); }
    if (mode === 'mirror' || mode === 'cursed') { const hz = el.querySelector('.pl-mi canvas'), hx = hz.getContext('2d');
      const mirror = () => { if (!alive) return; const src = g.__plPoster || (o.source ? (typeof o.source === 'string' ? document.getElementById(o.source) : o.source) : null); if (src && src.width) { try { hx.clearRect(0, 0, hz.width, hz.height); hx.drawImage(src, 0, 0, hz.width, hz.height); } catch (e) {} } if (!g.__plPoster) requestAnimationFrame(mirror); }; mirror(); g.__plRefresh = mirror; }
    if (o.pixel === 'moon') { // The Paschal Moon: a mini pixel full moon — rose-tinted, slowly turning, maria + rayed craters, soft limb darkening, dithered, gentle halo
      el.classList.add('pmoon'); const pc = el.querySelector('.pl-pp'), px = pc.getContext('2d'), N = 44, R = 18.5, C = 21.5, img = px.createImageData(N, N), t0m = performance.now(); let lastM = 0;
      const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
      const TONES = [[70, 40, 58], [128, 82, 104], [184, 128, 150], [226, 172, 192], [250, 206, 222], [255, 232, 240]];
      const MARIA = [[.35, .25, .42], [-.15, .35, .3], [.7, -.1, .26], [.1, -.35, .22], [-.55, .05, .24], [1.4, .2, .35], [2.2, -.3, .3], [3.1, .3, .4], [4.0, -.15, .28], [5.0, .25, .33]];
      const CRAT = [[1.5, 0.6, 0.15], [3.85, 0.61, 0.14], [0.31, 0.51, 0.13], [2.27, -0.64, 0.12], [6.11, 0.05, 0.12], [2.84, 0.07, 0.11], [4.9, -0.12, 0.1], [2.98, 0.51, 0.1], [2.28, -0.03, 0.09], [5.24, -0.2, 0.09], [0.77, -0.07, 0.08], [2.87, -0.56, 0.08], [0.72, 0.18, 0.07], [4.86, -0.6, 0.07], [1.67, 0.13, 0.065], [2.22, -0.27, 0.06], [3.22, 0.3, 0.06], [1.95, -0.49, 0.055]]; // spaced so no crater sits inside another
      const LTX = -.7, LTY = .7;
      const angd = (lo1, la1, lo2, la2) => { const d = Math.sin(la1) * Math.sin(la2) + Math.cos(la1) * Math.cos(la2) * Math.cos(lo1 - lo2); return Math.acos(Math.max(-1, Math.min(1, d))); };
      const drawM = now => { if (!alive) return; requestAnimationFrame(drawM); if (now - lastM < 80) return; lastM = now; const t = (now - t0m) / 1000, rot = t * .06, d = img.data;
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const i = (y * N + x) * 4, nx = (x - C) / R, ny = (y - C) / R, r2 = nx * nx + ny * ny, th = BAYER[(y & 3) * 4 + (x & 3)] / 16; let c = null;
          if (r2 <= 1) { const nz = Math.sqrt(1 - r2), lat = Math.asin(-ny), lon = Math.atan2(nx, nz) + rot;
            let alb = .78; for (const [mlo, mla, mr] of MARIA) { const a = angd(lon, lat, mlo, mla); if (a < mr) alb -= .3 * (1 - a / mr) ** .6; }
            const base = alb; for (const [clo, cla, cr] of CRAT) { const a = angd(lon, lat, clo, cla); if (a > cr * 1.9) continue; let dl = lon - clo; dl = Math.atan2(Math.sin(dl), Math.cos(dl)); const dx = dl * Math.cos(lat), dy = lat - cla, dm = Math.max(1e-4, Math.hypot(dx, dy)), facing = (dx * LTX + dy * LTY) / dm;
              if (a < cr * .82) { const depth = 1 - (a / (cr * .82)) ** 2; alb = base - .04 - .05 * depth - .2 * facing * (a / (cr * .82)); }   // bowl: younger craters overwrite older ones, so overlaps read as cut rims
              else if (a < cr * 1.08) alb += .09 + .1 * facing;                                                                          // raised rim, lit toward the light
              else if (cr > .1) alb += .035 * (1 - (a - cr * 1.08) / (cr * .82)); }                                                     // faint ejecta on the big ones
            const limb = .55 + .45 * Math.pow(nz, .45), lum = Math.max(0, Math.min(1, alb * limb));
            const k = Math.max(0, Math.min(TONES.length - 1, Math.floor(lum * (TONES.length - .01) + (th - .5) * .9))); c = TONES[k]; }
          else { const r = Math.sqrt(r2); if (r < 1.16 && th < (1.16 - r) * 4.2) c = [150, 70, 104]; }
          if (c) { d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; } else d[i + 3] = 0; }
        px.putImageData(img, 0, 0); };
      requestAnimationFrame(drawM); }
    if (o.pixel === 'spiral') { // Galactic Core: a mini pixel spiral galaxy — white core, two ice-blue arms trailing dust, slowly turning, dithered
      el.classList.add('pspiral'); const pc = el.querySelector('.pl-pp'), px = pc.getContext('2d'), N = 44, C = 21.5, img = px.createImageData(N, N), t0s = performance.now(); let lastS = 0;
      const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
      const TONES = [[22, 28, 64], [52, 66, 136], [104, 128, 210], [168, 192, 250], [214, 228, 255], [255, 250, 236]];
      const drawS = now => { if (!alive) return; requestAnimationFrame(drawS); if (now - lastS < 70) return; lastS = now; const t = (now - t0s) / 1000, rot = t * .22, d = img.data;
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const i = (y * N + x) * 4, dx = (x - C) / 20, dy = (y - C) / 20 / .62, r = Math.hypot(dx, dy), th = BAYER[(y & 3) * 4 + (x & 3)] / 16; let c = null;
          if (r < 1.05) { const a = Math.atan2(dy, dx) - rot, ph = a - Math.log(Math.max(.05, r)) * 2.6, arm = Math.pow(.5 + .5 * Math.cos(2 * ph), 3.2), dust = Math.pow(.5 + .5 * Math.cos(2 * ph + .9), 6) * .35;
            const core = Math.exp(-r * r / .022), disk = Math.max(0, 1 - r) ** 1.3;
            const lum = core * 1.1 + arm * disk * .95 + disk * .12 - dust * disk;
            const k = Math.min(TONES.length - 1, Math.floor(lum * (TONES.length - .01) + (th - .5) * 1.1)); if (k >= 0 && lum > .05) c = core > .5 ? TONES[5] : TONES[k]; }
          if (c) { d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; } else d[i + 3] = 0; }
        px.putImageData(img, 0, 0); };
      requestAnimationFrame(drawS); }
    if (o.pixel === 'universe') { // The Known Universe: a pixel miniature of the video's own deep field (same galaxies, same tilt + drift), born from a single point of light
      el.classList.add('puni'); const pc = el.querySelector('.pl-pp'), N = 200; pc.width = pc.height = N;
      const px = pc.getContext('2d'), img = px.createImageData(N, N), B = new Float32Array(N * N * 3), C = N / 2, t0u = performance.now(), F = 236, CZ = 5.4, TX = .16, cX = Math.cos(TX), sX = Math.sin(TX); let lastU = 0;
      const ss = (e0, e1, x) => { const q = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return q * q * (3 - 2 * q); };
      const RGB = {}; const rgb = h => RGB[h] || (RGB[h] = [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
      const add = (x, y, c, k) => { x = x | 0; y = y | 0; if (x < 0 || y < 0 || x >= N || y >= N) return; const i = (y * N + x) * 3; B[i] += c[0] * k; B[i + 1] += c[1] * k; B[i + 2] += c[2] * k; };
      const drawU = now => { if (!alive) return; requestAnimationFrame(drawU); if (now - lastU < 33) return; lastU = now;
        const blocks = window.KU_BLOCKS; if (!blocks) return; const T = (now - t0u) / 1000;
        const g = ss(.2, 3.2, T), eg = 1 - Math.pow(1 - g, 3), ry = T * .11 + (1 - eg) * 2.4, cY = Math.cos(ry), sY = Math.sin(ry); B.fill(0);
        for (const bl of blocks) { const c = rgb(bl.color || '#fafafa'), st = bl.stars, lum = bl.lum;
          for (let i = 0; i < st.length; i++) { const p0 = st[i], r = Math.hypot(p0[0], p0[1], p0[2]) / 2.05, e = ss(0, 1, (g * 1.5 - r * .5)), sc = .02 + .98 * (1 - Math.pow(1 - e, 3)); if (e <= 0) continue;
            const px0 = p0[0] * sc, py0 = p0[1] * sc, pz0 = p0[2] * sc, x0 = cY * px0 + sY * pz0, z0 = -sY * px0 + cY * pz0, y1 = cX * py0 - sX * z0, z = sX * py0 + cX * z0 + CZ, k = F / z;
            let d = (7.45 - z) / 4.1; d = d < 0 ? 0 : d > 1 ? 1 : d; const L = lum ? lum[i] : .5, a = (.18 + .82 * d * d) * (.35 + .65 * L) * e * (bl.fg ? .55 : 1);
            const X = C + x0 * k, Y = C + y1 * k; add(X, Y, c, a); if (L > .9 && d > .55 && !bl.fg) { const q = a * .22; add(X + 1, Y, c, q); add(X - 1, Y, c, q); add(X, Y + 1, c, q); add(X, Y - 1, c, q); } } }
        const fl = Math.max(0, 1 - T / 1.6); if (fl > 0) for (let dy = -9; dy <= 9; dy++) for (let dx = -9; dx <= 9; dx++) { const r2 = dx * dx + dy * dy; if (r2 < 82) add(C + dx, C + dy, [255, 246, 228], fl * fl * 1.6 * Math.exp(-r2 / (6 + 30 * (1 - fl)))); }
        const dd = img.data; for (let i = 0, j = 0; i < B.length; i += 3, j += 4) { const r = 255 * (1 - Math.exp(-B[i] / 150)), gg = 255 * (1 - Math.exp(-B[i + 1] / 150)), bb = 255 * (1 - Math.exp(-B[i + 2] / 150)), m = Math.max(r, gg, bb);
          if (m < 1) { dd[j + 3] = 0; continue; } const s2 = 255 / m; dd[j] = r * s2; dd[j + 1] = gg * s2; dd[j + 2] = bb * s2; dd[j + 3] = m; }
        px.putImageData(img, 0, 0); };
      requestAnimationFrame(drawU); }
    if (o.pixel === 'galaxy') { // Galactic Core: large pixel spiral galaxy — white-gold bulge, two ice-blue arms with dust lanes and star knots, turning, dithered
      el.classList.add('pgalaxy'); const pc = el.querySelector('.pl-pp'); pc.width = pc.height = 96; const px = pc.getContext('2d'), N = 96, C = 47.5, img = px.createImageData(N, N), t0g = performance.now(); let lastG = 0;
      const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
      const TONES = [[14, 18, 44], [30, 38, 92], [56, 72, 150], [96, 122, 206], [150, 176, 244], [204, 220, 255], [240, 242, 255], [255, 244, 222]];
      let sd = 31; const rng = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; };
      const KN = Array.from({ length: 26 }, () => { const arm = rng() < .5 ? 0 : Math.PI, r = .22 + rng() * .7; return { r, a: arm + Math.log(r) / .38 + (rng() - .5) * .35, s: .5 + rng() * .5, p: rng() * 6.283 }; });
      const drawG = now => { if (!alive) return; requestAnimationFrame(drawG); if (now - lastG < 60) return; lastG = now; const t = (now - t0g) / 1000, rot = t * .18, d = img.data, ti = .6, sq = .64;
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const i = (y * N + x) * 4, dx = (x - C) / 44, dy = (y - C) / 44 / sq, r = Math.hypot(dx, dy), th = BAYER[(y & 3) * 4 + (x & 3)] / 16; let c = null;
          if (r < 1.08) { const a = Math.atan2(dy, dx) - rot, ph = a - Math.log(Math.max(.03, r)) / .38, arm = Math.pow(.5 + .5 * Math.cos(2 * ph), 2.6), arm2 = Math.pow(.5 + .5 * Math.cos(2 * ph - .5), 9) * .45, dust = Math.pow(.5 + .5 * Math.cos(2 * ph + .75), 10);
            const core = Math.exp(-r * r / .012), bulge = Math.exp(-r * r / .06), disk = Math.max(0, 1 - r) ** 1.15, fringe = Math.max(0, 1.08 - r) * .3;
            let lum = core * 1.25 + bulge * .55 + (arm + arm2) * disk * 1.05 + disk * .14 + fringe * .2 - dust * disk * .5 * (r > .1 ? 1 : 0);
            const k = Math.floor(lum * (TONES.length - .01) + (th - .5) * 1.2); if (lum > .04 && k >= 0) c = TONES[Math.min(TONES.length - 1, k)]; if (core > .55) c = TONES[7]; }
          if (c) { d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; } else d[i + 3] = 0; }
        for (const k of KN) { const a = k.a + rot, X = Math.round(C + Math.cos(a) * k.r * 44), Y = Math.round(C + Math.sin(a) * k.r * 44 * sq); if (X < 0 || Y < 0 || X >= N || Y >= N) continue; const tw = .5 + .5 * Math.sin(t * 2.2 + k.p); if (tw * k.s < .3) continue; const i = (Y * N + X) * 4, c = tw > .8 ? [255, 255, 255] : [214, 228, 255]; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; }
        px.putImageData(img, 0, 0); };
      requestAnimationFrame(drawG); }
    if (o.pixel === 'portal') { // Portal: the thumbnail's portal in pixels — tight tunnel rings flowing inward, indigo → violet → magenta into a white heart, defined lavender rim, cyan sparks
      el.classList.add('pportal'); const pc = el.querySelector('.pl-pp'); pc.width = pc.height = 72; const px = pc.getContext('2d'), N = 72, C = 35.5, R = 33, img = px.createImageData(N, N), t0o = performance.now(); let lastO = 0;
      const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
      const STOPS = [[0, [255, 255, 255]], [.1, [255, 246, 255]], [.2, [246, 150, 255]], [.36, [206, 70, 240]], [.56, [136, 52, 232]], [.78, [84, 36, 196]], [.9, [62, 30, 160]], [1, [96, 56, 210]]];
      const col = r => { let k = 0; while (k < STOPS.length - 2 && STOPS[k + 1][0] < r) k++; const [r0, c0] = STOPS[k], [r1, c1] = STOPS[k + 1], f = Math.max(0, Math.min(1, (r - r0) / (r1 - r0))); return [c0[0] + (c1[0] - c0[0]) * f, c0[1] + (c1[1] - c0[1]) * f, c0[2] + (c1[2] - c0[2]) * f]; };
      const hash = (x, y) => { let h = (x * 374761393 + y * 668265263) >>> 0; h = ((h ^ (h >>> 13)) * 1274126177) >>> 0; return (h ^ (h >>> 16)) / 4294967296; };
      const Q = 22, q = (v, th) => Math.max(0, Math.min(255, Math.round(v / Q + th - .5) * Q));
      const drawO = now => { if (!alive) return; requestAnimationFrame(drawO); if (now - lastO < 40) return; lastO = now; const t = (now - t0o) / 1000, d = img.data, br = 1 + .02 * Math.sin(t * 1.2);
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const i = (y * N + x) * 4, dx = (x - C) / R, dy = (y - C) / R, r = Math.hypot(dx, dy) / br, th = BAYER[(y & 3) * 4 + (x & 3)] / 16; let c = null;
          if (r <= 1) {
            if (r > .945) c = r > .972 ? [238, 226, 255] : [200, 168, 255];
            else { const ang = Math.atan2(dy, dx), ph = r * 9.5 * 6.283 * (1 - r * .28) + ang * .5 + t * 2.4, ring = .5 + .5 * Math.cos(ph), sharp = Math.pow(ring, 2.2);
              const base = col(r), lum = .68 + .55 * sharp + .4 * Math.exp(-r * r / .06); let R0 = base[0] * lum, G0 = base[1] * lum, B0 = base[2] * lum;
              const core = Math.min(1, Math.exp(-r * r / .02) * 1.25); R0 = Math.min(255, R0); G0 = Math.min(255, G0); B0 = Math.min(255, B0); R0 += (255 - R0) * core; G0 += (255 - G0) * core; B0 += (255 - B0) * core;
              const hs = hash(x, y); if (r > .3 && sharp > .7 && hs < .06 && Math.sin(t * 3 + hs * 90) > .2) { R0 = 120; G0 = 222; B0 = 255; }
              c = core > .92 ? [255, 255, 255] : [q(R0, th), q(G0, th), q(B0, th)]; } }
          else if (r < 1.03) c = [92, 56, 170];
          if (c) { d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; } else d[i + 3] = 0; }
        px.putImageData(img, 0, 0); };
      requestAnimationFrame(drawO); }
    if (o.pixel === 'mana') { // Mana: a pixel spell circle inscribing itself in gold — rings sweep in, runes tick on one by one, petals bloom, the core ignites; a spark rides the pen
      el.classList.add('pmana'); const pc = el.querySelector('.pl-pp'); pc.width = pc.height = 96; const px = pc.getContext('2d'), N = 96, C = 48, t0m = performance.now(); let lastM = 0; px.imageSmoothingEnabled = false;
      let sd = 5; const rng = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; };
      const RUNES = Array.from({ length: 24 }, () => Array.from({ length: 2 + Math.floor(rng() * 2) }, () => [Math.floor(rng() * 3) - 1, Math.floor(rng() * 3) - 1, rng() < .5]));
      const GOLD = '#FFC860', HOT = '#FFF3D2', DIM = '#8A5A1C', P = 6;
      const drawM = now => { if (!alive) return; requestAnimationFrame(drawM); if (now - lastM < 50) return; lastM = now; const t = (now - t0m) / 1000, u = (t % 6.5) / 6.5, rot = t * .25;
        px.clearRect(0, 0, N, N); const dot = (x, y, c) => { px.fillStyle = c; px.fillRect(Math.round(x), Math.round(y), 1, 1); };
        const ring = (r, p, a0, c) => { const n = Math.ceil(r * 6.3 * 1.4); for (let i = 0; i < n * p; i++) { const a = a0 + i / n * 6.283; dot(C - .5 + Math.cos(a) * r, C - .5 + Math.sin(a) * r, c); } if (p > 0 && p < 1) { const a = a0 + p * 6.283; px.fillStyle = HOT; px.fillRect(Math.round(C - 1.5 + Math.cos(a) * r), Math.round(C - 1.5 + Math.sin(a) * r), 3, 3); } };
        const ph = (a, b) => Math.max(0, Math.min(1, (u - a) / (b - a)));
        ring(44, ph(0, .14), -1.57, GOLD); ring(42, ph(.06, .18), 1.57, DIM);
        const nr = Math.floor(ph(.18, .48) * 24); for (let i = 0; i < nr; i++) { const a = -1.57 + i / 24 * 6.283 + rot * .2, cx = C - .5 + Math.cos(a) * 38, cy = C - .5 + Math.sin(a) * 38; for (const [dx, dy, l] of RUNES[i]) { dot(cx + dx, cy + dy, i === nr - 1 ? HOT : GOLD); if (l) dot(cx + dx + Math.cos(a), cy + dy + Math.sin(a), GOLD); } }
        ring(34, ph(.46, .56), -1.57, GOLD);
        const pp = ph(.56, .78) * P; for (let j = 0; j < P; j++) { const f = Math.max(0, Math.min(1, pp - j)); if (!f) continue; const phi = j / P * 6.283 + rot * .1 - 1.57; for (const sdn of [1, -1]) for (let i = 0; i <= 18 * f; i++) { const q = i / 18, r = 7 + q * 24, w = Math.sin(q * Math.PI) * .42 * sdn; dot(C - .5 + Math.cos(phi + w) * r, C - .5 + Math.sin(phi + w) * r, GOLD); } }
        const sp = ph(.74, .88) * P; for (let j = 0; j < Math.floor(sp); j++) { const phi = (j + .5) / P * 6.283 + rot * .1 - 1.57; const sx = C + Math.cos(phi) * 22, sy = C + Math.sin(phi) * 22; for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283 + rot; dot(sx - .5 + Math.cos(a) * 4, sy - .5 + Math.sin(a) * 4, DIM); } dot(sx - .5, sy - .5, HOT); }
        const cr = ph(.86, .96); if (cr > 0) { const r = 2 + cr * 3 + Math.sin(t * 4) * .6; const g = px.createRadialGradient(C, C, 0, C, C, r * 2.4); g.addColorStop(0, HOT); g.addColorStop(.4, 'rgba(255,200,96,.8)'); g.addColorStop(1, 'rgba(255,170,60,0)'); px.fillStyle = g; px.fillRect(C - r * 2.4, C - r * 2.4, r * 4.8, r * 4.8); }
        if (u > .96) { px.globalAlpha = 1 - (u - .96) / .04; px.globalCompositeOperation = 'destination-in'; px.fillStyle = '#000'; px.fillRect(0, 0, N, N); px.globalCompositeOperation = 'source-over'; px.globalAlpha = 1; } };
      requestAnimationFrame(drawM); }
    if (o.pixel === 'darkmatter') { // Dark Matter: the invisible made visible — a pixel halo of unseen mass; a cosmic-web knot with filaments, orbiting sub-halos, a faint galaxy at its heart and ice arcs of lensed light
      el.classList.add('pdm'); const pc = el.querySelector('.pl-pp'); pc.width = pc.height = 96; const px = pc.getContext('2d'), N = 96, C = 47.5, img = px.createImageData(N, N), t0d = performance.now(); let lastD = 0;
      const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
      const TONES = [[14, 10, 34], [34, 20, 84], [62, 34, 150], [96, 58, 220], [64, 150, 190], [63, 211, 198], [150, 232, 236], [226, 246, 255]];
      const FIL = [[.2, 1.0], [2.1, .9], [3.5, 1.0], [4.6, .85]]; // filament angles + reach
      let sd = 9; const rng = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; };
      const SUB = Array.from({ length: 6 }, (_, i) => ({ r: .32 + rng() * .3, a: rng() * 6.283, v: (.18 + rng() * .12) * (i % 2 ? 1 : -1), m: .015 + rng() * .02 }));
      const NODES = FIL.map(([a, L]) => ({ x: Math.cos(a) * L * .92, y: Math.sin(a) * L * .92, m: .02 }));
      const ARCS = [[.4, .62, .5], [2.5, .66, .42], [4.1, .6, .36]];
      const drawD = now => { if (!alive) return; requestAnimationFrame(drawD); if (now - lastD < 66) return; lastD = now; const t = (now - t0d) / 1000, d = img.data, br = .9 + .1 * Math.sin(t * 1.1);
        const subs = SUB.map(s => ({ x: Math.cos(s.a + t * s.v) * s.r, y: Math.sin(s.a + t * s.v) * s.r * .8, m: s.m }));
        const rot = t * .22 + .35 * Math.sin(t * .13), ca = Math.cos(rot), sa = Math.sin(rot), sq = .82 + .18 * Math.cos(t * .37), zm = 1 + .06 * Math.sin(t * .29), ox = .05 * Math.sin(t * .21), oy = .04 * Math.cos(t * .17);
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const i = (y * N + x) * 4, X0 = ((x - C) / 44 - ox) / zm, Y0 = ((y - C) / 44 - oy) / zm / sq, dx = X0 * ca + Y0 * sa, dy = -X0 * sa + Y0 * ca, r = Math.hypot(dx, dy), th = BAYER[(y & 3) * 4 + (x & 3)] / 16; let c = null;
          // density: NFW-like main halo + sub-halos + nodes + filaments
          let rho = .034 / (r + .045) / (1 + r * 3) * br;
          for (const s of subs) { const q = Math.hypot(dx - s.x, dy - s.y); rho += s.m * .05 / (q * q + .0025); }
          for (const n of NODES) { const q = Math.hypot(dx - n.x, dy - n.y); rho += n.m * .04 / (q * q + .004); }
          for (const [a, L] of FIL) { const ux = Math.cos(a), uy = Math.sin(a), along = dx * ux + dy * uy, perp = Math.abs(-dx * uy + dy * ux) + .02 * Math.sin(along * 14 + a * 3 + t * .4); if (along > 0 && along < L) rho += .14 * Math.exp(-(perp * perp) / .0012) * (1 - along / L * .6); }
          const sr = Math.hypot((x - C) / 44, (y - C) / 44), fade = Math.max(0, 1 - Math.pow(sr / 1.06, 6)); rho *= fade;
          let lv = Math.log(1 + rho * 6) / Math.log(10) * 1.1 + (th - .5) * .14;
          if (lv > .08) c = TONES[Math.max(0, Math.min(TONES.length - 1, Math.floor(lv * TONES.length)))];
          // the luminous galaxy at the heart: small, warm, a hint of spiral
          const ga = Math.atan2(dy, dx) - t * .25, gr = r / .1; if (gr < 1) { const arm = .5 + .5 * Math.cos(2 * (ga - Math.log(gr + .05) * 2.2)); const g = (1 - gr) * (.5 + .5 * arm); if (g > .35 + (th - .5) * .2) c = g > .75 ? [255, 246, 226] : [255, 214, 150]; }
          // gravitational lensing: thin ice arcs on the Einstein ring
          for (const [a0, R0, w] of ARCS) { let da = Math.atan2(dy, dx) - a0 - t * .03; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) < w && Math.abs(r - R0) < .014 * (1 - Math.abs(da) / w) + .006) c = Math.abs(da) < w * .4 ? [236, 248, 255] : [176, 226, 255]; }
          if (c) { d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; } else d[i + 3] = 0; }
        px.putImageData(img, 0, 0); };
      requestAnimationFrame(drawD); }
    if (o.pixel === 'cell') { // The Human Cell: a detailed pixel cell — lit double membrane, ER folds hugging a pored nucleus + nucleolus, Golgi stack, mitochondria with cristae, lysosomes, vesicles budding to the edge, drifting proteins, calcium wave
      el.classList.add('pcell'); const pc = el.querySelector('.pl-pp'); pc.width = pc.height = 96; const px = pc.getContext('2d'), N = 96, C = 47.5, R = 43, img = px.createImageData(N, N), t0c = performance.now(); let lastC = 0;
      const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
      const PROT = [[212, 42, 126], [39, 181, 194], [228, 134, 42], [60, 191, 88], [123, 79, 216], [230, 200, 74], [236, 116, 176], [58, 142, 216]];
      let sd = 31; const rng = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; };
      const DOTS = Array.from({ length: 130 }, () => ({ a: rng() * 6.283, d: .45 + Math.sqrt(rng()) * .45, v: (rng() - .5) * .18, c: PROT[Math.floor(rng() * PROT.length)] }));
      const MITO = [[-.6, -.34, .7, .17], [.08, .66, -.25, .15], [.7, -.3, 1.25, .16], [-.66, .38, 2.1, .15], [.32, -.68, .25, .13]];
      const LYSO = [[-.3, -.66, .065], [.62, .3, .055], [-.78, .02, .05], [.45, -.52, .045]];
      const NX = -.1, NY = .02, NRX = .37, NRY = .32, GX = .86, GY = .62;
      const VES = Array.from({ length: 7 }, (_, i) => ({ ph: i / 7, ang: -.55 + i * .16 }));
      const mix = (c, k, d) => [c[0] + (d[0] - c[0]) * k, c[1] + (d[1] - c[1]) * k, c[2] + (d[2] - c[2]) * k];
      const grid = new Array(N * N);
      const drawC = now => { if (!alive) return; requestAnimationFrame(drawC); if (now - lastC < 66) return; lastC = now; const t = (now - t0c) / 1000, d = img.data, wave = (t % 3.6) / 3.6;
        grid.fill(null);
        for (const p of DOTS) { const a = p.a + t * p.v, x = Math.round(C + Math.cos(a) * p.d * R), y = Math.round(C + Math.sin(a) * p.d * R * .94); if (x >= 0 && y >= 0 && x < N && y < N) grid[y * N + x] = p.c; }
        for (const v of VES) { const f = (t * .12 + v.ph) % 1, sx = .55 + Math.cos(v.ang) * .1, sy = .38 + Math.sin(v.ang) * .1, ex = .55 + Math.cos(v.ang) * .5, ey = .38 + Math.sin(v.ang) * .5, x = Math.round(C + (sx + (ex - sx) * f) * R), y = Math.round(C + (sy + (ey - sy) * f) * R * .94); for (const [ox, oy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) { const k = (y + oy) * N + x + ox; if (k >= 0 && k < N * N) grid[k] = [236, 190, 120]; } }
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const i = (y * N + x) * 4, dx = (x - C) / R, dy = (y - C) / R / .94, r = Math.hypot(dx, dy), ang = Math.atan2(dy, dx), th = BAYER[(y & 3) * 4 + (x & 3)] / 16;
          const edge = 1 + .03 * Math.sin(3 * ang + t * .5) + .018 * Math.sin(5 * ang - t * .35), rr = r / edge, light = -(dx * .58 + dy * .68) / Math.max(.001, r); let c = null;
          if (rr <= 1) {
            if (rr > .955) c = light > .2 ? [236, 212, 156] : light > -.35 ? [190, 158, 98] : [128, 100, 58];
            else if (rr > .935) c = [20, 16, 8];
            else if (rr > .915) c = light > 0 ? [150, 122, 74] : [104, 82, 48];
            else {
              const sh = .78 + .3 * (-(dx * .55 + dy * .62)) - .18 * rr * rr; c = th < .5 * (1 - rr) ? [46, 38, 20] : [30, 25, 13];
              const ex = (dx - NX) / NRX, ey = (dy - NY) / NRY, n = Math.hypot(ex, ey), na = Math.atan2(ey, ex);
              if (n >= 1.12 && n < 1.75 && !(na > -.2 && na < 1.3)) { const band = Math.sin(n * 30 + Math.sin(na * 4 + t * .3) * 1.4); if (band > .62) c = band > .9 ? [70, 170, 186] : [38, 110, 126]; }
              const gx = dx - GX, gy = dy - GY, gr = Math.hypot(gx, gy), ga = Math.atan2(gy, gx); if (ga > -2.75 && ga < -1.75) for (let k = 0; k < 5; k++) { const R0 = .38 + k * .05; if (Math.abs(gr - R0) < .016 + .004 * Math.cos((ga + 2.25) * 3)) c = k % 2 ? [196, 110, 36] : [240, 156, 58]; }
              for (const [mx, my, ma, ml] of MITO) { const ca = Math.cos(ma), sa = Math.sin(ma), u = (dx - mx) * ca + (dy - my) * sa, v = -(dx - mx) * sa + (dy - my) * ca, e = (u / ml) ** 2 + (v / .06) ** 2; if (e < 1) c = e > .62 ? (v < 0 ? [236, 150, 80] : [168, 96, 48]) : Math.abs(Math.sin(u * 70)) > .55 ? [200, 110, 56] : [92, 46, 24]; }
              for (const [lx, ly, lr] of LYSO) { const e = Math.hypot(dx - lx, dy - ly) / lr; if (e < 1) c = e < .35 && dx - lx < 0 && dy - ly < 0 ? [255, 170, 214] : e > .75 ? [150, 28, 90] : [212, 50, 132]; }
              if (n < 1) {
                if (n > .86) { const pore = Math.sin(na * 16 + .4) > .86; c = pore ? [30, 25, 13] : n > .93 ? (Math.cos(na + 2.3) > 0 ? [128, 110, 248] : [84, 66, 210]) : [58, 44, 160]; }
                else { const ux = ex + .3, uy = ey + .18, nu = Math.hypot(ux, uy) / .3; const chrom = Math.sin(ex * 19 + Math.sin(ey * 13 + t * .5) * 2.2) * Math.sin(ey * 17 - ex * 7 + t * .2);
                  c = nu < 1 ? (nu < .45 ? [236, 190, 255] : nu > .8 ? [120, 70, 200] : [178, 120, 240]) : chrom > .5 ? [222, 172, 64] : chrom > .2 ? [96, 72, 120] : th < .2 ? [44, 34, 92] : [30, 22, 64]; } }
              else if (grid[y * N + x]) c = grid[y * N + x];
              c = c.map(v => Math.min(255, v * sh)); }
            const wr = Math.abs(rr - wave * 1.05); if (wr < .04 && rr < .93) { const k = (1 - wr / .04) * Math.sin(wave * Math.PI) * .7; c = mix(c, k, [255, 222, 160]); } }
          else if (rr < 1.09 && th < (1.09 - rr) * 7 * (.5 + .5 * Math.max(0, light + .4))) c = [118, 52, 100];
          if (c) { const q = (th - .5) * 10; d[i] = Math.max(0, Math.min(255, c[0] + q)); d[i + 1] = Math.max(0, Math.min(255, c[1] + q)); d[i + 2] = Math.max(0, Math.min(255, c[2] + q)); d[i + 3] = 255; } else d[i + 3] = 0; }
        px.putImageData(img, 0, 0); };
      requestAnimationFrame(drawC); }
    if (o.pixel === 'ghost') { // Ghost In A Shell: a pixel geodesic shell turning in the dark, data packets on its edges, a pale ghost swaying inside with a bright head-core
      el.classList.add('pghost'); const pc = el.querySelector('.pl-pp'); pc.width = pc.height = 64; const px = pc.getContext('2d'), N = 64, C = 31.5, img = px.createImageData(N, N), t0g = performance.now(); let lastG = 0;
      const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5], R = new Float32Array(N * N), Gc = new Float32Array(N * N), B = new Float32Array(N * N);
      const PHI = (1 + Math.sqrt(5)) / 2, V = [[-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0], [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI], [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1]].map(v => { const m = Math.hypot(v[0], v[1], v[2]); return [v[0] / m, v[1] / m * 1.12, v[2] / m]; });
      const E = []; for (let a = 0; a < 12; a++) for (let b = a + 1; b < 12; b++) { const d = Math.hypot(V[a][0] - V[b][0], V[a][1] / 1.12 - V[b][1] / 1.12, V[a][2] - V[b][2]); if (d < 1.1) E.push([a, b]); }
      let sd = 9; const rng = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; };
      const PK = Array.from({ length: 12 }, () => ({ e: Math.floor(rng() * E.length), ph: rng(), sp: (.12 + rng() * .25) * (rng() < .5 ? -1 : 1) }));
      const add = (x, y, r, g, b, a) => { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= N || y >= N) return; const i = y * N + x; R[i] += r * a; Gc[i] += g * a; B[i] += b * a; };
      const ghostW = yn => yn < .3 ? Math.sin(yn / .3 * Math.PI / 2) : 1 - .42 * (yn - .3) / .7;
      const drawG = now => { if (!alive) return; requestAnimationFrame(drawG); if (now - lastG < 40) return; lastG = now; const t = (now - t0g) / 1000;
        R.fill(0); Gc.fill(0); B.fill(0);
        const ry = t * .55, cy = Math.cos(ry), sy = Math.sin(ry), tx = .16, cx2 = Math.cos(tx), sx2 = Math.sin(tx), RAD = 25;
        const P3 = V.map(([x, y, z]) => { const X = cy * x + sy * z, Z = -sy * x + cy * z, Y = cx2 * y - sx2 * Z, Z2 = sx2 * y + cx2 * Z, k = 1 / (1 + Z2 * .18); return [C + X * RAD * k, C + Y * RAD * k, Z2]; });
        // shell edges: back edges dim, front edges bright
        E.forEach(([a, b]) => { const A = P3[a], Bp = P3[b], L = Math.hypot(Bp[0] - A[0], Bp[1] - A[1]), n = Math.ceil(L * 1.4);
          for (let k = 0; k <= n; k++) { const u = k / n, z = A[2] + (Bp[2] - A[2]) * u, a2 = z < 0 ? .95 : .32; add(A[0] + (Bp[0] - A[0]) * u, A[1] + (Bp[1] - A[1]) * u, 60, 190, 200, a2 / 1.4); } });
        // the ghost: rounded crown, gentle taper, three tatters at the hem, swaying; eyes dark
        const bob = Math.sin(t * .6 * 2) * 1.2, GH = 26, G0 = C - 13 + bob;
        for (let j = 0; j < GH; j++) { const yn = j / (GH - 1), hw = 9.5 * ghostW(yn), sw = 1.6 * yn * Math.sin(t * 1.8 + yn * 4);
          for (let i = -11; i <= 11; i++) { const xn = i / 9.5; if (Math.abs(i) > hw) continue; const hem = .8 + .2 * (.5 + .5 * Math.cos(xn * Math.PI * 3)); if (yn > hem) continue;
            const X = Math.round(C + i + sw), Y = Math.round(G0 + j); if (X < 0 || Y < 0 || X >= N || Y >= N) continue;
            const eye = yn > .2 && yn < .36 && (Math.abs(i + 3.5) < 1.6 || Math.abs(i - 3.5) < 1.6), idx = Y * N + X;
            if (eye) { R[idx] = 8; Gc[idx] = 30; B[idx] = 40; continue; }
            const th = BAYER[(Y & 3) * 4 + (X & 3)] / 16, fl = .82 + .14 * Math.sin(t * 5 + i * 1.7 + j * .9), edge = Math.abs(i) > hw - 1.2 ? .25 : 0, a = Math.min(1, fl + edge + (1 - yn) * .25);
            if (th < a) { const hc = Math.max(0, 1 - Math.hypot(i, (j - 5) * 1.1) / 6); add(X, Y, 159 + 96 * hc, 212 + 43 * hc, 255, .85 + .15 * hc); } } }
        // hubs + data packets
        P3.forEach(([x, y, z]) => { const a = z < 0 ? 1 : .45; add(x, y, 125, 245, 236, a); add(x + 1, y, 125, 245, 236, a * .5); });
        PK.forEach(p => { const [a, b] = E[p.e], A = P3[a], Bp = P3[b], u = (((p.ph + t * p.sp) % 1) + 1) % 1; add(A[0] + (Bp[0] - A[0]) * u, A[1] + (Bp[1] - A[1]) * u, 182, 255, 245, (A[2] + Bp[2]) / 2 < 0 ? 1 : .5); });
        const d = img.data; for (let i = 0; i < N * N; i++) { const r = R[i], g = Gc[i], b = B[i], m = Math.max(r, g, b); if (m < 6) { d[i * 4 + 3] = 0; continue; } d[i * 4] = Math.min(255, r); d[i * 4 + 1] = Math.min(255, g); d[i * 4 + 2] = Math.min(255, b); d[i * 4 + 3] = 255; }
        px.putImageData(img, 0, 0); };
      requestAnimationFrame(drawG); }
    if (o.pixel === 'sun') { // The Sun: a mini pixel white sun — boiling plasma, bright filaments, flickering corona rays streaming outward, plasma tongues at the limb
      el.classList.add('psun'); const pc = el.querySelector('.pl-pp'); pc.width = pc.height = 72; const px = pc.getContext('2d'), N = 72, C = 35.5, R = 21, img = px.createImageData(N, N), t0s = performance.now(); let lastS = 0;
      const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
      const TONES = [[40, 42, 48], [92, 96, 106], [150, 154, 164], [196, 200, 208], [228, 230, 236], [246, 247, 250], [255, 255, 255]];
      const h2 = (x, y) => { let h = (x * 374761393 + y * 668265263) >>> 0; h = ((h ^ (h >>> 13)) * 1274126177) >>> 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
      const vn = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); const a = h2(xi, yi), b = h2(xi + 1, yi), c = h2(xi, yi + 1), d = h2(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
      const fb = (x, y) => .5 * vn(x, y) + .3 * vn(x * 2.1 + 5, y * 2.1 + 3) + .2 * vn(x * 4.3 + 9, y * 4.3 + 1);
      const drawS = now => { if (!alive) return; requestAnimationFrame(drawS); if (now - lastS < 60) return; lastS = now; const t = (now - t0s) / 1000, d = img.data, open = Math.min(1, t / 1.4);
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const i = (y * N + x) * 4, dx = (x - C) / R, dy = (y - C) / R, r = Math.hypot(dx, dy), th = BAYER[(y & 3) * 4 + (x & 3)] / 16; let lum = 0;
          if (r <= 1) { const mu = Math.sqrt(1 - r * r), u = dx / (mu + .6) * 3.2 + t * .25, v = dy / (mu + .6) * 3.2;
            const w = fb(u * .6 + t * .15, v * .6 - t * .12), g = fb(u * 2 + w * 2.5, v * 2 - w * 2 + t * .3), f = 1 - Math.abs(2 * fb(u + w * 3, v - t * .2) - 1);
            lum = (.62 + .3 * g + .35 * Math.pow(f, 6)) * (.7 + .3 * Math.pow(mu, .5)) + .25 * Math.pow(1 - mu, 3); }
          else { const a = Math.atan2(dy, dx), e = r - 1, ca = Math.cos(a), sa = Math.sin(a);
            const ray = fb(ca * 6 + 20, sa * 6 + e * 1.5 - t * .6), flame = fb(ca * 5 + 3, sa * 5 + 7 + e * 5 - t * 1.1);
            lum = .55 * Math.exp(-e * 9) + .5 * Math.pow(ray, 3) * Math.exp(-e * 1.6) + (flame - .42 - e * 2.6 > 0 ? .9 * Math.exp(-e * 6) : 0);
            if (r > 1.68) lum *= Math.max(0, 1 - (r - 1.68) / .06); }
          lum *= open; const k = Math.floor(lum * (TONES.length - .01) + (th - .5) * 1.1);
          if (k < 0 || lum < .06) { d[i + 3] = 0; continue; } const c = TONES[Math.min(TONES.length - 1, k)]; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; }
        px.putImageData(img, 0, 0); };
      requestAnimationFrame(drawS); }
    if (o.pixel === 'mark') { // Portals: the pixel P lettermark in Moonlight — it builds cell by cell, a light sweeps across it, specks twinkle around
      el.classList.add('pmark'); const pc = el.querySelector('.pl-pp'); pc.width = pc.height = 48; const px = pc.getContext('2d'), N = 48, U = 4, OX = 12, OY = 8, t0k = performance.now(); let lastK = 0;
      const P = ['11111.', '111111', '11..11', '11..11', '111111', '11111.', '11....', '11....'];
      const cells = []; P.forEach((r, j) => [...r].forEach((c, i) => { if (c === '1') cells.push([i, j]); }));
      const SP = Array.from({ length: 14 }, (_, i) => [(i * 37 + 5) % N, (i * 23 + 11) % N, i * 0.7]);
      const drawK = now => { if (!alive) return; requestAnimationFrame(drawK); if (now - lastK < 33) return; lastK = now; const t = (now - t0k) / 1000;
        px.clearRect(0, 0, N, N);
        SP.forEach(([x, y, ph]) => { const a = Math.max(0, Math.sin(t * 1.6 + ph)); if (a > .2 && (x < OX - 2 || x > OX + 25 || y < OY - 2 || y > OY + 33)) { px.fillStyle = 'rgba(232,236,204,' + (a * .6) + ')'; px.fillRect(x, y, 1, 1); } });
        const sweep = ((t * 0.45) % 1.6) * 60 - 20;
        cells.forEach(([i, j], k) => { const b = Math.min(1, Math.max(0, (t * 9 - k) / 3)); if (b <= 0) return;
          for (let yy = 0; yy < U; yy++) for (let xx = 0; xx < U; xx++) { const X = OX + i * U + xx, Y = OY + j * U + yy, d = Math.abs(X + Y * 0.6 - sweep), hi = Math.max(0, 1 - d / 7);
            const r = 232 + (250 - 232) * hi, g = 236 + (250 - 236) * hi, bl = 204 + (250 - 204) * hi, a = b * (0.78 + 0.22 * hi);
            px.fillStyle = 'rgba(' + (r | 0) + ',' + (g | 0) + ',' + (bl | 0) + ',' + a + ')'; px.fillRect(X, Y, 1, 1); } }); };
      requestAnimationFrame(drawK); }
    if (o.pixel === 'planet') { // GJ 504 b: a mini pixel gas giant — pink/magenta bands drifting with rotation, storm spot, lit limb, dark terminator, dithered shading
      el.classList.add('pplanet'); const pc = el.querySelector('.pl-pp'), px = pc.getContext('2d'), N = 44, R = 19.5, C = 21.5, img = px.createImageData(N, N), t0p = performance.now(); let lastP = 0;
      const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
      const BANDS = [[86, 18, 58], [150, 40, 104], [214, 86, 158], [255, 140, 196], [255, 186, 220], [255, 222, 238]];
      const LX = -.62, LY = -.42, LZ = .66;
      const drawP = now => { if (!alive) return; requestAnimationFrame(drawP); if (now - lastP < 70) return; lastP = now; const t = (now - t0p) / 1000, rot = t * .11, d = img.data;
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const i = (y * N + x) * 4, nx = (x - C) / R, ny = (y - C) / R, r2 = nx * nx + ny * ny; let c = null;
          if (r2 <= 1) { const nz = Math.sqrt(1 - r2), lat = Math.asin(ny), lon = Math.atan2(nx, nz) + rot;
            let b = Math.sin(lat * 7.5 + Math.sin(lon * 2 + lat * 3) * .35) * .5 + .5; b = .55 * b + .45 * (Math.sin(lat * 15 + lon * .7) * .5 + .5) * (.6 + .4 * Math.sin(lon * 3));
            const sl = (((lon % 6.283) + 6.283) % 6.283) - 3.6, sp = (sl * sl) / .22 + ((lat - .32) * (lat - .32)) / .012; if (sp < 1) b = sp < .4 ? .98 : .12;
            let lum = nx * LX + ny * LY + nz * LZ; lum = Math.max(0, lum); const rim = Math.pow(1 - nz, 3) * .35;
            const th = BAYER[(y & 3) * 4 + (x & 3)] / 16; let k = Math.floor((b * .55 + lum * .75 + rim) * (BANDS.length - .01) - .9 + th * .9);
            if (lum < .06) k = th < .35 && lum > .015 ? 0 : -1; k = Math.min(BANDS.length - 1, k); c = k < 0 ? [26, 6, 20] : BANDS[k]; }
          else { const r = Math.sqrt(r2); if (r < 1.12) { const lit = ((x - C) * LX + (y - C) * LY) / (r * R); if (lit > .15 && BAYER[(y & 3) * 4 + (x & 3)] / 16 < (1.12 - r) * 5 * lit) c = [120, 30, 84]; } }
          if (c) { d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; } else d[i + 3] = 0; }
        px.putImageData(img, 0, 0); };
      requestAnimationFrame(drawP); }
    if (mode === 'cursed') { // Cursed Energy: a mini pixel aura — structured blue flame (bright rim, dark heart, ice core, side tongues), red sparks, periodic black flash
      el.classList.add('cursed'); const cu = el.querySelector('.pl-cu'), cx = cu.getContext('2d'), CW = 32, CH = 40, M = new Uint8Array(CW * CH), D = new Uint8Array(CW * CH), img = cx.createImageData(CW, CH), sparks = [];
      const t0c = performance.now(); let lastC = 0;
      const lobe = (x, y, cxl, top, bot, wmax) => { const u = (y - top) / (bot - top); if (u < 0 || u > 1) return false; const w = wmax * Math.pow(u, .62) * (u < .78 ? 1 : Math.sqrt(Math.max(0, (1 - u) / .22))); return Math.abs(x - cxl) < w; };
      const drawC = now => { if (!alive) return; requestAnimationFrame(drawC); if (now - lastC < 55) return; lastC = now; const t = (now - t0c) / 1000;
        const sway = Math.sin(t * 1.6) * 1.4 + Math.sin(t * 3.7) * .5;
        for (let y = 0; y < CH; y++) { const j = Math.round(Math.sin(y * .7 + t * 9) * .6 + Math.sin(y * .31 - t * 5) * .5), lean = sway * Math.max(0, (30 - y) / 26);
          for (let x = 0; x < CW; x++) { const X = x - j - lean;
            M[y * CW + x] = (lobe(X, y, 15.5, 2 + Math.sin(t * 4) * .8, 38, 10.5) || lobe(X, y, 8.5, 11 + Math.sin(t * 5 + 1) * 1.2, 31, 3.6) || lobe(X, y, 22.5, 14 + Math.sin(t * 4.4 + 2) * 1.2, 32, 3.4) || lobe(X, y, 15.5, 7 + Math.sin(t * 6) * .8, 22, 2.2)) ? 1 : 0; } }
        D.fill(0); for (let i = 0; i < CW * CH; i++) if (M[i]) D[i] = 9;
        for (let pass = 1; pass <= 3; pass++) for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) { const i = y * CW + x; if (D[i] !== 9) continue; const nb = (xx, yy) => xx < 0 || yy < 0 || xx >= CW || yy >= CH ? 0 : D[yy * CW + xx]; if ([nb(x - 1, y), nb(x + 1, y), nb(x, y - 1), nb(x, y + 1)].some(v => v === pass - 1)) D[i] = pass; }
        if (Math.random() < .3) sparks.push({ x: 15.5 + sway * .6 + (Math.random() * 14 - 7), y: 22 - Math.random() * 14, v: 5 + Math.random() * 7, l: 1 });
        const flash = t > 1 && (t - 1) % 3.2 < .16, dd = img.data, ccx = 15.5 + sway * .25;
        for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) { const i = y * CW + x, d = D[i]; let c;
          if (!d) { const nearRim = (x > 0 && D[i - 1] === 1) || (x < CW - 1 && D[i + 1] === 1) || (y > 0 && D[i - CW] === 1) || (y < CH - 1 && D[i + CW] === 1); c = flash ? (nearRim ? [90, 8, 14] : [0, 0, 0]) : nearRim ? [22, 32, 96] : [10, 10, 10]; }
          else if (flash) c = d === 1 ? [255, 46, 56] : d === 2 ? [120, 10, 18] : [0, 0, 0];
          else { const core = ((x - ccx) / 3.2) ** 2 + ((y - 31) / 4.6) ** 2; const sw = .5 + .5 * Math.sin(y * .55 - t * 7 + Math.sin(x * .4 + t * 2) * 1.6);
            c = core < 1 ? (core < .35 ? [248, 252, 255] : [184, 214, 255]) : d === 1 ? [146, 184, 255] : d === 2 ? [70, 112, 238] : sw > .72 ? [40, 66, 176] : sw > .4 ? [22, 34, 112] : [12, 16, 62]; }
          dd[i * 4] = c[0]; dd[i * 4 + 1] = c[1]; dd[i * 4 + 2] = c[2]; dd[i * 4 + 3] = 255; }
        for (let k = sparks.length - 1; k >= 0; k--) { const sp = sparks[k]; sp.y -= sp.v * .055; sp.x += Math.sin(t * 6 + k) * .18; sp.l -= .04; if (sp.l <= 0 || sp.y < 0) { sparks.splice(k, 1); continue; } const px = Math.round(sp.x), py = Math.round(sp.y); if (px < 0 || px >= CW || D[py * CW + px]) continue; const j = (py * CW + px) * 4; dd[j] = flash ? 250 : 255; dd[j + 1] = flash ? 250 : 30 + 50 * sp.l; dd[j + 2] = flash ? 250 : 44; }
        cx.putImageData(img, 0, 0); };
      requestAnimationFrame(drawC); }
    const fill = el.querySelector('#pl-fill'), pc = el.querySelector('#pl-pc'), t0 = performance.now(); let loaded = false;
    addEventListener('load', () => { (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => loaded = true); });
    let wd = !o.waitFor, tw = 0; if (o.waitFor) o.waitFor.then(() => wd = true, () => wd = true);
    setTimeout(() => loaded = true, 9000);
    (function tick() { const e = performance.now() - t0; let p = Math.min(e / MIN, 1); if (!loaded) p = Math.min(p, .9); if (!wd) p = Math.min(p, .9 * (1 - Math.exp(-e / (o.expectMs || 60000)))); else if (o.waitFor) { if (!tw) tw = e; p = Math.max(p, Math.min(1, .9 + (e - tw) / 900)); } const v = Math.round(p * 100); fill.style.width = v + '%'; pc.textContent = 'ENTERING THE PORTAL · ' + v + '%'; if (p >= 1 && loaded && wd) { el.classList.add('out'); setTimeout(() => { alive = false; el.remove(); }, 1000); } else requestAnimationFrame(tick); })();
  }
  g.PortalLoader = { mount };
})(window);
