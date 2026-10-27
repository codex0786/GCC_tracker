import { COMPUTE_INR_MONTH, FUNCTIONS, ONSHORE_COST_USD, OPEX, RE } from "@/data/benchmarks";
import { BANDS, type Band, type ComputeIntensity, type FunctionId, type Market, type OnshoreLocation, type ReModel } from "@/data/types";
import type { Anchors, Env, RentMode } from "./scenario";

export const MONTHS = 60;
const SENIOR: Band[] = ["L5-L6", "L7+"];

export interface CostOptions {
  fn: FunctionId;
  reModel: ReModel;
  compute: ComputeIntensity;
  seatingRatio: number;
  rentMode: RentMode;
  waccPct: number;
  onshore: OnshoreLocation;
  env: Env;
}

export interface SiteSpec {
  market: Market;
  anchors: Anchors;
  /** Extra compensation on senior bands (relocation premium × imported share) */
  seniorPremium: number;
  spoke?: boolean;
}

/** Headcount by band at the end of month m (0-based), linear ramps day1→Y3→Y5, net of automation. */
export function headcountAt(anchors: Anchors, m: number, automation: Env["automation"]): Record<Band, number> {
  const t = m + 1;
  const out = {} as Record<Band, number>;
  for (const b of BANDS) {
    const a = anchors[b];
    const hc = t <= 36 ? a.day1 + ((a.y3 - a.day1) * t) / 36 : a.y3 + ((a.y5 - a.y3) * (t - 36)) / 24;
    out[b] = m >= 12 ? hc * (1 - (automation[b] ?? 0)) : hc;
  }
  return out;
}

const sum = (r: Record<Band, number>) => BANDS.reduce((a, b) => a + r[b], 0);

function rentFactor(m: Market, mode: RentMode, add: number, month: number) {
  const y = Math.floor(month / 12);
  const base = mode === "triennial" ? Math.pow(1.15, Math.floor(month / 36)) : Math.pow(1 + (mode === "annual9" ? 0.09 : m.rentEscalationPct / 100), y);
  return base * Math.pow(1 + add, y);
}

export interface ReFlows {
  opex: number[];
  capex: number[];
  /** Undepreciated fit-out / campus value at the end of month 60 */
  residual: number;
  feasible: boolean;
}

/** Real-estate cash flows (INR) for one site under a given model. */
export function realEstateFlows(market: Market, seats: number[], model: ReModel, rentMode: RentMode, rentEscAdd: number): ReFlows {
  const opex = new Array(MONTHS).fill(0);
  const capex = new Array(MONTHS).fill(0);
  let residual = 0;
  const managed = (m: number) => seats[m] * RE.managedBuffer * market.managedSeatInr * rentFactor(market, "market", rentEscAdd, m);

  if (model === "managed") {
    for (let m = 0; m < MONTHS; m++) opex[m] = managed(m);
    return { opex, capex, residual, feasible: true };
  }
  if (model === "self-built") {
    const sqft = seats[MONTHS - 1] * RE.sqftPerSeat;
    capex[0] = 0.4 * sqft * RE.campusCapexInrSqft;
    capex[12] = 0.6 * sqft * RE.campusCapexInrSqft;
    for (let m = 0; m < MONTHS; m++) {
      opex[m] = m < 18 ? managed(m) : sqft * RE.campusOpexInrSqft * Math.pow(1.05, Math.floor(m / 12));
    }
    residual = (capex[0] + capex[12]) * (1 - 5 / RE.campusLifeYears);
    return { opex, capex, residual, feasible: seats[MONTHS - 1] >= RE.campusMinSeats };
  }
  // Leases expand annually (right-of-first-refusal on adjacent floors), each phase sized for the following 12 months.
  const rent = market.rentInrSqft * (model === "bare-shell" ? RE.bareShellRentDiscount : 1);
  const fitout = RE.fitoutInrSqft[model];
  const phases = [0, 12, 24, 36, 48].map((start) => ({ start, sizedAt: start + 11 }));
  let sqft = 0;
  for (const p of phases) {
    const target = Math.max(RE.leaseMinSqft, sqft, seats[p.sizedAt] * RE.sqftPerSeat);
    const added = target - sqft;
    capex[p.start] += added * fitout * Math.pow(1.05, p.start / 12);
    residual += added * fitout * Math.pow(1.05, p.start / 12) * Math.max(0, 1 - (MONTHS - p.start) / (RE.fitoutLifeYears * 12));
    sqft = target;
    const end = phases[phases.indexOf(p) + 1]?.start ?? MONTHS;
    for (let m = p.start; m < end; m++) {
      const inflation = Math.pow(1.05, Math.floor(m / 12));
      opex[m] = sqft * (rent * rentFactor(market, rentMode, rentEscAdd, m) + RE.camInrSqft * inflation) + RE.leaseFacilityInrMonth * inflation;
    }
  }
  return { opex, capex, residual, feasible: true };
}

