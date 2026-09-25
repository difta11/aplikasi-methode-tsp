"use client";

// Area hasil: kanvas rute beranimasi + kontrol playback + panel edukasi +
// grafik konvergensi + ringkasan hasil.

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Trophy, Timer, Repeat2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RouteCanvas } from "./RouteCanvas";
import { AnimationControls } from "./AnimationControls";
import { StatusPanel } from "./StatusPanel";
import { ConvergenceChart } from "./ConvergenceChart";
import { useCityStore } from "@/lib/store/useCityStore";
import { useRunStore } from "@/lib/store/useRunStore";
import { validateCityCount } from "@/lib/parsing/validate";
import { MAX_CITIES_ANIMATION } from "@/lib/config";

/** Letupan kecil saat rekor rute terbaik pecah (gamifikasi ringan). */
function Confetti({
  triggerKey,
  disabled,
}: {
  triggerKey: number;
  disabled: boolean;
}) {
  // Dimatikan sepenuhnya bila pengguna meminta prefers-reduced-motion.
  if (disabled || triggerKey === 0) return null;
  const colors = [
    "var(--brand-indigo)",
    "var(--brand-teal)",
    "var(--brand-amber)",
    "var(--brand-rose)",
  ];
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * Math.PI * 2;
        return (
          <motion.span
            key={`${triggerKey}-${i}`}
            className="absolute size-2 rounded-full"
            style={{ background: colors[i % colors.length] }}
            initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            animate={{
              opacity: 0,
              x: Math.cos(angle) * 110,
              y: Math.sin(angle) * 110,
              scale: 0.3,
            }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

export function Visualizer() {
  const cities = useCityStore((s) => s.cities);
  const result = useRunStore((s) => s.result);
  const resultAlgorithm = useRunStore((s) => s.resultAlgorithm);
  const frameIndex = useRunStore((s) => s.frameIndex);
  const speed = useRunStore((s) => s.speed);
  const initialTemperature = useRunStore((s) => s.sa.initialTemperature);
  const reduceMotion = useReducedMotion();

  const canAnimate = validateCityCount(cities.length).canAnimate;

  // Frame yang ditampilkan: saat animasi mati, langsung tampilkan hasil akhir.
  const shownIndex =
    result && !canAnimate ? Math.max(0, result.frames.length - 1) : frameIndex;
  const frame = result?.frames[shownIndex];

  // Pelacak rekor untuk confetti. Memakai pola resmi React "menyesuaikan state
  // saat render" (bukan useEffect) supaya tidak memicu render berantai:
  // - hasil baru          -> reset pelacak & hitungan letupan
  // - bestCost turun      -> tambah hitungan letupan (key baru = confetti baru)
  const [burst, setBurst] = useState(0);
  const [tracked, setTracked] = useState<{
    result: typeof result;
    best: number | null;
  }>({ result: null, best: null });

  if (tracked.result !== result) {
    setTracked({ result, best: frame?.bestCost ?? null });
    setBurst(0);
  } else if (frame && tracked.best !== frame.bestCost) {
    if (tracked.best !== null && frame.bestCost < tracked.best - 1e-9) {
      setBurst((b) => b + 1);
    }
    setTracked({ result, best: frame.bestCost });
  }

  if (!result || !frame || !resultAlgorithm) {
    return (
      <section className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
        <h2 className="text-lg font-semibold">3. Visualisasi &amp; Animasi</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Jalankan salah satu solver di atas untuk melihat animasi rutenya di sini.
        </p>
      </section>
    );
  }

  const algoName =
    resultAlgorithm === "sa" ? "Simulated Annealing" : "Tabu Search";
  const duration = Math.min(0.4, (1 / speed) * 0.9);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">3. Visualisasi &amp; Animasi</h2>
          <p className="text-sm text-muted-foreground">
            Garis <span className="font-medium text-secondary">teal tebal</span> = rute
            terbaik sejauh ini; <span className="font-medium text-[var(--brand-graphite)]">abu
            tipis</span> = rute yang sedang dievaluasi.
          </p>
        </div>
        <Badge className="bg-primary text-primary-foreground">{algoName}</Badge>
      </div>

      {/* Ringkasan hasil */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border border-secondary/30 bg-[color-mix(in_oklab,var(--secondary)_6%,var(--card))] p-4">
          <Trophy className="size-5 shrink-0 text-secondary" />
          <div>
            <p className="text-xs text-muted-foreground">Jarak terbaik</p>
            <p className="text-lg font-bold text-secondary tabular-nums">
              {result.bestCost.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <Repeat2 className="size-5 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Iterasi</p>
            <p className="text-lg font-bold tabular-nums">{result.iterations}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
          <Timer className="size-5 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Waktu komputasi</p>
            <p className="text-lg font-bold tabular-nums">{result.timeMs.toFixed(1)} ms</p>
          </div>
        </div>
      </div>

      {!canAnimate && (
        <div className="flex items-start gap-2 rounded-2xl border border-accent/40 bg-[color-mix(in_oklab,var(--accent)_10%,var(--card))] p-3 text-sm">
          <Info className="mt-0.5 size-4 shrink-0 text-accent" />
          <p>
            Lebih dari {MAX_CITIES_ANIMATION} kota — animasi dinonaktifkan agar tetap
            ringan. Yang ditampilkan adalah hasil akhir beserta grafik konvergensinya.
          </p>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        {/* Kiri: kanvas + kontrol */}
        <div className="space-y-4">
          <div className="relative">
            <RouteCanvas
              cities={cities}
              currentTour={frame.currentTour}
              bestTour={frame.bestTour}
              duration={duration}
              showCurrent={canAnimate}
            />
            <Confetti triggerKey={burst} disabled={!!reduceMotion} />
          </div>
          {canAnimate && <AnimationControls />}
        </div>

        {/* Kanan: panel edukasi */}
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="text-base">Apa yang sedang terjadi?</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusPanel
              algorithm={resultAlgorithm}
              frame={frame}
              initialTemperature={initialTemperature}
            />
          </CardContent>
        </Card>
      </div>

      {/* Grafik konvergensi */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Grafik konvergensi</h3>
        <ConvergenceChart result={result} frameIndex={shownIndex} />
      </div>
    </section>
  );
}
