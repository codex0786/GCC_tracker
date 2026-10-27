import { DATA_AS_OF } from "./markets";
import type { Band, ComputeIntensity, FunctionId, FunctionProfile, OnshoreLocation, ReModel, SourceMeta } from "./types";

export const FUNCTIONS: Record<FunctionId, FunctionProfile> = {
  vlsi: { id: "vlsi", label: "Semiconductor VLSI", hotSkill: true, defaultCompute: "hpc", ctcLakh: { "L1-L2": 14, "L3-L4": 32, "L5-L6": 62, "L7+": 120 } },
  "auto-sdv": { id: "auto-sdv", label: "Automotive SDV", hotSkill: true, defaultCompute: "elevated", ctcLakh: { "L1-L2": 11, "L3-L4": 26, "L5-L6": 52, "L7+": 100 } },
  quant: { id: "quant", label: "Quant Finance", hotSkill: false, defaultCompute: "elevated", ctcLakh: { "L1-L2": 18, "L3-L4": 38, "L5-L6": 72, "L7+": 140 } },
  genai: { id: "genai", label: "Enterprise GenAI", hotSkill: true, defaultCompute: "hpc", ctcLakh: { "L1-L2": 15, "L3-L4": 35, "L5-L6": 68, "L7+": 130 } },
  "pharma-bio": { id: "pharma-bio", label: "Pharma Bioinformatics", hotSkill: false, defaultCompute: "elevated", ctcLakh: { "L1-L2": 9, "L3-L4": 20, "L5-L6": 42, "L7+": 85 } },
  "shared-services": { id: "shared-services", label: "Shared Services / Ops", hotSkill: false, defaultCompute: "standard", ctcLakh: { "L1-L2": 5, "L3-L4": 11, "L5-L6": 26, "L7+": 60 } },
};

/** Fully-loaded onshore cost per FTE, USD per year (salary + benefits + overhead). */
export const ONSHORE_COST_USD: Record<OnshoreLocation, Record<Band, number>> = {
  us: { "L1-L2": 150_000, "L3-L4": 215_000, "L5-L6": 295_000, "L7+": 430_000 },
  uk: { "L1-L2": 105_000, "L3-L4": 150_000, "L5-L6": 210_000, "L7+": 320_000 },
  germany: { "L1-L2": 115_000, "L3-L4": 160_000, "L5-L6": 220_000, "L7+": 330_000 },
  singapore: { "L1-L2": 110_000, "L3-L4": 160_000, "L5-L6": 230_000, "L7+": 350_000 },
};
export const ONSHORE_LABEL: Record<OnshoreLocation, string> = { us: "United States", uk: "United Kingdom", germany: "Germany (EU)", singapore: "Singapore" };
export const ONSHORE_WAGE_INFLATION = 0.035;

export const RE_MODEL_LABEL: Record<ReModel, string> = {
  managed: "Managed office (OPEX)",
  "warm-shell": "Warm-shell lease",
  "bare-shell": "Bare-shell lease",
  "self-built": "Self-built campus",
};

export const RE = {
  sqftPerSeat: 90,
  camInrSqft: 16,
  bareShellRentDiscount: 0.9,
  fitoutInrSqft: { "warm-shell": 3000, "bare-shell": 4500 } as Record<string, number>,
  campusCapexInrSqft: 9500,
  campusOpexInrSqft: 28,
  fitoutLifeYears: 7,
  campusLifeYears: 25,
  /** Managed seats are contracted with a 10% flex buffer over occupied seats. */
  managedBuffer: 1.1,
  campusMinSeats: 800,
  /** Smallest practical Grade-A lease (one floor plate) */
  leaseMinSqft: 20_000,
  /** In-house facility management, security, housekeeping for a leased site (managed offices bundle this) */
  leaseFacilityInrMonth: 650_000,
};

/** Per-FTE compute & IT, INR per month (device amortisation, SaaS, cloud/GPU allocation). */
export const COMPUTE_INR_MONTH: Record<ComputeIntensity, number> = { standard: 5000, elevated: 12000, hpc: 28000 };
export const COMPUTE_LABEL: Record<ComputeIntensity, string> = { standard: "Standard (thin client / laptop)", elevated: "Elevated (dev workstation + cloud)", hpc: "HPC (GPU / EDA licences)" };

export const OPEX = {
  /** Statutory + benefits loading on CTC: gratuity, insurance, ESOP refresh pool */
  benefitsLoading: 0.12,
  sgaPctOfComp: 0.05,
  sgaInrPerHeadMonth: 3500,
  agencyShare: 0.5,
  agencyFeePct: 0.0833,
  inHouseCostPerHireInr: 30_000,
  setupInr: 1.8e7,
  complianceInrYear: 4.5e6,
  secondSiteOverheadInrYear: 1.4e7,
  spokeProductivityDrag: 0.03,
  /** One-off knowledge transfer / parallel-run cost, share of first-year onshore cost of transitioned roles */
  transitionPctOfOnshoreY1: 0.2,
  /** India output as a share of onshore-equivalent output: starts at 65%, reaches 95% by month 24 */
  productivityStart: 0.65,
  productivityMature: 0.95,
  productivityRampMonths: 24,
};

export const BAND_LEVEL_SHARE: Record<Band, number> = { "L1-L2": 0.45, "L3-L4": 0.33, "L5-L6": 0.17, "L7+": 0.05 };
export const BAND_HIRE_FACTOR: Record<Band, number> = { "L1-L2": 0.8, "L3-L4": 1, "L5-L6": 1.4, "L7+": 2 };

export const BENCHMARK_META: Record<string, SourceMeta> = {
  ctc: { label: "Compensation bands", unit: "₹ lakh CTC", source: "Public salary surveys (AmbitionBox, Naukri, levels.fyi India), company-disclosed ranges", method: "Median annual CTC at Bengaluru ORR, adjusted by market compensation index", asOf: DATA_AS_OF },
  onshore: { label: "Onshore fully-loaded cost", unit: "USD/FTE/yr", source: "BLS OEWS, ONS ASHE, Destatis, MOM Singapore wage data + 30–40% overhead loading", method: "Median wage × loading for benefits, payroll tax, facilities", asOf: DATA_AS_OF },
  compute: { label: "Compute & IT per FTE", unit: "₹/month", source: "Public cloud price lists, OEM workstation list prices", method: "3-year device amortisation + SaaS + cloud/GPU allocation", asOf: DATA_AS_OF },
  re: { label: "Real-estate cost model", unit: "₹", source: "Public fit-out cost guides and CRE market summaries", method: "90 sq.ft (super built-up) per seat; CAM ₹16/sq.ft; leases expand annually; fit-out amortised over 7 yrs with residual value credited in model comparisons", asOf: DATA_AS_OF },
  productivity: { label: "Productivity equivalence", unit: "% of onshore output", source: "GCC maturity benchmarks in public NASSCOM/Zinnov GCC reports", method: "Onshore-equivalent output ramps 65% → 95% over 24 months; 20% of year-1 onshore cost charged once for knowledge transfer and parallel running", asOf: DATA_AS_OF },
  recruit: { label: "Recruitment cost", unit: "₹/hire", source: "Typical agency terms (8.33% of CTC)", method: "50% agency hires; attrition backfill at market attrition rate", asOf: DATA_AS_OF },
};
