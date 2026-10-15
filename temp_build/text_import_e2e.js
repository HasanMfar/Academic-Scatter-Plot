// End-to-end: import comma / tab / semicolon / pipe / space separated text files
// through the app's real importExcelFile(), plus encodings and edge cases.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { JSDOM } = require('jsdom');
const XLSX = require('../node_modules/xlsx');
const { TextDecoder } = require('util');

const root = path.resolve(__dirname, '..');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scatter-text-'));

let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const acceptAttr = (html.match(/id="excelImportInput"[^>]*accept="([^"]*)"/) || [])[1] || '';
html = html.replace(/<script[\s\S]*?<\/script>/g, '');

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/' });
const { window } = dom;
const { document } = window;
const errors = [];
window.addEventListener('error', e => errors.push(e.message));

const appSrc = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
window.TextDecoder = TextDecoder; // jsdom does not expose it
window.XLSX = XLSX;
window.alert = m => { throw new Error('alert: ' + m); };
const script = document.createElement('script');
script.textContent = appSrc;
document.body.appendChild(script);
document.dispatchEvent(new window.Event('DOMContentLoaded'));

let fail = 0;
const failMsg = (name, msg) => { fail++; console.log('FAIL', name, '::', msg); };

function write(name, bytes) {
  const p = path.join(dir, name);
  fs.writeFileSync(p, bytes);
  return { name, path: p, buffer: fs.readFileSync(p) };
}

// Feed a file through the picker exactly like the <input type=file> would
function importThrough(file) {
  class FR {
    readAsArrayBuffer() {
      const b = file.buffer;
      this.result = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
      this.onload({ target: { result: this.result } });
    }
  }
  window.FileReader = FR;
  window.eval('importExcelFile')({ target: { files: [{ name: file.name }], value: '' } });
}

const ROWS = [
  ['RH (%)', 'Nano', 'Nano SD', 'Starch'],
  [20, -10, 1.5, -15],
  [40, -45, 1.8, -60],
  [60, -95, 2.1, -120],
  [80, -150, 2.5, -190]
];
// Whitespace separated files cannot carry multi-word headers ("Nano SD" splits into
// two fields), so the error column is named with the bare "err" keyword instead.
const WS_ROWS = [
  ['RH_PCT', 'Nano', 'err', 'Starch'],
  [20, -10, 1.5, -15],
  [40, -45, 1.8, -60],
  [60, -95, 2.1, -120],
  [80, -150, 2.5, -190]
];
const json = (rows) => rows.map(r => r.join(',')).join('\n');
const tsv = (rows) => rows.map(r => r.join('\t')).join('\n');
const semi = (rows) => rows.map(r => r.join(';')).join('\n');
const pipe = (rows) => rows.map(r => r.join('|')).join('\n');
const space = (rows) => rows.map(r => r.join(' ')).join('\n');
const aligned = (rows) => rows.map(r => r.map(c => String(c).padStart(10)).join('')).join('\n');

