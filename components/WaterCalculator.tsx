"use client";

import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type TooltipItem,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  calcDailyLiters,
  calcAnnualLiters,
  calcWUEScore,
  calcROI,
  type CoolingType,
  type Climate,
  type ROIResult,
} from "@/lib/calculatorLogic";
import {
  formatVolume,
  formatDollars,
  rateUnitLabel,
  rateToPerM3,
  convertRate,
  litersToM3,
} from "@/lib/units";
import { useUnits } from "@/components/UnitsProvider";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

type Step1Result = {
  dailyLiters: number;
  annualLiters: number;
  wue: string;
};

// Sensible defaults in each system (close to typical US utility pricing
// vs comparable EU pricing, so the input feels familiar in either mode).
const DEFAULT_WATER_RATE = { metric: 1.72, imperial: 6.5 } as const;
const DEFAULT_SEWER_RATE = { metric: 0.92, imperial: 3.5 } as const;

export default function WaterCalculator() {
  const { system } = useUnits();
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 inputs
  const [itLoad, setItLoad] = useState(20);
  const [cooling, setCooling] = useState<CoolingType>("tower");
  const [climate, setClimate] = useState<Climate>("arid");
  const [step1Result, setStep1Result] = useState<Step1Result | null>(null);

  // Step 2 inputs (stored in whatever system was active when entered)
  const [waterRate, setWaterRate] = useState<number>(DEFAULT_WATER_RATE.metric);
  const [sewerRate, setSewerRate] = useState<number>(DEFAULT_SEWER_RATE.metric);
  const [reuse, setReuse] = useState(60);
  const [roi, setRoi] = useState<ROIResult | null>(null);

  // Track previous system so we can convert rate inputs on toggle
  const [prevSystem, setPrevSystem] = useState(system);
  useEffect(() => {
    if (system !== prevSystem) {
      setWaterRate((r) => convertRate(r, prevSystem, system));
      setSewerRate((r) => convertRate(r, prevSystem, system));
      setPrevSystem(system);
    }
  }, [system, prevSystem]);

  function runStep1() {
    const dailyLiters = calcDailyLiters(itLoad, cooling, climate);
    const annualLiters = calcAnnualLiters(dailyLiters);
    const wue = calcWUEScore(cooling, climate);
    setStep1Result({ dailyLiters, annualLiters, wue });
  }

  function advanceToStep2() {
    setStep(2);
    setRoi(null);
  }

  function runStep2() {
    if (!step1Result) return;
    const annualM3 = litersToM3(step1Result.annualLiters);
    const waterRatePerM3 = rateToPerM3(waterRate, system);
    const sewerRatePerM3 = rateToPerM3(sewerRate, system);
    setRoi(calcROI(annualM3, waterRatePerM3, sewerRatePerM3, reuse));
  }

  return (
    <section className="w-full bg-white px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold tracking-widest text-tsg-blue">
          WATER INTELLIGENCE TOOL
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-tsg-dark md:text-4xl lg:text-5xl">
          Estimate your water footprint — and the ROI of treating it.
        </h2>
        <p className="mt-3 text-base text-slate-600 md:text-lg">
          Enter your facility specs. Takes 60 seconds.
        </p>

        <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm md:p-10">
          <ProgressBar step={step} />

          {step === 1 && (
            <Step1
              itLoad={itLoad}
              setItLoad={setItLoad}
              cooling={cooling}
              setCooling={setCooling}
              climate={climate}
              setClimate={setClimate}
              onCalculate={runStep1}
              result={step1Result}
              onAdvance={advanceToStep2}
            />
          )}

          {step === 2 && step1Result && (
            <Step2
              annualLiters={step1Result.annualLiters}
              waterRate={waterRate}
              setWaterRate={setWaterRate}
              sewerRate={sewerRate}
              setSewerRate={setSewerRate}
              reuse={reuse}
              setReuse={setReuse}
              onCalculate={runStep2}
              onBack={() => setStep(1)}
              roi={roi}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function ProgressBar({ step }: { step: 1 | 2 }) {
  const pct = step === 1 ? 50 : 100;
  return (
    <div className="mb-8">
      <div className="flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span className={step >= 1 ? "text-tsg-blue" : ""}>
          Step 1 · Consumption
        </span>
        <span className={step >= 2 ? "text-tsg-blue" : ""}>
          Step 2 · ROI
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full bg-tsg-blue transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ---------- Step 1 ---------- */

function Step1({
  itLoad,
  setItLoad,
  cooling,
  setCooling,
  climate,
  setClimate,
  onCalculate,
  result,
  onAdvance,
}: {
  itLoad: number;
  setItLoad: (n: number) => void;
  cooling: CoolingType;
  setCooling: (c: CoolingType) => void;
  climate: Climate;
  setClimate: (c: Climate) => void;
  onCalculate: () => void;
  result: Step1Result | null;
  onAdvance: () => void;
}) {
  const { system } = useUnits();
  return (
    <div>
      <h3 className="font-display text-xl font-bold text-tsg-dark">
        1 — Water Consumption Estimator
      </h3>

      <div className="mt-6 grid grid-cols-1 gap-6">
        {/* IT Load slider */}
        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="itLoad"
              className="text-sm font-medium text-slate-700"
            >
              IT Load (MW)
            </label>
            <span className="font-display text-lg font-bold text-tsg-blue">
              {itLoad} MW
            </span>
          </div>
          <input
            id="itLoad"
            type="range"
            min={1}
            max={200}
            value={itLoad}
            onChange={(e) => setItLoad(Number(e.target.value))}
            className="mt-2 w-full accent-tsg-blue"
          />
          <div className="mt-1 flex justify-between text-xs text-slate-500">
            <span>1 MW</span>
            <span>200 MW</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Select
            id="cooling"
            label="Cooling Type"
            value={cooling}
            onChange={(v) => setCooling(v as CoolingType)}
            options={[
              { value: "tower", label: "Evaporative (Cooling Towers)" },
              { value: "air", label: "Air-Cooled" },
              { value: "liquid", label: "Direct Liquid Cooling" },
            ]}
          />
          <Select
            id="climate"
            label="Climate Zone"
            value={climate}
            onChange={(v) => setClimate(v as Climate)}
            options={[
              { value: "arid", label: "Arid/Hot (TX, AZ, NV)" },
              { value: "humid", label: "Hot/Humid (FL, SE)" },
              { value: "temperate", label: "Temperate (CA, PNW)" },
              { value: "cold", label: "Cold (Northeast, Midwest)" },
            ]}
          />
        </div>

        <button
          type="button"
          onClick={onCalculate}
          className="w-full rounded-md bg-tsg-blue px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-tsg-dark"
        >
          Calculate Water Demand
        </button>
      </div>

      {result && (
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Metric
              label={`Daily Volume`}
              value={formatVolume(result.dailyLiters, system)}
            />
            <Metric
              label={`Annual Volume`}
              value={formatVolume(result.annualLiters, system)}
            />
            <Metric label="WUE Score (L/kWh)" value={result.wue} />
          </div>

          <WUECallout wue={parseFloat(result.wue)} />

          <button
            type="button"
            onClick={onAdvance}
            className="w-full rounded-md bg-tsg-blue px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-tsg-dark"
          >
            Calculate Reuse ROI →
          </button>
        </div>
      )}
    </div>
  );
}

function WUECallout({ wue }: { wue: number }) {
  let body: string;
  if (wue > 1.8) {
    body = `Above industry average (${wue.toFixed(2)} vs 1.8 avg L/kWh). Significant efficiency improvement opportunity.`;
  } else if (wue >= 0.5) {
    body =
      "Near industry average. Hyperscalers achieve ~0.5 L/kWh. TSG reuse systems close this gap.";
  } else {
    body =
      "Strong WUE — near hyperscaler benchmark. TSG O&M can protect this performance.";
  }
  return (
    <div className="rounded-md border-l-4 border-tsg-blue bg-tsg-light p-4 text-sm leading-relaxed text-slate-800 md:text-base">
      {body}
    </div>
  );
}

/* ---------- Step 2 ---------- */

function Step2({
  annualLiters,
  waterRate,
  setWaterRate,
  sewerRate,
  setSewerRate,
  reuse,
  setReuse,
  onCalculate,
  onBack,
  roi,
}: {
  annualLiters: number;
  waterRate: number;
  setWaterRate: (n: number) => void;
  sewerRate: number;
  setSewerRate: (n: number) => void;
  reuse: number;
  setReuse: (n: number) => void;
  onCalculate: () => void;
  onBack: () => void;
  roi: ROIResult | null;
}) {
  const { system } = useUnits();
  const unit = rateUnitLabel(system);
  return (
    <div>
      <h3 className="font-display text-xl font-bold text-tsg-dark">
        2 — Water Reuse ROI Calculator
      </h3>
      <p className="mt-2 text-sm text-slate-600">
        Based on annual demand of {formatVolume(annualLiters, system)}.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <RateField
            id="waterRate"
            label="Municipal Water Rate"
            unit={unit}
            value={waterRate}
            onChange={setWaterRate}
          />
          <RateField
            id="sewerRate"
            label="Discharge/Sewer Rate"
            unit={unit}
            value={sewerRate}
            onChange={setSewerRate}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="reuse"
              className="text-sm font-medium text-slate-700"
            >
              Reuse Target
            </label>
            <span className="font-display text-lg font-bold text-tsg-blue">
              {reuse}%
            </span>
          </div>
          <input
            id="reuse"
            type="range"
            min={10}
            max={90}
            step={5}
            value={reuse}
            onChange={(e) => setReuse(Number(e.target.value))}
            className="mt-2 w-full accent-tsg-blue"
          />
          <div className="mt-1 flex justify-between text-xs text-slate-500">
            <span>10% Basic</span>
            <span>50% Standard</span>
            <span>90% ZLD-level</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onBack}
            className="rounded-md border-2 border-tsg-blue px-6 py-3 text-base font-medium text-tsg-blue transition hover:bg-tsg-light sm:w-auto"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={onCalculate}
            className="flex-1 rounded-md bg-tsg-blue px-6 py-3 text-base font-medium text-white shadow-sm transition hover:bg-tsg-dark"
          >
            Calculate My ROI
          </button>
        </div>
      </div>

      {roi && (
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              label="Current Annual Cost"
              value={formatDollars(roi.currentCost)}
            />
            <Metric
              label="Projected Cost with TSG"
              value={formatDollars(roi.projectedCost)}
            />
            <Metric
              label="Annual Savings"
              value={formatDollars(roi.annualSavings)}
            />
            <Metric
              label="Simple Payback"
              value={roi.paybackYears ? `${roi.paybackYears} yrs` : "—"}
            />
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm md:p-6">
            <ROIChart roi={roi} />
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600 md:text-base">
            These are directional estimates. A TSG assessment will refine
            these numbers with site-specific water quality data, regulatory
            requirements, and system sizing.
          </div>

          <a
            href="#contact"
            className="block w-full rounded-md bg-tsg-blue px-6 py-3 text-center text-base font-medium text-white shadow-sm transition hover:bg-tsg-dark"
          >
            Get My Full Project Assessment →
          </a>
        </div>
      )}
    </div>
  );
}

function ROIChart({ roi }: { roi: ROIResult }) {
  const data = {
    labels: ["Current Annual Cost", "Projected with TSG", "Annual Savings"],
    datasets: [
      {
        label: "Dollars",
        data: [roi.currentCost, roi.projectedCost, roi.annualSavings],
        backgroundColor: ["#0069b4", "#14b8a6", "#14b8a6"],
        borderRadius: 4,
      },
    ],
  };
  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"bar">) =>
            formatDollars(ctx.parsed.y ?? 0),
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) =>
            formatDollars(typeof v === "number" ? v : Number(v)),
        },
      },
    },
  };
  return (
    <div className="h-64 w-full md:h-80">
      <Bar data={data} options={options} />
    </div>
  );
}

/* ---------- Shared bits ---------- */

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-2 font-display text-3xl font-bold text-tsg-dark md:text-4xl">
        {value}
      </div>
    </div>
  );
}

function Select({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 shadow-sm focus:border-tsg-blue focus:outline-none focus:ring-1 focus:ring-tsg-blue"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function RateField({
  id,
  label,
  unit,
  value,
  onChange,
}: {
  id: string;
  label: string;
  unit: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="mt-1 flex rounded-md shadow-sm">
        <span className="inline-flex items-center rounded-l-md border border-r-0 border-slate-300 bg-slate-100 px-3 text-sm text-slate-600">
          $
        </span>
        <input
          id={id}
          type="number"
          step="0.01"
          min={0}
          value={Number.isFinite(value) ? value.toFixed(2) : 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className="block w-full border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 focus:border-tsg-blue focus:outline-none focus:ring-1 focus:ring-tsg-blue"
        />
        <span className="inline-flex items-center rounded-r-md border border-l-0 border-slate-300 bg-slate-100 px-3 text-sm text-slate-600">
          {unit}
        </span>
      </div>
    </div>
  );
}
