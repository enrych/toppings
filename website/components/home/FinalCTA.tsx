"use client";
import { motion } from "framer-motion";
import MagneticCTA from "./MagneticCTA";

export default function FinalCTA() {
  return (
    <section className="relative py-28 lg:py-36 bg-cream">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-[11px] uppercase tracking-[0.25em] text-amber font-semibold mb-6"
        >
          ✦ Try it free
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-display text-[48px] sm:text-[72px] lg:text-[104px] text-ink"
        >
          Make YouTube
          <br />
          <span className="amber-underline">work for you</span>.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="mt-8 text-base lg:text-lg text-ink/60 max-w-xl mx-auto leading-relaxed"
        >
          Free, open source, and zero accounts to set up. Install in two
          clicks and start watching your way.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.55, delay: 0.3 }}
          className="mt-12 inline-block"
        >
          <MagneticCTA />
        </motion.div>

        <p className="mt-8 text-xs text-ink/40 uppercase tracking-[0.18em]">
          No tracking · No accounts · GPL-3.0
        </p>
      </div>
    </section>
  );
}
