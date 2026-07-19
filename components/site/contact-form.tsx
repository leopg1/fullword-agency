"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitLead, type LeadState } from "@/app/[locale]/contact/actions";

/** Formular de contact — nume, telefon, tip cerere, mesaj. */
export function ContactForm({ defaultType = "contact" }: { defaultType?: "contact" | "company_offer" }) {
  const t = useTranslations("contact");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState<LeadState, FormData>(submitLead, {
    status: "idle",
  });

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-2xl bg-brand-tint p-5 text-lg font-medium"
      >
        <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-whatsapp" aria-hidden />
        {t("formSuccess")}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="lead-name" className="text-base">
            {t("formName")} *
          </Label>
          <Input id="lead-name" name="name" required maxLength={200} autoComplete="name" className="h-12 text-base" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lead-company" className="text-base">
            {t("formCompany")}
          </Label>
          <Input id="lead-company" name="company" maxLength={200} autoComplete="organization" className="h-12 text-base" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lead-phone" className="text-base">
            {t("formPhone")} *
          </Label>
          <Input id="lead-phone" name="phone" type="tel" required maxLength={50} autoComplete="tel" className="h-12 text-base" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lead-email" className="text-base">
            {t("formEmail")}
          </Label>
          <Input id="lead-email" name="email" type="email" autoComplete="email" className="h-12 text-base" />
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-base font-medium">{t("formType")}</legend>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="flex min-h-12 flex-1 cursor-pointer items-center gap-3 rounded-xl border border-input bg-card px-4 text-base has-[:checked]:border-primary has-[:checked]:bg-brand-tint">
            <input type="radio" name="type" value="contact" defaultChecked={defaultType === "contact"} className="size-5" />
            {t("typeContact")}
          </label>
          <label className="flex min-h-12 flex-1 cursor-pointer items-center gap-3 rounded-xl border border-input bg-card px-4 text-base has-[:checked]:border-primary has-[:checked]:bg-brand-tint">
            <input type="radio" name="type" value="company_offer" defaultChecked={defaultType === "company_offer"} className="size-5" />
            {t("typeOffer")}
          </label>
        </div>
      </fieldset>

      <div className="space-y-1.5">
        <Label htmlFor="lead-message" className="text-base">
          {t("formMessage")}
        </Label>
        <Textarea id="lead-message" name="message" rows={4} maxLength={2000} className="text-base" />
      </div>

      {state.status === "error" && (
        <p role="alert" className="rounded-xl bg-destructive/10 p-3.5 text-base font-medium text-destructive">
          {t("formError")}
        </p>
      )}

      <Button type="submit" disabled={pending} className="h-14 w-full rounded-xl text-lg font-semibold sm:w-auto sm:px-10">
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
