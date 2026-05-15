/**
 * Shared motion presets for the marketing site. One easing curve
 * (`EASE_EXPO_OUT`, the brand's expo-out) and two reveal patterns: a
 * compact fade-up for body content, and a slightly taller fade-up for
 * display elements. Both are scroll-triggered via `whileInView` with
 * `viewport.once: true` so they don't re-fire as the user scrolls back
 * up.
 *
 * Per the design system, motion on this site is fades and gentle
 * slides only — no springs, no bounces, no parallax. Keep it that way.
 */
import type { MotionProps } from "framer-motion";

export const EASE_EXPO_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface RevealOpts {
  delay?: number;
  duration?: number;
  /** Travel distance for the y offset. Default 16. */
  y?: number;
}

/** Scroll-into-view fade-up. Use on body content and rows. */
export function fadeInUp({
  delay = 0,
  duration = 0.55,
  y = 16,
}: RevealOpts = {}): MotionProps {
  return {
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration, ease: EASE_EXPO_OUT, delay },
  };
}

/** Slightly heavier reveal for display elements (h2 in section heads). */
export function displayReveal({
  delay = 0,
  duration = 0.7,
  y = 30,
}: RevealOpts = {}): MotionProps {
  return {
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration, ease: EASE_EXPO_OUT, delay },
  };
}
