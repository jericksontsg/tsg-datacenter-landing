/**
 * Water consumption + reuse ROI logic.
 *
 * All internal volumes are in LITERS (industry standard for water-use
 * efficiency math). Conversion to m³ or US gallons happens in the
 * presentation layer via lib/units.ts.
 */

export type CoolingType = "tower" | "air" | "liquid";
export type Climate = "arid" | "humid" | "temperate" | "cold";

// L/kWh — universally quoted regardless of unit system.
export const WUE: Record<CoolingType, number> = {
  tower: 1.8,
  air: 0.2,
  liquid: 0.5,
};

export const climateMult: Record<Climate, number> = {
  arid: 1.3,
  humid: 1.1,
  temperate: 0.9,
  cold: 0.8,
};

/**
 * Liters consumed per day for a given IT load + cooling + climate.
 * Math: IT_MW × 1000 kW/MW × 24 h × WUE (L/kWh) × climateMultiplier.
 */
export function calcDailyLiters(
  itLoadMW: number,
  coolingType: CoolingType,
  climate: Climate,
): number {
  return itLoadMW * 1000 * 24 * WUE[coolingType] * climateMult[climate];
}

export function calcAnnualLiters(dailyLiters: number): number {
  return dailyLiters * 365;
}

export function calcWUEScore(
  coolingType: CoolingType,
  climate: Climate,
): string {
  return (WUE[coolingType] * climateMult[climate]).toFixed(2);
}

export type ROIResult = {
  currentCost: number;
  projectedCost: number;
  annualSavings: number;
  paybackYears: string | null;
};

/**
 * ROI calculator working in canonical units ($/m³ and m³/yr) so the
 * math is identical regardless of the user's display preference.
 */
export function calcROI(
  annualM3: number,
  waterRatePerM3: number,
  sewerRatePerM3: number,
  reusePercent: number,
): ROIResult {
  const totalRate = waterRatePerM3 + sewerRatePerM3;
  const currentCost = annualM3 * totalRate;
  const newDemandM3 = annualM3 * (1 - reusePercent / 100);
  const projectedCost = newDemandM3 * totalRate;
  const annualSavings = currentCost - projectedCost;

  // CapEx model: $500k baseline + scale factor proportional to flow
  // and reuse depth. Floor at $800k, cap at $25M. Original formula
  // used "daily GPM" — convert m³/yr to GPM for compatibility.
  const dailyGPM = (annualM3 * 264.172) / 365 / 1440;
  const capEx = Math.max(
    800_000,
    Math.min(
      25_000_000,
      500_000 + dailyGPM * 6000 * (reusePercent / 60),
    ),
  );
  const paybackYears =
    annualSavings > 0 ? (capEx / annualSavings).toFixed(1) : null;

  return { currentCost, projectedCost, annualSavings, paybackYears };
}
