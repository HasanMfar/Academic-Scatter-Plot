/**
 * Advanced Scientific Scatter Plot Engine
 * Sensor: QCM / Acoustic Sensor Response
 * Data: sample1&2.xlsx
 * X-Axis: RH (%)
 * Y-Axis: Δf (Hz)
 * Features:
 *   - Boxed Journal Frame / Open Frame toggle
 *   - Shaded Error Band between replicates
 *   - Customizable Marker Size & Line Thickness
 *   - Drag & Drop + Slider Callout Positioning
 *   - Direct Clipboard Copy (Paste directly into Word/PowerPoint)
 *   - Ultra-HD 600 DPI / 300 DPI PNG Export & Vector SVG
 *   - Live Editable Data Table & CSV Export
 *   - Full Bilingual Support (FA / EN)
 */

// --- 1. Dataset Definition ---
const dataset = {
  xValues: [20, 40, 60, 80, 100, 100, 80, 60, 40, 20],
  series: [
    {
      id: "series_1",
      nameFa: "پلیمر A (تستی)",
      nameEn: "Polymer A (Mock)",
      group: "series_1",
      colorDark: "#06b6d4",
      colorLight: "#0284c7",
      marker: "circle",
      strokeDash: "",
      yValues: [0, -20, -55, -110, -180, -170, -100, -45, -15, 0],
      visible: true
    },
    {
      id: "series_2",
      nameFa: "هیدروژل B (تستی)",
      nameEn: "Hydrogel B (Mock)",
      group: "series_2",
      colorDark: "#f43f5e",
      colorLight: "#e11d48",
      marker: "square",
      strokeDash: "",
      yValues: [0, -40, -95, -170, -290, -270, -150, -75, -30, 0],
      visible: true
    }
  ]
};

// --- 2. Application State ---
const state = {
  lang: "fa", // 'fa' or 'en'
  theme: "light", // 'dark' or 'light'
  plotMode: "scatter-line", // 'scatter-line' or 'scatter-only'
  frameStyle: "boxed", // 'boxed' (Nature/ACS 4-sided) or 'open' (L-shape)
  markerSize: 10,
  lineWidth: 2.6,
  showErrorBand: false,
  showAnnotations: true,
  showInplotLegend: false,
  showBottomLegend: false,
  showDataLabels: false,
  showGrid: true,
  showHysteresis: true,
  showTrendlines: false,
  showCalloutBox: true,

  // Axis overrides (null means auto-calculate or default)
  axis: {
    xMin: 20,
    xMax: 100,
    xStep: 10,
    yMin: -450,
    yMax: 50,
    yStep: 50,
    xLabel: "RH (%)",
    yLabel: "Δf (Hz)"
  },

  // Editable titles
  chartTitle: "نمودار اسکتر پلات تحلیلی",
  chartSubtitle: "مسیر رفت و برگشت داده‌ها (Hysteresis Scatter Plot)",
  xTitle: "RH (%)",
  yTitle: "Δf (Hz)",

  // Dynamic Callouts stored per series ID
  callouts: {},
  defaultCallouts: {
    inplotX: 160,
    inplotY: 280
  },

  // --- Layout: WHERE THE PLOT STARTS inside the canvas ---
  layout: {
    width: 960,
    height: 560,
    marginTop: 40,
    marginRight: 60,
    marginBottom: 75,
    marginLeft: 90,
    preset: "standard",
    axisOrigin: "corner", // 'corner' (default) | 'zero' (axes cross at 0) | 'center'
    reverseX: false,
    reverseY: false
  },

  // --- Ticks & number labels ---
  ticks: {
    minor: 0,           // minor subdivisions per major interval (0 = off)
    direction: "out",   // 'out' | 'in' | 'both'
    length: 6,          // tick length in px
    decimals: -1,       // -1 = auto (raw value), else fixed decimals
    thousands: false,   // thousands separators
    scientific: false,  // force 10^n notation for big/small numbers
    xLabelRotate: 0,    // 0 | 45 | 90 (degrees, X labels)
    labelEvery: 1,      // label every Nth major tick
    xLog: false,
    yLog: false
  },

  // --- Typography, background & grid ---
  type: {
    tickFont: 15,
    axisTitleFont: 18,
    legendFont: 11.5,
    dataLabelFont: 10.5,
    fontFamily: "auto",     // 'auto' | 'Arial' | 'Times' | 'Vazirmatn' | 'Courier' | 'Georgia'
    plotBg: "",             // "" = theme default
    transparentBg: false,
    gridStyle: "dashed",    // 'dashed' | 'solid' | 'dotted'
    gridOpacity: 1,
    gridAxis: "both",       // 'both' | 'x' | 'y'
    titlePlacement: "above" // 'above' (HTML bar) | 'inside' (inside SVG) | 'hidden'
  },

  // --- Curve & data shaping ---
  data: {
    smoothing: "straight",  // 'straight' | 'spline'
    yTransform: "none",     // 'none' | 'baseline' | 'normalize' | 'mean'
    sortByX: false,
    showErrorBars: false
  },

  // --- Magnifier inset (academic zoom region) ---
  zoom: {
    enabled: false,
    x0: null, x1: null, y0: null, y1: null, // data units (null = follow axis range)
    boxW: 300, boxH: 190,
    boxX: null, boxY: null,                 // null = default (top-right inside plot)
    showRegionBox: true,
    showTitles: false
  }
};

// Journal presets: one click applies a full publication look
const JOURNAL_PRESETS = {
  nature: {
    labelFa: "Nature", labelEn: "Nature",
    frameStyle: "boxed", plotMode: "scatter-line",
    layout: { width: 900, height: 560, marginTop: 40, marginRight: 70, marginBottom: 78, marginLeft: 92, axisOrigin: "corner" },
    type: { fontFamily: "Arial", tickFont: 15, axisTitleFont: 18, legendFont: 12, dataLabelFont: 10.5, gridStyle: "dashed", gridOpacity: 0.7, titlePlacement: "above", transparentBg: false, plotBg: "" },
    ticks: { direction: "in", length: 5, minor: 0, decimals: -1, xLabelRotate: 0, labelEvery: 1 },
    markerSize: 9, lineWidth: 2.2
  },
  ieee: {
    labelFa: "IEEE", labelEn: "IEEE",
    frameStyle: "boxed", plotMode: "scatter-line",
    layout: { width: 960, height: 540, marginTop: 36, marginRight: 60, marginBottom: 76, marginLeft: 88, axisOrigin: "corner" },
    type: { fontFamily: "Arial", tickFont: 14, axisTitleFont: 17, legendFont: 11.5, dataLabelFont: 10, gridStyle: "solid", gridOpacity: 0.45, titlePlacement: "above", transparentBg: false, plotBg: "" },
    ticks: { direction: "out", length: 6, minor: 1, decimals: -1, xLabelRotate: 0, labelEvery: 1 },
    markerSize: 8, lineWidth: 2.4
  },
  elsevier: {
    labelFa: "Elsevier", labelEn: "Elsevier",
    frameStyle: "open", plotMode: "scatter-line",
    layout: { width: 920, height: 580, marginTop: 44, marginRight: 55, marginBottom: 80, marginLeft: 95, axisOrigin: "corner" },
    type: { fontFamily: "Times", tickFont: 15, axisTitleFont: 18, legendFont: 12, dataLabelFont: 10.5, gridStyle: "none", gridOpacity: 0.5, titlePlacement: "above", transparentBg: false, plotBg: "" },
    ticks: { direction: "out", length: 6, minor: 0, decimals: -1, xLabelRotate: 0, labelEvery: 1 },
    markerSize: 10, lineWidth: 2.6
  },
  acs: {
    labelFa: "ACS", labelEn: "ACS",
    frameStyle: "boxed", plotMode: "scatter-line",
    layout: { width: 880, height: 560, marginTop: 40, marginRight: 64, marginBottom: 78, marginLeft: 90, axisOrigin: "zero" },
    type: { fontFamily: "Arial", tickFont: 14, axisTitleFont: 17, legendFont: 11.5, dataLabelFont: 10, gridStyle: "dotted", gridOpacity: 0.55, titlePlacement: "above", transparentBg: false, plotBg: "" },
    ticks: { direction: "in", length: 4, minor: 2, decimals: -1, xLabelRotate: 0, labelEvery: 1 },
    markerSize: 8, lineWidth: 2.2
  }
};

// --- 3. Language Presets ---
const presets = {
  fa: {
    chartTitle: "نمودار اسکتر پلات تحلیلی",
    chartSubtitle: "مسیر رفت و برگشت داده‌ها (Hysteresis Scatter Plot)",
    xTitle: "RH (%)",
    yTitle: "Δf (Hz)"
  },
  en: {
    chartTitle: "Analytical Scatter Plot",
    chartSubtitle: "Hysteresis Data Cycle",
    xTitle: "RH (%)",
    yTitle: "Δf (Hz)"
  }
};

// --- 4. DOM Elements ---
const svg = document.getElementById("scatterPlotSvg");
const tooltip = document.getElementById("chartTooltip");
const legendContainer = document.getElementById("legendContainer");
const displayChartTitle = document.getElementById("displayChartTitle");
const displayChartSubtitle = document.getElementById("displayChartSubtitle");

// Controls
const langToggleBtn = document.getElementById("langToggleBtn");
const langBtnText = document.getElementById("langBtnText");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeBtnText = document.getElementById("themeBtnText");
const exportPngBtn = document.getElementById("exportPngBtn");
const exportSvgBtn = document.getElementById("exportSvgBtn");
const copyImageBtn = document.getElementById("copyImageBtn");
const exportDpiSelect = document.getElementById("exportDpiSelect");
const appToast = document.getElementById("appToast");
const toastMsg = document.getElementById("toastMsg");

const btnTitleLangFa = document.getElementById("btnTitleLangFa");
const btnTitleLangEn = document.getElementById("btnTitleLangEn");

const btnModeScatterLine = document.getElementById("btnModeScatterLine");
const btnModeScatterOnly = document.getElementById("btnModeScatterOnly");

const btnFrameBoxed = document.getElementById("btnFrameBoxed");
const btnFrameOpen = document.getElementById("btnFrameOpen");

const rngMarkerSize = document.getElementById("rngMarkerSize");
const valMarkerSize = document.getElementById("valMarkerSize");
const rngLineWidth = document.getElementById("rngLineWidth");
const btnExportTemplate = document.getElementById("btnExportTemplate");
const excelImportInput = document.getElementById("excelImportInput");

const chkShowAnnotations = document.getElementById("chkShowAnnotations");
const chkShowErrorBand = document.getElementById("chkShowErrorBand");
const chkShowInplotLegend = document.getElementById("chkShowInplotLegend");
const chkShowBottomLegend = document.getElementById("chkShowBottomLegend");
const chkShowDataLabels = document.getElementById("chkShowDataLabels");
const chkShowGrid = document.getElementById("chkShowGrid");

// Title Inputs
const inputChartTitle = document.getElementById("inputChartTitle");
const inputChartSubtitle = document.getElementById("inputChartSubtitle");
const inputXTitle = document.getElementById("inputXTitle");
const inputYTitle = document.getElementById("inputYTitle");

// Sliders & Containers
const calloutsControlsContainer = document.getElementById("calloutsControlsContainer");
const rngInplotX = document.getElementById("rngInplotX");
const rngInplotY = document.getElementById("rngInplotY");
const valInplotX = document.getElementById("valInplotX");
const valInplotY = document.getElementById("valInplotY");

const grpInplotX = document.getElementById("grpInplotX");
const grpInplotY = document.getElementById("grpInplotY");
const btnResetPositions = document.getElementById("btnResetPositions");

// Table elements
const dataTableBody = document.getElementById("dataTableBody");
const btnApplyTableData = document.getElementById("btnApplyTableData");
const btnAddRow = document.getElementById("btnAddRow");

// --- 5. Coordinate Mapping & Geometry ---
const chartBox = {
  width: 960,
  height: 560,
  marginTop: 40,
  marginRight: 60,
  marginBottom: 75,
  marginLeft: 90
};

const plotArea = {
  x: 90,
  y: 40,
  width: 810,
  height: 445
};

// Recompute the plotting rectangle from state.layout — this is literally
// "where the plot starts" (its left/top offset) and how big it is.
function applyLayoutToGeometry() {
  const L = state.layout;
  chartBox.width = Math.max(360, Math.round(L.width) || 960);
  chartBox.height = Math.max(260, Math.round(L.height) || 560);

  const maxML = Math.max(30, chartBox.width - 120);
  const maxMR = Math.max(20, chartBox.width - 120);
  const maxMT = Math.max(20, chartBox.height - 100);
  const maxMB = Math.max(30, chartBox.height - 100);

  chartBox.marginLeft = Math.min(Math.max(0, L.marginLeft), maxML);
  chartBox.marginRight = Math.min(Math.max(0, L.marginRight), maxMR);
  chartBox.marginTop = Math.min(Math.max(0, L.marginTop), maxMT);
  chartBox.marginBottom = Math.min(Math.max(0, L.marginBottom), maxMB);

  plotArea.x = chartBox.marginLeft;
  plotArea.y = chartBox.marginTop;
  plotArea.width = Math.max(60, chartBox.width - chartBox.marginLeft - chartBox.marginRight);
  plotArea.height = Math.max(60, chartBox.height - chartBox.marginTop - chartBox.marginBottom);

  if (svg) svg.setAttribute("viewBox", `0 0 ${chartBox.width} ${chartBox.height}`);
}

// Effective axis range (guards log-scale inputs into positive territory)
function axisRange(axis) {
  const a = state.axis;
  const log = axis === "x" ? state.ticks.xLog : state.ticks.yLog;
  let min = axis === "x" ? a.xMin : a.yMin;
  let max = axis === "x" ? a.xMax : a.yMax;
  if (!(max > min)) max = min + 1;
  if (log) {
    const lo = min > 0 ? min : Math.max(1e-9, max / 1000);
    const hi = max > lo ? max : lo * 10;
    return { min: lo, max: hi, log: true };
  }
  return { min, max, log: false };
}

// Normalized position of a value along an axis (0..1), honoring log + reversal
function xFrac(val) {
  const r = axisRange("x");
  let t;
  if (r.log) {
    const l0 = Math.log10(r.min), l1 = Math.log10(r.max);
    t = (Math.log10(Math.max(val, r.min)) - l0) / (l1 - l0 || 1);
  } else {
    t = (val - r.min) / (r.max - r.min || 1);
  }
  if (state.layout.reverseX) t = 1 - t;
  return t;
}

function yFrac(val) {
  const r = axisRange("y");
  let t;
  if (r.log) {
    const l0 = Math.log10(r.min), l1 = Math.log10(r.max);
    t = (Math.log10(Math.max(val, r.min)) - l0) / (l1 - l0 || 1);
  } else {
    t = (val - r.min) / (r.max - r.min || 1);
  }
  if (state.layout.reverseY) t = 1 - t;
  return t;
}

function mapX(val) {
  return plotArea.x + xFrac(val) * plotArea.width;
}

function mapY(val) {
  return plotArea.y + (1 - yFrac(val)) * plotArea.height;
}

// Inverse mapping (screen px -> data units), used by the magnifier rubber-band
function unmapX(px) {
  const r = axisRange("x");
  let t = (px - plotArea.x) / (plotArea.width || 1);
  if (state.layout.reverseX) t = 1 - t;
  if (r.log) return Math.pow(10, Math.log10(r.min) + t * (Math.log10(r.max) - Math.log10(r.min)));
  return r.min + t * (r.max - r.min);
}

function unmapY(py) {
  const r = axisRange("y");
  let t = 1 - (py - plotArea.y) / (plotArea.height || 1);
  if (state.layout.reverseY) t = 1 - t;
  if (r.log) return Math.pow(10, Math.log10(r.min) + t * (Math.log10(r.max) - Math.log10(r.min)));
  return r.min + t * (r.max - r.min);
}

// Where the two labelled axes are drawn (corner / through zero / through center)
function computeAxisGeometry() {
  const mode = state.layout.axisOrigin;
  const clampX = v => Math.min(Math.max(v, plotArea.x), plotArea.x + plotArea.width);
  const clampY = v => Math.min(Math.max(v, plotArea.y), plotArea.y + plotArea.height);
  let ax = plotArea.x;
  let ay = plotArea.y + plotArea.height;

  if (mode === "zero") {
    ax = clampX(mapX(0));
    ay = clampY(mapY(0));
  } else if (mode === "center") {
    const rx = axisRange("x");
    const ry = axisRange("y");
    if (state.ticks.xLog) ax = clampX(mapX(Math.sqrt(rx.min * rx.max)));
    else ax = clampX(mapX((rx.min + rx.max) / 2));
    if (state.ticks.yLog) ay = clampY(mapY(Math.sqrt(ry.min * ry.max)));
    else ay = clampY(mapY((ry.min + ry.max) / 2));
  }

  return { x: ax, y: ay, mode };
}

