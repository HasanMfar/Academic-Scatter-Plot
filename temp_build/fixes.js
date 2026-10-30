const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const xlsx = fs.readFileSync(path.join(root, 'xlsx.full.min.js'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');

const errors = [];
const dom = new JSDOM(html, { runScripts: "dangerously", virtualConsole: new jsdom.VirtualConsole() });

// Expose variables needed for testing
const script = dom.window.document.createElement('script');
script.textContent = `
  window.dataset = { xValues: [], series: [] };
  window.state = {};
` + xlsx + "\n" + app;
dom.window.document.body.appendChild(script);

dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

const window = dom.window;
const document = window.document;
const $ = id => document.getElementById(id);

function step(name, fn) {
  try { fn(); console.log('OK   - ' + name); }
  catch (e) { console.error('FAIL - ' + name + '\n       ' + e.message); errors.push(e); }
}

window.eval(`
  // Helper to init dataset
  dataset.xValues = [1, 2, 3];
  dataset.series = [{
    id: "s1", nameEn: "S1", nameFa: "S1",
    colorDark: "#f00", colorLight: "#f00", marker: "circle",
    yValues: [10, 20, 30], errValues: [1, 2, 3], visible: true
  }];
  state.data.showErrorBars = true;
  renderDataTable(); // VERY IMPORTANT: generate table inputs so syncInputsToDataset doesn't wipe our mocked dataset
  renderChart();
`);

step('Bug 1: Align error bars when deleting/adding a data row', () => {
  window.eval('deleteRow(1);');
  const d = JSON.parse(window.eval('JSON.stringify(dataset)'));
  if (d.xValues.length !== 2) throw new Error("Row not deleted. Length is " + d.xValues.length);
  if (d.series[0].yValues.length !== 2) throw new Error("yValues not deleted");
  if (d.series[0].errValues.length !== 2) throw new Error("errValues not deleted");
  if (d.series[0].errValues[1] !== 3) throw new Error("Wrong errValue deleted");

  window.eval('addRow();');
  const d2 = JSON.parse(window.eval('JSON.stringify(dataset)'));
  if (d2.xValues.length !== 3) throw new Error("Row not added");
  if (d2.series[0].yValues.length !== 3) throw new Error("yValues not added");
  if (d2.series[0].errValues.length !== 3) throw new Error("errValues not added");
  if (d2.series[0].errValues[2] !== 0) throw new Error("errValue not initialized to 0");
});

step('Bug 2: Power-fit curve produces invalid coordinates for nonpositive X/Y values', () => {
  window.eval(`
    dataset.xValues = [-1, 0, 1, 2, 3];
    dataset.series[0].yValues = [-10, 0, 10, 20, 30];
    state.fitModel = "power";
    renderChart();
  `);
  const svg = $('scatterPlotSvg').innerHTML;
  if (svg.includes('NaN')) throw new Error("NaN in SVG");
  if (svg.includes('Infinity') || svg.includes('-Infinity')) throw new Error("Infinity in SVG");
});

step('Bug 3: LaTeX export breaks with default X-axis label due to % character', () => {
  window.eval(`
    state.xTitle = "RH (%) & $ \\\\ # _ { } ~ ^";
    state.chartTitle = "Cap & %";
    dataset.series[0].nameEn = "S1 %";
    state.lang = "en";
  `);
  let clipboardText = "";
  // Mock clipboard
  Object.assign(window.navigator, {
    clipboard: {
      writeText: (text) => {
        clipboardText = text;
        return Promise.resolve();
      }
    }
  });
  window.eval(`
    const btn = document.getElementById("copyLatexBtn");
    const e = new window.Event("click");
    btn.dispatchEvent(e);
  `);
  if (!clipboardText) throw new Error("Clipboard empty or writeText not called");
  if (clipboardText.includes("RH (%)")) throw new Error("Escaping missed % in xTitle");
  if (!clipboardText.includes("RH (\\%)")) throw new Error("Escaping failed to escape %");
  if (!clipboardText.includes("\\&")) throw new Error("Escaping failed to escape &");
  if (!clipboardText.includes("Cap \\& \\%")) throw new Error("Escaping failed on chartTitle");
  if (!clipboardText.includes("S1 \\%")) throw new Error("Escaping failed on series nameEn");
});

step('Bug 4: Settings serialization omits active options', () => {
  window.eval(`
    state.fitModel = "exponential";
    state.showFitEquation = false;
    state.colorPalette = "clinical";
    state.peaks = { enabled: true };
    state.crosshair = { enabled: true };
  `);
  const s = JSON.parse(window.eval('JSON.stringify(serializeSettings())'));
  if (s.fitModel !== "exponential") throw new Error("fitModel missing");
  if (s.showFitEquation !== false) throw new Error("showFitEquation missing");
  if (s.colorPalette !== "clinical") throw new Error("colorPalette missing");
  if (!s.peaks || !s.peaks.enabled) throw new Error("peaks missing");
  if (!s.crosshair || !s.crosshair.enabled) throw new Error("crosshair missing");
});

console.log('\n--- errors:', errors.length);
if (errors.length) {
  process.exit(1);
}
console.log('ALL FIXES TESTS PASSED');
