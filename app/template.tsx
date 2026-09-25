"use client";

// Transisi antar halaman. template.tsx (bukan layout.tsx) di-mount ulang setiap
// navigasi, jadi animasinya jalan tiap pindah halaman.
//
// Sengaja HANYA menganimasikan opacity: transform pada pembungkus akan membuat
// elemen `position: sticky`/`fixed` di dalamnya berperilaku aneh.

import { motion, useReducedMotion } from "motion/react";

export default function Template({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <>{children}</>;

  return (
    <motion.div
      className="flex flex-1 flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
