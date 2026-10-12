/* ============================================================================
 * FOCUSFIELD · DIVINE ENERGY — soundscape v5 · "Event Horizon Vigil"
 * ----------------------------------------------------------------------------
 * Dark, ominous, futuristic space — but calm. Built for focus: no feedback
 * loops, no noise bursts, no fast modulation, no resonant filters, everything
 * band-limited and slow. From scratch; shares nothing with any other cut:
 *   key    C AEOLIAN with a Dorian lift — Cm9 · A♭maj7 · Fm(add9) · Gm7,
 *          each held 34 s, crossfaded over 8 s. Only C-minor track.
 *   VOID   the floor: two SINES a perfect fifth apart (C1 32.7 / G1 49) with
 *          a 3rd sine at C2 whose gain breathes on a 52 s cosine. Pure, no
 *          filter. Unlike any other sub here (FM, ring-mod, square, saw).
 *   HULL   the pad: FILTERED TRIANGLES, 3 per chord tone at ±3 cents, each
 *          through its own 1-pole-style lowpass (Q 0.2) sitting at 2.2× the
 *          fundamental — dull, felt. Slow stereo AUTO-PAN per voice (0.011–
 *          0.019 Hz) so the pad turns like a slow station.
 *   SIGNAL a distant beacon: a single SINE at G4 (392) every 17 s, 1.8 s
 *          raised-cosine envelope, panned far left then far right alternately,
 *          with an octave-down sine ghost at 1/3 gain 0.4 s later. Regular.
 *   AURORA high shimmer: 4 sines in the 5th–7th octave (C6 E♭6 G6 B♭6) at
 *          near-zero gain, each slowly swelling and fading on 60–90 s cosines
 *          so at most 1–2 are audible at once. Not a choir, no formants.
 *   TIDE   filtered TRIANGLE at C3 (130.8) whose lowpass rises 200→600 Hz and
 *          falls again over 45 s — the only "movement" element; feels like a
 *          slow pass of light across a hull.
 *   GLUE   12 s soft reverb (lowpassed 2.2 kHz in the tail), 4.8 kHz master
 *          roll-off, gentle compressor (ratio 1.8).
 *
 * API: DivineAudio.start({at}) — plays from video time `at` (seconds)
 *      / DivineAudio.start({buildup}) / .stop() / .reset() / .setMuted(b)
 *      / .setVolume(0..1) / .isMuted() / .resumeIfPending()
 * ==========================================================================*/
