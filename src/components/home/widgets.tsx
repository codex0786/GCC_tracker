"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Activity, Building2, Cpu, Landmark, Users } from "lucide-react";
import type { ReactNode } from "react";
import { SIGNALS, type SignalKind } from "@/data/signals";
import { BANDS, type MarketId } from "@/data/types";
import type { MarketScore } from "@/engine/mcda";
import { STAGES, STAGE_LABEL, type Anchors } from "@/engine/scenario";
import { COST_LINES, COST_LINE_LABEL, type YearRow } from "@/engine/tco";
import { int, usd } from "@/lib/format";
import { CountUp } from "../motion";

const spring = { type: "spring", stiffness: 260, damping: 30 } as const;

export function ScoreRing({ score, size = 112 }: { score: number; size?: number }) {
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={8} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - score / 100) }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--series-1)" />
            <stop offset="1" stopColor="var(--series-7)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-2xl font-semibold tracking-tight">
            <CountUp value={score} format={(n) => n.toFixed(1)} />
          </div>
          <div className="text-[10px] uppercase tracking-wider text-muted">of 100</div>
        </div>
      </div>
    </div>
  );
}

export function Sparkline({ values, className = "" }: { values: number[]; className?: string }) {
  const w = 120;
  const h = 32;
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => [(i / (values.length - 1)) * w, h - ((v - min) / (max - min || 1)) * (h - 4) - 2]);
  const d = "M" + pts.map((p) => p.map((x) => x.toFixed(1)).join(",")).join("L");
  const zero = h - ((0 - min) / (max - min || 1)) * (h - 4) - 2;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`h-8 w-full ${className}`} preserveAspectRatio="none" aria-hidden>
      <line x1={0} x2={w} y1={zero} y2={zero} stroke="var(--line)" strokeDasharray="2 3" />
      <motion.path fill="none" stroke="var(--series-1)" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" initial={false} animate={{ d }} transition={{ duration: 0.6, ease: "easeOut" }} />
    </svg>
  );
}

export function StatTile({
  label,
  value,
  format,
  sub,
  spark,
  tone,
  icon,
}: {
  label: string;
  value: number;
  format: (n: number) => string;
  sub?: ReactNode;
  spark?: number[];
  tone?: "good" | "bad";
  icon?: ReactNode;
}) {
  return (
    <motion.div
      role="group"
      aria-label={label}
      whileHover={{ y: -3 }}
      transition={spring}
      className="group relative overflow-hidden rounded-xl border border-line bg-panel p-4 shadow-sm transition-shadow hover:shadow-lg hover:shadow-accent/10"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
      <div className="flex items-center justify-between text-xs font-medium text-muted">
        {label}
        <span className="text-accent/70">{icon}</span>
      </div>
      <div className={`mt-1 text-2xl font-semibold tracking-tight ${tone === "good" ? "text-good" : tone === "bad" ? "text-bad" : ""}`}>
        <CountUp value={value} format={format} />
      </div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
      {spark && <Sparkline values={spark} className="mt-2" />}
    </motion.div>
  );
}

const CRIT_COLORS = [1, 2, 3, 4, 5].map((i) => `var(--series-${i})`);

