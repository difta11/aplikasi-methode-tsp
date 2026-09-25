import { Eye, Hand, Gift, CloudOff } from "lucide-react";

const BENEFITS = [
  {
    icon: Eye,
    title: "Paham lewat mata, bukan hafalan",
    desc: "Rumus Metropolis dan tabu list berhenti jadi teori begitu kamu melihat rutenya benar-benar berubah.",
  },
  {
    icon: Hand,
    title: "Interaktif sepenuhnya",
    desc: "Ganti parameter, jalankan ulang, bandingkan hasilnya. Seed yang sama selalu memberi hasil sama persis.",
  },
  {
    icon: Gift,
    title: "Gratis & tanpa install",
    desc: "Cukup buka lewat browser. Tidak perlu Python, tidak perlu setup apa pun.",
  },
  {
    icon: CloudOff,
    title: "Datamu tetap milikmu",
    desc: "Semua perhitungan berjalan di browser. Tidak ada satu pun data yang dikirim ke server.",
  },
];

export function Benefits() {
  return (
    <section id="manfaat" className="scroll-mt-24 py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Kenapa pakai MetaPath?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Dibuat supaya konsep metaheuristik terasa masuk akal, bukan menakutkan.
          </p>
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <li
                key={b.title}
                className="flex gap-4 rounded-3xl border border-border bg-card p-6"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary/15 text-secondary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold">{b.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{b.desc}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
