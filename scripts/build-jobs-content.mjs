// Reconstruiește conținutul joburilor (content_ro/content_en) din extracția
// vechiului site (../full work services/fullworkservices-extract/pagini/).
// Scrie scripts/jobs-content.json — folosit de generate-seed-sql.mjs și seed-jobs.mjs.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const EXTRACT = fileURLToPath(
  new URL("../../OREVO BRAIN/full work services/fullworkservices-extract/pagini/", import.meta.url)
);
const OUT = fileURLToPath(new URL("./jobs-content.json", import.meta.url));

// slug nou -> fișierele sursă (null = limba n-a existat pe site-ul vechi)
const MAP = [
  { slug: "maistru-izolator-certificat",     ro: "JOB-RO-maistru.md",                        en: "JOB-EN-maistru.md" },
  { slug: "montator-flanse",                 ro: "JOB-RO-montator.md",                       en: "JOB-EN-montator.md" },
  { slug: "sef-de-santier",                  ro: "JOB-RO-manager-santier.md",                en: null },
  { slug: "supervizor-instalatii-sanitare",  ro: "JOB-RO-supervizor-sanitar.md",             en: "JOB-EN-supervizor.md" },
  { slug: "sudor-asamblator",                ro: null,                                       en: "JOB-EN-welder-assembler.md" },
  { slug: "tehnician-mentenanta-cladiri",    ro: "JOB-RO-tehnician-mentenanta-cladiri.md",   en: "JOB-EN-facility-maintenance-technician.md" },
  { slug: "lucratori-depozit",               ro: null,                                       en: "JOB-EN-warehouse-workers.md" },
  { slug: "sofer-autobuz",                   ro: null,                                       en: "JOB-EN-bus-driver.md" },
  { slug: "crew-boat-hotel-amsterdam",       ro: null,                                       en: "JOB-EN-hybrid-crew-boat-hotel.md" },
  { slug: "coordonator-boat-hotel-amsterdam",ro: null,                                       en: "JOB-EN-operations-hospitality-boat-hotel.md" },
  { slug: "asistent-legal",                  ro: "JOB-RO-asistent-legal.md",                 en: "JOB-EN-legal-asistent.md" },
  { slug: "office-manager-call-center",      ro: "JOB-RO-manager-birou-call-center.md",      en: "JOB-EN-office-manager-call-center.md" },
  { slug: "agent-vanzari-instrumente-plata", ro: "JOB-RO-agent-de-vanzari.md",               en: "JOB-EN-agent-de-vanzari.md" },
  { slug: "senior-sales-retention",          ro: "JOB-RO-senior-sales-retention-talent.md",  en: "JOB-EN-senior-sales-retention-talent.md" },
  { slug: "asistent-stomatologic-senior",    ro: "JOB-RO-asistent-stomatologic-senior.md",   en: "JOB-EN-senior-dental-assistant.md" },
];

const FIELD_PATTERNS = [
  ["subtitle",         /subtitlu|subtitle/i],
  ["intro",            /descriere|description/i],
  ["benefits",         /prime[sș]t[ei]|beneficii|benefits|what (do )?you (get|receive)|oferim|we offer/i],
  ["requirements",     /cerin[țt]e|requirement|c[ăa]ut[ăa]m|ce se caut[ăa]/i],
  ["location",         /unde (vei|se) lucr|where (will|would) you work|loca[țt]i[ea]|location/i],
  ["responsibilities", /responsabilit|responsibilit|atribu[țt]ii|duties/i],
];

const strip = (s) =>
  s.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").replace(/\s+/g, " ").trim();

function parseFile(file) {
  const path = EXTRACT + file;
  if (!existsSync(path)) { console.error(`LIPSEȘTE: ${file}`); return null; }
  const raw = readFileSync(path, "utf8");

  // doar partea de conținut integral (secțiunea 2)
  const start = raw.search(/^## 2\./m);
  const body = start >= 0 ? raw.slice(start) : raw;

  // blocuri "### Titlu" -> conținutul până la următorul ###/##
  const blocks = [...body.matchAll(/^### (.+)$\n([\s\S]*?)(?=^###? |\n---\n|$(?![\s\S]))/gm)];
  const content = {};
  const unmatched = [];

  for (const [, heading, text] of blocks) {
    const field = FIELD_PATTERNS.find(([, re]) => re.test(heading))?.[0];
    if (!field) { unmatched.push(heading.trim()); continue; }

    const bullets = [...text.matchAll(/^[-*] (.+)$/gm)].map((m) => strip(m[1]));
    if (field === "subtitle") {
      const first = text.split(/\n\s*\n/).map(strip).filter(Boolean)[0] ?? "";
      if (first && !content.subtitle) content.subtitle = first;
      continue;
    }
    if (bullets.length) {
      content[field] = [...(content[field] ?? []), ...bullets];
    } else {
      const paras = text
        .split(/\n\s*\n/)
        .map(strip)
        .filter((p) => p && !/^\(/.test(p)); // sare peste notele editoriale "(...)"
      if (paras.length) content[field] = [...(content[field] ?? []), ...paras];
    }
  }
  return { content, unmatched, file };
}

const out = [];
for (const { slug, ro, en } of MAP) {
  const row = { slug, content_ro: {}, content_en: {} };
  for (const [lang, file] of [["content_ro", ro], ["content_en", en]]) {
    if (!file) continue;
    const parsed = parseFile(file);
    if (!parsed) continue;
    row[lang] = parsed.content;
    const fields = Object.keys(parsed.content);
    console.log(
      `${slug} [${lang.slice(-2)}] <- ${file}: ${fields.map((f) => `${f}(${Array.isArray(parsed.content[f]) ? parsed.content[f].length : "1"})`).join(" ")}` +
      (parsed.unmatched.length ? `  | NEFOLOSITE: ${parsed.unmatched.join("; ")}` : "")
    );
  }
  // fix-ul din seed-jobs.mjs: la senior-sales-retention „beneficiile" din sursă
  // sunt de fapt atribuții (dublate cu secțiunea reală de responsabilități) — le golim.
  if (slug === "senior-sales-retention") {
    for (const lang of ["content_ro", "content_en"]) {
      const c = row[lang];
      if (!c) continue;
      if (c.benefits?.length && !c.responsibilities?.length) c.responsibilities = c.benefits;
      c.benefits = [];
    }
  }
  out.push(row);
}

writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(`\nScris: ${OUT} (${out.length} joburi)`);
