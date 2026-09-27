// ============================================================================
// Perekam & sampler Frame untuk animasi (record-then-replay).
// Ribuan iterasi tak mungkin dianimasikan semua, jadi kita batasi jumlah frame
// (default <= 300) dengan MEMPRIORITASKAN langkah-langkah penting:
//   - 'best'          : langkah yang memperbaiki solusi terbaik (paling penting)
//   - 'acceptedWorse' : SA menerima langkah lebih buruk / TS tabu-override
//   - 'ordinary'      : langkah biasa (disubsample paling akhir)
// costHistory (bestCost per iterasi) disimpan terpisah & full-length (murah).
// ============================================================================

import type { Frame } from "./types";

export type FrameCategory = "best" | "acceptedWorse" | "ordinary";

/** Ambil k elemen tersebar merata dari arr (selalu menyertakan awal & akhir). */
function sampleUniform<T>(arr: T[], k: number): T[] {
  if (k >= arr.length) return arr.slice();
  if (k <= 0) return [];
  if (k === 1) return [arr[0]];
  const res: T[] = [];
  const step = (arr.length - 1) / (k - 1);
  for (let i = 0; i < k; i++) res.push(arr[Math.round(i * step)]);
  return res;
}

export class FrameRecorder {
  private items: { frame: Frame; cat: FrameCategory }[] = [];

  constructor(private readonly maxFrames = 300) {}

  /** Catat satu frame beserta kategori kepentingannya. */
  record(frame: Frame, cat: FrameCategory): void {
    this.items.push({ frame, cat });
  }

  /**
   * Hasilkan array frame final terurut iterasi, dengan total <= maxFrames.
   * Strategi: isi anggaran frame berdasarkan prioritas kategori
   * (best -> acceptedWorse -> ordinary); tiap kategori disubsample merata.
   */
  /**
   * Hasilkan array frame final terurut iterasi, dengan total <= maxFrames.
   *
   * Dua tahap:
   *  1. Jaring dasar — sampel merata di SELURUH rentang iterasi. Ini yang
   *     menjamin animasi selalu sampai ke iterasi terakhir.
   *  2. Sisa anggaran diisi berdasarkan prioritas kategori (best ->
   *     acceptedWorse -> ordinary), supaya momen penting tetap padat terekam.
   *
   * Tanpa tahap 1, anggaran bisa habis diborong kategori prioritas yang
   * kebetulan menumpuk di awal run. Itu yang terjadi pada Simulated Annealing:
   * langkah "menerima yang lebih buruk" hampir seluruhnya muncul selagi suhu
   * masih tinggi, sehingga animasi 15.000 iterasi berhenti di sekitar iterasi
   * 2.100 (14% dari keseluruhan) dan sisanya tidak pernah tampil.
   */
  finalize(): Frame[] {
    if (this.items.length <= this.maxFrames) {
      return this.items.map((x) => x.frame);
    }

    // Kunci = nomor iterasi, sekaligus mencegah frame terpilih dua kali.
    const chosen = new Map<number, Frame>();

    const baseline = Math.max(2, Math.round(this.maxFrames * 0.35));
    for (const f of sampleUniform(this.items.map((x) => x.frame), baseline)) {
      chosen.set(f.iteration, f);
    }

    const byCat: Record<FrameCategory, Frame[]> = {
      best: [],
      acceptedWorse: [],
      ordinary: [],
    };
    for (const { frame, cat } of this.items) byCat[cat].push(frame);

    for (const cat of ["best", "acceptedWorse", "ordinary"] as FrameCategory[]) {
      const remaining = this.maxFrames - chosen.size;
      if (remaining <= 0) break;
      const pool = byCat[cat].filter((f) => !chosen.has(f.iteration));
      for (const f of sampleUniform(pool, Math.min(pool.length, remaining))) {
        chosen.set(f.iteration, f);
      }
    }

    // Urutkan kembali berdasarkan urutan iterasi agar animasi mulus.
    return [...chosen.values()].sort((a, b) => a.iteration - b.iteration);
  }
}
