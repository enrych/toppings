"use client";
import { ReactNode, MouseEvent, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  /** Optional larger illustration / visual rendered to the right or below. */
  visual?: ReactNode;
  /** Span: 1 (default) or 2 columns wide in the parent grid. */
  span?: 1 | 2;
  /** Tone for the inner accent glow. */
  tone?: "amber" | "rose" | "violet" | "blue" | "emerald";
}

const TONE_GLOW: Record<NonNullable<FeatureCardProps["tone"]>, string> = {
  amber: "radial-gradient(closest-side, rgba(252,169,41,0.4), transparent)",
  rose: "radial-gradient(closest-side, rgba(252,64,110,0.35), transparent)",
  violet: "radial-gradient(closest-side, rgba(130,90,255,0.32), transparent)",
  blue: "radial-gradient(closest-side, rgba(59,130,246,0.32), transparent)",
  emerald:
    "radial-gradient(closest-side, rgba(34,197,94,0.32), transparent)",
};

/**
 * Cursor-tilt card with a soft glow that follows the cursor. The tilt is
 * intentionally subtle (max ~8deg) to feel premium rather than gimmicky.
 * Uses motion springs so the response feels organic and the snap-back is
 * smooth on leave.
 */
export default function FeatureCard({
  title,
  description,
  icon,
  visual,
  span = 1,
  tone = "amber",
}: FeatureCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Normalized cursor coords (-0.5 to 0.5).
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  // Tilt is the inverse of the cursor position — leaning toward it.
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), {
    stiffness: 200,
    damping: 22,
  });
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), {
    stiffness: 200,
    damping: 22,
  });

  // Glow position tracks the cursor.
  const glowX = useTransform(mx, [-0.5, 0.5], ["10%", "90%"]);
  const glowY = useTransform(my, [-0.5, 0.5], ["10%", "90%"]);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 24 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{
        transformPerspective: 1000,
        rotateX: rotX,
        rotateY: rotY,
        transformStyle: "preserve-3d",
      }}
      className={`relative group rounded-3xl bg-white border border-black/[0.06] overflow-hidden ${
        span === 2 ? "lg:col-span-2" : ""
      }`}
    >
      {/* Cursor-following glow */}
      <motion.div
        aria-hidden
        className="absolute pointer-events-none w-[420px] h-[420px] -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          left: glowX,
          top: glowY,
          background: TONE_GLOW[tone],
        }}
      />

      <div className="relative p-6 lg:p-8 h-full flex flex-col">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 text-white"
          style={{
            background:
              tone === "amber"
                ? "linear-gradient(135deg, rgb(252,169,41), rgb(252,124,41))"
                : tone === "rose"
                  ? "linear-gradient(135deg, rgb(252,64,110), rgb(180,40,90))"
                  : tone === "violet"
                    ? "linear-gradient(135deg, rgb(130,90,255), rgb(80,55,200))"
                    : tone === "blue"
                      ? "linear-gradient(135deg, rgb(59,130,246), rgb(37,99,235))"
                      : "linear-gradient(135deg, rgb(34,197,94), rgb(22,163,74))",
          }}
        >
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-foreground tracking-tight">
          {title}
        </h3>
        <p className="mt-2 text-sm text-foreground/65 leading-relaxed">
          {description}
        </p>
        {visual && <div className="mt-6">{visual}</div>}
      </div>
    </motion.div>
  );
}
