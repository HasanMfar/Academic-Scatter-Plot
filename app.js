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
  frameStyle: "boxed", // 'boxed' (four-sided frame) or 'open' (L-shape)
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
  fitModel: "linear", // 'linear' | 'polynomial2' | 'exponential' | 'power'
  showFitEquation: true,
  colorPalette: "default",
  peaks: {
    enabled: false,
    type: "maxima",
    sens: 3,
    showFWHM: true,
    showLabels: true
  },
  crosshair: {
    enabled: false
  },
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

// Curated scientific color palettes for academic publications
const SCIENTIFIC_PALETTES = {
  default: [
    { dark: '#06b6d4', light: '#0284c7' },
    { dark: '#f43f5e', light: '#e11d48' },
    { dark: '#10b981', light: '#059669' },
    { dark: '#f59e0b', light: '#d97706' },
    { dark: '#8b5cf6', light: '#6d28d9' },
    { dark: '#ec4899', light: '#be185d' }
  ],
  classic: [
    { dark: '#e64b35', light: '#b2182b' },
    { dark: '#4dbbd5', light: '#2166ac' },
    { dark: '#00a087', light: '#1b7837' },
    { dark: '#3c5488', light: '#253494' },
    { dark: '#f39b7f', light: '#d6604d' },
    { dark: '#8491b4', light: '#542788' }
  ],
  biomedical: [
    { dark: '#374e55', light: '#08306b' },
    { dark: '#df8f44', light: '#bd0026' },
    { dark: '#00a1d5', light: '#0570b0' },
    { dark: '#b24745', light: '#7f0000' },
    { dark: '#79af97', light: '#238b45' },
    { dark: '#6a6599', light: '#54278f' }
  ],
  engineering: [
    { dark: '#0072b2', light: '#004c7a' },
    { dark: '#d55e00', light: '#993d00' },
    { dark: '#009e73', light: '#00664b' },
    { dark: '#cc79a7', light: '#8c3b68' },
    { dark: '#f0e442', light: '#b3a700' },
    { dark: '#56b4e9', light: '#2277a8' }
  ],
  viridis: [
    { dark: '#440154', light: '#3b528b' },
    { dark: '#3b528b', light: '#21918c' },
    { dark: '#21918c', light: '#5ec962' },
    { dark: '#5ec962', light: '#fde725' },
    { dark: '#fde725', light: '#f98e09' },
    { dark: '#bc3754', light: '#57106e' }
  ],
  colorblind: [
    { dark: '#0173b2', light: '#015685' },
    { dark: '#de8f05', light: '#aa6d00' },
    { dark: '#029e73', light: '#01684c' },
    { dark: '#d55e00', light: '#9c4300' },
    { dark: '#cc78bc', light: '#964d85' },
    { dark: '#ca9161', light: '#8d603a' }
  ]
};

