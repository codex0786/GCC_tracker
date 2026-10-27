import { z } from "zod";
import { BANDS, FUNCTION_IDS, MARKET_IDS } from "./types";

const pct = z.number().min(0).max(100);
const score = z.number().min(0).max(100);
const positive = z.number().positive();
const unit = z.number().min(0).max(1);

export const SourceMetaSchema = z.object({
  label: z.string().min(1),
  unit: z.string().optional(),
  source: z.string().min(10),
  method: z.string().min(10),
  asOf: z.string().regex(/^Q[1-4] 20\d\d/, "asOf must start with a quarter, e.g. 'Q3 2026'"),
});

export const MarketSchema = z.object({
  id: z.enum(MARKET_IDS),
  name: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),
  tier: z.union([z.literal(1), z.literal(2)]),
  rentInrSqft: z.number().min(20).max(300),
  managedSeatInr: z.number().min(4000).max(40000),
  vacancyPct: pct,
  rentEscalationPct: z.number().min(0).max(15),
  salaryIndex: z.number().min(0.5).max(1.5),
  talentPoolK: positive,
  seniorDepth: score,
  attritionPct: z.number().min(0).max(40),
  competitorDensity: z.number().int().min(0),
  airportKm: positive,
  intlDestinations: z.number().int().min(0),
  transitScore: score,
  incentiveScore: score,
  regulatoryEase: score,
  baseTimeToHire: z.number().min(10).max(200),
  sezAvailable: z.boolean(),
  ifsc: z.boolean(),
  specialism: z.record(z.enum(FUNCTION_IDS), unit),
});

export const FunctionProfileSchema = z
  .object({
    id: z.enum(FUNCTION_IDS),
    label: z.string().min(2),
    hotSkill: z.boolean(),
    defaultCompute: z.enum(["standard", "elevated", "hpc"]),
    ctcLakh: z.record(z.enum(BANDS), z.number().min(1).max(500)),
  })
  .refine((f) => BANDS.every((b, i) => i === 0 || f.ctcLakh[b] > f.ctcLakh[BANDS[i - 1]]), "CTC must rise with seniority");

export const SignalSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  date: z.iso.date(),
  kind: z.enum(["cre", "wage", "policy", "automation"]),
  markets: z.union([z.literal("all"), z.array(z.enum(MARKET_IDS)).min(1)]),
  functions: z.array(z.enum(FUNCTION_IDS)).optional(),
  headline: z.string().min(10),
  detail: z.string().min(20),
  shock: z
    .object({
      rentEscalationPp: z.number().min(-10).max(10).optional(),
      vacancyPp: z.number().min(-30).max(30).optional(),
      wageStepUp: z.number().min(0).max(1).optional(),
      incentivePts: z.number().min(-50).max(50).optional(),
      automation: z.object({ bands: z.array(z.enum(BANDS)).min(1), pct: unit }).optional(),
    })
    .refine((s) => Object.keys(s).length > 0, "A signal must carry at least one quantified shock"),
});

export const RuleSchema = z.object({
  value: z.unknown(),
  basis: z.string().min(10),
  effective: z.string().min(3),
  verify: z.boolean().optional(),
});
