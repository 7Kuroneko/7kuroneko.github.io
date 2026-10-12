/* ============================================================================
 * FOCUSFIELD · CURSED ENERGY — soundscape v4 · "UMBRA · B♭ minor"
 * ----------------------------------------------------------------------------
 * Ominous, melodic, slow-flowing. Equal temperament, B♭ minor with a
 * Neapolitan turn: B♭m(add9) · G♭maj9 · C♭maj7 (B) · F7♭9 — 30 s per chord,
 * 9 s crossfades, 120 s cycle. Built light (few nodes) so playback stays smooth.
 *   VEIL    pad: one PeriodicWave per voice (partials 1, 2, 5, 7 — a dark
 *           glass colour), detuned pair, through a shared breathing lowpass.
 *   DEPTH   bass: triangle through a 160 Hz lowpass + quiet octave sine.
 *   LAMENT  persistent bowed lead (mixed-phase spectrum), legato glides,
 *           bow-change swells, delayed vibrato, ping-pong delay. Sings two
 *           cycles of every three.
 *   KNELL   sparse low FM bells (ratio 1.41, inharmonic) on chord tones.
 *   SHADE   looping noise through a narrow swept band-pass — a dark wind.
 *   FLASH   per black flash: a falling high-pass inhale, a 90→28 Hz drop,
 *           and a minor-2nd cluster that glides down into the chord root.
 *   SPACE   7 s stereo IR, darkening as it decays.
 * API: CursedAudio.start({at,endAt}) · .stop() · .setFlashes([{t,k,pan}])
 *      .position() · .setMuted(b) · .setVolume(v) · .isMuted() · .resumeIfPending(at)
 *      .renderOffline(sec, vol, onProgress, shouldCancel)
 * ==========================================================================*/
