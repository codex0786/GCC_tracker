import { describe, expect, it } from "vitest";
import { benchmark, modelAnnualCosts, type BenchmarkInput } from "./benchmark";

const base: BenchmarkInput = {
  marketId: "hyd-fd",
  fn: "genai",
  headcount: 300,
  mix: { "L1-L2": 35, "L3-L4": 40, "L5-L6": 20, "L7+": 5 },
  reModel: "managed",
  compute: "hpc",
  seatingRatio: 1.3,
  currency: "USD",
  fxInrPerUsd: 88.5,
  actual: {},
};

describe("Benchmark my GCC", () => {
  it("returns model costs only when nothing is entered", () => {
    const r = benchmark(base);
    expect(r.actualTotal).toBeUndefined();
    expect(r.modelPerFte).toBeGreaterThan(20_000);
    expect(r.modelPerFte).toBeLessThan(120_000);
    expect(r.alternatives).toHaveLength(3);
  });

  it("classifies lines against a ±10% band and explains the biggest gap", () => {
    const m = modelAnnualCosts(base);
    const r = benchmark({ ...base, actual: { comp: m.comp * 1.05, re: m.re * 1.5, compute: m.compute * 0.7 } });
    const by = Object.fromEntries(r.rows.map((x) => [x.line, x.status]));
    expect(by.comp).toBe("in-line");
    expect(by.re).toBe("above");
    expect(by.compute).toBe("below");
    expect(by.admin).toBeUndefined();
    expect(r.insights.some((s) => s.startsWith("Real estate"))).toBe(true);
  });

  it("INR and USD agree after conversion", () => {
    const usd = modelAnnualCosts(base);
    const inr = modelAnnualCosts({ ...base, currency: "INR" });
    expect(inr.comp / 88.5).toBeCloseTo(usd.comp, 0);
  });

  it("cheaper alternatives are cheaper than the current market", () => {
    const r = benchmark({ ...base, marketId: "blr-orr" });
    expect(r.alternatives[0].vsCurrentPct).toBeLessThan(0);
  });
});
