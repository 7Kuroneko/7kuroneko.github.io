/* PORTALS · Brand trailer "Sophia" — score v5 (v3's music, YouTube master, no noise crashes): dark, melodic, angelic. Rendered offline in the browser to a WAV.
   v4: 48 kHz (was 24 kHz), lighter sub and heartbeat, presence for phone and laptop speakers, softer treble cut, and a look-ahead limiter
   v6: no drop-out entering the portal: the choir, soprano and sub carry straight through 0:32 into the rush.
   v5: the white-noise crash, riser and wash at each hit are gone; the hits are a low thump, the risers rise in tone.
   mastering the whole score to −14 LUFS with true peak under −1 dBTP (was −17 LUFS, peak-normalised).
   One key: a minor mode on 264 Hz (the 132 family: 132 · 198 · 264 · 396 · 528 · 792 · 1056), with 963 Hz alone for the stillness.
   A slow hymn in four-part choir, a soprano melody over it, a dark harp, a heartbeat. Scored to picture:
     00 VOID     the Matrix: distant data rain, a low male choir and machine drone, a 528 Hz signal; a swell, a breath, then
     08 FIELD    the drop. i – VI – III – VII. The harp walks the chords, the soprano enters at 0:11
     20 PORTAL   i – VI – iv – V. The choir opens to "ah", a second soprano joins, the melody climbs to 1056 Hz; a riser, a vacuum
     32 THROUGH  the rush: dark pedal, driving pulse, low harp ostinato, building to
     36.6        THE SUMMIT: the pulse stops; VI – III – VII – i in full choir, the soprano soaring to 1188 Hz, harp sweeps
     44 STILL    963 Hz over 321, three chimes for the three values
     52 MARK     the last hit; the hymn returns and resolves to a major third (Picardy) for the wordmark, tagline and call */
