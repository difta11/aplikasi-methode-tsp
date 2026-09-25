"use client";

// Pemilihan algoritma (kartu ala numiqo) + panel parameter + tombol Jalankan.

import { useId } from "react";
import { toast } from "sonner";
import { Flame, Ban, Play, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCityStore } from "@/lib/store/useCityStore";
import {
  DEFAULT_SA,
  DEFAULT_TS,
  useRunStore,
  type AlgorithmKey,
} from "@/lib/store/useRunStore";
import { validateCityCount } from "@/lib/parsing/validate";
import { cn } from "@/lib/utils";

const ALGOS: {
  key: AlgorithmKey;
  name: string;
  tagline: string;
  icon: typeof Flame;
  accent: string;
}[] = [
  {
    key: "sa",
    name: "Simulated Annealing",
    tagline: "Meniru pendinginan logam: berani ngawur saat panas, makin teliti saat dingin.",
    icon: Flame,
    accent: "text-accent",
  },
  {
    key: "ts",
    name: "Tabu Search",
    tagline: "Mengingat gerakan yang baru dipakai dan melarangnya sementara.",
    icon: Ban,
    accent: "text-destructive",
  },
];

/** Input angka berlabel yang ringkas. */
function NumField({
  label,
  value,
  onChange,
  step = 1,
  min,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
}) {
  // id unik supaya Label benar-benar terhubung ke Input (aksesibilitas).
  const id = useId();
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        step={step}
        min={min}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-9"
      />
    </div>
  );
}

export function SolverPanel() {
  const cities = useCityStore((s) => s.cities);
  const algorithm = useRunStore((s) => s.algorithm);
  const setAlgorithm = useRunStore((s) => s.setAlgorithm);
  const neighborhood = useRunStore((s) => s.neighborhood);
  const setNeighborhood = useRunStore((s) => s.setNeighborhood);
  const sa = useRunStore((s) => s.sa);
  const ts = useRunStore((s) => s.ts);
  const setSa = useRunStore((s) => s.setSa);
  const setTs = useRunStore((s) => s.setTs);
  const run = useRunStore((s) => s.run);
  const isRunning = useRunStore((s) => s.isRunning);

  const v = validateCityCount(cities.length);

  function handleRun() {
    if (!v.ok) {
      toast.error(v.message ?? "Data kota belum valid.");
      return;
    }
    run(cities);
    const label = algorithm === "sa" ? "Simulated Annealing" : "Tabu Search";
    toast.success(`${label} dijalankan.`);
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">2. Pilih Solver</h2>
        <p className="text-sm text-muted-foreground">
          Pilih algoritma metaheuristik, atur parameternya, lalu jalankan.
        </p>
      </div>

      {/* Kartu pemilihan algoritma */}
      <div className="grid gap-4 sm:grid-cols-2">
        {ALGOS.map((a) => {
          const Icon = a.icon;
          const active = algorithm === a.key;
          return (
            <button
              key={a.key}
              type="button"
              onClick={() => setAlgorithm(a.key)}
              className={cn(
                "rounded-3xl border-2 bg-card p-5 text-left transition-all",
                active
                  ? "border-primary shadow-lg shadow-primary/10"
                  : "border-border hover:border-primary/40"
              )}
            >
              <div className="flex items-center gap-2">
                <Icon className={cn("size-5", a.accent)} />
                <span className="font-semibold">{a.name}</span>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">{a.tagline}</p>
            </button>
          );
        })}
      </div>

      {/* Panel parameter */}
      <Card className="rounded-3xl">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Parameter</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={() =>
              algorithm === "sa" ? setSa({ ...DEFAULT_SA }) : setTs({ ...DEFAULT_TS })
            }
          >
            <RotateCcw className="size-3.5" />
            Kembalikan default
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            {algorithm === "sa" ? (
              <>
                <NumField label="Suhu awal (T₀)" value={sa.initialTemperature} min={1} onChange={(n) => setSa({ initialTemperature: n })} />
                <NumField label="Cooling rate" value={sa.coolingRate} step={0.001} min={0.5} onChange={(n) => setSa({ coolingRate: n })} />
                <NumField label="Maks iterasi" value={sa.maxIterations} min={1} onChange={(n) => setSa({ maxIterations: n })} />
                <NumField label="Seed" value={sa.seed} onChange={(n) => setSa({ seed: n })} />
              </>
            ) : (
              <>
                <NumField label="Maks iterasi" value={ts.maxIter} min={1} onChange={(n) => setTs({ maxIter: n })} />
                <NumField label="Tabu tenure" value={ts.tabuTenure} min={1} onChange={(n) => setTs({ tabuTenure: n })} />
                <NumField label="Jumlah tetangga" value={ts.numNeighbors} min={1} onChange={(n) => setTs({ numNeighbors: n })} />
                <NumField label="Seed" value={ts.seed} onChange={(n) => setTs({ seed: n })} />
              </>
            )}
          </div>

          <div className="grid gap-1.5 sm:max-w-56">
            <Label className="text-xs text-muted-foreground">Gerakan tetangga</Label>
            <Select
              value={neighborhood}
              onValueChange={(val) => setNeighborhood(val as "swap" | "2opt")}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="swap">Swap (tukar 2 kota)</SelectItem>
                <SelectItem value="2opt">2-opt (balik segmen)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <ShinyButton onClick={handleRun} disabled={isRunning || !v.ok}>
              {isRunning ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Play className="size-4" />
              )}
              Jalankan
            </ShinyButton>
            {!v.ok && (
              <span className="text-sm text-destructive">{v.message}</span>
            )}
            <span className="text-xs text-muted-foreground">
              Seed sama → hasil sama persis (reproducible).
            </span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
