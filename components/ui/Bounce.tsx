"use client";

// Pembungkus micro-interaction ala Duolingo: sedikit membesar & terangkat saat
// disentuh kursor, menekan saat diklik — dengan spring supaya terasa "mantul".
// Otomatis nonaktif bila pengguna meminta prefers-reduced-motion.

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export function Bounce({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <span className={cn("inline-flex", className)}>{children}</span>;
  }

  return (
    <motion.span
      className={cn("inline-flex", className)}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96, y: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 16 }}
    >
      {children}
    </motion.span>
  );
}
