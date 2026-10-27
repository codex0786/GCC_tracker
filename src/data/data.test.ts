import { describe, expect, it } from "vitest";
import { BENCHMARK_META, FUNCTIONS } from "./benchmarks";
import { MARKETS, MARKET_META } from "./markets";
import { FunctionProfileSchema, MarketSchema, RuleSchema, SignalSchema, SourceMetaSchema } from "./schema";
import { SIGNALS } from "./signals";
import { TAX_RULES } from "./taxRules";
import { MARKET_IDS, type Market } from "./types";

// Numeric market attributes that feed the engines must each cite a source.
const SOURCED: (keyof Market)[] = [
  "rentInrSqft", "managedSeatInr", "vacancyPct", "rentEscalationPct", "salaryIndex", "talentPoolK", "seniorDepth",
  "attritionPct", "competitorDensity", "airportKm", "intlDestinations", "transitScore", "incentiveScore", "regulatoryEase", "baseTimeToHire",
];

describe("Datasets", () => {
  it.each(MARKETS.map((m) => [m.id, m] as const))("market %s is valid", (_, m) => {
    MarketSchema.parse(m);
  });

  it("covers every market id exactly once", () => {
    expect(MARKETS.map((m) => m.id).sort()).toEqual([...MARKET_IDS].sort());
  });

  it("cites a source for every engine attribute", () => {
    for (const key of SOURCED) {
      expect(MARKET_META[key], `missing source for ${key}`).toBeDefined();
      SourceMetaSchema.parse(MARKET_META[key]);
    }
    Object.values(BENCHMARK_META).forEach((m) => SourceMetaSchema.parse(m));
  });

  it("function profiles are valid", () => {
    Object.values(FUNCTIONS).forEach((f) => FunctionProfileSchema.parse(f));
  });

  it("signals are valid and unique", () => {
    SIGNALS.forEach((s) => SignalSchema.parse(s));
    expect(new Set(SIGNALS.map((s) => s.id)).size).toBe(SIGNALS.length);
  });

  it("tax rules carry a legal basis", () => {
    Object.values(TAX_RULES).forEach((r) => RuleSchema.parse(r));
  });
});

describe("Schemas reject bad data", () => {
  it("flags out-of-range values and missing sources", () => {
    expect(MarketSchema.safeParse({ ...MARKETS[0], rentInrSqft: 5 }).success).toBe(false);
    expect(MarketSchema.safeParse({ ...MARKETS[0], specialism: { vlsi: 1 } }).success).toBe(false);
    expect(SourceMetaSchema.safeParse({ label: "x", source: "", method: "some method", asOf: "Q3 2026" }).success).toBe(false);
  });
});
