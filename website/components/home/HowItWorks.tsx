"use client";
import { motion } from "framer-motion";

const STEPS = [
  {
    n: "01",
    title: "Install in seconds",
    desc: "Add Toppings from the Chrome Web Store or Firefox Add-ons. No account. No setup.",
  },
  {
    n: "02",
    title: "Open YouTube",
    desc: "Visit any video. New controls and shortcuts appear inside YouTube's player.",
  },
  {
    n: "03",
    title: "Make it yours",
    desc: "Pick your shortcuts, default speed, audio-mode background. Toppings remembers.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-24 lg:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="max-w-3xl mb-16 lg:mb-20"
        >
          <div className="text-[11px] uppercase tracking-[0.22em] text-amber font-semibold mb-4">
            How it works
          </div>
          <h2 className="text-display text-[40px] sm:text-[56px] lg:text-[72px] text-ink">
            Three steps.
            <br />
            <span className="text-ink/40">Zero friction.</span>
          </h2>
        </motion.div>

        <div className="relative grid md:grid-cols-3 gap-10 lg:gap-14">
          {/* Connecting line (desktop only) */}
          <div
            aria-hidden
            className="hidden md:block absolute top-[44px] left-[8%] right-[8%] h-px bg-ink/10"
          />
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative"
            >
              <div className="relative z-10 mb-6 inline-flex items-baseline gap-2">
                <span className="text-display text-7xl lg:text-8xl text-ink leading-none">
                  {s.n}
                </span>
                <span className="text-amber text-2xl">.</span>
              </div>
              <h3 className="text-xl font-semibold text-ink mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-ink/60 leading-relaxed max-w-xs">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
