// Generează scripts/sql/01-seed.sql (joburi + testimoniale) din:
//  - BASE și TESTIMONIALS din seed-jobs.mjs (sursa de adevăr a listei)
//  - scripts/jobs-content.json (conținutul reconstruit din site-ul vechi)
// Rezultatul e idempotent: upsert pe slug la joburi; testimonialele se
// inserează doar dacă tabelul e gol.
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";

const seedSrc = readFileSync(fileURLToPath(new URL("./seed-jobs.mjs", import.meta.url)), "utf8");
const start = seedSrc.indexOf("const BASE");
const end = seedSrc.indexOf("const content =");
if (start < 0 || end < 0) throw new Error("nu găsesc BASE/TESTIMONIALS în seed-jobs.mjs");
const tmp = join(mkdtempSync(join(tmpdir(), "fwseed-")), "data.mjs");
writeFileSync(tmp, seedSrc.slice(start, end) + "\nexport { BASE, TESTIMONIALS };\n");
const { BASE, TESTIMONIALS } = await import(pathToFileURL(tmp).href);

const content = JSON.parse(readFileSync(fileURLToPath(new URL("./jobs-content.json", import.meta.url)), "utf8"));
const bySlug = new Map(content.map((c) => [c.slug, c]));

// $q$...$q$ evită orice problemă de escapare la ghilimele/diacritice
const q = (s) => (s == null ? "null" : `$q$${String(s)}$q$`);
const j = (o) => `$q$${JSON.stringify(o ?? {})}$q$::jsonb`;

const jobRows = BASE.map((b, i) => {
  const c = bySlug.get(b.slug);
  return `  (${q(b.slug)}, ${q(b.title_ro)}, ${q(b.title_en)}, ${q(b.city)}, ${q(b.country_code)}, ${q(b.salary_ro)}, ${q(b.salary_en)}, ${q(b.domain)}, ${q(b.image)}, ${b.remote ?? false}, 'open', ${i}, ${j(c?.content_ro)}, ${j(c?.content_en)})`;
});

const tRows = TESTIMONIALS.map(
  (t) => `  (${q(t.name)}, ${q(t.role_ro)}, ${q(t.role_en)}, ${q(t.quote_ro)}, ${q(t.quote_en)}, ${t.sort_order})`
);

const sql = `-- ============================================================
--  SEED Full Work Services — joburi + testimoniale
--  Generat de scripts/generate-seed-sql.mjs — NU edita manual.
--  De rulat DUPĂ 00-setup.sql. Idempotent.
-- ============================================================

insert into public.fw_jobs
  (slug, title_ro, title_en, city, country_code, salary_ro, salary_en, domain, image, remote, status, sort_order, content_ro, content_en)
values
${jobRows.join(",\n")}
on conflict (slug) do update set
  title_ro = excluded.title_ro,
  title_en = excluded.title_en,
  city = excluded.city,
  country_code = excluded.country_code,
  salary_ro = excluded.salary_ro,
  salary_en = excluded.salary_en,
  domain = excluded.domain,
  image = excluded.image,
  remote = excluded.remote,
  sort_order = excluded.sort_order,
  content_ro = excluded.content_ro,
  content_en = excluded.content_en;

-- Testimonialele: doar dacă tabelul e gol (nu suprascriem editările ulterioare).
insert into public.fw_testimonials (name, role_ro, role_en, quote_ro, quote_en, sort_order)
select * from (values
${tRows.join(",\n")}
) as t(name, role_ro, role_en, quote_ro, quote_en, sort_order)
where not exists (select 1 from public.fw_testimonials);
`;

const out = fileURLToPath(new URL("./sql/01-seed.sql", import.meta.url));
writeFileSync(out, sql);
console.log(`Scris: ${out} — ${jobRows.length} joburi, ${tRows.length} testimoniale`);
