/**
 * Types matching the Scadiant Public API response shape, plus a
 * timeframe-aware timestamp formatter used by the OpsMonitor chart.
 *
 * See: https://tcore.scadiant.ai/api/public/v1/openapi.json
 */

export type Timeframe = "1H" | "24H" | "7D" | "30D";

export type ProductionDataPoint = {
  timestamp: string; // ISO 8601
  value: number;
};

export type ProductionResponse = {
  timeframe: Timeframe;
  total: number;
  unit: string; // e.g. "gallons", "m³", "kWh"
  data: ProductionDataPoint[];
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function formatLabel(iso: string, timeframe: Timeframe): string {
  const d = new Date(iso);
  switch (timeframe) {
    case "1H":
      return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
    case "24H":
      return `${pad2(d.getHours())}:00`;
    case "7D":
      return DAY_NAMES[d.getDay()];
    case "30D":
      return `${d.getMonth() + 1}/${d.getDate()}`;
  }
}
