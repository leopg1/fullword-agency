import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** Redirects 301 de la URL-urile vechiului site WordPress (harta din pregătire). */
const OLD_JOB_SLUGS_EN: [string, string][] = [
  ["maistru", "maistru-izolator-certificat"],
  ["montator", "montator-flanse"],
  ["legal_asistent", "asistent-legal"],
  ["supervizor", "supervizor-instalatii-sanitare"],
  ["agent-de-vanzari", "agent-vanzari-instrumente-plata"],
  ["bus-driver", "sofer-autobuz"],
  ["experienced-welder-assembler", "sudor-asamblator"],
  ["facility-maintenance-technician", "tehnician-mentenanta-cladiri"],
  ["office-manager-call-center", "office-manager-call-center"],
  ["senior-dental-assistant", "asistent-stomatologic-senior"],
  ["senior-sales-retention-talent-2", "senior-sales-retention"],
  ["warehouse-workers-order-pickers", "lucratori-depozit"],
  ["hybrid-crew-member-boat-hotel-amsterdam", "crew-boat-hotel-amsterdam"],
  ["operations-hospitality-coordinator-boat-hotel-amsterdam", "coordonator-boat-hotel-amsterdam"],
  ["site_minager", "sef-de-santier"],
];

const OLD_JOB_SLUGS_RO: [string, string][] = [
  ["maistru-2", "maistru-izolator-certificat"],
  ["montator-2", "montator-flanse"],
  ["asistent_legal", "asistent-legal"],
  ["supervizor_sanitar", "supervizor-instalatii-sanitare"],
  ["agent-de-vanzari-2", "agent-vanzari-instrumente-plata"],
  ["asistent-stomatologic-senior", "asistent-stomatologic-senior"],
  ["manager-birou-call-center", "office-manager-call-center"],
  ["senior-sales-retention-talent-3", "senior-sales-retention"],
  ["tehnician-mentenanta-cladiri", "tehnician-mentenanta-cladiri"],
  ["manager_santier", "sef-de-santier"],
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      // Pagini principale EN (vechiul default era EN)
      { source: "/about_us", destination: "/en/about", permanent: true },
      { source: "/contact-2", destination: "/en/contact", permanent: true },
      { source: "/blog-2", destination: "/en/blog", permanent: true },
      { source: "/open_jobs", destination: "/en/jobs", permanent: true },
      { source: "/for-international-recruitment", destination: "/en/services/recruitment", permanent: true },
      { source: "/for-expanding-companies", destination: "/en/services/romania-market-entry", permanent: true },
      { source: "/for-foreign-citizens", destination: "/en/services/romanian-citizenship", permanent: true },
      // Pagini principale RO (prefixul /ro dispare)
      { source: "/ro", destination: "/", permanent: true },
      { source: "/ro/acasa", destination: "/", permanent: true },
      { source: "/ro/despre-noi", destination: "/despre-noi", permanent: true },
      { source: "/ro/contact", destination: "/contact", permanent: true },
      { source: "/ro/blog", destination: "/blog", permanent: true },
      { source: "/ro/joburi_deschise", destination: "/joburi", permanent: true },
      // Joburi EN (slugurile vechi erau la rădăcină)
      ...OLD_JOB_SLUGS_EN.map(([oldSlug, newSlug]) => ({
        source: `/${oldSlug}`,
        destination: `/en/jobs/${newSlug}`,
        permanent: true,
      })),
      // Joburi RO
      ...OLD_JOB_SLUGS_RO.map(([oldSlug, newSlug]) => ({
        source: `/ro/${oldSlug}`,
        destination: `/joburi/${newSlug}`,
        permanent: true,
      })),
      // Blog + resturi
      {
        source: "/mediere-vs-acord-sub-semnatura-privata-care-este-solutia-ideala-pentru-conflictele-dintre-angajat-si-angajator",
        destination: "/blog/mediere-vs-acord-sub-semnatura-privata",
        permanent: true,
      },
      { source: "/ro/corpul-muzica", destination: "/blog", permanent: true },
      { source: "/author/:path*", destination: "/despre-noi", permanent: true },
      { source: "/ro/category/:path*", destination: "/blog", permanent: true },
      { source: "/cursuri", destination: "/servicii", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
