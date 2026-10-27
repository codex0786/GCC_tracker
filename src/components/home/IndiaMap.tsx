"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import type { Market, MarketId } from "@/data/types";
import type { MarketScore } from "@/engine/mcda";
import type { HubSpokeResult } from "@/engine/evaluate";
import type { TalentResult } from "@/engine/talent";

// Simplified mainland outline (lon, lat), drawn as a stylised low-poly silhouette.
const OUTLINE: [number, number][] = [
  [68.8, 24.3], [68.2, 23.6], [69.0, 22.4], [70.3, 20.9], [71.6, 20.9], [72.6, 21.6], [72.8, 20.4], [72.8, 19.0], [73.3, 17.0],
  [73.9, 15.4], [74.8, 12.9], [75.8, 11.2], [76.3, 9.9], [76.9, 8.5], [77.5, 8.1], [78.2, 8.9], [79.3, 10.3], [79.8, 11.6],
  [80.3, 13.1], [80.1, 15.2], [80.9, 15.9], [81.3, 16.4], [82.3, 16.6], [83.3, 17.7], [84.8, 19.2], [86.4, 20.0], [87.0, 21.5],
  [88.1, 21.6], [89.0, 21.8], [88.8, 22.9], [88.6, 24.2], [88.1, 24.5], [88.7, 25.3], [88.4, 26.0], [89.9, 26.0], [91.2, 25.2],
  [92.4, 25.0], [92.2, 24.1], [91.7, 23.1], [92.3, 22.0], [92.7, 21.9], [93.4, 22.9], [94.2, 23.9], [94.6, 25.1], [95.3, 26.6],
  [96.8, 27.3], [97.3, 28.2], [96.2, 29.2], [94.5, 29.3], [92.5, 28.0], [92.0, 26.9], [90.5, 26.8], [89.1, 26.8], [88.9, 27.3],
  [88.8, 28.1], [88.1, 27.8], [88.1, 26.5], [86.0, 26.5], [84.1, 27.4], [82.8, 27.5], [81.2, 28.6], [80.1, 28.8], [80.8, 30.2],
  [79.0, 31.2], [78.7, 32.6], [79.5, 33.0], [78.8, 34.3], [80.2, 35.5], [77.8, 35.5], [76.5, 36.0], [75.0, 37.0], [74.1, 36.9],
  [73.3, 35.8], [73.6, 34.6], [74.3, 33.0], [74.6, 32.5], [74.6, 31.1], [73.9, 30.0], [73.3, 29.0], [72.0, 27.9], [70.6, 27.9],
  [69.6, 26.7], [70.2, 25.7], [69.6, 24.4],
];

const K = 10;
const COS = Math.cos((22 * Math.PI) / 180);
const project = (lon: number, lat: number): [number, number] => [(lon - 67.5) * COS * K, (37.6 - lat) * K];
const PATH = "M" + OUTLINE.map(([lon, lat]) => project(lon, lat).map((v) => v.toFixed(1)).join(",")).join("L") + "Z";
const W = (98 - 67.5) * COS * K;
const H = (37.6 - 7.5) * K;

// Label placement avoids the Bengaluru / Chennai cluster.
const LABEL: Record<MarketId, { dx: number; dy: number; anchor: "start" | "end" }> = {
  "gift-city": { dx: -10, dy: 4, anchor: "end" },
  "pune-hinjawadi": { dx: -10, dy: 4, anchor: "end" },
  "hyd-fd": { dx: 15, dy: 4, anchor: "start" },
  "blr-north": { dx: -12, dy: -10, anchor: "end" },
  "blr-orr": { dx: 12, dy: 20, anchor: "start" },
  "chennai-omr": { dx: 14, dy: 2, anchor: "start" },
  coimbatore: { dx: -10, dy: 2, anchor: "end" },
  kochi: { dx: -10, dy: 8, anchor: "end" },
};
const SHORT: Record<MarketId, string> = {
  "gift-city": "GIFT City",
  "pune-hinjawadi": "Pune",
  "hyd-fd": "Hyderabad FD",
  "blr-north": "Bengaluru N",
  "blr-orr": "Bengaluru ORR",
  "chennai-omr": "Chennai OMR",
  coimbatore: "Coimbatore",
  kochi: "Kochi",
};

