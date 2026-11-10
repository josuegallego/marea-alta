// Partitura "de tambor": rejilla de corcheas a 152 BPM, patrón base sacado del promedio de la canción,
// y en cada compás solo se ponen los golpes que de verdad suenan ahí. Carril por banda: graves=0, medios=1, agudos=2.
const fs = require('fs');
const r = JSON.parse(fs.readFileSync(__dirname + '/flux.json', 'utf8'));
const g = JSON.parse(fs.readFileSync(__dirname + '/grid.json', 'utf8'));
const fps = r.fps, BAR = g.bar, E = BAR / 8;
const at = (a, t) => { const i = Math.round(t * fps); let m = 0; for (let d = -3; d <= 3; d++) m = Math.max(m, a[i + d] || 0); return m; };
const grid0 = g.phase + BAR / 16;                // las corcheas caen en los pasos impares del perfil
// el tiempo 1 = la corchea con el golpe grave más fuerte en promedio
const avg = (a, k) => { let s = 0, n = 0; for (let t = grid0 + k * E; t < 85; t += BAR) { s += at(a, t); n++; } return s / n; };
const bassAvg = [...Array(8)].map((_, k) => avg(r.Ol, k)); const down = bassAvg.indexOf(Math.max(...bassAvg));
const D = grid0 + down * E;
const barAt = k => D + k * BAR;
// energía (flujo) por compás para ubicar el coro
const barE = k => { let s = 0; for (let t = barAt(k); t < barAt(k + 1); t += .01) s += at(r.O, t); return s; };
const ks = []; for (let k = 0; barAt(k + 1) < 88; k++) ks.push(k);
const en = ks.map(barE), mx = Math.max(...en);
console.log('compás  inicio  energía');
ks.forEach(k => console.log(String(k).padStart(3), barAt(k).toFixed(2).padStart(7), ' ' + '#'.repeat(Math.round(en[k] / mx * 30))));
// el coro: el mayor salto sostenido de energía (promedio de 4 compases después vs 4 antes)
let jump = -1, chorus = 0; for (let k = 4; k < ks.length - 4; k++) { const a = (en[k] + en[k + 1] + en[k + 2] + en[k + 3]) / 4, b = (en[k - 1] + en[k - 2] + en[k - 3] + en[k - 4]) / 4; if (a - b > jump) { jump = a - b; chorus = k; } }
// fin del coro: primer compás desde el coro donde la energía cae claramente
if (process.env.CHORUS) chorus = +process.env.CHORUS;
let chEnd = chorus + 4; while (chEnd < ks.length - 1 && en[chEnd] > .78 * (en.slice(chorus, chorus + 8).reduce((x, y) => x + y) / 8)) chEnd++;
if (process.env.CHEND) chEnd = +process.env.CHEND;
const PRE = +(process.argv[2] || 8), POST = +(process.argv[3] || 2);
const kStart = chorus - PRE, kEnd = Math.min(ks.length - 1, chEnd + POST);
console.log(`coro en compás ${chorus} (${barAt(chorus).toFixed(2)} s), termina en ${chEnd} (${barAt(chEnd).toFixed(2)} s); fragmento ${barAt(kStart).toFixed(2)}–${barAt(kEnd).toFixed(2)} s`);

// patrón base: corcheas con más golpe en promedio (todas las bandas), y banda dominante en cada una
const bands = [r.Ol, r.Om, r.Oh], norm = bands.map(a => { let s = 0, n = 0; for (let k = 0; k < 8; k++) { s += avg(a, k); n++; } return s / n; });
const pat = [...Array(8)].map((_, k) => ({ k, s: avg(r.O, k), lane: [0, 1, 2].map(b => avg(bands[b], k) / norm[b]).reduce((bi, v, i, arr) => v > arr[bi] ? i : bi, 0) }));
const ordered = [...pat].sort((a, b) => b.s - a.s);
console.log('patrón promedio (corcheas):', pat.map(p => p.s.toFixed(0)).join(' '), '· carriles:', pat.map(p => p.lane).join(''));
const notes = [];
for (let k = kStart; k < kEnd; k++) {
  const inChorus = k >= chorus && k < chEnd;
  const take = inChorus ? 5 : 3;                 // el coro trae más golpes
  const slots = ordered.slice(0, take).map(p => p.k).sort((a, b) => a - b);
  const strong = ordered.slice(0, take + 2).map(p => p.k);
  slots.forEach(sk => {
    const t = barAt(k) + sk * E;
    const here = at(r.O, t), base = pat[sk].s;
    if (here < base * .45) return;               // en este compás ese golpe no suena: se respeta el silencio
    // carril: banda que más golpea en ESTE punto (normalizada), con el del patrón como respaldo
    const v = [0, 1, 2].map(b => at(bands[b], t) / norm[b]);
    const rank = [0, 1, 2].sort((x, y) => v[y] - v[x]);
    let lane = Math.max(...v) < 1.2 ? pat[sk].lane : rank[0];
    const n1 = notes[notes.length - 1], n2 = notes[notes.length - 2];
    if (n1 && n2 && n1[1] === lane && n2[1] === lane) lane = rank[0] === lane ? rank[1] : rank[0];   // no tres seguidas en el mismo carril
    notes.push([+t.toFixed(3), lane]);
  });
  // remate al final de cada frase de 4 compases dentro del coro: una corchea extra fuerte si suena
  if (inChorus && (k - chorus) % 4 === 3) { const sk = strong.find(s => !slots.includes(s)); if (sk != null) { const t = barAt(k) + sk * E; if (at(r.O, t) >= pat[sk].s * .6) notes.push([+t.toFixed(3), 2]); } }
}
notes.sort((a, b) => a[0] - b[0]);
// control: cuántas notas caen sobre un golpe real (pico local de flujo a ±40 ms)
const isPeak = t => { const i = Math.round(t * fps); let m = 0, mi = i; for (let d = -4; d <= 4; d++) if ((r.O[i + d] || 0) > m) { m = r.O[i + d]; mi = i + d; } return Math.abs(mi - i) <= 4 && m > 0; };
const ok = notes.filter(n => isPeak(n[0])).length;
const out = { bpm: +(240 / BAR).toFixed(2), start: +barAt(kStart).toFixed(3), end: +barAt(kEnd).toFixed(3), chorus: +barAt(chorus).toFixed(3), notes };
fs.writeFileSync(__dirname + '/chart2.json', JSON.stringify(out));
console.log({ notas: notes.length, porSeg: +(notes.length / (out.end - out.start)).toFixed(2), sobreGolpe: Math.round(ok / notes.length * 100) + '%', carriles: [0, 1, 2].map(l => notes.filter(n => n[1] === l).length) });
