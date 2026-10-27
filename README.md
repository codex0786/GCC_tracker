# GCC-Nexus · India Strategic Advisory Engine

**Live:** https://gcc-nexus.vercel.app (auto-deploys from `main`)

A free, sourced information hub on India's Global Capability Centres (Learn, Markets, Methodology), plus decision tools for site selection, 5-year TCO, talent feasibility, tax strategy and market stress-testing.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # engine, data-schema and export tests
npm run build      # static production build
npm run test:e2e   # Playwright browser tests (after build; first run: npx playwright install chromium)
```

## Information hub

| Section | Content |
|---|---|
| **Learn** (`/learn`) | Five guides (what a GCC is, why India, operating models, setup roadmap, policy and tax), glossary, FAQ. Content lives in `src/content/` with every claim tied to a dated source in `src/content/sources.ts`. |
| **Markets** (`/markets`) | Map, comparison table and a profile page for each of 11 micro-markets, each deep-linking into the tools. |
| **Method** (`/methodology`) | How every score is calculated, benchmark sources, tax rules and limitations. |

All information pages are statically rendered with metadata, a sitemap and robots.txt.

## Decision tools

| Path | Engines | Output |
|---|---|---|
| **Select my optimal location** (`/location`) | MCDA scoring, talent funnel, hub-and-spoke optimiser | Ranked micro-markets with per-criterion contributions, trade-off matrix, split recommendation, Leadership Ceiling Index alerts |
| **Build my 5-year financial model** (`/financials`) | Monthly TCO, real-estate model comparison, tax advisor | Cash flow by category, NPV and payback vs onshore, lease-vs-managed breakeven, TP markup, Pillar Two top-up, SEZ/DTA and GIFT IFSC checks |
| **Stress-test my strategy** (`/stress-test`) | Signal shocks, Monte Carlo (Web Worker) | Stressed KPIs vs baseline, P10/P50/P90 savings fan, ranking shifts |

Exports: a board memo (PDF) and an Excel workbook with live formulas (totals, savings, cumulative and `NPV()`). The scenario lives in the URL hash, so **Share** copies a link to the exact case.

## Architecture

```
Scenario (plain JSON, in URL)
   └─► evaluate(scenario, stressed?)  — pure TypeScript, no React
         ├─ mcda.ts        weighted sum, direction-aware, fixed benchmark bounds
         ├─ talent.ts      LCI, capturable supply, fill rate, time-to-hire, relocation premium
         ├─ tco.ts         60-month cash flow, RE models, onshore comparator, NPV/payback
         ├─ tax.ts         safe harbour, IFSC holiday, Pillar Two (SBIE), SEZ vs DTA
         └─ evaluate.ts    two-pass run (pre-tax base → tax → final), hub-and-spoke, trade-offs
   montecarlo.ts  seeded paths, run in src/workers/montecarlo.worker.ts
```

- `src/data/` holds every benchmark with its source, method and as-of quarter; the UI tooltips read from it. `src/data/schema.ts` (Zod) validates ranges and fails CI if an engine attribute has no cited source.
- `src/data/taxRules.ts` carries the legal basis and effective date for each rule. Items flagged `verify` may have changed in recent Finance Acts.
- `src/data/signals.ts` is a curated analyst feed. Each signal is a quantified input shock, not a live data source.

## Data caveats

Benchmarks are **indicative** (Q3 2026) and compiled from public sources: consultant press releases, NASSCOM/Zinnov summaries, public salary surveys and state policies. They are not licensed Radford/Aon or CBRE/JLL datasets. Validate with licensed data and a qualified tax adviser before committing capital.

## Roadmap

- AHP pairwise-comparison mode with consistency ratio
- India map view (d3-geo + open TopoJSON)
- Saved scenarios and an admin form for signals (Supabase)
- Analyst workflow to refresh benchmarks quarterly
