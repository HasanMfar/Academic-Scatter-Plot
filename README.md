# 🎓 Academic Scatter Plot Generator / رسم‌کننده نمودار آکادمیک

[🇮🇷 برای مطالعه نسخه فارسی کلیک کنید](#-توضیحات-فارسی)

**▶️ [نسخه آنلاین — بدون نیاز به دانلود](https://hasanmfar.github.io/Academic-Scatter-Plot/)** · Online demo, no install required

<p align="center">
  <a href="https://hasanmfar.github.io/Academic-Scatter-Plot/"><img alt="Live demo" src="https://img.shields.io/badge/live%20demo-GitHub%20Pages-181717?logo=githubpages&logoColor=white"></a>
  <img alt="100% client-side" src="https://img.shields.io/badge/100%25%20client--side-no%20upload-4c1">
  <img alt="PNG 600 DPI and SVG export" src="https://img.shields.io/badge/export-PNG%20600%20DPI%20%7C%20SVG-orange">
  <img alt="English and Persian UI" src="https://img.shields.io/badge/UI-English%20%7C%20Persian-0f6cbd">
</p>

<p align="center">
  <img src="App_Preview.png" alt="Academic Hysteresis Scatter Plot Interface" width="820">
</p>

A beautiful, interactive, and fully client-side web application designed for students, researchers, and academics to generate **publication-ready scatter plots** with zero coding required.

## ✨ Why this tool?
Often, researchers use complex software (like OriginLab or MATLAB) just to plot simple data or sensor responses. This tool provides a **simple, drag-and-drop web interface** that runs entirely in your browser and exports ultra-HD images ready for journal submission.

## 🚀 Features

- **📊 Dynamic Excel Integration:** Upload your `.xlsx` data directly. The app dynamically detects your columns, assigns distinct colors/markers, and plots them.
- **🔄 Smart Hysteresis Detection:** Automatically detects forward and backward paths in cyclic data (like sensor responses), styling them with directional arrows and dashed return lines.
- **📈 Linear Trendlines & R²:** Automatically calculates the line of best fit and the R² coefficient for regression and scientific analysis.
- **⚡ Custom Axis Limits & Auto-Scaling:** Freely set custom min, max, and step for both axes, or click the Auto Scale button to fit the data bounds using standard academic intervals.
- **📝 Live In-Table Data Editor:** Add, remove, or edit points directly in the interactive data table with full decimal/floating-point support.
- **🖼️ Publication-Quality Export:** 
  - Save as **300/600 DPI PNG** for direct insertion into MS Word or PowerPoint.
  - Save as **Vector SVG** for Adobe Illustrator or Inkscape.
  - One-click **Copy to Clipboard** feature.
- **🖱️ Drag & Drop Callouts:** Click and drag text labels directly on the chart to position them perfectly without overlapping your data.
- **🌍 Bilingual & Dual Theme:** Switch seamlessly between **English (LTR)** and **Persian (RTL)**, and choose between an Academic Light theme or a Modern Dark theme.
- **📁 Included Sample Template:** Try out `Clean_Hysteresis_Data.xlsx` included in the root directory for an instant demonstration of hysteresis loops.
- **🧾 Plain-text Data Import:** `.csv`, `.tsv` and `.txt` files work too — comma, tab, semicolon, pipe or plain-space separated, with UTF-8 / UTF-16 / Windows-codepage text detected automatically, and `#` comment lines ignored.
- **🎯 One-Click Sample Datasets:** Six ready-made datasets ship with the app — pick one from **Quick-load a sample dataset** and every feature shows up on real data.
- **📐 Figure Presets & Canvas Sizes:** One click restyles the whole chart as *Compact*, *Double-column*, *Open frame, serif* or *Axes at zero*; canvas presets run from single-column up to 16:9.
- **🔍 Magnifier Inset:** Frame a crowded region and magnify it in a publication-style inset — ideal for spectrum crossings and I–V knees.
- **🎛️ Fine-Grained Control:** Boxed or open frame, axis origin (corner / through zero / center), minor ticks, tick direction, decimal places, scatter-only or scatter+line mode, in-plot legend and data labels.
- **🔒 Your Data Never Leaves the Browser:** Parsing and rendering happen entirely on your machine — no server, no account, no upload.

## 🖼️ Gallery

Real figures rendered by the app itself — nothing here was drawn by hand. Every image below comes with its own `.xlsx` source in [`samples/`](samples), so you can load it, tweak it, and re-export it in seconds.

<table>
<tr>
<td align="center"><img src="gallery/01_qcm_hysteresis.png" width="420"><br><sub><b>QCM humidity hysteresis</b> — boxed compact preset, forward/backward paths</sub></td>
<td align="center"><img src="gallery/02_beer_lambert.png" width="420"><br><sub><b>Beer–Lambert calibration</b> — ±SD error bars, linear fit + R²</sub></td>
</tr>
<tr>
<td align="center"><img src="gallery/03_uvvis_spectra.png" width="420"><br><sub><b>UV-Vis spectra</b> — open-frame serif style</sub></td>
<td align="center"><img src="gallery/04_damped_oscillation.png" width="420"><br><sub><b>Damped oscillation</b> — compact preset, axes through zero</sub></td>
</tr>
<tr>
<td align="center"><img src="gallery/05_bode_log.png" width="420"><br><sub><b>Bode magnitude</b> — log frequency axis, dark theme</sub></td>
<td align="center"><img src="gallery/06_solar_iv.png" width="420"><br><sub><b>Solar cell I–V</b> — fill-factor knee region</sub></td>
</tr>
<tr>
<td align="center"><img src="gallery/07_magnifier_inset.png" width="420"><br><sub><b>Magnifier inset</b> — publication-style zoom region</sub></td>
<td align="center"><img src="gallery/08_fa_hysteresis.png" width="420"><br><sub><b>نسخه فارسی</b> — رابط راست‌چین و برچسب‌های فارسی</sub></td>
</tr>
</table>

### 📂 Sample datasets

| File | What it demonstrates |
|------|----------------------|
| [`samples/QCM_Hysteresis.xlsx`](samples/QCM_Hysteresis.xlsx) | Cyclic sensor response — hysteresis detection, dashed return path, direction arrows |
| [`samples/BeerLambert_Calibration.xlsx`](samples/BeerLambert_Calibration.xlsx) | Linear regression — trendline + R², `SD` columns auto-attached as ± error bars |
| [`samples/Damped_Oscillation.xlsx`](samples/Damped_Oscillation.xlsx) | Dense time series — 121 points, spline/straight toggle, sort-by-X |
| [`samples/UVVis_Spectra.xlsx`](samples/UVVis_Spectra.xlsx) | Three overlapping spectra — marker/color assignment, magnifier inset |
| [`samples/Impedance_Bode.xlsx`](samples/Impedance_Bode.xlsx) | 5 decades of frequency — log-scale X axis |
| [`samples/Solar_Cell_IV.xlsx`](samples/Solar_Cell_IV.xlsx) | Sharp-knee I–V curve — custom axis limits, direct callout labels |

> ☕ Each file is synthetic demo data generated by [`temp_build/make_samples.js`](temp_build/make_samples.js); the gallery images are rendered by the app's own engine via [`temp_build/make_gallery.js`](temp_build/make_gallery.js).

## 🛠️ How to Use

1. Easiest: open the **[online version](https://hasanmfar.github.io/Academic-Scatter-Plot/)** — nothing to install. Or download this repository and open `index.html` in any modern web browser. First time here? Use **Quick-load a sample dataset** in the right panel to see everything working on real data.
2. In the right panel, generate and download an **Excel Template** based on your number of samples (or use `Clean_Hysteresis_Data.xlsx`).
3. Fill the template with your data and upload it back — or upload your own `.csv` / `.tsv` / `.txt` export (comma, tab, semicolon, pipe or space separated; first column = X, the rest = Y).
4. Customize your titles, markers, colors, and line widths.
5. Export and publish!

## 🧰 Under the hood

- **No build step, no framework** — three files do the job: [`index.html`](index.html), [`app.js`](app.js) and [`style.css`](style.css). Open `index.html` and it runs.
- **Excel parsing** uses a vendored copy of [SheetJS](https://sheetjs.com/) (`xlsx.full.min.js`) with a CDN fallback, so reading your file needs no server round-trip.
- **Charts are live SVG** — which is why exports are exact: vector `.svg` for Illustrator/Inkscape and PNG at 200/300/600 DPI for Word or LaTeX.
- **Tests:** `npm install` then `npm test` — jsdom suites covering the render smoke test, Excel import, text import and the sample picker (all under [`temp_build/`](temp_build)).

---

<br>

# 🇮🇷 توضیحات فارسی

یک نرم‌افزار تحت وب زیبا، تعاملی و کاملاً آفلاین که برای دانشجویان، محققین و دانشگاهیان طراحی شده تا **نمودارهای پراکندگی (Scatter Plots) در سطح مقالات ISI** را بدون نیاز به هیچ‌گونه برنامه‌نویسی رسم کنند.

**▶️ [نسخه آنلاین — بدون نیاز به دانلود](https://hasanmfar.github.io/Academic-Scatter-Plot/)**

## ✨ چرا این ابزار؟
پژوهشگران معمولاً برای رسم یک نمودار ساده یا بررسی رفتار یک سنسور، مجبور به استفاده از نرم‌افزارهای سنگینی مثل OriginLab یا MATLAB می‌شوند. این ابزار یک **رابط کاربری ساده و با قابلیت کشیدن و رها کردن (Drag-and-Drop)** را درون مرورگر شما فراهم می‌کند تا تصاویر Ultra-HD مناسب چاپ در ژورنال‌های علمی را در چند ثانیه خروجی بگیرید.

## 🚀 امکانات اصلی

- **📊 اتصال مستقیم به اکسل:** فایل `.xlsx` خود را مستقیماً در برنامه آپلود کنید. برنامه به‌طور خودکار ستون‌ها را می‌خواند، به هر کدام رنگ و شکل هندسی مجزا اختصاص می‌دهد و نمودار را رسم می‌کند.
- **🧾 ورود داده‌های متنی (CSV / TXT):** فایل‌های `.csv`، `.tsv` و `.txt` هم پشتیبانی می‌شوند؛ با جداکنندهٔ کاما، تب، نقطه‌ویرگول، خط عمودی یا فاصله. کدگذاری UTF-8، UTF-16 و کدپیج‌های ویندوزی خودکار تشخیص داده می‌شود و خطوط شروع‌شده با `#` نادیده گرفته می‌شوند.
- **🎯 بارگذاری سریع داده‌های نمونه:** شش مجموعه‌دادهٔ آماده همراه برنامه است — از بخش «بارگذاری سریع داده نمونه» انتخاب کنید تا همه امکانات را روی داده واقعی ببینید.
- **📐 پیش‌تنظیم سبک نمودار و اندازه بوم:** با یک کلیک کل نمودار بین سبک‌های «جمع‌وجور»، «دو ستونی»، «کادر باز سریف» و «محور از صفر» عوض می‌شود؛ اندازه بوم هم از تک‌ستونی تا ۱۶:۹ آماده است.
- **🔍 ذره‌بین (بزرگ‌نمایی ناحیه):** ناحیهٔ شلوغی را قاب بگیرید و به‌صورت inset درون نمودار بزرگ کنید — مناسب تقاطع طیف‌ها و زانوی منحنی I–V.
- **🎛️ کنترل دقیق ظاهر:** کادر کامل یا باز، محل تلاقی محورها (گوشه / از صفر / از وسط)، تیک‌های فرعی، جهت تیک‌ها، رقم اعشار، حالت فقط اسکتر یا اسکتر+خط، لگاریتم داخل نمودار و برچسب داده‌ها.
- **🔒 داده‌های شما مرورگر را ترک نمی‌کند:** همه پردازش‌ها روی سیستم خودتان انجام می‌شود — بدون سرور، بدون حساب کاربری و بدون آپلود.
- **🔄 تشخیص هوشمند هیسترزیس (رفت و برگشت):** مسیرهای رفت و برگشت در داده‌های دوره‌ای (مثل پاسخ سنسورها) را به صورت هوشمند تشخیص داده و مسیر برگشت را با خط‌چین و فلش‌های جهت‌نما استایل‌دهی می‌کند.
- **📈 رسم خط روند (Trendline) و R²:** محاسبه فرمول خط رگرسیون و ضریب تعیین R² با دقت بالا.
- **⚡ تنظیم دستی و خودکار مقیاس محورها (Auto-Scale):** تعیین Min، Max و Step محورهای X و Y به دلخواه یا با یک کلیک بر روی دکمه تنظیم خودکار مقیاس.
- **📝 جدول داده‌های تعاملی با پشتیبانی اعشار:** امکان ویرایش مستقیم نقاط، افزودن یا حذف سطر درون مرورگر.
- **🖼️ خروجی با کیفیت مقالات (Publication-Quality):**
  - ذخیره تصویر با کیفیت **300 یا 600 DPI (PNG)** برای استفاده مستقیم در MS Word.
  - ذخیره خروجی **وکتور SVG** استاندارد برای ادیت در Adobe Illustrator.
  - کپی مستقیم نمودار در حافظه موقت (Clipboard) با یک کلیک.
- **🖱️ جابجایی لیبل‌ها با موس:** متن‌ها و برچسب‌های روی نمودار را با موس بگیرید و هر کجای نمودار که خواستید قرار دهید.
- **🌍 دو زبانه و دارای دو تم:** پشتیبانی کامل از **فارسی (راست‌چین)** و **انگلیسی (چپ‌چین)** با قابلیت سوئیچ بین تم روشن (دانشگاهی) و تم تیره (مدرن).
- **📁 فایل نمونه آماده:** فایل `Clean_Hysteresis_Data.xlsx` در ریشه پروژه قرار دارد تا بلافاصله بتوانید عملکرد حلقه هیسترزیس را تست کنید.

## 🖼️ گالری

همه تصاویر زیر مستقیماً توسط خود برنامه رندر شده‌اند و هر کدام فایل `.xlsx` مخصوص به خود را در پوشه [`samples/`](samples) دارد تا بتوانید آن را بارگذاری کنید، تغییر دهید و دوباره خروجی بگیرید.

<table>
<tr>
<td align="center"><img src="gallery/01_qcm_hysteresis.png" width="420"><br><sub><b>هیسترزیس رطوبت QCM</b></sub></td>
<td align="center"><img src="gallery/02_beer_lambert.png" width="420"><br><sub><b>منحنی کالیبراسیون بیر-لمبرت</b> — خطای SD و R²</sub></td>
</tr>
<tr>
<td align="center"><img src="gallery/03_uvvis_spectra.png" width="420"><br><sub><b>طیف UV-Vis</b></sub></td>
<td align="center"><img src="gallery/04_damped_oscillation.png" width="420"><br><sub><b>نوسان میرا شونده</b></sub></td>
</tr>
<tr>
<td align="center"><img src="gallery/05_bode_log.png" width="420"><br><sub><b>نمودار بود لاگاریتمی</b> — تم تیره</sub></td>
<td align="center"><img src="gallery/06_solar_iv.png" width="420"><br><sub><b>منحنی I-V سلول خورشیدی</b></sub></td>
</tr>
<tr>
<td align="center"><img src="gallery/07_magnifier_inset.png" width="420"><br><sub><b>ذره‌بین بزرگ‌نمایی</b> — ناحیه زوم درون نمودار</sub></td>
<td align="center"><img src="gallery/08_fa_hysteresis.png" width="420"><br><sub><b>نسخه فارسی</b> — راست‌چین</sub></td>
</tr>
</table>

### 📂 داده‌های نمونه

فایل‌های [`samples/`](samples) شامل شش مجموعه داده آماده هستند: حلقه هیسترزیس سنسور، منحنی کالیبراسیون با ستون خطا، پاسخ دامپ‌شده، طیف UV-Vis، نمودار بود لاگاریتمی و منحنی I-V سلول خورشیدی.

## 🛠️ راهنمای استفاده

۱. ساده‌ترین راه: **[نسخه آنلاین](https://hasanmfar.github.io/Academic-Scatter-Plot/)** را باز کنید — بدون نیاز به نصب. یا فایل‌های پروژه را دانلود کرده و فایل `index.html` را در مرورگر خود باز کنید (بدون نیاز به اینترنت و نصب!). اگر اولین بار است، از بخش «بارگذاری سریع داده نمونه» در پنل کناری یکی از شش مجموعهٔ آماده را انتخاب کنید.
۲. از پنل سمت راست، تعداد نمونه‌های خود را مشخص کرده و **قالب خام اکسل** را دانلود کنید.
۳. قالب را با داده‌های خود پر کنید و مجدداً در برنامه آپلود نمایید — یا فایل خروجی خودتان با پسوند `.csv`، `.tsv` یا `.txt` را آپلود کنید (با جداکنندهٔ کاما، تب، نقطه‌ویرگول، خط عمودی یا فاصله؛ ستون اول X و بقیه Y).
۴. عناوین، رنگ‌ها، ضخامت خطوط و... را شخصی‌سازی کنید.
۵. خروجی بگیرید و در مقاله‌ی خود استفاده کنید!

## 🧰 زیر کاپوت

- **بدون مرحلهٔ بیلد و بدون فریمورک** — کار اصلی را سه فایل انجام می‌دهند: [`index.html`](index.html)، [`app.js`](app.js) و [`style.css`](style.css). کافی است `index.html` را در مرورگر باز کنید.
- **خواندن اکسل** با نسخهٔ محلی [SheetJS](https://sheetjs.com/) (`xlsx.full.min.js`) انجام می‌شود؛ نمودارها SVG واقعی‌اند، پس خروجی‌ها دقیق‌اند: PNG تا ۶۰۰ DPI برای Word/LaTeX و SVG برای Illustrator/Inkscape.
- **تست‌ها:** `npm install` سپس `npm test` — مجموعه‌تست‌های jsdom برای رندر اولیه، ورود اکسل، ورود متنی و منوی نمونه‌ها (همه در [`temp_build/`](temp_build)).

---
*Open-source and crafted for the academic community.*
