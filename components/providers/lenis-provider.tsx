"use client";

import Lenis from "lenis";
import { MotionGlobalConfig } from "motion/react";
import { useEffect } from "react";

// Escape hatch pentru verificare vizuală în medii fără rAF continuu
// (ex. browser de preview): ?noanim=1 sare direct la starea finală a animațiilor.
if (typeof window !== "undefined" && window.location.search.includes("noanim=1")) {
  MotionGlobalConfig.skipAnimations = true;
}

/**
 * Smooth scroll DOAR pe desktop cu pointer fin și fără reduced-motion.
 * Montat imperativ (nu ca wrapper) ca să nu remonteze arborele de secțiuni
 * — un remount îngheța animațiile BlurFade în starea „hidden".
 */
function SmoothScroll() {
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced || MotionGlobalConfig.skipAnimations) return;

    const lenis = new Lenis({ lerp: 0.12, smoothWheel: true });
    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SmoothScroll />
    </>
  );
}
