// ============================================================================
// State global daftar kota (Zustand). Ringan, semua data tetap di browser —
// tidak ada yang dikirim ke server (client-side only).
// ============================================================================

import { create } from "zustand";
import type { City, DataSource } from "@/lib/types";
import { SAMPLES, type SampleKey } from "@/lib/samples";

type CityState = {
  cities: City[];
  source: DataSource;

  /** Ganti seluruh daftar kota (dipakai upload file / mapping). */
  setCities: (cities: City[], source: DataSource) => void;
  /** Tambah satu baris kota (input manual). */
  addCity: (city?: Partial<City>) => void;
  /** Hapus kota pada indeks tertentu. */
  removeCity: (index: number) => void;
  /** Ubah satu field kota (input manual). */
  updateCity: (index: number, patch: Partial<City>) => void;
  /** Kosongkan semua kota. */
  clear: () => void;
  /** Muat dataset contoh bawaan. */
  loadSample: (key: SampleKey) => void;
};

export const useCityStore = create<CityState>((set) => ({
  cities: [],
  source: "none",

  setCities: (cities, source) => set({ cities, source }),

  addCity: (city) =>
    set((state) => ({
      cities: [
        ...state.cities,
        {
          label: city?.label ?? `Kota ${state.cities.length + 1}`,
          x: city?.x ?? 0,
          y: city?.y ?? 0,
        },
      ],
      source: "manual",
    })),

  removeCity: (index) =>
    set((state) => ({
      cities: state.cities.filter((_, i) => i !== index),
      source: "manual",
    })),

  updateCity: (index, patch) =>
    set((state) => ({
      cities: state.cities.map((c, i) => (i === index ? { ...c, ...patch } : c)),
      source: "manual",
    })),

  clear: () => set({ cities: [], source: "none" }),

  loadSample: (key) =>
    // Salin dalam supaya edit manual tidak mengubah konstanta sample.
    set({ cities: SAMPLES[key].cities.map((c) => ({ ...c })), source: "sample" }),
}));
