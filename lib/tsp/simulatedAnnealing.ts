// ============================================================================
// Simulated Annealing (SA) untuk TSP.
// Port setia dari kode tim (simulated-annealing.py) — logika & parameter default
// dipertahankan; ditambah RNG berseed, guard suhu, dan perekaman Frame.
//
// Inti SA: mulai dari rute acak & suhu tinggi. Tiap iterasi buat tetangga (swap),
// terima jika lebih baik, ATAU terima langkah lebih buruk dengan probabilitas
// Metropolis p = exp(-Δ/T). Suhu didinginkan tiap iterasi (T *= coolingRate),
// sehingga makin lama makin "pilih-pilih" (mendekati hill-climbing).
// ============================================================================

import type { AlgoParams, AlgoResult, Frame, Point, Tour } from "./types";
import { tourCost } from "./distance";
import { applyMove } from "./neighborhood";
import { makeRng, shuffledRange, distinctPair } from "./rng";
import { FrameRecorder } from "./frames";

export interface SAParams extends AlgoParams {
  initialTemperature?: number; // default 10000 (dari kode tim)
  coolingRate?: number; // default 0.99
  maxIterations?: number; // default 15000
  maxFrames?: number; // batas frame animasi (default 300)
}

export function runSimulatedAnnealing(
  points: Point[],
  params: SAParams = {}
): AlgoResult {
  const {
    seed,
    neighborhood = "swap",
    initialTemperature = 10000,
    coolingRate = 0.99,
    maxIterations = 15000,
    maxFrames = 300,
  } = params;

  const n = points.length;
  if (n < 2) throw new Error("places must contain at least 2 points.");

  const startTime = performance.now();
  const rng = makeRng(seed);
  const recorder = new FrameRecorder(maxFrames);
  const costHistory: number[] = [];

  let temperature = initialTemperature;

  // Solusi awal: permutasi acak (setara random.sample(range(n), n)).
  let route: Tour = shuffledRange(rng, n);
  let currentCost = tourCost(route, points);

  // Solusi terbaik sejauh ini.
  let bestRoute: Tour = route.slice();
  let bestCost = currentCost;

  for (let iter = 0; iter < maxIterations; iter++) {
    const oldCost = currentCost;

    // Buat tetangga dengan menukar dua posisi berbeda (default swap).
    const [i, j] = distinctPair(rng, n);
    const newRoute = applyMove(route, i, j, neighborhood);
    const newCost = tourCost(newRoute, points);

    const delta = newCost - oldCost; // > 0 berarti lebih buruk
    const worse = newCost >= oldCost;

    // Probabilitas penerimaan Metropolis (hanya bermakna saat langkah lebih buruk).
    // p = exp((old - new) / T) = exp(-Δ/T).
    const acceptProbability = worse ? Math.exp((oldCost - newCost) / temperature) : 1;

    // Kondisi penerimaan. Catatan: rng.next() HANYA dipanggil saat langkah lebih
    // buruk (short-circuit ||), meniru perilaku kode Python (random hanya diambil
    // di cabang else) sehingga aliran RNG tetap konsisten.
    const accepted = newCost < oldCost || rng.next() < acceptProbability;

    if (accepted) {
      route = newRoute;
      currentCost = newCost;
    }

    // Perbarui solusi terbaik.
    const improvesBest = currentCost < bestCost;
    if (improvesBest) {
      bestRoute = route.slice();
      bestCost = currentCost;
    }

    // Rekam frame (kategori menentukan prioritas saat sampling).
    const frame: Frame = {
      iteration: iter,
      currentTour: route.slice(),
      currentCost,
      bestTour: bestRoute.slice(),
      bestCost,
      accepted,
      temperature,
      deltaCost: delta,
      acceptProbability: worse ? acceptProbability : undefined,
    };
    recorder.record(
      frame,
      improvesBest ? "best" : accepted && delta > 0 ? "acceptedWorse" : "ordinary"
    );
    costHistory.push(bestCost);

    // Pendinginan + guard suhu minimum agar exp() tidak meledak.
    temperature *= coolingRate;
    if (temperature < 1e-10) temperature = 1e-10;
  }

  return {
    bestTour: bestRoute,
    bestCost,
    iterations: maxIterations,
    timeMs: performance.now() - startTime,
    frames: recorder.finalize(),
    costHistory,
  };
}
