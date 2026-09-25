// ============================================================================
// Parsing Excel (SheetJS/xlsx). Menghasilkan RawTable; validasi ada di validate.ts.
// Hanya sheet PERTAMA yang dibaca.
// ============================================================================

import * as XLSX from "xlsx";
import { analyzeTable } from "./validate";
import type { RawTable } from "@/lib/types";

/** Parse buffer workbook Excel (sheet pertama) menjadi RawTable. */
export function parseWorkbookBuffer(buffer: ArrayBuffer): RawTable {
  const wb = XLSX.read(buffer, { type: "array" });
  const firstSheetName = wb.SheetNames[0];
  if (!firstSheetName) return { headers: null, rows: [] };

  const sheet = wb.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    raw: true,
    defval: "",
    blankrows: false,
  });

  const asStrings = (rows as unknown as unknown[][]).map((r) =>
    r.map((c) => (c === null || c === undefined ? "" : String(c)))
  );
  return analyzeTable(asStrings);
}

/** Baca File Excel (browser) -> RawTable. */
export function parseExcelFile(file: File): Promise<RawTable> {
  return file.arrayBuffer().then((buf) => parseWorkbookBuffer(buf));
}
