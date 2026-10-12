/* ============================================================================
 * FOCUSFIELD · PINK MOON — composed soundscape v2 · "THE EMPRESS OF THE NIGHT"
 * ----------------------------------------------------------------------------
 * Dark beauty, power, grace. A vampire empress on a throne of moonlight, and
 * above her the light of the One who made the moon. A low resonant throne-tone
 * holds the floor; a choir of formant-wave voices sings the chords; a soprano
 * sings a slow gothic lament in harmonic minor; a distant harpsichord turns a
 * dirge; once per cycle a minor-tierce church bell tolls. Every second cycle
 * the home chord turns to E MAJOR (Picardy third): the darkness lit from above.
 * Tempo-free. No noise sources. Loops forever. Replaces v1 entirely.
 *
 * UNIQUE PALETTE — diffed against every other FocusField engine (per rule):
 *   key    E HARMONIC MINOR — the only E-minor track. Four chords, 56 s each,
 *          12 s crossfades, 224 s cycle: Em(add9) · Cmaj7 · Am(add9) · B7♭9.
 *          Odd cycles: E major replaces Em. Melody leans on the C–D♯
 *          augmented second (the "vampire" interval).
 *   CHOIR  FOF VOICES (formant-wave-function synthesis): at each glottal
 *          period a damped sine grain is fired at every formant (soft 3 ms
 *          onset, exp decay set by bandwidth) — pre-rendered per pitch as a
 *          seamless 4 s loop with a 4.5 Hz vibrato whose integral closes on the
 *          loop. Choir sings "oh" (450·800·2830 Hz); doubled ±5 ¢.
 *          No other engine uses FOF grains (granular elsewhere = sine dust).
 *   SOLO   soprano FOF on "ah" (800·1150·2900·3900), 5.25 Hz vibrato.
 *   THRONE RESONANT PHASE-DISTORTION bass: a triangle-windowed sine whose
 *          resonance ratio sweeps 1.5→4.5 over 16 s inside each period — a
 *          vocal, velvet growl; plus a pure fundamental. 16 s seamless loop.
 *   DIRGE  HARPSICHORD by additive pluck-position comb (|sin nπ·0.13| / n^0.85,
 *          per-harmonic decay) with an octave 4′ rank — not Karplus, not FM.
 *   BELL   real church-bell partials with a MINOR tierce (hum .25 · prime .5 ·
 *          tierce .6 · quint .75 · nominal 1 · 1.25 · 2), each a ±0.35 Hz
 *          beating doublet with its own decay.
 *   SPACE  VELVET-NOISE crypt: sparse ±1 impulse IR (2.2k/s), 9 s, darkening
 *          as it decays, 35 ms pre-delay; compressor + soft-clip + 8.5 kHz.
 * API mirrors the player shell.
 * ==========================================================================*/
