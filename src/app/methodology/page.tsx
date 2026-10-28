import type { Metadata } from "next";
import { SourceList } from "@/components/info/SourceList";
import { Card, PageTitle } from "@/components/ui";
import { SOURCES } from "@/content/sources";
import { BENCHMARK_META } from "@/data/benchmarks";
import { DATA_AS_OF, MARKET_META } from "@/data/markets";
import { TAX_RULES } from "@/data/taxRules";
import { CRITERION_DEFS } from "@/engine/mcda";
import { CRITERIA } from "@/engine/scenario";

export const metadata: Metadata = {
  title: "Methodology and sources · GCC Tracker",
  description: "How GCC Tracker scores locations, models 5-year TCO, assesses talent and tax, and where every number comes from.",
};

const TCO_ASSUMPTIONS = [
  "Monthly model over 60 months; headcount ramps linearly between Day 1, Year 3 and Year 5, separately for each seniority band.",
  "Compensation = band CTC × city index × wage inflation (hot skills and general roles separately) + 12% benefits loading.",
  "Real estate: managed seats with a 10% buffer, or leases that expand annually (90 sq.ft per seat, ₹16 CAM, 20,000 sq.ft minimum, in-house facility cost).",
  "Onshore comparator: fully loaded cost of the same headcount onshore, scaled by output equivalence that ramps from 65% to 95% over 24 months.",
  "A one-off knowledge-transfer cost of 20% of year-1 onshore cost is charged to the business case.",
  "Transfer pricing: cost-plus at the safe-harbour markup; India tax and any Pillar Two top-up appear as a cost line.",
  "NPV discounts monthly cash flows at the chosen WACC. Payback is the first month cumulative savings turn positive.",
];

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageTitle eyebrow="Method" title="How the numbers are made">
        Everything here is transparent by design. Benchmarks are indicative ({DATA_AS_OF}) and compiled from public sources; they are not licensed datasets.
      </PageTitle>

      <Card title="Independence">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink/85">
          <li>GCC Tracker does not sell set-up services, office space, recruitment or advisory, and takes no referral fees.</li>
          <li>No sign-up, email or sales call is needed for any page or tool.</li>
          <li>All models run in your browser. Scenarios live only in the page address; Benchmark entries are never uploaded or stored.</li>
          <li>Every assumption is listed below with its source, so you can disagree with a number and see exactly how it moves the answer.</li>
        </ul>
      </Card>

      <Card title="Location scoring (MCDA)">
        <p className="mb-3 text-sm text-ink/85">
          Each market gets a 0–100 score: a weighted sum of five criteria. Every criterion is scaled against fixed benchmark bounds, so adding or removing a market never changes how the others rank. Cost is inverted, so cheaper scores higher.
        </p>
        <dl className="divide-y divide-line text-sm">
          {CRITERIA.map((c) => (
            <div key={c} className="grid gap-1 py-2.5 sm:grid-cols-[200px_1fr]">
              <dt className="font-medium">{CRITERION_DEFS[c].label}</dt>
              <dd className="text-ink/80">{CRITERION_DEFS[c].method}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card title="5-year TCO model">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink/85">
          {TCO_ASSUMPTIONS.map((a) => <li key={a}>{a}</li>)}
        </ul>
      </Card>

      <Card title="Talent">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink/85">
          <li>Leadership Ceiling Index (LCI) = 0.7 × local L6+ depth + 30 × the function&apos;s ecosystem strength. Planning more than 50 senior hires where LCI is below 45 raises a red flag.</li>
          <li>Capturable hires per year = talent pool × band share × specialism^1.5 × attrition-driven mobility × a capture share that falls as competitor density rises.</li>
          <li>Tier-2 cities add a 25–45% relocation premium on the senior roles that must be brought in from Tier-1 hubs.</li>
        </ul>
      </Card>

      <Card title="Country comparison and benchmarking">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink/85">
          <li>Country scores are indicative 0–100 composites for cost (US = 100), talent scale, business English, time-zone overlap with the chosen HQ, headline corporate tax and GCC-ecosystem maturity. EF EPI 2025 scores are shown where published.</li>
          <li>Benchmark my GCC models a team of the entered size and mix holding steady for 12 months in the chosen city, then compares each cost line; within ±10% counts as in line.</li>
        </ul>
      </Card>

      <Card title="Benchmark data">
        <div className="-mx-4 overflow-x-auto px-4">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="py-2 pr-3 font-medium">Metric</th>
                <th className="py-2 pr-3 font-medium">Method</th>
                <th className="py-2 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {[...Object.values(MARKET_META), ...Object.values(BENCHMARK_META)].map((m) =>
                m ? (
                  <tr key={m.label} className="border-b border-line/60 align-top">
                    <td className="py-2 pr-3 font-medium">{m.label}{m.unit ? <span className="block text-xs font-normal text-muted">{m.unit}</span> : null}</td>
                    <td className="py-2 pr-3 text-ink/80">{m.method}</td>
                    <td className="py-2 text-ink/80">{m.source}</td>
                  </tr>
                ) : null,
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Tax rules">
        <dl className="divide-y divide-line text-sm">
          {Object.entries(TAX_RULES).map(([k, r]) => (
            <div key={k} className="grid gap-1 py-2.5 sm:grid-cols-[1fr_160px]">
              <dd className="text-ink/85">
                {r.basis}
                {r.verify && <span className="ml-2 rounded bg-warn/10 px-1.5 py-0.5 text-[11px] font-medium text-warn">verify</span>}
              </dd>
              <dt className="text-xs text-muted sm:text-right">{r.effective}</dt>
            </div>
          ))}
        </dl>
      </Card>

      <Card title="Limitations">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink/85">
          <li>City benchmarks are indicative; licensed salary and real-estate data would improve precision.</li>
          <li>The market signal feed is curated by an analyst and illustrative, not a live data stream.</li>
          <li>Tax content is general information, not advice. Rules marked “verify” may have changed.</li>
          <li>The map is a simplified outline for orientation, not an authoritative boundary map.</li>
        </ul>
      </Card>

      <SourceList ids={Object.keys(SOURCES)} title="Published sources cited on this site" />
    </div>
  );
}
