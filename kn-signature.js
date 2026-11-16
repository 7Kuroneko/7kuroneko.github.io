/* Kuroneko · signature layer
 * Site-wide: intro sequence, cat-eye cursor, fullscreen menu, ⌘K palette,
 * section reveals + scroll progress, easter egg (type "neko" or the Konami code).
 * Reads projects from window.KN_PROJECTS (set by the page) — [{n,t,tag,href,img}].
 * Hooks: [data-kn=menu] opens the menu, [data-kn=palette] opens the palette,
 *        [data-cursor="LABEL"] shows a label in the cursor. */
(function () {
  if (window.__knSig) return; window.__knSig = 1;
  const MOON = '#E8ECCC', INK = '#0A0908', BONE = '#F2EFE8', MUTE = '#8E8980', LINE = '#24221F';
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MONO = "'Geist Mono',monospace", SANS = "'Satoshi','Geist',sans-serif";
  const GLOW = '0 0 6px rgba(232,236,204,.9),0 0 18px rgba(232,236,204,.5)';
  const P = () => (window.KN_PROJECTS || []);
  const MFONTS = { 'General Sans': ["'General Sans',sans-serif", '-.035em', '15px'], 'Instrument Serif': ["'Instrument Serif',serif", '-.01em', '17px'], 'Manrope': ["'Manrope',sans-serif", '-.04em', '14px'], 'Geist': ["'Geist',sans-serif", '-.04em', '14px'] };
  const MS = () => MFONTS[window.KN_MENU_FONT] || MFONTS['General Sans'], MF = () => MS()[0], MLS = () => MS()[1], MSZ = () => MS()[2];
  const EMAIL = 'thekuronekokan@outlook.com', GH = 'https://github.com/7Kuroneko', YT = 'https://www.youtube.com/@enterportals';
  const st = document.createElement('style');
  st.textContent = `
html{scroll-behavior:smooth}
html.kn-cur,html.kn-cur *{cursor:none!important}
html.kn-cur input,html.kn-cur textarea{cursor:text!important}
.kn-rv{opacity:0;transform:translateY(48px);clip-path:inset(0 0 18% 0);transition:opacity 1s cubic-bezier(.2,.8,.2,1),transform 1.1s cubic-bezier(.2,.8,.2,1),clip-path 1.1s cubic-bezier(.2,.8,.2,1)}
.kn-rv.kn-in{opacity:1;transform:none;clip-path:inset(0 0 0 0)}
@keyframes knUp{from{transform:translateY(105%)}to{transform:none}}
@keyframes knFade{from{opacity:0}to{opacity:1}}
@keyframes knBlink{0%,92%,100%{transform:scaleY(1)}96%{transform:scaleY(.06)}}
@media (prefers-reduced-motion:reduce){.kn-rv{opacity:1;transform:none;clip-path:none;transition:none}}`;
  document.head.appendChild(st);
  const el = (tag, css, html) => { const e = document.createElement(tag); if (css) e.style.cssText = css; if (html != null) e.innerHTML = html; return e; };
  const scramble = (node, text, dur) => { const G = '01アイウエオカキクケコ#%/<>*', t0 = performance.now();
    (function f(now) { const k = Math.min(1, (now - t0) / dur); let s = ''; for (let i = 0; i < text.length; i++) { const r = i / text.length; s += text[i] === ' ' ? ' ' : k > r * .8 + .2 * Math.random() * (1 - k) + .001 && k >= r * .9 ? text[i] : G[(Math.random() * G.length) | 0]; } node.textContent = k >= 1 ? text : s; if (k < 1) requestAnimationFrame(f); })(t0); };
  const eyeSVG = (w, glow) => `<svg viewBox="0 0 120 60" width="${w}" style="display:block;overflow:visible"><path d="M4 30 Q60 -14 116 30 Q60 74 4 30Z" fill="${MOON}" ${glow ? 'filter="url(#knG)"' : ''}></path><ellipse class="kn-pu" cx="60" cy="30" rx="7" ry="24" fill="${INK}"></ellipse><defs><filter id="knG" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="3" result="b"></feGaussianBlur><feMerge><feMergeNode in="b"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge></filter></defs></svg>`;

  /* ---------- INTRO ---------- */
  function intro() {
    let seen = false; try { seen = sessionStorage.getItem('kn-intro') === '1'; sessionStorage.setItem('kn-intro', '1'); } catch (e) {}
    if (seen || reduce) return;
    const o = el('div', `position:fixed;inset:0;z-index:9000;pointer-events:auto`);
    const top = el('div', `position:absolute;left:0;right:0;top:0;height:50.5%;background:${INK};transition:transform 1s cubic-bezier(.76,0,.24,1)`);
    const bot = el('div', `position:absolute;left:0;right:0;bottom:0;height:50.5%;background:${INK};transition:transform 1s cubic-bezier(.76,0,.24,1)`);
    const mid = el('div', `position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px;transition:opacity .4s`);
    const eyes = el('div', `display:flex;gap:46px;transform:scaleY(.02);transition:transform .7s cubic-bezier(.2,.8,.2,1)`, eyeSVG(84, 1) + eyeSVG(84, 1));
    const word = el('div', `font-family:${MONO};font-size:13px;letter-spacing:.36em;color:${BONE};text-transform:uppercase;min-height:1em`);
    const cnt = el('div', `position:absolute;left:40px;bottom:32px;font-family:${MONO};font-size:11px;letter-spacing:.12em;color:${MUTE}`, '000');
    const vs = el('div', `position:absolute;right:40px;bottom:32px;font-family:${MONO};font-size:11px;letter-spacing:.12em;color:${MOON};text-shadow:${GLOW}`, '1 PETER 4:10');
    const ln = el('div', `position:absolute;left:0;top:50%;height:1px;width:100%;background:${MOON};box-shadow:${GLOW};transform:scaleX(0);transform-origin:left;transition:transform 1.6s cubic-bezier(.6,0,.2,1)`);
    mid.append(eyes, word); o.append(top, bot, ln, mid, cnt, vs); document.body.appendChild(o);
    const T0 = performance.now(); let done = false;
    (function c(now) { const k = Math.min(1, (now - T0) / 2200); cnt.textContent = String(Math.round(k * 100)).padStart(3, '0'); if (k < 1 && !done) requestAnimationFrame(c); })(T0);
    setTimeout(() => { eyes.style.transform = 'scaleY(1)'; }, 250);
    setTimeout(() => { eyes.style.transform = 'scaleY(.05)'; setTimeout(() => eyes.style.transform = 'scaleY(1)', 140); }, 1150);
    setTimeout(() => scramble(word, 'The Kuroneko Company', 900), 500);
    setTimeout(() => { ln.style.transform = 'scaleX(1)'; }, 300);
    const out = () => { if (done) return; done = true; mid.style.opacity = 0; cnt.style.opacity = 0; vs.style.opacity = 0; ln.style.opacity = 0;
      top.style.transform = 'translateY(-101%)'; bot.style.transform = 'translateY(101%)'; o.style.pointerEvents = 'none'; setTimeout(() => o.remove(), 1100); };
    setTimeout(out, 2600); o.addEventListener('click', out);
  }

  /* ---------- CURSOR ---------- */
  function cursor() {
    if (!fine) return;
    document.documentElement.classList.add('kn-cur');
    const dot = el('div', `position:fixed;left:0;top:0;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:${MOON};z-index:2147483601;pointer-events:none;mix-blend-mode:difference;transition:opacity .2s,transform .2s`);
    const paw = '<svg viewBox="0 0 40 40" width="26" style="display:block;overflow:visible"><g fill="' + MOON + '"><ellipse cx="20" cy="26.5" rx="8.6" ry="7.4"></ellipse><ellipse cx="9" cy="16" rx="3.6" ry="4.6" transform="rotate(-18 9 16)"></ellipse><ellipse cx="16" cy="9.5" rx="3.6" ry="4.8" transform="rotate(-6 16 9.5)"></ellipse><ellipse cx="24" cy="9.5" rx="3.6" ry="4.8" transform="rotate(6 24 9.5)"></ellipse><ellipse cx="31" cy="16" rx="3.6" ry="4.6" transform="rotate(18 31 16)"></ellipse></g></svg>';
    const eye = el('div', `position:fixed;left:0;top:0;width:26px;margin:-13px 0 0 -13px;z-index:2147483600;pointer-events:none;mix-blend-mode:difference;transition:opacity .25s`, paw);
    const eyeIn = eye.firstChild; eyeIn.style.transition = 'transform .35s cubic-bezier(.2,.8,.2,1),filter .35s'; eyeIn.style.transform = 'scale(.55)'; eyeIn.style.opacity = '.8';
    const pu = null;
    const lab = el('div', `position:fixed;left:0;top:0;z-index:2147483602;pointer-events:none;font-family:${MONO};font-size:10px;letter-spacing:.14em;color:${INK};background:${MOON};padding:5px 8px;transform:translate(18px,14px);opacity:0;transition:opacity .2s;white-space:nowrap`);
    document.body.append(eye, dot, lab);
    let x = innerWidth / 2, y = innerHeight / 2, ex = x, ey = y, vx = 0, ang = 0, shown = false, hot = false;
    addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; x = e.clientX; y = e.clientY; if (!shown) { shown = true; ex = x; ey = y; } }, { passive: true });
    document.addEventListener('mouseleave', () => { dot.style.opacity = 0; eye.style.opacity = 0; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = 1; eye.style.opacity = 1; });
    addEventListener('pointerdown', () => { dot.style.transform = 'scale(2.2)'; }); addEventListener('pointerup', () => { dot.style.transform = ''; });
    addEventListener('pointerover', e => { const t = e.target.closest && e.target.closest('a,button,[data-cursor],input,label'); const l = t && t.closest('[data-cursor]');
      hot = !!t; eyeIn.style.transform = hot ? 'scale(1.15)' : 'scale(.55)'; eyeIn.style.opacity = hot ? '1' : '.8'; const L = l && l.getAttribute('data-cursor'); lab.textContent = L || ''; lab.style.opacity = L ? 1 : 0; });
    (function f() { const dx = x - ex; ex += dx * .18; ey += (y - ey) * .18; vx += (dx * .02 - vx) * .2;
      dot.style.left = x + 'px'; dot.style.top = y + 'px'; eye.style.left = ex + 'px'; eye.style.top = ey + 'px'; lab.style.left = x + 'px'; lab.style.top = y + 'px';
      const sp = Math.hypot(x - ex, y - ey); if (sp > 1.5) ang += ((Math.atan2(y - ey, x - ex) * 180 / Math.PI + 90) - ang + 540) % 360 - 180 > 0 ? Math.min(8, (((Math.atan2(y - ey, x - ex) * 180 / Math.PI + 90) - ang + 540) % 360 - 180) * .15) : Math.max(-8, (((Math.atan2(y - ey, x - ex) * 180 / Math.PI + 90) - ang + 540) % 360 - 180) * .15);
      eye.style.transform = 'rotate(' + ang + 'deg)'; requestAnimationFrame(f); })();
  }

  /* ---------- MENU ---------- */
  let menuEl = null;
  const clickNav = name => { const a = [...document.querySelectorAll('header nav a')].find(n => n.textContent.trim().toLowerCase() === name); if (a) a.click(); };
  const goWork = () => { const w = document.getElementById('work-6b'); if (w) scrollTo({ top: w.getBoundingClientRect().top + scrollY - 32, behavior: 'smooth' }); };
  function menu() {
    if (menuEl) return closeMenu();
    const o = el('div', `position:fixed;inset:0;z-index:8000;background:${INK};color:${BONE};display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);clip-path:inset(0 0 100% 0);transition:clip-path .8s cubic-bezier(.76,0,.24,1)`);
    const L = el('div', `display:flex;flex-direction:column;justify-content:space-between;padding:32px clamp(20px,4vw,48px) 36px;min-width:0`);
    const head = el('div', `display:flex;justify-content:space-between;align-items:center;font-family:${MONO};font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:${MUTE}`, `<span>Index · The Kuroneko Company</span>`);
    const x = el('button', `font:inherit;letter-spacing:inherit;text-transform:inherit;color:${BONE};background:none;border:1px solid ${LINE};padding:9px 14px`, 'Close ✕'); x.onclick = closeMenu; head.appendChild(x);
    const list = el('nav', `display:flex;flex-direction:column;gap:4px`);
    const items = [['Work', goWork], ['About', () => clickNav('about')], ['Contact', () => clickNav('contact')], ['GitHub ↗', () => open(GH, '_blank')], ['YouTube ↗', () => open(YT, '_blank')]];
    items.forEach(([t, fn], i) => { const row = el('div', `overflow:hidden`); const b = el('button', `display:flex;align-items:baseline;gap:22px;background:none;border:0;padding:4px 0;color:${BONE};font-family:${MF()};font-weight:400;font-size:clamp(36px,5.2vw,76px);line-height:1.04;letter-spacing:${MLS()};text-align:left;animation:knUp .9s cubic-bezier(.2,.8,.2,1) ${.25 + i * .06}s both;transition:color .25s,transform .4s cubic-bezier(.2,.8,.2,1)`, `<span style="font-family:${MONO};font-size:12px;letter-spacing:.1em;color:${MUTE};font-weight:400">0${i + 1}</span><span>${t}</span>`);
      b.onmouseenter = () => { b.style.color = MOON; b.style.transform = 'translateX(18px)'; b.style.textShadow = GLOW; }; b.onmouseleave = () => { b.style.color = BONE; b.style.transform = ''; b.style.textShadow = ''; };
      b.onclick = () => { closeMenu(); setTimeout(fn, 420); }; row.appendChild(b); list.appendChild(row); });
    const foot = el('div', `display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;font-family:${MONO};font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:${MUTE};animation:knFade .6s .7s both`, `<a href="mailto:${EMAIL}" style="color:${BONE}">${EMAIL}</a><span>Press <b style="color:${MOON}">⌘K</b> to search</span>`);
    L.append(head, list, foot);
    const R = el('div', `position:relative;border-left:1px solid ${LINE};display:flex;flex-direction:column;min-width:0;overflow:hidden`);
    const pv = el('div', `position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transform:scale(1.08);transition:opacity .5s,transform 1.2s cubic-bezier(.2,.8,.2,1)`);
    const sh = el('div', `position:absolute;inset:0;background:linear-gradient(90deg,${INK} 0%,rgba(10,9,8,.55) 55%,rgba(10,9,8,.2) 100%)`);
    const pl = el('div', `position:relative;display:flex;flex-direction:column;padding:96px clamp(20px,3vw,40px) 36px;overflow-y:auto;gap:0`);
    pl.appendChild(el('div', `font-family:${MONO};font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:${MUTE};padding-bottom:14px`, `All sheets · ${String(P().length).padStart(2, '0')}`));
    P().forEach((p, i) => { const a = el('a', `display:grid;grid-template-columns:36px minmax(0,1fr) auto;gap:14px;align-items:baseline;padding:11px 0;border-top:1px solid ${LINE};color:${BONE};text-decoration:none;font-family:${MF()};font-weight:400;font-size:${MSZ()};letter-spacing:-.005em;animation:knFade .5s ${.35 + i * .03}s both;transition:color .2s,padding .3s`, `<span style="font-family:${MONO};font-size:11px;color:${MUTE}">${p.n}</span><span>${p.t}</span><span style="font-family:${MONO};font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:${MUTE}">${p.tag.split(' · ')[0]}</span>`);
      a.href = p.href; a.onmouseenter = () => { a.style.color = MOON; a.style.paddingLeft = '10px'; pv.style.backgroundImage = `url("${p.img}")`; pv.style.opacity = .55; pv.style.transform = 'scale(1)'; };
      a.onmouseleave = () => { a.style.color = BONE; a.style.paddingLeft = '0'; pv.style.opacity = 0; pv.style.transform = 'scale(1.08)'; }; pl.appendChild(a); });
    R.append(pv, sh, pl); o.append(L, R);
    if (innerWidth < 800) { o.style.gridTemplateColumns = '1fr'; R.style.display = 'none'; }
    document.body.appendChild(o); menuEl = o; document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => requestAnimationFrame(() => o.style.clipPath = 'inset(0 0 0% 0)'));
  }
  function closeMenu() { if (!menuEl) return; const o = menuEl; menuEl = null; o.style.clipPath = 'inset(100% 0 0 0)'; document.documentElement.style.overflow = ''; setTimeout(() => o.remove(), 820); }

  /* ---------- PALETTE ---------- */
  let palEl = null;
  function palette() {
    if (palEl) return closePal();
    const acts = [
      ...P().map(p => ({ g: 'Work', t: p.t, s: p.n + ' · ' + p.tag, run: () => location.href = p.href })),
      { g: 'Go to', t: 'Work index', s: 'Section', run: goWork }, { g: 'Go to', t: 'About', s: 'Panel', run: () => clickNav('about') }, { g: 'Go to', t: 'Contact', s: 'Panel', run: () => clickNav('contact') },
      { g: 'Go to', t: 'Back to top', s: 'Scroll', run: () => scrollTo({ top: 0, behavior: 'smooth' }) }, { g: 'Go to', t: 'Open menu', s: 'Overlay', run: () => setTimeout(menu, 50) },
      { g: 'Links', t: 'Copy email', s: EMAIL, run: () => { navigator.clipboard && navigator.clipboard.writeText(EMAIL); toast('Email copied'); } },
      { g: 'Links', t: 'GitHub', s: 'github.com/7Kuroneko', run: () => open(GH, '_blank') }, { g: 'Links', t: 'YouTube · Portals', s: '@enterportals', run: () => open(YT, '_blank') }];
    const o = el('div', `position:fixed;inset:0;z-index:8500;background:rgba(5,5,4,.6);backdrop-filter:blur(6px);display:flex;justify-content:center;align-items:flex-start;padding:14vh 16px 16px;animation:knFade .2s both`);
    const box = el('div', `width:min(640px,100%);background:rgba(18,17,16,.92);border:1px solid #34302B;box-shadow:0 40px 80px rgba(0,0,0,.6),0 0 0 1px rgba(232,236,204,.05);display:flex;flex-direction:column;max-height:70vh;color:${BONE};font-family:'Geist',sans-serif;animation:knFade .25s both`);
    const top = el('div', `display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid ${LINE}`, `<span style="font-family:${MONO};font-size:12px;color:${MOON};text-shadow:${GLOW}">›</span>`);
    const inp = el('input', `flex:1;min-width:0;background:none;border:0;outline:0;color:${BONE};font:500 17px/1.3 'Geist',sans-serif`); inp.placeholder = 'Search projects, pages, links…';
    top.append(inp, el('span', `font-family:${MONO};font-size:10px;color:${MUTE};border:1px solid ${LINE};padding:3px 6px`, 'ESC'));
    const res = el('div', `overflow-y:auto;padding:6px 0`);
    const ft = el('div', `display:flex;gap:18px;padding:10px 18px;border-top:1px solid ${LINE};font-family:${MONO};font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:${MUTE}`, '<span>↑↓ Move</span><span>↵ Open</span><span style="margin-left:auto">Kuroneko · ⌘K</span>');
    box.append(top, res, ft); o.appendChild(box); document.body.appendChild(o); palEl = o;
    let sel = 0, cur = [];
    const draw = () => { const q = inp.value.trim().toLowerCase(); cur = acts.filter(a => !q || (a.t + ' ' + a.s + ' ' + a.g).toLowerCase().includes(q)); sel = Math.min(sel, Math.max(0, cur.length - 1)); res.innerHTML = ''; let g = '';
      if (!cur.length) res.appendChild(el('div', `padding:18px;color:${MUTE};font-size:14px`, 'Nothing found.'));
      cur.forEach((a, i) => { if (a.g !== g) { g = a.g; res.appendChild(el('div', `padding:12px 18px 6px;font-family:${MONO};font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:${MUTE}`, g)); }
        const r = el('div', `display:flex;justify-content:space-between;gap:16px;align-items:baseline;padding:10px 18px;font-size:15px;background:${i === sel ? 'rgba(232,236,204,.08)' : 'transparent'};box-shadow:${i === sel ? 'inset 2px 0 0 ' + MOON : 'none'};color:${i === sel ? MOON : BONE}`, `<span>${a.t}</span><span style="font-family:${MONO};font-size:10px;letter-spacing:.06em;color:${MUTE};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:50%">${a.s}</span>`);
        r.onmouseenter = () => { if (sel !== i) { sel = i; draw(); } }; r.onclick = () => run(a); res.appendChild(r); if (i === sel) setTimeout(() => { const rt = r.offsetTop - res.offsetTop, h = res.clientHeight; if (rt < res.scrollTop) res.scrollTop = rt - 30; else if (rt + r.offsetHeight > res.scrollTop + h) res.scrollTop = rt + r.offsetHeight - h; }); }); };
    const run = a => { closePal(); setTimeout(a.run, 60); };
    inp.addEventListener('input', () => { sel = 0; draw(); });
    inp.addEventListener('keydown', e => { if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(1, cur.length); draw(); } else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + cur.length) % Math.max(1, cur.length); draw(); } else if (e.key === 'Enter' && cur[sel]) run(cur[sel]); });
    o.addEventListener('click', e => { if (e.target === o) closePal(); });
    draw(); setTimeout(() => inp.focus(), 20);
  }
  function closePal() { if (!palEl) return; palEl.remove(); palEl = null; }
  function toast(t) { const n = el('div', `position:fixed;left:50%;bottom:32px;transform:translateX(-50%);z-index:9500;font-family:${MONO};font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${INK};background:${MOON};padding:10px 16px;box-shadow:${GLOW};animation:knFade .2s both`, t); document.body.appendChild(n); setTimeout(() => n.remove(), 1600); }

  /* ---------- REVEALS + PROGRESS ---------- */
  function reveals() {
    const bar = el('div', `position:fixed;left:0;top:0;height:2px;width:100%;z-index:7000;background:${MOON};box-shadow:${GLOW};transform-origin:left;transform:scaleX(0);pointer-events:none`);
    document.body.appendChild(bar);
    addEventListener('scroll', () => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; }, { passive: true });
    if (reduce || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('kn-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    const scan = () => document.querySelectorAll('[data-r=figs] article,[data-r=footer],[data-kn-rv]').forEach(n => { if (n.__kn) return; n.__kn = 1; const r = n.getBoundingClientRect(); if (r.top < innerHeight) return; n.classList.add('kn-rv'); io.observe(n); });
    scan(); new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
  }

  /* ---------- EASTER EGG: the cat in the dark ---------- */
  let egg = false;
  function catEyes() {
    if (egg) return; egg = true;
    const o = el('div', `position:fixed;inset:0;z-index:9200;background:rgba(3,3,3,.96);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px;animation:knFade .8s both`);
    const pair = el('div', `display:flex;gap:min(16vw,200px);transform:scaleY(.02);transition:transform .9s cubic-bezier(.2,.8,.2,1)`, eyeSVG(Math.min(innerWidth * .26, 320), 1) + eyeSVG(Math.min(innerWidth * .26, 320), 1));
    const say = el('div', `font-family:${MONO};font-size:12px;letter-spacing:.4em;color:${MUTE};text-transform:uppercase;opacity:0;transition:opacity 1s 1.2s`, 'にゃ · you found the kuroneko');
    o.append(pair, say); document.body.appendChild(o);
    const pus = o.querySelectorAll('.kn-pu');
    const mv = e => { pus.forEach((p, i) => { const r = p.ownerSVGElement.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, dx = (e.clientX - cx) / innerWidth, dy = (e.clientY - cy) / innerHeight; p.setAttribute('cx', 60 + Math.max(-30, Math.min(30, dx * 70))); p.setAttribute('cy', 30 + Math.max(-6, Math.min(6, dy * 18))); p.setAttribute('rx', 7 + 4 * Math.min(1, Math.hypot(dx, dy) * 2)); }); };
    addEventListener('pointermove', mv);
    setTimeout(() => { pair.style.transform = 'scaleY(1)'; say.style.opacity = 1; }, 150);
    const blink = () => { pair.style.transition = 'transform .12s'; pair.style.transform = 'scaleY(.04)'; setTimeout(() => pair.style.transform = 'scaleY(1)', 130); };
    const b1 = setTimeout(blink, 2400), b2 = setTimeout(blink, 4300);
    const close = () => { clearTimeout(b1); clearTimeout(b2); pair.style.transition = 'transform .5s'; pair.style.transform = 'scaleY(.02)'; o.style.transition = 'opacity .8s .3s'; o.style.opacity = 0; removeEventListener('pointermove', mv); setTimeout(() => { o.remove(); egg = false; }, 1200); };
    o.addEventListener('click', close); setTimeout(close, 7000);
  }

  /* ---------- KEYS + HOOKS ---------- */
  const KON = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']; let kb = [], typed = '';
  addEventListener('keydown', e => {
    const inField = /^(INPUT|TEXTAREA)$/.test((e.target.tagName || '')) || e.target.isContentEditable;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palette(); return; }
    if (e.key === 'Escape') { if (palEl) closePal(); else if (menuEl) closeMenu(); return; }
    if (inField) return;
    if (e.key === '/') { e.preventDefault(); palette(); return; }
    kb = [...kb, e.key].slice(-10); if (kb.join() === KON.join()) catEyes();
    if (e.key.length === 1) { typed = (typed + e.key.toLowerCase()).slice(-4); if (typed === 'neko') catEyes(); }
  });
  document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-kn]'); if (!t) return; const k = t.getAttribute('data-kn'); if (k === 'menu') { e.preventDefault(); menu(); } else if (k === 'palette') { e.preventDefault(); palette(); } });
  let lc = 0, lt = 0; document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('header a'); if (!a || a.parentElement.tagName === 'NAV') return; const n = performance.now(); lc = n - lt < 600 ? lc + 1 : 1; lt = n; if (lc >= 5) { lc = 0; catEyes(); } });
  const boot = () => { intro(); cursor(); reveals(); };
  if (document.body) boot(); else addEventListener('DOMContentLoaded', boot);
  window.KN = { menu, palette, catEyes };
})();
