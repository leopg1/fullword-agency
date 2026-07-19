import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { JobsPreview } from "@/components/sections/jobs-preview";
import { FaqSection } from "@/components/site/faq-section";
import { alternatesFor } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const base: Metadata = locale === "ro"
    ? {
        title: "Pentru candidați — cum funcționează",
        description:
          "Cum te ajutăm să-ți găsești un loc de muncă sigur, în România sau în Europa: pași simpli, contract oficial și zero taxe pentru candidați.",
      }
    : {
        title: "For candidates — how it works",
        description:
          "How we help you find a secure job in Romania or across Europe: simple steps, official contracts and zero candidate fees.",
      };  return { ...base, alternates: alternatesFor("/pentru-candidati", locale) };
}

export default async function CandidatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("candidates");

  const steps = t.raw("steps") as { title: string; text: string }[];
  const safety = t.raw("safety") as { title: string; text: string }[];
  const faq = t.raw("faq") as { q: string; a: string }[];

  return (
    <main>
      {/* Hero */}
      <section className="bg-brand-tint">
        <div className="container-site py-12 md:py-16">
          <BlurFade>
            <h1 className="max-w-3xl text-4xl md:text-5xl">{t("title")}</h1>
            <p className="prose-measure mt-4 text-lg text-muted-foreground md:text-xl">
              {t("subtitle")}
            </p>
            <p className="prose-measure mt-4 text-lg text-muted-foreground">{t("ctaText")}</p>
            <Button asChild className="mt-8 h-14 w-full rounded-xl px-8 text-lg font-semibold sm:w-auto">
              <Link href="/joburi">
                {t("ctaButton")}
                <ArrowRight className="size-5" aria-hidden />
              </Link>
            </Button>
          </BlurFade>
        </div>
      </section>

      {/* Pașii */}
      <section className="section-pad bg-background">
        <div className="container-site">
          <BlurFade inView>
            <h2 className="text-3xl md:text-4xl">{t("stepsTitle")}</h2>
          </BlurFade>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step.title}>
                <BlurFade inView delay={0.08 * i}>
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-brand font-heading text-xl font-bold text-brand-foreground">
                    {i + 1}
                  </div>
                  <h3 className="mt-4 text-xl">{step.title}</h3>
                  <p className="mt-2 text-base text-muted-foreground md:text-lg">{step.text}</p>
                </BlurFade>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Siguranță — bloc dark */}
      <section className="bg-brand-dark">
        <div className="container-site py-14 md:py-20">
          <BlurFade inView>
            <h2 className="text-3xl text-brand-dark-foreground md:text-4xl">{t("safetyTitle")}</h2>
          </BlurFade>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {safety.map(({ title, text }, i) => (
              <BlurFade key={title} inView delay={0.07 * i} className="h-full">
                <article className="flex h-full items-start gap-4 rounded-2xl bg-white/10 p-6">
                  <ShieldCheck className="mt-1 size-7 shrink-0 text-brand" aria-hidden />
                  <div>
                    <h3 className="text-xl text-brand-dark-foreground">{title}</h3>
                    <p className="mt-1.5 text-base text-white/80 md:text-lg">{text}</p>
                  </div>
                </article>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FaqSection faq={faq} title={t("faqTitle")} className="bg-brand-tint" />

      <JobsPreview />
    </main>
  );
}
