"use client";

// Tautan algoritma dengan kartu pratinjau. Isi kartunya dirancang sendiri
// (ilustrasi mini + satu kalimat) alih-alih memotret halaman Wikipedia:
// tidak butuh internet saat dipakai, tidak ada isu lisensi gambar, dan
// ilustrasinya bisa menjelaskan inti algoritma dalam sekali lihat.
//
// Semua warna memakai token tema, jadi ikut berubah bila palet diganti.

import { ArrowUpRight } from "lucide-react";
import { LinkPreview } from "@/components/ui/link-preview";

/** Termometer yang mendingin + kurva biaya yang menurun (Simulated Annealing). */
function SaIllustration() {
  return (
    <svg viewBox="0 0 200 76" className="h-auto w-full" aria-hidden="true">
      <rect x="10" y="12" width="9" height="52" rx="4.5" className="fill-muted" />
      <rect x="10" y="34" width="9" height="30" rx="4.5" className="fill-accent" />
      <path
        d="M34 20 L46 46 L58 26 L70 52 L82 34 L96 58 L112 44 L130 62 L152 54 L186 60"
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-primary"
      />
      <circle cx="186" cy="60" r="3.5" className="fill-secondary" />
    </svg>
  );
}

/** Rute dengan satu sisi yang sedang dilarang (Tabu Search). */
function TsIllustration() {
  return (
    <svg viewBox="0 0 200 76" className="h-auto w-full" aria-hidden="true">
      <path
        d="M24 56 L58 22 L104 44 L150 18 L180 50"
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-secondary"
      />
      <path
        d="M58 22 L104 44"
        fill="none"
        strokeWidth="2.5"
        strokeDasharray="5 4"
        strokeLinecap="round"
        className="stroke-destructive"
      />
      <g className="stroke-destructive" strokeWidth="2.2" strokeLinecap="round">
        <path d="M75 27 L87 39" />
        <path d="M87 27 L75 39" />
      </g>
      {[
        [24, 56],
        [58, 22],
        [104, 44],
        [150, 18],
        [180, 50],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" className="fill-primary" />
      ))}
    </svg>
  );
}

const ALGORITHMS = {
  sa: {
    nama: "Simulated Annealing",
    href: "https://id.wikipedia.org/wiki/Simulated_annealing",
    ringkas:
      "Saat “panas”, rute yang lebih buruk masih diterima supaya tidak terjebak; makin dingin, makin selektif.",
    warna: "text-accent hover:text-accent/80 decoration-accent/40",
    ilustrasi: <SaIllustration />,
  },
  ts: {
    nama: "Tabu Search",
    href: "https://id.wikipedia.org/wiki/Pencarian_tabu",
    ringkas:
      "Gerakan yang baru dipakai dilarang sementara, supaya pencarian tidak berputar-putar di tempat yang sama.",
    warna: "text-destructive hover:text-destructive/80 decoration-destructive/40",
    ilustrasi: <TsIllustration />,
  },
} as const;

export function AlgorithmLink({ kind }: { kind: keyof typeof ALGORITHMS }) {
  const a = ALGORITHMS[kind];
  return (
    <LinkPreview
      href={a.href}
      className={a.warna}
      preview={
        <span className="block overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-foreground/10">
          <span className="block bg-muted/60 px-4 pt-4 pb-3">{a.ilustrasi}</span>
          <span className="block px-4 pt-3 pb-4">
            <span className="block text-sm font-semibold">{a.nama}</span>
            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
              {a.ringkas}
            </span>
            <span className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-primary">
              Buka di Wikipedia
              <ArrowUpRight className="size-3.5" />
            </span>
          </span>
        </span>
      }
    >
      {a.nama}
    </LinkPreview>
  );
}
