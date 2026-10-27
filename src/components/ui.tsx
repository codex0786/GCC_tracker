"use client";

import { AlertTriangle, CircleAlert, Info as InfoIcon, Lightbulb } from "lucide-react";
import type { ReactNode } from "react";
import type { SourceMeta } from "@/data/types";
import type { Alert } from "@/engine/talent";
import { CountUp } from "./motion";

export function Card({ title, info, action, children, className = "" }: { title?: ReactNode; info?: Partial<SourceMeta>; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-line bg-panel p-4 sm:p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex items-start justify-between gap-3">
          {title && (
            <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
              {title}
              {info && <Info meta={info} />}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** Assumption tooltip: source, method and as-of quarter for any metric. */
export function Info({ meta }: { meta: Partial<SourceMeta> }) {
  return (
    <span className="group relative inline-flex">
      <button type="button" aria-label="Show source and method" className="text-muted hover:text-accent focus:text-accent focus:outline-none">
        <InfoIcon size={14} />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-5 z-30 hidden w-72 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-lg border border-line bg-panel p-3 text-left text-xs font-normal leading-relaxed text-ink shadow-lg group-hover:block group-focus-within:block"
      >
        {meta.label && <span className="block font-semibold">{meta.label}{meta.unit ? ` (${meta.unit})` : ""}</span>}
        {meta.method && <span className="mt-1 block"><b className="text-muted">Method:</b> {meta.method}</span>}
        {meta.source && <span className="mt-1 block"><b className="text-muted">Source:</b> {meta.source}</span>}
        {meta.asOf && <span className="mt-1 block"><b className="text-muted">As of:</b> {meta.asOf}</span>}
      </span>
    </span>
  );
}

export function Kpi({ label, value, num, format, sub, info, tone }: { label: string; value?: string; num?: number; format?: (n: number) => string; sub?: ReactNode; info?: Partial<SourceMeta>; tone?: "good" | "bad" | "warn" }) {
  const color = tone === "good" ? "text-good" : tone === "bad" ? "text-bad" : tone === "warn" ? "text-warn" : "text-ink";
  return (
    <div role="group" aria-label={label} className="rounded-xl border border-line bg-panel p-4 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/10">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted">
        {label}
        {info && <Info meta={info} />}
      </div>
      <div className={`mt-1 text-2xl font-semibold tracking-tight ${color}`}>{num !== undefined && format ? <CountUp value={num} format={format} /> : value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </div>
  );
}

export function Slider({ label, value, min, max, step = 1, unit = "", onChange, info, format }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void; info?: Partial<SourceMeta>; format?: (v: number) => string }) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium text-muted">
          {label}
          {info && <Info meta={info} />}
        </span>
        <span className="font-semibold tabular-nums">{format ? format(value) : `${value}${unit}`}</span>
      </div>
      <input type="range" aria-label={label} className="w-full" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

export function Select<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value as T)} className="w-full rounded-lg border border-line bg-panel px-2.5 py-2 text-sm focus:border-accent focus:outline-none">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function NumberField({ label, value, onChange, min = 0, max = 100000 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      <input
        type="number"
        aria-label={label}
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))}
        className="w-full rounded-lg border border-line bg-panel px-2.5 py-2 text-sm tabular-nums focus:border-accent focus:outline-none"
      />
    </label>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
      <span>{label}</span>
      <input type="checkbox" className="h-4 w-4 accent-[var(--accent)]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

const ALERT_STYLE = {
  red: { icon: CircleAlert, cls: "border-bad/40 bg-bad/5", tone: "text-bad", tag: "Red flag" },
  amber: { icon: AlertTriangle, cls: "border-warn/40 bg-warn/5", tone: "text-warn", tag: "Watch" },
  info: { icon: Lightbulb, cls: "border-accent/30 bg-accent-soft/50", tone: "text-accent", tag: "Opportunity" },
};

export function AlertList({ alerts, empty = "No red flags for this configuration." }: { alerts: Alert[]; empty?: string }) {
  if (alerts.length === 0) return <p className="text-sm text-muted">{empty}</p>;
  const order = { red: 0, amber: 1, info: 2 };
  return (
    <ul className="space-y-2">
      {[...alerts].sort((a, b) => order[a.level] - order[b.level]).map((a, i) => {
        const s = ALERT_STYLE[a.level];
        const Icon = s.icon;
        return (
          <li key={i} className={`flex gap-2.5 rounded-lg border p-3 text-sm ${s.cls}`}>
            <Icon size={16} className={`mt-0.5 shrink-0 ${s.tone}`} aria-hidden />
            <div>
              <div className="font-semibold">
                <span className={`mr-1.5 text-xs uppercase tracking-wide ${s.tone}`}>{s.tag}</span>
                {a.title}
              </div>
              <div className="mt-0.5 text-muted">{a.detail}</div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function PageTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-accent">{eyebrow}</div>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
      {children && <p className="mt-1.5 max-w-3xl text-sm text-muted">{children}</p>}
    </div>
  );
}
