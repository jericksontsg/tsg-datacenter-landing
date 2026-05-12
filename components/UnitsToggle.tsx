"use client";

import { useUnits, type UnitSystem } from "./UnitsProvider";

export default function UnitsToggle() {
  const { system, setSystem } = useUnits();
  return (
    <div
      className="fixed right-4 top-4 z-50 inline-flex rounded-full border border-slate-200 bg-white/90 p-1 shadow-md backdrop-blur"
      role="group"
      aria-label="Unit system"
    >
      <ToggleButton
        active={system === "metric"}
        onClick={() => setSystem("metric")}
        label="Metric"
      />
      <ToggleButton
        active={system === "imperial"}
        onClick={() => setSystem("imperial")}
        label="Imperial"
      />
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition sm:px-4 sm:text-sm ${
        active
          ? "bg-tsg-blue text-white shadow-sm"
          : "text-slate-600 hover:text-tsg-dark"
      }`}
    >
      {label}
    </button>
  );
}

export function useUnitSystem(): UnitSystem {
  return useUnits().system;
}
