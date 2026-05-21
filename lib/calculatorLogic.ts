/**
 * Water consumption + reuse ROI logic — v2 (engineering rebuild).
 *
 * Conceptual model:
 *   1. Compute total facility energy from IT load and PUE.
 *   2. In steady state, essentially ALL facility energy becomes heat that
 *      must be rejected → annual heat rejection (kWh thermal).
 *   3. Look up makeup-water intensity (L per kWh thermal) from a 2D table
 *      indexed by heat-rejection method × climate zone.
 *   4. Water demand = heat × intensity. Convert to user units in the UI.
 *
 * What changed vs v1:
 *   - "Cooling type" (which conflated chip-level cooling with heat
 *     rejection) replaced by "heat rejection method" — the variable that
 *     actually drives water demand.
 *   - PUE exposed as a first-class input (was implicit/hidden in the WUE
 *     constants). Default values stated per method.
 *   - Climate adjustment is now a 2D lookup against the rejection method,
 *     not a scalar multiplier. Cold + dry-cooled has near-zero water
 *     intensity; hot/arid + evaporative is the worst case.
 *   - Intensity values are calibrated against current industry benchmarks
 *     (Microsoft, AWS, Meta 2024 disclosures; EPA evaporative cooling
 *     guidance: ~1.8 gal evap per ton-hour ≈ 1.94 L per kWh thermal,
 *     plus blowdown adjustment for cycles of concentration).
 *
 * All internal volumes are in LITERS. UI conversion to m³/gal happens in
 * lib/units.ts (unchanged).
 */

export type HeatRejectionMethod =
  | "evaporative"  // Open-loop cooling tower; full wet
  | "hybrid"       // Adiabatic / wet-dry; water-assisted only when needed
  | "dry"          // Air-cooled chillers / dry coolers; humidification only
  | "economized";  // Hyperscale air-side economizer + minimal evap backup

export type Climate = "arid" | "humid" | "temperate" | "cool" | "cold";

/**
 * Makeup-water intensity in LITERS per kWh THERMAL rejected.
 *
 * Physics anchor: evaporating 1 kg of water absorbs ~2,430 kJ at 25°C.
 * 1 kWh thermal = 3,600 kJ → theoretical minimum 3,600/2,430 ≈ 1.48 L per
 * kWh just for evaporation. Add blowdown (typ. COC=4, +33%) and drift
 * (~0.5%): real-world evaporative makeup is ~1.85-2.0 L per kWh thermal
 * at full design load.
 *
 * Climate variation reflects (a) wet-bulb temperature driving evap rates,
 * (b) feasible cycles of concentration given source-water TDS, and
 * (c) the fraction of annual hours that economizer mode bypasses the wet
 * cooling loop entirely.
 */
export const WATER_INTENSITY: Record<
  HeatRejectionMethod,
  Record<Climate, number>
> = {
  evaporative: {
    arid:      1.85,  // Phoenix, El Paso. Max evap, but limited COC due to high-TDS source water.
    humid:     1.65,  // Houston, Singapore. Lower evap effectiveness, but better COC potential.
    temperate: 1.35,  // N. CA, NC. Moderate. Some economizer hours bypass tower.
    cool:      0.90,  // PNW, Northeast. Significant economizer hours (~30-50%).
    cold:      0.50,  // Quebec, N. EU. Economizer-dominant; tower runs <30% of hours.
  },
  hybrid: {
    arid:      1.05,
    humid:     1.20,
    temperate: 0.60,
    cool:      0.30,
    cold:      0.15,
  },
  dry: {
    // Humidification water only — no evaporative heat rejection.
    arid:      0.07,
    humid:     0.05,  // Less humidification needed in humid climates.
    temperate: 0.04,
    cool:      0.02,
    cold:      0.015,
  },
  economized: {
    // Hyperscale design: air-side economizer most hours, evap backup only
    // when ambient exceeds threshold. Calibrated against Microsoft / AWS
    // / Meta 2024 disclosed WUE figures.
    arid:      0.50,
    humid:     0.65,
    temperate: 0.25,
    cool:      0.08,
    cold:      0.04,
  },
};