export interface SiteFlows {
  market: Market;
  hc: number[];
  comp: number[];
  re: number[];
  compute: number[];
  admin: number[];
  recruit: number[];
  capex: number[];
  onshoreUsd: number[];
  reFeasible: boolean;
}

export function simulateSite(site: SiteSpec, o: CostOptions): SiteFlows {
  const { market, anchors } = site;
  const env = o.env;
  const prof = FUNCTIONS[o.fn];
  const stepUp = 1 + (env.wageStepUp[market.id] ?? 0);
  const drag = site.spoke ? 1 + OPEX.spokeProductivityDrag : 1;
  const attr = Math.max(0, market.attritionPct + env.attritionAddPp) / 100;

  const f = () => new Array(MONTHS).fill(0) as number[];
  const hc = f(), comp = f(), compute = f(), admin = f(), recruit = f(), onshoreUsd = f();
  const seats: number[] = f();
  let prev = headcountAt(anchors, -1, {});

  for (let m = 0; m < MONTHS; m++) {
    const h = headcountAt(anchors, m, env.automation);
    const total = sum(h);
    hc[m] = total;
    seats[m] = total / o.seatingRatio;
    const infl = Math.pow(1 + env.wageInfl, m / 12);
    let c = 0;
    let r = 0;
    for (const b of BANDS) {
      const ctc = prof.ctcLakh[b] * 1e5 * market.salaryIndex * stepUp * infl * (SENIOR.includes(b) ? 1 + site.seniorPremium : 1);
      c += (h[b] * ctc * (1 + OPEX.benefitsLoading)) / 12;
      const hires = Math.max(0, h[b] - prev[b]) + (h[b] * attr) / 12;
      r += hires * (OPEX.agencyShare * OPEX.agencyFeePct * ctc + OPEX.inHouseCostPerHireInr);
      onshoreUsd[m] += (h[b] * ONSHORE_COST_USD[o.onshore][b] * Math.pow(1 + env.onshoreInfl, m / 12)) / 12;
    }
    comp[m] = c * drag;
    recruit[m] = r;
    compute[m] = total * COMPUTE_INR_MONTH[o.compute] * Math.pow(1.03, Math.floor(m / 12));
    admin[m] = c * OPEX.sgaPctOfComp + total * OPEX.sgaInrPerHeadMonth * Math.pow(1.05, Math.floor(m / 12));
    prev = h;
  }
  const reFlows = realEstateFlows(market, seats, o.reModel, o.rentMode, env.rentEscAdd);
  return { market, hc, comp, re: reFlows.opex, compute, admin, recruit, capex: reFlows.capex, onshoreUsd, reFeasible: reFlows.feasible };
}

export const COST_LINES = ["comp", "re", "compute", "admin", "recruit", "compliance", "capex"] as const;
export type CostLine = (typeof COST_LINES)[number];
export const COST_LINE_LABEL: Record<CostLine, string> = {
  comp: "Compensation",
  re: "Real estate",
  compute: "IT & compute",
  admin: "SG&A",
  recruit: "Recruitment",
  compliance: "Tax & TP compliance",
  capex: "Setup & fit-out capex",
};

export interface MonthRow extends Record<CostLine, number> {
  month: number;
  /** One-off knowledge-transfer cost, charged to the business case not the India P&L */
  transition: number;
  hc: number;
  total: number;
  onshore: number;
  savings: number;
  cumSavings: number;
}

export interface YearRow extends Record<CostLine, number> {
  year: number;
  hc: number;
  total: number;
  onshore: number;
  savings: number;
  cumSavings: number;
}

export interface TcoResult {
  months: MonthRow[];
  years: YearRow[];
  totalUsd: number;
  transitionUsd: number;
  /** Onshore cost of equivalent output (productivity-adjusted) */
  onshoreUsd: number;
  npvIndiaUsd: number;
  npvOnshoreUsd: number;
  npvSavingsUsd: number;
  paybackMonth: number | null;
  costPerSeatY3Usd: number;
  setupUsd: number;
  reFeasible: boolean;
  /** Steady-state year-3 inputs for the tax engine (INR) */
  y3: { costBaseInr: number; payrollInr: number; tangibleAssetsInr: number };
}

