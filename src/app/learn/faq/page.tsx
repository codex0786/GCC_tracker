import { ChevronDown } from "lucide-react";
import type { Metadata } from "next";
import { PageTitle } from "@/components/ui";
import { FAQ } from "@/content/faq";

export const metadata: Metadata = {
  title: "GCC FAQ · GCC Tracker",
  description: "Quick answers about India's Global Capability Centres: how many there are, which cities lead, set-up time, cost per seat and where this site's data comes from.",
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle eyebrow="Learn" title="Frequently asked questions" />
      <div className="divide-y divide-line rounded-xl border border-line bg-panel">
        {FAQ.map((f) => (
          <details key={f.q} className="group p-4 sm:p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
              {f.q}
              <ChevronDown size={17} className="shrink-0 text-muted transition group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-ink/85">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
