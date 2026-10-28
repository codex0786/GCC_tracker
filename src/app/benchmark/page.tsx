"use client";

import { motion } from "motion/react";
import { ArrowRight, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CountUp } from "@/components/motion";
import { Card, PageTitle, Select, Slider } from "@/components/ui";
import { COMPUTE_LABEL, FUNCTIONS, RE_MODEL_LABEL } from "@/data/benchmarks";
import { MARKETS } from "@/data/markets";
import { BANDS, FUNCTION_IDS, type ComputeIntensity, type FunctionId, type MarketId, type ReModel } from "@/data/types";
import { BENCH_LABEL, BENCH_LINES, benchmark, modelAnnualCosts, type BenchLine, type BenchmarkInput, type Currency, type Status } from "@/engine/benchmark";
import { DEFAULT_SCENARIO, rebalance } from "@/engine/scenario";

// Users type in thousands of dollars or lakhs of rupees; the engine works in whole units.
const UNIT: Record<Currency, { factor: number; label: string; fmt: (n: number) => string }> = {
  USD: { factor: 1e3, label: "$ thousand / year", fmt: (n) => `$${(n / 1e6).toFixed(2)}M` },
  INR: { factor: 1e5, label: "₹ lakh / year", fmt: (n) => `₹${(n / 1e7).toFixed(2)} cr` },
};
const STATUS: Record<Status, { label: string; cls: string }> = {
  "in-line": { label: "In line", cls: "bg-good/10 text-good" },
  above: { label: "Above", cls: "bg-bad/10 text-bad" },
  below: { label: "Below", cls: "bg-accent-soft text-accent" },
};
const EXAMPLE: Record<BenchLine, number> = { comp: 1.04, re: 1.35, compute: 0.82, admin: 1.08, recruit: 1.6 };

