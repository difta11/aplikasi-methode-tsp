"use client";

// LinkPreview — tautan yang memunculkan kartu pratinjau saat disentuh kursor.
// Isi kartunya bebas (prop `preview`), jadi komponen ini tetap generik.
//
// Catatan aksesibilitas & perangkat:
// - Muncul juga saat tautan mendapat fokus keyboard, bukan hanya hover.
// - Di layar sentuh tidak ada hover: ketukan pertama membuka kartu (navigasi
//   ditahan), ketukan kedua baru membuka tautannya.
// - Kartu memakai elemen <span> yang di-block-kan lewat CSS, karena komponen ini
//   dipakai di dalam <p> — <div> di dalam <p> bukan HTML yang valid.
// - Menghormati prefers-reduced-motion: muncul tanpa gerakan.

import React, { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export function LinkPreview({
  href,
  children,
  preview,
  className,
}: {
  href: string;
  children: React.ReactNode;
  /** Isi kartu pratinjau. */
  preview: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const lastPointerWasTouch = useRef(false);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "font-semibold underline decoration-dotted underline-offset-4 transition-colors",
          className
        )}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onPointerDown={(e) => {
          lastPointerWasTouch.current = e.pointerType === "touch";
        }}
        onClick={(e) => {
          // Sentuhan pertama: tampilkan kartu dulu, jangan langsung pindah halaman.
          if (lastPointerWasTouch.current && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        {children}
      </a>

      <AnimatePresence>
        {open && (
          <motion.span
            role="tooltip"
            className="absolute bottom-full left-1/2 z-40 mb-2.5 block w-72 -translate-x-1/2 text-left"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.94 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.96 }}
            transition={
              reduceMotion
                ? { duration: 0.12 }
                : { type: "spring", stiffness: 380, damping: 26 }
            }
          >
            {preview}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
