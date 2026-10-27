"use client";

import { FUNCTIONS } from "@/data/benchmarks";
import { BANDS, FUNCTION_IDS, type FunctionId } from "@/data/types";
import { useState } from "react";
import { STAGES, STAGE_LABEL, rebalance, type Stage } from "@/engine/scenario";
import { useScenario, useStore } from "@/lib/store";
import { Card, NumberField, Select, Slider } from "./ui";

/** Function, headcount ramp and seniority mix: the inputs every engine shares. */
export function ScenarioPanel({ showMix = true }: { showMix?: boolean }) {
  const s = useScenario();
  const { set, setIn } = useStore.getState();
  const [stage, setStage] = useState<Stage>("y3");
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
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted">Seniority mix</span>
              <div role="tablist" aria-label="Headcount stage" className="flex rounded-md border border-line p-0.5 text-xs">
                {STAGES.map((st) => (
                  <button
                    key={st}
                    role="tab"
                    aria-selected={stage === st}
                    onClick={() => setStage(st)}
                    className={`rounded px-2 py-0.5 ${stage === st ? "bg-accent-soft font-medium text-accent" : "text-muted hover:text-ink"}`}
                  >
                    {STAGE_LABEL[st]}
                  </button>
                ))}
              </div>
            </div>
            {BANDS.map((b) => (
              <Slider key={b} label={b} value={s.mix[stage][b]} min={0} max={80} unit="%" onChange={(v) => setIn("mix", { [stage]: rebalance(s.mix[stage], b, v) })} />
            ))}
            <p className="text-[11px] text-muted">Bands ramp linearly between Day 1, Year 3 and Year 5.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
