import { describe, expect, it } from "vitest";
import { MARKETS, MARKET_BY_ID } from "@/data/markets";
import { evaluate } from "./evaluate";
import { scoreMarkets } from "./mcda";
import { runMonteCarlo } from "./montecarlo";
import { DEFAULT_SCENARIO, anchorsFromScenario, rebalance, stressedEnv, type Scenario } from "./scenario";
import { assessTalent } from "./talent";
import { adviseTax } from "./tax";
import { headcountAt } from "./tco";

const s = (patch: Partial<Scenario> = {}): Scenario => ({ ...DEFAULT_SCENARIO, ...patch });

describe("MCDA", () => {
  it("scores within 0-100 and ranks descending", () => {
    const r = scoreMarkets(MARKETS, "genai", DEFAULT_SCENARIO.weights);
    expect(r).toHaveLength(MARKETS.length);
    r.forEach((x, i) => {
      expect(x.score).toBeGreaterThanOrEqual(0);
      expect(x.score).toBeLessThanOrEqual(100);
      if (i > 0) expect(r[i - 1].score).toBeGreaterThanOrEqual(x.score);
    });
  });

  it("treats cost as lower-is-better", () => {
    const r = scoreMarkets(MARKETS, "genai", { cost: 100, seniorTalent: 0, attrition: 0, connectivity: 0, incentives: 0 });
    expect(r[0].market.id).toBe("coimbatore");
    expect(r.at(-1)!.market.id).toBe("blr-orr");
  });

  it("does not re-rank markets when the comparison set changes (fixed bounds)", () => {
    const full = scoreMarkets(MARKETS, "vlsi", DEFAULT_SCENARIO.weights).map((x) => x.market.id);
    const subset = MARKETS.filter((m) => m.id !== "coimbatore" && m.id !== "kochi");
    const sub = scoreMarkets(subset, "vlsi", DEFAULT_SCENARIO.weights).map((x) => x.market.id);
    expect(sub).toEqual(full.filter((id) => id !== "coimbatore" && id !== "kochi"));
  });

  it("senior-talent weighting favours Bengaluru for VLSI", () => {
    const r = scoreMarkets(MARKETS, "vlsi", { cost: 0, seniorTalent: 100, attrition: 0, connectivity: 0, incentives: 0 });
    expect(r[0].market.id).toBe("blr-orr");
  });
});

describe("rebalance", () => {
  it("keeps weights summing to 100", () => {
    const w = rebalance(DEFAULT_SCENARIO.weights, "cost", 55);
    expect(Object.values(w).reduce((a, b) => a + b, 0)).toBe(100);
    expect(w.cost).toBe(55);
  });
});

describe("Talent", () => {
  it("raises the red flag for >50 senior hires in a low-LCI hub", () => {
    const sc = s({ fn: "vlsi", headcount: { day1: 50, y3: 300, y5: 600 } });
    const t = assessTalent(MARKET_BY_ID.coimbatore, "vlsi", anchorsFromScenario(sc));
    expect(t.lci).toBeLessThan(45);
    expect(t.alerts.some((a) => a.level === "red")).toBe(true);
    expect(t.relocationPremium).toBeGreaterThanOrEqual(0.25);
    expect(t.relocationPremium).toBeLessThanOrEqual(0.45);
  });

  it("does not flag Bengaluru ORR", () => {
    const t = assessTalent(MARKET_BY_ID["blr-orr"], "vlsi", anchorsFromScenario(DEFAULT_SCENARIO));
    expect(t.alerts.some((a) => a.level === "red")).toBe(false);
    expect(t.relocationPremium).toBe(0);
  });
});

describe("Tax", () => {
  const base = { costBaseInr: 5e9, payrollInr: 3.5e9, tangibleAssetsInr: 5e8, pillarTwoInScope: true, financialServicesGroup: false, domesticSalesPct: 0, importedHardwareUsdM: 1, fx: 88 };
  it("no Pillar Two top-up at the standard India rate", () => {
    const t = adviseTax({ ...base, market: MARKET_BY_ID["hyd-fd"], fn: "genai" });
    expect(t.indiaEtr).toBeCloseTo(0.2517);
    expect(t.pillarTwo.topUpInr).toBe(0);
  });
  it("GIFT IFSC quant unit gets the holiday and a Pillar Two top-up", () => {
    const t = adviseTax({ ...base, market: MARKET_BY_ID["gift-city"], fn: "quant" });
    expect(t.ifsc.eligible).toBe(true);
    expect(t.indiaEtr).toBeLessThan(0.15);
    expect(t.pillarTwo.topUpInr).toBeGreaterThan(0);
  });
  it("non-financial GIFT unit is not IFSC eligible", () => {
    const t = adviseTax({ ...base, market: MARKET_BY_ID["gift-city"], fn: "vlsi" });
    expect(t.ifsc.eligible).toBe(false);
  });
  it("uses the safe-harbour band for small transactions", () => {
    const t = adviseTax({ ...base, costBaseInr: 5e8, market: MARKET_BY_ID["hyd-fd"], fn: "genai" });
    expect(t.safeHarbourMarkup).toBe(0.17);
  });
});

