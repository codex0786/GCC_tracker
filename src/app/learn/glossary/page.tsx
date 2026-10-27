import type { Metadata } from "next";
import { GlossaryList } from "@/components/info/GlossaryList";
import { PageTitle } from "@/components/ui";
import { GLOSSARY } from "@/content/glossary";

export const metadata: Metadata = {
  title: "GCC glossary · GCC-Nexus",
  description: "Plain-English definitions of the terms used around Global Capability Centres: BOT, SEZ, transfer pricing, safe harbour, Pillar Two, TCO and more.",
};

export default function GlossaryPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle eyebrow="Learn" title="Glossary">
        {GLOSSARY.length} terms you will meet when reading about GCCs or using the tools.
      </PageTitle>
      <GlossaryList terms={GLOSSARY} />
    </div>
  );
}
