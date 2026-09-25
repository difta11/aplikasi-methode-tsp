// ============================================================================
// Kontrak data input kota.
// ============================================================================

/** Satu kota: label (nama), koordinat x & y (angka valid & finite). */
export type City = {
  label: string;
  x: number;
  y: number;
};

/**
 * Tabel mentah hasil parsing file (semua sel sebagai string, belum divalidasi).
 * headers = null artinya file tidak punya baris header.
 */
export type RawTable = {
  headers: string[] | null;
  rows: string[][];
};

/** Pemetaan kolom -> peran. Indeks kolom pada RawTable. label null = auto-generate. */
export type ColumnMapping = {
  x: number;
  y: number;
  label: number | null;
};

/** Error pada baris data tertentu (rowNumber 1-based, sesuai yang dilihat user). */
export type RowError = {
  rowNumber: number;
  message: string;
};

/** Hasil membangun daftar kota dari tabel mentah + mapping. */
export type BuildResult = {
  cities: City[];
  errors: RowError[];
};

/** Sumber data yang sedang aktif (untuk badge/informasi UI). */
export type DataSource = "manual" | "csv" | "excel" | "sample" | "none";
