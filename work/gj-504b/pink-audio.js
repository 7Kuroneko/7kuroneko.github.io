/* ============================================================================
 * FOCUSFIELD · GJ 504 b — generative soundscape "Dark Empress"
 * ----------------------------------------------------------------------------
 * Dark, regal, seductive: a slow, late-night synth ballad feel. Lush
 * pumping chords, a warm sub-bass pattern, a glassy 80s pluck arpeggio and a
 * sultry alto lead that slides between notes. Minor key with a harmonic-
 * minor dominant for drama, resolving back home.
 * Focus-safe by construction: no percussion, no noise, NO feedback paths
 * anywhere (the space is pure convolution + feed-forward echo taps), soft
 * attacks, a soft-clip safety stage last. Measured offline before shipping.
 *
 *   key      C♯ MINOR (aeolian + harmonic-minor G♯7)
 *   tempo    68 BPM · half-time feel · 2 bars per chord · progression 56.5 s
 *   harmony  C♯m9 · Amaj7 · E(add9) · B6 · C♯m · F♯m9 · Amaj9 · G♯sus4→G♯7
 *
 * VOICES — recipes used by no other FocusField track:
 *   CROWN   pad: three detuned sawtooths per note (±9 ¢) through a 1.3 kHz
 *           lowpass, SIDECHAIN-PUMPED — the level dips on every beat and
 *           swells back, the breathing pulse of the track.
 *   EMPRESS lead: 7-harmonic PeriodicWave with a +4 dB presence peak at
 *           900 Hz, an octave-down sine for body, 90 ms portamento, late
 *           5.2 Hz vibrato, doubled ±6 ¢ left/right.
 *   VELOUR  sub-bass: sine through a gentle tanh saturator (808 warmth),
 *           3-note syncopated pattern, 60 ms slides into each note.
 *   GLINT   arpeggio: triangle pluck with a closing lowpass (2.4 kHz →
 *           520 Hz in 0.3 s), 8th notes, alternating sides.
 *   SPACE   dark modal convolution (380 decaying modes, 90 Hz–2.2 kHz) plus
 *           three feed-forward echo taps at dotted-8th spacing.
 * API: PinkAudio.setClock(fn) · .play() · .pause() · .seek() · .setDuration(s)
 *      .setMuted(b) · .setVolume(0..1) · .isMuted() · .resumeIfPending()
 *      .position() · .renderSegment(startSec, lenSec, gain) → {sr, L, R}
 * ==========================================================================*/
