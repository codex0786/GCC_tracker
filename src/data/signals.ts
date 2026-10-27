import type { Band, FunctionId, MarketId } from "./types";

export type SignalKind = "cre" | "wage" | "policy" | "automation";

export interface SignalShock {
  /** Added to the market's annual rent escalation, percentage points */
  rentEscalationPp?: number;
  /** Added to vacancy, percentage points */
  vacancyPp?: number;
  /** One-off compensation step-up for the function in affected markets, fraction */
  wageStepUp?: number;
  /** Added to the incentive score, points */
  incentivePts?: number;
  /** Share of headcount in the given bands displaced by agentic AI from year 2 */
  automation?: { bands: Band[]; pct: number };
}

export interface Signal {
  id: string;
  date: string;
  kind: SignalKind;
  markets: MarketId[] | "all";
  functions?: FunctionId[];
  headline: string;
  detail: string;
  shock: SignalShock;
}

// Curated, illustrative signal feed. Not a live data source: entries are
// added by an analyst and each one is expressed as a quantified input shock.
export const SIGNALS: Signal[] = [
  {
    id: "hyd-absorption",
    date: "2026-09-18",
    kind: "cre",
    markets: ["hyd-fd"],
    headline: "350k sq.ft pre-commitment by a US chipmaker in Hyderabad FD",
    detail: "Large-block absorption lowers submarket vacancy toward ~4%. Expected 12-month rental escalation revised from ~5% to ~8.5%. Consider locking pre-commitments or evaluating HITEC City Phase 2.",
    shock: { rentEscalationPp: 3.5, vacancyPp: -5 },
  },
  {
    id: "sdv-wage-spike",
    date: "2026-08-30",
    kind: "wage",
    markets: ["pune-hinjawadi", "chennai-omr", "blr-orr"],
    functions: ["auto-sdv"],
    headline: "+28% offer inflation for autonomous-driving simulation engineers",
    detail: "Three OEM GCCs competing for the same simulation and ADAS validation talent pool are pushing counter-offers well above budget.",
    shock: { wageStepUp: 0.28 },
  },
  {
    id: "genai-poaching",
    date: "2026-10-05",
    kind: "wage",
    markets: ["blr-orr", "blr-north", "hyd-fd"],
    functions: ["genai"],
    headline: "Applied-AI architect compensation up ~18% in six months",
    detail: "Frontier-lab and hyperscaler India hubs expanding applied-AI teams; L5+ ML engineers seeing double-digit counter-offers.",
    shock: { wageStepUp: 0.18 },
  },
  {
    id: "tn-gcc-policy",
    date: "2026-07-12",
    kind: "policy",
    markets: ["chennai-omr", "coimbatore"],
    headline: "Tamil Nadu expands GCC payroll subsidy to Tier-2 cities",
    detail: "Enhanced employment-linked incentive and stamp-duty reimbursement for GCCs locating in Coimbatore and other Tier-2 cities.",
    shock: { incentivePts: 10 },
  },
  {
    id: "agentic-ops",
    date: "2026-10-15",
    kind: "automation",
    markets: "all",
    functions: ["shared-services", "quant", "pharma-bio"],
    headline: "Agentic AI absorbing L1–L2 operations workloads",
    detail: "Enterprise deployments of agentic workflows reducing entry-level operations and reporting headcount needs by 15–25% from year 2.",
    shock: { automation: { bands: ["L1-L2"], pct: 0.2 } },
  },
  {
    id: "blr-north-supply",
    date: "2026-06-20",
    kind: "cre",
    markets: ["blr-north"],
    headline: "4.5 msf new Grade-A supply delivered in Bengaluru North",
    detail: "Supply wave raises vacancy and gives tenants leverage on escalation clauses and rent-free periods.",
    shock: { rentEscalationPp: -1, vacancyPp: 4 },
  },
];