// --- Display transforms (baseline zero / normalize / mean-center) ---
function yTransformStats(s) {
  const vals = (s && s.yValues ? s.yValues : []).filter(v => typeof v === "number" && isFinite(v));
  if (!vals.length) return { offset: 0, scale: 1 };
  const mode = state.data.yTransform;
  if (mode === "baseline") return { offset: vals[0], scale: 1 };
  if (mode === "mean") {
    return { offset: vals.reduce((a, b) => a + b, 0) / vals.length, scale: 1 };
  }
  if (mode === "normalize") {
    const mn = Math.min(...vals);
    const mx = Math.max(...vals);
    const span = Math.abs(mx - mn) || 1;
    return { offset: mn, scale: 100 / span };
  }
  return { offset: 0, scale: 1 };
}

function displayY(s, idx) {
  const t = yTransformStats(s);
  const raw = s && s.yValues ? s.yValues[idx] : 0;
  const v = typeof raw === "number" && isFinite(raw) ? raw : 0;
  return (v - t.offset) * t.scale;
}

// --- Tick generation & number formatting ---
function roundTick(v) {
  return Math.round(v * 1e6) / 1e6;
}

function buildTicks(axis) {
  const r = axisRange(axis);
  const step = Math.max(0.0001, axis === "x" ? state.axis.xStep : state.axis.yStep);
  const ticks = [];
  const minors = [];

  if (r.log) {
    const loE = Math.floor(Math.log10(r.min));
    const hiE = Math.ceil(Math.log10(r.max));
    for (let e = loE; e <= hiE && ticks.length < 300; e++) {
      const p = Math.pow(10, e);
      if (p >= r.min * (1 - 1e-9) && p <= r.max * (1 + 1e-9)) ticks.push(p);
      if (state.ticks.minor > 0) {
        for (let m = 2; m <= 9; m++) {
          const q = p * m;
          if (q > r.min && q < r.max) minors.push(q);
        }
      }
    }
    if (ticks.length < 2) {
      // Small log span: add 2/5 style steps so the axis is not empty
      for (let e = loE; e <= hiE && ticks.length < 300; e++) {
        [2, 3, 5, 7].forEach(m => {
          const q = Math.pow(10, e) * m;
          if (q > r.min && q < r.max && ticks.indexOf(q) === -1) ticks.push(q);
        });
      }
      ticks.sort((a, b) => a - b);
    }
  } else {
    for (let t = r.min, count = 0; t <= r.max + 1e-9 && count < 300; t += step, count++) {
      ticks.push(roundTick(t));
    }
    if (state.ticks.minor > 0) {
      const mstep = step / (state.ticks.minor + 1);
      for (let t = r.min + mstep, count = 0; t < r.max - 1e-9 && count < 2000; t += mstep, count++) {
        minors.push(roundTick(t));
      }
    }
  }

  return { ticks, minors, range: r };
}

const SUPER_MAP = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
function supStr(n) {
  return String(n).split("").map(c => SUPER_MAP[c] || c).join("");
}

function addThousands(str) {
  const neg = str.startsWith("-");
  let body = neg ? str.slice(1) : str;
  const dot = body.indexOf(".");
  let intPart = dot === -1 ? body : body.slice(0, dot);
  const frac = dot === -1 ? "" : body.slice(dot);
  intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (neg ? "-" : "") + intPart + frac;
}

function sciStr(v) {
  const e = Math.floor(Math.log10(Math.abs(v)));
  let mant = v / Math.pow(10, e);
  mant = Math.round(mant * 100) / 100;
  if (Math.abs(mant) >= 10) mant = mant / 10;
  const mstr = String(Math.round(mant * 100) / 100);
  return `${mstr}×10${supStr(e)}`;
}

function fmtTick(v) {
  const T = state.ticks;
  if (typeof v !== "number") return String(v);
  if (T.decimals >= 0) {
    let s = v.toFixed(T.decimals);
    if (s === `-0${T.decimals > 0 ? "." + "0".repeat(T.decimals) : ""}`) s = s.slice(1);
    return T.thousands ? addThousands(s) : s;
  }
  if (T.scientific && v !== 0 && (Math.abs(v) >= 1e4 || Math.abs(v) < 1e-3)) {
    return sciStr(v);
  }
  let s = `${v}`;
  return T.thousands ? addThousands(s) : s;
}

// Tick drawing geometry: gives the start/end offsets of a tick mark
function tickLine(axisPx, side, len) {
  const T = state.ticks;
  if (T.direction === "in") return { from: axisPx, to: axisPx - len * side };
  if (T.direction === "both") return { from: axisPx + len * side, to: axisPx - len * side };
  return { from: axisPx, to: axisPx + len * side };
}

function getMarkerSvg(type, cx, cy, size, fill, stroke) {
  let shapePath = "";
  const r = size / 2;
  switch (type) {
    case "circle":
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke || fill}" stroke-width="2" class="chart-point" />`;
    case "diamond":
      shapePath = `M ${cx} ${cy - r * 1.25} L ${cx + r * 1.1} ${cy} L ${cx} ${cy + r * 1.25} L ${cx - r * 1.1} ${cy} Z`;
      return `<path d="${shapePath}" fill="${fill}" stroke="${stroke || fill}" stroke-width="2" class="chart-point" />`;
    case "square":
      shapePath = `M ${cx - r} ${cy - r} H ${cx + r} V ${cy + r} H ${cx - r} Z`;
      return `<path d="${shapePath}" fill="${fill}" stroke="${stroke || fill}" stroke-width="2" class="chart-point" />`;
    case "triangle":
      shapePath = `M ${cx} ${cy - r * 1.2} L ${cx + r * 1.15} ${cy + r * 0.9} L ${cx - r * 1.15} ${cy + r * 0.9} Z`;
      return `<path d="${shapePath}" fill="${fill}" stroke="${stroke || fill}" stroke-width="2" class="chart-point" />`;
    case "cross":
      return `<path d="M ${cx - r} ${cy - r} L ${cx + r} ${cy + r} M ${cx + r} ${cy - r} L ${cx - r} ${cy + r}" fill="none" stroke="${fill}" stroke-width="${Math.max(2, r * 0.6)}" stroke-linecap="round" class="chart-point" />`;
    case "plus":
      return `<path d="M ${cx - r} ${cy} L ${cx + r} ${cy} M ${cx} ${cy - r} L ${cx} ${cy + r}" fill="none" stroke="${fill}" stroke-width="${Math.max(2, r * 0.6)}" stroke-linecap="round" class="chart-point" />`;
    default:
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" />`;
  }
}

function getBoxArrowPoints(bx, by, bw, bh, tx, ty) {
  const cx = bx + bw / 2;
  const cy = by + bh / 2;
  let sx, sy;

  if (Math.abs(tx - cx) > Math.abs(ty - cy)) {
    if (tx > cx) {
      sx = bx + bw;
      sy = Math.max(by + 8, Math.min(by + bh - 8, cy));
    } else {
      sx = bx;
      sy = Math.max(by + 8, Math.min(by + bh - 8, cy));
    }
  } else {
    if (ty > cy) {
      sx = Math.max(bx + 8, Math.min(bx + bw - 8, cx));
      sy = by + bh;
    } else {
      sx = Math.max(bx + 8, Math.min(bx + bw - 8, cx));
      sy = by;
    }
  }

  const angle = Math.atan2(ty - sy, tx - sx);
  const ex = tx - Math.cos(angle) * 8;
  const ey = ty - Math.sin(angle) * 8;

  return { sx, sy, ex, ey };
}

function getSeriesCallout(s, idx) {
  if (!state.callouts[s.id]) {
    // Default: point at the max-X (turning) point of the series, label up-left of it
    let ptIdx = 0;
    dataset.xValues.forEach((x, i) => { if (x > dataset.xValues[ptIdx]) ptIdx = i; });
    const tx = Math.round(mapX(dataset.xValues[ptIdx] ?? 80));
    const ty = Math.round(mapY(displayY(s, ptIdx)));
    const clampX = v => Math.max(plotArea.x + 10, Math.min(v, plotArea.x + plotArea.width - 180));
    const clampY = v => Math.max(plotArea.y + 10, Math.min(v, plotArea.y + plotArea.height - 40));
    state.callouts[s.id] = {
      x: clampX(tx - 230 - (idx % 2) * 60),
      y: clampY(ty - 90 + (idx % 2) * 40),
      targetX: tx,
      targetY: ty
    };
  }
  return state.callouts[s.id];
}

// --- 6. Render SVG Chart ---
// Font families offered in the Type & Color panel
const FAMILY_MAP = {
  Arial: "Arial, Helvetica, sans-serif",
  Times: "'Times New Roman', Times, serif",
  Vazirmatn: "Vazirmatn, Tahoma, Arial, sans-serif",
  Courier: "'Courier New', Courier, monospace",
  Georgia: "Georgia, 'Times New Roman', serif"
};

function escapeXml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function polylineD(pts) {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}

