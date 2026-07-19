// Seed fw_jobs + fw_testimonials — rulat autentificat ca admin (RLS "authenticated all").
// Usage: node scripts/seed-jobs.mjs <content-json-path> <admin-password-file>
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const [contentPath, pwPath] = process.argv.slice(2);
const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const url = env.match(/SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/ANON_KEY=(.*)/)[1].trim();
const password = readFileSync(pwPath, "utf8").trim();

// Datele de bază (sincron cu lib/jobs-data.ts)
const BASE = [
  { slug: "maistru-izolator-certificat", title_ro: "Maistru izolator certificat", title_en: "Certified insulation foreman", city: "Antwerp", country_code: "BE", salary_ro: "22,50 € net/oră", salary_en: "€22.50 net/hour", domain: "construction", image: "/images/jobs/izolator.webp" },
  { slug: "montator-flanse", title_ro: "Montator de flanșe", title_en: "Flange fitter", city: "Antwerp", country_code: "BE", salary_ro: "15 € net/oră", salary_en: "€15 net/hour", domain: "construction", image: "/images/jobs/montator-flanse.webp" },
  { slug: "sef-de-santier", title_ro: "Șef de șantier", title_en: "Site manager", city: "Olanda", country_code: "NL", salary_ro: "de la 8.000 € net/lună", salary_en: "from €8,000 net/month", domain: "construction", image: "/images/jobs/sef-santier.webp" },
  { slug: "supervizor-instalatii-sanitare", title_ro: "Supervizor inginer instalații sanitare", title_en: "Sanitary installations supervisor", city: "București", country_code: "RO", salary_ro: "12.000 lei net/lună", salary_en: "RON 12,000 net/month", domain: "construction", image: "/images/jobs/instalatii-sanitare.webp" },
  { slug: "sudor-asamblator", title_ro: "Sudor / Asamblator cu experiență", title_en: "Experienced welder / assembler", city: "Olanda", country_code: "NL", salary_ro: "600–650 € net/săptămână", salary_en: "€600–650 net/week", domain: "construction", image: "/images/jobs/sudor.webp" },
  { slug: "tehnician-mentenanta-cladiri", title_ro: "Tehnician mentenanță clădiri", title_en: "Facility maintenance technician", city: "București", country_code: "RO", salary_ro: "4.000 lei net + tichete", salary_en: "RON 4,000 net + meal vouchers", domain: "construction", image: "/images/jobs/tehnician-mentenanta.webp" },
  { slug: "lucratori-depozit", title_ro: "Lucrători depozit & order pickers", title_en: "Warehouse workers & order pickers", city: "Olanda", country_code: "NL", salary_ro: "14,71 € brut/oră", salary_en: "€14.71 gross/hour", domain: "logistics", image: "/images/jobs/depozit.webp" },
  { slug: "sofer-autobuz", title_ro: "Șofer de autobuz", title_en: "Bus driver", city: "Olanda", country_code: "NL", salary_ro: "600–800 € net/săptămână", salary_en: "€600–800 net/week", domain: "transport", image: "/images/jobs/sofer-autobuz.webp" },
  { slug: "personal-curatenie", title_ro: "Personal curățenie", title_en: "Cleaning staff", city: "București", country_code: "RO", salary_ro: null, salary_en: null, domain: "horeca", image: "/images/jobs/curatenie.webp" },
  { slug: "personal-bucatarie", title_ro: "Personal bucătărie", title_en: "Kitchen staff", city: "București", country_code: "RO", salary_ro: null, salary_en: null, domain: "horeca", image: "/images/jobs/bucatarie.webp" },
  { slug: "crew-boat-hotel-amsterdam", title_ro: "Membru echipaj hibrid — Boat Hotel Amsterdam", title_en: "Hybrid crew member — Boat Hotel Amsterdam", city: "Amsterdam", country_code: "NL", salary_ro: "salariu + cazare și masă incluse", salary_en: "salary + room and board included", domain: "horeca", image: "/images/jobs/boat-hotel-crew.webp" },
  { slug: "coordonator-boat-hotel-amsterdam", title_ro: "Coordonator operațiuni & ospitalitate — Boat Hotel Amsterdam", title_en: "Operations & hospitality coordinator — Boat Hotel Amsterdam", city: "Amsterdam", country_code: "NL", salary_ro: "salariu + cazare și masă incluse", salary_en: "salary + room and board included", domain: "horeca", image: "/images/jobs/boat-hotel-coordinator.webp" },
  { slug: "asistent-legal", title_ro: "Asistent legal", title_en: "Legal assistant", city: "București", country_code: "RO", salary_ro: "3.500 lei net + bonusuri", salary_en: "RON 3,500 net + bonuses", domain: "office", image: "/images/jobs/legal.webp" },
  { slug: "office-manager-call-center", title_ro: "Office manager call center", title_en: "Office manager — call center", city: "București", country_code: "RO", salary_ro: "1.200 € net/lună", salary_en: "€1,200 net/month", domain: "office", image: "/images/jobs/call-center.webp" },
  { slug: "agent-vanzari-instrumente-plata", title_ro: "Agent de vânzări — instrumente de plată", title_en: "Sales agent — payment instruments", city: "Remote", country_code: "RO", salary_ro: "1.800 € net + comision", salary_en: "€1,800 net + commission", domain: "office", image: "/images/jobs/supervizor.webp", remote: true },
  { slug: "senior-sales-retention", title_ro: "Senior Sales & Retention Talent", title_en: "Senior Sales & Retention Talent", city: "Sofia", country_code: "BG", salary_ro: null, salary_en: null, domain: "office", image: "/images/jobs/call-center.webp" },
  { slug: "asistent-stomatologic-senior", title_ro: "Asistent stomatologic senior", title_en: "Senior dental assistant", city: "București", country_code: "RO", salary_ro: "de la 6.000 lei net/lună", salary_en: "from RON 6,000 net/month", domain: "medical", image: "/images/jobs/asistent-stomatologic.webp" },
];

