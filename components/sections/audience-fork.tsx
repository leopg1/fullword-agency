import { getTranslations } from "next-intl/server";
import { ArrowRight, Briefcase, CheckCircle2, UserRound } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";

/** Fork-ul de audiență: companie vs. candidat — două carduri mari, contrastante. */
export async function AudienceFork() {
  const t = await getTranslations("audience");

  return (
    <section className="section-pad bg-background">
      <div className="container-site">
        <BlurFade inView>
          <h2 className="text-3xl md:text-4xl">{t("title")}</h2>
          <p className="mt-3 text-lg text-muted-foreground">{t("subtitle")}</p>
        </BlurFade>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {/* Companii — tentă deschisă */}
          <BlurFade inView delay={0.1} className="h-full">
            <article className="flex h-full flex-col rounded-3xl border border-brand-tint-2 bg-brand-tint p-7 md:p-10">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-brand">
                <Briefcase className="size-7 text-brand-foreground" aria-hidden />
              </div>
              <h3 className="mt-6 text-2xl md:text-3xl">{t("companiesTitle")}</h3>
              <p className="prose-measure mt-3 text-lg text-muted-foreground">
                {t("companiesText")}
              </p>
              <ul className="mt-6 space-y-3 text-base md:text-lg">
                {[t("companiesB1"), t("companiesB2"), t("companiesB3")].map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-2 md:mt-auto">
                <Button asChild className="h-14 w-full rounded-xl px-8 text-lg font-semibold sm:w-auto">
                  <Link href="/servicii/recrutare">
                    {t("companiesCta")}
                    <ArrowRight className="size-5" aria-hidden />
                  </Link>
                </Button>
              </div>
            </article>
          </BlurFade>

          {/* Candidați — bloc închis, contrast maxim */}
          <BlurFade inView delay={0.2} className="h-full">
            <article className="flex h-full flex-col rounded-3xl bg-brand-dark p-7 text-brand-dark-foreground md:p-10">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-brand">
                <UserRound className="size-7 text-brand-foreground" aria-hidden />
              </div>
              <h3 className="mt-6 text-2xl md:text-3xl">{t("candidatesTitle")}</h3>
              <p className="prose-measure mt-3 text-lg text-white/80">{t("candidatesText")}</p>
              <ul className="mt-6 space-y-3 text-base md:text-lg">
                {[t("candidatesB1"), t("candidatesB2"), t("candidatesB3")].map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 size-5 shrink-0 text-brand" aria-hidden />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-2 md:mt-auto">
                <Button
                  asChild
                  className="h-14 w-full rounded-xl bg-white px-8 text-lg font-semibold text-foreground hover:bg-white/90 sm:w-auto"
                >
                  <Link href="/joburi">
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