// Catmull-Rom -> cubic bezier, for the optional "spline" smoothing mode
function buildSmoothPath(pts) {
  if (pts.length < 3) return polylineD(pts);
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function pathFromPoints(pts) {
  return state.data.smoothing === "spline" ? buildSmoothPath(pts) : polylineD(pts);
}

// Nice ticks for an arbitrary (possibly log) range — used by the magnifier inset
function niceTickList(min, max, log, target = 4) {
  const out = [];
  if (log) {
    const loE = Math.floor(Math.log10(Math.max(min, 1e-12)));
    const hiE = Math.ceil(Math.log10(Math.max(max, min * 10)));
    for (let e = loE; e <= hiE && out.length < 60; e++) {
      const p = Math.pow(10, e);
      if (p >= min * (1 - 1e-9) && p <= max * (1 + 1e-9)) out.push(p);
    }
    return out.length ? out : [min, max];
  }
  const step = getNiceStep(Math.max(1e-9, max - min), target);
  const start = Math.ceil(min / step - 1e-9) * step;
  for (let t = start, c = 0; t <= max + 1e-9 && c < 60; t += step, c++) out.push(roundTick(t));
  return out.length ? out : [min, max];
}

// --- Magnifier (zoom inset) geometry ---
function getZoomRegion() {
  const rx = axisRange("x");
  const ry = axisRange("y");
  const z = state.zoom;
  const num = (v, fb) => {
    if (v === null || v === undefined || v === "") return fb;
    const n = Number(v);
    return isFinite(n) ? n : fb;
  };
  let x0 = num(z.x0, rx.min);
  let x1 = num(z.x1, rx.max);
  let y0 = num(z.y0, ry.min);
  let y1 = num(z.y1, ry.max);
  const reg = {
    x0: Math.min(x0, x1), x1: Math.max(x0, x1),
    y0: Math.min(y0, y1), y1: Math.max(y0, y1),
    xLog: rx.log, yLog: ry.log
  };
  if (!(reg.x1 > reg.x0)) reg.x1 = reg.x0 + 1;
  if (!(reg.y1 > reg.y0)) reg.y1 = reg.y0 + 1;
  return reg;
}

function getZoomBox() {
  const z = state.zoom;
  const w = Math.max(120, Math.min(z.boxW, plotArea.width - 8));
  const h = Math.max(80, Math.min(z.boxH, plotArea.height - 8));
  let x = z.boxX;
  let y = z.boxY;
  if (x == null) x = plotArea.x + plotArea.width - w - 16;
  if (y == null) y = plotArea.y + 16;
  x = Math.min(Math.max(x, plotArea.x + 4), plotArea.x + plotArea.width - w - 4);
  y = Math.min(Math.max(y, plotArea.y + 4), plotArea.y + plotArea.height - h - 4);
  return { x, y, w, h };
}

// Region rectangle + connector lines on the main plot
function renderZoomOverlay() {
  const reg = getZoomRegion();
  const box = getZoomBox();
  const accent = state.theme === "dark" ? "#38bdf8" : "#0284c7";
  const rx0 = mapX(reg.x0), rx1 = mapX(reg.x1);
  const ry0 = mapY(reg.y0), ry1 = mapY(reg.y1);
  const x0 = Math.min(rx0, rx1), x1 = Math.max(rx0, rx1);
  const y0 = Math.min(ry0, ry1), y1 = Math.max(ry0, ry1);

  let out = "";
  if (state.zoom.showRegionBox) {
    out += `<rect x="${x0}" y="${y0}" width="${Math.max(1, x1 - x0)}" height="${Math.max(1, y1 - y0)}"
            fill="none" stroke="${accent}" stroke-width="1.4" stroke-dasharray="6,4" opacity="0.9" pointer-events="none" />`;
    out += `<line x1="${x0}" y1="${y0}" x2="${box.x}" y2="${box.y}" stroke="${accent}" stroke-width="1" stroke-dasharray="3,3" opacity="0.5" pointer-events="none" />`;
    out += `<line x1="${x1}" y1="${y1}" x2="${box.x + box.w}" y2="${box.y + box.h}" stroke="${accent}" stroke-width="1" stroke-dasharray="3,3" opacity="0.5" pointer-events="none" />`;
  }
  return out;
}

// The inset figure itself: frame, mini axes, ticks, series, magnification badge
function renderZoomInset(colors, tickFont, uiFont) {
  const reg = getZoomRegion();
  const box = getZoomBox();
  const accent = state.theme === "dark" ? "#38bdf8" : "#0284c7";
  const isDark = state.theme === "dark";
  const showT = state.zoom.showTitles;
  const padL = showT ? 46 : 34;
  const padB = showT ? 30 : 18;
  const padT = 6, padR = 6;
  const ix = box.x + padL;
  const iy = box.y + padT;
  const iw = Math.max(20, box.w - padL - padR);
  const ih = Math.max(20, box.h - padT - padB);

  const zfrac = (v, lo, hi, log) => {
    let t;
    if (log) {
      const l0 = Math.log10(lo), l1 = Math.log10(hi);
      t = (Math.log10(Math.max(v, lo)) - l0) / (l1 - l0 || 1);
    } else {
      t = (v - lo) / (hi - lo || 1);
    }
    return t;
  };
  const zx = v => {
    let t = zfrac(v, reg.x0, reg.x1, reg.xLog);
    if (state.layout.reverseX) t = 1 - t;
    return ix + t * iw;
  };
  const zy = v => {
    let t = zfrac(v, reg.y0, reg.y1, reg.yLog);
    if (state.layout.reverseY) t = 1 - t;
    return iy + (1 - t) * ih;
  };

  const smallFont = Math.max(7, state.type.tickFont - 5);
  const xTicks = niceTickList(reg.x0, reg.x1, reg.xLog, 3);
  const yTicks = niceTickList(reg.y0, reg.y1, reg.yLog, 3);

  let out = `
    <defs>
      <clipPath id="zoomClip"><rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" /></clipPath>
    </defs>
    <g class="zoom-inset" pointer-events="none">
      <rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="4"
            fill="${colors.bg}" stroke="${accent}" stroke-width="1.6" />
      <g clip-path="url(#zoomClip)">
  `;

  // Light grid inside the inset
  yTicks.forEach(t => {
    out += `<line x1="${ix}" y1="${zy(t)}" x2="${ix + iw}" y2="${zy(t)}" stroke="${colors.grid}" stroke-width="1" opacity="0.7" />`;
  });
  xTicks.forEach(t => {
    out += `<line x1="${zx(t)}" y1="${iy}" x2="${zx(t)}" y2="${iy + ih}" stroke="${colors.grid}" stroke-width="1" opacity="0.7" />`;
  });

  // Series inside the inset
  dataset.series.forEach(s => {
    if (!s.visible) return;
    const col = isDark ? s.colorDark : s.colorLight;
    const op = typeof s.opacity === "number" ? Math.max(0.05, Math.min(1, s.opacity)) : 1;
    const xVals = dataset.xValues;
    const n = Math.min(xVals.length, (s.yValues || []).length);
    if (!n) return;
    let order = Array.from({ length: n }, (_, i) => i);
    if (state.data.sortByX) order.sort((a, b) => xVals[a] - xVals[b]);
    const pts = order.map(i => ({ x: zx(xVals[i]), y: zy(displayY(s, i)) }));

    if (state.plotMode === "scatter-line" && pts.length > 1) {
      out += `<path d="${pathFromPoints(pts)}" fill="none" stroke="${col}" stroke-width="${Math.max(1.2, state.lineWidth * 0.8)}"
                stroke-linejoin="round" stroke-linecap="round" ${s.strokeDash ? `stroke-dasharray="${s.strokeDash}"` : ""} opacity="${0.92 * op}" />`;
    }
    const mk = Math.max(3.5, state.markerSize * 0.7);
    for (let i = 0; i < n; i++) {
      out += getMarkerSvg(s.marker, zx(xVals[i]), zy(displayY(s, i)), mk, col, col);
    }
  });

  out += `
      </g>

      <!-- Inset mini-axes -->
      <line x1="${ix}" y1="${iy}" x2="${ix}" y2="${iy + ih}" stroke="${colors.axis}" stroke-width="1.4" />
      <line x1="${ix}" y1="${iy + ih}" x2="${ix + iw}" y2="${iy + ih}" stroke="${colors.axis}" stroke-width="1.4" />
  `;

  xTicks.forEach(t => {
    const px = zx(t);
    out += `<line x1="${px}" y1="${iy + ih}" x2="${px}" y2="${iy + ih + 4}" stroke="${colors.axis}" stroke-width="1.2" />`;
    out += `<text x="${px}" y="${iy + ih + smallFont + 5}" fill="${colors.title}" font-size="${smallFont}"
              font-family="${tickFont}" text-anchor="middle" direction="ltr">${fmtTick(t)}</text>`;
  });
  yTicks.forEach(t => {
    const py = zy(t);
    out += `<line x1="${ix - 4}" y1="${py}" x2="${ix}" y2="${py}" stroke="${colors.axis}" stroke-width="1.2" />`;
    out += `<text x="${ix - 6}" y="${py + 3.5}" fill="${colors.title}" font-size="${smallFont}"
              font-family="${tickFont}" text-anchor="end" direction="ltr">${fmtTick(t)}</text>`;
  });

  if (showT) {
    out += `<text x="${ix + iw / 2}" y="${box.y + box.h - 5}" fill="${colors.title}" font-size="${Math.max(9, smallFont)}"
              font-weight="700" text-anchor="middle" font-family="${uiFont}">${escapeXml(state.xTitle)}</text>`;
    out += `<text x="${-(iy + ih / 2)}" y="${box.x + 11}" fill="${colors.title}" font-size="${Math.max(9, smallFont)}"
              font-weight="700" text-anchor="middle" transform="rotate(-90)" font-family="${uiFont}">${escapeXml(state.yTitle)}</text>`;
  }

  // Magnification factor badge
  const mainPx = Math.abs(mapX(reg.x1) - mapX(reg.x0)) || 1;
  const mag = iw / mainPx;
  if (mag > 1.05) {
    const btxt = `×${mag.toFixed(mag < 10 ? 1 : 0)}`;
    const bw = btxt.length * 8 + 12;
    out += `
      <rect x="${box.x + box.w - bw - 4}" y="${box.y + 3}" width="${bw}" height="15" rx="3"
            fill="${accent}" opacity="0.92" />
      <text x="${box.x + box.w - bw / 2 - 4}" y="${box.y + 14}" fill="#ffffff" font-size="10" font-weight="700"
            text-anchor="middle" direction="ltr" font-family="${tickFont}">${btxt}</text>
    `;
  }

  out += `</g>`;
  return out;
}


function renderChart() {
  applyLayoutToGeometry();

  const isDark = state.theme === "dark";
  const FONT = state.lang === "fa" ? "Tahoma, Vazirmatn, Arial, sans-serif" : "Arial, Helvetica, sans-serif";
  const USER_FONT = state.type.fontFamily !== "auto" ? (FAMILY_MAP[state.type.fontFamily] || FONT) : FONT;
  const TICK_FONT = state.type.fontFamily !== "auto"
    ? (FAMILY_MAP[state.type.fontFamily] || "Arial, Helvetica, sans-serif")
    : "Arial, Helvetica, sans-serif";

  const baseBg = isDark ? "#0f172a" : "#ffffff";
  const opaqueBg = state.type.plotBg || baseBg;
  const colors = {
    bg: opaqueBg,
    plotBg: state.type.transparentBg ? "none" : opaqueBg,
    grid: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
    axis: isDark ? "#94a3b8" : "#334155",
    axisZero: isDark ? "rgba(255, 255, 255, 0.3)" : "#94a3b8",
    text: isDark ? "#cbd5e1" : "#475569",
    title: isDark ? "#f8fafc" : "#0f172a",
    calloutBg: isDark ? "rgba(15, 23, 42, 0.94)" : "rgba(255, 255, 255, 0.98)",
    calloutBorder: isDark ? "rgba(148, 163, 184, 0.35)" : "#94a3b8"
  };

  const geo = computeAxisGeometry();
  const xT = buildTicks("x");
  const yT = buildTicks("y");
  const xTicks = xT.ticks;
  const yTicks = yT.ticks;
  const xMinors = xT.minors;
  const yMinors = yT.minors;
  const GRID_DASH = state.type.gridStyle === "solid" ? "" : (state.type.gridStyle === "dotted" ? "1,3" : "3,3");
  const gridOp = Math.max(0.02, Math.min(1, state.type.gridOpacity));
  const showXGrid = state.type.gridAxis === "both" || state.type.gridAxis === "x";
  const showYGrid = state.type.gridAxis === "both" || state.type.gridAxis === "y";
  const TICK_LEN = Math.max(2, state.ticks.length);

  let svgContent = `
    <defs>
      <filter id="badgeShadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.35" />
      </filter>
      <clipPath id="plotClip"><rect x="${plotArea.x}" y="${plotArea.y}" width="${plotArea.width}" height="${plotArea.height}" /></clipPath>
      ${dataset.series.map(s => {
        const col = isDark ? s.colorDark : s.colorLight;
        return `
          <marker id="arrow-${s.id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <polygon points="0 1.5, 9 5, 0 8.5" fill="${col}" />
          </marker>
        `;
      }).join("")}
    </defs>

    <!-- Plot Area Background -->
    <rect x="${plotArea.x}" y="${plotArea.y}" width="${plotArea.width}" height="${plotArea.height}" 
          fill="${colors.plotBg}" rx="4" />
  `;

  // Grid Lines
  if (state.showGrid) {
    if (showYGrid) {
      yTicks.forEach(tick => {
        const yPos = mapY(tick);
        const isZero = tick === 0;
        svgContent += `
          <line x1="${plotArea.x}" y1="${yPos}" x2="${plotArea.x + plotArea.width}" y2="${yPos}"
                stroke="${isZero ? colors.axisZero : colors.grid}"
                stroke-width="${isZero ? 1.5 : 1}"
                stroke-opacity="${isZero ? 1 : gridOp}"
                ${GRID_DASH ? `stroke-dasharray="${GRID_DASH}"` : ''} />
        `;
      });
    }

    if (showXGrid) {
      xTicks.forEach(tick => {
        const xPos = mapX(tick);
        svgContent += `
          <line x1="${xPos}" y1="${plotArea.y}" x2="${xPos}" y2="${plotArea.y + plotArea.height}"
                stroke="${colors.grid}" stroke-width="1" stroke-opacity="${gridOp}"
                ${GRID_DASH ? `stroke-dasharray="${GRID_DASH}"` : ''} />
        `;
      });
    }
  }

  // Shaded Replicate Error Bands
  if (state.showErrorBand && state.plotMode === "scatter-line") {
    for (let k = 0; k < dataset.series.length - 1; k += 2) {
      const sA = dataset.series[k];
      const sB = dataset.series[k + 1];
      if (sA && sB && sA.visible && sB.visible && sA.yValues && sB.yValues) {
        let bandD = "";
        dataset.xValues.forEach((x, i) => {
          const px = mapX(x);
          const py = mapY(displayY(sA, i));
          bandD += i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`;
        });
        for (let i = dataset.xValues.length - 1; i >= 0; i--) {
          const px = mapX(dataset.xValues[i]);
          const py = mapY(displayY(sB, i));
          bandD += ` L ${px} ${py}`;
        }
        bandD += " Z";
        const bandColor = state.theme === "dark" ? sA.colorDark : sA.colorLight;
        svgContent += `<path d="${bandD}" fill="${bandColor}" opacity="0.16" />`;
      }
    }
  }

  // Axes Framing
  // Labelled Y-Axis (vertical) — sits at the corner, through zero or through center
  svgContent += `
    <line x1="${geo.x}" y1="${plotArea.y}" x2="${geo.x}" y2="${plotArea.y + plotArea.height}"
          stroke="${colors.axis}" stroke-width="1.8" />
  `;

  // Labelled X-Axis (horizontal)
  svgContent += `
    <line x1="${plotArea.x}" y1="${geo.y}" x2="${plotArea.x + plotArea.width}" y2="${geo.y}"
          stroke="${colors.axis}" stroke-width="1.8" />
  `;

  // Boxed Journal Frame: Top and Right Spines with Inward Ticks (Classic Nature/ACS ISI style)
  if (state.frameStyle === "boxed") {
    svgContent += `
      <line x1="${plotArea.x}" y1="${plotArea.y}" x2="${plotArea.x + plotArea.width}" y2="${plotArea.y}"
            stroke="${colors.axis}" stroke-width="1.5" />
      <line x1="${plotArea.x + plotArea.width}" y1="${plotArea.y}" x2="${plotArea.x + plotArea.width}" y2="${plotArea.y + plotArea.height}"
            stroke="${colors.axis}" stroke-width="1.5" />
    `;

    xTicks.forEach(tick => {
      const xPos = mapX(tick);
      svgContent += `
        <line x1="${xPos}" y1="${plotArea.y}" x2="${xPos}" y2="${plotArea.y + 5}"
              stroke="${colors.axis}" stroke-width="1.2" />
      `;
    });
    yTicks.forEach(tick => {
      const yPos = mapY(tick);
      svgContent += `
        <line x1="${plotArea.x + plotArea.width - 5}" y1="${yPos}" x2="${plotArea.x + plotArea.width}" y2="${yPos}"
              stroke="${colors.axis}" stroke-width="1.2" />
      `;
    });
  }

  // Minor ticks (both axes)
  if (state.ticks.minor > 0) {
    xMinors.forEach(tick => {
      const xPos = mapX(tick);
      const t = tickLine(geo.y, 1, TICK_LEN * 0.55);
      svgContent += `<line x1="${xPos}" y1="${t.from}" x2="${xPos}" y2="${t.to}" stroke="${colors.axis}" stroke-width="1" opacity="0.7" />`;
    });
    yMinors.forEach(tick => {
      const yPos = mapY(tick);
      const side = geo.x > plotArea.x + plotArea.width * 0.6 ? 1 : -1;
      const t = tickLine(geo.x, side, TICK_LEN * 0.55);
      svgContent += `<line x1="${t.from}" y1="${yPos}" x2="${t.to}" y2="${yPos}" stroke="${colors.axis}" stroke-width="1" opacity="0.7" />`;
    });
  }

  // Y Ticks & Labels
  const yLabelRight = geo.x > plotArea.x + plotArea.width * 0.6;
  const yLabelSide = yLabelRight ? 1 : -1;
  yTicks.forEach((tick, i) => {
    const yPos = mapY(tick);
    const tl = tickLine(geo.x, yLabelSide, TICK_LEN);
    const anchor = yLabelRight ? "start" : "end";
    const lblX = geo.x + (yLabelRight ? 12 : -12);
    svgContent += `
      <line x1="${tl.from}" y1="${yPos}" x2="${tl.to}" y2="${yPos}"
            stroke="${colors.axis}" stroke-width="1.5" />
      <text x="${lblX}" y="${yPos + 5}"
            fill="${colors.title}" font-size="${state.type.tickFont}" font-family="${TICK_FONT}"
            text-anchor="${anchor}" direction="ltr">${fmtTick(tick)}</text>
    `;
  });

  // X Ticks & Labels (rotation + label-skipping supported)
  const xLabelY = geo.y + state.type.tickFont + 10;
  const rot = state.ticks.xLabelRotate;
  xTicks.forEach((tick, i) => {
    const xPos = mapX(tick);
    const tl = tickLine(geo.y, 1, TICK_LEN);
    svgContent += `<line x1="${xPos}" y1="${tl.from}" x2="${xPos}" y2="${tl.to}" stroke="${colors.axis}" stroke-width="1.5" />`;

    if (state.ticks.labelEvery > 1 && (i % state.ticks.labelEvery) !== 0) return;

    if (rot) {
      const anchor = rot === 90 ? "start" : "start";
      const ly = rot === 90 ? geo.y + 8 : xLabelY;
      svgContent += `
        <text x="${xPos}" y="${ly}" fill="${colors.title}" font-size="${state.type.tickFont}"
              font-family="${TICK_FONT}" text-anchor="${anchor}" direction="ltr"
              transform="rotate(${rot} ${xPos} ${ly})">${fmtTick(tick)}</text>
      `;
    } else {
      svgContent += `
        <text x="${xPos}" y="${xLabelY}"
              fill="${colors.title}" font-size="${state.type.tickFont}" font-family="${TICK_FONT}"
              text-anchor="middle" direction="ltr">${fmtTick(tick)}</text>
      `;
    }
  });

  // Axis Titles
  const axisTitleY = chartBox.height - Math.max(8, Math.round(chartBox.marginBottom * 0.21));
  const yAxisTitleX = Math.max(12, Math.round(chartBox.marginLeft * 0.34));
  svgContent += `
    <text x="${plotArea.x + plotArea.width / 2}" y="${axisTitleY}"
          fill="${colors.title}" font-size="${state.type.axisTitleFont}" font-weight="700" text-anchor="middle"
          font-family="${USER_FONT}">${escapeXml(state.xTitle)}</text>

    <text x="${- (plotArea.y + plotArea.height / 2)}" y="${yAxisTitleX}"
          fill="${colors.title}" font-size="${state.type.axisTitleFont}" font-weight="700" text-anchor="middle"
          transform="rotate(-90)"
          font-family="${USER_FONT}">${escapeXml(state.yTitle)}</text>
  `;

  // Chart title drawn INSIDE the figure (used for exports / journal layouts)
  const titleBar = document.querySelector ? document.querySelector(".chart-title-bar") : null;
  if (titleBar) titleBar.style.display = state.type.titlePlacement === "above" ? "" : "none";
  if (state.type.titlePlacement === "inside") {
    const isFaT = state.lang === "fa";
    const anchorT = isFaT ? "end" : "start";
    const tx = isFaT ? plotArea.x + plotArea.width - 14 : plotArea.x + 14;
    svgContent += `
      <text x="${tx}" y="${plotArea.y + 26}" fill="${colors.title}" font-size="${state.type.axisTitleFont + 3}"
            font-weight="800" text-anchor="${anchorT}" direction="${isFaT ? 'rtl' : 'ltr'}" font-family="${USER_FONT}">${escapeXml(state.chartTitle)}</text>
    `;
    if (state.chartSubtitle) {
      svgContent += `
        <text x="${tx}" y="${plotArea.y + 26 + state.type.axisTitleFont + 6}" fill="${colors.text}" font-size="${Math.max(11, state.type.axisTitleFont - 4)}"
              text-anchor="${anchorT}" direction="${isFaT ? 'rtl' : 'ltr'}" font-family="${USER_FONT}">${escapeXml(state.chartSubtitle)}</text>
      `;
    }
  }

  // Render Series
  dataset.series.forEach(s => {
    if (!s.visible) return;

    const seriesColor = isDark ? s.colorDark : s.colorLight;
    const seriesOpacity = typeof s.opacity === "number" ? Math.max(0.05, Math.min(1, s.opacity)) : 1;
    const xVals = dataset.xValues;
    const yVals = s.yValues;
    const dy = i => displayY(s, i); // Y after baseline/normalize/mean transform

    if (state.plotMode === "scatter-line") {
      // Point order (optional: sort by X before connecting)
      let order = xVals.map((_, i) => i);
      if (state.data.sortByX) order = order.slice().sort((a, b) => xVals[a] - xVals[b]);

      const ptsFor = idxList => idxList.map(i => ({ x: mapX(xVals[i]), y: mapY(dy(i)) }));

      let maxIdx = xVals.length - 1;
      if (state.showHysteresis && !state.data.sortByX) {
         let maxX = -Infinity;
         for (let i = 0; i < xVals.length; i++) {
            if (xVals[i] > maxX) {
               maxX = xVals[i];
               maxIdx = i;
            }
         }
      }

      const fwdIdx = [];
      const backIdx = [];
      if (state.data.sortByX) {
        order.forEach(i => fwdIdx.push(i));
      } else {
        for (let i = 0; i < xVals.length; i++) {
          if (i <= maxIdx) fwdIdx.push(i);
          else backIdx.push(i);
        }
      }

      const pathD = pathFromPoints(ptsFor(fwdIdx));
      let pathDBack = "";
      if (backIdx.length) {
        const backPts = [{ x: mapX(xVals[maxIdx]), y: mapY(dy(maxIdx)) }].concat(ptsFor(backIdx));
        pathDBack = pathFromPoints(backPts);
      }

      // Forward Path
      if (pathD) {
        svgContent += `
          <path d="${pathD}" fill="none" stroke="${seriesColor}" stroke-width="${state.lineWidth}"
                stroke-linejoin="round" stroke-linecap="round"
                ${s.strokeDash ? `stroke-dasharray="${s.strokeDash}"` : ""}
                opacity="${0.92 * seriesOpacity}" />
        `;
      }

      // Backward Path
      if (pathDBack) {
         const backDash = state.showHysteresis ? "6,5" : (s.strokeDash || "");
         svgContent += `
           <path d="${pathDBack}" fill="none" stroke="${seriesColor}" stroke-width="${state.lineWidth}"
                 stroke-linejoin="round" stroke-linecap="round"
                 ${backDash ? `stroke-dasharray="${backDash}"` : ""}
                 opacity="${0.92 * seriesOpacity}" />
         `;
      }

      // Directional Arrows
      if (state.showHysteresis && !state.data.sortByX) {
         for (let i = 0; i < xVals.length - 1; i++) {
             const px1 = mapX(xVals[i]);
             const py1 = mapY(dy(i));
             const px2 = mapX(xVals[i + 1]);
             const py2 = mapY(dy(i + 1));

             const dx = px2 - px1;
             const dyP = py2 - py1;
             const dist = Math.sqrt(dx * dx + dyP * dyP);

             if (dist > 25) {
                 const midX = px1 + dx * 0.55;
                 const midY = py1 + dyP * 0.55;
                 const angle = Math.atan2(dyP, dx) * 180 / Math.PI;
                 const isBack = i >= maxIdx;

                 svgContent += `
                    <g transform="translate(${midX}, ${midY}) rotate(${angle})" opacity="${(isBack ? 0.75 : 0.95) * seriesOpacity}">
                       <polygon points="-5,-4.5 4.5,0 -5,4.5" fill="${seriesColor}" />
                    </g>
                 `;
             }
         }
      }
    }

    // --- Error bars (per-series errValues from Excel, ± columns) ---
    if (state.data.showErrorBars && s.errValues && s.errValues.length) {
      const tstat = yTransformStats(s);
      const cap = Math.max(4, state.markerSize * 0.65);
      xVals.forEach((xVal, idx) => {
        const e = s.errValues[idx];
        if (typeof e !== "number" || !isFinite(e) || e <= 0) return;
        const err = Math.abs(e) * tstat.scale;
        const base = dy(idx);
        const px = mapX(xVal);
        const yTop = mapY(base + err);
        const yBot = mapY(base - err);
        svgContent += `
          <g stroke="${seriesColor}" stroke-width="1.6" opacity="${0.9 * seriesOpacity}" stroke-linecap="round">
            <line x1="${px}" y1="${yTop}" x2="${px}" y2="${yBot}" />
            <line x1="${px - cap}" y1="${yTop}" x2="${px + cap}" y2="${yTop}" />
            <line x1="${px - cap}" y1="${yBot}" x2="${px + cap}" y2="${yBot}" />
          </g>
        `;
      });
    }

    let turnIdx = 0;
    xVals.forEach((x, i) => { if (x > xVals[turnIdx]) turnIdx = i; });
    xVals.forEach((xVal, idx) => {
      const px = mapX(xVal);
      const yVal = dy(idx);
      const py = mapY(yVal);
      // Backward path points are drawn hollow so forward/backward are distinguishable in print
      const hollow = state.showHysteresis && idx > turnIdx;
      const pointSvg = hollow
        ? getMarkerSvg(s.marker, px, py, state.markerSize, colors.bg, seriesColor)
        : getMarkerSvg(s.marker, px, py, state.markerSize, seriesColor, seriesColor);

      svgContent += `
        <g class="point-group" data-series="${s.id}" data-x="${xVal}" data-y="${yVal}" data-idx="${idx}" opacity="${seriesOpacity}">
          <circle cx="${px}" cy="${py}" r="${state.markerSize + 4}" fill="transparent" style="cursor: pointer;" />
          ${pointSvg}
          ${state.showDataLabels ? `
            <text x="${px}" y="${py - 10}" fill="${colors.text}" font-size="${state.type.dataLabelFont}"
                  font-weight="700" text-anchor="middle" direction="ltr" font-family="${TICK_FONT}">${fmtTick(yVal)}</text>
          ` : ""}
        </g>
      `;
    });

    // --- Trendlines ---
    if (state.showTrendlines && xVals.length >= 2) {
      let n = xVals.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      const yDisp = [];
      for (let i = 0; i < n; i++) {
        const yv = dy(i);
        yDisp.push(yv);
        sumX += xVals[i];
        sumY += yv;
        sumXY += xVals[i] * yv;
        sumXX += xVals[i] * xVals[i];
      }
      let denom = (n * sumXX - sumX * sumX);
      if (Math.abs(denom) > 1e-12) {
        let slope = (n * sumXY - sumX * sumY) / denom;
        let intercept = (sumY - slope * sumX) / n;

        let yMean = sumY / n;
        let ssTot = 0, ssRes = 0;
        for (let i = 0; i < n; i++) {
          let yPred = slope * xVals[i] + intercept;
          ssTot += Math.pow(yDisp[i] - yMean, 2);
          ssRes += Math.pow(yDisp[i] - yPred, 2);
        }
        let rSquared = ssTot === 0 ? 1 : Math.max(0, 1 - (ssRes / ssTot));

        const x1 = Math.min(...xVals);
        const x2 = Math.max(...xVals);
        const y1 = slope * x1 + intercept;
        const y2 = slope * x2 + intercept;

        const px1 = mapX(x1);
        const py1 = mapY(y1);
        const px2 = mapX(x2);
        const py2 = mapY(y2);

        svgContent += `
          <line x1="${px1}" y1="${py1}" x2="${px2}" y2="${py2}"
                stroke="${seriesColor}" stroke-width="2" stroke-dasharray="8,4" opacity="${0.8 * seriesOpacity}" />
          <text x="${px2 - 10}" y="${py2 - 10}" fill="${seriesColor}" font-size="${state.type.legendFont}" font-weight="bold" font-family="${TICK_FONT}" text-anchor="end" direction="ltr">R² = ${rSquared.toFixed(3)}</text>
        `;
      }
    }
  });

  // Dynamic Callouts & Direct Arrows for each sample/series
  if (state.showAnnotations) {
    const isFa = state.lang === "fa";
    dataset.series.forEach((s, sIdx) => {
      if (!s.visible) return;
      const callout = getSeriesCallout(s, sIdx);
      const col = isDark ? s.colorDark : s.colorLight;
      const sName = isFa ? s.nameFa : s.nameEn;
      const cardW = Math.max(60, sName.length * (state.type.legendFont * 0.92) + 14);
      const cardH = Math.max(28, state.type.legendFont + 17);

      const arrow = getBoxArrowPoints(callout.x, callout.y, cardW, cardH, callout.targetX, callout.targetY);

      // Clean direct label: text + thin leader arrow. Hit areas are transparent so exports stay clean.
      svgContent += `
        <g class="annotation-group" data-series="${s.id}">
          <line x1="${arrow.sx}" y1="${arrow.sy}" x2="${arrow.ex}" y2="${arrow.ey}"
                stroke="${col}" stroke-width="1.6" stroke-linecap="round"
                marker-end="url(#arrow-${s.id})" />

          <g class="draggable-target" data-series="${s.id}" style="cursor: crosshair;">
            <circle cx="${callout.targetX}" cy="${callout.targetY}" r="22" fill="${col}" fill-opacity="0.0" stroke="transparent" class="target-hit-area" />
          </g>

          <g class="draggable-badge" data-series="${s.id}">
            <rect x="${callout.x}" y="${callout.y}" width="${cardW}" height="${cardH}" 
                  fill="${state.showCalloutBox ? colors.calloutBg : 'transparent'}" 
                  stroke="${state.showCalloutBox ? colors.calloutBorder : 'transparent'}" 
                  stroke-width="1.2" rx="6" 
                  ${state.showCalloutBox ? 'filter="url(#badgeShadow)"' : ''} />
            <text x="${callout.x + cardW / 2}" y="${callout.y + cardH * 0.68}" fill="${col}" font-size="${Math.max(14, state.type.legendFont + 7.5)}" font-weight="700"
                  text-anchor="middle" direction="${isFa ? 'rtl' : 'ltr'}" font-family="${USER_FONT}">${escapeXml(sName)}</text>
          </g>
        </g>
      `;
    });
  }

  // In-Plot Scientific Legend Box
  if (state.showInplotLegend) {
    const isFa = state.lang === "fa";
    const legBoxX = state.callouts.inplotX;
    const legBoxY = state.callouts.inplotY;
    const rowH = Math.max(20, state.type.legendFont + 13);
    const legBoxW = 230;
    const legBoxH = Math.max(80, 44 + (dataset.series.length * rowH));

    svgContent += `
      <g class="draggable-badge" data-badge="inplot" filter="url(#badgeShadow)">
        <rect x="${legBoxX}" y="${legBoxY}" width="${legBoxW}" height="${legBoxH}" rx="8"
              fill="${colors.calloutBg}" stroke="${colors.calloutBorder}" stroke-width="1.4" />
        
        <text x="${isFa ? legBoxX + legBoxW - 16 : legBoxX + 16}" y="${legBoxY + 22}" fill="${colors.title}" font-size="${Math.max(10, state.type.legendFont + 0.5)}" font-weight="700"
              direction="${isFa ? 'rtl' : 'ltr'}" text-anchor="${isFa ? 'end' : 'start'}" font-family="${USER_FONT}">
          ${isFa ? 'راهنمای نمونه‌ها:' : 'Legend / Samples:'}
        </text>
    `;

    dataset.series.forEach((s, idx) => {
      const itemY = legBoxY + 44 + (idx * rowH);
      const seriesColor = isDark ? s.colorDark : s.colorLight;
      const name = isFa ? s.nameFa : s.nameEn;
      const lineX1 = isFa ? legBoxX + legBoxW - 42 : legBoxX + 16;
      const lineX2 = isFa ? legBoxX + legBoxW - 16 : legBoxX + 42;
      const markerCx = isFa ? legBoxX + legBoxW - 29 : legBoxX + 29;
      const textX = isFa ? legBoxX + legBoxW - 55 : legBoxX + 50;

      if (state.plotMode === "scatter-line") {
        svgContent += `
          <line x1="${lineX1}" y1="${itemY}" x2="${lineX2}" y2="${itemY}"
                stroke="${seriesColor}" stroke-width="2.4" opacity="${s.visible ? 1 : 0.25}"
                ${s.strokeDash ? `stroke-dasharray="${s.strokeDash}"` : ""} />
        `;
      }

      svgContent += `
        <g opacity="${s.visible ? 1 : 0.25}">
          ${getMarkerSvg(s.marker, markerCx, itemY, 8.5, seriesColor, isDark ? "#0f172a" : "#ffffff")}
        </g>
      `;

      svgContent += `
        <text x="${textX}" y="${itemY + 4}" fill="${s.visible ? colors.text : colors.axis}"
              font-size="${state.type.legendFont}" font-weight="600" opacity="${s.visible ? 1 : 0.35}"
              direction="${isFa ? 'rtl' : 'ltr'}" text-anchor="${isFa ? 'end' : 'start'}"
              font-family="${USER_FONT}">${escapeXml(name)}</text>
      `;
    });

    svgContent += `</g>`;
  }

  // Forward / backward line-style key (only meaningful with hysteresis paths)
  if (state.showHysteresis && state.plotMode === "scatter-line") {
    const isFa = state.lang === "fa";
    const kw = 230, kh = 70;
    const kx = plotArea.x + 14, ky = plotArea.y + plotArea.height - kh - 14;
    const lx = isFa ? kx + kw - 58 : kx + 12;
    const tx = isFa ? lx - 12 : lx + 56;
    const anc = isFa ? "end" : "start";
    const keyCol = colors.title;
    const row = (y, dash, hollow, label) => `
      <line x1="${lx}" x2="${lx + 44}" y1="${y}" y2="${y}" stroke="${keyCol}" stroke-width="2.4" ${dash ? 'stroke-dasharray="7,5"' : ""} />
      <circle cx="${lx + 22}" cy="${y}" r="5.5" fill="${hollow ? colors.bg : keyCol}" stroke="${keyCol}" stroke-width="2" />
      <text x="${tx}" y="${y + 5}" font-size="${state.type.tickFont}" fill="${keyCol}" text-anchor="${anc}" font-family="${FONT}">${label}</text>`;
    svgContent += `
      <rect x="${kx}" y="${ky}" width="${kw}" height="${kh}" fill="${colors.bg}" stroke="${colors.calloutBorder}" stroke-width="1" />
      ${row(ky + 22, false, false, isFa ? "مسیر رفت" : "Forward")}
      ${row(ky + 50, true, true, isFa ? "مسیر برگشت" : "Backward")}
    `;
  }

  // --- Magnifier inset (academic zoom region) ---
  if (state.zoom.enabled) {
    svgContent += renderZoomOverlay();
    svgContent += renderZoomInset(colors, TICK_FONT, USER_FONT);
  }

  // Rubber-band selection rectangle used to pick the magnified region
  svgContent += `<rect id="zoomBandRect" x="0" y="0" width="0" height="0" style="display:none"
        fill="${state.theme === 'dark' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.12)'}"
        stroke="${state.theme === 'dark' ? '#38bdf8' : '#0284c7'}" stroke-width="1.5" stroke-dasharray="5,4"
        pointer-events="none" />`;

  svg.innerHTML = svgContent;

  attachHoverListeners();
  attachDragListeners();

  if (state._booted) queueSave();
}

// --- 7. Interactive Hover Tooltips ---
function attachHoverListeners() {
  const points = svg.querySelectorAll(".point-group");
  points.forEach(pt => {
    pt.addEventListener("mouseenter", e => {
      const seriesId = pt.getAttribute("data-series");
      const x = pt.getAttribute("data-x");
      const y = pt.getAttribute("data-y");
      const s = dataset.series.find(item => item.id === seriesId);
      if (!s) return;

      const seriesName = state.lang === "fa" ? s.nameFa : s.nameEn;

      const xLabel = state.xTitle || (state.lang === 'fa' ? 'محور X' : 'X');
      const yLabel = state.yTitle || (state.lang === 'fa' ? 'محور Y' : 'Y');
      tooltip.innerHTML = `
        <div style="font-weight: 700; color: ${state.theme === 'dark' ? s.colorDark : s.colorLight}; margin-bottom: 3px;">
          ${seriesName}
        </div>
        <div>${xLabel}: <strong>${x}</strong></div>
        <div>${yLabel}: <strong>${y}</strong></div>
      `;

      const svgRect = svg.getBoundingClientRect();
      const px = mapX(parseFloat(x));
      const py = mapY(parseFloat(y));
      const scaleX = svgRect.width / chartBox.width;
      const scaleY = svgRect.height / chartBox.height;

      tooltip.style.left = `${px * scaleX}px`;
      tooltip.style.top = `${py * scaleY}px`;
      tooltip.classList.add("visible");
    });

    pt.addEventListener("mouseleave", () => {
      tooltip.classList.remove("visible");
    });
  });
}

// --- 8. Drag and Drop for Callouts & In-Plot Legend ---
let activeDrag = null;

function getSvgCoords(evt) {
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const inverse = ctm.inverse();
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  return pt.matrixTransform(inverse);
}

function attachDragListeners() {
  const badges = svg.querySelectorAll(".draggable-badge");
  badges.forEach(badge => {
    badge.addEventListener("mousedown", e => {
      e.preventDefault();
      e.stopPropagation();
      const sId = badge.getAttribute("data-series");
      const coords = getSvgCoords(e);
      if (sId) {
        const s = dataset.series.find(item => item.id === sId);
        const idx = dataset.series.findIndex(item => item.id === sId);
        const callout = getSeriesCallout(s, idx);
        activeDrag = {
          kind: "badge",
          seriesId: sId,
          offsetX: coords.x - callout.x,
          offsetY: coords.y - callout.y
        };
      } else if (badge.getAttribute("data-badge") === "inplot") {
        activeDrag = {
          kind: "inplot",
          offsetX: coords.x - (state.callouts.inplotX || 160),
          offsetY: coords.y - (state.callouts.inplotY || 280)
        };
      }
    });
  });

  const targets = svg.querySelectorAll(".draggable-target");
  targets.forEach(target => {
    target.addEventListener("mousedown", e => {
      e.preventDefault();
      e.stopPropagation();
      const sId = target.getAttribute("data-series");
      activeDrag = {
        kind: "target",
        seriesId: sId
      };
    });
  });
}

window.addEventListener("mousemove", e => {
  if (!activeDrag) return;
  const coords = getSvgCoords(e);

  if (activeDrag.kind === "target") {
    const s = dataset.series.find(item => item.id === activeDrag.seriesId);
    const idx = dataset.series.findIndex(item => item.id === activeDrag.seriesId);
    if (s) {
      const callout = getSeriesCallout(s, idx);
      let newX = Math.round(coords.x);
      let newY = Math.round(coords.y);
      newX = Math.max(plotArea.x, Math.min(newX, plotArea.x + plotArea.width));
      newY = Math.max(plotArea.y, Math.min(newY, plotArea.y + plotArea.height));

      // Snap to closest point on this series curve if close
      if (s.yValues) {
        dataset.xValues.forEach((xv, i) => {
          const yv = s.yValues[i];
          if (yv != null) {
            const px = mapX(xv);
            const py = mapY(yv);
            if (Math.hypot(coords.x - px, coords.y - py) < 18) {
              newX = Math.round(px);
              newY = Math.round(py);
            }
          }
        });
      }

      callout.targetX = newX;
      callout.targetY = newY;
      syncCalloutSliders(s.id);
      renderChart();
    }
    return;
  }

  if (activeDrag.kind === "badge") {
    const s = dataset.series.find(item => item.id === activeDrag.seriesId);
    const idx = dataset.series.findIndex(item => item.id === activeDrag.seriesId);
    if (s) {
      const callout = getSeriesCallout(s, idx);
      let newX = Math.round(coords.x - activeDrag.offsetX);
      let newY = Math.round(coords.y - activeDrag.offsetY);
      newX = Math.max(20, Math.min(newX, chartBox.width - 60));
      newY = Math.max(10, Math.min(newY, chartBox.height - 40));
      callout.x = newX;
      callout.y = newY;
      syncCalloutSliders(s.id);
      renderChart();
    }
    return;
  }

  if (activeDrag.kind === "inplot") {
    let newX = Math.round(coords.x - activeDrag.offsetX);
    let newY = Math.round(coords.y - activeDrag.offsetY);
    newX = Math.max(plotArea.x + 4, Math.min(newX, plotArea.x + plotArea.width - 240));
    newY = Math.max(plotArea.y + 4, Math.min(newY, plotArea.y + plotArea.height - 90));
    state.callouts.inplotX = newX;
    state.callouts.inplotY = newY;
    if (rngInplotX) rngInplotX.value = newX;
    if (rngInplotY) rngInplotY.value = newY;
    if (valInplotX) valInplotX.textContent = `${newX} px`;
    if (valInplotY) valInplotY.textContent = `${newY} px`;
    renderChart();
  }
});

window.addEventListener("mouseup", () => {
  activeDrag = null;
});

function syncCalloutSliders(sId) {
  const callout = state.callouts[sId];
  if (!callout) return;
  const rBx = document.getElementById(`rng_bx_${sId}`);
  const rBy = document.getElementById(`rng_by_${sId}`);
  const rTx = document.getElementById(`rng_tx_${sId}`);
  const rTy = document.getElementById(`rng_ty_${sId}`);
  const lBx = document.getElementById(`lbl_bx_${sId}`);
  const lBy = document.getElementById(`lbl_by_${sId}`);
  const lTx = document.getElementById(`lbl_tx_${sId}`);
  const lTy = document.getElementById(`lbl_ty_${sId}`);
  if (rBx) { rBx.value = callout.x; if (lBx) lBx.textContent = `${callout.x} px`; }
  if (rBy) { rBy.value = callout.y; if (lBy) lBy.textContent = `${callout.y} px`; }
  if (rTx) { rTx.value = callout.targetX; if (lTx) lTx.textContent = `${callout.targetX} px`; }
  if (rTy) { rTy.value = callout.targetY; if (lTy) lTy.textContent = `${callout.targetY} px`; }
}

function setupCalloutsControls() {
  const container = document.getElementById("calloutsControlsContainer");
  if (!container) return;
  container.innerHTML = "";

  const isDark = state.theme === "dark";
  const isFa = state.lang === "fa";

  dataset.series.forEach((s, idx) => {
    const callout = getSeriesCallout(s, idx);
    const col = isDark ? s.colorDark : s.colorLight;
    const name = isFa ? s.nameFa : s.nameEn;

    const card = document.createElement("div");
    card.style.cssText = "background: var(--bg-card-subtle); padding: 10px; border-radius: 6px; margin-bottom: 10px; border: 1px solid var(--border-color);";
    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <span style="font-weight: 700; color: ${col}; font-size: 0.88rem;">${name}</span>
        <span style="font-size: 0.72rem; color: var(--text-muted);">${isFa ? 'فلش و کادر' : 'Arrow & Callout'}</span>
      </div>

      <div class="slider-control" style="margin-bottom: 6px;">
        <div class="slider-control-header">
          <span>${isFa ? 'محل کادر متن (X)' : 'Box X'}</span>
          <span id="lbl_bx_${s.id}">${callout.x} px</span>
        </div>
        <input type="range" min="0" max="${Math.max(100, chartBox.width - 120)}" value="${callout.x}" id="rng_bx_${s.id}">
      </div>

      <div class="slider-control" style="margin-bottom: 6px;">
        <div class="slider-control-header">
          <span>${isFa ? 'محل کادر متن (Y)' : 'Box Y'}</span>
          <span id="lbl_by_${s.id}">${callout.y} px</span>
        </div>
        <input type="range" min="0" max="${Math.max(80, chartBox.height - 80)}" value="${callout.y}" id="rng_by_${s.id}">
      </div>

      <div class="slider-control" style="margin-bottom: 6px;">
        <div class="slider-control-header">
          <span>${isFa ? 'نوک فلش / نقطه اشاره (X)' : 'Target X'}</span>
          <span id="lbl_tx_${s.id}">${callout.targetX} px</span>
        </div>
        <input type="range" min="${plotArea.x}" max="${plotArea.x + plotArea.width}" value="${callout.targetX}" id="rng_tx_${s.id}">
      </div>

      <div class="slider-control" style="margin-bottom: 0;">
        <div class="slider-control-header">
          <span>${isFa ? 'نوک فلش / نقطه اشاره (Y)' : 'Target Y'}</span>
          <span id="lbl_ty_${s.id}">${callout.targetY} px</span>
        </div>
        <input type="range" min="${plotArea.y}" max="${plotArea.y + plotArea.height}" value="${callout.targetY}" id="rng_ty_${s.id}">
      </div>
    `;

    container.appendChild(card);

    const rBx = card.querySelector(`#rng_bx_${s.id}`);
    const rBy = card.querySelector(`#rng_by_${s.id}`);
    const rTx = card.querySelector(`#rng_tx_${s.id}`);
    const rTy = card.querySelector(`#rng_ty_${s.id}`);
    const lBx = card.querySelector(`#lbl_bx_${s.id}`);
    const lBy = card.querySelector(`#lbl_by_${s.id}`);
    const lTx = card.querySelector(`#lbl_tx_${s.id}`);
    const lTy = card.querySelector(`#lbl_ty_${s.id}`);

    rBx.addEventListener("input", e => {
      callout.x = parseInt(e.target.value, 10);
      lBx.textContent = `${callout.x} px`;
      renderChart();
    });
    rBy.addEventListener("input", e => {
      callout.y = parseInt(e.target.value, 10);
      lBy.textContent = `${callout.y} px`;
      renderChart();
    });
    rTx.addEventListener("input", e => {
      callout.targetX = parseInt(e.target.value, 10);
      lTx.textContent = `${callout.targetX} px`;
      renderChart();
    });
    rTy.addEventListener("input", e => {
      callout.targetY = parseInt(e.target.value, 10);
      lTy.textContent = `${callout.targetY} px`;
      renderChart();
    });
  });
}

// --- 9. Global Toggle Functions ---
window.toggleInplotLegend = function(checked) {
  state.showInplotLegend = checked;
  if (grpInplotX) grpInplotX.style.display = checked ? "block" : "none";
  if (grpInplotY) grpInplotY.style.display = checked ? "block" : "none";
  renderChart();
};

window.toggleAnnotations = function(checked) {
  state.showAnnotations = checked;
  renderChart();
};

window.toggleErrorBand = function(checked) {
  state.showErrorBand = checked;
  renderChart();
};

window.toggleBottomLegend = function(checked) {
  state.showBottomLegend = checked;
  renderLegend();
};

window.toggleDataLabels = function(checked) {
  state.showDataLabels = checked;
  renderChart();
};

window.toggleGrid = function(checked) {
  state.showGrid = checked;
  renderChart();
};

window.toggleHysteresis = function(checked) {
  state.showHysteresis = checked;
  renderChart();
};

// --- 10. Render Bottom Legend ---
function renderLegend() {
  const legendContainer = document.getElementById("bottomLegend");
  const inplotLegend = document.getElementById("inplotLegend");
  
  if (inplotLegend) {
    inplotLegend.style.display = state.showInplotLegend ? "block" : "none";
  }

  if (!legendContainer) return;
  if (!state.showBottomLegend) {
    legendContainer.style.display = "none";
    return;
  }
  legendContainer.style.display = "flex";
  legendContainer.innerHTML = "";
  legendContainer.style.fontSize = `${state.type.legendFont}px`;
  const isDark = state.theme === "dark";

  dataset.series.forEach(s => {
    const item = document.createElement("div");
    item.className = `legend-item ${s.visible ? "" : "dimmed"}`;
    item.id = `legend-${s.id}`;
    
    const color = isDark ? s.colorDark : s.colorLight;
    const name = state.lang === "fa" ? s.nameFa : s.nameEn;

    const iconSvg = `
      <svg width="26" height="14" viewBox="0 0 26 14">
        ${state.plotMode === "scatter-line" ? `
          <line x1="2" y1="7" x2="24" y2="7" stroke="${color}" stroke-width="2" ${s.strokeDash ? `stroke-dasharray="${s.strokeDash}"` : ""} />
        ` : ""}
        ${getMarkerSvg(s.marker, 13, 7, 8, color, isDark ? "#0f172a" : "#ffffff")}
      </svg>
    `;

    item.innerHTML = `
      <span class="legend-symbol">${iconSvg}</span>
      <span>${name}</span>
    `;

    item.addEventListener("click", () => {
      s.visible = !s.visible;
      const chk = document.getElementById(`chk_${s.id}`);
      if (chk) chk.checked = s.visible;
      renderChart();
      renderLegend();
    });

    legendContainer.appendChild(item);
  });
}

// --- 11. Render Editable Data Table ---
function syncInputsToDataset() {
  if (!dataTableBody) return;
  const inputs = dataTableBody.querySelectorAll(".table-input");
  inputs.forEach(input => {
    const col = input.getAttribute("data-col");
    const idx = parseInt(input.getAttribute("data-idx"), 10);
    const val = parseFloat(input.value);
    const num = isNaN(val) ? 0 : val;

    if (col === "x") {
      dataset.xValues[idx] = num;
    } else {
      const s = dataset.series.find(item => item.id === col);
      if (s) s.yValues[idx] = num;
    }
  });
}

function renderDataTable() {
  if (!dataTableBody) return;
  dataTableBody.innerHTML = "";
  const dataTableHeader = document.getElementById("dataTableHeader");
  if (dataTableHeader) {
    let theadHTML = `<tr><th style="padding: 8px;">X (RH)</th>`;
    dataset.series.forEach(s => {
      theadHTML += `<th style="padding: 8px;">${state.lang === 'fa' ? s.nameFa : s.nameEn}</th>`;
    });
    theadHTML += `<th style="padding: 8px;"></th></tr>`;
    dataTableHeader.innerHTML = theadHTML;
  }

  dataset.xValues.forEach((x, idx) => {
    const tr = document.createElement("tr");
    let html = `<td><input type="number" step="any" class="table-input" data-col="x" data-idx="${idx}" value="${x}"></td>`;
    
    dataset.series.forEach(s => {
      html += `<td><input type="number" step="any" class="table-input" data-col="${s.id}" data-idx="${idx}" value="${s.yValues[idx] ?? 0}"></td>`;
    });
    
    html += `<td><button class="btn-delete-row" data-idx="${idx}" title="حذف سطر" style="background: none; border: none; cursor: pointer; color: #f43f5e; font-size: 16px;">×</button></td>`;
    tr.innerHTML = html;
    dataTableBody.appendChild(tr);
  });
  
  dataTableBody.querySelectorAll(".btn-delete-row").forEach(btn => {
    btn.addEventListener("click", e => {
      const idx = parseInt(e.target.getAttribute("data-idx"), 10);
      deleteRow(idx);
    });
  });
}

function deleteRow(idx) {
  if (dataset.xValues.length <= 1) {
    showToast("حداقل یک سطر باید باقی بماند!");
    return;
  }
  syncInputsToDataset();
  dataset.xValues.splice(idx, 1);
  dataset.series.forEach(s => s.yValues.splice(idx, 1));
  renderDataTable();
  renderChart();
}

function addRow() {
  syncInputsToDataset();
  const lastX = dataset.xValues.length > 0 ? dataset.xValues[dataset.xValues.length - 1] + 10 : 0;
  dataset.xValues.push(lastX);
  dataset.series.forEach(s => s.yValues.push(0));
  renderDataTable();
  renderChart();
}

function applyTableData() {
  syncInputsToDataset();
  renderChart();
  showToast("داده‌های جدید روی نمودار اعمال شدند!");
}

function getNiceStep(span, targetTicks = 5) {
  const rawStep = Math.max(0.0001, span / targetTicks);
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const norm = rawStep / mag;
  let niceNorm;
  if (norm <= 1.5) niceNorm = 1;
  else if (norm <= 3) niceNorm = 2;
  else if (norm <= 7) niceNorm = 5;
  else niceNorm = 10;
  return Math.round(niceNorm * mag * 1e6) / 1e6;
}

function autoScaleAxis() {
  if (!dataset.xValues || !dataset.xValues.length) return;
  const minX = Math.min(...dataset.xValues);
  const maxX = Math.max(...dataset.xValues);
  
  let allY = [];
  dataset.series.forEach(s => {
    if (s.yValues && s.yValues.length) {
      for (let i = 0; i < s.yValues.length; i++) allY.push(displayY(s, i));
    }
  });
  if (!allY.length) return;
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);

  const xSpan = Math.max(1, maxX - minX);
  const xStep = getNiceStep(xSpan, 6);
  state.axis.xMin = Math.floor(minX / xStep) * xStep;
  state.axis.xMax = Math.ceil(maxX / xStep) * xStep;
  if (state.axis.xMax <= state.axis.xMin) state.axis.xMax = state.axis.xMin + xStep * 5;
  state.axis.xStep = xStep;

  const ySpan = Math.max(1, maxY - minY);
  const yStep = getNiceStep(ySpan, 6);
  state.axis.yMin = Math.floor(minY / yStep) * yStep;
  state.axis.yMax = Math.ceil(maxY / yStep) * yStep;
  if (state.axis.yMax <= state.axis.yMin) state.axis.yMax = state.axis.yMin + yStep * 5;
  state.axis.yStep = yStep;

  // Sync inputs in UI
  const inpXMin = document.getElementById("inpXMin");
  const inpXMax = document.getElementById("inpXMax");
  const inpXStep = document.getElementById("inpXStep");
  const inpYMin = document.getElementById("inpYMin");
  const inpYMax = document.getElementById("inpYMax");
  const inpYStep = document.getElementById("inpYStep");

  if (inpXMin) inpXMin.value = state.axis.xMin;
  if (inpXMax) inpXMax.value = state.axis.xMax;
  if (inpXStep) inpXStep.value = state.axis.xStep;
  if (inpYMin) inpYMin.value = state.axis.yMin;
  if (inpYMax) inpYMax.value = state.axis.yMax;
  if (inpYStep) inpYStep.value = state.axis.yStep;
}

function exportExcelTemplate() {
  if (typeof XLSX === "undefined") {
    showToast("کتابخانه SheetJS بارگذاری نشده است.");
    return;
  }
  const numSeriesInput = document.getElementById("numSeriesInput");
  const numSeries = parseInt(numSeriesInput ? numSeriesInput.value : "3", 10) || 3;
  
  const headers = ["RH (%)"];
  for (let i = 1; i <= numSeries; i++) {
    headers.push(`نمونه ${i}`);
  }
  
  // Dummy hysteresis data layout
  const data = [headers];
  const dummyX = [20, 40, 60, 80, 100, 100, 80, 60, 40, 20];
  dummyX.forEach(x => {
    const row = [x];
    for (let j = 0; j < numSeries; j++) {
       row.push(0); 
    }
    data.push(row);
  });
  
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "SensorData");
  XLSX.writeFile(wb, "Plot_Template.xlsx");
}

function parseSmartExcel(rawRows) {
  if (!rawRows || !rawRows.length) throw new Error("فایل اکسل خالی است");
  
  // Filter out empty rows
  const rows = rawRows.filter(r => r && r.length && r.some(c => c !== "" && c != null));
  if (!rows.length) throw new Error("هیچ داده‌ای در فایل یافت نشد");
  
  const r0 = rows[0];
  
  // Check if raw 8/9 column lab file (sample1&2 layout with resonance frequency cols > 1000 Hz)
  const dataRowForCheck = rows.find(r => r && r.length && !isNaN(parseFloat(r[0])) && !isNaN(parseFloat(r[1]))) || rows[0];
  if (dataRowForCheck.length >= 7) {
    const r0Nums = dataRowForCheck.map(v => parseFloat(v));
    const isLabFormat = (r0Nums[1] > 1000 || r0Nums[2] > 1000 || r0Nums[5] > 1000) && (Math.abs(r0Nums[3]) < 500);
    if (isLabFormat) {
      if (rows.length <= 8) {
        // 6-row side-by-side format (Forward in cols 3/7, Backward in cols 4/8)
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
        // 12-row sequential format (already stacked)
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

  // Standard tabular format
  const isHeaderRow = isNaN(parseFloat(r0[0])) || 
    (typeof r0[1] === "string" && isNaN(parseFloat(r0[1])));

  let headers = [];
  let dataRows = [];

  if (isHeaderRow) {
    headers = r0.map((h, i) => (h ? String(h).trim() : (i === 0 ? "RH (%)" : `نمونه ${i}`)));
    dataRows = rows.slice(1);
  } else {
    // Headerless: row 0 is already numeric data
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

  // Columns whose header looks like an error column (err / SD / SE / ± / خطا)
  // are attached to the series on their left as ± error bars.
  const errRe = /(^|[\s(\[])(err|error|sd|se|std|sigma|σ|±|خطا)/i;
  const built = [];
  let lastSeries = null;
  series.forEach((s, i) => {
    if (errRe.test(String(headers[i + 1] || "").trim())) {
      if (lastSeries) lastSeries.errValues = s.yValues;
      return;
    }
    lastSeries = s;
    built.push(s);
  });

  return { xValues, series: built };
}

function importExcelFile(e) {
  const file = e.target.files[0];
  if (!file) {
    alert("هیچ فایلی انتخاب نشد.");
    return;
  }
  
  if (typeof XLSX === "undefined") {
    alert("خطا: کتابخانه SheetJS بارگذاری نشده است. لطفاً صفحه را رفرش کنید یا اتصال اینترنت را چک کنید.");
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
        { dark: "#10b981", light: "#059669" }, // emerald (Nano)
        { dark: "#f43f5e", light: "#e11d48" }, // rose (Starch)
        { dark: "#06b6d4", light: "#0284c7" }, // cyan
        { dark: "#f59e0b", light: "#d97706" }, // amber
        { dark: "#8b5cf6", light: "#6d28d9" }, // violet
        { dark: "#ec4899", light: "#be185d" }  // pink
      ];
      const markers = ["circle", "square", "diamond", "triangle", "cross"];

      const newSeries = parsed.series.map((s, i) => {
        const color = colorPalette[i % colorPalette.length];
        const marker = markers[i % markers.length];
        return {
          id: `series_${i + 1}`,
          nameFa: s.nameFa,
          nameEn: s.nameEn,
          group: `series_${i + 1}`,
          colorDark: color.dark,
          colorLight: color.light,
          marker: marker,
          strokeDash: "",
          opacity: 1,
          errValues: s.errValues && s.errValues.length === s.yValues.length ? s.errValues : null,
          yValues: s.yValues,
          visible: true
        };
      });

      dataset.xValues = parsed.xValues;
      dataset.series = newSeries;

      // Configure direct callout arrows dynamically
      state.callouts = {};
      state.showAnnotations = true;
      state.showInplotLegend = false;
      state.showBottomLegend = false;
      state.showHysteresis = true;

      const chkHyst = document.getElementById("chkHysteresis");
      if (chkHyst) chkHyst.checked = true;
      const chkAnnotations = document.getElementById("chkShowAnnotations");
      if (chkAnnotations) chkAnnotations.checked = true;
      const chkInplot = document.getElementById("chkShowInplotLegend");
      if (chkInplot) chkInplot.checked = false;
      const chkBottom = document.getElementById("chkShowBottomLegend");
      if (chkBottom) chkBottom.checked = false;

      // Automatically scale axes
      autoScaleAxis();
      
      setupSeriesCheckboxes();
      setupCalloutsControls();
      renderDataTable();
      renderChart();
      renderLegend();
      showToast(`فایل با موفقیت بارگذاری شد (${dataset.xValues.length} نقطه مسیر رفت و برگشت)`);
    } catch(err) {
      console.error("Excel import error:", err);
      showToast("خطا در بارگذاری اکسل: " + (err.message || "فایل نامعتبر"));
    }
  };
  reader.readAsArrayBuffer(file);
  e.target.value = ""; // Reset file input
}


// --- 12. Toast Notification ---
function showToast(message) {
  if (!appToast) return;
  if (toastMsg) toastMsg.textContent = message;
  appToast.classList.add("show");
  setTimeout(() => {
    appToast.classList.remove("show");
  }, 3500);
}

// --- 13. Copy Image to Clipboard ---
async function copyImageToClipboard() {
  try {
    const svgString = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = async () => {
      const scale = parseInt(exportDpiSelect ? exportDpiSelect.value : "3", 10);
      const canvas = document.createElement("canvas");
      canvas.width = chartBox.width * scale;
      canvas.height = chartBox.height * scale;
      const ctx = canvas.getContext("2d");

      if (state.type.transparentBg) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = state.type.plotBg || (state.theme === "dark" ? "#0f172a" : "#ffffff");
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async blob => {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob })
          ]);
          showToast("تصویر با موفقیت در کلیپ‌بورد کپی شد (می‌توانید در Word یا پاورپوینت پیست کنید).");
        } catch (err) {
          // Fallback to direct download if clipboard permission denied
          exportPng();
        }
      }, "image/png");

      URL.revokeObjectURL(blobURL);
    };
    img.src = blobURL;
  } catch (err) {
    exportPng();
  }
}

