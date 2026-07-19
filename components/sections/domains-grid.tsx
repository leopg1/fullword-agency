import { getTranslations } from "next-intl/server";
import { ArrowRight, HardHat, Package, Bus, UtensilsCrossed, Laptop, Stethoscope } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { BlurFade } from "@/components/ui/blur-fade";
import type { JobDomain } from "@/lib/jobs-data";
import { getJobCountsByDomain } from "@/lib/jobs";

const DOMAIN_ICONS: Record<JobDomain, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  construction: HardHat,
  logistics: Package,
  transport: Bus,
  horeca: UtensilsCrossed,
  office: Laptop,
  medical: Stethoscope,
};

const ORDER: JobDomain[] = ["construction", "logistics", "transport", "horeca", "office", "medical"];

/** Domenii de joburi cu numărul de poziții deschise — dovadă de activitate. */
export async function DomainsGrid() {
  const t = await getTranslations("domains");
  const counts = await getJobCountsByDomain();

  return (
    <section className="section-pad bg-background">
      <div className="container-site">
        <BlurFade inView>
          <h2 className="text-3xl md:text-4xl">{t("title")}</h2>
          <p className="prose-measure mt-3 text-lg text-muted-foreground">{t("subtitle")}</p>
        </BlurFade>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ORDER.map((domain, i) => {
            const Icon = DOMAIN_ICONS[domain];
            const count = counts[domain];
            return (
              <BlurFade key={domain} inView delay={0.05 * i}>
                <Link
                  href={{ pathname: "/joburi", query: { domeniu: domain } }}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:border-brand hover:shadow-md"
                >
                  <div className="flex size-13 shrink-0 items-center justify-center rounded-xl bg-brand-tint-2">
                    <Icon className="size-6.5 text-primary" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-lg font-semibold leading-snug">
                      {t(domain)}
                    </h3>
                    <p className="mt-0.5 text-base text-muted-foreground">
                      {t("jobsCount", { count })}
                    </p>
                  </div>
                  <ArrowRight
                    className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden
                  />
                </Link>
              </BlurFade>
            );
          })}
        </div>
      </div>
    </section>
  );
}
