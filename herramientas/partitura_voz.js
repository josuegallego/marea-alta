// Partitura siguiendo la VOZ: aísla el centro del estéreo (donde suele ir la voz), sigue la altura (f0) por suma de armónicos,
// corta en sílabas/notas y asigna carril por altura (grave=0, media=1, aguda=2).
const { chromium } = require('playwright-core');
const fs = require('fs');
const SRC = 'C:/Users/santi/OneDrive/Desktop/marea-alta/public/assets/audio/music/mus_tema.m4a';
const START = +(process.argv[2] || 37.947), END = +(process.argv[3] || 75.819), GRID = 60 / 152.09 / 4;   // semicorchea
(async () => {
  const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage();
  const data = fs.readFileSync(SRC).toString('base64');
  const r = await p.evaluate(async ({ data, START, END }) => {
    const buf = await new OfflineAudioContext(2, 44100, 44100).decodeAudioData(Uint8Array.from(atob(data), c => c.charCodeAt(0)).buffer);
    const ch = buf.numberOfChannels, sr = buf.sampleRate;
    const L = buf.getChannelData(0), R = ch > 1 ? buf.getChannelData(1) : L;
    const N = 4096, H = 441, K = N / 2, binHz = sr / N;
    const f0 = Math.floor((START - 1) * sr / H), f1 = Math.floor((END + 1) * sr / H);
    const win = new Float64Array(N); for (let i = 0; i < N; i++) win[i] = .5 - .5 * Math.cos(2 * Math.PI * i / N);
    const rev = new Uint32Array(N); for (let i = 0, j = 0; i < N; i++) { rev[i] = j; let bit = N >> 1; while (j & bit) { j ^= bit; bit >>= 1; } j |= bit; }
    const fft = (re, im) => { for (let i = 0; i < N; i++) if (i < rev[i]) { [re[i], re[rev[i]]] = [re[rev[i]], re[i]]; [im[i], im[rev[i]]] = [im[rev[i]], im[i]]; }
      for (let len = 2; len <= N; len <<= 1) { const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a);
        for (let i = 0; i < N; i += len) { let cr = 1, ci = 0; for (let j = 0; j < len / 2; j++) { const u = i + j, v = u + len / 2, vr = re[v] * cr - im[v] * ci, vi = re[v] * ci + im[v] * cr;
          re[v] = re[u] - vr; im[v] = im[u] - vi; re[u] += vr; im[u] += vi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } } };
    const mR = new Float64Array(N), mI = new Float64Array(N), sR = new Float64Array(N), sI = new Float64Array(N);
    const cand = []; for (let m = 55; m <= 82; m += .5) cand.push(m);   // Sol3..La#5: rango de voz cantada (deja fuera el bajo)
    const hz = m => 440 * Math.pow(2, (m - 69) / 12);
    const frames = [];
    for (let f = f0; f < f1; f++) {
      for (let i = 0; i < N; i++) { const s = f * H + i, l = L[s] || 0, rr = R[s] || 0; mR[i] = (l + rr) * .5 * win[i]; sR[i] = (l - rr) * .5 * win[i]; mI[i] = 0; sI[i] = 0; }
      fft(mR, mI); fft(sR, sI);
      const V = new Float32Array(K); let e = 0;
      for (let k = 2; k < K; k++) { const fr = k * binHz; if (fr < 90 || fr > 5000) continue; const mm = Math.hypot(mR[k], mI[k]), ss = Math.hypot(sR[k], sI[k]); const v = Math.max(0, mm - 1.2 * ss); V[k] = v; e += v * v; }
      // suma de armónicos con pesos decrecientes; se penaliza la subarmónica
      let best = -1, bm = 0, second = 0;
      for (const m of cand) { const F = hz(m); let s = 0; for (let h = 1; h <= 6; h++) { const k = Math.round(h * F / binHz); if (k >= K) break; s += Math.max(V[k - 1], V[k], V[k + 1]) / Math.pow(h, .6); }
        const kh = Math.round(F / 2 / binHz); s -= .3 * Math.max(V[kh - 1] || 0, V[kh] || 0, V[kh + 1] || 0);
        if (s > best) { second = best; best = s; bm = m; } }
      frames.push({ t: f * H / sr + N / 2 / sr, m: bm, s: best, e: Math.sqrt(e) });
    }
    return { ch, frames };
  }, { data, START, END });
  const fr = r.frames;
  // umbral de "hay voz": fuerza del armónico relativa a la mediana del fragmento
  const ss = fr.map(f => f.s).sort((a, b) => a - b), med = ss[Math.floor(ss.length * .5)], hi = ss[Math.floor(ss.length * .9)];
  const TH = med + (hi - med) * .18;
  fr.forEach(f => { f.v = f.s > TH; });
  // suavizar altura (mediana de 5)
  const mm = fr.map((f, i) => { const w = fr.slice(Math.max(0, i - 2), i + 3).filter(x => x.v).map(x => x.m).sort((a, b) => a - b); return w.length ? w[Math.floor(w.length / 2)] : f.m; });
  // segmentar en notas: tramos con voz y altura estable; corte por silencio o salto >= 1.5 semitonos; además corte por ataque de energía
  const notes = []; let cur = null;
  for (let i = 0; i < fr.length; i++) {
    const f = fr[i], m = mm[i], attack = i > 2 && f.e > fr[i - 2].e * 1.6;
    if (!f.v) { if (cur && i - cur.last > 3) { notes.push(cur); cur = null; } continue; }
    if (!cur) { cur = { t: f.t, ms: [m], last: i }; continue; }
    const cm = cur.ms[cur.ms.length - 1];
    if (Math.abs(m - cm) >= 1.5 || (attack && f.t - cur.t > .15)) { notes.push(cur); cur = { t: f.t, ms: [m], last: i }; }
    else { cur.ms.push(m); cur.last = i; }
  }
  if (cur) notes.push(cur);
  let ns = notes.map(n => { const ms = [...n.ms].sort((a, b) => a - b); return { t: n.t, dur: n.ms.length * .01, m: ms[Math.floor(ms.length / 2)] }; })
    .filter(n => n.dur >= .09 && n.t >= START && n.t <= END);
  // ajustar al pulso: a la semicorchea más cercana si está a menos de 45 ms
  const g0 = 37.947;
  ns.forEach(n => { const q = g0 + Math.round((n.t - g0) / GRID) * GRID; if (Math.abs(q - n.t) < .045) n.t = q; });
  // separación mínima jugable
  const out = []; ns.forEach(n => { if (!out.length || n.t - out[out.length - 1].t >= .17) out.push(n); });
  // carril por altura relativa (tercios), y si la altura no cambia se repite carril
  const ps = out.map(n => n.m).sort((a, b) => a - b), q1 = ps[Math.floor(ps.length / 3)], q2 = ps[Math.floor(ps.length * 2 / 3)];
  out.forEach((n, i) => { n.lane = n.m <= q1 ? 0 : n.m <= q2 ? 1 : 2; if (i && Math.abs(n.m - out[i - 1].m) < .6) n.lane = out[i - 1].lane; });
  const name = m => ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'][Math.round(m) % 12] + (Math.floor(Math.round(m) / 12) - 1);
  console.log('canales:', r.ch, '· frames con voz:', Math.round(fr.filter(f => f.v).length / fr.length * 100) + '%', '· notas:', out.length, '· por seg:', (out.length / (END - START)).toFixed(2), '· carriles:', [0, 1, 2].map(l => out.filter(n => n.lane === l).length));
  console.log(out.slice(0, 60).map(n => `${n.t.toFixed(2)} ${name(n.m)}(${n.lane}) ${Math.round(n.dur * 1000)}ms`).join(' | '));
  fs.writeFileSync(__dirname + '/vocal_chart.json', JSON.stringify({ start: START, end: END, notes: out.map(n => [+n.t.toFixed(3), n.lane]) }));
  await b.close();
})();
