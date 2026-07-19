"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import type { SaveState } from "@/app/admin/actions";

/**
 * Wrapper de formular pentru admin. La succes, acțiunea de pe server face
 * `redirect()` (o singură navigare) — NU folosim router.push + router.refresh,
 * care declanșau două GET-uri concurente prin middleware și o cursă pe
 * refresh-token-ul single-use al Supabase → sesiunea era invalidată (logout).
 * `useActionState` rămâne doar pentru starea „pending" și mesajul de eroare.
 */
export function SaveForm({
  action,
  submitLabel,
  children,
}: {
  action: (prev: SaveState | null, formData: FormData) => Promise<SaveState>;
  submitLabel: string;
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-5">
      {children}

      {state && !state.ok && (
        <p role="alert" className="rounded-xl bg-destructive/10 p-3.5 text-base font-medium text-destructive">
          Nu s-a putut salva. Verifică titlul (RO + EN) și slug-ul, apoi încearcă din nou.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-primary px-10 text-lg font-semibold text-primary-foreground disabled:opacity-60"
      >
        {pending && <Loader2 className="size-5 animate-spin" aria-hidden />}
        {pending ? "Se salvează..." : submitLabel}
      </button>
    </form>
  );
}
