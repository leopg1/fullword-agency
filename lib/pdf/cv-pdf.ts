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
  languages: string[];
  availability?: string;
  schedule?: string;
  mobility?: string;
};

type Locale = "ro" | "en";

const L: Record<Locale, Record<string, string>> = {
  ro: {
    about: "Despre mine",
    experience: "Experiență de muncă",
    contact: "Contact",
    licenses: "Permis de conducere",
    machines: "Utilaje și echipamente",
    certifications: "Calificări și autorizații",
    languages: "Limbi străine",
    availability: "Disponibilitate",
    availableFrom: "Pot începe",
    schedule: "Program",
    mobility: "Deplasare",
    phone: "Telefon",
    email: "Email",
    city: "Localitate",
    footer: "CV întocmit prin Full Work Services",
    page: "Pagina",
  },
  en: {
    about: "About me",
    experience: "Work experience",
    contact: "Contact",
    licenses: "Driving licence",
    machines: "Machinery & equipment",
    certifications: "Qualifications & certificates",
    languages: "Languages",
    availability: "Availability",
    availableFrom: "Can start",
    schedule: "Schedule",
    mobility: "Travel",
    phone: "Phone",
    email: "Email",
    city: "Location",
    footer: "CV created via Full Work Services",
    page: "Page",
  },
};

/* Paletă — aceleași culori ca site-ul */
const BRAND = rgb(14 / 255, 165 / 255, 233 / 255); // #0EA5E9
const BRAND_LIGHT = rgb(125 / 255, 211 / 255, 252 / 255); // #7DD3FC
const HEADER_BG = rgb(12 / 255, 42 / 255, 66 / 255); // bleumarin profund
const INK = rgb(15 / 255, 23 / 255, 42 / 255); // #0F172A
const MUTED = rgb(90 / 255, 103 / 255, 120 / 255);
const SIDEBAR_BG = rgb(243 / 255, 248 / 255, 252 / 255); // tentă foarte deschisă
const HAIRLINE = rgb(214 / 255, 226 / 255, 238 / 255);
const WHITE = rgb(1, 1, 1);

