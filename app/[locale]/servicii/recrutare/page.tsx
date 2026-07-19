import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ServicePage } from "@/components/site/service-page";
import { alternatesFor } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const base: Metadata =
    locale === "ro"
      ? { title: 'Recrutare personal pentru firme', description: 'Găsim și verificăm candidații potriviți pentru firma ta: de la muncitori calificați la manageri. Primele CV-uri în 48h, garanție de înlocuire 30 de zile.' }
      : { title: 'Staff recruitment for companies', description: 'We find and vet the right candidates for your company: from skilled workers to managers. First CVs in 48h, 30-day replacement guarantee.' };
  return { ...base, alternates: alternatesFor('/servicii/recrutare', locale) };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ServicePage namespace='svcRecrutare' />;
}
