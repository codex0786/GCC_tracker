"use client";

import { CostStackChart, CumulativeChart } from "@/components/charts";
import { ScenarioPanel } from "@/components/ScenarioPanel";
import { AlertList, Card, Kpi, PageTitle, Select, Slider, Toggle } from "@/components/ui";
import { BENCHMARK_META, COMPUTE_LABEL, ONSHORE_LABEL, RE_MODEL_LABEL } from "@/data/benchmarks";
import { DATA_AS_OF, MARKETS } from "@/data/markets";
import { TAX_RULES } from "@/data/taxRules";
import type { ComputeIntensity, MarketId, OnshoreLocation, ReModel } from "@/data/types";
import type { RentMode } from "@/engine/scenario";
import { COST_LINES, COST_LINE_LABEL } from "@/engine/tco";
import { months, pct, usd } from "@/lib/format";
import { useEvaluation, useScenario, useStore } from "@/lib/store";

const RE_MODELS: ReModel[] = ["managed", "warm-shell", "bare-shell", "self-built"];

export default function FinancialsPage() {
  const s = useScenario();
  const e = useEvaluation();
  const { set, setIn } = useStore.getState();
  const t = e.financials.tco;
  const tax = e.financials.tax;
  const re = e.reModels;
  const reMax = Math.max(...RE_MODELS.map((m) => re.pvUsd[m]));

  return (
    <>
      <PageTitle eyebrow="Path 2 · Module B + D" title="5-year TCO & unit economics">
        Monthly bottom-up model over 60 months. Headcount ramps by band, wages inflate by skill heat, rent escalates per lease terms, and transfer-pricing tax feeds back as a cost line. Reporting currency: USD.
      </PageTitle>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <Card title="Site & operating model">
            <div className="space-y-3">
              <Select<MarketId> label="Micro-market" value={s.marketId} options={MARKETS.map((m) => ({ value: m.id, label: m.name }))} onChange={(marketId) => set({ marketId })} />
              <Select<ReModel> label="Real-estate model" value={s.reModel} options={RE_MODELS.map((m) => ({ value: m, label: RE_MODEL_LABEL[m] }))} onChange={(reModel) => set({ reModel })} />
              <Select<ComputeIntensity> label="Compute intensity" value={s.compute} options={(Object.keys(COMPUTE_LABEL) as ComputeIntensity[]).map((c) => ({ value: c, label: COMPUTE_LABEL[c] }))} onChange={(compute) => set({ compute })} />
              <Slider label="Hybrid seating ratio" value={s.seatingRatio} min={1} max={1.6} step={0.05} format={(v) => `${v.toFixed(2)} FTE/desk`} onChange={(seatingRatio) => set({ seatingRatio })} />
            </div>
          </Card>
          <Card title="Macro assumptions">
            <div className="space-y-3">
              <Slider label="USD/INR" value={s.macro.fxInrPerUsd} min={80} max={100} step={0.5} format={(v) => `₹${v.toFixed(1)}`} onChange={(fxInrPerUsd) => setIn("macro", { fxInrPerUsd })} />
              <Slider label="Wage inflation · hot skills" value={s.macro.wageInflHotPct} min={4} max={20} step={0.5} unit="%" onChange={(wageInflHotPct) => setIn("macro", { wageInflHotPct })} />
              <Slider label="Wage inflation · general" value={s.macro.wageInflGeneralPct} min={3} max={15} step={0.5} unit="%" onChange={(wageInflGeneralPct) => setIn("macro", { wageInflGeneralPct })} />
              <Select<RentMode>
                label="Rent escalation"
                value={s.macro.rentMode}
                options={[
                  { value: "market", label: "Market-typical (≈4.5–5.5% p.a.)" },
                  { value: "triennial", label: "15% every 3 years" },
                  { value: "annual9", label: "9% annual" },
                ]}
                onChange={(rentMode) => setIn("macro", { rentMode })}
              />
              <Slider label="Discount rate (WACC)" value={s.macro.waccPct} min={5} max={16} step={0.5} unit="%" onChange={(waccPct) => setIn("macro", { waccPct })} />
              <Select<OnshoreLocation> label="Onshore comparator" value={s.macro.onshore} options={(Object.keys(ONSHORE_LABEL) as OnshoreLocation[]).map((o) => ({ value: o, label: ONSHORE_LABEL[o] }))} onChange={(onshore) => setIn("macro", { onshore })} />
            </div>
          </Card>
          <Card title="Tax profile">
            <div className="space-y-3">
              <Toggle label="Group revenue ≥ €750m (Pillar Two)" checked={s.tax.pillarTwoInScope} onChange={(pillarTwoInScope) => setIn("tax", { pillarTwoInScope })} />
              <Toggle label="Financial-services group" checked={s.tax.financialServicesGroup} onChange={(financialServicesGroup) => setIn("tax", { financialServicesGroup })} />
              <Slider label="Domestic (India) supply" value={s.tax.domesticSalesPct} min={0} max={50} unit="%" onChange={(domesticSalesPct) => setIn("tax", { domesticSalesPct })} />
              <Slider label="Imported hardware capex" value={s.tax.importedHardwareUsdM} min={0} max={20} step={0.5} format={(v) => `$${v}M`} onChange={(importedHardwareUsdM) => setIn("tax", { importedHardwareUsdM })} />
            </div>
          </Card>
          <ScenarioPanel />
        </div>

        <div className="min-w-0 space-y-4">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Kpi label="5-yr India cash cost" num={t.totalUsd} format={usd} sub={`vs ${usd(t.onshoreUsd)} onshore-equivalent`} info={BENCHMARK_META.ctc} />
            <Kpi label="NPV of savings" num={t.npvSavingsUsd} format={usd} tone={t.npvSavingsUsd > 0 ? "good" : "bad"} sub={`at ${s.macro.waccPct}% WACC vs ${ONSHORE_LABEL[s.macro.onshore]}`} info={BENCHMARK_META.onshore} />
            <Kpi label="Payback" value={months(t.paybackMonth)} sub={`setup ${usd(t.setupUsd)} + transition ${usd(t.transitionUsd)}`} info={BENCHMARK_META.productivity} />
            <Kpi
              label="TCO per seat (Y3)"
              num={t.costPerSeatY3Usd}
              format={(n) => usd(n, 0)}
              sub="per FTE p.a., capex amortised"
              info={{ label: "TCO per seat", method: "Capex_amortised / N + comp + real estate + compute + SG&A + compliance, year-3 average headcount", source: "Model output", asOf: DATA_AS_OF }}
            />
          </div>

          <Card title="Annual cash cost by category" info={BENCHMARK_META.re}>
            <CostStackChart years={t.years} />
          </Card>

          <Card title="Cumulative savings vs keeping the work onshore" info={BENCHMARK_META.productivity}>
            <CumulativeChart months={t.months} payback={t.paybackMonth} />
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card title="Capital structure: lease vs managed" info={{ label: "Real-estate model comparison", method: "PV of 5-yr real-estate cash flows at WACC, net of undepreciated fit-out (7-yr life) or campus (25-yr life) value at month 60. Leases carry a 20k sq.ft minimum and ₹6.5 lakh/month in-house facility cost.", source: BENCHMARK_META.re.source, asOf: DATA_AS_OF }}>
              <ul className="space-y-2">
                {RE_MODELS.map((m) => (
                  <li key={m} className="text-sm">
                    <div className="flex justify-between">
                      <span className={m === re.best ? "font-semibold" : ""}>
                        {RE_MODEL_LABEL[m]} {m === re.best && <span className="ml-1 text-xs text-good">Lowest PV</span>}
                        {!re.feasible[m] && <span className="ml-1 text-xs text-bad">Below scale</span>}
                      </span>
                      <span className="tabular-nums">{usd(re.pvUsd[m], 2)}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-panel-2">
                      <div className="h-1.5 rounded-full" style={{ width: `${(re.pvUsd[m] / reMax) * 100}%`, background: m === s.reModel ? "var(--series-1)" : "var(--muted)", opacity: m === s.reModel ? 1 : 0.45 }} />
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm">
                {re.crossoverMonth === null ? (
                  <>Over 5 years a warm-shell lease never becomes cheaper than managed space on a cumulative PV basis.</>
                ) : (
                  <>
                    <b>Crossover: month {re.crossoverMonth}.</b> From here the warm-shell lease&apos;s cumulative PV stays below managed space
                    {re.crossoverMonth === 60 ? " (only once residual fit-out value is credited at exit)" : ""}.
                  </>
                )}
              </p>
              <p className="mt-1.5 text-sm text-muted">
                {re.leaseBreakevenHc === null
                  ? "A warm-shell lease does not beat managed space at any realistic scale in this market."
                  : re.leaseBreakevenHc === 0
                    ? "A warm-shell lease beats managed space at any scale here."
                    : `A warm-shell lease beats managed space once year-3 headcount exceeds ~${re.leaseBreakevenHc.toLocaleString()} (you plan ${s.headcount.y3.toLocaleString()}).`}
              </p>
            </Card>

            <Card title="Tax & transfer pricing">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted">TP transaction (Y3)</dt>
                <dd className="text-right tabular-nums">₹{tax.transactionInrCr.toFixed(0)} cr</dd>
                <dt className="text-muted">Cost-plus markup</dt>
                <dd className="text-right tabular-nums">{pct(tax.markup)}</dd>
                <dt className="text-muted">India ETR</dt>
                <dd className="text-right tabular-nums">{pct(tax.indiaEtr, 2)}</dd>
                <dt className="text-muted">Pillar Two top-up (Y3)</dt>
                <dd className={`text-right tabular-nums ${tax.pillarTwo.topUpInr > 0 ? "text-warn" : ""}`}>{usd(tax.pillarTwo.topUpInr / s.macro.fxInrPerUsd)}</dd>
                <dt className="text-muted">Zone recommendation</dt>
                <dd className="text-right font-medium">{tax.sez.recommendation}</dd>
              </dl>
              <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-muted">
                <li>{tax.markupNote}</li>
                <li>{tax.pillarTwo.note}</li>
                {tax.ifsc.reasons.map((r) => <li key={r}>{r}</li>)}
                {tax.sez.reasons.map((r) => <li key={r}>{r}</li>)}
              </ul>
              <p className="mt-2 text-[11px] text-muted">
                Rules: {TAX_RULES.safeHarbourBands.basis}; {TAX_RULES.ifscHoliday.basis}. Items marked for verification may have been revised by recent Finance Acts.
              </p>
            </Card>
          </div>

          <Card title="Five-year cash flow (USD)">
            <div className="-mx-4 overflow-x-auto px-4">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-line text-right text-xs text-muted">
                    <th className="py-2 text-left font-medium">Line</th>
                    {t.years.map((y) => <th key={y.year} className="py-2 font-medium">Y{y.year}</th>)}
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  <tr className="border-b border-line/60 text-right">
                    <td className="py-1.5 text-left text-muted">Headcount (year-end)</td>
                    {t.years.map((y) => <td key={y.year}>{Math.round(y.hc)}</td>)}
                  </tr>
                  {COST_LINES.map((k) => (
                    <tr key={k} className="border-b border-line/60 text-right">
                      <td className="py-1.5 text-left">{COST_LINE_LABEL[k]}</td>
                      {t.years.map((y) => <td key={y.year}>{usd(y[k], 2)}</td>)}
                    </tr>
                  ))}
                  <tr className="border-b border-line text-right font-semibold">
                    <td className="py-1.5 text-left">Total India cost</td>
                    {t.years.map((y) => <td key={y.year}>{usd(y.total, 2)}</td>)}
                  </tr>
                  <tr className="text-right text-good">
                    <td className="py-1.5 text-left">Net savings vs onshore</td>
                    {t.years.map((y) => <td key={y.year}>{usd(y.savings, 2)}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Alerts">
            <AlertList alerts={e.alerts} />
          </Card>
        </div>
      </div>
    </>
  );
}
