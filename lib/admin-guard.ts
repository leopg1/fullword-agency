import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Verifică pe server că utilizatorul curent e în allowlist-ul fw_admins.
 * Se apelează la începutul fiecărei pagini de admin (nu pe /admin/login).
 *
 * Folosește DOAR rpc(fw_is_admin) — NU getUser() — ca să nu declanșeze un al
 * doilea refresh de token în același request cu middleware-ul (cursa de
 * refresh-token single-use ștergea sesiunea la acțiunile cu redirect).
 * Dacă sesiunea e invalidă, auth.uid() e null → fw_is_admin() = false → login.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: isAdmin, error } = await supabase.rpc("fw_is_admin");
  if (error || !isAdmin) redirect("/admin/login");
}
