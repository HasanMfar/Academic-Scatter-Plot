# 🎓 Academic Scatter Plot Generator

A beautiful, interactive, and fully client-side web application designed for students, researchers, and academics to generate **publication-ready scatter plots** with zero coding required.

## ✨ Why this tool?
Often, researchers use complex software (like OriginLab or MATLAB) just to plot simple data or sensor responses. This tool provides a **simple, drag-and-drop web interface** that runs entirely in your browser and exports ultra-HD images ready for journal submission.

## 🚀 Features

- **📊 Dynamic Excel Integration:** Upload your `.xlsx` data directly. The app dynamically detects your columns, assigns distinct colors/markers, and plots them.
- **🔄 Smart Hysteresis Detection:** Automatically detects forward and backward paths in cyclic data (like sensor responses), styling them with directional arrows and dashed return lines.
- **🖼️ Publication-Quality Export:** 
  - Save as **300/600 DPI PNG** for direct insertion into MS Word or PowerPoint.
  - Save as **Vector SVG** for Adobe Illustrator or Inkscape.
  - One-click **Copy to Clipboard** feature.
- **🖱️ Drag & Drop Callouts:** Click and drag text labels directly on the chart to position them perfectly without overlapping your data.
- **🌍 Bilingual & Dual Theme:** Switch seamlessly between **English (LTR)** and **Persian (RTL)**, and choose between an Academic Light theme or a Modern Dark theme.

## 🛠️ How to Use

1. Simply download this repository and open `index.html` in any modern web browser. (No server or installation needed!)
2. In the right panel, generate and download an **Excel Template** based on your number of samples.
3. Fill the template with your data and upload it back.
4. Customize your titles, markers, and line widths.
5. Export and publish!

## 💻 Tech Stack
Built with vanilla web technologies for maximum performance and portability:
- **HTML5 / CSS3 / JavaScript** (No build steps, no heavy frameworks)
- **[SheetJS](https://sheetjs.com/)** for native Excel `.xlsx` parsing.

---
*Open-source and crafted for the academic community.*
