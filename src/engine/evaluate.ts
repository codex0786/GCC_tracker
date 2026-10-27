import { FUNCTIONS, RE_MODEL_LABEL } from "@/data/benchmarks";
import { MARKETS } from "@/data/markets";
import { BANDS, type Band, type Market, type MarketId } from "@/data/types";
import { scoreMarkets, type MarketScore } from "./mcda";
import { anchorsFromScenario, baseEnv, stressedEnv, type Anchors, type Env, type Scenario } from "./scenario";
import { assessTalent, type Alert, type TalentResult } from "./talent";
import { adviseTax, type TaxResult } from "./tax";
import { aggregate, compareReModels, simulateSite, y3Base, type CostOptions, type ReModelComparison, type SiteSpec, type TcoResult } from "./tco";

export function costOptions(s: Scenario, env: Env): CostOptions {
  return { fn: s.fn, reModel: s.reModel, compute: s.compute, seatingRatio: s.seatingRatio, rentMode: s.macro.rentMode, waccPct: s.macro.waccPct, onshore: s.macro.onshore, env };
}

function siteSpec(market: Market, anchors: Anchors, talent: TalentResult, spoke = false): SiteSpec {
  return { market, anchors, seniorPremium: talent.relocationPremium * talent.importedSeniorShare, spoke };
}

export interface Financials {
  tco: TcoResult;
  tax: TaxResult;
}

/** Two-pass run: pre-tax flows size the TP transaction, then tax and Pillar Two feed back as a cost line. */
export function runFinancials(s: Scenario, env: Env, sites: SiteSpec[]): Financials {
  const o = costOptions(s, env);
  const flows = sites.map((site) => simulateSite(site, o));
  const base = y3Base(flows);
  const tax = adviseTax({
    market: sites[0].market,
    fn: s.fn,
    ...base,
    pillarTwoInScope: s.tax.pillarTwoInScope,
    financialServicesGroup: s.tax.financialServicesGroup,
    domesticSalesPct: s.tax.domesticSalesPct,
    importedHardwareUsdM: s.tax.importedHardwareUsdM,
    fx: env.fx0,
  });
  return { tco: aggregate(flows, o, tax.markup, tax.groupRateOnProfit), tax };
}

export interface HubSpokeOption {
  hub: Market;
  spoke: Market | null;
  spokeShare: number;
  npvUsd: number;
  feasible: boolean;
  note: string;
}

export interface HubSpokeResult {
  options: HubSpokeOption[];
  best: HubSpokeOption;
  bestSingle: HubSpokeOption;
  savingUsd: number;
  recommendation: string;
}

const SPOKE_BANDS: Band[] = ["L1-L2", "L3-L4"];

function splitAnchors(a: Anchors, share: number): [Anchors, Anchors] {
  const hub = {} as Anchors;
  const spoke = {} as Anchors;
  for (const b of BANDS) {
    const f = SPOKE_BANDS.includes(b) ? share : 0;
    hub[b] = { day1: a[b].day1 * (1 - f), y3: a[b].y3 * (1 - f), y5: a[b].y5 * (1 - f) };
    spoke[b] = { day1: a[b].day1 * f, y3: a[b].y3 * f, y5: a[b].y5 * f };
  }
  return [hub, spoke];
}

export function evaluateHubSpoke(s: Scenario, env: Env, ranking: MarketScore[]): HubSpokeResult {
  const anchors = anchorsFromScenario(s);
  const hubs = ranking.filter((r) => r.market.tier === 1).slice(0, 3).map((r) => r.market);
  const spokes = ranking.filter((r) => r.market.tier === 2).slice(0, 2).map((r) => r.market);
  const options: HubSpokeOption[] = [];

  for (const hub of hubs) {
    const hubTalent = assessTalent(hub, s.fn, anchors, env.attritionAddPp);
    const single = runFinancials(s, env, [siteSpec(hub, anchors, hubTalent)]);
    options.push({ hub, spoke: null, spokeShare: 0, npvUsd: single.tco.npvIndiaUsd, feasible: true, note: "Single-site anchor" });
    for (const spoke of spokes) {
      for (const share of [0.2, 0.3, 0.4]) {
        const [ha, sa] = splitAnchors(anchors, share);
        const st = assessTalent(spoke, s.fn, sa, env.attritionAddPp);
        const minFill = Math.min(...st.bands.filter((b) => SPOKE_BANDS.includes(b.band)).map((b) => b.fillRate));
        const fin = runFinancials(s, env, [siteSpec(hub, ha, assessTalent(hub, s.fn, ha, env.attritionAddPp)), { market: spoke, anchors: sa, seniorPremium: 0, spoke: true }]);
        options.push({
          hub,
          spoke,
          spokeShare: share,
          npvUsd: fin.tco.npvIndiaUsd,
          feasible: minFill >= 0.75,
          note: minFill >= 0.75 ? `Spoke covers ${Math.round(minFill * 100)}%+ of L1–L4 hiring locally` : `Spoke can fill only ${Math.round(minFill * 100)}% of L1–L4 hiring`,
        });
      }
    }
  }
  options.sort((a, b) => a.npvUsd - b.npvUsd);
  const bestSingle = options.filter((o) => !o.spoke)[0];
  const best = options.filter((o) => o.feasible)[0] ?? bestSingle;
  const savingUsd = bestSingle.npvUsd - best.npvUsd;
  const pct = (savingUsd / bestSingle.npvUsd) * 100;
  const recommendation =
    best.spoke && pct > 1
      ? `Split ${Math.round((1 - best.spokeShare) * 100)}/${Math.round(best.spokeShare * 100)}: core engineering and all L5+ roles in ${best.hub.name}, ${Math.round(best.spokeShare * 100)}% of L1–L4 delivery in ${best.spoke.name}. Cuts 5-yr cost NPV by ${pct.toFixed(1)}% vs a single ${bestSingle.hub.name} site, after second-site overhead and a 3% coordination drag.`
      : `Single-site anchor in ${best.hub.name}. No feasible spoke split saves more than 1% of 5-yr cost NPV once second-site overhead and coordination drag are included.`;
  return { options, best, bestSingle, savingUsd, recommendation };
}

