import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { BlurFade } from "@/components/ui/blur-fade";
import { PostCard } from "@/components/site/post-card";
import { getPosts, categoryLabel, readingMinutes, POST_CATEGORIES } from "@/lib/posts";
import { alternatesFor } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const base: Metadata =
    locale === "ro"
      ? { title: "Blog", description: "Ghiduri simple despre muncă, angajări, permise și acte, de la echipa Full Work Services." }
      : { title: "Blog", description: "Simple guides about work, hiring, permits and paperwork, from the Full Work Services team." };
  return { ...base, alternates: alternatesFor("/blog", locale) };
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ categorie?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { categorie } = await searchParams;
  const t = await getTranslations("blogPage");

  const all = await getPosts();
  const posts = categorie ? all.filter((p) => p.category === categorie) : all;
  const [featured, ...rest] = posts;

  // categoriile care chiar au articole
  const usedCategories = POST_CATEGORIES.filter((c) => all.some((p) => p.category === c.key));

  const chip = (active: boolean) =>
    cn(
      "inline-flex min-h-11 items-center rounded-full border px-4 text-base font-medium transition-colors",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
    );

  return (
    <main>
      {/* Hero */}
      <section className="bg-brand-tint">
        <div className="container-site py-12 md:py-16">
          <BlurFade>
            <h1 className="text-4xl md:text-5xl">{t("title")}</h1>
            <p className="prose-measure mt-4 text-lg text-muted-foreground md:text-xl">
              {t("subtitle")}
            </p>
          </BlurFade>

          {usedCategories.length > 1 && (
            <BlurFade delay={0.1}>
              <nav aria-label={t("allCategories")} className="mt-8 flex flex-wrap gap-2">
                <Link href="/blog" className={chip(!categorie)}>
                  {t("allCategories")}
                </Link>
                {usedCategories.map((c) => (
                  <Link
                    key={c.key}
                    href={{ pathname: "/blog", query: { categorie: c.key } }}
                    className={chip(categorie === c.key)}
                  >
                    {locale === "ro" ? c.ro : c.en}
                  </Link>
                ))}
              </nav>
            </BlurFade>
          )}
        </div>
      </section>

      <section className="section-pad bg-background">
        <div className="container-site">
          {posts.length === 0 ? (
            <p className="prose-measure rounded-2xl border border-border bg-brand-tint p-8 text-lg">
              {t("empty")}
            </p>
          ) : (
            <>
              {/* Articol featured — mare, cu cover pe jumătate */}
              {featured && !categorie && (
                <BlurFade inView>
                  <article className="group relative mb-10 grid overflow-hidden rounded-3xl border border-border bg-card transition-all hover:border-brand hover:shadow-xl lg:grid-cols-2">
                    <div className="relative min-h-64 overflow-hidden bg-brand-tint-2 lg:min-h-[24rem]">
                      {featured.cover_image && (
                        <Image
                          src={featured.cover_image}
                          alt=""
                          fill
                          priority
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <span className="absolute left-5 top-5 rounded-full bg-brand px-3.5 py-1.5 text-sm font-semibold text-brand-foreground shadow-sm">
                        {t("featured")}
                      </span>
                    </div>
                    <div className="flex flex-col justify-center p-7 md:p-10">
                      <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                        <span className="rounded-full bg-brand-tint-2 px-3 py-1 text-primary">
                          {categoryLabel(featured.category, locale)}
                        </span>
                        {featured.published_at && (
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="size-4" aria-hidden />
                            {new Date(featured.published_at).toLocaleDateString(
                              locale === "ro" ? "ro-RO" : "en-GB",
                              { day: "numeric", month: "long", year: "numeric" }
                            )}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="size-4" aria-hidden />
                          {t("readTime", {
                            min: readingMinutes(locale === "ro" ? featured.body_ro : featured.body_en),
                          })}
                        </span>
                      </div>
                      <h2 className="mt-4 text-2xl leading-snug md:text-3xl lg:text-4xl">
                        <Link
                          href={{ pathname: "/blog/[slug]", params: { slug: featured.slug } }}
                          className="after:absolute after:inset-0"
                        >
                          {locale === "ro" ? featured.title_ro : featured.title_en}
                        </Link>
                      </h2>
                      <p className="prose-measure mt-4 text-lg text-muted-foreground">
                        {locale === "ro" ? featured.excerpt_ro : featured.excerpt_en}
                      </p>
                      <span className="mt-6 inline-flex items-center gap-1.5 text-base font-semibold text-primary underline underline-offset-4">
                        {t("readMore")}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    </div>
                  </article>
                </BlurFade>
              )}

              {/* Restul, în grilă */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {(categorie ? posts : rest).map((post, i) => (
                  <PostCard key={post.slug} post={post} delay={Math.min(0.07 * i, 0.3)} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