window.CursedAudio = (function () {
  const TAU = Math.PI * 2, XF = .7, END_FADE = 9, CHORD = 30, XFD = 9, PRE = 1.6, HORIZON = 2.5;
  const mf = n => 440 * Math.pow(2, (n - 69) / 12);
  const CH = [
    { b: 34, v: [53, 58, 60, 61, 65] },
    { b: 30, v: [54, 58, 61, 65, 68] },
    { b: 35, v: [54, 59, 63, 66, 70] },
    { b: 29, v: [53, 57, 60, 63, 66] },
  ];
  const MEL = [
    [[73, 5], [72, 3], [70, 4], [68, 3], [70, 9]],
    [[68, 4], [70, 3], [73, 5], [72, 3], [70, 9]],
    [[71, 5], [70, 4], [66, 4], [63, 3], [66, 8]],
    [[69, 4], [70, 3], [72, 4], [69, 4], [65, 9]],
  ];
  const NC = CH.length, VL = [.034, .03, .024, .022, .018], VP = [-.5, .35, -.2, .5, -.35];
  let ctx, liveCtx = null, master, endFade, verbIn, groups = {}, persist = [], A = null, lead = null, delayIn = null;
  let built = false, running = false, pending = false, muted = false, volume = .8, schedTimer = null, startAt = 0, lastOpts = {};
  let RIP = [], ripPtr = 0, chordPtr = 0, bellPtr = 0, nextMixT = 0;
  const now = () => ctx.currentTime, pos = () => now() - startAt;
  const hash = i => { let x = (Math.imul(i | 0, 2654435761) + 0x3C6EF372) >>> 0; x = Math.imul(x ^ x >>> 16, 2246822519) >>> 0; x = (x ^ x >>> 13) >>> 0; return x / 4294967296; };
  const chordIdx = vt => ((Math.floor(Math.max(0, vt) / CHORD) % NC) + NC) % NC;
  const G = v => { const g = ctx.createGain(); g.gain.value = v; return g; };
  const osc = (type, f) => { const o = ctx.createOscillator(); if (typeof type === 'string') o.type = type; else o.setPeriodicWave(type); o.frequency.value = f; return o; };
  const pan = v => { const p = ctx.createStereoPanner(); p.pan.value = v; return p; };

  function mixAt(vt) { return { veil: .85 + .15 * Math.sin(vt * TAU / 210), depth: .8 + .2 * Math.sin(vt * TAU / 170 + 1.3), lament: 1, knell: .75 + .25 * Math.sin(vt * TAU / 150 + .4), shade: .6 + .4 * Math.sin(vt * TAU / 95 + 2.2), flash: 1 }; }
  function applyMix(t) { const m = mixAt(t - startAt); Object.keys(groups).forEach(n => groups[n].gain.linearRampToValueAtTime(Math.max(.0001, m[n]), t + 1)); }

  function assets() {
    if (A && A.ctx === ctx) return;
    const sr = ctx.sampleRate, L = Math.round(sr * 7), ir = ctx.createBuffer(2, L, sr);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c); let y = 0;
      for (let i = 0; i < L; i++) {
        const t = i / sr, x = (hash(i * 5 + c * 99991) * 2 - 1) * Math.exp(-t * 6.9 / 6.5) * Math.min(1, t / .08);
        const a = Math.exp(-TAU * (300 + 4200 * Math.exp(-t / 1.6)) / sr); y = a * y + (1 - a) * x; d[i] = y;
      }
    }
    const NL = sr * 3, nz = ctx.createBuffer(1, NL, sr), nd = nz.getChannelData(0); for (let i = 0; i < NL; i++) nd[i] = hash(i * 7 + 3) * 2 - 1;
    const pw = (re, im) => ctx.createPeriodicWave(new Float32Array(re), new Float32Array(im));
    A = { ctx, ir, nz,
      glass: pw([0, 0, 0, 0, 0, 0, 0, 0], [0, 1, .38, 0, 0, .2, 0, .1]),
      bow: pw([0, 0, .5, 0, .2, 0, .06, 0, .03], [0, 1, 0, .45, 0, .22, .1, .07, 0]) };
  }
  function buildSpace() {
    verbIn = G(1); const pre = ctx.createDelay(.2); pre.delayTime.value = .045;
    const cv = ctx.createConvolver(); cv.normalize = true; cv.buffer = A.ir;
    const wet = G(.85); verbIn.connect(pre); pre.connect(cv); cv.connect(wet); wet.connect(master);
    // ping-pong delay for the lead
    delayIn = G(1); const dl = ctx.createDelay(2), dr = ctx.createDelay(2); dl.delayTime.value = .78; dr.delayTime.value = .78;
    const fb = G(.38), tone = ctx.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 1600;
    const merge = ctx.createChannelMerger(2), out = G(.5);
    delayIn.connect(dl); dl.connect(tone); tone.connect(dr); dr.connect(fb); fb.connect(dl);
    tone.connect(merge, 0, 0); dr.connect(merge, 0, 1); merge.connect(out); out.connect(master); out.connect(verbIn);
  }
  function group(name, wet) { const g = G(.0001); g.connect(master); if (wet) { const s = G(wet); g.connect(s); s.connect(verbIn); } groups[name] = g; return g; }

  // ---- VEIL pad
  function veil(t0, t1, ci, instant) {
    const end = t1 + XFD + .2, lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = .8;
    lp.frequency.setValueAtTime(500, t0); lp.frequency.linearRampToValueAtTime(1500, t0 + (t1 - t0) * .55); lp.frequency.linearRampToValueAtTime(700, end);
    const env = G(.0001); env.gain.setValueAtTime(.0001, t0); env.gain.linearRampToValueAtTime(1, t0 + (instant ? 1.5 : XFD)); env.gain.setValueAtTime(1, t1); env.gain.linearRampToValueAtTime(.0001, t1 + XFD);
    lp.connect(env); env.connect(groups.veil);
    CH[ci].v.forEach((n, v) => {
      const p = pan(VP[v]), g = G(VL[v]); g.connect(p); p.connect(lp);
      [-5, 6].forEach(dc => { const o = osc(A.glass, mf(n)); o.detune.value = dc + v * .7; o.connect(g); o.start(t0); o.stop(end); persist.push(o); });
    });
  }
  // ---- DEPTH bass
  function depth(t0, t1, ci, instant) {
    const f = mf(CH[ci].b + 12), end = t1 + XFD + .2, tri = osc('triangle', f), sub = osc('sine', f * 2);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 160; lp.Q.value = .5;
    const gt = G(.3), gs = G(.035), env = G(.0001);
    env.gain.setValueAtTime(.0001, t0); env.gain.linearRampToValueAtTime(1, t0 + (instant ? 1.5 : XFD * .8)); env.gain.setValueAtTime(1, t1); env.gain.linearRampToValueAtTime(.0001, t1 + XFD);
    tri.connect(lp); lp.connect(gt); sub.connect(gs); gt.connect(env); gs.connect(env); env.connect(groups.depth);
    [tri, sub].forEach(o => { o.start(t0); o.stop(end); persist.push(o); });
  }
  // ---- LAMENT lead
  function buildLead(t0) {
    const o = osc(A.bow, mf(70)), vib = osc('sine', 4.7), vd = G(0); vib.connect(vd); vd.connect(o.detune);
    const bp = ctx.createBiquadFilter(); bp.type = 'lowpass'; bp.frequency.value = 1400; bp.Q.value = .9;
    const env = G(.0001), out = G(.09), p = pan(-.06);
    o.connect(bp); bp.connect(env); env.connect(out); out.connect(p); p.connect(groups.lament);
    const ds = G(.45); out.connect(ds); ds.connect(delayIn);
    o.start(t0); vib.start(t0); persist.push(o, vib);
    lead = { o, env, vd, bp };
  }
  function lament(b, ci, n) {
    if (!lead || Math.floor(n / NC) % 3 === 2) return;
    let t = b + 4; const ph = MEL[ci];
    lead.env.gain.setValueAtTime(.0001, t); lead.env.gain.linearRampToValueAtTime(.8, t + 2.5);
    ph.forEach(([m, d], k) => {
      const f = mf(m);
      if (k === 0) lead.o.frequency.setValueAtTime(f, t); else lead.o.frequency.setTargetAtTime(f, t, .16);
      if (k > 0) { lead.env.gain.setTargetAtTime(.55, t - .1, .08); lead.env.gain.setTargetAtTime(.85, t + .15, .5); }
      lead.bp.frequency.setTargetAtTime(900, t, .05); lead.bp.frequency.setTargetAtTime(2000, t + .2, .9);
      lead.vd.gain.setValueAtTime(0, t + .02); lead.vd.gain.linearRampToValueAtTime(9, t + Math.min(2.2, d * .6));
      t += d;
    });
    lead.env.gain.setTargetAtTime(.0001, t - 2.5, .9);
  }
  // ---- KNELL FM bells
  function knell(t, i) {
    const ci = chordIdx(t - startAt), v = CH[ci].v, n = v[Math.floor(hash(i * 3 + 2) * 3)] - (hash(i * 9) < .5 ? 12 : 0), f = mf(n);
    const car = osc('sine', f), mod = osc('sine', f * 1.41), mg = G(0), g = G(.0001), p = pan(hash(i * 13) * 1.4 - .7);
    mg.gain.setValueAtTime(f * 2.2, t); mg.gain.exponentialRampToValueAtTime(f * .05, t + 5);
    mod.connect(mg); mg.connect(car.frequency);
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.045, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + 9);
    car.connect(g); g.connect(p); p.connect(groups.knell);
    [car, mod].forEach(o => { o.start(t); o.stop(t + 9.1); });
  }
  // ---- SHADE wind
  function buildShade(t0) {
    const ns = ctx.createBufferSource(); ns.buffer = A.nz; ns.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 7; bp.frequency.value = 420;
    const lfo = osc('sine', 1 / 23), lg = G(180); lfo.connect(lg); lg.connect(bp.frequency);
    const g = G(.1), p = pan(0), pl = osc('sine', 1 / 31), pg = G(.6); pl.connect(pg); pg.connect(p.pan);
    ns.connect(bp); bp.connect(g); g.connect(p); p.connect(groups.shade);
    ns.start(t0); lfo.start(t0); pl.start(t0); persist.push(ns, lfo, pl);
  }
  // ---- FLASH
  function flash(tf, e) {
    const n = now() + .03; if (tf < n) return;
    const st = Math.max(tf - PRE, n), ns = ctx.createBufferSource(); ns.buffer = A.nz; ns.loop = true;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.Q.value = 1.2; hp.frequency.setValueAtTime(4000, st); hp.frequency.exponentialRampToValueAtTime(500, tf);
    const ig = G(.0001); ig.gain.setValueAtTime(.0001, st); ig.gain.exponentialRampToValueAtTime(.05, tf - .03); ig.gain.linearRampToValueAtTime(.0001, tf + .08);
    ns.connect(hp); hp.connect(ig); ig.connect(groups.flash); ns.start(st, hash(e.k) * 2); ns.stop(tf + .12);
    const dr = osc('sine', 90), dg = G(.0001); dr.frequency.setValueAtTime(90, tf); dr.frequency.exponentialRampToValueAtTime(28, tf + 1.4);
    dg.gain.setValueAtTime(.0001, tf); dg.gain.linearRampToValueAtTime(.32, tf + .012); dg.gain.exponentialRampToValueAtTime(.0001, tf + 3);
    dr.connect(dg); dg.connect(groups.flash); dr.start(tf); dr.stop(tf + 3.1);
    const p = pan((e.pan || 0) * .5); p.connect(groups.flash);
    const root = CH[chordIdx(e.t)].v[1];
    [[1, .016], [0, .02], [-11, .014]].forEach(([semi, l]) => {
      const o = osc(A.glass, mf(root + semi)), g = G(.0001);
      o.frequency.setValueAtTime(mf(root + semi), tf + .1); o.frequency.setTargetAtTime(mf(semi === -11 ? root - 12 : root), tf + 1.2, 1);
      g.gain.setValueAtTime(.0001, tf + .1); g.gain.linearRampToValueAtTime(l, tf + 1.6); g.gain.exponentialRampToValueAtTime(.0001, tf + 8);
      o.connect(g); g.connect(p); o.start(tf + .1); o.stop(tf + 8.1);
    });
  }

  function pump(horizon) {
    while (startAt + chordPtr * CHORD < horizon) { const b = startAt + chordPtr * CHORD, i = chordPtr % NC; veil(b, b + CHORD, i, false); depth(b, b + CHORD, i, false); lament(b, i, chordPtr); chordPtr++; }
    for (let gd = 0; gd < 16; gd++) { const t = startAt + bellPtr * 7.5 + hash(bellPtr * 11) * 3; if (!(t < horizon)) break; if (t > now() + .02 && hash(bellPtr * 17) < .5) knell(t, bellPtr); bellPtr++; }
    while (nextMixT < horizon) { applyMix(nextMixT); nextMixT += 1; }
    while (ripPtr < RIP.length && startAt + RIP[ripPtr].t - PRE < horizon) { const e = RIP[ripPtr++]; flash(startAt + e.t, e); }
  }
  function scheduler() { pump(now() + HORIZON); }

  function build(externalCtx, at) {
    if (built) return;
    at = Math.max(0, at || 0);
    if (externalCtx) ctx = externalCtx;
    else { if (!liveCtx || liveCtx.state === 'closed') { const AC = window.AudioContext || window.webkitAudioContext; liveCtx = new AC({ latencyHint: 'playback' }); } ctx = liveCtx; }
    persist = []; groups = {}; assets();
    master = G(.0001); endFade = G(1);
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 26; hp.Q.value = .6;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.knee.value = 18; comp.ratio.value = 2.2; comp.attack.value = .04; comp.release.value = .9;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 8500; lp.Q.value = .5;
    master.connect(endFade); endFade.connect(hp); hp.connect(comp); comp.connect(lp); lp.connect(ctx.destination);
    buildSpace();
    group('veil', .65); group('depth', .1); group('lament', .55); group('knell', .8); group('shade', .5); group('flash', .45);
    const t0 = externalCtx ? 0 : now() + .05, ci = chordIdx(at), cb = Math.floor(at / CHORD);
    startAt = t0 - at;
    buildLead(t0); buildShade(t0);
    veil(t0, startAt + (cb + 1) * CHORD, ci, true); depth(t0, startAt + (cb + 1) * CHORD, ci, true);
    chordPtr = cb + 1; bellPtr = Math.ceil(at / 7.5);
    nextMixT = startAt + Math.ceil(at);
    ripPtr = 0; while (ripPtr < RIP.length && RIP[ripPtr].t < at + .05) ripPtr++;
    const m = mixAt(at); Object.keys(groups).forEach(n => groups[n].gain.setValueAtTime(Math.max(.0001, m[n]), t0));
    built = true;
  }
  const target = () => muted ? .0001 : Math.max(.0001, volume);
  function scheduleEndFade(endAt) {
    if (!(endAt > 0)) return;
    const g = endFade.gain, t = now(), p = pos(), fs = endAt - END_FADE;
    g.cancelScheduledValues(t); g.setValueAtTime(p >= endAt ? 0 : p > fs ? (endAt - p) / END_FADE : 1, t);
    if (p < fs) g.setValueAtTime(1, startAt + fs);
    if (p < endAt) g.linearRampToValueAtTime(0, startAt + endAt);
  }
  function start(opts) {
    opts = opts || {}; lastOpts = opts;
    const at = typeof opts.at === 'number' ? Math.max(0, opts.at) : 0;
    if (built && Math.abs(pos() - at) > .25) teardown();
    build(null, at);
    Promise.resolve(ctx.resume ? ctx.resume() : null).then(() => {
      pending = false;
      if (Math.abs(pos() - at) > .25) { teardown(); build(null, at); }
      pump(now() + HORIZON);
      if (!schedTimer) schedTimer = setInterval(scheduler, 250);
      running = true;
      const t = now(), p = pos();
      scheduleEndFade(opts.endAt);
      master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(Math.max(.0001, master.gain.value), t);
      if (p < 2) master.gain.exponentialRampToValueAtTime(target(), t + 8); else master.gain.linearRampToValueAtTime(target(), t + XF);
    }).catch(() => { pending = true; });
  }
  function teardown() {
    if (!built) return;
    const m = master, srcs = persist, t = now();
    try { m.gain.cancelScheduledValues(t); m.gain.setValueAtTime(m.gain.value, t); m.gain.linearRampToValueAtTime(0, t + XF); } catch (e) {}
    if (schedTimer) { clearInterval(schedTimer); schedTimer = null; }
    setTimeout(() => { srcs.forEach(n => { try { n.stop(); } catch (e) {} }); try { m.disconnect(); } catch (e) {} }, XF * 1000 + 150);
    built = false; running = false; groups = {}; persist = []; lead = null;
  }
  function stop() {
    if (!built) return; running = false;
    master.gain.cancelScheduledValues(now()); master.gain.setValueAtTime(Math.max(.0001, master.gain.value), now()); master.gain.exponentialRampToValueAtTime(.0001, now() + 2.4);
  }
  function ramp(sec) { if (built && running) { master.gain.cancelScheduledValues(now()); master.gain.setValueAtTime(Math.max(.0001, master.gain.value), now()); master.gain.exponentialRampToValueAtTime(target(), now() + sec); } }
  function setMuted(m) { muted = !!m; ramp(.5); }
  function setVolume(v) { volume = Math.max(0, Math.min(1, v)); if (!muted) ramp(.3); }
  function setFlashes(list) {
    RIP = (list || []).slice().sort((a, b) => a.t - b.t);
    if (built && ctx) { const hz = now() + HORIZON; ripPtr = 0; while (ripPtr < RIP.length && startAt + RIP[ripPtr].t - PRE < hz) ripPtr++; }
  }
  function resumeIfPending(at) { if (pending) start(typeof at === 'number' ? { at } : lastOpts); }

  async function renderChunked(offline, totalFrames, rate, onProgress, shouldCancel) {
    if (typeof offline.suspend !== 'function') return offline.startRendering();
    const q = 128; let chunk = Math.max(q, Math.round(rate * 5 / q) * q);
    const arm = f => { if (f >= totalFrames) return; offline.suspend(f / rate).then(async () => { const c = !!(shouldCancel && shouldCancel()); if (onProgress) { try { onProgress(f / totalFrames); } catch (e) {} } if (!c) await new Promise(r => setTimeout(r, 0)); arm(f + chunk); offline.resume(); }); };
    arm(chunk); return offline.startRendering();
  }
  async function renderOffline(durationSec, vol, onProgress, shouldCancel) {
    vol = vol == null ? volume : vol;
    if (schedTimer) { clearInterval(schedTimer); schedTimer = null; }
    teardown(); built = false; running = false; pending = false;
    const rate = 48000, tail = 5, totalFrames = Math.ceil(rate * (durationSec + tail));
    const offline = new OfflineAudioContext(2, totalFrames, rate);
    muted = false; volume = vol; A = null;
    build(offline, 0);
    const end = startAt + durationSec, peak = Math.max(.0002, vol);
    master.gain.cancelScheduledValues(0); master.gain.setValueAtTime(.0001, startAt); master.gain.exponentialRampToValueAtTime(peak, startAt + 8);
    master.gain.setValueAtTime(peak, Math.max(startAt + 8, end - END_FADE)); master.gain.linearRampToValueAtTime(.0001, end);
    let h = startAt; while (h < end) { h = Math.min(end, h + 1); pump(h); }
    const buf = await renderChunked(offline, totalFrames, rate, onProgress, shouldCancel);
    built = false; running = false; groups = {}; persist = []; lead = null; ctx = liveCtx; A = null;
    return buf;
  }

  return { start, stop, setFlashes, setMuted, setVolume, resumeIfPending, isMuted: () => muted, renderOffline,
    position: () => (built && running ? pos() - ((ctx.outputLatency || ctx.baseLatency || 0) + .04) : null) };
})();
