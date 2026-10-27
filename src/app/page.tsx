"use client";

import { ArrowRight, Calculator, MapPin, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { ScenarioPanel } from "@/components/ScenarioPanel";
import { AlertList, Card, Kpi } from "@/components/ui";
import { FUNCTIONS, ONSHORE_LABEL } from "@/data/benchmarks";
import { DATA_AS_OF } from "@/data/markets";
import { SIGNALS } from "@/data/signals";
import { months, usd } from "@/lib/format";
import { useEvaluation, useScenario } from "@/lib/store";

const PATHS = [
  { href: "/location", icon: MapPin, title: "Select my optimal location", body: "Rank 8 Indian micro-markets on your priorities, see the trade-offs and test hub-and-spoke splits." },
  { href: "/financials", icon: Calculator, title: "Build my 5-year financial model", body: "Bottom-up TCO, payback vs onshore, lease-vs-managed crossover, transfer pricing and Pillar Two." },
  { href: "/stress-test", icon: ShieldAlert, title: "Stress-test my current strategy", body: "Apply live market signals, wage and FX shocks, and AI displacement. Run 1,000 Monte Carlo paths." },
];

export default function Briefing() {
  const s = useScenario();
  const e = useEvaluation();
  const top = e.ranking[0];
  const t = e.financials.tco;
  return (
    <div className="space-y-8">
      <section className="pt-4 sm:pt-8">
        <div className="text-xs font-semibold uppercase tracking-wider text-accent">Executive briefing</div>
        <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">What decision are you validating today?</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Every view runs on the same scenario. Change the mandate once and the location ranking, financial model and stress test all update together.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {PATHS.map(({ href, icon: Icon, title, body }, i) => (
          <Link key={href} href={href} className="group rounded-xl border border-line bg-panel p-5 transition hover:border-accent">
            <div className="flex items-center justify-between">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent-soft text-accent">
                <Icon size={18} />
              </span>
              <span className="text-xs font-medium text-muted">Path {i + 1}</span>
            </div>
            <h2 className="mt-4 font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted">{body}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
              Open <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <ScenarioPanel showMix={false} />
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label="Top-ranked market" value={top.market.name} sub={`Score ${top.score.toFixed(1)} / 100`} />
            <Kpi label={`5-yr NPV savings vs ${ONSHORE_LABEL[s.macro.onshore]}`} value={usd(t.npvSavingsUsd)} tone={t.npvSavingsUsd > 0 ? "good" : "bad"} sub={`at ${e.selected.name}`} />
            <Kpi label="Payback" value={months(t.paybackMonth)} sub="incl. setup & knowledge transfer" />
            <Kpi label="Cost per seat (Y3)" value={usd(t.costPerSeatY3Usd, 0)} sub="fully loaded, per FTE p.a." />
          </div>
          <Card title={`Decision alerts · ${FUNCTIONS[s.fn].label} in ${e.selected.name}`}>
            <AlertList alerts={e.alerts} />
          </Card>
        </div>
      </div>

      <Card title="Latest market signals" action={<Link href="/stress-test" className="text-xs font-medium text-accent">Apply in stress test →</Link>}>
        <ul className="divide-y divide-line">
          {SIGNALS.slice()
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 4)
            .map((sig) => (
              <li key={sig.id} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-4">
                <span className="w-24 shrink-0 text-xs text-muted">{sig.date}</span>
                <span className="text-sm">{sig.headline}</span>
              </li>
            ))}
        </ul>
      </Card>

      <p className="text-xs text-muted">
        Benchmarks are indicative ({DATA_AS_OF}), compiled from public sources. Tax rules are flagged where recent Finance Acts may have revised them. Validate with licensed data and a tax adviser before committing capital.
      </p>
    </div>
  );
}
