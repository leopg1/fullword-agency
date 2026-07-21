import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BuildCvForm } from "@/components/site/build-cv-form";
import { alternatesFor } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const base: Metadata =
    locale === "ro"
      ? {
          title: "Nu ai CV? Îți facem noi unul",
          description:
            "Completează câteva câmpuri simple și îți generăm un CV profesional, gata de trimis către angajator. Fără să știi să faci CV.",
        }
      : {
          title: "No CV? We'll make you one",
          description:
            "Fill in a few simple fields and we'll generate a professional CV, ready to send to the employer. No CV-writing skills needed.",
        };
  return { ...base, alternates: alternatesFor("/completeaza-cv", locale), robots: { index: true } };
}

export default async function BuildCvPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ job?: string }>;
}) {
  const { locale } = await params;
  const { job } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("buildCv");

  return (
    <div className="bg-brand-tint">
      <div className="container-site max-w-3xl py-12 md:py-16">
        <header className="mb-8 text-center">
          <p className="text-base font-semibold uppercase tracking-wide text-primary">{t("eyebrow")}</p>
          <h1 className="mt-2 text-3xl md:text-4xl">{t("title")}</h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-muted-foreground">{t("subtitle")}</p>
        </header>

        <BuildCvForm jobId={job} />
      </div>
    </div>
  );
}
