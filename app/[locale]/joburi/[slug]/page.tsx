import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  ClipboardList,
  Gift,
  MapPin,
  Search,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { ApplyForm } from "@/components/site/apply-form";
import { ShareButtons } from "@/components/site/share-buttons";
import { jobShareText } from "@/lib/share";
import { WhatsappIcon } from "@/components/site/whatsapp-icon";
import { getJobBySlug, getJobs, type JobContent } from "@/lib/jobs";
import { countryInfo } from "@/lib/jobs-data";
import { cityLabel } from "@/lib/geo";
import { absoluteUrl, site, whatsappLink } from "@/lib/site";
import { alternatesFor } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return {};
  const title = locale === "ro" ? job.title_ro : job.title_en;
  const salary = locale === "ro" ? job.salary_ro : job.salary_en;
  const country = countryInfo(job.country_code)[locale === "ro" ? "ro" : "en"];
  const fullTitle = `${title} — ${cityLabel(job.city, locale)}${cityLabel(job.city, locale) !== country ? `, ${country}` : ""}`;
  const description =
    locale === "ro"
      ? `Job deschis: ${title}. ${salary ? `Salariu: ${salary}. ` : ""}Contract oficial, interviu în 24h, fără taxe pentru candidați.`
      : `Open job: ${title}. ${salary ? `Salary: ${salary}. ` : ""}Official contract, interview within 24h, no candidate fees.`;
  return {
    title: fullTitle,
    description,
    alternates: alternatesFor({ pathname: "/joburi/[slug]", params: { slug } }, locale),
    // Cardul de share (Facebook/WhatsApp). Imaginea e afișul generat de
    // `opengraph-image.tsx`, dar o declarăm explicit cu `?v=<updated_at>`:
    // Facebook ține imaginile în cache DUPĂ URL, iar URL-ul generat de Next are
    // un hash din fișier (identic pentru toate joburile, neschimbat la editare).
    // Fără versionare, un job editat ar rămâne cu cardul vechi la nesfârșit.
    openGraph: {
      title: fullTitle,
      description,
      type: "article",
      url: absoluteUrl(locale === "en" ? `/en/jobs/${slug}` : `/joburi/${slug}`),
      images: [
        {
          url: absoluteUrl(
            `/${locale}/joburi/${slug}/opengraph-image?v=${encodeURIComponent(
              job.updated_at ?? job.created_at ?? "1"
            )}`
          ),
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

const SECTIONS: {
  key: keyof Pick<JobContent, "benefits" | "requirements" | "location" | "responsibilities">;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  marker: "check" | "dot" | "dash";
}[] = [
  { key: "benefits", icon: Gift, marker: "check" },
  { key: "requirements", icon: Search, marker: "dot" },
  { key: "location", icon: MapPin, marker: "dash" },
  { key: "responsibilities", icon: ClipboardList, marker: "dot" },
];

const MARKERS: Record<"check" | "dot" | "dash", React.ReactNode> = {
  check: <CheckCircle2 className="mt-1 size-5 shrink-0 text-primary" aria-hidden />,
  dot: <span aria-hidden className="mt-3 size-2 shrink-0 rounded-full bg-brand" />,
  dash: <span aria-hidden className="mt-3.5 h-0.5 w-4 shrink-0 -rotate-[18deg] rounded-full bg-brand" />,
};

export default async function JobPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("jobPage");

  const job = await getJobBySlug(slug);
  if (!job) notFound();

  const title = locale === "ro" ? job.title_ro : job.title_en;
  const salary = locale === "ro" ? job.salary_ro : job.salary_en;
  const content = (locale === "ro" ? job.content_ro : job.content_en) ?? {};
  const country = countryInfo(job.country_code);
  const countryName = country[locale === "ro" ? "ro" : "en"];
  const isOpen = job.status === "open";

  // Google for Jobs — doar pentru pozițiile deschise
  const jobPostingJsonLd = isOpen
    ? {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title,
        description: [content.subtitle, ...(content.intro ?? [])].filter(Boolean).join(" "),
        datePosted: job.created_at?.slice(0, 10),
        employmentType: "FULL_TIME",
        hiringOrganization: {
          "@type": "Organization",
          name: site.name,
          sameAs: site.url,
          logo: `${site.url}/images/brand/logo-sky.png`,
        },
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: job.city,
            addressCountry: job.country_code,
          },
        },
        ...(job.remote ? { jobLocationType: "TELECOMMUTE" } : {}),
        directApply: true,
      }
    : null;

  return (
    <main className="pb-24 lg:pb-0">
      {jobPostingJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd).replace(/</g, "\\u003c") }}
        />
      )}
      {/* Antet job — bloc tentă */}
      <section className="bg-brand-tint">
        <div className="container-site py-10 md:py-14">
          <BlurFade>
            <Link
              href="/joburi"
              className="inline-flex min-h-11 items-center gap-2 text-base font-medium text-primary underline underline-offset-4"
            >
              <ArrowLeft className="size-4.5" aria-hidden />
              {t("back")}
            </Link>
            <h1 className="mt-4 max-w-3xl text-3xl md:text-5xl">{title}</h1>
            {content.subtitle && (
              <p className="prose-measure mt-3 text-lg text-muted-foreground md:text-xl">
                {content.subtitle}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-lg">
              <span className="inline-flex items-center gap-2 font-medium">
                <MapPin className="size-5 text-primary" aria-hidden />
                {cityLabel(job.city, locale)}
                {cityLabel(job.city, locale) !== countryName && `, ${countryName}`} {country.flag}
              </span>
              {salary && (
                <span className="inline-flex items-center gap-2 font-semibold">
                  <Banknote className="size-5 text-primary" aria-hidden />
                  {salary}
                </span>
              )}
            </div>
          </BlurFade>
        </div>
      </section>

      <section className="section-pad bg-background">
        <div className="container-site grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          {/* Conținutul jobului */}
          <div className="space-y-10">
            {(content.intro ?? []).map((p) => (
              <BlurFade key={p.slice(0, 40)} inView>
                <p className="prose-measure text-lg leading-relaxed text-foreground md:text-xl">
                  {p}
                </p>
              </BlurFade>
            ))}

            {SECTIONS.map(({ key, icon: Icon, marker }) => {
              const items = content[key];
              if (!items?.length) return null;
              return (
                <BlurFade key={key} inView>
                  <section>
                    <h2 className="flex items-center gap-3 text-2xl md:text-3xl">
                      <span className="flex size-11 items-center justify-center rounded-xl bg-brand-tint-2">
                        <Icon className="size-5.5 text-primary" aria-hidden />
                      </span>
                      {t(key)}
                    </h2>
                    <ul className="mt-5 space-y-3">
                      {items.map((item) => (
                        <li key={item.slice(0, 60)} className="flex items-start gap-3 text-lg">
                          {MARKERS[marker]}
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                </BlurFade>
              );
            })}

            {/* Share — textul anunțului e gata scris pentru postare */}
            <BlurFade inView>
              <ShareButtons postText={jobShareText(job, content, locale)} />
            </BlurFade>
          </div>

          {/* Card aplicare — sticky pe desktop */}
          <aside id="aplica" className="scroll-mt-24 lg:sticky lg:top-28 lg:self-start">
            <BlurFade inView>
              <div className="rounded-3xl border border-border bg-card p-6 shadow-lg md:p-8">
                {isOpen ? (
                  <>
                    <h2 className="text-2xl md:text-3xl">{t("applyTitle")}</h2>
                    <p className="mt-2 text-base text-muted-foreground">{t("applySubtitle")}</p>
                    <div className="mt-6">
                      <ApplyForm jobId={job.id} />
                    </div>
                    <p className="mt-5 text-center text-base text-muted-foreground">
                      {t("orWhatsapp")}
                    </p>
                    <Button
                      asChild
                      className="mt-3 h-13 w-full rounded-xl bg-whatsapp text-lg font-semibold text-white hover:bg-whatsapp/90"
                    >
                      <a
                        href={whatsappLink(t("whatsappText", { title }))}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <WhatsappIcon className="size-5" aria-hidden />
                        WhatsApp
                      </a>
                    </Button>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl">{t("closedTitle")}</h2>
                    <p className="mt-3 text-base text-muted-foreground">{t("closedText")}</p>
                    <Button asChild className="mt-6 h-13 w-full rounded-xl text-lg font-semibold">
                      <Link href="/joburi">{t("back")}</Link>
                    </Button>
                  </>
                )}
              </div>
            </BlurFade>
          </aside>
        </div>
      </section>

      {/* Bară fixă de aplicare — doar mobil, doar joburi deschise */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur-sm lg:hidden">
          <div className="mx-auto flex max-w-xl gap-2">
            <Button asChild className="h-13 flex-1 rounded-xl text-lg font-semibold">
              <a href="#aplica">{t("applyNow")}</a>
            </Button>
            <Button
              asChild
              className="h-13 rounded-xl bg-whatsapp px-4 text-white hover:bg-whatsapp/90"
            >
              <a
                href={whatsappLink(t("whatsappText", { title }))}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <WhatsappIcon className="size-6" aria-hidden />
              </a>
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

export async function generateStaticParams() {
  const jobs = await getJobs();
  return jobs.map((j) => ({ slug: j.slug }));
}
