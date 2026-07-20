import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { organizationJsonLd } from "@/lib/seo";
import { site, siteUrl } from "@/lib/site";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { WhatsappFab } from "@/components/site/whatsapp-fab";
import "../globals.css";

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
  variable: "--font-poppins",
  display: "optional",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "optional",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const ro = locale === "ro";
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: ro
        ? "Full Work Services — Partenerul tău în oameni și performanță"
        : "Full Work Services — Your partner in people and performance",
      template: "%s | Full Work Services",
    },
    description: ro
      ? "Agenție de recrutare și partener complet de HR în București: recrutare, permise de muncă, înființare firmă, cetățenie română și mediere."
      : "Recruitment agency and complete HR partner in Bucharest: recruitment, work permits, company formation, Romanian citizenship and mediation.",
    openGraph: {
      siteName: site.name,
      type: "website",
      locale: ro ? "ro_RO" : "en_US",
      images: [{ url: "/og.png", width: 1200, height: 630 }],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()).replace(/</g, "\\u003c") }}
        />
        <NextIntlClientProvider>
          <LenisProvider>
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
            <WhatsappFab />
          </LenisProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