window.PinkAudio = (function () {
  const BPM = 68, BEAT = 60 / BPM, BAR = BEAT * 4, E8 = BEAT / 2, BLOCK = 16;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const PROG = [
    [37, [56, 59, 63, 64]],  // C♯m9
    [33, [57, 61, 64, 68]],  // Amaj7
    [40, [56, 59, 64, 66]],  // E(add9)
    [35, [56, 59, 63, 66]],  // B6
    [37, [56, 61, 64, 68]],  // C♯m
    [42, [57, 61, 64, 68]],  // F♯m9
    [33, [59, 61, 64, 68]],  // Amaj9
    [32, [56, 61, 63, 66], [56, 60, 63, 66]],  // G♯sus4 → G♯7
  ];
  // [midi, start beat, length beats] across the chord's 8 beats
  const MEL = [
    [[68, 0, 1.5], [71, 1.5, 0.5], [73, 2, 2], [71, 4, 1], [68, 5, 3]],
    [[76, 0, 2], [75, 2, 1], [73, 3, 1], [71, 4, 4]],
    [[71, 0, 1.5], [73, 1.5, 0.5], [75, 2, 2], [76, 4, 4]],
    [[78, 0, 2], [76, 2, 1], [75, 3, 1], [71, 4, 4]],
    [[80, 0, 3], [78, 3, 1], [76, 4, 2], [75, 6, 2]],
    [[73, 0, 2], [76, 2, 2], [80, 4, 2], [78, 6, 2]],
    [[76, 0, 3], [75, 3, 1], [73, 4, 4]],
    [[73, 0, 2], [75, 2, 2], [72, 4, 2], [68, 6, 2]],
  ];
  const BASS = [[0, 3, 0, 1], [3, 3, 0, 0.85], [6, 2, 7, 0.8]];
  const ARP = [0, 1, 2, 3, 2, 1, 3, 1], AV = [1, 0.55, 0.75, 0.55, 0.85, 0.5, 0.72, 0.55];
  const BLOCKS = [
    { pad: 1,   pump: 0,   bass: 0,   arp: 0,   sparse: 1, lead: 0,   frag: 1 },
    { pad: 1,   pump: 0.5, bass: 0.8, arp: 0.6, sparse: 1, lead: 0,   frag: 1 },
    { pad: 1,   pump: 0.9, bass: 1,   arp: 0.85, sparse: 0, lead: 0.8, frag: 1 },
    { pad: 0.9, pump: 1,   bass: 1,   arp: 1,   sparse: 0, lead: 1,   frag: 0 },
    { pad: 0.9, pump: 1,   bass: 1,   arp: 1,   sparse: 0, lead: 1,   frag: 0 },
    { pad: 1,   pump: 0.3, bass: 0.5, arp: 0.5, sparse: 1, lead: 0.8, frag: 1 },
    { pad: 1,   pump: 0.9, bass: 1,   arp: 0.9, sparse: 0, lead: 0,   frag: 1 },
    { pad: 0.9, pump: 1,   bass: 1,   arp: 1,   sparse: 0, lead: 1,   frag: 0 },
    { pad: 1,   pump: 0.3, bass: 0.6, arp: 0.45, sparse: 1, lead: 0.7, frag: 1 },
  ];
  const blockAt = i => i < BLOCKS.length ? BLOCKS[i] : BLOCKS[1 + (i - 1) % (BLOCKS.length - 1)];
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  function mixAt(bar) {
    const bi = Math.floor(bar / BLOCK), cur = blockAt(bi), prev = bi > 0 ? blockAt(bi - 1) : cur, f = ss(0, 4, bar % BLOCK), o = {};
    for (const k in cur) o[k] = prev[k] + (cur[k] - prev[k]) * f;
    o.frag = cur.frag; o.sparse = cur.sparse; return o;
  }
  function rng(seed) { let a = (seed * 2246822519) >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  let duration = 1800;
  const endF = t => 1 - ss(duration - 28, duration - 3, t);

  // ---------------------------------------------------------------- tables
  const irCache = {};
  function modalIR(sr) {
    if (irCache[sr]) return irCache[sr];
    const len = Math.floor(sr * 5.5), pre = Math.floor(sr * 0.03), out = [];
    for (let ch = 0; ch < 2; ch++) {
      const r = rng(ch ? 4127 : 2089), d = new Float32Array(len);
      for (let m = 0; m < 380; m++) {
        const f = 90 * Math.pow(2200 / 90, r()), T60 = 4.6 * Math.pow(90 / f, 0.35) + 0.5, k = 6.9 / T60;
        const w = 2 * Math.PI * f / sr, ph = r() * 2 * Math.PI, a = (0.5 + r()) / Math.sqrt(f / 90);
        const n = Math.min(len - pre, Math.floor(T60 * sr));
        let c = Math.cos(ph), s = Math.sin(ph); const cw = Math.cos(w), sw = Math.sin(w);
        for (let i = 0; i < n; i++) {
          d[pre + i] += a * Math.exp(-k * i / sr) * Math.min(1, i / (sr * 0.025)) * s;
          const nc = c * cw - s * sw; s = s * cw + c * sw; c = nc;
        }
      }
      out.push(d);
    }
    return (irCache[sr] = out);
  }
  const curves = {};
  function curve(name, k, out) {
    if (curves[name]) return curves[name];
    const N = 4096, c = new Float32Array(N), nrm = Math.tanh(k);
    for (let i = 0; i < N; i++) { const x = i / (N - 1) * 2 - 1; c[i] = Math.tanh(k * x) / nrm * out; }
    return (curves[name] = c);
  }

  // ---------------------------------------------------------------- graph
  function buildGraph(c, dest) {
    const G = { c };
    G.master = c.createGain(); G.master.gain.value = 0.0001;
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -20; comp.knee.value = 18; comp.ratio.value = 3; comp.attack.value = 0.012; comp.release.value = 0.5;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5800; lp.Q.value = 0;
    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 30; hp.Q.value = 0;
    const mk = c.createGain(); mk.gain.value = 1.3;
    const clip = c.createWaveShaper(); clip.curve = curve('clip', 1.1, 0.92); clip.oversample = '2x';
    G.master.connect(comp); comp.connect(lp); lp.connect(hp); hp.connect(mk); mk.connect(clip); clip.connect(dest); G.out = clip;
    // space
    G.verb = c.createGain();
    const ir = modalIR(c.sampleRate), buf = c.createBuffer(2, ir[0].length, c.sampleRate);
    buf.getChannelData(0).set(ir[0]); buf.getChannelData(1).set(ir[1]);
    const ihp = c.createBiquadFilter(); ihp.type = 'highpass'; ihp.frequency.value = 170; ihp.Q.value = 0;
    const cv = c.createConvolver(); cv.normalize = true; cv.buffer = buf;
    const wet = c.createGain(); wet.gain.value = 0.5;
    G.verb.connect(ihp); ihp.connect(cv); cv.connect(wet); wet.connect(G.master);
    // feed-forward echo taps (no feedback)
    G.echo = c.createGain();
    const elp = c.createBiquadFilter(); elp.type = 'lowpass'; elp.frequency.value = 2600; elp.Q.value = 0;
    G.echo.connect(elp);
    [[1, 0.34, -0.6], [2, 0.2, 0.6], [3, 0.11, -0.35]].forEach(([k, g, p]) => {
      const d = c.createDelay(3); d.delayTime.value = E8 * 1.5 * k;
      const gg = c.createGain(); gg.gain.value = g;
      const pn = c.createStereoPanner(); pn.pan.value = p;
      elp.connect(d); d.connect(gg); gg.connect(pn); pn.connect(G.master); pn.connect(G.verb);
    });
    G.bus = {};
    const bus = (n, send, echo) => {
      const g = c.createGain(); g.connect(G.master);
      const s = c.createGain(); s.gain.value = send; g.connect(s); s.connect(G.verb);
      if (echo) { const e = c.createGain(); e.gain.value = echo; g.connect(e); e.connect(G.echo); }
      G.bus[n] = g;
    };
    bus('pad', 0.4, 0); bus('bass', 0.03, 0); bus('lead', 0.5, 0.45); bus('arp', 0.45, 0.5);
    const re = new Float32Array(8), im = new Float32Array([0, 1, 0.5, 0.33, 0.22, 0.15, 0.1, 0.06]);
    G.emp = c.createPeriodicWave(re, im);
    G.sat = curve('sat', 1.6, 1);
    return G;
  }

  // ---------------------------------------------------------------- voices
  function crown(G, t, notes, len, lvl, pump, vt, notes2) {
    const c = G.c;
    const duck = c.createGain(); duck.gain.value = 1; duck.connect(G.bus.pad);
    if (pump > 0.02) {
      for (let bt = Math.ceil(vt / BEAT) * BEAT; bt < vt + len + 3; bt += BEAT) {
        const ct = t + (bt - vt);
        duck.gain.setValueAtTime(1, ct); duck.gain.linearRampToValueAtTime(1 - 0.35 * pump, ct + 0.08);
        duck.gain.linearRampToValueAtTime(1, ct + BEAT * 0.78);
      }
    }
    const voice = (m, v, t1, l1, a1, r1) => {
      const amp = [0.016, 0.014, 0.013, 0.011][v] * lvl;
      if (amp < 0.0004) return;
      const end = t1 + l1 + r1;
      const env = c.createGain();
      env.gain.setValueAtTime(0.0001, t1); env.gain.linearRampToValueAtTime(amp, t1 + a1);
      env.gain.setValueAtTime(amp, t1 + l1); env.gain.linearRampToValueAtTime(0.0001, end);
      const lpf = c.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 1300 - v * 80; lpf.Q.value = 0;
      const pan = c.createStereoPanner(); pan.pan.value = [-0.45, 0.45, -0.2, 0.2][v];
      lpf.connect(env); env.connect(pan); pan.connect(duck);
      [-9, 0, 9].forEach(det => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = det + v; o.connect(lpf); o.start(t1); o.stop(end + 0.05); });
    };
    if (notes2) {
      notes.forEach((m, v) => voice(m, v, t, len / 2 + 0.4, 3, 0.8));
      notes2.forEach((m, v) => voice(m, v, t + len / 2, len / 2, 0.6, 4));
    } else notes.forEach((m, v) => voice(m, v, t, len, 3 + v * 0.3, 4));
  }
  function empress(G, t, prev, midi, dur, lvl) {
    const c = G.c, f = mtof(midi), amp = 0.024 * lvl;
    if (amp < 0.001) return;
    const end = t + dur + 0.9;
    const env = c.createGain();
    env.gain.setValueAtTime(0.0001, t); env.gain.linearRampToValueAtTime(amp, t + 0.06);
    env.gain.linearRampToValueAtTime(amp * 0.82, t + 0.5); env.gain.setValueAtTime(amp * 0.82, t + dur); env.gain.linearRampToValueAtTime(0.0001, end);
    const lpf = c.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 1700; lpf.Q.value = 0;
    const pk = c.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = 900; pk.Q.value = 0.9; pk.gain.value = 4;
    lpf.connect(pk); pk.connect(env); env.connect(G.bus.lead);
    const vib = c.createOscillator(); vib.frequency.value = 5.2; const vd = c.createGain();
    vd.gain.setValueAtTime(0, t); vd.gain.setValueAtTime(0, t + 0.45); vd.gain.linearRampToValueAtTime(7, t + Math.max(0.6, Math.min(dur, 1.5)));
    vib.connect(vd);
    const f0 = prev ? mtof(prev) : f;
    [[-6, -0.3], [6, 0.3]].forEach(([det, p]) => {
      const o = c.createOscillator(); o.setPeriodicWave(G.emp); o.detune.value = det;
      o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.09);
      vd.connect(o.detune);
      const pn = c.createStereoPanner(); pn.pan.value = p; const g = c.createGain(); g.gain.value = 0.5;
      o.connect(g); g.connect(pn); pn.connect(lpf); o.start(t); o.stop(end + 0.05);
    });
    const sub = c.createOscillator(); sub.type = 'sine';
    sub.frequency.setValueAtTime(f0 / 2, t); sub.frequency.exponentialRampToValueAtTime(f / 2, t + 0.09);
    const sg = c.createGain(); sg.gain.value = 0.3; sub.connect(sg); sg.connect(lpf); sub.start(t); sub.stop(end + 0.05);
    vib.start(t); vib.stop(end + 0.05);
  }
  function velour(G, t, prev, midi, dur, lvl) {
    const c = G.c, f = mtof(midi), amp = 0.085 * lvl;
    if (amp < 0.002) return;
    const o = c.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(prev ? mtof(prev) : f, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.06);
    const drive = c.createGain(); drive.gain.value = 0.7;
    const sh = c.createWaveShaper(); sh.curve = G.sat;
    const env = c.createGain();
    env.gain.setValueAtTime(0.0001, t); env.gain.linearRampToValueAtTime(amp, t + 0.09);
    env.gain.linearRampToValueAtTime(amp * 0.85, t + 0.5); env.gain.setValueAtTime(amp * 0.85, t + dur); env.gain.linearRampToValueAtTime(0.0001, t + dur + 0.12);
    const lpf = c.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 320; lpf.Q.value = 0;
    o.connect(drive); drive.connect(sh); sh.connect(lpf); lpf.connect(env); env.connect(G.bus.bass);
    o.start(t); o.stop(t + dur + 0.15);
  }
  function glint(G, t, midi, lvl, panv) {
    const c = G.c, amp = 0.02 * lvl;
    if (amp < 0.0008) return;
    const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = mtof(midi);
    const lpf = c.createBiquadFilter(); lpf.type = 'lowpass'; lpf.Q.value = 0;
    lpf.frequency.setValueAtTime(2400, t); lpf.frequency.exponentialRampToValueAtTime(520, t + 0.3);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(amp, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    const pan = c.createStereoPanner(); pan.pan.value = panv;
    o.connect(lpf); lpf.connect(g); g.connect(pan); pan.connect(G.bus.arp);
    o.start(t); o.stop(t + 0.95);
  }

  // ---------------------------------------------------------------- score
  function scheduleBar(G, b, origin, minT, maxT) {
    const t0 = b * BAR, m = mixAt(b), ci = Math.floor(b / 2) % 8, ch = PROG[ci], second = b % 2;
    const notesNow = ch[2] && second ? ch[2] : ch[1];
    const ok = t => t >= minT && t < maxT, T = t => origin + t;
    if (!second && ok(t0)) crown(G, T(t0), ch[1], 2 * BAR, m.pad * endF(t0), m.pump, t0, ch[2]);
    if (m.bass > 0.02) {
      let prev = second ? ch[0] : PROG[(ci + 7) % 8][0];
      BASS.forEach(([e, d, iv, v]) => { const t = t0 + e * E8, n = ch[0] + iv; if (ok(t)) velour(G, T(t), prev, n, d * E8, m.bass * v * endF(t)); prev = n; });
    }
    if (m.arp > 0.02) {
      const ns = notesNow.map(n => n + 12);
      for (let i = 0; i < 8; i++) { if (m.sparse && i % 2) continue; const t = t0 + i * E8; if (ok(t)) glint(G, T(t), ns[ARP[i]], m.arp * AV[i] * endF(t), i % 2 ? 0.4 : -0.4); }
    }
    if (m.lead > 0.02) {
      const ph = MEL[ci];
      ph.forEach(([n, st, ln], i) => {
        if (m.frag && i > 1) return;
        const e = st - second * 4; if (e < 0 || e >= 4) return;
        const t = t0 + e * BEAT, prev = i ? ph[i - 1][0] : 0;
        if (ok(t)) empress(G, T(t), prev, n, (m.frag && i === 1 ? ln + 2 : ln) * BEAT * 0.95, m.lead * endF(t) * (i ? 0.92 : 1));
      });
    }
  }

  // ---------------------------------------------------------------- transport
  let ctx = null, G = null, want = false, gen = 0, origin = 0, AT = 0, nextBar = 0, timer = null, seekTimer = null;
  let muted = false, volume = 0.8, clock = () => 0;
  const now = () => ctx.currentTime;
  const target = () => muted ? 0.0001 : Math.max(0.0001, volume);
  function ensureCtx() { if (!ctx || ctx.state === 'closed') { const AC = window.AudioContext || window.webkitAudioContext; ctx = new AC({ latencyHint: 'playback' }); } }
  // iOS: create + resume the context synchronously inside a user gesture, kick it with a silent buffer,
  // and play a looping silent <audio> so the hardware mute switch doesn't silence Web Audio.
  let unlockEl = null, resumeTries = 0;
  function silentWav() { const sr = 8000, n = sr, dv = new DataView(new ArrayBuffer(44 + n)); const W = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); }; W(0, 'RIFF'); dv.setUint32(4, 36 + n, true); W(8, 'WAVEfmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true); dv.setUint32(24, sr, true); dv.setUint32(28, sr, true); dv.setUint16(32, 1, true); dv.setUint16(34, 8, true); W(36, 'data'); dv.setUint32(40, n, true); for (let i = 0; i < n; i++) dv.setUint8(44 + i, 128); return URL.createObjectURL(new Blob([dv.buffer], { type: 'audio/wav' })); }
  function unlock() {
    // a context that refused to resume on an earlier gesture is thrown away and rebuilt inside this one (iOS)
    if (ctx && ctx.state !== 'running' && resumeTries >= 1) { try { kill(0); ctx.close(); } catch (e) {} ctx = null; resumeTries = 0; }
    ensureCtx();
    try { const b = ctx.createBuffer(1, 1, 22050), s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0); } catch (e) {}
    if (ctx.state !== 'running') { resumeTries++; ctx.resume().then(() => { resumeTries = 0; }).catch(() => {}); }
    if (!unlockEl) {
      unlockEl = document.createElement('audio'); unlockEl.setAttribute('playsinline', ''); unlockEl.setAttribute('webkit-playsinline', ''); unlockEl.loop = true;
      unlockEl.src = silentWav(); document.body.appendChild(unlockEl);
    }
    if (unlockEl.paused) unlockEl.play().catch(() => {});
  }
  function kill(d) {
    if (timer) { clearInterval(timer); timer = null; }
    if (!G) return;
    const g = G, t = now(); G = null;
    try { g.master.gain.cancelScheduledValues(t); g.master.gain.setValueAtTime(Math.max(0.0001, g.master.gain.value), t); g.master.gain.linearRampToValueAtTime(0, t + d); } catch (e) {}
    setTimeout(() => { try { g.out.disconnect(); } catch (e) {} }, d * 1000 + 250);
  }
  function tick() { if (!G) return; const hz = now() - origin + 1.5; while (nextBar * BAR < hz) { scheduleBar(G, nextBar, origin, Math.max(AT, now() - origin + 0.03), Infinity); nextBar++; } }
  function rebuild(at) {
    kill(0.4);
    AT = Math.max(0, at); G = buildGraph(ctx, ctx.destination); origin = now() + 0.08 - AT;
    const b0 = Math.floor(AT / BAR), cs = Math.floor(b0 / 2) * 2, rem = (cs + 2) * BAR - AT;
    if (AT - cs * BAR > 0.05 && rem > 0.8) { const ci = Math.floor(cs / 2) % 8, m = mixAt(cs), ch = PROG[ci]; crown(G, now() + 0.08, (ch[2] && rem < BAR) ? ch[2] : ch[1], rem, m.pad * endF(AT) * 0.9, m.pump, AT); }
    nextBar = b0; tick(); timer = setInterval(tick, 200);
    const p = G.master.gain, t = now(); p.setValueAtTime(0.0001, t);
    if (AT < 1) p.exponentialRampToValueAtTime(target(), t + 4); else p.linearRampToValueAtTime(target(), t + 1.5);
  }
  function play() { want = true; const my = ++gen; unlock(); const go = () => { if (my === gen && want && ctx.state === 'running' && (!G || G.c !== ctx)) rebuild(clock()); else if (my === gen && want && ctx.state === 'running' && !G) rebuild(clock()); }; if (ctx.state === 'running') { if (!G || G.c !== ctx) rebuild(clock()); } else { ctx.resume().then(go).catch(() => {}); setTimeout(() => { if (my === gen && want && ctx.state === 'running' && !G) rebuild(clock()); }, 500); } }
  function pause() { want = false; gen++; clearTimeout(seekTimer); if (ctx) kill(0.9); }
  function seek() { if (!want) return; clearTimeout(seekTimer); const my = gen; seekTimer = setTimeout(() => { if (my === gen && want && ctx && ctx.state === 'running') rebuild(clock()); }, 90); }
  function resumeIfPending() { if (!want || !ctx) return; if (ctx.state !== 'running' || !G) play(); }
  let lastCT = -1, lastCTWall = 0;
  function isRunning() { if (!G || !ctx || ctx.state !== 'running') return false; const ct = ctx.currentTime, w = performance.now(); if (ct !== lastCT) { lastCT = ct; lastCTWall = w; return true; } return w - lastCTWall < 700; }
  function prime() { unlock(); }
  function setGain() { if (G) { const p = G.master.gain, t = now(); p.cancelScheduledValues(t); p.setValueAtTime(Math.max(0.0001, p.value), t); p.linearRampToValueAtTime(target(), t + 0.3); } }
  async function renderSegment(a, len, gain) {
    const sr = 48000, PRE = a > 0 ? Math.min(13, a) : 0, s0 = a - PRE;
    const oc = new OfflineAudioContext(2, Math.ceil((len + PRE) * sr), sr);
    const g = buildGraph(oc, oc.destination); g.master.gain.value = gain == null ? volume : gain;
    const b0 = Math.max(0, Math.floor(s0 / BAR)), b1 = Math.floor((a + len) / BAR);
    for (let b = b0; b <= b1; b++) scheduleBar(g, b, -s0, s0, a + len);
    const buf = await oc.startRendering(), off = Math.round(PRE * sr), n = Math.round(len * sr);
    return { sr, L: buf.getChannelData(0).slice(off, off + n), R: buf.getChannelData(1).slice(off, off + n) };
  }
  return {
    BAR, play, pause, seek, resumeIfPending, prime, isRunning, renderSegment,
    setClock: fn => { clock = fn; },
    setDuration: s => { duration = Math.max(60, s || 60); },
    setMuted: m => { muted = !!m; setGain(); },
    setVolume: v => { volume = Math.min(1, Math.max(0, v)); setGain(); },
    isMuted: () => muted,
    position: () => (G && want && ctx && ctx.state === 'running' ? now() - origin : null),
  };
})();
