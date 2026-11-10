/* Sonidos generados por el navegador (Web Audio), sin archivos.
   El motor los usa solo cuando falta el MP3/M4A: si el equipo agrega el archivo, suena el archivo. */
window.SYNTH = (function () {
  let ac = null, master = null, noiseBuf = null, muted = false;
  const oneShots = new Set();

  function ctx() {
    if (!ac) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ac = new C();
      master = ac.createGain(); master.gain.value = muted ? 0 : 1; master.connect(ac.destination);
      noiseBuf = ac.createBuffer(1, ac.sampleRate * 3, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }

  function tone(t, f0, f1, dur, type, vol) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
    o.connect(g).connect(master); o.start(t); o.stop(t + dur + .02);
  }
  function burst(t, dur, freq, filter, vol, attack) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noiseBuf; s.loop = true; f.type = filter; f.frequency.value = freq;
    g.gain.setValueAtTime(.0008, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
    s.connect(f).connect(g).connect(master); s.start(t, Math.random() * 2); s.stop(t + dur + .02);
  }

  const SFX = {
    sfx_tap(t) { tone(t, 420, 300, .08, 'triangle', .22); },
    sfx_rec(t) { burst(t, .04, 2500, 'highpass', .3, .004); tone(t + .05, 1250, 1250, .1, 'sine', .14); },
    sfx_remo(t) { burst(t, .34, 650, 'lowpass', .5, .05); tone(t + .1, 340, 170, .13, 'sine', .22); tone(t + .25, 520, 250, .08, 'sine', .12); },
    sfx_ok(t) { tone(t, 659, 655, .22, 'triangle', .28); tone(t + .12, 988, 980, .36, 'triangle', .26); },
    sfx_reaccion(t) { [0, .09, .17, .24, .3, .35, .39, .43].forEach((d, i) => tone(t + d, 640 + i * 120, 900 + i * 130, .11, 'sine', .14)); },
    sfx_tela(t) { burst(t, .42, 2600, 'bandpass', .34, .12); },
    sfx_pintura(t) { burst(t, .3, 900, 'lowpass', .34, .03); burst(t + .28, .3, 1300, 'lowpass', .26, .03); },
    sfx_pieza_ok(t) { burst(t, .05, 1500, 'bandpass', .5, .005); tone(t + .05, 784, 780, .3, 'triangle', .26); },
    sfx_tambor(t) { tone(t, 120, 52, .32, 'sine', .55); burst(t, .05, 900, 'lowpass', .3, .004); },
    sfx_guia(t) { burst(t, .05, 5200, 'highpass', .09, .005); },
    sfx_fail(t) { tone(t, 230, 160, .26, 'triangle', .22); },
    amb_motor_lejano(t) {
      const dur = 12, o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(), trem = ac.createOscillator(), tg = ac.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(48, t); o.frequency.linearRampToValueAtTime(62, t + dur);
      f.type = 'lowpass'; f.frequency.value = 230;
      g.gain.setValueAtTime(.0008, t); g.gain.exponentialRampToValueAtTime(.16, t + dur - 1); g.gain.linearRampToValueAtTime(.0008, t + dur);
      trem.frequency.value = 17; tg.gain.value = .04;
      trem.connect(tg).connect(g.gain); o.connect(f).connect(g).connect(master);
      o.start(t); trem.start(t); o.stop(t + dur); trem.stop(t + dur);
      const h = { stop() { try { o.stop(); trem.stop(); } catch (e) {} } };
      oneShots.add(h); o.onended = () => oneShots.delete(h);
    },
  };

  // Mar en bucle: ruido filtrado que sube y baja como olas
  function sea(rate, cutoff, vol) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain(), out = ac.createGain();
    s.buffer = noiseBuf; s.loop = true; f.type = 'lowpass'; f.frequency.value = cutoff;
    g.gain.value = vol; lfo.frequency.value = rate; lg.gain.value = vol * .75;
    out.gain.setValueAtTime(.0008, ac.currentTime); out.gain.exponentialRampToValueAtTime(1, ac.currentTime + 2);
    lfo.connect(lg).connect(g.gain); s.connect(f).connect(g).connect(out).connect(master);
    s.start(); lfo.start();
    return () => { try { s.stop(); lfo.stop(); out.disconnect(); } catch (e) {} };
  }
  const LOOPS = {
    amb_c1_amanecer: () => sea(.16, 620, .07),
    amb_c2_noche: () => sea(.11, 360, .06),
  };

  // Coro de la comparsa: cada acierto suma una voz sostenida, sin letra
  const SCALE = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5];
  let chorus = [];
  function addVoice(n) {
    if (!ctx()) return;
    const t = ac.currentTime, o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(), vib = ac.createOscillator(), vg = ac.createGain();
    o.type = 'sawtooth'; o.frequency.value = SCALE[(n - 1) % SCALE.length];
    f.type = 'lowpass'; f.frequency.value = 1100; vib.frequency.value = 4.6 + n * .07; vg.gain.value = 3;
    g.gain.setValueAtTime(.0008, t); g.gain.exponentialRampToValueAtTime(.022, t + .5);
    vib.connect(vg).connect(o.frequency); o.connect(f).connect(g).connect(master);
    o.start(t); vib.start(t); chorus.push({ o, vib, g });
  }
  function endChorus() {
    if (!ac) return;
    const t = ac.currentTime;
    chorus.forEach(v => { v.g.gain.cancelScheduledValues(t); v.g.gain.setValueAtTime(Math.max(v.g.gain.value, .001), t); v.g.gain.exponentialRampToValueAtTime(.0008, t + 1.6); v.o.stop(t + 1.7); v.vib.stop(t + 1.7); });
    chorus = [];
  }

  return {
    addVoice, endChorus,
    has: name => !!(SFX[name] || LOOPS[name]),
    play(name) { if (SFX[name] && ctx()) SFX[name](ac.currentTime + .01); },
    loop(name) { return LOOPS[name] && ctx() ? LOOPS[name]() : null; },
    setMuted(m) { muted = m; if (master) master.gain.value = m ? 0 : 1; },
    wake() { ctx(); },
    hush() { oneShots.forEach(h => h.stop()); oneShots.clear(); endChorus(); },
    node: () => master,     // para pruebas
  };
})();
