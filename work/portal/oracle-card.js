// Shared Oracle card (hooded mask) for FocusField videos that don't build their own.
// Usage: <script src="oracle-card.js" data-verse="…" data-ref="BOOK 1:1 · NLT"></script> after the main script.
// Optional data-more='[[startSec, "verse", "REF"], …]' adds more Oracle appearances later in the video
// (each shown ~23 s: 3.5 s in, held, 3.5 s out). Every verse is kept to 3 lines at most.
// Live: reads the page's global `videoTime`. Export: call OracleCard.draw(rx, t) after drawCards(t).
(function () {
  const me = document.currentScript;
  const VERSE = me.dataset.verse || '', REF = me.dataset.ref || '';
  const OR_IN = 16, OR_FULL = 19.5, OR_HOLD = 36, OR_OUT = 39.5;
  const G = ["....#######...","..##########..",".############.","#############.","###...........","##.##########.","##.#########..","##.#....##....","##.#...###....","##.##..###....","##.#######....","##.#######....","##.#####......","##..######....","##..#####.....","##...##.##....","###...####....","####..###.....","#####..##.....","#######....###","#######...####","##############","##############","##############"];
  let MORE = []; try { MORE = JSON.parse(me.dataset.more || '[]'); } catch (e) {}
  const CARDS = [{ a: OR_IN, verse: VERSE, ref: REF }].concat(MORE.map(([a, verse, ref]) => ({ a, verse, ref })));
  const one = (c, t) => { const x = t - c.a, F = OR_FULL - OR_IN, Hd = OR_HOLD - OR_IN, O = OR_OUT - OR_IN; if (x < 0 || x > O) return 0; if (x < F) return x / F; if (x < Hd) return 1; return 1 - (x - Hd) / (O - Hd); };
  const cardAt = t => { for (const c of CARDS) if (one(c, t) > 0) return c; return CARDS[0]; };
  const alpha = t => one(cardAt(t), t);
  const cs = getComputedStyle(document.documentElement);
  const HALO = (cs.getPropertyValue('--halo') || '#FFF738').trim() || '#FFF738';
  const LUMEN = (cs.getPropertyValue('--lumen') || '#FAFAFA').trim() || '#FAFAFA';

  const st = document.createElement('style');
  st.textContent = `
#oracle.kc{position:absolute;inset:0;z-index:8;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;pointer-events:none;opacity:0;padding-bottom:clamp(40px,10vh,110px)}
#oracle.kc::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 70% 60% at 50% 50%,rgba(4,4,8,.66),rgba(4,4,8,.18) 70%,transparent);z-index:-1}
#oracle.kc .mask{display:block;color:#FAFAFA;width:clamp(53px,min(6.7vw,11.45vh),134px);aspect-ratio:14/24;margin-bottom:clamp(18px,3.4vh,40px)}
#oracle.kc .who{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:clamp(9px,.85vw,12px);letter-spacing:.5em;text-transform:uppercase;color:${HALO};margin-bottom:clamp(14px,2.8vh,34px)}
#oracle.kc p{font-family:'DM Sans',system-ui,sans-serif;font-weight:300;font-size:clamp(16px,min(1.9vw,3.6vh),32px);letter-spacing:.04em;line-height:1.55;margin:0;color:${LUMEN};max-width:58ch;text-wrap:pretty;padding:0 6%}
#oracle.kc .ref{margin:clamp(14px,2.8vh,34px) 0 0}`;
  document.head.appendChild(st);

  let d = ''; G.forEach((row, r) => { for (let c = 0; c < row.length; c++) if (row[c] === '#') d += 'M' + c + ' ' + r + 'h1v1h-1z'; });
  const card = document.createElement('div');
  card.className = 'kc'; card.id = 'oracle';
  card.innerHTML = '<span class="mask" aria-hidden="true"><svg viewBox="0 0 14 24" width="100%" height="100%" shape-rendering="crispEdges" style="display:block"><path fill="currentColor" d="' + d + '"/></svg></span><div class="who">THE ORACLE</div><p></p><div class="who ref"></div>';
  card.querySelector('p').textContent = VERSE;
  card.querySelector('.ref').textContent = REF;
  const intro = document.getElementById('intro'), stage = document.getElementById('stage') || (intro && intro.parentNode) || document.body;
  if (intro && intro.parentNode) intro.parentNode.insertBefore(card, intro.nextSibling); else stage.appendChild(card);

  let last = -1, shown = CARDS[0];
  function tick() {
    try { const t = typeof videoTime === 'number' ? videoTime : 0, c = cardAt(t); if (c !== shown) { shown = c; card.querySelector('p').textContent = c.verse; card.querySelector('.ref').textContent = c.ref; }
      const a = Math.round(alpha(t) * 1000) / 1000; if (a !== last) { card.style.opacity = a; last = a; } } catch (e) {}
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  function draw(rx, t) {
    const a = alpha(t); if (a < 0.002) return; const C = cardAt(t), V = C.verse, R = C.ref;
    rx.save(); rx.globalAlpha = a;
    rx.save(); rx.translate(960, 540); rx.scale(1344, 648);
    const g = rx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, 'rgba(4,4,8,0.66)'); g.addColorStop(0.7, 'rgba(4,4,8,0.18)'); g.addColorStop(1, 'rgba(4,4,8,0)');
    rx.fillStyle = g; rx.fillRect(-1, -1, 2, 2); rx.restore();
    rx.fillStyle = '#FAFAFA';
    const cell = 8.25, gx = 960 - 14 * cell / 2, gy = 330 - 24 * cell / 2;
    G.forEach((row, r) => { for (let c = 0; c < 14; c++) if (row[c] === '#') rx.fillRect(Math.round(gx + c * cell), Math.round(gy + r * cell), cell, cell); });
    rx.textAlign = 'center'; rx.textBaseline = 'alphabetic';
    rx.font = "500 22px 'JetBrains Mono', monospace"; rx.letterSpacing = '11px'; rx.fillStyle = HALO; rx.fillText('THE ORACLE', 960, 478);
    rx.letterSpacing = '1.5px'; rx.fillStyle = LUMEN;
    let fs = 34, ol;   // wrap at 1150 px; shrink until it fits in 3 lines
    for (; fs >= 24; fs -= 2) { rx.font = "300 " + fs + "px 'DM Sans', system-ui, sans-serif"; ol = []; let on = '';
      for (const w of V.split(' ')) { const tl = on ? on + ' ' + w : w; if (rx.measureText(tl).width > 1150 && on) { ol.push(on); on = w; } else on = tl; }
      if (on) ol.push(on); if (ol.length <= 3) break; }
    const lh = Math.round(fs * 1.6); ol.forEach((x, i) => rx.fillText(x, 960, 556 + i * lh));
    rx.font = "500 22px 'JetBrains Mono', monospace"; rx.letterSpacing = '11px'; rx.fillStyle = HALO;
    rx.fillText(R, 960, 556 + (ol.length - 1) * lh + 66);
    rx.letterSpacing = '0px'; rx.restore();
  }
  window.OracleCard = { alpha, draw };
})();
