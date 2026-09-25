"use client";

// Panel edukasi "Apa yang sedang terjadi" — isinya berbeda per algoritma.
// SA: termometer suhu + kartu probabilitas Metropolis p = e^(-Δ/T).
// TS: daftar tabu list + sorotan momen aspiration.

import { motion, useReducedMotion } from "motion/react";
import { Flame, Ban, Sparkles, TrendingDown, ThumbsDown, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Frame } from "@/lib/tsp/types";
import type { AlgorithmKey } from "@/lib/store/useRunStore";
import { cn } from "@/lib/utils";

/** Istilah dengan penjelasan kontekstual (mode edukasi ringan). */
function ConceptTip({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="cursor-help underline decoration-dotted underline-offset-4">
            {term}
          </span>
        }
      />
      <TooltipContent className="max-w-xs text-pretty">{children}</TooltipContent>
    </Tooltip>
  );
}

/** Angka biaya yang "hidup": memantul saat nilainya berubah. */
function CostStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "current" | "best";
}) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <motion.p
        key={value}
        initial={reduceMotion ? false : { scale: 1.18 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 18 }}
        className={cn(
          "text-xl font-bold tabular-nums",
          tone === "best" ? "text-secondary" : "text-primary"
        )}
      >
        {value.toFixed(2)}
      </motion.p>
    </div>
  );
}

/** Termometer suhu (skala logaritmik, karena suhu meluruh eksponensial). */
function Thermometer({ temperature, initial }: { temperature: number; initial: number }) {
  const reduceMotion = useReducedMotion();
  const minT = 1e-10;
  const frac = Math.max(
    0,
    Math.min(
      1,
      (Math.log10(Math.max(temperature, minT)) - Math.log10(minT)) /
        (Math.log10(initial) - Math.log10(minT))
    )
  );

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-32 w-5 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="absolute bottom-0 w-full rounded-full bg-accent"
          animate={{ height: `${frac * 100}%` }}
          transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeOut" }}
        />
      </div>
      <div>
        <p className="flex items-center gap-1.5 text-sm font-medium">
          <Flame className="size-4 text-accent" />
          <ConceptTip term="Suhu (T)">
            Suhu mengatur seberapa berani algoritma menerima rute yang lebih buruk.
            Awalnya tinggi (banyak eksplorasi), lalu didinginkan sedikit demi sedikit
            sampai perilakunya mirip pendakian bukit biasa.
          </ConceptTip>
        </p>
        <p className="font-mono text-lg font-bold text-accent tabular-nums">
          {temperature < 0.01 ? temperature.toExponential(2) : temperature.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

function SAPanel({ frame, initialTemperature }: { frame: Frame; initialTemperature: number }) {
  const delta = frame.deltaCost ?? 0;
  const worseAccepted = frame.accepted && delta > 0;

  return (
    <div className="space-y-4">
      <Thermometer temperature={frame.temperature ?? 0} initial={initialTemperature} />

      {worseAccepted ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-accent/40 bg-accent/10 p-3"
        >
          <p className="flex items-center gap-1.5 text-sm font-semibold text-accent">
            <Zap className="size-4 text-accent" />
            Menerima langkah lebih buruk
          </p>
          <p className="mt-1 font-mono text-sm">
            p = e<sup>(−Δ/T)</sup> = e<sup>(−{delta.toFixed(2)} / {(frame.temperature ?? 0).toFixed(2)})</sup> ={" "}
            <span className="font-bold">{(frame.acceptProbability ?? 0).toFixed(4)}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Rute jadi {delta.toFixed(2)} lebih panjang, tapi tetap diterima — ini caranya{" "}
            <ConceptTip term="kabur dari optimum lokal">
              Optimum lokal = rute yang tampak terbaik di sekitarnya, padahal masih ada
              rute jauh lebih pendek di tempat lain. Sesekali menerima rute lebih buruk
              membuat pencarian bisa keluar dari jebakan itu.
            </ConceptTip>
            .
          </p>
        </motion.div>
      ) : delta < 0 ? (
        <div className="rounded-2xl border border-secondary/40 bg-secondary/10 p-3">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-secondary">
            <TrendingDown className="size-4" />
            Langkah lebih baik — langsung diterima
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Rute memendek {Math.abs(delta).toFixed(2)}.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-muted/30 p-3">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
            <ThumbsDown className="size-4" />
            Langkah lebih buruk ditolak
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Δ = +{delta.toFixed(2)}; undian acak melebihi p, jadi rute tidak berubah.
          </p>
        </div>
      )}
    </div>
  );
}

function TSPanel({ frame }: { frame: Frame }) {
  const tabu = (frame.tabuList ?? [])
    .map((t) => ({ ...t, remaining: t.expiresAt - frame.iteration }))
    .sort((a, b) => b.remaining - a.remaining)
    .slice(0, 8);

  return (
    <div className="space-y-4">
      {frame.aspiration ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-secondary/50 bg-secondary/10 p-3"
        >
          <p className="flex items-center gap-1.5 text-sm font-semibold text-secondary">
            <Sparkles className="size-4" />
            Aspiration!
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Gerakan ini sebenarnya <ConceptTip term="tabu">
              Tabu = gerakan yang baru saja dipakai, jadi dilarang sementara supaya
              pencarian tidak bolak-balik di tempat yang sama.
            </ConceptTip>, tapi tetap dipakai karena menghasilkan rute lebih pendek
            daripada rekor terbaik.
          </p>
        </motion.div>
      ) : frame.isTabuMove ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-3">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-destructive">
            <Ban className="size-4" />
            Semua tetangga tabu
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Dipilih gerakan yang sisa masa tabunya paling pendek, agar pencarian tetap
            berjalan (tidak berhenti mendadak).
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-muted/30 p-3">
          <p className="text-sm font-semibold">Memilih tetangga terbaik non-tabu</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Gerakan tukar posisi{" "}
            <span className="font-mono font-semibold text-foreground">
              ({frame.move?.[0]}, {frame.move?.[1]})
            </span>
            .
          </p>
        </div>
      )}

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
          <Ban className="size-4 text-destructive" />
          <ConceptTip term="Tabu list">
            Daftar gerakan yang sedang dilarang beserta sisa umurnya (tenure). Tiap
            iterasi umurnya berkurang; saat habis, gerakan itu boleh dipakai lagi.
          </ConceptTip>
          <span className="text-muted-foreground">({frame.tabuList?.length ?? 0} aktif)</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {tabu.length === 0 && (
            <span className="text-xs text-muted-foreground">Belum ada gerakan terlarang.</span>
          )}
          {tabu.map((t) => (
            <motion.span
              key={`${t.move[0]}-${t.move[1]}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              // Transisi singkat tanpa stagger: saat playback cepat, animasi yang
              // lebih lama dari satu frame membuat chip tampak berkedip.
              transition={{ duration: 0.12 }}
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-2 py-1 font-mono text-xs text-destructive"
            >
              ({t.move[0]},{t.move[1]}) · {t.remaining}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StatusPanel({
  algorithm,
  frame,
  initialTemperature,
}: {
  algorithm: AlgorithmKey;
  frame: Frame;
  initialTemperature: number;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <CostStat label="Rute saat ini" value={frame.currentCost} tone="current" />
        <CostStat label="Rute terbaik" value={frame.bestCost} tone="best" />
      </div>
      {algorithm === "sa" ? (
        <SAPanel frame={frame} initialTemperature={initialTemperature} />
      ) : (
        <TSPanel frame={frame} />
      )}
    </div>
  );
}
