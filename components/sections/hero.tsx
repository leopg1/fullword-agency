import Image, { getImageProps } from "next/image";
import { preload } from "react-dom";
import { getLocale, getTranslations } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { NumberTicker } from "@/components/ui/number-ticker";

/**
 * HERO „Fork geometric" — split color-block:
 * stânga alb (mesaj + fork dual CTA), dreapta fotografie reală de șantier
 * încadrată de brand, cu cifrele cheie suprapuse jos.
 */
export async function Hero() {
  const t = await getTranslations("hero");
  const tStats = await getTranslations("stats");
  const locale = await getLocale();
  const numberLocale = locale === "ro" ? "ro-RO" : "en-US";

  // Preload pentru elementul LCP — imaginea hero pornește odată cu HTML-ul,
  // nu după ce browserul o descoperă în DOM.
  const heroImg = getImageProps({
    src: "/images/hero/santier.webp",
    alt: "",
    fill: true,
    priority: true,
    sizes: "(max-width: 1024px) 100vw, 45vw",
  });
  preload(heroImg.props.src, {
    as: "image",
    imageSrcSet: heroImg.props.srcSet,
    imageSizes: heroImg.props.sizes,
    fetchPriority: "high",
  });

  const stats = [
    { value: 10000, label: tStats("interviews") },
    { value: 150, label: tStats("companies") },
    { value: 2500, label: tStats("placements") },
  ];

  const trust = [t("trust1"), t("trust2"), t("trust3")];

  return (
    <section className="container-site grid gap-8 py-12 md:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:py-16">
      {/* Stânga — mesaj + fork */}
      <div className="flex flex-col justify-center">
        {/* Zona LCP — conținut vizibil instant, fără animații */}
        <h1 className="max-w-[16ch] text-4xl leading-[1.12] md:text-5xl lg:text-[3.4rem]">
          {t("titleStart")}{" "}
          <span className="relative inline-block whitespace-nowrap">
            {t("titleHighlight")}
            <svg
              aria-hidden
              viewBox="0 0 300 16"
              preserveAspectRatio="none"
              fill="none"
              className="absolute -bottom-1 left-0 h-[0.32em] w-full text-brand md:-bottom-2"
            >
              <path
                d="M4 11 C 70 4, 150 4, 214 7 C 250 9, 278 8, 296 5"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          {t("titleEnd")}
        </h1>

        <p className="prose-measure mt-6 text-lg text-muted-foreground md:text-xl">
          {t("subtitle")}
        </p>

        {/* Semnale de încredere — drumurile stau în panoul de mai jos, nu aici */}
        <ul className="mt-8 flex flex-col gap-x-6 gap-y-2.5 text-base text-muted-foreground md:flex-row md:flex-wrap">
          {trust.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <CheckCircle2 className="size-5 shrink-0 text-primary" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Dreapta — fotografie reală, card rotunjit cu umbră */}
      <div className="relative min-h-[21rem] lg:min-h-0">
        <div className="relative h-full min-h-[16rem] overflow-hidden rounded-[1.75rem] shadow-xl ring-1 ring-black/5">
          <Image
            src="/images/hero/santier.webp"
            alt="Muncitori în construcții pe un șantier — echipa pe care o plasăm în Europa"
            fill
            priority
            fetchPriority="high"
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover object-[50%_35%]"
          />
          {/* Tentă discretă de brand — leagă poza de culoarea site-ului */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-brand/12 mix-blend-multiply"
          />
          {/* Scrim jos pentru lizibilitatea cifrelor */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-brand-dark/90 via-brand-dark/45 to-transparent"
          />

          {/* Cifrele cheie, suprapuse peste fotografie */}
          <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
            <ul className="grid grid-cols-3 gap-2 md:gap-3">
              {stats.map(({ value, label }, i) => (
                <li key={label}>
                  <BlurFade delay={0.3 + i * 0.1} inView>
                    <div className="rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur-sm md:p-4">
                      <p className="whitespace-nowrap font-heading text-xl font-bold text-foreground md:text-2xl">
                        <NumberTicker value={value} locale={numberLocale} className="text-foreground" />+
                      </p>
                      <p className="mt-0.5 text-xs font-medium leading-tight text-muted-foreground md:text-sm">
                        {label}
                      </p>
                    </div>
                  </BlurFade>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