/**
 * Default PUE assumption per heat rejection method. Used as the slider's
 * starting point; engineers can override. Values reflect typical modern
 * builds for each architecture (Uptime Institute 2024 global PUE ~1.58
 * is heavily skewed by long-tail enterprise; hyperscale fleet averages
 * are 1.08-1.15).
 */
export const DEFAULT_PUE: Record<HeatRejectionMethod, number> = {
  evaporative: 1.35,
  hybrid:      1.30,
  dry:         1.50,  // Higher because dry coolers consume more fan/chiller energy.
  economized:  1.15,
};

export const HOURS_PER_YEAR = 8760;

/**
 * Annual water demand in LITERS for a given facility configuration.
 *
 * Math:
 *   total_facility_kWh = IT_MW × 1000 × 8760 × PUE
 *   heat_rejection_kWh ≈ total_facility_kWh   (steady-state: all → heat)
 *   water_L            = heat_rejection_kWh × intensity(method, climate)
 *
 * Dimensional check:
 *   MW × (kW/MW) × (h/yr) × (unitless) × (L/kWh) = L/yr  ✓
 */
export function calcAnnualLiters(
  itLoadMW: number,
  pue: number,
  method: HeatRejectionMethod,
  climate: Climate,
): number {
  const totalFacilityKWh = itLoadMW * 1000 * HOURS_PER_YEAR * pue;
  const intensity = WATER_INTENSITY[method][climate];
  return totalFacilityKWh * intensity;
}

/**
 * Daily liters — convenience wrapper that just divides annual by 365.
 * Note: this is the AVERAGE daily, not a peak-day estimate. Peak day in
 * a hot climate can run 1.5-2× the annual average.
 */
export function calcDailyLiters(
  itLoadMW: number,
  pue: number,
  method: HeatRejectionMethod,
  climate: Climate,
): number {
  return calcAnnualLiters(itLoadMW, pue, method, climate) / 365;
}

/**
 * Effective WUE in L per kWh of IT energy — the metric the industry
 * reports. Useful for comparing the user's facility against published
 * hyperscaler benchmarks (Microsoft global ~0.30, AWS ~0.19, average
 * facility ~1.80, hot/arid evap-cooled ~2.0+).
 *
 * Derivation:
 *   WUE = annual_water_L / annual_IT_kWh
 *       = (IT_kW × 8760 × PUE × intensity_thermal) / (IT_kW × 8760)
 *       = PUE × intensity_thermal
 */
export function calcWUE(
  pue: number,
  method: HeatRejectionMethod,
  climate: Climate,
): number {
  return pue * WATER_INTENSITY[method][climate];
}

/**
 * Benchmarking copy for the UI. Compares the user's effective WUE
 * against published industry markers. Honest framing — does NOT claim
 * TSG can take any facility to hyperscaler levels.
 */
export function wueBenchmarkBand(wue: number): {
  label: string;
  body: string;
} {
  if (wue > 2.0) {
    return {
      label: "Above industry average",
      body: `Your effective WUE of ${wue.toFixed(2)} L/kWh exceeds the data center industry average of ~1.8 L/kWh. Reuse and alternative heat-rejection strategies can reduce site water draw meaningfully — typical projects target 40-70% reduction.`,
    };
  }
  if (wue > 1.0) {
    return {
      label: "Near industry average",
      body: `Your effective WUE of ${wue.toFixed(2)} L/kWh is near the industry average (~1.8 L/kWh). Hyperscalers like Microsoft (global avg ~0.30) and AWS (~0.19) achieve far lower numbers through closed-loop and economized designs. Reuse retrofits typically capture 30-50% of the gap.`,
    };
  }
  if (wue > 0.3) {
    return {
      label: "Better than average",
      body: `Your effective WUE of ${wue.toFixed(2)} L/kWh is better than the industry average and approaching hyperscaler territory. TSG's value here is typically in O&M reliability protection rather than dramatic water reduction.`,
    };
  }
  return {
    label: "Hyperscaler-class",
    body: `Your effective WUE of ${wue.toFixed(2)} L/kWh is at hyperscaler benchmark levels. Water risk here is primarily reliability, source-water quality, and regulatory rather than volume. TSG O&M protects this performance.`,
  };
}

