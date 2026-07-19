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
      ? { title: 'Partener HR extern', description: 'Externalizează HR-ul: contracte, administrare de personal, conformitate cu legislația muncii și strategii de retenție — totul la un singur partener.' }
      : { title: 'External HR partner', description: 'Outsource your HR: contracts, personnel administration, labour-law compliance and retention strategies — all with one partner.' };
  return { ...base, alternates: alternatesFor('/servicii/hr-outsourcing', locale) };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ServicePage namespace='svcHr' />;
}
