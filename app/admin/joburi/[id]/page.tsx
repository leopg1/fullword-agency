import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { JobForm } from "@/components/admin/job-form";
import { createClient } from "@/lib/supabase/server";
import type { JobRecord } from "@/lib/jobs";
import { requireAdmin } from "@/lib/admin-guard";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();
  const { data: job } = await supabase.from("fw_jobs").select("*").eq("id", id).single();
  if (!job) notFound();

  return (
    <AdminShell active="/admin">
      <h1 className="text-2xl">Editează: {(job as JobRecord).title_ro}</h1>
      <div className="mt-5">
        <JobForm job={job as JobRecord} />
      </div>
    </AdminShell>
  );
}
