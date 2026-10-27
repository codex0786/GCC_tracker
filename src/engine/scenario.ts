import { MARKET_BY_ID } from "@/data/markets";
import { SIGNALS, type Signal } from "@/data/signals";
import { BANDS, type Band, type ComputeIntensity, type FunctionId, type Market, type MarketId, type OnshoreLocation, type ReModel } from "@/data/types";

export const CRITERIA = ["cost", "seniorTalent", "attrition", "connectivity", "incentives"] as const;
export type CriterionId = (typeof CRITERIA)[number];

export type RentMode = "market" | "triennial" | "annual9";

export const STAGES = ["day1", "y3", "y5"] as const;
export type Stage = (typeof STAGES)[number];
export const STAGE_LABEL: Record<Stage, string> = { day1: "Day 1", y3: "Year 3", y5: "Year 5" };

/** Everything the user controls. Plain JSON so it can live in the URL. */
export interface Scenario {
  fn: FunctionId;
  headcount: { day1: number; y3: number; y5: number };
  /** Seniority mix at each headcount anchor, percent by band (each sums to 100) */
  mix: Record<Stage, Record<Band, number>>;
  /** Priority weights, percent (sums to 100) */
  weights: Record<CriterionId, number>;
  marketId: MarketId;
  reModel: ReModel;
  compute: ComputeIntensity;
  seatingRatio: number;
  macro: {
    fxInrPerUsd: number;
    wageInflHotPct: number;
    wageInflGeneralPct: number;
    rentMode: RentMode;
    waccPct: number;
    onshore: OnshoreLocation;
  };
  tax: {
    pillarTwoInScope: boolean;
    financialServicesGroup: boolean;
    domesticSalesPct: number;
    importedHardwareUsdM: number;
  };
  stress: {
    signals: string[];
    fxShockPct: number;
    wageSpikePp: number;
    rentEscPp: number;
    automationPct: number;
  };
}

export const DEFAULT_SCENARIO: Scenario = {
  fn: "genai",
  headcount: { day1: 80, y3: 450, y5: 800 },
  // Leadership is hired first, so the launch team is senior-heavy and the pyramid widens as the centre scales.
  mix: {
    day1: { "L1-L2": 20, "L3-L4": 40, "L5-L6": 30, "L7+": 10 },
    y3: { "L1-L2": 35, "L3-L4": 40, "L5-L6": 20, "L7+": 5 },
    y5: { "L1-L2": 42, "L3-L4": 38, "L5-L6": 16, "L7+": 4 },
  },
  weights: { cost: 25, seniorTalent: 35, attrition: 10, connectivity: 15, incentives: 15 },
  marketId: "hyd-fd",
  reModel: "managed",
  compute: "hpc",
  seatingRatio: 1.3,
  macro: { fxInrPerUsd: 88.5, wageInflHotPct: 11, wageInflGeneralPct: 8.5, rentMode: "market", waccPct: 9, onshore: "us" },
  tax: { pillarTwoInScope: true, financialServicesGroup: false, domesticSalesPct: 0, importedHardwareUsdM: 1.5 },
  stress: { signals: [], fxShockPct: 0, wageSpikePp: 0, rentEscPp: 0, automationPct: 0 },
};

/** Numeric environment the engines run against: shocked markets plus macro paths. */
export interface Env {
  markets: Record<MarketId, Market>;
  /** One-off compensation step-up by market for the scenario function */
  wageStepUp: Record<MarketId, number>;
  /** Share of each band displaced from month 12 */
  automation: Partial<Record<Band, number>>;
  fx0: number;
  fxDrift: number;
  wageInfl: number;
  rentEscAdd: number;
  attritionAddPp: number;
  onshoreInfl: number;
}

const zeroByMarket = () => Object.fromEntries(Object.keys(MARKET_BY_ID).map((k) => [k, 0])) as Record<MarketId, number>;

function cloneMarkets(): Record<MarketId, Market> {
  return Object.fromEntries(
    Object.values(MARKET_BY_ID).map((m) => [m.id, { ...m, specialism: { ...m.specialism } }]),
  ) as Record<MarketId, Market>;
}

