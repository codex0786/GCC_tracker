import { BookA, Clock, HelpCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion";
import { PageTitle } from "@/components/ui";
import { ARTICLES } from "@/content/learn";

export const metadata: Metadata = {
  title: "Learn about Global Capability Centres in India · GCC-Nexus",
  description: "Plain-English guides to GCCs: what they are, why India, operating models, how to set one up, and the policy and tax basics.",
};

export default function LearnHub() {
  return (
    <>
      <PageTitle eyebrow="Learn" title="Understand GCCs, step by step">
        Short, sourced guides written for newcomers. Read them in order, or jump to what you need.
      </PageTitle>
      <ol className="space-y-3">
        {ARTICLES.map((a, i) => (
          <Reveal key={a.slug} delay={i * 0.05}>
            <li>
              <Link href={`/learn/${a.slug}`} className="group flex items-start gap-4 rounded-xl border border-line bg-panel p-4 transition hover:border-accent hover:shadow-lg hover:shadow-accent/10 sm:p-5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft font-semibold text-accent">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-3 text-xs text-muted">
                    <span className={a.level === "Start here" ? "font-medium text-accent" : ""}>{a.level}</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {a.minutes} min read</span>
                  </span>
                  <span className="mt-1 block text-lg font-semibold group-hover:text-accent">{a.title}</span>
                  <span className="mt-0.5 block text-sm text-muted">{a.summary}</span>
                </span>
              </Link>
            </li>
          </Reveal>
        ))}
      </ol>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href="/learn/glossary" className="group flex items-center gap-3 rounded-xl border border-line bg-panel p-4 transition hover:border-accent">
          <BookA size={20} className="text-accent" />
          <span>
            <span className="block font-semibold group-hover:text-accent">Glossary</span>
            <span className="text-sm text-muted">Every term on this site in one line</span>
          </span>
        </Link>
        <Link href="/learn/faq" className="group flex items-center gap-3 rounded-xl border border-line bg-panel p-4 transition hover:border-accent">
          <HelpCircle size={20} className="text-accent" />
          <span>
            <span className="block font-semibold group-hover:text-accent">FAQ</span>
            <span className="text-sm text-muted">Quick answers to common questions</span>
          </span>
        </Link>
      </div>
    </>
  );
}
