import { TAX_RULES } from "@/data/taxRules";
import type { FunctionId, Market } from "@/data/types";

export interface TaxInput {
  market: Market;
  fn: FunctionId;
  /** Steady-state (year-3) annual operating cost base, INR */
  costBaseInr: number;
  payrollInr: number;
  tangibleAssetsInr: number;
  pillarTwoInScope: boolean;
  financialServicesGroup: boolean;
  domesticSalesPct: number;
  importedHardwareUsdM: number;
  fx: number;
}

export interface TaxResult {
  transactionInrCr: number;
  safeHarbourMarkup: number | null;
  markup: number;
  markupNote: string;
  ifsc: { applicable: boolean; eligible: boolean; reasons: string[] };
  indiaEtr: number;
  profitInr: number;
  indiaTaxInr: number;
  pillarTwo: { inScope: boolean; sbieInr: number; topUpRate: number; topUpInr: number; note: string };
  /** India tax + Pillar Two top-up as a share of the TP markup profit */
  groupRateOnProfit: number;
  sez: { recommendation: "SEZ" | "DTA"; dutySavedUsd: number; reasons: string[] };
}

export function adviseTax(t: TaxInput): TaxResult {
  // Transfer pricing: cost-plus on the operating cost base, safe harbour by transaction size.
  const prelimTxnCr = (t.costBaseInr * 1.155) / 1e7;
  const band = TAX_RULES.safeHarbourBands.value.find((b) => prelimTxnCr <= b.maxTxnInrCr);
  const markup = band?.markup ?? 0.18;
  const markupNote = band
    ? `Safe-harbour markup of ${(band.markup * 100).toFixed(1)}% applies (IT services, transaction ≤ ₹${band.maxTxnInrCr.toLocaleString("en-IN")} cr).`
    : `Transaction above the ₹2,000 cr safe-harbour ceiling: benchmark via a TP study or a fast-tracked APA; ${(markup * 100).toFixed(0)}% used as a conservative estimate.`;
  const profitInr = t.costBaseInr * markup;

  // GIFT City IFSC eligibility: financial services and group in-house centres of financial groups.
  const reasons: string[] = [];
  const applicable = t.market.ifsc;
  let eligible = false;
  if (applicable) {
    if (t.fn === "quant") {
      eligible = true;
      reasons.push("Quant/financial services activity is permitted for IFSC units.");
    } else if (t.financialServicesGroup && ["shared-services", "genai"].includes(t.fn)) {
      eligible = true;
      reasons.push("Global in-house centre of a financial-services group is a permitted IFSC activity.");
    } else {
      reasons.push("Activity is not a financial service and the group is not a financial-services group: IFSC tax holiday unavailable.");
    }
  }
  const indiaEtr = eligible ? TAX_RULES.ifscMat.value : TAX_RULES.corporateRate.value;
  if (eligible) {
    const h = TAX_RULES.ifscHoliday.value;
    reasons.push(`100% deduction for ${h.years} consecutive years out of ${h.window} (s.80LA); MAT at ${TAX_RULES.ifscMat.value * 100}% still applies.`);
  }
  const indiaTaxInr = profitInr * indiaEtr;

  // Pillar Two: top-up to 15% on profit above the substance-based income exclusion.
  const sbieInr = TAX_RULES.sbiePayrollPct.value * t.payrollInr + TAX_RULES.sbieAssetPct.value * t.tangibleAssetsInr;
  const topUpRate = t.pillarTwoInScope ? Math.max(0, TAX_RULES.pillarTwoMinRate.value - indiaEtr) : 0;
  const topUpInr = topUpRate * Math.max(0, profitInr - sbieInr);
  const note = !t.pillarTwoInScope
    ? "Group below the €750m revenue threshold: GloBE rules do not apply."
    : topUpRate === 0
      ? `India ETR ${(indiaEtr * 100).toFixed(2)}% exceeds the 15% minimum: no top-up.`
      : `India ETR ${(indiaEtr * 100).toFixed(1)}% is below 15%: top-up collected by the parent jurisdiction (IIR) unless India enacts a QDMTT. Holiday benefit is partly clawed back.`;

  // SEZ vs DTA: post-2020 SEZ units get no income-tax holiday; the residual benefit is duty-free capital imports.
  const dutySavedUsd = t.importedHardwareUsdM * 1e6 * TAX_RULES.sezCustomsDutyOnHardware.value;
  const sezReasons: string[] = ["No s.10AA income-tax holiday for SEZ units commencing after 31-Mar-2020.", "Export services are GST zero-rated under LUT in both SEZ and DTA."];
  const complianceUsd = (1.5e6 * 5) / t.fx;
  let recommendation: "SEZ" | "DTA" = "DTA";
  if (t.domesticSalesPct > 10) {
    sezReasons.push(`${t.domesticSalesPct}% domestic supply would be treated as imports into DTA, eroding SEZ value.`);
  } else if (dutySavedUsd > complianceUsd) {
    recommendation = "SEZ";
    sezReasons.push(`Duty-free import of ~$${(t.importedHardwareUsdM).toFixed(1)}M hardware saves ~$${(dutySavedUsd / 1e6).toFixed(2)}M, above ~$${(complianceUsd / 1e6).toFixed(2)}M 5-yr SEZ compliance cost (NFE, Softex, unit approvals).`);
  } else {
    sezReasons.push("Duty savings on imported hardware do not cover SEZ compliance overhead.");
  }
  if (!t.market.sezAvailable) recommendation = "DTA";

  return {
    transactionInrCr: (t.costBaseInr * (1 + markup)) / 1e7,
    safeHarbourMarkup: band?.markup ?? null,
    markup,
    markupNote,
    ifsc: { applicable, eligible, reasons },
    indiaEtr,
    profitInr,
    indiaTaxInr,
    pillarTwo: { inScope: t.pillarTwoInScope, sbieInr, topUpRate, topUpInr, note },
    groupRateOnProfit: profitInr > 0 ? (indiaTaxInr + topUpInr) / profitInr : 0,
    sez: { recommendation, dutySavedUsd, reasons: sezReasons },
  };
}
