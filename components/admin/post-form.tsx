import { savePost } from "@/app/admin/actions";
import { SaveForm } from "@/components/admin/save-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { POST_CATEGORIES } from "@/lib/posts";

export type PostEditRecord = {
  id: string;
  slug: string;
  title_ro: string;
  title_en: string;
  excerpt_ro: string;
  excerpt_en: string;
  body_ro: string;
  body_en: string;
  cover_image: string | null;
  category: string;
  featured: boolean;
  published: boolean;
  published_at: string | null;
};

/** Formularul de articol din admin. */
export function PostForm({ post }: { post?: PostEditRecord }) {
  const dateValue = post?.published_at
    ? new Date(post.published_at).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  return (
    <SaveForm action={savePost} submitLabel="Salvează articolul">
      {post && <input type="hidden" name="id" value={post.id} />}

      <fieldset className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
        <legend className="px-2 font-heading text-lg font-semibold">Titlu & setări</legend>
        <div className="space-y-1.5">
          <Label htmlFor="title_ro" className="text-base">Titlu (română) *</Label>
          <Input id="title_ro" name="title_ro" required defaultValue={post?.title_ro} className="h-12 text-base" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="title_en" className="text-base">Titlu (engleză) *</Label>
          <Input id="title_en" name="title_en" required defaultValue={post?.title_en} className="h-12 text-base" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug" className="text-base">Slug (în link — gol = generat din titlu)</Label>
          <Input id="slug" name="slug" defaultValue={post?.slug} pattern="[a-z0-9-]*" className="h-12 text-base" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category" className="text-base">Categorie</Label>
          <select
            id="category"
            name="category"
            defaultValue={post?.category ?? "ghiduri"}
            className="h-12 w-full rounded-lg border border-input bg-card px-3 text-base"
          >
            {POST_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.ro}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cover_image" className="text-base">Imagine cover (cale)</Label>
          <Input
            id="cover_image"
            name="cover_image"
            defaultValue={post?.cover_image ?? ""}
            placeholder="/images/services/recrutare.webp"
            className="h-12 text-base"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="published_at" className="text-base">Data publicării</Label>
          <Input id="published_at" name="published_at" type="date" defaultValue={dateValue} className="h-12 text-base" />
        </div>
        <label className="flex items-center gap-3 self-end pb-2 text-base">
          <input type="checkbox" name="published" defaultChecked={post ? post.published : true} className="size-5" />
          Publicat (vizibil pe site)
        </label>
        <label className="flex items-center gap-3 self-end pb-2 text-base">
          <input type="checkbox" name="featured" defaultChecked={post?.featured} className="size-5" />
          Recomandat (apare mare sus)
        </label>
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <legend className="px-2 font-heading text-lg font-semibold">Conținut RO</legend>
        <div className="space-y-1.5">
          <Label htmlFor="excerpt_ro" className="text-base">Rezumat scurt (apare în listă + Google)</Label>
          <Textarea id="excerpt_ro" name="excerpt_ro" rows={2} defaultValue={post?.excerpt_ro} className="text-base" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="body_ro" className="text-base">Text articol (Markdown: ## subtitlu, - listă, **bold**)</Label>
          <Textarea id="body_ro" name="body_ro" rows={16} defaultValue={post?.body_ro} className="font-mono text-sm" />
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <legend className="px-2 font-heading text-lg font-semibold">Conținut EN</legend>
        <div className="space-y-1.5">
          <Label htmlFor="excerpt_en" className="text-base">Short excerpt</Label>
          <Textarea id="excerpt_en" name="excerpt_en" rows={2} defaultValue={post?.excerpt_en} className="text-base" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="body_en" className="text-base">Article body (Markdown)</Label>
          <Textarea id="body_en" name="body_en" rows={16} defaultValue={post?.body_en} className="font-mono text-sm" />
        </div>
      </fieldset>

    </SaveForm>
  );
}
