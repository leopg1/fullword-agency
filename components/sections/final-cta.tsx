import { getTranslations } from "next-intl/server";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { DotPattern } from "@/components/ui/dot-pattern";
import { WhatsappIcon } from "@/components/site/whatsapp-icon";
import { site, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";

/** CTA final — blocul dark de decizie, cu pattern discret de puncte. */
export async function FinalCta() {
  const t = await getTranslations("finalCta");

  return (
    <section className="relative overflow-hidden bg-brand-dark">
      <DotPattern
        aria-hidden
        className={cn(
          "text-white/10",
          "[mask-image:radial-gradient(60%_60%_at_50%_40%,white,transparent)]"
        )}
      />
      <div className="container-site relative py-20 text-center md:py-28">
        <BlurFade inView>
          <h2 className="text-4xl text-brand-dark-foreground md:text-5xl">{t("title")}</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80 md:text-xl">
            {t("subtitle")}
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button
              asChild
              className="h-14 w-full rounded-xl bg-whatsapp px-8 text-lg font-semibold text-white hover:bg-whatsapp/90 sm:w-auto"
            >
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                <WhatsappIcon className="size-5" aria-hidden />
                {t("whatsapp")}
              </a>
            </Button>
            <Button
              asChild
              className="h-14 w-full rounded-xl bg-white px-8 text-lg font-semibold text-foreground hover:bg-white/90 sm:w-auto"
            >
              <a href={`tel:${site.phoneE164}`}>
                <Phone className="size-5" aria-hidden />
                {t("call", { phone: site.phoneDisplay })}
              </a>
            </Button>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
