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
      ? { title: 'Redobândirea cetățeniei române', description: 'Te ajutăm să redobândești cetățenia română: audit de dosar, cercetare în arhive, traduceri, depunere la ANC, pregătire pentru jurământ și transcrierea actelor.' }
      : { title: 'Romanian citizenship reacquisition', description: 'We help you reacquire Romanian citizenship: file audit, archive research, translations, ANC submission, oath preparation and document transcription.' };
  return { ...base, alternates: alternatesFor('/servicii/cetatenie', locale) };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ServicePage namespace='svcCetatenie' />;
}
