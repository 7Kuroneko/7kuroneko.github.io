/* ============================================================================
 * FOCUSFIELD · CURSED ENERGY — soundscape v6 · "BLACK FROST · B♭ phrygian"
 * v6 (darker than v5): Phrygian colours (♭2 C♭, ♭6 G♭) instead of the bright
 *   pentatonic 9th, voiced an octave lower; darker arc (550 → 1400 Hz), darker
 *   and longer hall, lower breath, glass pulled down to D♭5 · F5, deeper sub,
 *   and a faint low B♭/E (tritone) undertone that only rises before a flash.
 * ----------------------------------------------------------------------------
 * Built on the recipe of a cold, deep-space soundfield (measured from a
 * reference: a sub that steps between neighbouring whole tones, a cold wide
 * minor cloud tuned ~30 ¢ sharp, a faint breathing texture in the 250–800 Hz
 * band, glassy highs that swell over ~85 s, a ~17-minute bloom, nothing
 * struck). Composed from scratch and LOCKED TO THE PICTURE:
 *   · before every BLACK FLASH the sound draws in with the aura (9 s): the
 *     cloud thins and darkens while the texture inhales
 *   · at the flash: a soft low drop (80 → 32 Hz, 0.25 s attack — no hit) and
 *     a dark half-step cluster that glides into the root; then the cloud
 *     blooms back open
 *   · build-up under the intro card, full before the Oracle (0:15)
 * UNIQUE PALETTE — B♭ MINOR pentatonic + 9 at A = 448 Hz (the cold +30 ¢
 *   tuning), whole-tone sub steps G♭ · A♭ · B♭.
 *   DEPTH    pure sines ×1 ×2 ×3 on the step, 8 s crossfades, mono, clean.
 *   VEIL     9 static notes F3–E♭5, two voices each (soft wave), hard L/R at
 *            ±9 ¢ — wide and cold, no in-ear beating. Re-voices every 45 s.
 *            Lowpass arc 1100 → 2500 → 1100 Hz over each 1020 s cycle.
 *   BREATH   seeded stereo noise through 250–800 Hz band-passes, very low,
 *            swelling on 128 s and inhaling before each flash.
 *   GLASS    sines F5 · A♭5 · C6 on 85 s swells.
 *   SPACE    10 s dark hall, gentle glue, translation EQ, trim + limiter
 *            (true peak ≤ −1 dBTP). No saturation.
 * Everything is a pure function of video time (+ the flash list), so
 * start({at}) lands exactly where the picture is and export is one pass.
 * API (same as v4): start({at,endAt}) · stop() · setFlashes([{t,k,pan}])
 *   · position() · setMuted(b) · setVolume(v) · isMuted() · resumeIfPending(at)
 *   · renderOffline(sec, vol, onProgress, shouldCancel)
 * ==========================================================================*/
