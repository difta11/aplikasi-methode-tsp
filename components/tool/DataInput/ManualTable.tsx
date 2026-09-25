"use client";

// Panel input manual: tabel editable. Sinkron dua arah dengan store.
// Angka disimpan sebagai string saat diedit (agar bisa mengetik "-", "1." dsb),
// lalu di-commit ke store sebagai number.

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCityStore } from "@/lib/store/useCityStore";
import { parseNumberCell } from "@/lib/parsing/validate";
import type { City } from "@/lib/types";
import { cn } from "@/lib/utils";

type Row = { label: string; x: string; y: string };

const toRows = (cities: City[]): Row[] =>
  cities.map((c) => ({ label: c.label, x: String(c.x), y: String(c.y) }));

const invalidNum = (v: string) => v.trim() !== "" && parseNumberCell(v) === null;

export function ManualTable() {
  const cities = useCityStore((s) => s.cities);
  const source = useCityStore((s) => s.source);
  const setCities = useCityStore((s) => s.setCities);

  const [rows, setRows] = useState<Row[]>(() => toRows(cities));

  // Sinkron dari store HANYA saat data datang dari luar (upload/sample), bukan
  // dari edit manual kita sendiri (mencegah loop). Memakai pola resmi React
  // "menyesuaikan state saat render" agar tidak memicu render berantai.
  const [lastCities, setLastCities] = useState(cities);
  if (cities !== lastCities) {
    setLastCities(cities);
    if (source !== "manual") setRows(toRows(cities));
  }

  function commit(next: Row[]) {
    setRows(next);
    const parsed: City[] = next.map((r, i) => ({
      label: r.label.trim() || `Kota ${i + 1}`,
      x: parseNumberCell(r.x) ?? 0,
      y: parseNumberCell(r.y) ?? 0,
    }));
    setCities(parsed, "manual");
  }

  const update = (i: number, field: keyof Row, val: string) => {
    const next = rows.map((r, k) => (k === i ? { ...r, [field]: val } : r));
    commit(next);
  };
  const addRow = () => commit([...rows, { label: "", x: "", y: "" }]);
  const removeRow = (i: number) => commit(rows.filter((_, k) => k !== i));

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="w-10 px-3 py-2 text-left font-medium">#</th>
              <th className="px-3 py-2 text-left font-medium">Label</th>
              <th className="px-3 py-2 text-left font-medium">X</th>
              <th className="px-3 py-2 text-left font-medium">Y</th>
              <th className="w-12 px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                  Belum ada kota. Klik “Tambah kota” untuk mulai.
                </td>
              </tr>
            )}
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-3 py-1.5 text-muted-foreground">{i + 1}</td>
                <td className="px-2 py-1.5">
                  <Input
                    value={r.label}
                    placeholder={`Kota ${i + 1}`}
                    onChange={(e) => update(i, "label", e.target.value)}
                    className="h-8"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    inputMode="decimal"
                    value={r.x}
                    onChange={(e) => update(i, "x", e.target.value)}
                    className={cn("h-8", invalidNum(r.x) && "border-destructive")}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    inputMode="decimal"
                    value={r.y}
                    onChange={(e) => update(i, "y", e.target.value)}
                    className={cn("h-8", invalidNum(r.y) && "border-destructive")}
                  />
                </td>
                <td className="px-2 py-1.5 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeRow(i)}
                    aria-label={`Hapus baris ${i + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button variant="outline" className="gap-2" onClick={addRow}>
        <Plus className="size-4" />
        Tambah kota
      </Button>
    </div>
  );
}
