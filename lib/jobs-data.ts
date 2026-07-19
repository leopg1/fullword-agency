/**
 * Joburile din site-ul vechi (extract 15 iul 2026) — tipuri + date.
 * Servește ca sursă statică până la conectarea Supabase și apoi ca seed.
 */
export type JobDomain =
  | "construction"
  | "logistics"
  | "transport"
  | "horeca"
  | "office"
  | "medical";

export type Job = {
  slug: string;
  titleRo: string;
  titleEn: string;
  city: string;
  countryCode: string;
  /** ex. „22,50 € net/oră" — text pregătit pe limbi */
  salaryRo: string | null;
  salaryEn: string | null;
  domain: JobDomain;
  image: string;
  remote?: boolean;
  status: "open" | "closed";
};

export const COUNTRY_NAMES: Record<string, { ro: string; en: string; flag: string }> = {
  RO: { ro: "România", en: "Romania", flag: "🇷🇴" },
  BE: { ro: "Belgia", en: "Belgium", flag: "🇧🇪" },
  NL: { ro: "Olanda", en: "Netherlands", flag: "🇳🇱" },
  BG: { ro: "Bulgaria", en: "Bulgaria", flag: "🇧🇬" },
  DE: { ro: "Germania", en: "Germany", flag: "🇩🇪" },
  FR: { ro: "Franța", en: "France", flag: "🇫🇷" },
  IT: { ro: "Italia", en: "Italy", flag: "🇮🇹" },
  ES: { ro: "Spania", en: "Spain", flag: "🇪🇸" },
  AT: { ro: "Austria", en: "Austria", flag: "🇦🇹" },
  UK: { ro: "Marea Britanie", en: "United Kingdom", flag: "🇬🇧" },
};

/** Acces sigur — cod necunoscut → fallback pe cod, fără crash. */
export function countryInfo(code: string) {
  return COUNTRY_NAMES[code] ?? { ro: code, en: code, flag: "" };
}

