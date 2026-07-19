import { headers } from "next/headers";

/**
 * Rate limiting simplu, în memorie, per IP + acțiune (fereastră fixă).
 * Pe serverless e per-instanță — nu perfect, dar taie spam-ul naiv;
 * combinat cu honeypot-ul din formulare acoperă abuzul obișnuit.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  action: string,
  { limit = 5, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {}
): Promise<boolean> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown";
  const key = `${action}:${ip}`;
  const now = Date.now();

  // curățare ocazională ca să nu crească necontrolat
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}
