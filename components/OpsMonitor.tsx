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
  generateChartData,
  formatGallons,
  type Timeframe,
} from "@/lib/plantData";

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

function fmtShort(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${Math.round(n / 1_000)}K`;
  return `${Math.round(n)}`;
}

export default function OpsMonitor() {
  const [timeframe, setTimeframe] = useState<Timeframe>("1H");
  const [now, setNow] = useState<Date | null>(null);

  const chart = useMemo(() => generateChartData(timeframe), [timeframe]);

  // Initialize timestamp on mount (client-only to avoid hydration mismatch)
  useEffect(() => {
    setNow(new Date());
  }, []);

  // Timestamp tick (1s)
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const totalProduced = chart.productionData.reduce((a, b) => a + b, 0);

  const data = {
    labels: chart.labels,
    datasets: [
      {
        label: "Production",
        data: chart.productionData,
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
            formatGallons((ctx.parsed.y ?? 0) as number),
        },
      },
    },
    scales: {
      y: {
        type: "linear",
        position: "left",
        ticks: {
          color: COLOR_PRODUCTION,
          callback: (v) => fmtShort(typeof v === "number" ? v : Number(v)),
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
            <div className="mt-3 font-display text-5xl font-bold tabular-nums text-tsg-dark md:text-6xl lg:text-7xl">
              {formatGallons(totalProduced)}
            </div>
            <div className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-emerald-600">
              <ArrowUp />
              Across all active TSG facilities
            </div>
            <div className="mt-1 text-xs text-slate-500">
              +4.2% above rolling average
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
              <Line data={data} options={options} />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center gap-2 border-t border-slate-200 pt-4 text-xs text-slate-500">
            <SatelliteIcon />
            TSG SCADA telemetry integration in progress · Live data coming
            soon
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