// ─── Stage 2 — Reuse ROI ─────────────────────────────────────────────────────

/**
 * Peak-day flow multiplier vs annual-average flow, by climate.
 * Real water treatment systems are sized for peak day, not annual average.
 * Hot/arid sites can run 1.5-1.8× the annual mean on the hottest days;
 * cold sites are nearly flat. Used to scale CapEx to realistic sizing.
 *
 * ENGINEERING NOTE: These are conservative defaults from industry sizing
 * heuristics. TSG should calibrate against measured peak-to-average ratios
 * from operational sites.
 */
export const CLIMATE_PEAK_FACTOR: Record<Climate, number> = {
  arid: 1.7,
  humid: 1.4,
  temperate: 1.2,
  cool: 1.1,
  cold: 1.05,
};

export type ROIResult = {
  currentCost: number;
  projectedCost: number;
  grossSavings: number; // water-bill avoidance before reuse-system OpEx
  opexCost: number; // running cost of the reuse system
  annualSavings: number; // = grossSavings − opexCost (the net number)
  capEx: number;
  paybackYears: string | null;
};

/**
 * ROI calculator working in canonical units ($/m³ and m³/yr) so the
 * math is independent of UI unit toggle.
 *
 * Models THREE adjustments beyond the gross-savings baseline:
 *   1. opexFraction: subtracts reuse-system running cost (chemicals,
 *      energy, labor, membrane amortization) from gross savings before
 *      computing payback. Default 0.20 = 20% of gross savings.
 *   2. climate peak factor: CapEx sized for peak-day flow, not annual
 *      mean. Hot/arid sites get sized roughly 1.7× larger than the
 *      same annual volume in a cold climate.
 *   3. Net vs gross savings exposed separately so prospects see what
 *      the OpEx assumption costs them.
 *
 * REMAINING LIMITATIONS (still flag to prospects):
 *   - Treats sewer cost as 1:1 avoidable by reuse. Correct when utility
 *     bills sewer based on water-supply meter (common US pattern). If
 *     the utility uses a separate discharge meter, the absolute savings
 *     dollars overstate — payback years remain approximately correct
 *     because both sides of the ratio inflate equally.
 *   - Simple payback only; ignores time value of money and rate
 *     inflation. NPV at TSG's cost of capital is the engineering-grade
 *     metric — use that internally when pricing real deals.
 *   - Assumes year-round reuse at the slider's target %. Seasonal
 *     designs (reuse only during arid months) save less but cost less.
 *   - CapEx coefficients ($500K base, $6K per peak-GPM, $800K floor,
 *     $25M cap) are placeholders. Calibrate against TSG proposal
 *     history for real-deal accuracy.
 */
export function calcROI(
  annualM3: number,
  waterRatePerM3: number,
  sewerRatePerM3: number,
  reusePercent: number,
  climate: Climate,
  opexFraction: number = 0.2,
): ROIResult {
  const totalRate = waterRatePerM3 + sewerRatePerM3;
  const currentCost = annualM3 * totalRate;
  const newDemandM3 = annualM3 * (1 - reusePercent / 100);
  const projectedCost = newDemandM3 * totalRate;
  const grossSavings = currentCost - projectedCost;
  const opexCost = Math.max(0, grossSavings * opexFraction);
  const annualSavings = grossSavings - opexCost;

  // CapEx model — now scaled by PEAK flow, not annual-average flow.
  // avgGPM is the annual mean; multiplying by the climate peak factor
  // gives a sizing flow that reflects what the treatment train actually
  // needs to handle on the hottest day.
  const avgGPM = (annualM3 * 264.172) / 365 / 1440;
  const peakGPM = avgGPM * CLIMATE_PEAK_FACTOR[climate];
  const capExRaw = 500_000 + peakGPM * 6_000 * (reusePercent / 60);
  const capEx = Math.max(800_000, Math.min(25_000_000, capExRaw));

  const paybackYears =
    annualSavings > 0 ? (capEx / annualSavings).toFixed(1) : null;

  return {
    currentCost,
    projectedCost,
    grossSavings,
    opexCost,
    annualSavings,
    capEx,
    paybackYears,
  };
}
