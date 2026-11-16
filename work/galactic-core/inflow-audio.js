/* ============================================================================
 * FOCUSFIELD · GALACTIC CORE — soundscape v4 · "THE LAST LIGHT"
 * ----------------------------------------------------------------------------
 * Someone alone at the edge of the galaxy, watching its white heart turn,
 * knowing these are the last minutes — and finding it beautiful. Vast and warm
 * underneath; above it a pipe organ that slowly finds its voice, rises to one
 * pivotal moment per arc, then lets go, leaving only starlight and a few high
 * tones. Bittersweet, never sad for long. Still made for focus: no beat, no
 * hits, nothing sudden.
 *
 * Built on the recipe of a vast, warm canyon soundfield (measured: one tonal
 * world of D minor / F major with a B♭ floor, 25 s chord holds, dark and steep
 * above 500 Hz, mostly pitched tone, almost no events), composed from scratch.
 *
 *   TUNING  A = 444 Hz, so every C is an exact octave of 528 Hz and every G of
 *           396 Hz (a pure 4:3). Both solfeggio tones also sound literally,
 *           softly, whenever the chord holds them. Under the floor a faint
 *           10 Hz binaural pair (198 Hz left, 208 Hz right — headphones only).
 *   key     D AEOLIAN / F major colour, B♭ floor
 *   chords  B♭maj9 · Dm(add9) · Fmaj9 · Gm9 · B♭maj7♯11 · Dm7 · Csus2 · Fsus2
 *           25 s each, 9 s crossfades, 200 s round
 *   arc     every 10 minutes: settle → the organ finds its voice → the pivotal
 *           moment (full organ, 16′ pedal, the arpeggio doubled) → letting go
 *           (organ falls away, aurora and starlight remain) → a breath
 *
 * VOICES (unique to this track)
 *   FLOOR     sine + soft 2nd/3rd, one note per chord, L/R a fraction of a hertz apart
 *   ORBIT     ensemble pad: four drifting voices per note on a warm wave
 *   ORGAN     additive pipe organ: 8′ principal + 4′ octave + 2⅔′ quint + 2′
 *             fifteenth, two ranks a hair apart; a 16′ pedal under the pivot
 *   ARPEGGIO  an organ-flute figure walking the chord, one note every 0.75 s,
 *             rising out of nothing in the middle of each arc, doubled an
 *             octave up at the pivot, thinning as it lets go
 *   AURORA    the chord's 5th and 9th two octaves up, rising into each light-arc
 *             and in the letting-go
 *   STARLIGHT Gaussian sine grains, a different sky every minute
 *   SOLAR WIND faint air (1–4 kHz) far under everything
 *   CORE      the answer to each light-arc: a slow warm swell, never a hit
 *   SPACE     13 s warm hall, independent L/R
 * API (unchanged): start({at,endAt}) · stop() · setFlashes([{t,k,pan}])
 *   · position() · setMuted(b) · setVolume(v) · isMuted() · resumeIfPending(at)
 *   · renderOffline(sec, vol, onProgress, shouldCancel)
 * Deterministic: every level is a pure function of video time.
 * ==========================================================================*/
