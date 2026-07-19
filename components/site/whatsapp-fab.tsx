"use client";

import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { WhatsappIcon } from "@/components/site/whatsapp-icon";
import { whatsappLink } from "@/lib/site";

/**
 * Buton WhatsApp flotant — doar pe mobil. Ascuns pe paginile de job,
 * unde există deja bara fixă de aplicare (ar sta una peste alta).
 */
export function WhatsappFab() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const isJobDetail = /^\/joburi\/[^/]+$/.test(pathname);
  if (isJobDetail) return null;

  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsapp")}
      className="fixed bottom-4 right-4 z-40 flex size-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition-transform hover:scale-105 lg:hidden"
    >
      <WhatsappIcon className="size-7" aria-hidden />
    </a>
  );
}
