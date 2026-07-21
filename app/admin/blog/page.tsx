import Link from "next/link";
import { Pencil, Plus, Star } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminHelp } from "@/components/admin/admin-help";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { togglePostPublished, togglePostFeatured } from "@/app/admin/actions";
import { categoryLabel } from "@/lib/posts";
import { cn } from "@/lib/utils";
import { requireAdmin } from "@/lib/admin-guard";

type Row = {
  id: string;
  slug: string;
  title_ro: string;
  category: string;
  featured: boolean;
  published: boolean;
  published_at: string | null;
};

export default async function AdminBlogPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("fw_posts")
    .select("id, slug, title_ro, category, featured, published, published_at")
    .order("published_at", { ascending: false });

  return (
    <AdminShell active="/admin/blog">
      <AdminHelp>
        <p>Articolele de pe site (secțiunea Blog).</p>
        <p>
          <strong>Articol nou</strong> — scrii unul. <strong>Editează</strong> — schimbi un articol
          existent.
        </p>
        <p>
          <strong>Publicat / Ciornă</strong> — dacă articolul se vede pe site sau nu. <strong>Steluța</strong>{" "}
          îl pune mare, primul pe pagina de blog (doar unul poate fi așa).
        </p>
      </AdminHelp>

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl">Articole ({posts?.length ?? 0})</h1>
        <Button asChild className="h-12 rounded-xl px-5 text-base font-semibold">
          <Link href="/admin/blog/nou">
            <Plus className="size-5" aria-hidden />
            Articol nou
          </Link>
        </Button>
      </div>

      <ul className="mt-5 space-y-3">
        {(posts as Row[] | null)?.map((post) => (
          <li
            key={post.id}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-heading text-lg font-semibold leading-snug">{post.title_ro}</p>
              <p className="mt-0.5 text-base text-muted-foreground">
                {categoryLabel(post.category, "ro")}
                {post.published_at
                  ? ` · ${new Date(post.published_at).toLocaleDateString("ro-RO", { dateStyle: "medium" })}`
                  : ""}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {/* Featured */}
              <form
                action={async () => {
                  "use server";
                  await togglePostFeatured(post.id, post.featured);
                }}
              >
                <button
                  type="submit"
                  aria-label={post.featured ? "Scoate din recomandate" : "Fă recomandat"}
                  className={cn(
                    "inline-flex size-11 items-center justify-center rounded-xl border",
                    post.featured
                      ? "border-brand bg-brand-tint-2 text-primary"
                      : "border-border bg-muted text-muted-foreground"
                  )}
                >
                  <Star className={cn("size-5", post.featured && "fill-current")} aria-hidden />
                </button>
              </form>
              {/* Published */}
              <form
                action={async () => {
                  "use server";
                  await togglePostPublished(post.id, post.published);
                }}
              >
                <button
                  type="submit"
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-base font-semibold",
                    post.published
                      ? "border-whatsapp/40 bg-whatsapp/10 text-whatsapp"
                      : "border-border bg-muted text-muted-foreground"
                  )}
                >
                  <span
                    className={cn("size-2.5 rounded-full", post.published ? "bg-whatsapp" : "bg-muted-foreground")}
                    aria-hidden
                  />
                  {post.published ? "Publicat" : "Ciornă"}
                </button>
              </form>
              <Button asChild variant="outline" className="h-11 rounded-xl px-4 text-base font-semibold">
                <Link href={`/admin/blog/${post.id}`}>
                  <Pencil className="size-4.5" aria-hidden />
                  Editează
                </Link>
              </Button>
            </div>
          </li>
        ))}
        {posts?.length === 0 && (
          <li className="rounded-2xl border border-border bg-card p-6 text-base text-muted-foreground">
            Niciun articol încă. Apasă „Articol nou" ca să scrii primul.
          </li>
        )}
      </ul>
    </AdminShell>
  );
}
