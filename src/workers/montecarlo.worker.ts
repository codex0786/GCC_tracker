import { runMonteCarlo } from "@/engine/montecarlo";
import type { Scenario } from "@/engine/scenario";

self.onmessage = (e: MessageEvent<{ id: number; scenario: Scenario; paths: number }>) => {
  const { id, scenario, paths } = e.data;
  self.postMessage({ id, result: runMonteCarlo(scenario, paths) });
};
