"use client";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Pure-canvas vinyl record. The previous version used react-three-fiber but
 * Next 15's webpack runtime swaps in a different React build at runtime,
 * breaking react-reconciler's React-18-internals access. A flat canvas
 * gives the same visual goal — realistic black disc with grooves, glossy
 * highlights, warm amber label — with zero dependency risk.
 *
 * Depth and motion come from:
 *  - cursor-tracked subtle tilt (rotateX/rotateY via framer-motion springs)
 *  - continuous slow rotation (rAF)
 *  - radial sheen highlight that suggests a curved surface
 *  - drop shadow tied to brand
 *
 * Pointer-events: none — purely decorative.
 */

const SIZE = 720;

function drawVinyl(ctx: CanvasRenderingContext2D, angle: number) {
  const dpr = window.devicePixelRatio || 1;
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const r = Math.min(W, H) * 0.46;

  ctx.clearRect(0, 0, W, H);

  // Soft glow under the disc (warm halo).
  const halo = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.5);
  halo.addColorStop(0, "rgba(252,169,41,0.35)");
  halo.addColorStop(1, "rgba(252,169,41,0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Main disc body — dark matte with subtle radial gradient for depth.
  const body = ctx.createRadialGradient(
    cx - r * 0.3,
    cy - r * 0.3,
    0,
    cx,
    cy,
    r,
  );
  body.addColorStop(0, "#1a1a1a");
  body.addColorStop(0.5, "#0a0a0a");
  body.addColorStop(1, "#000000");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Concentric grooves — many thin rings simulate vinyl grooves.
  ctx.lineWidth = 1 * dpr;
  for (let i = 0; i < 80; i++) {
    const ringR = r * (0.32 + i * 0.0078);
    const opacity = 0.04 + (i % 3 === 0 ? 0.04 : 0);
    ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Sheen — a soft moving highlight that suggests rotation + lighting.
  // We draw it as a long, narrow radial gradient swept across the disc.
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  const sheen = ctx.createLinearGradient(
    cx + Math.cos(angle * 0.5) * r,
    cy + Math.sin(angle * 0.5) * r,
    cx - Math.cos(angle * 0.5) * r,
    cy - Math.sin(angle * 0.5) * r,
  );
  sheen.addColorStop(0, "rgba(255,255,255,0)");
  sheen.addColorStop(0.45, "rgba(255,255,255,0.06)");
  sheen.addColorStop(0.5, "rgba(255,255,255,0.14)");
  sheen.addColorStop(0.55, "rgba(255,255,255,0.06)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // Center amber label — the brand accent on the disc.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  const labelR = r * 0.32;
  // Label background
  const labelGrad = ctx.createRadialGradient(
    -labelR * 0.4,
    -labelR * 0.4,
    0,
    0,
    0,
    labelR,
  );
  labelGrad.addColorStop(0, "#fdb851");
  labelGrad.addColorStop(0.7, "#fca929");
  labelGrad.addColorStop(1, "#e88c14");
  ctx.fillStyle = labelGrad;
  ctx.beginPath();
  ctx.arc(0, 0, labelR, 0, Math.PI * 2);
  ctx.fill();

  // Inner ring on label for printed-vinyl feel
  ctx.strokeStyle = "rgba(0,0,0,0.18)";
  ctx.lineWidth = 1 * dpr;
  ctx.beginPath();
  ctx.arc(0, 0, labelR * 0.82, 0, Math.PI * 2);
  ctx.stroke();

  // Tiny brand mark — just the wordmark, rotates with the label.
  ctx.fillStyle = "#0a0a0a";
  ctx.font = `${Math.floor(labelR * 0.18)}px ui-sans-serif, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("TOPPINGS", 0, -labelR * 0.4);
  ctx.fillStyle = "rgba(10,10,10,0.6)";
  ctx.font = `${Math.floor(labelR * 0.1)}px ui-monospace, monospace`;
  ctx.fillText("YOUR YOUTUBE • YOUR WAY", 0, labelR * 0.45);

  // Spindle hole
  ctx.fillStyle = "#0a0a0a";
  ctx.beginPath();
  ctx.arc(0, 0, labelR * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export default function VinylScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const angleRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Cursor tilt for a subtle 3D feel without three.js.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), {
    stiffness: 120,
    damping: 22,
  });
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), {
    stiffness: 120,
    damping: 22,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;

    const tick = () => {
      angleRef.current += 0.005;
      drawVinyl(ctx, angleRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Track cursor over a viewport-sized capture layer so the tilt responds
  // even when the disc has bled offscreen.
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      // Normalized to [-0.5, 0.5] across the section size.
      mx.set(
        Math.max(-0.5, Math.min(0.5, (e.clientX - cx) / (rect.width * 1.4))),
      );
      my.set(
        Math.max(-0.5, Math.min(0.5, (e.clientY - cy) / (rect.height * 1.4))),
      );
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden
      style={{ perspective: 1400 }}
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          rotateX: rotX,
          rotateY: rotY,
          transformStyle: "preserve-3d",
        }}
      >
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          className="w-full h-full max-w-full max-h-full"
          style={{
            filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.4))",
          }}
        />
      </motion.div>
    </div>
  );
}
