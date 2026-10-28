import { MARKETS, MARKET_BY_ID } from "@/data/markets";
import { BANDS, type Band, type ComputeIntensity, type FunctionId, type MarketId, type ReModel } from "@/data/types";
import { costOptions } from "./evaluate";
import { DEFAULT_SCENARIO, baseEnv, type Anchors, type Scenario } from "./scenario";
import { assessTalent } from "./talent";
import { simulateSite } from "./tco";

export const BENCH_LINES = ["comp", "re", "compute", "admin", "recruit"] as const;
export type BenchLine = (typeof BENCH_LINES)[number];
export const BENCH_LABEL: Record<BenchLine, string> = {
  comp: "Compensation & benefits",
  re: "Real estate",
  compute: "IT & compute",
  admin: "SG&A / admin",
  recruit: "Recruitment",
};

export type Currency = "USD" | "INR";

export interface BenchmarkInput {
  marketId: MarketId;
  fn: FunctionId;
  headcount: number;
  /** Seniority mix, percent by band */
  mix: Record<Band, number>;
  reModel: ReModel;
  compute: ComputeIntensity;
  seatingRatio: number;
  currency: Currency;
  fxInrPerUsd: number;
  /** Actual annual costs in `currency`; undefined = not entered */
  actual: Partial<Record<BenchLine, number>>;
}

export type Status = "in-line" | "above" | "below";

export interface BenchRow {
  line: BenchLine;
  model: number;
  actual?: number;
  deltaPct?: number;
  status?: Status;
}

export interface BenchmarkResult {
  rows: BenchRow[];
  modelTotal: number;
  actualTotal?: number;
  deltaPct?: number;
  modelPerFte: number;
  actualPerFte?: number;
  insights: string[];
  /** Same team, same setup, modelled in other markets: cheapest first */
  alternatives: { marketId: MarketId; name: string; perFte: number; vsCurrentPct: number }[];
}

const TOLERANCE = 0.1;

function scenarioFor(i: BenchmarkInput, marketId: MarketId): Scenario {
  return { ...DEFAULT_SCENARIO, fn: i.fn, marketId, reModel: i.reModel, compute: i.compute, seatingRatio: i.seatingRatio, macro: { ...DEFAULT_SCENARIO.macro, fxInrPerUsd: i.fxInrPerUsd } };
}

/** Steady-state model cost for the next 12 months of a team that is not growing, in the chosen currency. */
export function modelAnnualCosts(i: BenchmarkInput, marketId: MarketId = i.marketId): Record<BenchLine, number> {
  const s = scenarioFor(i, marketId);
  const env = baseEnv(s);
  const total = BANDS.reduce((a, b) => a + i.mix[b], 0) || 1;
  const anchors = Object.fromEntries(BANDS.map((b) => {
    const hc = (i.headcount * i.mix[b]) / total;
    return [b, { day1: hc, y3: hc, y5: hc }];
  })) as Anchors;
  const market = MARKET_BY_ID[marketId];
  const t = assessTalent(market, i.fn, anchors);
  const flows = simulateSite({ market, anchors, seniorPremium: t.relocationPremium * t.importedSeniorShare }, costOptions(s, env));
  const toCcy = (inr: number) => (i.currency === "INR" ? inr : inr / i.fxInrPerUsd);
  const sum = (xs: number[]) => toCcy(xs.slice(0, 12).reduce((a, b) => a + b, 0));
  return { comp: sum(flows.comp), re: sum(flows.re), compute: sum(flows.compute), admin: sum(flows.admin), recruit: sum(flows.recruit) };
}

const ADVICE: Record<BenchLine, { above: string; below: string }> = {
  comp: {
    above: "Compensation runs above benchmark for this seniority mix. Check band mix, retention bonuses and relocation premiums.",
    below: "Compensation is below benchmark: good for cost, but watch attrition and offer-acceptance rates.",
  },
  re: {
    above: "Real estate is above benchmark. Test a higher hybrid seating ratio, or compare leasing with managed space in the 5-Year TCO tool.",
    below: "Real estate is below benchmark; check that space and amenities will keep up with growth.",
  },
  compute: {
    above: "IT and compute spend is above benchmark. Review licence utilisation and cloud or GPU allocation per head.",
    below: "IT spend is below benchmark; make sure tooling isn't limiting productivity.",
  },
  admin: {
    above: "Admin and SG&A are above benchmark. Look at transport, facility services and shared-service overheads.",
    below: "Admin costs are lean compared with the model.",
  },
  recruit: {
    above: "Recruitment is above benchmark, which usually means high attrition or heavy agency use.",
    below: "Recruitment spend is below benchmark.",
  },
};

export function benchmark(i: BenchmarkInput): BenchmarkResult {
  const model = modelAnnualCosts(i);
  const rows: BenchRow[] = BENCH_LINES.map((line) => {
    const actual = i.actual[line];
    if (actual === undefined || !Number.isFinite(actual) || actual <= 0) return { line, model: model[line] };
    const deltaPct = (actual - model[line]) / model[line];
    const status: Status = deltaPct > TOLERANCE ? "above" : deltaPct < -TOLERANCE ? "below" : "in-line";
    return { line, model: model[line], actual, deltaPct, status };
  });

  const modelTotal = BENCH_LINES.reduce((a, l) => a + model[l], 0);
  const entered = rows.filter((r) => r.actual !== undefined);
  // Compare totals only across the lines the user filled in.
  const enteredModel = entered.reduce((a, r) => a + r.model, 0);
  const actualTotal = entered.length ? entered.reduce((a, r) => a + (r.actual ?? 0), 0) : undefined;
  const deltaPct = actualTotal !== undefined && enteredModel > 0 ? (actualTotal - enteredModel) / enteredModel : undefined;
  const hc = Math.max(1, i.headcount);

  const insights = [...entered]
    .filter((r) => r.status !== "in-line")
    .sort((a, b) => Math.abs((b.actual ?? 0) - b.model) - Math.abs((a.actual ?? 0) - a.model))
    .slice(0, 3)
    .map((r) => `${ADVICE[r.line][r.status as "above" | "below"]} (${r.deltaPct! > 0 ? "+" : ""}${Math.round(r.deltaPct! * 100)}%)`);
  if (entered.length > 0 && insights.length === 0) insights.push("Every cost line you entered is within ±10% of the model for this team and market.");

  const currentPerFte = modelTotal / hc;
  const alternatives = MARKETS.filter((m) => m.id !== i.marketId)
    .map((m) => {
      const c = modelAnnualCosts(i, m.id);
      const perFte = BENCH_LINES.reduce((a, l) => a + c[l], 0) / hc;
      return { marketId: m.id, name: m.name, perFte, vsCurrentPct: (perFte - currentPerFte) / currentPerFte };
    })
    .sort((a, b) => a.perFte - b.perFte)
    .slice(0, 3);

  return {
    rows,
    modelTotal,
    actualTotal,
    deltaPct,
    modelPerFte: currentPerFte,
    actualPerFte: actualTotal !== undefined && entered.length === BENCH_LINES.length ? actualTotal / hc : undefined,
    insights,
    alternatives,
  };
}
