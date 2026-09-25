// ============================================================================
// Konfigurasi terpusat: batasan data, alias header, dan token palet.
// Satu sumber kebenaran — jangan hardcode angka batas di komponen.
// ============================================================================

/** Minimal kota agar TSP bermakna (butuh siklus). */
export const MIN_CITIES = 3;

/** Batas keras jumlah kota (pengaman performa browser). */
export const MAX_CITIES = 200;

/**
 * Maksimal kota untuk MODE ANIMASI. Di atas ini optimasi tetap boleh dijalankan,
 * tetapi animasi rute dinonaktifkan + beri info.
 *
 * Spec awal memakai 30, tapi hasil ukur di Chrome menunjukkan animasi tetap mulus
 * sampai batas keras: 45 kota ±135 fps, 100 kota ±150 fps, 200 kota ±109 fps.
 * Karena itu disamakan dengan MAX_CITIES (semua dataset yang diterima ikut
 * dianimasikan). Turunkan nilainya bila ingin mematikan animasi untuk dataset besar.
 */
export const MAX_CITIES_ANIMATION = MAX_CITIES;

/** Jumlah frame maksimum yang direkam untuk animasi. */
export const MAX_FRAMES = 300;

/** Nama header yang dikenali (case-insensitive, sudah di-lowercase). */
export const HEADER_ALIASES = {
  x: ["x"],
  y: ["y"],
  label: ["label", "name", "nama", "kota", "city"],
} as const;

/** Ekstensi file yang didukung untuk upload. */
export const ACCEPTED_EXTENSIONS = [".csv", ".xlsx", ".xls"] as const;

/**
 * Palet "Deep Indigo". Nilai yang sama juga didefinisikan sebagai CSS
 * variable di app/globals.css; konstanta ini untuk keperluan JS (mis. warna SVG
 * yang dihitung, atau interpolasi gradasi).
 */
export const PALETTE = {
  indigo: "#3a3ab5", // primary
  violet: "#6d28d9", // warna grafik tambahan
  teal: "#0b6e63", // rute optimum
  amber: "#9c6300", // SA / termometer suhu
  rose: "#a32347", // sisi tabu / danger
  graphite: "#9aa0b4", // rute yang sedang dievaluasi
  ink: "#0d1017", // teks
} as const;
