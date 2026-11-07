# PLOT sample data notes

## Scope
This directory contains ready-to-import demo samples for the PLOT scientific scatter plot app. The files are generated from the project's own sample generator under `temp_build/`.

## Files
- `samples/*.xlsx` — imported Excel samples
- `gallery/*.png` — rendered chart screenshots used in the tutorial and promotional material

## Regeneration
To regenerate the samples and gallery locally:

```bash
npm run samples
npm run gallery
```

These scripts use the bundled `jsdom` + `xlsx` + `@resvg/resvg-js` tooling in `temp_build/`, so the generated assets reflect the real chart engine.

## Contents
The current sample set includes:

- `QCM_Hysteresis.xlsx`
- `BeerLambert_Calibration.xlsx`
- `Damped_Oscillation.xlsx`
- `UVVis_Spectra.xlsx`
- `Impedance_Bode.xlsx`
- `Solar_Cell_IV.xlsx`
- `Raman_Spectroscopy.xlsx`

The gallery PNG set includes these preview-style renders:

- `01_qcm_hysteresis.png`
- `02_beer_lambert.png`
- `03_uvvis_spectra.png`
- `04_damped_oscillation.png`
- `05_bode_log.png`
- `06_solar_iv.png`
- `07_magnifier_inset.png`
- `08_fa_hysteresis.png`
- `09_raman_peaks.png`

## Tutorial/promo use
The generated samples and gallery PNGs are suitable for tutorial and promotional use because:
- They are produced by the real app rendering path.
- They match the default sample picker and chart presets used in the app shell.
- They provide a stable basis for tutorial screenshots, feature walkthroughs, and promo visuals.

If you want a different sample mix or a different gallery selection, regenerate from the same `temp_build/` scripts and then review the outputs.
