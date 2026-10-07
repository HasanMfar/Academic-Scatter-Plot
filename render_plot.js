// Publication-quality hysteresis figure from Clean_Hysteresis_Data.xlsx
// Usage: node render_plot.js [fa]  ->  Clean_Hysteresis_Plot[_fa].svg / .png
const fs = require('fs');
const XLSX = require('./node_modules/xlsx');
const svg2img = require('./node_modules/svg2img');

const rows = XLSX.utils.sheet_to_json(
  XLSX.read(fs.readFileSync('Clean_Hysteresis_Data.xlsx'), { type: 'buffer' }).Sheets.Sheet1,
  { header: 1 }
);
const hdr = rows[0];
const data = rows.slice(1).filter(r => !isNaN(parseFloat(r[0])));
const X = data.map(r => +r[0]);
const turn = X.indexOf(Math.max(...X)); // last forward point

const W = 1000, H = 640;
const P = { l: 110, r: 40, t: 40, b: 90 };
const pw = W - P.l - P.r, ph = H - P.t - P.b;
const ax = { x0: 20, x1: 100, xs: 10, y0: -420, y1: 20, ys: 50 };
const mx = v => P.l + (v - ax.x0) / (ax.x1 - ax.x0) * pw;
const my = v => P.t + (ax.y1 - v) / (ax.y1 - ax.y0) * ph;
const FA = process.argv[2] === 'fa';
const F = FA ? 'Tahoma, Arial, sans-serif' : 'Arial, Helvetica, sans-serif';
const T = FA ? {
  x: 'رطوبت نسبی (%)', y: 'تغییر فرکانس (هرتز)',
  fwd: 'مسیر رفت (جذب)', bwd: 'مسیر برگشت (واجذب)',
  names: { 'Nanocomposite': 'نانوکامپوزیت', 'Pure Starch': 'نشاسته خالص' }, out: '_fa'
} : {
  x: 'Relative Humidity, RH (%)', y: 'Frequency Shift, Δf (Hz)',
  fwd: 'Forward (adsorption)', bwd: 'Backward (desorption)', names: {}, out: ''
};

const styles = [
  { color: '#1f6fb2', marker: 'circle' },
  { color: '#d1343f', marker: 'square' }
];

const marker = (type, x, y, color, open) => {
  const fill = open ? '#fff' : color;
  return type === 'circle'
    ? `<circle cx="${x}" cy="${y}" r="6.5" fill="${fill}" stroke="${color}" stroke-width="2"/>`
    : `<rect x="${x - 6}" y="${y - 6}" width="12" height="12" fill="${fill}" stroke="${color}" stroke-width="2"/>`;
};
const poly = pts => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
const arrowHead = (p1, p2, color) => {
  const dx = p2[0] - p1[0], dy = p2[1] - p1[1];
  if (Math.hypot(dx, dy) < 40) return '';
  const a = Math.atan2(dy, dx) * 180 / Math.PI;
  const m = [p1[0] + dx * 0.5, p1[1] + dy * 0.5];
  return `<path d="M-6,-5 L6,0 L-6,5 Z" fill="${color}" transform="translate(${m[0].toFixed(1)},${m[1].toFixed(1)}) rotate(${a.toFixed(1)})"/>`;
};

