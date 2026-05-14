"use client";
import { motion } from "framer-motion";
import FeatureCard from "./FeatureCard";

const Icons = {
  audio: (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
      <path d="M12 1c-3 0-5.5 2.5-5.5 5.5v6C6.5 15.5 9 18 12 18s5.5-2.5 5.5-5.5v-6C17.5 3.5 15 1 12 1ZM4 12.5c0 4.1 3.1 7.6 7 8v2.5h2v-2.5c3.9-.4 7-3.9 7-8h-2c0 3.3-2.7 6-6 6s-6-2.7-6-6H4Z" />
    </svg>
  ),
  rate: (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 13l-4-2.5V7h2v4.5l3 1.9Z" />
    </svg>
  ),
  loop: (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
      <path d="M7 7h8V4l5 5-5 5V11H9v3H7V7Zm10 10H9v3l-5-5 5-5v3h8v4Z" />
    </svg>
  ),
  shorts: (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
      <path d="M5 3h14v18l-7-4-7 4V3Zm5 6v6l5-3-5-3Z" />
    </svg>
  ),
  list: (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
      <path d="M4 6h13v2H4Zm0 5h13v2H4Zm0 5h9v2H4Zm15-3 4 2-4 2Z" />
    </svg>
  ),
  palette: (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor">
      <path d="M12 2a10 10 0 1 0 4 19c1 0 1.5-.7 1.5-1.5 0-.4-.1-.7-.4-1-.3-.3-.4-.6-.4-1 0-.8.6-1.5 1.4-1.5H20a4 4 0 0 0 4-4c0-5.5-5.4-10-12-10Zm-5 11a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm4-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm3.5 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
    </svg>
  ),
};

function RateStrip() {
  const rates = ["0.5×", "1×", "1.5×", "2×", "2.5×"];
  return (
    <div className="flex flex-wrap gap-1.5">
      {rates.map((r, i) => (
        <span
          key={r}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
            i === 2
              ? "bg-ink text-cream border-ink"
              : "border-ink/12 text-ink/60"
          }`}
        >
          {r}
        </span>
      ))}
    </div>
  );
}

function LoopBar() {
  return (
    <div className="relative h-1.5 rounded-full bg-ink/8">
      <div
        className="absolute h-full rounded-full bg-ink/85"
        style={{ left: "20%", width: "55%" }}
      />
      <div
        className="absolute w-0 h-0 border-x-[6px] border-x-transparent border-t-[10px] border-t-amber"
        style={{ left: "20%", top: "-12px", transform: "translateX(-50%)" }}
      />
      <div
        className="absolute w-0 h-0 border-x-[6px] border-x-transparent border-t-[10px] border-t-amber"
        style={{ left: "75%", top: "-12px", transform: "translateX(-50%)" }}
      />
    </div>
  );
}

function ThemeSwatches() {
  return (
    <div className="flex gap-2">
      {[
        ["#0a0a0a", "Dark"],
        ["#fafafa", "Light"],
        ["linear-gradient(135deg,#0a0a0a 50%,#fafafa 50%)", "System"],
      ].map(([bg, label]) => (
        <div key={label} className="flex flex-col items-center gap-1">
          <div
            className="w-9 h-9 rounded-lg border border-ink/10 shadow-sm"
            style={{ background: bg }}
          />
          <div className="text-[10px] text-ink/55">{label}</div>
        </div>
      ))}
    </div>
  );
}

function NowPlaying() {
  return (
    <div className="aspect-[2.2/1] rounded-xl bg-ink flex items-center justify-center text-cream/75 text-[10px] tracking-[0.25em] uppercase relative overflow-hidden">
      <motion.div
        aria-hidden
        animate={{ x: ["-30%", "130%"] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
        className="absolute inset-y-0 w-1/3"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(252,169,41,0.18), transparent)",
        }}
      />
      <span className="relative">Now Playing</span>
    </div>
  );
}

export default function FeaturesGrid() {
  return (
    <section className="relative py-24 lg:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="max-w-3xl mb-14 lg:mb-20"
        >
          <div className="text-[11px] uppercase tracking-[0.22em] text-amber font-semibold mb-4">
            What it does
          </div>
          <h2 className="text-display text-[40px] sm:text-[56px] lg:text-[72px] text-ink">
            Small features.
            <br />
            <span className="text-ink/40">Huge quality of life.</span>
          </h2>
          <p className="mt-6 text-base lg:text-lg text-ink/60 leading-relaxed max-w-xl">
            Each feature is built to disappear into the experience — until
            you need it, and then it&apos;s right where you&apos;d expect.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-5 lg:gap-6">
          <FeatureCard
            title="Audio Mode"
            description="Listen without the visual. Black screen, audio visualizer, or your own background image."
            icon={Icons.audio}
            span={2}
            visual={<NowPlaying />}
          />
          <FeatureCard
            title="Custom Playback Rates"
            description="Add any speed — 0.0625× to 16×. One keystroke flips to your favorite fast pace."
            icon={Icons.rate}
            visual={<RateStrip />}
          />
          <FeatureCard
            title="Loop Segments"
            description="Mark start and end on the progress bar. Loops cleanly — perfect for practice or study."
            icon={Icons.loop}
            visual={<LoopBar />}
          />
          <FeatureCard
            title="Shorts, refined"
            description="Auto-scroll when one ends, set your seek length, keep your hands off the trackpad."
            icon={Icons.shorts}
          />
          <FeatureCard
            title="Playlist Runtime"
            description="Total and average duration shown at the top of every playlist. Plan your watch sessions."
            icon={Icons.list}
          />
          <FeatureCard
            title="Themes"
            description="Pick System, Dark, or Light for the extension UI. System follows your OS live."
            icon={Icons.palette}
            visual={<ThemeSwatches />}
          />
        </div>
      </div>
    </section>
  );
}
