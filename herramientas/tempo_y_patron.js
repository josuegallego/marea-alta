// Afina la duración del compás y muestra el patrón rítmico (16 pasos) por banda, con la mejor fase.
const fs = require('fs');
const r = JSON.parse(fs.readFileSync(__dirname + '/flux.json', 'utf8'));
const fps = r.fps, A = r.O, T0 = +(process.argv[2] || 30), T1 = +(process.argv[3] || 85);
const at = (a, t) => { const i = Math.round(t * fps); let m = 0; for (let d = -2; d <= 2; d++) m = Math.max(m, a[i + d] || 0); return m; };
const prof = (a, bar, ph, steps) => { const pr = Array(steps).fill(0); let n = 0; for (let t = T0 + ph; t + bar < T1; t += bar) { n++; for (let k = 0; k < steps; k++) pr[k] += at(a, t + k * bar / steps); } return pr.map(v => v / n); };
const contrast = pr => { const s = [...pr].sort((x, y) => x - y); const hi = s.slice(-4).reduce((x, y) => x + y) / 4, lo = s.slice(0, 8).reduce((x, y) => x + y) / 8; return hi / (lo + 1e-9); };
let best = null;
for (let bar = 1.54; bar <= 1.62; bar += .0005) for (let ph = 0; ph < bar; ph += .01) { const c = contrast(prof(A, bar, ph, 16)); if (!best || c > best.c) best = { c, bar, ph }; }
// afinar fase
for (let ph = best.ph - .01; ph < best.ph + .01; ph += .001) { const c = contrast(prof(A, best.bar, ph, 16)); if (c > best.c) best = { c, bar: best.bar, ph }; }
console.log('compás', best.bar.toFixed(4), 's  → pulso', (best.bar / 4).toFixed(4), 's =', (240 / best.bar).toFixed(2), 'BPM · fase', (T0 + best.ph).toFixed(3), 's · contraste', best.c.toFixed(2));
const show = (name, a) => { const pr = prof(a, best.bar, best.ph, 16), mx = Math.max(...pr); console.log(name.padEnd(7), pr.map(v => String(Math.round(v / mx * 9))).join(' ')); };
console.log('pasos   1 . . . 2 . . . 3 . . . 4 . . .');
show('todo', r.O); show('graves', r.Ol); show('medios', r.Om); show('agudos', r.Oh);
fs.writeFileSync(__dirname + '/grid.json', JSON.stringify({ bar: best.bar, phase: T0 + best.ph }));
