/**
 * Unit conversion helpers. The page works in two systems:
 *   - metric: cubic meters (m³) for volume, $/m³ for pricing
 *   - imperial: gallons for volume, $/1,000 gal for pricing
 *
 * WUE is universally expressed in L/kWh and stays in L/kWh in both
 * systems — it's the industry-standard benchmark unit globally.
 */

import type { UnitSystem } from "@/components/UnitsProvider";

// US liquid gallons.
export const GAL_PER_M3 = 264.172;
export const M3_PER_GAL = 1 / GAL_PER_M3;
export const L_PER_M3 = 1000;
export const L_PER_GAL = L_PER_M3 / GAL_PER_M3; // ≈ 3.78541

export function litersToM3(l: number): number {
  return l / L_PER_M3;
}
export function litersToGal(l: number): number {
  return l / L_PER_GAL;
}
export function m3ToGal(m3: number): number {
  return m3 * GAL_PER_M3;
}
export function galToM3(gal: number): number {
  return gal / GAL_PER_M3;
}

/**
 * Format a volume measurement in the user's chosen unit system,
 * scaling automatically (K / M / B prefixes).
 */
export function formatVolume(
  liters: number,
  system: UnitSystem,
): string {
  if (system === "metric") {
    const m3 = litersToM3(liters);
    return `${formatScaled(m3)} m³`;
  }
  const gal = litersToGal(liters);
  return `${formatScaled(gal)} gal`;
}

/**
 * Format a volume measurement when the source is already in the
 * user's preferred display unit (used for live API data where we
 * convert at the call site).
 */
export function formatVolumeRaw(
  value: number,
  unitLabel: string,
): string {
  return `${formatScaled(value)} ${unitLabel}`;
}

/** Compact unit label for axis/tooltip use ("m³" or "gal"). */
export function volumeUnitLabel(system: UnitSystem): string {
  return system === "metric" ? "m³" : "gal";
}

/** Rate unit label for water/sewer pricing inputs. */
export function rateUnitLabel(system: UnitSystem): string {
  return system === "metric" ? "$/m³" : "$/1,000 gal";
}

/**
 * Convert a rate value between systems.
 *  metric: $/m³ → imperial: $/1,000 gal  (× 1000/264.172 ≈ ×3.785)
 *  imperial: $/1,000 gal → metric: $/m³  (× 264.172/1000 ≈ ×0.264)
 */
export function convertRate(
  value: number,
  from: UnitSystem,
  to: UnitSystem,
): number {
  if (from === to) return value;
  if (from === "metric" && to === "imperial") {
    // $/m³ → $/1,000 gal
    return value * (L_PER_M3 / GAL_PER_M3) * 0.001 * 1000;
    // simplified: value * 1000 / 264.172
  }
  // imperial → metric: $/1,000 gal → $/m³
  return value * (GAL_PER_M3 / 1000);
}

/** Convert a rate (in user's current system) to canonical $/m³ for math. */
export function rateToPerM3(value: number, system: UnitSystem): number {
  return system === "metric" ? value : (value * GAL_PER_M3) / 1000;
}

/**
 * Generic scale helper: 1.23B / 4.5M / 56K / 789.
 * Two decimals for B/M, integer for K, integer for raw.
 */
export function formatScaled(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${Math.round(n / 1e3)}K`;
  return `${Math.round(n)}`;
}

/** Short K/M/B label for chart-axis ticks. */
export function formatShort(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${Math.round(n / 1e3)}K`;
  return `${Math.round(n)}`;
}

/**
 * Dollars helper, with optional sign and K/M scaling.
 */
export function formatDollars(n: number): string {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}K`;
  return `${sign}$${Math.round(abs)}`;
}