// --- 14. Export High-Res PNG ---
function exportPng() {
  const svgString = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const URL = window.URL || window.webkitURL || window;
  const blobURL = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const scale = parseInt(exportDpiSelect ? exportDpiSelect.value : "3", 10);
    const canvas = document.createElement("canvas");
    canvas.width = chartBox.width * scale;
    canvas.height = chartBox.height * scale;
    const ctx = canvas.getContext("2d");

    if (state.type.transparentBg) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = state.type.plotBg || (state.theme === "dark" ? "#0f172a" : "#ffffff");
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.download = `scatter-plot-RH-deltaF-${state.theme}-${state.lang}-${scale * 100}dpi.png`;
    downloadLink.href = pngUrl;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(blobURL);

    showToast("تصویر با کیفیت عالی ذخیره شد.");
  };
  img.src = blobURL;
}

// --- 15. Export Vector SVG ---
function exportSvg() {
  let svgString = new XMLSerializer().serializeToString(svg);
  if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svgString = svgString.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  }
  const fullSvg = `<?xml version="1.0" encoding="UTF-8"?>\n` + svgString;
  const blob = new Blob([fullSvg], { type: "image/svg+xml;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.download = `academic-scatter-plot-${state.theme}-${state.lang}.svg`;
  downloadLink.href = url;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  window.URL.revokeObjectURL(url);
  showToast("فایل وکتور SVG دانلود شد.");
}

// --- 16. Language & Theme ---
function setLanguagePreset(newLang) {
  state.lang = newLang;
  const p = presets[newLang];

  document.documentElement.dir = newLang === "fa" ? "rtl" : "ltr";
  document.documentElement.lang = newLang;

  state.chartTitle = p.chartTitle;
  state.chartSubtitle = p.chartSubtitle;
  state.xTitle = p.xTitle;
  state.yTitle = p.yTitle;

  if (inputChartTitle) inputChartTitle.value = state.chartTitle;
  if (inputChartSubtitle) inputChartSubtitle.value = state.chartSubtitle;
  if (inputXTitle) inputXTitle.value = state.xTitle;
  if (inputYTitle) inputYTitle.value = state.yTitle;

  if (displayChartTitle) displayChartTitle.textContent = state.chartTitle;
  if (displayChartSubtitle) displayChartSubtitle.textContent = state.chartSubtitle;

  if (btnTitleLangFa && btnTitleLangEn) {
    if (newLang === "fa") {
      btnTitleLangFa.classList.add("active");
      btnTitleLangEn.classList.remove("active");
    } else {
      btnTitleLangEn.classList.add("active");
      btnTitleLangFa.classList.remove("active");
    }
  }

  if (langBtnText) langBtnText.textContent = newLang === "fa" ? "English" : "فارسی";

  applyStaticLang();
  setupSeriesCheckboxes();
  setupCalloutsControls();
  renderDataTable();
  syncUIFromState();
  renderChart();
  renderLegend();
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  document.body.className = `theme-${state.theme}`;
  if (themeBtnText) themeBtnText.textContent = state.theme === "dark" ? "تم روشن دانشگاهی" : "تم تیره مدرن";
  renderChart();
  renderLegend();
}

// --- Setup dynamic checkboxes ---
function setupSeriesCheckboxes() {
  const container = document.getElementById("seriesCheckboxesContainer");
  if (!container) return;
  container.innerHTML = "";
  
  dataset.series.forEach((s) => {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.gap = "8px";
    wrapper.style.marginBottom = "8px";

    const lbl = document.createElement("label");
    lbl.className = "custom-checkbox";
    lbl.style.margin = "0";
    lbl.innerHTML = `
      <input type="checkbox" id="chk_${s.id}" ${s.visible ? "checked" : ""}>
      <span class="chk-box" style="border-color: ${state.theme === 'dark' ? s.colorDark : s.colorLight};"></span>
    `;
    lbl.querySelector("input").addEventListener("change", (e) => {
      s.visible = e.target.checked;
      renderChart();
      renderLegend();
    });

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = state.lang === 'fa' ? s.nameFa : s.nameEn;
    nameInput.style.cssText = "background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-color); border-radius: 4px; padding: 2px 6px; font-family: inherit; font-size: 13px; width: 110px; margin-left: 5px;";
    nameInput.addEventListener("input", (e) => {
      s.nameFa = e.target.value;
      s.nameEn = e.target.value;
      renderChart();
      renderLegend();
      renderDataTable();
    });

    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.value = state.theme === 'dark' ? s.colorDark : s.colorLight;
    colorPicker.style.width = "28px";
    colorPicker.style.height = "28px";
    colorPicker.style.border = "none";
    colorPicker.style.cursor = "pointer";
    colorPicker.style.background = "none";
    colorPicker.addEventListener("input", (e) => {
      s.colorDark = e.target.value;
      s.colorLight = e.target.value;
      lbl.querySelector(".chk-box").style.borderColor = e.target.value;
      renderChart();
      renderLegend();
    });

    wrapper.appendChild(lbl);
    wrapper.appendChild(nameInput);
    wrapper.appendChild(colorPicker);
    container.appendChild(wrapper);

    // --- Per-series style row: marker shape / dash pattern / opacity ---
    const isFaS = state.lang === "fa";
    const styleRow = document.createElement("div");
    styleRow.style.cssText = "display: flex; align-items: center; gap: 6px; margin: 0 0 10px 0; padding-right: 26px; flex-wrap: wrap;";
    const selCss = "background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-color); border-radius: 4px; padding: 3px 4px; font-family: inherit; font-size: 12px; cursor: pointer;";

    const markerSel = document.createElement("select");
    markerSel.style.cssText = selCss;
    markerSel.title = isFaS ? "شکل مارکر" : "Marker shape";
    [["circle", "●"], ["square", "■"], ["diamond", "◆"], ["triangle", "▲"], ["cross", "✕"], ["plus", "＋"]]
      .forEach(([v, glyph]) => {
        const o = document.createElement("option");
        o.value = v;
        o.textContent = `${glyph} ${v}`;
        markerSel.appendChild(o);
      });
    markerSel.value = s.marker || "circle";
    markerSel.addEventListener("change", e => {
      s.marker = e.target.value;
      renderChart();
      renderLegend();
    });

    const dashSel = document.createElement("select");
    dashSel.style.cssText = selCss;
    dashSel.title = isFaS ? "نوع خط" : "Line style";
    [["", isFaS ? "― پیوسته" : "― solid"], ["6,5", isFaS ? "- - خط‌چین" : "- - dashed"],
     ["2,3", isFaS ? "· · نقطه‌چین" : "· · dotted"], ["10,4,2,4", isFaS ? "-·-· نقطه-خط" : "-·-· dash-dot"],
     ["12,4", isFaS ? "▬ خط بلند" : "▬ long dash"]]
      .forEach(([v, label]) => {
        const o = document.createElement("option");
        o.value = v;
        o.textContent = label;
        dashSel.appendChild(o);
      });
    dashSel.value = s.strokeDash || "";
    dashSel.addEventListener("change", e => {
      s.strokeDash = e.target.value;
      renderChart();
      renderLegend();
    });

    const opWrap = document.createElement("label");
    opWrap.style.cssText = "display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: var(--text-muted);";
    opWrap.title = isFaS ? "شفافیت سری" : "Series opacity";
    const opText = document.createElement("span");
    opText.textContent = isFaS ? "شفافیت" : "α";
    const opRange = document.createElement("input");
    opRange.type = "range";
    opRange.min = "10";
    opRange.max = "100";
    opRange.step = "5";
    opRange.value = String(Math.round((typeof s.opacity === "number" ? s.opacity : 1) * 100));
    opRange.style.width = "84px";
    const opVal = document.createElement("span");
    opVal.textContent = `${opRange.value}%`;
    opRange.addEventListener("input", e => {
      s.opacity = parseInt(e.target.value, 10) / 100;
      opVal.textContent = `${e.target.value}%`;
      renderChart();
      renderLegend();
    });
    opWrap.appendChild(opText);
    opWrap.appendChild(opRange);
    opWrap.appendChild(opVal);

    styleRow.appendChild(markerSel);
    styleRow.appendChild(dashSel);
    styleRow.appendChild(opWrap);
    container.appendChild(styleRow);
  });
}


// --- 17. Event Listeners ---
function initEvents() {
  if (langToggleBtn) langToggleBtn.addEventListener("click", () => setLanguagePreset(state.lang === "fa" ? "en" : "fa"));
  if (btnTitleLangFa) btnTitleLangFa.addEventListener("click", () => setLanguagePreset("fa"));
  if (btnTitleLangEn) btnTitleLangEn.addEventListener("click", () => setLanguagePreset("en"));

  if (themeToggleBtn) themeToggleBtn.addEventListener("click", toggleTheme);
  if (exportPngBtn) exportPngBtn.addEventListener("click", exportPng);
  if (exportSvgBtn) exportSvgBtn.addEventListener("click", exportSvg);
  if (copyImageBtn) copyImageBtn.addEventListener("click", copyImageToClipboard);

  // Plot Mode
  if (btnModeScatterLine) {
    btnModeScatterLine.addEventListener("click", () => {
      state.plotMode = "scatter-line";
      btnModeScatterLine.classList.add("active");
      if (btnModeScatterOnly) btnModeScatterOnly.classList.remove("active");
      renderChart();
      renderLegend();
    });
  }

  if (btnModeScatterOnly) {
    btnModeScatterOnly.addEventListener("click", () => {
      state.plotMode = "scatter-only";
      btnModeScatterOnly.classList.add("active");
      if (btnModeScatterLine) btnModeScatterLine.classList.remove("active");
      renderChart();
      renderLegend();
    });
  }

  // Journal Frame Style
  if (btnFrameBoxed) {
    btnFrameBoxed.addEventListener("click", () => {
      state.frameStyle = "boxed";
      btnFrameBoxed.classList.add("active");
      if (btnFrameOpen) btnFrameOpen.classList.remove("active");
      renderChart();
    });
  }

  if (btnFrameOpen) {
    btnFrameOpen.addEventListener("click", () => {
      state.frameStyle = "open";
      btnFrameOpen.classList.add("active");
      if (btnFrameBoxed) btnFrameBoxed.classList.remove("active");
      renderChart();
    });
  }

  // Marker Size & Line Width Sliders
  if (rngMarkerSize) {
    rngMarkerSize.addEventListener("input", e => {
      state.markerSize = parseInt(e.target.value, 10);
      if (valMarkerSize) valMarkerSize.textContent = `${state.markerSize} px`;
      renderChart();
    });
  }

  if (rngLineWidth) {
    rngLineWidth.addEventListener("input", e => {
      state.lineWidth = parseFloat(e.target.value);
      if (valLineWidth) valLineWidth.textContent = `${state.lineWidth} px`;
      renderChart();
    });
  }

  // Title inputs
  if (inputChartTitle) {
    inputChartTitle.addEventListener("input", e => {
      state.chartTitle = e.target.value;
      if (displayChartTitle) displayChartTitle.textContent = state.chartTitle;
      renderChart();
    });
  }

  if (inputChartSubtitle) {
    inputChartSubtitle.addEventListener("input", e => {
      state.chartSubtitle = e.target.value;
      if (displayChartSubtitle) displayChartSubtitle.textContent = state.chartSubtitle;
      renderChart();
    });
  }

  if (inputXTitle) {
    inputXTitle.addEventListener("input", e => {
      state.xTitle = e.target.value;
      renderChart();
    });
  }

  if (inputYTitle) {
    inputYTitle.addEventListener("input", e => {
      state.yTitle = e.target.value;
      renderChart();
    });
  }

  if (rngInplotX) {
    rngInplotX.addEventListener("input", e => {
      state.callouts.inplotX = parseInt(e.target.value, 10);
      if (valInplotX) valInplotX.textContent = `${state.callouts.inplotX} px`;
      renderChart();
    });
  }

  if (rngInplotY) {
    rngInplotY.addEventListener("input", e => {
      state.callouts.inplotY = parseInt(e.target.value, 10);
      if (valInplotY) valInplotY.textContent = `${state.callouts.inplotY} px`;
      renderChart();
    });
  }

  // Reset Button
  if (btnResetPositions) {
    btnResetPositions.addEventListener("click", () => {
      state.callouts = {};
      state.callouts.inplotX = 160;
      state.callouts.inplotY = 280;

      if (rngInplotX) rngInplotX.value = 160;
      if (rngInplotY) rngInplotY.value = 280;
      if (valInplotX) valInplotX.textContent = "160 px";
      if (valInplotY) valInplotY.textContent = "280 px";

      setupCalloutsControls();
      renderChart();
      showToast(state.lang === "fa" ? "موقعیت فلش‌ها و راهنما به حالت پیش‌فرض بازنشانی شد." : "Positions reset to default.");
    });
  }

  // Table buttons
  if (btnApplyTableData) btnApplyTableData.addEventListener("click", applyTableData);
  if (btnExportTemplate) btnExportTemplate.addEventListener("click", exportExcelTemplate);
  if (btnAddRow) btnAddRow.addEventListener("click", addRow);
  if (excelImportInput) excelImportInput.addEventListener("change", importExcelFile);

  // Drag and drop Excel files directly into window
  window.addEventListener("dragover", e => {
    e.preventDefault();
  });
  window.addEventListener("drop", e => {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
        importExcelFile({ target: { files: [droppedFile], value: "" } });
      }
    }
  });

  // Advanced Options
  const chkHysteresis = document.getElementById("chkHysteresis");
  if (chkHysteresis) chkHysteresis.addEventListener("change", e => {
    state.showHysteresis = e.target.checked;
    renderChart();
  });

  const chkTrendline = document.getElementById("chkTrendline");
  if (chkTrendline) chkTrendline.addEventListener("change", e => {
    state.showTrendlines = e.target.checked;
    renderChart();
  });

  const chkShowCalloutBox = document.getElementById("chkShowCalloutBox");
  if (chkShowCalloutBox) chkShowCalloutBox.addEventListener("change", e => {
    state.showCalloutBox = e.target.checked;
    renderChart();
  });

  const btnAutoScaleAxis = document.getElementById("btnAutoScaleAxis");
  if (btnAutoScaleAxis) {
    btnAutoScaleAxis.addEventListener("click", () => {
      autoScaleAxis();
      renderChart();
      showToast("مقیاس محورها به صورت خودکار تنظیم شد.");
    });
  }

  ['inpXMin', 'inpXMax', 'inpXStep', 'inpYMin', 'inpYMax', 'inpYStep'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      const handler = e => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
          if (id === 'inpXMin') state.axis.xMin = val;
          if (id === 'inpXMax') state.axis.xMax = val;
          if (id === 'inpXStep') state.axis.xStep = Math.max(0.0001, val);
          if (id === 'inpYMin') state.axis.yMin = val;
          if (id === 'inpYMax') state.axis.yMax = val;
          if (id === 'inpYStep') state.axis.yStep = Math.max(0.0001, val);
          renderChart();
        }
      };
      el.addEventListener("input", handler);
      el.addEventListener("change", handler);
    }
  });
}

