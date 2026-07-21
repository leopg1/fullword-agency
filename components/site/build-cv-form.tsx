"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, Download, Loader2, Plus, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { submitCvApplication, type CvApplyState } from "@/app/[locale]/completeaza-cv/actions";
import { useActionState } from "react";

type Exp = { role: string; company: string; period: string };

const sectionCls = "rounded-2xl border border-border bg-card p-5 sm:p-6";

/** Definită la nivel de modul (NU în render) ca inputurile necontrolate să nu
 *  se remonteze — altfel orice click pe un chip ștergea numele/telefonul. */
function Section({ step, title, children }: { step: string; title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className={sectionCls}>
      <h2 className="flex items-baseline gap-2 font-heading text-xl font-semibold">
        <span className="text-primary">{step}.</span>
        {title}
      </h2>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

const chipCls = (active: boolean) =>
  cn(
    "inline-flex min-h-11 items-center rounded-full border px-4 text-base font-medium transition-colors",
    active
      ? "border-brand bg-brand text-brand-foreground"
      : "border-border bg-background text-foreground hover:bg-muted"
  );

export function BuildCvForm({ jobId }: { jobId?: string }) {
  const t = useTranslations("buildCv");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState<CvApplyState, FormData>(submitCvApplication, {
    status: "idle",
  });

  // selecții gestionate în state → randate ca hidden inputs în form
  const [trade, setTrade] = useState("");
  const [years, setYears] = useState("");
  const [licenses, setLicenses] = useState<string[]>([]);
  const [machines, setMachines] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [availability, setAvailability] = useState("");
  const [schedule, setSchedule] = useState("");
  const [mobility, setMobility] = useState("");
  const [experiences, setExperiences] = useState<Exp[]>([{ role: "", company: "", period: "" }]);

  const arr = (key: string): string[] => (t.raw(key) as string[]) ?? [];
  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

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

  const opt = <span className="ml-1 text-sm font-normal text-muted-foreground">({t("optional")})</span>;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="jobId" value={jobId ?? ""} />
      <input type="hidden" name="locale" value={locale} />
      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />

      {/* hidden inputs din selecții */}
      {licenses.map((v) => <input key={`l${v}`} type="hidden" name="license" value={v} />)}
      {machines.map((v) => <input key={`m${v}`} type="hidden" name="machine" value={v} />)}
      {languages.map((v) => <input key={`g${v}`} type="hidden" name="lang" value={v} />)}
      <input type="hidden" name="years" value={years} />
      <input type="hidden" name="availability" value={availability} />
      <input type="hidden" name="schedule" value={schedule} />
      <input type="hidden" name="mobility" value={mobility} />

      {/* ---- Pas 1: cine ești ---- */}
      <Section step="1" title={t("step1")}>
        <div className="space-y-1.5">
          <Label htmlFor="cv-name" className="text-base font-medium">{t("name")} *</Label>
          <Input id="cv-name" name="name" required maxLength={200} placeholder={t("namePh")} className="h-13 text-base" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cv-phone" className="text-base font-medium">{t("phone")} *</Label>
          <Input id="cv-phone" name="phone" type="tel" inputMode="tel" required maxLength={50} placeholder={t("phonePh")} className="h-13 text-base" />
          <p className="text-sm text-muted-foreground">{t("phoneHelp")}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cv-trade" className="text-base font-medium">{t("trade")} *</Label>
          <div className="flex flex-wrap gap-2">
            {arr("tradeChips").map((c) => (
              <button key={c} type="button" onClick={() => setTrade(c)} className={chipCls(trade === c)}>
                {c}
              </button>
            ))}
          </div>
          <Input
            id="cv-trade"
            name="trade"
            required
            maxLength={120}
            value={trade}
            onChange={(e) => setTrade(e.target.value)}
            placeholder={t("tradePh")}
            className="h-13 text-base"
          />
          <p className="text-sm text-muted-foreground">{t("tradeHelp")}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-medium">{t("years")} {opt}</Label>
          <div className="flex flex-wrap gap-2">
            {arr("yearsChips").map((c) => (
              <button key={c} type="button" onClick={() => setYears(years === c ? "" : c)} className={chipCls(years === c)}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="cv-city" className="text-base font-medium">{t("city")} {opt}</Label>
            <Input id="cv-city" name="city" maxLength={120} placeholder={t("cityPh")} className="h-13 text-base" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cv-email" className="text-base font-medium">{t("email")} {opt}</Label>
            <Input id="cv-email" name="email" type="email" maxLength={320} placeholder={t("emailPh")} className="h-13 text-base" />
            <p className="text-sm text-muted-foreground">{t("emailHelp")}</p>
          </div>
        </div>
      </Section>

      {/* ---- Pas 2: experiență ---- */}
      <Section step="2" title={<>{t("step2")} {opt}</>}>
        <p className="text-base text-muted-foreground">{t("experienceHelp")}</p>
        {experiences.map((exp, i) => (
          <div key={i} className="space-y-3 rounded-xl border border-border bg-background p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-muted-foreground">{t("expRole")}</Label>
                <Input
                  name="exp_role"
                  maxLength={160}
                  value={exp.role}
                  onChange={(e) => setExperiences((p) => p.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)))}
                  placeholder={t("expRolePh")}
                  className="h-12 text-base"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-muted-foreground">{t("expCompany")}</Label>
                <Input
                  name="exp_company"
                  maxLength={160}
                  value={exp.company}
                  onChange={(e) => setExperiences((p) => p.map((x, j) => (j === i ? { ...x, company: e.target.value } : x)))}
                  placeholder={t("expCompanyPh")}
                  className="h-12 text-base"
                />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <Label className="text-sm font-medium text-muted-foreground">{t("expPeriod")}</Label>
                <Input
                  name="exp_period"
                  maxLength={60}
                  value={exp.period}
                  onChange={(e) => setExperiences((p) => p.map((x, j) => (j === i ? { ...x, period: e.target.value } : x)))}
                  placeholder={t("expPeriodPh")}
                  className="h-12 text-base"
                />
              </div>
              {experiences.length > 1 && (
                <button
                  type="button"
                  onClick={() => setExperiences((p) => p.filter((_, j) => j !== i))}
                  aria-label={t("removeExperience")}
                  className="inline-flex h-12 items-center gap-1.5 rounded-xl border border-border px-3 text-base font-medium text-muted-foreground hover:bg-muted"
                >
                  <Trash2 className="size-4.5" aria-hidden />
                </button>
              )}
            </div>
          </div>
        ))}
        {experiences.length < 8 && (
          <button
            type="button"
            onClick={() => setExperiences((p) => [...p, { role: "", company: "", period: "" }])}
            className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-dashed border-brand/50 px-5 text-base font-semibold text-primary hover:bg-brand-tint-2"
          >
            <Plus className="size-5" aria-hidden />
            {t("addExperience")}
          </button>
        )}
      </Section>

      {/* ---- Pas 3: competențe ---- */}
      <Section step="3" title={<>{t("step3")} {opt}</>}>
        <div className="space-y-2">
          <Label className="text-base font-medium">{t("license")}</Label>
          <div className="flex flex-wrap gap-2">
            {arr("licenseChips").map((c) => (
              <button key={c} type="button" onClick={() => toggle(licenses, setLicenses, c)} className={chipCls(licenses.includes(c))}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-medium">{t("machines")}</Label>
          <div className="flex flex-wrap gap-2">
            {arr("machineChips").map((c) => (
              <button key={c} type="button" onClick={() => toggle(machines, setMachines, c)} className={chipCls(machines.includes(c))}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-medium">{t("languages")}</Label>
          <div className="flex flex-wrap gap-2">
            {arr("langChips").map((c) => (
              <button key={c} type="button" onClick={() => toggle(languages, setLanguages, c)} className={chipCls(languages.includes(c))}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cv-certs" className="text-base font-medium">{t("certs")}</Label>
          <Textarea id="cv-certs" name="certs_raw" rows={3} maxLength={2000} placeholder={t("certsPh")} className="text-base" />
          <p className="text-sm text-muted-foreground">{t("certsHelp")}</p>
        </div>
      </Section>

      {/* ---- Pas 4: disponibilitate ---- */}
      <Section step="4" title={<>{t("step4")} {opt}</>}>
        <div className="space-y-2">
          <Label className="text-base font-medium">{t("availability")}</Label>
          <div className="flex flex-wrap gap-2">
            {arr("availabilityChips").map((c) => (
              <button key={c} type="button" onClick={() => setAvailability(availability === c ? "" : c)} className={chipCls(availability === c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-base font-medium">{t("schedule")}</Label>
          <div className="flex flex-wrap gap-2">
            {arr("scheduleChips").map((c) => (
              <button key={c} type="button" onClick={() => setSchedule(schedule === c ? "" : c)} className={chipCls(schedule === c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-base font-medium">{t("mobility")}</Label>
          <div className="flex flex-wrap gap-2">
            {arr("mobilityChips").map((c) => (
              <button key={c} type="button" onClick={() => setMobility(mobility === c ? "" : c)} className={chipCls(mobility === c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cv-about" className="text-base font-medium">{t("about")} {opt}</Label>
          <Textarea id="cv-about" name="about" rows={3} maxLength={600} placeholder={t("aboutPh")} className="text-base" />
        </div>
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
