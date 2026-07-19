import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase FĂRĂ cookies — pentru citirile publice din Server Components.
 * Nu atinge sesiunea, deci paginile rămân statice (ISR), nu devin dinamice.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