const fixtures = [
  ['comma.csv', write('comma.csv', Buffer.from(json(ROWS))), { names: ['Nano', 'Starch'], points: 4, err: 4, first: -10 }],
  ['comma+spaces.csv', write('comma_spaces.csv', Buffer.from(ROWS.map(r => r.join(', ')).join('\n'))), { names: ['Nano', 'Starch'], points: 4, err: 4, first: -10 }],
  ['semicolon.csv', write('semicolon.csv', Buffer.from(semi(ROWS))), { names: ['Nano', 'Starch'], points: 4, err: 4, first: -10 }],
  ['tab.tsv', write('tab.tsv', Buffer.from(tsv(ROWS))), { names: ['Nano', 'Starch'], points: 4, err: 4, first: -10 }],
  ['pipe.txt', write('pipe.txt', Buffer.from(pipe(ROWS))), { names: ['Nano', 'Starch'], points: 4, err: 4, first: -10 }],
  ['quoted-header.csv', write('quoted.csv', Buffer.from('"RH (%), T","Nano, A","Nano, A SD",Starch\n20,-10,1.5,-15\n40,-45,1.8,-60\n60,-95,2.1,-120\n80,-150,2.5,-190')), { names: ['Nano, A', 'Starch'], points: 4, err: 4, first: -10 }],
  ['space-single.txt', write('space_single.txt', Buffer.from(space(WS_ROWS))), { names: ['Nano', 'Starch'], points: 4, err: 4, first: -10 }],
  ['space-aligned.txt', write('space_aligned.txt', Buffer.from(aligned(WS_ROWS))), { names: ['Nano', 'Starch'], points: 4, err: 4, first: -10 }],
  ['windows-crlf.txt', write('crlf.txt', Buffer.from(space(WS_ROWS).replace(/\n/g, '\r\n'))), { names: ['Nano', 'Starch'], points: 4, err: 4, first: -10 }],
  ['utf8-bom.csv', write('bom.csv', Buffer.concat([Buffer.from([0xEF, 0xBB, 0xBF]), Buffer.from(json(ROWS))])), { names: ['Nano', 'Starch'], points: 4, err: 4, first: -10 }],
  ['utf16le.txt', write('utf16le.txt', Buffer.concat([Buffer.from([0xFF, 0xFE]), Buffer.from(space(WS_ROWS).replace(/\n/g, '\r\n'), 'utf16le')])), { names: ['Nano', 'Starch'], points: 4, err: 4, first: -10 }],
  ['cp1252.txt', write('cp1252.txt', Buffer.from('X,S1\u00b0,S2\n1,2,3\n2,3,4\n3,4,5', 'latin1')), { names: ['S1\u00b0', 'S2'], points: 3, err: 0, first: 2 }],
  ['comments.txt', write('comments.txt', Buffer.from('# instrument export v2\n# operator: lab\n' + space(WS_ROWS))), { names: ['Nano', 'Starch'], points: 4, err: 4, first: -10 }]
];

function svgBadAttrs() {
  return window.eval(`(function(){
    let n = 0;
    document.getElementById('scatterPlotSvg').querySelectorAll('*').forEach(el => {
      for (const a of el.attributes) if (/NaN|undefined/.test(a.value)) n++;
    });
    return n;
  })()`);
}

console.log('accept attribute:', acceptAttr);
if (!/txt/.test(acceptAttr) || !/tsv/.test(acceptAttr) || !/csv/.test(acceptAttr)) {
  failMsg('accept attribute', acceptAttr);
}

for (const [label, file, want] of fixtures) {
  try {
    importThrough(file);
    const info = JSON.parse(window.eval(`JSON.stringify({
      points: dataset.xValues.length,
      series: dataset.series.map(s => ({ name: s.nameEn, n: s.yValues.length, err: s.errValues ? s.errValues.length : 0 })),
      first: dataset.series[0].yValues[0],
      svg: document.getElementById('scatterPlotSvg').innerHTML.length,
      toast: document.getElementById('toastMsg').textContent
    })`));
    const problems = [];
    const names = info.series.map(s => s.name);
    if (info.points !== want.points) problems.push(`points ${info.points} != ${want.points}`);
    if (JSON.stringify(names) !== JSON.stringify(want.names)) problems.push('names ' + JSON.stringify(names));
    if (info.series.some(s => s.n !== want.points)) problems.push('series length mismatch');
    if (info.series[0].err !== want.err) problems.push('err column ' + info.series[0].err);
    if (info.first !== want.first) problems.push('first y ' + info.first);
    if (info.svg < 3000) problems.push('svg too small ' + info.svg);
    if (svgBadAttrs() !== 0) problems.push('broken svg attributes');
    if (!/بارگذاری شد|نقطه/.test(info.toast)) problems.push('toast: ' + info.toast);
    if (problems.length) failMsg(label, problems.join(' ; '));
    else console.log('OK  ', label.padEnd(19), `pts=${info.points} series=${names.join('/')} errCol=${info.series[0].err} svg=${info.svg}`);
  } catch (e) {
    failMsg(label, (e && e.stack) || String(e));
  }
}

