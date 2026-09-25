// ============================================================================
// Tabu Search (TS) untuk TSP.
// Port dari kode tim (tabu-search.py) — logika tabu + aspiration dipertahankan,
// bagian Flask/pandas diabaikan (aplikasi ini client-side, tanpa backend).
// Ditambah: RNG berseed, perbaikan wajib (aspiration-by-default least-tabu),
// dukungan neighborhood, dan perekaman Frame.
//
// Inti TS: dari rute saat ini, bangkitkan sejumlah tetangga (swap). Pilih tetangga
// TERBAIK yang TIDAK tabu. Sebuah gerakan (i,j) menjadi tabu selama 'tabuTenure'
// iterasi setelah dipakai, agar pencarian tidak mondar-mandir. Aspiration:
// gerakan tabu tetap boleh dipilih jika menghasilkan solusi terbaik baru.
// ============================================================================

import type { AlgoParams, AlgoResult, Frame, Point, Tour } from "./types";
import { tourCost } from "./distance";
import { applyMove } from "./neighborhood";
import { makeRng, shuffledRange, distinctPair } from "./rng";
import { FrameRecorder } from "./frames";

export interface TSParams extends AlgoParams {
  maxIter?: number; // default 1000 (dari kode tim)
  tabuTenure?: number; // default 15
  numNeighbors?: number; // default 50
  maxFrames?: number; // batas frame animasi (default 300)
}

const moveKey = (i: number, j: number) => `${i},${j}`;

export function runTabuSearch(points: Point[], params: TSParams = {}): AlgoResult {
  const {
    seed,
    neighborhood = "swap",
    maxIter = 1000,
    tabuTenure = 15,
    numNeighbors = 50,
    maxFrames = 300,
  } = params;

  const n = points.length;
  if (n < 2) throw new Error("places must contain at least 2 points.");

  const startTime = performance.now();
  const rng = makeRng(seed);
  const recorder = new FrameRecorder(maxFrames);
  const costHistory: number[] = [];

  // Rute awal acak.
  let currentTour: Tour = shuffledRange(rng, n);
  let bestTour: Tour = currentTour.slice();
  let bestCost = tourCost(bestTour, points);

  // Tabu list: key "i,j" -> iterasi saat status tabu berakhir (expiresAt).
  const tabuList = new Map<string, number>();

  const totalPairs = (n * (n - 1)) / 2;
  const neighborsPerIter = Math.min(numNeighbors, totalPairs);

  for (let iteration = 0; iteration < maxIter; iteration++) {
    // Kandidat terbaik yang non-tabu (atau lolos aspiration).
    let bestNeighbor: Tour | null = null;
    let bestNeighborCost = Infinity;
    let bestMove: [number, number] | null = null;
    let bestViaAspiration = false;

    // Cadangan "least-tabu": gerakan tabu dengan sisa tenure TERKECIL.
    // Dipakai bila semua tetangga tabu (perbaikan atas bug `break` di kode asli).
    let ltNeighbor: Tour | null = null;
    let ltCost = Infinity;
    let ltMove: [number, number] | null = null;
    let ltRemaining = Infinity;

    const evaluated = new Set<string>();
    while (evaluated.size < neighborsPerIter) {
      const [i, j] = distinctPair(rng, n);
      const key = moveKey(i, j);
      if (evaluated.has(key)) continue;
      evaluated.add(key);

      const neighbor = applyMove(currentTour, i, j, neighborhood);
      const cost = tourCost(neighbor, points);

      // Status tabu + aspiration criterion.
      const expiresAt = tabuList.get(key);
      const inTabu = expiresAt !== undefined && expiresAt > iteration;
      const aspirated = inTabu && cost < bestCost; // tabu tapi menembus best -> boleh
      const isTabu = inTabu && !aspirated;

      if (!isTabu && cost < bestNeighborCost) {
        bestNeighborCost = cost;
        bestNeighbor = neighbor;
        bestMove = [i, j];
        bestViaAspiration = aspirated;
      }

      // Lacak kandidat least-tabu (sisa tenure terkecil) untuk fallback.
      if (isTabu) {
        const remaining = (expiresAt as number) - iteration;
        if (remaining < ltRemaining) {
          ltRemaining = remaining;
          ltNeighbor = neighbor;
          ltCost = cost;
          ltMove = [i, j];
        }
      }
    }

    // Tentukan gerakan terpilih.
    let selectedTour: Tour;
    let selectedCost: number;
    let selectedMove: [number, number];
    let isTabuMove: boolean;
    let aspiration: boolean;

    if (bestNeighbor !== null && bestMove !== null) {
      selectedTour = bestNeighbor;
      selectedCost = bestNeighborCost;
      selectedMove = bestMove;
      isTabuMove = bestViaAspiration; // hanya tabu jika terpilih via aspiration
      aspiration = bestViaAspiration;
    } else {
      // PERBAIKAN: alih-alih berhenti (break), pilih gerakan least-tabu.
      selectedTour = ltNeighbor as Tour;
      selectedCost = ltCost;
      selectedMove = ltMove as [number, number];
      isTabuMove = true;
      aspiration = false;
    }

    currentTour = selectedTour;

    const improvesBest = selectedCost < bestCost;
    if (improvesBest) {
      bestCost = selectedCost;
      bestTour = selectedTour.slice();
    }

    // Catat gerakan terpilih ke tabu list.
    tabuList.set(moveKey(selectedMove[0], selectedMove[1]), iteration + tabuTenure);

    // Hapus memori tabu yang kedaluwarsa.
    for (const [k, exp] of tabuList) {
      if (exp <= iteration) tabuList.delete(k);
    }

    // Snapshot tabu list untuk panel visualisasi.
    const tabuSnapshot = Array.from(tabuList.entries()).map(([k, exp]) => {
      const [a, b] = k.split(",").map(Number);
      return { move: [a, b] as [number, number], expiresAt: exp };
    });

    const frame: Frame = {
      iteration,
      currentTour: currentTour.slice(),
      currentCost: selectedCost,
      bestTour: bestTour.slice(),
      bestCost,
      accepted: true, // TS selalu berpindah ke tetangga terpilih
      move: selectedMove,
      isTabuMove,
      aspiration,
      tabuList: tabuSnapshot,
    };
    recorder.record(
      frame,
      improvesBest ? "best" : isTabuMove ? "acceptedWorse" : "ordinary"
    );
    costHistory.push(bestCost);
  }

  return {
    bestTour,
    bestCost,
    iterations: maxIter,
    timeMs: performance.now() - startTime,
    frames: recorder.finalize(),
    costHistory,
  };
}
