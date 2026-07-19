import { getTranslations } from "next-intl/server";
import { BlurFade } from "@/components/ui/blur-fade";

/** Procesul în 3 pași — numere mari, linie de legătură, zero încărcătură. */
export async function ProcessSteps() {
  const t = await getTranslations("process");

  const steps = [
    { title: t("s1Title"), text: t("s1Text") },
    { title: t("s2Title"), text: t("s2Text") },
    { title: t("s3Title"), text: t("s3Text") },
  ];

  return (
    <section className="section-pad bg-brand-tint">
      <div className="container-site">
        <BlurFade inView>
          <h2 className="text-3xl md:text-4xl">{t("title")}</h2>
          <p className="mt-3 text-lg text-muted-foreground">{t("subtitle")}</p>
        </BlurFade>

        <div className="relative mt-12">
          {/* linia de legătură (doar desktop) */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-8 hidden h-0.5 bg-brand-tint-2 md:block"
          />
          <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map(({ title, text }, i) => (
              <li key={title} className="relative">
                <BlurFade inView delay={0.12 * i}>
                  <div className="relative z-10 flex size-16 items-center justify-center rounded-2xl bg-brand font-heading text-2xl font-bold text-brand-foreground">
                    {i + 1}
                  </div>
                  <h3 className="mt-5 text-xl md:text-2xl">{title}</h3>
                  <p className="prose-measure mt-2.5 text-base text-muted-foreground md:text-lg">
                    {text}
                  </p>
                </BlurFade>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
