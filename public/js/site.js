/* Web principal: rellenos, capítulos conectados al juego, tarjetas que giran, disco, teaser, sonidos de la página y pantalla completa. */
(function () {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const game = $('#game');

  // ---------- imágenes que faltan: data-ph = recuadro de relleno · data-hide = se quita ----------
  function missing(img) {
    if (img.hasAttribute('data-hide')) return img.remove();
    const d = document.createElement('div');
    d.className = (img.className ? img.className + ' ' : '') + 'ph';
    d.textContent = img.dataset.ph || img.alt || '';
    d.setAttribute('role', 'img'); d.setAttribute('aria-label', img.alt || '');
    img.replaceWith(d);
  }
  function watch(img) {
    // Si no existe el .png, probar el mismo nombre en .jpg; si tampoco, relleno
    const fail = () => {
      if (/\.png$/.test(img.src) && !img.dataset.triedJpg) { img.dataset.triedJpg = 1; img.src = img.src.replace(/\.png$/, '.jpg'); return; }
      img.removeEventListener('error', fail); missing(img);
    };
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0 && img.src) fail();
  }
  $$('img[data-ph],img[data-hide]').forEach(watch);

  // ---------- sonidos de la página (sintetizados, no necesitan archivos) ----------
  let soundOn = true, ac = null;
  try { soundOn = localStorage.getItem('marea_site_sound') !== 'off'; } catch (e) {}
  const btnSound = $('#btnSound');
  const paintSound = () => { btnSound.innerHTML = soundOn ? `<img src="assets/ui/ui_btn_sound.png" alt="Sonido encendido">` : `<img src="assets/ui/ui_btn_mute.png" alt="Sonido apagado">`; btnSound.setAttribute('aria-pressed', soundOn); };
  paintSound();
  btnSound.onclick = () => { soundOn = !soundOn; paintSound(); try { localStorage.setItem('marea_site_sound', soundOn ? 'on' : 'off'); } catch (e) {} if (soundOn) blip(660, .12); };
  let unlocked = false;   // los navegadores no dejan sonar nada hasta el primer toque
  addEventListener('pointerdown', () => { unlocked = true; }, { once: true });
  function blip(freq, dur, type) {
    if (!soundOn || !unlocked) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
      o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(freq * 1.6, t + dur);
      g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
      o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur);
    } catch (e) {}
  }
  const hoverSound = el => {
    let last = 0;
    el.addEventListener('pointerenter', e => {
      if (e.pointerType !== 'mouse' || Date.now() - last < 250) return;
      last = Date.now(); blip(520 + Math.random() * 260, .09);
    });
  };

  // ---------- capítulos (datos de js/levels.js) ----------
  const CHAP = {   // color y personaje que se asoma en cada tarjeta
    1: ['#FF6B4A', 'marea_filming'], 2: ['#3A86FF', 'marea_alert'], 3: ['#8E5BE8', 'kevin_insisting'],
    4: ['#2EC4B6', 'rios_tablet'], 5: ['#FF9F1C', 'efrain_telling'], 6: ['#EF476F', 'marea_singing'],
  };
  const CLIP = { 6: 'assets/web/web_clip_comparsa.mp4' };   // vista previa en video al pasar el mouse (opcional por capítulo)
  let done = [];
  try { done = JSON.parse(localStorage.getItem('marea_progress') || '[]'); } catch (e) {}
  const grid = $('#chapGrid');
  function renderChapters() {
    grid.innerHTML = '';
    LEVELS.forEach((lv, i) => {
      const open = i === 0 || done.includes(LEVELS[i - 1].id), isDone = done.includes(lv.id);
      const [color, peek] = CHAP[lv.id] || ['#0B7BC1', 'marea_neutral'];
      const c = document.createElement('button');
      c.className = 'chap pop' + (open ? '' : ' lock') + (isDone ? ' done' : '');
      c.style.setProperty('--c', color);
      c.setAttribute('aria-label', `Capítulo ${lv.id}: ${lv.title}` + (open ? '' : ' (bloqueado)'));
      c.innerHTML = `
        <span class="num">${lv.id}</span>
        <img class="peek" src="assets/characters/${peek}.png" alt="" data-hide>
        <span class="thumb">
          <img src="assets/web/web_cap${lv.id}.png" alt="" data-ph="${lv.title}">
          <span class="state">${isDone ? `<img src="assets/ui/ui_icon_star.png" alt=""> ¡Listo!` : open ? '¡Juégalo!' : `<img src="assets/ui/ui_icon_lock.png" alt="Bloqueado">`}</span>
        </span>
        <span class="chap-body">
          <span class="txt"><span class="fn">${lv.fn}</span><span class="ct">${lv.title}</span></span>
          <span class="go" aria-hidden="true">${open ? '▶' : `<img src="assets/ui/ui_icon_lock.png" alt="">`}</span>
        </span>`;
      c.querySelectorAll('img').forEach(watch);
      if (CLIP[lv.id]) {
        const v = document.createElement('video');
        Object.assign(v, { className: 'thumb-clip', src: CLIP[lv.id], muted: true, loop: true, playsInline: true, preload: 'none' });
        v.setAttribute('aria-hidden', 'true');
        v.addEventListener('error', () => v.remove());
        c.querySelector('.thumb').prepend(v);
        c.addEventListener('pointerenter', () => { c.classList.add('previewing'); v.play().catch(() => {}); });
        c.addEventListener('pointerleave', () => { c.classList.remove('previewing'); v.pause(); });
      }
      c.onclick = () => {
        if (!open) { c.classList.remove('nope'); void c.offsetWidth; c.classList.add('nope'); blip(180, .18, 'square'); return; }
        blip(880, .15); playLevel(lv.id);
      };
      hoverSound(c);
      grid.append(c);
    });
  }
  function playLevel(id) {
    $('.tv').scrollIntoView({ behavior: 'smooth', block: 'center' });
    game.contentWindow.postMessage({ type: 'marea:play', level: id }, '*');
    game.focus({ preventScroll: true });
  }
  renderChapters();
  window.addEventListener('message', e => {   // el juego avisa cuando cambia el progreso
    const m = e.data || {};
    if (m.type === 'marea:progress' && Array.isArray(m.done)) { done = m.done; renderChapters(); }
  });

  // ---------- tarjetas que giran (personajes y "el mundo de Marea") ----------
  $$('.char,.fact').forEach(card => {
    card.onclick = () => { card.classList.toggle('flip'); blip(card.classList.contains('flip') ? 760 : 560, .12, 'triangle'); };
    hoverSound(card);
  });
  // Los personajes de la portada llevan a su tarjeta y la giran
  $$('.spot').forEach(a => {
    hoverSound(a);
    a.addEventListener('click', () => {
      const card = document.getElementById('card-' + a.dataset.card);
      if (card) setTimeout(() => card.classList.add('flip'), 700);
    });
  });
  $$('.pill,.btn,.platform,.ep').forEach(hoverSound);

  // ---------- disco: tema principal ----------
  const disc = $('#disc'), tema = $('#tema'), discMsg = $('#discMsg');
  disc.onclick = () => {
    if (tema.paused) {
      tema.play().then(() => { disc.classList.add('on'); disc.querySelector('.disc-play').textContent = '❚❚'; discMsg.textContent = 'Sonando…'; })
        .catch(() => { discMsg.textContent = 'La canción llega pronto.'; disc.classList.add('on'); setTimeout(() => disc.classList.remove('on'), 1200); });
    } else {
      tema.pause(); disc.classList.remove('on'); disc.querySelector('.disc-play').textContent = '▶'; discMsg.textContent = 'Toca el disco para escuchar.';
    }
  };
  tema.addEventListener('ended', () => { disc.classList.remove('on'); disc.querySelector('.disc-play').textContent = '▶'; });

  // ---------- teaser de YouTube ----------
  const teaser = $('#teaser');
  teaser.onclick = () => {
    const id = teaser.dataset.yt;
    // Abierta con doble clic (file://) YouTube no deja incrustar el video: se abre en YouTube.
    if (location.protocol === 'file:') return window.open('https://www.youtube.com/watch?v=' + id, '_blank', 'noopener');
    if (teaser.classList.contains('playing')) return;
    teaser.classList.add('playing');
    const f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    f.title = 'Teaser de Marea Alta'; f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
    teaser.querySelector('.video-thumb').replaceChildren(f);
  };

  // ---------- videos en loop: suenan callados y solo se reproducen cuando se ven en pantalla ----------
  // Video de la portada: si falta, se quita y queda el cielo animado de respaldo
  const heroVid = $('.scene-bg');
  if (heroVid) heroVid.addEventListener('error', () => heroVid.remove());
  const loops = $$('video.autoloop');
  loops.forEach(v => v.addEventListener('error', () => {
    const card = v.closest('.clip'); if (card) card.remove(); else v.remove();   // si falta el archivo, no se muestra
  }));
  if ('IntersectionObserver' in window) {
    const vio = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause()), { threshold: .25 });
    loops.forEach(v => vio.observe(v));
  } else loops.forEach(v => v.play().catch(() => {}));
  const clip = $('#clipComparsa');
  if (clip) {
    hoverSound(clip);
    clip.onclick = () => {
      const v = clip.querySelector('video'); if (!v) return;
      v.muted = !v.muted; if (!v.muted) { v.currentTime = 0; v.play().catch(() => {}); }
      clip.classList.toggle('unmuted', !v.muted);
      clip.querySelector('.sound-tag').innerHTML = v.muted ? `<img src="assets/ui/ui_btn_mute.png" alt=""> Toca para oír` : `<img src="assets/ui/ui_btn_sound.png" alt=""> Sonando`;
    };
  }

  // ---------- aparecer al hacer scroll ----------
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const n = e.target; n.classList.add('in'); io.unobserve(n);
      // al terminar la entrada se limpia, para que los efectos al pasar el mouse respondan sin retraso
      setTimeout(() => { n.classList.remove('reveal', 'in'); n.style.transitionDelay = ''; }, 900);
    }), { threshold: .15 });
    $$('.title,.char,.fact,.video-card,.player,.ep,.platform,.tv').forEach((n, i) => { n.classList.add('reveal'); n.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(n); });
    // las tarjetas de capítulos se crean después: observar el contenedor
    grid.classList.add('reveal'); io.observe(grid);
  }

  // ---------- pantalla completa ----------
  $('#btnFull').onclick = () => {
    const f = game.requestFullscreen || game.webkitRequestFullscreen;
    const open = () => window.open('juego.html', '_blank');   // iPhone: no permite pantalla completa en iframes
    if (!f) return open();
    const r = f.call(game);
    if (r && r.catch) r.catch(open);
  };
})();

