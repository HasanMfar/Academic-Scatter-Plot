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
      id: "series_1",
      nameFa: "نمونه ۱",
      nameEn: "Sample 1",
      group: "series_1",
      colorDark: "#06b6d4",
      colorLight: "#0284c7",
      marker: "circle",
      strokeDash: "",
      yValues: [0, -48, -62, -119, -135, -156, -147, -130, -118, -60, -52, 0],
      visible: true
    },
    {
      id: "series_2",
      nameFa: "نمونه ۲",
      nameEn: "Sample 2",
      group: "series_2",
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

function getSeriesCallout(s, idx) {
  if (!state.callouts[s.id]) {
    // Default: point at the max-X (turning) point of the series, label up-left of it
    let ptIdx = 0;
    dataset.xValues.forEach((x, i) => { if (x > dataset.xValues[ptIdx]) ptIdx = i; });
    const tx = Math.round(mapX(dataset.xValues[ptIdx] ?? 80));
    const ty = Math.round(mapY(s.yValues && s.yValues[ptIdx] != null ? s.yValues[ptIdx] : 0));
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
function renderChart() {
  const isDark = state.theme === "dark";
  const FONT = state.lang === "fa" ? "Tahoma, Vazirmatn, Arial, sans-serif" : "Arial, Helvetica, sans-serif";
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

  const xStep = Math.max(0.0001, state.axis.xStep || 10);
  const yStep = Math.max(0.0001, state.axis.yStep || 50);
  const xMin = state.axis.xMin;
  const xMax = state.axis.xMax > xMin ? state.axis.xMax : xMin + 1;
  const yMin = state.axis.yMin;
  const yMax = state.axis.yMax > yMin ? state.axis.yMax : yMin + 1;

  const xTicks = [];
  for (let t = xMin, count = 0; t <= xMax + 1e-9 && count < 200; t += xStep, count++) {
    xTicks.push(Math.round(t * 1e6) / 1e6);
  }
  const yTicks = [];
  for (let t = yMin, count = 0; t <= yMax + 1e-9 && count < 200; t += yStep, count++) {
    yTicks.push(Math.round(t * 1e6) / 1e6);
  }

  let svgContent = `
    <defs>
      <filter id="badgeShadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.35" />
      </filter>
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
    for (let k = 0; k < dataset.series.length - 1; k += 2) {
      const sA = dataset.series[k];
      const sB = dataset.series[k + 1];
      if (sA && sB && sA.visible && sB.visible && sA.yValues && sB.yValues) {
        let bandD = "";
        dataset.xValues.forEach((x, i) => {
          const px = mapX(x);
          const py = mapY(sA.yValues[i]);
          bandD += i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`;
        });
        for (let i = dataset.xValues.length - 1; i >= 0; i--) {
          const px = mapX(dataset.xValues[i]);
          const py = mapY(sB.yValues[i]);
          bandD += ` L ${px} ${py}`;
        }
        bandD += " Z";
        const bandColor = state.theme === "dark" ? sA.colorDark : sA.colorLight;
        svgContent += `<path d="${bandD}" fill="${bandColor}" opacity="0.16" />`;
      }
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
    const tickStr = `${tick}`;
    svgContent += `
      <line x1="${plotArea.x - 6}" y1="${yPos}" x2="${plotArea.x}" y2="${yPos}"
            stroke="${colors.axis}" stroke-width="1.5" />
      <text x="${plotArea.x - 12}" y="${yPos + 5}"
            fill="${colors.title}" font-size="15" font-family="Arial, Helvetica, sans-serif"
            text-anchor="end" direction="ltr">${tickStr}</text>
    `;
  });

  // X Ticks & Labels
  xTicks.forEach(tick => {
    const xPos = mapX(tick);
    svgContent += `
      <line x1="${xPos}" y1="${plotArea.y + plotArea.height}" x2="${xPos}" y2="${plotArea.y + plotArea.height + 6}"
            stroke="${colors.axis}" stroke-width="1.5" />
      <text x="${xPos}" y="${plotArea.y + plotArea.height + 25}"
            fill="${colors.title}" font-size="15" font-family="Arial, Helvetica, sans-serif"
            text-anchor="middle" direction="ltr">${tick}</text>
    `;
  });

  // Axis Titles
  svgContent += `
    <text x="${plotArea.x + plotArea.width / 2}" y="${chartBox.height - 16}"
          fill="${colors.title}" font-size="18" font-weight="700" text-anchor="middle"
          font-family="${FONT}">${state.xTitle}</text>

    <text x="${- (plotArea.y + plotArea.height / 2)}" y="${30}"
          fill="${colors.title}" font-size="18" font-weight="700" text-anchor="middle"
          transform="rotate(-90)"
          font-family="${FONT}">${state.yTitle}</text>
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
                 opacity="0.92" />
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

    let turnIdx = 0;
    xVals.forEach((x, i) => { if (x > xVals[turnIdx]) turnIdx = i; });
    xVals.forEach((xVal, idx) => {
      const px = mapX(xVal);
      const yVal = yVals[idx];
      const py = mapY(yVal);
      // Backward path points are drawn hollow so forward/backward are distinguishable in print
      const hollow = state.showHysteresis && idx > turnIdx;
      const pointSvg = hollow
        ? getMarkerSvg(s.marker, px, py, state.markerSize, colors.bg, seriesColor)
        : getMarkerSvg(s.marker, px, py, state.markerSize, seriesColor, seriesColor);

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
    if (state.showTrendlines && xVals.length >= 2) {
      let n = xVals.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      for(let i=0; i<n; i++) {
        sumX += xVals[i];
        sumY += yVals[i];
        sumXY += xVals[i] * yVals[i];
        sumXX += xVals[i] * xVals[i];
      }
      let denom = (n * sumXX - sumX * sumX);
      if (Math.abs(denom) > 1e-12) {
        let slope = (n * sumXY - sumX * sumY) / denom;
        let intercept = (sumY - slope * sumX) / n;

        let yMean = sumY / n;
        let ssTot = 0, ssRes = 0;
        for(let i=0; i<n; i++) {
          let yPred = slope * xVals[i] + intercept;
          ssTot += Math.pow(yVals[i] - yMean, 2);
          ssRes += Math.pow(yVals[i] - yPred, 2);
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
                stroke="${seriesColor}" stroke-width="2" stroke-dasharray="8,4" opacity="0.8" />
          <text x="${px2 - 10}" y="${py2 - 10}" fill="${seriesColor}" font-size="11" font-weight="bold" font-family="'Plus Jakarta Sans', Arial, sans-serif" text-anchor="end" direction="ltr">R² = ${rSquared.toFixed(3)}</text>
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
      const cardW = Math.max(60, sName.length * 10.5 + 12);
      const cardH = 28;

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
            <text x="${callout.x + cardW / 2}" y="${callout.y + 20}" fill="${col}" font-size="19" font-weight="700"
                  text-anchor="middle" font-family="${FONT}">${sName}</text>
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
    const legBoxW = 230;
    const legBoxH = Math.max(80, 44 + (dataset.series.length * 26));

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
      <text x="${tx}" y="${y + 5}" font-size="15" fill="${keyCol}" text-anchor="${anc}" font-family="${FONT}">${label}</text>`;
    svgContent += `
      <rect x="${kx}" y="${ky}" width="${kw}" height="${kh}" fill="${colors.bg}" stroke="${colors.calloutBorder}" stroke-width="1" />
      ${row(ky + 22, false, false, isFa ? "مسیر رفت" : "Forward")}
      ${row(ky + 50, true, true, isFa ? "مسیر برگشت" : "Backward")}
    `;
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
      newX = Math.max(50, Math.min(newX, 850));
      newY = Math.max(20, Math.min(newY, 480));
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
    newX = Math.max(50, Math.min(newX, 680));
    newY = Math.max(30, Math.min(newY, 420));
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
        <input type="range" min="80" max="850" value="${callout.x}" id="rng_bx_${s.id}">
      </div>

      <div class="slider-control" style="margin-bottom: 6px;">
        <div class="slider-control-header">
          <span>${isFa ? 'محل کادر متن (Y)' : 'Box Y'}</span>
          <span id="lbl_by_${s.id}">${callout.y} px</span>
        </div>
        <input type="range" min="30" max="480" value="${callout.y}" id="rng_by_${s.id}">
      </div>

      <div class="slider-control" style="margin-bottom: 6px;">
        <div class="slider-control-header">
          <span>${isFa ? 'نوک فلش / نقطه اشاره (X)' : 'Target X'}</span>
          <span id="lbl_tx_${s.id}">${callout.targetX} px</span>
        </div>
        <input type="range" min="90" max="850" value="${callout.targetX}" id="rng_tx_${s.id}">
      </div>

      <div class="slider-control" style="margin-bottom: 0;">
        <div class="slider-control-header">
          <span>${isFa ? 'نوک فلش / نقطه اشاره (Y)' : 'Target Y'}</span>
          <span id="lbl_ty_${s.id}">${callout.targetY} px</span>
        </div>
        <input type="range" min="40" max="480" value="${callout.targetY}" id="rng_ty_${s.id}">
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
    if (s.yValues && s.yValues.length) allY.push(...s.yValues);
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

  return { xValues, series };
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

  setupSeriesCheckboxes();
  setupCalloutsControls();
  renderDataTable();
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

// Initial Boot
document.addEventListener("DOMContentLoaded", () => {
  setupSeriesCheckboxes();
  setupCalloutsControls();
  renderDataTable();
  renderChart();
  renderLegend();
  initEvents();
});
