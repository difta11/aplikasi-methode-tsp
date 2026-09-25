"use client";

// Grafik konvergensi: sumbu-x iterasi, sumbu-y biaya rute.
// Garis hanya digambar sampai frame yang sedang tampil, sehingga grafik
// "tumbuh" seiring animasi berjalan.

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AlgoResult } from "@/lib/tsp/types";

export function ConvergenceChart({
  result,
  frameIndex,
}: {
  result: AlgoResult;
  frameIndex: number;
}) {
  const all = useMemo(
    () =>
      result.frames.map((f) => ({
        iteration: f.iteration,
        best: Number(f.bestCost.toFixed(2)),
        current: Number(f.currentCost.toFixed(2)),
      })),
    [result]
  );

  // Domain dikunci dari seluruh data agar sumbu tidak melompat saat animasi.
  const { xMax, yMin, yMax } = useMemo(() => {
    const costs = all.flatMap((d) => [d.best, d.current]);
    return {
      xMax: all.length ? all[all.length - 1].iteration : 0,
      yMin: Math.min(...costs),
      yMax: Math.max(...costs),
    };
  }, [all]);

  const visible = all.slice(0, frameIndex + 1);

  return (
    <div className="h-64 w-full rounded-2xl border border-border bg-card p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={visible} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
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
          />
          <Line
            type="monotone"
            dataKey="current"
            name="Rute saat ini"
            stroke="var(--brand-indigo)"
            strokeWidth={1.5}
            strokeOpacity={0.45}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="best"
            name="Rute terbaik"
            stroke="var(--brand-teal)"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
