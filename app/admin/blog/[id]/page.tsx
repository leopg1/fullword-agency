import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { PostForm, type PostEditRecord } from "@/components/admin/post-form";
import { deletePost } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/server";
import { Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/admin-guard";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from("fw_posts").select("*").eq("id", id).single();
  if (!post) notFound();

  return (
    <AdminShell active="/admin/blog">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl">Editează articol</h1>
        <form
          action={async () => {
            "use server";
            await deletePost(id);
          }}
        >
          <button
            type="submit"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-destructive/30 px-4 text-base font-semibold text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-4.5" aria-hidden />
            Șterge
          </button>
        </form>
      </div>
      <div className="mt-5">
        <PostForm post={post as PostEditRecord} />
      </div>
    </AdminShell>
  );
}
