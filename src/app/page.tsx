"use client";

import { motion } from "motion/react";
import { ArrowDown, ArrowRight, Calculator, Clock, DollarSign, MapPin, PiggyBank, ShieldAlert, Users } from "lucide-react";
import Link from "next/link";
import { CumulativeChart } from "@/components/charts";
import { IndiaMap } from "@/components/home/IndiaMap";
import { CostComposition, Fade, HeadcountPyramid, LiveDot, RankingRace, ScoreRing, SignalTicker, StatTile } from "@/components/home/widgets";
import { CountUp, Reveal } from "@/components/motion";
import { AlertList, Card, Select } from "@/components/ui";
import { FUNCTIONS, ONSHORE_LABEL } from "@/data/benchmarks";
import { DATA_AS_OF } from "@/data/markets";
import { FUNCTION_IDS, type FunctionId, type MarketId, type OnshoreLocation } from "@/data/types";
import { PRESETS, PRIORITY_MODES } from "@/engine/presets";
import { CRITERIA, anchorsFromScenario, type Scenario } from "@/engine/scenario";
import { CRITERION_DEFS } from "@/engine/mcda";
import { int, months, pct, usd } from "@/lib/format";
import { useEvaluation, useScenario, useStore } from "@/lib/store";

const PATHS = [
  { href: "/location", icon: MapPin, title: "Select my optimal location", body: "Rank 8 Indian micro-markets on your priorities, see the trade-offs and test hub-and-spoke splits." },
  { href: "/financials", icon: Calculator, title: "Build my 5-year financial model", body: "Bottom-up TCO, payback vs onshore, lease-vs-managed crossover, transfer pricing and Pillar Two." },
  { href: "/stress-test", icon: ShieldAlert, title: "Stress-test my current strategy", body: "Apply market signals, wage and FX shocks, and AI displacement. Run 1,000 Monte Carlo paths." },
];

const sameJson = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const withoutStress = (s: Scenario) => ({ ...s, stress: null });

