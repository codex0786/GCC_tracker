import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/info/ArticleBody";
import { SourceList } from "@/components/info/SourceList";
import { ARTICLES, ARTICLE_BY_SLUG } from "@/content/learn";

export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = ARTICLE_BY_SLUG[(await params).slug];
  return a ? { title: `${a.title} · GCC-Nexus`, description: a.summary } : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const a = ARTICLE_BY_SLUG[(await params).slug];
  if (!a) notFound();
  return (
    <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_240px]">
      <article className="min-w-0">
        <Link href="/learn" className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent">
          <ArrowLeft size={14} /> All guides
        </Link>
        <div className="mt-4 flex items-center gap-3 text-xs text-muted">
          <span className="font-medium text-accent">{a.level}</span>
          <span className="flex items-center gap-1"><Clock size={11} /> {a.minutes} min read</span>
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{a.title}</h1>
        <p className="mt-3 text-lg text-muted">{a.summary}</p>
        <div className="mt-8">
          <ArticleBody sections={a.sections} />
        </div>
        {a.sources.length > 0 && (
          <div className="mt-10">
            <SourceList ids={a.sources} />
          </div>
        )}
        {a.next && (
          <Link href={a.next.href} className="group mt-8 flex items-center justify-between rounded-xl border border-line bg-panel p-5 transition hover:border-accent">
            <span>
              <span className="block text-xs text-muted">Next</span>
              <span className="font-semibold group-hover:text-accent">{a.next.label}</span>
            </span>
            <ArrowRight size={18} className="text-accent transition group-hover:translate-x-1" />
          </Link>
        )}
      </article>
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-1 text-sm">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">On this page</div>
          {a.sections.map((s) => (
            <a key={s.heading} href={`#${s.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="block rounded-md px-2 py-1 text-muted hover:bg-panel-2 hover:text-ink">
              {s.heading}
            </a>
          ))}
          <Link href="/tools" className="mt-4 block rounded-lg bg-accent-soft p-3 text-xs text-accent hover:underline">
            Try it on a real scenario in the decision cockpit →
          </Link>
        </div>
      </aside>
    </div>
  );
}
