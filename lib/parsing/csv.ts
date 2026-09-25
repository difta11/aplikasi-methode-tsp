// ============================================================================
// Parsing CSV (PapaParse). Menghasilkan RawTable; validasi ada di validate.ts.
// ============================================================================

import Papa from "papaparse";
import { analyzeTable } from "./validate";
import type { RawTable } from "@/lib/types";

/** Parse teks CSV menjadi RawTable (deteksi header otomatis). */
export function parseCsvText(text: string): RawTable {
  const result = Papa.parse<string[]>(text, { skipEmptyLines: "greedy" });
  const rows = (result.data as unknown as string[][]) ?? [];
  return analyzeTable(rows);
}

/** Baca File CSV (browser) -> RawTable. */
export function parseCsvFile(file: File): Promise<RawTable> {
  return file.text().then((text) => parseCsvText(text));
}