export function baseEnv(s: Scenario): Env {
  const hot = s.macro.wageInflHotPct / 100;
  const general = s.macro.wageInflGeneralPct / 100;
  return {
    markets: cloneMarkets(),
    wageStepUp: zeroByMarket(),
    automation: {},
    fx0: s.macro.fxInrPerUsd,
    fxDrift: 0,
    wageInfl: isHot(s.fn) ? hot : general,
    rentEscAdd: 0,
    attritionAddPp: 0,
    onshoreInfl: 0.035,
  };
}

const HOT: FunctionId[] = ["vlsi", "auto-sdv", "genai"];
export const isHot = (fn: FunctionId) => HOT.includes(fn);

function signalApplies(sig: Signal, fn: FunctionId) {
  return !sig.functions || sig.functions.includes(fn);
}

/** Applies the active signal feed and manual stress sliders on top of the base environment. */
export function stressedEnv(s: Scenario): Env {
  const env = baseEnv(s);
  for (const sig of SIGNALS.filter((x) => s.stress.signals.includes(x.id))) {
    if (!signalApplies(sig, s.fn)) continue;
    const ids = sig.markets === "all" ? (Object.keys(env.markets) as MarketId[]) : sig.markets;
    for (const id of ids) {
      const m = env.markets[id];
      if (sig.shock.rentEscalationPp) m.rentEscalationPct += sig.shock.rentEscalationPp;
      if (sig.shock.vacancyPp) m.vacancyPct = Math.max(1, m.vacancyPct + sig.shock.vacancyPp);
      if (sig.shock.incentivePts) m.incentiveScore = Math.min(100, m.incentiveScore + sig.shock.incentivePts);
      if (sig.shock.wageStepUp) env.wageStepUp[id] = Math.max(env.wageStepUp[id], sig.shock.wageStepUp);
    }
    if (sig.shock.automation) {
      for (const b of sig.shock.automation.bands) env.automation[b] = Math.max(env.automation[b] ?? 0, sig.shock.automation.pct);
    }
  }
  env.fx0 = s.macro.fxInrPerUsd * (1 + s.stress.fxShockPct / 100);
  env.wageInfl += s.stress.wageSpikePp / 100;
  env.rentEscAdd += s.stress.rentEscPp / 100;
  if (s.stress.automationPct > 0) {
    env.automation["L1-L2"] = Math.max(env.automation["L1-L2"] ?? 0, s.stress.automationPct / 100);
    env.automation["L3-L4"] = Math.max(env.automation["L3-L4"] ?? 0, s.stress.automationPct / 200);
  }
  return env;
}

export function hasStress(s: Scenario) {
  const t = s.stress;
  return t.signals.length > 0 || t.fxShockPct !== 0 || t.wageSpikePp !== 0 || t.rentEscPp !== 0 || t.automationPct !== 0;
}

export type Anchors = Record<Band, { day1: number; y3: number; y5: number }>;

export function anchorsFromScenario(s: Scenario): Anchors {
  const share = (stage: Stage, b: Band) => s.mix[stage][b] / (BANDS.reduce((a, x) => a + s.mix[stage][x], 0) || 1);
  return Object.fromEntries(
    BANDS.map((b) => [b, { day1: s.headcount.day1 * share("day1", b), y3: s.headcount.y3 * share("y3", b), y5: s.headcount.y5 * share("y5", b) }]),
  ) as Anchors;
}

/** Rebalances a percent record so it sums to 100 after `key` is set to `value`. */
export function rebalance<K extends string>(rec: Record<K, number>, key: K, value: number): Record<K, number> {
  const keys = Object.keys(rec) as K[];
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const others = keys.filter((k) => k !== key);
  const otherSum = others.reduce((a, k) => a + rec[k], 0);
  const remaining = 100 - v;
  const out = { ...rec, [key]: v } as Record<K, number>;
  let assigned = 0;
  others.forEach((k, i) => {
    const share = otherSum > 0 ? rec[k] / otherSum : 1 / others.length;
    const n = i === others.length - 1 ? remaining - assigned : Math.round(remaining * share);
    out[k] = n;
    assigned += n;
  });
  return out;
}
