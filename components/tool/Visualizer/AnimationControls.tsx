"use client";

// Kontrol pemutaran animasi (record-then-replay): play/pause, langkah maju-mundur,
// reset, slider kecepatan, dan scrubber untuk melompat ke frame mana saja.

import { useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useRunStore } from "@/lib/store/useRunStore";

export function AnimationControls() {
  const result = useRunStore((s) => s.result);
  const frameIndex = useRunStore((s) => s.frameIndex);
  const playing = useRunStore((s) => s.playing);
  const speed = useRunStore((s) => s.speed);
  const togglePlay = useRunStore((s) => s.togglePlay);
  const stepForward = useRunStore((s) => s.stepForward);
  const stepBack = useRunStore((s) => s.stepBack);
  const resetPlayback = useRunStore((s) => s.resetPlayback);
  const setFrameIndex = useRunStore((s) => s.setFrameIndex);
  const setSpeed = useRunStore((s) => s.setSpeed);
  const pause = useRunStore((s) => s.pause);

  const total = result?.frames.length ?? 0;

  // Pemutar: maju satu frame tiap 1000/speed ms selama `playing`.
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const s = useRunStore.getState();
      const n = s.result?.frames.length ?? 0;
      if (s.frameIndex >= n - 1) {
        s.pause();
        return;
      }
      s.setFrameIndex(s.frameIndex + 1);
    }, 1000 / speed);
    return () => clearInterval(id);
  }, [playing, speed]);

  if (!result || total === 0) return null;

  const frame = result.frames[frameIndex];
  const atEnd = frameIndex >= total - 1;

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="icon" variant="outline" onClick={stepBack} disabled={frameIndex === 0} aria-label="Mundur satu langkah">
          <SkipBack className="size-4" />
        </Button>
        <Button size="icon" onClick={togglePlay} aria-label={playing ? "Jeda" : "Putar"}>
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </Button>
        <Button size="icon" variant="outline" onClick={stepForward} disabled={atEnd} aria-label="Maju satu langkah">
          <SkipForward className="size-4" />
        </Button>
        <Button size="icon" variant="outline" onClick={resetPlayback} aria-label="Ulang dari awal">
          <RotateCcw className="size-4" />
        </Button>

        <div className="ml-auto text-sm text-muted-foreground">
          Iterasi{" "}
          <span className="font-semibold text-foreground tabular-nums">
            {frame.iteration + 1}
          </span>{" "}
          / {result.iterations}
          <span className="mx-2 text-border">|</span>
          frame {frameIndex + 1}/{total}
        </div>
      </div>

      {/* Scrubber frame */}
      <Slider
        value={[frameIndex]}
        min={0}
        max={Math.max(0, total - 1)}
        step={1}
        onValueChange={(v) => {
          pause();
          setFrameIndex(Array.isArray(v) ? v[0] : v);
        }}
        aria-label="Geser ke frame"
      />

      {/* Kecepatan */}
      <div className="flex items-center gap-3">
        <Gauge className="size-4 shrink-0 text-muted-foreground" />
        <Slider
          value={[speed]}
          min={1}
          max={30}
          step={1}
          onValueChange={(v) => setSpeed(Array.isArray(v) ? v[0] : v)}
          aria-label="Kecepatan animasi"
        />
        <span className="w-16 shrink-0 text-right text-sm text-muted-foreground tabular-nums">
          {speed} fps
        </span>
      </div>
    </div>
  );
}
