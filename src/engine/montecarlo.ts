import { runFinancials } from "./evaluate";
import { anchorsFromScenario, stressedEnv, type Env, type Scenario } from "./scenario";
import { assessTalent } from "./talent";
import { MONTHS } from "./tco";

export interface MonteCarloResult {
  paths: number;
  /** Cumulative savings vs onshore by month, USD */
  p10: number[];
  p50: number[];
  p90: number[];
  npv: { p10: number; p50: number; p90: number };
  paybackP50: number | null;
  probPayback36: number;
  probNegativeNpv: number;
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normal(rand: () => number) {
  const u = Math.max(1e-12, rand());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}

const pct = (sorted: number[], p: number) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];

/** Samples FX drift, wage inflation, rent escalation, attrition and onshore inflation around the (stressed) base case. */
export function runMonteCarlo(s: Scenario, paths = 1000, seed = 42): MonteCarloResult {
  const rand = mulberry32(seed);
  const base = stressedEnv(s);
  const anchors = anchorsFromScenario(s);
  const market = base.markets[s.marketId];
  const cum: number[][] = Array.from({ length: MONTHS }, () => []);
  const npvs: number[] = [];
  const paybacks: number[] = [];

  for (let i = 0; i < paths; i++) {
    const env: Env = {
      ...base,
      fxDrift: 0.02 + 0.03 * normal(rand),
      wageInfl: Math.max(0, base.wageInfl + 0.02 * normal(rand)),
      rentEscAdd: base.rentEscAdd + 0.015 * normal(rand),
      attritionAddPp: base.attritionAddPp + 3 * normal(rand),
      onshoreInfl: 0.035 + 0.01 * normal(rand),
    };
    const t = assessTalent(market, s.fn, anchors, env.attritionAddPp);
    const { tco } = runFinancials(s, env, [{ market, anchors, seniorPremium: t.relocationPremium * t.importedSeniorShare }]);
    tco.months.forEach((row, m) => cum[m].push(row.cumSavings));
    npvs.push(tco.npvSavingsUsd);
    paybacks.push(tco.paybackMonth ?? Infinity);
  }

  cum.forEach((c) => c.sort((a, b) => a - b));
  npvs.sort((a, b) => a - b);
  paybacks.sort((a, b) => a - b);
  const pb = pct(paybacks, 0.5);
  return {
    paths,
    p10: cum.map((c) => pct(c, 0.1)),
    p50: cum.map((c) => pct(c, 0.5)),
    p90: cum.map((c) => pct(c, 0.9)),
    npv: { p10: pct(npvs, 0.1), p50: pct(npvs, 0.5), p90: pct(npvs, 0.9) },
    paybackP50: Number.isFinite(pb) ? pb : null,
    probPayback36: paybacks.filter((p) => p <= 36).length / paths,
    probNegativeNpv: npvs.filter((n) => n < 0).length / paths,
  };
}
