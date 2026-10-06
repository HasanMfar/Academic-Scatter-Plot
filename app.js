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
  xValues: [21.6, 43.1, 51.4, 75.1, 83.6, 93.6, 93.6, 83.6, 75.1, 51.4, 43.1, 21.6],
  series: [
    {
      id: "nano1",
      nameFa: "نانوکامپوزیت",
      nameEn: "Nanocomposite",
      group: "nano",
      colorDark: "#06b6d4",
      colorLight: "#0284c7",
      marker: "circle",
      strokeDash: "",
      yValues: [0, -48, -62, -119, -135, -156, -147, -130, -118, -60, -52, 0],
      visible: true
    },
    {
      id: "starch1",
      nameFa: "نشاسته خالص",
      nameEn: "Pure Starch",
      group: "starch",
      colorDark: "#f43f5e",
      colorLight: "#e11d48",
      marker: "square",
      strokeDash: "",
      yValues: [0, -30, -37, -119, -242, -390, -379, -271, -143, -58, -43, 0],
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
  showErrorBand: true,
  showAnnotations: true,
  showInplotLegend: true,
  showBottomLegend: true,
  showDataLabels: false,
  showGrid: true,
  showHysteresis: true,
  showTrendlines: false, // New feature: Trendline & R²

  // Axis overrides (null means auto-calculate or default)
  axis: {
    xMin: 20,
    xMax: 100,
    xStep: 10,
    yMin: -450,
    yMax: 50,
    yStep: 50
  },

  // Editable titles
  chartTitle: "تغییر فرکانس بر حسب رطوبت نسبی: نانوکامپوزیت در مقایسه با نشاسته خالص",
  chartSubtitle: "نمودار اسکتر پلات پاسخ سنسور (Scatter Plot without Trendlines)",
  xTitle: "RH (%)",
  yTitle: "Δf (Hz)",
  nanoLabel: "نانوکامپوزیت",
  nanoSub: "پایداری بالا در رطوبت",
  starchLabel: "نشاسته خالص",
  starchSub: "افت شدید فرکانس",

  // Coordinates
  callouts: {
    nanoX: 705,
    nanoY: 100,
    starchX: 495,
    starchY: 275,
    inplotX: 160,
    inplotY: 280
  },

  defaultCallouts: {
    nanoX: 705,
    nanoY: 100,
    starchX: 495,
    starchY: 275,
    inplotX: 160,
    inplotY: 280
  }
};

// --- 3. Language Presets ---
const presets = {
  fa: {
    chartTitle: "تغییر فرکانس بر حسب رطوبت نسبی: نانوکامپوزیت در مقایسه با نشاسته خالص",
    chartSubtitle: "نمودار اسکتر پلات پاسخ سنسور (Scatter Plot without Trendlines)",
    xTitle: "RH (%)",
    yTitle: "Δf (Hz)",
    nanoLabel: "نانوکامپوزیت",
    nanoSub: "پایداری بالا در رطوبت",
    starchLabel: "نشاسته خالص",
    starchSub: "افت شدید فرکانس",
    badgeNano: "نانوکامپوزیت: پایداری بالاتر",
    badgeStarch: "نشاسته خالص: افت شدید فرکانس",
    metricNanoTitle: "نانوکامپوزیت در 93.6% RH",
    metricNanoDesc: "میانگین تغییر فرکانس: -۱۵۱.۵ هرتز (پایداری مطلوب در رطوبت بالا)",
    metricStarchTitle: "نشاسته خالص در 93.6% RH",
    metricStarchDesc: "میانگین تغییر فرکانس: -۳۸۴.۵ هرتز (افت شدید ناشی از تورم و جذب رطوبت)",
    metricDiffTitle: "بهبود عملکرد نانوکامپوزیت",
    metricDiffDesc: "کاهش ۲۳۳ هرتزی افت فرکانس به دلیل نفوذناپذیری نانوذرات"
  },
  en: {
    chartTitle: "Frequency Shift vs. Relative Humidity: Nanocomposite vs. Pure Starch",
    chartSubtitle: "Sensor frequency response scatter plot (No trendlines)",
    xTitle: "RH (%)",
    yTitle: "Δf (Hz)",
    nanoLabel: "Nanocomposite",
    nanoSub: "High RH Stability",
    starchLabel: "Pure Starch",
    starchSub: "Sharp Frequency Drop",
    badgeNano: "Nanocomposite: Higher Stability",
    badgeStarch: "Pure Starch: Sharp Frequency Drop",
    metricNanoTitle: "Nanocomposite at 93.6% RH",
    metricNanoDesc: "Mean frequency shift: -151.5 Hz (Stability retained at high RH)",
    metricStarchTitle: "Pure Starch at 93.6% RH",
    metricStarchDesc: "Mean frequency shift: -384.5 Hz (Severe frequency drop)",
    metricDiffTitle: "Performance Gain",
    metricDiffDesc: "60.6% reduction in unwanted swelling/moisture frequency drop"
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
const inputNanoLabel = document.getElementById("inputNanoLabel");
const inputNanoSub = document.getElementById("inputNanoSub");
const inputStarchLabel = document.getElementById("inputStarchLabel");
const inputStarchSub = document.getElementById("inputStarchSub");

// Sliders
const rngNanoX = document.getElementById("rngNanoX");
const rngNanoY = document.getElementById("rngNanoY");
const rngStarchX = document.getElementById("rngStarchX");
const rngStarchY = document.getElementById("rngStarchY");
const rngInplotX = document.getElementById("rngInplotX");
const rngInplotY = document.getElementById("rngInplotY");

const valNanoX = document.getElementById("valNanoX");
const valNanoY = document.getElementById("valNanoY");
const valStarchX = document.getElementById("valStarchX");
const valStarchY = document.getElementById("valStarchY");
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
  x: chartBox.marginLeft,
  y: chartBox.marginTop,
  width: chartBox.width - chartBox.marginLeft - chartBox.marginRight,
  height: chartBox.height - chartBox.marginTop - chartBox.marginBottom
};

function mapX(val) {
  return plotArea.x + ((val - state.axis.xMin) / (state.axis.xMax - state.axis.xMin)) * plotArea.width;
}

function mapY(val) {
  return plotArea.y + ((state.axis.yMax - val) / (state.axis.yMax - state.axis.yMin)) * plotArea.height;
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

// --- 6. Render SVG Chart ---
function renderChart() {
  const isDark = state.theme === "dark";
  const colors = {
    bg: isDark ? "#0f172a" : "#ffffff",
    grid: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
    axis: isDark ? "#94a3b8" : "#334155",
    axisZero: isDark ? "rgba(255, 255, 255, 0.3)" : "#94a3b8",
    text: isDark ? "#cbd5e1" : "#475569",
    title: isDark ? "#f8fafc" : "#0f172a",
    calloutBg: isDark ? "rgba(15, 23, 42, 0.94)" : "rgba(255, 255, 255, 0.98)",
    calloutBorder: isDark ? "rgba(148, 163, 184, 0.35)" : "#94a3b8"
  };

  const xTicks = [];
  for (let t = state.axis.xMin; t <= state.axis.xMax; t += state.axis.xStep) {
    xTicks.push(t);
  }
  const yTicks = [];
  for (let t = state.axis.yMin; t <= state.axis.yMax; t += state.axis.yStep) {
    yTicks.push(t);
  }

  const nanoColor = isDark ? "#06b6d4" : "#0284c7";
  const starchColor = isDark ? "#f43f5e" : "#e11d48";

  let svgContent = `
    <defs>
      <filter id="badgeShadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.35" />
      </filter>
      <marker id="arrowNano" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <polygon points="0 1.5, 9 5, 0 8.5" fill="${nanoColor}" />
      </marker>
      <marker id="arrowStarch" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <polygon points="0 1.5, 9 5, 0 8.5" fill="${starchColor}" />
      </marker>
    </defs>

    <!-- Plot Area Background -->
    <rect x="${plotArea.x}" y="${plotArea.y}" width="${plotArea.width}" height="${plotArea.height}" 
          fill="${colors.bg}" rx="4" />
  `;

  // Grid Lines
  if (state.showGrid) {
    yTicks.forEach(tick => {
      const yPos = mapY(tick);
      const isZero = tick === 0;
      svgContent += `
        <line x1="${plotArea.x}" y1="${yPos}" x2="${plotArea.x + plotArea.width}" y2="${yPos}"
              stroke="${isZero ? colors.axisZero : colors.grid}"
              stroke-width="${isZero ? 1.5 : 1}"
              ${isZero ? '' : 'stroke-dasharray="3,3"'} />
      `;
    });

    xTicks.forEach(tick => {
      const xPos = mapX(tick);
      svgContent += `
        <line x1="${xPos}" y1="${plotArea.y}" x2="${xPos}" y2="${plotArea.y + plotArea.height}"
              stroke="${colors.grid}" stroke-width="1" stroke-dasharray="3,3" />
      `;
    });
  }

  // Shaded Replicate Error Bands
  if (state.showErrorBand && state.plotMode === "scatter-line") {
    const sNano1 = dataset.series.find(s => s.id === "nano1");
    const sNano2 = dataset.series.find(s => s.id === "nano2");
    if (sNano1 && sNano2 && sNano1.visible && sNano2.visible) {
      let bandD = "";
      dataset.xValues.forEach((x, i) => {
        const px = mapX(x);
        const py = mapY(sNano1.yValues[i]);
        bandD += i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`;
      });
      for (let i = dataset.xValues.length - 1; i >= 0; i--) {
        const px = mapX(dataset.xValues[i]);
        const py = mapY(sNano2.yValues[i]);
        bandD += ` L ${px} ${py}`;
      }
      bandD += " Z";
      svgContent += `<path d="${bandD}" fill="${nanoColor}" opacity="0.16" />`;
    }

    const sStarch1 = dataset.series.find(s => s.id === "starch1");
    const sStarch2 = dataset.series.find(s => s.id === "starch2");
    if (sStarch1 && sStarch2 && sStarch1.visible && sStarch2.visible) {
      let bandD = "";
      dataset.xValues.forEach((x, i) => {
        const px = mapX(x);
        const py = mapY(sStarch1.yValues[i]);
        bandD += i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`;
      });
      for (let i = dataset.xValues.length - 1; i >= 0; i--) {
        const px = mapX(dataset.xValues[i]);
        const py = mapY(sStarch2.yValues[i]);
        bandD += ` L ${px} ${py}`;
      }
      bandD += " Z";
      svgContent += `<path d="${bandD}" fill="${starchColor}" opacity="0.16" />`;
    }
  }

  // Axes Framing
  // Left Y-Axis
  svgContent += `
    <line x1="${plotArea.x}" y1="${plotArea.y}" x2="${plotArea.x}" y2="${plotArea.y + plotArea.height}"
          stroke="${colors.axis}" stroke-width="1.8" />
  `;

  // Bottom X-Axis
  svgContent += `
    <line x1="${plotArea.x}" y1="${plotArea.y + plotArea.height}" x2="${plotArea.x + plotArea.width}" y2="${plotArea.y + plotArea.height}"
          stroke="${colors.axis}" stroke-width="1.8" />
  `;

  // Boxed Journal Frame: Top and Right Spines with Inward Ticks (Classic Nature/ACS ISI style)
  if (state.frameStyle === "boxed") {
    // Top spine
    svgContent += `
      <line x1="${plotArea.x}" y1="${plotArea.y}" x2="${plotArea.x + plotArea.width}" y2="${plotArea.y}"
            stroke="${colors.axis}" stroke-width="1.5" />
    `;
    // Right spine
    svgContent += `
      <line x1="${plotArea.x + plotArea.width}" y1="${plotArea.y}" x2="${plotArea.x + plotArea.width}" y2="${plotArea.y + plotArea.height}"
            stroke="${colors.axis}" stroke-width="1.5" />
    `;

    // Inward ticks on Top and Right
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

  // Y Ticks & Labels
  yTicks.forEach(tick => {
    const yPos = mapY(tick);
    const tickStr = tick === 0 ? "0" : `-${Math.abs(tick)}`;
    svgContent += `
      <line x1="${plotArea.x - 6}" y1="${yPos}" x2="${plotArea.x}" y2="${yPos}"
            stroke="${colors.axis}" stroke-width="1.5" />
      <text x="${plotArea.x - 12}" y="${yPos + 4}"
            fill="${colors.text}" font-size="12" font-family="'Plus Jakarta Sans', Arial, sans-serif"
            font-weight="600" text-anchor="end" direction="ltr">${tickStr}</text>
    `;
  });

  // X Ticks & Labels
  xTicks.forEach(tick => {
    const xPos = mapX(tick);
    svgContent += `
      <line x1="${xPos}" y1="${plotArea.y + plotArea.height}" x2="${xPos}" y2="${plotArea.y + plotArea.height + 6}"
            stroke="${colors.axis}" stroke-width="1.5" />
      <text x="${xPos}" y="${plotArea.y + plotArea.height + 22}"
            fill="${colors.text}" font-size="12" font-family="'Plus Jakarta Sans', Arial, sans-serif"
            font-weight="600" text-anchor="middle" direction="ltr">${tick}</text>
    `;
  });

  // Axis Titles
  svgContent += `
    <text x="${plotArea.x + plotArea.width / 2}" y="${chartBox.height - 18}"
          fill="${colors.title}" font-size="15" font-weight="700" text-anchor="middle"
          direction="ltr" font-family="'Plus Jakarta Sans', 'Vazirmatn', sans-serif">${state.xTitle}</text>

    <text x="${- (plotArea.y + plotArea.height / 2)}" y="${28}"
          fill="${colors.title}" font-size="15" font-weight="700" text-anchor="middle"
          transform="rotate(-90)" direction="ltr"
          font-family="'Plus Jakarta Sans', 'Vazirmatn', sans-serif">${state.yTitle}</text>
  `;

  // Render Series
  dataset.series.forEach(s => {
    if (!s.visible) return;

    const seriesColor = isDark ? s.colorDark : s.colorLight;
    const xVals = dataset.xValues;
    const yVals = s.yValues;

    if (state.plotMode === "scatter-line") {
      let pathD = "";
      let pathDBack = "";
      
      let maxIdx = xVals.length - 1;
      if (state.showHysteresis) {
         let maxX = -Infinity;
         for (let i = 0; i < xVals.length; i++) {
            if (xVals[i] > maxX) {
               maxX = xVals[i];
               maxIdx = i;
            }
         }
      }

      xVals.forEach((xVal, idx) => {
        const px = mapX(xVal);
        const py = mapY(yVals[idx]);
        
        if (idx <= maxIdx) {
           pathD += idx === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`;
        } else {
           pathDBack += idx === maxIdx + 1 ? `M ${mapX(xVals[maxIdx])} ${mapY(yVals[maxIdx])} L ${px} ${py}` : ` L ${px} ${py}`;
        }
      });

      // Forward Path
      svgContent += `
        <path d="${pathD}" fill="none" stroke="${seriesColor}" stroke-width="${state.lineWidth}"
              stroke-linejoin="round" stroke-linecap="round"
              ${s.strokeDash ? `stroke-dasharray="${s.strokeDash}"` : ""}
              opacity="0.92" />
      `;
      
      // Backward Path
      if (pathDBack) {
         const backDash = state.showHysteresis ? "6,5" : (s.strokeDash || "");
         svgContent += `
           <path d="${pathDBack}" fill="none" stroke="${seriesColor}" stroke-width="${state.lineWidth}"
                 stroke-linejoin="round" stroke-linecap="round"
                 ${backDash ? `stroke-dasharray="${backDash}"` : ""}
                 opacity="${state.showHysteresis ? 0.75 : 0.92}" />
         `;
      }
      
      // Directional Arrows
      if (state.showHysteresis) {
         for (let i = 0; i < xVals.length - 1; i++) {
             const px1 = mapX(xVals[i]);
             const py1 = mapY(yVals[i]);
             const px2 = mapX(xVals[i+1]);
             const py2 = mapY(yVals[i+1]);
             
             const dx = px2 - px1;
             const dy = py2 - py1;
             const dist = Math.sqrt(dx*dx + dy*dy);
             
             if (dist > 25) {
                 const midX = px1 + dx * 0.55;
                 const midY = py1 + dy * 0.55;
                 const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                 const isBack = i >= maxIdx;
                 
                 svgContent += `
                    <g transform="translate(${midX}, ${midY}) rotate(${angle})" opacity="${isBack ? 0.75 : 0.95}">
                       <polygon points="-5,-4.5 4.5,0 -5,4.5" fill="${seriesColor}" />
                    </g>
                 `;
             }
         }
      }
    }

    xVals.forEach((xVal, idx) => {
      const px = mapX(xVal);
      const yVal = yVals[idx];
      const py = mapY(yVal);
      const pointSvg = getMarkerSvg(s.marker, px, py, state.markerSize, seriesColor, isDark ? "#0f172a" : "#ffffff");

      svgContent += `
        <g class="point-group" data-series="${s.id}" data-x="${xVal}" data-y="${yVal}" data-idx="${idx}">
          <circle cx="${px}" cy="${py}" r="${state.markerSize + 4}" fill="transparent" style="cursor: pointer;" />
          ${pointSvg}
          ${state.showDataLabels ? `
            <text x="${px}" y="${py - 10}" fill="${colors.text}" font-size="10.5"
                  font-weight="700" text-anchor="middle" direction="ltr" font-family="'Plus Jakarta Sans', sans-serif">${yVal}</text>
          ` : ""}
        </g>
      `;
    });

    // --- Trendlines ---
    if (state.showTrendlines) {
      let n = xVals.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      for(let i=0; i<n; i++) {
        sumX += xVals[i];
        sumY += yVals[i];
        sumXY += xVals[i] * yVals[i];
        sumXX += xVals[i] * xVals[i];
      }
      let slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      let intercept = (sumY - slope * sumX) / n;

      let yMean = sumY / n;
      let ssTot = 0, ssRes = 0;
      for(let i=0; i<n; i++) {
        let yPred = slope * xVals[i] + intercept;
        ssTot += Math.pow(yVals[i] - yMean, 2);
        ssRes += Math.pow(yVals[i] - yPred, 2);
      }
      let rSquared = ssTot === 0 ? 1 : 1 - (ssRes / ssTot);
      
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
              stroke="${seriesColor}" stroke-width="2" stroke-dasharray="8,4" opacity="0.8" />
        <text x="${px2 - 10}" y="${py2 - 10}" fill="${seriesColor}" font-size="11" font-weight="bold" font-family="'Plus Jakarta Sans', Arial, sans-serif" text-anchor="end" direction="ltr">R² = ${rSquared.toFixed(3)}</text>
      `;
    }
  });

  // Callouts & Dynamic Arrows
  if (state.showAnnotations) {
    const isFa = state.lang === "fa";

    // Nanocomposite Callout
    const lastIdx = dataset.xValues.length - 1;
    const nanoTargetX = mapX(dataset.xValues[lastIdx]);
    const nanoTargetY = mapY(-151.5);
    const nanoCardX = state.callouts.nanoX;
    const nanoCardY = state.callouts.nanoY;
    const nanoCardW = 165;
    const nanoCardH = 44;

    const nanoArrow = getBoxArrowPoints(nanoCardX, nanoCardY, nanoCardW, nanoCardH, nanoTargetX, nanoTargetY);

    svgContent += `
      <g class="annotation-group">
        <line x1="${nanoArrow.sx}" y1="${nanoArrow.sy}" x2="${nanoArrow.ex}" y2="${nanoArrow.ey}"
              stroke="${nanoColor}" stroke-width="2.2" stroke-linecap="round"
              marker-end="url(#arrowNano)" />

        <g class="draggable-badge" data-badge="nano" filter="url(#badgeShadow)">
          <rect x="${nanoCardX}" y="${nanoCardY}" width="${nanoCardW}" height="${nanoCardH}" rx="8"
                fill="${colors.calloutBg}" stroke="${nanoColor}" stroke-width="1.8" />
          <text x="${nanoCardX + nanoCardW / 2}" y="${nanoCardY + 19}" fill="${nanoColor}" font-size="13" font-weight="700"
                text-anchor="middle" direction="ltr" font-family="${isFa ? 'Vazirmatn' : 'Plus Jakarta Sans'}">${state.nanoLabel}</text>
          ${state.nanoSub ? `
            <text x="${nanoCardX + nanoCardW / 2}" y="${nanoCardY + 34}" fill="${colors.text}" font-size="10" font-weight="500"
                  text-anchor="middle" direction="ltr" font-family="${isFa ? 'Vazirmatn' : 'Plus Jakarta Sans'}">${state.nanoSub}</text>
          ` : ""}
        </g>
      </g>
    `;

    // Pure Starch Callout
    const starchPlungeIdx = Math.max(0, dataset.xValues.length - 2);
    const starchTargetX = mapX(dataset.xValues[starchPlungeIdx]);
    const starchTargetY = mapY(-256.5);
    const starchCardX = state.callouts.starchX;
    const starchCardY = state.callouts.starchY;
    const starchCardW = 160;
    const starchCardH = 44;

    const starchArrow = getBoxArrowPoints(starchCardX, starchCardY, starchCardW, starchCardH, starchTargetX, starchTargetY);

    svgContent += `
      <g class="annotation-group">
        <line x1="${starchArrow.sx}" y1="${starchArrow.sy}" x2="${starchArrow.ex}" y2="${starchArrow.ey}"
              stroke="${starchColor}" stroke-width="2.2" stroke-linecap="round"
              marker-end="url(#arrowStarch)" />

        <g class="draggable-badge" data-badge="starch" filter="url(#badgeShadow)">
          <rect x="${starchCardX}" y="${starchCardY}" width="${starchCardW}" height="${starchCardH}" rx="8"
                fill="${colors.calloutBg}" stroke="${starchColor}" stroke-width="1.8" />
          <text x="${starchCardX + starchCardW / 2}" y="${starchCardY + 19}" fill="${starchColor}" font-size="13" font-weight="700"
                text-anchor="middle" direction="ltr" font-family="${isFa ? 'Vazirmatn' : 'Plus Jakarta Sans'}">${state.starchLabel}</text>
          ${state.starchSub ? `
            <text x="${starchCardX + starchCardW / 2}" y="${starchCardY + 34}" fill="${colors.text}" font-size="10" font-weight="500"
                  text-anchor="middle" direction="ltr" font-family="${isFa ? 'Vazirmatn' : 'Plus Jakarta Sans'}">${state.starchSub}</text>
          ` : ""}
        </g>
      </g>
    `;
  }

  // In-Plot Scientific Legend Box
  if (state.showInplotLegend) {
    const isFa = state.lang === "fa";
    const legBoxX = state.callouts.inplotX;
    const legBoxY = state.callouts.inplotY;
    const legBoxW = 230;
    const legBoxH = 148;

    svgContent += `
      <g class="draggable-badge" data-badge="inplot" filter="url(#badgeShadow)">
        <rect x="${legBoxX}" y="${legBoxY}" width="${legBoxW}" height="${legBoxH}" rx="8"
              fill="${colors.calloutBg}" stroke="${colors.calloutBorder}" stroke-width="1.4" />
        
        <text x="${legBoxX + 16}" y="${legBoxY + 22}" fill="${colors.title}" font-size="12" font-weight="700"
              direction="ltr" text-anchor="start" font-family="${isFa ? 'Vazirmatn' : 'Plus Jakarta Sans'}">
          ${isFa ? 'راهنمای نمونه‌ها:' : 'Legend / Samples:'}
        </text>
    `;

    dataset.series.forEach((s, idx) => {
      const itemY = legBoxY + 44 + (idx * 25);
      const seriesColor = isDark ? s.colorDark : s.colorLight;
      const name = isFa ? s.nameFa : s.nameEn;
      const lineX1 = legBoxX + 16;
      const lineX2 = legBoxX + 42;
      const markerCx = legBoxX + 29;

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
        <text x="${legBoxX + 50}" y="${itemY + 4}" fill="${s.visible ? colors.text : colors.axis}"
              font-size="11.5" font-weight="600" opacity="${s.visible ? 1 : 0.35}"
              direction="ltr" text-anchor="start"
              font-family="${isFa ? 'Vazirmatn' : 'Plus Jakarta Sans'}">${name}</text>
      `;
    });

    svgContent += `</g>`;
  }

  svg.innerHTML = svgContent;

  attachHoverListeners();
  attachDragListeners();
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

      tooltip.innerHTML = `
        <div style="font-weight: 700; color: ${state.theme === 'dark' ? s.colorDark : s.colorLight}; margin-bottom: 3px;">
          ${seriesName}
        </div>
        <div>RH: <strong>${x}%</strong></div>
        <div>Δf: <strong>${y} Hz</strong></div>
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
      const badgeType = badge.getAttribute("data-badge");
      const coords = getSvgCoords(e);

      let initX, initY;
      if (badgeType === "nano") {
        initX = state.callouts.nanoX;
        initY = state.callouts.nanoY;
      } else if (badgeType === "starch") {
        initX = state.callouts.starchX;
        initY = state.callouts.starchY;
      } else if (badgeType === "inplot") {
        initX = state.callouts.inplotX;
        initY = state.callouts.inplotY;
      }

      activeDrag = {
        type: badgeType,
        offsetX: coords.x - initX,
        offsetY: coords.y - initY
      };
    });
  });
}

window.addEventListener("mousemove", e => {
  if (!activeDrag) return;
  const coords = getSvgCoords(e);
  let newX = Math.round(coords.x - activeDrag.offsetX);
  let newY = Math.round(coords.y - activeDrag.offsetY);

  newX = Math.max(50, Math.min(newX, 820));
  newY = Math.max(20, Math.min(newY, 480));

  if (activeDrag.type === "nano") {
    state.callouts.nanoX = newX;
    state.callouts.nanoY = newY;
    if (rngNanoX) rngNanoX.value = newX;
    if (rngNanoY) rngNanoY.value = newY;
    if (valNanoX) valNanoX.textContent = `${newX} px`;
    if (valNanoY) valNanoY.textContent = `${newY} px`;
  } else if (activeDrag.type === "starch") {
    state.callouts.starchX = newX;
    state.callouts.starchY = newY;
    if (rngStarchX) rngStarchX.value = newX;
    if (rngStarchY) rngStarchY.value = newY;
    if (valStarchX) valStarchX.textContent = `${newX} px`;
    if (valStarchY) valStarchY.textContent = `${newY} px`;
  } else if (activeDrag.type === "inplot") {
    state.callouts.inplotX = newX;
    state.callouts.inplotY = newY;
    if (rngInplotX) rngInplotX.value = newX;
    if (rngInplotY) rngInplotY.value = newY;
    if (valInplotX) valInplotX.textContent = `${newX} px`;
    if (valInplotY) valInplotY.textContent = `${newY} px`;
  }

  renderChart();
});

window.addEventListener("mouseup", () => {
  activeDrag = null;
});

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
  if (!legendContainer) return;
  if (!state.showBottomLegend) {
    legendContainer.style.display = "none";
    return;
  }
  legendContainer.style.display = "flex";
  legendContainer.innerHTML = "";
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
    let html = `<td><input type="number" step="0.1" class="table-input" data-col="x" data-idx="${idx}" value="${x}"></td>`;
    
    dataset.series.forEach(s => {
      html += `<td><input type="number" class="table-input" data-col="${s.id}" data-idx="${idx}" value="${s.yValues[idx] ?? 0}"></td>`;
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
  dataset.xValues.splice(idx, 1);
  dataset.series.forEach(s => s.yValues.splice(idx, 1));
  renderDataTable();
  renderChart();
}

function addRow() {
  const lastX = dataset.xValues.length > 0 ? dataset.xValues[dataset.xValues.length - 1] + 10 : 0;
  dataset.xValues.push(lastX);
  dataset.series.forEach(s => s.yValues.push(0));
  renderDataTable();
}


function applyTableData() {
  const inputs = dataTableBody.querySelectorAll(".table-input");
  inputs.forEach(input => {
    const col = input.getAttribute("data-col");
    const idx = parseInt(input.getAttribute("data-idx"), 10);
    const val = parseFloat(input.value) || 0;

    if (col === "x") {
      dataset.xValues[idx] = val;
    } else {
      const s = dataset.series.find(item => item.id === col);
      if (s) s.yValues[idx] = val;
    }
  });

  renderChart();
  showToast("داده‌های جدید روی نمودار اعمال شدند!");
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

function importExcelFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (typeof XLSX === "undefined") {
    showToast("کتابخانه SheetJS بارگذاری نشده است.");
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(evt) {
    const data = new Uint8Array(evt.target.result);
    const workbook = XLSX.read(data, {type: 'array'});
    const ws = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, {header: 1, defval: 0}); // Get arrays
    
    if (rows.length < 2) {
      showToast("فایل خالی است یا ساختار درستی ندارد!");
      return;
    }
    
    const headers = rows[0];
    const newSeries = [];
    const colorPalette = [
      { dark: "#06b6d4", light: "#0284c7" }, // cyan
      { dark: "#f43f5e", light: "#e11d48" }, // rose
      { dark: "#10b981", light: "#059669" }, // emerald
      { dark: "#f59e0b", light: "#d97706" }, // amber
      { dark: "#8b5cf6", light: "#6d28d9" }, // violet
      { dark: "#ec4899", light: "#be185d" }  // pink
    ];
    const markers = ["circle", "square", "diamond", "triangle", "cross"];
    
    // Create series from columns
    for (let i = 1; i < headers.length; i++) {
       const colName = headers[i] || `Sample ${i}`;
       const color = colorPalette[(i-1) % colorPalette.length];
       const marker = markers[(i-1) % markers.length];
       newSeries.push({
         id: `series_${i}`,
         nameFa: colName,
         nameEn: colName,
         group: "custom",
         colorDark: color.dark,
         colorLight: color.light,
         marker: marker,
         strokeDash: "",
         yValues: [],
         visible: true
       });
    }
    
    const newX = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length === 0 || row[0] == null || isNaN(parseFloat(row[0]))) continue;
      newX.push(parseFloat(row[0]) || 0);
      newSeries.forEach((s, sIdx) => {
        s.yValues.push(parseFloat(row[sIdx + 1]) || 0);
      });
    }
    
    dataset.xValues = newX;
    dataset.series = newSeries;
    
    setupSeriesCheckboxes();
    renderDataTable();
    renderChart();
    renderLegend();
    showToast("فایل با موفقیت ایمپورت و روی نمودار اعمال شد!");
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

      ctx.fillStyle = state.theme === "dark" ? "#0f172a" : "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
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

    ctx.fillStyle = state.theme === "dark" ? "#0f172a" : "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
  const svgString = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.download = `scatter-plot-RH-deltaF-${state.theme}-${state.lang}.svg`;
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
  state.nanoLabel = p.nanoLabel;
  state.nanoSub = p.nanoSub;
  state.starchLabel = p.starchLabel;
  state.starchSub = p.starchSub;

  if (inputChartTitle) inputChartTitle.value = state.chartTitle;
  if (inputChartSubtitle) inputChartSubtitle.value = state.chartSubtitle;
  if (inputXTitle) inputXTitle.value = state.xTitle;
  if (inputYTitle) inputYTitle.value = state.yTitle;
  if (inputNanoLabel) inputNanoLabel.value = state.nanoLabel;
  if (inputNanoSub) inputNanoSub.value = state.nanoSub;
  if (inputStarchLabel) inputStarchLabel.value = state.starchLabel;
  if (inputStarchSub) inputStarchSub.value = state.starchSub;

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

  const badgeNano = document.getElementById("badgeNano");
  if (badgeNano) badgeNano.textContent = p.badgeNano;
  const badgeStarch = document.getElementById("badgeStarch");
  if (badgeStarch) badgeStarch.textContent = p.badgeStarch;

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
      <span id="lbl_${s.id}">${state.lang === 'fa' ? s.nameFa : s.nameEn}</span>
    `;
    lbl.querySelector("input").addEventListener("change", (e) => {
      s.visible = e.target.checked;
      renderChart();
      renderLegend();
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
    wrapper.appendChild(colorPicker);
    container.appendChild(wrapper);
  });


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

  if (inputNanoLabel) {
    inputNanoLabel.addEventListener("input", e => {
      state.nanoLabel = e.target.value;
      renderChart();
    });
  }

  if (inputNanoSub) {
    inputNanoSub.addEventListener("input", e => {
      state.nanoSub = e.target.value;
      renderChart();
    });
  }

  if (inputStarchLabel) {
    inputStarchLabel.addEventListener("input", e => {
      state.starchLabel = e.target.value;
      renderChart();
    });
  }

  if (inputStarchSub) {
    inputStarchSub.addEventListener("input", e => {
      state.starchSub = e.target.value;
      renderChart();
    });
  }

  // Sliders for Callout Positions
  if (rngNanoX) {
    rngNanoX.addEventListener("input", e => {
      state.callouts.nanoX = parseInt(e.target.value, 10);
      if (valNanoX) valNanoX.textContent = `${state.callouts.nanoX} px`;
      renderChart();
    });
  }

  if (rngNanoY) {
    rngNanoY.addEventListener("input", e => {
      state.callouts.nanoY = parseInt(e.target.value, 10);
      if (valNanoY) valNanoY.textContent = `${state.callouts.nanoY} px`;
      renderChart();
    });
  }

  if (rngStarchX) {
    rngStarchX.addEventListener("input", e => {
      state.callouts.starchX = parseInt(e.target.value, 10);
      if (valStarchX) valStarchX.textContent = `${state.callouts.starchX} px`;
      renderChart();
    });
  }

  if (rngStarchY) {
    rngStarchY.addEventListener("input", e => {
      state.callouts.starchY = parseInt(e.target.value, 10);
      if (valStarchY) valStarchY.textContent = `${state.callouts.starchY} px`;
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
      state.callouts.nanoX = state.defaultCallouts.nanoX;
      state.callouts.nanoY = state.defaultCallouts.nanoY;
      state.callouts.starchX = state.defaultCallouts.starchX;
      state.callouts.starchY = state.defaultCallouts.starchY;
      state.callouts.inplotX = state.defaultCallouts.inplotX;
      state.callouts.inplotY = state.defaultCallouts.inplotY;

      if (rngNanoX) rngNanoX.value = state.callouts.nanoX;
      if (rngNanoY) rngNanoY.value = state.callouts.nanoY;
      if (rngStarchX) rngStarchX.value = state.callouts.starchX;
      if (rngStarchY) rngStarchY.value = state.callouts.starchY;
      if (rngInplotX) rngInplotX.value = state.callouts.inplotX;
      if (rngInplotY) rngInplotY.value = state.callouts.inplotY;

      if (valNanoX) valNanoX.textContent = `${state.callouts.nanoX} px`;
      if (valNanoY) valNanoY.textContent = `${state.callouts.nanoY} px`;
      if (valStarchX) valStarchX.textContent = `${state.callouts.starchX} px`;
      if (valStarchY) valStarchY.textContent = `${state.callouts.starchY} px`;
      if (valInplotX) valInplotX.textContent = `${state.callouts.inplotX} px`;
      if (valInplotY) valInplotY.textContent = `${state.callouts.inplotY} px`;

      renderChart();
      showToast("موقعیت تمام المان‌ها بازنشانی شد.");
    });
  }

  // Table buttons
  if (btnApplyTableData) btnApplyTableData.addEventListener("click", applyTableData);
  if (btnExportTemplate) btnExportTemplate.addEventListener("click", exportExcelTemplate);
  if (btnAddRow) btnAddRow.addEventListener("click", addRow);
  if (excelImportInput) excelImportInput.addEventListener("change", importExcelFile);

  // Advanced Options
  const chkTrendline = document.getElementById("chkTrendline");
  if (chkTrendline) chkTrendline.addEventListener("change", e => {
    state.showTrendlines = e.target.checked;
    renderChart();
  });

  ['inpXMin', 'inpXMax', 'inpXStep', 'inpYMin', 'inpYMax', 'inpYStep'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("change", e => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
          if (id === 'inpXMin') state.axis.xMin = val;
          if (id === 'inpXMax') state.axis.xMax = val;
          if (id === 'inpXStep') state.axis.xStep = val;
          if (id === 'inpYMin') state.axis.yMin = val;
          if (id === 'inpYMax') state.axis.yMax = val;
          if (id === 'inpYStep') state.axis.yStep = val;
          renderChart();
        }
      });
    }
  });
}

// Initial Boot
document.addEventListener("DOMContentLoaded", () => {
  setupSeriesCheckboxes();
  renderDataTable();
  renderChart();
  renderLegend();
  initEvents();
});
