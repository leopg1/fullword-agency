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
      ? { title: 'Mediere profesională a conflictelor', description: 'Rezolvăm conflictele pe cale amiabilă — la locul de muncă sau între oricare două părți: rapid, confidențial și cu valoare legală, fără instanță.' }
      : { title: 'Professional conflict mediation', description: 'We settle disputes amicably — at work or between any two parties: fast, confidential and legally binding, without going to court.' };
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
