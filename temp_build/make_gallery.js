// Renders gallery previews for the GitHub README by running the REAL app
// engine (app.js) inside jsdom, then rasterizing the SVG with resvg.
// Output: ../gallery/*.png
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const XLSX = require('../node_modules/xlsx');
const { Resvg } = require('../node_modules/@resvg/resvg-js');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'gallery');
fs.mkdirSync(outDir, { recursive: true });

let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace(/<script[\s\S]*?<\/script>/g, '');

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/' });
const { window } = dom;
const { document } = window;
const errors = [];
window.addEventListener('error', e => errors.push(e.message));

const appSrc = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const script = document.createElement('script');
script.textContent = appSrc;
document.body.appendChild(script);
document.dispatchEvent(new window.Event('DOMContentLoaded'));

const $ = id => document.getElementById(id);

function loadSample(file) {
  const wb = XLSX.read(fs.readFileSync(path.join(root, 'samples', file)), { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: 0 });
  const parsed = window.eval('parseSmartExcel')(rows);
  const colorPalette = [
    { dark: '#06b6d4', light: '#0284c7' },
    { dark: '#f43f5e', light: '#e11d48' },
    { dark: '#10b981', light: '#059669' },
    { dark: '#f59e0b', light: '#d97706' },
    { dark: '#8b5cf6', light: '#6d28d9' },
    { dark: '#ec4899', light: '#be185d' }
  ];
  const markers = ['circle', 'square', 'diamond', 'triangle', 'cross'];
  window.eval(`
    dataset.xValues = [];
    dataset.series = [];
  `);
  const ds = window.eval('dataset');
  ds.xValues = parsed.xValues;
  ds.series = parsed.series.map((s, i) => ({
    id: `series_${i + 1}`,
    nameFa: s.nameFa,
    nameEn: s.nameEn,
    group: `series_${i + 1}`,
    colorDark: colorPalette[i % colorPalette.length].dark,
    colorLight: colorPalette[i % colorPalette.length].light,
    marker: markers[i % markers.length],
    strokeDash: '',
    opacity: 1,
    errValues: s.errValues && s.errValues.length === s.yValues.length ? s.errValues : null,
    yValues: s.yValues,
    visible: true
  }));
  window.eval('autoScaleAxis(); setupSeriesCheckboxes(); setupCalloutsControls(); renderDataTable();');
}

function applyLook(cfg) {
  const json = JSON.stringify(cfg);
  window.eval(`(function(c){
    // reset cross-job leakage so each image is independent
    state.ticks = { minor: 0, direction: 'out', length: 6, decimals: -1, thousands: false, scientific: false, xLabelRotate: 0, labelEvery: 1, xLog: false, yLog: false };
    state.data = { smoothing: 'straight', yTransform: 'none', sortByX: false, showErrorBars: false };
    state.type = { tickFont: 15, axisTitleFont: 18, legendFont: 11.5, dataLabelFont: 10.5, fontFamily: 'auto', plotBg: '', transparentBg: false, gridStyle: 'dashed', gridOpacity: 1, gridAxis: 'both', titlePlacement: 'above' };
    state.layout = { width: 960, height: 560, marginTop: 40, marginRight: 60, marginBottom: 75, marginLeft: 90, preset: 'standard', axisOrigin: 'corner', reverseX: false, reverseY: false };
    state.zoom = { enabled: false, x0: null, x1: null, y0: null, y1: null, boxW: 300, boxH: 190, boxX: null, boxY: null, showRegionBox: true, showTitles: false };
    state.peaks = { enabled: false, type: 'maxima', sens: 3, showFWHM: true, showLabels: true };
    state.markerSize = 10; state.lineWidth = 2.6;
    state.chartSubtitle = ''; state.callouts = {};
    if (c.lang) state.lang = c.lang;
    if (c.preset) applyJournalPreset(c.preset);
    if (c.theme) { state.theme = c.theme; document.body.className = 'theme-' + c.theme; }
    if (c.title !== undefined) state.chartTitle = c.title;
    if (c.subtitle !== undefined) state.chartSubtitle = c.subtitle;
    if (c.xTitle) state.xTitle = c.xTitle;
    if (c.yTitle) state.yTitle = c.yTitle;
    if (c.plotMode) state.plotMode = c.plotMode;
    if (c.frameStyle) state.frameStyle = c.frameStyle;
    if (c.markerSize) state.markerSize = c.markerSize;
    if (c.lineWidth) state.lineWidth = c.lineWidth;
    if (c.axis) { Object.assign(state.axis, c.axis); }
    if (c.ticks) { Object.assign(state.ticks, c.ticks); }
    if (c.type) { Object.assign(state.type, c.type); }
    if (c.data) { Object.assign(state.data, c.data); }
    if (c.flags) { Object.keys(c.flags).forEach(k => { state[k] = c.flags[k]; }); }
    if (c.layout) { Object.assign(state.layout, c.layout); }
    if (c.callouts) { Object.assign(state.callouts, c.callouts); }
    if (c.zoom) { Object.assign(state.zoom, c.zoom); }
    if (c.peaks) { Object.assign(state.peaks, c.peaks); }
    renderChart(); renderLegend();
  })(${json});`);
}

