// Country-level comparison: the decision most companies make before choosing a city.
// Scores are indicative composites on a 0–100 scale; cited figures carry their source.

export type CountryId = "india" | "philippines" | "poland" | "mexico" | "vietnam";
export type Hq = "us-east" | "uk" | "germany" | "singapore";

export interface Country {
  id: CountryId;
  name: string;
  flag: string;
  /** Fully loaded tech FTE cost, index vs United States = 100 (indicative) */
  costIndex: number;
  /** Scale of the skilled tech / services workforce, 0–100 (India = 100) */
  talentScale: number;
  /** Business-English fluency of the professional workforce, 0–100 (indicative composite) */
  english: number;
  /** EF English Proficiency Index 2025 score where published (general population) */
  efEpi2025?: { score: number; rank: string };
  /** Maturity of the GCC / shared-services ecosystem, 0–100 */
  ecosystem: number;
  /** Headline corporate income-tax rate, % */
  corporateTaxPct: number;
  /** Standard-time UTC offset used for the overlap calculation */
  utcOffset: number;
  strengths: string[];
  watchouts: string[];
}

export const COUNTRIES: Country[] = [
  {
    id: "india",
    name: "India",
    flag: "🇮🇳",
    costIndex: 25,
    talentScale: 100,
    english: 75,
    efEpi2025: { score: 484, rank: "#74" },
    ecosystem: 100,
    corporateTaxPct: 25.17,
    utcOffset: 5.5,
    strengths: ["Largest GCC base in the world: 2,117 centres, 2.36M people", "Deepest senior engineering and leadership bench", "Full range of functions, from operations to chip design and AI"],
    watchouts: ["Little working-day overlap with the US East Coast", "Hot-skill wage inflation and attrition in the densest hubs"],
  },
  {
    id: "philippines",
    name: "Philippines",
    flag: "🇵🇭",
    costIndex: 30,
    talentScale: 50,
    english: 85,
    efEpi2025: { score: 569, rank: "#28" },
    ecosystem: 65,
    corporateTaxPct: 25,
    utcOffset: 8,
    strengths: ["Strong business English and customer-facing skills", "Mature IT-BPM and shared-services sector", "Cultural familiarity with US clients"],
    watchouts: ["Thinner pool for deep engineering and R&D", "Typhoon and infrastructure resilience planning needed"],
  },
  {
    id: "poland",
    name: "Poland",
    flag: "🇵🇱",
    costIndex: 50,
    talentScale: 45,
    english: 80,
    ecosystem: 70,
    corporateTaxPct: 19,
    utcOffset: 1,
    strengths: ["EU location: same rules and near-full overlap with Western Europe", "Strong engineering universities and finance shared services", "Large, mature business-services sector"],
    watchouts: ["Roughly twice India's cost per head", "Smaller pool; competition for senior engineers is intense"],
  },
  {
    id: "mexico",
    name: "Mexico",
    flag: "🇲🇽",
    costIndex: 40,
    talentScale: 45,
    english: 55,
    ecosystem: 45,
    corporateTaxPct: 30,
    utcOffset: -6,
    strengths: ["Nearshore to the US: near-full working-day overlap", "Short flights to US headquarters", "Growing engineering base around Guadalajara and Monterrey"],
    watchouts: ["Business-English depth is uneven outside senior roles", "Higher corporate tax rate; security planning by city"],
  },
  {
    id: "vietnam",
    name: "Vietnam",
    flag: "🇻🇳",
    costIndex: 28,
    talentScale: 40,
    english: 50,
    efEpi2025: { score: 500, rank: "#64" },
    ecosystem: 35,
    corporateTaxPct: 20,
    utcOffset: 7,
    strengths: ["Competitive cost and a young, fast-growing engineering workforce", "Fastest-growing GCC market in Asia Pacific", "Strong software and electronics manufacturing ties"],
    watchouts: ["Early-stage GCC ecosystem and thin leadership bench", "English proficiency still moderate"],
  },
];

export const HQ_LABEL: Record<Hq, string> = { "us-east": "US East Coast", uk: "United Kingdom", germany: "Germany", singapore: "Singapore" };
const HQ_OFFSET: Record<Hq, number> = { "us-east": -5, uk: 0, germany: 1, singapore: 8 };

/** Overlapping office hours between a 9:00–18:00 day at HQ and in the country (0–9). */
export function overlapHours(c: Country, hq: Hq) {
  const diff = Math.abs(c.utcOffset - HQ_OFFSET[hq]);
  return Math.max(0, 9 - Math.min(diff, 24 - diff));
}

export const COUNTRY_CRITERIA = ["cost", "talent", "english", "timezone", "tax", "ecosystem"] as const;
export type CountryCriterion = (typeof COUNTRY_CRITERIA)[number];

export const COUNTRY_CRITERION_LABEL: Record<CountryCriterion, string> = {
  cost: "Cost",
  talent: "Talent scale",
  english: "Business English",
  timezone: "Time-zone overlap",
  tax: "Corporate tax",
  ecosystem: "GCC ecosystem",
};

/** Each criterion normalised to 0–1 (higher is better) against fixed bounds. */
export function countryCriterion(c: Country, k: CountryCriterion, hq: Hq) {
  switch (k) {
    case "cost":
      return Math.max(0, Math.min(1, (70 - c.costIndex) / 50));
    case "talent":
      return c.talentScale / 100;
    case "english":
      return c.english / 100;
    case "timezone":
      return overlapHours(c, hq) / 9;
    case "tax":
      return Math.max(0, Math.min(1, (35 - c.corporateTaxPct) / 20));
    case "ecosystem":
      return c.ecosystem / 100;
  }
}

export function scoreCountries(weights: Record<CountryCriterion, number>, hq: Hq) {
  const total = COUNTRY_CRITERIA.reduce((a, k) => a + weights[k], 0) || 1;
  return COUNTRIES.map((c) => {
    const parts = Object.fromEntries(COUNTRY_CRITERIA.map((k) => [k, (100 * weights[k] * countryCriterion(c, k, hq)) / total])) as Record<CountryCriterion, number>;
    return { country: c, parts, score: Object.values(parts).reduce((a, b) => a + b, 0) };
  }).sort((a, b) => b.score - a.score);
}

export const COUNTRY_SOURCES = ["efIndia", "efPhilippines", "vietnamEf", "techsciDestinations", "zinnovFy26"];
