export type Timeframe = "1H" | "24H" | "7D" | "30D";

export const TSG_NETWORK = {
  name: "TSG Active Facilities",
  baseFlowGPM: 3125,
  reliability: 99.6,
  uptimeHours: 8760,
};

export function jitter(base: number, pct: number): number {
  return base * (1 + (Math.random() - 0.5) * 2 * pct);
}

const PROD_JITTER = 0.06;

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export type ChartSeries = {
  labels: string[];
  productionData: number[];
};

export function generateChartData(timeframe: Timeframe): ChartSeries {
  const base = TSG_NETWORK.baseFlowGPM;
  const now = new Date();
  const labels: string[] = [];
  const productionData: number[] = [];

  if (timeframe === "1H") {
    for (let i = 59; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 60 * 1000);
      labels.push(`${pad2(t.getHours())}:${pad2(t.getMinutes())}`);
      productionData.push(jitter(base * 1, PROD_JITTER));
    }
  } else if (timeframe === "24H") {
    for (let i = 23; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 60 * 60 * 1000);
      labels.push(`${pad2(t.getHours())}:00`);
      productionData.push(jitter(base * 60, PROD_JITTER));
    }
  } else if (timeframe === "7D") {
    for (let i = 6; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      labels.push(DAY_NAMES[t.getDay()]);
      productionData.push(jitter(base * 60 * 24, PROD_JITTER));
    }
  } else {
    for (let i = 29; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      labels.push(`${t.getMonth() + 1}/${t.getDate()}`);
      productionData.push(jitter(base * 60 * 24, PROD_JITTER));
    }
  }

  return { labels, productionData };
}

export function formatGallons(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${(n / 1e9).toFixed(2)} B gal`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2)} M gal`;
  if (abs >= 1e3) return `${Math.round(n / 1e3)} K gal`;
  return `${Math.round(n)} gal`;
}
