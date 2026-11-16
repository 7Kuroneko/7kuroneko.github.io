/* ============================================================================
 * FOCUSFIELD · DIVINE ENERGY — soundscape v7 · "LUMEN VIGIL"
 * ----------------------------------------------------------------------------
 * Built on the recipe of a deep, ethereal soundfield (measured from a
 * reference: a slow-swelling sub on the root and fourth, a very wide open pad
 * of softly detuned voices, brightness that blooms and recedes over ~12 min,
 * breathing every few seconds, nothing struck). Composed from scratch, and
 * LOCKED TO THE PICTURE:
 *   · the shimmer breathes with the core (sin(0.95·t) → every 6.61 s)
 *   · the pad brightens once per field rotation (40 s) and re-voices on it
 *   · the sub swells every 4 core breaths (26.5 s)
 *   · build-up over the intro card, full by the Oracle (0:16)
 *
 * UNIQUE PALETTE — key C AEOLIAN (open sus/add9 colours: C · D · G · B♭),
 *   tuned A = 444 Hz so C5 = 528 Hz and G4 = 396 Hz exactly (solfeggio) —
 *   both held in the pad for the whole session.
 *   SUB     pure sines on the root (×1 ×2 ×3) walking C · F · A♭ · G every
 *           60–96 s with 12 s crossfades; mono, no detune.
 *   PAD     8 static notes C3–D5, each two voices (soft 5-harmonic wave)
 *           hard L/R at ±7 ¢ with a slow ±4 ¢ drift — wide, no fast beating.
 *           Voicing re-weights every rotation (40 s, 20 s crossfades); one
 *           lowpass arc 850 → 2000 → 850 Hz per 708 s cycle is the bloom.
 *   SHIMMER sines G5 · C6 (=2×528) · D6 · G6 · C7, pulsing with the core.
 *   SPACE   10 s dark hall, gentle glue, translation EQ (body at 400 Hz),
 *           trim + limiter (true peak ≤ −1 dBTP), no saturation, no noise.
 *
 * Everything is a pure function of video time, so start({at}) lands exactly
 * where the picture is and the offline export is one seamless pass.
 * API (same as v5): start({at}) / stop() / reset() / position() / setMuted(b)
 *   / setVolume(v) / resumeIfPending(at) / prime() / prewarm() / isRunning()
 *   / kick(at) / renderOffline(dur, gain, onProgress) / setOutro(k) / isMuted()
 * ==========================================================================*/