/* Botones de preventa del EP: mientras no tengan enlace real, solo avisan que viene pronto */
document.querySelectorAll('.ep-badge[data-pronto]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  const t = document.querySelector('.ep-toast');
  t.textContent = '¡Muy pronto! El EP todavía no está disponible.';
  clearTimeout(t._h); t._h = setTimeout(() => { t.textContent = ''; }, 2500);
}));

/* Setlist: la canción 1 usa el mismo reproductor que el disco */
(function () {
  const btn = document.getElementById('trackPlay'), tema = document.getElementById('tema'), disc = document.getElementById('disc');
  if (!btn || !tema || !disc) return;
  btn.addEventListener('click', () => disc.click());
  const paint = () => { const on = !tema.paused; btn.textContent = on ? '❚❚' : '▶'; btn.classList.toggle('on', on); btn.setAttribute('aria-label', on ? 'Pausar Marea Alta' : 'Escuchar Marea Alta'); };
  ['play', 'pause', 'ended'].forEach(ev => tema.addEventListener(ev, paint));
})();

/* Empezar desde cero: borra el progreso de los capítulos y lo guardado a mitad de capítulo, y recarga la página */
(function () {
  const b = document.getElementById('btnReset'); if (!b) return;
  b.addEventListener('click', () => {
    if (!confirm('¿Borrar tu progreso y empezar la experiencia desde el principio?')) return;
    try { ['marea_progress', 'marea_resume'].forEach(k => localStorage.removeItem(k)); } catch (e) {}
    location.reload();
  });
})();
