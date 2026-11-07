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
