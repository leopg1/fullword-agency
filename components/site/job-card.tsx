import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, Banknote, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { BlurFade } from "@/components/ui/blur-fade";
import { countryInfo } from "@/lib/jobs-data";
import { cityLabel } from "@/lib/geo";
import type { JobRecord } from "@/lib/jobs";

/** Card de job — titlu, locație, salariu vizibil, CTA mare. Reutilizat pe homepage și pe board. */
export async function JobCard({ job, delay = 0 }: { job: JobRecord; delay?: number }) {
  const locale = await getLocale();
  const t = await getTranslations("common");
  const country = countryInfo(job.country_code);
  const title = locale === "ro" ? job.title_ro : job.title_en;
  const salary = locale === "ro" ? job.salary_ro : job.salary_en;
  const isOpen = job.status === "open";

  return (
    <BlurFade inView delay={delay} className="h-full">
      <article className="group relative flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <span
            className={
              isOpen
                ? "inline-flex items-center gap-2 rounded-full bg-brand-tint-2 px-3 py-1 text-sm font-semibold text-foreground"
                : "inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm font-semibold text-muted-foreground"
            }
          >
            <span
              className={isOpen ? "size-2 rounded-full bg-whatsapp" : "size-2 rounded-full bg-muted-foreground"}
              aria-hidden
            />
            {isOpen ? t("openJob") : t("closedJob")}
          </span>
          <span className="text-2xl" aria-hidden>
            {country.flag}
          </span>
        </div>

        <h3 className="mt-4 text-xl leading-snug md:text-2xl">
          <Link
            href={{ pathname: "/joburi/[slug]", params: { slug: job.slug } }}
            className="after:absolute after:inset-0"
          >
            {title}
          </Link>
        </h3>

        <ul className="mt-3 space-y-2 text-base text-muted-foreground">
          <li className="flex items-center gap-2.5">
            <MapPin className="size-4.5 shrink-0 text-primary" aria-hidden />
            <span>
              {cityLabel(job.city, locale)}
              {cityLabel(job.city, locale) !== country[locale === "ro" ? "ro" : "en"] &&
                `, ${country[locale === "ro" ? "ro" : "en"]}`}
            </span>
          </li>
          {salary && (
            <li className="flex items-center gap-2.5">
              <Banknote className="size-4.5 shrink-0 text-primary" aria-hidden />
              <span className="font-semibold text-foreground">{salary}</span>
            </li>
          )}
        </ul>

        <span className="mt-5 inline-flex items-center gap-1.5 pt-2 text-base font-semibold text-primary underline underline-offset-4">
          {t("apply")}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </article>
    </BlurFade>
  );
}
