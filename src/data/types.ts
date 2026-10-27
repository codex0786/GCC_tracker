export const FUNCTION_IDS = ["vlsi", "auto-sdv", "quant", "genai", "pharma-bio", "shared-services"] as const;
export type FunctionId = (typeof FUNCTION_IDS)[number];

export const BANDS = ["L1-L2", "L3-L4", "L5-L6", "L7+"] as const;
export type Band = (typeof BANDS)[number];

export const MARKET_IDS = [
  "blr-orr",
  "blr-north",
  "hyd-fd",
  "pune-hinjawadi",
  "chennai-omr",
  "gift-city",
  "coimbatore",
  "kochi",
  "gurugram",
  "noida",
  "mumbai",
] as const;
export type MarketId = (typeof MARKET_IDS)[number];

export type ReModel = "managed" | "warm-shell" | "bare-shell" | "self-built";
export type ComputeIntensity = "standard" | "elevated" | "hpc";
export type OnshoreLocation = "us" | "uk" | "germany" | "singapore";

export interface Market {
  id: MarketId;
  name: string;
  city: string;
  state: string;
  tier: 1 | 2;
  /** Micro-market centroid, WGS84 degrees */
  lat: number;
  lon: number;
  /** Grade-A warm-shell rent, INR per sq.ft per month */
  rentInrSqft: number;
  /** Fully managed enterprise seat, INR per seat per month */
  managedSeatInr: number;
  vacancyPct: number;
  /** Market-typical annual rent escalation, % */
  rentEscalationPct: number;
  /** Compensation index vs Bengaluru ORR = 1.00 */
  salaryIndex: number;
  /** Tech workforce in the city, thousands */
  talentPoolK: number;
  /** Depth of L6+ director/architect talent, 0-100 */
  seniorDepth: number;
  attritionPct: number;
  /** Number of GCCs within ~15 km of the micro-market */
  competitorDensity: number;
  airportKm: number;
  intlDestinations: number;
  transitScore: number;
  incentiveScore: number;
  regulatoryEase: number;
  /** Baseline days to hire a mid-level (L3-L4) engineer */
  baseTimeToHire: number;
  sezAvailable: boolean;
  ifsc: boolean;
  /** Ecosystem strength for each function, 0-1 */
  specialism: Record<FunctionId, number>;
}

export interface SourceMeta {
  label: string;
  unit?: string;
  source: string;
  method: string;
  asOf: string;
}

export interface FunctionProfile {
  id: FunctionId;
  label: string;
  hotSkill: boolean;
  defaultCompute: ComputeIntensity;
  /** Annual CTC at Bengaluru ORR, INR lakh, by band */
  ctcLakh: Record<Band, number>;
}