window.DivineAudio = (function () {
  let ctx, master, verb, groups = {};
  let built = false, running = false, pending = false, muted = false, volume = 0.8;
  let schedTimer = null, nextChord = 0, chordIdx = 0, nextSig = 0, sigSide = 1;
  const PHRASE = 34;
  const CHORDS = [
    [130.81, 155.56, 196.00, 233.08, 293.66],  // Cm9   C3 Eb3 G3 Bb3 D4
    [103.83, 130.81, 155.56, 196.00, 261.63],  // Abmaj7 Ab2 C3 Eb3 G3 C4
    [87.31, 130.81, 174.61, 207.65, 196.00],   // Fm(add9) F2 C3 F3 Ab3 G3
    [98.00, 116.54, 146.83, 174.61, 233.08],   // Gm7   G2 Bb2 D3 F3 Bb3
  ];
  const VOIDS = [[32.70, 49.00], [25.96, 38.89], [43.65, 65.41], [49.00, 73.42]];
  let hull = [], voids = [], srcs = [];
  let AT = 0, origin = 0;   // AT = video time the graph was built at; origin = ctx time of video 0:00
  const now = () => ctx.currentTime;
  const mkOsc = () => { const o = ctx.createOscillator(); srcs.push(o); return o; };
  // Sine LFO whose phase matches where it would be at video time AT, so every
  // slow sweep/pan/breath lands exactly where it belongs after a seek.
  function lfoAt(rate) {
    const o = ctx.createOscillator(); srcs.push(o); const ph = 2 * Math.PI * rate * AT;
    o.setPeriodicWave(ctx.createPeriodicWave(new Float32Array([0, Math.sin(ph)]), new Float32Array([0, Math.cos(ph)]), { disableNormalization: true }));
    o.frequency.value = rate; return o;
  }

  let irCache = null;
  function ir(sec) {
    const r = ctx.sampleRate, len = Math.floor(r * sec);
    if (!irCache || irCache.len !== len) {
      const ch = [0, 1].map(() => { const d = new Float32Array(len); let s1 = 0, s2 = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; s1 = s1 * 0.85 + w * 0.15; s2 = s2 * 0.85 + s1 * 0.15; d[i] = s2 * Math.pow(1 - i / len, 2.6); } return d; });
      irCache = { len, ch };
    }
    const b = ctx.createBuffer(2, len, r);
    b.copyToChannel(irCache.ch[0], 0); b.copyToChannel(irCache.ch[1], 1);
    return b;
  }
  function group(n, wet) {
    const g = ctx.createGain(); g.connect(master);
    if (wet) { const s = ctx.createGain(); s.gain.value = wet; g.connect(s); s.connect(verb); }
    groups[n] = g; return g;
  }
  function autopan(rate, depth, phase) {
    const p = ctx.createStereoPanner();
    const lfo = lfoAt(rate);
    const g = ctx.createGain(); g.gain.value = depth; lfo.connect(g); g.connect(p.pan); lfo.start();
    return p;
  }

  function buildVoid() {
    VOIDS[0].forEach((f, i) => {
      const o = mkOsc(); o.type = 'sine'; o.frequency.value = f;
      const g = ctx.createGain(); g.gain.value = i ? 0.12 : 0.2; o.connect(g); g.connect(groups.void); o.start(); voids.push(o);
    });
    const o = mkOsc(); o.type = 'sine'; o.frequency.value = 65.41;
    const g = ctx.createGain(); g.gain.value = 0.06;
    const br = lfoAt(1 / 52);
    const bg = ctx.createGain(); bg.gain.value = 0.05; br.connect(bg); bg.connect(g.gain);
    o.connect(g); g.connect(groups.void); o.start(); br.start(); voids.push(o);
  }

  function buildHull() {
    CHORDS[0].forEach((f, k) => {
      const g = ctx.createGain(); g.gain.value = [0.055, 0.05, 0.045, 0.04, 0.03][k];
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.2; lp.frequency.value = f * 2.2;
      const pan = autopan(0.011 + k * 0.002, 0.7, k * 9);
      const oscs = [-3, 0, 3].map(c => { const o = mkOsc(); o.type = 'triangle'; o.frequency.value = f; o.detune.value = c; o.connect(lp); o.start(); return o; });
      lp.connect(g); g.connect(pan); pan.connect(groups.hull);
      hull.push({ oscs, lp, idx: k });
    });
  }
  function setChord(ci, t) {
    hull.forEach(h => { const f = CHORDS[ci][h.idx]; h.oscs.forEach(o => o.frequency.setTargetAtTime(f, t, 3.5)); h.lp.frequency.setTargetAtTime(f * 2.2, t, 3.5); });
    VOIDS[ci].forEach((f, i) => voids[i].frequency.setTargetAtTime(f, t, 3));
  }

  function signal(t, side) {
    function tone(f, gain, dt, pan) {
      const o = mkOsc(); o.type = 'sine'; o.frequency.value = f;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t + dt);
      const steps = 12, D = 1.8;
      for (let s = 1; s <= steps; s++) { const p = s / steps; g.gain.linearRampToValueAtTime(Math.max(0.0001, gain * 0.5 * (1 - Math.cos(2 * Math.PI * p))), t + dt + p * D); }
      const pn = ctx.createStereoPanner(); pn.pan.value = pan;
      o.connect(g); g.connect(pn); pn.connect(groups.signal); o.start(t + dt); o.stop(t + dt + D + 0.1);
    }
    tone(392.00, 0.05, 0, side * 0.8);
    tone(196.00, 0.017, 0.4, side * 0.4);
  }

  function buildAurora() {
    [1046.50, 1244.51, 1567.98, 1864.66].forEach((f, i) => {
      const o = mkOsc(); o.type = 'sine'; o.frequency.value = f;
      const g = ctx.createGain(); g.gain.value = 0;
      const lfo = lfoAt(1 / (60 + i * 10));
      const lg = ctx.createGain(); lg.gain.value = 0.0009; lfo.connect(lg); lg.connect(g.gain);
      const c = ctx.createConstantSource(); srcs.push(c); c.offset.value = 0.0009; c.connect(g.gain); c.start();
      const pan = ctx.createStereoPanner(); pan.pan.value = [-0.6, 0.6, -0.3, 0.3][i];
      o.connect(g); g.connect(pan); pan.connect(groups.aurora); o.start(); lfo.start();
    });
  }

  function buildTide() {
    const o = mkOsc(); o.type = 'triangle'; o.frequency.value = 130.81;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.3; lp.frequency.value = 400;
    const lfo = lfoAt(1 / 45);
    const lg = ctx.createGain(); lg.gain.value = 200; lfo.connect(lg); lg.connect(lp.frequency);
    const g = ctx.createGain(); g.gain.value = 0.045;
    const pan = autopan(0.008, 0.5, 0);
    o.connect(lp); lp.connect(g); g.connect(pan); pan.connect(groups.tide); o.start(); lfo.start();
    hull.push({ oscs: [o], lp: { frequency: { setTargetAtTime() {} } }, idx: 0 });
  }

  function scheduler() {
    const h = now() + 0.5;
    while (nextChord < h) { setChord(chordIdx % 4, nextChord); chordIdx++; nextChord += PHRASE; }
    while (nextSig < h) { signal(nextSig, sigSide); sigSide = -sigSide; nextSig += 17; }
  }

  const BUILD = { void: [0, 7], hull: [3, 14], tide: [8, 16], aurora: [14, 30], signal: [16, 18] };
  function runBuildup(t) {
    Object.keys(groups).forEach(n => { const g = groups[n].gain, [s, e] = BUILD[n]; g.cancelScheduledValues(t); g.setValueAtTime(0.0001, t); g.setValueAtTime(0.0001, t + s); g.linearRampToValueAtTime(1, t + e); });
  }
  // set each layer to where the intro build-up would be at video time `at`
  function groupsAt(t, at) {
    Object.keys(groups).forEach(n => {
      const g = groups[n].gain, [s, e] = BUILD[n]; g.cancelScheduledValues(t);
      if (at >= e) { g.setValueAtTime(1, t); return; }
      g.setValueAtTime(at <= s ? 0.0001 : Math.max(0.0001, (at - s) / (e - s)), t);
      if (at < s) g.setValueAtTime(0.0001, t + (s - at));
      g.linearRampToValueAtTime(1, t + (e - at));
    });
  }

  function build(offlineCtx, at) {
    if (built) return;
    AT = Math.max(0, at || 0);
    ctx = offlineCtx || (ctx && ctx.state !== 'closed' && !(ctx instanceof OfflineAudioContext) ? ctx : new (window.AudioContext || window.webkitAudioContext)());
    master = ctx.createGain(); master.gain.value = 0.0001;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.knee.value = 30; comp.ratio.value = 1.8; comp.attack.value = 0.08; comp.release.value = 1;
    const roll = ctx.createBiquadFilter(); roll.type = 'lowpass'; roll.frequency.value = 4800; roll.Q.value = 0.3;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 22; hp.Q.value = 0.3;
    master.connect(comp); comp.connect(roll); roll.connect(hp); hp.connect(ctx.destination);
    verb = ctx.createConvolver(); verb.buffer = ir(7);
    const vlp = ctx.createBiquadFilter(); vlp.type = 'lowpass'; vlp.frequency.value = 2200; vlp.Q.value = 0.3;
    const wet = ctx.createGain(); wet.gain.value = 0.8; verb.connect(vlp); vlp.connect(wet); wet.connect(master);
    group('void', 0); group('hull', 0.7); group('tide', 0.6); group('aurora', 1.0); group('signal', 1.1);
    buildVoid(); buildHull(); buildTide(); buildAurora();
    // anchor the whole schedule to video time: chord k at k·34 s, beacon k at 20 + k·17 s
    origin = now() + 0.1 - AT;
    const ci = Math.floor(AT / PHRASE);
    const cf = CHORDS[ci % 4];
    hull.forEach(h => { const f = cf[h.idx]; h.oscs.forEach(o => { o.frequency.value = f; }); if (h.lp.frequency.setValueAtTime) h.lp.frequency.value = f * 2.2; });
    VOIDS[ci % 4].forEach((f, i) => { voids[i].frequency.value = f; });
    chordIdx = ci + 1; nextChord = origin + chordIdx * PHRASE;
    const k = AT <= 20 ? 0 : Math.ceil((AT - 20) / 17);
    nextSig = origin + 20 + 17 * k; sigSide = k % 2 ? -1 : 1;
    built = true;
  }
  const target = () => muted ? 0.0001 : Math.max(0.0001, volume);
  function ramp(v, d) { const t = now(); master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), t); master.gain.exponentialRampToValueAtTime(v, t + d); }
  let lastOpts = {};
  const XFADE = 0.7;   // equal-length overlap: old position fades out while the new one fades in
  const pos = () => now() - origin;   // where the soundscape currently is, in video seconds
  // start({at}) plays the soundscape from video time `at`. If the running graph
  // is anywhere else (seek, restart, or drift while paused) it is rebuilt at the
  // exact position and crossfaded in — sound always matches the playhead.
  // iOS unlock: create + resume the context synchronously inside a user gesture, kick it with a
  // silent buffer, and loop a silent <audio> so the hardware mute switch doesn't silence Web Audio.
  let unlockEl = null, resumeTries = 0;
  // 1 s of real 8 kHz silence — iOS ignores zero-length clips
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
  function start(opts) {
    opts = opts || {}; lastOpts = opts;
    const at = typeof opts.at === 'number' ? Math.max(0, opts.at) : 0;
    unlock();
    if (built && Math.abs(pos() - at) > 0.25) teardown();
    build(null, at);
    Promise.resolve(ctx.resume ? ctx.resume() : null).then(() => {
      pending = false;
      if (Math.abs(pos() - at) > 0.25) { teardown(); build(null, at); }   // ctx took a while to wake
      if (!schedTimer) schedTimer = setInterval(scheduler, 150); running = true;
      const p = pos(); groupsAt(now(), p);
      if (p < 2) ramp(target(), 6);
      else { const t = now(); master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(target(), t + XFADE); }
    }).catch(() => { pending = true; });
  }
  function teardown() {
    if (!built) return;
    const oldMaster = master, oldSrcs = srcs, t = now();
    try { oldMaster.gain.cancelScheduledValues(t); oldMaster.gain.setValueAtTime(Math.max(0.0001, oldMaster.gain.value), t); oldMaster.gain.linearRampToValueAtTime(0, t + XFADE); } catch (e) {}
    if (schedTimer) { clearInterval(schedTimer); schedTimer = null; }
    setTimeout(() => { oldSrcs.forEach(n => { try { n.stop(); } catch (e) {} }); try { oldMaster.disconnect(); } catch (e) {} }, XFADE * 1000 + 150);
    running = false; built = false; master = null; verb = null; groups = {}; hull = []; voids = []; srcs = [];
  }
  function stop() { if (!built) return; running = false; ramp(0.0001, 2.5); }
  function reset() { teardown(); }
  function setMuted(m) { muted = !!m; if (built && running) ramp(target(), 0.5); }
  function setVolume(v) { volume = Math.max(0, Math.min(1, v)); if (built && running && !muted) ramp(target(), 0.3); }
  function resumeIfPending(at) { if (pending || (built && running && ctx && ctx.state !== 'running')) start(typeof at === 'number' ? { at } : lastOpts); }
  function prime() { unlock(); }
  // true only when the clock is actually advancing (iOS can report 'running' while frozen)
  let lastCT = -1, lastCTWall = 0;
  function isRunning() { if (!built || !running || !ctx || ctx.state !== 'running') return false; const ct = ctx.currentTime, w = performance.now(); if (ct !== lastCT) { lastCT = ct; lastCTWall = w; return true; } return w - lastCTWall < 600; }
  // called from inside a user tap: rebuild the whole graph in a fresh gesture-blessed context
  function kick(at) { pending = false; try { teardown(); } catch (e) {} if (ctx && !(typeof OfflineAudioContext !== 'undefined' && ctx instanceof OfflineAudioContext)) { try { ctx.close(); } catch (e) {} } ctx = null; resumeTries = 0; start(typeof at === 'number' ? Object.assign({}, lastOpts || {}, { at }) : lastOpts); }
  function prewarm() { try { build(); } catch (e) {} }

  // Offline render (used by the recorder): rebuild the same graph in an
  // OfflineAudioContext and pre-schedule every event across `dur`.
  async function renderOffline(dur, gain, onProgress) {
    const save = { ctx, master, verb, groups, hull, voids, srcs, built, nextChord, chordIdx, nextSig, sigSide, AT, origin };
    const rate = 48000;
    ctx = new OfflineAudioContext(2, Math.ceil(dur * rate), rate);
    master = null; verb = null; groups = {}; hull = []; voids = []; srcs = []; built = false;
    build(ctx, 0);
    master.gain.setValueAtTime(0.0001, 0);    master.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), 6);
    master.gain.setValueAtTime(Math.max(0.0001, gain), Math.max(6.1, dur - 4));
    master.gain.exponentialRampToValueAtTime(0.0001, dur);
    runBuildup(0.05);
    for (let t = 0, i = 0; t < dur; t += PHRASE, i++) setChord(i % 4, t);
    for (let t = 20, s = 1; t < dur; t += 17, s = -s) signal(t, s);
    const buf = await ctx.startRendering();
    if (onProgress) onProgress(1);
    ctx = save.ctx; master = save.master; verb = save.verb; groups = save.groups;
    hull = save.hull; voids = save.voids; srcs = save.srcs; built = save.built; AT = save.AT; origin = save.origin;
    nextChord = save.nextChord; chordIdx = save.chordIdx; nextSig = save.nextSig; sigSide = save.sigSide;
    return buf;
  }
  return { start, stop, reset, position: () => (built ? pos() : null), setMuted, setVolume, resumeIfPending, prime, prewarm, isRunning, kick, renderOffline, isMuted: () => muted };
})();
