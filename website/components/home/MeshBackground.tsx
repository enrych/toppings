"use client";
import { motion } from "framer-motion";

/**
 * Animated decorative mesh-gradient backdrop. Three soft amber/rose/violet
 * blobs drift in opposite directions with long durations — adds depth and
 * motion without distracting from the foreground content.
 *
 * Pointer-events: none so it never blocks interaction.
 */
export default function MeshBackground() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
    >
      <motion.div
        className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(252,169,41,0.55), rgba(252,169,41,0) 70%)",
        }}
        animate={{
          x: [0, 60, -30, 0],
          y: [0, 40, 20, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-40 w-[560px] h-[560px] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(252,64,110,0.4), rgba(252,64,110,0) 70%)",
        }}
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 30, -20, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(130,90,255,0.32), rgba(130,90,255,0) 70%)",
        }}
        animate={{
          x: [0, 40, -60, 0],
          y: [0, -30, 20, 0],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Soft grid overlay (architectural feel) */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}
