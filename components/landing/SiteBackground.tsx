// Latar shader untuk SELURUH situs. Dipasang sekali di app/layout.tsx: fixed di
// belakang semua konten, jadi terlihat sepanjang scroll di semua halaman dan
// tidak ikut "berkedip" saat pindah halaman (berada di luar app/template.tsx).
//
// `bg-background` pada pembungkus mencegah kedip putih di frame pertama sebelum
// WebGL sempat menggambar. `pointer-events-none` menjaga latar tidak menangkap
// klik; efek kursor pada shader memakai listener window, jadi tetap jalan.

import { ShaderBackground } from "@/components/ui/shader-background";

export function SiteBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      <ShaderBackground className="h-full w-full" />
    </div>
  );
}
