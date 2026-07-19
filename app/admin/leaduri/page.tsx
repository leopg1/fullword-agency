import { AdminShell } from "@/components/admin/admin-shell";
import { createClient } from "@/lib/supabase/server";
import { updateLeadStatus } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin-guard";

const STATUS_LABELS: Record<string, string> = {
  new: "Nou",
  contacted: "Contactat",
  closed: "Închis",
};

const TYPE_LABELS: Record<string, string> = {
  contact: "Mesaj contact",
  company_offer: "Cerere ofertă",
};

export default async function AdminLeadsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: leads } = await supabase
    .from("fw_leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <AdminShell active="/admin/leaduri">
      <h1 className="text-2xl">Mesaje & cereri de ofertă ({leads?.length ?? 0})</h1>
      <ul className="mt-5 space-y-3">
        {leads?.length === 0 && (
          <li className="rounded-2xl border border-border bg-card p-6 text-base text-muted-foreground">
            Niciun mesaj încă. Cererile din formularele de contact și ofertă apar aici.
          </li>
        )}
        {leads?.map((l) => (
          <li key={l.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                  {TYPE_LABELS[l.type] ?? l.type}
                  {l.service ? ` · ${l.service}` : ""}
                </p>
                <p className="mt-1 font-heading text-lg font-semibold">
                  {l.name}
                  {l.company ? ` — ${l.company}` : ""}
                </p>
                <p className="mt-1.5 text-base">
                  <a href={`tel:${l.phone}`} className="font-semibold text-primary underline underline-offset-4">
                    {l.phone}
                  </a>
                  {l.email && (
                    <>
                      {" · "}
                      <a href={`mailto:${l.email}`} className="text-primary underline underline-offset-4">
                        {l.email}
                      </a>
                    </>
                  )}
                </p>
                {l.message && <p className="mt-2 text-base text-muted-foreground">„{l.message}"</p>}
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {new Date(l.created_at).toLocaleString("ro-RO", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <form
                action={async (formData: FormData) => {
                  "use server";
                  await updateLeadStatus(l.id, String(formData.get("status")));
                }}
                className="shrink-0"
              >
                <select
                  name="status"
                  defaultValue={l.status}
                  className="h-11 rounded-xl border border-input bg-card px-3 text-base"
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <button type="submit" className="ml-2 min-h-11 rounded-xl bg-primary px-4 text-base font-semibold text-primary-foreground">
                  Salvează
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
