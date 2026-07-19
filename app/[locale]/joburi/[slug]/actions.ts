"use server";

import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { notifyOffice } from "@/lib/notify";

export type ApplyState = { status: "idle" | "success" | "error" };

const MAX_CV_BYTES = 5 * 1024 * 1024;
const CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/** Primește aplicarea (nume, telefon, CV opțional) și o salvează în fw_applications. */
export async function submitApplication(
  _prev: ApplyState,
  formData: FormData
): Promise<ApplyState> {
  try {
    const name = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const jobId = String(formData.get("jobId") ?? "").trim();
    const locale = String(formData.get("locale") ?? "ro");
    // honeypot anti-spam: câmp invizibil care trebuie să rămână gol
    if (String(formData.get("website") ?? "") !== "") return { status: "success" };
    if (!name || !phone || name.length > 200 || phone.length > 50) {
      return { status: "error" };
    }
    if (email.length > 320 || message.length > 2000) return { status: "error" };
    if (!(await rateLimit("apply", { limit: 5, windowMs: 60_000 }))) {
      return { status: "error" };
    }

    const supabase = await createClient();

    let cvPath: string | null = null;
    const cv = formData.get("cv");
    if (cv instanceof File && cv.size > 0) {
      if (cv.size > MAX_CV_BYTES || !CV_TYPES.includes(cv.type)) {
        return { status: "error" };
      }
      const ext = cv.name.split(".").pop()?.toLowerCase() ?? "pdf";
      const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("fw-cvs")
        .upload(path, cv, { contentType: cv.type });
      if (uploadError) return { status: "error" };
      cvPath = path;
    }

    const { error } = await supabase.from("fw_applications").insert({
      job_id: jobId && !jobId.startsWith("static-") ? jobId : null,
      name,
      phone,
      email: email || null,
      message: message || null,
      cv_path: cvPath,
      locale,
    });
    if (error) return { status: "error" };

    await notifyOffice("Aplicare nouă pe site", [
      `<strong>${name}</strong> a aplicat la un job.`,
      `Telefon: <a href="tel:${phone}">${phone}</a>`,
      email ? `Email: ${email}` : "",
      cvPath ? "CV atașat — îl găsești în admin." : "Fără CV atașat.",
    ].filter(Boolean));

    return { status: "success" };
  } catch {
    return { status: "error" };
  }
}
