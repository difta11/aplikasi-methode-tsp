// ============================================================================
// PRNG deterministik (mulberry32).
// Tujuan: reproducibility. Seed yang sama -> urutan angka acak yang sama persis,
// sehingga hasil SA/TS bisa direproduksi. SEMUA pengacakan di algoritma WAJIB
// memakai RNG ini, bukan Math.random.
// ============================================================================

export type RNG = {
  /** Angka acak float pada rentang [0, 1). Pengganti Math.random(). */
  next: () => number;
  /** Bilangan bulat acak pada rentang [min, max] (inklusif). */
  int: (min: number, max: number) => number;
};

/**
 * mulberry32 — PRNG 32-bit kecil, cepat, dan deterministik.
 * @param seed nilai awal (integer). Jika tidak diberikan, dibangkitkan dari waktu.
 */
export function makeRng(seed?: number): RNG {
  // Jika seed tidak diberikan, pakai waktu supaya tetap bervariasi antar-run.
  let a = (seed ?? Date.now()) >>> 0;

  const next = (): number => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (min: number, max: number): number =>
    min + Math.floor(next() * (max - min + 1));

  return { next, int };
}

/** Permutasi acak [0..n-1] memakai Fisher-Yates berbasis RNG berseed. */
export function shuffledRange(rng: RNG, n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Dua indeks berbeda pada [0..n-1], dikembalikan terurut [i, j] dengan i < j. */
export function distinctPair(rng: RNG, n: number): [number, number] {
  const i = rng.int(0, n - 1);
  let j = rng.int(0, n - 1);
  while (j === i) j = rng.int(0, n - 1);
  return i < j ? [i, j] : [j, i];
}