// --- 18. Layout / Ticks / Type / Curve / Magnifier controls, presets & persistence ---
const $id = id => document.getElementById(id);

function setChk(id, val) { const el = document.getElementById(id); if (el) el.checked = !!val; }
function setSel(id, val) { const el = document.getElementById(id); if (el) el.value = String(val); }
function setText(id, val) { const el = document.getElementById(id); if (el != null && el.textContent !== String(val)) el.textContent = val; }
function setInp(id, val) { const el = document.getElementById(id); if (el && document.activeElement !== el) el.value = val; }

function syncSeg(attr, value) {
  document.querySelectorAll(`.segmented-control .seg-btn[data-${attr}]`).forEach(b => {
    b.classList.toggle("active", b.getAttribute(`data-${attr}`) === String(value));
  });
}

// Bilingual labels for every element carrying data-fa / data-en
function applyStaticLang() {
  const lang = state.lang === "en" ? "en" : "fa";
  document.querySelectorAll("[data-fa][data-en]").forEach(el => {
    const txt = el.getAttribute(`data-${lang}`);
    if (txt != null) el.textContent = txt;
  });
}

function updateExportSize() {
  const dpi = parseInt(exportDpiSelect ? exportDpiSelect.value : "3", 10) * 100;
  const scale = parseInt(exportDpiSelect ? exportDpiSelect.value : "3", 10);
  const mmW = Math.round(chartBox.width * 0.254);
  const mmH = Math.round(chartBox.height * 0.254);
  setText("valExportSize", `${mmW} × ${mmH} mm  (Px: ${chartBox.width * scale} × ${chartBox.height * scale} @ ${dpi} DPI)`);
}

