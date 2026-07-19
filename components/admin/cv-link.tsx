"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { getCvUrl } from "@/app/admin/actions";

/** Buton care generează un link semnat și deschide CV-ul din bucket-ul privat. */
export function CvLink({ path }: { path: string }) {
  const [pending, setPending] = useState(false);

  async function open() {
    setPending(true);
    const url = await getCvUrl(path);
    setPending(false);
    if (url) window.open(url, "_blank", "noopener");
  }

  return (
    <button
      type="button"
      onClick={open}
      disabled={pending}
      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-base font-semibold text-primary hover:border-primary"
    >
      {pending ? (
        <Loader2 className="size-4.5 animate-spin" aria-hidden />
      ) : (
        <FileDown className="size-4.5" aria-hidden />
      )}
      CV
    </button>
  );
}
