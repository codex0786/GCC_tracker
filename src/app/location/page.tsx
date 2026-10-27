"use client";

import { Check } from "lucide-react";
import { ScenarioPanel } from "@/components/ScenarioPanel";
import { AlertList, Card, Info, PageTitle, Slider } from "@/components/ui";
import { BENCHMARK_META, FUNCTIONS } from "@/data/benchmarks";
import { DATA_AS_OF, MARKET_META } from "@/data/markets";
import { CRITERIA, rebalance } from "@/engine/scenario";
import { CRITERION_DEFS } from "@/engine/mcda";
import { int, pct, usd } from "@/lib/format";
import { useEvaluation, useScenario, useStore } from "@/lib/store";

const listJoin = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);

export default function LocationPage() {
  const s = useScenario();
  const e = useEvaluation();
  const { set } = useStore.getState();
  const hs = e.hubSpoke;
  const top = e.ranking[0].market;
  const talent = e.talent[top.id];

  return (
    <>
      <PageTitle eyebrow="Path 1 · Module A + C" title="Multi-criteria site selection">
        Weighted-sum MCDA with direction-aware scaling against fixed benchmark bounds, so adding or removing a market never reorders the others. Weights always sum to 100%.
      </PageTitle>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <ScenarioPanel />
          <Card title="Operating priorities">
            <div className="space-y-3">
              {CRITERIA.map((c) => (
                <Slider
                  key={c}
                  label={CRITERION_DEFS[c].label}
                  value={s.weights[c]}
                  min={0}
                  max={70}
                  unit="%"
                  info={{ label: CRITERION_DEFS[c].label, method: CRITERION_DEFS[c].method, source: "See per-attribute sources in the market table", asOf: DATA_AS_OF }}
                  onChange={(v) => set({ weights: rebalance(s.weights, c, v) })}
                />
              ))}
            </div>
          </Card>
        </div>

        <div className="min-w-0 space-y-4">
          <Card title={`Composite suitability · ${FUNCTIONS[s.fn].label}`} info={{ label: "Composite score", method: "S_m = Σ w_i · norm(x_m,i); cost criteria inverted. Bar segments show each criterion's contribution.", source: "Market attributes in this table", asOf: DATA_AS_OF }}>
            <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
              {CRITERIA.map((c, i) => (
                <span key={c} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm" style={{ background: `var(--series-${i + 1})` }} />
                  {CRITERION_DEFS[c].label}
                </span>
              ))}
            </div>
            <div className="-mx-4 overflow-x-auto px-4">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs text-muted">
                    <th className="py-2 pr-2 font-medium">#</th>
                    <th className="py-2 pr-2 font-medium">Micro-market</th>
                    <th className="w-[40%] py-2 pr-2 font-medium">Score</th>
                    <th className="py-2 pr-2 text-right font-medium">
                      <span className="inline-flex items-center gap-1">Rent <Info meta={MARKET_META.rentInrSqft!} /></span>
                    </th>
                    <th className="py-2 pr-2 text-right font-medium">
                      <span className="inline-flex items-center gap-1">LCI <Info meta={{ label: "Leadership Ceiling Index", method: "0.7 × L6+ depth + 30 × function ecosystem strength", source: MARKET_META.seniorDepth!.source, asOf: DATA_AS_OF }} /></span>
                    </th>
                    <th className="py-2 text-right font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {e.ranking.map((r) => {
                    const selected = r.market.id === s.marketId;
                    return (
                      <tr key={r.market.id} className={`border-b border-line/70 ${selected ? "bg-accent-soft/40" : ""}`}>
                        <td className="py-2.5 pr-2 text-muted">{r.rank}</td>
                        <td className="py-2.5 pr-2">
                          <div className="font-medium">{r.market.name}</div>
                          <div className="text-xs text-muted">Tier {r.market.tier} · {r.market.state}</div>
                        </td>
                        <td className="py-2.5 pr-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-3 flex-1 gap-[2px] overflow-hidden rounded-[3px] bg-panel-2" title={CRITERIA.map((c) => `${CRITERION_DEFS[c].label}: ${r.contribution[c].toFixed(1)}`).join("\n")}>
                              {CRITERIA.map((c, i) => (
                                <div key={c} style={{ width: `${r.contribution[c]}%`, background: `var(--series-${i + 1})` }} />
                              ))}
                            </div>
                            <span className="w-10 text-right font-semibold tabular-nums">{r.score.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="py-2.5 pr-2 text-right tabular-nums">₹{r.market.rentInrSqft}</td>
                        <td className={`py-2.5 pr-2 text-right tabular-nums ${e.talent[r.market.id].lci < 45 ? "text-bad" : ""}`}>{e.talent[r.market.id].lci.toFixed(0)}</td>
                        <td className="py-2.5 text-right">
                          {selected ? (
                            <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-accent"><Check size={13} /> Modelled</span>
                          ) : (
                            <button onClick={() => set({ marketId: r.market.id })} className="whitespace-nowrap rounded-md border border-line px-2 py-1 text-xs hover:border-accent">
                              Model
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Trade-off matrix">
            <div className="grid gap-3 md:grid-cols-2">
              {e.tradeOffs.map((t) => (
                <div key={t.b.id} className="rounded-lg border border-line p-3 text-sm">
                  <div className="font-medium">
                    {t.a.name} <span className="text-muted">vs</span> {t.b.name}
                  </div>
                  <p className="mt-1 text-muted">
                    Choosing {t.a.name}
                    {t.pros.length > 0 && <> <span className="text-good">{listJoin(t.pros)}</span></>}
                    {t.pros.length > 0 && t.cons.length > 0 && ", but"}
                    {t.cons.length > 0 && <> <span className="text-bad">{listJoin(t.cons)}</span></>}
                    {t.pros.length + t.cons.length === 0 && " is broadly equivalent on cost, talent and attrition"}.
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card title="Hub-and-spoke synergy" info={{ label: "Hub-and-spoke", method: "Tests 80/20, 70/30 and 60/40 splits of L1–L4 roles from the top 3 Tier-1 hubs to the top 2 Tier-2 spokes. 5-yr cost NPV includes ₹1.4 cr/yr second-site overhead and 3% coordination drag; spoke must fill ≥75% of its hiring locally.", source: BENCHMARK_META.re.source, asOf: DATA_AS_OF }}>
              <p className="text-sm">{hs.recommendation}</p>
              <table className="mt-3 w-full text-xs">
                <thead>
                  <tr className="border-b border-line text-left text-muted">
                    <th className="py-1.5 font-medium">Configuration</th>
                    <th className="py-1.5 text-right font-medium">5-yr cost NPV</th>
                    <th className="py-1.5 text-right font-medium">Feasible</th>
                  </tr>
                </thead>
                <tbody>
                  {hs.options.slice(0, 6).map((o, i) => (
                    <tr key={i} className="border-b border-line/60" title={o.note}>
                      <td className="py-1.5">{o.spoke ? `${o.hub.name} ${Math.round((1 - o.spokeShare) * 100)} / ${o.spoke.name} ${Math.round(o.spokeShare * 100)}` : `${o.hub.name} only`}</td>
                      <td className="py-1.5 text-right tabular-nums">{usd(o.npvUsd)}</td>
                      <td className={`py-1.5 text-right ${o.feasible ? "text-good" : "text-bad"}`}>{o.feasible ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <Card title={`Talent feasibility · ${top.name}`} info={{ label: "Talent funnel", method: "Annual capturable candidates = pool × band share × specialism^1.5 × mobility (attrition) × capture share 1/(1 + competitors/8). Time-to-hire scales with band, competitor density, specialism gap and hiring pressure.", source: MARKET_META.talentPoolK!.source, asOf: DATA_AS_OF }}>
              <div className="mb-2 flex gap-4 text-sm">
                <span>LCI <b>{talent.lci.toFixed(0)}</b></span>
                {talent.relocationPremium > 0 && <span>Relocation premium <b>{pct(talent.relocationPremium)}</b> on {pct(talent.importedSeniorShare)} of L5+ hires</span>}
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-line text-left text-muted">
                    <th className="py-1.5 font-medium">Band</th>
                    <th className="py-1.5 text-right font-medium">Capturable / yr</th>
                    <th className="py-1.5 text-right font-medium">Y1 hires</th>
                    <th className="py-1.5 text-right font-medium">Fill rate</th>
                    <th className="py-1.5 text-right font-medium">Time to hire</th>
                  </tr>
                </thead>
                <tbody>
                  {talent.bands.map((b) => (
                    <tr key={b.band} className="border-b border-line/60">
                      <td className="py-1.5">{b.band}</td>
                      <td className="py-1.5 text-right tabular-nums">{int(b.availablePerYear)}</td>
                      <td className="py-1.5 text-right tabular-nums">{int(b.hiresYear1)}</td>
                      <td className={`py-1.5 text-right tabular-nums ${b.fillRate < 0.7 ? "text-bad" : ""}`}>{pct(b.fillRate)}</td>
                      <td className="py-1.5 text-right tabular-nums">{Math.round(b.timeToHireDays)} d</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3">
                <AlertList alerts={talent.alerts} empty="No talent red flags at the top-ranked market." />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
