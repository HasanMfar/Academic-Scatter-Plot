// End-to-end: feed each samples/*.xlsx through the app's real importExcelFile()
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const XLSX = require('../node_modules/xlsx');

const root = path.resolve(__dirname, '..');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace(/<script[\s\S]*?<\/script>/g, '');

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/' });
const { window } = dom;
const { document } = window;
const errors = [];
window.addEventListener('error', e => errors.push(e.message));

const appSrc = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
window.XLSX = XLSX; // the app guards on `typeof XLSX !== 'undefined'`
window.alert = m => { throw new Error('alert: ' + m); };
const s = document.createElement('script');
s.textContent = appSrc;
document.body.appendChild(s);
document.dispatchEvent(new window.Event('DOMContentLoaded'));

function importFile(file) {
  const buf = fs.readFileSync(path.join(root, 'samples', file));
  class FR {
    readAsArrayBuffer() {
      this.result = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
      this.onload({ target: { result: this.result } });
    }
  }
  window.FileReader = FR;
  window.eval('importExcelFile')({ target: { files: [{ name: file }] } });
}

const files = fs.readdirSync(path.join(root, 'samples')).filter(f => f.endsWith('.xlsx'));
let fail = 0;
for (const f of files) {
  try {
    importFile(f);
    const info = JSON.parse(window.eval('JSON.stringify({n: dataset.xValues.length, s: dataset.series.length, names: dataset.series.map(x=>x.nameEn), err: dataset.series.filter(x=>x.errValues).length, x:[state.axis.xMin,state.axis.xMax,state.axis.xStep], y:[state.axis.yMin,state.axis.yMax,state.axis.yStep], svg: document.getElementById("scatterPlotSvg").innerHTML.length})'));
    const bad = info.n === 0 || info.s === 0 || info.svg < 2000 || info.x[1] <= info.x[0] || info.y[1] <= info.y[0]
      || info.names.includes('Polymer A (Mock)'); // import never replaced the default dataset
    if (bad) fail++;
    console.log((bad ? 'FAIL' : 'OK  '), f.padEnd(30), `pts=${info.n} series=${info.s} errCols=${info.err} svg=${info.svg}`);
    console.log('      names:', info.names.join(' | '), '| x', info.x.join('..') , 'step', info.x[2], '| y', info.y.join('..'), 'step', info.y[2]);
  } catch (e) {
    fail++;
    console.log('FAIL', f, '::', e.message);
  }
}
console.log(errors.length ? 'window errors: ' + errors.join(' ; ') : 'window errors: 0');
console.log(fail ? `${fail} FAILED` : 'ALL IMPORTS OK');
process.exit(fail ? 1 : 0);
