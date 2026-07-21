import { ArrowDown, ArrowUp, Eye, EyeOff, FileText } from "lucide-react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { ServiceNameForm } from "@/components/admin/service-name-form";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin-guard";
import { defaultMessage, getContentOverrides } from "@/lib/content";
import { getAllServices, serviceNameKeys } from "@/lib/services";
import { moveService, toggleServicePublished } from "@/app/admin/actions";
import { cn } from "@/lib/utils";
import roMessages from "@/messages/ro.json";
import enMessages from "@/messages/en.json";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  await requireAdmin();
  const services = await getAllServices();
  const [roOverrides, enOverrides] = await Promise.all([
    getContentOverrides("ro"),
    getContentOverrides("en"),
  ]);

  /** Numele curent = suprascrierea din admin, altfel textul implicit. */
  const nameFor = (def: { key: string; footerKey: string }, locale: "ro" | "en") => {
    const [gridKey] = serviceNameKeys(def);
    const overrides = locale === "ro" ? roOverrides : enOverrides;
    const messages = (locale === "ro" ? roMessages : enMessages) as Record<string, unknown>;
    return overrides[gridKey] ?? defaultMessage(messages, gridKey) ?? def.key;
  };

  return (
    <AdminShell active="/admin/servicii">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h1 className="font-heading text-2xl font-semibold">Servicii</h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Schimbă numele serviciilor, alege care apar pe site și în ce ordine. Numele se modifică
          peste tot: în lista de servicii și în subsolul site-ului. Un serviciu ascuns dispare de pe
          site, iar pagina lui nu mai poate fi deschisă.
        </p>
      </div>

      <ul className="mt-5 space-y-3">
        {services.map((s, i) => (
          <li
            key={s.key}
            className={cn(
              "space-y-4 rounded-2xl border bg-card p-4 sm:p-5",
              s.published ? "border-border" : "border-dashed border-border opacity-75"
            )}
          >
            {/* Nume editabil (RO + EN) */}
            <div className="flex items-start gap-3">
              <span className="mt-7 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-base font-semibold text-muted-foreground">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <ServiceNameForm
                  serviceKey={s.key}
                  nameRo={nameFor(s, "ro")}
                  nameEn={nameFor(s, "en")}
                />
              </div>
            </div>

            {/* Ordine, vizibilitate, restul textelor */}
            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3.5">
              <form
                action={async () => {
                  "use server";
                  await moveService(s.key, "up");
                }}
              >
                <button
                  type="submit"
                  disabled={i === 0}
                  aria-label="Mută mai sus"
                  title="Mută mai sus"
                  className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-background text-foreground hover:bg-muted disabled:opacity-40"
                >
                  <ArrowUp className="size-5" aria-hidden />
                </button>
              </form>
              <form
                action={async () => {
                  "use server";
                  await moveService(s.key, "down");
                }}
              >
                <button
                  type="submit"
                  disabled={i === services.length - 1}
                  aria-label="Mută mai jos"
                  title="Mută mai jos"
                  className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-background text-foreground hover:bg-muted disabled:opacity-40"
                >
                  <ArrowDown className="size-5" aria-hidden />
                </button>
              </form>

              <form
                action={async () => {
                  "use server";
                  await toggleServicePublished(s.key, s.published);
                }}
              >
                <button
                  type="submit"
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-base font-semibold",
                    s.published
                      ? "border-whatsapp/40 bg-whatsapp/10 text-whatsapp"
                      : "border-border bg-muted text-muted-foreground"
                  )}
                >
                  {s.published ? <Eye className="size-5" aria-hidden /> : <EyeOff className="size-5" aria-hidden />}
                  {s.published ? "Vizibil pe site" : "Ascuns"}
                </button>
              </form>

              <Button
                asChild
                variant="outline"
                className="ml-auto h-11 rounded-xl px-4 text-base font-semibold"
              >
                <Link href={`/admin/continut?sectiune=${s.namespace}`}>
                  <FileText className="size-4.5" aria-hidden />
                  Restul textelor
                </Link>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
