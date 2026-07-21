"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { ChevronDown, RotateCcw, Search, Check, Loader2 } from "lucide-react";
import { saveContent, type ContentChange } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export type ContentField = {
  key: string;
  label: string;
  current: string;
  default: string;
  multiline: boolean;
};
export type ContentGroup = { key: string; label: string; fields: ContentField[] };

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function ContentEditor({
  locale,
  groups,
  openSection,
}: {
  locale: "ro" | "en";
  groups: ContentGroup[];
  /** secțiune deschisă din start (ex. venind din pagina Servicii) */
  openSection?: string;
}) {
  // valori curente (controlate), plus referințe la valoarea inițială pt. „modificat"
  const initialValues = useMemo(() => {
    const o: Record<string, string> = {};
    for (const g of groups) for (const f of g.fields) o[f.key] = f.current;
    return o;
  }, [groups]);
  const defaults = useMemo(() => {
    const o: Record<string, string> = {};
    for (const g of groups) for (const f of g.fields) o[f.key] = f.default;
    return o;
  }, [groups]);

  const [values, setValues] = useState<Record<string, string>>(() => ({ ...initialValues }));
  const initialRef = useRef<Record<string, string>>({ ...initialValues });
  const dirtyRef = useRef<Set<string>>(new Set());
  const [dirtyCount, setDirtyCount] = useState(0);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<string>>(() => new Set(openSection ? [openSection] : []));
  const [pending, startTransition] = useTransition();
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);

  const searching = query.trim().length > 0;
  const q = norm(query.trim());

  const setField = (key: string, v: string) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    if (v !== initialRef.current[key]) dirtyRef.current.add(key);
    else dirtyRef.current.delete(key);
    setDirtyCount(dirtyRef.current.size);
    setFlash(null);
  };

  const toggle = (key: string) =>
    setOpen((prev) => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });

  const filteredGroups = useMemo(() => {
    if (!searching) return groups;
    return groups
      .map((g) => {
        const groupHit = norm(g.label).includes(q);
        const fields = groupHit
          ? g.fields
          : g.fields.filter((f) => norm(values[f.key] ?? f.current).includes(q) || norm(f.label).includes(q));
        return { ...g, fields };
      })
      .filter((g) => g.fields.length > 0);
  }, [groups, searching, q, values]);

  const save = () => {
    const changes: ContentChange[] = [...dirtyRef.current].map((key) => ({
      locale,
      key,
      value: values[key] ?? "",
      isDefault: (values[key] ?? "") === defaults[key],
    }));
    if (changes.length === 0) return;
    startTransition(async () => {
      const res = await saveContent(changes);
      if (res.ok) {
        for (const key of dirtyRef.current) initialRef.current[key] = values[key] ?? "";
        dirtyRef.current.clear();
        setDirtyCount(0);
        setFlash({ ok: true, text: `S-au salvat ${res.count} modificări. Sunt live pe site.` });
      } else {
        setFlash({ ok: false, text: "Nu s-a putut salva. Încearcă din nou." });
      }
    });
  };

  const totalFields = groups.reduce((n, g) => n + g.fields.length, 0);

  return (
    <div className="pb-28">
      {/* Instrucțiuni */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h1 className="font-heading text-2xl font-semibold">Texte site</h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Aici schimbi orice text de pe site. <strong className="text-foreground">1.</strong> Alege limba.{" "}
          <strong className="text-foreground">2.</strong> Caută textul sau deschide o secțiune.{" "}
          <strong className="text-foreground">3.</strong> Scrie noul text.{" "}
          <strong className="text-foreground">4.</strong> Apasă <em>Salvează</em>. Modificările apar imediat pe site.
        </p>
      </div>

      {/* Limbă + căutare */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          {(["ro", "en"] as const).map((l) => (
            <a
              key={l}
              href={`/admin/continut?lang=${l}`}
              className={cn(
                "inline-flex min-h-11 items-center rounded-lg px-5 text-base font-semibold",
                locale === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              )}
            >
              {l === "ro" ? "Română" : "English"}
            </a>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Caută un text (ex. „Caut personal”)"
            className="h-13 w-full rounded-xl border border-input bg-card pl-11 pr-4 text-base outline-none focus:border-primary"
          />
        </div>
      </div>

      {dirtyCount > 0 && (
        <p className="mt-3 rounded-xl bg-brand-tint-2 px-4 py-3 text-base font-medium text-foreground">
          Ai {dirtyCount} {dirtyCount === 1 ? "modificare nesalvată" : "modificări nesalvate"}. Nu uita să apeși
          „Salvează". Dacă schimbi limba înainte de salvare, se pierd.
        </p>
      )}

      {/* Secțiuni */}
      <div className="mt-4 space-y-3">
        {filteredGroups.map((g) => {
          const isOpen = searching || open.has(g.key);
          return (
            <section key={g.key} className="overflow-hidden rounded-2xl border border-border bg-card">
              <button
                type="button"
                onClick={() => !searching && toggle(g.key)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-muted/50"
                aria-expanded={isOpen}
              >
                <span className="font-heading text-lg font-semibold">{g.label}</span>
                <span className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{g.fields.length} texte</span>
                  {!searching && (
                    <ChevronDown className={cn("size-5 text-muted-foreground transition-transform", isOpen && "rotate-180")} aria-hidden />
                  )}
                </span>
              </button>

              {isOpen && (
                <div className="space-y-5 border-t border-border px-5 py-5">
                  {g.fields.map((f) => {
                    const val = values[f.key] ?? f.current;
                    const dirty = val !== initialRef.current[f.key];
                    const changedFromDefault = val !== f.default;
                    return (
                      <div key={f.key}>
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <label htmlFor={f.key} className="text-base font-medium text-foreground">
                            {f.label}
                            {dirty && <span className="ml-2 text-sm font-semibold text-primary">• modificat</span>}
                          </label>
                          {changedFromDefault && (
                            <button
                              type="button"
                              onClick={() => setField(f.key, f.default)}
                              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                              title="Revino la textul original"
                            >
                              <RotateCcw className="size-4" aria-hidden />
                              Original
                            </button>
                          )}
                        </div>
                        {f.multiline ? (
                          <textarea
                            id={f.key}
                            value={val}
                            onChange={(e) => setField(f.key, e.target.value)}
                            rows={Math.min(8, Math.max(2, Math.ceil(val.length / 60)))}
                            className={cn(
                              "w-full rounded-xl border bg-background px-3.5 py-3 text-base leading-relaxed outline-none focus:border-primary",
                              dirty ? "border-primary" : "border-input"
                            )}
                          />
                        ) : (
                          <input
                            id={f.key}
                            type="text"
                            value={val}
                            onChange={(e) => setField(f.key, e.target.value)}
                            className={cn(
                              "h-12 w-full rounded-xl border bg-background px-3.5 text-base outline-none focus:border-primary",
                              dirty ? "border-primary" : "border-input"
                            )}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}

        {filteredGroups.length === 0 && (
          <p className="rounded-2xl border border-border bg-card p-6 text-base text-muted-foreground">
            Niciun text nu conține „{query}". Încearcă alt cuvânt.
          </p>
        )}
      </div>

      {/* Bară sticky de salvare */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0 text-base">
            {flash ? (
              <span className={cn("inline-flex items-center gap-2 font-medium", flash.ok ? "text-whatsapp" : "text-destructive")}>
                {flash.ok && <Check className="size-5" aria-hidden />}
                {flash.text}
              </span>
            ) : (
              <span className="text-muted-foreground">
                {totalFields} texte în limba {locale === "ro" ? "română" : "engleză"}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={save}
            disabled={dirtyCount === 0 || pending}
            className="inline-flex h-13 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-lg font-semibold text-primary-foreground disabled:opacity-50"
          >
            {pending && <Loader2 className="size-5 animate-spin" aria-hidden />}
            {pending ? "Se salvează..." : dirtyCount > 0 ? `Salvează (${dirtyCount})` : "Salvează"}
          </button>
        </div>
      </div>
    </div>
  );
}
