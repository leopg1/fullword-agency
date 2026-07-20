/** Date centrale ale firmei — o singură sursă de adevăr în tot site-ul. */
export const site = {
  name: "Full Work Services",
  legalName: "FULL WORK SERVICES S.R.L.",
  cui: "45291775",
  regCom: "J2021020993406",
  address: "Str. Grigore Ionescu nr. 63, Sector 2, București",
  addressEn: "63 Grigore Ionescu St., District 2, Bucharest, Romania",
  phoneDisplay: "0723 147 723",
  phoneE164: "+40723147723",
  email: "office@fullworkservices.com",
  whatsappBase: "https://wa.me/40723147723",
  facebook: "https://www.facebook.com/profile.php?id=100071014033361",
  url: "https://fullworkservices.com",
  founder: "Diana Dina",
} as const;

/**
 * URL-ul public real al site-ului, folosit pentru metadataBase / Open Graph.
 * Facebook trebuie să poată descărca imaginea de share de pe un domeniu care
 * chiar există — altfel cardul apare rupt. Ordinea:
 *   1. NEXT_PUBLIC_SITE_URL (setat manual când domeniul final e live)
 *   2. domeniul de producție de pe Vercel (automat, fără configurare)
 *   3. domeniul final din `site.url` (fallback)
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return site.url;
}

/** Transformă o cale relativă într-un URL absolut (necesar pentru share). */
export function absoluteUrl(path: string): string {
  return path.startsWith("http") ? path : `${siteUrl()}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Link WhatsApp cu mesaj pre-completat. */
export function whatsappLink(text?: string) {
  return text
    ? `${site.whatsappBase}?text=${encodeURIComponent(text)}`
    : site.whatsappBase;
}