/** NFC + sedila (ş/ţ) → virgulă (ș/ț), corect pentru română oricum ar tasta omul. */
function norm(s: string): string {
  if (!s) return "";
  return s
    .normalize("NFC")
    .replace(/Ş/g, "Ș")
    .replace(/ş/g, "ș")
    .replace(/Ţ/g, "Ț")
    .replace(/ţ/g, "ț")
    .replace(/[\u0000-\u001f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Prima literă mare — câmpurile vin scrise liber, adesea cu minusculă. */
function cap(s: string): string {
  const v = norm(s);
  return v ? v.charAt(0).toUpperCase() + v.slice(1) : v;
}

/** Fiecare cuvânt cu majusculă — pentru nume tastate „ion popescu". */
function titleCase(s: string): string {
  return norm(s)
    .split(" ")
    .filter(Boolean)
    .map((w) => (w.length > 1 ? w.charAt(0).toUpperCase() + w.slice(1) : w.toUpperCase()))
    .join(" ");
}

/* Geometria paginii */
const A4 = { w: 595.28, h: 841.89 };
const HEADER_H = 138;
const SIDE_W = 194; // lățimea coloanei din stânga
const PAD = 30; // padding interior în bara laterală
const GUT = 30; // spațiu între coloane
const BOTTOM = 62; // margine de jos (loc pentru subsol)

const SIDE_X = PAD;
const SIDE_CW = SIDE_W - PAD * 2 + 8;
const MAIN_X = SIDE_W + GUT;
const MAIN_CW = A4.w - MAIN_X - 46;

/** Împarte textul în linii care încap în lățimea dată. */
function wrap(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const words = norm(text).split(" ").filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const word of words) {
    const test = cur ? `${cur} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) <= maxW || !cur) cur = test;
    else {
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

  const name = titleCase(data.name);
  doc.setTitle(`CV ${name}`);
  doc.setAuthor(name);
  doc.setCreator("Full Work Services");

  let page = doc.addPage([A4.w, A4.h]);

  /** Fundalul paginii: bandă de antet + coloana laterală. */
  const paintChrome = (withHeader: boolean) => {
    if (withHeader) {
      page.drawRectangle({ x: 0, y: A4.h - HEADER_H, width: A4.w, height: HEADER_H, color: HEADER_BG });
      // accent subțire sub antet
      page.drawRectangle({ x: 0, y: A4.h - HEADER_H - 4, width: A4.w, height: 4, color: BRAND });
    }
    const top = withHeader ? A4.h - HEADER_H - 4 : A4.h;
    page.drawRectangle({ x: 0, y: 0, width: SIDE_W, height: top, color: SIDEBAR_BG });
  };
  paintChrome(true);

  /* ---------------- ANTET ---------------- */
  {
    const x = PAD;
    let y = A4.h - 52;
    // numele, micșorat dacă e foarte lung
    let nameSize = 27;
    while (bold.widthOfTextAtSize(name, nameSize) > A4.w - PAD * 2 && nameSize > 17) nameSize -= 1;
    page.drawText(name, { x, y, size: nameSize, font: bold, color: WHITE });

    y -= 24;
    const sub = [cap(data.trade), data.years ? norm(data.years) : ""].filter(Boolean).join("  ·  ");
    if (sub) {
      page.drawText(sub, { x, y, size: 12.5, font: bold, color: BRAND_LIGHT });
      y -= 22;
    } else y -= 8;

    // Antetul e singurul loc cu datele de contact (în bara laterală ar fi dublură).
    // Telefonul stă cel mai mare — angajatorii de muncitori sună, nu scriu.
    const phone = norm(data.phone);
    page.drawText(phone, { x, y: y - 2, size: 16, font: bold, color: WHITE });
    const after = x + bold.widthOfTextAtSize(phone, 16) + 16;
    const rest = [data.city ? cap(data.city) : "", data.email ? norm(data.email) : ""]
      .filter(Boolean)
      .join("   ·   ");
    if (rest) {
      page.drawText(rest, { x: after, y: y + 1, size: 9.5, font: reg, color: BRAND_LIGHT });
    }
  }

  /* ---------------- Cursoare pe coloane ---------------- */
  let sideY = A4.h - HEADER_H - 4 - 34;
  let mainY = A4.h - HEADER_H - 4 - 34;

  /** Pagină nouă când coloana principală nu mai are loc. */
  const ensureMain = (needed: number) => {
    if (mainY - needed >= BOTTOM) return;
    page = doc.addPage([A4.w, A4.h]);
    paintChrome(false);
    mainY = A4.h - 52;
    sideY = A4.h - 52;
  };

  /* ---------- Bara laterală ---------- */
  const sideHeading = (label: string) => {
    if (sideY < BOTTOM + 40) return false;
    sideY -= 10;
    page.drawText(norm(label).toUpperCase(), {
      x: SIDE_X,
      y: sideY - 9,
      size: 8.5,
      font: bold,
      color: INK,
    });
    // bara de accent, la distanță de descenderele textului
    sideY -= 20;
    page.drawRectangle({ x: SIDE_X, y: sideY, width: 22, height: 2, color: BRAND });
    sideY -= 13;
    return true;
  };

  const sideText = (text: string, opts: { size?: number; font?: PDFFont; color?: typeof INK } = {}) => {
    const size = opts.size ?? 9.5;
    for (const ln of wrap(text, opts.font ?? reg, size, SIDE_CW)) {
      if (sideY < BOTTOM) return;
      page.drawText(ln, { x: SIDE_X, y: sideY - size, size, font: opts.font ?? reg, color: opts.color ?? MUTED });
      sideY -= size + 4;
    }
  };

  /** Etichetă mică + valoare, pentru blocul de contact. */
  const sidePair = (label: string, value: string) => {
    if (sideY < BOTTOM + 26) return;
    page.drawText(norm(label), { x: SIDE_X, y: sideY - 8, size: 7.8, font: reg, color: MUTED });
    sideY -= 11;
    sideText(value, { size: 9.8, font: bold, color: INK });
    sideY -= 5;
  };

  /** Element de listă cu bulină în bara laterală. */
  const sideBullet = (text: string) => {
    const size = 9.5;
    const lines = wrap(text, reg, size, SIDE_CW - 10);
    if (sideY < BOTTOM + lines.length * (size + 3)) return;
    page.drawCircle({ x: SIDE_X + 2, y: sideY - size + 3.5, size: 1.6, color: BRAND });
    lines.forEach((ln) => {
      page.drawText(ln, { x: SIDE_X + 10, y: sideY - size, size, font: reg, color: INK });
      sideY -= size + 3;
    });
    sideY -= 2;
  };

  // Disponibilitate
  if (data.availability || data.schedule || data.mobility) {
    sideHeading(t.availability);
    if (data.availability) sidePair(t.availableFrom, cap(data.availability));
    if (data.schedule) sidePair(t.schedule, cap(data.schedule));
    if (data.mobility) sidePair(t.mobility, cap(data.mobility));
  }

  // Permis
  if (data.licenses.length) {
    sideHeading(t.licenses);
    sideText(cap(data.licenses.map(norm).join(", ")), { size: 9.8, font: bold, color: INK });
    sideY -= 4;
  }

  // Utilaje
  if (data.machines.length) {
    sideHeading(t.machines);
    for (const m of data.machines.flatMap((x) => norm(x).split(",").map((s) => s.trim()).filter(Boolean)))
      sideBullet(cap(m));
  }

  // Limbi
  if (data.languages.length) {
    sideHeading(t.languages);
    for (const lg of data.languages.flatMap((x) => norm(x).split(",").map((s) => s.trim()).filter(Boolean)))
      sideBullet(cap(lg));
  }

  /* ---------- Coloana principală ---------- */
  const mainHeading = (label: string) => {
    ensureMain(46);
    mainY -= 8;
    // bară de accent în stânga titlului
    page.drawRectangle({ x: MAIN_X, y: mainY - 13, width: 3.5, height: 15, color: BRAND });
    page.drawText(norm(label).toUpperCase(), {
      x: MAIN_X + 12,
      y: mainY - 11,
      size: 10.5,
      font: bold,
      color: INK,
    });
    mainY -= 22;
    page.drawRectangle({ x: MAIN_X, y: mainY, width: MAIN_CW, height: 0.8, color: HAIRLINE });
    mainY -= 14;
  };

  const mainText = (text: string, size = 10, color = MUTED) => {
    for (const ln of wrap(text, reg, size, MAIN_CW)) {
      ensureMain(size + 5);
      page.drawText(ln, { x: MAIN_X, y: mainY - size, size, font: reg, color });
      mainY -= size + 5;
    }
  };

  // Despre mine
  if (data.about) {
    mainHeading(t.about);
    mainText(cap(data.about), 10, INK);
    mainY -= 6;
  }

  // Experiență — cronologic, cu linie de timp în stânga
  const exp = data.experience.filter((e) => e.role || e.company);
  if (exp.length) {
    mainHeading(t.experience);
    exp.forEach((e, i) => {
      const role = cap(e.role);
      const company = cap(e.company);
      const roleLines = wrap(role || company, bold, 10.8, MAIN_CW - 18);
      ensureMain(roleLines.length * 15 + 26);

      const dotY = mainY - 8;
      // punct + linie verticală care leagă intrările
      page.drawCircle({ x: MAIN_X + 3.5, y: dotY, size: 3.2, color: BRAND });
      const textX = MAIN_X + 18;

      roleLines.forEach((ln) => {
        page.drawText(ln, { x: textX, y: mainY - 11, size: 10.8, font: bold, color: INK });
        mainY -= 15;
      });

      if (role && company) {
        for (const ln of wrap(company, reg, 9.8, MAIN_CW - 18)) {
          ensureMain(14);
          page.drawText(ln, { x: textX, y: mainY - 10, size: 9.8, font: reg, color: MUTED });
          mainY -= 13;
        }
      }
      if (e.period) {
        ensureMain(14);
        page.drawText(norm(e.period), { x: textX, y: mainY - 9, size: 9, font: reg, color: BRAND_DARKISH() });
        mainY -= 13;
      }

      // linia verticală de la punct până la intrarea următoare
      if (i < exp.length - 1) {
        const lineBottom = mainY - 4;
        if (lineBottom < dotY - 6) {
          page.drawRectangle({
            x: MAIN_X + 2.7,
            y: lineBottom,
            width: 1.2,
            height: dotY - 6 - lineBottom,
            color: HAIRLINE,
          });
        }
      }
      mainY -= 8;
    });
  }

  // Calificări
  if (data.certifications.length) {
    mainHeading(t.certifications);
    for (const c of data.certifications) {
      const size = 10;
      const lines = wrap(cap(c), reg, size, MAIN_CW - 16);
      ensureMain(lines.length * (size + 4) + 2);
      page.drawCircle({ x: MAIN_X + 3, y: mainY - size + 3.5, size: 1.8, color: BRAND });
      lines.forEach((ln) => {
        page.drawText(ln, { x: MAIN_X + 14, y: mainY - size, size, font: reg, color: INK });
        mainY -= size + 4;
      });
      mainY -= 2;
    }
  }

  /* ---------------- Subsol ---------------- */
  const pages = doc.getPages();
  const stamp = `${t.footer} · ${new Date().toLocaleDateString(locale === "ro" ? "ro-RO" : "en-GB")}`;
  pages.forEach((p, i) => {
    p.drawRectangle({ x: MAIN_X, y: 40, width: MAIN_CW, height: 0.8, color: HAIRLINE });
    p.drawText(stamp, { x: MAIN_X, y: 27, size: 7.5, font: reg, color: MUTED });
    if (pages.length > 1) {
      const label = `${t.page} ${i + 1}/${pages.length}`;
      const w = reg.widthOfTextAtSize(label, 7.5);
      p.drawText(label, { x: MAIN_X + MAIN_CW - w, y: 27, size: 7.5, font: reg, color: MUTED });
    }
  });

  return doc.save();
}

/** Albastru închis pentru perioade — definit ca funcție ca să nu poluăm paleta. */
function BRAND_DARKISH() {
  return rgb(3 / 255, 105 / 255, 161 / 255);
}
