"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { CITY_COUNTS } from "@/content/facts";

export function CityBars() {
  const reduce = useReducedMotion();
  const max = Math.max(...CITY_COUNTS.map((c) => c.count));
  return (
    <ul className="space-y-2.5">
      {CITY_COUNTS.map((c, i) => (
        <li key={c.city}>
          <Link href={`/markets/${c.markets[0]}`} className="group grid grid-cols-[92px_1fr_44px] items-center gap-3 text-sm">
            <span className="truncate group-hover:text-accent">{c.city}</span>
            <span className="h-3 overflow-hidden rounded-full bg-panel-2">
              <motion.span
                className="block h-full rounded-full bg-[var(--series-1)] group-hover:bg-[var(--series-7)]"
                initial={reduce ? false : { width: 0 }}
                whileInView={{ width: `${(c.count / max) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                style={reduce ? { width: `${(c.count / max) * 100}%` } : undefined}
              />
            </span>
            <span className="text-right font-semibold tabular-nums">{c.count}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