// Push the whole state into every control (used on boot, preset apply and import)
function syncUIFromState() {
  const L = state.layout, T = state.ticks, Y = state.type, D = state.data, Z = state.zoom;

  document.body.className = `theme-${state.theme}`;
  if (themeBtnText) themeBtnText.textContent = state.theme === "dark" ? "تم روشن دانشگاهی" : "تم تیره مدرن";
  if (langBtnText) langBtnText.textContent = state.lang === "fa" ? "English" : "فارسی";

  syncSeg("lang", state.lang);
  syncSeg("mode", state.plotMode);
  syncSeg("frame", state.frameStyle);
  syncSeg("origin", L.axisOrigin);
  syncSeg("titleplace", Y.titlePlacement);

  if (inputChartTitle) inputChartTitle.value = state.chartTitle;
  if (inputChartSubtitle) inputChartSubtitle.value = state.chartSubtitle;
  if (inputXTitle) inputXTitle.value = state.xTitle;
  if (inputYTitle) inputYTitle.value = state.yTitle;
  if (displayChartTitle) displayChartTitle.textContent = state.chartTitle;
  if (displayChartSubtitle) displayChartSubtitle.textContent = state.chartSubtitle;

  if (rngMarkerSize) rngMarkerSize.value = state.markerSize;
  setText("valMarkerSize", `${state.markerSize} px`);
  if (rngLineWidth) rngLineWidth.value = state.lineWidth;
  setText("valLineWidth", `${state.lineWidth} px`);

  setInp("inpXMin", state.axis.xMin); setInp("inpXMax", state.axis.xMax); setInp("inpXStep", state.axis.xStep);
  setInp("inpYMin", state.axis.yMin); setInp("inpYMax", state.axis.yMax); setInp("inpYStep", state.axis.yStep);

  setChk("chkTrendline", state.showTrendlines);
  setChk("chkShowCalloutBox", state.showCalloutBox);
  setChk("chkHysteresis", state.showHysteresis);
  setChk("chkShowAnnotations", state.showAnnotations);
  setChk("chkShowErrorBand", state.showErrorBand);
  setChk("chkShowInplotLegend", state.showInplotLegend);
  setChk("chkShowBottomLegend", state.showBottomLegend);
  setChk("chkShowDataLabels", state.showDataLabels);
  setChk("chkShowGrid", state.showGrid);
  if (grpInplotX) grpInplotX.style.display = state.showInplotLegend ? "block" : "none";
  if (grpInplotY) grpInplotY.style.display = state.showInplotLegend ? "block" : "none";
  if (rngInplotX) rngInplotX.value = state.callouts.inplotX || 160;
  if (rngInplotY) rngInplotY.value = state.callouts.inplotY || 280;
  setText("valInplotX", `${state.callouts.inplotX || 160} px`);
  setText("valInplotY", `${state.callouts.inplotY || 280} px`);

  // Layout
  ["Top", "Right", "Bottom", "Left"].forEach(side => {
    const key = `margin${side}`;
    const el = document.getElementById(`rngMargin${side}`);
    if (el) el.value = L[key];
    setText(`valMargin${side}`, `${L[key]} px`);
  });
  setSel("selCanvasPreset", L.preset || "custom");
  setChk("chkReverseX", L.reverseX);
  setChk("chkReverseY", L.reverseY);

  // Ticks
  setSel("selMinorTicks", T.minor);
  setSel("selTickDir", T.direction);
  if (document.getElementById("rngTickLength")) document.getElementById("rngTickLength").value = T.length;
  setText("valTickLength", `${T.length} px`);
  setSel("selDecimals", T.decimals);
  setChk("chkThousands", T.thousands);
  setChk("chkScientific", T.scientific);
  setSel("selLabelRotate", T.xLabelRotate);
  setSel("selLabelEvery", T.labelEvery);
  setChk("chkLogX", T.xLog);
  setChk("chkLogY", T.yLog);

  // Type & color
  [["TickFont", Y.tickFont], ["AxisTitleFont", Y.axisTitleFont], ["LegendFont", Y.legendFont], ["DataLabelFont", Y.dataLabelFont]].forEach(([k, v]) => {
    const el = document.getElementById(`rng${k}`);
    if (el) el.value = v;
    setText(`val${k}`, `${v} px`);
  });
  setSel("selFontFamily", Y.fontFamily);
  const bgInp = document.getElementById("inpPlotBg");
  if (bgInp) bgInp.value = Y.plotBg || (state.theme === "dark" ? "#0f172a" : "#ffffff");
  setChk("chkTransparentBg", Y.transparentBg);
  setSel("selGridStyle", Y.gridStyle);
  if (document.getElementById("rngGridOpacity")) document.getElementById("rngGridOpacity").value = Math.round(Y.gridOpacity * 100);
  setText("valGridOpacity", `${Math.round(Y.gridOpacity * 100)}%`);
  setSel("selGridAxis", Y.gridAxis);

  // Curve & data
  setSel("selSmoothing", D.smoothing);
  setSel("selYTransform", D.yTransform);
  setChk("chkSortByX", D.sortByX);
  setChk("chkErrorBars", D.showErrorBars);

  // Magnifier
  setChk("chkZoomEnabled", Z.enabled);
  syncZoomInputs();
  if (document.getElementById("rngZoomW")) document.getElementById("rngZoomW").value = Z.boxW;
  setText("valZoomW", `${Math.round(Z.boxW)} px`);
  if (document.getElementById("rngZoomH")) document.getElementById("rngZoomH").value = Z.boxH;
  setText("valZoomH", `${Math.round(Z.boxH)} px`);
  syncZoomBoxSliders();
  setChk("chkZoomRegionBox", Z.showRegionBox);
  setChk("chkZoomTitles", Z.showTitles);

  updateExportSize();
}

