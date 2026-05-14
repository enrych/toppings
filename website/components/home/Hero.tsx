"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import MagneticCTA from "./MagneticCTA";
import PlayerMockup from "./PlayerMockup";

/**
 * Hero — exaggerated minimalism. Big editorial type, single amber accent
 * via an underline on the brand promise, generous whitespace. No mesh
 * gradients, no rainbows. The product mockup carries the visual weight.
 */
export default function Hero() {
  return (
    <section className="relative pt-10 lg:pt-16 pb-24 lg:pb-32 grain overflow-hidden">
      {/* Single soft warm halo behind the headline. Subtle, not loud. */}
      <div
        aria-hidden
        className="absolute -top-40 -left-20 w-[720px] h-[720px] rounded-full pointer-events-none -z-10"
        style={{
          background:
            "radial-gradient(closest-side, rgba(252,169,41,0.16), transparent 65%)",
          filter: "blur(10px)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
        {/* Copy column */}
        <div className="lg:col-span-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ink/[0.04] text-[11px] font-medium text-ink/70 mb-7 tracking-wide"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber" />
            New · Audio Mode for YouTube
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-display text-[56px] sm:text-[80px] lg:text-[104px] text-ink"
          >
            Your YouTube,
            <br />
            <span className="amber-underline">Your way</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-8 text-lg lg:text-xl text-ink/65 max-w-xl leading-relaxed"
          >
            A small, considered browser extension that puts YouTube on
            your terms. Listen audio-only, fine-tune playback, loop
            sections, scroll Shorts on autopilot.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <MagneticCTA />
            <Link
              href="https://github.com/enrych/toppings"
              target="_blank"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink/65 hover:text-ink transition-colors px-4 py-3 cursor-pointer"
            >
              <span className="text-amber">★</span>
              Star on GitHub
              <span aria-hidden>→</span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-12 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-ink/50"
          >
            <span>Free &amp; open source</span>
            <span className="w-1 h-1 rounded-full bg-ink/20" />
            <span>Chrome · Firefox</span>
            <span className="w-1 h-1 rounded-full bg-ink/20" />
            <span>GPL-3.0</span>
          </motion.div>
        </div>

        {/* Visual column */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="lg:col-span-6 relative z-10"
        >
          <PlayerMockup />
        </motion.div>
      </div>
    </section>
  );
}
