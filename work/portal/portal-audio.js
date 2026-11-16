/* ============================================================================
 * FOCUSFIELD · PORTAL — soundscape v6 · "EVENT HORIZON" (dark angelic)
 * v6: three semitones lower (E♭ minor), a darker "oh" choir, darker piano and
 *     hall, a quieter halo, and more weight in the floor and the fall.
 * Reference: a deep-space soundfield (measured: tuned ~37 ¢ sharp, a two-octave
 *     sub that carries real weight at 60–120 Hz, slow 75–120 s swells, steep
 *     roll-off above 500 Hz, a ~16-minute bloom, a 22 s fade-in).
 * ----------------------------------------------------------------------------
 * Drifting toward the rift with the whole sky turning around it. Clean, smooth
 * and melodic, with something not-human answering from the other side: a soft
 * felt piano speaks in slow, simple phrases; an ethereal gliding voice — the
 * kind of sound early films used for "otherworldly" — answers from beyond the
 * portal; clean glass strings hold the chords; before each chord the next one
 * is drawn backward into the rift; once per revolution a deep tone falls.
 * The progression turns exactly once per portal revolution (120 s); the ring's
 * breath (≈ 7.4 s) moves the strings.
 *
 * Built on the recipe of a deep, wide soundfield (measured: dark and very wide,
 * slow harmony, steady level, few events), composed from scratch and cleaned:
 * no noise beds, no saturation — only pure tones in a long, dark hall.
 *
 *   key     E♭ MINOR (aeolian) — written below in F♯ and sounded 3 semitones down
 *   chords  F♯m(add9) · Dmaj7 · A(add9) · Esus4 · C♯m7 — 24 s each, 8 s crossfades
 *   arc     10-minute cycle: settle → the piano wakes → the voice from beyond
 *           answers and the fall begins → recede → a breath at the seam
 *
 * VOICES (none used on any other FocusField track)
 *   SERAPH    an angelic choir singing "ah": bright double-voiced tones on the
 *             chord's upper notes, shaped by a vowel filter (subtractive formants
 *             at 800 / 1150 / 2900 Hz), drifting gently in tune, mostly in the hall
 *   HALO      the chord two octaves up, pure, heard only through the hall —
 *             a shimmer of light above everything, swelling in the bloom
 *   PIANO     felt piano, built note by note from stretched (slightly inharmonic)
 *             partials and two strings per note; soft hammers, long pedal decay
 *   ETHER     a gliding sine voice with wide, slow portamento and singing vibrato
 *             (theremin / ondes-Martenot family), answering the piano in the bloom
 *   GLASS STRINGS  pure-sine ensemble on the chord tones, slowly beating pairs,
 *             swelling with the portal ring
 *   INHALE    the next chord rising backward for 4 s into each change (pure tones)
 *   THE FALL  one deep tone per revolution, gliding down a fifth over 110 s
 *   FLOOR     chord-root sub, pure
 *   SPACE     14 s dark hall
 * Deterministic: a pure function of video time.
 * API (unchanged): start({buildup}) · stop() · seek(t) · setMuted(b) ·
 *   setVolume(v) · isMuted() · resumeIfPending() · renderOffline(sec, vol, onProgress, shouldCancel)
 * ==========================================================================*/
