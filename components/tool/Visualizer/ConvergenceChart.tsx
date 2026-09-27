"use client";

// Grafik konvergensi: sumbu-x iterasi, sumbu-y biaya rute.
//
// Kurva penuh digambar samar sebagai latar, lalu bagian yang sudah dilalui
// animasi ditimpa dengan garis pekat dan sebuah penanda posisi. Sebelumnya
// hanya bagian yang sudah dilalui yang digambar, sehingga selama animasi
// berjalan sebagian besar bidang grafik kosong melompong dan terlihat seperti
// grafik yang gagal dimuat.

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AlgoResult } from "@/lib/tsp/types";

/** Satu butir keterangan warna. */
function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className="h-0.5 w-4 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

export function ConvergenceChart({
  result,
  frameIndex,
}: {
  result: AlgoResult;
  frameIndex: number;
}) {
  // Kurva latar diambil dari costHistory (satu nilai per iterasi, panjang penuh),
  // bukan dari frames yang sudah disubsample — supaya grafik selalu mewakili
  // keseluruhan run. Disampel ke <= 600 titik agar SVG-nya tetap ringan.
  const ghost = useMemo(() => {
    const h = result.costHistory ?? [];
    const maks = 600;
    if (h.length <= maks) {
      return h.map((v, i) => ({ iteration: i, ghost: Number(v.toFixed(2)) }));
    }
    const step = (h.length - 1) / (maks - 1);
    return Array.from({ length: maks }, (_, i) => {
      const idx = Math.round(i * step);
      return { iteration: idx, ghost: Number(h[idx].toFixed(2)) };
    });
  }, [result]);

  const all = useMemo(
    () =>
      result.frames.map((f) => ({
        iteration: f.iteration,
        best: Number(f.bestCost.toFixed(2)),
        current: Number(f.currentCost.toFixed(2)),
      })),
    [result]
  );

  // Domain dikunci dari seluruh run agar sumbu tidak melompat saat animasi,
  // dan agar panjang sumbu-x jujur mewakili jumlah iterasi yang dijalankan.
  const { xMax, yMin, yMax } = useMemo(() => {
    const costs = [...all.flatMap((d) => [d.best, d.current]), ...ghost.map((g) => g.ghost)];
    return {
      xMax: Math.max(result.iterations - 1, 0),
      yMin: Math.min(...costs),
      yMax: Math.max(...costs),
    };
  }, [all, ghost, result.iterations]);

  // Satu dataset gabungan: titik latar (ghost) + titik progres sampai frame kini.
  const data = useMemo(() => {
    const byIter = new Map<
      number,
      { iteration: number; ghost?: number; best?: number; current?: number }
    >();
    for (const g of ghost) byIter.set(g.iteration, { ...g });
    for (let i = 0; i <= Math.min(frameIndex, all.length - 1); i++) {
      const d = all[i];
      const ada = byIter.get(d.iteration) ?? { iteration: d.iteration };
      byIter.set(d.iteration, { ...ada, best: d.best, current: d.current });
    }
    return [...byIter.values()].sort((a, b) => a.iteration - b.iteration);
  }, [ghost, all, frameIndex]);

  const iterasiKini = all[Math.min(frameIndex, all.length - 1)]?.iteration ?? 0;

  return (
    <div className="space-y-2 rounded-2xl border border-border bg-card p-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
        <LegendDot color="var(--brand-teal)" label="Rute terbaik" />
        <LegendDot color="var(--brand-indigo)" label="Rute saat ini" />
        <span className="opacity-70">Bagian pucat = yang belum dilalui animasi</span>
      </div>
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="iteration"
              type="number"
              domain={[0, xMax]}
              allowDataOverflow
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              label={{
                value: "Iterasi",
                position: "insideBottom",
                offset: -2,
                style: { fontSize: 11, fill: "var(--muted-foreground)" },
              }}
            />
            <YAxis
              domain={[Math.floor(yMin * 0.98), Math.ceil(yMax * 1.02)]}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              width={62}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--border)",
                fontSize: 12,
              }}
              labelFormatter={(v) => `Iterasi ${v}`}
              formatter={(value, name) => [value, name]}
            />

            {/* Latar: kurva rute terbaik sepanjang seluruh run, sangat samar. */}
            <Line
              type="monotone"
              dataKey="ghost"
              name="Rute terbaik (keseluruhan)"
              stroke="var(--brand-teal)"
              strokeWidth={2.5}
              strokeOpacity={0.18}
              dot={false}
              isAnimationActive={false}
              connectNulls
              legendType="none"
            />

            {/* Depan: bagian yang sudah dilalui animasi. */}
            <Line
              type="monotone"
              dataKey="current"
              name="Rute saat ini"
              stroke="var(--brand-indigo)"
              strokeWidth={1.5}
              strokeOpacity={0.45}
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="best"
              name="Rute terbaik"
              stroke="var(--brand-teal)"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
              connectNulls
            />

            <ReferenceLine
              x={iterasiKini}
              stroke="var(--muted-foreground)"
              strokeOpacity={0.45}
              strokeDasharray="4 4"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
