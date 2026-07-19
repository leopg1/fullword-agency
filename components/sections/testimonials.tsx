import { getLocale, getTranslations } from "next-intl/server";
import { Quote } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { getTestimonials } from "@/lib/jobs";

/**
 * Testimoniale — layout asimetric (un citat mare + două mici), fără stele,
 * fără poze inventate. Din Supabase, cu fallback pe mesajele statice.
 */
export async function Testimonials() {
  const t = await getTranslations("testimonials");
  const locale = await getLocale();

  const fromDb = await getTestimonials();
  const items = fromDb.length
    ? fromDb.map((row) => ({
        quote: locale === "ro" ? row.quote_ro : row.quote_en,
        name: row.name,
        role: locale === "ro" ? row.role_ro : row.role_en,
      }))
    : [1, 2, 3, 4].map((i) => ({
        quote: t(`t${i}Quote`),
        name: t(`t${i}Name`),
        role: t(`t${i}Role`),
      }));

  const [featured, ...rest] = items;
  const side = rest.slice(0, 2);

  const caption = (name: string, role: string) => (
    <figcaption className="mt-5 flex items-center gap-3">
      <span
        aria-hidden
        className="flex size-11 items-center justify-center rounded-full bg-brand-tint-2 font-heading text-sm font-semibold text-primary"
      >
        {name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)}
      </span>
      <span>
        <span className="block font-heading text-base font-semibold text-foreground">{name}</span>
        <span className="block text-sm text-muted-foreground">{role}</span>
      </span>
    </figcaption>
  );

  return (
    <section className="section-pad bg-brand-tint">
      <div className="container-site">
        <BlurFade inView>
          <h2 className="text-3xl md:text-4xl">{t("title")}</h2>
          <p className="mt-3 text-lg text-muted-foreground">{t("subtitle")}</p>
        </BlurFade>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {/* Citatul mare */}
          <BlurFade inView className="lg:col-span-2">
            <figure className="relative flex h-full flex-col justify-center overflow-hidden rounded-3xl bg-brand-dark p-8 md:p-12">
              <span
                aria-hidden
                className="absolute -right-12 -top-12 h-24 w-52 -rotate-[18deg] rounded-full bg-white/10"
              />
              <Quote className="size-9 text-brand" aria-hidden />
              <blockquote className="mt-5 max-w-2xl font-heading text-xl font-semibold leading-relaxed text-brand-dark-foreground md:text-2xl">
                „{featured.quote}”
              </blockquote>
              <figcaption className="mt-6">
                <p className="font-heading text-base font-semibold text-brand-dark-foreground">
                  {featured.name}
                </p>
                <p className="text-sm text-white/70">{featured.role}</p>
              </figcaption>
            </figure>
          </BlurFade>

          {/* Două citate mici */}
          <div className="flex flex-col gap-5">
            {side.map(({ quote, name, role }, i) => (
              <BlurFade key={name} inView delay={0.1 + 0.08 * i} className="flex-1">
                <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
                  <blockquote className="flex-1 text-base leading-relaxed text-foreground">
                    „{quote}”
                  </blockquote>
                  {caption(name, role)}
                </figure>
              </BlurFade>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
