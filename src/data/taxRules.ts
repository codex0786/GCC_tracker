// Every rule carries its legal basis and an effective date. Values flagged
// `verify` have been revised or proposed for revision in recent Finance Acts
// and must be confirmed by a tax adviser before use in a real decision.

export interface Rule<T> {
  value: T;
  basis: string;
  effective: string;
  verify?: boolean;
}

export const TAX_RULES = {
  corporateRate: { value: 0.2517, basis: "Income-tax Act s.115BAA (22% + 10% surcharge + 4% cess)", effective: "AY 2020-21 onwards" } as Rule<number>,
  pillarTwoMinRate: { value: 0.15, basis: "OECD GloBE Model Rules (Pillar Two)", effective: "Group revenue ≥ €750m" } as Rule<number>,
  pillarTwoRevenueThresholdEurM: { value: 750, basis: "GloBE Art. 1.1", effective: "2024 onwards" } as Rule<number>,
  sbiePayrollPct: { value: 0.05, basis: "GloBE Art. 5.3 substance-based income exclusion (post-transition)", effective: "Transition ends 2033" } as Rule<number>,
  sbieAssetPct: { value: 0.05, basis: "GloBE Art. 5.3", effective: "Transition ends 2033" } as Rule<number>,
  safeHarbourBands: {
    value: [{ maxTxnInrCr: 2000, markup: 0.155 }],
    basis: "Finance Act 2026 (Union Budget 2026-27): unified 'IT Services' safe harbour at 15.5% on cost, eligibility up to INR 2,000 cr, automated approval valid for 5 years; operative rules via CBDT notification",
    effective: "FY 2026-27 onwards",
    verify: true,
  } as Rule<{ maxTxnInrCr: number; markup: number }[]>,
  ifscHoliday: { value: { years: 10, window: 15, deduction: 1 }, basis: "Income-tax Act s.80LA(1A) — IFSC units", effective: "Units commencing on/before 31-Mar-2030", verify: true } as Rule<{ years: number; window: number; deduction: number }>,
  ifscMat: { value: 0.09, basis: "s.115JB(7) — MAT for IFSC units not opting s.115BAA", effective: "Current" } as Rule<number>,
  sez10aa: { value: false, basis: "s.10AA sunset — no income-tax holiday for SEZ units commencing after 31-Mar-2020", effective: "FY 2020-21 onwards" } as Rule<boolean>,
  sezCustomsDutyOnHardware: { value: 0.15, basis: "SEZ Act 2005 s.26 — duty-free import of capital goods (avg. effective BCD+SWS on IT hardware)", effective: "Current" } as Rule<number>,
  deshBill: { value: "pending", basis: "Development of Enterprise and Service Hubs (DESH) Bill — not enacted", effective: "Pending", verify: true } as Rule<string>,
};