export interface TradeOff {
  a: Market;
  b: Market;
  pros: string[];
  cons: string[];
}

export function tradeOff(a: Market, b: Market, ta: TalentResult, tb: TalentResult, fnLabel: string): TradeOff {
  const pros: string[] = [];
  const cons: string[] = [];
  const pct = (x: number, y: number) => Math.round(((y - x) / y) * 100);
  const rent = pct(a.rentInrSqft, b.rentInrSqft);
  const comp = pct(a.salaryIndex, b.salaryIndex);
  const days = Math.round(ta.bands[2].timeToHireDays - tb.bands[2].timeToHireDays);
  const lci = Math.round(ta.lci - tb.lci);
  const attr = Math.round((a.attritionPct - b.attritionPct) * 10) / 10;
  if (rent > 0) pros.push(`saves ${rent}% on Grade-A rent`);
  if (rent < 0) cons.push(`costs ${-rent}% more on Grade-A rent`);
  if (comp > 0) pros.push(`saves ${comp}% on compensation`);
  if (comp < 0) cons.push(`pays ${-comp}% more in compensation`);
  if (days < -3) pros.push(`hires L5–L6 ${fnLabel} talent ${-days} days faster`);
  if (days > 3) cons.push(`adds ${days} days to L5–L6 ${fnLabel} hiring`);
  if (lci > 3) pros.push(`has a ${lci}-pt deeper leadership bench`);
  if (lci < -3) cons.push(`has a ${-lci}-pt thinner leadership bench`);
  if (attr < -1) pros.push(`runs ${-attr} pp lower attrition`);
  if (attr > 1) cons.push(`runs ${attr} pp higher attrition`);
  return { a, b, pros, cons };
}

export interface Evaluation {
  env: Env;
  ranking: MarketScore[];
  talent: Record<MarketId, TalentResult>;
  selected: Market;
  financials: Financials;
  reModels: ReModelComparison;
  hubSpoke: HubSpokeResult;
  tradeOffs: TradeOff[];
  alerts: Alert[];
}

export function evaluate(s: Scenario, stressed = false): Evaluation {
  const env = stressed ? stressedEnv(s) : baseEnv(s);
  const markets = Object.values(env.markets);
  const anchors = anchorsFromScenario(s);
  const ranking = scoreMarkets(markets, s.fn, s.weights);
  const talent = Object.fromEntries(markets.map((m) => [m.id, assessTalent(m, s.fn, anchors, env.attritionAddPp)])) as Record<MarketId, TalentResult>;

  const selected = env.markets[s.marketId];
  const site = siteSpec(selected, anchors, talent[selected.id]);
  const financials = runFinancials(s, env, [site]);
  const reModels = compareReModels(site, costOptions(s, env));
  const hubSpoke = evaluateHubSpoke(s, env, ranking);

  const fnLabel = FUNCTIONS[s.fn].label;
  const top = ranking[0].market;
  const others = ranking.slice(1, 3).map((r) => r.market);
  if (selected.id !== top.id && !others.some((m) => m.id === selected.id)) others.push(selected);
  const tradeOffs = others.map((b) => tradeOff(top, b, talent[top.id], talent[b.id], fnLabel));

  const alerts: Alert[] = [...talent[selected.id].alerts];
  if (!financials.tco.reFeasible) {
    alerts.push({ level: "amber", title: "Campus below viable scale", detail: `A self-built campus needs ~800+ seats by year 5; this plan peaks at ${Math.round(financials.tco.months[59].hc / s.seatingRatio)}.` });
  }
  if (reModels.best !== s.reModel && reModels.feasible[reModels.best]) {
    const gap = financials.tco.npvIndiaUsd > 0 ? reModels.pvUsd[s.reModel] - reModels.pvUsd[reModels.best] : 0;
    if (gap > 0) alerts.push({ level: "info", title: "Cheaper real-estate model available", detail: `${RE_MODEL_LABEL[reModels.best]} lowers 5-yr real-estate PV by $${(gap / 1e6).toFixed(1)}M vs ${RE_MODEL_LABEL[s.reModel]}.` });
  }
  if (financials.tax.pillarTwo.topUpInr > 0) {
    alerts.push({ level: "amber", title: "Pillar Two top-up exposure", detail: financials.tax.pillarTwo.note });
  }
  if (selected.vacancyPct < 6) {
    alerts.push({ level: "amber", title: "Tight Grade-A supply", detail: `${selected.name} vacancy at ${selected.vacancyPct.toFixed(1)}%: lock pre-commitments early or expect above-trend escalation.` });
  }
  return { env, ranking, talent, selected, financials, reModels, hubSpoke, tradeOffs, alerts };
}

export const ALL_MARKETS = MARKETS;
