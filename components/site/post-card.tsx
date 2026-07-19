import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { BlurFade } from "@/components/ui/blur-fade";
import { categoryLabel, readingMinutes, type PostRecord } from "@/lib/posts";

/** Card de articol pentru grila de blog — cu cover real, categorie, dată, timp de citit. */
export async function PostCard({ post, delay = 0 }: { post: PostRecord; delay?: number }) {
  const locale = await getLocale();
  const t = await getTranslations("blogPage");
  const title = locale === "ro" ? post.title_ro : post.title_en;
  const excerpt = locale === "ro" ? post.excerpt_ro : post.excerpt_en;
  const body = locale === "ro" ? post.body_ro : post.body_en;
  const min = readingMinutes(body);

  return (
    <BlurFade inView delay={delay} className="h-full">
      <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-brand hover:shadow-xl">
        <div className="relative aspect-[16/10] overflow-hidden bg-brand-tint-2">
          {post.cover_image && (
            <Image
              src={post.cover_image}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-primary shadow-sm backdrop-blur-sm">
            {categoryLabel(post.category, locale)}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {post.published_at && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" aria-hidden />
                {new Date(post.published_at).toLocaleDateString(
                  locale === "ro" ? "ro-RO" : "en-GB",
                  { day: "numeric", month: "short", year: "numeric" }
                )}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />
              {t("readTime", { min })}
            </span>
          </div>

          <h3 className="mt-3 text-xl leading-snug md:text-2xl">
            <Link
              href={{ pathname: "/blog/[slug]", params: { slug: post.slug } }}
              className="after:absolute after:inset-0"
            >
              {title}
            </Link>
          </h3>
          <p className="mt-2.5 line-clamp-3 flex-1 text-base text-muted-foreground">{excerpt}</p>

          <span className="mt-5 inline-flex items-center gap-1.5 text-base font-semibold text-primary underline underline-offset-4">
            {t("readMore")}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </article>
    </BlurFade>
  );
}
