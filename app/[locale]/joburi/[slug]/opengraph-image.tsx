import { ImageResponse } from "next/og";
import { getJobBySlug } from "@/lib/jobs";
import { countryInfo } from "@/lib/jobs-data";
import { cityLabel } from "@/lib/geo";

/**
 * Cardul care apare când jobul e dat share pe Facebook/WhatsApp.
 * Se generează automat pentru fiecare job — titlu, oraș, salariu — deci
 * fiecare anunț arată ca un afiș brandat, fără muncă manuală.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Full Work Services — job deschis";

const BRAND = "#0EA5E9";
const DARK = "#0F172A";
const MUTED = "#475569";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const ro = locale !== "en";
  const job = await getJobBySlug(slug);

  const title = job ? (ro ? job.title_ro : job.title_en) : "Full Work Services";
  const salary = job ? (ro ? job.salary_ro : job.salary_en) : null;
  const city = job ? cityLabel(job.city, locale) : "";
  const country = job ? countryInfo(job.country_code)[ro ? "ro" : "en"] : "";
  const place = [city, country && country !== city ? country : null].filter(Boolean).join(", ");

  // titlurile foarte lungi se micșorează ca să încapă frumos
  const titleSize = title.length > 52 ? 62 : title.length > 34 ? 76 : 92;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Antet: marca */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", width: 20, height: 56, backgroundColor: BRAND, borderRadius: 6 }} />
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: DARK, letterSpacing: -0.5 }}>
            Full Work Services
          </div>
        </div>

        {/* Titlul jobului */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 600,
              color: BRAND,
              textTransform: "uppercase",
              letterSpacing: 3,
            }}
          >
            {ro ? "Job deschis" : "Open position"}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: titleSize,
              fontWeight: 700,
              color: DARK,
              lineHeight: 1.1,
              letterSpacing: -1.5,
            }}
          >
            {title}
          </div>

          {/* Oraș + salariu */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            {place && (
              <div
                style={{
                  display: "flex",
                  fontSize: 30,
                  fontWeight: 600,
                  color: DARK,
                  backgroundColor: "#E0F2FE",
                  padding: "12px 26px",
                  borderRadius: 999,
                }}
              >
                {place}
              </div>
            )}
            {salary && (
              <div
                style={{
                  display: "flex",
                  fontSize: 30,
                  fontWeight: 600,
                  color: "#ffffff",
                  backgroundColor: "#0369A1",
                  padding: "12px 26px",
                  borderRadius: 999,
                }}
              >
                {salary}
              </div>
            )}
          </div>
        </div>

        {/* Subsol: argumente + bandă brand */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", fontSize: 28, color: MUTED }}>
            {ro
              ? "Contract oficial · Interviu în 24 de ore · Fără taxe pentru candidați"
              : "Official contract · Interview within 24h · No candidate fees"}
          </div>
          <div style={{ display: "flex", height: 12, backgroundColor: BRAND, borderRadius: 999 }} />
        </div>
      </div>
    ),
    size
  );
}