window.InflowAudio = (function () {
  const A4 = 444, hz = m => A4 * Math.pow(2, (m - 69) / 12);
  const HOLD = 25, XF = 9, NCH = 8, CYCLE = 600, BLOCK = 10, LOOKAHEAD = 3, END_FADE = 10, DRAW = 7, LXF = 0.7;
  const LV = { floor: 0.15, pad: 0.02, organ: 0.012, pedal: 0.05, arp: 0.022, aurora: 0.025, star: 0.03, core: 0.14, air: 0.03, solf: 0.006, bin: 0.008, trim: 0.8 };
  const CH = [
    { f: 34, n: [46, 53, 57, 60, 62] },   // B♭maj9   B♭2 F3 A3 C4 D4
    { f: 38, n: [50, 57, 62, 64, 65] },   // Dm(add9) D3 A3 D4 E4 F4  (E–F kept an octave+ from the root)
    { f: 29, n: [53, 57, 60, 64, 67] },   // Fmaj9    F3 A3 C4 E4 G4
    { f: 31, n: [55, 58, 62, 65, 69] },   // Gm9      G3 B♭3 D4 F4 A4
    { f: 34, n: [46, 57, 62, 64, 65] },   // B♭maj7♯11 B♭2 A3 D4 E4 F4
    { f: 38, n: [50, 57, 60, 65, 69] },   // Dm7      D3 A3 C4 F4 A4
    { f: 36, n: [48, 55, 62, 67, 69] },   // Csus2(6) C3 G3 D4 G4 A4
    { f: 29, n: [53, 60, 65, 67, 69] },   // Fsus2/6  F3 C4 F4 G4 A4
  ];
  // the chord's colour tones two octaves up (aurora) and the upper set for starlight
  const AUR = [[77, 72], [76, 69], [79, 76], [74, 81], [76, 81], [77, 72], [74, 79], [79, 72]];
  // union note sets → one persistent voice per note, weighted by the chords that contain it
  const PADN = [...new Set(CH.flatMap(c => c.n))].sort((a, b) => a - b);
  const FLRN = [...new Set(CH.map(c => c.f))].sort((a, b) => a - b);
  const AURN = [...new Set(AUR.flat())].sort((a, b) => a - b);
  const seeded = k => { let s = (k * 2654435761) >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0, s / 4294967296); };
  const hash = i => { let x = (Math.imul(i | 0, 2654435761) + 0x6D2B79F5) >>> 0; x = Math.imul(x ^ x >>> 15, 2246822519) >>> 0; x = Math.imul(x ^ x >>> 13, 3266489917) >>> 0; return ((x ^ x >>> 16) >>> 0) / 4294967296; };
  const rc = u => Math.sin(Math.max(0, Math.min(1, u)) * Math.PI / 2) ** 2;
  const sst = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const intro = t => rc(t / 18);

  // chord j is heard on [j·HOLD, (j+1)·HOLD + XF], fading in over XF and out over XF
  function chordW(j, t) { const x = t - j * HOLD; if (x < 0 || x > HOLD + XF) return 0; return rc(x / XF) * rc((HOLD + XF - x) / XF); }
  function noteW(list, pick, m, t) { const j = Math.floor(t / HOLD); let w = 0; for (let k = j - 1; k <= j; k++) { if (k < 0) continue; if (pick(k % NCH).includes(m)) w += chordW(k, t); } return Math.min(1, w); }
  const arcAt = t => { const p = ((t % CYCLE) + CYCLE) % CYCLE / CYCLE; return sst(0.08, 0.45, p) * (1 - sst(0.62, 0.93, p)); };
  const seamDip = t => { const p = ((t % CYCLE) + CYCLE) % CYCLE / CYCLE; return 1 - 0.25 * sst(0.94, 0.97, p) * (1 - sst(0.985, 1, p)); };

  let ARCS = [];                                           // light-arcs from the picture: [{t, k, pan}]
  function arcState(t) {
    let draw = 0, bloom = 0;
    for (const a of ARCS) { const d = t - a.t; if (d < -DRAW - 1) break; if (d > 16) continue;
      if (d < 0) draw = Math.max(draw, rc((d + DRAW) / DRAW)); else { draw = Math.max(draw, rc(1 - d / 2.5)); bloom = Math.max(bloom, rc(d / 2) * rc((16 - d) / 12)); } }
    return { draw, bloom };
  }
  const padCut = t => { const a = arcState(t); return 480 + 1020 * arcAt(t) + 500 * a.draw + 250 * a.bloom; };
  const cycP = t => ((t % CYCLE) + CYCLE) % CYCLE / CYCLE;
  const pivot = t => { const p = cycP(t); return sst(0.4, 0.5, p) * (1 - sst(0.6, 0.7, p)); };
  const lettingGo = t => { const p = cycP(t); return sst(0.64, 0.74, p) * (1 - sst(0.9, 0.95, p)); };
  const organLevel = t => LV.organ * intro(t) * seamDip(t) * (0.2 + 0.5 * sst(0.1, 0.4, cycP(t)) * (1 - sst(0.62, 0.8, cycP(t))) + 0.8 * pivot(t)) * (1 + 0.25 * arcState(t).draw);
  const pedalLevel = t => LV.pedal * pivot(t);
  const arpLevel = t => { const p = cycP(t); return LV.arp * rc((t - 25) / 30) * sst(0.18, 0.36, p) * (1 - sst(0.68, 0.84, p)); };
  const padLevel = t => LV.pad * intro(t) * seamDip(t) * (0.85 + 0.15 * arcAt(t));
  const floorLevel = t => LV.floor * rc(t / 10) * seamDip(t) * (0.85 + 0.15 * Math.sin(2 * Math.PI * t / 73));
  const auroraLevel = t => { const a = arcState(t); return LV.aurora * rc((t - 20) / 30) * (0.12 + 0.4 * arcAt(t) + 0.8 * lettingGo(t) + 0.9 * a.draw + 0.5 * a.bloom); };
  const starDensity = t => rc((t - 30) / 40) * (0.35 + 0.65 * arcAt(t));
  const drift = (i, t) => 5 * Math.sin(2 * Math.PI * t / (31 + 4.3 * (i % 7)) + i * 1.7) + 2.5 * Math.sin(2 * Math.PI * t / (11 + 1.9 * (i % 5)) + i);

  // ---------------------------------------------------------------- graph
  const waveCache = new WeakMap();
  function warmWave(c) { if (waveCache.has(c)) return waveCache.get(c); const a = [0, 1, 0.18, 0.3, 0.07, 0.12, 0.03, 0.05, 0.015], w = c.createPeriodicWave(new Float32Array(a.length), new Float32Array(a)); waveCache.set(c, w); return w; }
  const floorCache = new WeakMap();
  function floorWave(c) { if (floorCache.has(c)) return floorCache.get(c); const w = c.createPeriodicWave(new Float32Array(4), new Float32Array([0, 1, 0.32, 0.1]), { disableNormalization: true }); floorCache.set(c, w); return w; }
  const organCache = new WeakMap();
  function organWave(c) { if (organCache.has(c)) return organCache.get(c); const a = new Float32Array(17); [[1, 1], [2, 0.62], [3, 0.3], [4, 0.36], [5, 0.08], [6, 0.12], [8, 0.1], [10, 0.03], [12, 0.03], [16, 0.015]].forEach(([h, v]) => { a[h] = v; }); const w = c.createPeriodicWave(new Float32Array(17), a); organCache.set(c, w); return w; }
  const fluteCache = new WeakMap();
  function fluteWave(c) { if (fluteCache.has(c)) return fluteCache.get(c); const a = new Float32Array([0, 1, 0.22, 0.09, 0.03]); const w = c.createPeriodicWave(new Float32Array(5), a); fluteCache.set(c, w); return w; }
  function hallIR(c) {
    const sr = c.sampleRate, L = Math.floor(sr * 13), buf = c.createBuffer(2, L, sr);
    for (let ch = 0; ch < 2; ch++) { const r = seeded(509 + ch * 31), d = buf.getChannelData(ch); let lp = 0;
      for (let i = 0; i < L; i++) { const t = i / sr, w = r() * 2 - 1; lp += 0.07 * (w - lp); d[i] = (lp + 0.08 * (w - lp) * Math.exp(-t / 0.6)) * Math.exp(-6.9 * t / 11.5) * (1 - Math.exp(-t * 18)); } }
    return buf;
  }
  function makeGraph(c) {
    const master = c.createGain(); master.gain.value = 0.0001;
    const endFade = c.createGain(); endFade.gain.value = 1;
    const lim = c.createDynamicsCompressor(); lim.threshold.value = -2; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.002; lim.release.value = 0.25;
    const trim = c.createGain(); trim.gain.value = LV.trim;
    const ceil = c.createBiquadFilter(); ceil.type = 'lowpass'; ceil.frequency.value = 6500; ceil.Q.value = 0.5;
    const body = c.createBiquadFilter(); body.type = 'peaking'; body.frequency.value = 400; body.Q.value = 0.7; body.gain.value = 3;
    const shelf = c.createBiquadFilter(); shelf.type = 'lowshelf'; shelf.frequency.value = 100; shelf.gain.value = -2;
    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 24; hp.Q.value = 0.6;
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 14; comp.ratio.value = 1.8; comp.attack.value = 0.2; comp.release.value = 1.5;
    const bus = c.createGain(), dry = c.createGain(), wet = c.createGain(), pre = c.createDelay(0.1); dry.gain.value = 0.55; wet.gain.value = 0.8; pre.delayTime.value = 0.035;
    const hall = c.createConvolver(); hall.normalize = true; hall.buffer = hallIR(c); const hhp = c.createBiquadFilter(); hhp.type = 'highpass'; hhp.frequency.value = 130;
    bus.connect(dry).connect(comp); bus.connect(pre).connect(hhp).connect(hall).connect(wet).connect(comp);
    comp.connect(hp).connect(shelf).connect(body).connect(ceil).connect(trim).connect(lim).connect(endFade).connect(master).connect(c.destination);
    const srcs = [], wave = warmWave(c);
    // FLOOR
    const floorBus = c.createGain(); floorBus.gain.value = 0.0001; floorBus.connect(comp); const fw = c.createGain(); fw.gain.value = 0.12; floorBus.connect(fw).connect(pre);
    const floorGains = FLRN.map((m, i) => { const g = c.createGain(); g.gain.value = 0.0001; g.connect(floorBus);
      [[-0.18, -0.45], [0.18, 0.45]].forEach(([dh, pn]) => { const p = c.createStereoPanner(); p.pan.value = pn; p.connect(g);
        const o = c.createOscillator(); o.setPeriodicWave(floorWave(c)); o.frequency.value = hz(m) + dh; o.connect(p); o.start(); srcs.push(o); });
      return g; });
    // ORBIT pad
    const padLP = c.createBiquadFilter(); padLP.type = 'lowpass'; padLP.frequency.value = 600; padLP.Q.value = 0.35;
    const padLP2 = c.createBiquadFilter(); padLP2.type = 'lowpass'; padLP2.frequency.value = 2200; padLP2.Q.value = 0.3;
    const padBus = c.createGain(); padBus.gain.value = 0.0001; padBus.connect(padLP).connect(padLP2).connect(bus);
    const padGains = [], padOsc = [];
    PADN.forEach((m, i) => { const g = c.createGain(); g.gain.value = 0.0001; g.connect(padBus); padGains.push(g);
      const lvl = m < 50 ? 1.15 : m > 66 ? 0.7 : 1;
      [[-0.95, -10], [0, 0], [0.95, 10]].forEach(([pn, cents], k) => { const o = c.createOscillator(), p = c.createStereoPanner(), og = c.createGain(); o.setPeriodicWave(wave); o.frequency.value = hz(m); o.detune.value = cents; og.gain.value = lvl * 0.62; p.pan.value = pn; o.connect(og).connect(p).connect(g); o.start(); srcs.push(o); padOsc.push({ o, i: i * 3 + k, base: cents }); }); });
    // AURORA
    const aurBus = c.createGain(); aurBus.gain.value = 0.0001; const aw = c.createGain(); aw.gain.value = 1.2; aurBus.connect(aw).connect(pre); const ad = c.createGain(); ad.gain.value = 0.3; aurBus.connect(ad).connect(comp);
    const aurGains = AURN.map((m, i) => { const g = c.createGain(); g.gain.value = 0.0001; g.connect(aurBus);
      [[-6, -0.8], [6, 0.8]].forEach(([ct, pn]) => { const o = c.createOscillator(), p = c.createStereoPanner(); o.type = 'sine'; o.frequency.value = hz(m); o.detune.value = ct; p.pan.value = pn; o.connect(p).connect(g); o.start(); srcs.push(o); });
      return g; });
    // STARLIGHT and CORE buses
    const starBus = c.createGain(); starBus.gain.value = LV.star; const sw = c.createGain(); sw.gain.value = 1.4; starBus.connect(sw).connect(pre); const sd = c.createGain(); sd.gain.value = 0.25; starBus.connect(sd).connect(comp);
    const coreBus = c.createGain(); coreBus.gain.value = LV.core; coreBus.connect(comp); const cw = c.createGain(); cw.gain.value = 0.35; coreBus.connect(cw).connect(pre);
    // SOLAR WIND: independent L/R noise through soft bands, swaying slowly
    const airBus = c.createGain(); airBus.gain.value = 0.0001; airBus.connect(bus);
    const nb = c.createBuffer(2, Math.floor(c.sampleRate * 41.7), c.sampleRate); for (let ch = 0; ch < 2; ch++) { const r = seeded(733 + ch * 11), d = nb.getChannelData(ch); for (let i = 0; i < d.length; i++) d[i] = r() * 2 - 1; }
    const nz = c.createBufferSource(); nz.buffer = nb; nz.loop = true; const split = c.createChannelSplitter(2), merge = c.createChannelMerger(2); nz.connect(split);
    [[0, 1700], [1, 2300]].forEach(([ch, f]) => { const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 0.6; const lp2 = c.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = 3500; split.connect(bp, ch); bp.connect(lp2).connect(merge, 0, ch); });
    merge.connect(airBus); nz.start(); srcs.push(nz);
    // ORGAN: one persistent pair of pipes per chord note, weighted by the chord
    const orgLP = c.createBiquadFilter(); orgLP.type = 'lowpass'; orgLP.frequency.value = 3200; orgLP.Q.value = 0.3;
    const organBus = c.createGain(); organBus.gain.value = 0.0001; organBus.connect(orgLP).connect(bus); const ow = wave && organWave(c);
    const orgGains = PADN.map(m => { const g = c.createGain(); g.gain.value = 0.0001; g.connect(organBus);
      const o = c.createOscillator(), p = c.createStereoPanner(); o.setPeriodicWave(ow); o.frequency.value = hz(m); p.pan.value = Math.max(-0.6, Math.min(0.6, ((m * 7) % 12) / 6 - 0.9)); o.connect(p).connect(g); o.start(); srcs.push(o);
      return g; });
    const pedalBus = c.createGain(); pedalBus.gain.value = 0.0001; pedalBus.connect(comp); const pw = c.createGain(); pw.gain.value = 0.3; pedalBus.connect(pw).connect(pre);
    const pedGains = FLRN.map(m => { const g = c.createGain(); g.gain.value = 0.0001; g.connect(pedalBus); const o = c.createOscillator(); o.setPeriodicWave(ow); o.frequency.value = hz(m + 12); o.connect(g); o.start(); srcs.push(o); return g; });
    const arpBus = c.createGain(); arpBus.gain.value = 1; const arpLP = c.createBiquadFilter(); arpLP.type = 'lowpass'; arpLP.frequency.value = 2600; arpBus.connect(arpLP).connect(bus);
    // SOLFEGGIO 528 / 396 Hz, literal and soft; 10 Hz binaural pair under the floor
    const solfGains = [528, 396].map((f, i) => { const g = c.createGain(); g.gain.value = 0.0001; const p = c.createStereoPanner(); p.pan.value = i ? -0.3 : 0.3; const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f; o.connect(g).connect(p).connect(bus); o.start(); srcs.push(o); return g; });
    const binBus = c.createGain(); binBus.gain.value = 0.0001; binBus.connect(comp); const mg = c.createChannelMerger(2); mg.connect(binBus);
    [[198, 0], [208, 1]].forEach(([f, ch]) => { const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f; o.connect(mg, 0, ch); o.start(); srcs.push(o); });
    return { c, organBus, orgGains, pedalBus, pedGains, arpBus, solfGains, binBus, master, endFade, airBus, floorBus, floorGains, padBus, padLP, padGains, padOsc, aurBus, aurGains, starBus, coreBus, srcs, done: new Set() };
  }
  function curve(param, fn, origin, s, e, step) { s += 0.0005; if (e - s < 0.02) return; const n = Math.max(2, Math.ceil((e - s) / (step || 0.25)) + 1), v = new Float32Array(n); for (let k = 0; k < n; k++) v[k] = fn(s - origin + (e - s) * k / (n - 1)); try { param.setValueCurveAtTime(v, s, e - s); } catch (err) { try { param.linearRampToValueAtTime(v[n - 1], e); } catch (e2) {} } }
  // STARLIGHT: grain k sits at a fixed video time; whether it sounds depends on the density there
  const GSTEP = 1.3;
  function playGrains(G, origin, a, b, from) {
    const c = G.c;
    for (let k = Math.max(0, Math.floor(a / GSTEP)); k * GSTEP < b; k++) {
      const t = k * GSTEP + hash(k * 3 + 1) * GSTEP; if (t < a || t >= b) continue;
      if (hash(k * 3 + 2) > starDensity(t) * 0.55) continue;
      const j = Math.floor(t / HOLD) % NCH, set = CH[j].n.slice(2).map(m => m + 12).concat(AUR[j]), m = set[Math.floor(hash(k * 7 + 5) * set.length)];
      const dur = 1.6 + hash(k * 11 + 3) * 2.6, ts = origin + t; if (ts < from) continue;
      const o = c.createOscillator(), g = c.createGain(), p = c.createStereoPanner(); o.type = 'sine'; o.frequency.value = hz(m) * (1 + (hash(k * 13) - 0.5) * 0.004);
      p.pan.value = hash(k * 17 + 9) * 1.8 - 0.9; const amp = 0.4 + 0.6 * hash(k * 19 + 1), n = 24, v = new Float32Array(n);
      for (let i = 0; i < n; i++) { const x = (i / (n - 1) - 0.5) * 4.5; v[i] = Math.max(0.00001, amp * Math.exp(-x * x / 2)); }
      g.gain.value = 0; try { g.gain.setValueCurveAtTime(v, ts, dur); } catch (e) {}
      o.connect(g).connect(p).connect(G.starBus); o.start(ts); o.stop(ts + dur + 0.05);
    }
  }
  // ARPEGGIO: one organ-flute note every ASTEP s walking the current chord; doubled at the pivot
  const ASTEP = 0.75, APAT = [1, 2, 3, 4, 3, 2, 3, 1];
  function playArp(G, origin, a, b, from) {
    const c = G.c;
    for (let k = Math.max(0, Math.floor(a / ASTEP)); k * ASTEP < b; k++) {
      const t = k * ASTEP; if (t < a) continue; const lv = arpLevel(t); if (lv < LV.arp * 0.02) continue;
      const ts = origin + t; if (ts < from) continue;
      const j = Math.floor(t / HOLD) % NCH, m = CH[j].n[APAT[k % APAT.length]] + 12, acc = (k % 8 === 0 ? 1.15 : 1) * (0.9 + 0.15 * hash(k * 5 + 3));
      const voices = [[m, 1, k % 2 ? 0.35 : -0.35]]; const pv = pivot(t); if (pv > 0.02) voices.push([m + 12, 0.45 * pv, k % 2 ? -0.5 : 0.5]);
      voices.forEach(([mm, a2, pn]) => {
        const o = c.createOscillator(), g = c.createGain(), p = c.createStereoPanner(); o.setPeriodicWave(fluteWave(c)); o.frequency.value = hz(mm); p.pan.value = pn;
        const amp = lv * acc * a2; g.gain.setValueAtTime(0.00001, ts); g.gain.linearRampToValueAtTime(amp, ts + 0.06); g.gain.linearRampToValueAtTime(amp * 0.8, ts + 0.5); g.gain.setTargetAtTime(0.00001, ts + ASTEP * 1.1, 0.35);
        o.connect(g).connect(p).connect(G.arpBus); o.start(ts); o.stop(ts + ASTEP * 1.1 + 2);
      });
    }
  }
  // CORE: the answer to a light-arc — a slow warm swell on the floor note and its fifth
  function playCore(G, f, origin, from) {
    const c = G.c, tf = origin + f.t; if (tf + 14 < from) return; const s = Math.max(tf, from);
    const j = Math.floor(f.t / HOLD) % NCH, root = CH[j].f + 12;
    const p = c.createStereoPanner(); p.pan.value = Math.max(-0.5, Math.min(0.5, (f.pan || 0) * 0.5)); p.connect(G.coreBus);
    [[root, 1, -3], [root + 7, 0.55, 3], [root + 12, 0.35, 0]].forEach(([m, a, ct]) => {
      const o = c.createOscillator(), g = c.createGain(); o.setPeriodicWave(warmWave(c)); o.frequency.value = hz(m); o.detune.value = ct;
      g.gain.setValueAtTime(0.00001, tf); g.gain.setTargetAtTime(a, tf + 0.1, 0.9); g.gain.setTargetAtTime(0.00001, tf + 3.2, 3.2);
      o.connect(g).connect(p); o.start(s); o.stop(tf + 18); G.srcs.push(o);
    });
  }
  function scheduleWindow(G, origin, a, b, from) {
    for (const f of ARCS) { if (f.t < a - 14 || f.t >= b) continue; const id = 'c' + f.t.toFixed(3); if (G.done.has(id)) continue; G.done.add(id); playCore(G, f, origin, from); }
    const s = Math.max(origin + a, from), e = origin + b;
    playGrains(G, origin, a, b, from); playArp(G, origin, a, b, from);
    curve(G.organBus.gain, t => Math.max(0.0001, organLevel(t)), origin, s, e, 0.25);
    curve(G.pedalBus.gain, t => Math.max(0.0001, pedalLevel(t)), origin, s, e, 0.25);
    G.orgGains.forEach((g, i) => curve(g.gain, t => Math.max(0.0001, noteW(null, k => CH[k].n, PADN[i], t)), origin, s, e, 0.5));
    G.pedGains.forEach((g, i) => curve(g.gain, t => Math.max(0.0001, noteW(null, k => [CH[k].f], FLRN[i], t)), origin, s, e, 0.5));
    const hasPC = (pc, t) => { const j = Math.floor(t / HOLD); let w = 0; for (let k = j - 1; k <= j; k++) { if (k < 0) continue; if (CH[k % NCH].n.some(m => m % 12 === pc)) w += chordW(k, t); } return Math.min(1, w); };
    G.solfGains.forEach((g, i) => curve(g.gain, t => Math.max(0.0001, LV.solf * rc((t - 15) / 30) * hasPC(i ? 7 : 0, t) * (0.6 + 0.4 * Math.sin(2 * Math.PI * t / 50 + i * 2))), origin, s, e, 0.25));
    curve(G.binBus.gain, t => Math.max(0.0001, LV.bin * rc((t - 30) / 20)), origin, s, e, 0.5);
    curve(G.floorBus.gain, t => Math.max(0.0001, floorLevel(t)), origin, s, e, 0.25);
    curve(G.padBus.gain, t => Math.max(0.0001, padLevel(t)), origin, s, e, 0.25);
    curve(G.padLP.frequency, padCut, origin, s, e, 0.25);
    curve(G.airBus.gain, t => Math.max(0.0001, LV.air * rc((t - 8) / 20) * (0.5 + 0.5 * Math.sin(2 * Math.PI * t / 97 + 0.8)) * (0.7 + 0.3 * arcAt(t))), origin, s, e, 0.25);
    curve(G.aurBus.gain, t => Math.max(0.0001, auroraLevel(t)), origin, s, e, 0.25);
    G.floorGains.forEach((g, i) => curve(g.gain, t => Math.max(0.0001, noteW(null, k => [CH[k].f], FLRN[i], t)), origin, s, e, 0.5));
    G.padGains.forEach((g, i) => curve(g.gain, t => Math.max(0.0001, noteW(null, k => CH[k].n, PADN[i], t)), origin, s, e, 0.5));
    G.aurGains.forEach((g, i) => curve(g.gain, t => Math.max(0.0001, noteW(null, k => AUR[k], AURN[i], t)), origin, s, e, 0.5));
    G.padOsc.forEach(p => curve(p.o.detune, t => p.base + drift(p.i, t), origin, s, e, 0.5));
  }

  // ---------------------------------------------------------------- live transport
  let liveCtx = null, G = null, built = false, running = false, pending = false, muted = false, volume = 0.8, origin = 0, nextT = 0, timer = null, lastOpts = {};
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
    opts = opts || {}; lastOpts = opts; const at = typeof opts.at === 'number' ? Math.max(0, opts.at) : 0;
    if (built && Math.abs(pos() - at) > 0.25) teardown();
    build(at);
    Promise.resolve(liveCtx.resume ? liveCtx.resume() : null).then(() => {
      pending = false; if (Math.abs(pos() - at) > 0.25) { teardown(); build(at); }
      if (!timer) timer = setInterval(tick, 250); running = true; tick(); scheduleEndFade(opts.endAt);
      const t = now(), g = G.master.gain; g.cancelScheduledValues(t); g.setValueAtTime(Math.max(0.0001, g.value), t);
      if (pos() < 2) g.exponentialRampToValueAtTime(target(), t + 1.5); else g.linearRampToValueAtTime(target(), t + LXF);
    }).catch(() => { pending = true; });
  }
  function teardown() {
    if (!built || !G) { built = false; return; } const old = G, t = now();
    try { old.master.gain.cancelScheduledValues(t); old.master.gain.setValueAtTime(Math.max(0.0001, old.master.gain.value), t); old.master.gain.linearRampToValueAtTime(0, t + LXF); } catch (e) {}
    if (timer) { clearInterval(timer); timer = null; }
    setTimeout(() => { old.srcs.forEach(n => { try { n.stop(); } catch (e) {} }); try { old.master.disconnect(); } catch (e) {} }, LXF * 1000 + 150);
    built = false; running = false; G = null;
  }
  function stop() { if (!built) return; running = false; const t = now(), g = G.master.gain; g.cancelScheduledValues(t); g.setValueAtTime(Math.max(0.0001, g.value), t); g.exponentialRampToValueAtTime(0.0001, t + 2.4); }
  function ramp(sec) { if (built && running) { const t = now(), g = G.master.gain; g.cancelScheduledValues(t); g.setValueAtTime(Math.max(0.0001, g.value), t); g.exponentialRampToValueAtTime(target(), t + sec); } }
  function setMuted(m) { muted = !!m; ramp(0.5); }
  function setVolume(v) { volume = Math.max(0, Math.min(1, v)); if (!muted) ramp(0.3); }
  function setFlashes(list) { ARCS = (list || []).slice().sort((a, b) => a.t - b.t); }
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
window.SurferAudio = window.InflowAudio;
