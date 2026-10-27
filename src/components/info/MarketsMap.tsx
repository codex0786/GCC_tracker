"use client";

import { useRouter } from "next/navigation";
import { IndiaMap } from "@/components/home/IndiaMap";
import { useEvaluation, useScenario } from "@/lib/store";

/** The cockpit map, reused as a city picker: clicking a dot opens that city's profile. */
export function MarketsMap() {
  const router = useRouter();
  const s = useScenario();
  const e = useEvaluation();
  return (
    <IndiaMap
      ranking={e.ranking}
      talent={e.talent}
      selected={s.marketId}
      hubSpoke={e.hubSpoke}
      showFlow={false}
      hint="Dot size reflects a balanced suitability score for the current function. Click a city to open its profile."
      onSelect={(id) => router.push(`/markets/${id}`)}
    />
  );
}
