import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { getJobs } from "@/lib/jobs";
import { getPosts } from "@/lib/posts";
import { site } from "@/lib/site";

type Href = Parameters<typeof getPathname>[0]["href"];

function entry(href: Href, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]): MetadataRoute.Sitemap[number] {
  const ro = site.url + getPathname({ href, locale: "ro" });
  const en = site.url + getPathname({ href, locale: "en" });
  return {
    url: ro,
    priority,
    changeFrequency,
    alternates: { languages: { ro, en } },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    entry("/", 1, "weekly"),
    entry("/joburi", 0.9, "daily"),
    entry("/servicii", 0.8, "monthly"),
    entry("/servicii/recrutare", 0.8, "monthly"),
    entry("/servicii/hr-outsourcing", 0.7, "monthly"),
    entry("/servicii/permise-de-munca", 0.7, "monthly"),
    entry("/servicii/infiintare-firma", 0.7, "monthly"),
    entry("/servicii/cetatenie", 0.7, "monthly"),
    entry("/servicii/mediere", 0.6, "monthly"),
    entry("/despre-noi", 0.6, "monthly"),
    entry("/pentru-candidati", 0.7, "monthly"),
    entry("/blog", 0.5, "weekly"),
    entry("/contact", 0.6, "monthly"),
  ];

  const jobs = (await getJobs())
    .filter((j) => j.status === "open")
    .map((j) =>
      entry({ pathname: "/joburi/[slug]", params: { slug: j.slug } }, 0.8, "weekly")
    );

  const posts = (await getPosts()).map((p) =>
    entry({ pathname: "/blog/[slug]", params: { slug: p.slug } }, 0.5, "monthly")
  );

  return [...staticEntries, ...jobs, ...posts];
}
