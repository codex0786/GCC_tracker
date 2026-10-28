export interface Source {
  id: string;
  title: string;
  publisher: string;
  date: string;
  url: string;
}

// Every factual claim on the information pages points at one of these.
export const SOURCES: Record<string, Source> = {
  zinnovFy26: {
    id: "zinnovFy26",
    title: "India GCC Landscape 2026 (\"GCC Value Orbit\")",
    publisher: "Nasscom & Zinnov",
    date: "2026-08",
    url: "https://zinnov.com/centers-of-excellence/zinnov-nasscom-india-gcc-landscape-2026-report/",
  },
  fpjFy26: {
    id: "fpjFy26",
    title: "India's GCC industry records $98.4 billion revenue in FY26",
    publisher: "Free Press Journal",
    date: "2026-08",
    url: "https://www.freepressjournal.in/business/indias-gcc-industry-records-984-billion-revenue-in-fy26-report-says",
  },
  vestianCities: {
    id: "vestianCities",
    title: "Around 55% of total GCCs in India in Bengaluru, Hyderabad, Chennai (Vestian)",
    publisher: "The Week / PTI",
    date: "2025-07",
    url: "https://www.theweek.in/wire-updates/business/2025/07/21/dcm52-biz-realty-gcc.html",
  },
  jllGuide: {
    id: "jllGuide",
    title: "Bengaluru still on top but tier-2 cities catching up: JLL India GCC boom explained",
    publisher: "The Week",
    date: "2026-02",
    url: "https://www.theweek.in/news/biz-tech/2026/02/17/bengaluru-still-on-top-but-tier-2-cities-catching-up-jll-india-global-capability-centre-boom-explained.amp.html",
  },
  indiaBriefing: {
    id: "indiaBriefing",
    title: "India's Global Capability Centers market estimated to reach US$110 billion by 2030",
    publisher: "India Briefing (Dezan Shira)",
    date: "2025",
    url: "https://www.india-briefing.com/news/indias-global-capability-centers-market-estimated-to-reach-us110-billion-by-2030-28689.html/",
  },
  cbreStates: {
    id: "cbreStates",
    title: "State policies target over 1.1 million GCC jobs by 2031 (CBRE)",
    publisher: "CXOToday",
    date: "2025",
    url: "https://cxotoday.com/others/state-policies-target-over-1-1-million-gcc-jobs-by-2031-cbre-report/",
  },
  lawAsiaStates: {
    id: "lawAsiaStates",
    title: "Indian states race to become GCC powerhouses",
    publisher: "Law.asia",
    date: "2025",
    url: "https://law.asia/india-gcc-growth/",
  },
  gujaratPolicy: {
    id: "gujaratPolicy",
    title: "Key highlights of Gujarat GCC Policy 2025-30",
    publisher: "Cyril Amarchand Mangaldas",
    date: "2025-03",
    url: "https://corporate.cyrilamarchandblogs.com/2025/03/key-highlights-of-gujarat-gcc-policy-2025-30/",
  },
  maharashtraPolicy: {
    id: "maharashtraPolicy",
    title: "ERGO: Maharashtra GCC Policy",
    publisher: "Khaitan & Co",
    date: "2025-11",
    url: "https://www.khaitanco.com/sites/default/files/2025-11/ERGO%20-%20Maharashtra%20GCC%20Policy%20-%2011%20November%202025.pdf",
  },
  rajasthanPolicy: {
    id: "rajasthanPolicy",
    title: "Impetus to GCCs in India: Rajasthan releases its GCC Policy",
    publisher: "Khaitan & Co",
    date: "2025-12",
    url: "https://www.khaitanco.com/sites/default/files/2025-12/Ergo%20-%20Impetus%20to%20GCCs%20in%20India%20-%20Rajasthan%20releases%20its%20GCC%20Policy%20-%2016%20December%202025.pdf",
  },
  budget2026Tp: {
    id: "budget2026Tp",
    title: "India Union Budget 2026 introduces transfer pricing changes",
    publisher: "BDO Global",
    date: "2026-02",
    url: "https://www.bdo.global/en-gb/insights/tax/transfer-pricing/india-union-budget-2026-introduces-transfer-pricing-changes",
  },
  ifscaGic: {
    id: "ifscaGic",
    title: "Regulations, framework & guidelines for Global In-house Centres",
    publisher: "IFSCA",
    date: "2020 (current)",
    url: "https://ifsca.gov.in/Pages/Contents/Global_In_house_Centres",
  },
  investIndiaGic: {
    id: "investIndiaGic",
    title: "India's 1st IFSC: GIFT City Global In-House Centres regulations",
    publisher: "Invest India",
    date: "2021",
    url: "https://www.investindia.gov.in/team-india-blogs/indias-1st-ifsc-gift-city-global-house-centres-regulations",
  },
  iimbCre: {
    id: "iimbCre",
    title: "IIMB–CRE Matrix Commercial Property Rental Index Q2 2025",
    publisher: "Realty n More",
    date: "2025-07",
    url: "https://realtynmore.com/mumbai-gurugram-delhi-lead-surge-in-grade-a-office-rentals-iimb-cre-index-q2-2025",
  },
  efIndia: {
    id: "efIndia",
    title: "EF English Proficiency Index 2025: India fact sheet",
    publisher: "EF Education First",
    date: "2025-11",
    url: "https://www.ef.com/assetscdn/WIBIwq6RdJvcD9bc8RMd/cefcom-epi-site/fact-sheets/2025/ef-epi-fact-sheet-india-english.pdf",
  },
  efPhilippines: {
    id: "efPhilippines",
    title: "EF English Proficiency Index 2025: Philippines fact sheet",
    publisher: "EF Education First",
    date: "2025-11",
    url: "https://www.ef.com/assetscdn/WIBIwq6RdJvcD9bc8RMd/cefcom-epi-site/fact-sheets/2025/ef-epi-fact-sheet-philippines-english.pdf",
  },
  vietnamEf: {
    id: "vietnamEf",
    title: "Vietnam returns to global 'moderate' English proficiency group (EF EPI 2025)",
    publisher: "Tuoi Tre News",
    date: "2025-11",
    url: "https://news.tuoitre.vn/vietnam-returns-to-global-moderate-english-proficiency-group-ef-103251120163417603.htm",
  },
  techsciDestinations: {
    id: "techsciDestinations",
    title: "India vs emerging GCC destinations: where GCCs will create the most value next",
    publisher: "TechSci Research",
    date: "2025",
    url: "https://www.techsciresearch.com/blog/india-vs-emerging-gcc-destinations-where-global-capability-centers-will-create-the-most-value-next/4734.html",
  },
};

export const sourceList = (ids: string[]) => ids.map((id) => SOURCES[id]).filter(Boolean);