// A whitespace file whose header holds multi-word names must not invent columns:
// the unusable header is dropped and the file is read headerless (4 data columns -> 3 series).
try {
  const file = write('wordy-header.txt', Buffer.from('RH (%) NANO STARCH\n20 -10 -15 -20\n40 -45 -60 -70\n60 -95 -120 -130'));
  importThrough(file);
  const info = JSON.parse(window.eval(`JSON.stringify({points: dataset.xValues.length, series: dataset.series.length, names: dataset.series.map(s => s.nameEn)})`));
  if (info.points !== 3) failMsg('wordy header', 'points ' + info.points);
  else if (info.series !== 3) failMsg('wordy header', 'phantom series: ' + info.series + ' ' + JSON.stringify(info.names));
  else console.log('OK   wordy-header.txt    points=3 series=3 (unusable header dropped, no phantom columns)');
} catch (e) {
  failMsg('wordy header', (e && e.stack) || String(e));
}

// Instrument export with metadata preamble lines (e.g. CV potentiostat format)
try {
  const cvSample = 'Title:\nNote:\nTech: CV\nE1(v)=0.000\nE2(v)=2.000\nPotential /V  Current /uA\n0.000  -1608.3\n0.001  -1571.7\n0.002  -1544.2\n0.003  -1519.8';
  const file = write('instrument-preamble.txt', Buffer.from(cvSample));
  importThrough(file);
  const info = JSON.parse(window.eval(`JSON.stringify({points: dataset.xValues.length, series: dataset.series.length, name: dataset.series[0].nameEn, xTitle: state.xTitle, yTitle: state.yTitle})`));
  if (info.points !== 4) failMsg('instrument preamble', 'points ' + info.points);
  else if (info.series !== 1) failMsg('instrument preamble', 'series: ' + info.series);
  else if (info.name !== 'Current /uA') failMsg('instrument preamble', 'series name: ' + info.name);
  else console.log('OK   instrument-preamble.txt points=4 series=1 name=' + info.name + ' xTitle=' + info.xTitle);
} catch (e) {
  failMsg('instrument preamble', (e && e.stack) || String(e));
}

// Garbage / data-free text must report an error instead of clearing the figure

// Drag & drop a .txt file onto the window
try {
  const file = write('dropped.txt', Buffer.from(json(ROWS)));
  class FR {
    readAsArrayBuffer() {
      const b = fs.readFileSync(file.path);
      this.result = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
      this.onload({ target: { result: this.result } });
    }
  }
  window.FileReader = FR;
  const ev = new window.Event('drop');
  ev.dataTransfer = { files: [{ name: 'dropped.txt' }] };
  window.dispatchEvent(ev);
  const info = JSON.parse(window.eval(`JSON.stringify({points: dataset.xValues.length, series: dataset.series.map(s => s.nameEn)})`));
  if (info.points !== 4) failMsg('drag & drop txt', JSON.stringify(info));
  else console.log('OK   drag & drop .txt     points=' + info.points + ' series=' + info.series.join('/'));
} catch (e) {
  failMsg('drag & drop txt', (e && e.stack) || String(e));
}

try {
  const keep = window.eval('dataset.xValues.length');
  const file = write('empty.txt', Buffer.from('\n\n# only comments\n'));
  importThrough(file);
  const after = window.eval('dataset.xValues.length');
  const toast = document.getElementById('toastMsg').textContent;
  if (after !== keep) failMsg('empty text file', 'dataset was replaced');
  else console.log('OK   empty text file      kept ' + after + ' points |', toast);
} catch (e) {
  console.log('OK   empty text file      threw and was caught |', e.message);
}

fs.rmSync(dir, { recursive: true, force: true });
console.log('window errors:', errors.length ? errors.join(' ; ') : 0);
if (errors.length) fail++;
console.log(fail ? `\n${fail} FAILED` : '\nALL TEXT-IMPORT TESTS PASSED');
process.exit(fail ? 1 : 0);
