"use client";

// ShinyButton — integrasi komponen "shiny-button" 21st.dev.
// Penyesuaian terhadap kode asli, semuanya beralasan:
//
// 1. CSS dipindah ke app/globals.css (kelas .shiny-cta), bukan <style jsx>.
//    styled-jsx di App Router butuh StyleRegistry sendiri supaya gayanya ikut
//    terkirim di HTML awal; tanpa itu tombol sempat tampil polos saat halaman
//    dimuat. Lewat globals.css gayanya dijamin ada sejak render pertama.
// 2. Tidak meng-import font Inter. Font aplikasi ini Poppins, dan @import di
//    dalam blok style komponen tidak valid.
// 3. Tambahan prop yang memang dibutuhkan aplikasi: `href` (tombol yang
//    menavigasi, memakai <Link> Next), `disabled`, `size`, dan `type`.

import type React from "react";
import Link from "next/link";

type ShinyButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  /** Bila diisi, tombol dirender sebagai tautan Next (navigasi client-side). */
  href?: string;
  disabled?: boolean;
  size?: "default" | "sm";
  type?: "button" | "submit";
  "aria-label"?: string;
};

export function ShinyButton({
  children,
  onClick,
  className = "",
  href,
  disabled = false,
  size = "default",
  type = "button",
  "aria-label": ariaLabel,
}: ShinyButtonProps) {
  const classes = `shiny-cta ${className}`;

  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={classes}
        data-size={size}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      data-size={size}
      data-disabled={disabled ? "true" : undefined}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <span>{children}</span>
    </button>
  );
}
