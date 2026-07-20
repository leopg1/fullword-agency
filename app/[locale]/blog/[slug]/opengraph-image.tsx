import { ImageResponse } from "next/og";
import { getPostBySlug, categoryLabel } from "@/lib/posts";

/**
 * Cardul de share pentru articole.
 * Generat ca PNG intenționat: coperțile articolelor sunt .webp, iar Facebook
 * nu randează WebP în previzualizări — cardul ar apărea gol.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Full Work Services — articol";

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
  const post = await getPostBySlug(slug);

  const title = post ? (ro ? post.title_ro : post.title_en) : "Full Work Services";
  const excerpt = post ? (ro ? post.excerpt_ro : post.excerpt_en) : "";
  const category = post ? categoryLabel(post.category, ro ? "ro" : "en") : "";

  const titleSize = title.length > 70 ? 54 : title.length > 45 ? 64 : 76;
  const shortExcerpt = excerpt && excerpt.length > 150 ? `${excerpt.slice(0, 147)}…` : excerpt;

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

        {/* Categorie + titlu + rezumat */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {category && (
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
              {category}
            </div>
          )}
          <div
            style={{
              display: "flex",
              fontSize: titleSize,
              fontWeight: 700,
              color: DARK,
              lineHeight: 1.12,
              letterSpacing: -1.2,
            }}
          >
            {title}
          </div>
          {shortExcerpt && (
            <div style={{ display: "flex", fontSize: 28, color: MUTED, lineHeight: 1.4 }}>{shortExcerpt}</div>
          )}
        </div>

        {/* Subsol */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", fontSize: 26, color: MUTED }}>
            {ro ? "Ghiduri despre muncă, angajări și acte" : "Guides on work, hiring and paperwork"}
          </div>
          <div style={{ display: "flex", height: 12, backgroundColor: BRAND, borderRadius: 999 }} />
        </div>
      </div>
    ),
    size
  );
}