window.DivineAudio = (function () {
  // ---------------------------------------------------------------- constants
  const A4 = 444, hz = m => A4 * Math.pow(2, (m - 69) / 12);
  const CORE_W = 0.95, CORE_T = 2 * Math.PI / CORE_W;   // the picture's core breath (6.61 s)
  const ROT = 40;                                        // the picture's rotation period (s)
  const CYCLE = 708;                                     // bloom cycle (11.8 min)
  const BLOCK = 10, LOOKAHEAD = 3, FADE_OUT = 9;
  const LV = { sub: 0.16, pad: 0.06, shimmer: 0.03, trim: 0.75 };
  const MIX = { dry: 0.62, wet: 0.6, hallHi: 0.25 };
  const PAD = [[48, 1.0], [55, 0.9], [60, 0.8], [62, 0.62], [67, 0.6], [70, 0.34], [72, 0.45], [74, 0.28]];   // C3 G3 C4 D4 G4(396) B♭4 C5(528) D5
  const SHIM = [[79, 1.0], [84, 0.7], [86, 0.45], [91, 0.22], [96, 0.14]];                                                          // G5 C6(1056) D6
  const ROOTS = { C: 24, F: 29, Ab: 32, G: 31 }, NEXT = { C: ['F', 'Ab', 'G'], F: ['C', 'Ab', 'G'], Ab: ['F', 'G', 'C'], G: ['C', 'Ab'] };
  const STAGE = { sub: [0, 6], pad: [2, 12], shimmer: [10, 22] };
  const seeded = k => { let s = (k * 2654435761) >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0, s / 4294967296); };
  const rc = u => Math.sin(Math.max(0, Math.min(1, u)) * Math.PI / 2) ** 2;
  const stage = (t, [s, e]) => t <= s ? 0 : t >= e ? 1 : rc((t - s) / (e - s));

  // ---------------------------------------------------------------- score (pure functions of video time)
  const subCache = new Map();
  function subCycle(c) {
    if (subCache.has(c)) return subCache.get(c);
    const r = seeded(c * 911 + 3), ev = []; let t = 0;
    let root = c === 0 ? 'C' : (o => o[Math.floor(r() * o.length)])(NEXT[subCycle(c - 1).last]);
    while (t < CYCLE) { const d = 60 + r() * 36; ev.push({ id: `s${c}_${ev.length}`, start: c * CYCLE + t, dur: Math.min(d, CYCLE - t) + 12, f: hz(ROOTS[root]) }); ev.last = root; t += d; const o = NEXT[root]; root = o[Math.floor(r() * o.length)]; }
    subCache.set(c, ev); return ev;
  }
  function subEvents(t1, t2) { const out = []; for (let c = Math.max(0, Math.floor((t1 - 110) / CYCLE)); c <= Math.floor(t2 / CYCLE); c++) for (const e of subCycle(c)) if (e.start < t2 && e.start + e.dur > t1) out.push(e); return out; }
  const subEnv = (e, t) => { const x = t - e.start; return rc(x / 12) * rc((e.dur - x) / 12); };
  function session(j) { const r = seeded(j * 37 + 11); return PAD.map(([, w]) => w * (r() < 0.15 ? 0.35 : 0.72 + 0.28 * r())); }
  function padWeight(i, t) { let w = 0; const j0 = Math.floor(t / ROT); for (let j = j0 - 1; j <= j0 + 1; j++) { const x = t - (j * ROT - 10); if (x > 0 && x < 60) w += session(j)[i] * rc(x / 20) * rc((60 - x) / 20); } return w; }
  const ARC = [[0, 850], [0.2, 950], [0.55, 2000], [0.85, 1150], [0.95, 780], [1, 850]];
  function arcAt(t) { const p = ((t % CYCLE) + CYCLE) % CYCLE / CYCLE; for (let i = 1; i < ARC.length; i++) if (p <= ARC[i][0]) { const [p0, v0] = ARC[i - 1], [p1, v1] = ARC[i], u = (p - p0) / (p1 - p0); return v0 + (v1 - v0) * (1 - Math.cos(u * Math.PI)) / 2; } return ARC[0][1]; }
  const padCut = t => Math.max(350, arcAt(t) + 220 * Math.sin(2 * Math.PI * t / ROT));
  const padLevel = t => LV.pad * stage(t, STAGE.pad) * (0.88 + 0.12 * (arcAt(t) - 780) / 1220) * (1 + 0.1 * Math.sin(2 * Math.PI * t / ROT));
  const subLevel = t => LV.sub * stage(t, STAGE.sub) * (0.62 + 0.38 * (0.5 + 0.5 * Math.cos(2 * Math.PI * t / (4 * CORE_T))));
  const shimLevel = t => LV.shimmer * stage(t, STAGE.shimmer) * (0.2 + 0.8 * (0.5 + 0.5 * Math.sin(CORE_W * t)) ** 1.5) * (0.6 + 0.4 * (arcAt(t) - 780) / 1220);
  const drift = (i, t) => 4 * Math.sin(2 * Math.PI * t / (23 + 3 * i) + i * 1.7);

  // ---------------------------------------------------------------- graph (one per context)
  const waveCache = new WeakMap();
  function warmWave(c) { if (waveCache.has(c)) return waveCache.get(c); const a = [0, 1, 0.33, 0.13, 0.05, 0.02], w = c.createPeriodicWave(new Float32Array(a.length), new Float32Array(a)); waveCache.set(c, w); return w; }
  function hallIR(c) {
    const sr = c.sampleRate, L = Math.floor(sr * 11), buf = c.createBuffer(2, L, sr);
    for (let ch = 0; ch < 2; ch++) { const r = seeded(53 + ch * 19), d = buf.getChannelData(ch); let lp = 0; for (let i = 0; i < L; i++) { const t = i / sr, w = r() * 2 - 1; lp += 0.1 * (w - lp); const hi = w - lp; d[i] = (lp * Math.exp(-6.9 * t / 10) + hi * MIX.hallHi * Math.exp(-6.9 * t / 4)) * (t < 0.05 ? 0.25 : 1) * (1 - Math.exp(-t * 20)); } }
    return buf;
  }
  function makeGraph(c) {
    const master = c.createGain(); master.gain.value = 0.0001;               // volume / fades
    const outro = c.createGain(); outro.gain.value = 1;                      // live outro dim (setOutro)
    const lim = c.createDynamicsCompressor(); lim.threshold.value = -3; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.002; lim.release.value = 0.25;
    const trim = c.createGain(); trim.gain.value = LV.trim;
    const ceil = c.createBiquadFilter(); ceil.type = 'lowpass'; ceil.frequency.value = 6500; ceil.Q.value = 0.5;
    const body = c.createBiquadFilter(); body.type = 'peaking'; body.frequency.value = 400; body.Q.value = 0.7; body.gain.value = 3;   // translation: body for small speakers
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -12; comp.knee.value = 12; comp.ratio.value = 1.6; comp.attack.value = 0.25; comp.release.value = 1.5;
    const bus = c.createGain(), dry = c.createGain(), wet = c.createGain(), pre = c.createDelay(0.1); dry.gain.value = MIX.dry; wet.gain.value = MIX.wet; pre.delayTime.value = 0.03;
    const hall = c.createConvolver(); hall.buffer = hallIR(c);
    bus.connect(dry).connect(comp); bus.connect(pre).connect(hall).connect(wet).connect(comp);
    comp.connect(body).connect(ceil).connect(trim).connect(lim).connect(outro).connect(master).connect(c.destination);
    // SUB: dry (clean low end) with a little hall
    const subBus = c.createGain(); subBus.gain.value = 0.0001; subBus.connect(comp); const subHall = c.createGain(); subHall.gain.value = 0.12; subBus.connect(subHall).connect(pre);
    // PAD: continuous oscillators — never re-triggered, so nothing can phase-cancel
    const padLP = c.createBiquadFilter(); padLP.type = 'lowpass'; padLP.frequency.value = 650; padLP.Q.value = 0.3;
    const padBus = c.createGain(); padBus.gain.value = 0.0001; padBus.connect(padLP).connect(bus);
    const wave = warmWave(c), padGains = [], padOsc = [], srcs = [];
    PAD.forEach(([m], i) => {
      const g = c.createGain(); g.gain.value = 0.0001; g.connect(padBus); padGains.push(g);
      [[-0.95, -7], [0.95, 7]].forEach(([pan, cents], k) => { const o = c.createOscillator(), p = c.createStereoPanner(); o.setPeriodicWave(wave); o.frequency.value = hz(m); o.detune.value = cents; p.pan.value = pan; o.connect(p).connect(g); o.start(); srcs.push(o); padOsc.push({ o, i: i * 2 + k, base: cents }); });
    });
    // SHIMMER: continuous sines into the hall
    const shimBus = c.createGain(); shimBus.gain.value = 0.0001; const shimDry = c.createGain(); shimDry.gain.value = 0.85; shimBus.connect(shimDry).connect(comp); const shimWet = c.createGain(); shimWet.gain.value = 0.35; shimBus.connect(shimWet).connect(pre);   // mostly dry so its breath stays readable
    SHIM.forEach(([m, a], i) => { const o = c.createOscillator(), g = c.createGain(), p = c.createStereoPanner(); o.type = 'sine'; o.frequency.value = hz(m); g.gain.value = a; p.pan.value = [-0.6, 0.6, 0, -0.8, 0.8][i]; o.connect(g).connect(p).connect(shimBus); o.start(); srcs.push(o); });
    return { c, master, outro, subBus, padBus, padLP, padGains, padOsc, shimBus, srcs, done: new Set() };
  }
  // value curve of fn(video time) over context window [s, e]; origin = context time of video 0:00
  function curve(param, fn, origin, s, e, step) {
    s += 0.0005; if (e - s < 0.02) return; const n = Math.max(2, Math.ceil((e - s) / (step || 0.25)) + 1), v = new Float32Array(n);
    for (let k = 0; k < n; k++) v[k] = fn(s - origin + (e - s) * k / (n - 1));
    try { param.setValueCurveAtTime(v, s, e - s); } catch (err) { try { param.linearRampToValueAtTime(v[n - 1], e); } catch (e2) {} }
  }
  function playSub(G, e, origin, from) {
    const c = G.c, s = Math.max(origin + e.start, from), end = origin + e.start + e.dur; if (end <= s + 0.05) return;
    const env = c.createGain(); env.gain.value = 0; env.connect(G.subBus);
    curve(env.gain, t => subEnv(e, t), origin, s, end, 0.25);
    [[1, 1.0], [2, 0.6], [3, 0.22]].forEach(([h, a]) => { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = e.f * h; g.gain.value = a; o.connect(g).connect(env); o.start(s); o.stop(end + 0.1); G.srcs.push(o); });
  }
  // schedule everything in video window [a, b) (context times ≥ from)
  function scheduleWindow(G, origin, a, b, from) {
    for (const e of subEvents(a, b)) { if (G.done.has(e.id)) continue; G.done.add(e.id); playSub(G, e, origin, from); }
    const s = Math.max(origin + a, from), e = origin + b;
    curve(G.subBus.gain, subLevel, origin, s, e, 0.25);
    curve(G.padBus.gain, padLevel, origin, s, e, 0.25);
    curve(G.padLP.frequency, padCut, origin, s, e, 0.25);
    curve(G.shimBus.gain, shimLevel, origin, s, e, 0.1);
    G.padGains.forEach((g, i) => curve(g.gain, t => Math.max(0.0001, padWeight(i, t)), origin, s, e, 0.5));
    G.padOsc.forEach(p => curve(p.o.detune, t => p.base + drift(p.i, t), origin, s, e, 0.5));
  }

  // ---------------------------------------------------------------- live transport
  let ctx = null, G = null, built = false, running = false, pending = false, muted = false, volume = 0.8;
  let origin = 0, nextT = 0, timer = null, lastOpts = {}, outroK = 1;
  let unlockEl = null, resumeTries = 0;
  const now = () => ctx.currentTime;
  const target = () => muted ? 0.0001 : Math.max(0.0001, volume);
  const XFADE = 0.7;
  const pos = () => now() - origin;
  function silentWav() { const sr = 8000, n = sr, dv = new DataView(new ArrayBuffer(44 + n)); const W = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); }; W(0, 'RIFF'); dv.setUint32(4, 36 + n, true); W(8, 'WAVEfmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true); dv.setUint32(24, sr, true); dv.setUint32(28, sr, true); dv.setUint16(32, 1, true); dv.setUint16(34, 8, true); W(36, 'data'); dv.setUint32(40, n, true); for (let i = 0; i < n; i++) dv.setUint8(44 + i, 128); return URL.createObjectURL(new Blob([dv.buffer], { type: 'audio/wav' })); }
  function unlock() {
    const isOffline = typeof OfflineAudioContext !== 'undefined' && ctx instanceof OfflineAudioContext;
    // a context that refused to resume on an earlier gesture is thrown away and rebuilt inside this one (iOS)
    if (ctx && !isOffline && ctx.state !== 'running' && resumeTries >= 1) { try { teardown(); ctx.close(); } catch (e) {} ctx = null; resumeTries = 0; }
    if (!ctx || ctx.state === 'closed' || isOffline) { ctx = new (window.AudioContext || window.webkitAudioContext)(); built = false; }
    try { const b = ctx.createBuffer(1, 1, 22050), s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0); } catch (e) {}
    if (ctx.state !== 'running' && ctx.resume) { resumeTries++; ctx.resume().then(() => { resumeTries = 0; }).catch(() => {}); }
    if (!unlockEl) {
      unlockEl = document.createElement('audio'); unlockEl.setAttribute('playsinline', ''); unlockEl.setAttribute('webkit-playsinline', ''); unlockEl.loop = true;
      unlockEl.src = silentWav(); document.body.appendChild(unlockEl);
    }
    if (unlockEl.paused) unlockEl.play().catch(() => {});
  }
  function tick() { if (!G) return; const horizon = now() - origin + LOOKAHEAD; while (nextT < horizon) { scheduleWindow(G, origin, nextT, nextT + BLOCK, now() + 0.03); nextT += BLOCK; } }
  function build(at) {
    if (built) return;
    if (!ctx || ctx.state === 'closed' || (typeof OfflineAudioContext !== 'undefined' && ctx instanceof OfflineAudioContext)) ctx = new (window.AudioContext || window.webkitAudioContext)();
    at = Math.max(0, at || 0); G = makeGraph(ctx); origin = now() + 0.1 - at; outroK = 1;
    const first = Math.ceil((at + 0.001) / BLOCK) * BLOCK;
    scheduleWindow(G, origin, at, first, now() + 0.05); nextT = first; built = true;
  }
  function ramp(v, d) { if (!G) return; const t = now(), g = G.master.gain; g.cancelScheduledValues(t); g.setValueAtTime(Math.max(0.0001, g.value), t); g.exponentialRampToValueAtTime(Math.max(0.0001, v), t + d); }
  // start({at}) plays from video time `at`; if the running graph is anywhere else it is rebuilt there and crossfaded in
  function start(opts) {
    opts = opts || {}; lastOpts = opts;
    const at = typeof opts.at === 'number' ? Math.max(0, opts.at) : 0;
    unlock();
    if (built && Math.abs(pos() - at) > 0.25) teardown();
    build(at);
    Promise.resolve(ctx.resume ? ctx.resume() : null).then(() => {
      pending = false;
      if (Math.abs(pos() - at) > 0.25) { teardown(); build(at); }       // the context took a while to wake
      if (!timer) timer = setInterval(tick, 250); running = true; tick();
      if (at < 2) ramp(target(), 1.5);
      else { const t = now(), g = G.master.gain; g.cancelScheduledValues(t); g.setValueAtTime(Math.max(0.0001, g.value), t); g.linearRampToValueAtTime(target(), t + XFADE); }
    }).catch(() => { pending = true; });
  }
  function teardown() {
    if (!built || !G) { built = false; return; }
    const old = G, t = now();
    try { old.master.gain.cancelScheduledValues(t); old.master.gain.setValueAtTime(Math.max(0.0001, old.master.gain.value), t); old.master.gain.linearRampToValueAtTime(0, t + XFADE); } catch (e) {}
    if (timer) { clearInterval(timer); timer = null; }
    setTimeout(() => { old.srcs.forEach(n => { try { n.stop(); } catch (e) {} }); try { old.master.disconnect(); } catch (e) {} }, XFADE * 1000 + 150);
    running = false; built = false; G = null;
  }
  function stop() { if (!built) return; running = false; ramp(0.0001, 2.5); }
  function reset() { teardown(); }
  function setMuted(m) { muted = !!m; if (built && running) ramp(target(), 0.5); }
  function setVolume(v) { volume = Math.max(0, Math.min(1, v)); if (built && running && !muted) ramp(target(), 0.3); }
  function resumeIfPending(at) { if (pending || (built && running && ctx && ctx.state !== 'running')) start(typeof at === 'number' ? { at } : lastOpts); }
  function prime() { unlock(); }
  let lastCT = -1, lastCTWall = 0;
  function isRunning() { if (!built || !running || !ctx || ctx.state !== 'running') return false; const ct = ctx.currentTime, w = performance.now(); if (ct !== lastCT) { lastCT = ct; lastCTWall = w; return true; } return w - lastCTWall < 600; }
  function kick(at) { pending = false; try { teardown(); } catch (e) {} if (ctx) { try { ctx.close(); } catch (e) {} } ctx = null; resumeTries = 0; start(typeof at === 'number' ? { at } : lastOpts); }
  function prewarm() { /* graph is built on first start(); nothing heavy to precompute */ }
  // live playback: follow the picture's outro dim (k = 1 → 0 over the last 9 s)
  function setOutro(k) { k = Math.max(0, Math.min(1, k)); if (!built || !G || Math.abs(k - outroK) < 0.002) return; outroK = k; G.outro.gain.setTargetAtTime(Math.max(0.0001, k), now(), 0.08); }

  // ---------------------------------------------------------------- offline export: one seamless pass, 0 → dur
  async function renderOffline(dur, gain, onProgress) {
    const rate = 48000, oc = new OfflineAudioContext(2, Math.ceil(dur * rate), rate), g = makeGraph(oc);
    gain = Math.max(0.0001, gain == null ? volume : gain);
    for (let t = 0; t < dur; t += BLOCK) scheduleWindow(g, 0, t, Math.min(t + BLOCK, dur), 0);
    const mg = g.master.gain; mg.setValueAtTime(gain, 0);
    const fs = Math.max(1, dur - FADE_OUT), fn = 64, fc = new Float32Array(fn);
    for (let i = 0; i < fn; i++) fc[i] = Math.max(0.0001, gain * Math.cos(i / (fn - 1) * Math.PI / 2) ** 2);
    mg.setValueCurveAtTime(fc, fs, dur - 0.05 - fs);
    if (typeof oc.suspend === 'function' && onProgress) { const step = 30; for (let t = step; t < dur; t += step) oc.suspend(t).then(() => { try { onProgress(t / dur); } catch (e) {} oc.resume(); }); }
    const buf = await oc.startRendering(); if (onProgress) onProgress(1); return buf;
  }
  return { start, stop, reset, position: () => (built ? pos() : null), setMuted, setVolume, resumeIfPending, prime, prewarm, isRunning, kick, renderOffline, setOutro, isMuted: () => muted };
})();
