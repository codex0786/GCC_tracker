import type { Metadata } from "next";
import Link from "next/link";
import { MarketsMap } from "@/components/info/MarketsMap";
import { Card, Info, PageTitle } from "@/components/ui";
import { CITY_PROFILES } from "@/content/cities";
import { MARKETS, MARKET_META } from "@/data/markets";

export const metadata: Metadata = {
  title: "GCC cities and micro-markets in India · GCC-Nexus",
  description: "Profiles of 11 GCC micro-markets across Bengaluru, Hyderabad, NCR, Mumbai, Pune, Chennai, GIFT City, Coimbatore and Kochi: rents, talent, attrition, connectivity and policy.",
};

const COLS = [
  { key: "rentInrSqft", fmt: (v: number) => `₹${v}` },
  { key: "salaryIndex", fmt: (v: number) => v.toFixed(2) },
  { key: "talentPoolK", fmt: (v: number) => `${v.toLocaleString("en-IN")}k` },
  { key: "seniorDepth", fmt: (v: number) => String(v) },
  { key: "attritionPct", fmt: (v: number) => `${v}%` },
  { key: "vacancyPct", fmt: (v: number) => `${v}%` },
] as const;

export default function MarketsPage() {
  return (
    <>
      <PageTitle eyebrow="Markets" title="India's GCC cities at a glance">
        Eleven micro-markets across nine cities: the six metros where most GCCs sit, plus GIFT City and two fast-growing Tier-2 options.
      </PageTitle>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
        <Card title="Pick a city">
          <MarketsMap />
        </Card>
        <div className="grid content-start gap-3 sm:grid-cols-2">
          {MARKETS.map((m) => (
            <Link key={m.id} href={`/markets/${m.id}`} className="group rounded-xl border border-line bg-panel p-4 transition hover:-translate-y-0.5 hover:border-accent hover:shadow-lg hover:shadow-accent/10">
              <div className="flex items-center justify-between">
                <span className="font-semibold group-hover:text-accent">{m.name}</span>
                <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${m.tier === 1 ? "bg-accent-soft text-accent" : "bg-panel-2 text-muted"}`}>Tier {m.tier}</span>
              </div>
              <p className="mt-1 text-xs text-muted">{CITY_PROFILES[m.id].tagline}</p>
              <div className="mt-3 flex gap-4 text-xs">
                <span><span className="text-muted">Rent </span>₹{m.rentInrSqft}</span>
                <span><span className="text-muted">Attrition </span>{m.attritionPct}%</span>
                <span><span className="text-muted">State </span>{m.state}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Card title="Compare all markets" className="mt-6">
        <div className="-mx-4 overflow-x-auto px-4">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-right text-xs text-muted">
                <th className="py-2 text-left font-medium">Micro-market</th>
                {COLS.map((c) => (
                  <th key={c.key} className="py-2 pl-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      {MARKET_META[c.key]!.label} <Info meta={MARKET_META[c.key]!} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MARKETS.map((m) => (
                <tr key={m.id} className="border-b border-line/60 text-right tabular-nums">
                  <td className="py-2 text-left">
                    <Link href={`/markets/${m.id}`} className="font-medium hover:text-accent">{m.name}</Link>
                  </td>
                  {COLS.map((c) => (
                    <td key={c.key} className="py-2 pl-3">{c.fmt(m[c.key])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">Indicative benchmarks compiled from public sources. Hover the ⓘ icons for source and method; see the Methodology page for details.</p>
      </Card>
    </>
  );
}