export function fxAt(env: Env, m: number) {
  return env.fx0 * Math.pow(1 + env.fxDrift, m / 12);
}

/** Pre-tax operating base (INR) in year 3, used to size the transfer-pricing transaction. */
export function y3Base(sites: SiteFlows[]) {
  let costBaseInr = OPEX.complianceInrYear;
  let payrollInr = 0;
  let tangibleAssetsInr = OPEX.setupInr;
  for (const s of sites) {
    for (let m = 24; m < 36; m++) {
      costBaseInr += s.comp[m] + s.re[m] + s.compute[m] + s.admin[m] + s.recruit[m];
      payrollInr += s.comp[m];
    }
    tangibleAssetsInr += s.capex.slice(0, 36).reduce((a, b) => a + b, 0);
  }
  if (sites.length > 1) costBaseInr += OPEX.secondSiteOverheadInrYear;
  return { costBaseInr, payrollInr, tangibleAssetsInr };
}

/** Combines site flows with entity-level costs and the onshore comparator. All outputs in USD. */
export function aggregate(sites: SiteFlows[], o: CostOptions, markup: number, groupTaxRate: number): TcoResult {
  const env = o.env;
  const r = Math.pow(1 + o.waccPct / 100, 1 / 12) - 1;
  const months: MonthRow[] = [];
  let cum = 0;
  let npvIndia = 0;
  let npvOnshore = 0;
  let payback: number | null = null;
  let capexTotalInr = 0;
  const onshoreY1 = sites.reduce((a, s) => a + s.onshoreUsd.slice(0, 12).reduce((x, y) => x + y, 0), 0);
  const secondSite = sites.length > 1 ? OPEX.secondSiteOverheadInrYear / 12 : 0;

  for (let m = 0; m < MONTHS; m++) {
    const fx = fxAt(env, m);
    let comp = 0, re = 0, compute = 0, admin = secondSite, recruit = 0, capex = m === 0 ? OPEX.setupInr : 0, hc = 0, onshore = 0;
    for (const s of sites) {
      comp += s.comp[m];
      re += s.re[m];
      compute += s.compute[m];
      admin += s.admin[m];
      recruit += s.recruit[m];
      capex += s.capex[m];
      hc += s.hc[m];
      onshore += s.onshoreUsd[m];
    }
    capexTotalInr += capex;
    const opexBase = comp + re + compute + admin + recruit;
    const compliance = OPEX.complianceInrYear / 12 + markup * opexBase * groupTaxRate;
    const row = { comp, re, compute, admin, recruit, compliance, capex };
    const inr = Object.values(row).reduce((a, b) => a + b, 0);
    const usd = Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v / fx])) as Record<CostLine, number>;
    const total = inr / fx;
    const equivalence = OPEX.productivityStart + (OPEX.productivityMature - OPEX.productivityStart) * Math.min(1, m / OPEX.productivityRampMonths);
    const transition = m === 0 ? OPEX.transitionPctOfOnshoreY1 * onshoreY1 : 0;
    onshore *= equivalence;
    const savings = onshore - total - transition;
    cum += savings;
    if (payback === null && cum >= 0 && m > 0) payback = m;
    const disc = Math.pow(1 + r, -(m + 1));
    npvIndia += (total + transition) * disc;
    npvOnshore += onshore * disc;
    months.push({ month: m + 1, hc, ...usd, transition, total, onshore, savings, cumSavings: cum });
  }

  const years: YearRow[] = [];
  for (let y = 0; y < 5; y++) {
    const slice = months.slice(y * 12, y * 12 + 12);
    const acc = { year: y + 1, hc: slice[11].hc, total: 0, onshore: 0, savings: 0, cumSavings: slice[11].cumSavings } as YearRow;
    for (const k of COST_LINES) acc[k] = slice.reduce((a, row) => a + row[k], 0);
    acc.total = slice.reduce((a, row) => a + row.total, 0);
    acc.onshore = slice.reduce((a, row) => a + row.onshore, 0);
    acc.savings = acc.onshore - acc.total - slice.reduce((a, row) => a + row.transition, 0);
    years.push(acc);
  }

  // TCO_seat = Capex_amortised / N + C_comp + C_re + C_compute + C_admin + C_compliance (year 3)
  const y3 = years[2];
  const avgHc = months.slice(24, 36).reduce((a, x) => a + x.hc, 0) / 12;
  const fx3 = fxAt(env, 30);
  const capexAmortUsd = (capexTotalInr - OPEX.setupInr) / fx3 / RE.fitoutLifeYears + OPEX.setupInr / fx3 / 5;
  const costPerSeatY3Usd = avgHc > 0 ? (y3.total - y3.capex + capexAmortUsd) / avgHc : 0;

  return {
    months,
    years,
    totalUsd: months.reduce((a, x) => a + x.total, 0),
    transitionUsd: months[0].transition,
    onshoreUsd: months.reduce((a, x) => a + x.onshore, 0),
    npvIndiaUsd: npvIndia,
    npvOnshoreUsd: npvOnshore,
    npvSavingsUsd: npvOnshore - npvIndia,
    paybackMonth: payback,
    costPerSeatY3Usd,
    setupUsd: months[0].capex,
    reFeasible: sites.every((s) => s.reFeasible),
    y3: y3Base(sites),
  };
}

