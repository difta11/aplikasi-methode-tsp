// ============================================================================
// Validasi & pembentukan data kota dari tabel mentah.
// Semua fungsi di sini MURNI & framework-agnostik agar mudah dites headless.
//
// Prinsip anti-bug: fungsi ini tidak pernah melempar untuk data yang "cuma
// jelek" — ia mengembalikan { cities, errors } supaya UI bisa menunjukkan
// baris mana yang bermasalah dan membiarkan user memperbaikinya.
// ============================================================================

import {
  HEADER_ALIASES,
  MAX_CITIES,
  MAX_CITIES_ANIMATION,
  MIN_CITIES,
} from "@/lib/config";
import type {
  BuildResult,
  City,
  ColumnMapping,
  RawTable,
  RowError,
} from "@/lib/types";

/** Normalisasi teks header: lowercase + trim. */
function norm(s: string): string {
  return String(s ?? "").trim().toLowerCase();
}

/** Apakah sebuah string merepresentasikan angka valid? (toleran koma desimal & spasi) */
export function parseNumberCell(raw: string): number | null {
  let s = String(raw ?? "").trim();
  if (s === "") return null;
  // Toleransi format lokal Indonesia: "3,5" -> "3.5" (hanya jika jelas desimal).
  if (/^-?\d+,\d+$/.test(s)) s = s.replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Deteksi pemetaan kolom dari baris header (case-insensitive). null jika x/y tak ketemu. */
export function detectMappingFromHeaders(headers: string[]): ColumnMapping | null {
  let x = -1;
  let y = -1;
  let label = -1;
  headers.forEach((h, idx) => {
    const key = norm(h);
    if (x === -1 && (HEADER_ALIASES.x as readonly string[]).includes(key)) x = idx;
    else if (y === -1 && (HEADER_ALIASES.y as readonly string[]).includes(key)) y = idx;
    else if (label === -1 && (HEADER_ALIASES.label as readonly string[]).includes(key))
      label = idx;
  });
  if (x === -1 || y === -1) return null;
  return { x, y, label: label === -1 ? null : label };
}

/** Apakah baris pertama tampak seperti header (mengandung teks non-angka)? */
function rowLooksLikeHeader(row: string[]): boolean {
  return row.some((c) => {
    const t = String(c ?? "").trim();
    return t !== "" && parseNumberCell(t) === null;
  });
}

/** Pisahkan baris menjadi header (jika ada) + baris data. Sel di-trim. */
export function analyzeTable(rawRows: string[][]): RawTable {
  const rows = rawRows
    .map((r) => r.map((c) => String(c ?? "").trim()))
    .filter((r) => r.some((c) => c !== "")); // buang baris kosong total

  if (rows.length === 0) return { headers: null, rows: [] };

  if (rowLooksLikeHeader(rows[0])) {
    return { headers: rows[0], rows: rows.slice(1) };
  }
  return { headers: null, rows };
}

/**
 * Tebakan pemetaan default saat TIDAK ada header (untuk mengisi awal dropdown UI):
 * - 2 kolom  -> x=0, y=1
 * - >=3 kolom-> label=0, x=1, y=2 (asumsi kolom pertama nama)
 */
export function guessMapping(columnCount: number): ColumnMapping | null {
  if (columnCount < 2) return null;
  if (columnCount === 2) return { x: 0, y: 1, label: null };
  return { x: 1, y: 2, label: 0 };
}

/**
 * Bangun daftar City dari tabel mentah + pemetaan kolom.
 * Mengumpulkan error per-baris (sel kosong / non-numerik) alih-alih melempar.
 */
export function buildCities(table: RawTable, mapping: ColumnMapping): BuildResult {
  const cities: City[] = [];
  const errors: RowError[] = [];

  table.rows.forEach((row, i) => {
    // rowNumber ramah-user: +1 untuk 1-based, +1 lagi jika ada baris header.
    const rowNumber = i + 1 + (table.headers ? 1 : 0);
    const xRaw = row[mapping.x];
    const yRaw = row[mapping.y];
    const x = parseNumberCell(xRaw ?? "");
    const y = parseNumberCell(yRaw ?? "");

    if (x === null || y === null) {
      const bad: string[] = [];
      if (x === null) bad.push(`x ("${xRaw ?? ""}")`);
      if (y === null) bad.push(`y ("${yRaw ?? ""}")`);
      errors.push({
        rowNumber,
        message: `Nilai ${bad.join(" & ")} kosong atau bukan angka.`,
      });
      return;
    }

    const rawLabel =
      mapping.label !== null ? String(row[mapping.label] ?? "").trim() : "";
    const label = rawLabel !== "" ? rawLabel : `Kota ${cities.length + 1}`;
    cities.push({ label, x, y });
  });

  return { cities, errors };
}

/** Hasil validasi jumlah kota: ok? boleh animasi? + pesan bila bermasalah. */
export type CountValidation = {
  ok: boolean;
  canAnimate: boolean;
  message: string | null;
};

/** Validasi jumlah kota terhadap batas di config. */
export function validateCityCount(n: number): CountValidation {
  if (n < MIN_CITIES) {
    return {
      ok: false,
      canAnimate: false,
      message: `Minimal ${MIN_CITIES} kota diperlukan (saat ini ${n}).`,
    };
  }
  if (n > MAX_CITIES) {
    return {
      ok: false,
      canAnimate: false,
      message: `Terlalu banyak: maksimal ${MAX_CITIES} kota (saat ini ${n}).`,
    };
  }
  if (n > MAX_CITIES_ANIMATION) {
    return {
      ok: true,
      canAnimate: false,
      message: `Lebih dari ${MAX_CITIES_ANIMATION} kota: optimasi tetap jalan, tapi animasi dinonaktifkan.`,
    };
  }
  return { ok: true, canAnimate: true, message: null };
}