// --- Magnifier helpers ---
function syncZoomInputs() {
  const reg = getZoomRegion();
  setInp("inpZoomX0", roundTick(reg.x0));
  setInp("inpZoomX1", roundTick(reg.x1));
  setInp("inpZoomY0", roundTick(reg.y0));
  setInp("inpZoomY1", roundTick(reg.y1));
}

function syncZoomBoxSliders() {
  const box = getZoomBox();
  const rx = document.getElementById("rngZoomBoxX");
  const ry = document.getElementById("rngZoomBoxY");
  if (rx) {
    rx.min = Math.round(plotArea.x);
    rx.max = Math.max(rx.min + 1, Math.round(plotArea.x + plotArea.width - box.w));
    rx.value = Math.round(box.x);
  }
  if (ry) {
    ry.min = Math.round(plotArea.y);
    ry.max = Math.max(ry.min + 1, Math.round(plotArea.y + plotArea.height - box.h));
    ry.value = Math.round(box.y);
  }
  setText("valZoomBoxX", `${Math.round(box.x)} px`);
  setText("valZoomBoxY", `${Math.round(box.y)} px`);

  const padX = 16, padY = 16;
  const nearL = box.x <= plotArea.x + padX + 8;
  const nearT = box.y <= plotArea.y + padY + 8;
  const nearR = box.x >= plotArea.x + plotArea.width - box.w - padX - 8;
  const nearB = box.y >= plotArea.y + plotArea.height - box.h - padY - 8;
  let corner = "";
  if (nearT && nearR) corner = "tr";
  else if (nearT && nearL) corner = "tl";
  else if (nearB && nearR) corner = "br";
  else if (nearB && nearL) corner = "bl";
  if (corner) syncSeg("corner", corner);
}

function setZoomRegion(x0, x1, y0, y1) {
  state.zoom.x0 = x0; state.zoom.x1 = x1; state.zoom.y0 = y0; state.zoom.y1 = y1;
  syncZoomInputs();
  renderChart();
}

function resetZoomRegion() {
  state.zoom.x0 = null; state.zoom.x1 = null; state.zoom.y0 = null; state.zoom.y1 = null;
  syncZoomInputs();
  renderChart();
  showToast(state.lang === "fa" ? "ناحیه ذره‌بین به بازه کامل محور برگشت." : "Magnifier region reset to full axis range.");
}

function fitZoomToData() {
  if (!dataset.xValues.length) return;
  let yAll = [];
  dataset.series.forEach(s => {
    if (!s.visible || !s.yValues) return;
    for (let i = 0; i < s.yValues.length; i++) yAll.push(displayY(s, i));
  });
  if (!yAll.length) return;
  const xs = dataset.xValues.slice().sort((a, b) => a - b);
  const x0 = xs[0], x1 = xs[xs.length - 1];
  const y0 = Math.min(...yAll), y1 = Math.max(...yAll);
  const padx = (x1 - x0) * 0.04 || 1;
  const pady = (y1 - y0) * 0.1 || 1;
  setZoomRegion(x0 - padx, x1 + padx, y0 - pady, y1 + pady);
}

let zoomBandDrag = null;

