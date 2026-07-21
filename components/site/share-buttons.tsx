"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ClipboardCopy } from "lucide-react";
import { WhatsappIcon } from "@/components/site/whatsapp-icon";
import { cn } from "@/lib/utils";

/* Iconuri de brand (lucide nu le include). */
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.412c0-3.025 1.792-4.696 4.533-4.696 1.313 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

/**
 * Butoane de distribuire pentru anunțuri de job și articole.
 *
 * Facebook și LinkedIn NU permit pre-completarea textului postării (parametrii
 * de text au fost eliminați; acceptă doar link-ul), deci acolo textul se pune în
 * clipboard, iar utilizatorul îl lipește cu un singur Ctrl/Cmd+V. WhatsApp
 * acceptă text pre-completat → un singur click, postare completă.
 * `postText` conține marcajul {{URL}}, înlocuit cu adresa paginii curente.
 */
export function ShareButtons({ postText }: { postText?: string }) {
  const t = useTranslations("share");
  const [copied, setCopied] = useState(false);

  const cleanUrl = () => window.location.origin + window.location.pathname;
  const fullText = () => (postText ?? "").replace("{{URL}}", cleanUrl());

  const copyText = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 8000);
    // fără await: fereastra trebuie deschisă în același gest de click,
    // altfel browserele blochează popup-ul
    void navigator.clipboard?.writeText(postText ? fullText() : cleanUrl()).catch(() => {});
  };

  const openWindow = (url: string) =>
    window.open(url, "_blank", "noopener,noreferrer,width=660,height=700");

  const shareFacebook = () => {
    // Copiază ÎNTÂI (cât documentul are focus), apoi deschide fereastra: altfel
    // popup-ul fură focusul și scrierea în clipboard eșuează în tăcere. Ambele
    // rămân în același gest de click, deci fereastra nu e blocată.
    if (postText) copyText();
    openWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cleanUrl())}`);
  };

  const shareLinkedin = () => {
    if (postText) copyText();
    openWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(cleanUrl())}`);
  };

  const shareWhatsapp = () => {
    // WhatsApp acceptă text pre-completat — un click, postare completă.
    window.open(
      `https://wa.me/?text=${encodeURIComponent(postText ? fullText() : cleanUrl())}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const iconBtn =
    "inline-flex size-11 items-center justify-center rounded-full text-white transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2";

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-base font-semibold text-foreground">{t("title")}</p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={shareFacebook}
            aria-label={t("facebook")}
            title={t("facebook")}
            className={cn(iconBtn, "bg-[#1877F2] hover:bg-[#1877F2]/90")}
          >
            <FacebookIcon className="size-5" />
          </button>

          <button
            type="button"
            onClick={shareWhatsapp}
            aria-label={t("whatsapp")}
            title={t("whatsapp")}
            className={cn(iconBtn, "bg-whatsapp hover:bg-whatsapp/90")}
          >
            <WhatsappIcon className="size-5" aria-hidden />
          </button>

          <button
            type="button"
            onClick={shareLinkedin}
            aria-label={t("linkedin")}
            title={t("linkedin")}
            className={cn(iconBtn, "bg-[#0A66C2] hover:bg-[#0A66C2]/90")}
          >
            <LinkedinIcon className="size-5" />
          </button>

          {postText && (
            <button
              type="button"
              onClick={copyText}
              aria-label={t("copyText")}
              title={t("copyText")}
              className={cn(
                "inline-flex size-11 items-center justify-center rounded-full border transition-colors",
                copied
                  ? "border-whatsapp/40 bg-whatsapp/10 text-whatsapp"
                  : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {copied ? <Check className="size-5" aria-hidden /> : <ClipboardCopy className="size-5" aria-hidden />}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
