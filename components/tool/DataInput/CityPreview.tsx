"use client";

// Pratinjau sebaran kota sebagai scatter SVG. Membantu user memastikan data
// ter-load benar. Koordinat dinormalisasi agar selalu pas dalam viewBox.

import { useMemo } from "react";
import type { City } from "@/lib/types";

const W = 480;
const H = 320;
const PAD = 28;

export function CityPreview({ cities }: { cities: City[] }) {
  const points = useMemo(() => {
    if (cities.length === 0) return [];
    const xs = cities.map((c) => c.x);
    const ys = cities.map((c) => c.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;
    return cities.map((c, i) => ({
      i,
      label: c.label,
      // Sumbu Y dibalik agar y besar tampak di atas (konvensi kartesius).
      cx: PAD + ((c.x - minX) / spanX) * (W - 2 * PAD),
      cy: H - (PAD + ((c.y - minY) / spanY) * (H - 2 * PAD)),
    }));
  }, [cities]);

  // Label disembunyikan saat kota banyak agar tidak saling tumpang tindih.
  const showLabels = cities.length <= 15;

  if (cities.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
        Pratinjau sebaran kota muncul di sini setelah data dimuat.
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full rounded-2xl border border-border bg-card"
      role="img"
      aria-label={`Pratinjau ${cities.length} kota`}
    >
      {points.map((p) => (
        <g key={p.i}>
          <circle cx={p.cx} cy={p.cy} r={7} fill="var(--brand-indigo)" opacity={0.85} />
          {showLabels && (
            <text
              x={p.cx}
              y={p.cy - 11}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: 10 }}
            >
              {p.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
