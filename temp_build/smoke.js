const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
// strip existing <script> tags: we inject app.js ourselves
html = html.replace(/<script[\s\S]*?<\/script>/g, '');

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'http://localhost/'
});
const { window } = dom;
const { document } = window;

const errors = [];
window.addEventListener('error', e => errors.push('window error: ' + e.message));

function step(name, fn) {
  try {
    fn();
    console.log('OK   -', name);
  } catch (e) {
    errors.push(`${name}: ${e && e.stack ? e.stack : e}`);
    console.log('FAIL -', name, '::', e && e.message);
  }
}

const appSrc = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const script = document.createElement('script');
script.textContent = appSrc;
document.body.appendChild(script);

step('DOMContentLoaded boot', () => {
  document.dispatchEvent(new window.Event('DOMContentLoaded'));
});

const $ = id => document.getElementById(id);

step('svg rendered', () => {
  const svg = $('scatterPlotSvg');
  if (!svg.innerHTML || svg.innerHTML.length < 500) throw new Error('svg empty');
  if (!svg.getAttribute('viewBox')) throw new Error('no viewBox');
});

step('viewBox follows layout', () => {
  const vb = $('scatterPlotSvg').getAttribute('viewBox');
  if (vb !== '0 0 960 560') throw new Error('unexpected default viewBox: ' + vb);
});

step('canvas preset changes viewBox', () => {
  const sel = $('selCanvasPreset');
  sel.value = 'ratio169';
  sel.dispatchEvent(new window.Event('change'));
  const vb = $('scatterPlotSvg').getAttribute('viewBox');
  if (vb !== '0 0 1120 630') throw new Error('viewBox: ' + vb);
});

step('margin slider moves plot origin', () => {
  const el = $('rngMarginLeft');
  el.value = '150';
  el.dispatchEvent(new window.Event('input'));
  const after = window.eval('plotArea.x');
  if (after !== 150) throw new Error('plotArea.x -> ' + after);
});

step('axis origin = zero', () => {
  window.eval('state.layout.axisOrigin = "zero"; renderChart();');
  if (!$('scatterPlotSvg').innerHTML.includes('zoomBandRect')) throw new Error('band rect missing');
});

step('reverse axes render', () => {
  window.eval('state.layout.reverseX = true; state.layout.reverseY = true; renderChart();');
});

step('minor ticks + direction + rotation render', () => {
  window.eval('state.ticks.minor = 2; state.ticks.direction = "both"; state.ticks.xLabelRotate = 45; renderChart();');
});

step('number formatting: thousands + decimals + scientific', () => {
  const out = JSON.parse(window.eval(`
    (function(){
      state.ticks.decimals = 2; state.ticks.thousands = true;
      const a = fmtTick(1234.5);
      state.ticks.decimals = -1; state.ticks.thousands = false; state.ticks.scientific = true;
      const b = fmtTick(0.0000123);
      const c = fmtTick(1000);
      state.ticks.scientific = false;
      return JSON.stringify([a, b, c]);
    })()
  `));
  if (out[0] !== '1,234.50') throw new Error('thousands/decimals: ' + out[0]);
  if (!/×10/.test(out[1])) throw new Error('scientific: ' + out[1]);
  if (out[2] !== '1000') throw new Error('auto fmt changed: ' + out[2]);
});

step('log scale renders', () => {
  window.eval('state.ticks.xLog = true; renderChart();');
  if (!$('scatterPlotSvg').innerHTML.includes('10')) throw new Error('no log labels');
  window.eval('state.ticks.xLog = false; renderChart();');
});

step('font sizes / family applied', () => {
  window.eval('state.type.tickFont = 22; state.type.fontFamily = "Times"; renderChart();');
  const html = $('scatterPlotSvg').innerHTML;
  if (!html.includes('Times New Roman')) throw new Error('family missing');
  if (!html.includes('font-size="22"')) throw new Error('tick font size missing');
  window.eval('state.type.fontFamily = "auto"; state.type.tickFont = 15; renderChart();');
});

