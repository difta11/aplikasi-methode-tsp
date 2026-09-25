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
  finalize(): Frame[] {
    if (this.items.length <= this.maxFrames) {
      return this.items.map((x) => x.frame);
    }

    const byCat: Record<FrameCategory, Frame[]> = {
      best: [],
      acceptedWorse: [],
      ordinary: [],
    };
    for (const { frame, cat } of this.items) byCat[cat].push(frame);

    const chosen: Frame[] = [];
    let remaining = this.maxFrames;
    for (const cat of ["best", "acceptedWorse", "ordinary"] as FrameCategory[]) {
      if (remaining <= 0) break;
      const take = Math.min(byCat[cat].length, remaining);
      chosen.push(...sampleUniform(byCat[cat], take));
      remaining -= take;
    }

    // Urutkan kembali berdasarkan urutan iterasi agar animasi mulus.
    chosen.sort((a, b) => a.iteration - b.iteration);
    return chosen;
  }
}
