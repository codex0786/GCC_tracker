"use client";

import { Download, FileSpreadsheet, FileText, Link2, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { shareHash, useScenarioUrlSync, useStore } from "@/lib/store";

const NAV = [
  { href: "/", label: "Briefing" },
  { href: "/location", label: "Location" },
  { href: "/financials", label: "5-Year TCO" },
  { href: "/stress-test", label: "Stress test" },
];

export function AppHeader() {
  const path = usePathname();
  useScenarioUrlSync(path);
  const [busy, setBusy] = useState<"pdf" | "xlsx" | null>(null);
  const [copied, setCopied] = useState(false);

  async function run(kind: "pdf" | "xlsx") {
    setBusy(kind);
    try {
      const scenario = useStore.getState().scenario;
      if (kind === "pdf") await (await import("@/export/memo")).downloadMemo(scenario);
      else await (await import("@/export/workbook")).downloadWorkbook(scenario);
    } finally {
      setBusy(null);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.origin + window.location.pathname + shareHash());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-panel/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-[var(--series-1)] to-[var(--series-7)] text-xs font-bold text-white shadow-md shadow-accent/30">GN</span>
          <span>GCC-Nexus</span>
          <span className="hidden text-xs font-normal text-muted sm:inline">India Strategic Advisory Engine</span>
        </Link>
        <nav className="relative isolate order-3 -mx-1 flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto">
          {NAV.map((n) => {
            const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`relative whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors ${active ? "font-medium text-accent" : "text-muted hover:text-ink"}`}
              >
                {active && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-md bg-accent-soft" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={copyLink} className="hidden items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs text-muted hover:text-ink md:flex" title="Copy a link to this exact scenario">
            <Link2 size={14} /> {copied ? "Copied" : "Share"}
          </button>
          <button onClick={() => run("xlsx")} disabled={!!busy} className="flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs hover:border-accent disabled:opacity-60">
            {busy === "xlsx" ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />} Excel
          </button>
          <button onClick={() => run("pdf")} disabled={!!busy} className="flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60">
            {busy === "pdf" ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
            <span className="hidden sm:inline">Board memo</span> <Download size={12} className="sm:hidden" />
          </button>
        </div>
      </div>
    </header>
  );
}
