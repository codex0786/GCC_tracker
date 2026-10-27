"use client";

import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { FanChart } from "@/components/charts";
import { AlertList, Card, Kpi, PageTitle, Slider } from "@/components/ui";
import { MARKET_BY_ID } from "@/data/markets";
import { SIGNALS, type SignalKind } from "@/data/signals";
import { months, pct, usd } from "@/lib/format";
import { useEvaluation, useScenario, useStore } from "@/lib/store";
import { useMonteCarlo } from "@/lib/useMonteCarlo";

const KIND_LABEL: Record<SignalKind, string> = { cre: "Real estate", wage: "Compensation", policy: "State policy", automation: "AI displacement" };

function delta(a: number, b: number, invert = false) {
  const d = b - a;
  const good = invert ? d < 0 : d > 0;
  if (Math.abs(d) < 1) return <span className="text-muted">no change</span>;
  return <span className={good ? "text-good" : "text-bad"}>{d > 0 ? "+" : ""}{usd(d)} vs baseline</span>;
}

export default function StressTestPage() {
  const s = useScenario();
  const base = useEvaluation(false);
  const stressed = useEvaluation(true);
  const { setIn } = useStore.getState();
  const { result: mc, running } = useMonteCarlo(s);
  const b = base.financials.tco;
  const x = stressed.financials.tco;

  const toggle = (id: string) =>
    setIn("stress", { signals: s.stress.signals.includes(id) ? s.stress.signals.filter((v) => v !== id) : [...s.stress.signals, id] });

  const baseRank = Object.fromEntries(base.ranking.map((r) => [r.market.id, r.rank]));

  return (
    <>
      <PageTitle eyebrow="Path 3 · Module E" title="Stress-test the strategy">
        Every signal is a quantified input shock, not a headline. Toggle signals and macro shocks; the model reruns deterministically, and a 1,000-path Monte Carlo runs in a background worker.
      </PageTitle>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <Card title="Market signal feed">
            <ul className="space-y-2">
              {SIGNALS.map((sig) => {
                const on = s.stress.signals.includes(sig.id);
                const where = sig.markets === "all" ? "All markets" : sig.markets.map((m) => MARKET_BY_ID[m].name).join(", ");
                return (
                  <li key={sig.id}>
                    <label className={`block cursor-pointer rounded-lg border p-3 text-sm transition ${on ? "border-accent bg-accent-soft/50" : "border-line hover:border-accent/50"}`}>
                      <div className="flex items-start gap-2.5">
                        <input type="checkbox" checked={on} onChange={() => toggle(sig.id)} className="mt-1 h-4 w-4 accent-[var(--accent)]" />
                        <div>
                          <div className="flex flex-wrap gap-x-2 text-[11px] font-medium uppercase tracking-wide text-muted">
                            <span>{KIND_LABEL[sig.kind]}</span>
                            <span>{sig.date}</span>
                          </div>
                          <div className="font-medium">{sig.headline}</div>
                          <div className="mt-0.5 text-xs text-muted">{where}</div>
                          {on && <p className="mt-1.5 text-xs text-muted">{sig.detail}</p>}
                        </div>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-[11px] text-muted">Curated analyst feed (illustrative). Signals affect only the markets and functions they name.</p>
          </Card>
          <Card title="Macro shocks">
            <div className="space-y-3">
              <Slider label="INR move vs USD" value={s.stress.fxShockPct} min={-15} max={15} unit="%" format={(v) => `${v > 0 ? "+" : ""}${v}% ${v > 0 ? "(INR weaker)" : v < 0 ? "(INR stronger)" : ""}`} onChange={(fxShockPct) => setIn("stress", { fxShockPct })} />
              <Slider label="Extra wage inflation" value={s.stress.wageSpikePp} min={0} max={10} step={0.5} format={(v) => `+${v} pp`} onChange={(wageSpikePp) => setIn("stress", { wageSpikePp })} />
              <Slider label="Extra rent escalation" value={s.stress.rentEscPp} min={0} max={8} step={0.5} format={(v) => `+${v} pp`} onChange={(rentEscPp) => setIn("stress", { rentEscPp })} />
              <Slider label="Agentic AI displacement (L1–L2)" value={s.stress.automationPct} min={0} max={40} unit="%" onChange={(automationPct) => setIn("stress", { automationPct })} />
            </div>
          </Card>
        </div>

        <div className="min-w-0 space-y-4">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Kpi label="NPV savings (stressed)" num={x.npvSavingsUsd} format={usd} sub={delta(b.npvSavingsUsd, x.npvSavingsUsd)} tone={x.npvSavingsUsd > 0 ? undefined : "bad"} />
            <Kpi label="5-yr India cost" num={x.totalUsd} format={usd} sub={delta(b.totalUsd, x.totalUsd, true)} />
            <Kpi label="Payback" value={months(x.paybackMonth)} sub={`baseline ${months(b.paybackMonth)}`} />
            <Kpi label="Cost per seat (Y3)" num={x.costPerSeatY3Usd} format={(n) => usd(n, 0)} sub={delta(b.costPerSeatY3Usd, x.costPerSeatY3Usd, true)} />
          </div>

          <Card
            title={`Monte Carlo · cumulative savings, ${stressed.selected.name}`}
            info={{ label: "Monte Carlo", method: "1,000 seeded paths around the stressed case: FX drift N(2%, 3%) p.a., wage inflation ±2 pp, rent escalation ±1.5 pp, attrition ±3 pp, onshore inflation N(3.5%, 1%).", source: "Model output", asOf: "Live" }}
            action={running ? <span className="flex items-center gap-1 text-xs text-muted"><Loader2 size={12} className="animate-spin" /> Simulating</span> : null}
          >
            {mc ? (
              <>
                <FanChart p10={mc.p10} p50={mc.p50} p90={mc.p90} baseline={b.months.map((m) => m.cumSavings)} />
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div><div className="text-xs text-muted">NPV P10</div><div className="font-semibold">{usd(mc.npv.p10)}</div></div>
                  <div><div className="text-xs text-muted">NPV P90</div><div className="font-semibold">{usd(mc.npv.p90)}</div></div>
                  <div><div className="text-xs text-muted">P(payback ≤ 36 mo)</div><div className="font-semibold">{pct(mc.probPayback36)}</div></div>
                  <div><div className="text-xs text-muted">P(NPV &lt; 0)</div><div className={`font-semibold ${mc.probNegativeNpv > 0.05 ? "text-bad" : ""}`}>{pct(mc.probNegativeNpv, 1)}</div></div>
                </div>
              </>
            ) : (
              <div className="grid h-[280px] place-items-center text-sm text-muted">Running simulation…</div>
            )}
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card title="Ranking under stress">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs text-muted">
                    <th className="py-1.5 font-medium">Market</th>
                    <th className="py-1.5 text-right font-medium">Score</th>
                    <th className="py-1.5 text-right font-medium">Rank move</th>
                  </tr>
                </thead>
                <tbody>
                  {stressed.ranking.map((r) => {
                    const move = baseRank[r.market.id] - r.rank;
                    return (
                      <motion.tr layout transition={{ type: "spring", stiffness: 260, damping: 30 }} key={r.market.id} className="border-b border-line/60">
                        <td className="py-1.5">{r.rank}. {r.market.name}</td>
                        <td className="py-1.5 text-right tabular-nums">{r.score.toFixed(1)}</td>
                        <td className={`py-1.5 text-right ${move > 0 ? "text-good" : move < 0 ? "text-bad" : "text-muted"}`}>{move === 0 ? "—" : move > 0 ? `▲ ${move}` : `▼ ${-move}`}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
            <Card title="Advisory under stress">
              <AlertList alerts={stressed.alerts} />
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
