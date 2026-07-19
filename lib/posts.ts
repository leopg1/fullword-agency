import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";

export type PostRecord = {
  id: string;
  slug: string;
  title_ro: string;
  title_en: string;
  excerpt_ro: string;
  excerpt_en: string;
  body_ro: string;
  body_en: string;
  cover_image: string | null;
  category: string;
  featured: boolean;
  published_at: string | null;
};

/** Categoriile de blog — cheie + etichetă RO/EN. */
export const POST_CATEGORIES: { key: string; ro: string; en: string }[] = [
  { key: "candidati", ro: "Pentru candidați", en: "For candidates" },
  { key: "companii", ro: "Pentru companii", en: "For companies" },
  { key: "munca-europa", ro: "Muncă în Europa", en: "Working in Europe" },
  { key: "cetatenie", ro: "Cetățenie", en: "Citizenship" },
  { key: "ghiduri", ro: "Ghiduri", en: "Guides" },
];

export function categoryLabel(key: string, locale: string) {
  const c = POST_CATEGORIES.find((x) => x.key === key);
  return c ? (locale === "ro" ? c.ro : c.en) : key;
}

/** Timp estimat de citire (200 cuvinte/min). */
export function readingMinutes(body: string) {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export const getPosts = cache(async (): Promise<PostRecord[]> => {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("fw_posts")
      .select("*")
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false });
    if (error || !data) throw error;
    return data as PostRecord[];
  } catch {
    return [];
  }
});

export const getPostBySlug = cache(async (slug: string) => {
  const posts = await getPosts();
  return posts.find((p) => p.slug === slug) ?? null;
});