function grabSvg() {
  const svgEl = $('scatterPlotSvg');
  let s = new window.XMLSerializer().serializeToString(svgEl);
  if (!s.includes('xmlns=')) s = s.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  // full-canvas backdrop (the app paints this on its own canvas during PNG export)
  const vb0 = svgEl.getAttribute('viewBox').split(/\s+/);
  const st = window.eval('state');
  if (!st.type.transparentBg) {
    const bg = st.type.plotBg || (st.theme === 'dark' ? '#0f172a' : '#ffffff');
    s = s.replace(/(<svg[^>]*>)/, `$1<rect x="0" y="0" width="${vb0[2]}" height="${vb0[3]}" fill="${bg}"/>`);
  }
  // resvg silently drops groups whose filter sits on the <g> (the in-plot legend badge);
  // browsers render it fine, so strip only that attribute for rasterization.
  s = s.replace(/<g([^>]*) filter="url\(#badgeShadow\)"/g, '<g$1>');
  // resvg needs explicit size
  const vb = svgEl.getAttribute('viewBox').split(/\s+/);
  s = s.replace(/<svg ([^>]*?)width="[^"]*"/, '<svg $1width="' + vb[2] + '"');
  if (!/width="/.test(s)) s = s.replace('<svg ', `<svg width="${vb[2]}" height="${vb[3]}" `);
  return { svg: s, w: +vb[2], h: +vb[3] };
}

function render(name, cfg) {
  // applyJournalPreset() silently ignores unknown keys, which would quietly ship
  // a gallery image in the wrong style, so fail loudly instead.
  if (cfg.preset) {
    const known = JSON.parse(window.eval('JSON.stringify(Object.keys(JOURNAL_PRESETS))'));
    if (known.indexOf(cfg.preset) === -1) throw new Error('unknown preset "' + cfg.preset + '" (known: ' + known.join(', ') + ')');
  }
  applyLook(cfg);
  const raw = $('scatterPlotSvg').innerHTML;
  const wantLegend = !!(cfg.flags && cfg.flags.showInplotLegend);
  if (wantLegend && !raw.includes('data-badge="inplot"')) console.log(`  !! ${name}: in-plot legend MISSING from SVG`);
  if (wantLegend) console.log(`  ${name}: legend ok (x=${raw.includes('data-badge="inplot"')})`);
  const { svg, w, h } = grabSvg();
  const scale = 2;
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'zoom', value: scale },
    font: { loadSystemFonts: true, defaultFontFamily: 'Arial' }
  });
  const png = resvg.render().asPng();
  fs.writeFileSync(path.join(outDir, name + '.png'), png);
  console.log(`OK  ${name}.png  (${w}x${h} @2x -> ${png.length} bytes)`);
}

