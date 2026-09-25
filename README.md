# MetaPath

Aplikasi web edukatif untuk memvisualisasikan dua algoritma metaheuristik —
**Simulated Annealing** dan **Tabu Search** — dalam menyelesaikan
*Travelling Salesman Problem* (TSP).

Dibuat untuk mata kuliah Metode Optimasi Metaheuristik, Departemen Sains Data,
Institut Teknologi Sepuluh Nopember.

## Apa yang bisa dilakukan

- **Masukkan data kota** lewat unggah CSV/Excel, isi manual, atau pakai dataset contoh.
  Semua pemrosesan terjadi di browser — data tidak dikirim ke server.
- **Jalankan solver** dengan parameter yang bisa diatur (suhu awal, laju pendinginan,
  jumlah iterasi, tabu tenure, jumlah tetangga).
- **Tonton animasi pencariannya langkah demi langkah**: rute terbaik sejauh ini,
  rute yang sedang dievaluasi, beserta kontrol putar/jeda/maju-mundur.
- **Pahami alasannya**, bukan cuma hasilnya — panel edukasi menampilkan termometer
  suhu dan perhitungan probabilitas Metropolis `p = e^(−Δ/T)` untuk SA, serta isi
  tabu list dan momen *aspiration* untuk TS.
- **Bandingkan konvergensinya** lewat grafik biaya terhadap iterasi.

## Menjalankan secara lokal

Butuh Node.js 20 ke atas.

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

| Perintah | Kegunaan |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi |
| `npm run lint` | Pemeriksaan ESLint |
| `npm run test:tsp` | Uji mesin algoritma (22 pemeriksaan) |
| `npm run test:data` | Uji parsing & validasi input (31 pemeriksaan) |

## Struktur

```
app/                  Rute Next.js (App Router): landing page & /tool
components/
  landing/            Bagian-bagian landing page
  tool/               Input data, panel parameter, visualisasi
  ui/                 Komponen dasar (shadcn/ui di atas Base UI)
lib/
  tsp/                Mesin algoritma: SA, TS, jarak, tetangga, perekam frame
  parsing/            Pembacaan CSV/Excel + validasi
  store/              State aplikasi (Zustand)
algorithms/           Kode Python rujukan yang diport ke TypeScript
scripts/              Skrip verifikasi
```

## Catatan tentang algoritmanya

Mesin di `lib/tsp/` adalah port TypeScript dari kode Python di `algorithms/`,
dengan tiga penyesuaian yang disengaja:

1. **Generator acak berbenih (seeded).** Memakai `mulberry32` supaya satu seed
   selalu memberi hasil yang sama — penting agar hasil di laporan bisa direproduksi
   dan agar perbandingan antar-algoritma adil.
2. **Perekaman frame.** Tiap iterasi penting disimpan sebagai *frame* (maksimal 300,
   diambil sampel berdasarkan prioritas: rekor baru > menerima langkah lebih buruk >
   biasa) lalu diputar ulang sebagai animasi.
3. **Tabu Search tidak berhenti saat semua tetangga tabu.** Versi Python melakukan
   `break` ketika tak ada tetangga non-tabu, sehingga pencarian bisa berhenti jauh
   sebelum `max_iter`. Di sini dipilih gerakan dengan sisa masa tabu terpendek
   (*least-tabu*) agar pencarian tetap berjalan.

Tech stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4,
shadcn/ui, Motion, Recharts, Zustand.

## Lisensi

MIT — lihat [LICENSE](LICENSE).
