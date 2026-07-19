"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(false);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (error) {
      setError(true);
      setPending(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-5">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-7 shadow-lg">
        <div className="flex items-center gap-2.5">
          <Image src="/images/brand/logo-sky.png" alt="" width={36} height={36} />
          <span className="font-heading text-lg font-semibold">Admin Full Work</span>
        </div>
        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-base">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" className="h-12 text-base" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-base">Parolă</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" className="h-12 text-base" />
          </div>
          {error && (
            <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-base font-medium text-destructive">
              Email sau parolă greșite.
            </p>
          )}
          <Button type="submit" disabled={pending} className="h-12 w-full rounded-xl text-base font-semibold">
            {pending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <LogIn className="size-5" aria-hidden />}
            Intră în cont
          </Button>
        </form>
      </div>
    </main>
  );
}
