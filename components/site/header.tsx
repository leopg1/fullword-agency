"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import type { StaticAppPathname } from "@/i18n/routing";
import { site, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/site/whatsapp-icon";

const NAV_ITEMS: { key: "home" | "jobs" | "services" | "about" | "blog" | "contact"; href: StaticAppPathname }[] = [
  { key: "home", href: "/" },
  { key: "jobs", href: "/joburi" },
  { key: "services", href: "/servicii" },
  { key: "about", href: "/despre-noi" },
  { key: "blog", href: "/blog" },
  { key: "contact", href: "/contact" },
];

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const [open, setOpen] = useState(false);

  const switchLocale = () => {
    router.replace(
      // @ts-expect-error -- pathname + params corespund rutei curente
      { pathname, params, query: Object.fromEntries(new URLSearchParams(window.location.search)) },
      { locale: locale === "ro" ? "en" : "ro" }
    );
  };

  const isActive = (href: StaticAppPathname) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container-site flex h-16 items-center justify-between gap-4 md:h-20">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/images/brand/logo-sky.png"
            alt=""
            width={40}
            height={40}
            priority
            className="size-9 md:size-10"
          />
          <span className="font-heading text-lg font-semibold leading-tight text-foreground md:text-xl">
            Full Work <span className="text-primary">Services</span>
          </span>
        </Link>

        {/* Nav desktop — 6 iteme, fără dropdown */}
        <nav aria-label={t("mainMenu")} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map(({ key, href }) => (
              <li key={key}>
                <Link
                  href={href}
                  className={cn(
                    "inline-flex min-h-12 items-center rounded-lg px-4 text-base font-medium transition-colors",
                    isActive(href)
                      ? "bg-brand-tint-2 text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  aria-current={isActive(href) ? "page" : undefined}
                >
                  {t(key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Acțiuni dreapta */}
        <div className="flex items-center gap-2">
          {/* Comutator limbă */}
          <button
            type="button"
            onClick={switchLocale}
            className="inline-flex min-h-12 items-center rounded-lg px-3 text-base font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            aria-label={locale === "ro" ? "Switch to English" : "Schimbă în română"}
          >
            {locale === "ro" ? "EN" : "RO"}
          </button>

          {/* Telefon — text de la md în sus, doar iconiță sub md */}
          <a
            href={`tel:${site.phoneE164}`}
            className="hidden min-h-12 items-center gap-2 rounded-lg px-3 text-base font-semibold text-foreground hover:bg-muted md:inline-flex"
          >
            <Phone className="size-4 text-primary" aria-hidden />
            {site.phoneDisplay}
          </a>
          <a
            href={`tel:${site.phoneE164}`}
            className="inline-flex size-12 items-center justify-center rounded-lg text-primary hover:bg-muted md:hidden"
            aria-label={t("callUs")}
          >
            <Phone className="size-5.5" aria-hidden />
          </a>

          {/* Meniu mobil */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-12 items-center justify-center rounded-lg text-foreground hover:bg-muted lg:hidden"
            aria-expanded={open}
            aria-label={open ? t("closeMenu") : t("menu")}
          >
            {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
          </button>
        </div>
      </div>

      {/* Panou mobil — listă simplă, ținte mari */}
      {open && (
        <nav aria-label={t("mobileMenu")} className="border-t border-border bg-background lg:hidden">
          <ul className="container-site flex flex-col py-3">
            {[...NAV_ITEMS.slice(0, 2),
              { key: "forCandidates" as const, href: "/pentru-candidati" as const },
              ...NAV_ITEMS.slice(2),
            ].map(({ key, href }) => (
              <li key={key}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex min-h-13 items-center rounded-lg px-3 text-lg font-medium",
                    isActive(href) ? "bg-brand-tint-2 text-foreground" : "text-foreground hover:bg-muted"
                  )}
                  aria-current={isActive(href) ? "page" : undefined}
                >
                  {t(key)}
                </Link>
              </li>
            ))}
            <li className="mt-2 flex gap-2 border-t border-border pt-3">
              <Button asChild size="lg" variant="outline" className="min-h-13 flex-1">
                <a href={`tel:${site.phoneE164}`}>
                  <Phone className="size-5 text-primary" aria-hidden />
                  {t("callUs")}
                </a>
              </Button>
              <Button asChild size="lg" className="min-h-13 flex-1 bg-whatsapp text-white hover:bg-whatsapp/90">
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                  <WhatsappIcon className="size-5" aria-hidden />
                  WhatsApp
                </a>
              </Button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
