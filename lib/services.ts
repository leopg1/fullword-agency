import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import type { StaticAppPathname } from "@/i18n/routing";

/**
 * Serviciile site-ului.
 *
 * Structura (rută, namespace de texte, iconiță) rămâne în cod — fiecare serviciu
 * are pagina lui, cu slug tradus RO/EN configurat la compilare în i18n/routing.
 * Din panoul de admin se pot schimba doar VIZIBILITATEA și ORDINEA (tabelul
 * `fw_services`); textele se editează din „Texte site".
 */
export type ServiceDef = {
  key: string;
  /** namespace-ul din messages/{ro,en}.json */
  namespace: string;
  href: StaticAppPathname;
  /** cheia etichetei din namespace-ul `footer` (diferă de `key`) */
  footerKey: string;
};

export const SERVICE_DEFS: ServiceDef[] = [
  { key: "recruitment", namespace: "svcRecrutare", href: "/servicii/recrutare", footerKey: "recruitment" },
  { key: "hr", namespace: "svcHr", href: "/servicii/hr-outsourcing", footerKey: "hrOutsourcing" },
  { key: "permits", namespace: "svcPermise", href: "/servicii/permise-de-munca", footerKey: "workPermits" },
  { key: "market", namespace: "svcInfiintare", href: "/servicii/infiintare-firma", footerKey: "marketEntry" },
  { key: "citizenship", namespace: "svcCetatenie", href: "/servicii/cetatenie", footerKey: "citizenship" },
  { key: "mediation", namespace: "svcMediere", href: "/servicii/mediere", footerKey: "mediation" },
];

export type ServiceSetting = { key: string; published: boolean; sort_order: number };

/** Setările din DB (vizibilitate + ordine). Dacă baza nu răspunde, toate rămân vizibile. */
export const getServiceSettings = cache(async (): Promise<ServiceSetting[]> => {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("fw_services")
      .select("key, published, sort_order")
      .order("sort_order", { ascending: true });
    if (error || !data) throw error;
    return data as ServiceSetting[];
  } catch {
    return SERVICE_DEFS.map((d, i) => ({ key: d.key, published: true, sort_order: i + 1 }));
  }
});

export type Service = ServiceDef & { published: boolean; sortOrder: number };

/** Toate serviciile (inclusiv ascunse), în ordinea aleasă din admin. */
export const getAllServices = cache(async (): Promise<Service[]> => {
  const settings = await getServiceSettings();
  const byKey = new Map(settings.map((s) => [s.key, s]));
  return SERVICE_DEFS.map((def, i) => {
    const s = byKey.get(def.key);
    return { ...def, published: s?.published ?? true, sortOrder: s?.sort_order ?? i + 1 };
  }).sort((a, b) => a.sortOrder - b.sortOrder);
});

/** Doar serviciile vizibile pe site, în ordine. */
export const getServices = cache(async (): Promise<Service[]> =>
  (await getAllServices()).filter((s) => s.published)
);

/**
 * Cheile de text care formează NUMELE scurt al serviciului.
 * Apare în două locuri care trebuie să rămână identice: cardul din grila de
 * servicii și link-ul din subsol. (Titlul lung al paginii — `svcX.title` — e
 * altceva, un titlu de marketing, și se editează separat din „Texte site".)
 */
export function serviceNameKeys(def: Pick<ServiceDef, "key" | "footerKey">): string[] {
  return [`services.${def.key}Title`, `footer.${def.footerKey}`];
}

/** Verifică dacă pagina unui serviciu trebuie să fie accesibilă public. */
export async function isServicePublished(namespace: string): Promise<boolean> {
  const all = await getAllServices();
  return all.find((s) => s.namespace === namespace)?.published ?? true;
}
