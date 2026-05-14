"use client";
import { motion } from "framer-motion";
import FeatureCard from "./FeatureCard";

/**
 * Inline SVG icons sized 22 — small, line-style, monochrome (the tile
 * provides the color background).
 */
const Icons = {
  audio: (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor">
      <path d="M12 1c-3 0-5.5 2.5-5.5 5.5v6C6.5 15.5 9 18 12 18s5.5-2.5 5.5-5.5v-6C17.5 3.5 15 1 12 1ZM4 12.5c0 4.1 3.1 7.6 7 8v2.5h2v-2.5c3.9-.4 7-3.9 7-8h-2c0 3.3-2.7 6-6 6s-6-2.7-6-6H4Z" />
    </svg>
  ),
  rate: (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 13l-4-2.5V7h2v4.5l3 1.9Z" />
    </svg>
  ),
  loop: (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor">
      <path d="M7 7h8V4l5 5-5 5V11H9v3H7V7Zm10 10H9v3l-5-5 5-5v3h8v4Z" />
    </svg>
  ),
  shorts: (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor">
      <path d="M5 3h14v18l-7-4-7 4V3Zm5 6v6l5-3-5-3Z" />
    </svg>
  ),
  list: (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor">
      <path d="M4 6h13v2H4Zm0 5h13v2H4Zm0 5h9v2H4Zm15-3 4 2-4 2Z" />
    </svg>
  ),
  palette: (
    <svg viewBox="0 0 24 24" width={22} height={22} fill="currentColor">
      <path d="M12 2a10 10 0 1 0 4 19c1 0 1.5-.7 1.5-1.5 0-.4-.1-.7-.4-1-.3-.3-.4-.6-.4-1 0-.8.6-1.5 1.4-1.5H20a4 4 0 0 0 4-4c0-5.5-5.4-10-12-10Zm-5 11a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm4-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm3.5 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
    </svg>
  ),
};

/** Inline visual: a small "rate chip strip" for the playback rate card. */
function RateStripVisual() {
  const rates = ["0.5×", "1×", "1.5×", "2×", "2.5×"];
  return (
    <div className="flex flex-wrap gap-1.5">
      {rates.map((r, i) => (
        <span
          key={r}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
            i === 2
              ? "bg-foreground text-background border-foreground"
              : "border-foreground/15 text-foreground/65"
          }`}
        >
          {r}
        </span>
      ))}
    </div>
  );
}

/** Mini progress bar with loop markers for the loop segments card. */
function LoopVisual() {
  return (
    <div className="relative h-2 rounded-full bg-foreground/10">
      <div
        className="absolute h-full rounded-full bg-foreground/85"
        style={{ left: "20%", width: "55%" }}
      />
      <div
        className="absolute w-0 h-0 border-x-[6px] border-x-transparent border-t-[10px] border-t-red-500"
        style={{ left: "20%", top: "-12px", transform: "translateX(-50%)" }}
      />
      <div
        className="absolute w-0 h-0 border-x-[6px] border-x-transparent border-t-[10px] border-t-red-500"
        style={{ left: "75%", top: "-12px", transform: "translateX(-50%)" }}
      />
    </div>
  );
}

/** Theme swatch trio for the appearance card. */
function ThemeSwatches() {
  return (
    <div className="flex gap-2">
      {[
        ["#0f0f10", "Dark"],
        ["#fafafa", "Light"],
        ["linear-gradient(135deg,#0f0f10 50%,#fafafa 50%)", "System"],
      ].map(([bg, label]) => (
        <div key={label} className="flex flex-col items-center gap-1">
          <div
            className="w-10 h-10 rounded-lg border border-foreground/10 shadow-sm"
            style={{ background: bg }}
          />
          <div className="text-[10px] text-foreground/55">{label}</div>
        </div>
      ))}
    </div>
  );
}

export default function FeaturesGrid() {
  return (
    <section className="relative py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-12 lg:mb-16"
        >
          <div className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">
            What it does
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Small features.
            <br />
            <span className="text-foreground/50">Huge quality of life.</span>
          </h2>
          <p className="mt-5 text-base lg:text-lg text-foreground/65 leading-relaxed">
            Each feature is built to disappear into the experience — until you
            need it, and then it&apos;s right where you&apos;d expect.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-5 lg:gap-6">
          <FeatureCard
            title="Audio Mode"
            description="Listen without the visual. Black screen, audio visualizer, or your own background image."
            icon={Icons.audio}
            tone="amber"
            span={2}
            visual={
              <div className="aspect-[2/1] rounded-xl bg-black flex items-center justify-center text-white/80 text-xs tracking-widest uppercase relative overflow-hidden">
                <motion.div
                  aria-hidden
                  animate={{ x: ["0%", "100%"] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-y-0 w-1/3"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                  }}
                />
                Now Playing
              </div>
            }
          />
          <FeatureCard
            title="Custom Playback Rates"
            description="Add any speed you want — 0.0625× to 16×. Toggle to your favorite fast pace with one key."
            icon={Icons.rate}
            tone="rose"
            visual={<RateStripVisual />}
          />
          <FeatureCard
            title="Loop Segments"
            description="Mark start and end on the progress bar. Loops cleanly, perfect for practicing or studying."
            icon={Icons.loop}
            tone="violet"
            visual={<LoopVisual />}
          />
          <FeatureCard
            title="Shorts, refined"
            description="Auto-scroll when one ends, set your seek length, and keep your hands off the trackpad."
            icon={Icons.shorts}
            tone="emerald"
          />
          <FeatureCard
            title="Playlist Runtime"
            description="Total and average duration shown at the top of every playlist. Plan your watch sessions."
            icon={Icons.list}
            tone="blue"
          />
          <FeatureCard
            title="Themes"
            description="Pick System, Dark, or Light for the extension UI. System follows your OS live."
            icon={Icons.palette}
            tone="amber"
            visual={<ThemeSwatches />}
          />
        </div>
      </div>
    </section>
  );
}
