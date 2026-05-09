export type CoolingType = "tower" | "air" | "liquid";
export type Climate = "arid" | "humid" | "temperate" | "cold";

// L/kWh
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

const L_TO_GAL = 0.264172;

export function calcDailyGallons(
  itLoadMW: number,
  coolingType: CoolingType,
  climate: Climate,
): number {
  const liters =
    itLoadMW * 1000 * 24 * WUE[coolingType] * climateMult[climate];
  return Math.round(liters * L_TO_GAL);
}

export function calcAnnualGallons(dailyGallons: number): number {
  return dailyGallons * 365;
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

export function calcROI(
  annualGallons: number,
  waterRate: number,
  sewerRate: number,
  reusePercent: number,
): ROIResult {
  const totalRate = waterRate + sewerRate;
  const currentCost = (annualGallons / 1000) * totalRate;
  const newDemand = annualGallons * (1 - reusePercent / 100);
  const projectedCost = (newDemand / 1000) * totalRate;
  const annualSavings = currentCost - projectedCost;
  const dailyGPM = annualGallons / 365 / 1440;
  const capEx = Math.max(
    800000,
    Math.min(25000000, 500000 + dailyGPM * 6000 * (reusePercent / 60)),
  );
  const paybackYears =
    annualSavings > 0 ? (capEx / annualSavings).toFixed(1) : null;
  return { currentCost, projectedCost, annualSavings, paybackYears };
}

export function formatGallons(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M gal`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K gal`;
  return `${Math.round(n)} gal`;
}

export function formatDollars(n: number): string {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}K`;
  return `${sign}$${Math.round(abs)}`;
}
