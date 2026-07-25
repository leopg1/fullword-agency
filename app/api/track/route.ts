import { NextRequest, NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { detectSource, isBot, todayUtc, visitorHash } from "@/lib/analytics";

export const runtime = "nodejs";

/**
 * Înregistrează o vizită. Apelat din browser la fiecare schimbare de pagină.
 *
 * Nu stochează IP-uri și nu pune cookie-uri: din IP + browser + ziua curentă
 * se calculează un hash anonim, folosit doar ca să nu numărăm de zece ori
 * același om într-o zi. De aceea site-ul nu are nevoie de bandă de cookie-uri.
 * Nu blochează niciodată vizitatorul — orice eroare e înghițită în tăcere.
 */
export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get("user-agent");
    if (isBot(ua)) return NextResponse.json({ ok: true });

    const body = (await req.json()) as { path?: string; ref?: string; search?: string };
    const path = String(body.path ?? "").slice(0, 300);
    if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api")) {
      return NextResponse.json({ ok: true });
    }

    const day = todayUtc();
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "0.0.0.0";
    const host = req.headers.get("host") ?? "";
    const source = detectSource(body.ref ?? null, body.search ?? null, host);

    const supabase = createPublicClient();
    await supabase.from("fw_pageviews").insert({
      path,
      source,
      visitor: visitorHash(ip, ua ?? "", day),
      day,
    });

    // Curățenie rară (~1 din 200 de vizite): ștergem vizitele mai vechi de un an,
    // ca tabelul să nu crească la nesfârșit. Nu trebuie programat nimic.
    if (Math.random() < 0.005) {
      await supabase.rpc("fw_pageviews_cleanup");
    }
  } catch {
    // statisticile nu au voie să strice experiența vizitatorului
  }
  return NextResponse.json({ ok: true });
}
