import { getTranslations } from "next-intl/server";
import { ArrowRight, Briefcase, UserRound } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { getServicesForAudience } from "@/lib/services";
import type { StaticAppPathname } from "@/i18n/routing";

type ForkLink = { href: StaticAppPathname; label: string };

/**
 * Fork-ul de audiență: companie vs. persoană fizică.
 *
 * Fiecare card e un selector: lista serviciilor care se adresează audienței
 * respective, fiecare rând ducând direct în pagina serviciului. Ordinea și
 * vizibilitatea vin din admin (`fw_services`), deci lista se schimbă de acolo.
 */
export async function AudienceFork() {
  const t = await getTranslations("audience");
  const tSvc = await getTranslations("services");

  const [companyServices, personServices] = await Promise.all([
    getServicesForAudience("companies"),
    getServicesForAudience("individuals"),
  ]);

  const companyLinks: ForkLink[] = companyServices.map((s) => ({
    href: s.href,
    label: tSvc(`${s.key}Title`),
  }));

  // La persoane fizice joburile stau primele — e drumul cel mai căutat.
  const personLinks: ForkLink[] = [
    { href: "/joburi", label: t("jobsLink") },
    ...personServices.map((s) => ({ href: s.href, label: tSvc(`${s.key}Title`) })),
  ];

  return (
    <section className="bg-brand-tint pb-16 pt-12 md:pb-24 md:pt-16 lg:pb-28 lg:pt-14">
      <div className="container-site">
        <BlurFade inView>
          <h2 className="text-3xl md:text-4xl">{t("title")}</h2>
          <p className="mt-3 text-lg text-muted-foreground">{t("subtitle")}</p>
        </BlurFade>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {/* Companii — tentă deschisă */}
          <BlurFade inView delay={0.1} className="h-full">
            <article className="flex h-full flex-col rounded-3xl border border-border bg-card p-7 md:p-10">
              <div className="flex items-center gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand">
                  <Briefcase className="size-7 text-brand-foreground" aria-hidden />
                </div>
                <h3 className="text-2xl md:text-3xl">{t("companiesTitle")}</h3>
              </div>
              <p className="mt-6 text-base font-semibold">{t("chooseLabel")}</p>
              <ul className="mt-3 space-y-2">
                {companyLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="flex min-h-12 items-center justify-between gap-4 rounded-xl border border-brand-tint-2 bg-brand-tint px-4 py-2 text-base font-medium transition-colors hover:border-primary hover:bg-brand-tint-2 md:text-lg"
                    >
                      {label}
                      <ArrowRight className="size-5 shrink-0 text-primary" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>

              <p className="prose-measure mt-6 text-lg text-muted-foreground">
                {t("companiesText")}
              </p>

              <div className="mt-7 pt-2 md:mt-auto">
                <Button asChild className="h-14 w-full rounded-xl px-8 text-lg font-semibold sm:w-auto">
                  <Link href="/contact">
                    {t("companiesCta")}
                    <ArrowRight className="size-5" aria-hidden />
                  </Link>
                </Button>
              </div>
            </article>
          </BlurFade>

          {/* Persoane fizice — bloc închis, contrast maxim */}
          <BlurFade inView delay={0.2} className="h-full">
            <article className="flex h-full flex-col rounded-3xl bg-brand-dark p-7 text-brand-dark-foreground md:p-10">
              <div className="flex items-center gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand">
                  <UserRound className="size-7 text-brand-foreground" aria-hidden />
                </div>
                <h3 className="text-2xl md:text-3xl">{t("candidatesTitle")}</h3>
              </div>
              <p className="mt-6 text-base font-semibold">{t("chooseLabel")}</p>
              <ul className="mt-3 space-y-2">
                {personLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="flex min-h-12 items-center justify-between gap-4 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-base font-medium transition-colors hover:border-white/40 hover:bg-white/20 md:text-lg"
                    >
                      {label}
                      <ArrowRight className="size-5 shrink-0 text-brand" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>

              <p className="prose-measure mt-6 text-lg text-white/80">{t("candidatesText")}</p>

              <div className="mt-7 pt-2 md:mt-auto">
                <Button
                  asChild
                  className="h-14 w-full rounded-xl bg-white px-8 text-lg font-semibold text-foreground hover:bg-white/90 sm:w-auto"
                >
                  <Link href="/completeaza-cv">
                    {t("candidatesCta")}
                    <ArrowRight className="size-5" aria-hidden />
                  </Link>
                </Button>
              </div>
            </article>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
