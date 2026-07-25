"use server";

import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { notifyOffice } from "@/lib/notify";
import { buildCvPdf, type CvData } from "@/lib/pdf/cv-pdf";

/** Ca ApplyState, dar întoarce și CV-ul generat (base64) ca să-l descarce candidatul. */
export type CvApplyState = { status: "idle" | "success" | "error"; pdf?: string };

const clean = (v: FormDataEntryValue | null, max = 200) => String(v ?? "").trim().slice(0, max);
const list = (fd: FormData, key: string, max = 120, cap = 20) =>
  fd.getAll(key).map((v) => String(v).trim().slice(0, max)).filter(Boolean).slice(0, cap);

/** Primește datele din formularul de CV, generează un PDF și îl salvează ca aplicare. */
export async function submitCvApplication(
  _prev: CvApplyState,
  formData: FormData
): Promise<CvApplyState> {
  try {
    // honeypot anti-spam
    if (String(formData.get("website") ?? "") !== "") return { status: "success" };

    const name = clean(formData.get("name"), 200);
    const phone = clean(formData.get("phone"), 50);
    const trade = clean(formData.get("trade"), 120);
    const locale = String(formData.get("locale") ?? "ro") === "en" ? "en" : "ro";
    const jobId = clean(formData.get("jobId"), 100);

    // minim absolut: nume + telefon + meserie
    if (!name || !phone || !trade) return { status: "error" };

    if (!(await rateLimit("apply-cv", { limit: 3, windowMs: 60_000 }))) {
      return { status: "error" };
    }

    // experiență: câmpuri repetabile, zipuite pe index
    const roles = formData.getAll("exp_role").map(String);
    const companies = formData.getAll("exp_company").map(String);
    const periods = formData.getAll("exp_period").map(String);
    const experience = roles
      .map((role, i) => ({
        role: role.trim().slice(0, 160),
        company: (companies[i] ?? "").toString().trim().slice(0, 160),
        period: (periods[i] ?? "").toString().trim().slice(0, 60),
      }))
      .filter((e) => e.role || e.company)
      .slice(0, 12);

    const data: CvData = {
      name,
      trade,
      years: clean(formData.get("years"), 30) || undefined,
      phone,
      email: clean(formData.get("email"), 320) || undefined,
      city: clean(formData.get("city"), 120) || undefined,
      about: clean(formData.get("about"), 600) || undefined,
      experience,
      // câmpuri libere: limitele trebuie să acopere un text scris de om, nu o etichetă scurtă
      licenses: list(formData, "license", 120, 8),
      machines: list(formData, "machine", 300, 20),
      certifications: String(formData.get("certs_raw") ?? "")
        .split("\n")
        .map((s) => s.trim().slice(0, 160))
        .filter(Boolean)
        .slice(0, 20),
      languages: list(formData, "lang", 200, 12),
      availability: clean(formData.get("availability"), 80) || undefined,
      schedule: clean(formData.get("schedule"), 80) || undefined,
      mobility: clean(formData.get("mobility"), 120) || undefined,
    };

    const pdf = await buildCvPdf(data, locale);
    if (pdf.length > 2_000_000) return { status: "error" }; // plafon defensiv

    const supabase = await createClient();

    // upload în bucketul privat, cu prefix marker „cv-completat/"
    const path = `cv-completat/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("fw-cvs")
      .upload(path, Buffer.from(pdf), { contentType: "application/pdf" });
    if (uploadError) return { status: "error" };

    const { error } = await supabase.from("fw_applications").insert({
      job_id: jobId && !jobId.startsWith("static-") ? jobId : null,
      name,
      phone,
      email: data.email ?? null,
      message: `CV completat pe site — ${trade}`,
      cv_path: path,
      locale,
    });
    if (error) return { status: "error" };

    await notifyOffice(
      "Aplicare nouă — CV completat pe site",
      [
        `<strong>${name}</strong> (${trade}) și-a completat CV-ul pe site.`,
        `Telefon: <a href="tel:${phone}">${phone}</a>`,
        data.email ? `Email: ${data.email}` : "",
        "CV-ul generat îl găsești în admin, la Aplicări.",
      ].filter(Boolean)
    );

    // întoarce PDF-ul (base64) ca să-l poată descărca și candidatul
    return { status: "success", pdf: Buffer.from(pdf).toString("base64") };
  } catch {
    return { status: "error" };
  }
}
