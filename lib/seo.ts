import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";

type Href = Parameters<typeof getPathname>[0]["href"];

/** Alternates hreflang RO/EN + x-default pentru o rută (cu params la rutele dinamice). */
export function alternatesFor(href: Href, locale: string = "ro") {
  const ro = getPathname({ href, locale: "ro" });
  const en = getPathname({ href, locale: "en" });
  return {
    // canonical = varianta paginii curente, nu mereu RO
    canonical: locale === "en" ? en : ro,
    languages: {
      ro,
      en,
      "x-default": ro,
    },
  };
}

export const localeNames = routing.locales;

/** JSON-LD Organization + LocalBusiness — o singură dată, în layout. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site.url}/#organization`,
        name: site.name,
        legalName: site.legalName,
        url: site.url,
        logo: `${site.url}/images/brand/logo-sky.png`,
        email: site.email,
        telephone: site.phoneE164,
        sameAs: [site.facebook],
      },
      {
        "@type": "EmploymentAgency",
        "@id": `${site.url}/#localbusiness`,
        name: site.name,
        url: site.url,
        image: `${site.url}/images/brand/logo-sky.png`,
        telephone: site.phoneE164,
        email: site.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Str. Grigore Ionescu nr. 63",
          addressLocality: "București",
          addressRegion: "Sector 2",
          postalCode: "023674",
          addressCountry: "RO",
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
            opens: "10:00",
            closes: "19:00",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: "Friday",
            opens: "10:00",
            closes: "15:00",
          },
        ],
        parentOrganization: { "@id": `${site.url}/#organization` },
      },
    ],
  };
}
