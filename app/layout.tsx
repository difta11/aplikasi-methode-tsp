import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/landing/Navbar";
import { SiteBackground } from "@/components/landing/SiteBackground";

// Plus Jakarta Sans sebagai font utama (identitas visual MetaPath).
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MetaPath — Visualisasi Metaheuristik untuk TSP",
  description:
    "Web app edukasi untuk memvisualisasikan Simulated Annealing & Tabu Search menyelesaikan Travelling Salesman Problem, langkah demi langkah.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${jakarta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Lompat-ke-konten untuk pengguna keyboard/pembaca layar. */}
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Lompat ke konten
        </a>

        {/* Latar garis mengalir untuk seluruh situs (lihat SiteBackground). */}
        <SiteBackground />

        {/* Navbar berada DI LUAR template transisi, supaya sticky-nya tidak
            terpengaruh transform/opacity animasi perpindahan halaman. */}
        <TooltipProvider>
          <Navbar />
          {children}
        </TooltipProvider>

        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
