import { AlertTriangle, Info } from "lucide-react";
import type { Block } from "@/content/learn";

function BlockView({ b }: { b: Block }) {
  if ("p" in b) return <p className="leading-relaxed text-ink/90">{b.p}</p>;
  if ("list" in b)
    return (
      <ul className="space-y-1.5">
        {b.list.map((x) => (
          <li key={x} className="flex gap-2.5 leading-relaxed">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <span>{x}</span>
          </li>
        ))}
      </ul>
    );
  if ("callout" in b) {
    const warn = b.tone === "warn";
    const Icon = warn ? AlertTriangle : Info;
    return (
      <div className={`flex gap-3 rounded-xl border p-4 text-sm ${warn ? "border-warn/40 bg-warn/5" : "border-accent/30 bg-accent-soft/50"}`}>
        <Icon size={17} className={`mt-0.5 shrink-0 ${warn ? "text-warn" : "text-accent"}`} aria-hidden />
        <p className="leading-relaxed">{b.callout}</p>
      </div>
    );
  }
  if ("table" in b)
    return (
      <div className="-mx-4 overflow-x-auto px-4">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted">
              {b.table.head.map((h) => (
                <th key={h} className="py-2 pr-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.table.rows.map((r) => (
              <tr key={r.join("|")} className="border-b border-line/60 align-top">
                {r.map((c, i) => (
                  <td key={i} className={`py-2 pr-3 ${i === 0 ? "font-medium" : "text-ink/85"}`}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  return (
    <ol className="relative space-y-5 border-l border-line pl-6">
      {b.steps.map((st, i) => (
        <li key={st.title} className="relative">
          <span className="absolute -left-[37px] grid h-6 w-6 place-items-center rounded-full bg-accent text-[11px] font-semibold text-white">{i + 1}</span>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h3 className="font-semibold">{st.title}</h3>
            {st.time && <span className="text-xs text-muted">{st.time}</span>}
          </div>
          <p className="mt-0.5 text-sm leading-relaxed text-ink/85">{st.text}</p>
        </li>
      ))}
    </ol>
  );
}

export function ArticleBody({ sections }: { sections: { heading: string; blocks: Block[] }[] }) {
  return (
    <div className="space-y-9">
      {sections.map((s) => (
        <section key={s.heading} id={s.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="scroll-mt-24 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">{s.heading}</h2>
          {s.blocks.map((b, i) => (
            <BlockView key={i} b={b} />
          ))}
        </section>
      ))}
    </div>
  );
}
