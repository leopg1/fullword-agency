"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Trimite un semnal la fiecare pagină vizitată, pentru statisticile din admin.
 * Nu pune cookie-uri și nu trimite date personale — doar pagina, de unde a venit
 * omul și adresa paginii. Rulează după încărcare, deci nu încetinește site-ul.
 */
export function PageTracker() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastSent.current === pathname) return;
    lastSent.current = pathname;

    const payload = JSON.stringify({
      path: pathname,
      ref: document.referrer || null,
      search: window.location.search || null,
    });

    // trimitem fără să blocăm nimic; dacă pică, nu se întâmplă nimic
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
