import type { FunctionId, Market } from "@/data/types";
import { CRITERIA, type CriterionId } from "./scenario";

interface CriterionDef {
  label: string;
  direction: "benefit" | "cost";
  /** Fixed benchmark bounds, so adding or removing a market never re-ranks the others. */
  bounds: [number, number];
  raw: (m: Market, fn: FunctionId) => number;
  method: string;
}

export const CRITERION_DEFS: Record<CriterionId, CriterionDef> = {
  cost: {
    label: "Cost arbitrage",
    direction: "cost",
    bounds: [0.6, 1.05],
    raw: (m) => 0.75 * m.salaryIndex + 0.25 * (m.rentInrSqft / 105),
    method: "0.75 × compensation index + 0.25 × rent index (Bengaluru ORR = 1). Lower is better.",
  },
  seniorTalent: {
    label: "Senior talent depth",
    direction: "benefit",
    bounds: [0, 100],
    raw: (m, fn) => 0.45 * m.seniorDepth + 35 * m.specialism[fn] + 20 * (Math.log10(m.talentPoolK) / Math.log10(2000)),
    method: "0.45 × L6+ depth + 35 × ecosystem strength for the selected function + 20 × talent-pool scale (log, Bengaluru = 1).",
  },
  attrition: {
    label: "Attrition resilience",
    direction: "benefit",
    bounds: [20, 100],
    raw: (m) => 100 - (3 * m.attritionPct + 0.25 * m.competitorDensity),
    method: "100 − (3 × attrition % + 0.25 × GCCs within 15 km).",
  },
  connectivity: {
    label: "Connectivity",
    direction: "benefit",
    bounds: [0, 100],
    raw: (m) => (Math.min(m.intlDestinations, 30) / 30) * 50 + (Math.max(0, 40 - m.airportKm) / 40) * 20 + 0.3 * m.transitScore,
    method: "International destinations (50), airport proximity (20), mass transit (30).",
  },
  incentives: {
    label: "Incentives & regulatory ease",
    direction: "benefit",
    bounds: [40, 100],
    raw: (m) => 0.6 * m.incentiveScore + 0.4 * m.regulatoryEase,
    method: "0.6 × state incentive package + 0.4 × regulatory ease.",
  },
};

export interface MarketScore {
  market: Market;
  score: number;
  rank: number;
  /** Normalised criterion values, 0-1 */
  normalised: Record<CriterionId, number>;
  /** Points each criterion adds to the 0-100 score */
  contribution: Record<CriterionId, number>;
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export function normalise(c: CriterionId, m: Market, fn: FunctionId) {
  const d = CRITERION_DEFS[c];
  const [lo, hi] = d.bounds;
  const n = clamp01((d.raw(m, fn) - lo) / (hi - lo));
  return d.direction === "cost" ? 1 - n : n;
}

/** S_m = Σ w_i · norm(x_m,i), with cost criteria inverted and weights renormalised to 1. */
export function scoreMarkets(markets: Market[], fn: FunctionId, weights: Record<CriterionId, number>): MarketScore[] {
  const wSum = CRITERIA.reduce((a, c) => a + Math.max(0, weights[c]), 0) || 1;
  const scored = markets.map((market) => {
    const normalised = {} as Record<CriterionId, number>;
    const contribution = {} as Record<CriterionId, number>;
    let score = 0;
    for (const c of CRITERIA) {
      normalised[c] = normalise(c, market, fn);
      contribution[c] = (100 * Math.max(0, weights[c]) * normalised[c]) / wSum;
      score += contribution[c];
    }
    return { market, score, rank: 0, normalised, contribution };
  });
  scored.sort((a, b) => b.score - a.score);
  scored.forEach((s, i) => (s.rank = i + 1));
  return scored;
}
