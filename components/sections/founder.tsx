import { getTranslations } from "next-intl/server";
import { ArrowRight, Quote } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { BlurFade } from "@/components/ui/blur-fade";

/**
 * Fondatoarea — fără fotografie (nu există portret real; nu inventăm unul).
 * Citat mare + text, cu compoziție discretă din formele logo-ului.
 */
export async function Founder({ compact = false }: { compact?: boolean } = {}) {
  const t = await getTranslations("founder");

  return (
    <section className="section-pad bg-background">
      <div className="container-site grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        {/* Citatul — bloc brand-tint cu forme din logo */}
        <BlurFade inView>
          <figure className="relative overflow-hidden rounded-3xl bg-brand-tint p-8 md:p-10">
            <span
              aria-hidden
              className="absolute -right-10 -top-10 h-24 w-48 -rotate-[18deg] rounded-full bg-brand-tint-2"
            />
            <span
              aria-hidden
              className="absolute -bottom-8 -left-6 h-16 w-36 -rotate-[18deg] rounded-full bg-brand-tint-2"
            />
            <Quote className="relative size-10 text-brand" aria-hidden />
            <blockquote className="relative mt-5 font-heading text-xl font-semibold leading-relaxed text-foreground md:text-2xl">
              „{t("quote")}”
            </blockquote>
            <figcaption className="relative mt-6">
              <p className="font-heading text-lg font-semibold text-foreground">{t("name")}</p>
              <p className="text-base text-muted-foreground">{t("role")}</p>
            </figcaption>
          </figure>
        </BlurFade>

        {/* Textul */}
        <BlurFade inView delay={0.12}>
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-tint-2 px-4 py-2 text-base font-medium">
            <span className="size-2 rounded-full bg-brand" aria-hidden />
            {t("eyebrow")}
          </p>
          <h2 className="mt-5 text-3xl md:text-4xl">{t("title")}</h2>
          {compact ? (
            <Link
              href="/despre-noi"
              className="mt-5 inline-flex min-h-12 items-center gap-2 text-lg font-semibold text-primary underline underline-offset-4"
            >
              {t("more")}
              <ArrowRight className="size-5" aria-hidden />
            </Link>
          ) : (
            <p className="prose-measure mt-5 text-lg text-muted-foreground md:text-xl">
              {t("text")}
            </p>
          )}
        </BlurFade>
      </div>
    </section>
  );
}