window.CursedAudio = (function () {
  const A4 = 448, hz = m => A4 * Math.pow(2, (m - 69) / 12);
  const CYCLE = 1020, VOICE_STEP = 45, BLOCK = 10, LOOKAHEAD = 3, END_FADE = 9, DRAW = 9, XF = 0.7;
  const LV = { sub: 0.13, pad: 0.06, breath: 0.03, glass: 0.018, flash: 0.24, under: 0.05, trim: 0.66 };
  const MIX = { dry: 0.52, wet: 0.72, hallHi: 0.1 };
  const PAD = [[46, 0.8], [53, 0.9], [58, 1.0], [59, 0.22], [61, 0.75], [65, 0.55], [66, 0.32], [70, 0.35]];   // B♭2 F3 B♭3 C♭4(♭2) D♭4 F4 G♭4(♭6) B♭4
  const GLASS = [[73, 1.0, 0], [77, 0.7, 2.1], [70, 0.5, 4.2]];                                                      // D♭5 F5 B♭4 (phase)
  const STEPS = [30, 32, 34];                                                                                         // G♭1 A♭1 B♭1 (with a lower octave sine)
  const STAGE = { sub: [0, 6], pad: [2, 12], breath: [6, 16], glass: [12, 26] };
  const seeded = k => { let s = (k * 2654435761) >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0, s / 4294967296); };
  const rc = u => Math.sin(Math.max(0, Math.min(1, u)) * Math.PI / 2) ** 2;
  const stage = (t, [s, e]) => t <= s ? 0 : t >= e ? 1 : rc((t - s) / (e - s));

  // ---------------------------------------------------------------- score (pure functions of video time)
  let RIP = [];                                         // black-flash list from the picture: [{t, k, pan}]
  function nearestFlash(t) { let lo = 0, hi = RIP.length - 1, best = null; while (lo <= hi) { const m = (lo + hi) >> 1; if (RIP[m].t < t - 12) lo = m + 1; else { best = RIP[m]; hi = m - 1; } } return best; }
  // draw-in before a flash (0 → 1 over DRAW s), release after (1 → 0 over 6 s); bloom = small overshoot after
  function flashState(t) { const f = nearestFlash(t); if (!f) return { draw: 0, bloom: 0 }; const d = t - f.t; if (d < -DRAW || d > 12) return { draw: 0, bloom: 0 }; if (d <= 0) return { draw: rc((d + DRAW) / DRAW), bloom: 0 }; return { draw: 1 - rc(d / 6), bloom: Math.sin(Math.PI * Math.min(1, d / 12)) }; }
  const subCache = new Map();
  function subCycle(c) {
    if (subCache.has(c)) return subCache.get(c);
    const r = seeded(c * 733 + 9), ev = []; let t = 0, k = c === 0 ? 2 : subCycle(c - 1).lastK;
    while (t < CYCLE) { const d = 22 + r() * 14; ev.push({ id: `d${c}_${ev.length}`, start: c * CYCLE + t, dur: Math.min(d, CYCLE - t) + 8, f: hz(STEPS[k]) }); ev.lastK = k; t += d; k = k === 0 ? 1 : k === 2 ? 1 : (r() < 0.5 ? 0 : 2); }
    subCache.set(c, ev); return ev;
  }
  function subEvents(t1, t2) { const out = []; for (let c = Math.max(0, Math.floor((t1 - 50) / CYCLE)); c <= Math.floor(t2 / CYCLE); c++) for (const e of subCycle(c)) if (e.start < t2 && e.start + e.dur > t1) out.push(e); return out; }
  const subEnv = (e, t) => { const x = t - e.start; return rc(x / 8) * rc((e.dur - x) / 8); };
  function session(j) { const r = seeded(j * 41 + 5); return PAD.map(([, w]) => w * (r() < 0.15 ? 0.35 : 0.7 + 0.3 * r())); }
  function padWeight(i, t) { let w = 0; const j0 = Math.floor(t / VOICE_STEP); for (let j = j0 - 1; j <= j0 + 1; j++) { const x = t - (j * VOICE_STEP - 11.25); if (x > 0 && x < 67.5) w += session(j)[i] * rc(x / 22.5) * rc((67.5 - x) / 22.5); } return w; }
  const ARC = [[0, 650], [0.2, 720], [0.55, 1400], [0.85, 820], [0.95, 560], [1, 650]];
  function arcAt(t) { const p = ((t % CYCLE) + CYCLE) % CYCLE / CYCLE; for (let i = 1; i < ARC.length; i++) if (p <= ARC[i][0]) { const [p0, v0] = ARC[i - 1], [p1, v1] = ARC[i], u = (p - p0) / (p1 - p0); return v0 + (v1 - v0) * (1 - Math.cos(u * Math.PI)) / 2; } return ARC[0][1]; }
  const padCut = t => { const f = flashState(t); return Math.max(260, arcAt(t) * (1 - 0.45 * f.draw) * (1 + 0.2 * f.bloom)); };
  const padLevel = t => { const f = flashState(t); return LV.pad * stage(t, STAGE.pad) * (0.88 + 0.12 * (arcAt(t) - 560) / 840) * (1 + 0.12 * Math.sin(2 * Math.PI * t / 128)) * (1 - 0.3 * f.draw) * (1 + 0.15 * f.bloom); };
  const subLevel = t => LV.sub * stage(t, STAGE.sub) * (0.8 + 0.2 * Math.sin(2 * Math.PI * t / 64)) * (1 - 0.2 * flashState(t).draw);
  const breathLevel = t => LV.breath * stage(t, STAGE.breath) * (0.55 + 0.45 * (0.5 + 0.5 * Math.sin(2 * Math.PI * t / 128 + 1))) * (1 + 1.6 * flashState(t).draw);
  const glassLevel = (i, t) => LV.glass * GLASS[i][1] * stage(t, STAGE.glass) * (0.15 + 0.85 * (0.5 + 0.5 * Math.sin(2 * Math.PI * t / 85 + GLASS[i][2]))) * (1 - 0.5 * flashState(t).draw);
  const drift = (i, t) => 4 * Math.sin(2 * Math.PI * t / (27 + 3 * i) + i * 1.3);

  // ---------------------------------------------------------------- graph
  const waveCache = new WeakMap();
  function coldWave(c) { if (waveCache.has(c)) return waveCache.get(c); const a = [0, 1, 0.28, 0.16, 0.05, 0.035, 0.01], w = c.createPeriodicWave(new Float32Array(a.length), new Float32Array(a)); waveCache.set(c, w); return w; }
  const noiseCache = new WeakMap();
  function noiseBuf(c) { if (noiseCache.has(c)) return noiseCache.get(c); const sr = c.sampleRate, L = Math.floor(sr * 37.3), b = c.createBuffer(2, L, sr); for (let ch = 0; ch < 2; ch++) { const r = seeded(91 + ch * 7), d = b.getChannelData(ch); for (let i = 0; i < L; i++) d[i] = r() * 2 - 1; } noiseCache.set(c, b); return b; }
  function hallIR(c) { const sr = c.sampleRate, L = Math.floor(sr * 11), buf = c.createBuffer(2, L, sr); for (let ch = 0; ch < 2; ch++) { const r = seeded(67 + ch * 23), d = buf.getChannelData(ch); let lp = 0; for (let i = 0; i < L; i++) { const t = i / sr, w = r() * 2 - 1; lp += 0.1 * (w - lp); const hi = w - lp; d[i] = (lp * Math.exp(-6.9 * t / 10) + hi * MIX.hallHi * Math.exp(-6.9 * t / 4)) * (t < 0.05 ? 0.25 : 1) * (1 - Math.exp(-t * 20)); } } return buf; }
  function makeGraph(c) {
    const master = c.createGain(); master.gain.value = 0.0001;
    const endFade = c.createGain(); endFade.gain.value = 1;
    const lim = c.createDynamicsCompressor(); lim.threshold.value = -3; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.002; lim.release.value = 0.25;
    const trim = c.createGain(); trim.gain.value = LV.trim;
    const ceil = c.createBiquadFilter(); ceil.type = 'lowpass'; ceil.frequency.value = 4500; ceil.Q.value = 0.5;
    const body = c.createBiquadFilter(); body.type = 'peaking'; body.frequency.value = 420; body.Q.value = 0.7; body.gain.value = 3;
    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 24; hp.Q.value = 0.6;
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -12; comp.knee.value = 12; comp.ratio.value = 1.6; comp.attack.value = 0.25; comp.release.value = 1.5;
    const bus = c.createGain(), dry = c.createGain(), wet = c.createGain(), pre = c.createDelay(0.1); dry.gain.value = MIX.dry; wet.gain.value = MIX.wet; pre.delayTime.value = 0.03;
    const hall = c.createConvolver(); hall.buffer = hallIR(c);
    bus.connect(dry).connect(comp); bus.connect(pre).connect(hall).connect(wet).connect(comp);
    comp.connect(hp).connect(body).connect(ceil).connect(trim).connect(lim).connect(endFade).connect(master).connect(c.destination);
    const srcs = [];
    const subBus = c.createGain(); subBus.gain.value = 0.0001; subBus.connect(comp); const subHall = c.createGain(); subHall.gain.value = 0.15; subBus.connect(subHall).connect(pre);
    const padLP = c.createBiquadFilter(); padLP.type = 'lowpass'; padLP.frequency.value = 800; padLP.Q.value = 0.3;
    const padBus = c.createGain(); padBus.gain.value = 0.0001; padBus.connect(padLP).connect(bus);
    const wave = coldWave(c), padGains = [], padOsc = [];
    PAD.forEach(([m], i) => { const g = c.createGain(); g.gain.value = 0.0001; g.connect(padBus); padGains.push(g);
      [[-0.95, -9], [0.95, 9]].forEach(([pan, cents], k) => { const o = c.createOscillator(), p = c.createStereoPanner(); o.setPeriodicWave(wave); o.frequency.value = hz(m); o.detune.value = cents; p.pan.value = pan; o.connect(p).connect(g); o.start(); srcs.push(o); padOsc.push({ o, i: i * 2 + k, base: cents }); }); });
    // BREATH: independent L/R noise through cold band-passes
    const breathBus = c.createGain(); breathBus.gain.value = 0.0001; breathBus.connect(bus);
    const nz = c.createBufferSource(); nz.buffer = noiseBuf(c); nz.loop = true; const split = c.createChannelSplitter(2), merge = c.createChannelMerger(2); nz.connect(split);
    [[0, 210], [1, 300]].forEach(([ch, f]) => { const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 0.9; const lp2 = c.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = 600; split.connect(bp, ch); bp.connect(lp2).connect(merge, 0, ch); });
    merge.connect(breathBus); nz.start(); srcs.push(nz);
    const glassBus = c.createGain(); glassBus.gain.value = 1; glassBus.connect(bus); const glassGains = [];
    GLASS.forEach(([m], i) => { const o = c.createOscillator(), g = c.createGain(), p = c.createStereoPanner(); o.type = 'sine'; o.frequency.value = hz(m); g.gain.value = 0.0001; p.pan.value = [-0.7, 0.7, 0][i]; o.connect(g).connect(p).connect(glassBus); o.start(); srcs.push(o); glassGains.push(g); });
    // UNDER: a faint low B♭1 / E2 tritone that only rises in the draw-in before a flash
    const underBus = c.createGain(); underBus.gain.value = 0.0001; underBus.connect(comp); const underWet = c.createGain(); underWet.gain.value = 0.3; underBus.connect(underWet).connect(pre);
    [[34, 1, -0.3], [40, 0.6, 0.3]].forEach(([m, a, pn]) => { const o = c.createOscillator(), g = c.createGain(), p = c.createStereoPanner(); o.setPeriodicWave(wave); o.frequency.value = hz(m); g.gain.value = a; p.pan.value = pn; o.connect(g).connect(p).connect(underBus); o.start(); srcs.push(o); });
    const flashBus = c.createGain(); flashBus.gain.value = LV.flash; flashBus.connect(comp); const flashWet = c.createGain(); flashWet.gain.value = 0.5; flashBus.connect(flashWet).connect(pre);
    return { c, master, endFade, subBus, padBus, padLP, padGains, padOsc, breathBus, glassGains, flashBus, underBus, srcs, done: new Set() };
  }
  function curve(param, fn, origin, s, e, step) { s += 0.0005; if (e - s < 0.02) return; const n = Math.max(2, Math.ceil((e - s) / (step || 0.25)) + 1), v = new Float32Array(n); for (let k = 0; k < n; k++) v[k] = fn(s - origin + (e - s) * k / (n - 1)); try { param.setValueCurveAtTime(v, s, e - s); } catch (err) { try { param.linearRampToValueAtTime(v[n - 1], e); } catch (e2) {} } }
  function playSub(G, e, origin, from) { const c = G.c, s = Math.max(origin + e.start, from), end = origin + e.start + e.dur; if (end <= s + 0.05) return; const env = c.createGain(); env.gain.value = 0; env.connect(G.subBus); curve(env.gain, t => subEnv(e, t), origin, s, end, 0.25);
    [[0.5, 0.45], [1, 1.0], [2, 0.5], [3, 0.15]].forEach(([h, a]) => { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = e.f * h; g.gain.value = a; o.connect(g).connect(env); o.start(s); o.stop(end + 0.1); G.srcs.push(o); }); }
  // BLACK FLASH: a soft low drop + a dark half-step cluster gliding into the root (no transient)
  function playFlash(G, f, origin, from) {
    const c = G.c, tf = origin + f.t; if (tf + 9 < from) return; const s = Math.max(tf, from);
    const p = c.createStereoPanner(); p.pan.value = Math.max(-0.6, Math.min(0.6, (f.pan || 0) * 0.6)); p.connect(G.flashBus);
    const dr = c.createOscillator(), dg = c.createGain(); dr.type = 'sine'; dr.frequency.setValueAtTime(70, tf); dr.frequency.exponentialRampToValueAtTime(27, tf + 3);
    dg.gain.setValueAtTime(0.0001, tf); dg.gain.linearRampToValueAtTime(0.8, tf + 0.25); dg.gain.setTargetAtTime(0.0001, tf + 0.6, 1.2); dr.connect(dg).connect(p); dr.start(s); dr.stop(tf + 7); G.srcs.push(dr);
    const root = 46; [[root + 1, root, 0.4], [root, root, 0.45], [root + 12, root + 12, 0.25]].forEach(([a, b, l]) => {
      const o = c.createOscillator(), g = c.createGain(); o.setPeriodicWave(coldWave(c)); o.frequency.setValueAtTime(hz(a), tf); o.frequency.setTargetAtTime(hz(b), tf + 1.2, 1.1);
      g.gain.setValueAtTime(0.0001, tf); g.gain.linearRampToValueAtTime(l, tf + 1.4); g.gain.setTargetAtTime(0.0001, tf + 2.5, 2); o.connect(g).connect(p); o.start(s); o.stop(tf + 14); G.srcs.push(o); });
  }
  function scheduleWindow(G, origin, a, b, from) {
    for (const e of subEvents(a, b)) { if (G.done.has(e.id)) continue; G.done.add(e.id); playSub(G, e, origin, from); }
    for (const f of RIP) { if (f.t < a - 9 || f.t >= b) continue; const id = 'f' + f.t.toFixed(3); if (G.done.has(id)) continue; G.done.add(id); playFlash(G, f, origin, from); }
    const s = Math.max(origin + a, from), e = origin + b;
    curve(G.subBus.gain, subLevel, origin, s, e, 0.25); curve(G.padBus.gain, padLevel, origin, s, e, 0.25); curve(G.padLP.frequency, padCut, origin, s, e, 0.25);
    curve(G.breathBus.gain, breathLevel, origin, s, e, 0.25);
    curve(G.underBus.gain, t => Math.max(0.0001, LV.under * stage(t, STAGE.pad) * (0.15 + 0.85 * flashState(t).draw)), origin, s, e, 0.25);
    G.glassGains.forEach((g, i) => curve(g.gain, t => Math.max(0.0001, glassLevel(i, t)), origin, s, e, 0.5));
    G.padGains.forEach((g, i) => curve(g.gain, t => Math.max(0.0001, padWeight(i, t)), origin, s, e, 0.5));
    G.padOsc.forEach(p => curve(p.o.detune, t => p.base + drift(p.i, t), origin, s, e, 0.5));
  }

  // ---------------------------------------------------------------- live transport
  let liveCtx = null, G = null, built = false, running = false, pending = false, muted = false, volume = 0.8, origin = 0, nextT = 0, timer = null, lastOpts = {}, gen = 0;
  const now = () => liveCtx.currentTime, pos = () => now() - origin, target = () => muted ? 0.0001 : Math.max(0.0001, volume);
  function tick() { if (!G) return; const h = now() - origin + LOOKAHEAD; while (nextT < h) { scheduleWindow(G, origin, nextT, nextT + BLOCK, now() + 0.03); nextT += BLOCK; } }
  function build(at) {
    if (built) return;
    if (!liveCtx || liveCtx.state === 'closed') { const AC = window.AudioContext || window.webkitAudioContext; liveCtx = new AC({ latencyHint: 'playback' }); }
    at = Math.max(0, at || 0); G = makeGraph(liveCtx); origin = now() + 0.1 - at;
    const first = Math.ceil((at + 0.001) / BLOCK) * BLOCK; scheduleWindow(G, origin, at, first, now() + 0.05); nextT = first; built = true;
  }
  function scheduleEndFade(endAt) { if (!(endAt > 0) || !G) return; const g = G.endFade.gain, t = now(), p = pos(), fs = endAt - END_FADE; g.cancelScheduledValues(t);
    g.setValueAtTime(p >= endAt ? 0.0001 : p > fs ? Math.max(0.0001, Math.sin(Math.PI / 2 * (endAt - p) / END_FADE) ** 2) : 1, t);
    if (p < endAt) { const s = Math.max(t + 0.01, origin + fs), n = 48, v = new Float32Array(n); for (let i = 0; i < n; i++) { const x = (s - origin + (origin + endAt - s) * i / (n - 1)); v[i] = Math.max(0.0001, Math.sin(Math.PI / 2 * Math.min(1, Math.max(0, (endAt - x) / END_FADE))) ** 2); } try { g.setValueCurveAtTime(v, s, origin + endAt - s); } catch (e) {} } }
  function start(opts) {
    opts = opts || {}; lastOpts = opts; const at = typeof opts.at === 'number' ? Math.max(0, opts.at) : 0; const my = ++gen;
    if (built && Math.abs(pos() - at) > 0.25) teardown();
    build(at);
    Promise.resolve(liveCtx.resume ? liveCtx.resume() : null).then(() => {
      if (my !== gen) return;                                            // paused (or restarted) before the context woke: don't ramp back up
      pending = false; if (Math.abs(pos() - at) > 0.25) { teardown(); build(at); }
      if (!timer) timer = setInterval(tick, 250); running = true; tick(); scheduleEndFade(opts.endAt);
      const t = now(), g = G.master.gain; g.cancelScheduledValues(t); g.setValueAtTime(Math.max(0.0001, g.value), t);
      if (pos() < 2) g.exponentialRampToValueAtTime(target(), t + 1.5); else g.linearRampToValueAtTime(target(), t + XF);
    }).catch(() => { pending = true; });
  }
  function teardown() {
    if (!built || !G) { built = false; return; } const old = G, t = now();
    try { old.master.gain.cancelScheduledValues(t); old.master.gain.setValueAtTime(Math.max(0.0001, old.master.gain.value), t); old.master.gain.linearRampToValueAtTime(0, t + XF); } catch (e) {}
    if (timer) { clearInterval(timer); timer = null; }
    setTimeout(() => { old.srcs.forEach(n => { try { n.stop(); } catch (e) {} }); try { old.master.disconnect(); } catch (e) {} }, XF * 1000 + 150);
    built = false; running = false; G = null;
  }
  function stop() { gen++; pending = false; if (!built) return; running = false; const t = now(), g = G.master.gain; g.cancelScheduledValues(t); g.setValueAtTime(Math.max(0.0001, g.value), t); g.exponentialRampToValueAtTime(0.0001, t + 2.4); }
  function ramp(sec) { if (built && running) { const t = now(), g = G.master.gain; g.cancelScheduledValues(t); g.setValueAtTime(Math.max(0.0001, g.value), t); g.exponentialRampToValueAtTime(target(), t + sec); } }
  function setMuted(m) { muted = !!m; ramp(0.5); }
  function setVolume(v) { volume = Math.max(0, Math.min(1, v)); if (!muted) ramp(0.3); }
  function setFlashes(list) { RIP = (list || []).slice().sort((a, b) => a.t - b.t); }
  function resumeIfPending(at) { if (pending) start(typeof at === 'number' ? { at, endAt: lastOpts.endAt } : lastOpts); }

  // ---------------------------------------------------------------- offline export: one seamless pass
  async function renderOffline(durationSec, vol, onProgress, shouldCancel) {
    const rate = 48000, tail = 5, total = Math.ceil(rate * (durationSec + tail)), oc = new OfflineAudioContext(2, total, rate), g = makeGraph(oc);
    const peak = Math.max(0.0002, vol == null ? volume : vol);
    for (let t = 0; t < durationSec; t += BLOCK) scheduleWindow(g, 0, t, Math.min(t + BLOCK, durationSec), 0);
    g.master.gain.setValueAtTime(peak, 0);
    const fs = Math.max(1, durationSec - END_FADE), n = 64, fc = new Float32Array(n); for (let i = 0; i < n; i++) fc[i] = Math.max(0.0001, peak * Math.cos(i / (n - 1) * Math.PI / 2) ** 2);
    g.master.gain.setValueCurveAtTime(fc, fs, durationSec - 0.05 - fs);
    if (typeof oc.suspend === 'function') { const step = 15; for (let t = step; t < durationSec + tail; t += step) oc.suspend(t).then(async () => { if (onProgress) { try { onProgress(t / (durationSec + tail)); } catch (e) {} } if (!(shouldCancel && shouldCancel())) await new Promise(r => setTimeout(r, 0)); oc.resume(); }); }
    const buf = await oc.startRendering(); if (onProgress) onProgress(1); return buf;
  }
  return { start, stop, setFlashes, setMuted, setVolume, resumeIfPending, isMuted: () => muted, renderOffline,
    position: () => (built && running ? pos() - ((liveCtx.outputLatency || liveCtx.baseLatency || 0) + 0.04) : null) };
})();
