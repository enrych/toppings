"use client";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

// R3F + three are heavy — load only on client and only when the section mounts.
const VinylScene = dynamic(() => import("./VinylScene"), {
  ssr: false,
});

const FEATURES = [
  {
    title: "Listen, don't watch",
    body: "Hide the video and keep the audio. Black screen, AM-style waveform, or your own background image.",
  },
  {
    title: "Pin it per video",
    body: "Set a favorite background for a specific track. Toppings remembers and restores it next time.",
  },
  {
    title: "Tuned for music",
    body: "Visualizer sensitivity is yours to control. Quiet tracks still feel alive.",
  },
];

/**
 * The signature section. A 3D vinyl disc sits behind editorial copy. This
 * is the only place 3D appears on the page — it's the "wow" moment without
 * being noisy elsewhere.
 */
export default function AudioModeShowcase() {
  return (
    <section className="relative py-24 lg:py-36 bg-ink text-cream overflow-hidden">
      {/* 3D vinyl in the background — positioned to the right, half-bleeding
          off the edge for an editorial composition. */}
      <div className="absolute top-1/2 -translate-y-1/2 right-[-12%] lg:right-[-6%] w-[600px] lg:w-[820px] h-[600px] lg:h-[820px] opacity-90 pointer-events-none">
        <VinylScene />
      </div>

      {/* Subtle radial glow on the left, behind copy, to lift it off the ink. */}
      <div
        aria-hidden
        className="absolute -left-32 top-1/4 w-[640px] h-[640px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(closest-side, rgba(252,169,41,0.13), transparent 70%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.55 }}
            className="text-[11px] uppercase tracking-[0.22em] text-amber font-semibold mb-5"
          >
            ✦ Audio Mode
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-display text-[42px] sm:text-[64px] lg:text-[88px] leading-[0.92]"
          >
            For when you only
            <br />
            need the <span className="amber-underline">sound</span>.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="mt-8 text-lg lg:text-xl text-cream/65 max-w-xl leading-relaxed"
          >
            Office. Multitasking. Visuals that aren&apos;t safe-for-work.
            Toppings turns any YouTube video into audio you can leave
            running, with screens you choose.
          </motion.p>

          <div className="mt-12 grid sm:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="border-l border-amber/40 pl-4"
              >
                <h3 className="text-sm font-semibold text-cream mb-1.5">
                  {f.title}
                </h3>
                <p className="text-sm text-cream/55 leading-relaxed">
                  {f.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
