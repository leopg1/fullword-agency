import { getTranslations } from "next-intl/server";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { WhatsappIcon } from "@/components/site/whatsapp-icon";
import { whatsappLink } from "@/lib/site";

type Faq = { q: string; a: string };

/**
 * Secțiune FAQ pe două coloane: stânga = titlu + îndemn WhatsApp (sticky),
 * dreapta = întrebările. Umple ambele coloane și adaugă un punct de conversie
 * — nu mai rămâne jumătate de ecran goală.
 */
export async function FaqSection({
  faq,
  title,
  className = "bg-background",
}: {
  faq: Faq[];
  title: string;
  className?: string;
}) {
  const t = await getTranslations("faqAside");

  return (
    <section className={`section-pad ${className}`}>
      <div className="container-site grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        {/* Stânga — titlu + CTA, rămâne lângă tine la scroll */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <BlurFade inView>
            <h2 className="text-3xl md:text-4xl">{title}</h2>
            <p className="prose-measure mt-4 text-lg text-muted-foreground">{t("text")}</p>
            <Button
              asChild
              className="mt-6 h-13 rounded-xl bg-whatsapp px-6 text-base font-semibold text-white hover:bg-whatsapp/90"
            >
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                <WhatsappIcon className="size-5" aria-hidden />
                {t("cta")}
              </a>
            </Button>
          </BlurFade>
        </div>

        {/* Dreapta — întrebările */}
        <BlurFade inView delay={0.1}>
          <Accordion type="single" collapsible className="w-full">
            {faq.map((item) => (
              <AccordionItem key={item.q} value={item.q}>
                <AccordionTrigger className="py-5 text-left text-lg font-semibold hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="prose-measure pb-5 text-base text-muted-foreground md:text-lg">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </BlurFade>
      </div>
    </section>
  );
}
