import { AdminShell } from "@/components/admin/admin-shell";
import { CvLink } from "@/components/admin/cv-link";
import { createClient } from "@/lib/supabase/server";
import { updateApplicationStatus } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin-guard";

const STATUS_LABELS: Record<string, string> = {
  new: "Nouă",
  contacted: "Contactat",
  rejected: "Respins",
  hired: "Angajat",
};

export default async function AdminApplicationsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: applications } = await supabase
    .from("fw_applications")
    .select("id, name, phone, email, message, cv_path, status, created_at, fw_jobs(title_ro)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <AdminShell active="/admin/aplicari">
      <h1 className="text-2xl">Aplicări ({applications?.length ?? 0})</h1>
      <ul className="mt-5 space-y-3">
        {applications?.length === 0 && (
          <li className="rounded-2xl border border-border bg-card p-6 text-base text-muted-foreground">
            Nicio aplicare încă. Când cineva aplică pe site, apare aici.
          </li>
        )}
        {applications?.map((a) => {
          const job = (Array.isArray(a.fw_jobs) ? a.fw_jobs[0] : a.fw_jobs) as
            | { title_ro: string }
            | null;
          return (
            <li key={a.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-heading text-lg font-semibold">{a.name}</p>
                  {job && <p className="text-base text-muted-foreground">{job.title_ro}</p>}
                  <p className="mt-1.5 text-base">
                    <a href={`tel:${a.phone}`} className="font-semibold text-primary underline underline-offset-4">
                      {a.phone}
                    </a>
                    {a.email && (
                      <>
                        {" · "}
                        <a href={`mailto:${a.email}`} className="text-primary underline underline-offset-4">
                          {a.email}
                        </a>
                      </>
                    )}
                  </p>
                  {a.message && <p className="mt-2 text-base text-muted-foreground">„{a.message}"</p>}
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {new Date(a.created_at).toLocaleString("ro-RO", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {a.cv_path && <CvLink path={a.cv_path} />}
                  <form
                    action={async (formData: FormData) => {
                      "use server";
                      await updateApplicationStatus(a.id, String(formData.get("status")));
                    }}
                  >
                    <select
                      name="status"
                      defaultValue={a.status}
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
              </div>
            </li>
          );
        })}
      </ul>
    </AdminShell>
  );
}
