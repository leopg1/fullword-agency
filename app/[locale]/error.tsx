"use client";

import { useLocale, useTranslations } from "next-intl";
import { Phone, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/site/whatsapp-icon";
import { site, whatsappLink } from "@/lib/site";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errorPage");
  useLocale(); // asigură contextul intl

  return (
    <main className="flex flex-1 items-center bg-brand-tint">
      <div className="container-site py-20 text-center md:py-28">
        <h1 className="text-3xl md:text-4xl">{t("title")}</h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground">{t("text")}</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button onClick={reset} className="h-13 w-full rounded-xl px-7 text-lg font-semibold sm:w-auto">
            <RotateCcw className="size-5" aria-hidden />
            {t("retry")}
          </Button>
          <Button
            asChild
            className="h-13 w-full rounded-xl bg-whatsapp px-7 text-lg font-semibold text-white hover:bg-whatsapp/90 sm:w-auto"
          >
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
              <WhatsappIcon className="size-5" aria-hidden />
              WhatsApp
            </a>
          </Button>
        </div>
        <a
          href={`tel:${site.phoneE164}`}
          className="mt-7 inline-flex min-h-11 items-center gap-2 text-base font-semibold text-primary underline underline-offset-4"
        >
          <Phone className="size-4.5" aria-hidden />
          {site.phoneDisplay}
        </a>
      </div>
    </main>
  );
}
