import { AdminShell } from "@/components/admin/admin-shell";
import { PostForm } from "@/components/admin/post-form";
import { requireAdmin } from "@/lib/admin-guard";

export default async function NewPostPage() {
  await requireAdmin();
  return (
    <AdminShell active="/admin/blog">
      <h1 className="text-2xl">Articol nou</h1>
      <div className="mt-5">
        <PostForm />
      </div>
    </AdminShell>
  );
}
