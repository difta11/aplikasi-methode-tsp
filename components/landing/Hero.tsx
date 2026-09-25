import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bounce } from "@/components/ui/Bounce";
import { ShinyButton } from "@/components/ui/shiny-button";
import { AnimatedTitle } from "./AnimatedTitle";
import { AlgorithmLink } from "./AlgorithmLink";

export function Hero() {
  return (
    // Latar garis mengalir kini global (lihat app/layout.tsx), jadi hero tidak
    // memasang lapisannya sendiri.
    <section className="relative">
      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-32">
        <span className="mb-6 rounded-full border border-primary/25 bg-background/70 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-sm sm:text-sm">
          Metode Optimasi Metaheuristik · Visualisasi TSP
        </span>

        <AnimatedTitle text="MetaPath" />

        <p className="mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
          Lihat bagaimana{" "}
          <AlgorithmLink kind="sa" /> dan{" "}
          <AlgorithmLink kind="ts" /> mencari
          rute terpendek keliling kota — langkah demi langkah, bukan cuma hasil
          akhirnya.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <ShinyButton href="/tool">
            Coba Sekarang
            <ArrowRight className="size-4" />
          </ShinyButton>
          <Bounce>
            <Button
              size="lg"
              nativeButton={false}
              variant="outline"
              className="rounded-2xl px-7 text-base text-foreground"
              render={<Link href="#cara-kerja">Lihat cara kerjanya</Link>}
            />
          </Bounce>
        </div>
      </div>
    </section>
  );
}
