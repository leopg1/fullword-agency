import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { isServicePublished } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { WhatsappIcon } from "@/components/site/whatsapp-icon";
import { FaqSection } from "@/components/site/faq-section";
import { whatsappLink } from "@/lib/site";

type ServiceItem = { title: string; text: string };
type Step = { title: string; text: string };
type Faq = { q: string; a: string };

/**
 * Șablonul comun al paginilor de serviciu — citește un namespace de mesaje
 * (svcRecrutare, svcHr, ...) cu structura standard.
 */
export async function ServicePage({ namespace }: { namespace: string }) {
  // Ascuns din admin → pagina nu mai e accesibilă nici pe link direct.
  if (!(await isServicePublished(namespace))) notFound();
  const t = await getTranslations(namespace);

  const includes = t.raw("includes") as ServiceItem[];
  const forWho = t.raw("forWho") as string[];
  const steps = t.raw("steps") as Step[];
  const faq = t.raw("faq") as Faq[];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      {/* Hero */}
      <section className="bg-brand-tint">
        <div className="container-site py-12 md:py-16">
          <BlurFade>
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-tint-2 px-4 py-2 text-base font-medium">
              <span className="size-2 rounded-full bg-brand" aria-hidden />
              {t("eyebrow")}
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl md:text-5xl">{t("title")}</h1>
            <p className="prose-measure mt-4 text-lg text-muted-foreground md:text-xl">
              {t("subtitle")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-14 rounded-xl px-8 text-lg font-semibold">
                <Link href={{ pathname: "/contact", query: { tip: "oferta" } }}>
                  {t("ctaButton")}
                  <ArrowRight className="size-5" aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                className="h-14 rounded-xl bg-whatsapp px-8 text-lg font-semibold text-white hover:bg-whatsapp/90"
              >
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                  <WhatsappIcon className="size-5" aria-hidden />
                  WhatsApp
                </a>
              </Button>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* Ce include */}
      <section className="section-pad bg-background">
        <div className="container-site">
          <BlurFade inView>
            <h2 className="text-3xl md:text-4xl">{t("includesTitle")}</h2>
          </BlurFade>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {includes.map((item, i) => (
              <BlurFade key={item.title} inView delay={Math.min(0.06 * i, 0.3)} className="h-full">
                <article className="h-full rounded-2xl border border-border bg-card p-6 md:p-7">
                  <CheckCircle2 className="size-7 text-brand" aria-hidden />
                  <h3 className="mt-4 text-xl">{item.title}</h3>
                  <p className="mt-2 text-base text-muted-foreground md:text-lg">{item.text}</p>
                </article>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* Pentru cine — bloc dark */}
      <section className="bg-brand-dark">
        <div className="container-site py-14 md:py-20">
          <BlurFade inView>
            <h2 className="text-3xl text-brand-dark-foreground md:text-4xl">{t("forWhoTitle")}</h2>
            <ul className="mt-7 grid gap-4 md:grid-cols-2">
              {forWho.map((item) => (
                <li key={item} className="flex items-start gap-3 text-lg text-white/90">
                  <CheckCircle2 className="mt-1 size-5 shrink-0 text-brand" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </BlurFade>
        </div>
      </section>

      {/* Pași */}
      <section className="section-pad bg-brand-tint">
        <div className="container-site">
          <BlurFade inView>
            <h2 className="text-3xl md:text-4xl">{t("stepsTitle")}</h2>
          </BlurFade>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title}>
                <BlurFade inView delay={0.1 * i}>
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-brand font-heading text-xl font-bold text-brand-foreground">
                    {i + 1}
                  </div>
                  <h3 className="mt-4 text-xl md:text-2xl">{step.title}</h3>
                  <p className="prose-measure mt-2 text-base text-muted-foreground md:text-lg">
                    {step.text}
                  </p>
                </BlurFade>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <FaqSection faq={faq} title={t("faqTitle")} />

      {/* CTA final */}
      <section className="bg-brand-dark">
        <div className="container-site py-16 text-center md:py-20">
          <BlurFade inView>
            <h2 className="text-3xl text-brand-dark-foreground md:text-4xl">{t("ctaTitle")}</h2>
            <p className="mx-auto mt-3 max-w-xl text-lg text-white/80">{t("ctaText")}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                className="h-14 w-full rounded-xl bg-white px-8 text-lg font-semibold text-foreground hover:bg-white/90 sm:w-auto"
              >
                <Link href={{ pathname: "/contact", query: { tip: "oferta" } }}>
                  {t("ctaButton")}
                  <ArrowRight className="size-5" aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                className="h-14 w-full rounded-xl bg-whatsapp px-8 text-lg font-semibold text-white hover:bg-whatsapp/90 sm:w-auto"
              >
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                  <WhatsappIcon className="size-5" aria-hidden />
                  WhatsApp
                </a>
              </Button>
            </div>
          </BlurFade>
        </div>
      </section>
    </main>
  );
}
