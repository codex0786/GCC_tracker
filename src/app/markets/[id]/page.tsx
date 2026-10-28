import { ArrowLeft, ArrowRight, Calculator, CheckCircle2, MapPin, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, Info } from "@/components/ui";
import { CITY_PROFILES } from "@/content/cities";
import { FUNCTIONS } from "@/data/benchmarks";
import { MARKETS, MARKET_BY_ID, MARKET_META } from "@/data/markets";
import { FUNCTION_IDS, type Market, type MarketId } from "@/data/types";
import { scoreMarkets } from "@/engine/mcda";
import { DEFAULT_SCENARIO } from "@/engine/scenario";
import { leadershipCeilingIndex } from "@/engine/talent";

export const dynamicParams = false;

export function generateStaticParams() {
  return MARKETS.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const m = MARKET_BY_ID[(await params).id as MarketId];
  return m ? { title: `${m.name} GCC profile · GCC Tracker`, description: `${CITY_PROFILES[m.id].tagline}. Rents, talent, attrition, connectivity and policy for GCCs in ${m.city}.` } : {};
}

const FACTS: { key: keyof Market; fmt: (m: Market) => string }[] = [
  { key: "rentInrSqft", fmt: (m) => `₹${m.rentInrSqft}` },
  { key: "managedSeatInr", fmt: (m) => `₹${m.managedSeatInr.toLocaleString("en-IN")}` },
  { key: "vacancyPct", fmt: (m) => `${m.vacancyPct}%` },
  { key: "salaryIndex", fmt: (m) => `${m.salaryIndex.toFixed(2)}×` },
  { key: "talentPoolK", fmt: (m) => `${m.talentPoolK.toLocaleString("en-IN")}k` },
  { key: "seniorDepth", fmt: (m) => `${m.seniorDepth}/100` },
  { key: "attritionPct", fmt: (m) => `${m.attritionPct}%` },
  { key: "competitorDensity", fmt: (m) => String(m.competitorDensity) },
  { key: "airportKm", fmt: (m) => `${m.airportKm} km` },
  { key: "baseTimeToHire", fmt: (m) => `${m.baseTimeToHire} days` },
];

export default async function MarketProfile({ params }: { params: Promise<{ id: string }> }) {
  const m = MARKET_BY_ID[(await params).id as MarketId];
  if (!m) notFound();
  const p = CITY_PROFILES[m.id];
  const byFunction = FUNCTION_IDS.map((fn) => {
    const rank = scoreMarkets(MARKETS, fn, DEFAULT_SCENARIO.weights).find((r) => r.market.id === m.id)!;
    return { fn, rank: rank.rank, score: rank.score, lci: leadershipCeilingIndex(m, fn) };
  }).sort((a, b) => a.rank - b.rank || b.score - a.score);
  const others = MARKETS.filter((x) => x.id !== m.id);

  return (
    <div className="space-y-6">
      <Link href="/markets" className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent">
        <ArrowLeft size={14} /> All markets
      </Link>

      <section className="relative overflow-hidden rounded-3xl border border-line p-6 sm:p-8">
        <div className="aurora opacity-60" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-medium text-muted">
              <MapPin size={13} className="text-accent" /> {m.city}, {m.state}
              <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${m.tier === 1 ? "bg-accent-soft text-accent" : "bg-panel-2"}`}>Tier {m.tier}</span>
              {m.ifsc && <span className="rounded-md bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent">IFSC</span>}
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{m.name}</h1>
            <p className="mt-1 text-lg text-accent">{p.tagline}</p>
            <p className="mt-3 text-ink/85">{p.overview}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/financials?market=${m.id}`} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/25 transition hover:-translate-y-0.5">
              <Calculator size={15} /> Model a GCC here
            </Link>
            <Link href={`/location?market=${m.id}`} className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel/70 px-4 py-2.5 text-sm font-medium backdrop-blur transition hover:border-accent">
              Compare locations <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {FACTS.map(({ key, fmt }) => (
          <div key={key} className="rounded-xl border border-line bg-panel p-3.5">
            <div className="flex items-center gap-1 text-xs text-muted">
              {MARKET_META[key]?.label}
              {MARKET_META[key] && <Info meta={MARKET_META[key]!} />}
            </div>
            <div className="mt-1 text-lg font-semibold tabular-nums">{fmt(m)}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Strengths">
          <ul className="space-y-2 text-sm">
            {p.strengths.map((s) => (
              <li key={s} className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-good" />{s}</li>
            ))}
          </ul>
        </Card>
        <Card title="Watch-outs">
          <ul className="space-y-2 text-sm">
            {p.watchouts.map((s) => (
              <li key={s} className="flex gap-2"><TriangleAlert size={16} className="mt-0.5 shrink-0 text-warn" />{s}</li>
            ))}
          </ul>
        </Card>
        <Card title="Policy">
          <p className="text-sm text-ink/85">{p.policy}</p>
          <Link href="/learn/policy-and-tax" className="mt-3 inline-block text-sm text-accent hover:underline">Policy and tax basics →</Link>
        </Card>
      </div>

      <Card title="How it ranks for each function" info={{ label: "Function ranking", method: "Balanced priority weights (cost 25, senior talent 35, attrition 10, connectivity 15, incentives 15) across all 11 markets. LCI = Leadership Ceiling Index.", source: "Model output", asOf: "Live" }}>
        <div className="-mx-4 overflow-x-auto px-4">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="py-2 font-medium">Function</th>
                <th className="py-2 font-medium">Rank of {MARKETS.length}</th>
                <th className="py-2 text-right font-medium">Score</th>
                <th className="py-2 text-right font-medium">LCI</th>
              </tr>
            </thead>
            <tbody>
              {byFunction.map((r) => (
                <tr key={r.fn} className="border-b border-line/60">
                  <td className="py-2">{FUNCTIONS[r.fn].label}</td>
                  <td className="py-2">
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-24 overflow-hidden rounded-full bg-panel-2">
                        <span className="block h-full rounded-full bg-[var(--series-1)]" style={{ width: `${((MARKETS.length + 1 - r.rank) / MARKETS.length) * 100}%` }} />
                      </span>
                      #{r.rank}
                    </span>
                  </td>
                  <td className="py-2 text-right tabular-nums">{r.score.toFixed(1)}</td>
                  <td className={`py-2 text-right tabular-nums ${r.lci < 45 ? "text-bad" : ""}`}>{r.lci.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted">Other markets</h2>
        <div className="flex flex-wrap gap-2">
          {others.map((o) => (
            <Link key={o.id} href={`/markets/${o.id}`} className="rounded-full border border-line bg-panel px-3 py-1.5 text-sm transition hover:border-accent hover:text-accent">
              {o.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
