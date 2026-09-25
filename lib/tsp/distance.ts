// ============================================================================
// Perhitungan jarak & biaya rute (cost) untuk TSP.
// ============================================================================

import type { Point, Tour } from "./types";

/** Jarak Euclidean antara dua titik: sqrt((x1-x2)^2 + (y1-y2)^2). */
export function distance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Total panjang rute (cost). Rute bersifat siklik (closing loop):
 * kota terakhir kembali ke kota pertama.
 * Contoh: tour [0,2,5,3,1,4] -> 0->2->5->3->1->4->0.
 */
export function tourCost(tour: Tour, points: Point[]): number {
  const n = tour.length;
  if (n < 2) return 0;
  let total = 0;
  for (let i = 0; i < n; i++) {
    const from = points[tour[i]];
    const to = points[tour[(i + 1) % n]]; // % n menutup loop ke titik awal
    total += distance(from, to);
  }
  return total;
}

/**
 * Matriks jarak antar-kota (opsional, untuk optimasi). Menghitung jarak sekali
 * di awal agar tidak dihitung ulang tiap evaluasi rute.
 */
export function buildDistanceMatrix(points: Point[]): number[][] {
  const n = points.length;
  const matrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = distance(points[i], points[j]);
      matrix[i][j] = d;
      matrix[j][i] = d;
    }
  }
  return matrix;
}
