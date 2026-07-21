"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, FileText, Loader2, Send } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitApplication, type ApplyState } from "@/app/[locale]/joburi/[slug]/actions";

/** Formular de aplicare — 2 câmpuri obligatorii, restul opțional. */
export function ApplyForm({ jobId }: { jobId: string }) {
  const t = useTranslations("jobPage");
  const tCv = useTranslations("buildCv");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState<ApplyState, FormData>(
    submitApplication,
    { status: "idle" }
  );

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-2xl bg-brand-tint p-5 text-lg font-medium text-foreground"
      >
        <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-whatsapp" aria-hidden />
        {t("formSuccess")}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="jobId" value={jobId} />
      <input type="hidden" name="locale" value={locale} />
      {/* honeypot anti-spam */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <div className="space-y-1.5">
        <Label htmlFor="apply-name" className="text-base">
          {t("formName")} *
        </Label>
        <Input id="apply-name" name="name" required maxLength={200} autoComplete="name" className="h-12 text-base" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="apply-phone" className="text-base">
          {t("formPhone")} *
        </Label>
        <Input
          id="apply-phone"
          name="phone"
          type="tel"
          required
          maxLength={50}
          autoComplete="tel"
          className="h-12 text-base"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="apply-email" className="text-base">
          {t("formEmail")}
        </Label>
        <Input id="apply-email" name="email" type="email" autoComplete="email" className="h-12 text-base" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="apply-cv" className="text-base">
          {t("formCv")}
        </Label>
        <Input
          id="apply-cv"
          name="cv"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="h-12 pt-2.5 text-base file:font-medium"
        />
        <Link
          href={{ pathname: "/completeaza-cv", query: jobId && !jobId.startsWith("static-") ? { job: jobId } : {} }}
          className="mt-1 flex items-start gap-2 rounded-xl border border-brand/30 bg-brand-tint-2 p-3 text-base transition-colors hover:border-brand"
        >
          <FileText className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <span>
            <span className="font-semibold text-foreground">{tCv("entryTitle")}</span>{" "}
            <span className="text-muted-foreground">{tCv("entryText")}</span>
          </span>
        </Link>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="apply-message" className="text-base">
          {t("formMessage")}
        </Label>
        <Textarea id="apply-message" name="message" rows={3} maxLength={2000} className="text-base" />
      </div>

      {state.status === "error" && (
        <p role="alert" className="rounded-xl bg-destructive/10 p-3.5 text-base font-medium text-destructive">
          {t("formError")}
        </p>
      )}

      <Button type="submit" disabled={pending} className="h-14 w-full rounded-xl text-lg font-semibold">
        {pending ? (
          <>
            <Loader2 className="size-5 animate-spin" aria-hidden />
            {t("formSending")}
          </>
        ) : (
          <>
            <Send className="size-5" aria-hidden />
            {t("formSubmit")}
          </>
        )}
      </Button>

      <p className="text-sm text-muted-foreground">{t("formPrivacy")}</p>
    </form>
  );
}
