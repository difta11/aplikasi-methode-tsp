"use client";

// Panel upload file CSV/Excel. Semua parsing dibungkus try/catch; error tampil
// sebagai toast + inline alert yang ramah (bukan stack trace).

import { useRef, useState } from "react";
import { toast } from "sonner";
import { UploadCloud, FileWarning, TableProperties } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ColumnMapper } from "./ColumnMapper";
import { useCityStore } from "@/lib/store/useCityStore";
import { ACCEPTED_EXTENSIONS } from "@/lib/config";
import {
  buildCities,
  detectMappingFromHeaders,
  validateCityCount,
} from "@/lib/parsing/validate";
import { parseCsvFile } from "@/lib/parsing/csv";
import { parseExcelFile } from "@/lib/parsing/excel";
import type { ColumnMapping, DataSource, RawTable, RowError } from "@/lib/types";
import { cn } from "@/lib/utils";

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i).toLowerCase();
}

export function Upload() {
  const setCities = useCityStore((s) => s.setCities);
  const inputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  const [rowErrors, setRowErrors] = useState<RowError[]>([]);
  const [pendingTable, setPendingTable] = useState<RawTable | null>(null);
  const [pendingSource, setPendingSource] = useState<DataSource>("csv");
  const [mappingOpen, setMappingOpen] = useState(false);

  function applyMapping(table: RawTable, mapping: ColumnMapping, source: DataSource) {
    const { cities, errors } = buildCities(table, mapping);
    setRowErrors(errors);

    if (cities.length === 0) {
      toast.error("Tidak ada baris data yang valid pada file ini.");
      return;
    }

    setCities(cities, source);

    const count = validateCityCount(cities.length);
    if (errors.length > 0) {
      toast.warning(
        `${cities.length} kota dimuat, ${errors.length} baris dilewati karena bermasalah.`
      );
    } else if (!count.ok) {
      toast.warning(count.message ?? "Jumlah kota di luar batas.");
    } else {
      toast.success(`${cities.length} kota berhasil dimuat.`);
    }
  }

  async function handleFile(file: File) {
    const ext = extOf(file.name);
    if (!(ACCEPTED_EXTENSIONS as readonly string[]).includes(ext)) {
      toast.error(
        `Format "${ext || "tidak dikenal"}" tidak didukung. Gunakan CSV atau Excel (.csv, .xlsx, .xls).`
      );
      return;
    }

    const source: DataSource = ext === ".csv" ? "csv" : "excel";

    try {
      const table = ext === ".csv" ? await parseCsvFile(file) : await parseExcelFile(file);

      if (table.rows.length === 0) {
        toast.error("File tampak kosong atau tidak berisi baris data.");
        return;
      }

      setPendingTable(table);
      setPendingSource(source);

      const mapping = table.headers ? detectMappingFromHeaders(table.headers) : null;
      if (mapping) {
        applyMapping(table, mapping, source);
      } else {
        // Header x/y tak terdeteksi -> minta pemetaan manual (jangan crash).
        toast.info("Header kolom tidak terdeteksi — silakan petakan kolom.");
        setMappingOpen(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal membaca file. Pastikan file CSV/Excel tidak rusak.");
    }
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border bg-muted/20"
        )}
      >
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <UploadCloud className="size-6" />
        </div>
        <div>
          <p className="font-medium">Tarik & letakkan file di sini</p>
          <p className="text-sm text-muted-foreground">
            CSV atau Excel — wajib ada kolom <code>x</code> dan <code>y</code>.
          </p>
        </div>
        <Button variant="outline" onClick={() => inputRef.current?.click()}>
          Pilih file
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = ""; // reset agar file sama bisa dipilih ulang
          }}
        />
      </div>

      {pendingTable && (
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => setMappingOpen(true)}
        >
          <TableProperties className="size-4" />
          Petakan ulang kolom
        </Button>
      )}

      {rowErrors.length > 0 && (
        <Alert variant="destructive">
          <FileWarning className="size-4" />
          <AlertTitle>{rowErrors.length} baris dilewati</AlertTitle>
          <AlertDescription>
            <ul className="mt-1 max-h-40 list-disc space-y-0.5 overflow-auto pl-4 text-sm">
              {rowErrors.slice(0, 20).map((e, i) => (
                <li key={i}>
                  Baris {e.rowNumber}: {e.message}
                </li>
              ))}
              {rowErrors.length > 20 && <li>… dan {rowErrors.length - 20} lainnya</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <ColumnMapper
        open={mappingOpen}
        onOpenChange={setMappingOpen}
        table={pendingTable}
        onConfirm={(mapping) => {
          if (pendingTable) applyMapping(pendingTable, mapping, pendingSource);
          setMappingOpen(false);
        }}
      />
    </div>
  );
}
