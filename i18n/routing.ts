import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ro", "en"],
  defaultLocale: "ro",
  // RO fără prefix (fullworkservices.ro/joburi), EN cu /en/jobs
  localePrefix: "as-needed",
  // Fără redirect după limba browserului: / e mereu RO (SEO + predictibil)
  localeDetection: false,
  pathnames: {
    "/": "/",
    "/joburi": { ro: "/joburi", en: "/jobs" },
    "/joburi/[slug]": { ro: "/joburi/[slug]", en: "/jobs/[slug]" },
    "/servicii": { ro: "/servicii", en: "/services" },
    "/servicii/recrutare": { ro: "/servicii/recrutare", en: "/services/recruitment" },
    "/servicii/hr-outsourcing": { ro: "/servicii/hr-outsourcing", en: "/services/hr-outsourcing" },
    "/servicii/permise-de-munca": { ro: "/servicii/permise-de-munca", en: "/services/work-permits" },
    "/servicii/infiintare-firma": { ro: "/servicii/infiintare-firma", en: "/services/romania-market-entry" },
    "/servicii/cetatenie": { ro: "/servicii/cetatenie", en: "/services/romanian-citizenship" },
    "/servicii/mediere": { ro: "/servicii/mediere", en: "/services/mediation" },
    "/despre-noi": { ro: "/despre-noi", en: "/about" },
    "/pentru-candidati": { ro: "/pentru-candidati", en: "/for-candidates" },
    "/blog": { ro: "/blog", en: "/blog" },
    "/blog/[slug]": { ro: "/blog/[slug]", en: "/blog/[slug]" },
    "/contact": { ro: "/contact", en: "/contact" },
    "/politica-de-confidentialitate": { ro: "/politica-de-confidentialitate", en: "/privacy-policy" },
    "/politica-cookies": { ro: "/politica-cookies", en: "/cookie-policy" },
    "/termeni-si-conditii": { ro: "/termeni-si-conditii", en: "/terms-and-conditions" },
  },
});

export type AppPathname = keyof typeof routing.pathnames;
/** Rutele fără segmente dinamice — utilizabile direct ca href string. */
export type StaticAppPathname = Exclude<AppPathname, `${string}[${string}`>;