// --- The gallery ---
const jobs = [
  ['01_qcm_hysteresis', 'QCM_Hysteresis.xlsx', {
    lang: 'en', theme: 'light', preset: 'compact',
    title: 'QCM Humidity Sensor Response',
    subtitle: 'Adsorption / desorption hysteresis of nanocomposite vs. pure starch films',
    xTitle: 'Relative Humidity, RH (%)', yTitle: 'Frequency Shift, Δf (Hz)',
    axis: { xMin: 20, xMax: 100, xStep: 10, yMin: -650, yMax: 0, yStep: 100 },
    flags: { showHysteresis: true, showAnnotations: true, showInplotLegend: false, showTrendlines: false, showErrorBand: false },
    layout: { width: 900, height: 560 }
  }],
  ['02_beer_lambert', 'BeerLambert_Calibration.xlsx', {
    lang: 'en', theme: 'light', preset: 'doubleColumn',
    title: 'Beer–Lambert Calibration Curve',
    subtitle: 'Triplicate absorbance with ±SD error bars and linear fit',
    xTitle: 'Concentration (mM)', yTitle: 'Absorbance (a.u.)',
    flags: { showHysteresis: false, showAnnotations: false, showTrendlines: true, showInplotLegend: true, showErrorBars: true, showDataLabels: false },
    callouts: { inplotX: 70, inplotY: 70 },
    layout: { width: 900, height: 540 }
  }],
  ['03_uvvis_spectra', 'UVVis_Spectra.xlsx', {
    lang: 'en', theme: 'light', preset: 'openFrame',
    title: 'UV-Vis Absorption Spectra',
    subtitle: 'Three catalyst samples across the visible band',
    xTitle: 'Wavelength (nm)', yTitle: 'Absorbance (a.u.)',
    data: { sortByX: true },
    flags: { showHysteresis: false, showAnnotations: false, showTrendlines: false, showInplotLegend: true },
    callouts: { inplotX: 60, inplotY: 60 },
    layout: { width: 920, height: 560 }
  }],
  ['04_damped_oscillation', 'Damped_Oscillation.xlsx', {
    lang: 'en', theme: 'light', preset: 'axesAtZero',
    title: 'Underdamped Step Response',
    subtitle: 'Displacement of a mass–spring–damper for two damping ratios',
    xTitle: 'Time (s)', yTitle: 'Normalised Displacement',
    data: { sortByX: true },
    flags: { showHysteresis: false, showAnnotations: false, showTrendlines: false, showInplotLegend: true },
    callouts: { inplotX: 620, inplotY: 70 },
    layout: { width: 900, height: 540 }
  }],
  ['05_bode_log', 'Impedance_Bode.xlsx', {
    lang: 'en', theme: 'dark', preset: 'compact',
    title: 'Bode Magnitude Plot',
    subtitle: 'Two-pole low-pass response with and without EMI (log frequency axis)',
    xTitle: 'Frequency (Hz)', yTitle: 'Gain (dB)',
    data: { sortByX: true },
    ticks: { xLog: true },
    flags: { showHysteresis: false, showAnnotations: false, showTrendlines: false, showInplotLegend: true },
    callouts: { inplotX: 60, inplotY: 60 },
    layout: { width: 900, height: 540 }
  }],
  ['06_solar_iv', 'Solar_Cell_IV.xlsx', {
    lang: 'en', theme: 'light', preset: 'compact',
    title: 'Solar Cell I–V Characteristics',
    subtitle: 'Fill-factor knee region of two perovskite cells',
    xTitle: 'Voltage (V)', yTitle: 'Current (mA)',
    data: { sortByX: true },
    flags: { showHysteresis: false, showAnnotations: true, showTrendlines: false, showInplotLegend: false, showDataLabels: false },
    layout: { width: 900, height: 560 }
  }],
  ['07_magnifier_inset', 'UVVis_Spectra.xlsx', {
    lang: 'en', theme: 'light', preset: 'compact',
    title: 'Magnifier Inset — Band Overlap',
    subtitle: 'Publication-style zoom region on the 480–560 nm crossing',
    xTitle: 'Wavelength (nm)', yTitle: 'Absorbance (a.u.)',
    data: { sortByX: true },
    flags: { showHysteresis: false, showAnnotations: false, showTrendlines: false, showInplotLegend: false },
    zoom: { enabled: true, x0: 470, x1: 565, y0: 0.35, y1: 1.05, boxW: 300, boxH: 190, boxX: null, boxY: null, showRegionBox: true, showTitles: true },
    layout: { width: 960, height: 560 }
  }],
  ['08_fa_hysteresis', 'QCM_Hysteresis.xlsx', {
    lang: 'fa', theme: 'light', preset: 'compact',
    title: 'پاسخ سنسور رطوبت QCM',
    subtitle: 'حلقه هیسترزیس جذب و واجذب — نانوکامپوزیت در برابر نشاسته خالص',
    xTitle: 'رطوبت نسبی (%)', yTitle: 'تغییر فرکانس (هرتز)',
    axis: { xMin: 20, xMax: 100, xStep: 10, yMin: -650, yMax: 0, yStep: 100 },
    flags: { showHysteresis: true, showAnnotations: true, showInplotLegend: false, showTrendlines: false },
    layout: { width: 900, height: 560 }
  }],
  ['09_raman_peaks', 'Raman_Spectroscopy.xlsx', {
    lang: 'en', theme: 'light', preset: 'compact',
    title: 'Raman Spectroscopy — Graphene Fingerprints',
    subtitle: 'Identification of D, G, and 2D characteristic bands with automated peak detection',
    xTitle: 'Raman Shift (cm⁻¹)', yTitle: 'Intensity (a.u.)',
    data: { sortByX: true },
    flags: { showHysteresis: false, showAnnotations: false, showTrendlines: false, showInplotLegend: true },
    peaks: { enabled: true, type: 'maxima', sens: 3, showFWHM: true, showLabels: true },
    callouts: { inplotX: 60, inplotY: 60 },
    layout: { width: 920, height: 560 }
  }]
];

let failed = 0;
for (const [name, file, cfg] of jobs) {
  try {
    loadSample(file);
    render(name, cfg);
  } catch (e) {
    failed++;
    console.log(`FAIL ${name} :: ${e.stack || e}`);
  }
}
if (errors.length) { console.log('window errors:', errors); failed++; }
console.log(failed ? `\n${failed} FAILED` : '\nGALLERY DONE');
