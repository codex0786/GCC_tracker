"use client";

import type { Fact } from "@/content/facts";
import { SOURCES } from "@/content/sources";
import { CountUp, Reveal } from "../motion";

const FORMAT: Record<Fact["format"], (n: number) => string> = {
  int: (n) => Math.round(n).toLocaleString("en-IN"),
  usdB: (n) => `$${n.toFixed(1)}B`,
  millions: (n) => `${n.toFixed(2)}M`,
  pct: (n) => `${Math.round(n * 100)}%`,
};

export function StatCounters({ facts }: { facts: Fact[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {facts.map((f, i) => (
        <Reveal key={f.label} delay={0.1 + i * 0.08}>
          <div className="h-full rounded-2xl border border-line bg-panel/80 p-4 shadow-sm backdrop-blur">
            <div className="text-3xl font-semibold tracking-tight">
              <CountUp value={f.value} format={FORMAT[f.format]} duration={1400} />
            </div>
            <div className="mt-1 text-sm">{f.label}</div>
            {f.note && <div className="text-xs text-muted">{f.note}</div>}
            <a href={SOURCES[f.source].url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[11px] text-muted underline decoration-dotted underline-offset-2 hover:text-accent">
              {SOURCES[f.source].publisher}, {SOURCES[f.source].date}
            </a>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
