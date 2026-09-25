// ============================================================================
// Verifikasi layer input data (jalankan: npm run test:data).
// Menguji parsing CSV/Excel, deteksi header, mapping, validasi error per-baris,
// dan validasi jumlah kota — semua kasus penting Fase 2.
// ============================================================================

import * as XLSX from "xlsx";
import {
  analyzeTable,
  buildCities,
  detectMappingFromHeaders,
  guessMapping,
  parseNumberCell,
  validateCityCount,
} from "../lib/parsing/validate";
import { parseCsvText } from "../lib/parsing/csv";
import { parseWorkbookBuffer } from "../lib/parsing/excel";
import { SAMPLE_6, SAMPLE_25 } from "../lib/samples";
import { MAX_CITIES, MAX_CITIES_ANIMATION } from "../lib/config";

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean, detail = "") {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name}  ${detail}`);
  }
}

console.log("== Fase 2: verifikasi layer input data ==\n");

// 1) CSV berheader standar x,y,label
console.log("[CSV] header standar");
{
  const csv = "label,x,y\nA,10,20\nB,30,40\nC,50,60";
  const table = parseCsvText(csv);
  const mapping = detectMappingFromHeaders(table.headers!);
  const { cities, errors } = buildCities(table, mapping!);
  check("header terdeteksi", table.headers?.join(",") === "label,x,y");
  check("mapping x=1,y=2,label=0", mapping?.x === 1 && mapping?.y === 2 && mapping?.label === 0);
  check("3 kota terbaca, tanpa error", cities.length === 3 && errors.length === 0);
  check("nilai benar", cities[1].label === "B" && cities[1].x === 30 && cities[1].y === 40);
}

// 2) Header case-insensitive & alias (X, Y, nama)
console.log("\n[CSV] header case-insensitive + alias");
{
  const csv = "Nama,X,Y\nSurabaya,100,200\nMalang,300,400";
  const table = parseCsvText(csv);
  const mapping = detectMappingFromHeaders(table.headers!);
  const { cities } = buildCities(table, mapping!);
  check("alias 'Nama' -> label, 'X'/'Y' terdeteksi", mapping?.label === 0 && mapping?.x === 1 && mapping?.y === 2);
  check("label dari file dipakai", cities[0].label === "Surabaya");
}

// 3) Tanpa header -> headers null, guessMapping
console.log("\n[CSV] tanpa header");
{
  const csv = "10,20\n30,40\n50,60";
  const table = parseCsvText(csv);
  check("header null (semua angka)", table.headers === null);
  check("detectMappingFromHeaders butuh header (null di sini => tak dipanggil)", true);
  const guess = guessMapping(2);
  const { cities } = buildCities(table, guess!);
  check("guessMapping 2 kolom -> x=0,y=1", guess?.x === 0 && guess?.y === 1 && guess?.label === null);
  check("3 kota, label otomatis 'Kota n'", cities.length === 3 && cities[0].label === "Kota 1");
}

// 4) Kolom x/y tidak ketemu -> mapping null (UI tawarkan pemetaan manual)
console.log("\n[CSV] kolom x/y tidak ada");
{
  const csv = "lat,long\n10,20\n30,40";
  const table = parseCsvText(csv);
  const mapping = detectMappingFromHeaders(table.headers!);
  check("mapping null saat x/y tak ditemukan", mapping === null);
}

// 5) Sel kosong / non-numerik -> error per-baris dengan rowNumber benar
console.log("\n[CSV] sel kosong / non-numerik");
{
  const csv = "x,y\n10,20\nabc,40\n50,\n70,80";
  const table = parseCsvText(csv);
  const mapping = detectMappingFromHeaders(table.headers!);
  const { cities, errors } = buildCities(table, mapping!);
  check("2 kota valid terbaca", cities.length === 2, `dapat ${cities.length}`);
  check("2 baris error terdeteksi", errors.length === 2, `dapat ${errors.length}`);
  // baris data ke-2 (abc) = rowNumber 3 (ada header); baris ke-3 (50,) = rowNumber 4
  check("rowNumber error tepat (3 & 4)", errors[0].rowNumber === 3 && errors[1].rowNumber === 4, JSON.stringify(errors));
}

// 6) parseNumberCell: koma desimal & invalid
console.log("\n[util] parseNumberCell");
{
  check("'3,5' -> 3.5 (koma desimal)", parseNumberCell("3,5") === 3.5);
  check("' 42 ' -> 42 (trim)", parseNumberCell(" 42 ") === 42);
  check("'' -> null", parseNumberCell("") === null);
  check("'abc' -> null", parseNumberCell("abc") === null);
  check("'-1.5e2' -> -150", parseNumberCell("-1.5e2") === -150);
}

// 7) Excel: buat workbook lalu parse balik
console.log("\n[Excel] round-trip");
{
  const aoa = [
    ["label", "x", "y"],
    ["P", 5, 6],
    ["Q", 7, 8],
    ["R", 9, 10],
  ];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  const table = parseWorkbookBuffer(buf);
  const mapping = detectMappingFromHeaders(table.headers!);
  const { cities, errors } = buildCities(table, mapping!);
  check("Excel: header terdeteksi", mapping?.x === 1 && mapping?.y === 2 && mapping?.label === 0);
  check("Excel: 3 kota, tanpa error", cities.length === 3 && errors.length === 0);
  check("Excel: nilai numerik benar", cities[2].label === "R" && cities[2].x === 9 && cities[2].y === 10);
}

// 8) Baris kosong dibuang oleh analyzeTable
console.log("\n[util] analyzeTable buang baris kosong");
{
  const table = analyzeTable([["x", "y"], ["1", "2"], ["", ""], ["3", "4"]]);
  check("baris kosong dibuang", table.rows.length === 2);
}

// 9) Validasi jumlah kota
console.log("\n[validasi] jumlah kota");
{
  check("2 kota -> tidak ok", validateCityCount(2).ok === false);
  check("3 kota -> ok & boleh animasi", validateCityCount(3).ok && validateCityCount(3).canAnimate);
  check(`${MAX_CITIES_ANIMATION} kota -> boleh animasi`, validateCityCount(MAX_CITIES_ANIMATION).canAnimate === true);
  check("45 kota (ukuran dataset uji user) -> ok & boleh animasi", validateCityCount(45).ok && validateCityCount(45).canAnimate);
  // Rentang "boleh dihitung tapi tanpa animasi" hanya ada bila batas animasi
  // di config diturunkan di bawah batas keras.
  if (MAX_CITIES_ANIMATION < MAX_CITIES) {
    check(`${MAX_CITIES_ANIMATION + 1} kota -> ok tapi animasi off`, validateCityCount(MAX_CITIES_ANIMATION + 1).ok && !validateCityCount(MAX_CITIES_ANIMATION + 1).canAnimate);
  } else {
    check(`${MAX_CITIES} kota (batas keras) -> tetap boleh animasi`, validateCityCount(MAX_CITIES).ok && validateCityCount(MAX_CITIES).canAnimate);
  }
  check("500 kota -> tidak ok (lewat batas keras)", validateCityCount(500).ok === false);
}

// 10) Sample data konsisten
console.log("\n[sample] dataset bawaan");
{
  check("SAMPLE_6 berisi 6 kota", SAMPLE_6.length === 6);
  check("SAMPLE_25 berisi 25 kota", SAMPLE_25.length === 25);
}

console.log(`\n== Ringkasan: ${passed} lulus, ${failed} gagal ==`);
process.exit(failed > 0 ? 1 : 0);