function arc(a: Market, b: Market) {
  const [x1, y1] = project(a.lon, a.lat);
  const [x2, y2] = project(b.lon, b.lat);
  const mx = (x1 + x2) / 2 - (y2 - y1) * 0.35;
  const my = (y1 + y2) / 2 + (x2 - x1) * 0.35;
  return `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
}

export function IndiaMap({
  ranking,
  talent,
  selected,
  hubSpoke,
  onSelect,
}: {
  ranking: MarketScore[];
  talent: Record<MarketId, TalentResult>;
  selected: MarketId;
  hubSpoke: HubSpokeResult;
  onSelect: (id: MarketId) => void;
}) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<MarketId | null>(null);
  const top = ranking[0].market.id;
  const best = hubSpoke.best;
  const hovered = ranking.find((r) => r.market.id === hover);
  const min = Math.min(...ranking.map((r) => r.score));
  const max = Math.max(...ranking.map((r) => r.score));

  return (
    <div className="relative">
      <svg viewBox={`-10 -10 ${W + 20} ${H + 10}`} className="mx-auto h-auto max-h-[440px] w-full" role="img" aria-label="Map of India with ranked GCC micro-markets">
        <defs>
          <pattern id="map-dots" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.1" fill="var(--accent)" opacity="0.28" />
          </pattern>
          <linearGradient id="map-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0.1" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <motion.path
          d={PATH}
          fill="url(#map-fill)"
          stroke="var(--accent)"
          strokeOpacity={0.45}
          strokeWidth={1.2}
          strokeLinejoin="round"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        />
        <path d={PATH} fill="url(#map-dots)" />

        {best.spoke && <path d={arc(best.hub, best.spoke)} fill="none" stroke="var(--series-3)" strokeWidth={2} className="flow-dash" />}

        {ranking.map((r) => {
          const m = r.market;
          const [x, y] = project(m.lon, m.lat);
          const t = (r.score - min) / Math.max(1, max - min);
          const radius = 4 + t * 6;
          const isSel = m.id === selected;
          const lbl = LABEL[m.id];
          return (
            <g
              key={m.id}
              role="button"
              tabIndex={0}
              aria-label={`${m.name}, rank ${r.rank}, score ${r.score.toFixed(1)}`}
              className="cursor-pointer outline-none"
              onMouseEnter={() => setHover(m.id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(m.id)}
              onBlur={() => setHover(null)}
              onClick={() => onSelect(m.id)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(m.id)}
            >
              <circle cx={x} cy={y} r={16} fill="transparent" />
              {m.id === top && <circle cx={x} cy={y} r={radius} fill="var(--series-1)" className="pulse-ring" />}
              <motion.circle
                cx={x}
                cy={y}
                initial={false}
                animate={{ r: radius, opacity: 0.35 + t * 0.65 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                fill="var(--series-1)"
                stroke="var(--panel)"
                strokeWidth={1.5}
              />
              {isSel && <circle cx={x} cy={y} r={radius + 4} fill="none" stroke="var(--ink)" strokeWidth={1.5} strokeDasharray="2 2" />}
              <text x={x + lbl.dx} y={y + lbl.dy} textAnchor={lbl.anchor} className={`text-[9px] ${hover === m.id || isSel ? "fill-[var(--ink)] font-semibold" : "fill-[var(--muted)]"}`}>
                {SHORT[m.id]}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute right-0 top-0 min-h-[92px] w-44 rounded-lg border border-line bg-panel/90 p-2.5 text-xs shadow-sm backdrop-blur">
        {hovered ? (
          <>
            <div className="font-semibold">{hovered.market.name}</div>
            <div className="mt-1 flex justify-between text-muted"><span>Rank</span><span className="text-ink">#{hovered.rank}</span></div>
            <div className="flex justify-between text-muted"><span>Score</span><span className="text-ink">{hovered.score.toFixed(1)}</span></div>
            <div className="flex justify-between text-muted"><span>Rent</span><span className="text-ink">₹{hovered.market.rentInrSqft}/sq.ft</span></div>
            <div className="flex justify-between text-muted"><span>LCI</span><span className={talent[hovered.market.id].lci < 45 ? "text-bad" : "text-ink"}>{talent[hovered.market.id].lci.toFixed(0)}</span></div>
          </>
        ) : (
          <div className="text-muted">
            <div className="font-semibold text-ink">Hover a market</div>
            Dot size shows the composite score. The pulse marks the leader; click a dot to model it.
          </div>
        )}
      </div>
      {best.spoke && (
        <div className="mt-1 flex items-center gap-2 text-[11px] text-muted">
          <svg width="28" height="6" aria-hidden>
            <line x1="0" y1="3" x2="28" y2="3" stroke="var(--series-3)" strokeWidth="2" className="flow-dash" />
          </svg>
          Recommended spoke: {Math.round(best.spokeShare * 100)}% of L1–L4 roles from {best.hub.name} to {best.spoke.name}
        </div>
      )}
    </div>
  );
}
