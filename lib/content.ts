/**
 * Sistem de suprascriere a textelor site-ului.
 *
 * Textele implicite stau în `messages/{ro,en}.json` (next-intl). Din panoul de
 * admin, proprietara poate schimba orice text — modificarea se salvează în
 * tabelul `fw_content` ca pereche (locale, cheie → valoare), unde cheia e calea
 * next-intl cu punct (ex. `hero.title` sau `hero.list.0` pentru un element de
 * listă). La fiecare cerere, suprascrierile se aplică peste JSON-ul static.
 * Tabelul ține DOAR textele schimbate; restul rămân în JSON.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Eticheta cache-ului Next pentru fetch-ul de suprascrieri (invalidat la salvare). */
export const CONTENT_TAG = "fw-content";

/** Citește suprascrierile pentru o limbă. Cache-uit de Next până la revalidare. */
export async function getContentOverrides(locale: string): Promise<Record<string, string>> {
  if (!SUPABASE_URL || !SUPABASE_ANON) return {};
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/fw_content?locale=eq.${encodeURIComponent(locale)}&select=key,value`,
      {
        headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
        next: { tags: [CONTENT_TAG] },
      }
    );
    if (!res.ok) return {};
    const rows = (await res.json()) as { key: string; value: string }[];
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch {
    return {};
  }
}

/** Setează o valoare într-un obiect după o cale cu punct (segment numeric = index de listă). */
function setByPath(root: Record<string, unknown>, path: string, value: string) {
  const parts = path.split(".");
  let node: Record<string, unknown> | unknown[] = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    const nextIsIndex = /^\d+$/.test(parts[i + 1]);
    const cur = (node as Record<string, unknown>)[p];
    if (cur == null || typeof cur !== "object") {
      (node as Record<string, unknown>)[p] = nextIsIndex ? [] : {};
    }
    node = (node as Record<string, unknown>)[p] as Record<string, unknown> | unknown[];
  }
  (node as Record<string, unknown>)[parts[parts.length - 1]] = value;
}

type Messages = Record<string, unknown>;

/** Aplică suprascrierile peste un set de mesaje (fără să mute originalul). */
export function applyOverrides(messages: Messages, overrides: Record<string, string>): Messages {
  if (!overrides || Object.keys(overrides).length === 0) return messages;
  const clone = JSON.parse(JSON.stringify(messages)) as Messages;
  for (const [key, value] of Object.entries(overrides)) {
    setByPath(clone, key, value);
  }
  return clone;
}

/* ------------------------------------------------------------------ */
/*  Ajutoare pentru editorul din admin (aplatizare + etichete RO)      */
/* ------------------------------------------------------------------ */

export type ContentLeaf = {
  key: string; // calea completă, ex. "hero.title"
  section: string; // namespace-ul de nivel 1, ex. "hero"
  label: string; // etichetă prietenoasă pentru câmp
  value: string; // valoarea implicită din JSON
  multiline: boolean;
};

/** Nume prietenoase (RO) pentru secțiunile de nivel 1. */
export const SECTION_LABELS: Record<string, string> = {
  nav: "Meniu (sus)",
  hero: "Prima secțiune (Acasă)",
  stats: "Cifre cheie",
  footer: "Subsol (footer)",
  common: "Butoane și texte comune",
  audience: "Companii & Candidați (Acasă)",
  services: "Servicii (Acasă)",
  domains: "Domenii de joburi (Acasă)",
  process: "Cum lucrăm — pași (Acasă)",
  founder: "Fondatoare (Acasă)",
  testimonials: "Testimoniale (Acasă)",
  jobsPreview: "Joburi recente (Acasă)",
  finalCta: "Chemare finală (Acasă)",
  jobsBoard: "Pagina Joburi",
  jobPage: "Pagina unui job",
  servicesHub: "Pagina Servicii",
  contact: "Pagina Contact",
  blogPage: "Pagina Blog",
  svcRecrutare: "Serviciu: Recrutare personal",
  svcHr: "Serviciu: Partener HR extern",
  svcPermise: "Serviciu: Permise de muncă",
  svcInfiintare: "Serviciu: Înființare firmă",
  svcCetatenie: "Serviciu: Cetățenie română",
  svcMediere: "Serviciu: Mediere",
  about: "Pagina Despre noi",
  candidates: "Pagina Pentru candidați",
  legalPrivacy: "Legal: Confidențialitate",
  legalCookies: "Legal: Politica de cookies",
  legalTerms: "Legal: Termeni și condiții",
  notFound: "Pagina „nu există” (404)",
  errorPage: "Pagina de eroare",
  faqAside: "Întrebări frecvente (lateral)",
};

const WORD_LABELS: Record<string, string> = {
  title: "Titlu",
  titleStart: "Titlu — începutul",
  titleHighlight: "Titlu — cuvântul subliniat",
  titleEnd: "Titlu — finalul",
  subtitle: "Subtitlu",
  heading: "Titlu secțiune",
  eyebrow: "Etichetă mică (deasupra titlului)",
  description: "Descriere",
  desc: "Descriere",
  text: "Text",
  lead: "Text introductiv",
  intro: "Introducere",
  cta: "Buton",
  ctaButton: "Buton",
  ctaPrimary: "Buton principal",
  ctaSecondary: "Buton secundar",
  ctaCompanies: "Buton pentru companii",
  ctaCandidates: "Buton pentru candidați",
  button: "Buton",
  label: "Etichetă",
  name: "Nume",
  role: "Rol",
  quote: "Citat",
  question: "Întrebare",
  answer: "Răspuns",
  badge: "Insignă",
  note: "Notă",
  caption: "Descriere scurtă",
  placeholder: "Text ajutător (în câmp)",
  value: "Valoare",
  suffix: "Sufix",
  prefix: "Prefix",
  body: "Conținut",
  summary: "Rezumat",
  aside: "Text lateral",
  callUs: "Sună-ne",
  menu: "Meniu",
  trust1: "Element de încredere 1",
  trust2: "Element de încredere 2",
  trust3: "Element de încredere 3",
};

/** Transformă un segment de cheie într-o etichetă citibilă. */
function humanizeSegment(seg: string): string {
  if (/^\d+$/.test(seg)) return `${Number(seg) + 1}`; // index listă → număr 1-based
  if (WORD_LABELS[seg]) return WORD_LABELS[seg];
  // camelCase / kebab → cuvinte
  const spaced = seg
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Etichetă prietenoasă pentru un câmp, pe baza căii (fără namespace-ul de nivel 1). */
function fieldLabel(fullKey: string): string {
  const parts = fullKey.split(".");
  const rest = parts.slice(1); // fără secțiunea de nivel 1
  if (rest.length === 0) return "Text";
  // dacă ultimul e index numeric, arată „<părinte> — rândul N"
  const last = rest[rest.length - 1];
  if (/^\d+$/.test(last)) {
    const parent = rest.length >= 2 ? humanizeSegment(rest[rest.length - 2]) : "Element";
    return `${parent} — rândul ${Number(last) + 1}`;
  }
  return humanizeSegment(last);
}

/** Aplatizează un obiect de mesaje în frunze editabile, în ordinea din JSON. */
export function flattenLeaves(messages: Messages): ContentLeaf[] {
  const out: ContentLeaf[] = [];
  const walk = (node: unknown, path: string, section: string) => {
    if (typeof node === "string") {
      out.push({
        key: path,
        section,
        label: fieldLabel(path),
        value: node,
        multiline: node.length > 70 || node.includes("\n"),
      });
    } else if (Array.isArray(node)) {
      node.forEach((item, i) => walk(item, `${path}.${i}`, section));
    } else if (node && typeof node === "object") {
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        walk(v, path ? `${path}.${k}` : k, section || k);
      }
    }
  };
  for (const [k, v] of Object.entries(messages)) {
    walk(v, k, k);
  }
  return out;
}
