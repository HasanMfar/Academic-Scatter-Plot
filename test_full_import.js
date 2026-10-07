const fs = require('fs');
const XLSX = require('xlsx');

const fileBuf = fs.readFileSync('F:\\Uni\\Uni\\PLOT\\Clean_Hysteresis_Data.xlsx');
// mock FileReader
global.FileReader = class {
  readAsArrayBuffer(f) {
    this.result = fileBuf;
    this.onload({ target: { result: this.result } });
  }
};

global.XLSX = XLSX;
let toastMsg = "";
global.showToast = msg => { toastMsg = msg; console.log("TOAST:", msg); };
global.console.error = msg => { console.log("ERROR:", msg); };
global.document = {
  getElementById: id => ({ checked: false, value: '' })
};

const dataset = { xValues: [], series: [] };
const state = { callouts: {}, axis: {} };

function parseSmartExcel(rawRows) {
  if (!rawRows || !rawRows.length) throw new Error("فایل اکسل خالی است");
  
  const rows = rawRows.filter(r => r && r.length && r.some(c => c !== "" && c != null));
  if (!rows.length) throw new Error("هیچ داده‌ای در فایل یافت نشد");
  
  const r0 = rows[0];
  
  if (r0.length >= 7) {
    const r0Nums = r0.map(v => parseFloat(v));
    const isLabFormat = (r0Nums[1] > 1000 || r0Nums[2] > 1000 || r0Nums[5] > 1000) && (Math.abs(r0Nums[3]) < 500);
    if (isLabFormat) {
      if (rows.length <= 8) {
        const fwdX = [], bwdX = [];
        const s1Fwd = [], s1Bwd = [];
        const s2Fwd = [], s2Bwd = [];

        rows.forEach(r => {
          const rh = parseFloat(r[0]);
          if (isNaN(rh)) return;
          fwdX.push(rh);
          bwdX.unshift(rh);
          s1Fwd.push(parseFloat(r[7] ?? r[5] ?? 0) || 0);
          s1Bwd.unshift(parseFloat(r[8] ?? r[7] ?? 0) || 0);
          s2Fwd.push(parseFloat(r[3]) || 0);
          s2Bwd.unshift(parseFloat(r[4] ?? r[3]) || 0);
        });

        return {
          xValues: fwdX.concat(bwdX),
          series: [
            { nameFa: "نمونه ۱", nameEn: "Sample 1", yValues: s1Fwd.concat(s1Bwd) },
            { nameFa: "نمونه ۲", nameEn: "Sample 2", yValues: s2Fwd.concat(s2Bwd) }
          ]
        };
      } else {
        const fullX = [], fullS1 = [], fullS2 = [];
        rows.forEach(r => {
          const rh = parseFloat(r[0]);
          if (isNaN(rh)) return;
          fullX.push(rh);
          fullS2.push(parseFloat(r[3]) || 0);
          fullS1.push(parseFloat(r[7] ?? r[4] ?? 0) || 0);
        });
        return {
          xValues: fullX,
          series: [
            { nameFa: "نمونه ۱", nameEn: "Sample 1", yValues: fullS1 },
            { nameFa: "نمونه ۲", nameEn: "Sample 2", yValues: fullS2 }
          ]
        };
      }
    }
  }

  const isHeaderRow = isNaN(parseFloat(r0[0])) || 
    (typeof r0[1] === "string" && isNaN(parseFloat(r0[1])));

  let headers = [];
  let dataRows = [];

  if (isHeaderRow) {
    headers = r0.map((h, i) => (h ? String(h).trim() : (i === 0 ? "RH (%)" : `نمونه ${i}`)));
    dataRows = rows.slice(1);
  } else {
    headers = ["RH (%)"];
    for (let i = 1; i < r0.length; i++) {
      headers.push(`نمونه ${i}`);
    }
    dataRows = rows;
  }

  const series = [];
  for (let i = 1; i < headers.length; i++) {
    const colName = headers[i];
    series.push({
      nameFa: colName,
      nameEn: colName,
      yValues: []
    });
  }

  const xValues = [];
  dataRows.forEach(r => {
    const x = parseFloat(r[0]);
    if (isNaN(x)) return;
    xValues.push(x);
    series.forEach((s, idx) => {
      const y = parseFloat(r[idx + 1]);
      s.yValues.push(isNaN(y) ? 0 : y);
    });
  });

  return { xValues, series };
}

function getNiceStep(span, targetTicks = 5) { return 1; }
function autoScaleAxis() { }
function setupSeriesCheckboxes() {}
function setupCalloutsControls() {}
function renderDataTable() {}
function renderChart() {}
function renderLegend() {}

function importExcelFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (typeof XLSX === "undefined") {
    showToast("کتابخانه SheetJS بارگذاری نشده است. لطفاً صفحه را رفرش کنید.");
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, {type: "array"});
      const ws = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, {header: 1, defval: 0});
      
      const parsed = parseSmartExcel(rows);
      if (!parsed.xValues || !parsed.xValues.length) {
        showToast("داده معتبری در فایل اکسل یافت نشد!");
        return;
      }

      const colorPalette = [
        { dark: "#10b981", light: "#059669" }
      ];
      const markers = ["circle"];

      const newSeries = parsed.series.map((s, i) => {
        return {
          id: `series_${i + 1}`,
          nameFa: s.nameFa,
          nameEn: s.nameEn,
          yValues: s.yValues,
          visible: true
        };
      });

      dataset.xValues = parsed.xValues;
      dataset.series = newSeries;

      console.log("SUCCESS!");
      console.log(dataset);
    } catch(err) {
      console.error("Excel import error:", err);
      showToast("خطا در بارگذاری اکسل: " + (err.message || "فایل نامعتبر"));
    }
  };
  reader.readAsArrayBuffer(file);
}

importExcelFile({ target: { files: [{}] } });
