import type { JobContent, JobRecord } from "@/lib/jobs";
import { countryInfo } from "@/lib/jobs-data";
import { cityLabel } from "@/lib/geo";
import { site } from "@/lib/site";

/**
 * Textul gata scris pentru o postare pe Facebook.
 *
 * Facebook nu permite pre-completarea textului unei postări din exterior, deci
 * textul se pune pe clipboard, iar utilizatorul îl lipește (Ctrl/Cmd+V) în
 * fereastra de postare. Link-ul NU e inclus aici — îl adaugă componenta client,
 * ca să folosească exact adresa paginii curente.
 */
export function jobShareText(
  job: Pick<JobRecord, "title_ro" | "title_en" | "city" | "country_code" | "salary_ro" | "salary_en">,
  content: JobContent | null,
  locale: string
): string {
  const ro = locale !== "en";
  const title = ro ? job.title_ro : job.title_en;
  const salary = ro ? job.salary_ro : job.salary_en;
  const city = cityLabel(job.city, locale);
  const country = countryInfo(job.country_code)[ro ? "ro" : "en"];
  const place = [city, country && country !== city ? country : null].filter(Boolean).join(", ");

  // primele beneficii reale din anunț, ca postarea să aibă substanță
  const perks = (content?.benefits ?? []).slice(0, 4).map((b) => `✅ ${b}`);

  const lines = [
    ro ? `📢 ANGAJĂM: ${title}` : `📢 WE'RE HIRING: ${title}`,
    "",
    place ? `📍 ${place}` : null,
    salary ? `💰 ${salary}` : null,
    "",
    perks.length ? (ro ? "Ce îți oferim:" : "What we offer:") : null,
    ...perks,
    perks.length ? "" : null,
    ro ? "👇 Detalii complete și înscriere:" : "👇 Full details and apply:",
  ];

  const tail = [
    "",
    `📞 ${site.phoneDisplay}`,
    ro
      ? "#angajam #joburi #recrutare #FullWorkServices"
      : "#hiring #jobs #recruitment #FullWorkServices",
  ];

  return [...lines.filter((l) => l !== null), "{{URL}}", ...tail].join("\n");
}

/**
 * Versiune scurtă derivată din conținut, pentru `?v=` la imaginea de share.
 * Facebook ține imaginile în cache după URL, deci URL-ul trebuie să se schimbe
 * când se schimbă ce apare pe card (titlu, rezumat). Hash FNV-1a, în base36.
 */
export function contentVersion(...parts: (string | null | undefined)[]): string {
  const input = parts.filter(Boolean).join("|");
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
}

/** Textul gata scris pentru share-ul unui articol de blog. */
export function postShareText(
  post: { title_ro: string; title_en: string; excerpt_ro: string; excerpt_en: string },
  locale: string
): string {
  const ro = locale !== "en";
  const title = ro ? post.title_ro : post.title_en;
  const excerpt = ro ? post.excerpt_ro : post.excerpt_en;

  return [
    `📝 ${title}`,
    "",
    excerpt,
    "",
    ro ? "👇 Citește articolul:" : "👇 Read the article:",
    "{{URL}}",
    "",
    ro ? `📞 ${site.phoneDisplay}` : `📞 ${site.phoneDisplay}`,
    ro ? "#FullWorkServices #recrutare" : "#FullWorkServices #recruitment",
  ].join("\n");
}
