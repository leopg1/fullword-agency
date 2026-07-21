import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { DEJAVU_BOLD_B64, DEJAVU_REGULAR_B64 } from "@/lib/pdf/fonts";

export type CvExperience = { role: string; company: string; period: string };

export type CvData = {
  name: string;
  trade: string; // meseria (titlu)
  years?: string; // ani experiență
  phone: string;
  email?: string;
  city?: string;
  about?: string;
  experience: CvExperience[];
  licenses: string[]; // categorii permis
  machines: string[]; // utilaje
  certifications: string[];
  languages: string[]; // ex. "Engleză — Bine"
  availability?: string;
  schedule?: string;
  mobility?: string;
};

type Locale = "ro" | "en";

const L: Record<Locale, Record<string, string>> = {
  ro: {
    about: "Despre mine",
    experience: "Experiență de muncă",
    licenses: "Permis de conducere",
    machines: "Utilaje pe care le operez",
    certifications: "Calificări și autorizații",
    languages: "Limbi străine",
    availability: "Disponibilitate",
    availableFrom: "Pot începe:",
    schedule: "Program:",
    mobility: "Deplasare:",
    footer: "CV generat pe site — Full Work Services",
    yearsExp: "ani experiență",
  },
  en: {
    about: "About me",
    experience: "Work experience",
    licenses: "Driving licence",
    machines: "Machinery I operate",
    certifications: "Qualifications & certificates",
    languages: "Languages",
    availability: "Availability",
    availableFrom: "Can start:",
    schedule: "Schedule:",
    mobility: "Travel:",
    footer: "CV created online — Full Work Services",
    yearsExp: "years of experience",
  },
};

const BRAND = rgb(14 / 255, 165 / 255, 233 / 255); // #0EA5E9
const BRAND_DARK = rgb(3 / 255, 105 / 255, 161 / 255); // #0369A1
const INK = rgb(15 / 255, 23 / 255, 42 / 255); // #0F172A
const MUTED = rgb(71 / 255, 85 / 255, 105 / 255); // #475569
const PILL_BG = rgb(224 / 255, 242 / 255, 254 / 255); // #E0F2FE
const HAIRLINE = rgb(226 / 255, 232 / 255, 240 / 255); // #E2E8F0

/**
 * Normalizează textul înainte de desen: NFC + convertește sedila (ş/ţ) în
 * varianta cu virgulă (ș/ț), corectă pentru română, indiferent cum a tastat omul.
 */
function norm(s: string): string {
  if (!s) return "";
  return s
    .normalize("NFC")
    .replace(/Ş/g, "Ș") // Ş → Ș
    .replace(/ş/g, "ș") // ş → ș
    .replace(/Ţ/g, "Ț") // Ţ → Ț
    .replace(/ţ/g, "ț") // ţ → ț
    .replace(/[\u0000-\u001f]/g, " ") // caractere de control → spațiu
    .trim();
}

const A4 = { w: 595.28, h: 841.89 };
const M = 48; // margine
const CW = A4.w - M * 2; // lățime conținut

