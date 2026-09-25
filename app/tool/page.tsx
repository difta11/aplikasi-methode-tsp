import { DataInputPanel } from "@/components/tool/DataInput";
import { SolverPanel } from "@/components/tool/SolverPanel";
import { Visualizer } from "@/components/tool/Visualizer";

export default function ToolPage() {
  return (
    <main
      id="konten"
      className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10"
    >
      {/* Setiap halaman perlu satu h1. Di sini judulnya disembunyikan secara
          visual karena section 1/2/3 sudah menjelaskan dirinya sendiri. */}
      <h1 className="sr-only">MetaPath — Alat visualisasi TSP</h1>

      <div className="space-y-12">
        <DataInputPanel />
        <SolverPanel />
        <Visualizer />
      </div>
    </main>
  );
}
