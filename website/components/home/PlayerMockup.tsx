"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Mode = "video" | "black" | "visualizer" | "custom";

const MODES: { id: Mode; label: string }[] = [
  { id: "video", label: "Normal" },
  { id: "black", label: "Black" },
  { id: "visualizer", label: "Visualizer" },
  { id: "custom", label: "Custom" },
];

/**
 * Interactive YouTube-style player mockup. Cycles through audio-mode states
 * to demonstrate the feature. Restricted palette: ink (black surface),
 * cream (text), amber (single accent on progress + active chip). No rainbow.
 */
export default function PlayerMockup() {
  const [mode, setMode] = useState<Mode>("video");
  const [auto, setAuto] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!auto) return;
    const i = setInterval(() => {
      setMode((m) => {
        const idx = MODES.findIndex((mm) => mm.id === m);
        return MODES[(idx + 1) % MODES.length].id;
      });
    }, 3800);
    return () => clearInterval(i);
  }, [auto]);

  // Synthesized AM-style waveform. Sum of sinusoids, bell envelope.
  useEffect(() => {
    if (mode !== "visualizer") {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let t = 0;
    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      const w = canvas.width;
      const h = canvas.height;
      const cy = h / 2;

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, w, h);

      t += 0.018;
      const points: { x: number; y: number }[] = [];
      const N = 200;
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const x = u * w;
        const env = Math.sin(u * Math.PI) * Math.sin(u * Math.PI);
        const amp = h * 0.32 * env;
        const y =
          cy +
          Math.sin(u * Math.PI * 6 + t * 1.7) * amp * 0.55 +
          Math.sin(u * Math.PI * 11 + t * 2.6) * amp * 0.3 +
          Math.sin(u * Math.PI * 3 + t * 0.9) * amp * 0.7 +
          Math.sin(u * Math.PI * 23 + t * 5) * amp * 0.08;
        points.push({ x, y });
      }

      ctx.beginPath();
      ctx.moveTo(0, cy);
      for (let i = 0; i < points.length - 1; i++) {
        const cpx = (points[i].x + points[i + 1].x) / 2;
        const cpy = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, cpx, cpy);
      }
      ctx.lineTo(w, cy);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.5 * dpr;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1 * dpr;
      ctx.stroke();
    };
    draw();
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [mode]);

  return (
    <div className="w-full max-w-[620px] mx-auto">
      <div
        className="rounded-2xl overflow-hidden ring-1 ring-ink/10"
        style={{
          boxShadow:
            "0 50px 100px -30px rgba(10,10,10,0.18), 0 25px 50px -25px rgba(252,169,41,0.12)",
        }}
      >
        {/* Browser chrome */}
        <div className="bg-[#1d1d1f] px-4 py-2.5 flex items-center gap-2 border-b border-white/5">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 mx-3 px-3 py-1 rounded-md bg-[#2a2a2c] text-[11px] text-white/50 font-mono">
            youtube.com/watch?v=…
          </div>
        </div>

        {/* Player viewport */}
        <div className="relative aspect-video bg-ink overflow-hidden">
          <AnimatePresence mode="wait">
            {mode === "video" && (
              <motion.div
                key="video"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                <FakeVideoFrame />
              </motion.div>
            )}
            {mode === "black" && (
              <motion.div
                key="black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 bg-ink"
              />
            )}
            {mode === "visualizer" && (
              <motion.canvas
                key="viz"
                ref={canvasRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 w-full h-full"
              />
            )}
            {mode === "custom" && (
              <motion.div
                key="custom"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
                style={{
                  // Tasteful single-tone custom background using brand amber.
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(252,169,41,0.7), rgba(10,10,10,1) 70%)",
                }}
              />
            )}
          </AnimatePresence>

          {/* Centered Now-Playing text in audio modes */}
          {mode !== "video" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center text-cream pointer-events-none"
            >
              <div className="text-[10px] uppercase tracking-[0.25em] text-cream/55">
                Now Playing
              </div>
              <div className="mt-2 text-lg font-semibold">
                Your Favorite Track
              </div>
              <div className="text-xs text-cream/55">
                Arctic Monkeys · AM
              </div>
            </motion.div>
          )}

          {/* Exit affordance (only in audio modes) */}
          {mode !== "video" && (
            <button
              aria-label="Exit audio mode"
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-ink/40 border border-cream/20 text-cream flex items-center justify-center text-sm hover:bg-cream/20 transition-colors cursor-pointer"
              onClick={() => {
                setAuto(false);
                setMode("video");
              }}
            >
              ✕
            </button>
          )}

          {/* Progress bar (single amber accent) */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
            <motion.div
              className="h-full bg-amber"
              animate={{ width: ["0%", "100%"] }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>

        {/* Inline mode switcher */}
        <div className="bg-[#0c0c0e] px-4 py-3 flex items-center justify-center gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setAuto(false);
                setMode(m.id);
              }}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors cursor-pointer ${
                mode === m.id
                  ? "border-amber/70 text-cream bg-amber/10"
                  : "border-white/15 text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-ink/55 mt-4">
        {auto ? "Tap a mode to interact — or watch it cycle." : "Try another mode."}
      </p>
    </div>
  );
}

/**
 * Stylized "video frame" mock — soft warm gradient with a faux subject glow.
 * Stays within brand tones (ink + amber) so the Normal mode doesn't feel
 * disconnected from the rest of the page.
 */
function FakeVideoFrame() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(140deg, #1a1a1f 0%, #2b1d10 45%, #1a1208 100%)",
        }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(252,169,41,0.35), rgba(252,169,41,0) 70%)",
        }}
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute bottom-6 left-6 text-cream">
        <div className="text-[10px] uppercase tracking-widest text-cream/55">
          Watching
        </div>
        <div className="text-base font-semibold leading-snug">
          A talk you wanted to listen to
        </div>
      </div>
    </div>
  );
}