export const JOBS: Job[] = [
  {
    slug: "maistru-izolator-certificat",
    titleRo: "Maistru izolator certificat",
    titleEn: "Certified insulation foreman",
    city: "Antwerp",
    countryCode: "BE",
    salaryRo: "22,50 € net/oră",
    salaryEn: "€22.50 net/hour",
    domain: "construction",
    image: "/images/jobs/izolator.webp",
    status: "open",
  },
  {
    slug: "montator-flanse",
    titleRo: "Montator de flanșe",
    titleEn: "Flange fitter",
    city: "Antwerp",
    countryCode: "BE",
    salaryRo: "15 € net/oră",
    salaryEn: "€15 net/hour",
    domain: "construction",
    image: "/images/jobs/montator-flanse.webp",
    status: "open",
  },
  {
    slug: "sef-de-santier",
    titleRo: "Șef de șantier",
    titleEn: "Site manager",
    city: "Olanda",
    countryCode: "NL",
    salaryRo: "de la 8.000 € net/lună",
    salaryEn: "from €8,000 net/month",
    domain: "construction",
    image: "/images/jobs/sef-santier.webp",
    status: "open",
  },
  {
    slug: "supervizor-instalatii-sanitare",
    titleRo: "Supervizor inginer instalații sanitare",
    titleEn: "Sanitary installations supervisor",
    city: "București",
    countryCode: "RO",
    salaryRo: "12.000 lei net/lună",
    salaryEn: "RON 12,000 net/month",
    domain: "construction",
    image: "/images/jobs/instalatii-sanitare.webp",
    status: "open",
  },
  {
    slug: "sudor-asamblator",
    titleRo: "Sudor / Asamblator cu experiență",
    titleEn: "Experienced welder / assembler",
    city: "Olanda",
    countryCode: "NL",
    salaryRo: "600–650 € net/săptămână",
    salaryEn: "€600–650 net/week",
    domain: "construction",
    image: "/images/jobs/sudor.webp",
    status: "open",
  },
  {
    slug: "tehnician-mentenanta-cladiri",
    titleRo: "Tehnician mentenanță clădiri",
    titleEn: "Facility maintenance technician",
    city: "București",
    countryCode: "RO",
    salaryRo: "4.000 lei net + tichete",
    salaryEn: "RON 4,000 net + meal vouchers",
    domain: "construction",
    image: "/images/jobs/tehnician-mentenanta.webp",
    status: "open",
  },
  {
    slug: "lucratori-depozit",
    titleRo: "Lucrători depozit & order pickers",
    titleEn: "Warehouse workers & order pickers",
    city: "Olanda",
    countryCode: "NL",
    salaryRo: "14,71 € brut/oră",
    salaryEn: "€14.71 gross/hour",
    domain: "logistics",
    image: "/images/jobs/depozit.webp",
    status: "open",
  },
  {
    slug: "sofer-autobuz",
    titleRo: "Șofer de autobuz",
    titleEn: "Bus driver",
    city: "Olanda",
    countryCode: "NL",
    salaryRo: "600–800 € net/săptămână",
    salaryEn: "€600–800 net/week",
    domain: "transport",
    image: "/images/jobs/sofer-autobuz.webp",
    status: "open",
  },
  {
    slug: "personal-curatenie",
    titleRo: "Personal curățenie",
    titleEn: "Cleaning staff",
    city: "București",
    countryCode: "RO",
    salaryRo: null,
    salaryEn: null,
    domain: "horeca",
    image: "/images/jobs/curatenie.webp",
    status: "open",
  },
  {
    slug: "personal-bucatarie",
    titleRo: "Personal bucătărie",
    titleEn: "Kitchen staff",
    city: "București",
    countryCode: "RO",
    salaryRo: null,
    salaryEn: null,
    domain: "horeca",
    image: "/images/jobs/bucatarie.webp",
    status: "open",
  },
  {
    slug: "crew-boat-hotel-amsterdam",
    titleRo: "Membru echipaj hibrid — Boat Hotel Amsterdam",
    titleEn: "Hybrid crew member — Boat Hotel Amsterdam",
    city: "Amsterdam",
    countryCode: "NL",
    salaryRo: "salariu + cazare și masă incluse",
    salaryEn: "salary + room and board included",
    domain: "horeca",
    image: "/images/jobs/boat-hotel-crew.webp",
    status: "open",
  },
  {
    slug: "coordonator-boat-hotel-amsterdam",
    titleRo: "Coordonator operațiuni & ospitalitate — Boat Hotel Amsterdam",
    titleEn: "Operations & hospitality coordinator — Boat Hotel Amsterdam",
    city: "Amsterdam",
    countryCode: "NL",
    salaryRo: "salariu + cazare și masă incluse",
    salaryEn: "salary + room and board included",
    domain: "horeca",
    image: "/images/jobs/boat-hotel-coordinator.webp",
    status: "open",
  },
  {
    slug: "asistent-legal",
    titleRo: "Asistent legal",
    titleEn: "Legal assistant",
    city: "București",
    countryCode: "RO",
    salaryRo: "3.500 lei net + bonusuri",
    salaryEn: "RON 3,500 net + bonuses",
    domain: "office",
    image: "/images/jobs/legal.webp",
    status: "open",
  },
  {
    slug: "office-manager-call-center",
    titleRo: "Office manager call center",
    titleEn: "Office manager — call center",
    city: "București",
    countryCode: "RO",
    salaryRo: "1.200 € net/lună",
    salaryEn: "€1,200 net/month",
    domain: "office",
    image: "/images/jobs/call-center.webp",
    status: "open",
  },
  {
    slug: "agent-vanzari-instrumente-plata",
    titleRo: "Agent de vânzări — instrumente de plată",
    titleEn: "Sales agent — payment instruments",
    city: "Remote",
    countryCode: "RO",
    salaryRo: "1.800 € net + comision",
    salaryEn: "€1,800 net + commission",
    domain: "office",
    image: "/images/jobs/supervizor.webp",
    remote: true,
    status: "open",
  },
  {
    slug: "senior-sales-retention",
    titleRo: "Senior Sales & Retention Talent",
    titleEn: "Senior Sales & Retention Talent",
    city: "Sofia",
    countryCode: "BG",
    salaryRo: null,
    salaryEn: null,
    domain: "office",
    image: "/images/jobs/call-center.webp",
    status: "open",
  },
  {
    slug: "asistent-stomatologic-senior",
    titleRo: "Asistent stomatologic senior",
    titleEn: "Senior dental assistant",
    city: "București",
    countryCode: "RO",
    salaryRo: "de la 6.000 lei net/lună",
    salaryEn: "from RON 6,000 net/month",
    domain: "medical",
    image: "/images/jobs/asistent-stomatologic.webp",
    status: "open",
  },
];

export const openJobs = () => JOBS.filter((j) => j.status === "open");

export const jobCountByDomain = () =>
  openJobs().reduce<Record<JobDomain, number>>(
    (acc, j) => {
      acc[j.domain] += 1;
      return acc;
    },
    { construction: 0, logistics: 0, transport: 0, horeca: 0, office: 0, medical: 0 }
  );
