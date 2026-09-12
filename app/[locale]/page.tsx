import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { alternatesFor } from "@/lib/seo";
import { Hero } from "@/components/sections/hero";
import { AudienceFork } from "@/components/sections/audience-fork";
import { ServicesGrid } from "@/components/sections/services-grid";
import { DomainsGrid } from "@/components/sections/domains-grid";
import { ProcessSteps } from "@/components/sections/process-steps";
import { Founder } from "@/components/sections/founder";
import { Testimonials } from "@/components/sections/testimonials";
import { JobsPreview } from "@/components/sections/jobs-preview";
import { FinalCta } from "@/components/sections/final-cta";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: alternatesFor("/", locale) };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      <Hero />
      <AudienceFork />
      <ServicesGrid />
      <DomainsGrid />
      <ProcessSteps />
      <Founder compact />
      <Testimonials />
      <JobsPreview />
      <FinalCta />
    </main>
  );
}
