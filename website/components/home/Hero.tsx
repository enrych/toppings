"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import MagneticCTA from "./MagneticCTA";
import MeshBackground from "./MeshBackground";
import PlayerMockup from "./PlayerMockup";

export default function Hero() {
  return (
    <section className="relative pt-12 lg:pt-20 pb-20 lg:pb-28 overflow-hidden grain">
      <MeshBackground />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Copy column */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur border border-black/5 text-xs font-medium text-foreground/70 shadow-sm mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            New: Audio Mode is live
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
            className="text-[44px] sm:text-[56px] lg:text-[72px] font-black leading-[0.95] tracking-tight text-foreground"
            style={{ fontVariationSettings: "'wght' 900" }}
          >
            Your YouTube,
            <br />
            <span className="text-gradient-brand">Your Way.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="mt-6 text-lg lg:text-xl text-foreground/70 max-w-xl leading-relaxed"
          >
            A polished browser extension that puts YouTube on your terms.
            Listen audio-only, fine-tune playback, loop sections, scroll
            Shorts on autopilot, and more.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.35 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <MagneticCTA />
            <Link
              href="https://github.com/enrych/toppings"
              target="_blank"
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors px-4 py-2"
            >
              ⭐ Star on GitHub →
            </Link>
          </motion.div>

          {/* Tiny "trust" row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10 flex items-center gap-6 text-xs text-foreground/55"
          >
            <div className="flex items-center gap-2">
              <span className="text-amber-500">★★★★★</span>
              <span>Loved by viewers</span>
            </div>
            <div className="h-3 w-px bg-foreground/15" />
            <div>Free & open source</div>
            <div className="h-3 w-px bg-foreground/15" />
            <div>Chrome · Firefox</div>
          </motion.div>
        </div>

        {/* Visual column */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="relative z-10"
        >
          {/* Floating depth wrapper */}
          <div
            className="relative"
            style={{ animation: "float-slow 6s ease-in-out infinite" }}
          >
            <PlayerMockup />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
