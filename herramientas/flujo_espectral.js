// Flujo espectral con FFT (método estándar de detección de golpes) + tempo por autocorrelación + perfiles de compás.
const { chromium } = require('playwright-core');
const fs = require('fs');
const SRC = 'C:/Users/santi/OneDrive/Desktop/marea-alta/public/assets/audio/music/mus_tema.m4a';
(async () => {
  const b = await chromium.launch({ channel: 'chrome' }); const p = await b.newPage();
  const data = fs.readFileSync(SRC).toString('base64');
  const r = await p.evaluate(async ({ data }) => {
    const buf = await new OfflineAudioContext(1, 44100, 44100).decodeAudioData(Uint8Array.from(atob(data), c => c.charCodeAt(0)).buffer);
    const x = buf.getChannelData(0), sr = buf.sampleRate, N = 2048, H = 441;   // 10 ms por cuadro
    const fps = sr / H, frames = Math.floor((x.length - N) / H);
    // FFT radix-2
    const re = new Float64Array(N), im = new Float64Array(N), win = new Float64Array(N); for (let i = 0; i < N; i++) win[i] = .5 - .5 * Math.cos(2 * Math.PI * i / N);
    const rev = new Uint32Array(N); for (let i = 0, j = 0; i < N; i++) { rev[i] = j; let bit = N >> 1; while (j & bit) { j ^= bit; bit >>= 1; } j |= bit; }
    const fft = () => { for (let i = 0; i < N; i++) if (i < rev[i]) { [re[i], re[rev[i]]] = [re[rev[i]], re[i]]; [im[i], im[rev[i]]] = [im[rev[i]], im[i]]; }
      for (let len = 2; len <= N; len <<= 1) { const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a);
        for (let i = 0; i < N; i += len) { let cr = 1, ci = 0; for (let j = 0; j < len / 2; j++) { const ur = re[i + j], ui = im[i + j], vr = re[i + j + len / 2] * cr - im[i + j + len / 2] * ci, vi = re[i + j + len / 2] * ci + im[i + j + len / 2] * cr;
          re[i + j] = ur + vr; im[i + j] = ui + vi; re[i + j + len / 2] = ur - vr; im[i + j + len / 2] = ui - vi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } } };
    const K = N / 2, hz = k => k * sr / N;
    let prev = new Float64Array(K);
    const low = new Float32Array(frames), mid = new Float32Array(frames), high = new Float32Array(frames), all = new Float32Array(frames);
    for (let f = 0; f < frames; f++) {
      for (let i = 0; i < N; i++) { re[i] = x[f * H + i] * win[i]; im[i] = 0; } fft();
      let l = 0, m = 0, h = 0;
      for (let k = 1; k < K; k++) { const mag = Math.log(1 + 100 * Math.hypot(re[k], im[k])); const d = mag - prev[k]; prev[k] = mag; if (d > 0) { const fr = hz(k); if (fr < 180) l += d; else if (fr < 2500) m += d; else if (fr < 11000) h += d; } }
      low[f] = l; mid[f] = m; high[f] = h; all[f] = l * 3 + m + h * .5;
    }
    // quitar tendencia (media móvil de 0.5 s) y rectificar
    const detr = a => { const o = new Float32Array(a.length), w = Math.round(fps * .25); let s = 0; const c = []; for (let i = 0; i < a.length; i++) { s += a[i]; c.push(s); }
      for (let i = 0; i < a.length; i++) { const lo = Math.max(0, i - w), hi = Math.min(a.length - 1, i + w); o[i] = Math.max(0, a[i] - (c[hi] - (lo ? c[lo - 1] : 0)) / (hi - lo + 1)); } return o; };
    const O = detr(all), Ol = detr(low), Om = detr(mid), Oh = detr(high);
    const autoc = (a, i0, i1) => { const res = []; for (let lag = Math.round(.25 * fps); lag <= Math.round(2.0 * fps); lag++) { let s = 0; for (let i = i0; i + lag < i1; i++) s += a[i] * a[i + lag]; res.push([lag / fps, s / (i1 - i0 - lag)]); } return res; };
    const ac = autoc(O, Math.round(30 * fps), Math.round(85 * fps));
    const peaks = ac.filter((v, i) => i > 0 && i < ac.length - 1 && v[1] > ac[i - 1][1] && v[1] >= ac[i + 1][1]).sort((a, c) => c[1] - a[1]).slice(0, 10).map(([l, v]) => ({ s: +l.toFixed(3), bpm: +(60 / l).toFixed(1), f: +v.toFixed(4) }));
    return { fps, peaks, O: Array.from(O), Ol: Array.from(Ol), Om: Array.from(Om), Oh: Array.from(Oh) };
  }, { data });
  console.log(r.peaks);
  fs.writeFileSync(__dirname + '/flux.json', JSON.stringify(r));
  await b.close();
})();
