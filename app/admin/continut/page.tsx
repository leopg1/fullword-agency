import { AdminShell } from "@/components/admin/admin-shell";
import { ContentEditor, type ContentGroup } from "@/components/admin/content-editor";
import { requireAdmin } from "@/lib/admin-guard";
import { flattenLeaves, getContentOverrides, SECTION_LABELS } from "@/lib/content";
import roMessages from "@/messages/ro.json";
import enMessages from "@/messages/en.json";

export const dynamic = "force-dynamic";

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  await requireAdmin();
  const { lang } = await searchParams;
  const locale: "ro" | "en" = lang === "en" ? "en" : "ro";

  const defaults = (locale === "en" ? enMessages : roMessages) as Record<string, unknown>;
  const overrides = await getContentOverrides(locale);
  const leaves = flattenLeaves(defaults);

  // Grupează pe secțiuni de nivel 1, în ordinea din JSON.
  const map = new Map<string, ContentGroup>();
  for (const leaf of leaves) {
    let g = map.get(leaf.section);
    if (!g) {
      g = { key: leaf.section, label: SECTION_LABELS[leaf.section] ?? leaf.section, fields: [] };
      map.set(leaf.section, g);
    }
    g.fields.push({
      key: leaf.key,
      label: leaf.label,
      current: overrides[leaf.key] ?? leaf.value,
      default: leaf.value,
      multiline: leaf.multiline,
    });
  }
  const groups = [...map.values()];

  return (
    <AdminShell active="/admin/continut">
      <ContentEditor locale={locale} groups={groups} />
    </AdminShell>
  );
}