export interface ReModelComparison {
  pvUsd: Record<ReModel, number>;
  feasible: Record<ReModel, boolean>;
  best: ReModel;
  /** First month from which the warm-shell lease's cumulative PV stays below managed */
  crossoverMonth: number | null;
  /** Y3 headcount at which a warm-shell lease beats managed over 5 years */
  leaseBreakevenHc: number | null;
}

function rePv(site: SiteSpec, o: CostOptions, model: ReModel) {
  const seats = Array.from({ length: MONTHS }, (_, m) => sum(headcountAt(site.anchors, m, o.env.automation)) / o.seatingRatio);
  const f = realEstateFlows(site.market, seats, model, o.rentMode, o.env.rentEscAdd);
  const r = Math.pow(1 + o.waccPct / 100, 1 / 12) - 1;
  const cumPv: number[] = [];
  let acc = 0;
  for (let m = 0; m < MONTHS; m++) {
    acc += ((f.opex[m] + f.capex[m]) / fxAt(o.env, m)) * Math.pow(1 + r, -(m + 1));
    cumPv.push(acc);
  }
  const residualPv = (f.residual / fxAt(o.env, MONTHS)) * Math.pow(1 + r, -MONTHS);
  cumPv[MONTHS - 1] -= residualPv;
  return { pv: acc - residualPv, cumPv, feasible: f.feasible };
}

const scaleAnchors = (a: Anchors, k: number) =>
  Object.fromEntries(BANDS.map((b) => [b, { day1: a[b].day1 * k, y3: a[b].y3 * k, y5: a[b].y5 * k }])) as Anchors;

export function compareReModels(site: SiteSpec, o: CostOptions): ReModelComparison {
  const models: ReModel[] = ["managed", "warm-shell", "bare-shell", "self-built"];
  const res = Object.fromEntries(models.map((m) => [m, rePv(site, o, m)])) as Record<ReModel, ReturnType<typeof rePv>>;
  const pvUsd = Object.fromEntries(models.map((m) => [m, res[m].pv])) as Record<ReModel, number>;
  const feasible = Object.fromEntries(models.map((m) => [m, res[m].feasible])) as Record<ReModel, boolean>;
  const best = models.filter((m) => feasible[m]).sort((a, b) => pvUsd[a] - pvUsd[b])[0];

  const lease = res["warm-shell"].cumPv;
  const managed = res.managed.cumPv;
  let crossoverMonth: number | null = null;
  for (let m = MONTHS - 1; m >= 0; m--) {
    if (lease[m] <= managed[m]) crossoverMonth = m + 1;
    else break;
  }

  const y3 = BANDS.reduce((a, b) => a + site.anchors[b].y3, 0);
  const leaseWins = (k: number) => {
    const s = { ...site, anchors: scaleAnchors(site.anchors, k) };
    return rePv(s, o, "warm-shell").pv < rePv(s, o, "managed").pv;
  };
  let leaseBreakevenHc: number | null = null;
  if (leaseWins(20)) {
    let lo = 0.01;
    let hi = 20;
    if (leaseWins(lo)) leaseBreakevenHc = 0;
    else {
      for (let i = 0; i < 24; i++) {
        const mid = (lo + hi) / 2;
        if (leaseWins(mid)) hi = mid;
        else lo = mid;
      }
      leaseBreakevenHc = Math.round(hi * y3);
    }
  }
  return { pvUsd, feasible, best, crossoverMonth, leaseBreakevenHc };
}
