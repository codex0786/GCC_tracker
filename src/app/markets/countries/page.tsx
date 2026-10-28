import type { Metadata } from "next";
import { CountryCompare } from "@/components/info/CountryCompare";
import { SourceList } from "@/components/info/SourceList";
import { PageTitle } from "@/components/ui";
import { COUNTRY_SOURCES } from "@/data/countries";

export const metadata: Metadata = {
  title: "India vs other GCC countries · GCC-Nexus",
  description: "Compare India with the Philippines, Poland, Mexico and Vietnam for a Global Capability Centre: cost, talent scale, English, time-zone overlap, tax and ecosystem.",
};

export default function CountriesPage() {
  return (
    <>
      <PageTitle eyebrow="Markets · Step 1" title="India or somewhere else?">
        Most companies choose a country before a city. Weigh India against four common alternatives for your headquarters, then drill into Indian cities.
      </PageTitle>
      <CountryCompare />
      <div className="mt-6">
        <SourceList ids={COUNTRY_SOURCES} />
      </div>
    </>
  );
}
