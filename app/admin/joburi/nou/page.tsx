import { AdminShell } from "@/components/admin/admin-shell";
import { JobForm } from "@/components/admin/job-form";
import { requireAdmin } from "@/lib/admin-guard";

export default async function NewJobPage() {
  await requireAdmin();
  return (
    <AdminShell active="/admin">
      <h1 className="text-2xl">Job nou</h1>
      <div className="mt-5">
        <JobForm />
      </div>
    </AdminShell>
  );
}