let s = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${F}">
<rect width="${W}" height="${H}" fill="#fff"/>`;

// grid + ticks
for (let y = -400; y <= 0; y += ax.ys) {
  const py = my(y);
  s += `<line x1="${P.l}" x2="${P.l + pw}" y1="${py}" y2="${py}" stroke="${y === 0 ? '#9aa3ad' : '#e6e9ed'}" stroke-width="1"/>`;
  s += `<line x1="${P.l}" x2="${P.l + 7}" y1="${py}" y2="${py}" stroke="#222" stroke-width="1.5"/>`;
  s += `<text x="${P.l - 12}" y="${py + 6}" font-size="17" text-anchor="end" fill="#222">${y}</text>`;
}
for (let x = ax.x0; x <= ax.x1; x += ax.xs) {
  const px = mx(x);
  s += `<line x1="${px}" x2="${px}" y1="${P.t}" y2="${P.t + ph}" stroke="#e6e9ed" stroke-width="1"/>`;
  s += `<line x1="${px}" x2="${px}" y1="${P.t + ph}" y2="${P.t + ph - 7}" stroke="#222" stroke-width="1.5"/>`;
  s += `<text x="${px}" y="${P.t + ph + 28}" font-size="17" text-anchor="middle" fill="#222">${x}</text>`;
}
s += `<rect x="${P.l}" y="${P.t}" width="${pw}" height="${ph}" fill="none" stroke="#222" stroke-width="1.8"/>`;

// axis titles
s += `<text x="${P.l + pw / 2}" y="${H - 22}" font-size="21" font-weight="bold" text-anchor="middle" fill="#111">${T.x}</text>`;
s += `<text transform="translate(34,${P.t + ph / 2}) rotate(-90)" font-size="21" font-weight="bold" text-anchor="middle" fill="#111">${T.y}</text>`;

// series
hdr.slice(1).forEach((name, i) => {
  const { color, marker: mk } = styles[i % styles.length];
  const pts = data.map(r => [mx(+r[0]), my(+r[i + 1])]);
  const fwd = pts.slice(0, turn + 1), bwd = pts.slice(turn);
  s += `<path d="${poly(fwd)}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linejoin="round"/>`;
  s += `<path d="${poly(bwd)}" fill="none" stroke="${color}" stroke-width="2.6" stroke-dasharray="8,6" stroke-linejoin="round"/>`;
  for (let k = 0; k < pts.length - 1; k++) s += arrowHead(pts[k], pts[k + 1], color);
  pts.forEach((p, k) => { s += marker(mk, p[0], p[1], color, k > turn); });
});

// direct labels (text + thin leader line, pointing at the RH-max point)
const label = (i, tx, ty) => {
  const { color } = styles[i];
  const name = T.names[hdr[i + 1]] || hdr[i + 1];
  const yv = +data[turn][i + 1];
  const px = mx(X[turn]), py = my(yv);
  const ang = Math.atan2(py - ty, px - tx);
  const ex = px - Math.cos(ang) * 11, ey = py - Math.sin(ang) * 11;
  s += `<line x1="${tx + 4}" y1="${ty - 6}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="${color}" stroke-width="1.6"/>`;
  s += `<path d="M-7,-5 L5,0 L-7,5 Z" fill="${color}" transform="translate(${ex.toFixed(1)},${ey.toFixed(1)}) rotate(${(ang * 180 / Math.PI).toFixed(1)})"/>`;
  s += `<text x="${tx}" y="${ty}" font-size="20" font-weight="bold" fill="${color}" text-anchor="end">${name}</text>`;
};
label(0, mx(84), my(-60));
label(1, mx(70), my(-330));

// line-style key (forward / backward)
const kx = P.l + 24, ky = P.t + ph - 70, kw = 250;
// RTL: line sample on the right, text to its left
const lx = FA ? kx + kw - 70 : kx, tx = FA ? lx - 14 : kx + 60, anc = FA ? 'end' : 'start';
s += `<rect x="${kx - 12}" y="${ky - 22}" width="${kw}" height="78" fill="#fff" stroke="#c9ced4" stroke-width="1"/>`;
s += `<line x1="${lx}" x2="${lx + 46}" y1="${ky}" y2="${ky}" stroke="#333" stroke-width="2.6"/>${marker('circle', lx + 23, ky, '#333', false)}`;
s += `<text x="${tx}" y="${ky + 6}" font-size="17" fill="#222" text-anchor="${anc}">${T.fwd}</text>`;
s += `<line x1="${lx}" x2="${lx + 46}" y1="${ky + 34}" y2="${ky + 34}" stroke="#333" stroke-width="2.6" stroke-dasharray="8,6"/>${marker('circle', lx + 23, ky + 34, '#333', true)}`;
s += `<text x="${tx}" y="${ky + 40}" font-size="17" fill="#222" text-anchor="${anc}">${T.bwd}</text>`;

s += `</svg>`;

fs.writeFileSync(`Clean_Hysteresis_Plot${T.out}.svg`, s);
svg2img(s, { width: W * 3, height: H * 3 }, (e, b) => {
  if (e) throw e;
  fs.writeFileSync(`Clean_Hysteresis_Plot${T.out}.png`, b);
  console.log('ok', b.length);
});
