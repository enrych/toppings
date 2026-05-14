"use client";
import { motion } from "framer-motion";

/**
 * A single line of keyboard-shortcut chips that drifts horizontally. Adds a
 * subtle "product is real, has depth" signal without color noise. Uses a
 * gradient mask so the strip fades at the edges instead of cutting harshly.
 */

const SHORTCUTS = [
  { key: "B", label: "Toggle Audio Mode" },
  { key: "X", label: "Toggle Playback Rate" },
  { key: "W", label: "Faster" },
  { key: "S", label: "Slower" },
  { key: "A", label: "Seek Back" },
  { key: "D", label: "Seek Forward" },
  { key: "Z", label: "Toggle Loop" },
  { key: "Q", label: "Loop Start" },
  { key: "E", label: "Loop End" },
];

function Chip({ k, label }: { k: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-3 px-5 py-3 mx-2 rounded-full bg-ink/[0.03] border border-ink/[0.08] whitespace-nowrap">
      <kbd className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-ink text-cream text-xs font-mono font-medium">
        {k}
      </kbd>
      <span className="text-sm text-ink/70 font-medium">{label}</span>
    </div>
  );
}

export default function ShortcutMarquee() {
  return (
    <section className="relative py-14 lg:py-20 border-y border-ink/[0.06] bg-cream">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-6 flex items-baseline justify-between">
        <h3 className="text-[11px] uppercase tracking-[0.22em] text-ink/55 font-semibold">
          Built for keyboard people
        </h3>
        <p className="text-xs text-ink/45 hidden sm:block">
          All shortcuts customizable in settings
        </p>
      </div>

      <div
        className="relative overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <motion.div
          className="flex"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          {/* Duplicate the list so the loop is seamless. */}
          {[...SHORTCUTS, ...SHORTCUTS].map((s, i) => (
            <Chip key={i} k={s.key} label={s.label} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