/** Împarte un text pe linii care încap în lățimea dată. */
function wrap(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const words = norm(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const word of words) {
    const test = cur ? `${cur} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) <= maxW || !cur) {
      cur = test;
    } else {
      lines.push(cur);
      cur = word;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

export async function buildCvPdf(data: CvData, locale: Locale = "ro"): Promise<Uint8Array> {
  const t = L[locale];
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const reg = await doc.embedFont(Buffer.from(DEJAVU_REGULAR_B64, "base64"), { subset: true });
  const bold = await doc.embedFont(Buffer.from(DEJAVU_BOLD_B64, "base64"), { subset: true });

  doc.setTitle(`CV ${norm(data.name)}`);
  doc.setCreator("Full Work Services");

  let page = doc.addPage([A4.w, A4.h]);
  let y = A4.h - M;

  /** Trece pe pagină nouă dacă nu mai e loc de `needed` puncte. */
  const ensure = (needed: number) => {
    if (y - needed < M) {
      page = doc.addPage([A4.w, A4.h]);
      y = A4.h - M;
    }
  };

  const line = (
    text: string,
    opts: { size?: number; font?: PDFFont; color?: typeof INK; x?: number; gap?: number } = {}
  ) => {
    const size = opts.size ?? 10.5;
    const font = opts.font ?? reg;
    ensure(size + (opts.gap ?? 4));
    page.drawText(norm(text), { x: opts.x ?? M, y: y - size, size, font, color: opts.color ?? INK });
    y -= size + (opts.gap ?? 4);
  };

  const paragraph = (text: string, size = 10.5, color = MUTED) => {
    for (const ln of wrap(text, reg, size, CW)) {
      ensure(size + 4);
      page.drawText(ln, { x: M, y: y - size, size, font: reg, color });
      y -= size + 4;
    }
  };

  const heading = (text: string) => {
    y -= 12;
    ensure(24);
    page.drawText(norm(text).toUpperCase(), {
      x: M,
      y: y - 11,
      size: 11,
      font: bold,
      color: BRAND_DARK,
    });
    y -= 16;
    page.drawRectangle({ x: M, y: y + 2, width: CW, height: 1, color: HAIRLINE });
    y -= 8;
  };

  // ---- Antet: nume + meserie + telefon ----
  line(data.name, { size: 26, font: bold, color: INK, gap: 4 });
  // `years` e deja o frază completă din chip (ex. „Peste 10 ani" / „Over 10 years")
  const tradeLine = [norm(data.trade), data.years ? norm(data.years) : ""]
    .filter(Boolean)
    .join(" · ");
  if (tradeLine) line(tradeLine, { size: 13.5, font: bold, color: BRAND_DARK, gap: 8 });

  // Telefon mare (angajatorii de muncitori sună)
  ensure(20);
  const telLabel = locale === "ro" ? "Telefon: " : "Phone: ";
  const labelW = reg.widthOfTextAtSize(telLabel, 12);
  page.drawText(telLabel, { x: M, y: y - 16, size: 12, font: reg, color: MUTED });
  page.drawText(norm(data.phone), { x: M + labelW, y: y - 16, size: 16, font: bold, color: INK });
  y -= 20;
  const contact = [data.city ? norm(data.city) : "", data.email ? norm(data.email) : ""]
    .filter(Boolean)
    .join("  ·  ");
  if (contact) line(contact, { size: 10.5, color: MUTED, gap: 6 });

  // Bandă accent sub antet
  y -= 2;
  page.drawRectangle({ x: M, y: y, width: CW, height: 3, color: BRAND });
  y -= 14;

  // ---- Rând de atuuri (badge-uri) ----
  const badges: string[] = [];
  if (data.years) badges.push(norm(data.years));
  if (data.licenses.length) badges.push(`${t.licenses}: ${data.licenses.map(norm).join(", ")}`);
  if (data.availability) badges.push(norm(data.availability));
  if (badges.length) {
    drawPills(page, badges, y, reg, bold);
    // estimează înălțimea rândurilor de pill-uri
    y -= pillsHeight(badges, reg) + 6;
  }

  // ---- Despre ----
  if (data.about) {
    heading(t.about);
    paragraph(data.about, 10.5, INK);
  }

  // ---- Experiență ----
  const exp = data.experience.filter((e) => e.role || e.company);
  if (exp.length) {
    heading(t.experience);
    for (const e of exp) {
      ensure(28);
      const title = [norm(e.role), norm(e.company)].filter(Boolean).join(" — ");
      for (const ln of wrap(title, bold, 11, CW - 90)) {
        page.drawText(ln, { x: M, y: y - 11, size: 11, font: bold, color: INK });
        y -= 15;
      }
      if (e.period) {
        // perioada, discret sub titlu
        page.drawText(norm(e.period), { x: M, y: y - 9, size: 9.5, font: reg, color: MUTED });
        y -= 14;
      }
      y -= 4;
    }
  }

  // ---- Calificări / utilaje ----
  if (data.certifications.length) {
    heading(t.certifications);
    for (const c of data.certifications) bullet(c);
  }
  if (data.machines.length) {
    heading(t.machines);
    paragraph(data.machines.map(norm).join(", "), 10.5, INK);
  }

  // ---- Limbi ----
  if (data.languages.length) {
    heading(t.languages);
    paragraph(data.languages.map(norm).join("   ·   "), 10.5, INK);
  }

  // ---- Disponibilitate ----
  if (data.availability || data.schedule || data.mobility) {
    heading(t.availability);
    if (data.availability) line(`${t.availableFrom} ${norm(data.availability)}`, { size: 10.5, color: INK, gap: 3 });
    if (data.schedule) line(`${t.schedule} ${norm(data.schedule)}`, { size: 10.5, color: INK, gap: 3 });
    if (data.mobility) line(`${t.mobility} ${norm(data.mobility)}`, { size: 10.5, color: INK, gap: 3 });
  }

  // ---- Footer pe fiecare pagină ----
  const stamp = `${t.footer} · ${new Date().toLocaleDateString(locale === "ro" ? "ro-RO" : "en-GB")}`;
  for (const p of doc.getPages()) {
    p.drawText(stamp, { x: M, y: M - 18, size: 8, font: reg, color: MUTED });
  }

  function bullet(text: string) {
    const size = 10.5;
    const lines = wrap(text, reg, size, CW - 14);
    ensure(lines.length * (size + 3));
    page.drawText("•", { x: M, y: y - size, size, font: bold, color: BRAND });
    lines.forEach((ln, i) => {
      page.drawText(ln, { x: M + 14, y: y - size, size, font: reg, color: INK });
      y -= size + 3;
      if (i < lines.length - 1) {
        /* liniile următoare aliniate sub prima */
      }
    });
  }

  return doc.save();
}

/** Înălțimea estimată a rândului de pill-uri (pentru avans y). */
function pillsHeight(items: string[], font: PDFFont): number {
  const size = 9.5;
  let x = 0;
  let rows = 1;
  for (const it of items) {
    const w = font.widthOfTextAtSize(norm(it), size) + 20;
    if (x + w > CW) {
      rows++;
      x = 0;
    }
    x += w + 6;
  }
  return rows * 24;
}

/** Desenează pill-uri (badge-uri) pe unul sau mai multe rânduri. */
function drawPills(page: PDFPage, items: string[], topY: number, font: PDFFont, _bold: PDFFont) {
  const size = 9.5;
  const h = 18;
  let x = M;
  let rowY = topY - h;
  for (const raw of items) {
    const text = norm(raw);
    const w = font.widthOfTextAtSize(text, size) + 20;
    if (x + w > M + CW) {
      x = M;
      rowY -= 24;
    }
    page.drawRectangle({ x, y: rowY, width: w, height: h, color: PILL_BG, borderColor: BRAND, borderWidth: 0.5 });
    page.drawText(text, { x: x + 10, y: rowY + 5, size, font, color: BRAND_DARK });
    x += w + 6;
  }
}