function initZoomInteractions() {
  if (!svg) return;

  svg.addEventListener("mousedown", e => {
    if (!state.zoom.enabled || activeDrag) return;
    if (e.target && e.target.closest && e.target.closest(".point-group, .draggable-badge, .draggable-target, .zoom-inset")) return;
    const c = getSvgCoords(e);
    if (c.x < plotArea.x || c.x > plotArea.x + plotArea.width || c.y < plotArea.y || c.y > plotArea.y + plotArea.height) return;
    zoomBandDrag = { x0: c.x, y0: c.y };
    e.preventDefault();
  });

  window.addEventListener("mousemove", e => {
    if (!zoomBandDrag) return;
    const c = getSvgCoords(e);
    const band = document.getElementById("zoomBandRect");
    if (band) {
      band.setAttribute("x", Math.min(zoomBandDrag.x0, c.x));
      band.setAttribute("y", Math.min(zoomBandDrag.y0, c.y));
      band.setAttribute("width", Math.abs(c.x - zoomBandDrag.x0));
      band.setAttribute("height", Math.abs(c.y - zoomBandDrag.y0));
      band.style.display = "block";
    }
  });

  window.addEventListener("mouseup", e => {
    if (!zoomBandDrag) return;
    const c = getSvgCoords(e);
    const band = document.getElementById("zoomBandRect");
    if (band) band.style.display = "none";
    const drag = zoomBandDrag;
    zoomBandDrag = null;
    if (Math.abs(c.x - drag.x0) < 10 || Math.abs(c.y - drag.y0) < 10) return;

    const a = unmapX(drag.x0), b = unmapX(c.x);
    const cy0 = unmapY(drag.y0), cy1 = unmapY(c.y);
    setZoomRegion(Math.min(a, b), Math.max(a, b), Math.min(cy0, cy1), Math.max(cy0, cy1));
    showToast(state.lang === "fa" ? "ناحیه بزرگ‌نمایی تنظیم شد." : "Magnified region updated.");
  });

  svg.addEventListener("dblclick", () => {
    if (state.zoom.enabled) resetZoomRegion();
  });
}

// --- Settings persistence (localStorage + JSON files) ---
const SETTINGS_KEY = "freebuff.scatter.settings.v1";

function serializeSettings() {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    lang: state.lang,
    theme: state.theme,
    plotMode: state.plotMode,
    frameStyle: state.frameStyle,
    markerSize: state.markerSize,
    lineWidth: state.lineWidth,
    showErrorBand: state.showErrorBand,
    showAnnotations: state.showAnnotations,
    showInplotLegend: state.showInplotLegend,
    showBottomLegend: state.showBottomLegend,
    showDataLabels: state.showDataLabels,
    showGrid: state.showGrid,
    showHysteresis: state.showHysteresis,
    showTrendlines: state.showTrendlines,
    showCalloutBox: state.showCalloutBox,
    chartTitle: state.chartTitle,
    chartSubtitle: state.chartSubtitle,
    xTitle: state.xTitle,
    yTitle: state.yTitle,
    axis: Object.assign({}, state.axis),
    layout: Object.assign({}, state.layout),
    ticks: Object.assign({}, state.ticks),
    type: Object.assign({}, state.type),
    data: Object.assign({}, state.data),
    zoom: Object.assign({}, state.zoom),
    callouts: JSON.parse(JSON.stringify(state.callouts)),
    series: dataset.series.map(s => ({
      id: s.id, nameFa: s.nameFa, nameEn: s.nameEn,
      colorDark: s.colorDark, colorLight: s.colorLight,
      marker: s.marker, strokeDash: s.strokeDash || "",
      opacity: typeof s.opacity === "number" ? s.opacity : 1,
      visible: !!s.visible
    }))
  };
}

function applySettings(obj) {
  if (!obj || typeof obj !== "object") return false;
  const s = obj.state && typeof obj.state === "object" ? obj.state : obj;
  const scalars = ["lang", "theme", "plotMode", "frameStyle", "markerSize", "lineWidth",
    "showErrorBand", "showAnnotations", "showInplotLegend", "showBottomLegend", "showDataLabels",
    "showGrid", "showHysteresis", "showTrendlines", "showCalloutBox",
    "chartTitle", "chartSubtitle", "xTitle", "yTitle"];
  scalars.forEach(k => { if (s[k] !== undefined) state[k] = s[k]; });
  ["axis", "layout", "ticks", "type", "data", "zoom"].forEach(k => {
    if (s[k] && typeof s[k] === "object") Object.assign(state[k], s[k]);
  });
  if (s.callouts && typeof s.callouts === "object") state.callouts = s.callouts;
  if (Array.isArray(s.series)) {
    s.series.forEach(src => {
      const t = dataset.series.find(x => x.id === src.id) || dataset.series[src.index];
      if (!t) return;
      ["nameFa", "nameEn", "colorDark", "colorLight", "marker", "strokeDash", "opacity", "visible"]
        .forEach(k => { if (src[k] !== undefined) t[k] = src[k]; });
    });
  }
  applyLayoutToGeometry();
  applyStaticLang();
  setupSeriesCheckboxes();
  setupCalloutsControls();
  syncUIFromState();
  renderChart();
  renderLegend();
  return true;
}

let saveTimer = null;
function queueSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(serializeSettings()));
    } catch (e) { /* storage may be unavailable (private mode) */ }
  }, 500);
}

function restoreSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return false;
    return applySettings(JSON.parse(raw));
  } catch (e) {
    return false;
  }
}

function exportSettingsFile() {
  const blob = new Blob([JSON.stringify(serializeSettings(), null, 2)], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.download = `scatter-settings-${state.lang}-${state.theme}.json`;
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  showToast(state.lang === "fa" ? "فایل تنظیمات دانلود شد." : "Settings file downloaded.");
}

function importSettingsFile(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    try {
      const obj = JSON.parse(evt.target.result);
      if (applySettings(obj)) {
        showToast(state.lang === "fa" ? "تنظیمات با موفقیت بارگذاری شد." : "Settings loaded successfully.");
      } else {
        showToast(state.lang === "fa" ? "فایل تنظیمات معتبر نیست." : "Invalid settings file.");
      }
    } catch (err) {
      showToast(state.lang === "fa" ? "خطا در خواندن فایل تنظیمات." : "Could not read the settings file.");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
}

function applyJournalPreset(key) {
  const p = JOURNAL_PRESETS[key];
  if (!p) return;
  state.frameStyle = p.frameStyle;
  state.plotMode = p.plotMode;
  state.markerSize = p.markerSize;
  state.lineWidth = p.lineWidth;
  if (p.showGrid !== undefined) state.showGrid = p.showGrid;
  Object.assign(state.layout, p.layout);
  Object.assign(state.type, p.type);
  Object.assign(state.ticks, p.ticks);
  applyLayoutToGeometry();
  syncUIFromState();
  setupCalloutsControls();
  renderChart();
  renderLegend();
  const name = state.lang === "fa" ? p.labelFa : p.labelEn;
  showToast(state.lang === "fa" ? `پیش‌تنظیم «${name}» اعمال شد.` : `Preset "${name}" applied.`);
}

// Log axes need strictly positive bounds — nudge the minimum if needed
function ensureLogBounds(axis) {
  const minKey = axis === "x" ? "xMin" : "yMin";
  const maxKey = axis === "x" ? "xMax" : "yMax";
  if (state.axis[minKey] > 0) return;
  const mx = state.axis[maxKey];
  state.axis[minKey] = mx > 0 ? Math.pow(10, Math.floor(Math.log10(mx)) - 2) : 1;
  if (!(state.axis[maxKey] > state.axis[minKey])) state.axis[maxKey] = state.axis[minKey] * 100;
  const inp = document.getElementById(axis === "x" ? "inpXMin" : "inpYMin");
  if (inp) inp.value = state.axis[minKey];
  showToast(state.lang === "fa"
    ? `مقیاس لگاریتمی به حداقل مثبت ${state.axis[minKey]} محدود شد.`
    : `Log axis minimum clamped to ${state.axis[minKey]}.`);
}

// --- Wiring for every new control ---
function initAdvancedEvents() {
  const on = (id, ev, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(ev, fn);
  };
  const redraw = () => { renderChart(); };

  // 1. Layout: margins
  ["Top", "Right", "Bottom", "Left"].forEach(side => {
    on(`rngMargin${side}`, "input", e => {
      const v = parseInt(e.target.value, 10) || 0;
      state.layout[`margin${side}`] = v;
      setText(`valMargin${side}`, `${v} px`);
      state.layout.preset = "custom";
      setSel("selCanvasPreset", "custom");
      setupCalloutsControls();
      renderChart();
      updateExportSize();
    });
  });

  const CANVAS_PRESETS = {
    standard: [960, 560], wide: [1200, 560], compact: [760, 480], square: [760, 760],
    ratio43: [960, 720], ratio169: [1120, 630], double: [1280, 640]
  };
  on("selCanvasPreset", "change", e => {
    const key = e.target.value;
    state.layout.preset = key;
    if (CANVAS_PRESETS[key]) {
      state.layout.width = CANVAS_PRESETS[key][0];
      state.layout.height = CANVAS_PRESETS[key][1];
    }
    applyLayoutToGeometry();
    setupCalloutsControls();
    syncZoomBoxSliders();
    renderChart();
    updateExportSize();
  });

  document.querySelectorAll(".segmented-control .seg-btn[data-origin]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.layout.axisOrigin = btn.getAttribute("data-origin");
      syncSeg("origin", state.layout.axisOrigin);
      renderChart();
    });
  });

  on("chkReverseX", "change", e => { state.layout.reverseX = e.target.checked; renderChart(); });
  on("chkReverseY", "change", e => { state.layout.reverseY = e.target.checked; renderChart(); });

  // 2. Ticks & numbers
  on("selMinorTicks", "change", e => { state.ticks.minor = parseInt(e.target.value, 10) || 0; renderChart(); });
  on("selTickDir", "change", e => { state.ticks.direction = e.target.value; renderChart(); });
  on("rngTickLength", "input", e => {
    state.ticks.length = parseInt(e.target.value, 10) || 6;
    setText("valTickLength", `${state.ticks.length} px`);
    renderChart();
  });
  on("selDecimals", "change", e => { state.ticks.decimals = parseInt(e.target.value, 10); renderChart(); });
  on("chkThousands", "change", e => { state.ticks.thousands = e.target.checked; renderChart(); });
  on("chkScientific", "change", e => { state.ticks.scientific = e.target.checked; renderChart(); });
  on("selLabelRotate", "change", e => { state.ticks.xLabelRotate = parseInt(e.target.value, 10) || 0; renderChart(); });
  on("selLabelEvery", "change", e => { state.ticks.labelEvery = Math.max(1, parseInt(e.target.value, 10) || 1); renderChart(); });
  on("chkLogX", "change", e => {
    state.ticks.xLog = e.target.checked;
    if (e.target.checked) ensureLogBounds("x");
    renderChart(); syncZoomInputs();
  });
  on("chkLogY", "change", e => {
    state.ticks.yLog = e.target.checked;
    if (e.target.checked) ensureLogBounds("y");
    renderChart(); syncZoomInputs();
  });

  // 3. Type & color
  [["TickFont", "tickFont"], ["AxisTitleFont", "axisTitleFont"], ["LegendFont", "legendFont"], ["DataLabelFont", "dataLabelFont"]].forEach(([id, key]) => {
    on(`rng${id}`, "input", e => {
      state.type[key] = parseFloat(e.target.value);
      setText(`val${id}`, `${state.type[key]} px`);
      renderChart();
    });
  });
  on("selFontFamily", "change", e => { state.type.fontFamily = e.target.value; renderChart(); });
  on("inpPlotBg", "input", e => { state.type.plotBg = e.target.value; state.type.transparentBg = false; setChk("chkTransparentBg", false); renderChart(); });
  on("btnClearPlotBg", "click", () => {
    state.type.plotBg = "";
    const bgInp = document.getElementById("inpPlotBg");
    if (bgInp) bgInp.value = state.theme === "dark" ? "#0f172a" : "#ffffff";
    renderChart();
  });
  on("chkTransparentBg", "change", e => { state.type.transparentBg = e.target.checked; renderChart(); });
  on("selGridStyle", "change", e => { state.type.gridStyle = e.target.value; renderChart(); });
  on("rngGridOpacity", "input", e => {
    state.type.gridOpacity = (parseInt(e.target.value, 10) || 100) / 100;
    setText("valGridOpacity", `${Math.round(state.type.gridOpacity * 100)}%`);
    renderChart();
  });
  on("selGridAxis", "change", e => { state.type.gridAxis = e.target.value; renderChart(); });
  document.querySelectorAll(".segmented-control .seg-btn[data-titleplace]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.type.titlePlacement = btn.getAttribute("data-titleplace");
      syncSeg("titleplace", state.type.titlePlacement);
      renderChart();
    });
  });

  // 4. Curve & data shaping
  on("selSmoothing", "change", e => { state.data.smoothing = e.target.value; renderChart(); });
  on("selYTransform", "change", e => { state.data.yTransform = e.target.value; renderChart(); });
  on("chkSortByX", "change", e => { state.data.sortByX = e.target.checked; renderChart(); });
  on("chkErrorBars", "change", e => {
    const hasErr = dataset.series.some(s => s.errValues && s.errValues.length);
    state.data.showErrorBars = e.target.checked;
    if (e.target.checked && !hasErr) {
      showToast(state.lang === "fa"
        ? "ستون خطایی در داده‌ها یافت نشد (نام ستون باید err/SD/± باشد)."
        : "No error column found (header must contain err/SD/±). ");
    }
    renderChart();
  });

  // 5. Magnifier
  on("chkZoomEnabled", "change", e => {
    state.zoom.enabled = e.target.checked;
    renderChart();
    showToast(e.target.checked
      ? (state.lang === "fa" ? "روی نمودار مستطیل بکشید تا ناحیه بزرگ‌نمایی شود." : "Drag a rectangle on the plot to choose the region.")
      : "");
  });
  ["X0", "X1", "Y0", "Y1"].forEach(k => {
    on(`inpZoom${k}`, "change", e => {
      const v = parseFloat(e.target.value);
      if (isNaN(v)) { syncZoomInputs(); return; }
      const key = k === "X0" ? "x0" : k === "X1" ? "x1" : k === "Y0" ? "y0" : "y1";
      state.zoom[key] = v;
      renderChart();
    });
  });
  on("btnZoomFit", "click", () => fitZoomToData());
  on("btnZoomFull", "click", () => resetZoomRegion());
  on("rngZoomW", "input", e => {
    state.zoom.boxW = parseInt(e.target.value, 10) || 300;
    setText("valZoomW", `${state.zoom.boxW} px`);
    syncZoomBoxSliders();
    renderChart();
  });
  on("rngZoomH", "input", e => {
    state.zoom.boxH = parseInt(e.target.value, 10) || 190;
    setText("valZoomH", `${state.zoom.boxH} px`);
    syncZoomBoxSliders();
    renderChart();
  });
  on("rngZoomBoxX", "input", e => { state.zoom.boxX = parseInt(e.target.value, 10); renderChart(); });
  on("rngZoomBoxY", "input", e => { state.zoom.boxY = parseInt(e.target.value, 10); renderChart(); });
  document.querySelectorAll(".segmented-control .seg-btn[data-corner]").forEach(btn => {
    btn.addEventListener("click", () => {
      const corner = btn.getAttribute("data-corner");
      const box = getZoomBox();
      const padX = 16, padY = 16;
      state.zoom.boxX = corner.indexOf("l") !== -1
        ? plotArea.x + padX
        : plotArea.x + plotArea.width - box.w - padX;
      state.zoom.boxY = corner.indexOf("t") !== -1
        ? plotArea.y + padY
        : plotArea.y + plotArea.height - box.h - padY;
      syncSeg("corner", corner);
      syncZoomBoxSliders();
      renderChart();
    });
  });
  on("chkZoomRegionBox", "change", e => { state.zoom.showRegionBox = e.target.checked; renderChart(); });
  on("chkZoomTitles", "change", e => { state.zoom.showTitles = e.target.checked; renderChart(); });

  // 6. Journal presets & settings files
  document.querySelectorAll(".preset-btn[data-preset]").forEach(btn => {
    btn.addEventListener("click", () => applyJournalPreset(btn.getAttribute("data-preset")));
  });
  on("btnExportSettings", "click", () => exportSettingsFile());
  on("settingsImportInput", "change", e => importSettingsFile(e));
  on("btnResetSettings", "click", () => {
    if (state.lang === "fa" && !confirm("همه تنظیمات به حالت پیش‌فرض برمی‌گردد. ادامه می‌دهید؟")) return;
    if (state.lang === "en" && !confirm("Reset all settings to defaults?")) return;
    try { localStorage.removeItem(SETTINGS_KEY); } catch (err) { /* ignore */ }
    window.location.reload();
  });

  if (exportDpiSelect) exportDpiSelect.addEventListener("change", () => updateExportSize());
}

// Initial Boot
document.addEventListener("DOMContentLoaded", () => {
  applyLayoutToGeometry();
  restoreSettings();
  applyStaticLang();
  setupSeriesCheckboxes();
  setupCalloutsControls();
  renderDataTable();
  syncUIFromState();
  renderChart();
  renderLegend();
  initEvents();
  initAdvancedEvents();
  initZoomInteractions();
  state._booted = true;
});
