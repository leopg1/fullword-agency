import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin", label: "Joburi" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/continut", label: "Texte site" },
  { href: "/admin/aplicari", label: "Aplicări" },
  { href: "/admin/leaduri", label: "Mesaje" },
];

/** Cadrul comun al adminului: bară sus + taburi mari (mobile-first). */
export function AdminShell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-5xl px-4 pb-16">
      <header className="flex items-center justify-between py-4">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/images/brand/logo-sky.png" alt="" width={32} height={32} />
          <span className="font-heading text-base font-semibold">Admin Full Work</span>
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-base font-medium text-muted-foreground hover:bg-card hover:text-foreground"
          >
            <LogOut className="size-4.5" aria-hidden />
            Ieși
          </button>
        </form>
      </header>

      <nav aria-label="Secțiuni admin" className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex min-h-12 shrink-0 items-center rounded-xl px-5 text-base font-semibold",
              active === href
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:bg-brand-tint-2"
            )}
            aria-current={active === href ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-5">{children}</div>
    </div>
  );
}