export default function BenchmarkPage() {
  const [input, setInput] = useState<Omit<BenchmarkInput, "actual">>({
    marketId: "blr-orr",
    fn: "genai",
    headcount: 350,
    mix: DEFAULT_SCENARIO.mix.y3,
    reModel: "managed",
    compute: "hpc",
    seatingRatio: 1.3,
    currency: "USD",
    fxInrPerUsd: DEFAULT_SCENARIO.macro.fxInrPerUsd,
  });
  const [typed, setTyped] = useState<Partial<Record<BenchLine, string>>>({});
  const unit = UNIT[input.currency];
  const actual = Object.fromEntries(
    Object.entries(typed)
      .filter(([, v]) => v !== "" && Number(v) > 0)
      .map(([k, v]) => [k, Number(v) * unit.factor]),
  ) as Partial<Record<BenchLine, number>>;
  const result = useMemo(() => benchmark({ ...input, actual }), [input, JSON.stringify(actual)]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (patch: Partial<typeof input>) => setInput((s) => ({ ...s, ...patch }));

  function fillExample() {
    const m = modelAnnualCosts({ ...input, actual: {} });
    setTyped(Object.fromEntries(BENCH_LINES.map((l) => [l, String(Math.round((m[l] * EXAMPLE[l]) / unit.factor))])));
  }

  function switchCurrency(currency: Currency) {
    const from = UNIT[input.currency];
    const to = UNIT[currency];
    const rate = currency === "INR" ? input.fxInrPerUsd : 1 / input.fxInrPerUsd;
    setTyped(Object.fromEntries(Object.entries(typed).map(([k, v]) => [k, v ? String(Math.round((Number(v) * from.factor * rate) / to.factor)) : ""])));
    set({ currency });
  }

  const max = Math.max(...result.rows.map((r) => Math.max(r.model, r.actual ?? 0)), 1);
  const d = result.deltaPct;

  return (
    <>
      <PageTitle eyebrow="Tools · Benchmark" title="Benchmark my GCC">
        Enter what your centre actually spends and see each cost line against the model for the same team, function and city.
      </PageTitle>
      <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-good/30 bg-good/5 p-3 text-sm">
        <Lock size={16} className="mt-0.5 shrink-0 text-good" />
        <span>Your numbers stay in this browser tab. Nothing is uploaded, stored or added to the share link, and there is no sign-up.</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <Card title="Your centre">
            <div className="space-y-3">
              <Select<MarketId> label="Location" value={input.marketId} options={MARKETS.map((m) => ({ value: m.id, label: m.name }))} onChange={(marketId) => set({ marketId })} />
              <Select<FunctionId> label="Main function" value={input.fn} options={FUNCTION_IDS.map((id) => ({ value: id, label: FUNCTIONS[id].label }))} onChange={(fn) => set({ fn, compute: FUNCTIONS[fn].defaultCompute })} />
              <Slider label="Headcount today" value={input.headcount} min={20} max={3000} step={10} onChange={(headcount) => set({ headcount })} />
              <div className="space-y-2 pt-1">
                <div className="text-xs font-semibold text-muted">Seniority mix</div>
                {BANDS.map((b) => (
                  <Slider key={b} label={b} value={input.mix[b]} min={0} max={80} unit="%" onChange={(v) => set({ mix: rebalance(input.mix, b, v) })} />
                ))}
              </div>
              <Select<ReModel> label="Office" value={input.reModel} options={(["managed", "warm-shell", "bare-shell"] as ReModel[]).map((m) => ({ value: m, label: RE_MODEL_LABEL[m] }))} onChange={(reModel) => set({ reModel })} />
              <Select<ComputeIntensity> label="Compute" value={input.compute} options={(Object.keys(COMPUTE_LABEL) as ComputeIntensity[]).map((c) => ({ value: c, label: COMPUTE_LABEL[c] }))} onChange={(compute) => set({ compute })} />
              <Slider label="People per desk" value={input.seatingRatio} min={1} max={1.6} step={0.05} format={(v) => v.toFixed(2)} onChange={(seatingRatio) => set({ seatingRatio })} />
            </div>
          </Card>

          <Card
            title="Actual annual costs"
            action={
              <div role="radiogroup" aria-label="Currency" className="flex rounded-md border border-line p-0.5 text-xs">
                {(["USD", "INR"] as Currency[]).map((c) => (
                  <button key={c} role="radio" aria-checked={input.currency === c} onClick={() => switchCurrency(c)} className={`rounded px-2 py-0.5 ${input.currency === c ? "bg-accent-soft font-medium text-accent" : "text-muted"}`}>
                    {c}
                  </button>
                ))}
              </div>
            }
          >
            <p className="mb-3 text-xs text-muted">In {unit.label}. Leave a line blank to skip it.</p>
            <div className="space-y-2.5">
              {BENCH_LINES.map((l) => (
                <label key={l} className="grid grid-cols-[1fr_120px] items-center gap-3 text-sm">
                  <span>{BENCH_LABEL[l]}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    aria-label={`Actual ${BENCH_LABEL[l]}`}
                    placeholder={String(Math.round(result.rows.find((r) => r.line === l)!.model / unit.factor))}
                    value={typed[l] ?? ""}
                    onChange={(e) => setTyped((t) => ({ ...t, [l]: e.target.value }))}
                    className="w-full rounded-lg border border-line bg-panel px-2.5 py-1.5 text-right tabular-nums focus:border-accent focus:outline-none"
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={fillExample} className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs hover:border-accent">
                <Sparkles size={13} /> Try an example
              </button>
              <button onClick={() => setTyped({})} className="rounded-md px-3 py-1.5 text-xs text-muted hover:text-ink">Clear</button>
            </div>
            <p className="mt-3 text-[11px] text-muted">Placeholders show the model&apos;s estimate for each line.</p>
          </Card>
        </div>

        <div className="min-w-0 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div role="group" aria-label="Versus model" className="rounded-xl border border-line bg-panel p-4">
              <div className="text-xs font-medium text-muted">Your entered costs vs model</div>
              <div className={`mt-1 text-2xl font-semibold ${d === undefined ? "text-muted" : Math.abs(d) <= 0.1 ? "text-good" : d > 0 ? "text-bad" : "text-accent"}`}>
                {d === undefined ? "Enter costs" : <CountUp value={d * 100} format={(n) => `${n > 0 ? "+" : ""}${n.toFixed(0)}%`} />}
              </div>
              <div className="mt-0.5 text-xs text-muted">±10% counts as in line</div>
            </div>
            <div className="rounded-xl border border-line bg-panel p-4">
              <div className="text-xs font-medium text-muted">Model cost per FTE</div>
              <div className="mt-1 text-2xl font-semibold"><CountUp value={result.modelPerFte} format={(n) => (input.currency === "USD" ? `$${Math.round(n / 1e3)}K` : `₹${(n / 1e5).toFixed(1)} L`)} /></div>
              <div className="mt-0.5 text-xs text-muted">per year, excl. setup and tax</div>
            </div>
            <div className="rounded-xl border border-line bg-panel p-4">
              <div className="text-xs font-medium text-muted">Your cost per FTE</div>
              <div className="mt-1 text-2xl font-semibold">
                {result.actualPerFte === undefined ? <span className="text-muted">Fill all 5 lines</span> : <CountUp value={result.actualPerFte} format={(n) => (input.currency === "USD" ? `$${Math.round(n / 1e3)}K` : `₹${(n / 1e5).toFixed(1)} L`)} />}
              </div>
              <div className="mt-0.5 text-xs text-muted">from your entries</div>
            </div>
          </div>

          <Card title="Line by line">
            <ul className="space-y-4">
              {result.rows.map((r) => (
                <li key={r.line}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{BENCH_LABEL[r.line]}</span>
                    {r.status ? (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS[r.status].cls}`}>
                        {STATUS[r.status].label} {r.deltaPct! > 0 ? "+" : ""}{Math.round(r.deltaPct! * 100)}%
                      </span>
                    ) : (
                      <span className="text-xs text-muted">not entered</span>
                    )}
                  </div>
                  <div className="grid grid-cols-[64px_1fr_90px] items-center gap-2 text-xs">
                    <span className="text-muted">Model</span>
                    <span className="h-2.5 overflow-hidden rounded-full bg-panel-2">
                      <motion.span className="block h-full rounded-full bg-[var(--series-1)]" initial={false} animate={{ width: `${(r.model / max) * 100}%` }} transition={{ type: "spring", stiffness: 220, damping: 30 }} />
                    </span>
                    <span className="text-right tabular-nums">{unit.fmt(r.model)}</span>
                    <span className="text-muted">Yours</span>
                    <span className="h-2.5 overflow-hidden rounded-full bg-panel-2">
                      <motion.span className="block h-full rounded-full bg-[var(--series-2)]" initial={false} animate={{ width: `${((r.actual ?? 0) / max) * 100}%` }} transition={{ type: "spring", stiffness: 220, damping: 30 }} />
                    </span>
                    <span className="text-right tabular-nums">{r.actual ? unit.fmt(r.actual) : "–"}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card title="What stands out">
              {result.insights.length === 0 ? (
                <p className="text-sm text-muted">Enter at least one cost line, or try the example, to see where you differ from the model.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {result.insights.map((s) => (
                    <li key={s} className="rounded-lg border border-line p-3">{s}</li>
                  ))}
                </ul>
              )}
            </Card>
            <Card title="Same team elsewhere (model)">
              <ul className="space-y-2 text-sm">
                {result.alternatives.map((a) => (
                  <li key={a.marketId} className="flex items-center justify-between gap-3">
                    <Link href={`/financials?market=${a.marketId}`} className="hover:text-accent">{a.name}</Link>
                    <span className={`tabular-nums ${a.vsCurrentPct < 0 ? "text-good" : "text-muted"}`}>{a.vsCurrentPct > 0 ? "+" : ""}{Math.round(a.vsCurrentPct * 100)}% per FTE</span>
                  </li>
                ))}
              </ul>
              <Link href="/markets" className="mt-3 inline-flex items-center gap-1 text-sm text-accent">
                Compare cities <ArrowRight size={14} />
              </Link>
            </Card>
          </div>
          <p className="text-xs text-muted">
            The model is a steady-state estimate for the next 12 months using this site&apos;s indicative benchmarks (see Methodology). A gap is a prompt to investigate, not a verdict.
          </p>
        </div>
      </div>
    </>
  );
}
