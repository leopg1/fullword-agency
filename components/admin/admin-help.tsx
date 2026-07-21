import { Lightbulb } from "lucide-react";

/** Casetă scurtă de ajutor, în limbaj simplu, sus pe fiecare pagină de admin. */
export function AdminHelp({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex gap-3 rounded-2xl border border-brand/25 bg-brand-tint-2 p-4">
      <Lightbulb className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
      <div className="space-y-1 text-base leading-relaxed text-foreground">{children}</div>
    </div>
  );
}
