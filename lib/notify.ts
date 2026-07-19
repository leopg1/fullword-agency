import { site } from "@/lib/site";

/**
 * Notificare pe email către office@ la aplicare/lead nou, prin Resend.
 * Fire-and-forget: dacă RESEND_API_KEY lipsește sau apelul eșuează,
 * inserarea în baza de date rămâne valabilă (clienta vede tot în /admin).
 * Setup: RESEND_API_KEY în .env.local + domeniu verificat în Resend.
 */
export async function notifyOffice(subject: string, lines: string[]) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:15px;color:#0f172a">
      ${lines.map((l) => `<p style="margin:0 0 8px">${l}</p>`).join("")}
      <p style="margin:16px 0 0">
        <a href="${site.url}/admin" style="color:#0369a1">Deschide panoul de admin →</a>
      </p>
    </div>`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.NOTIFY_FROM ?? "Full Work Site <onboarding@resend.dev>",
        to: [site.email],
        subject,
        html,
      }),
    });
  } catch {
    // notificarea nu blochează niciodată fluxul principal
  }
}