// Publication presets: one click applies a full figure look
const JOURNAL_PRESETS = {
  compact: {
    labelFa: "جمع‌وجور", labelEn: "Compact",
    frameStyle: "boxed", plotMode: "scatter-line",
    layout: { width: 900, height: 560, marginTop: 40, marginRight: 70, marginBottom: 78, marginLeft: 92, axisOrigin: "corner" },
    type: { fontFamily: "Arial", tickFont: 15, axisTitleFont: 18, legendFont: 12, dataLabelFont: 10.5, gridStyle: "dashed", gridOpacity: 0.7, titlePlacement: "above", transparentBg: false, plotBg: "" },
    ticks: { direction: "in", length: 5, minor: 0, decimals: -1, xLabelRotate: 0, labelEvery: 1 },
    markerSize: 9, lineWidth: 2.2
  },
  doubleColumn: {
    labelFa: "دو ستونی", labelEn: "Double-column",
    frameStyle: "boxed", plotMode: "scatter-line",
    layout: { width: 960, height: 540, marginTop: 36, marginRight: 60, marginBottom: 76, marginLeft: 88, axisOrigin: "corner" },
    type: { fontFamily: "Arial", tickFont: 14, axisTitleFont: 17, legendFont: 11.5, dataLabelFont: 10, gridStyle: "solid", gridOpacity: 0.45, titlePlacement: "above", transparentBg: false, plotBg: "" },
    ticks: { direction: "out", length: 6, minor: 1, decimals: -1, xLabelRotate: 0, labelEvery: 1 },
    markerSize: 8, lineWidth: 2.4
  },
  openFrame: {
    labelFa: "کادر باز سریف", labelEn: "Open frame, serif",
    frameStyle: "open", plotMode: "scatter-line",
    layout: { width: 920, height: 580, marginTop: 44, marginRight: 55, marginBottom: 80, marginLeft: 95, axisOrigin: "corner" },
    type: { fontFamily: "Times", tickFont: 15, axisTitleFont: 18, legendFont: 12, dataLabelFont: 10.5, gridStyle: "none", gridOpacity: 0.5, titlePlacement: "above", transparentBg: false, plotBg: "" },
    ticks: { direction: "out", length: 6, minor: 0, decimals: -1, xLabelRotate: 0, labelEvery: 1 },
    markerSize: 10, lineWidth: 2.6
  },
  axesAtZero: {
    labelFa: "محور از صفر", labelEn: "Axes at zero",
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

// --- Safe Bounds Calculation (prevents stack overflow with Math.min(...arr) on large datasets) ---
function arrayBounds(arr) {
  let min = Infinity;
  let max = -Infinity;
  if (!arr || !arr.length) return { min: 0, max: 1 };
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (typeof v === "number" && isFinite(v)) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  return { min: min === Infinity ? 0 : min, max: max === -Infinity ? 1 : max };
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
    const b = arrayBounds(vals);
    const mn = b.min;
    const mx = b.max;
    const span = Math.abs(mx - mn) || 1;
    return { offset: mn, scale: 100 / span };
  }
  return { offset: 0, scale: 1 };
}

function displayY(s, idx) {
  const t = yTransformStats(s);
  const rawVals = s && s.yValues ? s.yValues : [];
  let v = rawVals[idx];
  if (typeof v !== "number" || !isFinite(v)) v = 0;

  // Moving average smoothing if selected
  const sm = state.data.smoothing;
  if (sm === "ma3" || sm === "ma5" || sm === "ma9") {
    const k = sm === "ma3" ? 1 : (sm === "ma5" ? 2 : 4);
    let sum = 0, count = 0;
    for (let di = -k; di <= k; di++) {
      const j = idx + di;
      if (j >= 0 && j < rawVals.length) {
        const val = rawVals[j];
        if (typeof val === "number" && isFinite(val)) {
          sum += val;
          count++;
        }
      }
    }
    if (count > 0) v = sum / count;
  }

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
    const dataX = dataset.xValues[ptIdx] ?? 80;
    const dataY = displayY(s, ptIdx);
    state.callouts[s.id] = {
      dataX: dataX,
      dataY: dataY,
      offsetDx: -230 - (idx % 2) * 60,
      offsetDy: -90 + (idx % 2) * 40
    };
  }
  const c = state.callouts[s.id];
  if (c.dataX === undefined) {
    c.dataX = typeof c.targetX === "number" ? unmapX(c.targetX) : (dataset.xValues[0] ?? 80);
    c.dataY = typeof c.targetY === "number" ? unmapY(c.targetY) : displayY(s, 0);
    c.offsetDx = (typeof c.x === "number" && typeof c.targetX === "number") ? c.x - c.targetX : -230;
    c.offsetDy = (typeof c.y === "number" && typeof c.targetY === "number") ? c.y - c.targetY : -90;
  }
  c.targetX = Math.round(mapX(c.dataX));
  c.targetY = Math.round(mapY(c.dataY));
  const rawX = c.targetX + (c.offsetDx ?? -200);
  const rawY = c.targetY + (c.offsetDy ?? -60);
  c.x = Math.max(10, Math.min(rawX, chartBox.width - 60));
  c.y = Math.max(10, Math.min(rawY, chartBox.height - 40));
  return c;
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
  // Axes Framing & Spine Coordinates
  const spineLeftX = plotArea.x;
  const spineBottomY = plotArea.y + plotArea.height;

  if (state.frameStyle === "boxed") {
    // Full enclosing rectangular frame for publication boxed style
    svgContent += `
      <rect x="${plotArea.x}" y="${plotArea.y}" width="${plotArea.width}" height="${plotArea.height}"
            fill="none" stroke="${colors.axis}" stroke-width="1.8" />
    `;
    // Top and right spines with inward ticks (classic ISI style)
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
  } else {
    // Classic open L-frame (left and bottom spines)
    svgContent += `
      <line x1="${spineLeftX}" y1="${plotArea.y}" x2="${spineLeftX}" y2="${spineBottomY}"
            stroke="${colors.axis}" stroke-width="1.8" />
      <line x1="${spineLeftX}" y1="${spineBottomY}" x2="${plotArea.x + plotArea.width}" y2="${spineBottomY}"
            stroke="${colors.axis}" stroke-width="1.8" />
    `;
  }

  // Internal reference lines (crosshairs) if axisOrigin is zero or center
  if (geo.mode === "zero") {
    const rx = axisRange("x");
    const ry = axisRange("y");
    if (rx.min <= 0 && rx.max >= 0) {
      const zx = mapX(0);
      svgContent += `
        <line x1="${zx}" y1="${plotArea.y}" x2="${zx}" y2="${plotArea.y + plotArea.height}"
              stroke="${colors.axisZero}" stroke-width="1.3" stroke-dasharray="5,4" />
      `;
    }
    if (ry.min <= 0 && ry.max >= 0) {
      const zy = mapY(0);
      svgContent += `
        <line x1="${plotArea.x}" y1="${zy}" x2="${plotArea.x + plotArea.width}" y2="${zy}"
              stroke="${colors.axisZero}" stroke-width="1.3" stroke-dasharray="5,4" />
      `;
    }
  } else if (geo.mode === "center") {
    svgContent += `
      <line x1="${geo.x}" y1="${plotArea.y}" x2="${geo.x}" y2="${plotArea.y + plotArea.height}"
            stroke="${colors.axis}" stroke-width="1.3" stroke-dasharray="5,4" stroke-opacity="0.45" />
      <line x1="${plotArea.x}" y1="${geo.y}" x2="${plotArea.x + plotArea.width}" y2="${geo.y}"
            stroke="${colors.axis}" stroke-width="1.3" stroke-dasharray="5,4" stroke-opacity="0.45" />
    `;
  }

  // Minor ticks (both axes anchored strictly to frame spines)
  if (state.ticks.minor > 0) {
    xMinors.forEach(tick => {
      const xPos = mapX(tick);
      const t = tickLine(spineBottomY, 1, TICK_LEN * 0.55);
      svgContent += `<line x1="${xPos}" y1="${t.from}" x2="${xPos}" y2="${t.to}" stroke="${colors.axis}" stroke-width="1" opacity="0.7" />`;
    });
    yMinors.forEach(tick => {
      const yPos = mapY(tick);
      const t = tickLine(spineLeftX, -1, TICK_LEN * 0.55);
      svgContent += `<line x1="${t.from}" y1="${yPos}" x2="${t.to}" y2="${yPos}" stroke="${colors.axis}" stroke-width="1" opacity="0.7" />`;
    });
  }

  // Y Ticks & Labels (always anchored to left spine plotArea.x)
  const yLabelSide = -1;
  const lblX = spineLeftX - 12;
  yTicks.forEach(tick => {
    const yPos = mapY(tick);
    const tl = tickLine(spineLeftX, yLabelSide, TICK_LEN);
    svgContent += `
      <line x1="${tl.from}" y1="${yPos}" x2="${tl.to}" y2="${yPos}"
            stroke="${colors.axis}" stroke-width="1.5" />
      <text x="${lblX}" y="${yPos + Math.round(state.type.tickFont * 0.35)}"
            fill="${colors.title}" font-size="${state.type.tickFont}" font-family="${TICK_FONT}"
            text-anchor="end" direction="ltr"
            paint-order="stroke fill" stroke="${colors.bg}" stroke-width="3.5" stroke-linejoin="round">${fmtTick(tick)}</text>
    `;
  });

  // X Ticks & Labels (always anchored to bottom spine plotArea.y + plotArea.height)
  const xLabelY = spineBottomY + state.type.tickFont + 10;
  const rot = state.ticks.xLabelRotate;
  xTicks.forEach((tick, i) => {
    const xPos = mapX(tick);
    const tl = tickLine(spineBottomY, 1, TICK_LEN);
    svgContent += `<line x1="${xPos}" y1="${tl.from}" x2="${xPos}" y2="${tl.to}" stroke="${colors.axis}" stroke-width="1.5" />`;

    if (state.ticks.labelEvery > 1 && (i % state.ticks.labelEvery) !== 0) return;

    if (rot) {
      const anchor = "start";
      const ly = rot === 90 ? spineBottomY + 8 : xLabelY;
      svgContent += `
        <text x="${xPos}" y="${ly}" fill="${colors.title}" font-size="${state.type.tickFont}"
              font-family="${TICK_FONT}" text-anchor="${anchor}" direction="ltr"
              paint-order="stroke fill" stroke="${colors.bg}" stroke-width="3.5" stroke-linejoin="round"
              transform="rotate(${rot} ${xPos} ${ly})">${fmtTick(tick)}</text>
      `;
    } else {
      svgContent += `
        <text x="${xPos}" y="${xLabelY}"
              fill="${colors.title}" font-size="${state.type.tickFont}" font-family="${TICK_FONT}"
              text-anchor="middle" direction="ltr"
              paint-order="stroke fill" stroke="${colors.bg}" stroke-width="3.5" stroke-linejoin="round">${fmtTick(tick)}</text>
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
  svgContent += `<g class="plot-data-layer" clip-path="url(#plotClip)">`;
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

      // Directional Arrows (paced along path arc-length so high-density data like CV curves display clear arrows)
      if (state.showHysteresis && !state.data.sortByX && xVals.length >= 2) {
        let totalPathLen = 0;
        const segDists = [];
        for (let i = 0; i < xVals.length - 1; i++) {
          const px1 = mapX(xVals[i]);
          const py1 = mapY(dy(i));
          const px2 = mapX(xVals[i + 1]);
          const py2 = mapY(dy(i + 1));
          const d = Math.hypot(px2 - px1, py2 - py1);
          segDists.push(d);
          totalPathLen += d;
        }

        const targetSpacing = Math.max(50, Math.min(130, totalPathLen / 8));
        let accum = targetSpacing * 0.4;

        for (let i = 0; i < xVals.length - 1; i++) {
          accum += segDists[i];
          if (accum >= targetSpacing) {
            accum = 0;
            const step = Math.max(1, Math.floor(xVals.length / 300));
            const iNext = Math.min(xVals.length - 1, i + step);
            const px1 = mapX(xVals[i]);
            const py1 = mapY(dy(i));
            const px2 = mapX(xVals[iNext]);
            const py2 = mapY(dy(iNext));
            const dx = px2 - px1;
            const dyP = py2 - py1;
            if (Math.hypot(dx, dyP) > 0.01) {
              const angle = Math.atan2(dyP, dx) * 180 / Math.PI;
              const isBack = i >= maxIdx;
              svgContent += `
                <g transform="translate(${px1}, ${py1}) rotate(${angle})" opacity="${(isBack ? 0.75 : 0.95) * seriesOpacity}">
                  <polygon points="-5,-4.5 4.5,0 -5,4.5" fill="${seriesColor}" />
                </g>
              `;
            }
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
    
    // For large datasets in scatter-line mode, sample markers so they don't form a thick smear,
    // while keeping the continuous line and all data points fully represented.
    const isDense = xVals.length > 300 && state.plotMode === "scatter-line";
    const markerStride = isDense ? Math.max(1, Math.ceil(xVals.length / 150)) : 1;

    for (let idx = 0; idx < xVals.length; idx += markerStride) {
      const xVal = xVals[idx];
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
            <text x="${px}" y="${py < plotArea.y + 16 ? py + 16 : py - 10}" fill="${colors.text}" font-size="${state.type.dataLabelFont}"
                  font-weight="700" text-anchor="middle" direction="ltr" font-family="${TICK_FONT}"
                  paint-order="stroke fill" stroke="${colors.bg}" stroke-width="2.5" stroke-linejoin="round">${fmtTick(yVal)}</text>
          ` : ""}
        </g>
      `;
    }

    // --- Trendlines ---
    // --- Trendlines & Advanced Curve Fitting ---
    if (state.showTrendlines && xVals.length >= 2) {
      const fit = calculateCurveFit(xVals, s, dy, state.fitModel || "linear");
      if (fit) {
        if (fit.pathD) {
          svgContent += `
            <path d="${fit.pathD}" fill="none" stroke="${seriesColor}" stroke-width="2" stroke-dasharray="8,4" opacity="${0.85 * seriesOpacity}" />
          `;
        }
        if (state.showFitEquation !== false && fit.label) {
          const r2X = Math.max(plotArea.x + 80, Math.min(plotArea.x + plotArea.width - 12, fit.labelX));
          const r2Y = Math.max(plotArea.y + 18, Math.min(plotArea.y + plotArea.height - 8, fit.labelY));
          svgContent += `
            <text x="${r2X}" y="${r2Y}" fill="${seriesColor}" font-size="${state.type.legendFont}" font-weight="bold" font-family="${TICK_FONT}" text-anchor="end" direction="ltr"
                  paint-order="stroke fill" stroke="${colors.bg}" stroke-width="3" stroke-linejoin="round">${fit.label}</text>
          `;
        }
      }
    }
  });
  svgContent += `</g>`;

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
    const titleText = isFa ? "راهنمای نمونه‌ها" : "Legend / Samples";
    const legFontSize = Math.max(9.5, state.type.legendFont || 11.5);
    const rowH = Math.max(22, legFontSize + 12);

    // Dynamically calculate width based on longest label so text never clips or overflows
    let maxLabelChars = titleText.length;
    dataset.series.forEach(s => {
      const n = (isFa ? s.nameFa : s.nameEn) || s.nameEn || s.id || "";
      if (n.length > maxLabelChars) maxLabelChars = n.length;
    });
    const charWidth = legFontSize * 0.72;
    // Box width: left padding (16) + symbol width (26) + spacing (12) + text width + right padding (20)
    const computedW = Math.round(maxLabelChars * charWidth + 74);
    const legBoxW = Math.max(190, Math.min(plotArea.width - 16, computedW));
    const legBoxH = Math.max(70, Math.round(38 + (dataset.series.length * rowH)));

    const rawLegX = state.callouts.inplotX != null ? state.callouts.inplotX : (plotArea.x + 20);
    const rawLegY = state.callouts.inplotY != null ? state.callouts.inplotY : (plotArea.y + 20);
    const legBoxX = Math.max(plotArea.x + 4, Math.min(rawLegX, plotArea.x + plotArea.width - legBoxW - 4));
    const legBoxY = Math.max(plotArea.y + 4, Math.min(rawLegY, plotArea.y + plotArea.height - legBoxH - 4));

    const boxBg = isDark ? "#0f172a" : "#ffffff";
    const boxBorder = isDark ? "rgba(148, 163, 184, 0.45)" : "#cbd5e1";

    svgContent += `
      <g class="draggable-badge" data-badge="inplot" filter="url(#badgeShadow)" style="cursor: move;">
        <rect x="${legBoxX}" y="${legBoxY}" width="${legBoxW}" height="${legBoxH}" rx="8"
              fill="${boxBg}" stroke="${boxBorder}" stroke-width="1.3" />
        
        <text x="${legBoxX + 16}" y="${legBoxY + 21}" fill="${colors.title}" font-size="${Math.max(10.5, legFontSize + 0.5)}" font-weight="700"
              text-anchor="start" font-family="${USER_FONT}">
          ${titleText}
        </text>
        <line x1="${legBoxX + 14}" y1="${legBoxY + 27}" x2="${legBoxX + legBoxW - 14}" y2="${legBoxY + 27}"
              stroke="${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}" stroke-width="1" />
    `;

    dataset.series.forEach((s, idx) => {
      const itemY = legBoxY + 44 + (idx * rowH);
      const seriesColor = isDark ? s.colorDark : s.colorLight;
      const name = (isFa ? s.nameFa : s.nameEn) || s.nameEn || s.id;
      const lineX1 = legBoxX + 16;
      const lineX2 = legBoxX + 40;
      const markerCx = legBoxX + 28;
      const textX = legBoxX + 48;

      if (state.plotMode === "scatter-line") {
        svgContent += `
          <line x1="${lineX1}" y1="${itemY}" x2="${lineX2}" y2="${itemY}"
                stroke="${seriesColor}" stroke-width="2.2" opacity="${s.visible ? 1 : 0.25}"
                ${s.strokeDash ? `stroke-dasharray="${s.strokeDash}"` : ""} />
        `;
      }

      svgContent += `
        <g opacity="${s.visible ? 1 : 0.25}">
          ${getMarkerSvg(s.marker, markerCx, itemY, 8, seriesColor, isDark ? "#0f172a" : "#ffffff")}
        </g>
      `;

      svgContent += `
        <text x="${textX}" y="${itemY + 4}" fill="${s.visible ? colors.text : colors.axis}"
              font-size="${legFontSize}" font-weight="600" opacity="${s.visible ? 1 : 0.35}"
              text-anchor="start" font-family="${USER_FONT}">${escapeXml(name)}</text>
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

  // --- Automated Peak & Valley Finder & FWHM ---
  if (state.peaks && state.peaks.enabled) {
    const allPeaks = [];
    dataset.series.filter(s => s.visible).forEach(s => {
      const pks = computePeaksForSeries(s);
      const col = state.theme === "dark" ? s.colorDark : s.colorLight;
      pks.forEach(p => {
        allPeaks.push(Object.assign({ seriesName: state.lang === "fa" ? s.nameFa : s.nameEn }, p));
        const px = mapX(p.x);
        const py = mapY(p.y);
        const isMax = p.kind === "peak";
        const triD = isMax ? `M ${px} ${py - 12} L ${px - 5} ${py - 3} L ${px + 5} ${py - 3} Z`
                           : `M ${px} ${py + 12} L ${px - 5} ${py + 3} L ${px + 5} ${py + 3} Z`;
        svgContent += `<path d="${triD}" fill="${col}" stroke="${colors.bg}" stroke-width="1.2" />`;

        if (state.peaks.showLabels !== false) {
          const lblY = isMax ? py - 16 : py + 24;
          svgContent += `
            <text x="${px}" y="${lblY}" fill="${col}" font-size="${Math.max(8.5, state.type.tickFont - 5)}" font-weight="bold" font-family="${TICK_FONT}" text-anchor="middle" direction="ltr"
                  paint-order="stroke fill" stroke="${colors.bg}" stroke-width="2.5" stroke-linejoin="round">${Number(p.x.toFixed(2))}, ${Number(p.y.toFixed(2))}</text>
          `;
        }

        if (state.peaks.showFWHM !== false && p.fwhm && isMax) {
          const fLeft = mapX(p.fwhmLeft);
          const fRight = mapX(p.fwhmRight);
          const fY = mapY(p.halfY);
          svgContent += `
            <line x1="${fLeft}" y1="${fY}" x2="${fRight}" y2="${fY}" stroke="#f59e0b" stroke-width="1.6" stroke-dasharray="3,3" />
            <circle cx="${fLeft}" cy="${fY}" r="2.5" fill="#f59e0b" />
            <circle cx="${fRight}" cy="${fY}" r="2.5" fill="#f59e0b" />
            <text x="${(fLeft + fRight) / 2}" y="${fY - 5}" fill="#f59e0b" font-size="${Math.max(8, state.type.tickFont - 6)}" font-weight="bold" font-family="${TICK_FONT}" text-anchor="middle" direction="ltr"
                  paint-order="stroke fill" stroke="${colors.bg}" stroke-width="2.5" stroke-linejoin="round">FWHM = ${p.fwhm.toFixed(2)}</text>
          `;
        }
      });
    });
    updatePeakListSidebar(allPeaks);
  }

  // --- Crosshair Coordinate Inspector Elements ---
  svgContent += `
    <g id="crosshairGroup" style="pointer-events: none; display: none;">
      <line id="chLineH" class="crosshair-line" x1="${plotArea.x}" y1="0" x2="${plotArea.x + plotArea.width}" y2="0" />
      <line id="chLineV" class="crosshair-line" x1="0" y1="${plotArea.y}" x2="0" y2="${plotArea.y + plotArea.height}" />
      <g id="chBadge">
        <rect id="chBadgeBg" rx="4" ry="4" fill="${state.theme === 'dark' ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.95)'}" stroke="${colors.calloutBorder}" stroke-width="1" width="130" height="24" />
        <text id="chBadgeText" x="8" y="16" class="crosshair-badge" direction="ltr"></text>
      </g>
    </g>
  `;

  // Rubber-band selection rectangle used to pick the magnified region
  svgContent += `<rect id="zoomBandRect" x="0" y="0" width="0" height="0" style="display:none"
        fill="${state.theme === 'dark' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.12)'}"
        stroke="${state.theme === 'dark' ? '#38bdf8' : '#0284c7'}" stroke-width="1.5" stroke-dasharray="5,4"
        pointer-events="none" />`;

  svg.innerHTML = svgContent;

  attachHoverListeners();
  attachDragListeners();
  renderCVMetrics();

  if (state._booted) queueSave();
}

// --- Automated CV & Electrochemical Metrics Computation ---
function renderCVMetrics() {
  const container = document.getElementById("cvMetricsGrid");
  const sec = document.getElementById("secCVMetrics");
  if (!container || !sec) return;

  const s = dataset.series.find(x => x.visible && x.yValues && x.yValues.length > 3) || dataset.series[0];
  if (!s || !dataset.xValues || dataset.xValues.length < 4) {
    sec.style.display = "none";
    return;
  }

  const x = dataset.xValues;
  const y = dataset.xValues.map((_, i) => displayY(s, i));
  const n = x.length;

  let maxIdx = 0, maxX = -Infinity;
  for (let i = 0; i < n; i++) {
    if (x[i] > maxX) { maxX = x[i]; maxIdx = i; }
  }

  // Forward scan (0 to maxIdx): anodic peak (max y)
  let epa = -Infinity, ipa = -Infinity;
  for (let i = 0; i <= maxIdx; i++) {
    if (y[i] > ipa) { ipa = y[i]; epa = x[i]; }
  }

  // Reverse scan (maxIdx to n-1): cathodic peak (min y)
  let epc = Infinity, ipc = Infinity;
  for (let i = maxIdx; i < n; i++) {
    if (y[i] < ipc) { ipc = y[i]; epc = x[i]; }
  }

  const hasPeaks = isFinite(epa) && isFinite(epc) && isFinite(ipa) && isFinite(ipc);
  if (!hasPeaks) {
    sec.style.display = "none";
    return;
  }

  sec.style.display = "";
  const deltaEp = Math.abs(epa - epc);
  const eHalf = (epa + epc) / 2;
  const ipRatio = Math.abs(ipc) > 1e-9 ? Math.abs(ipa / ipc) : 1;

  // Trapezoidal loop area (charge / integral)
  let loopArea = 0;
  for (let i = 0; i < n - 1; i++) {
    loopArea += (x[i] * y[i + 1] - x[i + 1] * y[i]);
  }
  loopArea += (x[n - 1] * y[0] - x[0] * y[n - 1]);
  loopArea = Math.abs(loopArea) * 0.5;

  const fmt = v => typeof v === "number" ? (Math.abs(v) >= 1000 ? v.toFixed(0) : (Math.abs(v) < 0.01 && v !== 0 ? v.toExponential(2) : v.toFixed(3))) : v;

  const isFa = state.lang === "fa";
  container.innerHTML = `
    <div class="cv-metric-card">
      <span class="cv-metric-val">${fmt(epa)}</span>
      <span class="cv-metric-lbl">${isFa ? "پتانسیل پیک آندی (Epa)" : "Anodic Peak (Epa)"}</span>
    </div>
    <div class="cv-metric-card">
      <span class="cv-metric-val">${fmt(epc)}</span>
      <span class="cv-metric-lbl">${isFa ? "پتانسیل پیک کاتدی (Epc)" : "Cathodic Peak (Epc)"}</span>
    </div>
    <div class="cv-metric-card">
      <span class="cv-metric-val">${fmt(deltaEp)}</span>
      <span class="cv-metric-lbl">${isFa ? "جدایش پیک‌ها (ΔEp)" : "Peak Separation (ΔEp)"}</span>
    </div>
    <div class="cv-metric-card">
      <span class="cv-metric-val">${fmt(eHalf)}</span>
      <span class="cv-metric-lbl">${isFa ? "پتانسیل نیمه‌موج (E½)" : "Half-Wave Pot. (E½)"}</span>
    </div>
    <div class="cv-metric-card">
      <span class="cv-metric-val">${fmt(ipRatio)}</span>
      <span class="cv-metric-lbl">${isFa ? "نسبت جریان پیک (|Ipa/Ipc|)" : "Peak Current Ratio"}</span>
    </div>
    <div class="cv-metric-card">
      <span class="cv-metric-val">${fmt(loopArea)}</span>
      <span class="cv-metric-lbl">${isFa ? "مساحت حلقه (بار Q)" : "Loop Area (Charge Q)"}</span>
    </div>
  `;
}

// --- 7. Interactive Hover Tooltips & Crosshair (Event Delegation) ---
function attachHoverListeners() {
  if (svg._hasHoverListener) return;
  svg._hasHoverListener = true;

  svg.addEventListener("pointermove", e => {
    // Crosshair inspection
    if (state.crosshair && state.crosshair.enabled) {
      const chG = document.getElementById("crosshairGroup");
      if (chG) {
        const coords = getSvgCoords(e);
        if (coords.x >= plotArea.x && coords.x <= plotArea.x + plotArea.width &&
            coords.y >= plotArea.y && coords.y <= plotArea.y + plotArea.height) {
          chG.style.display = "";
          const hLine = document.getElementById("chLineH");
          const vLine = document.getElementById("chLineV");
          const badge = document.getElementById("chBadge");
          const badgeText = document.getElementById("chBadgeText");

          if (hLine) { hLine.setAttribute("y1", coords.y); hLine.setAttribute("y2", coords.y); }
          if (vLine) { vLine.setAttribute("x1", coords.x); vLine.setAttribute("x2", coords.x); }

          const dataX = unmapX(coords.x);
          const dataY = unmapY(coords.y);
          const fmtVal = v => typeof v === 'number' ? (Math.abs(v) >= 1000 ? v.toFixed(0) : (Math.abs(v) < 0.01 && v !== 0 ? v.toExponential(2) : v.toFixed(3))) : v;
          const txt = `X: ${fmtVal(dataX)}, Y: ${fmtVal(dataY)}`;

          if (badge && badgeText) {
            badgeText.textContent = txt;
            const bx = Math.min(plotArea.x + plotArea.width - 135, Math.max(plotArea.x + 5, coords.x + 12));
            const by = Math.max(plotArea.y + 6, coords.y - 28);
            badge.setAttribute("transform", `translate(${bx}, ${by})`);
          }
        } else {
          chG.style.display = "none";
        }
      }
    }

    const pt = e.target.closest(".point-group");
    if (!pt) {
      if (tooltip && tooltip.classList.contains("visible")) tooltip.classList.remove("visible");
      return;
    }
    const seriesId = pt.getAttribute("data-series");
    const x = pt.getAttribute("data-x");
    const y = pt.getAttribute("data-y");
    const s = dataset.series.find(item => item.id === seriesId);
    if (!s || !tooltip) return;

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

  svg.addEventListener("pointerleave", () => {
    if (tooltip) tooltip.classList.remove("visible");
    const chG = document.getElementById("crosshairGroup");
    if (chG) chG.style.display = "none";
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
      callout.dataX = unmapX(newX);
      callout.dataY = unmapY(newY);
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
      callout.offsetDx = newX - callout.targetX;
      callout.offsetDy = newY - callout.targetY;
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
      callout.offsetDx = callout.x - callout.targetX;
      lBx.textContent = `${callout.x} px`;
      renderChart();
    });
    rBy.addEventListener("input", e => {
      callout.y = parseInt(e.target.value, 10);
      callout.offsetDy = callout.y - callout.targetY;
      lBy.textContent = `${callout.y} px`;
      renderChart();
    });
    rTx.addEventListener("input", e => {
      callout.targetX = parseInt(e.target.value, 10);
      callout.dataX = unmapX(callout.targetX);
      lTx.textContent = `${callout.targetX} px`;
      renderChart();
    });
    rTy.addEventListener("input", e => {
      callout.targetY = parseInt(e.target.value, 10);
      callout.dataY = unmapY(callout.targetY);
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

let renderAllTableRows = false;

function renderDataTable() {
  if (!dataTableBody) return;
  dataTableBody.innerHTML = "";
  const dataTableHeader = document.getElementById("dataTableHeader");
  if (dataTableHeader) {
    let theadHTML = `<tr><th style="padding: 8px;">X (${state.xTitle || 'RH'})</th>`;
    dataset.series.forEach(s => {
      theadHTML += `<th style="padding: 8px;">${state.lang === 'fa' ? s.nameFa : s.nameEn}</th>`;
    });
    theadHTML += `<th style="padding: 8px;"></th></tr>`;
    dataTableHeader.innerHTML = theadHTML;
  }

  const totalRows = dataset.xValues.length;
  const maxInitialRows = 50;
  const rowsToRender = (renderAllTableRows || totalRows <= maxInitialRows) ? totalRows : maxInitialRows;

  const fragment = document.createDocumentFragment();
  for (let idx = 0; idx < rowsToRender; idx++) {
    const x = dataset.xValues[idx];
    const tr = document.createElement("tr");
    let html = `<td><input type="number" step="any" class="table-input" data-col="x" data-idx="${idx}" value="${x}"></td>`;
    
    dataset.series.forEach(s => {
      html += `<td><input type="number" step="any" class="table-input" data-col="${s.id}" data-idx="${idx}" value="${s.yValues[idx] ?? 0}"></td>`;
    });
    
    html += `<td><button class="btn-delete-row" data-idx="${idx}" title="${state.lang === 'fa' ? 'حذف سطر' : 'Delete row'}" style="background: none; border: none; cursor: pointer; color: #f43f5e; font-size: 16px;">×</button></td>`;
    tr.innerHTML = html;
    fragment.appendChild(tr);
  }
  dataTableBody.appendChild(fragment);

  if (!dataTableBody._hasDeleteListener) {
    dataTableBody._hasDeleteListener = true;
    dataTableBody.addEventListener("click", e => {
      const btn = e.target.closest(".btn-delete-row");
      if (btn) {
        const idx = parseInt(btn.getAttribute("data-idx"), 10);
        deleteRow(idx);
      }
    });
  }

  const tableNoticeId = "tablePaginationNotice";
  let noticeEl = document.getElementById(tableNoticeId);
  if (!noticeEl) {
    noticeEl = document.createElement("div");
    noticeEl.id = tableNoticeId;
    noticeEl.style.cssText = "padding: 8px 12px; font-size: 0.8rem; color: var(--text-dim); background: var(--bg-card-subtle); border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;";
    const scrollBox = dataTableBody.closest(".table-scroll");
    if (scrollBox && scrollBox.parentNode) {
      scrollBox.parentNode.insertBefore(noticeEl, scrollBox.nextSibling);
    }
  }

  if (totalRows > maxInitialRows && !renderAllTableRows) {
    noticeEl.style.display = "flex";
    noticeEl.innerHTML = `
      <span>${state.lang === 'fa' ? `نمایش ۵۰ سطر اول از ${totalRows} سطر` : `Showing first 50 of ${totalRows} rows`}</span>
      <button id="btnShowAllRows" type="button" style="background: var(--primary-accent); color: white; border: none; border-radius: 4px; padding: 4px 10px; cursor: pointer; font-size: 0.75rem; font-family: inherit;">
        ${state.lang === 'fa' ? 'نمایش همه سطرها' : 'Show all rows'}
      </button>
    `;
    const btnShow = document.getElementById("btnShowAllRows");
    if (btnShow) {
      btnShow.onclick = () => {
        renderAllTableRows = true;
        renderDataTable();
      };
    }
  } else if (totalRows > maxInitialRows && renderAllTableRows) {
    noticeEl.style.display = "flex";
    noticeEl.innerHTML = `
      <span>${state.lang === 'fa' ? `نمایش تمام ${totalRows} سطر` : `Showing all ${totalRows} rows`}</span>
      <button id="btnShowFewerRows" type="button" style="background: transparent; color: var(--primary-accent); border: 1px solid var(--primary-accent); border-radius: 4px; padding: 4px 10px; cursor: pointer; font-size: 0.75rem; font-family: inherit;">
        ${state.lang === 'fa' ? 'محدود به ۵۰ سطر' : 'Limit to 50'}
      </button>
    `;
    const btnFewer = document.getElementById("btnShowFewerRows");
    if (btnFewer) {
      btnFewer.onclick = () => {
        renderAllTableRows = false;
        renderDataTable();
      };
    }
  } else if (noticeEl) {
    noticeEl.style.display = "none";
  }
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
  const xBounds = arrayBounds(dataset.xValues);
  const minX = xBounds.min;
  const maxX = xBounds.max;
  
  let allY = [];
  const activeSeries = dataset.series.filter(s => s.visible).length ? dataset.series.filter(s => s.visible) : dataset.series;
  activeSeries.forEach(s => {
    if (s.yValues && s.yValues.length) {
      for (let i = 0; i < s.yValues.length; i++) allY.push(displayY(s, i));
    }
  });
  if (!allY.length) return;
  const yBounds = arrayBounds(allY);
  const minY = yBounds.min;
  const maxY = yBounds.max;

  // Handle Log X
  if (state.ticks.xLog && minX > 0 && maxX > 0) {
    state.axis.xMin = Math.pow(10, Math.floor(Math.log10(minX)));
    state.axis.xMax = Math.pow(10, Math.ceil(Math.log10(maxX)));
    state.axis.xStep = 1;
  } else {
    const xSpan = Math.max(1e-6, maxX - minX);
    const xStep = getNiceStep(xSpan, 6);
    state.axis.xMin = roundTick(Math.floor(minX / xStep) * xStep);
    state.axis.xMax = roundTick(Math.ceil(maxX / xStep) * xStep);
    if (state.axis.xMax <= state.axis.xMin) state.axis.xMax = roundTick(state.axis.xMin + xStep * 5);
    state.axis.xStep = roundTick(xStep);
  }

  // Handle Log Y
  if (state.ticks.yLog && minY > 0 && maxY > 0) {
    state.axis.yMin = Math.pow(10, Math.floor(Math.log10(minY)));
    state.axis.yMax = Math.pow(10, Math.ceil(Math.log10(maxY)));
    state.axis.yStep = 1;
  } else {
    const ySpan = Math.max(1e-6, maxY - minY);
    const yStep = getNiceStep(ySpan, 6);
    state.axis.yMin = roundTick(Math.floor(minY / yStep) * yStep);
    state.axis.yMax = roundTick(Math.ceil(maxY / yStep) * yStep);
    if (state.axis.yMax <= state.axis.yMin) state.axis.yMax = roundTick(state.axis.yMin + yStep * 5);
    state.axis.yStep = roundTick(yStep);
  }

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

// --- Mathematical Curve Fitting Models ---
function calculateCurveFit(xVals, s, dy, model) {
  const n = xVals.length;
  if (n < 2) return null;

  const pts = [];
  for (let i = 0; i < n; i++) {
    const yv = dy(i);
    if (isFinite(xVals[i]) && isFinite(yv)) pts.push({ x: xVals[i], y: yv });
  }
  if (pts.length < 2) return null;

  const xb = arrayBounds(xVals);
  const xMin = xb.min, xMax = xb.max;
  const numInterp = 80;
  let label = "", pathPts = [], rSquared = 0;

  if (model === "polynomial2" && pts.length >= 3) {
    let s1 = 0, s2 = 0, s3 = 0, s4 = 0, z0 = 0, z1 = 0, z2 = 0;
    for (let p of pts) {
      const xi = p.x, yi = p.y, x2 = xi * xi;
      s1 += xi; s2 += x2; s3 += x2 * xi; s4 += x2 * x2;
      z0 += yi; z1 += xi * yi; z2 += x2 * yi;
    }
    const D = pts.length * (s2 * s4 - s3 * s3) - s1 * (s1 * s4 - s2 * s3) + s2 * (s1 * s3 - s2 * s2);
    if (Math.abs(D) > 1e-12) {
      const c = (z0 * (s2 * s4 - s3 * s3) - s1 * (z1 * s4 - z2 * s3) + s2 * (z1 * s3 - z2 * s2)) / D;
      const b = (pts.length * (z1 * s4 - z2 * s3) - z0 * (s1 * s4 - s2 * s3) + s2 * (s1 * z2 - s2 * z1)) / D;
      const a = (pts.length * (s2 * z2 - s3 * z1) - s1 * (s1 * z2 - s2 * z1) + z0 * (s1 * s3 - s2 * s2)) / D;

      let ssTot = 0, ssRes = 0, yMean = z0 / pts.length;
      for (let p of pts) {
        const yPred = a * p.x * p.x + b * p.x + c;
        ssTot += Math.pow(p.y - yMean, 2);
        ssRes += Math.pow(p.y - yPred, 2);
      }
      rSquared = ssTot === 0 ? 1 : Math.max(0, 1 - (ssRes / ssTot));

      for (let step = 0; step <= numInterp; step++) {
        const curX = xMin + (step / numInterp) * (xMax - xMin);
        const curY = a * curX * curX + b * curX + c;
        pathPts.push({ x: mapX(curX), y: mapY(curY) });
      }
      const sgnB = b >= 0 ? "+" : "-";
      const sgnC = c >= 0 ? "+" : "-";
      label = `y = ${a.toFixed(3)}x² ${sgnB} ${Math.abs(b).toFixed(3)}x ${sgnC} ${Math.abs(c).toFixed(3)} (R² = ${rSquared.toFixed(3)})`;
    }
  } else if (model === "exponential") {
    const valid = pts.filter(p => p.y > 0);
    if (valid.length >= 2) {
      let sx = 0, sly = 0, sxy = 0, sxx = 0, sy = 0;
      for (let p of valid) {
        const ly = Math.log(p.y);
        sx += p.x; sly += ly; sxy += p.x * ly; sxx += p.x * p.x; sy += p.y;
      }
      const denom = valid.length * sxx - sx * sx;
      if (Math.abs(denom) > 1e-12) {
        const b = (valid.length * sxy - sx * sly) / denom;
        const a = Math.exp((sly - b * sx) / valid.length);

        let ssTot = 0, ssRes = 0, yMean = sy / valid.length;
        for (let p of valid) {
          const yPred = a * Math.exp(b * p.x);
          ssTot += Math.pow(p.y - yMean, 2);
          ssRes += Math.pow(p.y - yPred, 2);
        }
        rSquared = ssTot === 0 ? 1 : Math.max(0, 1 - (ssRes / ssTot));

        for (let step = 0; step <= numInterp; step++) {
          const curX = xMin + (step / numInterp) * (xMax - xMin);
          const curY = a * Math.exp(b * curX);
          pathPts.push({ x: mapX(curX), y: mapY(curY) });
        }
        label = `y = ${a.toFixed(3)}·e^(${b.toFixed(3)}x) (R² = ${rSquared.toFixed(3)})`;
      }
    }
  } else if (model === "power") {
    const valid = pts.filter(p => p.x > 0 && p.y > 0);
    if (valid.length >= 2) {
      let slx = 0, sly = 0, slxy = 0, slxx = 0, sy = 0;
      for (let p of valid) {
        const lx = Math.log(p.x), ly = Math.log(p.y);
        slx += lx; sly += ly; slxy += lx * ly; slxx += lx * lx; sy += p.y;
      }
      const denom = valid.length * slxx - slx * slx;
      if (Math.abs(denom) > 1e-12) {
        const b = (valid.length * slxy - slx * sly) / denom;
        const a = Math.exp((sly - b * slx) / valid.length);

        let ssTot = 0, ssRes = 0, yMean = sy / valid.length;
        for (let p of valid) {
          const yPred = a * Math.pow(p.x, b);
          ssTot += Math.pow(p.y - yMean, 2);
          ssRes += Math.pow(p.y - yPred, 2);
        }
        rSquared = ssTot === 0 ? 1 : Math.max(0, 1 - (ssRes / ssTot));

        for (let step = 0; step <= numInterp; step++) {
          const curX = xMin + (step / numInterp) * (xMax - xMin);
          const curY = a * Math.pow(curX, b);
          pathPts.push({ x: mapX(curX), y: mapY(curY) });
        }
        label = `y = ${a.toFixed(3)}·x^(${b.toFixed(3)}) (R² = ${rSquared.toFixed(3)})`;
      }
    }
  }

  // Fallback to Linear if model not solved or requested
  if (!pathPts.length) {
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let p of pts) {
      sumX += p.x; sumY += p.y; sumXY += p.x * p.y; sumXX += p.x * p.x;
    }
    const denom = pts.length * sumXX - sumX * sumX;
    if (Math.abs(denom) <= 1e-12) return null;
    const slope = (pts.length * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / pts.length;

    let ssTot = 0, ssRes = 0, yMean = sumY / pts.length;
    for (let p of pts) {
      const yPred = slope * p.x + intercept;
      ssTot += Math.pow(p.y - yMean, 2);
      ssRes += Math.pow(p.y - yPred, 2);
    }
    rSquared = ssTot === 0 ? 1 : Math.max(0, 1 - (ssRes / ssTot));

    pathPts = [
      { x: mapX(xMin), y: mapY(slope * xMin + intercept) },
      { x: mapX(xMax), y: mapY(slope * xMax + intercept) }
    ];
    const sgn = intercept >= 0 ? "+" : "-";
    label = `y = ${slope.toFixed(3)}x ${sgn} ${Math.abs(intercept).toFixed(3)} (R² = ${rSquared.toFixed(3)})`;
  }

  let pathD = "";
  if (pathPts.length) {
    pathD = `M ${pathPts[0].x} ${pathPts[0].y} ` + pathPts.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
  }

  const lastPt = pathPts[pathPts.length - 1] || { x: plotArea.x + plotArea.width, y: plotArea.y + 20 };
  return {
    pathD,
    label,
    rSquared,
    labelX: lastPt.x - 10,
    labelY: lastPt.y - 12
  };
}

// --- Automated Peak & Valley Detection ---
function computePeaksForSeries(s) {
  const xVals = dataset.xValues || [];
  const n = xVals.length;
  if (n < 3) return [];
  const yVals = [];
  for (let i = 0; i < n; i++) yVals.push(displayY(s, i));

  let yMin = Infinity, yMax = -Infinity;
  for (let i = 0; i < n; i++) {
    if (yVals[i] < yMin) yMin = yVals[i];
    if (yVals[i] > yMax) yMax = yVals[i];
  }
  const yRange = yMax - yMin || 1;
  const sens = (state.peaks && state.peaks.sens) || 3;
  const type = (state.peaks && state.peaks.type) || "maxima";
  const threshold = yRange * (11 - sens) * 0.025;

  const peaks = [];
  for (let i = 1; i < n - 1; i++) {
    const isPeak = (yVals[i] > yVals[i-1] && yVals[i] >= yVals[i+1]);
    const isValley = (yVals[i] < yVals[i-1] && yVals[i] <= yVals[i+1]);

    if ((type === "maxima" || type === "both") && isPeak) {
      if ((yVals[i] - Math.min(yVals[i-1], yVals[i+1])) >= threshold || (yVals[i] - yMin) >= threshold) {
        peaks.push({ index: i, x: xVals[i], y: yVals[i], kind: "peak" });
      }
    } else if ((type === "minima" || type === "both") && isValley) {
      if ((Math.max(yVals[i-1], yVals[i+1]) - yVals[i]) >= threshold || (yMax - yVals[i]) >= threshold) {
        peaks.push({ index: i, x: xVals[i], y: yVals[i], kind: "valley" });
      }
    }
  }

  // FWHM for the dominant peak
  let domPeak = null;
  peaks.forEach(p => {
    if (p.kind === "peak" && (!domPeak || p.y > domPeak.y)) domPeak = p;
  });

  if (domPeak) {
    const halfY = yMin + 0.5 * (domPeak.y - yMin);
    let xLeft = domPeak.x;
    for (let i = domPeak.index; i >= 0; i--) {
      if (yVals[i] <= halfY) {
        const dyVal = (yVals[i+1] - yVals[i]) || 1;
        const t = (halfY - yVals[i]) / dyVal;
        xLeft = xVals[i] + t * (xVals[i+1] - xVals[i]);
        break;
      }
    }
    let xRight = domPeak.x;
    for (let i = domPeak.index; i < n; i++) {
      if (yVals[i] <= halfY) {
        const dyVal = (yVals[i] - yVals[i-1]) || 1;
        const t = (halfY - yVals[i-1]) / dyVal;
        xRight = xVals[i-1] + t * (xVals[i] - xVals[i-1]);
        break;
      }
    }
    domPeak.fwhm = Math.abs(xRight - xLeft);
    domPeak.halfY = halfY;
    domPeak.fwhmLeft = xLeft;
    domPeak.fwhmRight = xRight;
  }

  return peaks;
}

function updatePeakListSidebar(allPeaks) {
  const listEl = document.getElementById("peakListContent");
  if (!listEl) return;
  if (!allPeaks || !allPeaks.length) {
    listEl.innerHTML = `<span style="color: var(--text-dim);">${state.lang === 'fa' ? 'پیکی با این حساسیت یافت نشد' : 'No peaks detected at this sensitivity'}</span>`;
    return;
  }
  listEl.innerHTML = allPeaks.map((p, idx) => {
    const typeLabel = p.kind === "peak" ? "Peak" : "Valley";
    const fwhmStr = p.fwhm ? ` | FWHM: ${p.fwhm.toFixed(2)}` : "";
    return `
      <div class="peak-result-row">
        <span>#${idx + 1} (${p.seriesName}): ${typeLabel}</span>
        <span class="peak-result-val">X=${Number(p.x.toFixed(2))}, Y=${Number(p.y.toFixed(2))}${fwhmStr}</span>
      </div>
    `;
  }).join("");
}

// --- Export Clean Processed Data (Excel & CSV) ---
function exportProcessedData(format) {
  const xVals = dataset.xValues || [];
  const series = dataset.series.filter(s => s.visible);
  if (!xVals.length || !series.length) {
    showToast(state.lang === 'fa' ? 'داده‌ای برای خروجی وجود ندارد.' : 'No data to export.');
    return;
  }

  const order = xVals.map((_, i) => i);
  if (state.data.sortByX) order.sort((a, b) => xVals[a] - xVals[b]);

  const header = [state.xTitle || (state.lang === 'fa' ? 'محور X' : 'X')];
  series.forEach(s => {
    header.push(state.lang === 'fa' ? s.nameFa : s.nameEn);
  });

  const rows = [header];
  for (let idx of order) {
    const row = [xVals[idx]];
    series.forEach(s => {
      const v = displayY(s, idx);
      row.push(typeof v === 'number' ? Number(v.toFixed(4)) : v);
    });
    rows.push(row);
  }

  if (format === 'csv') {
    const csvContent = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Clean_Scientific_Data_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(state.lang === 'fa' ? 'فایل CSV داده‌های پردازش‌شده دانلود شد' : 'Processed CSV data downloaded');
  } else {
    if (typeof XLSX !== 'undefined') {
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Clean_Data");
      XLSX.writeFile(wb, `Clean_Scientific_Data_${Date.now()}.xlsx`);
      showToast(state.lang === 'fa' ? 'فایل اکسل داده‌های پردازش‌شده دانلود شد' : 'Processed Excel data downloaded');
    }
  }
}

// --- Scientific Color Palettes ---
function applyColorPalette(key) {
  const pal = SCIENTIFIC_PALETTES[key] || SCIENTIFIC_PALETTES.default;
  state.colorPalette = key;
  dataset.series.forEach((s, i) => {
    const c = pal[i % pal.length];
    s.colorDark = c.dark;
    s.colorLight = c.light;
  });
  setupSeriesCheckboxes();
  renderChart();
  renderLegend();
}

function exportExcelTemplate() {
  if (typeof XLSX === "undefined") {
    showToast("کتابخانه SheetJS بارگذاری نشده است.");
    return;
  }
  const numSeriesInput = document.getElementById("numSeriesInput");
  const numSeries = parseInt(numSeriesInput ? numSeriesInput.value : "3", 10) || 3;
  
  const headers = [state.xTitle || (state.lang === 'fa' ? 'محور X' : 'X')];
  for (let i = 1; i <= numSeries; i++) {
    headers.push(state.lang === 'fa' ? `نمونه ${i}` : `Sample ${i}`);
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
  // Find where the numeric data table begins (skipping instrument metadata / preambles like "Tech: CV", "E1(v)=...")
  const isNumericCell = v => {
    if (typeof v === "number") return isFinite(v);
    if (typeof v !== "string") return false;
    const s = v.trim();
    return s !== "" && !isNaN(Number(s));
  };
  const isDataRow = r => Array.isArray(r) && r.length >= 2 && isNumericCell(r[0]) && isNumericCell(r[1]);

  let firstDataIdx = -1;
  for (let i = 0; i < rows.length; i++) {
    if (isDataRow(rows[i])) {
      if (i + 1 < rows.length && isDataRow(rows[i + 1])) {
        firstDataIdx = i;
        break;
      } else if (i + 1 >= rows.length) {
        firstDataIdx = i;
        break;
      }
    }
  }

  if (firstDataIdx === -1) {
    firstDataIdx = rows.findIndex(r => r && isNumericCell(r[0]));
    if (firstDataIdx === -1) firstDataIdx = 0;
  }

  const candidateData = rows.slice(firstDataIdx).filter(r => r && r.length && isNumericCell(r[0]));
  const dataRows = candidateData.length ? candidateData : rows.slice(firstDataIdx);
  const numCols = dataRows[0] ? dataRows[0].length : 2;

  let headers = [];
  if (firstDataIdx > 0) {
    const prevRow = rows[firstDataIdx - 1];
    const isPrevRowHeader = prevRow && prevRow.some(c => isNaN(parseFloat(c)));
    if (isPrevRowHeader && prevRow.length === numCols) {
      headers = prevRow.map((h, i) => (h ? String(h).trim() : (i === 0 ? "RH (%)" : `نمونه ${i}`)));
    } else if (isPrevRowHeader && prevRow.length > numCols && prevRow.length % numCols === 0) {
      // Each column name was split into multiple words (e.g. "Potential /V" and "Current /uA")
      const wordsPerCol = prevRow.length / numCols;
      for (let c = 0; c < numCols; c++) {
        headers.push(prevRow.slice(c * wordsPerCol, (c + 1) * wordsPerCol).join(" "));
      }
    } else if (isPrevRowHeader && prevRow.length > 1) {
      headers = prevRow.slice(0, numCols).map((h, i) => (h ? String(h).trim() : (i === 0 ? "RH (%)" : `نمونه ${i}`)));
      while (headers.length < numCols) {
        headers.push(`نمونه ${headers.length}`);
      }
    } else {
      headers = ["RH (%)"];
      for (let i = 1; i < numCols; i++) {
        headers.push(`نمونه ${i}`);
      }
    }
  } else {
    // Data starts at row 0: check if row 0 itself is a header
    const r0 = rows[0];
    const isHeaderRow = isNaN(parseFloat(r0[0])) || 
      (typeof r0[1] === "string" && isNaN(parseFloat(r0[1])));

    if (isHeaderRow) {
      headers = r0.map((h, i) => (h ? String(h).trim() : (i === 0 ? "RH (%)" : `نمونه ${i}`)));
      dataRows.shift();
    } else {
      headers = ["RH (%)"];
      for (let i = 1; i < (r0 ? r0.length : numCols); i++) {
        headers.push(`نمونه ${i}`);
      }
    }
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
  // A column is an error column only when its own token is err/errors/SD/SE/STD/sigma/±/خطا.
  // The trailing guard keeps names such as "Sensor", "Sensitivity" or "StdDev" as series.
  const errRe = /(^|[\s(\[_])(?:±|σ)(?=$|[\s)\]_.,:;0-9])|(^|[\s(\[_])(?:±\s*)?(?:err(?:or)?s?|std|sd|se|sigma|خطا(?:ی|ها)?)(?![a-z])/i;
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

  const xColName = headers[0] || "";
  return { xValues, series: built, xColName };
}

function workbookRows(workbook) {
  const ws = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, {header: 1, defval: 0});
}

function applyWorkbookData(workbook) {
  return applyImportedRows(workbookRows(workbook));
}

// Shared import path: used by the file picker, the bundled-sample loader and the
// plain-text reader. Returns the imported X point count (0 when unusable).
function applyImportedRows(rows) {
  const parsed = parseSmartExcel(rows);
  if (!parsed.xValues || !parsed.xValues.length) {
    showToast(state.lang === "fa"
      ? "داده معتبری در فایل اکسل یافت نشد!"
      : "No usable data was found in that Excel file.");
    return 0;
  }

  // Auto-detect X/Y labels if the dataset carries clear headers (e.g. CV or potentiostat curves)
  if (parsed.xColName && parsed.xColName !== "RH (%)" && parsed.xColName !== "X") {
    state.xTitle = parsed.xColName;
    const inpXTitle = document.getElementById("inpXTitle");
    if (inpXTitle) inpXTitle.value = state.xTitle;
  }
  if (parsed.series && parsed.series.length === 1 && parsed.series[0].nameEn && !parsed.series[0].nameEn.startsWith("نمونه")) {
    state.yTitle = parsed.series[0].nameEn;
    const inpYTitle = document.getElementById("inpYTitle");
    if (inpYTitle) inpYTitle.value = state.yTitle;
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

  // Configure direct callout arrows dynamically (keep the in-plot legend where the user put it)
  state.callouts = {
    inplotX: isFinite(state.callouts.inplotX) ? state.callouts.inplotX : 160,
    inplotY: isFinite(state.callouts.inplotY) ? state.callouts.inplotY : 280
  };
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
  // A magnified region taken from the previous dataset would be meaningless now
  if (state.zoom && state.zoom.enabled) fitZoomToData();

  setupSeriesCheckboxes();
  setupCalloutsControls();
  renderDataTable();
  renderChart();
  renderLegend();

  return dataset.xValues.length;
}

// --- Plain-text data files: comma / tab / semicolon / pipe / whitespace separated ---
const TEXT_FILE_RE = /\.(csv|tsv|txt|dat|prn|asc)$/i;

function isTextDataFile(name) {
  return TEXT_FILE_RE.test(String(name || ""));
}

// Text files from lab software are often UTF-16 or a Windows codepage, not UTF-8
function decodeTextBuffer(buffer) {
  const bytes = new Uint8Array(buffer);
  let text;
  if (typeof TextDecoder === "undefined") {
    // Last resort (very old browsers): byte-per-char decoding
    text = Array.from(bytes).map(b => String.fromCharCode(b)).join("");
  } else if (bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xFE) {
    text = new TextDecoder("utf-16le").decode(bytes.subarray(2));
  } else if (bytes.length >= 2 && bytes[0] === 0xFE && bytes[1] === 0xFF) {
    text = new TextDecoder("utf-16be").decode(bytes.subarray(2));
  } else {
    text = new TextDecoder("utf-8").decode(bytes);
    if (text.indexOf("\uFFFD") !== -1) {
      try { text = new TextDecoder("windows-1252").decode(bytes); } catch (err) { /* keep UTF-8 */ }
    }
  }
  return text.replace(/^\uFEFF/, "");
}

// Split delimited text into raw rows, guessing the separator from the file itself
function splitTextRows(text) {
  const lines = String(text)
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .filter(l => l.trim() !== "" && l.trim().charAt(0) !== "#");
  if (!lines.length) return [];

  // When guessing separator, inspect lines containing numbers (the actual data block)
  const numLines = lines.filter(l => /\d/.test(l)).slice(0, 50);
  const sample = numLines.length >= 5 ? numLines : lines.slice(0, 25);
  const consistentCols = splitter => {
    const counts = sample.map(l => splitter(l).length);
    const tally = {};
    counts.forEach(n => { tally[n] = (tally[n] || 0) + 1; });
    let mode = 0, hits = 0;
    Object.keys(tally).forEach(k => {
      const n = Number(k);
      if (tally[k] > hits || (tally[k] === hits && n > mode)) { hits = tally[k]; mode = n; }
    });
    return mode >= 2 && hits >= Math.ceil(counts.length * 0.7) ? mode : 0;
  };

  const splitters = [
    l => l.split(","),
    l => l.split("\t"),
    l => l.split(";"),
    l => l.split("|"),
    l => l.trim().split(/\t+|\s{2,}/),
    l => l.trim().split(/[ \t]+/)
  ];
  let split = splitters[splitters.length - 1];
  for (const candidate of splitters) {
    if (consistentCols(candidate)) { split = candidate; break; }
  }

  const rows = lines.map(l => split(l).map(cell => cell.trim()));

  // A wide header (col1 units, col2 units …) must not add phantom columns to the data
  if (rows.length > 1) {
    const tally = {};
    rows.forEach(r => { tally[r.length] = (tally[r.length] || 0) + 1; });
    let mode = 0, hits = 0;
    Object.keys(tally).forEach(k => {
      const n = Number(k);
      if (tally[k] > hits || (tally[k] === hits && n > mode)) { hits = tally[k]; mode = n; }
    });
    if (rows[0].length !== mode && !rows[0].some(c => !isNaN(parseFloat(c)))) rows.shift();
  }
  return rows;
}

// Raw rows of a text file: SheetJS first (quoted fields, tabs, numbers), with the
// whitespace parser as fallback — SheetJS reads "X  Y  Z" as one single column.
function textRows(text) {
  let rows = [];
  try {
    rows = workbookRows(XLSX.read(text, {type: "string"}));
  } catch (err) {
    rows = [];
  }
  const oneColumn = !rows.length || rows.every(r => !r || r.length <= 1);
  return oneColumn ? splitTextRows(text) : rows;
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
      const points = isTextDataFile(file.name)
        ? applyImportedRows(textRows(decodeTextBuffer(evt.target.result)))
        : applyWorkbookData(XLSX.read(new Uint8Array(evt.target.result), {type: "array"}));
      if (!points) return;
      showToast(state.lang === "fa"
        ? `فایل با موفقیت بارگذاری شد (${points} نقطه)`
        : `File imported successfully (${points} points)`);
    } catch(err) {
      console.error("Excel import error:", err);
      showToast((state.lang === "fa" ? "خطا در بارگذاری اکسل: " : "Excel import failed: ")
        + (err.message || (state.lang === "fa" ? "فایل نامعتبر" : "invalid file")));
    }
  };
  reader.readAsArrayBuffer(file);
  e.target.value = ""; // Reset file input
}

// --- Bundled sample datasets: one-click demo data shipped in /samples ---
// Captions and axis labels reuse the wording of the README gallery figures;
// only options that differ from the plain import behaviour are listed.
const SAMPLE_OPTIONS = {
  "Raman_Spectroscopy.xlsx": {
    sortByX: true,
    flags: { showInplotLegend: true },
    callouts: { inplotX: 110, inplotY: 60 },
    title: { fa: "طیف‌سنجی رامان گرافن", en: "Raman Spectra of Graphene" },
    subtitle: {
      fa: "بررسی پیک‌های D، G و 2D در نمونه‌های سنتزی و خالص",
      en: "D, G, and 2D characteristic bands of defective vs. pristine graphene"
    },
    xTitle: { fa: "شیفت رامان (1/cm)", en: "Raman Shift (cm⁻¹)" },
    yTitle: { fa: "شدت (a.u.)", en: "Intensity (a.u.)" }
  },
  "Cyclic_Voltammetry.xlsx": {
    sortByX: false,
    flags: { showHysteresis: true, showInplotLegend: true },
    title: { fa: "ولتامتری چرخه‌ای (CV)", en: "Cyclic Voltammogram (CV)" },
    subtitle: {
      fa: "پاسخ جریان–پتانسیل در رفت و برگشت (حلقه کامل)",
      en: "Current–potential response over forward and reverse scans"
    },
    xTitle: { fa: "پتانسیل (ولت)", en: "Potential (V)" },
    yTitle: { fa: "جریان (میکروآمپر)", en: "Current (μA)" }
  },
  "QCM_Hysteresis.xlsx": {
    flags: { showHysteresis: true, showAnnotations: true },
    title: { fa: "پاسخ سنسور رطوبت QCM", en: "QCM Humidity Sensor Response" },
    subtitle: {
      fa: "حلقه هیسترزیس جذب و واجذب — نانوکامپوزیت در برابر نشاسته خالص",
      en: "Adsorption / desorption hysteresis of nanocomposite vs. pure starch films"
    },
    xTitle: { fa: "رطوبت نسبی (%)", en: "Relative Humidity, RH (%)" },
    yTitle: { fa: "تغییر فرکانس (هرتز)", en: "Frequency Shift, Δf (Hz)" }
  },
  "BeerLambert_Calibration.xlsx": {
    sortByX: true,
    showErrorBars: true,
    flags: { showTrendlines: true, showInplotLegend: true },
    title: { fa: "منحنی کالیبراسیون بیر–لامبرت", en: "Beer–Lambert Calibration Curve" },
    subtitle: {
      fa: "جذب سه‌تکراره با میله‌های خطای ±SD و برازش خطی",
      en: "Triplicate absorbance with ±SD error bars and linear fit"
    },
    xTitle: { fa: "غلظت (میلی‌مولار)", en: "Concentration (mM)" },
    yTitle: { fa: "جذب (a.u.)", en: "Absorbance (a.u.)" }
  },
  "Damped_Oscillation.xlsx": {
    sortByX: true,
    flags: { showInplotLegend: true },
    title: { fa: "پاسخ پله‌ای سیستم میرا", en: "Underdamped Step Response" },
    subtitle: {
      fa: "جابجایی جرم–فنر–میراگر برای دو نسبت میرایی",
      en: "Displacement of a mass–spring–damper for two damping ratios"
    },
    xTitle: { fa: "زمان (ثانیه)", en: "Time (s)" },
    yTitle: { fa: "جابجایی نرمال‌شده", en: "Normalised Displacement" }
  },
  "UVVis_Spectra.xlsx": {
    sortByX: true,
    flags: { showInplotLegend: true },
    title: { fa: "طیف جذبی UV-Vis", en: "UV-Vis Absorption Spectra" },
    subtitle: { fa: "سه نمونه کاتالیست در محدوده مرئی", en: "Three catalyst samples across the visible band" },
    xTitle: { fa: "طول موج (نانومتر)", en: "Wavelength (nm)" },
    yTitle: { fa: "جذب (a.u.)", en: "Absorbance (a.u.)" }
  },
  "Impedance_Bode.xlsx": {
    sortByX: true,
    xLog: true,
    flags: { showInplotLegend: true },
    title: { fa: "نمودار دامنه بُد", en: "Bode Magnitude Plot" },
    subtitle: {
      fa: "پاسخ پایین‌گذر دو قطبی، با و بدون نویز EMI (محور فرکانس لگاریتمی)",
      en: "Two-pole low-pass response with and without EMI (log frequency axis)"
    },
    xTitle: { fa: "فرکانس (هرتز)", en: "Frequency (Hz)" },
    yTitle: { fa: "بهره (دسی‌بل)", en: "Gain (dB)" }
  },
  "Solar_Cell_IV.xlsx": {
    sortByX: true,
    flags: { showAnnotations: true },
    title: { fa: "منحنی مشخصه I–V سلول خورشیدی", en: "Solar Cell I–V Characteristics" },
    subtitle: { fa: "ناحیه زانوی ضریب پرشدگی دو سلول پروسکایتی", en: "Fill-factor knee region of two perovskite cells" },
    xTitle: { fa: "ولتاژ (ولت)", en: "Voltage (V)" },
    yTitle: { fa: "جریان (میلی‌آمپر)", en: "Current (mA)" }
  }
};

async function loadBundledSample(fileName) {
  if (!fileName) return 0;
  if (typeof XLSX === "undefined") {
    showToast(state.lang === "fa" ? "کتابخانه SheetJS بارگذاری نشده است." : "SheetJS is not loaded.");
    return 0;
  }

  const lang = state.lang === "en" ? "en" : "fa";
  const sel = document.getElementById("selSampleDataset");
  const opt = sel && sel.selectedIndex >= 0 ? sel.options[sel.selectedIndex] : null;
  const optLabel = opt ? opt.getAttribute(`data-${lang}`) : null;
  const label = optLabel || fileName;

  try {
    const res = await fetch("samples/" + fileName, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const buffer = await res.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });

    const points = applyWorkbookData(workbook);
    if (!points) return 0;

    const opts = SAMPLE_OPTIONS[fileName] || {};
    const cap = v => (v && typeof v === "object" ? v[lang] : v);
    // Each sample renders the way its README figure is drawn, independently of
    // whatever data shaping was active before.
    state.ticks.xLog = !!opts.xLog;
    state.data.sortByX = !!opts.sortByX;
    state.data.smoothing = "straight";
    state.data.yTransform = "none";
    state.data.showErrorBars = !!opts.showErrorBars;
    // Display flags of the sample's README figure; journal style/theme stay as chosen
    const flags = opts.flags || {};
    state.showHysteresis = !!flags.showHysteresis;
    state.showAnnotations = !!flags.showAnnotations;
    state.showInplotLegend = !!flags.showInplotLegend;
    state.showTrendlines = !!flags.showTrendlines;
    state.showErrorBand = !!flags.showErrorBand;
    state.showDataLabels = !!flags.showDataLabels;
    if (opts.title) state.chartTitle = cap(opts.title);
    if (opts.subtitle) state.chartSubtitle = cap(opts.subtitle);
    if (opts.xTitle) state.xTitle = cap(opts.xTitle);
    if (opts.yTitle) state.yTitle = cap(opts.yTitle);
    if (opts.callouts) Object.assign(state.callouts, opts.callouts);

    syncUIFromState();
    renderChart();
    renderLegend();

    showToast(lang === "fa"
      ? `نمونه «${label}» بارگذاری شد — ${points} نقطه`
      : `Sample "${label}" loaded — ${points} points`);
    return points;
  } catch (err) {
    console.error("Sample load failed:", err);
    showToast(lang === "fa"
      ? "بارگذاری نمونه ناموفق بود؛ صفحه باید از روی سرور (نسخه آنلاین یا سرور محلی) باز شود."
      : "Could not load the sample; the page must be served over HTTP (online version or a local server).");
    return 0;
  }
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

  // Bundled sample datasets: picking one loads it, the button reloads the current pick
  const selSampleDataset = document.getElementById("selSampleDataset");
  const btnLoadSample = document.getElementById("btnLoadSample");
  if (selSampleDataset) {
    selSampleDataset.addEventListener("change", e => { if (e.target.value) loadBundledSample(e.target.value); });
  }
  if (btnLoadSample) {
    btnLoadSample.addEventListener("click", () => loadBundledSample(selSampleDataset ? selSampleDataset.value : ""));
  }

  // Copy LaTeX Table Button
  const btnCopyLatex = document.getElementById("copyLatexBtn");
  if (btnCopyLatex) {
    btnCopyLatex.addEventListener("click", () => {
      const xVals = dataset.xValues || [];
      const series = dataset.series.filter(s => s.visible);
      if (!xVals.length || !series.length) return;

      const cols = ["r", ...series.map(() => "r")].join("");
      const colHeaders = [escapeXml(state.xTitle || "X"), ...series.map(s => escapeXml(state.lang === "fa" ? s.nameFa : s.nameEn))].join(" & ");

      const rows = [];
      const maxRows = Math.min(xVals.length, 50);
      for (let i = 0; i < maxRows; i++) {
        const rowVals = [xVals[i], ...series.map(s => displayY(s, i))];
        rows.push(rowVals.map(v => typeof v === "number" ? Number(v.toFixed(4)) : v).join(" & ") + " \\\\");
      }

      const latex = [
        "\\begin{table}[htbp]",
        "\\centering",
        `\\caption{${state.chartTitle || "Experimental Data"}${xVals.length > 50 ? " (First 50 points)" : ""}}`,
        "\\label{tab:data}",
        `\\begin{tabular}{${cols}}`,
        "\\hline",
        colHeaders + " \\\\",
        "\\hline",
        ...rows,
        "\\hline",
        "\\end{tabular}",
        "\\end{table}"
      ].join("\n");

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(latex).then(() => {
          showToast(state.lang === "fa" ? "کد جدول LaTeX در کلیپ‌بورد کپی شد" : "LaTeX table code copied to clipboard");
        });
      }
    });
  }

  // Copy CV Metrics Button
  const btnCopyCV = document.getElementById("btnCopyCVMetrics");
  if (btnCopyCV) {
    btnCopyCV.addEventListener("click", () => {
      const cards = document.querySelectorAll("#cvMetricsGrid .cv-metric-card");
      if (!cards.length) return;
      const lines = [];
      cards.forEach(c => {
        const val = c.querySelector(".cv-metric-val")?.textContent || "";
        const lbl = c.querySelector(".cv-metric-lbl")?.textContent || "";
        lines.push(`${lbl}: ${val}`);
      });
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(lines.join("\n")).then(() => {
          showToast(state.lang === "fa" ? "مشخصات CV کپی شد" : "CV metrics copied to clipboard");
        });
      }
    });
  }

  // Drag and drop overlay & file handling
  const dropOverlay = document.getElementById("dropZoneOverlay");
  let dragCounter = 0;
  window.addEventListener("dragenter", e => {
    e.preventDefault();
    dragCounter++;
    if (dropOverlay) dropOverlay.classList.add("active");
  });
  window.addEventListener("dragleave", e => {
    e.preventDefault();
    dragCounter--;
    if (dragCounter <= 0) {
      dragCounter = 0;
      if (dropOverlay) dropOverlay.classList.remove("active");
    }
  });
  window.addEventListener("dragover", e => {
    e.preventDefault();
  });
  window.addEventListener("drop", e => {
    e.preventDefault();
    dragCounter = 0;
    if (dropOverlay) dropOverlay.classList.remove("active");
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (/\.(xlsx|xls|csv|tsv|txt|dat|prn|asc)$/i.test(droppedFile.name)) {
        importExcelFile({ target: { files: [droppedFile], value: "" } });
      }
    }
  });

  // Global Keyboard Shortcuts (Ctrl+S for PNG, Ctrl+C for copy chart, Ctrl+F for search)
  window.addEventListener("keydown", e => {
    const isCtrl = e.ctrlKey || e.metaKey;
    const tag = (e.target && e.target.tagName ? e.target.tagName.toLowerCase() : "");
    const isTyping = tag === "input" || tag === "textarea" || (e.target && e.target.isContentEditable);

    if (isCtrl && (e.key === "s" || e.key === "S")) {
      e.preventDefault();
      const btnExport = document.getElementById("exportPngBtn");
      if (btnExport) btnExport.click();
    } else if (isCtrl && (e.key === "c" || e.key === "C") && !isTyping && !window.getSelection().toString()) {
      e.preventDefault();
      copyImageToClipboard();
    } else if (isCtrl && (e.key === "f" || e.key === "F") && !isTyping) {
      e.preventDefault();
      const search = document.getElementById("sidebarSearchInput");
      if (search) {
        search.focus();
        search.select();
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
  const boxTrendOptions = document.getElementById("trendlineOptionsBox");
  if (chkTrendline) chkTrendline.addEventListener("change", e => {
    state.showTrendlines = e.target.checked;
    if (boxTrendOptions) boxTrendOptions.style.display = e.target.checked ? "block" : "none";
    renderChart();
  });

  const selFitModel = document.getElementById("selFitModel");
  if (selFitModel) selFitModel.addEventListener("change", e => {
    state.fitModel = e.target.value;
    renderChart();
  });
  const chkFitEquation = document.getElementById("chkFitEquation");
  if (chkFitEquation) chkFitEquation.addEventListener("change", e => {
    state.showFitEquation = e.target.checked;
    renderChart();
  });

  // Scientific Color Palette selector
  const selColorPalette = document.getElementById("selColorPalette");
  if (selColorPalette) selColorPalette.addEventListener("change", e => {
    applyColorPalette(e.target.value);
  });

  // Clean Data Export buttons
  const btnExportCleanExcel = document.getElementById("btnExportCleanExcel");
  if (btnExportCleanExcel) btnExportCleanExcel.addEventListener("click", () => exportProcessedData("xlsx"));
  const btnExportCleanCSV = document.getElementById("btnExportCleanCSV");
  if (btnExportCleanCSV) btnExportCleanCSV.addEventListener("click", () => exportProcessedData("csv"));

  // Peak Finder & FWHM controls
  const chkPeakFinder = document.getElementById("chkPeakFinder");
  const peakControlsBox = document.getElementById("peakFinderControls");
  if (chkPeakFinder) {
    chkPeakFinder.addEventListener("change", e => {
      state.peaks.enabled = e.target.checked;
      if (peakControlsBox) peakControlsBox.style.display = e.target.checked ? "block" : "none";
      renderChart();
    });
  }
  const selPeakType = document.getElementById("selPeakType");
  if (selPeakType) {
    selPeakType.addEventListener("change", e => {
      state.peaks.type = e.target.value;
      renderChart();
    });
  }
  const rngPeakSens = document.getElementById("rngPeakSens");
  if (rngPeakSens) {
    rngPeakSens.addEventListener("input", e => {
      state.peaks.sens = parseInt(e.target.value, 10) || 3;
      setText("valPeakSens", state.peaks.sens);
      renderChart();
    });
  }
  const chkShowFWHM = document.getElementById("chkShowFWHM");
  if (chkShowFWHM) {
    chkShowFWHM.addEventListener("change", e => {
      state.peaks.showFWHM = e.target.checked;
      renderChart();
    });
  }
  const chkPeakLabels = document.getElementById("chkPeakLabels");
  if (chkPeakLabels) {
    chkPeakLabels.addEventListener("change", e => {
      state.peaks.showLabels = e.target.checked;
      renderChart();
    });
  }
  const btnCopyPeaks = document.getElementById("btnCopyPeaks");
  if (btnCopyPeaks) {
    btnCopyPeaks.addEventListener("click", () => {
      const rows = document.querySelectorAll("#peakListContent .peak-result-row");
      if (!rows.length) return;
      const lines = [];
      rows.forEach(r => lines.push(r.textContent.trim()));
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(lines.join("\n")).then(() => {
          showToast(state.lang === "fa" ? "لیست پیک‌ها در کلیپ‌بورد کپی شد" : "Peak list copied to clipboard");
        });
      }
    });
  }

  // Crosshair Inspector toggle
  const chkCrosshair = document.getElementById("chkCrosshair");
  if (chkCrosshair) {
    chkCrosshair.addEventListener("change", e => {
      state.crosshair.enabled = e.target.checked;
      const chG = document.getElementById("crosshairGroup");
      if (chG && !e.target.checked) chG.style.display = "none";
    });
  }

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
  const searchInput = document.getElementById("sidebarSearchInput");
  if (searchInput) {
    searchInput.placeholder = lang === "en"
      ? "Search settings (e.g. font, color, ticks, scale...)"
      : "جستجوی سریع تنظیمات (مثلاً فونت، رنگ، تیک، مقیاس...)";
  }
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
  const boxTrendOptions = document.getElementById("trendlineOptionsBox");
  if (boxTrendOptions) boxTrendOptions.style.display = state.showTrendlines ? "block" : "none";
  setSel("selFitModel", state.fitModel || "linear");
  setChk("chkFitEquation", state.showFitEquation !== false);
  setSel("selColorPalette", state.colorPalette || "default");

  if (state.peaks) {
    setChk("chkPeakFinder", state.peaks.enabled);
    const boxPeakControls = document.getElementById("peakFinderControls");
    if (boxPeakControls) boxPeakControls.style.display = state.peaks.enabled ? "block" : "none";
    setSel("selPeakType", state.peaks.type || "maxima");
    if (document.getElementById("rngPeakSens")) document.getElementById("rngPeakSens").value = state.peaks.sens || 3;
    setText("valPeakSens", state.peaks.sens || 3);
    setChk("chkShowFWHM", state.peaks.showFWHM !== false);
    setChk("chkPeakLabels", state.peaks.showLabels !== false);
  }
  if (state.crosshair) {
    setChk("chkCrosshair", state.crosshair.enabled);
  }

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
    "showGrid", "showHysteresis", "showTrendlines", "fitModel", "showFitEquation", "colorPalette", "showCalloutBox",
    "chartTitle", "chartSubtitle", "xTitle", "yTitle"];
  scalars.forEach(k => { if (s[k] !== undefined) state[k] = s[k]; });
  ["axis", "layout", "ticks", "type", "data", "zoom", "peaks", "crosshair"].forEach(k => {
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
      const orig = btn.getAttribute("data-origin");
      state.layout.axisOrigin = orig;
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

// Sidebar Navigation Tabs & Instant Search
function initSidebarTabsAndSearch() {
  const tabBtns = document.querySelectorAll(".sidebar-tab-btn");
  const tabPanes = document.querySelectorAll(".sidebar-tab-pane");
  const searchInput = document.getElementById("sidebarSearchInput");
  const searchClearBtn = document.getElementById("btnSidebarSearchClear");
  const searchBadge = document.getElementById("searchResultsBadge");

  function switchTab(tabId) {
    tabBtns.forEach(btn => {
      const match = btn.getAttribute("data-tab") === tabId;
      btn.classList.toggle("active", match);
      btn.setAttribute("aria-selected", match ? "true" : "false");
    });
    tabPanes.forEach(pane => {
      pane.classList.toggle("active", pane.id === tabId);
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      switchTab(tabId);
    });
  });

  if (searchInput) {
    function performSearch() {
      const q = (searchInput.value || "").trim().toLowerCase();
      if (!q) {
        if (searchClearBtn) searchClearBtn.style.display = "none";
        if (searchBadge) searchBadge.style.display = "none";
        document.querySelectorAll(".search-matched").forEach(el => el.classList.remove("search-matched"));
        const activeBtn = document.querySelector(".sidebar-tab-btn.active");
        if (activeBtn) switchTab(activeBtn.getAttribute("data-tab"));
        return;
      }

      if (searchClearBtn) searchClearBtn.style.display = "flex";

      let totalMatches = 0;
      let firstMatchingTabId = null;

      document.querySelectorAll(".search-matched").forEach(el => el.classList.remove("search-matched"));

      tabPanes.forEach(pane => {
        let paneMatches = 0;
        const searchableItems = pane.querySelectorAll(".control-group, .accordion, .slider-control, .input-field");
        searchableItems.forEach(item => {
          const text = (item.textContent || "").toLowerCase();
          const inputs = Array.from(item.querySelectorAll("input, select, button"))
            .map(el => (el.id || "") + " " + (el.getAttribute("data-fa") || "") + " " + (el.getAttribute("data-en") || "") + " " + (el.placeholder || ""))
            .join(" ").toLowerCase();
          
          if (text.includes(q) || inputs.includes(q)) {
            item.classList.add("search-matched");
            paneMatches++;
            totalMatches++;
          }
        });

        if (paneMatches > 0 && !firstMatchingTabId) {
          firstMatchingTabId = pane.id;
        }
      });

      if (searchBadge) {
        searchBadge.style.display = "inline-block";
        const lang = state.lang === "en" ? "en" : "fa";
        if (totalMatches === 0) {
          searchBadge.textContent = lang === "en" ? "No settings found" : "تنظیمی یافت نشد";
          searchBadge.style.background = "rgba(239, 68, 68, 0.15)";
          searchBadge.style.borderColor = "rgba(239, 68, 68, 0.35)";
          searchBadge.style.color = "#ef4444";
        } else {
          searchBadge.textContent = lang === "en" 
            ? `${totalMatches} setting${totalMatches > 1 ? "s" : ""} found` 
            : `${totalMatches} مورد یافت شد`;
          searchBadge.style.background = "var(--primary-glow)";
          searchBadge.style.borderColor = "rgba(79, 70, 229, 0.25)";
          searchBadge.style.color = "var(--primary-accent)";
        }
      }

      const currentActivePane = document.querySelector(".sidebar-tab-pane.active");
      const currentHasMatches = currentActivePane && currentActivePane.querySelector(".search-matched");
      if (firstMatchingTabId && !currentHasMatches) {
        switchTab(firstMatchingTabId);
      }
    }

    searchInput.addEventListener("input", performSearch);
    if (searchClearBtn) {
      searchClearBtn.addEventListener("click", () => {
        searchInput.value = "";
        performSearch();
        searchInput.focus();
      });
    }
  }
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
  initSidebarTabsAndSearch();
  state._booted = true;
});