window.PinkMoonAudio = (function () {
  const BAR = 56, XF = 12, CYCLE = 224, LOOPV = 4, LOOPB = 16, REFB = 55;
  let duration = 1800;
  const F = m => 440 * Math.pow(2, (m - 69) / 12);
  const PROG = [
    { bass: 28, parts: [52, 59, 64, 66, 67], pic: [52, 59, 64, 68, 71] }, // Em(add9) | E(add9)
    { bass: 36, parts: [48, 55, 59, 64, 67] },                              // Cmaj7
    { bass: 33, parts: [45, 52, 59, 60, 64] },                              // Am(add9)
    { bass: 35, parts: [47, 54, 57, 60, 63] },                              // B7♭9
  ];
  // [cycle start, notes [midi, len]...], every = 1 (each cycle) or 2 (odd cycles only)
  const PHRASES = [
    { st: 14,  every: 1, n: [[71, 3.5], [72, 2.5], [71, 2.5], [67, 4.5], [66, 2.5], [64, 7]] },
    { st: 70,  every: 2, n: [[67, 3], [71, 3], [76, 5], [72, 3], [71, 7]] },
    { st: 126, every: 2, n: [[72, 3.5], [71, 2], [69, 3], [64, 7]] },
    { st: 176, every: 1, n: [[69, 3], [72, 3], [75, 5], [72, 2.5], [71, 9]] },
  ];
  const seeded = k => { let s = (k * 2654435761) >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0, s / 4294967296); };
  const VOWEL = {
    oh: [[450, 1, 70], [800, 0.28, 80], [2830, 0.08, 100]],
    ah: [[800, 1, 80], [1150, 0.5, 90], [2900, 0.025, 120], [3900, 0.1, 130]],
  };

  // All generated material is built once at 48 kHz, context-independent, in small idle-time jobs.
  const SR = 48000, mkBuf = d => { const b = new AudioBuffer({ numberOfChannels: 1, length: d.length, sampleRate: SR }); b.copyToChannel(d, 0); return b; };
  const norm1 = d => { let pk = 0; for (let i = 0; i < d.length; i++) pk = Math.max(pk, Math.abs(d[i])); for (let i = 0; i < d.length; i++) d[i] /= pk; return d; };
  // ---- FOF loop: a few reference pitches per vowel, repitched by playbackRate; vibrato closes on the loop
  const FOF_REFS = { oh: [48, 55, 62, 69], ah: [66, 72, 76] }, FOF_VIB = { oh: [4.5, 0.004], ah: [5.25, 0.011] };
  const fofCache = new Map();
  function fofMake(ref, vowel) {
    const key = vowel + ref; if (fofCache.has(key)) return fofCache.get(key);
    const [vibHz, vibDepth] = FOF_VIB[vowel], L = SR * LOOPV, d = new Float32Array(L), r = seeded(ref * 31 + vowel.length);
    const f0 = Math.round(F(ref) * LOOPV) / LOOPV, vk = f0 * vibDepth / (2 * Math.PI * vibHz), exN = Math.round(SR * 0.003);
    const grains = VOWEL[vowel].map(([fc, amp, bw]) => { const n = Math.min(Math.round(SR * 6.9 / (Math.PI * bw)), 1600), g = new Float32Array(n), w = 2 * Math.PI * fc / SR, dec = Math.exp(-Math.PI * bw / SR); let e = amp; for (let j = 0; j < n; j++) { g[j] = e * (j < exN ? 0.5 * (1 - Math.cos(Math.PI * j / exN)) : 1) * Math.sin(w * j); e *= dec; } return g; });
    let prev = -1;
    for (let i = 0; i < L; i++) {
      const t = i / SR, ph = Math.floor(f0 * t + vk * (1 - Math.cos(2 * Math.PI * vibHz * t)));
      if (ph !== prev) { prev = ph; const a = 0.92 + 0.16 * r(); for (const g of grains) { const n = g.length; if (i + n < L) for (let j = 0; j < n; j++) d[i + j] += a * g[j]; else for (let j = 0; j < n; j++) d[(i + j) % L] += a * g[j]; } }
    }
    const b = mkBuf(norm1(d)); fofCache.set(key, b); return b;
  }
  function fofBuf(midi, vowel) { const refs = FOF_REFS[vowel]; let ref = refs[0]; for (const x of refs) if (Math.abs(x - midi) < Math.abs(ref - midi)) ref = x; return { buf: fofMake(ref, vowel), rate: Math.pow(2, (midi - ref) / 12) }; }
  // ---- resonant phase-distortion throne loop
  let pdCached = null;
  function pdBuf() {
    if (pdCached) return pdCached;
    const L = SR * LOOPB, d = new Float32Array(L);
    for (let i = 0; i < L; i++) { const t = i / SR, x = (REFB * t) % 1, w = 1 - Math.abs(2 * x - 1), rr = 3 + 1.5 * Math.sin(2 * Math.PI * t / LOOPB); d[i] = 0.55 * w * Math.sin(2 * Math.PI * rr * x) + 0.6 * Math.sin(2 * Math.PI * REFB * t); }
    return (pdCached = mkBuf(norm1(d)));
  }
  // ---- harpsichord note (recursive oscillators, no per-sample sin)
  const hpCache = new Map();
  function hpBuf(midi) {
    if (hpCache.has(midi)) return hpCache.get(midi);
    const L = Math.round(SR * 2.6), d = new Float32Array(L), f = F(midi), r = seeded(midi * 7 + 3);
    for (const [mul, gg] of [[1, 1], [2, 0.42]]) for (let n = 1; n <= 16; n++) {
      const fn = f * mul * n; if (fn > 7500) break;
      const a = gg * Math.abs(Math.sin(n * Math.PI * 0.13)) / Math.pow(n, 0.85), tau = 2.2 / (1 + 0.2 * n), w = 2 * Math.PI * fn / SR, k = Math.exp(-1 / (tau * SR)), cw = Math.cos(w), sw = Math.sin(w), ph = r() * 6.283;
      let sn = Math.sin(ph), cs = Math.cos(ph), e = a; for (let i = 0; i < L; i++) { d[i] += e * sn; const s2 = sn * cw + cs * sw; cs = cs * cw - sn * sw; sn = s2; e *= k; }
    }
    for (let i = 0; i < L; i++) d[i] *= Math.min(1, i / (SR * 0.002)) * Math.min(1, (L - i) / (SR * 0.3));
    const b = mkBuf(norm1(d)); hpCache.set(midi, b); return b;
  }
  const HP_NOTES = [1, 3].flatMap(ci => PROG[ci].parts.map(x => x + 12));
  const JOBS = [pdBuf, ...FOF_REFS.oh.map(m => () => fofMake(m, 'oh')), ...FOF_REFS.ah.map(m => () => fofMake(m, 'ah')), ...HP_NOTES.map(m => () => hpBuf(m))];
  (function warm() { if (!JOBS.length) return; JOBS.shift()(); setTimeout(warm, 30); })();
  function velvetIR(c) {
    const sr = c.sampleRate, L = Math.floor(sr * 9), buf = c.createBuffer(2, L, sr), r = seeded(1913), pre = Math.round(sr * 0.035), seg = sr / 2200;
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let k = 0; k * seg < L - pre; k++) { const i = pre + Math.floor(k * seg + r() * seg); if (i >= L) break; const t = (i - pre) / sr; d[i] = (r() < 0.5 ? -1 : 1) * Math.exp(-6.9 * t / 7) * (1 - Math.exp(-t * 40)); }
      let y = 0; for (let i = 0; i < L; i++) { const a = 0.9 * Math.exp(-(i / sr) / 2.2) + 0.05; y += a * (d[i] - y); d[i] = y; }
    }
    return buf;
  }
  const CURVE_N = 64, FADE_IN = new Float32Array(CURVE_N), FADE_OUT = new Float32Array(CURVE_N);
  for (let i = 0; i < CURVE_N; i++) { const x = i / (CURVE_N - 1) * Math.PI / 2; FADE_IN[i] = Math.sin(x); FADE_OUT[i] = Math.cos(x); }
  const scaled = (curve, k) => { const o = new Float32Array(CURVE_N); for (let i = 0; i < CURVE_N; i++) o[i] = Math.max(0.00001, curve[i] * k); return o; };

  function buildGraph(c, dest, origin) {
    const master = c.createGain(); master.gain.value = 0.0001;
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -17; comp.knee.value = 20; comp.ratio.value = 2.4; comp.attack.value = 0.06; comp.release.value = 1.1;
    const clip = c.createWaveShaper(); const cv = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; cv[i] = Math.tanh(x * 1.1) / Math.tanh(1.1); } clip.curve = cv; clip.oversample = '2x';
    const ceiling = c.createBiquadFilter(); ceiling.type = 'lowpass'; ceiling.frequency.value = 8500; ceiling.Q.value = 0.5;
    const bus = c.createGain(), dry = c.createGain(), wet = c.createGain(); dry.gain.value = 0.55; wet.gain.value = 0.9;
    const crypt = c.createConvolver(); crypt.buffer = velvetIR(c);
    bus.connect(dry).connect(comp); bus.connect(crypt).connect(wet).connect(comp);
    comp.connect(clip).connect(ceiling).connect(master).connect(dest);
    const low = c.createGain(), hp = c.createBiquadFilter(), lp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 30; lp.type = 'lowpass'; lp.frequency.value = 520; lp.Q.value = 0.7;
    low.connect(hp).connect(lp).connect(comp); const lowSend = c.createGain(); lowSend.gain.value = 0.25; lp.connect(lowSend).connect(crypt);
    return { c, master, bus, low, out: master, origin, pd: pdBuf(), stops: [] };
  }
  function loopSrc(G, buf, rate, loopLen, s, e) {
    const src = G.c.createBufferSource(); src.buffer = buf; src.loop = true; src.playbackRate.value = rate;
    src.start(s, (((s - G.origin) * rate) % loopLen + loopLen) % loopLen); src.stop(e + 0.2); return src;
  }
  function envelope(g, t0, s, e, level, ramp) {
    const inEnd = Math.min(s + ramp, e - 0.1); g.setValueAtTime(0, s);
    try { g.setValueCurveAtTime(scaled(FADE_IN, level), s, inEnd - s); } catch (err) { g.linearRampToValueAtTime(level, inEnd); }
    const os = Math.max(inEnd + 0.01, e - XF); g.setValueAtTime(level, os);
    try { g.setValueCurveAtTime(scaled(FADE_OUT, level), os, e - os); } catch (err) { g.linearRampToValueAtTime(0, e); }
  }
  function choirVoice(G, t0, midi, dur, level, pan, from) {
    const c = G.c, s = Math.max(t0, from), e = Math.max(t0 + dur, s + 0.3), fb = fofBuf(midi, 'oh');
    const env = c.createGain(), lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3600; lp.Q.value = 0.4;
    [[-5, pan - 0.25], [5, pan + 0.25]].forEach(([ct, p]) => { const pn = c.createStereoPanner(); pn.pan.value = Math.max(-1, Math.min(1, p)); const rate = fb.rate * Math.pow(2, ct / 1200); loopSrc(G, fb.buf, rate, LOOPV, s, e).connect(pn).connect(lp); });
    lp.connect(env).connect(G.bus);
    envelope(env.gain, t0, s, e, level, s > t0 + 0.5 ? 2 : XF);
  }
  function throne(G, t0, midi, dur, level, from) {
    const c = G.c, s = Math.max(t0, from), e = Math.max(t0 + dur, s + 0.3), env = c.createGain(), base = F(midi) / REFB;
    [-3, 3].forEach(ct => loopSrc(G, G.pd, base * Math.pow(2, ct / 1200), LOOPB, s, e).connect(env));
    env.connect(G.low); envelope(env.gain, t0, s, e, level, s > t0 + 0.5 ? 2 : XF);
  }
  function soloNote(G, t, midi, len, level, pan) {
    const c = G.c, fb = fofBuf(midi, 'ah'), env = c.createGain(), pn = c.createStereoPanner(), lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 5200; pn.pan.value = pan;
    loopSrc(G, fb.buf, fb.rate, LOOPV, t, t + len + 2.6).connect(lp).connect(env).connect(pn).connect(G.bus);
    const g = env.gain, a = Math.min(1.4, len * 0.35);
    g.setValueAtTime(0, t); g.linearRampToValueAtTime(level, t + a); g.setValueAtTime(level, t + len - 0.2); g.linearRampToValueAtTime(level * 0.55, t + len + 0.3); g.linearRampToValueAtTime(0, t + len + 2.5);
  }
  function harpsi(G, t, midi, level, pan) {
    const c = G.c, src = c.createBufferSource(), g = c.createGain(), pn = c.createStereoPanner(); src.buffer = hpBuf(midi); g.gain.value = level; pn.pan.value = pan;
    src.connect(g).connect(pn).connect(G.bus); src.start(t);
  }
  function bell(G, t, level) {
    const c = G.c, nom = F(52), out = c.createGain(), pn = c.createStereoPanner(); out.gain.value = level; pn.pan.value = 0.15; out.connect(pn).connect(G.bus);
    [[0.25, 1, 20], [0.5, 0.7, 12], [0.6, 0.55, 10], [0.75, 0.3, 7], [1, 0.45, 6], [1.25, 0.18, 4], [2, 0.1, 2.5]].forEach(([rt, a, dec]) => {
      [-0.35, 0.35].forEach(dv => {
        const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = nom * rt + dv;
        g.gain.setValueAtTime(0.00001, t); g.gain.linearRampToValueAtTime(a * 0.5, t + 0.025); g.gain.exponentialRampToValueAtTime(a * 0.0008, t + dec * 1.5);
        o.connect(g).connect(out); o.start(t); o.stop(t + dec * 1.5 + 0.1);
      });
    });
  }

  function mixAt(sec) {
    const b = Math.min(1, sec / 60), build = b * b * (3 - 2 * b), toEnd = duration - sec, tail = toEnd < 45 ? Math.max(0, toEnd / 45) : 1;
    return { choir: 0.03 * (0.45 + 0.55 * build), throne: 0.12, solo: 0.045 * (sec > 12 ? 1 : 0) * tail, hp: 0.028 * tail, bell: 0.042 * tail };
  }
  function scheduleBar(G, b, origin, from, until) {
    if (b < 0) return;
    const ci = b % 4, cyc = Math.floor(b / 4), pic = cyc % 2 === 1, ch = PROG[ci], t0 = origin + b * BAR, m = mixAt(b * BAR);
    if (t0 + BAR + XF <= from + 0.2 || t0 > until) return;
    const inWin = t => t >= t0 && t < t0 + BAR && t >= from && t < until;
    throne(G, t0, ch.bass, BAR + XF, m.throne, from);
    const parts = ci === 0 && pic ? ch.pic : ch.parts, pans = [-0.55, 0.45, -0.2, 0.6, 0.05], lv = [1.1, 1, 0.9, 0.8, 0.72];
    parts.forEach((mi, i) => choirVoice(G, t0, mi, BAR + XF, m.choir * lv[i], pans[i], from));
    const cs = origin + cyc * CYCLE, r = seeded(cyc * 13 + 7);
    if (ci === 0) { if (inWin(cs + 2)) bell(G, cs + 2, m.bell); if (pic && inWin(cs + 9)) bell(G, cs + 9, m.bell * 0.75); }
    if (m.solo > 0.001) PHRASES.forEach(ph => {
      if (ph.every === 2 && !pic) return;
      let t = cs + ph.st;
      ph.n.forEach(([mi, len], i) => { const note = pic && ci === 0 && mi === 67 ? 68 : mi; if (inWin(t)) soloNote(G, t, note, len, m.solo * (0.9 + 0.2 * r()), (i % 2 ? 0.18 : -0.18)); t += len; });
    });
    if (ci === 1 || ci === 3) {
      const up = ch.parts.map(x => x + 12), pat = [0, 1, 2, 3, 4, 3, 2, 1, 0, 2, 4, 3];
      pat.forEach((k, i) => { const t = t0 + 18 + i * 1.35 + (i % 2 ? 0.04 : 0); if (inWin(t)) harpsi(G, t, up[k], m.hp * (i < 8 ? 1 : 0.7), (k - 2) * 0.22); });
    }
  }

  // ---------------------------------------------------------------- transport
  let ctx = null, G = null, want = false, gen = 0, origin = 0, AT = 0, nextBar = 0, timer = null, seekTimer = null;
  let muted = false, volume = 0.8, clock = () => 0;
  const now = () => ctx.currentTime;
  const target = () => muted ? 0.0001 : Math.max(0.0001, volume);
  function ensureCtx() { if (!ctx || ctx.state === 'closed') { const AC = window.AudioContext || window.webkitAudioContext; ctx = new AC({ latencyHint: 'playback' }); } }
  let unlockEl = null, resumeTries = 0;
  function silentWav() { const sr = 8000, n = sr, dv = new DataView(new ArrayBuffer(44 + n)); const Wr = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); }; Wr(0, 'RIFF'); dv.setUint32(4, 36 + n, true); Wr(8, 'WAVEfmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true); dv.setUint32(24, sr, true); dv.setUint32(28, sr, true); dv.setUint16(32, 1, true); dv.setUint16(34, 8, true); Wr(36, 'data'); dv.setUint32(40, n, true); for (let i = 0; i < n; i++) dv.setUint8(44 + i, 128); return URL.createObjectURL(new Blob([dv.buffer], { type: 'audio/wav' })); }
  function unlock() {
    if (ctx && ctx.state !== 'running' && resumeTries >= 1) { try { kill(0); ctx.close(); } catch (e) {} ctx = null; resumeTries = 0; }
    ensureCtx();
    try { const b = ctx.createBuffer(1, 1, 22050), s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0); } catch (e) {}
    if (ctx.state !== 'running') { resumeTries++; ctx.resume().then(() => { resumeTries = 0; }).catch(() => {}); }
    if (!unlockEl) { unlockEl = document.createElement('audio'); unlockEl.setAttribute('playsinline', ''); unlockEl.setAttribute('webkit-playsinline', ''); unlockEl.loop = true; unlockEl.src = silentWav(); document.body.appendChild(unlockEl); }
    if (unlockEl.paused) unlockEl.play().catch(() => {});
  }
  function kill(d) {
    if (timer) { clearInterval(timer); timer = null; }
    if (!G) return;
    const g = G, t = now(); G = null;
    try { g.master.gain.cancelScheduledValues(t); g.master.gain.setValueAtTime(Math.max(0.0001, g.master.gain.value), t); g.master.gain.linearRampToValueAtTime(0, t + d); } catch (e) {}
    setTimeout(() => { try { g.out.disconnect(); } catch (e) {} }, d * 1000 + 250);
  }
  function tick() { if (!G) return; const hz = now() - origin + 1.5; while (nextBar * BAR < hz) { scheduleBar(G, nextBar, origin, now() + 0.03, Infinity); nextBar++; } }
  function rebuild(at) {
    kill(0.4);
    AT = Math.max(0, at); origin = now() + 0.15 - AT; G = buildGraph(ctx, ctx.destination, origin);
    const b0 = Math.floor(AT / BAR), from = now() + 0.1;
    if (b0 > 0) scheduleBar(G, b0 - 1, origin, from, Infinity);
    scheduleBar(G, b0, origin, from, Infinity);
    nextBar = b0 + 1; tick(); timer = setInterval(tick, 250);
    const p = G.master.gain, t = now(); p.setValueAtTime(0.0001, t);
    if (AT < 1) p.exponentialRampToValueAtTime(target(), t + 6); else p.linearRampToValueAtTime(target(), t + 1.5);
  }
  function play() { want = true; const my = ++gen; unlock(); const go = () => { if (my === gen && want && ctx.state === 'running' && (!G || G.c !== ctx)) rebuild(clock()); }; if (ctx.state === 'running') { if (!G || G.c !== ctx) rebuild(clock()); } else { ctx.resume().then(go).catch(() => {}); setTimeout(() => { if (my === gen && want && ctx.state === 'running' && !G) rebuild(clock()); }, 500); } }
  function pause() { want = false; gen++; clearTimeout(seekTimer); if (ctx) kill(0.9); }
  let seekPending = false;
  function seek() { if (!want) return; clearTimeout(seekTimer); seekPending = true; const my = gen; seekTimer = setTimeout(() => { seekPending = false; if (my === gen && want && ctx && ctx.state === 'running') rebuild(clock()); }, 90); }
  function resumeIfPending() { if (!want || !ctx) return; if (ctx.state !== 'running' || !G) play(); }
  let lastCT = -1, lastCTWall = 0;
  function isRunning() { if (!G || !ctx || ctx.state !== 'running') return false; const ct = ctx.currentTime, w = performance.now(); if (ct !== lastCT) { lastCT = ct; lastCTWall = w; return true; } return w - lastCTWall < 700; }
  function prime() { unlock(); }
  function setGain() { if (G) { const p = G.master.gain, t = now(); p.cancelScheduledValues(t); p.setValueAtTime(Math.max(0.0001, p.value), t); p.linearRampToValueAtTime(target(), t + 0.3); } }
  async function renderSegment(a, len, gain) {
    const sr = 48000, PRE = a > 0 ? Math.min(16, a) : 0, s0 = a - PRE;
    const oc = new OfflineAudioContext(2, Math.ceil((len + PRE) * sr), sr);
    const org = -s0, g = buildGraph(oc, oc.destination, org); g.master.gain.value = gain == null ? volume : gain;
    const bb = Math.max(0, Math.floor(s0 / BAR));
    for (let b = Math.max(0, bb - 1); b <= Math.floor((a + len) / BAR); b++) scheduleBar(g, b, org, 0, len + PRE);
    const buf = await oc.startRendering(), off = Math.round(PRE * sr), n = Math.round(len * sr);
    return { sr, L: buf.getChannelData(0).slice(off, off + n), R: buf.getChannelData(1).slice(off, off + n) };
  }
  return {
    BAR, CYCLE, play, pause, seek, resumeIfPending, prime, isRunning, renderSegment,
    setClock: fn => { clock = fn; },
    setDuration: s => { duration = Math.max(60, s || 60); },
    setMuted: m => { muted = !!m; setGain(); },
    setVolume: v => { volume = Math.min(1, Math.max(0, v)); setGain(); },
    isMuted: () => muted,
    position: () => (G && want && !seekPending && ctx && ctx.state === 'running' ? now() - origin : null),
  };
})();
