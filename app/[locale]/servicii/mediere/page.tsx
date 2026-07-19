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
      ? { title: 'Mediere profesională a conflictelor de muncă', description: 'Rezolvăm conflictele dintre angajați și angajatori pe cale amiabilă: rapid, confidențial și cu valoare legală — fără instanță.' }
      : { title: 'Professional workplace mediation', description: 'We settle disputes between employees and employers amicably: fast, confidential and legally binding — without going to court.' };
  return { ...base, alternates: alternatesFor('/servicii/mediere', locale) };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ServicePage namespace='svcMediere' />;
}
