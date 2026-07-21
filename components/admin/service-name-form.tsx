"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { renameService } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

/**
 * Redenumirea unui serviciu, direct din lista de servicii.
 * Salvează în aceeași sursă ca „Texte site", deci numele rămâne sincronizat
 * între cele două ecrane (card din grilă + link din subsol).
 */
export function ServiceNameForm({
  serviceKey,
  nameRo,
  nameEn,
}: {
  serviceKey: string;
  nameRo: string;
  nameEn: string;
}) {
  const [ro, setRo] = useState(nameRo);
  const [en, setEn] = useState(nameEn);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  const dirty = ro.trim() !== nameRo || en.trim() !== nameEn;
  const valid = ro.trim().length > 0 && en.trim().length > 0;

  const save = () => {
    if (!dirty || !valid) return;
    setError(false);
    startTransition(async () => {
      const res = await renameService(serviceKey, ro, en);
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      } else {
        setError(true);
      }
    });
  };

  const input =
    "h-11 w-full rounded-xl border bg-background px-3 text-base outline-none focus:border-primary";

  return (
    <div className="grid gap-2.5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-muted-foreground">Nume (română)</span>
        <input
          type="text"
          value={ro}
          onChange={(e) => {
            setRo(e.target.value);
            setSaved(false);
          }}
          className={cn(input, dirty ? "border-primary" : "border-input")}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-muted-foreground">Nume (engleză)</span>
        <input
          type="text"
          value={en}
          onChange={(e) => {
            setEn(e.target.value);
            setSaved(false);
          }}
          className={cn(input, dirty ? "border-primary" : "border-input")}
        />
      </label>

      <button
        type="button"
        onClick={save}
        disabled={!dirty || !valid || pending}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-base font-semibold",
          saved
            ? "bg-whatsapp/10 text-whatsapp"
            : "bg-primary text-primary-foreground disabled:opacity-40"
        )}
      >
        {pending && <Loader2 className="size-4.5 animate-spin" aria-hidden />}
        {saved && !pending && <Check className="size-4.5" aria-hidden />}
        {pending ? "Se salvează..." : saved ? "Salvat" : "Salvează numele"}
      </button>

      {error && (
        <p role="alert" className="text-base font-medium text-destructive sm:col-span-3">
          Nu s-a putut salva. Verifică să nu fie gol și încearcă din nou.
        </p>
      )}
    </div>
  );
}
