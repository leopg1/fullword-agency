import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail, MapPin, Phone } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { ContactForm } from "@/components/site/contact-form";
import { WhatsappIcon } from "@/components/site/whatsapp-icon";
import { site, whatsappLink } from "@/lib/site";
import { alternatesFor } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const base: Metadata = locale === "ro"
    ? {
        title: "Contact",
        description:
          "Contactează Full Work Services: telefon 0723 147 723, WhatsApp, email office@fullworkservices.com. Răspundem în aceeași zi lucrătoare.",
      }
    : {
        title: "Contact",
        description:
          "Contact Full Work Services: phone +40 723 147 723, WhatsApp, email office@fullworkservices.com. We reply the same business day.",
      };  return { ...base, alternates: alternatesFor("/contact", locale) };
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tip?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { tip } = await searchParams;
  const defaultType = tip === "oferta" ? ("company_offer" as const) : ("contact" as const);
  const t = await getTranslations("contact");

  const cards = [
    {
      icon: Phone,
      title: t("phoneTitle"),
      value: site.phoneDisplay,
      href: `tel:${site.phoneE164}`,
    },
    {
      icon: WhatsappIcon,
      title: t("whatsappTitle"),
      value: t("whatsappText"),
      href: whatsappLink(),
      external: true,
    },
    {
      icon: Mail,
      title: t("emailTitle"),
      value: site.email,
      href: `mailto:${site.email}`,
    },
    {
      icon: MapPin,
      title: t("addressTitle"),
      value: locale === "ro" ? site.address : site.addressEn,
      href: `https://maps.google.com/?q=${encodeURIComponent(site.address)}`,
      external: true,
    },
  ];

  return (
    <main>
      <section className="bg-brand-tint">
        <div className="container-site py-12 md:py-16">
          <BlurFade>
            <h1 className="text-4xl md:text-5xl">{t("title")}</h1>
            <p className="prose-measure mt-4 text-lg text-muted-foreground md:text-xl">
              {t("subtitle")}
            </p>
          </BlurFade>
        </div>
      </section>

      <section className="section-pad bg-background">
        <div className="container-site grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          {/* Canale de contact */}
          <div className="space-y-4">
            {cards.map(({ icon: Icon, title, value, href, external }, i) => (
              <BlurFade key={title} inView delay={0.06 * i}>
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:border-brand hover:shadow-md"
                >
                  <div className="flex size-13 shrink-0 items-center justify-center rounded-xl bg-brand-tint-2">
                    <Icon className="size-6 text-primary" aria-hidden />
                  </div>
                  <div>
                    <h2 className="font-heading text-lg font-semibold">{title}</h2>
                    <p className="mt-0.5 text-base text-muted-foreground md:text-lg">{value}</p>
                  </div>
                </a>
              </BlurFade>
            ))}
          </div>

          {/* Formular */}
          <BlurFade inView delay={0.15}>
            <div className="rounded-3xl border border-border bg-card p-6 md:p-9">
              <h2 className="text-2xl md:text-3xl">{t("formTitle")}</h2>
              <p className="mt-2 text-base text-muted-foreground md:text-lg">{t("formSubtitle")}</p>
              <div className="mt-6">
                <ContactForm defaultType={defaultType} />
              </div>
            </div>
          </BlurFade>
        </div>
      </section>
    </main>
  );
}