export function RankingRace({ ranking, selected, onSelect }: { ranking: MarketScore[]; selected: MarketId; onSelect: (id: MarketId) => void }) {
  const reduce = useReducedMotion();
  return (
    <ol className="space-y-1.5">
      {ranking.map((r) => (
        <motion.li key={r.market.id} layout={!reduce} transition={spring}>
          <button
            onClick={() => onSelect(r.market.id)}
            className={`group flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-panel-2 ${r.market.id === selected ? "bg-accent-soft/60" : ""}`}
          >
            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${r.rank === 1 ? "bg-accent text-white" : "bg-panel-2 text-muted"}`}>{r.rank}</span>
            <span className="w-28 shrink-0 truncate text-sm sm:w-36">{r.market.name}</span>
            <span className="flex h-2.5 flex-1 gap-[2px] overflow-hidden rounded-full bg-panel-2">
              {Object.values(r.contribution).map((v, i) => (
                <motion.span key={i} className="h-full" style={{ background: CRIT_COLORS[i] }} initial={false} animate={{ width: `${v}%` }} transition={spring} />
              ))}
            </span>
            <span className="w-9 text-right text-sm font-semibold tabular-nums">
              <CountUp value={r.score} format={(n) => n.toFixed(1)} duration={500} />
            </span>
          </button>
        </motion.li>
      ))}
    </ol>
  );
}

export function CostComposition({ years }: { years: YearRow[] }) {
  const totals = COST_LINES.map((k) => ({ k, v: years.reduce((a, y) => a + y[k], 0) })).filter((x) => x.v > 0);
  const sum = totals.reduce((a, x) => a + x.v, 0);
  return (
    <div>
      <div className="flex h-4 gap-[2px] overflow-hidden rounded-full">
        {totals.map(({ k, v }) => (
          <motion.div
            key={k}
            title={`${COST_LINE_LABEL[k]}: ${usd(v)}`}
            style={{ background: `var(--series-${COST_LINES.indexOf(k) + 1})` }}
            initial={{ width: 0 }}
            animate={{ width: `${(v / sum) * 100}%` }}
            transition={spring}
          />
        ))}
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        {totals.map(({ k, v }) => (
          <li key={k} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-muted">
              <span className="h-2 w-2 rounded-sm" style={{ background: `var(--series-${COST_LINES.indexOf(k) + 1})` }} />
              {COST_LINE_LABEL[k]}
            </span>
            <span className="tabular-nums">{v / sum < 0.005 ? "<1" : Math.round((v / sum) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HeadcountPyramid({ anchors }: { anchors: Anchors }) {
  const totals = STAGES.map((st) => BANDS.reduce((a, b) => a + anchors[b][st], 0));
  const max = Math.max(...totals, 1);
  return (
    <div>
      <div className="flex h-36 items-end gap-4">
        {STAGES.map((st, i) => (
          <div key={st} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className="text-xs font-semibold tabular-nums">
              <CountUp value={totals[i]} format={int} />
            </span>
            <motion.div className="flex w-full max-w-16 flex-col-reverse gap-[2px] overflow-hidden rounded-t-md" initial={{ height: 0 }} animate={{ height: `${(totals[i] / max) * 100}%` }} transition={spring}>
              {BANDS.map((b, j) => (
                <motion.div key={b} title={`${b}: ${int(anchors[b][st])}`} style={{ background: `var(--series-${j + 1})` }} initial={false} animate={{ flexGrow: anchors[b][st] }} transition={spring} className="min-h-[2px]" />
              ))}
            </motion.div>
            <span className="text-[11px] text-muted">{STAGE_LABEL[st]}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
        {BANDS.map((b, j) => (
          <span key={b} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm" style={{ background: `var(--series-${j + 1})` }} />
            {b}
          </span>
        ))}
      </div>
    </div>
  );
}

const KIND_ICON: Record<SignalKind, typeof Activity> = { cre: Building2, wage: Users, policy: Landmark, automation: Cpu };

export function SignalTicker() {
  const items = [...SIGNALS].sort((a, b) => b.date.localeCompare(a.date));
  const row = (hidden: boolean) =>
    items.map((s) => {
      const Icon = KIND_ICON[s.kind];
      return (
        <span key={`${s.id}-${hidden}`} aria-hidden={hidden} className="mx-6 flex items-center gap-2 whitespace-nowrap text-sm">
          <Icon size={14} className="text-accent" />
          <span className="text-muted">{s.date.slice(5)}</span>
          <span>{s.headline}</span>
        </span>
      );
    });
  return (
    <div className="ticker overflow-hidden py-2.5">
      <div className="ticker-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

export function LiveDot() {
  return (
    <span className="relative inline-flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-good opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-good" />
    </span>
  );
}

export function Fade({ k, children }: { k: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span key={k} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="inline-block">
        {children}
      </motion.span>
    </AnimatePresence>
  );
}
