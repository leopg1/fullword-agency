import { saveJob } from "@/app/admin/actions";
import { SaveForm } from "@/components/admin/save-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { JobRecord, JobContent } from "@/lib/jobs";

const DOMAINS = [
  ["construction", "Construcții & industrie"],
  ["logistics", "Depozit & logistică"],
  ["transport", "Transport"],
  ["horeca", "HoReCa & curățenie"],
  ["office", "Birou & vânzări"],
  ["medical", "Medical"],
] as const;

const COUNTRIES = ["RO", "BE", "NL", "BG", "DE", "FR", "IT", "ES", "AT", "UK"] as const;

function joinLines(items?: string[]) {
  return (items ?? []).join("\n");
}

function ContentFields({ lang, content }: { lang: "ro" | "en"; content: JobContent }) {
  const L = lang.toUpperCase();
  return (
    <fieldset className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <legend className="px-2 font-heading text-lg font-semibold">Conținut {L}</legend>
      <div className="space-y-1.5">
        <Label htmlFor={`subtitle_${lang}`} className="text-base">Subtitlu</Label>
        <Input id={`subtitle_${lang}`} name={`subtitle_${lang}`} defaultValue={content.subtitle ?? ""} className="h-12 text-base" />
      </div>
      {(
        [
          ["intro", "Descriere (un paragraf pe linie)"],
          ["benefits", "Ce primești (un punct pe linie)"],
          ["requirements", "Ce căutăm (un punct pe linie)"],
          ["location", "Unde vei lucra (un punct pe linie)"],
          ["responsibilities", "Ce vei face (un punct pe linie)"],
        ] as const
      ).map(([key, label]) => (
        <div key={key} className="space-y-1.5">
          <Label htmlFor={`${key}_${lang}`} className="text-base">{label}</Label>
          <Textarea
            id={`${key}_${lang}`}
            name={`${key}_${lang}`}
            rows={key === "intro" ? 4 : 5}
            defaultValue={joinLines(content[key])}
            className="text-base"
          />
        </div>
      ))}
    </fieldset>
  );
}

/** Formularul de job din admin — server component, salvare prin server action. */
export function JobForm({ job }: { job?: JobRecord }) {
  return (
    <SaveForm action={saveJob} submitLabel="Salvează jobul">
      {job && <input type="hidden" name="id" value={job.id} />}

      <fieldset className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
        <legend className="px-2 font-heading text-lg font-semibold">Date de bază</legend>
        <div className="space-y-1.5">
          <Label htmlFor="title_ro" className="text-base">Titlu (română) *</Label>
          <Input id="title_ro" name="title_ro" required defaultValue={job?.title_ro} className="h-12 text-base" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="title_en" className="text-base">Titlu (engleză) *</Label>
          <Input id="title_en" name="title_en" required defaultValue={job?.title_en} className="h-12 text-base" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug" className="text-base">Slug (în link) *</Label>
          <Input id="slug" name="slug" required defaultValue={job?.slug} pattern="[a-z0-9-]+" className="h-12 text-base" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="city" className="text-base">Oraș</Label>
          <Input id="city" name="city" defaultValue={job?.city} className="h-12 text-base" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="country_code" className="text-base">Țara</Label>
          <select
            id="country_code"
            name="country_code"
            defaultValue={job?.country_code ?? "RO"}
            className="h-12 w-full rounded-lg border border-input bg-card px-3 text-base"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="domain" className="text-base">Domeniu</Label>
          <select
            id="domain"
            name="domain"
            defaultValue={job?.domain ?? "construction"}
            className="h-12 w-full rounded-lg border border-input bg-card px-3 text-base"
          >
            {DOMAINS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="salary_ro" className="text-base">Salariu (text RO)</Label>
          <Input id="salary_ro" name="salary_ro" defaultValue={job?.salary_ro ?? ""} placeholder="ex. 2.500 € net/lună" className="h-12 text-base" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="salary_en" className="text-base">Salariu (text EN)</Label>
          <Input id="salary_en" name="salary_en" defaultValue={job?.salary_en ?? ""} placeholder="e.g. €2,500 net/month" className="h-12 text-base" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status" className="text-base">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={job?.status ?? "open"}
            className="h-12 w-full rounded-lg border border-input bg-card px-3 text-base"
          >
            <option value="open">Deschis</option>
            <option value="closed">Ocupat</option>
          </select>
        </div>
        <label className="flex items-center gap-3 self-end pb-2 text-base">
          <input type="checkbox" name="remote" defaultChecked={job?.remote} className="size-5" />
          Job remote
        </label>
      </fieldset>

      <ContentFields lang="ro" content={job?.content_ro ?? {}} />
      <ContentFields lang="en" content={job?.content_en ?? {}} />

    </SaveForm>
  );
}
