"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type UnitSystem = "metric" | "imperial";

type UnitsContext = {
  system: UnitSystem;
  setSystem: (s: UnitSystem) => void;
};

const UnitsCtx = createContext<UnitsContext | null>(null);

const STORAGE_KEY = "tsg-units";

export function UnitsProvider({ children }: { children: React.ReactNode }) {
  // Default to metric per stakeholder request; persist user choice across visits.
  const [system, setSystemState] = useState<UnitSystem>("metric");

  // Hydrate from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "metric" || stored === "imperial") {
        setSystemState(stored);
      }
    } catch {
      // ignore — localStorage may be unavailable in some contexts
    }
  }, []);

  function setSystem(s: UnitSystem) {
    setSystemState(s);
    try {
      window.localStorage.setItem(STORAGE_KEY, s);
    } catch {
      // ignore
    }
  }

  return (
    <UnitsCtx.Provider value={{ system, setSystem }}>
      {children}
    </UnitsCtx.Provider>
  );
}

export function useUnits(): UnitsContext {
  const ctx = useContext(UnitsCtx);
  if (!ctx) {
    // Graceful fallback: if a component using useUnits is ever rendered
    // outside the provider, default to metric and a no-op setter.
    return { system: "metric", setSystem: () => {} };
  }
  return ctx;
}
