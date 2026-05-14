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
 * Interactive YouTube-style player mockup that cycles through audio-mode
 * states. The visualizer mode renders a synthesized AM-style waveform on a
 * canvas (no audio source — pure decorative animation). Auto-advances every
 * few seconds, but pauses when the user explicitly picks a mode.
 */
export default function PlayerMockup() {
  const [mode, setMode] = useState<Mode>("video");
  const [autoMode, setAutoMode] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // Auto-advance modes for the demo loop.
  useEffect(() => {
    if (!autoMode) return;
    const i = setInterval(() => {
      setMode((m) => {
        const idx = MODES.findIndex((mm) => mm.id === m);
        return MODES[(idx + 1) % MODES.length].id;
      });
    }, 3500);
    return () => clearInterval(i);
  }, [autoMode]);

  // Synthesized visualizer — looks like real audio reactive but is just
  // a sum of slow sinusoids and a noise term.
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

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);

      t += 0.018;
      const points: { x: number; y: number }[] = [];
      const N = 200;
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const x = u * w;
        // Bell envelope so the wave is centered and tapers to the edges.
        const env = Math.sin(u * Math.PI) * Math.sin(u * Math.PI);
        const amp = h * 0.32 * env;
        // Layered sinusoids of different frequencies — feels musical.
        const y =
          cy +
          Math.sin(u * Math.PI * 6 + t * 1.7) * amp * 0.55 +
          Math.sin(u * Math.PI * 11 + t * 2.6) * amp * 0.3 +
          Math.sin(u * Math.PI * 3 + t * 0.9) * amp * 0.7 +
          // Tiny noise term for organic feel.
          (Math.sin(u * Math.PI * 23 + t * 5) * amp * 0.08);
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
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2.5 * dpr;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.stroke();

      // Faint center axis line (AM aesthetic).
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
    <div className="w-full max-w-[640px] mx-auto">
      {/* Browser chrome */}
      <div
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{
          boxShadow:
            "0 50px 100px -30px rgba(20,20,20,0.35), 0 30px 60px -25px rgba(252,124,41,0.25)",
        }}
      >
        <div className="bg-[#1d1d1f] px-4 py-2.5 flex items-center gap-2 border-b border-white/5">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 mx-3 px-3 py-1 rounded-md bg-[#2a2a2c] text-[11px] text-white/50 font-mono">
            youtube.com/watch?v=...
          </div>
        </div>

        {/* Player viewport */}
        <div className="relative aspect-video bg-black overflow-hidden">
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
                className="absolute inset-0 bg-black"
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
                  background:
                    "linear-gradient(135deg, #2b1055 0%, #7597de 50%, #ff7e5f 100%)",
                }}
              >
                {/* Subtle "sunset" overlay for the custom mode preview. */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Audio-mode overlay text in non-video modes */}
          {mode !== "video" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center text-white pointer-events-none"
            >
              <div className="text-xs uppercase tracking-widest text-white/60">
                Now Playing
              </div>
              <div className="mt-2 text-lg font-semibold">
                Your Favorite Track
              </div>
              <div className="text-xs text-white/60">
                The Arctic Monkeys · AM
              </div>
            </motion.div>
          )}

          {/* Top-right close button (only in audio modes) */}
          {mode !== "video" && (
            <button
              aria-label="Exit audio mode"
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 border border-white/20 text-white flex items-center justify-center text-sm hover:bg-white/20 transition-colors"
              onClick={() => {
                setAutoMode(false);
                setMode("video");
              }}
            >
              ✕
            </button>
          )}

          {/* Faux YouTube progress bar */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
            <motion.div
              className="h-full bg-[#ff0033]"
              animate={{ width: ["0%", "100%"] }}
              transition={{
                duration: 14,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>
        </div>

        {/* Inline mode switcher (mirrors the in-player UI) */}
        <div className="bg-[#0c0c0e] px-4 py-3 flex items-center justify-center gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setAutoMode(false);
                setMode(m.id);
              }}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                mode === m.id
                  ? "border-white/60 text-white bg-white/10"
                  : "border-white/15 text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Caption underneath */}
      <p className="text-center text-sm text-foreground/60 mt-4">
        {autoMode
          ? "Tap a mode to interact — or just watch."
          : "Looking good. Try another mode."}
      </p>
    </div>
  );
}

/**
 * Decorative "video frame" — a stylized mock thumbnail so the Normal mode
 * doesn't look like an empty player. Animated for subtle life.
 */
function FakeVideoFrame() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 35%, #0f3460 70%, #e94560 100%)",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Faux subject — a soft glow + silhouette circle. */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,255,255,0.4), rgba(255,255,255,0) 70%)",
        }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute bottom-6 left-6 text-white">
        <div className="text-[10px] uppercase tracking-widest opacity-70">
          Watching
        </div>
        <div className="text-base font-semibold leading-snug">
          A talk you wanted to listen to
        </div>
      </div>
    </div>
  );
}
