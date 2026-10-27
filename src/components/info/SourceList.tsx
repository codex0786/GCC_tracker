import { ExternalLink } from "lucide-react";
import { SOURCES } from "@/content/sources";

export function SourceList({ ids, title = "Sources" }: { ids: string[]; title?: string }) {
  const items = ids.map((id) => SOURCES[id]).filter(Boolean);
  if (items.length === 0) return null;
  return (
    <aside className="rounded-xl border border-line bg-panel-2/60 p-4 text-xs">
      <div className="mb-2 font-semibold uppercase tracking-wider text-muted">{title}</div>
      <ol className="space-y-1.5">
        {items.map((s) => (
          <li key={s.id}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="group inline-flex items-start gap-1 hover:text-accent">
              <span>
                <span className="font-medium">{s.publisher}</span> · {s.title} <span className="text-muted">({s.date})</span>
              </span>
              <ExternalLink size={11} className="mt-0.5 shrink-0 opacity-60 group-hover:opacity-100" />
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}

/** Inline citation link, e.g. "Source: Nasscom & Zinnov, 2026-08". */
export function Cite({ id }: { id: string }) {
  const s = SOURCES[id];
  if (!s) return null;
  return (
    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-muted underline decoration-dotted underline-offset-2 hover:text-accent">
      {s.publisher}, {s.date}
    </a>
  );
}
