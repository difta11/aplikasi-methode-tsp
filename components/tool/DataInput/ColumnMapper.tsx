"use client";

// Dialog pemetaan kolom manual. Muncul saat header x/y tidak terdeteksi otomatis.
// User memilih kolom mana = x, mana = y, dan (opsional) kolom label.

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ColumnMapping, RawTable } from "@/lib/types";
import { guessMapping } from "@/lib/parsing/validate";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: RawTable | null;
  onConfirm: (mapping: ColumnMapping) => void;
};

const AUTO = "-1"; // nilai khusus untuk label = auto-generate

export function ColumnMapper({ open, onOpenChange, table, onConfirm }: Props) {
  const columnCount = useMemo(() => {
    if (!table) return 0;
    if (table.headers) return table.headers.length;
    return table.rows.reduce((m, r) => Math.max(m, r.length), 0);
  }, [table]);

  const columnLabels = useMemo(
    () =>
      Array.from({ length: columnCount }, (_, i) =>
        table?.headers?.[i] ? `${table.headers[i]}` : `Kolom ${i + 1}`
      ),
    [columnCount, table]
  );

  const [x, setX] = useState(0);
  const [y, setY] = useState(1);
  const [label, setLabel] = useState<number>(-1);

  // Isi tebakan awal tiap kali TABEL BARU masuk. Memakai pola resmi React
  // "menyesuaikan state saat render" (bukan useEffect), supaya tidak memicu
  // render berantai: bandingkan tabel dengan yang terakhir dipakai.
  const [lastTable, setLastTable] = useState<RawTable | null>(null);
  if (table !== lastTable) {
    setLastTable(table);
    if (table) {
      const guess = guessMapping(columnCount);
      setX(guess?.x ?? 0);
      setY(guess?.y ?? Math.min(1, columnCount - 1));
      setLabel(guess?.label ?? -1);
    }
  }

  const sameXY = x === y;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Petakan kolom data</DialogTitle>
          <DialogDescription>
            Header x/y tidak terdeteksi otomatis. Tentukan kolom mana yang berisi
            koordinat.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Kolom X (wajib)</Label>
            <Select value={String(x)} onValueChange={(v) => setX(Number(v))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {columnLabels.map((c, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Kolom Y (wajib)</Label>
            <Select value={String(y)} onValueChange={(v) => setY(Number(v))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {columnLabels.map((c, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Kolom Label (opsional)</Label>
            <Select value={String(label)} onValueChange={(v) => setLabel(Number(v))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AUTO}>— Otomatis (Kota 1, 2, …) —</SelectItem>
                {columnLabels.map((c, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {sameXY && (
            <p className="text-sm text-destructive">
              Kolom X dan Y tidak boleh sama.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            disabled={sameXY}
            onClick={() => onConfirm({ x, y, label: label === -1 ? null : label })}
          >
            Gunakan pemetaan ini
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
