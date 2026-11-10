/* Minijuegos. Cada uno recibe (ctx, opts, done):
   ctx = { stage, img(src,label,cls), sfx(name), el(tag,cls,html) }  ·  done() avanza la historia. */

/* Tarjeta de "inténtalo otra vez" que comparten los minijuegos en los que se puede perder */
function retryCard(ctx, g, text, again) {
  const c = ctx.el('div', 'retry-card');
  const p = ctx.el('p'); p.textContent = text;
  const b = ctx.el('button', 'big', 'Intentar otra vez');
  b.addEventListener('pointerdown', e => e.stopPropagation());
  b.addEventListener('click', e => { e.stopPropagation(); c.remove(); again(); });
  c.append(p, b); g.append(c);
  ctx.sfx('sfx_fail');
}

const MINIGAMES = {

  /* Nivel 1A — "Grabar": cada punto aparece un momento y desaparece si no se toca a tiempo.
     Con demasiados fallos se puede intentar otra vez; el que se escapa vuelve a salir más adelante. */
  record(ctx, opts, done) {
    const g = ctx.el('div', 'game');
    const need = opts.need || opts.spots.length, maxMiss = opts.misses || 3, base = opts.showMs || 1200;
    const banner = ctx.el('div', 'banner', '');
    const flash = ctx.el('div', 'flash');
    const vf = ctx.img('assets/ui/ui_viewfinder.png', '', 'vf');
    vf.classList.remove('ph'); vf.style.display = 'none';
    vf.onload = () => { vf.style.display = ''; };
    vf.onerror = () => { vf.style.display = 'none'; };
    const lives = ctx.el('div', 'rec-lives'), ls = [...Array(maxMiss)].map(() => ctx.el('i')); lives.append(...ls);
    const msg = ctx.el('div', 'msg', '');
    g.append(banner, lives, msg, flash, ctx.el('div', 'vf'), vf);
    ctx.stage.append(g);

    let got = 0, miss = 0, queue = [], over = false, tutorial = true;
    const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(p => p[1]);
    const alive = () => g.isConnected && !over;
    function paint() {
      banner.textContent = 'Grabar: ' + got + ' / ' + need;
      ls.forEach((d, i) => d.classList.toggle('lost', i < miss));
    }
    const next = () => setTimeout(show, 280 + Math.random() * 520);
    function show() {
      if (!alive()) return;
      const s = queue.shift();
      // El primero dura más y lleva la mano; después van cada vez más rápido
      const ms = tutorial ? 2600 : Math.max(800, base - got * 90);
      const h = ctx.el('div', 'hot timed');
      h.style.left = s.x + '%'; h.style.top = s.y + '%'; h.title = s.label; h.style.setProperty('--t', ms + 'ms');
      g.append(h);
      let hint = null;
      if (tutorial) {
        hint = ctx.img('assets/ui/ui_hint_tap.png', '', 'tap-hint', true);
        hint.style.left = (s.x - 7) + '%'; hint.style.top = s.y + '%'; g.append(hint);
        tutorial = false;
      }
      const expire = setTimeout(() => {
        if (hint) hint.remove();
        if (!alive()) return;
        h.remove(); miss++; paint(); queue.push(s);
        ctx.sfx('sfx_fail'); msg.textContent = '¡Se fue!'; setTimeout(() => { msg.textContent = ''; }, 500);
        if (miss >= maxMiss) { over = true; retryCard(ctx, g, 'Se te escaparon ' + miss + ' tomas', start); }
        else next();
      }, ms);
      h.addEventListener('pointerdown', e => {
        e.stopPropagation();
        if (over || h.classList.contains('got')) return;
        clearTimeout(expire); if (hint) hint.remove();
        h.classList.add('got'); got++; paint();
        flash.classList.remove('on'); void flash.offsetWidth; flash.classList.add('on');
        ctx.sfx('sfx_rec');
        setTimeout(() => h.remove(), 320);
        if (got >= need) { over = true; setTimeout(() => { g.remove(); done(); }, 700); }
        else next();
      });
    }
    function start() {
      got = 0; miss = 0; over = false; msg.textContent = '';
      queue = [opts.spots[0], ...shuffle(opts.spots.slice(1))];
      paint(); setTimeout(show, 600);
    }
    start();
  },

  /* Nivel 1B — "Remar al compás": la zona cambia de lugar y se angosta en cada remada.
     Hay que acertar un mínimo; si no, se puede intentar otra vez. */
  row(ctx, opts, done) {
    const beats = opts.beats || 8, need = opts.need || 5, period = opts.period || 1500;
    const g = ctx.el('div', 'game');
    const banner = ctx.el('div', 'banner', 'Toca cuando el remo cruce la zona verde');
    const track = ctx.el('div', 'track');
    const zone = ctx.el('div', 'zone'); const mark = ctx.el('div', 'mark');
    track.append(zone, mark);
    const dots = ctx.el('div', 'dots');
    const ds = [...Array(beats)].map(() => ctx.el('i'));
    dots.append(...ds);
    const msg = ctx.el('div', 'msg', '');
    const btn = ctx.el('button', 'big', '¡Rema!');
    btn.style.cssText = 'position:absolute;bottom:8%;left:50%;transform:translateX(-50%)';
    g.append(banner, track, dots, msg, btn);
    ctx.stage.append(g);

    let beat, hits, tapped, t0, raf, finished = true, zLeft = 0, zWidth = 0;
    function setZone(i) {
      zWidth = 26 - (i / Math.max(1, beats - 1)) * 14;       // de 26 % a 12 % del carril
      zLeft = 14 + Math.random() * (100 - 14 - zWidth - 4);  // nunca pegada al inicio: hay que alcanzar a reaccionar
      zone.style.left = zLeft + '%'; zone.style.width = zWidth + '%';
    }
    const pos = now => ((now - t0) % period) / period;
    const markLeft = p => p * (track.clientWidth - mark.offsetWidth);
    function frame(now) {
      if (finished || !g.isConnected) return;
      const cycle = Math.floor((now - t0) / period);
      if (cycle > beat) {                       // pasó el ciclo sin tocar = fallo
        if (!tapped) ds[beat].classList.add('miss');
        beat = cycle; tapped = false;
        if (beat >= beats) return end();
        setZone(beat);
      }
      mark.style.left = markLeft(pos(now)) + 'px';
      raf = requestAnimationFrame(frame);
    }
    function tap(e) {
      e && e.stopPropagation();
      if (tapped || finished) return;
      tapped = true;
      const W = track.clientWidth, center = (markLeft(pos(performance.now())) + mark.offsetWidth / 2) / W * 100;
      const ok = center >= zLeft - 1 && center <= zLeft + zWidth + 1;
      ds[beat].classList.add(ok ? 'hit' : 'miss');
      if (ok) hits++;
      ctx.sfx(ok ? 'sfx_remo' : 'sfx_fail');
      msg.textContent = ok ? '¡Bien!' : '¡Casi!';
      setTimeout(() => { if (!finished) msg.textContent = ''; }, 500);
    }
    function end() {
      finished = true; cancelAnimationFrame(raf);
      if (hits < need) { msg.textContent = ''; return retryCard(ctx, g, 'Remaste ' + hits + ' de ' + beats + '. Necesitas ' + need, start); }
      msg.textContent = hits + ' de ' + beats + '. ¡Vamos bien!';
      ctx.sfx('sfx_ok');
      setTimeout(() => { g.remove(); done(); }, 1400);
    }
    function start() {
      beat = 0; hits = 0; tapped = false; msg.textContent = '';
      ds.forEach(d => d.classList.remove('hit', 'miss'));
      setZone(0); t0 = performance.now(); finished = false;
      raf = requestAnimationFrame(frame);
    }
    btn.addEventListener('pointerdown', tap);
    g.addEventListener('pointerdown', tap);
    start();
  },

  /* Nivel 2 — "Enfocar la lancha": mantener el visor sobre la lancha ~15 s. No hay derrota:
     si se pierde, la barra baja y se recupera al volver a enfocar. */
  focus(ctx, opts, done) {
    const need = (opts.seconds || 15) * 1000;
    const g = ctx.el('div', 'game focus-game');
    const banner = ctx.el('div', 'banner', 'Mantén el visor sobre la lancha');
    const meter = ctx.el('div', 'focus-meter'), fill = ctx.el('i'); meter.append(fill);
    const boat = ctx.el('div', 'boat'), hull = ctx.el('div', 'boat-hull');
    hull.append(ctx.img('assets/objects/obj_lancha_silueta.png', 'Lancha', 'boat-img'));
    boat.append(hull);
    if (opts.size) boat.style.width = opts.size + '%';
    const path = opts.path || { cx: 50, ax: 28, cy: 42, ay: 10 };
    let front = null;                               // recorte del fondo que queda delante de la lancha (con la misma niebla)
    if (opts.front) {
      front = ctx.el('div', 'layer focus-front'); front.style.clipPath = opts.front.clip;
      front.append(ctx.img(opts.front.src, '', 'bg', true), ctx.img('assets/fx/fog_overlay.png', '', 'fog', true));
    }
    const finder = ctx.el('div', 'finder', '<span class="rec">REC</span>');
    g.append(boat, ...(front ? [front] : []), finder, banner, meter);
    ctx.stage.append(g);

    let px = -100, py = -100, active = false;      // posición del dedo o cursor, en % del escenario
    let prog = 0, phase = 0, elapsed = 0, last = performance.now(), finished = false, wasOn = false, lastRec = -9999, x = 50, y = 40;
    function track(e) {
      e.stopPropagation();
      const r = ctx.stage.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width * 100; py = (e.clientY - r.top) / r.height * 100;
      active = true;
      finder.style.left = px + '%'; finder.style.top = py + '%'; finder.style.display = 'block';
    }
    const release = e => { if (e.type === 'pointerleave' || e.pointerType !== 'mouse') { active = false; finder.style.display = 'none'; } };
    g.addEventListener('pointerdown', track);
    g.addEventListener('pointermove', track);
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => g.addEventListener(n, release));

    function frame(now) {
      if (finished || !g.isConnected) return;       // si el jugador volvió al mapa, se detiene
      const dt = Math.min(now - last, 100); last = now; elapsed += dt;
      // Si lleva mucho tiempo, la lancha va más despacio y es más fácil de seguir
      const easy = elapsed > 25000;
      phase += dt / 1000 * (easy ? .55 : 1);
      x = path.cx + path.ax * Math.sin(phase * .42); y = path.cy + path.ay * Math.sin(phase * .71 + 1);
      boat.style.left = x + '%'; boat.style.top = y + '%';
      hull.classList.toggle('right', Math.cos(phase * .42) > 0);

      const on = active && Math.abs(px - x) < (easy ? 19 : 14) && Math.abs(py - y) < (easy ? 26 : 19);
      prog = Math.max(0, Math.min(1, prog + (on ? dt : -dt * .45) / need));
      fill.style.width = (prog * 100) + '%';
      g.classList.toggle('on', on);
      if (on !== wasOn) {
        banner.textContent = on ? 'Grabando… no la pierdas' : 'Mantén el visor sobre la lancha';
        wasOn = on;
      }
      if (prog >= 1) return end();
      requestAnimationFrame(frame);
    }
    function end() {
      finished = true; finder.style.display = 'none';
      banner.textContent = 'Se aleja…'; ctx.sfx('sfx_ok');
      g.classList.add('leaving');
      hull.classList.add('right'); boat.style.left = '118%';        // se va mar adentro
      setTimeout(() => { g.remove(); done(); }, 1700);
    }
    requestAnimationFrame(frame);
  },

  /* Nivel 3 — "¿Kevin o Marea?": en cada ronda Marea propone algo real y Kevin algo llamativo.
     Se elige una de las dos. Si se acaba el tiempo, gana la de Kevin (el apuro empuja a lo viral).
     6 rondas: imagen y frase para cada una de las 3 tomas del video. */
  edit(ctx, opts, done) {
    const SECS = (opts.seconds || 7) * 1000;
    const imgSrc = n => 'assets/objects/' + n + '.png';
    const of = (list, k) => list.filter(o => o.kind === k);
    const rI = of(opts.images, 'real'), vI = of(opts.images, 'viral'), rT = of(opts.phrases, 'real'), vT = of(opts.phrases, 'viral');
    const rounds = [];
    for (let i = 0; i < 3; i++) rounds.push({ type: 'img', m: rI[i], k: vI[i] }, { type: 'txt', m: rT[i], k: vT[i] });

    const g = ctx.el('div', 'game choose-game');
    const banner = ctx.el('div', 'banner', '¿Qué ponemos en el video?');
    const clock = ctx.el('div', 'ch-clock'), clockFill = ctx.el('i'); clock.append(clockFill);
    const marea = ctx.el('div', 'ch-char left'), kevin = ctx.el('div', 'ch-char right');
    const cards = ctx.el('div', 'ch-cards');
    const strip = ctx.el('div', 'ch-strip');
    const slots = [0, 1, 2].map(() => { const s = ctx.el('div', 'ch-slot', '<div class="ch-thumb"></div><div class="ch-cap"></div>'); strip.append(s); return s; });
    g.append(marea, kevin, cards, strip, banner, clock);
    ctx.stage.append(g);

    const pose = (w, who, p) => { w.innerHTML = ''; w.append(ctx.img('assets/characters/' + who + '_' + p + '.png', who, 'ch-img')); };
    const hop = w => { w.classList.remove('hop'); void w.offsetWidth; w.classList.add('hop'); };
    let idx, picks, busy;

    function start() {
      idx = 0; picks = []; busy = false;
      slots.forEach(s => { s.querySelector('.ch-thumb').innerHTML = ''; s.querySelector('.ch-cap').textContent = ''; });
      strip.style.display = ''; cards.className = 'ch-cards';
      pose(marea, 'marea', 'neutral'); pose(kevin, 'kevin', 'neutral');
      nextRound();
    }
    function card(side, o, type) {
      const b = ctx.el('button', 'ch-card ' + (side === 'm' ? 'ch-left' : 'ch-right') + (type === 'txt' ? ' txt' : ''));
      b.dataset.kind = o.kind;
      b.append(ctx.el('span', 'ch-chip', side === 'm' ? 'Marea' : 'Kevin'));
      if (type === 'img') b.append(ctx.img(imgSrc(o.src), o.label));
      else b.append(ctx.el('span', 'ch-text', '')), b.lastChild.textContent = o.text;
      b.addEventListener('click', e => { e.stopPropagation(); pick(side, false); });
      return b;
    }
    function nextRound() {
      if (!g.isConnected) return;
      if (idx >= rounds.length) return finalScreen();
      const r = rounds[idx];
      banner.textContent = r.type === 'img' ? '¿Qué imagen ponemos?' : '¿Qué frase le ponemos?';
      cards.innerHTML = '';
      cards.append(card('m', r.m, r.type), card('k', r.k, r.type));
      slots.forEach((s, i) => s.classList.toggle('now', i === Math.floor(idx / 2)));
      clock.style.display = ''; busy = false;
      const t0 = performance.now(), my = idx;
      (function tick(now) {
        if (!g.isConnected || busy || my !== idx) return;
        const left = SECS - (now - t0);
        clockFill.style.width = Math.max(0, left / SECS * 100) + '%';
        clock.classList.toggle('low', left < SECS * .35);
        if (left <= 0) return pick('k', true);
        requestAnimationFrame(tick);
      })(t0);
    }
    function pick(side, timeout) {
      if (busy) return; busy = true;
      const r = rounds[idx], o = side === 'm' ? r.m : r.k;
      picks.push({ type: r.type, o });
      const slot = slots[Math.floor(idx / 2)];
      if (r.type === 'img') slot.querySelector('.ch-thumb').append(ctx.img(imgSrc(o.src), o.label));
      else slot.querySelector('.ch-cap').textContent = o.text;
      [...cards.children].forEach(c => c.classList.add(c.classList.contains(side === 'm' ? 'ch-left' : 'ch-right') ? 'win' : 'lose'));
      if (side === 'm') { pose(marea, 'marea', 'determined'); pose(kevin, 'kevin', 'waiting'); hop(marea); ctx.sfx('sfx_ok'); }
      else { pose(kevin, 'kevin', 'phone'); pose(marea, 'marea', 'worried'); hop(kevin); ctx.sfx('sfx_reaccion'); }
      if (timeout) banner.textContent = '¡Muy lento! Kevin eligió por ti';
      setTimeout(() => { idx++; nextRound(); }, timeout ? 1500 : 1000);
    }
    function finalScreen() {
      clock.style.display = 'none'; strip.style.display = 'none';
      banner.textContent = 'Tu video está listo';
      pose(marea, 'marea', 'neutral'); pose(kevin, 'kevin', 'neutral');
      cards.innerHTML = ''; cards.className = 'ch-cards ch-final';
      const imgs = picks.filter(p => p.type === 'img'), txts = picks.filter(p => p.type === 'txt');
      const row = ctx.el('div', 'edit-final');
      imgs.forEach((p, i) => {
        const c = ctx.el('div', 'edit-card'); c.append(ctx.img(imgSrc(p.o.src), p.o.label));
        const cap = ctx.el('p'); cap.textContent = txts[i].o.text; c.append(cap); row.append(c);
      });
      const real = picks.filter(p => p.o.kind === 'real').length;
      const pub = ctx.el('button', 'big edit-publish', 'Publicar');
      const redo = ctx.el('button', 'big edit-redo', 'Volver a editar');
      const actions = ctx.el('div', 'edit-actions'); actions.append(redo, pub);
      cards.append(row, actions);
      redo.addEventListener('click', e => { e.stopPropagation(); ctx.sfx('sfx_tap'); start(); });
      pub.addEventListener('click', e => {
        e.stopPropagation(); pub.disabled = true; redo.disabled = true;
        ctx.state.edit = { voz: Math.round(real / picks.length * 100), reac: Math.round((picks.length - real) / picks.length * 100) };
        ctx.sfx('sfx_reaccion');
        setTimeout(() => { g.remove(); done(); }, 1100);
      });
    }
    start();
  },

  /* Nivel 4 — "Seguir la ruta": unir con el dedo (o tocando) los puntos de cada tiburón, en orden.
     Al terminar las tres rutas aparecen los lugares donde se cortan. */
  routes(ctx, opts, done) {
    const SVGNS = 'http://www.w3.org/2000/svg';
    const g = ctx.el('div', 'game routes-game');
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', '0 0 160 90'); svg.setAttribute('class', 'routes-svg');
    const banner = ctx.el('div', 'banner', '');
    g.append(svg, banner);
    ctx.stage.append(g);
    const U = ([x, y]) => (x * 1.6) + ',' + (y * .9);    // % del mapa a unidades del dibujo

    let r = 0, next = 0, dots = [], line, preview, shark, angle = 0, down = false, lastX = 0, lastY = 0, finished = false;
    function moveShark(p, q) {
      shark.style.left = p[0] + '%'; shark.style.top = p[1] + '%';
      if (!q) return;
      // La imagen mira a la izquierda; se elige siempre el giro más corto
      let a = Math.atan2((p[1] - q[1]) * .5625, p[0] - q[0]) * 180 / Math.PI - 180;
      while (a - angle > 180) a -= 360; while (a - angle < -180) a += 360;
      angle = a; shark.style.transform = 'translate(-50%,-50%) rotate(' + a + 'deg)';
    }
    function startRoute() {
      const route = opts.routes[r]; next = 0; angle = 0;
      banner.textContent = 'Tiburón ' + (r + 1) + ' de ' + opts.routes.length + ': une los puntos en orden';
      line = document.createElementNS(SVGNS, 'polyline'); line.setAttribute('class', 'route-line'); line.setAttribute('stroke', route.color);
      preview = document.createElementNS(SVGNS, 'line'); preview.setAttribute('class', 'route-preview'); preview.setAttribute('stroke', route.color);
      svg.append(line, preview);
      dots = route.dots.map((p, i) => {
        const d = ctx.el('div', 'route-dot', String(i + 1));
        d.style.left = p[0] + '%'; d.style.top = p[1] + '%'; d.style.setProperty('--c', route.color);
        g.append(d); return d;
      });
      dots[0].classList.add('next');
      shark = ctx.el('div', 'route-shark');
      shark.append(ctx.img('assets/objects/obj_tiburon_marcado.png', 'Tiburón', 'route-shark-img'));
      g.append(shark); shark.style.transform = 'translate(-50%,-50%)'; moveShark(route.dots[0]);
    }
    function reach() {
      const route = opts.routes[r], p = route.dots[next];
      dots[next].classList.remove('next'); dots[next].classList.add('done');
      line.setAttribute('points', route.dots.slice(0, next + 1).map(U).join(' '));
      if (next > 0) moveShark(p, route.dots[next - 1]);
      next++;
      if (next < route.dots.length) { dots[next].classList.add('next'); ctx.sfx('sfx_tap'); return; }
      ctx.sfx('sfx_ok'); preview.remove();
      setTimeout(() => dots.forEach(d => d.remove()), 350);
      r++;
      if (r < opts.routes.length) setTimeout(startRoute, 700); else { finished = true; setTimeout(reveal, 800); }
    }
    // Revisa si el dedo pasó sobre el siguiente punto, también entre dos lecturas seguidas
    function check(x, y) {
      if (finished || !dots[next] || !dots[next].classList.contains('next')) return;
      const st = ctx.stage.getBoundingClientRect(), radius = st.height * .085;
      const p = opts.routes[r].dots[next], px = st.left + st.width * p[0] / 100, py = st.top + st.height * p[1] / 100;
      const steps = Math.max(1, Math.ceil(Math.hypot(x - lastX, y - lastY) / (radius / 2)));
      for (let i = 1; i <= steps; i++) {
        const sx = lastX + (x - lastX) * i / steps, sy = lastY + (y - lastY) * i / steps;
        if (Math.hypot(sx - px, sy - py) < radius) { reach(); break; }
      }
    }
    function drawPreview(x, y) {
      if (!preview || !preview.isConnected || next === 0 || !down) { if (preview) preview.setAttribute('x2', preview.getAttribute('x1') || 0); return; }
      const st = ctx.stage.getBoundingClientRect(), p = opts.routes[r].dots[next - 1];
      preview.setAttribute('x1', p[0] * 1.6); preview.setAttribute('y1', p[1] * .9);
      preview.setAttribute('x2', (x - st.left) / st.width * 160); preview.setAttribute('y2', (y - st.top) / st.height * 90);
    }
    g.addEventListener('pointerdown', e => {
      e.stopPropagation(); down = true; lastX = e.clientX; lastY = e.clientY;
      try { g.setPointerCapture(e.pointerId); } catch (err) {}
      check(e.clientX, e.clientY); drawPreview(e.clientX, e.clientY);
    });
    g.addEventListener('pointermove', e => {
      if (!down) return;
      check(e.clientX, e.clientY); lastX = e.clientX; lastY = e.clientY; drawPreview(e.clientX, e.clientY);
    });
    ['pointerup', 'pointercancel'].forEach(n => g.addEventListener(n, () => { down = false; if (preview) preview.removeAttribute('x2'), preview.removeAttribute('y2'), preview.removeAttribute('x1'), preview.removeAttribute('y1'); }));

    function reveal() {
      banner.textContent = 'Las rutas se cortan aquí';
      opts.crossings.forEach((p, i) => {
        const c = ctx.el('div', 'route-cross'); c.style.left = p[0] + '%'; c.style.top = p[1] + '%'; c.style.animationDelay = (i * .25) + 's';
        g.append(c);
      });
      ctx.sfx('sfx_ok');
      setTimeout(async () => {
        if (!g.isConnected) return;
        if (opts.line) await ctx.say(opts.line);
        g.remove(); done();
      }, 1800);
    }
    startRoute();
  },

  /* Nivel 5 — "Armar la cachuda": arrastrar las 5 piezas a su lugar y luego elegir colores con los ayudantes.
     Si una pieza se suelta lejos, vuelve a su sitio. Las piezas salen de cortar cachuda_final, así que encajan. */
  assemble(ctx, opts, done) {
    const T = opts.target, TH = T.w * (16 / 9) / opts.aspect, TRAY = .62;
    const g = ctx.el('div', 'game assemble-game');
    const banner = ctx.el('div', 'banner', 'Arrastra cada pieza a su lugar');
    const ghost = ctx.img('assets/objects/cachuda_final.png', '', 'asm-ghost', true);
    ghost.style.left = T.x + '%'; ghost.style.top = T.y + '%'; ghost.style.width = T.w + '%';
    g.append(ghost, banner);
    ctx.stage.append(g);

    let placed = 0;
    const place = (w, x, y, s) => { w.style.left = x + '%'; w.style.top = y + '%'; w.style.setProperty('--s', s); };
    const pieces = opts.pieces.map(p => {
      const w = ctx.el('div', 'asm-piece'); w.dataset.tint = p.tint; w.dataset.id = p.id;
      w.append(ctx.img('assets/objects/cachuda_' + p.id + '.png', p.id, 'asm-img'));
      w.style.width = (p.w * T.w) + '%';
      w.style.zIndex = p.id === 'body' ? 1 : 2;
      const tx = T.x + (p.x + p.w / 2) * T.w, ty = T.y + (p.y + p.h / 2) * TH;
      w.dataset.tx = tx; w.dataset.ty = ty;
      place(w, p.tray[0], p.tray[1], TRAY);
      g.append(w);
      let dx = 0, dy = 0, dragging = false, cx = p.tray[0], cy = p.tray[1];
      const toPct = e => { const r = ctx.stage.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100]; };
      w.addEventListener('pointerdown', e => {
        if (w.classList.contains('placed')) return;
        e.stopPropagation(); e.preventDefault(); w.setPointerCapture(e.pointerId);
        const [px, py] = toPct(e); dx = cx - px; dy = cy - py; dragging = true;
        w.classList.add('dragging'); w.style.setProperty('--s', 1); ctx.sfx('sfx_tap');
      });
      w.addEventListener('pointermove', e => {
        if (!dragging) return;
        const [px, py] = toPct(e); cx = px + dx; cy = py + dy; w.style.left = cx + '%'; w.style.top = cy + '%';
      });
      const drop = () => {
        if (!dragging) return; dragging = false; w.classList.remove('dragging');
        if (Math.hypot(cx - tx, (cy - ty) * .5625) < 8) {
          cx = tx; cy = ty; place(w, tx, ty, 1); w.classList.add('placed'); ctx.sfx('sfx_pieza_ok');
          if (++placed === opts.pieces.length) setTimeout(assembled, 650);
          else banner.textContent = 'Piezas: ' + placed + ' / ' + opts.pieces.length;
        } else { cx = p.tray[0]; cy = p.tray[1]; place(w, cx, cy, TRAY); }
      };
      w.addEventListener('pointerup', drop); w.addEventListener('pointercancel', drop);
      return w;
    });

    function choose(h) {
      return new Promise(res => {
        banner.textContent = h.ask;
        const row = ctx.el('div', 'asm-colors');
        opts.colors.forEach(c => {
          const b = ctx.el('button', 'asm-color'); b.textContent = c.name; b.style.setProperty('--c', c.css);
          b.addEventListener('click', e => {
            e.stopPropagation(); row.remove(); ctx.sfx(h.sfx);
            pieces.filter(w => w.dataset.tint === h.tint).forEach(w => { w.style.filter = c.filter; });
            setTimeout(res, 750);
          });
          row.append(b);
        });
        g.append(row);
      });
    }
    async function assembled() {
      if (ghost.isConnected) ghost.remove();
      ctx.sfx('sfx_ok');
      for (const h of opts.helpers) {
        if (!g.isConnected) return;
        const v = ctx.el('div', 'asm-helper');
        v.append(ctx.img('assets/characters/' + h.img + '.png', 'Ayudante', 'sprite ' + h.side));
        g.append(v);
        if (h.line) { banner.style.display = 'none'; await ctx.say(h.line); banner.style.display = ''; }
        if (!g.isConnected) return;
        await choose(h);
        v.remove();
      }
      if (!g.isConnected) return;
      banner.style.display = 'none'; g.classList.add('asm-done'); ctx.sfx('sfx_ok');
      setTimeout(async () => {
        if (!g.isConnected) return;
        if (opts.endLine) await ctx.say(opts.endLine);
        g.remove(); done();
      }, 900);
    }
  },

  /* Nivel 6 — Ritmo con la canción real (estilo Guitar Hero): los círculos caen por 3 carriles y se tocan
     cuando llegan al tambor. Se toca el carril con el dedo o con las teclas A S D (también J K L o las flechas).
     Siempre se puede continuar; también se puede repetir. */
  rhythm(ctx, opts, done) {
    const C = CHARTS[opts.chart], TRAVEL = 1.8, LEAD = TRAVEL + 1.2, PERFECT = .075, GOOD = .16, HIT_Y = 80;
    const COLORS = ['#FF6B4A', '#FFC93C', '#2EC4B6'], KEYS = [['KeyA', 'KeyJ', 'ArrowLeft'], ['KeyS', 'KeyK', 'ArrowDown'], ['KeyD', 'KeyL', 'ArrowRight']];
    const g = ctx.el('div', 'game rhythm-game');
    const banner = ctx.el('div', 'banner', 'Voces: 0');
    const hw = ctx.el('div', 'hw');
    const lanes = [0, 1, 2].map(i => {
      const ln = ctx.el('div', 'hw-lane'); ln.style.setProperty('--c', COLORS[i]);
      const drum = ctx.el('div', 'hw-drum'); drum.append(ctx.img('assets/objects/obj_tambor.png', 'Tambor', 'hw-drum-img'));
      drum.append(ctx.el('span', 'hw-target'), ctx.el('span', 'hw-key', ['A', 'S', 'D'][i]));
      ln.append(drum); hw.append(ln); return ln;
    });
    const combo = ctx.el('div', 'hw-combo', '');
    g.append(hw, banner, combo);
    ctx.stage.append(g);

    // Audio de la canción (si no existe, el juego corre igual con un reloj)
    const audio = document.createElement('audio'); audio.preload = 'auto';
    ['mp3', 'm4a'].forEach(x => { const s = document.createElement('source'); s.src = C.audio + '.' + x; audio.append(s); });
    let audioOk = true; audio.addEventListener('error', () => { audioOk = false; }, true);

    let notes, hits, streak, best, running = false, t0, lastA = -1, lastP = 0, raf;
    function clock() {
      if (audioOk && !audio.paused) {        // currentTime avanza a saltos: se suaviza con el reloj del navegador
        if (audio.currentTime !== lastA) { lastA = audio.currentTime; lastP = performance.now(); }
        return lastA + (performance.now() - lastP) / 1000;
      }
      return (C.start - LEAD) + (performance.now() - t0) / 1000;
    }
    function feedback(i, text, cls) {
      const f = ctx.el('div', 'hw-judge ' + cls, text); lanes[i].append(f); setTimeout(() => f.remove(), 600);
    }
    function hitLane(i) {
      if (!running) return;
      const d = lanes[i].querySelector('.hw-drum'); d.classList.remove('hit'); void d.offsetWidth; d.classList.add('hit');
      const t = clock();
      let n = null, dist = 9;
      notes.forEach(x => { if (!x.done && x.lane === i && Math.abs(x.t - t) < dist) { dist = Math.abs(x.t - t); n = x; } });
      if (!n || dist > GOOD) return;
      n.done = true; hits++; streak++; best = Math.max(best, streak);
      if (n.el) { n.el.classList.add('pop'); setTimeout(() => n.el && n.el.remove(), 250); }
      feedback(i, dist <= PERFECT ? '¡Perfecto!' : '¡Bien!', 'ok');
      banner.textContent = 'Voces: ' + hits;
      combo.textContent = streak >= 4 ? streak + ' seguidas' : '';
    }
    function frame() {
      if (!g.isConnected) { audio.pause(); return; }
      if (!running) return;
      const t = clock();
      notes.forEach(n => {
        if (n.done) return;
        const ahead = n.t - t;
        if (ahead < -GOOD) {                     // se pasó sin tocar
          n.done = true; streak = 0; combo.textContent = '';
          if (n.el) { n.el.classList.add('gone'); setTimeout(() => n.el && n.el.remove(), 300); }
          feedback(n.lane, '¡Uy!', 'miss'); return;
        }
        if (ahead > TRAVEL) return;
        if (!n.el) { n.el = ctx.el('i', 'hw-note'); n.el.style.setProperty('--c', COLORS[n.lane]); lanes[n.lane].append(n.el); }
        n.el.style.top = (HIT_Y * (1 - ahead / TRAVEL)) + '%';
      });
      if (t > C.end + .6) return finish();
      raf = requestAnimationFrame(frame);
    }
    function finish() {
      running = false;
      const v0 = audio.volume, f0 = performance.now();
      (function fade() { const k = Math.min(1, (performance.now() - f0) / 1200); audio.volume = v0 * (1 - k); if (k < 1 && g.isConnected) requestAnimationFrame(fade); else audio.pause(); })();
      const total = notes.length, pct = Math.round(hits / total * 100);
      ctx.state.rhythm = { hits, total, best };
      const card = ctx.el('div', 'retry-card');
      const p = ctx.el('p'); p.textContent = (hits === 1 ? 'Se sumó 1 voz' : 'Se sumaron ' + hits + ' voces') + ' · ' + pct + ' %';
      const row = ctx.el('div', 'edit-actions');
      const again = ctx.el('button', 'big edit-redo', 'Otra vez'), go = ctx.el('button', 'big', 'Continuar');
      [again, go].forEach(b => b.addEventListener('pointerdown', e => e.stopPropagation()));
      again.addEventListener('click', e => { e.stopPropagation(); card.remove(); intro(); });
      go.addEventListener('click', e => { e.stopPropagation(); audio.pause(); g.remove(); done(); });
      row.append(again, go); card.append(p, row); g.append(card);
      ctx.sfx('sfx_ok');
    }
    function begin() {
      notes = C.notes.map(([t, lane]) => ({ t: t + (C.offset || 0), lane, done: false, el: null }));
      hw.querySelectorAll('.hw-note').forEach(n => n.remove());
      hits = 0; streak = 0; best = 0; banner.textContent = 'Voces: 0'; combo.textContent = '';
      t0 = performance.now(); lastA = -1;
      audio.volume = .9; audio.muted = ctx.muted();
      try { audio.currentTime = Math.max(0, C.start - LEAD); } catch (e) {}
      audio.play().catch(() => { audioOk = false; });
      running = true; raf = requestAnimationFrame(frame);
    }
    function intro() {
      const card = ctx.el('div', 'retry-card');
      const p = ctx.el('p'); p.textContent = 'Toca cada tambor cuando su círculo llegue';
      const s = ctx.el('small', 'hw-help', 'Con el dedo o con las teclas A · S · D');
      const b = ctx.el('button', 'big', '¡A tocar!');
      b.addEventListener('pointerdown', e => e.stopPropagation());
      b.addEventListener('click', e => { e.stopPropagation(); card.remove(); begin(); });
      card.append(p, s, b); g.append(card);
    }
    lanes.forEach((ln, i) => ln.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); hitLane(i); }));
    const onKey = e => {
      if (!g.isConnected) return document.removeEventListener('keydown', onKey);
      const i = KEYS.findIndex(k => k.includes(e.code)); if (i < 0 || e.repeat) return;
      e.preventDefault(); hitLane(i);
    };
    document.addEventListener('keydown', onKey);
    intro();
  },

  /* Cierre del juego: logo e invitación sobre el cielo con la constelación de la cachuda */
  finale(ctx, opts, done) {
    const g = ctx.el('div', 'game finale-game');
    const box = ctx.el('div', 'finale');
    const p = ctx.el('p'); p.textContent = opts.text;
    const b = ctx.el('button', 'big', 'Terminar');
    box.append(ctx.img('assets/ui/logo_marea_alta.png', 'Marea Alta', 'logo finale-logo'), p, b);
    g.append(box); ctx.stage.append(g);
    b.addEventListener('click', e => { e.stopPropagation(); g.remove(); done(); });
  },
};
