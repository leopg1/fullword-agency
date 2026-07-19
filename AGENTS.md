<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Full Work Services — site de prezentare (redesign fullworkservices.com)

Agenție de recrutare & partener HR, București. Public: companii (RO+străine), candidați (mulți 40+, veniți de pe Facebook/telefon) și persoane fizice (cetățenie/mediere). Site **bilingv RO (implicit, fără prefix) + EN (/en)**.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind v4 (tokens în `app/globals.css`, FĂRĂ tailwind.config) · shadcn/ui (stil radix-nova, lucide-react) · `motion` (import din `motion/react`, doar în componente client frunză) · `lenis` (doar desktop, prin `LenisProvider`) · `next-intl` v4 (**`proxy.ts`**, nu middleware.ts; rute traduse în `i18n/routing.ts`) · Supabase (tabele `fw_*`) pentru joburi/aplicări/admin.

## Brand & reguli de contrast (NU se negociază)

- `--color-brand` **#0EA5E9** = culoare de BLOC/decor/badge. Text pe ea DOAR `text-brand-foreground` (slate-900). **Interzis text alb pe brand** (2.77:1, pică WCAG).
- `--color-primary` **#0369A1** (sky-700) = butoane primare & linkuri, cu text alb (AA ✅).
- `--color-brand-dark` **#0C4A6E** (sky-900) = secțiuni dark de impact (max 1–2/pagină), text alb (AAA ✅).
- Fundal secțiuni alternate: `--color-brand-tint` (sky-50) / `--color-brand-tint-2` (sky-100).
- Ritm color-block per pagină: alb → sky-50 → alb → sky-900 (CTA) → alb.
- **Zero hex în componente** — doar clase semantice (`bg-brand`, `text-primary`, `bg-brand-dark`...). Hex într-un `.tsx` = bug.
- Fonturi: Poppins 600/700 (`font-heading`, titluri) + Inter (`font-sans`, body **18px/1.6** setat global). Linkurile din text sunt subliniate.

## UX pentru public 40+ (motivul multor decizii)

Meniu 5 iteme fără dropdown · telefon clickabil + WhatsApp mereu vizibile în header · touch targets ≥48px · un mesaj per secțiune (titlu + 2-3 fraze + 1 CTA) · animații DOAR blur-fade la scroll + number-ticker (nimic flashy: fără meteors/particles/aurora) · `prefers-reduced-motion` respectat · formulare de max 3-4 câmpuri.

## Convenții

- Secțiuni de pagină în `components/sections/`, layout (header/footer) în `components/site/`, componente registry în `components/ui/` (nu se editează manual decât pt. tokens).
- Utilitare layout: `.container-site` (max-w-7xl + padding) și `.section-pad` (py responsive) din globals.css.
- Date firmă/contact DOAR din `lib/site.ts` (nu hardcoda telefon/adresă/CUI).
- Navigație DOAR prin `Link`/`useRouter` din `@/i18n/navigation` (niciodată `next/link` direct) — altfel se rup rutele traduse.
- Toate textele prin `next-intl` (`messages/ro.json` + `en.json`) — zero stringuri hardcodate în componente.
- Imagini: `next/image` cu `alt` real, fișiere în `public/images/{brand,jobs,cities,services}` (webp optimizate; logo-uri PNG transparente: logo-sky, logo-white, logo-navy).
- `overflow-x: clip` (NU `hidden`) — hidden omoară `position: sticky`.

## Definition of done (fiecare livrare)

`npm run build` curat · verificare vizuală în browser desktop 1280 + mobil 375 · Lighthouse ≥90 (perf/SEO/a11y) · metadata + JSON-LD pe fiecare pagină nouă · ambele limbi funcționale · fără text alb pe #0EA5E9 nicăieri.

## Fișiere protejate (nu rescrie fără motiv)

`app/globals.css` (tokens) · `app/[locale]/layout.tsx` · `i18n/*` · `proxy.ts` · `lib/site.ts`.

## Context de business (sursa de adevăr)

Conținutul original extras din site-ul vechi: `../full work services/fullworkservices-extract/` · pregătirea completă (sitemap, redirects, inventar, date ANAF): `../full work services/pregatire-website/`. Reguli critice: „15+ ani experiență" se atribuie DOAR fondatoarei Diana Dina (firma e din 2021) · fără mențiuni „agenție autorizată" (nr. ITM neconfirmat) · testimonialul „Sara B."/Artis Mundi NU se folosește · email oficial: office@fullworkservices.com.