step('transparent background', () => {
  window.eval('state.type.transparentBg = true; renderChart();');
  if (!/<rect[^>]*fill="none" rx="4"/.test($('scatterPlotSvg').innerHTML)) throw new Error('bg still opaque');
  window.eval('state.type.transparentBg = false; renderChart();');
});

step('spline smoothing + normalize transform', () => {
  window.eval('state.data.smoothing = "spline"; state.data.yTransform = "normalize"; renderChart();');
  if (!$('scatterPlotSvg').innerHTML.includes(' C ')) throw new Error('no bezier segments');
  window.eval('state.data.smoothing = "straight"; state.data.yTransform = "none"; renderChart();');
});

step('error bars render when errValues present', () => {
  window.eval('dataset.series[0].errValues = dataset.series[0].yValues.map(v => Math.abs(v) * 0.1 + 5); state.data.showErrorBars = true; renderChart();');
  window.eval('state.data.showErrorBars = false; delete dataset.series[0].errValues; renderChart();');
});

step('title inside figure', () => {
  window.eval('state.type.titlePlacement = "inside"; renderChart();');
  const bar = document.querySelector('.chart-title-bar');
  if (bar.style.display !== 'none') throw new Error('title bar still visible');
  window.eval('state.type.titlePlacement = "above"; renderChart();');
  if (bar.style.display === 'none') throw new Error('title bar hidden');
});

step('magnifier default region follows axis range', () => {
  window.eval('state.zoom.enabled = true; state.zoom.x0 = null; state.zoom.x1 = null; state.zoom.y0 = null; state.zoom.y1 = null;');
  const reg = JSON.parse(window.eval('JSON.stringify(getZoomRegion())'));
  const ax = JSON.parse(window.eval('JSON.stringify({xm: state.axis.xMin, xM: state.axis.xMax, ym: state.axis.yMin, yM: state.axis.yMax})'));
  if (reg.x0 !== ax.xm || reg.x1 !== ax.xM || reg.y0 !== ax.ym || reg.y1 !== ax.yM) {
    throw new Error('region ' + JSON.stringify(reg) + ' != axis ' + JSON.stringify(ax));
  }
  window.eval('renderChart();');
  const h = $('scatterPlotSvg').innerHTML;
  if (!h.includes('zoom-inset')) throw new Error('no inset group');
  if (!h.includes('zoomClip')) throw new Error('no clip');
  // full-range region magnifies nothing -> no badge yet
  if (h.includes('×')) throw new Error('unexpected magnification badge at full range');
  window.eval('setZoomRegion(60, 80, -170, -55); renderChart();');
  if (!$('scatterPlotSvg').innerHTML.includes('×')) throw new Error('no magnification badge when zoomed in');
});

step('zoom region box + fit region', () => {
  window.eval('fitZoomToData(); renderChart();');
  const obj = JSON.parse(window.eval('JSON.stringify({x0: state.zoom.x0, x1: state.zoom.x1})'));
  if (!(obj.x1 > obj.x0)) throw new Error('bad region ' + JSON.stringify(obj));
  if (!$('scatterPlotSvg').innerHTML.includes('stroke-dasharray="6,4"')) throw new Error('no region rect');
});

step('zoom inset box sliders', () => {
  window.eval('state.zoom.boxW = 420; state.zoom.boxH = 260; renderChart();');
  if (!$('scatterPlotSvg').innerHTML.includes('zoom-inset')) throw new Error('inset gone');
});

step('journal presets apply', () => {
  ['nature', 'ieee', 'elsevier', 'acs'].forEach(k => window.eval('applyJournalPreset("' + k + '")'));
  if (!$('scatterPlotSvg').innerHTML) throw new Error('empty after presets');
});