describe("TCO", () => {
  it("ramps headcount to the Y3 and Y5 anchors", () => {
    const a = anchorsFromScenario(DEFAULT_SCENARIO);
    const total = (m: number) => Object.values(headcountAt(a, m, {})).reduce((x, y) => x + y, 0);
    expect(total(35)).toBeCloseTo(450);
    expect(total(59)).toBeCloseTo(800);
  });

  it("follows the per-stage seniority mix", () => {
    const a = anchorsFromScenario(DEFAULT_SCENARIO);
    const m = DEFAULT_SCENARIO.mix;
    expect(a["L7+"].day1).toBeCloseTo((80 * m.day1["L7+"]) / 100);
    expect(headcountAt(a, 35, {})["L1-L2"]).toBeCloseTo((450 * m.y3["L1-L2"]) / 100);
    expect(headcountAt(a, 59, {})["L5-L6"]).toBeCloseTo((800 * m.y5["L5-L6"]) / 100);
  });

  it("India is cheaper than the US and pays back within 5 years", () => {
    const e = evaluate(DEFAULT_SCENARIO);
    const t = e.financials.tco;
    expect(t.totalUsd).toBeLessThan(t.onshoreUsd);
    expect(t.paybackMonth).not.toBeNull();
    expect(t.npvSavingsUsd).toBeGreaterThan(0);
    expect(t.costPerSeatY3Usd).toBeGreaterThan(20_000);
    expect(t.costPerSeatY3Usd).toBeLessThan(120_000);
  });

  it("more headcount costs more", () => {
    const a = evaluate(DEFAULT_SCENARIO).financials.tco.totalUsd;
    const b = evaluate(s({ headcount: { day1: 160, y3: 900, y5: 1600 } })).financials.tco.totalUsd;
    expect(b).toBeGreaterThan(a * 1.8);
  });

  it("finds a lease breakeven headcount", () => {
    const e = evaluate(DEFAULT_SCENARIO);
    expect(e.reModels.leaseBreakevenHc).not.toBeNull();
  });
});

describe("Stress", () => {
  it("rent-absorption signal raises Hyderabad escalation", () => {
    const env = stressedEnv(s({ stress: { ...DEFAULT_SCENARIO.stress, signals: ["hyd-absorption"] } }));
    expect(env.markets["hyd-fd"].rentEscalationPct).toBeGreaterThan(MARKET_BY_ID["hyd-fd"].rentEscalationPct);
  });
  it("wage spike worsens NPV savings", () => {
    const sc = s({ stress: { ...DEFAULT_SCENARIO.stress, wageSpikePp: 6 } });
    expect(evaluate(sc, true).financials.tco.npvSavingsUsd).toBeLessThan(evaluate(sc, false).financials.tco.npvSavingsUsd);
  });
  it("Monte Carlo bands are ordered and deterministic", () => {
    const a = runMonteCarlo(DEFAULT_SCENARIO, 200, 7);
    const b = runMonteCarlo(DEFAULT_SCENARIO, 200, 7);
    expect(a.npv).toEqual(b.npv);
    expect(a.p10[59]).toBeLessThanOrEqual(a.p50[59]);
    expect(a.p50[59]).toBeLessThanOrEqual(a.p90[59]);
  });
});

describe("Lease crossover", () => {
  it("appears at scale and is absent when managed always wins", () => {
    const big = evaluate(s({ headcount: { day1: 400, y3: 1500, y5: 2500 } })).reModels;
    expect(big.crossoverMonth).not.toBeNull();
    expect(big.crossoverMonth!).toBeLessThanOrEqual(60);
    const small = evaluate(s({ headcount: { day1: 20, y3: 60, y5: 90 } })).reModels;
    expect(small.crossoverMonth).toBeNull();
  });
});
