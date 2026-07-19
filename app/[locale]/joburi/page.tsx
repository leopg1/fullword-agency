import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { JobCard } from "@/components/site/job-card";
import { BlurFade } from "@/components/ui/blur-fade";
import { getJobs } from "@/lib/jobs";
import { countryInfo } from "@/lib/jobs-data";
import type { JobDomain } from "@/lib/jobs-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/site/whatsapp-icon";
import { whatsappLink } from "@/lib/site";
import { alternatesFor } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const base: Metadata = locale === "ro"
    ? {
        title: "Joburi deschise în România și Europa",
        description:
          "Locuri de muncă verificate cu contract oficial: construcții, logistică, transport, HoReCa, birou și medical. Interviu în 24h, fără taxe pentru candidați.",
      }
    : {
        title: "Open jobs in Romania and Europe",
        description:
          "Verified jobs with official contracts: construction, logistics, transport, HoReCa, office and medical. Interview within 24h, no candidate fees.",
      };  return { ...base, alternates: alternatesFor("/joburi", locale) };
}

const DOMAINS: JobDomain[] = ["construction", "logistics", "transport", "horeca", "office", "medical"];

export default async function JobsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ domeniu?: string; tara?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { domeniu, tara } = await searchParams;
  const t = await getTranslations("jobsBoard");
  const tDomains = await getTranslations("domains");

  const jobs = await getJobs();
  const countries = [...new Set(jobs.map((j) => j.country_code))];

  const filtered = jobs.filter(
    (j) =>
      (!domeniu || j.domain === domeniu) &&
      (!tara || j.country_code === tara)
  );
  // Joburile deschise primele
  const sorted = [...filtered.filter((j) => j.status === "open"), ...filtered.filter((j) => j.status === "closed")];

  const chip = (active: boolean) =>
    cn(
      "inline-flex min-h-11 items-center rounded-full border px-4 text-base font-medium transition-colors",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
    );

  return (
    <main>
      {/* Hero color-block */}
      <section className="bg-brand-tint">
        <div className="container-site py-12 md:py-16">
          <BlurFade>
            <h1 className="text-4xl md:text-5xl">{t("title")}</h1>
            <p className="prose-measure mt-4 text-lg text-muted-foreground md:text-xl">
              {t("subtitle")}
            </p>
          </BlurFade>

          {/* Filtre: linkuri simple, fără JS — accesibile pentru toată lumea */}
          <BlurFade delay={0.1}>
            <nav aria-label={t("byDomain")} className="mt-8 flex flex-wrap gap-2">
              <Link href="/joburi" className={chip(!domeniu && !tara)}>
                {t("all")}
              </Link>
              {DOMAINS.map((d) => (
                <Link
                  key={d}
                  href={{ pathname: "/joburi", query: { ...(tara && { tara }), ...(domeniu === d ? {} : { domeniu: d }) } }}
                  className={chip(domeniu === d)}
                >
                  {tDomains(d)}
                </Link>
              ))}
            </nav>
            <nav aria-label={t("byCountry")} className="mt-3 flex flex-wrap gap-2">
              {countries.map((c) => (
                <Link
                  key={c}
                  href={{ pathname: "/joburi", query: { ...(domeniu && { domeniu }), ...(tara === c ? {} : { tara: c }) } }}
                  className={chip(tara === c)}
                >
                  {countryInfo(c).flag} {countryInfo(c)[locale === "ro" ? "ro" : "en"]}
                </Link>
              ))}
            </nav>
          </BlurFade>
        </div>
      </section>

      {/* Lista */}
      <section className="section-pad bg-background">
        <div className="container-site">
          <p className="text-base text-muted-foreground">{t("count", { count: sorted.length })}</p>
          {sorted.length === 0 ? (
            <div className="mt-8 max-w-2xl rounded-2xl border border-border bg-brand-tint p-8">
              <p className="text-lg">{t("empty")}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="h-13 rounded-xl bg-whatsapp px-6 text-base font-semibold text-white hover:bg-whatsapp/90"
                >
                  <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                    <WhatsappIcon className="size-5" aria-hidden />
                    WhatsApp
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-13 rounded-xl border-2 px-6 text-base font-semibold">
                  <Link href="/joburi">{t("reset")}</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sorted.map((job, i) => (
                <JobCard key={job.slug} job={job} delay={Math.min(0.05 * i, 0.3)} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
