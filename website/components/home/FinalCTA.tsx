"use client";
import { motion } from "framer-motion";
import MagneticCTA from "./MagneticCTA";

export default function FinalCTA() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[40px] overflow-hidden grain"
          style={{
            background:
              "linear-gradient(120deg, #1a1a1f 0%, #2a1610 50%, #1a0f1f 100%)",
          }}
        >
          {/* Animated accent blobs */}
          <motion.div
            aria-hidden
            className="absolute -top-32 -left-32 w-[460px] h-[460px] rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, rgba(252,169,41,0.45), transparent 70%)",
            }}
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="absolute -bottom-40 -right-32 w-[520px] h-[520px] rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, rgba(252,64,110,0.4), transparent 70%)",
            }}
            animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10 px-8 lg:px-20 py-16 lg:py-24 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-4xl lg:text-6xl font-black tracking-tight text-white leading-[1.05]"
              style={{ fontVariationSettings: "'wght' 900" }}
            >
              Make YouTube
              <br />
              <span className="text-gradient-brand">work for you.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="mt-6 text-base lg:text-lg text-white/65 max-w-xl mx-auto leading-relaxed"
            >
              Free, open source, and zero accounts to set up. Install in two
              clicks and start watching your way.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.3 }}
              className="mt-9 inline-block"
            >
              <MagneticCTA />
            </motion.div>
            <p className="mt-6 text-xs text-white/40">
              No tracking · No accounts · GPL-3.0
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
