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
      ? { title: 'Înființare firmă în România', description: 'Îți deschidem firmă în România: înregistrare, acte, cod fiscal, cont bancar, traduceri și reprezentare prin procură — fără drumuri și cozi.' }
      : { title: 'Company formation in Romania', description: 'We set up your company in Romania: registration, paperwork, tax ID, bank account, translations and PoA representation — without the queues.' };
  return { ...base, alternates: alternatesFor('/servicii/infiintare-firma', locale) };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ServicePage namespace='svcInfiintare' />;
}
