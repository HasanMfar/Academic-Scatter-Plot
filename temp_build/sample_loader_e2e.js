// End-to-end: drive the one-click sample picker exactly like a real click.
// Boots the real index.html + app.js in jsdom, stubs window.fetch to serve the
// samples/*.xlsx from disk, then sets #selSampleDataset and fires its `change` event.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const XLSX = require('../node_modules/xlsx');

const root = path.resolve(__dirname, '..');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace(/<script[\s\S]*?<\/script>/g, '');
const appSrc = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

let fail = 0;
const failMsg = (name, msg) => { fail++; console.log('FAIL', name, '::', msg); };

// Boot the app; `memory` pre-fills the localStorage settings blob (page reload).
function bootApp(memory) {
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/' });
  const { window } = dom;
  const { document } = window;
  const errors = [];
  window.addEventListener('error', e => errors.push(e.message));

  const requested = [];
  const response = (file, ok = true, status = 200) => ({
    ok,
    status,
    arrayBuffer: () => {
      const bytes = fs.readFileSync(path.join(root, 'samples', file));
      const ab = new window.ArrayBuffer(bytes.length);
      new window.Uint8Array(ab).set(bytes);
      return Promise.resolve(ab);
    }
  });
  const realFetch = url => {
    requested.push(url);
    const file = String(url).replace(/^samples\//, '');
    return Promise.resolve(fs.existsSync(path.join(root, 'samples', file)) ? response(file) : response('', false, 404));
  };
  window.fetch = realFetch;

  window.XLSX = XLSX;
  window.alert = m => { throw new Error('alert: ' + m); };
  if (memory) window.localStorage.setItem('freebuff.scatter.settings.v1', memory);

  const script = document.createElement('script');
  script.textContent = appSrc;
  document.body.appendChild(script);
  document.dispatchEvent(new window.Event('DOMContentLoaded'));

  return {
    window,
    document,
    requested,
    errors,
    realFetch,
    $: id => document.getElementById(id),
    svg: () => document.getElementById('scatterPlotSvg').innerHTML,
    // Any attribute left as NaN/undefined means the figure is broken for export
    badAttrs: () => window.eval(`(function(){
      let n = 0;
      document.getElementById('scatterPlotSvg').querySelectorAll('*').forEach(el => {
        for (const a of el.attributes) if (/NaN|undefined/.test(a.value)) n++;
      });
      return n;
    })()`)
  };
}

const app = bootApp();
const { window, document } = app;
const $ = id => document.getElementById(id);

const state = () => JSON.parse(window.eval('JSON.stringify(dataset)'));

function expected(file) {
  const wb = XLSX.read(fs.readFileSync(path.join(root, 'samples', file)), { type: 'buffer' });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: 0 });
  const parsed = JSON.parse(window.eval('JSON.stringify(parseSmartExcel(' + JSON.stringify(rows) + '))'));
  return { points: parsed.xValues.length, names: parsed.series.map(x => x.nameEn) };
}

function pick(value) {
  const sel = $('selSampleDataset');
  sel.value = value;
  sel.dispatchEvent(new window.Event('change'));
  return new Promise(r => setTimeout(r, 60));
}

