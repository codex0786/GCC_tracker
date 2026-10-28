"use client";

import { Download, FileSpreadsheet, FileText, Link2, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { isToolPath, shareHash, useScenarioUrlSync, useStore } from "@/lib/store";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/learn", label: "Learn" },
  { href: "/markets", label: "Markets" },
  { href: "/tools", label: "Tools" },
  { href: "/methodology", label: "Method" },
];

const TOOLS_NAV = [
  { href: "/tools", label: "Cockpit" },
  { href: "/location", label: "Location" },
  { href: "/financials", label: "5-Year TCO" },
  { href: "/stress-test", label: "Stress test" },
  { href: "/benchmark", label: "Benchmark my GCC" },
];

const pill = { type: "spring", stiffness: 420, damping: 34 } as const;

export function AppHeader() {
  const path = usePathname();
  useScenarioUrlSync(path);
  const inTools = isToolPath(path);
  const showExports = inTools && path !== "/benchmark";
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

  const active = (href: string) => (href === "/" ? path === "/" : href === "/tools" ? inTools : path.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-panel/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-[var(--series-1)] to-[var(--series-7)] text-xs font-bold text-white shadow-md shadow-accent/30" aria-hidden>GT</span>
          <span>GCC Tracker</span>
          <span className="hidden text-xs font-normal text-muted lg:inline">India GCC intelligence</span>
        </Link>
        <nav aria-label="Main" className="relative isolate order-3 -mx-1 flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`relative whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors ${active(n.href) ? "font-medium text-accent" : "text-muted hover:text-ink"}`}
            >
              {active(n.href) && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-md bg-accent-soft" transition={pill} />}
              {n.label}
            </Link>
          ))}
        </nav>
        {showExports ? (
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
        ) : (
          <Link href="/tools" className="ml-auto hidden rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white shadow-md shadow-accent/25 transition hover:-translate-y-0.5 sm:inline-block">
            Model a GCC →
          </Link>
        )}
      </div>
      {inTools && (
        <div className="border-t border-line/70">
          <nav aria-label="Tools" className="relative isolate mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-1.5 sm:px-6">
            {TOOLS_NAV.map((n) => {
              const on = path === n.href;
              return (
                <Link key={n.href} href={n.href} className={`relative whitespace-nowrap rounded-md px-2.5 py-1 text-xs transition-colors ${on ? "font-medium text-ink" : "text-muted hover:text-ink"}`}>
                  {on && <motion.span layoutId="tools-pill" className="absolute inset-0 -z-10 rounded-md bg-panel-2" transition={pill} />}
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
