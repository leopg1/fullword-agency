"use client"

import { useEffect, useRef, useState } from "react"
import {
  MotionGlobalConfig,
  motion,
  type MotionProps,
  type UseInViewOptions,
  type Variants,
} from "motion/react"

type MarginType = UseInViewOptions["margin"]

interface BlurFadeProps extends MotionProps {
  children: React.ReactNode
  className?: string
  variant?: {
    hidden: { y: number }
    visible: { y: number }
  }
  duration?: number
  delay?: number
  offset?: number
  direction?: "up" | "down" | "left" | "right"
  inView?: boolean
  inViewMargin?: MarginType
  blur?: string
}

/**
 * Reveal blur-fade robust, care nu lasă NICIODATĂ conținut gol:
 *
 *  - SSR / no-JS / reduced-motion / ?noanim=1 → conținut vizibil imediat
 *    (`initial={false}`, LCP instant).
 *  - Cu JS, doar elementele aflate sub fold la hidratare sunt ascunse instant
 *    și revelate la intrarea în viewport.
 *  - Revelarea se declanșează dacă elementul e vizibil SAU a fost deja depășit
 *    (fix pentru scroll rapid, unde IntersectionObserver poate rata complet
 *    starea de „intersecting” dacă secțiunea traversează ecranul între două
 *    eșantioane).
 *  - Failsafe garantat: un timeout scurt revelează oricum, ca nimic să nu
 *    rămână blocat la opacity 0 dacă observer-ul nu se declanșează.
 */
export function BlurFade({
  children,
  className,
  variant,
  duration = 0.4,
  delay = 0,
  offset = 6,
  direction = "down",
  // păstrat pentru compatibilitate cu apelurile existente
  inView: _inView = false,
  inViewMargin: _inViewMargin = "-50px",
  blur = "6px",
  ...props
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null)
  // "static" = vizibil fără animație | "pre" = ascuns, așteaptă | "in" = animă spre vizibil
  const [phase, setPhase] = useState<"static" | "pre" | "in">("static")

  useEffect(() => {
    if (MotionGlobalConfig.skipAnimations) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const el = ref.current
    if (!el) return
    // deja în viewport la hidratare → rămâne vizibil, fără clipiri
    if (el.getBoundingClientRect().top <= window.innerHeight * 0.9) return

    setPhase("pre")
    let done = false
    const reveal = () => {
      if (done) return
      done = true
      io.disconnect()
      clearTimeout(failsafe)
      setPhase("in")
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // vizibil ACUM sau deja depășit (top a urcat peste marginea de jos)
          if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight) {
            reveal()
            return
          }
        }
      },
      // prag jos: se declanșează de îndată ce elementul atinge zona de jos a ecranului
      { rootMargin: "0px 0px -8% 0px" }
    )
    io.observe(el)

    // Garanția finală: chiar dacă observer-ul nu se declanșează (scroll foarte
    // rapid), conținutul devine vizibil oricum.
    const failsafe = setTimeout(reveal, 900)

    return () => {
      done = true
      io.disconnect()
      clearTimeout(failsafe)
    }
    // doar la mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const axis = direction === "left" || direction === "right" ? "x" : "y"
  const sign = direction === "right" || direction === "down" ? -offset : offset
  const defaultVariants: Variants = {
    hidden: { [axis]: sign, opacity: 0, filter: `blur(${blur})` },
    visible: { [axis]: 0, opacity: 1, filter: "blur(0px)" },
  }
  const combinedVariants = variant ?? defaultVariants

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={phase === "pre" ? "hidden" : "visible"}
      variants={combinedVariants}
      transition={
        phase === "pre"
          ? { duration: 0 } // ascundere instant, sub fold — invizibilă utilizatorului
          : { delay: 0.04 + delay, duration, ease: "easeOut", filter: { duration } }
      }
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