(async () => {
  // 1. The picker exists, is bilingual, and every value is a real file on disk.
  const sel = $('selSampleDataset');
  if (!sel) failMsg('picker exists', 'no #selSampleDataset');
  if (!$('chkLogX')) failMsg('log checkbox', 'no #chkLogX to sync');
  const options = sel ? Array.from(sel.options) : [];
  const datasets = options.filter(o => o.value);
  console.log('picker options:', datasets.length, '| load button:', !!$('btnLoadSample'));
  for (const o of options) {
    const fa = o.getAttribute('data-fa'), en = o.getAttribute('data-en');
    if (!fa || !en) failMsg('bilingual option', JSON.stringify(o.value) + ' fa=' + fa + ' en=' + en);
    if (o.value && !fs.existsSync(path.join(root, 'samples', o.value))) failMsg('option file exists', o.value);
  }

  // 2. Every option loads through the real UI path and matches an independent parse.
  for (const o of datasets) {
    const before = state();
    const exp = expected(o.value);
    await pick(o.value);
    const after = state();
    const screenshot = app.svg().length;
    const logX = window.eval('state.ticks.xLog') === true;
    const wantLogX = o.value === 'Impedance_Bode.xlsx';
    const toast = $('toastMsg').textContent;

    const problems = [];
    if (after.xValues.length !== exp.points) problems.push(`points ${after.xValues.length} != ${exp.points}`);
    if (JSON.stringify(after.series.map(x => x.nameEn)) !== JSON.stringify(exp.names)) {
      problems.push('names ' + JSON.stringify(after.series.map(x => x.nameEn)));
    }
    if (JSON.stringify(after.series) === JSON.stringify(before.series)) problems.push('dataset not replaced');
    if (after.series.some(x => x.nameEn === 'Polymer A (Mock)')) problems.push('default mock data still present');
    if (screenshot < 3000) problems.push('svg too small: ' + screenshot);
    if (logX !== wantLogX) problems.push('xLog ' + logX + ' != ' + wantLogX);
    if ($('chkLogX').checked !== wantLogX) problems.push('chkLogX not synced');
    const axis = JSON.parse(window.eval('JSON.stringify(state.axis)'));
    if (!(axis.xMax > axis.xMin) || !(axis.yMax > axis.yMin)) problems.push('bad auto scale ' + JSON.stringify(axis));
    const faLabelHead = o.textContent.split(' — ')[0].trim();
    if (!toast.includes(faLabelHead)) problems.push('toast: ' + toast);

    // Display flags of the sample's README figure
    const flags = JSON.parse(window.eval(`JSON.stringify({
      hyst: state.showHysteresis, hystChk: document.getElementById('chkHysteresis').checked,
      annot: state.showAnnotations, inplot: state.showInplotLegend,
      trend: state.showTrendlines, labels: state.showDataLabels
    })`));
    const wantHyst = o.value === 'QCM_Hysteresis.xlsx';
    const wantAnnot = wantHyst || o.value === 'Solar_Cell_IV.xlsx';
    const wantInplot = ['BeerLambert_Calibration.xlsx', 'Damped_Oscillation.xlsx', 'UVVis_Spectra.xlsx', 'Impedance_Bode.xlsx'].indexOf(o.value) !== -1;
    if (flags.hyst !== wantHyst || flags.hystChk !== wantHyst) problems.push('hysteresis ' + flags.hyst);
    if (flags.annot !== wantAnnot) problems.push('annotations ' + flags.annot);
    if (flags.inplot !== wantInplot) problems.push('inplot legend ' + flags.inplot);
    if (flags.trend !== (o.value === 'BeerLambert_Calibration.xlsx')) problems.push('trendline ' + flags.trend);
    if (flags.labels) problems.push('data labels on');
    if (/مسیر رفت/.test(app.svg()) !== wantHyst) problems.push('forward/return legend mismatch');

    const wantSort = o.value !== 'QCM_Hysteresis.xlsx';
    if (window.eval('state.data.sortByX') !== wantSort) problems.push('sortByX not applied');
    if ($('chkSortByX').checked !== wantSort) problems.push('chkSortByX not synced');
    if (window.eval('state.data.smoothing') !== 'straight' || window.eval('state.data.yTransform') !== 'none') {
      problems.push('data shaping not reset');
    }
    const wantErr = o.value === 'BeerLambert_Calibration.xlsx';
    if (window.eval('state.data.showErrorBars') !== wantErr) problems.push('showErrorBars ' + wantErr);
    if ($('chkErrorBars').checked !== wantErr) problems.push('chkErrorBars not synced');
    if (wantErr) {
      // The SD column must actually reach the canvas
      const lines = () => window.eval("(document.getElementById('scatterPlotSvg').innerHTML.match(/<line /g) || []).length");
      const lineOn = lines();
      window.eval('state.data.showErrorBars = false; renderChart();');
      const lineOff = lines();
      window.eval('state.data.showErrorBars = true; renderChart();');
      if (!(lineOn > lineOff)) problems.push(`error bars not drawn (${lineOn} vs ${lineOff})`);
    }

    // Captions: every sample arrives presentation-ready, no stale labels
    const ui = JSON.parse(window.eval(`JSON.stringify({
      xTitle: state.xTitle, yTitle: state.yTitle, title: state.chartTitle, sub: state.chartSubtitle,
      inputTitle: document.getElementById('inputChartTitle').value,
      shownTitle: document.getElementById('displayChartTitle').textContent,
      axisTitles: Array.from(document.querySelectorAll('#scatterPlotSvg text')).map(t => t.textContent)
    })`));
    if (!ui.xTitle || !ui.yTitle) problems.push('empty axis titles');
    if (ui.xTitle === 'RH (%)' || ui.yTitle === 'Δf (Hz)') problems.push('stale axis title ' + ui.xTitle + ' / ' + ui.yTitle);
    if (!ui.title || !ui.sub) problems.push('empty caption');
    if (/نمودار اسکتر پلات تحلیلی|Analytical Scatter/.test(ui.title)) problems.push('generic title kept: ' + ui.title);
    if (!/[؀-ۿ]/.test(ui.title)) problems.push('fa mode title is not persian: ' + ui.title);
    if (ui.inputTitle !== ui.title || ui.shownTitle !== ui.title) problems.push('title inputs not synced');
    if (!ui.axisTitles.includes(ui.xTitle)) problems.push('x title not drawn: ' + ui.xTitle);
    if (!ui.axisTitles.includes(ui.yTitle)) problems.push('y title not drawn: ' + ui.yTitle);

    if (app.badAttrs() !== 0) problems.push('broken svg attributes: ' + app.badAttrs());

    if (problems.length) failMsg(o.value, problems.join(' ; '));
    else console.log('OK  ', o.value.padEnd(30), `pts=${after.xValues.length} series=${after.series.length} logX=${logX} svg=${screenshot} | ${toast}`);
  }
  if (!app.requested.every(u => u.startsWith('samples/'))) failMsg('fetch path', app.requested.join(','));

  // 3. Language switch: the same option reports its English label and English captions.
  window.eval('setLanguagePreset("en");');
  await pick('Solar_Cell_IV.xlsx');
  const enToast = $('toastMsg').textContent;
  if (!/Solar cell I–V curve/.test(enToast)) failMsg('english toast', enToast);
  else console.log('OK   english label toast:', enToast);
  const enUi = JSON.parse(window.eval(`JSON.stringify({title: state.chartTitle, sub: state.chartSubtitle, x: state.xTitle, y: state.yTitle, drawn: document.getElementById('displayChartTitle').textContent})`));
  if (/[؀-ۿ]/.test(enUi.title + enUi.sub + enUi.x + enUi.y)) failMsg('english captions', JSON.stringify(enUi));
  else if (enUi.title !== enUi.drawn) failMsg('english title not drawn', JSON.stringify(enUi));
  else console.log('OK   english captions:', [enUi.title, enUi.x, enUi.y].join(' | '));
  window.eval('setLanguagePreset("fa");');

  // 4. Failure path: a 404 must not silently wipe the current dataset.
  const keep = state();
  window.fetch = () => Promise.resolve({ ok: false, status: 404, arrayBuffer: () => Promise.resolve(new window.ArrayBuffer(0)) });
  await pick('QCM_Hysteresis.xlsx');
  if (JSON.stringify(state().series) !== JSON.stringify(keep.series)) failMsg('404 path', 'dataset was modified');
  else console.log('OK   404 keeps the current dataset |', $('toastMsg').textContent);

  // 5. Offline / file:// (fetch rejects entirely).
  window.fetch = () => Promise.reject(new Error('Failed to fetch'));
  await pick('UVVis_Spectra.xlsx');
  if (!/بارگذاری نمونه ناموفق/.test($('toastMsg').textContent)) failMsg('offline message', $('toastMsg').textContent);
  else console.log('OK   fetch failure message |', $('toastMsg').textContent);

  // 6. Page reload with the settings the app persisted. The in-plot legend lives in
  // state.callouts, so a blob saved next to a different dataset used to restore it
  // with no coordinates and paint the figure at NaN.
  window.fetch = app.realFetch;
  await pick('BeerLambert_Calibration.xlsx'); // in-plot legend + annotations on
  if (window.eval('state.showInplotLegend') !== true) failMsg('reload setup', 'Beer sample did not enable the in-plot legend');
  const saved = window.eval('JSON.stringify(serializeSettings())');
  const savedObj = JSON.parse(saved);
  const savedX = savedObj.callouts.inplotX;
  if (!isFinite(savedX) || !isFinite(savedObj.callouts.inplotY)) {
    failMsg('legend position kept on import', 'callouts=' + JSON.stringify(savedObj.callouts));
  } else {
    console.log('OK   legend position kept on import |', JSON.stringify({ inplotX: savedObj.callouts.inplotX, inplotY: savedObj.callouts.inplotY }));
  }
  // Legacy blob: written by a build that dropped the in-plot coordinates entirely
  delete savedObj.callouts.inplotX;
  delete savedObj.callouts.inplotY;
  const reloaded = bootApp(JSON.stringify(savedObj));
  const bad = reloaded.badAttrs();
  const relSvg = reloaded.svg();
  const inplot = reloaded.window.eval('JSON.stringify({x: state.callouts.inplotX, y: state.callouts.inplotY, flag: state.showInplotLegend, legend: document.querySelector(".draggable-badge[data-badge=\'inplot\']") !== null})');
  const legendInfo = JSON.parse(inplot);
  if (bad !== 0) failMsg('reload with legacy settings', bad + ' broken svg attributes');
  else if (!legendInfo.legend) failMsg('reload with legacy settings', 'in-plot legend missing: ' + inplot);
  else if (relSvg.length < 3000) failMsg('reload with legacy settings', 'svg too small');
  else console.log('OK   reload with legacy settings renders clean |', inplot);
  // And the current blob must survive a reload as well
  const reloaded2 = bootApp(saved);
  const kept = JSON.parse(reloaded2.window.eval('JSON.stringify(state.callouts)'));
  if (reloaded2.badAttrs() !== 0) failMsg('reload with current settings', reloaded2.badAttrs() + ' broken svg attributes');
  else if (kept.inplotX !== savedX) failMsg('reload with current settings', 'legend x ' + kept.inplotX + ' != ' + savedX);
  else console.log('OK   reload with current settings keeps legend x =', kept.inplotX);

  console.log('window errors:', app.errors.length ? app.errors.join(' ; ') : 0);
  if (app.errors.length) fail++;
  console.log(fail ? `\n${fail} FAILED` : '\nALL SAMPLE-LOADER TESTS PASSED');
  process.exit(fail ? 1 : 0);
})();
