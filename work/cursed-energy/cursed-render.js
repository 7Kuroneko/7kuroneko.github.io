/* ============================================================================
 * FOCUSFIELD · CURSED ENERGY — picture
 * Pure energy, no figure. An inverted flame — ink-black at its heart, edges
 * burning indigo — pours upward and spirals out of an unseen core. Tendrils
 * and sparks ride it. Every 40–70 s the aura draws in, then a BLACK FLASH
 * cracks out: black bolts rimmed red, the field tinted crimson for a moment.
 * Rendered by a WebGL fragment shader (domain-warped fbm), composited into the
 * page's 2D canvas, so export and scrubbing match exactly.
 * API: CursedScene.build(seed, density, dur) · .draw(ctx, t, tweaks) · .events()
 *      .drawOracle(ctx,cx,cy,cell,alpha,color) · .oracleSVG()
 * ==========================================================================*/
window.CursedScene = (function () {
  const W = 1920, H = 1080, TAU = Math.PI * 2, CX = 960, CY = 540 + .2 * 1080;
  const PAL = {
    cursed: { deep: [.05, .07, .3], rim: [.36, .56, 1], hot: [.78, .9, 1], acc: [1, .07, .1], bolt: '255,40,50' },
    domain: { deep: [.17, .03, .28], rim: [.72, .32, 1], hot: [1, .82, 1], acc: [1, .1, .32], bolt: '255,40,110' },
    crimson: { deep: [.24, .02, .04], rim: [1, .22, .26], hot: [1, .82, .72], acc: [.25, .45, 1], bolt: '80,130,255' },
    reverse: { deep: [.26, .2, .07], rim: [1, .84, .44], hot: [1, 1, .92], acc: [1, .12, .1], bolt: '255,60,40' },
  };
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), ease = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const hsh = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

  const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const FS = `precision highp float;
uniform vec2 uRes,uSeed;uniform float uT,uFlash,uCharge,uGlow,uWarp,uDens,uBreath,uGrow;uniform vec3 uDeep,uRim,uHot,uAcc;
vec2 g2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return -1.+2.*fract(sin(p)*43758.5453);}
float h21(vec2 p){return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5453);}
float gn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*f*(f*(f*6.-15.)+10.);
 return mix(mix(dot(g2(i),f),dot(g2(i+vec2(1.,0.)),f-vec2(1.,0.)),u.x),mix(dot(g2(i+vec2(0.,1.)),f-vec2(0.,1.)),dot(g2(i+1.),f-1.),u.x),u.y)*.5+.5;}
float fbm(vec2 p){float s=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){s+=a*gn(p);p=m*p;a*=.5;}return s/.97;}
float fbm3(vec2 p){float s=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<3;i++){s+=a*gn(p);p=m*p;a*=.5;}return s/.875;}
void main(){
 vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;float t=uT;
 p*=1.-.05*uFlash+.04*uCharge;
 vec2 q=p-vec2(0.,-.2);float r=length(q);
 float sw=.7*exp(-r*2.4)*sin(t*.05+1.);float cs=cos(sw),sn=sin(sw);vec2 qs=mat2(cs,-sn,sn,cs)*q;
 vec2 fp=vec2(qs.x*3.,qs.y*1.5)+uSeed;
 vec2 w=vec2(fbm3(fp*.9+vec2(0.,-t*.18)),fbm3(fp*.9+vec2(5.2,1.3-t*.16)));
 float n1=fbm(fp*1.4+vec2(0.,-t*.55)+(w-.5)*1.8*uWarp);
 float n2=fbm3(fp*3.1+vec2(3.,-t*1.1)+(w-.5)*2.4*uWarp);
 float n=clamp((n1*.72+n2*.38-.55)*2.9+.5,0.,1.);
 float up=q.y+.06;
 float wid=(.15+.42*max(0.,up))*(.9+.1*uGrow)+.025*uBreath-.05*uCharge;
 float hgt=(.82+.25*uGrow+.05*uBreath)*(1.-.35*uCharge);
 float env=exp(-pow(q.x/max(.02,wid),2.))*smoothstep(-.16,.02,up)*(1.-smoothstep(0.,hgt,up)*.95);
 float base=exp(-pow(length(vec2(q.x*1.2,(q.y+.02)*2.2))*3.2,2.));
 float d=(env*1.15+base*.55)-(1.-n)*1.05-.08+uFlash*.18*env;
 float glow=smoothstep(-.25,.12,d)*(.35+.65*env+base);
 float rim=smoothstep(.0,.07,d)*(1.-smoothstep(.07,.2,d));
 float core=smoothstep(.16,.36,d);
 float rim2=smoothstep(.3,.36,d)*(1.-smoothstep(.36,.46,d));
 vec2 fo=vec2(qs.x*1.7,qs.y*1.1)+uSeed+11.;
 float m1=fbm3(fo*1.2+vec2(0.,-t*.3)+(w-.5)*2.4*uWarp);m1=clamp((m1-.55)*2.6+.5,0.,1.);
 float eo=exp(-pow(q.x/max(.04,wid*1.9),2.))*smoothstep(-.3,.05,up)*(1.-smoothstep(0.,hgt*1.25,up)*.95);
 float d2=eo*1.05-(1.-m1)*1.05-.05;
 float og=smoothstep(-.3,.1,d2)*eo,orim=smoothstep(.0,.06,d2)*(1.-smoothstep(.06,.22,d2));
 vec3 col=vec3(.004,.006,.016)+uDeep*.08*max(0.,1.-r*1.2);
 col+=uDeep*og*.75+uRim*orim*.55*uGlow;
 col=mix(col,vec3(.004,.004,.012),smoothstep(.15,.4,d2)*.8);
 col+=uDeep*glow*.9;
 col+=uRim*rim*1.7*uGlow;
 col=mix(col,vec3(.003,.003,.009)+uDeep*.12*n,core*.94);
 col+=uRim*rim2*.7*uGlow+uHot*pow(rim,3.)*.9*uGlow;
 float wisp=smoothstep(.62,.8,gn(fp*2.+vec2(t*.04,-t*.7)+w*2.5))*smoothstep(-.5,-.05,d)*(1.-core)*exp(-r*1.1);
 col+=uRim*wisp*.55*uGlow;
 vec2 sp=vec2(p.x*16.,p.y*9.-t*.55);vec2 ci=floor(sp);vec2 cf=fract(sp)-.5;
 float hh=h21(ci+uSeed);vec2 off=vec2(h21(ci+3.1),h21(ci+7.7))-.5;
 float s=smoothstep(.08,0.,length(cf-off*.6))*step(1.-.06*uDens,hh)*(.5+.5*sin(t*3.+hh*40.));
 col+=uHot*s*(.15+.85*exp(-r*2.))*uGlow;
 col=mix(col,col*.35+uAcc*(rim*2.+rim2*1.1+glow*.12),clamp(uFlash,0.,1.)*.55);
 col*=1.-.6*smoothstep(.42,1.02,length(p*vec2(.8,1.)));
 col=1.-exp(-col*1.4);
 gl_FragColor=vec4(col,1.);
}`;
  let gl = null, cv = null, U = {}, ok = false, lastT = null, lastKey = '', initAt = 0, tried = false, lvl = 0, avg = 0, deferred = false, EV = [], seedV = [0, 0];
  function initGL() {
    cv = document.createElement('canvas'); cv.width = 640; cv.height = 360;
    gl = cv.getContext('webgl', { preserveDrawingBuffer: true, antialias: false, alpha: false, premultipliedAlpha: false });
    if (!gl) return;
    let rn = ''; try { const ext = gl.getExtension('WEBGL_debug_renderer_info'); rn = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : ''; } catch (e) {}
    const par = gl.getExtension('KHR_parallel_shader_compile');
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS), pr = gl.createProgram();
    gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    const finish = () => {
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { console.error(gl.getShaderInfoLog(fs) || gl.getProgramInfoLog(pr)); return; }
      gl.useProgram(pr);
      const bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      ['uRes', 'uSeed', 'uT', 'uFlash', 'uCharge', 'uGlow', 'uWarp', 'uDens', 'uBreath', 'uGrow', 'uDeep', 'uRim', 'uHot', 'uAcc'].forEach(n => U[n] = gl.getUniformLocation(pr, n));
      gl.viewport(0, 0, 640, 360); gl.uniform2f(U.uRes, 640, 360);
      const sc = document.createElement('canvas'); sc.width = 640; sc.height = 360; const sx = sc.getContext('2d');
      const run = () => { const p0 = performance.now(); gl.uniform1f(U.uT, 100 + Math.random()); gl.drawArrays(gl.TRIANGLES, 0, 3); sx.drawImage(cv, 0, 0); sx.getImageData(0, 0, 1, 1); return performance.now() - p0; };
      ok = true; lastT = null;
    };
    finish();
  }

  function build(seed, density, dur) {
    seedV = [(seed * 1.37) % 50, (seed * 2.11) % 50];
    const r = mulberry(seed * 53 + 11); EV = []; let t = 46;
    while (t < dur - 20) {
      const bolts = []; const nb = 4 + Math.floor(r() * 3);
      for (let i = 0; i < nb; i++) bolts.push({ a: -Math.PI / 2 + (r() - .5) * 2.6 + (i % 2 ? Math.PI : 0) * (r() < .25 ? 1 : 0), L: 260 + r() * 420, s: r() * 1000 });
      EV.push({ t, k: EV.length, pan: (r() - .5) * .5, bolts }); t += 40 + r() * 30;
    }
  }
  const events = () => EV.map(e => ({ t: e.t, k: e.k, pan: e.pan }));
  function fx(t) {
    let f = 0, c = 0, cur = null;
    for (const e of EV) { const a = t - e.t; if (a < -1.4) break; if (a < 0) c = Math.max(c, ease((a + 1.4) / 1.4)); else { f = Math.max(f, Math.exp(-a / .3)); if (a < 1) cur = e; } }
    return { f, c, cur };
  }
  function bolt(ctx, x0, y0, ang, L, seed, frame) {
    const n = 14, pts = [[x0, y0]]; let x = x0, y = y0;
    for (let i = 1; i <= n; i++) { const f = i / n, j = (hsh(seed + i * 7.1 + frame * 3.3) - .5) * 70 * (1 - f * .4); x = x0 + Math.cos(ang) * L * f - Math.sin(ang) * j; y = y0 + Math.sin(ang) * L * f + Math.cos(ang) * j; pts.push([x, y]); }
    const path = new Path2D(); pts.forEach((p, i) => i ? path.lineTo(p[0], p[1]) : path.moveTo(p[0], p[1]));
    const bi = 5 + Math.floor(hsh(seed + frame) * 5), bp = pts[bi], ba = ang + (hsh(seed * 2 + frame) - .5) * 1.4;
    path.moveTo(bp[0], bp[1]); for (let i = 1; i <= 6; i++) { const f = i / 6, j = (hsh(seed + i * 3.7 + frame) - .5) * 40; path.lineTo(bp[0] + Math.cos(ba) * L * .35 * f - Math.sin(ba) * j, bp[1] + Math.sin(ba) * L * .35 * f + Math.cos(ba) * j); }
    return path;
  }

  let FB = null, armed = false;
  const arm = () => { armed = true; ['pointermove', 'pointerdown', 'keydown', 'touchstart'].forEach(e => removeEventListener(e, arm, true)); };
  ['pointermove', 'pointerdown', 'keydown', 'touchstart'].forEach(e => addEventListener(e, arm, { capture: true, passive: true }));
  function fallback(ctx, t, p, g, F, Cg) {
    const c = a => a.map(v => Math.round(v * 255)).join(',');
    if (!FB || FB.k !== p) { const mkB = col => { const s = document.createElement('canvas'); s.width = s.height = 128; const x = s.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(' + col + ',1)'); gr.addColorStop(.4, 'rgba(' + col + ',.4)'); gr.addColorStop(1, 'rgba(' + col + ',0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return s; }; FB = { k: p, rim: mkB(c(p.rim)), deep: mkB(c(p.deep)), dark: mkB('2,2,6'), acc: mkB(c(p.acc)) }; }
    ctx.fillStyle = '#04050c'; ctx.fillRect(0, 0, W, H);
    const sp = (img, x, y, sw, sh, a) => { ctx.globalAlpha = Math.min(1, a); ctx.drawImage(img, x - sw / 2, y - sh / 2, sw, sh); };
    ctx.globalCompositeOperation = 'lighter';
    sp(FB.deep, CX, CY - 160, 900, 1100, .9 * g);
    for (let i = 0; i < 26; i++) { const ph = ((t * .18 + hsh(i)) % 1), x = CX + Math.sin(i * 2.3 + t * .4) * 70 * (1 + ph * 2), y = CY - ph * 640, sz = 140 + 200 * (1 - ph); sp(FB.rim, x, y, sz * .7, sz, (1 - ph) * .28 * g * (1 + .5 * Cg)); }
    ctx.globalCompositeOperation = 'source-over';
    sp(FB.dark, CX, CY - 120, 260 * (1 - .2 * Cg), 520, .95);
    if (F > .01) { ctx.globalCompositeOperation = 'lighter'; sp(FB.acc, CX, CY - 100, 900, 900, F * .5); }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }
  function draw(ctx, t, tw) {
    if (!tried) { tried = true; initGL(); }
    const p = PAL[tw.palette] || PAL.cursed, g = tw.glow == null ? 1 : tw.glow, flashK = tw.wave == null ? 1 : tw.wave;
    const { f, c, cur } = fx(t), F = f * flashK, Cg = c * flashK, key = [tw.palette, g, flashK, tw.depth, tw.density, seedV[0]].join('|');
    ctx.save(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    if (ok) {
      const exp = true, tw2 = ctx.canvas.width, th2 = ctx.canvas.height;
      if (cv.width !== tw2 || cv.height !== th2) { cv.width = tw2; cv.height = th2; lastT = null; }
      if (lastKey !== key || lastT === null || (exp ? lastT !== t : Math.abs(t - lastT) >= 1 / 30)) {
      const t0 = performance.now();
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(U.uRes, cv.width, cv.height); gl.uniform2f(U.uSeed, seedV[0], seedV[1]);
      gl.uniform1f(U.uT, t); gl.uniform1f(U.uFlash, F); gl.uniform1f(U.uCharge, Cg * (1 - f));
      gl.uniform1f(U.uGlow, g); gl.uniform1f(U.uWarp, tw.depth == null ? 1 : tw.depth); gl.uniform1f(U.uDens, tw.density == null ? 1 : tw.density);
      gl.uniform1f(U.uBreath, .5 + .5 * Math.sin(t * TAU / 8)); gl.uniform1f(U.uGrow, ease(t / 90) * (.85 + .15 * Math.sin(t * TAU / 300)));
      gl.uniform3fv(U.uDeep, p.deep); gl.uniform3fv(U.uRim, p.rim); gl.uniform3fv(U.uHot, p.hot); gl.uniform3fv(U.uAcc, p.acc);
      gl.drawArrays(gl.TRIANGLES, 0, 3); lastT = t; lastKey = key;
      ctx.drawImage(cv, 0, 0, W, H); const dt = performance.now() - t0; avg = avg ? avg * .8 + dt * .2 : dt; 
      }
      else ctx.drawImage(cv, 0, 0, W, H);
    } else if (tried) fallback(ctx, t, p, g, F, Cg); else { ctx.fillStyle = '#05060c'; ctx.fillRect(0, 0, W, H); }
    if (cur && flashK > .02) {
      const a = t - cur.t, frame = Math.floor(t * 20);
      if (frame % 3 !== 2 && a < .9) {
        const k = (1 - a / .9) * Math.min(1, flashK);
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (const b of cur.bolts) {
          const path = bolt(ctx, CX, CY, b.a, b.L * (.6 + .4 * Math.min(1, a / .12)), b.s, Math.floor(frame / 3));
          ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle = `rgba(${p.bolt},${.18 * k})`; ctx.lineWidth = 22; ctx.stroke(path);
          ctx.strokeStyle = `rgba(${p.bolt},${.55 * k})`; ctx.lineWidth = 9; ctx.stroke(path);
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = `rgba(2,2,4,${.95 * k})`; ctx.lineWidth = 4; ctx.stroke(path);
        }
        if (a < .07) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(${p.bolt},${.08 * Math.min(1, flashK)})`; ctx.fillRect(0, 0, W, H); }
      }
    }
    ctx.restore();
  }
  return { build, draw, events };
})();
window.CursedScene.ORACLE_B = ['...#####...', '..####.##..', '.######.##.', '.#######.#.', '#######.###', '###########', '#...###...#', '##..###..##', '###########', '#####.#####', '####...####', '###########', '.##.....##.', '.##.#.#.##.', '..#######..', '...#####...', '....###....', '.....#.....'];
window.CursedScene.ORACLE_A = window.CursedScene.ORACLE = ['...#####...', '.########..', '#########..', '#########..', '##########.', '#########..', '#....##...#', '#...###.#..', '##..###....', '#######.###', '#######.###', '#####...##.', '.######....', '.#####.....', '..##.##....', '...####....', '...###.....', '....##.....'];
window.CursedScene.drawOracle = function (ctx, cx, cy, cell, alpha, color) {
  const G = window.CursedScene.ORACLE, w = G[0].length, h = G.length, x0 = cx - w * cell / 2, y0 = cy - h * cell / 2;
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color || '#FAFAFA';
  for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) if (G[r][c] === '#') ctx.fillRect(Math.round(x0 + c * cell), Math.round(y0 + r * cell), Math.ceil(cell), Math.ceil(cell));
  ctx.restore();
};
window.CursedScene.oracleSVG = function () {
  const G = window.CursedScene.ORACLE, w = G[0].length, h = G.length; let d = '';
  for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) if (G[r][c] === '#') d += 'M' + c + ' ' + r + 'h1v1h-1z';
  return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="100%" style="display:block" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="' + d + '"></path></svg>';
};
