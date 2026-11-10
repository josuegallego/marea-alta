/* Motor de Marea Alta: pantalla de título, mapa, ejecución de niveles, diálogo con voz y audio. */
(function () {
  const stage = document.getElementById('stage');
  let DIALOGUES = {};
  let muted = false;
  let music = null, amb = null, voice = null, stopAmb = null;
  let running = 0;                       // token para cancelar un nivel al volver al mapa

  // ---------- utilidades ----------
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  function img(src, label, cls, optional) {
    const i = new Image(); i.src = src; i.className = cls || ''; i.alt = label || '';
    // Si no existe el .png, probar el mismo nombre en .jpg; si tampoco, recuadro de relleno
    i.onerror = () => {
      if (/\.png$/.test(i.src) && !i.dataset.triedJpg) { i.dataset.triedJpg = 1; i.src = i.src.replace(/\.png$/, '.jpg'); return; }
      if (optional) return i.remove();   // decorativa: si falta, simplemente no se muestra
      const p = el('div', (cls || '') + ' ph', label || ''); Object.assign(p.dataset, i.dataset); i.replaceWith(p);
    };
    return i;
  }
  const store = {
    get() { try { return JSON.parse(localStorage.getItem('marea_progress') || '[]'); } catch (e) { return []; } },
    add(id) {
      try { const a = new Set(store.get()); a.add(id); localStorage.setItem('marea_progress', JSON.stringify([...a])); } catch (e) {}
      tellSite({ type: 'marea:progress', done: store.get() });
    },
  };
  // Comunicación con la web principal (index.html) cuando el juego va dentro del recuadro (iframe)
  function tellSite(msg) { try { if (window.parent !== window) window.parent.postMessage(msg, '*'); } catch (e) {} }

  // Dónde iba el jugador en cada capítulo: { idNivel: { step, state } }. Se borra al terminarlo.
  const resume = {
    all() { try { return JSON.parse(localStorage.getItem('marea_resume') || '{}'); } catch (e) { return {}; } },
    get(id) { return resume.all()[id]; },
    save(id, step, state) { try { const a = resume.all(); a[id] = { step, state }; localStorage.setItem('marea_resume', JSON.stringify(a)); } catch (e) {} },
    clear(id) { try { const a = resume.all(); delete a[id]; localStorage.setItem('marea_resume', JSON.stringify(a)); } catch (e) {} },
  };

  // ---------- audio (si falta un archivo, simplemente no suena) ----------
  const audioPath = n => n.startsWith('sfx_') ? `assets/audio/sfx/${n}.mp3`
    : n.startsWith('amb_') ? `assets/audio/amb/${n}.mp3`
    : n.startsWith('mus_') ? `assets/audio/music/${n}.mp3` : n;
  function mk(src, loop, vol, onfail) {
    const a = new Audio(src); a.loop = !!loop; a.volume = vol; a.muted = muted;
    // Si no existe el .mp3, probar .m4a (y si tampoco existe, no suena y el juego sigue)
    a.onerror = () => {
      if (/\.mp3$/.test(a.src) && !a._triedM4a) { a._triedM4a = 1; a.src = a.src.replace(/\.mp3$/, '.m4a'); if (!a._dead) a.play().catch(() => {}); }
      else if (onfail && !a._dead) onfail();
    };
    return a;
  }
  function playLoop(kind, name, vol) {
    const cur = kind === 'music' ? music : amb;
    if (cur && cur.dataset.n === name) return;
    if (cur) { cur._dead = 1; cur.pause(); }
    if (kind === 'amb' && stopAmb) { stopAmb(); stopAmb = null; }
    if (!name) { kind === 'music' ? (music = null) : (amb = null); return; }
    const a = mk(audioPath(name), true, vol, () => { if (kind === 'amb') stopAmb = SYNTH.loop(name); }); a.dataset.n = name;
    a.play().catch(() => {});
    kind === 'music' ? (music = a) : (amb = a);
  }
  // Si el archivo no existe, se usa el sonido generado (synth.js) y no se vuelve a buscar
  const noFile = new Set();
  function sfx(name) {
    if (noFile.has(name)) return SYNTH.play(name);
    const a = mk(audioPath(name), false, .8, () => { noFile.add(name); SYNTH.play(name); });
    a.play().catch(() => {});
  }
  function stopVoice() { if (voice) { voice._dead = 1; voice.pause(); voice = null; } }
  function playVoice(path) {
    stopVoice(); voice = mk(path, false, 1); voice.play().catch(() => {});
  }
  const icon = (n, alt) => `<img src="assets/ui/${n}.png" alt="${alt}">`;
  const soundIcon = () => muted ? icon('ui_btn_mute', 'Sonido apagado') : icon('ui_btn_sound', 'Sonido encendido');
  function setMuted(m) {
    muted = m; [music, amb, voice].forEach(a => a && (a.muted = m)); SYNTH.setMuted(m);
    const b = document.getElementById('btnSound'); if (b) b.innerHTML = soundIcon();
  }

  const ctx = { stage, img, sfx, el, state: {}, say: id => say(id, running), muted: () => muted };   // state: resultados de minijuegos

  // ---------- HUD ----------
  function hud() {
    const h = el('div', 'hud');
    const snd = el('button', '', soundIcon()); snd.id = 'btnSound'; snd.title = 'Sonido';
    snd.onclick = e => { e.stopPropagation(); setMuted(!muted); };
    const home = el('button', '', icon('ui_btn_map', 'Mapa')); home.title = 'Mapa';
    home.onclick = e => { e.stopPropagation(); showMap(); };
    h.append(home, snd); return h;
  }
  function clear(withHud) {
    running++; stopVoice(); SYNTH.hush(); stage.innerHTML = '';
    if (withHud) stage.append(hud());
  }

  // ---------- título ----------
  function showTitle() {
    clear(false); playLoop('amb', null); playLoop('music', null);
    stage.append(img('assets/bg/bg_title.png', 'Muelle al amanecer', 'bg title-bg'));
    const s = el('div', 'screen title-screen');
    const logo = img('assets/ui/logo_marea_alta.png', 'Marea Alta', 'logo');
    const b = el('button', 'big', 'Empezar');
    b.onclick = () => { intro(); };
    s.append(logo, el('p', '', 'Una historia interactiva del Pacífico colombiano'), b);
    stage.append(s, hud());
  }
  async function intro() {
    const token = ++running;
    stage.querySelectorAll('.screen').forEach(n => n.remove());
    showSprite('marea', 'neutral', 'center');
    await say('c0_01', token);
    if (token === running) showMap();
  }

  // ---------- mapa ----------
  // Posición de cada capítulo sobre bg_map (x %, y %): muelle, mar, palafitos, estación, taller, calle
  const PINS = [[12, 50], [24, 78], [40, 44], [60, 26], [73, 58], [88, 24]];
  function showMap() {
    clear(true); playLoop('amb', null); playLoop('music', null);   // el mapa va sin música; el tema suena solo en el final
    stage.append(img('assets/bg/bg_map.png', 'Mapa del pueblo', 'bg'));
    const done = store.get();
    const map = el('div', 'map');
    LEVELS.forEach((lv, i) => {
      const unlocked = i === 0 || done.includes(LEVELS[i - 1].id);
      const p = el('div', 'pin' + (unlocked ? '' : ' lock') + (done.includes(lv.id) ? ' done' : ''), String(lv.id));
      p.style.left = PINS[i][0] + '%'; p.style.top = PINS[i][1] + '%';
      p.append(unlocked ? el('small', '', lv.title) : el('small', 'locked', icon('ui_icon_lock', 'Bloqueado')));
      if (done.includes(lv.id)) p.append(el('span', 'pin-star', icon('ui_icon_star', 'Completado')));
      if (unlocked) p.onclick = () => startLevel(i);
      map.append(p);
    });
    stage.append(map);
    stage.append(el('div', 'map-title', 'Elige un capítulo'));
  }

  // ---------- sprites / fondo ----------
  const sprites = {};
  function showSprite(id, pose, side) {
    stage.querySelectorAll(`[data-sprite="${id}"]`).forEach(n => n.remove());
    const s = img(`assets/characters/${id}_${pose}.png`, `${id} · ${pose}`, 'sprite ' + side);
    s.dataset.sprite = id; sprites[id] = s;
    const d = stage.querySelector('.dialog'); d ? stage.insertBefore(s, d) : stage.append(s);
  }
  function hideSprite(id) { stage.querySelectorAll(`[data-sprite="${id}"]`).forEach(n => n.remove()); delete sprites[id]; }

  // ---------- diálogo con voz ----------
  function say(lineId, token) {
    return new Promise(res => {
      const L = DIALOGUES[lineId] || { name: '', text: `[falta la línea ${lineId}]`, audio: '' };
      stage.querySelectorAll('.dialog').forEach(n => n.remove());
      const d = el('div', 'dialog');
      d.innerHTML = `<div class="who">${L.name}</div><div class="txt"></div>
        <div class="row"><button class="replay" title="Escuchar" aria-label="Escuchar"><img src="assets/ui/ui_btn_sound.png" alt=""></button><button class="next">Siguiente</button></div>`;
      stage.append(d);
      const txt = d.querySelector('.txt'); let i = 0, typing = true;
      const timer = setInterval(() => {
        txt.textContent = L.text.slice(0, ++i);
        if (i >= L.text.length) { clearInterval(timer); typing = false; }
      }, 22);
      const finishTyping = () => { clearInterval(timer); txt.textContent = L.text; typing = false; };
      if (L.audio) playVoice(L.audio);
      d.querySelector('.replay').onclick = e => { e.stopPropagation(); if (L.audio) playVoice(L.audio); };
      const next = e => {
        e && e.stopPropagation();
        if (typing) return finishTyping();
        stopVoice(); d.remove(); res();
      };
      d.querySelector('.next').onclick = next;
      d.onclick = next;
      d._cancel = () => { clearInterval(timer); };
    });
  }

  // ---------- elecciones (nivel 2) ----------
  async function choice(step, token) {
    let picked = 0;
    const box = el('div', 'choices'); stage.append(box);
    const btns = step.options.map(o => {
      const b = el('button', '', o.label); box.append(b); return [b, o];
    });
    await new Promise(res => {
      btns.forEach(([b, o]) => b.onclick = async () => {
        if (b.classList.contains('used') || token !== running) return;
        b.classList.add('used'); box.style.display = 'none';
        await say(o.line, token); picked++;
        if (picked >= step.pick || token !== running) return res();
        box.style.display = 'flex';
      });
    });
    box.remove();
  }

  // ---------- ejecución de un nivel ----------
  async function startLevel(i) {
    clear(true); Object.keys(sprites).forEach(k => delete sprites[k]);
    const token = running, lv = LEVELS[i], saved = resume.get(lv.id);
    const from = saved ? saved.step : 0;
    ctx.state = (saved && saved.state) || {};
    for (let n = 0; n < lv.steps.length; n++) {
      if (token !== running) return;
      const step = lv.steps[n], replay = n < from;
      // Al continuar, solo se reconstruye la escena (fondo, personajes, oscurecido) hasta llegar al paso guardado
      if (replay && !['bg', 'show', 'hide', 'fx'].includes(step.t)) continue;
      if (!replay && ['say', 'choice', 'game'].includes(step.t)) resume.save(lv.id, n, ctx.state);
      switch (step.t) {
        case 'bg': {
          stage.querySelectorAll('.bgwrap').forEach(n => n.remove());
          const w = el('div', 'bgwrap layer'); w.append(img(step.src, step.label, 'bg'));
          if (step.fog) { w.append(img('assets/fx/fog_overlay.png', '', 'fog', true)); }
          stage.insertBefore(w, stage.firstChild);
          if (step.music !== undefined) playLoop('music', step.music, .35);
          if (step.amb !== undefined) playLoop('amb', step.amb, .45);
          break; }
        case 'show': showSprite(step.id, step.pose, step.side); break;
        case 'hide': hideSprite(step.id); break;
        case 'say': if (!step.when || step.when(ctx.state)) await say(step.line, token); break;
        case 'choice': await choice(step, token); break;
        case 'fx':
          if (step.name === 'dim') { const d = el('div', 'layer dim'); stage.append(d); requestAnimationFrame(() => d.classList.add('on')); }
          if (step.sfx && !replay) sfx(step.sfx);
          break;
        case 'game':
          await new Promise(res => MINIGAMES[step.name](ctx, step.opts || {}, res));
          break;
        case 'end': return finish(lv);
      }
    }
    finish(lv);
  }

  function finish(lv) {
    stopVoice(); store.add(lv.id); resume.clear(lv.id);
    const s = el('div', 'screen');
    s.style.cssText += ';justify-content:center;background:rgba(11,32,39,.8)';
    s.innerHTML = `<h1>Capítulo ${lv.id}</h1><p>${lv.title} · ${lv.fn}</p>`;
    const b = el('button', 'big', 'Volver al mapa'); b.onclick = showMap;
    s.append(b); stage.append(s);
  }

  // ---------- arranque ----------
  stage.addEventListener('pointerdown', () => SYNTH.wake(), true);   // el navegador exige un toque para sonar
  DIALOGUES = window.DIALOGUES || {};   // viene de data/dialogues.js (funciona abriendo index.html con doble clic)
  showTitle();
  // La web puede pedir: abrir un capítulo ({type:'marea:play', level:n}) o el mapa ({type:'marea:map'})
  window.addEventListener('message', e => {
    const m = e.data || {};
    if (m.type === 'marea:map') showMap();
    if (m.type === 'marea:play') {
      const i = LEVELS.findIndex(l => l.id === m.level), done = store.get();
      if (i === 0 || (i > 0 && done.includes(LEVELS[i - 1].id))) startLevel(i); else showMap();
    }
  });
  tellSite({ type: 'marea:progress', done: store.get() });
  window.__marea = { startLevel, showMap, LEVELS };   // atajo para pruebas
})();
