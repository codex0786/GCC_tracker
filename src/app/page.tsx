import { ArrowRight, BookOpen, Calculator, Clock, Gauge, Landmark, MapPin, ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LiveDot, SignalTicker } from "@/components/home/widgets";
import { CityBars } from "@/components/info/CityBars";
import { Cite } from "@/components/info/SourceList";
import { StatCounters } from "@/components/info/StatCounters";
import { TrustStrip } from "@/components/info/TrustStrip";
import { Reveal } from "@/components/motion";
import { CITY_PROFILES } from "@/content/cities";
import { LANDSCAPE_FACTS, STATE_POLICIES, STATE_TARGETS } from "@/content/facts";
import { ARTICLES } from "@/content/learn";
import { MARKETS } from "@/data/markets";

export const metadata: Metadata = {
  title: "GCC Tracker · India's Global Capability Centres, explained",
  description:
    "Independent, free and sourced guide to India's GCC sector — no sign-up, no sales call: what GCCs are, why companies choose India, city profiles, state policies and tax basics, plus tools to model location, 5-year TCO and risk.",
};

const TOOLS = [
  { href: "/location", icon: MapPin, title: "Find the best location", body: "Rank 11 micro-markets on your priorities." },
  { href: "/financials", icon: Calculator, title: "Build a 5-year TCO", body: "Cost, payback and NPV vs onshore." },
  { href: "/stress-test", icon: ShieldAlert, title: "Stress-test the plan", body: "Wage, FX, rent and AI shocks." },
  { href: "/benchmark", icon: Gauge, title: "Benchmark my GCC", body: "Your actual costs vs the model." },
];

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative -mx-4 overflow-hidden border-b border-line px-4 pb-8 pt-10 sm:mx-0 sm:rounded-3xl sm:border sm:px-10 sm:pt-14">
        <div className="aurora" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-panel/70 px-3 py-1 text-xs font-medium backdrop-blur">
              <LiveDot /> Independent · free · every number sourced
            </div>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              India&apos;s Global Capability Centres, <span className="shine">explained.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              Start with the basics, explore every major GCC city, understand the policies and tax rules, then model your own centre&apos;s location, 5-year cost and risk.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/learn/what-is-a-gcc" className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-xl">
                <BookOpen size={15} /> Start with the basics
              </Link>
              <Link href="/markets" className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel/70 px-4 py-2.5 text-sm font-medium backdrop-blur transition hover:border-accent">
                Explore cities <ArrowRight size={15} />
              </Link>
            </div>
            <TrustStrip className="mt-6" />
          </div>
          <StatCounters facts={LANDSCAPE_FACTS} />
        </div>
        <div className="relative z-10 mt-10 border-t border-line/70">
          <SignalTicker />
        </div>
      </section>

      {/* Learn */}
      <section>
        <Reveal>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-accent">Learn</div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">New to GCCs? Start here</h2>
            </div>
            <Link href="/learn" className="text-sm font-medium text-accent">All guides, glossary and FAQ →</Link>
          </div>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {ARTICLES.map((a, i) => (
            <Reveal key={a.slug} delay={i * 0.06}>
              <Link href={`/learn/${a.slug}`} className="group flex h-full flex-col rounded-xl border border-line bg-panel p-4 transition hover:-translate-y-1 hover:border-accent hover:shadow-xl hover:shadow-accent/10">
                <div className="flex items-center justify-between text-[11px] font-medium text-muted">
                  <span className={a.level === "Start here" ? "text-accent" : ""}>{a.level}</span>
                  <span className="flex items-center gap-1"><Clock size={11} /> {a.minutes} min</span>
                </div>
                <h3 className="mt-3 font-semibold leading-snug group-hover:text-accent">{a.title}</h3>
                <p className="mt-1.5 flex-1 text-sm text-muted">{a.summary}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Where GCCs are */}
      <section className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        <Reveal>
          <div className="h-full rounded-2xl border border-line bg-panel p-5 sm:p-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-accent">Where GCCs are</div>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">Six metros host about 94% of India&apos;s GCCs</h2>
            <p className="mt-1 mb-5 text-sm text-muted">Number of GCCs by city. Click a city to open its profile.</p>
            <CityBars />
            <p className="mt-4 text-xs text-muted">
              Source: <Cite id="vestianCities" />. Consultants count centres differently, so totals vary between reports.
            </p>
          </div>
        </Reveal>
        <div>
          <Reveal>
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-xl font-semibold tracking-tight">City profiles</h2>
              <Link href="/markets" className="text-sm font-medium text-accent">Map and all cities →</Link>
            </div>
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-2">
            {MARKETS.map((m, i) => (
              <Reveal key={m.id} delay={(i % 4) * 0.05}>
                <Link href={`/markets/${m.id}`} className="group flex h-full items-start gap-3 rounded-xl border border-line bg-panel p-3.5 transition hover:border-accent hover:shadow-lg hover:shadow-accent/10">
                  <span className={`mt-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${m.tier === 1 ? "bg-accent-soft text-accent" : "bg-panel-2 text-muted"}`}>T{m.tier}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium group-hover:text-accent">{m.name}</span>
                    <span className="block text-xs text-muted">{CITY_PROFILES[m.id].tagline}</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Policy */}
      <section>
        <Reveal>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-accent">Policy</div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">States are competing for GCCs</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted">
                Together, state policies target {STATE_TARGETS.jobs} GCC jobs and {STATE_TARGETS.gccs} new centres by {STATE_TARGETS.by} (<Cite id={STATE_TARGETS.source} />).
              </p>
            </div>
            <Link href="/learn/policy-and-tax" className="text-sm font-medium text-accent">Policy and tax basics →</Link>
          </div>
        </Reveal>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STATE_POLICIES.map((p, i) => (
            <Reveal key={p.state} delay={(i % 3) * 0.06}>
              <div className="h-full rounded-xl border border-line bg-panel p-4">
                <div className="flex items-center gap-2">
                  <Landmark size={15} className="text-accent" />
                  <span className="font-semibold">{p.state}</span>
                  <span className="ml-auto text-xs text-muted">{p.period}</span>
                </div>
                <p className="mt-2 text-sm text-ink/85">{p.headline}</p>
                <p className="mt-2 text-[11px]">
                  <Cite id={p.source} />
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">Summaries of published policies as reported by law firms and consultancies. Check the official state notification before relying on any figure.</p>
      </section>

      {/* Independence */}
      <Reveal>
        <section className="grid gap-6 rounded-2xl border border-line bg-panel p-6 sm:p-8 lg:grid-cols-[1fr_1.3fr] lg:items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-accent">Independent by design</div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">A second opinion, not a sales funnel</h2>
            <p className="mt-2 text-muted">
              Most GCC cost calculators are run by firms that sell set-up services or office space, and ask for your details before showing a number. GCC Tracker sells nothing: every assumption is on the page, and your scenario never leaves your browser.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["No sign-up, no sales call", "Every page and tool works without an account, an email or a form."],
              ["Open methodology", "Each score and cost line shows its formula, source and as-of date."],
              ["Your data stays with you", "Models run in your browser. Benchmark entries are never uploaded or stored."],
              ["Honest about limits", "Indicative public benchmarks, clearly labelled. Tax rules flagged where they may have changed."],
            ].map(([t, b]) => (
              <div key={t} className="rounded-xl border border-line bg-panel-2/60 p-4">
                <div className="text-sm font-semibold">{t}</div>
                <div className="mt-1 text-xs text-muted">{b}</div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Tools CTA */}
      <Reveal>
        <section className="relative overflow-hidden rounded-3xl border border-line bg-panel p-6 sm:p-10">
          <div className="aurora opacity-70" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-accent">Ready to go further?</div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Model your own GCC</h2>
              <p className="mt-2 text-muted">Pick a scenario and watch the location ranking, 5-year cost, payback and risk update live. Export a board memo or Excel model.</p>
              <Link href="/tools" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/25 transition hover:-translate-y-0.5">
                Open the decision cockpit <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {TOOLS.map(({ href, icon: Icon, title, body }) => (
                <Link key={href} href={href} className="group rounded-xl border border-line bg-panel/80 p-4 backdrop-blur transition hover:-translate-y-1 hover:border-accent">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent-soft text-accent transition-transform group-hover:scale-110">
                    <Icon size={17} />
                  </span>
                  <h3 className="mt-3 text-sm font-semibold">{title}</h3>
                  <p className="mt-1 text-xs text-muted">{body}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
