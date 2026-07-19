import type { Metadata } from "next";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { HeartHandshake, ShieldCheck, Users } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Founder } from "@/components/sections/founder";
import { FinalCta } from "@/components/sections/final-cta";
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
        title: "Despre noi",
        description:
          "Full Work Services este agenția de recrutare din București construită pe transparență și respect — condusă de Diana Dina, cu peste 15 ani de experiență în HR.",
      }
    : {
        title: "About us",
        description:
          "Full Work Services is a Bucharest recruitment agency built on transparency and respect — led by Diana Dina, with over 15 years of HR experience.",
      };  return { ...base, alternates: alternatesFor("/despre-noi", locale) };
}

const VALUE_ICONS = [ShieldCheck, HeartHandshake, Users];

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const tStats = await getTranslations("stats");
  const currentLocale = await getLocale();
  const numberLocale = currentLocale === "ro" ? "ro-RO" : "en-US";

  const vision = t.raw("vision") as string[];
  const values = t.raw("values") as { title: string; text: string }[];

  const stats = [
    { value: 10000, label: tStats("interviews") },
    { value: 150, label: tStats("companies") },
    { value: 2500, label: tStats("placements") },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="bg-brand-tint">
        <div className="container-site py-12 md:py-16">
          <BlurFade>
            <h1 className="text-4xl md:text-5xl">{t("title")}</h1>
            <p className="prose-measure mt-4 text-lg text-muted-foreground md:text-xl">
              {t("intro")}
            </p>
          </BlurFade>
        </div>
      </section>

      {/* Viziunea — lead mare + coloane, fără coloană goală */}
      <section className="section-pad bg-background">
        <div className="container-site">
          <BlurFade inView>
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-tint-2 px-4 py-2 text-base font-medium">
              <span className="size-2 rounded-full bg-brand" aria-hidden />
              {t("visionEyebrow")}
            </p>
          </BlurFade>
          <BlurFade inView delay={0.05}>
            <p className="mt-6 max-w-4xl font-heading text-2xl font-semibold leading-snug text-foreground md:text-3xl">
              {vision[0]}
            </p>
          </BlurFade>
          {vision.length > 1 && (
            <div className="mt-10 grid gap-8 border-t border-border pt-10 md:grid-cols-2">
              {vision.slice(1).map((p, i) => (
                <BlurFade key={p.slice(0, 30)} inView delay={0.1 * i}>
                  <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">{p}</p>
                </BlurFade>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cifre — bandă dark */}
      <section className="bg-brand-dark">
        <div className="container-site py-14 md:py-16">
          <BlurFade inView>
            <p className="text-center text-lg font-medium text-white/70">{tStats("subtitle")}</p>
            <ul className="mt-8 grid gap-8 text-center sm:grid-cols-3">
              {stats.map(({ value, label }) => (
                <li key={label}>
                  <p className="whitespace-nowrap font-heading text-4xl font-bold text-brand-dark-foreground md:text-5xl">
                    <NumberTicker value={value} locale={numberLocale} className="text-brand-dark-foreground" />+
                  </p>
                  <p className="mt-2 text-lg text-white/80">{label}</p>
                </li>
              ))}
            </ul>
          </BlurFade>
        </div>
      </section>

      {/* Valori */}
      <section className="section-pad bg-brand-tint">
        <div className="container-site">
          <BlurFade inView>
            <h2 className="text-3xl md:text-4xl">{t("valuesTitle")}</h2>
          </BlurFade>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {values.map(({ title, text }, i) => {
              const Icon = VALUE_ICONS[i % VALUE_ICONS.length];
              return (
                <BlurFade key={title} inView delay={0.08 * i} className="h-full">
                  <article className="h-full rounded-2xl border border-border bg-card p-7">
                    <div className="flex size-13 items-center justify-center rounded-xl bg-brand-tint-2">
                      <Icon className="size-6.5 text-primary" aria-hidden />
                    </div>
                    <h3 className="mt-5 text-xl md:text-2xl">{title}</h3>
                    <p className="mt-2.5 text-base text-muted-foreground md:text-lg">{text}</p>
                  </article>
                </BlurFade>
              );
            })}
          </div>
        </div>
      </section>

      <Founder />
      <FinalCta />
    </main>
  );
}
