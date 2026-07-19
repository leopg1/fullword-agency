"use server";

import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { notifyOffice } from "@/lib/notify";

export type LeadState = { status: "idle" | "success" | "error" };

/** Salvează mesajul de contact / cererea de ofertă în fw_leads. */
export async function submitLead(
  _prev: LeadState,
  formData: FormData
): Promise<LeadState> {
  try {
    // honeypot anti-spam
    if (String(formData.get("website") ?? "") !== "") return { status: "success" };

    const name = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const company = String(formData.get("company") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const type = formData.get("type") === "company_offer" ? "company_offer" : "contact";
    const locale = String(formData.get("locale") ?? "ro");

    if (!name || !phone || name.length > 200 || phone.length > 50) {
      return { status: "error" };
    }
    if (email.length > 320 || company.length > 200 || message.length > 2000) {
      return { status: "error" };
    }
    if (!(await rateLimit("lead", { limit: 5, windowMs: 60_000 }))) {
      return { status: "error" };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("fw_leads").insert({
      type,
      name,
      phone,
      email: email || null,
      company: company || null,
      message: message || null,
      locale,
    });
    if (error) return { status: "error" };

    await notifyOffice(
      type === "company_offer" ? "Cerere de ofertă nouă pe site" : "Mesaj nou pe site",
      [
        `<strong>${name}</strong>${company ? ` — ${company}` : ""}`,
        `Telefon: <a href="tel:${phone}">${phone}</a>`,
        email ? `Email: ${email}` : "",
        message ? `Mesaj: ${message}` : "",
      ].filter(Boolean)
    );
    return { status: "success" };
  } catch {
    return { status: "error" };
  }
}
