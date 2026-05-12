"use client";

import { useUnits } from "@/components/UnitsProvider";

export default function MarketContext() {
  const { system } = useUnits();
  // 660 billion liters ≈ 660 million m³ ≈ 174.4 billion US gallons.
  const headlineVolume =
    system === "metric"
      ? "660 million cubic meters"
      : "174 billion gallons";

  return (
    <section className="w-full bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-r-md border-l-4 border-tsg-blue bg-white p-6 shadow-sm md:p-8">
          <p className="text-base leading-relaxed text-slate-800 md:text-lg">
            By 2030, U.S. data centers are projected to consume over{" "}
            <strong className="text-tsg-dark">{headlineVolume}</strong> of
            water annually. Operators who don&apos;t control their water supply
            will lose permitting battles, face utility curtailments, and fall
            behind build schedules.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard
            value="34%"
            label="Annual growth in hyperscaler water demand through 2030"
          />
          <StatCard
            value="18"
            label="U.S. states imposing new water restrictions on data centers"
          />
          <StatCard
            value="$4.2B"
            label="Projected global data center water treatment market by 2028"
          />
        </div>
      </div>
    </section>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="font-display text-5xl font-bold text-tsg-blue md:text-6xl">
        {value}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
        {label}
      </p>
    </div>
  );
}
