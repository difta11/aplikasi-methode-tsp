// ============================================================================
// Operator "tetangga" (neighborhood) untuk TSP.
// Menghasilkan rute baru dari rute saat ini dengan sebuah gerakan (move).
// Semua fungsi bersifat MURNI: mengembalikan rute baru, tidak memodifikasi input.
// ============================================================================

import type { Tour } from "./types";

/**
 * swap — tukar posisi i dan j pada rute (default, sesuai kode tim).
 * Contoh: swap([0,1,2,3], 1, 3) -> [0,3,2,1].
 */
export function swap(tour: Tour, i: number, j: number): Tour {
  const next = tour.slice();
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/**
 * twoOpt (2-opt) — balik (reverse) segmen antara indeks i..j inklusif.
 * Menghapus dua sisi lalu menyambung ulang, sering lebih efektif dari swap.
 * Contoh: twoOpt([0,1,2,3,4], 1, 3) -> [0,3,2,1,4].
 * (Opsi; default algoritma tetap 'swap'.)
 */
export function twoOpt(tour: Tour, i: number, j: number): Tour {
  const next = tour.slice();
  let lo = Math.min(i, j);
  let hi = Math.max(i, j);
  while (lo < hi) {
    [next[lo], next[hi]] = [next[hi], next[lo]];
    lo++;
    hi--;
  }
  return next;
}

/** Terapkan gerakan sesuai jenis neighborhood yang dipilih. */
export function applyMove(
  tour: Tour,
  i: number,
  j: number,
  kind: "swap" | "2opt"
): Tour {
  return kind === "2opt" ? twoOpt(tour, i, j) : swap(tour, i, j);
}
