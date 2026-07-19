import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { toggleJobStatus } from "@/app/admin/actions";
import { countryInfo } from "@/lib/jobs-data";
import { cn } from "@/lib/utils";
import type { JobRecord } from "@/lib/jobs";
import { requireAdmin } from "@/lib/admin-guard";

export default async function AdminJobsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: jobs } = await supabase
    .from("fw_jobs")
    .select("id, slug, title_ro, city, country_code, salary_ro, status")
    .order("status", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <AdminShell active="/admin">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl">Joburi ({jobs?.length ?? 0})</h1>
        <Button asChild className="h-12 rounded-xl px-5 text-base font-semibold">
          <Link href="/admin/joburi/nou">
            <Plus className="size-5" aria-hidden />
            Job nou
          </Link>
        </Button>
      </div>

      <ul className="mt-5 space-y-3">
        {(jobs as Pick<JobRecord, "id" | "slug" | "title_ro" | "city" | "country_code" | "salary_ro" | "status">[] | null)?.map((job) => (
          <li
            key={job.id}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-heading text-lg font-semibold leading-snug">{job.title_ro}</p>
              <p className="mt-0.5 text-base text-muted-foreground">
                {countryInfo(job.country_code).flag} {job.city}
                {job.salary_ro ? ` · ${job.salary_ro}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <form
                action={async () => {
                  "use server";
                  await toggleJobStatus(job.id, job.status);
                }}
              >
                <button
                  type="submit"
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-base font-semibold",
                    job.status === "open"
                      ? "border-whatsapp/40 bg-whatsapp/10 text-whatsapp"
                      : "border-border bg-muted text-muted-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "size-2.5 rounded-full",
                      job.status === "open" ? "bg-whatsapp" : "bg-muted-foreground"
                    )}
                    aria-hidden
                  />
                  {job.status === "open" ? "Deschis" : "Ocupat"}
                </button>
              </form>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-xl px-4 text-base font-semibold"
              >
                <Link href={`/admin/joburi/${job.id}`}>
                  <Pencil className="size-4.5" aria-hidden />
                  Editează
                </Link>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