step('settings serialize/restore round trip', () => {
  const json = window.eval('JSON.stringify(serializeSettings())');
  window.eval('state.markerSize = 16; state.type.tickFont = 26; state.layout.marginLeft = 5; renderChart();');
  window.eval('applySettings(JSON.parse(' + JSON.stringify(json) + '))');
  const back = JSON.parse(window.eval('JSON.stringify(serializeSettings())'));
  const orig = JSON.parse(json);
  if (JSON.stringify(back.layout) !== JSON.stringify(orig.layout)) throw new Error('layout did not round trip');
  if (JSON.stringify(back.type) !== JSON.stringify(orig.type)) throw new Error('type did not round trip');
  if (JSON.stringify(back.ticks) !== JSON.stringify(orig.ticks)) throw new Error('ticks did not round trip');
});

step('language switch updates new labels', () => {
  window.eval('setLanguagePreset("en");');
  const summaryEn = $('secLayout').querySelector('summary').textContent;
  if (!/Layout/.test(summaryEn)) throw new Error('summary not translated: ' + summaryEn);
  window.eval('setLanguagePreset("fa");');
  const summaryFa = $('secLayout').querySelector('summary').textContent;
  if (!/چیدمان/.test(summaryFa)) throw new Error('summary not persian: ' + summaryFa);
});

step('error column parsing', () => {
  const obj = JSON.parse(window.eval(`
    JSON.stringify(parseSmartExcel([
      ['RH (%)', 'Sample A', 'Sample A err', 'Sample B'],
      [20, 1.5, 0.2, 3],
      [40, 2.5, 0.3, 4]
    ]))
  `));
  if (obj.series.length !== 2) throw new Error('series count ' + obj.series.length);
  if (!obj.series[0].errValues || obj.series[0].errValues[0] !== 0.2) throw new Error('err not attached');
});

step('series names that merely start with an error keyword survive', () => {
  const obj = JSON.parse(window.eval(`
    JSON.stringify(parseSmartExcel([
      ['RH (%)', 'Sensor', 'Sensor SD', 'Sensitivity', '±'],
      [20, 1.5, 0.2, 3, 0.1],
      [40, 2.5, 0.3, 4, 0.2]
    ]))
  `));
  const names = obj.series.map(s => s.nameEn);
  if (JSON.stringify(names) !== JSON.stringify(['Sensor', 'Sensitivity'])) {
    throw new Error('names ' + JSON.stringify(names));
  }
  if (!obj.series[0].errValues || obj.series[0].errValues[0] !== 0.2) throw new Error('SD column lost');
  if (!obj.series[1].errValues || obj.series[1].errValues[0] !== 0.1) throw new Error('± column lost');
});

step('persian error column headers still attach', () => {
  const obj = JSON.parse(window.eval(`
    JSON.stringify(parseSmartExcel([
      ['رطوبت (%)', 'نمونه ۱', 'خطای استاندارد', 'نمونه ۲'],
      [20, 1.5, 0.2, 3],
      [40, 2.5, 0.3, 4]
    ]))
  `));
  const names = obj.series.map(s => s.nameFa);
  if (JSON.stringify(names) !== JSON.stringify(['نمونه ۱', 'نمونه ۲'])) throw new Error('names ' + JSON.stringify(names));
  if (!obj.series[0].errValues || obj.series[0].errValues[0] !== 0.2) throw new Error('persian err column lost');
});

step('per-series controls exist', () => {
  const sels = $('seriesCheckboxesContainer').querySelectorAll('select');
  if (sels.length < 4) throw new Error('expected marker+dash selects per series, got ' + sels.length);
});

step('no runtime errors captured', () => {
  if (errors.length) throw new Error(errors.join('\n'));
});

console.log('\n--- errors:', errors.length);
if (errors.length) {
  errors.forEach(e => console.log(e));
  process.exit(1);
}
console.log('ALL SMOKE TESTS PASSED');
