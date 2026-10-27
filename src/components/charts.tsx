"use client";

import { Area, Bar, BarChart, CartesianGrid, ComposedChart, Legend, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { COST_LINES, COST_LINE_LABEL, type MonthRow, type YearRow } from "@/engine/tco";
import { usd } from "@/lib/format";

const AXIS = { stroke: "var(--muted)", fontSize: 11, tickLine: false, axisLine: { stroke: "var(--line)" } } as const;
const SERIES = (i: number) => `var(--series-${i + 1})`;

interface TipProps {
  active?: boolean;
  payload?: readonly { dataKey?: unknown; name?: unknown; value?: unknown; color?: string }[];
  label?: unknown;
  labelFmt?: (l: unknown) => string;
}

function Tip({ active, payload, label, labelFmt }: TipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-panel px-3 py-2 text-xs shadow-lg">
      <div className="mb-1 font-semibold">{labelFmt ? labelFmt(label) : String(label)}</div>
      {payload.map((p) => (
        <div key={String(p.dataKey)} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted">
            <span className="h-2 w-2 rounded-sm" style={{ background: p.color }} />
            {String(p.name)}
          </span>
          <span className="font-medium tabular-nums">{Array.isArray(p.value) ? `${usd(Number(p.value[0]))} – ${usd(Number(p.value[1]))}` : usd(Number(p.value))}</span>
        </div>
      ))}
    </div>
  );
}

const legendStyle = { fontSize: 11, color: "var(--muted)" };

export function CostStackChart({ years }: { years: YearRow[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={years} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
        <CartesianGrid vertical={false} stroke="var(--grid)" />
        <XAxis dataKey="year" tickFormatter={(y) => `Y${y}`} {...AXIS} />
        <YAxis tickFormatter={(v) => usd(v, 0)} width={56} {...AXIS} />
        <Tooltip cursor={{ fill: "var(--panel-2)" }} content={(p) => <Tip active={p.active} payload={p.payload} label={p.label} labelFmt={(l) => `Year ${l}`} />} />
        <Legend wrapperStyle={legendStyle} iconType="square" iconSize={8} />
        {COST_LINES.map((k, i) => (
          <Bar key={k} dataKey={k} name={COST_LINE_LABEL[k]} stackId="c" fill={SERIES(i)} stroke="var(--panel)" strokeWidth={1} radius={i === COST_LINES.length - 1 ? [4, 4, 0, 0] : 0} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CumulativeChart({ months, payback }: { months: MonthRow[]; payback: number | null }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={months} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--grid)" />
        <XAxis dataKey="month" ticks={[12, 24, 36, 48, 60]} tickFormatter={(m) => `M${m}`} {...AXIS} />
        <YAxis tickFormatter={(v) => usd(v, 0)} width={56} {...AXIS} />
        <Tooltip content={(p) => <Tip active={p.active} payload={p.payload} label={p.label} labelFmt={(l) => `Month ${l}`} />} />
        <ReferenceLine y={0} stroke="var(--muted)" strokeDasharray="3 3" />
        {payback !== null && <ReferenceLine x={payback} stroke="var(--good)" label={{ value: `Payback M${payback}`, fill: "var(--good)", fontSize: 11, position: "insideTopLeft" }} />}
        <Area dataKey="cumSavings" name="Cumulative savings vs onshore" stroke={SERIES(0)} strokeWidth={2} fill={SERIES(0)} fillOpacity={0.12} dot={false} activeDot={{ r: 4 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function FanChart({ p10, p50, p90, baseline }: { p10: number[]; p50: number[]; p90: number[]; baseline: number[] }) {
  const data = p50.map((v, i) => ({ month: i + 1, band: [p10[i], p90[i]], p50: v, baseline: baseline[i] }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--grid)" />
        <XAxis dataKey="month" ticks={[12, 24, 36, 48, 60]} tickFormatter={(m) => `M${m}`} {...AXIS} />
        <YAxis tickFormatter={(v) => usd(v, 0)} width={56} {...AXIS} />
        <Tooltip content={(p) => <Tip active={p.active} payload={p.payload} label={p.label} labelFmt={(l) => `Month ${l}`} />} />
        <Legend wrapperStyle={legendStyle} iconSize={8} />
        <ReferenceLine y={0} stroke="var(--muted)" strokeDasharray="3 3" />
        <Area dataKey="band" name="P10–P90 range" stroke="none" fill={SERIES(0)} fillOpacity={0.18} />
        <Line dataKey="p50" name="P50 (stressed)" stroke={SERIES(0)} strokeWidth={2} dot={false} />
        <Line dataKey="baseline" name="Baseline" stroke={SERIES(1)} strokeWidth={2} strokeDasharray="5 4" dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
