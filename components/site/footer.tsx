import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";
import { getServices } from "@/lib/services";

export async function Footer() {
  const t = await getTranslations("footer");
  // doar serviciile vizibile, în ordinea aleasă din admin
  const SERVICE_LINKS = (await getServices()).map((s) => ({ key: s.footerKey, href: s.href }));

  return (
    <footer className="border-t border-white/10 bg-brand-dark text-brand-dark-foreground">
      <div className="container-site grid grid-cols-2 gap-x-6 gap-y-10 py-14 md:py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        {/* Brand + contact */}
        <div className="col-span-2 space-y-5 lg:col-span-1">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/images/brand/logo-white.png"
              alt=""
              width={40}
              height={40}
              className="size-10"
            />
            <span className="font-heading text-xl font-semibold">
              Full Work Services
            </span>
          </Link>
          <p className="prose-measure text-base text-white/80">{t("description")}</p>
          <ul className="space-y-2.5 text-base">
            <li>
              <a
                href={`tel:${site.phoneE164}`}
                className="inline-flex min-h-11 items-center gap-2.5 font-semibold hover:underline"
              >
                <Phone className="size-4.5 shrink-0 text-brand" aria-hidden />
                {site.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${site.email}`}
                className="inline-flex min-h-11 items-center gap-2.5 hover:underline"
              >
                <Mail className="size-4.5 shrink-0 text-brand" aria-hidden />
                {site.email}
              </a>
            </li>
            <li className="flex items-start gap-2.5 text-white/80">
              <MapPin className="mt-1 size-4.5 shrink-0 text-brand" aria-hidden />
              {t("address")}
            </li>
          </ul>
        </div>

        {/* Servicii */}
        <nav aria-label={t("servicesTitle")}>
          <h2 className="mb-4 font-heading text-base font-semibold uppercase tracking-wide text-white/60">
            {t("servicesTitle")}
          </h2>
          <ul className="space-y-1">
            {SERVICE_LINKS.map(({ key, href }) => (
              <li key={key}>
                <Link
                  href={href}
                  className="inline-flex min-h-10 items-center text-base text-white/85 underline-offset-4 hover:text-white hover:underline"
                >
                  {t(key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Candidați + Companie */}
        <div className="space-y-8">
          <nav aria-label={t("candidatesTitle")}>
            <h2 className="mb-4 font-heading text-base font-semibold uppercase tracking-wide text-white/60">
              {t("candidatesTitle")}
            </h2>
            <ul className="space-y-1">
              <li>
                <Link href="/joburi" className="inline-flex min-h-10 items-center text-base text-white/85 underline-offset-4 hover:text-white hover:underline">
                  {t("openJobs")}
                </Link>
              </li>
              <li>
                <Link href="/pentru-candidati" className="inline-flex min-h-10 items-center text-base text-white/85 underline-offset-4 hover:text-white hover:underline">
                  {t("forCandidates")}
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label={t("companyTitle")}>
            <h2 className="mb-4 font-heading text-base font-semibold uppercase tracking-wide text-white/60">
              {t("companyTitle")}
            </h2>
            <ul className="space-y-1">
              <li>
                <Link href="/despre-noi" className="inline-flex min-h-10 items-center text-base text-white/85 underline-offset-4 hover:text-white hover:underline">
                  {t("aboutUs")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="inline-flex min-h-10 items-center text-base text-white/85 underline-offset-4 hover:text-white hover:underline">
                  {t("blog")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="inline-flex min-h-10 items-center text-base text-white/85 underline-offset-4 hover:text-white hover:underline">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Legal */}
        <nav aria-label={t("legalTitle")}>
          <h2 className="mb-4 font-heading text-base font-semibold uppercase tracking-wide text-white/60">
            {t("legalTitle")}
          </h2>
          <ul className="space-y-1">
            <li>
              <Link href="/politica-de-confidentialitate" className="inline-flex min-h-10 items-center text-base text-white/85 underline-offset-4 hover:text-white hover:underline">
                {t("privacy")}
              </Link>
            </li>
            <li>
              <Link href="/politica-cookies" className="inline-flex min-h-10 items-center text-base text-white/85 underline-offset-4 hover:text-white hover:underline">
                {t("cookies")}
              </Link>
            </li>
            <li>
              <Link href="/termeni-si-conditii" className="inline-flex min-h-10 items-center text-base text-white/85 underline-offset-4 hover:text-white hover:underline">
                {t("terms")}
              </Link>
            </li>
            <li>
              <a
                href="https://anpc.ro/ce-este-sal/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center text-base text-white/85 underline-offset-4 hover:text-white hover:underline"
              >
                ANPC — SAL
              </a>
            </li>
            <li>
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center text-base text-white/85 underline-offset-4 hover:text-white hover:underline"
              >
                {t("sol")}
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Bară legală */}
      <div className="border-t border-white/15">
        <div className="container-site flex flex-col gap-2 py-5 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>{t("companyData")}</p>
          <p>
            © {new Date().getFullYear()} {site.name}. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
