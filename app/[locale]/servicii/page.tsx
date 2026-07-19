import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { ServicesGrid } from "@/components/sections/services-grid";
import { WhatsappIcon } from "@/components/site/whatsapp-icon";
import { whatsappLink } from "@/lib/site";
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
        title: "Servicii de recrutare, HR și juridice",
        description:
          "Recrutare personal, partener HR extern, permise de muncă, înființare firmă, cetățenie română și mediere — toate serviciile Full Work Services.",
      }
    : {
        title: "Recruitment, HR and legal services",
        description:
          "Staff recruitment, external HR partner, work permits, company formation, Romanian citizenship and mediation — all Full Work Services offerings.",
      };  return { ...base, alternates: alternatesFor("/servicii", locale) };
}

export default async function ServicesHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("servicesHub");

  return (
    <main>
      <section className="bg-brand-tint">
        <div className="container-site py-12 md:py-16">
          <BlurFade>
            <h1 className="text-4xl md:text-5xl">{t("title")}</h1>
            <p className="prose-measure mt-4 text-lg text-muted-foreground md:text-xl">
              {t("subtitle")}
            </p>
          </BlurFade>
        </div>
      </section>

      <ServicesGrid hideHeading className="bg-background" />

      <section className="bg-brand-dark">
        <div className="container-site py-16 text-center md:py-20">
          <BlurFade inView>
            <h2 className="text-3xl text-brand-dark-foreground md:text-4xl">{t("ctaTitle")}</h2>
            <p className="mx-auto mt-3 max-w-xl text-lg text-white/80">{t("ctaText")}</p>
            <Button
              asChild
              className="mt-8 h-14 rounded-xl bg-whatsapp px-8 text-lg font-semibold text-white hover:bg-whatsapp/90"
            >
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                <WhatsappIcon className="size-5" aria-hidden />
                {t("ctaButton")}
              </a>
            </Button>
          </BlurFade>
        </div>
      </section>
    </main>
  );
}
