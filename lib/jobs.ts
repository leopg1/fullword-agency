import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { JOBS, type Job, type JobDomain } from "@/lib/jobs-data";

/** Structura conținutului unui job (jsonb în fw_jobs.content_ro / content_en). */
export type JobContent = {
  subtitle?: string;
  intro?: string[];
  benefits?: string[];
  requirements?: string[];
  location?: string[];
  responsibilities?: string[];
};

/** Rândul din fw_jobs, așa cum îl folosește site-ul public. */
export type JobRecord = {
  id: string;
  slug: string;
  title_ro: string;
  title_en: string;
  city: string;
  country_code: string;
  salary_ro: string | null;
  salary_en: string | null;
  domain: JobDomain;
  image: string | null;
  remote: boolean;
  status: "open" | "closed";
  content_ro: JobContent;
  content_en: JobContent;
  created_at?: string;
};

/** Fallback din datele statice (dacă Supabase nu răspunde) — site-ul nu pică. */
const staticFallback: JobRecord[] = JOBS.map((j, i) => ({
  id: `static-${i}`,
  slug: j.slug,
  title_ro: j.titleRo,
  title_en: j.titleEn,
  city: j.city,
  country_code: j.countryCode,
  salary_ro: j.salaryRo,
  salary_en: j.salaryEn,
  domain: j.domain,
  image: j.image,
  remote: j.remote ?? false,
  status: j.status,
  content_ro: {},
  content_en: {},
}));

export const getJobs = cache(async (): Promise<JobRecord[]> => {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("fw_jobs")
      .select("*")
      .order("status", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error || !data) throw error;
    return data as JobRecord[];
  } catch {
    return staticFallback;
  }
});

export const getOpenJobs = async () =>
  (await getJobs()).filter((j) => j.status === "open");

export const getJobBySlug = cache(async (slug: string) => {
  const jobs = await getJobs();
  return jobs.find((j) => j.slug === slug) ?? null;
});

export type TestimonialRecord = {
  id: string;
  quote_ro: string;
  quote_en: string;
  name: string;
  role_ro: string;
  role_en: string;
};

export const getTestimonials = cache(async (): Promise<TestimonialRecord[]> => {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("fw_testimonials")
      .select("id, quote_ro, quote_en, name, role_ro, role_en")
      .eq("published", true)
      .order("sort_order");
    if (error || !data?.length) throw error;
    return data as TestimonialRecord[];
  } catch {
    return [];
  }
});

export const getJobCountsByDomain = async () => {
  const open = await getOpenJobs();
  return open.reduce<Record<JobDomain, number>>(
    (acc, j) => {
      acc[j.domain] += 1;
      return acc;
    },
    { construction: 0, logistics: 0, transport: 0, horeca: 0, office: 0, medical: 0 }
  );
};
