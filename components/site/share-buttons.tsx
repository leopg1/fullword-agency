"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ClipboardCopy } from "lucide-react";
import { WhatsappIcon } from "@/components/site/whatsapp-icon";

/** Marca Facebook (lucide nu include iconuri de brand). */
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.412c0-3.025 1.792-4.696 4.533-4.696 1.313 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

/**
 * Butoane de distribuire pentru anunțuri de job și articole.
 *
 * Facebook NU permite pre-completarea textului unei postări din exterior
 * (parametrul `quote` a fost eliminat; `sharer.php` acceptă doar link-ul), deci:
 *  - butonul de Facebook copiază textul în clipboard ȘI deschide fereastra de
 *    postare — utilizatorul doar lipește (un singur Ctrl+V);
 *  - WhatsApp acceptă text pre-completat, deci acolo e totul dintr-un click.
 * `postText` conține marcajul {{URL}}, înlocuit aici cu adresa paginii curente.
 */
export function ShareButtons({ postText }: { postText?: string }) {
  const t = useTranslations("share");
  const [copied, setCopied] = useState(false);

  /** Link curat, fără query/hash — ca să nu ajungă parametri de tracking în postare. */
  const cleanUrl = () => window.location.origin + window.location.pathname;
  const fullText = () => (postText ?? "").replace("{{URL}}", cleanUrl());

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(postText ? fullText() : cleanUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 6000);
      return true;
    } catch {
      return false; // clipboard blocat — utilizatorul poate copia manual
    }
  };

  const shareFacebook = async () => {
    await copyText(); // textul e gata de lipit când se deschide fereastra
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cleanUrl())}`,
      "_blank",
      "noopener,noreferrer,width=660,height=700"
    );
  };

  const shareWhatsapp = () => {
    // WhatsApp acceptă text pre-completat — un singur click, postare completă.
    const text = postText ? fullText() : cleanUrl();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-base font-semibold text-foreground">{t("title")}</p>

      <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={shareFacebook}
          className="inline-flex min-h-12 items-center gap-2.5 rounded-xl bg-[#1877F2] px-5 text-base font-semibold text-white transition-opacity hover:opacity-90"
        >
          <FacebookIcon className="size-5" />
          {t("facebook")}
        </button>

        <button
          type="button"
          onClick={shareWhatsapp}
          className="inline-flex min-h-12 items-center gap-2.5 rounded-xl bg-whatsapp px-5 text-base font-semibold text-white transition-opacity hover:opacity-90"
        >
          <WhatsappIcon className="size-5" aria-hidden />
          {t("whatsapp")}
        </button>

        {postText && (
          <button
            type="button"
            onClick={copyText}
            className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-border bg-background px-4 text-base font-semibold text-foreground hover:bg-muted"
          >
            {copied ? (
              <Check className="size-5 text-whatsapp" aria-hidden />
            ) : (
              <ClipboardCopy className="size-5 text-muted-foreground" aria-hidden />
            )}
            {copied ? t("copiedText") : t("copyText")}
          </button>
        )}
      </div>

      {/* Confirmare vizibilă după copiere — spune exact ce urmează de făcut */}
      {copied && (
        <p
          role="status"
          className="mt-3 rounded-xl bg-brand-tint-2 px-4 py-3 text-base font-medium text-foreground"
        >
          {t("hint")}
        </p>
      )}
    </div>
  );
}
