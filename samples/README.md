# Sample data

Ready-to-import datasets used by the guided tutorial and the figures in the main
README gallery. Load any of them from **Data → Quick-load a sample dataset**, or
import the file yourself with **Data → upload**; the app detects the header row,
error-bar columns and text delimiters automatically.

| File | Sheet | Columns | Rows | What it shows |
|---|---|---|---|---|
| `Getting_Started_Calibration.csv` | — (CSV) | `Concentration (mg/L)`, `Absorbance`, `Absorbance SD` | 8 | The tutorial starter set. The `… SD` column switches on standard-deviation error bars; a linear fit gives the calibration line and R². |
| `QCM_Hysteresis.xlsx` | `SensorData` | `RH (%)`, `Nanocomposite`, `Pure Starch` | 18 | Cyclic sensor response — humidity rising and falling, with hysteresis loop detection and dashed return path. |
| `BeerLambert_Calibration.xlsx` | `Calibration` | `Conc (mM)`, two samples each with an `SD` column | 11 | Two replicate calibrations with uncertainty — trendline equation and R² per series. |
| `Damped_Oscillation.xlsx` | `StepResponse` | `Time (s)`, `ζ = 0.10`, `ζ = 0.35` | 121 | Dense dynamic series — spline interpolation and marker thinning on a step response. |
| `UVVis_Spectra.xlsx` | `Spectra` | `Wavelength (nm)`, three catalysts | 101 | Multi-series comparison — automatic colour and marker assignment across three spectra. |
| `Impedance_Bode.xlsx` | `Bode` | `Frequency (Hz)`, `Gain (dB)`, `Gain + EMI (dB)` | 41 | Five decades of frequency — the case for a logarithmic X axis. |
| `Solar_Cell_IV.xlsx` | `IV_Curve` | `Voltage (V)`, two cells with efficiencies | 31 | Photovoltaic I–V curves — the fill-factor knee and direct in-plot callouts. |
| `Raman_Spectroscopy.xlsx` | `Raman` | `Raman Shift (cm⁻¹)`, two graphene samples | 201 | D, G and 2D bands — the peak finder and FWHM widths. |
| `Cyclic_Voltammetry.xlsx` | `CyclicVoltammetry` | `Potential (V)`, `Current (uA)` | 7,996 | A dense CV sweep — redox peak detection (E<sub>pa</sub>, E<sub>pc</sub>, ΔE<sub>p</sub>) and loop area. |

## Which sample a tutorial step needs

The guided tour plots data that actually demonstrates the feature it is talking
about, and the panel's sample button loads it for you when a step needs it.

| Tutorial step | Sample it uses | Why |
|---|---|---|
| 1. Start with a clean calibration | `Getting_Started_Calibration.csv` | 8 rows with an `SD` column: error bars and a linear fit appear immediately. |
| 2. Bring your own measurements | — (your file) | The blank workbook sets the column count before you upload. |
| 3. Read the uncertainty | `Getting_Started_Calibration.csv` | Already loaded by step 1; the `SD` column drives the error bars. |
| 4. Tell the app what to analyse | current data | Analysis mode is a property of the data already plotted — try `QCM_Hysteresis.xlsx` or `Cyclic_Voltammetry.xlsx` from Quick-load to compare modes. |
| 5. Find the peaks that matter | `Raman_Spectroscopy.xlsx` | 201 points with D, G and 2D bands — a straight calibration line has no peaks. |
| 6. Tame a wide range with a log axis | `Impedance_Bode.xlsx` | 41 points over five decades of frequency, where a linear X axis hides the low end. |
| 7. Give the figure a visual voice | current data | Palette changes are independent of the dataset. |
| 8. Export a figure for your report | current data | Export works on whatever is on the canvas. |

## Regenerating

The seven `.xlsx` workbooks above are produced by the generator:

```bash
npm run samples      # node temp_build/make_samples.js
```

`Cyclic_Voltammetry.xlsx` (too large to generate procedurally) and
`Getting_Started_Calibration.csv` (the hand-written tutorial file) are
maintained by hand and are not touched by that script.

Rendered previews of these datasets live in [`../gallery`](../gallery) and can be
rebuilt with `npm run gallery`.
