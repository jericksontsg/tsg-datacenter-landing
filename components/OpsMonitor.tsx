"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  type ChartOptions,
  type TooltipItem,
} from "chart.js";
import {
  formatLabel,
  type ProductionResponse,
  type Timeframe,
} from "@/lib/plantData";
import {
  formatScaled,
  formatShort,
  m3ToGal,
  galToM3,
  volumeUnitLabel,
} from "@/lib/units";
import { useUnits } from "@/components/UnitsProvider";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

const Line = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Line),
  { ssr: false },
);

const TIMEFRAMES: Timeframe[] = ["1H", "24H", "7D", "30D"];

const COLOR_PRODUCTION = "#378ADD";
const COLOR_PRODUCTION_FILL = "rgba(55, 138, 221, 0.10)";

/**
 * Convert a value from the API's reported unit into the user's
 * preferred display unit (m³ for metric, gal for imperial).
 * Returns NaN if we don't recognize the source unit — caller falls
 * back to raw value + raw label.
 */
function toDisplayUnit(
  value: number,
  sourceUnit: string,
  targetSystem: "metric" | "imperial",
): number {
  const src = sourceUnit.toLowerCase();
  const isM3 = src === "m³" || src === "m3" || src === "cubic meters";
  const isGal = src === "gallons" || src === "gal" || src === "us gallons";
  const isLiters = src === "liters" || src === "litres" || src === "l";

  // Normalize to m³ first
  let m3: number;
  if (isM3) m3 = value;
  else if (isGal) m3 = galToM3(value);
  else if (isLiters) m3 = value / 1000;
  else return NaN;

  return targetSystem === "metric" ? m3 : m3ToGal(m3);
}

export default function OpsMonitor() {
  const { system } = useUnits();
  const [timeframe, setTimeframe] = useState<Timeframe>("1H");
  const [now, setNow] = useState<Date | null>(null);
  const [production, setProduction] = useState<ProductionResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Timestamp tick (client-only to avoid hydration mismatch)
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch live telemetry whenever the timeframe changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/water-flows?timeframe=${timeframe}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Telemetry error (HTTP ${res.status})`);
        }
        return res.json() as Promise<ProductionResponse>;
      })
      .then((data) => {
        if (!cancelled) {
          setProduction(data);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message || "Failed to reach telemetry source");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [timeframe]);

  // Derive display values from the API response in the user's units.
  const displayUnit = volumeUnitLabel(system);
  const series = useMemo(() => {
    if (!production) return { labels: [], values: [] as number[] };
    const labels = production.data.map((p) => formatLabel(p.timestamp, timeframe));
    const values = production.data.map((p) => {
      const converted = toDisplayUnit(p.value, production.unit, system);
      return Number.isNaN(converted) ? p.value : converted;
    });
    return { labels, values };
  }, [production, timeframe, system]);

  const totalConverted = production
    ? (() => {
        const c = toDisplayUnit(production.total, production.unit, system);
        return Number.isNaN(c) ? production.total : c;
      })()
    : 0;

  // If unit recognition failed, show the API's reported unit verbatim.
  const effectiveUnit =
    production &&
    Number.isNaN(toDisplayUnit(production.total, production.unit, system))
      ? production.unit
      : displayUnit;

  const data = {
    labels: series.labels,
    datasets: [
      {
        label: "Production",
        data: series.values,
        borderColor: COLOR_PRODUCTION,
        backgroundColor: COLOR_PRODUCTION_FILL,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"line">) =>
            `${formatScaled((ctx.parsed.y ?? 0) as number)} ${effectiveUnit}`,
        },
      },
    },
    scales: {
      y: {
        type: "linear",
        position: "left",
        ticks: {
          color: COLOR_PRODUCTION,
          callback: (v) => formatShort(typeof v === "number" ? v : Number(v)),
        },
        grid: { color: "rgba(128, 128, 128, 0.08)" },
      },
      x: {
        ticks: { color: "#64748b", maxRotation: 0, autoSkipPadding: 12 },
        grid: { display: false },
      },
    },
  };

  return (
    <section className="w-full bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold tracking-widest text-tsg-blue">
          LIVE OPERATIONS
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-tsg-dark md:text-4xl lg:text-5xl">
          Real-time production telemetry — across active TSG facilities.
        </h2>

        <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          {/* Header row */}
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 pb-5">
            <span
              className="ops-pulse block h-2.5 w-2.5 rounded-full bg-emerald-500"
              aria-hidden="true"
            />
            <div>
              <div className="font-display text-base font-bold text-tsg-dark">
                TSG Operations Monitor
              </div>
              <div className="font-mono text-xs tabular-nums text-slate-500">
                {now ? now.toLocaleString() : "—"}
              </div>
            </div>
          </div>

          {/* Single primary KPI */}
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-6 md:p-8">
            <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Total Water Produced
            </div>
            {loading ? (
              <div className="mt-3 h-16 w-64 animate-pulse rounded bg-slate-200" />
            ) : error ? (
              <div className="mt-3 font-display text-2xl font-bold text-slate-400">
                Telemetry unavailable
              </div>
            ) : (
              <div className="mt-3 font-display text-5xl font-bold tabular-nums text-tsg-dark md:text-6xl lg:text-7xl">
                {formatScaled(totalConverted)}{" "}
                <span className="text-3xl text-slate-500 md:text-4xl lg:text-5xl">
                  {effectiveUnit}
                </span>
              </div>
            )}
            <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-emerald-600">
              <ArrowUp />
              Across all active TSG facilities
            </div>
          </div>

          {/* Time range selector */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-1">
              {TIMEFRAMES.map((tf) => {
                const active = tf === timeframe;
                return (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setTimeframe(tf)}
                    className={`rounded px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "bg-tsg-blue text-white shadow-sm"
                        : "text-slate-600 hover:text-tsg-dark"
                    }`}
                  >
                    {tf}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chart */}
          <div className="mt-4 -mx-2 overflow-x-auto px-2 sm:mx-0 sm:overflow-visible sm:px-0">
            <div className="relative h-60 min-h-[240px] min-w-[420px] sm:min-w-0">
              {loading ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  Loading live telemetry…
                </div>
              ) : error ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm">
                  <span className="font-medium text-slate-700">
                    Couldn&apos;t reach the telemetry source.
                  </span>
                  <span className="max-w-md text-xs text-slate-500">
                    {error}
                  </span>
                </div>
              ) : (
                <Line data={data} options={options} />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center gap-2 border-t border-slate-200 pt-4 text-xs text-slate-500">
            <SatelliteIcon />
            Live data via Scadiant SCADA telemetry
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- icons ---------- */

function ArrowUp() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M10 4l6 7h-4v5H8v-5H4l6-7z" />
    </svg>
  );
}

function SatelliteIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12L2 9l3-3 3 3" />
      <path d="M12 5l3-3 3 3-3 3" />
      <path d="M9 8l7 7" />
      <path d="M14 13l-3 3 3 3 3-3" />
      <path d="M18 14a4 4 0 01-4 4" />
      <path d="M21 14a7 7 0 01-7 7" />
    </svg>
  );
}
