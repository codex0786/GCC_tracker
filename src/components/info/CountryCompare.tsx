"use client";

import { motion } from "motion/react";
import { ArrowRight, CheckCircle2, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Card, Select, Slider } from "@/components/ui";
import { COUNTRY_CRITERIA, COUNTRY_CRITERION_LABEL, HQ_LABEL, overlapHours, scoreCountries, type CountryCriterion, type Hq } from "@/data/countries";
import { rebalance } from "@/engine/scenario";

const DEFAULT_WEIGHTS: Record<CountryCriterion, number> = { cost: 25, talent: 25, english: 15, timezone: 15, tax: 5, ecosystem: 15 };
const spring = { type: "spring", stiffness: 260, damping: 30 } as const;

export function CountryCompare() {
  const [hq, setHq] = useState<Hq>("us-east");
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const ranked = scoreCountries(weights, hq);

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <Card title="Your priorities">
        <div className="space-y-3">
          <Select<Hq> label="Headquarters" value={hq} options={(Object.keys(HQ_LABEL) as Hq[]).map((h) => ({ value: h, label: HQ_LABEL[h] }))} onChange={setHq} />
          {COUNTRY_CRITERIA.map((k) => (
            <Slider key={k} label={COUNTRY_CRITERION_LABEL[k]} value={weights[k]} min={0} max={60} unit="%" onChange={(v) => setWeights(rebalance(weights, k, v))} />
          ))}
        </div>
      </Card>

      <div className="min-w-0 space-y-4">
        <Card title={`Ranking for a ${HQ_LABEL[hq]} headquarters`}>
          <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
            {COUNTRY_CRITERIA.map((k, i) => (
              <span key={k} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm" style={{ background: `var(--series-${i + 1})` }} />
                {COUNTRY_CRITERION_LABEL[k]}
              </span>
            ))}
          </div>
          <ol className="space-y-2">
            {ranked.map((r, i) => (
              <motion.li key={r.country.id} layout transition={spring} className={`flex items-center gap-3 rounded-lg px-2 py-2 ${r.country.id === "india" ? "bg-accent-soft/50" : ""}`}>
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${i === 0 ? "bg-accent text-white" : "bg-panel-2 text-muted"}`}>{i + 1}</span>
                <span className="w-32 shrink-0 text-sm font-medium">
                  {r.country.flag} {r.country.name}
                </span>
                <span className="flex h-2.5 flex-1 gap-[2px] overflow-hidden rounded-full bg-panel-2">
                  {COUNTRY_CRITERIA.map((k, j) => (
                    <motion.span key={k} className="h-full" style={{ background: `var(--series-${j + 1})` }} initial={false} animate={{ width: `${r.parts[k]}%` }} transition={spring} />
                  ))}
                </span>
                <span className="w-10 text-right text-sm font-semibold tabular-nums">{r.score.toFixed(1)}</span>
              </motion.li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-muted">Indicative 0–100 composites. Change the headquarters to see how time-zone overlap reshapes the ranking.</p>
        </Card>

        <Card title="Side by side">
          <div className="-mx-4 overflow-x-auto px-4">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-line text-right text-xs text-muted">
                  <th className="py-2 text-left font-medium">Country</th>
                  <th className="py-2 pl-3 font-medium">Cost (US = 100)</th>
                  <th className="py-2 pl-3 font-medium">Talent scale</th>
                  <th className="py-2 pl-3 font-medium">EF EPI 2025</th>
                  <th className="py-2 pl-3 font-medium">Overlap with HQ</th>
                  <th className="py-2 pl-3 font-medium">Corp. tax</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {ranked.map(({ country: c }) => (
                  <tr key={c.id} className="border-b border-line/60 text-right">
                    <td className="py-2 text-left font-medium">{c.flag} {c.name}</td>
                    <td className="py-2 pl-3">{c.costIndex}</td>
                    <td className="py-2 pl-3">{c.talentScale}</td>
                    <td className="py-2 pl-3">{c.efEpi2025 ? `${c.efEpi2025.score} (${c.efEpi2025.rank})` : <span className="text-muted">not cited</span>}</td>
                    <td className="py-2 pl-3">{overlapHours(c, hq).toFixed(1)} h</td>
                    <td className="py-2 pl-3">{c.corporateTaxPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted">
            Overlap = shared hours in a 9:00–18:00 working day, standard time. EF EPI measures the general population, so the business-English score used for ranking is an indicative composite.
          </p>
        </Card>

        <div className="grid gap-3 md:grid-cols-2">
          {ranked.map(({ country: c }) => (
            <Card key={c.id} title={`${c.flag} ${c.name}`}>
              <ul className="space-y-1.5 text-sm">
                {c.strengths.map((s) => (
                  <li key={s} className="flex gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-good" />{s}</li>
                ))}
                {c.watchouts.map((s) => (
                  <li key={s} className="flex gap-2"><TriangleAlert size={15} className="mt-0.5 shrink-0 text-warn" />{s}</li>
                ))}
              </ul>
              {c.id === "india" && (
                <Link href="/markets" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
                  Compare Indian cities <ArrowRight size={14} />
                </Link>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
