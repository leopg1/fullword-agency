"use client";

import { useActionState, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, Download, Loader2, Plus, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { submitCvApplication, type CvApplyState } from "@/app/[locale]/completeaza-cv/actions";

type Exp = { role: string; company: string; period: string };

/**
 * Definite la nivel de modul (NU în render): altfel React le remontează la
 * fiecare tastare și inputurile necontrolate își pierd valoarea.
 */
function Section({
  step,
  title,
  optional,
  children,
}: {
  step: number;
  title: string;
  optional?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="flex items-center gap-3.5 border-b border-border bg-muted/40 px-5 py-4 sm:px-6">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-lg font-semibold text-primary-foreground">
          {step}
        </span>
        <h2 className="font-heading text-xl font-semibold leading-tight">
          {title}
          {optional && (
            <span className="ml-2 text-base font-normal text-muted-foreground">({optional})</span>
          )}
        </h2>
      </header>
      <div className="space-y-6 p-5 sm:p-6">{children}</div>
    </section>
  );
}

/** Un câmp: etichetă mare, căsuță goală, text ajutător dedesubt. */
function Field({
  id,
  label,
  hint,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base font-semibold leading-snug">
        {label}
        {required && <span className="ml-1 text-primary">*</span>}
      </Label>
      {children}
      {hint && <p className="text-sm leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}

const inputCls = "h-13 rounded-xl text-base";

export function BuildCvForm({ jobId }: { jobId?: string }) {
  const t = useTranslations("buildCv");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState<CvApplyState, FormData>(submitCvApplication, {
    status: "idle",
  });

  // singurul lucru ținut în state: rândurile de experiență (se pot adăuga/șterge)
  const [experiences, setExperiences] = useState<Exp[]>([{ role: "", company: "", period: "" }]);
  const setExp = (i: number, key: keyof Exp, value: string) =>
    setExperiences((prev) => prev.map((x, j) => (j === i ? { ...x, [key]: value } : x)));

  // ---- Ecran de succes ----
  if (state.status === "success") {
    const href = state.pdf ? `data:application/pdf;base64,${state.pdf}` : null;
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center">
        <CheckCircle2 className="mx-auto size-14 text-whatsapp" aria-hidden />
        <h2 className="mt-4 font-heading text-2xl font-semibold">{t("successTitle")}</h2>
        <p className="mt-2 text-lg text-muted-foreground">{t("successText")}</p>
        {href && (
          <Button asChild className="mt-6 h-13 w-full rounded-xl text-lg font-semibold">
            <a href={href} download="CV-Full-Work-Services.pdf">
              <Download className="size-5" aria-hidden />
              {t("download")}
            </a>
          </Button>
        )}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 text-base font-medium text-primary underline underline-offset-4"
        >
          {t("another")}
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="jobId" value={jobId ?? ""} />
      <input type="hidden" name="locale" value={locale} />
      {/* honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      {/* ---- 1. Date personale ---- */}
      <Section step={1} title={t("step1")}>
        <Field id="cv-name" label={t("name")} required>
          <Input id="cv-name" name="name" required maxLength={200} autoComplete="name" placeholder={t("namePh")} className={inputCls} />
        </Field>

        <Field id="cv-phone" label={t("phone")} hint={t("phoneHelp")} required>
          <Input id="cv-phone" name="phone" type="tel" inputMode="tel" required maxLength={50} autoComplete="tel" placeholder={t("phonePh")} className={inputCls} />
        </Field>

        <Field id="cv-trade" label={t("trade")} hint={t("tradeHelp")} required>
          <Input id="cv-trade" name="trade" required maxLength={120} placeholder={t("tradePh")} className={inputCls} />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="cv-years" label={t("years")} hint={t("yearsHelp")}>
            <Input id="cv-years" name="years" maxLength={30} placeholder={t("yearsPh")} className={inputCls} />
          </Field>
          <Field id="cv-city" label={t("city")}>
            <Input id="cv-city" name="city" maxLength={120} placeholder={t("cityPh")} className={inputCls} />
          </Field>
        </div>

        <Field id="cv-email" label={t("email")} hint={t("emailHelp")}>
          <Input id="cv-email" name="email" type="email" maxLength={320} autoComplete="email" placeholder={t("emailPh")} className={inputCls} />
        </Field>
      </Section>

      {/* ---- 2. Experiență ---- */}
      <Section step={2} title={t("step2")} optional={t("optional")}>
        <p className="-mt-1 text-base leading-relaxed text-muted-foreground">{t("experienceHelp")}</p>

        {experiences.map((exp, i) => (
          <div key={i} className="space-y-4 rounded-xl border border-border bg-background p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("workplace")} {i + 1}
              </span>
              {experiences.length > 1 && (
                <button
                  type="button"
                  onClick={() => setExperiences((p) => p.filter((_, j) => j !== i))}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Trash2 className="size-4" aria-hidden />
                  {t("removeExperience")}
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id={`exp-role-${i}`} label={t("expRole")}>
                <Input
                  id={`exp-role-${i}`}
                  name="exp_role"
                  maxLength={160}
                  value={exp.role}
                  onChange={(e) => setExp(i, "role", e.target.value)}
                  placeholder={t("expRolePh")}
                  className="h-12 rounded-xl text-base"
                />
              </Field>
              <Field id={`exp-company-${i}`} label={t("expCompany")}>
                <Input
                  id={`exp-company-${i}`}
                  name="exp_company"
                  maxLength={160}
                  value={exp.company}
                  onChange={(e) => setExp(i, "company", e.target.value)}
                  placeholder={t("expCompanyPh")}
                  className="h-12 rounded-xl text-base"
                />
              </Field>
            </div>

            <Field id={`exp-period-${i}`} label={t("expPeriod")}>
              <Input
                id={`exp-period-${i}`}
                name="exp_period"
                maxLength={60}
                value={exp.period}
                onChange={(e) => setExp(i, "period", e.target.value)}
                placeholder={t("expPeriodPh")}
                className="h-12 rounded-xl text-base"
              />
            </Field>
          </div>
        ))}

        {experiences.length < 8 && (
          <button
            type="button"
            onClick={() => setExperiences((p) => [...p, { role: "", company: "", period: "" }])}
            className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand/50 px-5 text-base font-semibold text-primary transition-colors hover:border-brand hover:bg-brand-tint-2"
          >
            <Plus className="size-5" aria-hidden />
            {t("addExperience")}
          </button>
        )}
      </Section>

      {/* ---- 3. Calificări ---- */}
      <Section step={3} title={t("step3")} optional={t("optional")}>
        <Field id="cv-license" label={t("license")} hint={t("licenseHelp")}>
          <Input id="cv-license" name="license" maxLength={120} placeholder={t("licensePh")} className={inputCls} />
        </Field>

        <Field id="cv-machines" label={t("machines")} hint={t("machinesHelp")}>
          <Input id="cv-machines" name="machine" maxLength={300} placeholder={t("machinesPh")} className={inputCls} />
        </Field>

        <Field id="cv-lang" label={t("languages")} hint={t("languagesHelp")}>
          <Input id="cv-lang" name="lang" maxLength={200} placeholder={t("languagesPh")} className={inputCls} />
        </Field>

        <Field id="cv-certs" label={t("certs")} hint={t("certsHelp")}>
          <Textarea id="cv-certs" name="certs_raw" rows={3} maxLength={2000} placeholder={t("certsPh")} className="rounded-xl text-base" />
        </Field>
      </Section>

      {/* ---- 4. Disponibilitate ---- */}
      <Section step={4} title={t("step4")} optional={t("optional")}>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="cv-availability" label={t("availability")} hint={t("availabilityHelp")}>
            <Input id="cv-availability" name="availability" maxLength={80} placeholder={t("availabilityPh")} className={inputCls} />
          </Field>
          <Field id="cv-schedule" label={t("schedule")} hint={t("scheduleHelp")}>
            <Input id="cv-schedule" name="schedule" maxLength={80} placeholder={t("schedulePh")} className={inputCls} />
          </Field>
        </div>

        <Field id="cv-mobility" label={t("mobility")} hint={t("mobilityHelp")}>
          <Input id="cv-mobility" name="mobility" maxLength={120} placeholder={t("mobilityPh")} className={inputCls} />
        </Field>

        <Field id="cv-about" label={t("about")} hint={t("aboutHelp")}>
          <Textarea id="cv-about" name="about" rows={3} maxLength={600} placeholder={t("aboutPh")} className="rounded-xl text-base" />
        </Field>
      </Section>

      {state.status === "error" && (
        <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-base font-medium text-destructive">
          {t("error")}
        </p>
      )}

      <div className="sticky bottom-0 -mx-1 rounded-t-2xl bg-background/95 px-1 pb-2 pt-3 backdrop-blur-sm">
        <Button type="submit" disabled={pending} className="h-14 w-full rounded-xl text-lg font-semibold">
          {pending ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden />
              {t("sending")}
            </>
          ) : (
            <>
              <Send className="size-5" aria-hidden />
              {t("submit")}
            </>
          )}
        </Button>
        <p className="mt-2 text-center text-sm text-muted-foreground">{t("privacy")}</p>
      </div>
    </form>
  );
}
