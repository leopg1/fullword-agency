import { getTranslations } from "next-intl/server";
import { ArrowRight, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export default async function NotFoundPage() {
  const t = await getTranslations("notFound");

  return (
    <main className="flex flex-1 items-center bg-brand-tint">
      <div className="container-site py-20 text-center md:py-28">
        <p aria-hidden className="font-heading text-7xl font-bold text-brand md:text-8xl">
          404
        </p>
        <h1 className="mt-4 text-3xl md:text-4xl">{t("title")}</h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-muted-foreground">{t("text")}</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild className="h-13 w-full rounded-xl px-7 text-lg font-semibold sm:w-auto">
            <Link href="/joburi">
              {t("ctaJobs")}
              <ArrowRight className="size-5" aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-13 w-full rounded-xl border-2 px-7 text-lg font-semibold sm:w-auto">
            <Link href="/">{t("ctaHome")}</Link>
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