window.SophiaAudio = (function () {
  const SR = 48000, DUR = 64, N = SR * DUR;
  const K = a => 1 - Math.pow(1 - Math.min(0.999, a), 24000 / SR);   // one-pole smoothing, same colour at any sample rate
  const HZ = [[0, 174], [8, 396], [20, 528], [32, 396], [36.6, 528], [44, 963], [52, 528]];
  const freqAt = t => { let f = 174; for (const [a, h] of HZ) if (t >= a) f = h; return f; };
  const RINGS = [8, 11, 14, 17, 20.3, 24.6, 52, 57];
  const BOWLS = [[8, 132, .6], [14, 198, .35], [20.3, 264, .35], [24.6, 528, .7], [36.6, 264, .8], [36.65, 528, .6], [44, 321, .45], [44.05, 963, .3], [52, 132, .8], [52.05, 528, .5]];
  let ns = 92821; const nz = () => { ns ^= ns << 13; ns ^= ns >>> 17; ns ^= ns << 5; return (ns >>> 0) / 2147483648 - 1; };
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const ssf = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const osc = f => { const w = 2 * Math.PI * f / SR, c = Math.cos(w), s = Math.sin(w); let x = 1, y = 0; return () => { const nx = x * c - y * s; y = x * s + y * c; x = nx; return y; }; };
  // harmony
  const R = [1, 9 / 8, 6 / 5, 4 / 3, 3 / 2, 8 / 5, 9 / 5];
  const CHORD = { i: [66, 158.4, 198, 264], VI: [52.8, 132, 158.4, 211.2], III: [79.2, 158.4, 198, 237.6], VII: [59.4, 148.5, 176, 237.6], iv: [88, 132, 176, 211.2], V: [99, 123.75, 148.5, 198], I: [66, 165, 198, 264] };
  const CH = [[0, 'i'], [8, 'i'], [11, 'VI'], [14, 'III'], [17, 'VII'], [20, 'i'], [23, 'VI'], [26, 'iv'], [29, 'V'], [32, 'i'], [36.6, 'VI'], [39, 'III'], [41, 'VII'], [43, 'i'], [52, 'i'], [57, 'I']];
  const chordAt = t => { let c = 'i'; for (const [a, k] of CH) if (t >= a) c = k; return CHORD[c]; };
  const SOP = [[11, 528], [12.5, 594], [13, 633.6], [14, 792], [16, 704], [17, 594], [20, 528], [21, 633.6], [22, 792], [23, 844.8], [25, 792], [25.5, 844.8], [26, 1056], [28, 950.4], [28.5, 990], [29.5, 792],
    [36.6, 844.8], [39, 792], [40, 950.4], [41, 1188], [43, 1056], [52.4, 528], [55, 594], [56, 633.6], [57, 660], [59.8, 528]];
  const ALT = [[23, 633.6], [26, 704], [29, 594], [36.6, 633.6], [39, 633.6], [41, 594], [43, 528]];
  // ---- sample-domain layers: D = dry, E = echo send ----
  const D = [new Float32Array(N), new Float32Array(N)], E = [new Float32Array(N), new Float32Array(N)];
  function put(t, len, pan, fn, send = 0) {
    const i0 = Math.floor(t * SR); if (i0 >= N || i0 < 0) return; const n = Math.min(Math.floor(len * SR), N - i0), gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
    for (let i = 0; i < n; i++) { const v = fn(i), k = i0 + i; D[0][k] += v * gl; D[1][k] += v * gr; if (send) { E[0][k] += v * gl * send; E[1][k] += v * gr * send; } }
  }
  function harp(t, f, amp, dec, pan, send = 0.45) {
    const o1 = osc(f), o2 = osc(f * 2), o3 = osc(f * 3.01), k1 = Math.exp(-1 / (dec * SR)), k2 = Math.exp(-1 / (dec * 0.22 * SR)), att = SR * 0.004; let e1 = amp, e2 = amp * 0.28;
    put(t, dec * 5, pan, i => { const v = (o1() * e1 + o2() * e2 + o3() * e2 * 0.25) * (i < att ? i / att : 1); e1 *= k1; e2 *= k2; return v; }, send);
  }
  function tick(t, f, amp, len, sq, pan) { const o = osc(f), k = Math.exp(-1 / (len * 0.3 * SR)); let e = amp; put(t, len, pan, () => { const y = o(); e *= k; return (sq ? (y > 0 ? 0.5 : -0.5) : y) * e; }, 0.55); }
  function bowl(t, f, amp) {
    const kx = f < 300 ? 1.4 : 1;
    [[1, 1, 9], [2.76, .4, 5], [5.4, .18, 3], [8.93, .07, 1.8]].forEach(([r, a, d], pi) => (pi ? [0] : [0, 0.8]).forEach((det, j) => {
      const dd = d * kx, len = Math.min(dd * 2.6, 22), o = osc(f * r + det), k = Math.exp(-1 / (dd * SR)), att = SR * 0.02, fade = len * SR * 0.8; let e = amp * a * 0.12;
      put(t, len, pi ? (pi % 2 ? 0.3 : -0.3) : (j ? 0.35 : -0.35), i => { e *= k; return o() * e * (i < att ? i / att : 1) * (i > fade ? 1 - (i - fade) / (len * SR * 0.2) : 1); }, 0.2);
    }));
  }
  function heart(t, amp) { let ph = 0, y = 0; put(t, 1.4, 0, i => { const tt = i / SR; ph += 2 * Math.PI * (46 + 70 * Math.exp(-tt / 0.045)) / SR; y += K(0.05) * (nz() - y); return (Math.sin(ph) * Math.exp(-tt / 0.42) + y * 0.6 * Math.exp(-tt / 0.08)) * amp; }, 0.08); }
  function boom(t, amp) {
    let ph = 0, y = 0; put(t, 6, 0, i => { const tt = i / SR; ph += 2 * Math.PI * (32 + 70 * Math.exp(-tt / 0.3)) / SR; y += K(0.18 * Math.exp(-tt / 0.2) + 0.006) * (nz() - y);
      return Math.sin(ph) * Math.exp(-tt / 2) * amp; }, 0.2);
  }
  function swell(t0, t1, amp) { const L = (t1 - t0) * SR, os = [264, 396, 528, 792].map(osc); put(t0, t1 - t0, 0, i => { const u = i / L; return (os[0]() + os[1]() * 0.7 + os[2]() * 0.5 + os[3]() * 0.3) * amp * 0.12 * u * u * u * (1 - Math.pow(u, 40)); }, 0.6); }
  function fall(t, len, amp) { }   // v5: the white-noise wash after each hit is gone
  function stutter(t, base) {
    const g = new Float32Array(Math.floor(0.035 * SR)), o = osc(base); let y = 0; for (let i = 0; i < g.length; i++) { const n = nz(); y += K(0.25) * (n - y); g[i] = (y * 0.6 + o() * 0.3) * Math.sin(Math.PI * i / g.length); }
    for (let r = 0; r < 6; r++) { const a = 0.09 * (1 - r / 7); put(t + r * 0.06, 0.035, r % 2 ? 0.55 : -0.55, i => g[i] * a, 0.6); }
  }
  const KT = [];
  const yieldNow = () => new Promise(r => setTimeout(r, 0));
  async function synth() {
  // ---- 00 VOID ----
  const TK = [528, 594, 633.6, 792, 950.4, 1056, 1188, 1267.2];
  for (let t = 0.2; t < 8;) { const rate = 5 + 45 * ssf(0.5, 3, t) * (1 - ssf(4.6, 7.6, t)); t += -Math.log(1 - rnd() * 0.999) / rate; if (t >= 7.8) break;
    tick(t, TK[Math.floor(rnd() * TK.length)] * (rnd() < 0.3 ? 0.5 : 1), 0.03 + 0.045 * rnd(), 0.02 + 0.05 * rnd(), rnd() < 0.15, rnd() * 1.6 - 0.8); }
  [1.9, 3.4, 4.7].forEach((t, i) => stutter(t, [1056, 792, 1188][i]));
  [5.2, 6.1, 6.9].forEach((t, i) => harp(t, 528, 0.1 - i * 0.015, 0.5, [-0.3, 0.3, 0][i], 0.9));
  swell(6.2, 8, 0.45); boom(8, 0.85); fall(8, 2.6, 0.25);
  await yieldNow();
  // ---- harp ----
  const hset = c => [c[1] * 2, c[2] * 2, c[3] * 2, c[1] * 4, c[2] * 4, c[3] * 4], HP = [0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3];
  let k = 0; for (let t = 8.5; t < 31.5; k++) { const h = hset(chordAt(t)), acc = k % 6 === 0; harp(t, h[HP[k % HP.length]], (acc ? 0.11 : 0.075) * (0.6 + 0.4 * ssf(8.5, 13, t)), 1.7, Math.sin(k * 0.7) * 0.5); t += t < 24.6 ? 0.5 : 0.375; }
  k = 0; for (let t = 32; t < 36.45; t += 0.25, k++) { const lo = [132, 158.4, 198, 264, 198, 158.4][k % 6]; harp(t, lo, k % 4 ? 0.07 : 0.1, 0.7, k % 2 ? 0.4 : -0.4, 0.3); }
  [36.6, 39, 41, 43].forEach(t0 => { const h = hset(chordAt(t0 + 0.01)), g = [...h, h[3] * 2, h[4] * 2]; g.forEach((f, i) => harp(t0 + i * 0.09, f, 0.07, 2.4, -0.7 + i * 0.18, 0.5)); });
  k = 0; for (let t = 37.6; t < 43.8; t += 0.5, k++) { const h = hset(chordAt(t)); harp(t, h[HP[k % HP.length]] * 2, 0.045, 2, Math.sin(k) * 0.6, 0.6); }
  k = 0; for (let t = 52.5; t < 56.9; t += 0.5, k++) { const h = hset(CHORD.i), g = [h[5] * 2, h[4] * 2, h[3] * 2, h[5], h[4], h[3], h[2], h[1], h[0]]; harp(t, g[k], 0.11, 2.2, Math.sin(k) * 0.4, 0.6); }
  await yieldNow();
  // ---- heartbeat ----
  for (let t = 9.5; t < 24.6; t += 1.5) { heart(t, 0.34); heart(t + 0.28, 0.16); }
  for (let t = 26; t < 31.5; t += 0.75) heart(t, 0.26 + 0.18 * ssf(26, 31.5, t));
  for (let t = 32.75; t < 36.4; t += 0.75) { KT.push(t); heart(t, 0.55); heart(t + 0.25, 0.2); }
  await yieldNow();
  // ---- transitions ----
  swell(29.8, 31.65, 0.55); boom(32, 0.95); fall(32, 2.6, 0.3);
  swell(34.6, 36.6, 0.6); boom(36.6, 0.6); fall(36.6, 3.5, 0.3);
  fall(44, 3, 0.18);
  swell(50.4, 52, 0.45); boom(52, 0.85); fall(52, 2.6, 0.25);
  [[45.4, 481.5], [46.7, 642], [48, 963]].forEach(([t, f], i) => harp(t, f, 0.1, 2.6, (i - 1) * 0.4, 0.65));
  [[57, [528, 660, 792]], [58.4, [396, 594]], [59.8, [264, 396, 528, 1056]]].forEach(([t, fs]) => fs.forEach((f, i) => harp(t + i * 0.04, f, 0.09, 2.8, (i - fs.length / 2) * 0.25, 0.6)));
  await yieldNow();
  for (const [t, f, am] of BOWLS) { bowl(t, f, am); await yieldNow(); }
  }
  async function render() {
    await new Promise(r => setTimeout(r, 400)); await synth();
    const ac = new OfflineAudioContext(2, N, SR);
    const master = ac.createGain(), hs = ac.createBiquadFilter(), ls = ac.createBiquadFilter(), comp = ac.createDynamicsCompressor();
    hs.type = 'highshelf'; hs.frequency.value = 7000; hs.gain.value = -2.5; ls.type = 'lowshelf'; ls.frequency.value = 110; ls.gain.value = -3;
    const hp = ac.createBiquadFilter(), pres = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 30; hp.Q.value = 0.7; pres.type = 'peaking'; pres.frequency.value = 2400; pres.Q.value = 0.8; pres.gain.value = 3.5;
    comp.threshold.value = -18; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.35; master.connect(hp); hp.connect(hs); hs.connect(pres); pres.connect(ls); ls.connect(comp); comp.connect(ac.destination);
    const mg = master.gain; mg.setValueAtTime(1, 0);
    [[7.7, 7.95, 8, .2], [31.45, 31.95, 32, .8], [51.8, 51.97, 52, .3]].forEach(([a, b, c, v]) => { mg.setValueAtTime(1, a); mg.linearRampToValueAtTime(v, b); mg.setValueAtTime(v, c - 0.002); mg.linearRampToValueAtTime(1, c); });
    mg.setValueAtTime(1, 61.5); mg.linearRampToValueAtTime(0, 64);
    const ir = ac.createBuffer(2, SR * 5, SR);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); let y = 0; for (let i = 0; i < d.length; i++) { const t = i / SR; y += K(0.5 - 0.35 * Math.min(1, t / 4)) * ((rnd() * 2 - 1) - y); d[i] = y * Math.exp(-t / 1.6) * Math.min(1, t / 0.03); } }
    const conv = ac.createConvolver(); conv.buffer = ir; const wet = ac.createGain(); wet.gain.value = 0.62; conv.connect(wet); wet.connect(master);
    const bus = ac.createGain(), dry = ac.createGain(); dry.gain.value = 0.5; bus.connect(dry); dry.connect(master); bus.connect(conv);
    const pad = ac.createGain(); pad.connect(bus); const pg = pad.gain; pg.setValueAtTime(1, 0);
    KT.forEach(t => { pg.linearRampToValueAtTime(1, t); pg.linearRampToValueAtTime(0.55, t + 0.02); pg.linearRampToValueAtTime(1, t + 0.5); });
    const buf = (L, Rr) => { const b = ac.createBuffer(2, N, SR); b.copyToChannel(L, 0); b.copyToChannel(Rr, 1); const s = ac.createBufferSource(); s.buffer = b; s.start(0); return s; };
    buf(D[0], D[1]).connect(bus);
    const es = buf(E[0], E[1]), sp = ac.createChannelSplitter(2), mx = ac.createChannelMerger(2), dL = ac.createDelay(2), dR = ac.createDelay(2), fL = ac.createGain(), fR = ac.createGain(), lp = ac.createBiquadFilter(), eg = ac.createGain();
    dL.delayTime.value = 0.75; dR.delayTime.value = 0.5; fL.gain.value = 0.36; fR.gain.value = 0.36; lp.type = 'lowpass'; lp.frequency.value = 2600; eg.gain.value = 0.6;
    es.connect(sp); sp.connect(dL, 0); sp.connect(dR, 1); dL.connect(fL); fL.connect(lp); lp.connect(dR); dR.connect(fR); fR.connect(dL);
    dL.connect(mx, 0, 0); dR.connect(mx, 0, 1); mx.connect(eg); eg.connect(bus);
    const env = (p, pts) => { p.setValueAtTime(pts[0][1], pts[0][0]); for (let i = 1; i < pts.length; i++) p.linearRampToValueAtTime(pts[i][1], pts[i][0]); };
    const span = pts => [pts[0][0], pts[pts.length - 1][0] + 0.1];
    const out = (node, pv, dest = bus) => { const p = ac.createStereoPanner(); p.pan.value = pv; node.connect(p); p.connect(dest); };
    function tone(f, pts, pv = 0, vib = 0, dest = bus) {
      const [a, b] = span(pts), o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f; g.gain.value = 0; env(g.gain, pts); o.connect(g); out(g, pv, dest);
      if (vib) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 4.4 + rnd(); lg.gain.value = f * vib; l.connect(lg); lg.connect(o.frequency); l.start(a); l.stop(b); }
      o.start(a); o.stop(b);
    }
    // a sung line: detuned saws through vowel formants, legato glides, vibrato in cents; optional pure sine underneath
    function voice(notes, pts, pv, formants, dest, o = {}) {
      const [a, b] = span(pts), g = ac.createGain(); g.gain.value = 0; env(g.gain, pts);
      const lpf = ac.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = o.lp || 3000; lpf.connect(g);
      const mix = ac.createGain(); formants.forEach(([fc, q, gn]) => { const bp = ac.createBiquadFilter(), bg = ac.createGain(); bp.type = 'bandpass'; bp.frequency.value = fc; bp.Q.value = q; bg.gain.value = gn; mix.connect(bp); bp.connect(bg); bg.connect(lpf); });
      const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = (o.vr || 4.8) + rnd() * 0.5; lg.gain.value = o.vc || 14; l.connect(lg); l.start(a); l.stop(b);
      const set = os => { os.frequency.setValueAtTime(notes[0][1], a); notes.forEach(([t, f]) => { if (t > a) os.frequency.setTargetAtTime(f, t, o.glide || 0.09); }); };
      (o.saws || [-7, 0, 7]).forEach(ct => { const os = ac.createOscillator(); os.type = 'sawtooth'; set(os); os.detune.value = ct; lg.connect(os.detune); os.connect(mix); os.start(a); os.stop(b); });
      if (o.sine) { const os = ac.createOscillator(), sg = ac.createGain(); set(os); lg.connect(os.detune); sg.gain.value = o.sine; os.connect(sg); sg.connect(lpf); os.start(a); os.stop(b); }
      out(g, pv, dest);
    }
    const OO = [[300, 6, 1], [750, 8, .4]], AH = [[700, 6, 1], [1100, 8, .5], [2500, 10, .15]], SOPF = [[880, 5, 1], [1350, 7, .5], [2900, 9, .25]], MALE = [[280, 6, 1], [620, 7, .35]];
    const part = j => CH.map(([t, c]) => [t, CHORD[c][j]]);
    // the four-part hymn, "oo"
    voice(part(0).map(([t, f]) => [t, f * 2]), [[0, 0], [2.5, .04], [7.6, .05], [7.85, 0], [8, 0], [8.6, .055], [31.5, .06], [32.3, .055], [43.6, .055], [44.6, 0], [52, 0], [52.6, .055], [63.9, 0]], -0.25, MALE, pad, { lp: 1400 });
    voice(part(1), [[0, 0], [3, .03], [7.6, .035], [7.85, 0], [8, 0], [9, .045], [31.5, .05], [36.6, .05], [44.6, 0], [52, 0], [52.8, .045], [63.9, 0]], 0.25, OO, pad);
    voice(part(2), [[8, 0], [9.5, .04], [31.5, .045], [36.6, .045], [44.6, 0], [52, 0], [53, .04], [63.9, 0]], -0.1, OO, pad);
    voice(part(3), [[8, 0], [10, .035], [31.5, .04], [36.6, .04], [44.6, 0], [52, 0], [53.4, .04], [63.9, 0]], 0.1, OO, pad);
    // "ah" choir for the portal, the rush and the summit, an octave up
    const AHE = [[20, 0], [23, .025], [31.5, .05], [32.4, .05], [36.4, .05], [36.9, .07], [43.5, .065], [44.6, 0]];
    [1, 2, 3].forEach(j => voice(part(j).map(([t, f]) => [t, f * 2]), AHE, [-0.4, 0, 0.4][j - 1], AH, pad));
    voice(part(3).map(([t, f]) => [t, f * 4]), [[36.4, 0], [37.4, .035], [43.5, .035], [44.6, 0]], 0.2, AH, bus, { lp: 4000 });
    // soprano melody and second soprano
    voice(SOP, [[10.6, 0], [11.8, .05], [17, .055], [19.6, .035], [20.4, .05], [31.5, .07], [36.4, .075], [37.2, .085], [43.6, .075], [44.6, 0], [52.2, 0], [53.2, .055], [61, .05], [63.9, 0]], 0.05, SOPF, bus, { saws: [-5, 5], sine: 1.6, vc: 22, vr: 5.2, glide: 0.12, lp: 3800 });
    voice(ALT, [[24, 0], [25.5, .035], [31.5, .045], [36.4, .045], [37.4, .05], [43.6, .045], [44.6, 0]], -0.2, SOPF, bus, { saws: [-6, 6], sine: 1.2, vc: 18, vr: 4.9, glide: 0.14, lp: 3400 });
    // sub following the bass, and the dark machine of the void
    { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(66, 0); CH.forEach(([t, c]) => o.frequency.setTargetAtTime(CHORD[c][0], t, 0.1)); g.gain.value = 0; env(g.gain, [[0, 0], [3, .065], [7.6, .08], [7.85, 0], [8, 0], [8.4, .095], [31.5, .095], [32.2, .11], [43.6, .095], [44.6, 0], [52, 0], [52.3, .095], [63.9, 0]]); o.connect(g); g.connect(pad); o.start(0); o.stop(64); }
    { const o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(), l = ac.createOscillator(), lg = ac.createGain(); o.type = 'sawtooth'; o.frequency.value = 43.5; f.type = 'lowpass'; f.frequency.value = 140; f.Q.value = 5;
      l.frequency.value = 0.15; lg.gain.value = 70; l.connect(lg); lg.connect(f.frequency); g.gain.value = 0; env(g.gain, [[0, 0], [2, .14], [7.6, .16], [7.85, 0]]); o.connect(f); f.connect(g); g.connect(bus); o.start(0); l.start(0); o.stop(8); l.stop(8); }
    { const o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(); o.type = 'sawtooth'; o.frequency.value = 66; f.type = 'lowpass'; f.frequency.setValueAtTime(120, 32); f.frequency.exponentialRampToValueAtTime(900, 36.4); f.Q.value = 3;
      g.gain.value = 0; env(g.gain, [[32, 0], [32.3, .09], [36.3, .12], [36.6, 0]]); o.connect(f); f.connect(g); g.connect(pad); o.start(32); o.stop(36.7); }
    tone(174, [[0, 0], [3, .03], [7.6, .03], [7.85, 0]], -.6); tone(174.5, [[0, 0], [3, .03], [7.6, .03], [7.85, 0]], .6);
    [[1056, -.6], [1584, .6]].forEach(([f, pv]) => tone(f, [[24.4, 0], [26, .008], [31.5, .012], [36.4, .012], [36.8, 0]], pv, .003));
    // STILL
    voice([[44, 321]], [[44, 0], [46, .045], [51, .04], [52, 0]], -0.1, OO, bus);
    tone(963, [[44, 0], [45.5, .03], [51.5, .025], [52, 0]], .3, .0015); tone(963.7, [[44, 0], [45.5, .026], [51.5, .022], [52, 0]], -.3); tone(160.5, [[44, 0], [46, .07], [51.6, .06], [52, 0]]);
    return ac.startRendering();
  }
  // master: fixed gain to −14 LUFS, then a 2 ms look-ahead limiter with a −1.6 dBFS ceiling (true peak stays under −1 dBTP)
  const MASTER = 1.13, CEIL = Math.pow(10, -1.6 / 20);
  function limit(L, Rr) {
    const n = L.length, la = Math.round(0.002 * SR), rel = Math.exp(-1 / (0.12 * SR)), need = new Float32Array(n);
    for (let i = 0; i < n; i++) { const a = Math.max(Math.abs(L[i]), Math.abs(Rr[i])) * MASTER; need[i] = a > CEIL ? CEIL / a : 1; }
    let cur = 1;
    const q = []; const hold = new Float32Array(n);      // running minimum over the look-ahead window
    for (let i = 0; i < n + la; i++) { if (i < n) { while (q.length && need[q[q.length - 1]] >= need[i]) q.pop(); q.push(i); } while (q.length && q[0] <= i - la - 1) q.shift(); const k = i - la; if (k >= 0 && k < n) hold[k] = q.length ? need[q[0]] : 1; }
    for (let i = 0; i < n; i++) { const tgt = hold[i]; cur = tgt < cur ? tgt : tgt + (cur - tgt) * rel; const k = cur * MASTER; L[i] *= k; Rr[i] *= k; }
  }
  function wav(buf) {
    const n = buf.length, L = buf.getChannelData(0), Rr = buf.getChannelData(1); limit(L, Rr);
    const ab = new ArrayBuffer(44 + n * 4), v = new DataView(ab), ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    ws(0, 'RIFF'); v.setUint32(4, 36 + n * 4, true); ws(8, 'WAVE'); ws(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true);
    v.setUint32(24, SR, true); v.setUint32(28, SR * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); ws(36, 'data'); v.setUint32(40, n * 4, true);
    let o = 44, d = 7; const dith = () => { d = (d * 16807) % 2147483647; return d / 2147483647; };
    for (let i = 0; i < n; i++) { const tp = (dith() - dith()) / 32768, a = Math.max(-1, Math.min(1, L[i] + tp)), b = Math.max(-1, Math.min(1, Rr[i] + tp)); v.setInt16(o, Math.round(a * 32767), true); v.setInt16(o + 2, Math.round(b * 32767), true); o += 4; }
    return new Blob([ab], { type: 'audio/wav' });
  }
  // the finished score is kept in the browser cache after the first render, so every later load skips the ~40 s synthesis
  const CKEY = './__portals-score/sophia-v5.wav';
  const t0 = performance.now(), ready = (async () => {
    try { if (self.caches) { const hit = await (await caches.open('portals-scores')).match(CKEY); if (hit) { console.log('Sophia score from cache'); return URL.createObjectURL(await hit.blob()); } } } catch (e) {}
    const b = await render(); console.log('Sophia score rendered in', Math.round(performance.now() - t0), 'ms');
    const blob = wav(b);
    try { if (self.caches) await (await caches.open('portals-scores')).put(CKEY, new Response(blob, { headers: { 'Content-Type': 'audio/wav' } })); } catch (e) {}
    return URL.createObjectURL(blob);
  })().catch(e => { console.error('Sophia audio', e); return null; });
  return { ready, freqAt, RINGS, BOWLS, DUR };
})();
