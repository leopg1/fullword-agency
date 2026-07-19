import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  FileCheck2,
  Flag,
  Handshake,
  Scale,
  Search,
  Building2,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { StaticAppPathname } from "@/i18n/routing";
import { BlurFade } from "@/components/ui/blur-fade";

const SERVICES: {
  key: string;
  href: StaticAppPathname;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}[] = [
  { key: "recruitment", href: "/servicii/recrutare", icon: Search },
  { key: "hr", href: "/servicii/hr-outsourcing", icon: Handshake },
  { key: "permits", href: "/servicii/permise-de-munca", icon: FileCheck2 },
  { key: "market", href: "/servicii/infiintare-firma", icon: Building2 },
  { key: "citizenship", href: "/servicii/cetatenie", icon: Flag },
  { key: "mediation", href: "/servicii/mediere", icon: Scale },
];

/** Grila de servicii — carduri simple, un mesaj pe card, tot cardul clickabil. */
export async function ServicesGrid({
  hideHeading = false,
  className = "bg-brand-tint",
}: {
  hideHeading?: boolean;
  className?: string;
} = {}) {
  const t = await getTranslations("services");

  return (
    <section
      className={`${hideHeading ? "pb-16 pt-10 md:pb-24 md:pt-12" : "section-pad"} ${className}`}
    >
      <div className="container-site">
        {!hideHeading && (
          <BlurFade inView>
            <h2 className="text-3xl md:text-4xl">{t("title")}</h2>
            <p className="prose-measure mt-3 text-lg text-muted-foreground">{t("subtitle")}</p>
          </BlurFade>
        )}

        <div className={hideHeading ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3" : "mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"}>
          {SERVICES.map(({ key, href, icon: Icon }, i) => (
            <BlurFade key={key} inView delay={0.06 * i} className="h-full">
              <Link
                href={href}
                className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-lg md:p-7"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-brand-tint-2 transition-colors group-hover:bg-brand">
                  <Icon
                    className="size-6 text-primary transition-colors group-hover:text-brand-foreground"
                    aria-hidden
                  />
                </div>
                <h3 className="mt-5 text-xl md:text-2xl">{t(`${key}Title`)}</h3>
                <p className="mt-2.5 flex-1 text-base text-muted-foreground md:text-lg">
                  {t(`${key}Text`)}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-base font-semibold text-primary underline underline-offset-4">
                  {t("cta")}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
