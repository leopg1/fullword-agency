/**
 * Statistici site — ajutoare comune.
 *
 * Confidențialitate: nu stocăm IP-uri și nu punem cookie-uri. Vizitatorul unic
 * e un hash zilnic (IP + browser + sare care se schimbă în fiecare zi), deci nu
 * poate fi urmărit de la o zi la alta și nu identifică pe nimeni.
 */
import { createHash } from "node:crypto";

/** Roboți de indexare și scannere — nu-i numărăm ca vizitatori. */
const BOT_RE =
  /bot|crawl|spider|slurp|bing|yandex|baidu|duckduck|facebookexternalhit|whatsapp|telegram|preview|scan|curl|wget|python|axios|headless|lighthouse|pingdom|uptime|monitor|semrush|ahrefs|screaming/i;

export function isBot(userAgent: string | null): boolean {
  if (!userAgent || userAgent.length < 10) return true;
  return BOT_RE.test(userAgent);
}

/** Cod anonim de vizitator, valabil o singură zi. */
export function visitorHash(ip: string, userAgent: string, day: string): string {
  return createHash("sha256").update(`${ip}|${userAgent}|${day}|fws`).digest("hex").slice(0, 24);
}

/** Ziua curentă (UTC), în format YYYY-MM-DD. */
export function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Din ce canal a venit vizitatorul — pe înțelesul clientei. */
export function detectSource(referrer: string | null, search: string | null, selfHost: string): string {
  // 1. eticheta din link (utm_source), dacă există — are prioritate
  if (search) {
    try {
      const utm = new URLSearchParams(search).get("utm_source");
      if (utm) return utm.toLowerCase().slice(0, 40);
    } catch {
      /* parametri stricați — ignorăm */
    }
  }
  if (!referrer) return "direct";

  let host = "";
  try {
    host = new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "direct";
  }
  if (!host || host === selfHost.replace(/^www\./, "")) return "intern";

  if (/facebook|fb\.com|fbclid/.test(host)) return "facebook";
  if (/instagram/.test(host)) return "instagram";
  if (/whatsapp|wa\.me/.test(host)) return "whatsapp";
  if (/linkedin|lnkd/.test(host)) return "linkedin";
  if (/google/.test(host)) return "google";
  if (/bing|yahoo|duckduckgo|ecosia|search\.brave/.test(host)) return "alt motor de căutare";
  if (/olx/.test(host)) return "olx";
  if (/tiktok/.test(host)) return "tiktok";
  if (/t\.co|twitter|x\.com/.test(host)) return "x";
  if (/youtube|youtu\.be/.test(host)) return "youtube";
  return host.slice(0, 40);
}

/** Nume prietenos pentru un canal (afișat în admin). */
export function sourceLabel(source: string): string {
  const map: Record<string, string> = {
    direct: "Direct (au scris adresa)",
    intern: "Din site",
    facebook: "Facebook",
    instagram: "Instagram",
    whatsapp: "WhatsApp",
    linkedin: "LinkedIn",
    google: "Google",
    olx: "OLX",
    tiktok: "TikTok",
    x: "X (Twitter)",
    youtube: "YouTube",
  };
  return map[source] ?? source.charAt(0).toUpperCase() + source.slice(1);
}

/**
 * Traduce o cale în ceva ce înțelege clienta.
 * `jobTitles` / `postTitles` mapează slug → titlu, ca să nu vadă „/joburi/sudor-x".
 */
export function pageLabel(
  path: string,
  jobTitles: Record<string, string>,
  postTitles: Record<string, string>
): string {
  const clean = path.replace(/\/+$/, "") || "/";
  const en = clean.startsWith("/en");
  const p = en ? clean.slice(3) || "/" : clean;
  const suffix = en ? " (EN)" : "";

  const jobMatch = p.match(/^\/(?:joburi|jobs)\/(.+)$/);
  if (jobMatch) return `Job: ${jobTitles[jobMatch[1]] ?? jobMatch[1]}${suffix}`;

  const postMatch = p.match(/^\/blog\/(.+)$/);
  if (postMatch) return `Articol: ${postTitles[postMatch[1]] ?? postMatch[1]}${suffix}`;

  const svc = p.match(/^\/(?:servicii|services)\/(.+)$/);
  if (svc) return `Serviciu: ${svc[1].replace(/-/g, " ")}${suffix}`;

  const fixed: Record<string, string> = {
    "/": "Prima pagină",
    "/joburi": "Lista de joburi",
    "/jobs": "Lista de joburi",
    "/servicii": "Servicii",
    "/services": "Servicii",
    "/despre-noi": "Despre noi",
    "/about": "Despre noi",
    "/pentru-candidati": "Pentru candidați",
    "/for-candidates": "Pentru candidați",
    "/contact": "Contact",
    "/blog": "Blog",
    "/completeaza-cv": "Formular „Îți facem CV-ul”",
    "/build-cv": "Formular „Îți facem CV-ul”",
  };
  return (fixed[p] ?? p) + suffix;
}

/** True dacă pagina e un anunț de job (pentru rata de conversie). */
export function isJobPage(path: string): boolean {
  return /^(?:\/en)?\/(?:joburi|jobs)\/[^/]+$/.test(path.replace(/\/+$/, ""));
}
