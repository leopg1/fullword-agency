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
      ? { title: 'Permise de muncă pentru angajați non-UE', description: 'Aducem legal angajați din afara UE: evaluare eligibilitate, dosare IGI, avize de muncă și negocieri colective — birocrația e treaba noastră.' }
      : { title: 'Work permits for non-EU employees', description: 'Hire non-EU employees legally: eligibility checks, IGI files, work approvals and collective bargaining — we handle the bureaucracy.' };
  return { ...base, alternates: alternatesFor('/servicii/permise-de-munca', locale) };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ServicePage namespace='svcPermise' />;
}
