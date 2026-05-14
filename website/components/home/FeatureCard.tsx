"use client";
import { ReactNode, MouseEvent, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  visual?: ReactNode;
  span?: 1 | 2;
}

/**
 * Cursor-tilt card. The 3D effect is intentionally subtle (~5deg max) —
 * just enough to feel alive. Single amber accent appears on hover via a
 * soft radial that follows the cursor; the rest of the card stays
 * monochrome so the grid reads as a coherent system, not a rainbow.
 */
export default function FeatureCard({
  title,
  description,
  icon,
  visual,
  span = 1,
}: FeatureCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), {
    stiffness: 200,
    damping: 22,
  });
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), {
    stiffness: 200,
    damping: 22,
  });

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
      className={`relative group rounded-3xl bg-white border border-ink/[0.07] overflow-hidden ${
        span === 2 ? "lg:col-span-2" : ""
      }`}
    >
      {/* Single amber glow that follows the cursor. */}
      <motion.div
        aria-hidden
        className="absolute pointer-events-none w-[440px] h-[440px] -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          left: glowX,
          top: glowY,
          background:
            "radial-gradient(closest-side, rgba(252,169,41,0.32), transparent)",
        }}
      />

      <div className="relative p-6 lg:p-7 h-full flex flex-col">
        {/* Icon: black tile, amber on hover. Single-color system. */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 bg-ink text-cream group-hover:bg-amber group-hover:text-ink transition-colors duration-200">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-ink tracking-tight">
          {title}
        </h3>
        <p className="mt-2 text-sm text-ink/60 leading-relaxed">
          {description}
        </p>
        {visual && <div className="mt-6">{visual}</div>}
      </div>
    </motion.div>
  );
}
