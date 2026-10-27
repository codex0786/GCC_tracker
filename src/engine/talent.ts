import { BAND_HIRE_FACTOR, BAND_LEVEL_SHARE, FUNCTIONS } from "@/data/benchmarks";
import { BANDS, type Band, type FunctionId, type Market } from "@/data/types";
import type { Anchors } from "./scenario";

const SENIOR: Band[] = ["L5-L6", "L7+"];

export interface Alert {
  level: "red" | "amber" | "info";
  title: string;
  detail: string;
}

export interface BandTalent {
  band: Band;
  /** Candidates realistically capturable per year */
  availablePerYear: number;
  hiresYear1: number;
  fillRate: number;
  timeToHireDays: number;
}

export interface TalentResult {
  lci: number;
  bands: BandTalent[];
  /** Compensation premium applied to relocated senior hires, fraction */
  relocationPremium: number;
  /** Share of senior hires that must be relocated in from Tier-1 hubs */
  importedSeniorShare: number;
  seniorHeadcountY5: number;
  alerts: Alert[];
}

/** Leadership Ceiling Index: local L6+ depth blended with the function's ecosystem strength. */
export const leadershipCeilingIndex = (m: Market, fn: FunctionId) => 0.7 * m.seniorDepth + 30 * m.specialism[fn];

export function annualAvailable(m: Market, fn: FunctionId, band: Band, attritionAddPp = 0) {
  const mobility = Math.max(0.03, (m.attritionPct + attritionAddPp) / 100);
  const capture = 1 / (1 + m.competitorDensity / 8);
  return m.talentPoolK * 1000 * BAND_LEVEL_SHARE[band] * Math.pow(m.specialism[fn], 1.5) * mobility * capture;
}

export function assessTalent(m: Market, fn: FunctionId, anchors: Anchors, attritionAddPp = 0): TalentResult {
  const lci = leadershipCeilingIndex(m, fn);
  const spec = m.specialism[fn];
  const attr = (m.attritionPct + attritionAddPp) / 100;

  const bands = BANDS.map((band) => {
    const a = anchors[band];
    const growthY1 = a.day1 + (a.y3 - a.day1) / 3;
    const hiresYear1 = growthY1 + growthY1 * attr * 0.5;
    const availablePerYear = annualAvailable(m, fn, band, attritionAddPp);
    const pressure = hiresYear1 > 0 ? Math.min(2, hiresYear1 / Math.max(1, availablePerYear)) : 0;
    const timeToHireDays =
      m.baseTimeToHire * BAND_HIRE_FACTOR[band] * (1 + m.competitorDensity / 250) * (1 + 0.6 * (1 - spec)) * (1 + 0.5 * pressure);
    const fillRate = hiresYear1 > 0 ? Math.min(1, availablePerYear / hiresYear1) : 1;
    return { band, availablePerYear, hiresYear1, fillRate, timeToHireDays };
  });

  const seniorHeadcountY5 = SENIOR.reduce((s, b) => s + anchors[b].y5, 0);
  const seniorAvail5y = SENIOR.reduce((s, b) => s + annualAvailable(m, fn, b, attritionAddPp) * 5, 0);
  const relocationPremium = m.tier === 2 ? Math.min(0.45, Math.max(0.25, 0.25 + 0.2 * (1 - lci / 100))) : 0;
  const importedSeniorShare =
    m.tier === 2 ? Math.max(0.3, Math.min(1, seniorHeadcountY5 > 0 ? 1 - seniorAvail5y / seniorHeadcountY5 : 0)) : 0;

  const alerts: Alert[] = [];
  const label = FUNCTIONS[fn].label;
  if (seniorHeadcountY5 > 50 && lci < 45) {
    alerts.push({
      level: "red",
      title: "Leadership ceiling breached",
      detail: `${Math.round(seniorHeadcountY5)} L5+ ${label} roles planned in ${m.name} with LCI ${lci.toFixed(0)} (< 45). Expect relocation premiums of ${Math.round(relocationPremium * 100)}% and leadership flight risk; anchor senior roles in a Tier-1 hub.`,
    });
  }
  for (const b of bands) {
    if (b.fillRate < 0.7 && b.hiresYear1 >= 5) {
      alerts.push({
        level: "amber",
        title: `${b.band} fill-rate risk`,
        detail: `Only ~${Math.round(b.fillRate * 100)}% of year-1 ${b.band} hiring (${Math.round(b.hiresYear1)}) is coverable from the local market at current competition density.`,
      });
    }
  }
  const senior = bands.find((b) => b.band === "L5-L6")!;
  if (senior.timeToHireDays > 90) {
    alerts.push({
      level: "amber",
      title: "Slow senior hiring",
      detail: `L5–L6 time-to-hire ≈ ${Math.round(senior.timeToHireDays)} days. Budget for search-firm retainers and a longer ramp.`,
    });
  }
  return { lci, bands, relocationPremium, importedSeniorShare, seniorHeadcountY5, alerts };
}
