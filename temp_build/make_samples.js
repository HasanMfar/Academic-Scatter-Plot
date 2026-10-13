// Generates pretty academic sample datasets in ../samples/*.xlsx
const fs = require('fs');
const path = require('path');
const XLSX = require('../node_modules/xlsx');

const outDir = path.resolve(__dirname, '..', 'samples');
fs.mkdirSync(outDir, { recursive: true });

// deterministic pseudo-random noise
let seed = 20261012;
function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
const noise = amp => (rnd() * 2 - 1) * amp;
const r2 = v => Math.round(v * 100) / 100;
const r3 = v => Math.round(v * 1000) / 1000;

function write(name, sheetName, aoa) {
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = aoa[0].map((h, i) => ({ wch: Math.max(12, String(h).length + 3) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, path.join(outDir, name));
  console.log('wrote', name, `(${aoa.length - 1} rows)`);
}

/* 1. QCM humidity hysteresis (same shape as the flagship demo) */
(function hysteresis() {
  const x = [20, 30, 40, 50, 60, 70, 80, 90, 100, 100, 90, 80, 70, 60, 50, 40, 30, 20];
  const s1 = [0, -12, -34, -68, -118, -186, -268, -352, -438, -424, -330, -232, -152, -92, -50, -22, -6, 0];
  const s2 = [0, -20, -55, -104, -176, -272, -382, -496, -612, -594, -458, -320, -206, -124, -66, -30, -10, 0];
  const rows = [['RH (%)', 'Nanocomposite', 'Pure Starch']];
  x.forEach((v, i) => {
    // clamp inside the axis window (0 … -650) so noise never clips a marker outside the frame
    rows.push([v, Math.max(-640, Math.min(0, s1[i] + Math.round(noise(6)))), Math.max(-640, Math.min(0, s2[i] + Math.round(noise(8))))]);
  });
  write('QCM_Hysteresis.xlsx', 'SensorData', rows);
})();

/* 2. Beer-Lambert calibration: linear with replicates + SD error columns */
(function beerLambert() {
  const rows = [['Conc (mM)', 'Sample 1', 'Sample 1 SD', 'Sample 2', 'Sample 2 SD']];
  const c = [];
  for (let v = 0; v <= 25; v += 2.5) c.push(v);
  c.forEach(v => {
    const a1 = 0.0312 * v + 0.014 + noise(0.006);
    const a2 = 0.0241 * v + 0.030 + noise(0.006);
    const sd1 = 0.02 + rnd() * 0.02;
    const sd2 = 0.02 + rnd() * 0.02;
    rows.push([v, r3(a1), r3(sd1), r3(a2), r3(sd2)]);
  });
  write('BeerLambert_Calibration.xlsx', 'Calibration', rows);
})();

/* 3. Damped oscillation: two damping ratios, smooth dense curve */
(function damping() {
  const rows = [['Time (s)', 'ζ = 0.10 (Underdamped)', 'ζ = 0.35']];
  for (let t = 0; t <= 12.0001; t += 0.1) {
    const tt = Math.round(t * 10) / 10;
    const y1 = Math.exp(-0.30 * tt) * Math.cos(2 * Math.PI * 0.85 * tt);
    const y2 = Math.exp(-1.05 * tt) * Math.cos(2 * Math.PI * 0.85 * tt - 0.15);
    rows.push([tt, r3(y1 + noise(0.012)), r3(y2 + noise(0.012))]);
  }
  write('Damped_Oscillation.xlsx', 'StepResponse', rows);
})();

/* 4. UV-Vis spectra: three samples, overlapping Gaussian bands */
(function spectra() {
  const rows = [['Wavelength (nm)', 'Catalyst A', 'Catalyst B', 'Catalyst C']];
  const band = (x, c, w, a) => a * Math.exp(-Math.pow(x - c, 2) / (2 * w * w));
  for (let wl = 350; wl <= 750.001; wl += 4) {
    const a = band(wl, 452, 30, 0.92) + band(wl, 618, 42, 0.48) + 0.05;
    const b = band(wl, 524, 55, 1.02) + band(wl, 392, 26, 0.34) + 0.04;
    const c = band(wl, 404, 24, 0.58) + band(wl, 500, 32, 0.41) + band(wl, 682, 46, 0.74) + 0.05;
    rows.push([wl, r3(a + noise(0.006)), r3(b + noise(0.006)), r3(c + noise(0.006))]);
  }
  write('UVVis_Spectra.xlsx', 'Spectra', rows);
})();

/* 5. Impedance Bode plot: log-scale friendly, 5 decades */
(function bode() {
  const rows = [['Frequency (Hz)', 'Gain (dB)', 'Gain + EMI (dB)']];
  const decades = 5, pts = 8;
  for (let d = 0; d <= decades; d++) {
    for (let k = 0; k < (d === decades ? 1 : pts); k++) {
      const f = Math.pow(10, d + k / pts);
      // 2-pole low-pass @ 1 kHz
      const u = f / 1000;
      const mag = 1 / Math.sqrt(Math.pow(1 - u * u, 2) + Math.pow(u / 0.707, 2));
      const db = 20 * Math.log10(mag);
      const emi = db + (f > 8000 ? 6 * Math.log10(f / 8000) : 0) + noise(0.35);
      rows.push([r2(f), r2(db + noise(0.15)), r2(emi)]);
    }
  }
  write('Impedance_Bode.xlsx', 'Bode', rows);
})();

/* 6. Solar cell I-V curve: two cells, sharp knee */
(function solar() {
  const rows = [['Voltage (V)', 'Cell A — η 21.4%', 'Cell B — η 18.2%']];
  // Sweep stops at 0.60 V: Voc sits just above it (0.620 / 0.607 V) so both knees are
  // visible and neither diode term runs away into a negative cliff.
  for (let v = 0; v <= 0.60001; v += 0.02) {
    const vv = Math.round(v * 100) / 100;
    const iv = (isc, voc, n) => isc - isc / (Math.exp(voc / n) - 1) * (Math.exp(vv / n) - 1);
    rows.push([vv, r3(iv(9.42, 0.620, 0.0259) + noise(0.02)), r3(iv(8.71, 0.607, 0.0272) + noise(0.02))]);
  }
  write('Solar_Cell_IV.xlsx', 'IV_Curve', rows);
})();

console.log('\nAll samples written to', outDir);
