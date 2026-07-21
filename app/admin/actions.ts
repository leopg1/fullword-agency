"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CONTENT_TAG, defaultMessage } from "@/lib/content";
import { SERVICE_DEFS, serviceNameKeys } from "@/lib/services";
import roMessages from "@/messages/ro.json";
import enMessages from "@/messages/en.json";

/** Revalidează paginile publice care afișează joburi/articole. */
function revalidatePublic() {
  // Paths specifice (NU "/" layout întreg — interferează cu redirect-ul din acțiuni).
  for (const p of ["/", "/joburi", "/blog", "/en", "/en/jobs", "/en/blog"]) {
    revalidatePath(p);
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function toggleJobStatus(id: string, current: "open" | "closed") {
  const supabase = await createClient();
  await supabase
    .from("fw_jobs")
    .update({ status: current === "open" ? "closed" : "open" })
    .eq("id", id);
  revalidatePath("/admin");
  revalidatePublic();
}

export async function deleteJob(id: string) {
  const supabase = await createClient();
  await supabase.from("fw_jobs").delete().eq("id", id);
  revalidatePath("/admin");
  revalidatePublic();
}

/** Transformă un textarea (un element pe linie) în array JSON. */
function lines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export type SaveState = { ok: boolean };

export async function saveJob(_prev: SaveState | null, formData: FormData): Promise<SaveState> {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");

  const record = {
    slug: String(formData.get("slug") ?? "").trim(),
    title_ro: String(formData.get("title_ro") ?? "").trim(),
    title_en: String(formData.get("title_en") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    country_code: String(formData.get("country_code") ?? "RO"),
    salary_ro: String(formData.get("salary_ro") ?? "").trim() || null,
    salary_en: String(formData.get("salary_en") ?? "").trim() || null,
    domain: String(formData.get("domain") ?? "construction"),
    status: String(formData.get("status") ?? "open"),
    remote: formData.get("remote") === "on",
    content_ro: {
      subtitle: String(formData.get("subtitle_ro") ?? "").trim(),
      intro: lines(formData.get("intro_ro")),
      benefits: lines(formData.get("benefits_ro")),
      requirements: lines(formData.get("requirements_ro")),
      location: lines(formData.get("location_ro")),
      responsibilities: lines(formData.get("responsibilities_ro")),
    },
    content_en: {
      subtitle: String(formData.get("subtitle_en") ?? "").trim(),
      intro: lines(formData.get("intro_en")),
      benefits: lines(formData.get("benefits_en")),
      requirements: lines(formData.get("requirements_en")),
      location: lines(formData.get("location_en")),
      responsibilities: lines(formData.get("responsibilities_en")),
    },
  };

  if (!record.slug || !record.title_ro || !record.title_en) return { ok: false };
  if (record.slug.length > 120 || record.title_ro.length > 250 || record.title_en.length > 250)
    return { ok: false };

  const { error } = id
    ? await supabase.from("fw_jobs").update(record).eq("id", id)
    : await supabase.from("fw_jobs").insert(record);
  if (error) return { ok: false };
  revalidatePath("/admin");
  revalidatePublic();
  redirect("/admin");
}

export async function updateApplicationStatus(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from("fw_applications").update({ status }).eq("id", id);
  revalidatePath("/admin/aplicari");
}

export async function updateLeadStatus(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from("fw_leads").update({ status }).eq("id", id);
  revalidatePath("/admin/leaduri");
}

/** Link semnat (1h) pentru descărcarea unui CV din bucket-ul privat. */
export async function getCvUrl(path: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.storage.from("fw-cvs").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

/* ---------- Blog ---------- */

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function togglePostPublished(id: string, current: boolean) {
  const supabase = await createClient();
  await supabase.from("fw_posts").update({ published: !current }).eq("id", id);
  revalidatePath("/admin/blog");
  revalidatePublic();
}

export async function togglePostFeatured(id: string, current: boolean) {
  const supabase = await createClient();
  // un singur articol featured la un moment dat
  if (!current) {
    await supabase.from("fw_posts").update({ featured: false }).neq("id", id);
  }
  await supabase.from("fw_posts").update({ featured: !current }).eq("id", id);
  revalidatePath("/admin/blog");
  revalidatePublic();
}

export async function deletePost(id: string) {
  const supabase = await createClient();
  await supabase.from("fw_posts").delete().eq("id", id);
  revalidatePath("/admin/blog");
  revalidatePublic();
}

export async function savePost(_prev: SaveState | null, formData: FormData): Promise<SaveState> {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");

  const titleRo = String(formData.get("title_ro") ?? "").trim();
  const titleEn = String(formData.get("title_en") ?? "").trim();
  let slug = String(formData.get("slug") ?? "").trim();
  if (!slug) slug = slugify(titleRo);

  if (!titleRo || !titleEn || !slug) return { ok: false };
  if (slug.length > 160 || titleRo.length > 250) return { ok: false };

  const publishedAtRaw = String(formData.get("published_at") ?? "").trim();

  const record = {
    slug,
    title_ro: titleRo,
    title_en: titleEn,
    excerpt_ro: String(formData.get("excerpt_ro") ?? "").trim(),
    excerpt_en: String(formData.get("excerpt_en") ?? "").trim(),
    body_ro: String(formData.get("body_ro") ?? ""),
    body_en: String(formData.get("body_en") ?? ""),
    cover_image: String(formData.get("cover_image") ?? "").trim() || null,
    category: String(formData.get("category") ?? "ghiduri"),
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    published_at: publishedAtRaw ? new Date(publishedAtRaw).toISOString() : new Date().toISOString(),
  };

  // un singur featured
  if (record.featured) {
    await supabase.from("fw_posts").update({ featured: false }).neq("id", id || "00000000-0000-0000-0000-000000000000");
  }

  const { error } = id
    ? await supabase.from("fw_posts").update(record).eq("id", id)
    : await supabase.from("fw_posts").insert(record);
  if (error) return { ok: false };
  revalidatePath("/admin/blog");
  revalidatePublic();
  redirect("/admin/blog");
}

/* ---------- Servicii: vizibilitate + ordine ---------- */

/** Arată/ascunde un serviciu pe site (pagina lui devine 404 când e ascuns). */
export async function toggleServicePublished(key: string, current: boolean) {
  const supabase = await createClient();
  await supabase
    .from("fw_services")
    .update({ published: !current, updated_at: new Date().toISOString() })
    .eq("key", key);
  revalidatePath("/admin/servicii");
  revalidatePath("/", "layout");
}

/** Mută un serviciu mai sus/mai jos, interschimbând ordinea cu vecinul. */
export async function moveService(key: string, direction: "up" | "down") {
  const supabase = await createClient();
  const { data } = await supabase
    .from("fw_services")
    .select("key, sort_order")
    .order("sort_order", { ascending: true });
  if (!data) return;

  const i = data.findIndex((s) => s.key === key);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= data.length) return;

  // interschimbă pozițiile celor doi vecini
  await supabase
    .from("fw_services")
    .update({ sort_order: data[j].sort_order })
    .eq("key", data[i].key);
  await supabase
    .from("fw_services")
    .update({ sort_order: data[i].sort_order })
    .eq("key", data[j].key);

  revalidatePath("/admin/servicii");
  revalidatePath("/", "layout");
}

/**
 * Redenumește un serviciu (RO + EN).
 *
 * Scrie în ACELAȘI loc ca editorul „Texte site" (tabelul fw_content), deci
 * numele rămâne sincronizat automat între cele două ecrane. Actualizează ambele
 * chei ale numelui — cardul din grilă și link-ul din subsol — care trebuie să
 * rămână identice. Dacă numele revine la cel original, ștergem suprascrierea.
 */
export async function renameService(
  key: string,
  nameRo: string,
  nameEn: string
): Promise<ContentSaveState> {
  const def = SERVICE_DEFS.find((d) => d.key === key);
  if (!def) return { ok: false, count: 0 };

  const ro = nameRo.trim();
  const en = nameEn.trim();
  if (!ro || !en) return { ok: false, count: 0 };
  if (ro.length > 80 || en.length > 80) return { ok: false, count: 0 };

  const changes: ContentChange[] = [];
  for (const contentKey of serviceNameKeys(def)) {
    changes.push({
      locale: "ro",
      key: contentKey,
      value: ro,
      isDefault: ro === defaultMessage(roMessages, contentKey),
    });
    changes.push({
      locale: "en",
      key: contentKey,
      value: en,
      isDefault: en === defaultMessage(enMessages, contentKey),
    });
  }

  const res = await saveContent(changes);
  if (res.ok) revalidatePath("/admin/servicii");
  return res;
}

/* ---------- Texte site (fw_content) ---------- */

export type ContentChange = { locale: "ro" | "en"; key: string; value: string; isDefault: boolean };
export type ContentSaveState = { ok: boolean; count: number };

/**
 * Salvează textele schimbate din editorul de conținut.
 * - dacă valoarea a revenit la cea implicită → șterge suprascrierea
 * - altfel → inserează/actualizează suprascrierea
 * NU face redirect: rămâne pe pagină și arată „S-a salvat". Revalidarea
 * (tag + layout) actualizează tot site-ul public.
 */
export async function saveContent(changes: ContentChange[]): Promise<ContentSaveState> {
  if (!Array.isArray(changes) || changes.length === 0) return { ok: true, count: 0 };
  const supabase = await createClient();

  const upserts = changes
    .filter((c) => !c.isDefault && c.key && (c.locale === "ro" || c.locale === "en"))
    .map((c) => ({ locale: c.locale, key: c.key, value: c.value, updated_at: new Date().toISOString() }));

  const deletes = changes.filter((c) => c.isDefault && c.key);

  if (upserts.length) {
    const { error } = await supabase.from("fw_content").upsert(upserts, { onConflict: "locale,key" });
    if (error) return { ok: false, count: 0 };
  }

  // Ștergerile: grupate pe limbă (câte o interogare per limbă).
  for (const loc of ["ro", "en"] as const) {
    const keys = deletes.filter((d) => d.locale === loc).map((d) => d.key);
    if (keys.length) {
      const { error } = await supabase.from("fw_content").delete().eq("locale", loc).in("key", keys);
      if (error) return { ok: false, count: 0 };
    }
  }

  revalidateTag(CONTENT_TAG, "max");
  revalidatePath("/", "layout");
  return { ok: true, count: upserts.length + deletes.length };
}