export default function Briefing() {
  const s = useScenario();
  const e = useEvaluation();
  const { set, setIn, replace } = useStore.getState();
  const top = e.ranking[0];
  const t = e.financials.tco;
  const preset = PRESETS.find((p) => sameJson(withoutStress(p.scenario), withoutStress(s)));
  const mode = PRIORITY_MODES.find((m) => sameJson(m.weights, s.weights));
  const savedShare = 1 - t.totalUsd / (t.onshoreUsd || 1);
  const select = (marketId: MarketId) => set({ marketId });

  function scaleTo(y5: number) {
    const k = y5 / (s.headcount.y5 || 1);
    setIn("headcount", { day1: Math.max(5, Math.round(s.headcount.day1 * k)), y3: Math.round(s.headcount.y3 * k), y5 });
  }

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative -mx-4 overflow-hidden border-b border-line px-4 pb-6 pt-8 sm:mx-0 sm:rounded-3xl sm:border sm:px-8 sm:pt-12">
        <div className="aurora" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-line bg-panel/70 px-3 py-1 text-xs font-medium backdrop-blur">
              <LiveDot /> Executive briefing · model recalculates as you type
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl"
            >
              What decision are you <span className="shine">validating today?</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-4 max-w-xl text-muted">
              One scenario drives every engine: site ranking, 5-year TCO, talent ceiling, tax and stress tests. Pick a mandate below and watch the whole case move.
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6 flex flex-wrap gap-3">
              <a href="#cockpit" className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-xl">
                Open the live cockpit <ArrowDown size={15} />
              </a>
              <Link href="/financials" className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel/70 px-4 py-2.5 text-sm font-medium backdrop-blur transition hover:border-accent">
                Jump to the 5-year model <ArrowRight size={15} />
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-line bg-panel/80 p-5 shadow-xl shadow-accent/10 backdrop-blur"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-muted">Current verdict</div>
            <div className="mt-3 flex items-center gap-5">
              <ScoreRing score={top.score} />
              <div className="min-w-0">
                <div className="text-xs text-muted">Recommended anchor</div>
                <div className="text-xl font-semibold leading-tight">
                  <Fade k={top.market.id}>{top.market.name}</Fade>
                </div>
                <div className="mt-1 text-xs text-muted">
                  {FUNCTIONS[s.fn].label} · {int(s.headcount.y5)} FTE by Y5
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
              <div>
                <div className="text-[11px] text-muted">NPV savings</div>
                <div className="font-semibold text-good"><CountUp value={t.npvSavingsUsd} format={(n) => usd(n)} /></div>
              </div>
              <div>
                <div className="text-[11px] text-muted">Payback</div>
                <div className="font-semibold">{months(t.paybackMonth)}</div>
              </div>
              <div>
                <div className="text-[11px] text-muted">Cost / seat</div>
                <div className="font-semibold"><CountUp value={t.costPerSeatY3Usd} format={(n) => usd(n, 0)} /></div>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="relative z-10 mt-8 border-t border-line/70">
          <SignalTicker />
        </div>
      </section>

      {/* Cockpit */}
      <section id="cockpit" className="scroll-mt-20 space-y-4">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
                <LiveDot /> Live scenario dashboard
              </div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                <Fade k={preset?.id ?? "custom"}>{preset ? preset.label : "Custom scenario"}</Fade>
              </h2>
              <p className="text-sm text-muted">
                Modelled at {e.selected.name} vs {ONSHORE_LABEL[s.macro.onshore]} · benchmarks {DATA_AS_OF}
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="rounded-2xl border border-line bg-panel p-3 sm:p-4">
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {PRESETS.map((p) => {
                const active = preset?.id === p.id;
                return (
                  <button key={p.id} onClick={() => replace(p.scenario)} className={`relative shrink-0 rounded-xl px-3.5 py-2 text-left transition ${active ? "text-white" : "hover:bg-panel-2"}`}>
                    {active && <motion.span layoutId="preset-pill" className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--series-1)] to-[var(--series-7)] shadow-md shadow-accent/30" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                    <span className="relative block text-sm font-medium">{p.label}</span>
                    <span className={`relative block text-[11px] ${active ? "text-white/80" : "text-muted"}`}>{p.blurb}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 grid gap-3 border-t border-line pt-3 sm:grid-cols-2 lg:grid-cols-[1fr_1.1fr_2.1fr_0.9fr]">
              <Select<FunctionId> label="Function" value={s.fn} options={FUNCTION_IDS.map((id) => ({ value: id, label: FUNCTIONS[id].label }))} onChange={(fn) => set({ fn, compute: FUNCTIONS[fn].defaultCompute })} />
              <label className="block">
                <span className="mb-1 flex justify-between text-xs font-medium text-muted">
                  Year-5 headcount <span className="font-semibold text-ink tabular-nums">{int(s.headcount.y5)}</span>
                </span>
                <input type="range" aria-label="Year-5 headcount" min={100} max={3000} step={50} value={s.headcount.y5} onChange={(ev) => scaleTo(Number(ev.target.value))} className="mt-2 w-full" />
              </label>
              <div>
                <span className="mb-1 block text-xs font-medium text-muted">Priority</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRIORITY_MODES.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => set({ weights: m.weights })}
                      className={`rounded-full border px-3 py-1.5 text-xs transition ${mode?.id === m.id ? "border-accent bg-accent-soft font-medium text-accent" : "border-line text-muted hover:border-accent/60 hover:text-ink"}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <Select<OnshoreLocation> label="Compared with" value={s.macro.onshore} options={(Object.keys(ONSHORE_LABEL) as OnshoreLocation[]).map((o) => ({ value: o, label: ONSHORE_LABEL[o] }))} onChange={(onshore) => setIn("macro", { onshore })} />
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="NPV of savings" value={t.npvSavingsUsd} format={(n) => usd(n)} tone={t.npvSavingsUsd > 0 ? "good" : "bad"} icon={<PiggyBank size={15} />} spark={t.months.map((m) => m.cumSavings)} sub="cumulative savings, 60 months" />
          <StatTile label="Cheaper than onshore" value={savedShare} format={(n) => pct(n)} icon={<DollarSign size={15} />} sub={<>{usd(t.totalUsd)} vs {usd(t.onshoreUsd)}</>} />
          <StatTile label="Payback" value={t.paybackMonth ?? 61} format={(n) => (t.paybackMonth === null ? "> 5 yrs" : `${Math.round(n)} mo`)} icon={<Clock size={15} />} sub="incl. setup and knowledge transfer" />
          <StatTile label="Cost per seat (Y3)" value={t.costPerSeatY3Usd} format={(n) => usd(n, 0)} icon={<Users size={15} />} spark={t.years.map((y) => y.total / Math.max(1, y.hc))} sub="fully loaded, per FTE p.a." />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <Card title="Where to build" className="h-full">
              <IndiaMap ranking={e.ranking} talent={e.talent} selected={s.marketId} hubSpoke={e.hubSpoke} onSelect={select} />
              <p className="mt-2 text-xs text-muted">{e.hubSpoke.recommendation}</p>
            </Card>
          </Reveal>
          <Reveal delay={0.08}>
            <Card title="Micro-market race" action={<Link href="/location" className="text-xs font-medium text-accent">Tune weights →</Link>} className="h-full">
              <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
                {CRITERIA.map((c, i) => (
                  <span key={c} className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-sm" style={{ background: `var(--series-${i + 1})` }} />
                    {CRITERION_DEFS[c].label}
                  </span>
                ))}
              </div>
              <RankingRace ranking={e.ranking} selected={s.marketId} onSelect={select} />
              <p className="mt-3 text-xs text-muted">Click a market to model it. Bars show how much each priority contributes to the score.</p>
            </Card>
          </Reveal>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <Card title={`Savings trajectory vs ${ONSHORE_LABEL[s.macro.onshore]}`} action={<Link href="/financials" className="text-xs font-medium text-accent">Full model →</Link>} className="h-full">
              <CumulativeChart months={t.months} payback={t.paybackMonth} />
            </Card>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="grid h-full gap-4">
              <Card title="Where the money goes (5 years)">
                <CostComposition years={t.years} />
              </Card>
              <Card title="Headcount and seniority ramp">
                <HeadcountPyramid anchors={anchorsFromScenario(s)} />
              </Card>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <Card title={`Decision alerts · ${e.selected.name}`} action={<Link href="/stress-test" className="text-xs font-medium text-accent">Stress-test →</Link>}>
            <AlertList alerts={e.alerts} />
          </Card>
        </Reveal>
      </section>

      {/* Paths */}
      <section>
        <Reveal>
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Go deeper</h2>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {PATHS.map(({ href, icon: Icon, title, body }, i) => (
            <Reveal key={href} delay={i * 0.08}>
              <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 24 }} className="h-full">
                <Link href={href} className="group relative block h-full overflow-hidden rounded-xl border border-line bg-panel p-5 transition-shadow hover:border-accent hover:shadow-xl hover:shadow-accent/10">
                  <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent/15 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent-soft text-accent transition-transform group-hover:scale-110">
                      <Icon size={19} />
                    </span>
                    <span className="text-xs font-medium text-muted">Path {i + 1}</span>
                  </div>
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted">{body}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
                    Open <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      <p className="text-xs text-muted">
        Benchmarks are indicative ({DATA_AS_OF}), compiled from public sources. Tax rules are flagged where recent Finance Acts may have revised them. Validate with licensed data and a tax adviser before committing capital.
      </p>
    </div>
  );
}
