import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Markdown from "react-markdown";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { PostCard } from "@/components/site/post-card";
import { WhatsappIcon } from "@/components/site/whatsapp-icon";
import { getPostBySlug, getPosts, categoryLabel, readingMinutes } from "@/lib/posts";
import { whatsappLink } from "@/lib/site";
import { alternatesFor } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  const title = locale === "ro" ? post.title_ro : post.title_en;
  const description = locale === "ro" ? post.excerpt_ro : post.excerpt_en;
  return {
    title,
    description,
    alternates: alternatesFor({ pathname: "/blog/[slug]", params: { slug } }, locale),
    openGraph: post.cover_image
      ? { title, description, images: [{ url: post.cover_image }], type: "article" }
      : { title, description, type: "article" },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blogPage");

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const title = locale === "ro" ? post.title_ro : post.title_en;
  const body = locale === "ro" ? post.body_ro : post.body_en;
  const min = readingMinutes(body);

  const related = (await getPosts())
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => (a.category === post.category ? -1 : 0) - (b.category === post.category ? -1 : 0))
    .slice(0, 3);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: locale === "ro" ? post.excerpt_ro : post.excerpt_en,
    datePublished: post.published_at ?? undefined,
    image: post.cover_image ?? undefined,
    author: { "@type": "Organization", name: "Full Work Services" },
    publisher: { "@type": "Organization", name: "Full Work Services" },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />

      {/* Antet articol */}
      <section className="bg-brand-tint">
        <div className="container-site max-w-4xl py-10 md:py-14">
          <BlurFade>
            <Link
              href="/blog"
              className="inline-flex min-h-11 items-center gap-2 text-base font-medium text-primary underline underline-offset-4"
            >
              <ArrowLeft className="size-4.5" aria-hidden />
              {t("backToBlog")}
            </Link>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
              <span className="rounded-full bg-brand-tint-2 px-3 py-1 text-primary">
                {categoryLabel(post.category, locale)}
              </span>
              {post.published_at && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4" aria-hidden />
                  {new Date(post.published_at).toLocaleDateString(
                    locale === "ro" ? "ro-RO" : "en-GB",
                    { dateStyle: "long" }
                  )}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden />
                {t("readTime", { min })}
              </span>
            </div>
            <h1 className="mt-4 text-3xl leading-tight md:text-5xl">{title}</h1>
            <p className="mt-4 text-base text-muted-foreground">{t("author")}</p>
          </BlurFade>
        </div>
      </section>

      {/* Cover */}
      {post.cover_image && (
        <div className="container-site max-w-4xl">
          <BlurFade>
            <div className="relative -mt-2 aspect-[16/9] overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/5 md:-mt-4">
              <Image
                src={post.cover_image}
                alt=""
                fill
                priority
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-cover"
              />
            </div>
          </BlurFade>
        </div>
      )}

      {/* Corp */}
      <article className="section-pad bg-background">
        <div className="container-site max-w-3xl">
          <div className="space-y-5 text-lg leading-relaxed text-foreground [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-10 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-semibold md:[&_h2]:text-3xl [&_h3]:mt-8 [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-semibold [&_li]:leading-relaxed [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-brand [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-muted-foreground">
            <Markdown>{body}</Markdown>
          </div>

          {/* CTA în articol */}
          <div className="mt-12 rounded-3xl bg-brand-dark p-7 text-center md:p-10">
            <h2 className="text-2xl text-brand-dark-foreground md:text-3xl">{t("ctaTitle")}</h2>
            <p className="mx-auto mt-3 max-w-md text-lg text-white/80">{t("ctaText")}</p>
            <Button
              asChild
              className="mt-6 h-13 rounded-xl bg-whatsapp px-7 text-lg font-semibold text-white hover:bg-whatsapp/90"
            >
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                <WhatsappIcon className="size-5" aria-hidden />
                {t("ctaButton")}
              </a>
            </Button>
          </div>
        </div>
      </article>

      {/* Articole similare */}
      {related.length > 0 && (
        <section className="section-pad bg-brand-tint">
          <div className="container-site">
            <BlurFade inView>
              <h2 className="text-3xl md:text-4xl">{t("relatedTitle")}</h2>
            </BlurFade>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((p, i) => (
                <PostCard key={p.slug} post={p} delay={0.07 * i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}
