"use client";

import { FUNCTIONS } from "@/data/benchmarks";
import { BANDS, FUNCTION_IDS, type FunctionId } from "@/data/types";
import { rebalance } from "@/engine/scenario";
import { useScenario, useStore } from "@/lib/store";
import { Card, NumberField, Select, Slider } from "./ui";

/** Function, headcount ramp and seniority mix: the inputs every engine shares. */
export function ScenarioPanel({ showMix = true }: { showMix?: boolean }) {
  const s = useScenario();
  const { set, setIn } = useStore.getState();
  return (
    <Card title="Mandate">
      <div className="space-y-3">
        <Select<FunctionId>
          label="Target function"
          value={s.fn}
          options={FUNCTION_IDS.map((id) => ({ value: id, label: FUNCTIONS[id].label }))}
          onChange={(fn) => set({ fn, compute: FUNCTIONS[fn].defaultCompute })}
        />
        <div className="grid grid-cols-3 gap-2">
          <NumberField label="Day-1 HC" value={s.headcount.day1} onChange={(v) => setIn("headcount", { day1: v })} />
          <NumberField label="Year-3 HC" value={s.headcount.y3} onChange={(v) => setIn("headcount", { y3: v })} />
          <NumberField label="Year-5 HC" value={s.headcount.y5} onChange={(v) => setIn("headcount", { y5: v })} />
        </div>
        {showMix && (
          <div className="space-y-2 pt-1">
            <div className="text-xs font-semibold text-muted">Seniority mix</div>
            {BANDS.map((b) => (
              <Slider key={b} label={b} value={s.mix[b]} min={0} max={80} unit="%" onChange={(v) => set({ mix: rebalance(s.mix, b, v) })} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
