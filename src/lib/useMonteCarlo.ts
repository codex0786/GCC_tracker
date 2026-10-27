"use client";

import { useEffect, useRef, useState } from "react";
import type { MonteCarloResult } from "@/engine/montecarlo";
import type { Scenario } from "@/engine/scenario";

/** Runs the Monte Carlo simulation off the UI thread, debounced, dropping stale results. */
export function useMonteCarlo(scenario: Scenario, paths = 1000) {
  const worker = useRef<Worker | null>(null);
  const latest = useRef(0);
  const [result, setResult] = useState<MonteCarloResult | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const w = new Worker(new URL("../workers/montecarlo.worker.ts", import.meta.url));
    w.onmessage = (e: MessageEvent<{ id: number; result: MonteCarloResult }>) => {
      if (e.data.id !== latest.current) return;
      setResult(e.data.result);
      setRunning(false);
    };
    worker.current = w;
    return () => w.terminate();
  }, []);

  useEffect(() => {
    const id = ++latest.current;
    setRunning(true);
    const timer = setTimeout(() => worker.current?.postMessage({ id, scenario, paths }), 250);
    return () => clearTimeout(timer);
  }, [scenario, paths]);

  return { result, running };
}
