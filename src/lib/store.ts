"use client";

import { useEffect, useMemo } from "react";
import { create } from "zustand";
import { evaluate } from "@/engine/evaluate";
import { MARKET_IDS, type MarketId } from "@/data/types";
import { DEFAULT_SCENARIO, type Scenario } from "@/engine/scenario";

interface Store {
  scenario: Scenario;
  hydrated: boolean;
  set: (patch: Partial<Scenario>) => void;
  setIn: <K extends "headcount" | "mix" | "weights" | "macro" | "tax" | "stress">(key: K, patch: Partial<Scenario[K]>) => void;
  replace: (s: Scenario) => void;
}

export const useStore = create<Store>((set) => ({
  scenario: DEFAULT_SCENARIO,
  hydrated: false,
  set: (patch) => set((st) => ({ scenario: { ...st.scenario, ...patch } })),
  setIn: (key, patch) => set((st) => ({ scenario: { ...st.scenario, [key]: { ...st.scenario[key], ...patch } } })),
  replace: (scenario) => set({ scenario }),
}));

const encode = (s: Scenario) => btoa(encodeURIComponent(JSON.stringify(s)));
const decode = (h: string): Scenario | null => {
  try {
    const parsed = JSON.parse(decodeURIComponent(atob(h)));
    // Links created before the per-stage mix carried a single band record.
    if (parsed.mix && "L1-L2" in parsed.mix) parsed.mix = { day1: parsed.mix, y3: parsed.mix, y5: parsed.mix };
    return { ...DEFAULT_SCENARIO, ...parsed, stress: { ...DEFAULT_SCENARIO.stress, ...parsed.stress } };
  } catch {
    return null;
  }
};

const TOOL_PATHS = ["/tools", "/location", "/financials", "/stress-test", "/benchmark"];
export const isToolPath = (path: string) => TOOL_PATHS.some((p) => path === p || path.startsWith(`${p}/`));

/** Keeps the scenario in the URL hash on tool pages so any view can be shared as a link. */
export function useScenarioUrlSync(path: string) {
  const scenario = useStore((s) => s.scenario);
  const hydrated = useStore((s) => s.hydrated);
  useEffect(() => {
    if (hydrated) return;
    const m = window.location.hash.match(/s=([^&]+)/);
    let s = (m && decode(m[1])) || null;
    // Information pages deep-link into the tools with ?market=<id>.
    const market = new URLSearchParams(window.location.search).get("market");
    if (market && (MARKET_IDS as readonly string[]).includes(market)) s = { ...(s ?? useStore.getState().scenario), marketId: market as MarketId };
    useStore.setState({ hydrated: true, ...(s ? { scenario: s } : {}) });
  }, [hydrated]);
  // Client-side navigation from an information page can also carry ?market=<id>.
  useEffect(() => {
    if (!hydrated) return;
    const market = new URLSearchParams(window.location.search).get("market");
    if (market && (MARKET_IDS as readonly string[]).includes(market) && useStore.getState().scenario.marketId !== market) {
      useStore.getState().set({ marketId: market as MarketId });
    }
  }, [hydrated, path]);
  useEffect(() => {
    if (!hydrated || !isToolPath(path)) return;
    window.history.replaceState(null, "", `${window.location.pathname}#s=${encode(scenario)}`);
  }, [scenario, hydrated, path]);
}

export function shareHash() {
  return `#s=${encode(useStore.getState().scenario)}`;
}

export function useScenario() {
  return useStore((s) => s.scenario);
}

export function useEvaluation(stressed = false) {
  const scenario = useScenario();
  return useMemo(() => evaluate(scenario, stressed), [scenario, stressed]);
}
