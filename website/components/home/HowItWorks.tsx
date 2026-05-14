"use client";
import { motion } from "framer-motion";

const STEPS = [
  {
    n: "01",
    title: "Install in seconds",
    desc: "Add Toppings from the Chrome Web Store or Firefox Add-ons. No account, no signup.",
  },
  {
    n: "02",
    title: "Open YouTube",
    desc: "Visit any video. New controls and shortcuts appear seamlessly inside YouTube's player.",
  },
  {
    n: "03",
    title: "Make it yours",
    desc: "Pick your shortcuts, default speed, audio-mode background — Toppings remembers.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-20 lg:py-28 bg-gradient-to-b from-transparent via-white/50 to-transparent">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
          className="text-center mb-14 lg:mb-20"
        >
          <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">
            How it works
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-foreground">
            Three steps. Zero friction.
          </h2>
        </motion.div>

        <div className="relative grid md:grid-cols-3 gap-8 lg:gap-12">
          {/* Connecting line (desktop only) */}
          <div
            aria-hidden
            className="hidden md:block absolute top-9 left-[10%] right-[10%] h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(0,0,0,0.12) 20%, rgba(0,0,0,0.12) 80%, transparent)",
            }}
          />
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative text-center md:text-left"
            >
              <div className="inline-flex items-center justify-center w-[72px] h-[72px] rounded-2xl bg-white border border-foreground/10 shadow-sm relative z-10 mb-5">
                <span
                  className="text-2xl font-black text-gradient-brand"
                  style={{ fontVariationSettings: "'wght' 900" }}
                >
                  {s.n}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-foreground/65 leading-relaxed max-w-xs mx-auto md:mx-0">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
