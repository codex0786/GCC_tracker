"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Term } from "@/content/glossary";

export function GlossaryList({ terms }: { terms: Term[] }) {
  const [q, setQ] = useState("");
  const shown = terms.filter((t) => `${t.term} ${t.short}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <label className="relative block">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter terms…"
          aria-label="Filter glossary terms"
          className="w-full rounded-xl border border-line bg-panel py-2.5 pl-9 pr-3 text-sm focus:border-accent focus:outline-none"
        />
      </label>
      <dl className="mt-5 divide-y divide-line rounded-xl border border-line bg-panel">
        {shown.map((t) => (
          <div key={t.term} id={t.term.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="grid gap-1 p-4 sm:grid-cols-[220px_1fr] sm:gap-4">
            <dt className="font-semibold">{t.term}</dt>
            <dd className="text-sm text-ink/85">
              {t.short}
              {t.href && (
                <Link href={t.href} className="ml-1.5 whitespace-nowrap text-accent hover:underline">
                  Learn more →
                </Link>
              )}
            </dd>
          </div>
        ))}
        {shown.length === 0 && <p className="p-4 text-sm text-muted">No terms match “{q}”.</p>}
      </dl>
    </div>
  );
}