window.PortalAudio = (function () {
  const TRANS = -3, A4 = 449.5, hz = m => A4 * Math.pow(2, (m + TRANS - 69) / 12);   // E♭ minor, deep-space tuning (+37 ¢)   // everything sounds 3 semitones lower: E♭ minor
  const HOLD = 24, XF = 8, NCH = 5, REV = 120, CYCLE = 960;
  const BLOCK = 10, LOOKAHEAD = 3, END_FADE = 10, LXF = 0.6;
  const LV = { floor: 0.14, strings: 0.0045, piano: 0.08, ether: 0.026, choir: 0.022, halo: 0.0035, inhale: 0.05, fall: 0.075, trim: 0.75 };
  const CH = [
    { f: 30, n: [42, 49, 54, 57, 61, 68] },   // F♯m(add9)
    { f: 38, n: [45, 50, 54, 57, 61, 64] },   // Dmaj7
    { f: 33, n: [45, 52, 57, 59, 61, 64] },   // A(add9)
    { f: 28, n: [47, 52, 57, 59, 64, 66] },   // Esus4
    { f: 37, n: [49, 52, 56, 59, 64, 68] },   // C♯m7
  ];
  // piano phrase per chord: [midi, beat-time s]; left-hand root at 0
  const PIANO = [
    [[73, 0], [69, 1.5], [71, 3], [66, 4.5], [73, 9], [76, 10.5], [73, 12], [71, 13.5]],
    [[74, 0], [69, 1.5], [73, 3], [66, 4.5], [74, 9], [73, 10.5], [69, 12], [66, 15]],
    [[73, 0], [69, 1.5], [71, 3], [64, 4.5], [69, 9], [71, 10.5], [73, 12], [76, 15]],
    [[71, 0], [69, 1.5], [71, 3], [64, 4.5], [71, 9], [69, 10.5], [66, 12], [64, 15]],
    [[68, 0], [64, 1.5], [66, 3], [61, 4.5], [68, 9], [71, 10.5], [73, 12], [69, 15]],
  ];
  const LH = [42, 38, 45, 40, 37];
  // ether answers: long gliding notes, [midi, seconds]
  const ETHER = [
    [[78, 5], [76, 3], [73, 4], [76, 6]],
    [[81, 4.5], [78, 3.5], [76, 3], [73, 6]],
    [[76, 4], [78, 4], [81, 3], [80, 6]],
    [[73, 5], [76, 3], [78, 4], [76, 6]],
  ];
  const PAD = [...new Set(CH.flatMap(c => c.n))].sort((a, b) => a - b);
  const CHOIRN = [...new Set(CH.flatMap(c => c.n.slice(2).map(m => m + 12)))].sort((a, b) => a - b);
  const HALON = [...new Set(CH.flatMap(c => c.n.slice(2).map(m => m + 24)))].sort((a, b) => a - b);
  const choirLevel = t => swell(t, 0) * LV.choir * rc((t - 6) / 24) * seam(t) * (0.55 + 0.45 * wake(t)) * (0.85 + 0.15 * bloom(t)) * (1 + 0.05 * breath(t));
  const haloLevel = t => LV.halo * rc((t - 20) / 30) * (0.3 + 0.7 * bloom(t)) * seam(t);
  const drift = (i, t) => 4 * Math.sin(2 * Math.PI * t / (23 + 3.1 * (i % 6)) + i * 1.9) + 2 * Math.sin(2 * Math.PI * t / (9 + 1.3 * (i % 5)) + i);
  const FLRN = [...new Set(CH.map(c => c.f))].sort((a, b) => a - b);
  const seeded = k => { let s = (k * 2654435761) >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0, s / 4294967296); };
  const rc = u => Math.sin(Math.max(0, Math.min(1, u)) * Math.PI / 2) ** 2;
  const sst = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  function chordW(j, t) { const x = t - j * HOLD; if (x < 0 || x > HOLD + XF) return 0; return rc(x / XF) * rc((HOLD + XF - x) / XF); }
  function noteW(pick, m, t) { const j = Math.floor(t / HOLD); let w = 0; for (let k = j - 1; k <= j; k++) { if (k < 0) continue; if (pick(k % NCH).includes(m)) w += chordW(k, t); } return Math.min(1, w); }
  const cycP = t => ((t % CYCLE) + CYCLE) % CYCLE / CYCLE;
  const wake = t => { const p = cycP(t); return sst(0.06, 0.24, p) * (1 - sst(0.8, 0.94, p)); };
  const bloom = t => { const p = cycP(t); return sst(0.3, 0.42, p) * (1 - sst(0.72, 0.86, p)); };
  const seam = t => { const p = cycP(t); return 1 - 0.28 * sst(0.94, 0.97, p) * (1 - sst(0.985, 1, p)); };
  const intro = t => rc(t / 22);
  const swell = (t, k) => 0.9 + 0.1 * Math.sin(2 * Math.PI * t / [100, 75, 120][k % 3] + k * 1.7);
  const breath = t => Math.sin(0.85 * t);
  const stringsLevel = t => swell(t, 1) * LV.strings * intro(t) * seam(t) * (0.8 + 0.2 * wake(t)) * (1 + 0.06 * breath(t));
  const fallLevel = t => { const x = ((t % REV) + REV) % REV; return LV.fall * rc((t - 30) / 30) * (0.25 + 0.75 * bloom(t)) * rc((x - 2) / 14) * rc((112 - x) / 14); };
  const fallFreq = t => { const x = ((t % REV) + REV) % REV; return hz(37) * Math.pow(2, -7 / 12 * Math.min(1, x / 110)); };

  // ---------------------------------------------------------------- graph
  function wave(c, amps) { const re = new Float32Array(amps.length + 1), im = new Float32Array(amps.length + 1); amps.forEach((a, i) => { im[i + 1] = a; }); return c.createPeriodicWave(re, im); }
  function hallIR(c) {
    const sr = c.sampleRate, L = Math.floor(sr * 14), buf = c.createBuffer(2, L, sr), pre = Math.round(sr * 0.045);
    for (let ch = 0; ch < 2; ch++) { const r = seeded(7717 + ch * 37), d = buf.getChannelData(ch); let lp = 0;
      for (let i = pre; i < L; i++) { const t = (i - pre) / sr, w = r() * 2 - 1; lp += (0.1 * Math.exp(-t / 5) + 0.025) * (w - lp); d[i] = lp * Math.exp(-6.9 * t / 12) * (1 - Math.exp(-t * 10)); } }
    return buf;
  }
  // PIANO note buffer: stretched partials, two strings, soft hammer, long pedal decay
  const pianoCache = new Map();
  function pianoBuf(c, m) {
    const k = c.sampleRate + ':' + m; if (pianoCache.has(k)) return pianoCache.get(k);
    const sr = c.sampleRate, f = hz(m), T = 8, L = Math.floor(sr * T), b = c.createBuffer(2, L, sr), B = 0.00035, r = seeded(m * 101 + 7);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch);
      for (let n = 1; n <= 10; n++) { const fn = n * f * Math.sqrt(1 + B * n * n); if (fn > 7000) break;
        const a = Math.pow(n, -1.25) * Math.exp(-n * f / 2200) * (n === 1 ? 1 : 0.85), tau = (6.5 * Math.pow(220 / f, 0.35)) / (1 + 0.28 * (n - 1));
        [[-0.9, 0.5], [0.9, 0.5]].forEach(([ct, s]) => { const ff = fn * Math.pow(2, (ct + (ch ? 0.3 : -0.3)) / 1200), w = 2 * Math.PI * ff / sr, kd = Math.exp(-1 / (tau * sr)), cw = Math.cos(w), sw = Math.sin(w); let sn = Math.sin(r() * 6.283), cs = Math.sqrt(1 - sn * sn), e = a * s;
          for (let i = 0; i < L; i++) { d[i] += e * sn; const s2 = sn * cw + cs * sw; cs = cs * cw - sn * sw; sn = s2; e *= kd; } }); }
      let lp = 0; const th = Math.round(sr * 0.02); for (let i = 0; i < th; i++) { lp += 0.08 * ((r() * 2 - 1) - lp); d[i] += lp * 0.25 * (1 - i / th); }
      for (let i = 0; i < L; i++) d[i] *= Math.min(1, i / (sr * 0.003)) * Math.min(1, (L - i) / (sr * 1.2)); }
    let pk = 0; for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < L; i++) pk = Math.max(pk, Math.abs(d[i])); }
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < L; i++) d[i] /= pk; }
    pianoCache.set(k, b); return b;
  }
  // INHALE buffer for chord j: its upper tones under a reversed tail, pure tones only
  function inhaleBuf(c, j) {
    const sr = c.sampleRate, T = 4.4, L = Math.floor(sr * T), b = c.createBuffer(2, L, sr), r = seeded(900 + j), tones = CH[j].n.slice(2).map(m => hz(m + 12));
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch), ph = tones.map(() => r() * 6.283), det = tones.map(() => 1 + (r() - 0.5) * 0.002);
      for (let i = 0; i < L; i++) { const t = i / sr, env = Math.exp(-(T - t) / 1.0) * Math.min(1, (T - t) / 0.35) * Math.min(1, t / 0.6); let s = 0; for (let k = 0; k < tones.length; k++) s += Math.sin(6.2832 * tones[k] * det[k] * t + ph[k]) * (1 - k * 0.15); d[i] = env * s * 0.25; } }
    return b;
  }
  function makeGraph(c) {
    const master = c.createGain(); master.gain.value = 0.0001;
    const endFade = c.createGain(); endFade.gain.value = 1;
    const lim = c.createDynamicsCompressor(); lim.threshold.value = -2; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.002; lim.release.value = 0.25;
    const trim = c.createGain(); trim.gain.value = LV.trim;
    const ceil = c.createBiquadFilter(); ceil.type = 'lowpass'; ceil.frequency.value = 5200; ceil.Q.value = 0.5;
    const body = c.createBiquadFilter(); body.type = 'peaking'; body.frequency.value = 330; body.Q.value = 0.7; body.gain.value = 2;
    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 25; hp.Q.value = 0.6;
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -18; comp.knee.value = 14; comp.ratio.value = 2; comp.attack.value = 0.05; comp.release.value = 1.0;
    const bus = c.createGain(), dry = c.createGain(), wet = c.createGain(), hhp = c.createBiquadFilter(); dry.gain.value = 0.55; wet.gain.value = 0.85; hhp.type = 'highpass'; hhp.frequency.value = 130;
    const hall = c.createConvolver(); hall.normalize = true; hall.buffer = hallIR(c);
    bus.connect(dry).connect(comp); bus.connect(hhp).connect(hall).connect(wet).connect(comp);
    comp.connect(hp).connect(body).connect(ceil).connect(trim).connect(lim).connect(endFade).connect(master).connect(c.destination);
    const srcs = [], add = o => { o.start(); srcs.push(o); return o; };
    // FLOOR
    const floor = c.createGain(); floor.gain.value = 0.0001; floor.connect(comp);
    const floorGains = FLRN.map(m => { const g = c.createGain(); g.gain.value = 0.0001; g.connect(floor); [[-0.12, -0.35], [0.12, 0.35]].forEach(([dh, pn]) => { const o = c.createOscillator(), p = c.createStereoPanner(); o.setPeriodicWave(wave(c, [1, 0.75, 0.12])); o.frequency.value = hz(m) + dh; p.pan.value = pn; o.connect(p).connect(g); add(o); }); return g; });
    // GLASS STRINGS: sine pairs a fraction of a hertz apart, spread wide
    const strings = c.createGain(); strings.gain.value = 0.0001; strings.connect(bus);
    const sw = wave(c, [1, 0.08, 0.03]);
    const strGains = PAD.map((m, i) => { const g = c.createGain(); g.gain.value = 0.0001; g.connect(strings); const a = m < 48 ? 1.2 : m > 62 ? 0.65 : 1;
      [[-0.85, -0.11], [0.85, 0.13]].forEach(([pn, dh]) => { const o = c.createOscillator(), og = c.createGain(), p = c.createStereoPanner(); o.setPeriodicWave(sw); o.frequency.value = hz(m) + dh * (1 + i * 0.1); og.gain.value = a; p.pan.value = pn * (0.6 + 0.4 * ((i * 7) % 5) / 4); o.connect(og).connect(p).connect(g); add(o); });
      return g; });
    // SERAPH choir: bright double voices → shared "ah" formant bank → mostly hall
    const choir = c.createGain(); choir.gain.value = 0.0001; const vowel = c.createGain(); vowel.gain.value = 1;
    const fout = c.createGain(); fout.gain.value = 1; [[450, 6, 1], [800, 7, 0.6], [2830, 11, 0.1], [300, 5, 0.4]].forEach(([f, q, a]) => { const bp = c.createBiquadFilter(), g = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q; g.gain.value = a * q * 0.5; vowel.connect(bp).connect(g).connect(fout); });
    const clp = c.createBiquadFilter(); clp.type = 'lowpass'; clp.frequency.value = 3000; fout.connect(clp).connect(choir); const cd = c.createGain(); cd.gain.value = 0.35; choir.connect(cd).connect(bus); const cw = c.createGain(); cw.gain.value = 1.1; choir.connect(cw).connect(hhp);
    const choirV = []; const choirGains = CHOIRN.map((m, i) => { const g = c.createGain(); g.gain.value = 0.0001; g.connect(vowel);
      [[-0.7, -6], [0.7, 6]].forEach(([pn, ct], k) => { const o = c.createOscillator(), p = c.createStereoPanner(); o.type = 'sawtooth'; o.frequency.value = hz(m); o.detune.value = ct; p.pan.value = pn * (0.5 + 0.5 * ((i * 3) % 4) / 3); o.connect(p).connect(g); add(o); choirV.push({ o, i: i * 2 + k, base: ct }); });
      return g; });
    // HALO: the chord two octaves up, only in the hall
    const halo = c.createGain(); halo.gain.value = 0.0001; halo.connect(hhp);
    const haloGains = HALON.map((m, i) => { const g = c.createGain(), o = c.createOscillator(); g.gain.value = 0.0001; o.frequency.value = hz(m) * (1 + (i % 2 ? 0.0012 : -0.0012)); o.connect(g).connect(halo); add(o); return g; });
    // THE FALL
    const fall = c.createOscillator(); fall.setPeriodicWave(wave(c, [1, 0.25, 0.06])); const fallG = c.createGain(); fallG.gain.value = 0.0001; fall.connect(fallG); fallG.connect(comp); const fw = c.createGain(); fw.gain.value = 0.5; fallG.connect(fw).connect(hhp); add(fall);
    // PIANO, ETHER, INHALE buses
    const piano = c.createGain(); piano.gain.value = LV.piano; const plp = c.createBiquadFilter(); plp.type = 'lowpass'; plp.frequency.value = 2400; piano.connect(plp); const pd = c.createGain(); pd.gain.value = 0.6; plp.connect(pd).connect(bus); const pwet = c.createGain(); pwet.gain.value = 0.7; plp.connect(pwet).connect(hhp);
    const ether = c.createGain(); ether.gain.value = LV.ether; const ed = c.createGain(); ed.gain.value = 0.45; ether.connect(ed).connect(bus); const ew = c.createGain(); ew.gain.value = 1.0; ether.connect(ew).connect(hhp);
    const inhale = c.createGain(); inhale.gain.value = LV.inhale; inhale.connect(bus);
    return { c, master, endFade, floor, floorGains, strings, strGains, choir, choirGains, choirV, halo, haloGains, fall, fallG, piano, ether, etherWave: wave(c, [1, 0.12, 0.04]), inhale, inhaleBufs: CH.map((_, j) => inhaleBuf(c, j)), srcs, done: new Set() };
  }
  function curve(param, fn, origin, s, e, step) { s += 0.0005; if (e - s < 0.02) return; const n = Math.max(2, Math.ceil((e - s) / (step || 0.25)) + 1), v = new Float32Array(n); for (let k = 0; k < n; k++) v[k] = fn(s - origin + (e - s) * k / (n - 1)); try { param.setValueCurveAtTime(v, s, e - s); } catch (err) { try { param.linearRampToValueAtTime(v[n - 1], e); } catch (e2) {} } }
  function pianoNote(G, t, m, vel, pan) { const c = G.c, s = c.createBufferSource(), g = c.createGain(), p = c.createStereoPanner(); s.buffer = pianoBuf(c, m); g.gain.value = vel; p.pan.value = pan; s.connect(g).connect(p).connect(G.piano); s.start(t); G.srcs.push(s); }
  function etherNote(G, t, prev, m, len, lvl) {
    const c = G.c, f = hz(m), end = t + len + 2.2, o = c.createOscillator(); o.setPeriodicWave(G.etherWave);
    o.frequency.setValueAtTime(prev ? hz(prev) : f * Math.pow(2, -4 / 12), t); o.frequency.exponentialRampToValueAtTime(f, t + (prev ? 0.7 : 1.2));
    const vib = c.createOscillator(), vd = c.createGain(); vib.frequency.value = 5.6; vd.gain.setValueAtTime(0, t); vd.gain.linearRampToValueAtTime(24, t + Math.min(len, 1.8)); vib.connect(vd).connect(o.detune);
    const g = c.createGain(); g.gain.setValueAtTime(0.00001, t); g.gain.linearRampToValueAtTime(lvl, t + (prev ? 0.35 : 1.0)); g.gain.setValueAtTime(lvl, t + len); g.gain.linearRampToValueAtTime(0.00001, end);
    const p = c.createStereoPanner(); p.pan.value = 0; o.connect(g).connect(p).connect(G.ether);
    o.start(t); o.stop(end + 0.05); vib.start(t); vib.stop(end + 0.05); G.srcs.push(o, vib);
  }
  function playMelody(G, origin, a, b, from) {
    for (let j = Math.max(0, Math.floor((a - 2) / HOLD)); j * HOLD < b; j++) {
      const t0 = j * HOLD + 2; if (t0 < a || t0 >= b) continue; const ci = j % NCH, wk = wake(t0), bl = bloom(t0 + 6), r = seeded(j * 37 + 11);
      if (t0 > 20 && wk > 0.05 && t0 < 1795) {
        const full = wk > 0.6, phrase = full ? PIANO[ci] : PIANO[ci].slice(0, 4);
        const ts0 = origin + t0; if (ts0 >= from) pianoNote(G, ts0, LH[ci], 0.55 * wk, -0.25);
        phrase.forEach(([m, dt], i) => { const ts = origin + t0 + dt; if (ts >= from) pianoNote(G, ts, m, (0.5 + 0.35 * wk) * (i % 4 === 0 ? 1 : 0.82) * (0.9 + 0.2 * r()), i % 2 ? 0.2 : -0.1); });
      }
      if (j % 2 === 1 && bl > 0.3 && Math.floor(j / 2) % 3 !== 2) {
        const ph = ETHER[Math.floor(j / 2) % ETHER.length]; let t = j * HOLD + 6, prev = 0;
        ph.forEach(([m, len]) => { const ts = origin + t; if (ts >= from) etherNote(G, ts, prev, m, len, Math.min(1, bl * 1.3)); prev = m; t += len; });
      }
    }
  }
  function playInhales(G, origin, a, b, from) {
    const c = G.c;
    for (let j = Math.max(1, Math.floor(a / HOLD)); j * HOLD - 4.1 < b; j++) {
      const tc = j * HOLD, t0 = tc - 4.1; if (t0 < a || t0 >= b) continue; const ts = origin + t0; if (ts < from) continue;
      const lvl = rc((tc - 20) / 30) * (0.5 + 0.5 * wake(tc)) * seam(tc); if (lvl < 0.02) continue;
      const s = c.createBufferSource(), g = c.createGain(); s.buffer = G.inhaleBufs[j % NCH]; g.gain.value = lvl; s.connect(g).connect(G.inhale); s.start(ts); s.stop(ts + 4.5); G.srcs.push(s);
    }
  }
  function scheduleWindow(G, origin, a, b, from) {
    const s = Math.max(origin + a, from), e = origin + b;
    playMelody(G, origin, a, b, from); playInhales(G, origin, a, b, from);
    curve(G.floor.gain, t => Math.max(0.0001, LV.floor * rc(t / 14) * seam(t) * swell(t, 2)), origin, s, e, 0.25);
    G.floorGains.forEach((g, i) => curve(g.gain, t => Math.max(0.0001, noteW(k => [CH[k].f], FLRN[i], t)), origin, s, e, 0.5));
    curve(G.strings.gain, t => Math.max(0.0001, stringsLevel(t)), origin, s, e, 0.2);
    G.strGains.forEach((g, i) => curve(g.gain, t => Math.max(0.0001, noteW(k => CH[k].n, PAD[i], t)), origin, s, e, 0.5));
    curve(G.choir.gain, t => Math.max(0.0001, choirLevel(t)), origin, s, e, 0.2);
    G.choirGains.forEach((g, i) => curve(g.gain, t => Math.max(0.0001, noteW(k => CH[k].n.slice(2).map(m => m + 12), CHOIRN[i], t)), origin, s, e, 0.5));
    G.choirV.forEach(v => curve(v.o.detune, t => v.base + drift(v.i, t), origin, s, e, 0.5));
    curve(G.halo.gain, t => Math.max(0.0001, haloLevel(t)), origin, s, e, 0.25);
    G.haloGains.forEach((g, i) => curve(g.gain, t => Math.max(0.0001, noteW(k => CH[k].n.slice(2).map(m => m + 24), HALON[i], t)), origin, s, e, 0.5));
    curve(G.fall.frequency, fallFreq, origin, s, e, 0.1);
    curve(G.fallG.gain, t => Math.max(0.0001, fallLevel(t)), origin, s, e, 0.1);
  }

  // ---------------------------------------------------------------- live transport
  let ctx = null, G = null, built = false, running = false, pending = false, muted = false, volume = 0.8, origin = 0, nextT = 0, timer = null, lastOpts = {};
  let pausedAt = 0, pendingSeek = null;
  const now = () => ctx.currentTime, pos = () => now() - origin, target = () => muted ? 0.0001 : Math.max(0.0001, volume);
  function tick() { if (!G) return; const h = now() - origin + LOOKAHEAD; while (nextT < h) { scheduleWindow(G, origin, nextT, nextT + BLOCK, now() + 0.03); nextT += BLOCK; } }
  function build(at) {
    if (!ctx || ctx.state === 'closed') { const AC = window.AudioContext || window.webkitAudioContext; ctx = new AC({ latencyHint: 'playback' }); }
    at = Math.max(0, at || 0); G = makeGraph(ctx); origin = now() + 0.1 - at;
    const first = Math.ceil((at + 0.001) / BLOCK) * BLOCK; scheduleWindow(G, origin, at, first, now() + 0.05); nextT = first; built = true;
    if (!timer) timer = setInterval(tick, 250); tick();
  }
  function fadeIn(sec) { if (!G) return; const t = now(), g = G.master.gain; g.cancelScheduledValues(t); g.setValueAtTime(Math.max(0.0001, g.value), t); g.exponentialRampToValueAtTime(target(), t + sec); }
  function teardown(fade) {
    if (!G) { built = false; return; } const old = G, t = now(); G = null; built = false;
    try { old.master.gain.cancelScheduledValues(t); old.master.gain.setValueAtTime(Math.max(0.0001, old.master.gain.value), t); old.master.gain.linearRampToValueAtTime(0, t + fade); } catch (e) {}
    if (timer) { clearInterval(timer); timer = null; }
    setTimeout(() => { old.srcs.forEach(n => { try { n.stop(); } catch (e) {} }); try { old.master.disconnect(); } catch (e) {} }, fade * 1000 + 200);
  }
  function scheduleEndFade() { /* the page ends the session itself; the export pass carries its own fade */ }
  function start(opts) {
    opts = opts || {}; lastOpts = opts;
    let at = pendingSeek != null ? pendingSeek : pausedAt; if (opts.buildup) at = 0; pendingSeek = null;
    if (!ctx || ctx.state === 'closed') { const AC = window.AudioContext || window.webkitAudioContext; ctx = new AC({ latencyHint: 'playback' }); }
    Promise.resolve(ctx.resume ? ctx.resume() : null).then(() => {
      pending = false; if (G) teardown(LXF); build(at); running = true; fadeIn(opts.buildup ? 2.5 : 1.2);
    }).catch(() => { pending = true; });
  }
  function stop() { if (!G) { running = false; return; } pausedAt = Math.max(0, pos()); running = false; teardown(1.2); }
  function seek(v) {
    v = Math.max(0, v || 0);
    if (running && G) { teardown(LXF); build(v); fadeIn(v < 2 ? 2.5 : 0.9); }
    else { pendingSeek = v; pausedAt = v; }
  }
  function setMuted(m) { muted = !!m; if (G && running) fadeIn(0.5); }
  function setVolume(v) { volume = Math.max(0, Math.min(1, v)); if (G && running && !muted) fadeIn(0.3); }
  function resumeIfPending() { if (pending) start(lastOpts); }

  // ---------------------------------------------------------------- offline export: one seamless pass
  async function renderOffline(durationSec, vol, onProgress, shouldCancel) {
    const rate = 48000, tail = 4, total = Math.ceil(rate * (durationSec + tail)), oc = new OfflineAudioContext(2, total, rate), g = makeGraph(oc);
    const peak = Math.max(0.0002, vol == null ? volume : vol);
    for (let t = 0; t < durationSec; t += BLOCK) scheduleWindow(g, 0, t, Math.min(t + BLOCK, durationSec), 0);
    g.master.gain.setValueAtTime(0.0001, 0); g.master.gain.exponentialRampToValueAtTime(peak, 2.5);
    const fs = Math.max(3, durationSec - END_FADE), n = 64, fc = new Float32Array(n); for (let i = 0; i < n; i++) fc[i] = Math.max(0.0001, peak * Math.cos(i / (n - 1) * Math.PI / 2) ** 2);
    g.master.gain.setValueCurveAtTime(fc, fs, durationSec - 0.05 - fs);
    if (typeof oc.suspend === 'function') { const step = 15; for (let t = step; t < durationSec + tail; t += step) oc.suspend(t).then(async () => { if (onProgress) { try { onProgress(t / (durationSec + tail)); } catch (e) {} } if (!(shouldCancel && shouldCancel())) await new Promise(r => setTimeout(r, 0)); oc.resume(); }); }
    const buf = await oc.startRendering(); if (onProgress) onProgress(1); return buf;
  }
  return { start, stop, seek, setMuted, setVolume, resumeIfPending, isMuted: () => muted, renderOffline };
})();