const TESTIMONIALS = [
  { name: "Cătălina G.", role_ro: "Manager IT", role_en: "IT Manager", sort_order: 1,
    quote_ro: "Colaborarea cu echipa Full Work Services a fost una dintre cele mai echilibrate experiențe din zona de recrutare. Procesul a fost transparent, comunicarea excelentă, iar selecția finală a reflectat perfect valorile și nevoile companiei noastre.",
    quote_en: "Working with the Full Work Services team was one of the most balanced recruitment experiences. The process was transparent, the communication was excellent, and the final selection perfectly reflected our company's values and needs." },
  { name: "Ioana G.", role_ro: "Manager fabrică", role_en: "Factory Manager", sort_order: 2,
    quote_ro: "Am apreciat enorm corectitudinea și atenția la detalii. Fiecare candidat a fost evaluat nu doar după competențe, ci și după compatibilitatea cu echipa. Rareori am întâlnit un proces de recrutare atât de uman și profesionist în același timp.",
    quote_en: "I greatly appreciated the fairness and attention to detail. Each candidate was evaluated not only for their skills, but also for their compatibility with the team. I have rarely encountered a recruitment process so humane and professional at the same time." },
  { name: "Beatrice G.", role_ro: "Manager cabinet avocatură", role_en: "Law Firm Manager", sort_order: 3,
    quote_ro: "De la primul contact până la semnarea contractului, m-am simțit respectată și ascultată. Diana și echipa ei m-au ghidat cu răbdare, oferindu-mi feedback real și sprijin sincer.",
    quote_en: "From the first contact to signing the contract, I felt respected and listened to. Diana and her team guided me patiently, giving me real feedback and sincere support." },
  { name: "Raluca V.", role_ro: "Director HR", role_en: "HR Director", sort_order: 4,
    quote_ro: "Diana are un mod unic de a conecta oamenii potriviți cu organizațiile potrivite. Nu livrează doar candidați, ci soluții de echipă.",
    quote_en: "Diana has a unique way of connecting the right people with the right organizations. She doesn't just deliver candidates, she delivers team solutions." },
];

const content = JSON.parse(readFileSync(contentPath, "utf8"));
const contentBySlug = new Map(content.map((c) => [c.slug, c]));

const supabase = createClient(url, key);
const { error: authError } = await supabase.auth.signInWithPassword({
  email: "admin@fullworkservices.com",
  password,
});
if (authError) {
  console.error("Auth failed:", authError.message);
  process.exit(1);
}

const rows = BASE.map((base, i) => {
  const c = contentBySlug.get(base.slug);
  return {
    ...base,
    remote: base.remote ?? false,
    status: "open",
    sort_order: i,
    content_ro: c?.content_ro ?? {},
    content_en: c?.content_en ?? {},
  };
});

// senior-sales-retention: „benefits" din sursă sunt de fapt atribuții — le mutăm
for (const r of rows) {
  if (r.slug === "senior-sales-retention") {
    for (const lang of ["content_ro", "content_en"]) {
      const c = r[lang];
      if (c?.benefits?.length && !(c.responsibilities?.length)) {
        c.responsibilities = c.benefits;
        c.benefits = [];
      }
    }
  }
}

const { error: jobsError, count } = await supabase
  .from("fw_jobs")
  .upsert(rows, { onConflict: "slug", count: "exact" });
if (jobsError) {
  console.error("Jobs upsert failed:", jobsError.message);
  process.exit(1);
}
console.log("jobs upserted:", count ?? rows.length);

const { data: existing } = await supabase.from("fw_testimonials").select("name");
if (!existing?.length) {
  const { error: tErr } = await supabase.from("fw_testimonials").insert(TESTIMONIALS);
  if (tErr) console.error("Testimonials insert failed:", tErr.message);
  else console.log("testimonials inserted:", TESTIMONIALS.length);
} else {
  console.log("testimonials already present:", existing.length);
}

await supabase.auth.signOut();
console.log("done");
