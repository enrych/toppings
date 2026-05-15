/**
 * Shared motion presets for the marketing site.
 *
 * One easing curve (`EASE_EXPO_OUT`, the brand's expo-out) and two
 * reveal patterns. Both are scroll-triggered via `whileInView` with
 * `viewport.once: true`.
 *
 * ─── Tone
 *
 * Motion on this site is "the page settles in" — slow, generous,
 * editorial. Closer to a magazine page typesetting itself than a SaaS
 * dashboard appearing.
 *
 *   - `fadeInUp` body content travels 24px over 900ms.
 *   - `displayReveal` headlines travel 40px over 1100ms.
 *   - Sibling stagger between rows lives in the 90-150ms band.
 *
 * Per the design system: fades and gentle slides only — no springs,
 * no bounces, no parallax.
 *
 * ─── Post-animation flicker, fixed
 *
 * Browsers anti-alias text differently when an element is on a GPU
 * compositor layer (grayscale AA) vs sitting in the regular paint tree
 * (subpixel AA). When framer-motion clears the `transform` at the end
 * of a translateY animation, the element falls off its layer and text
 * re-rasterizes — visible as a subtle "flicker" or sharpness snap.
 *
 * The `style` block below pins the element onto a layer permanently
 * (`willChange: transform`, `transform: translateZ(0)`) and locks its
 * font smoothing to grayscale so the rendering is identical before,
 * during, and after the animation. No more snap.
 */
import type { MotionProps } from "framer-motion";

export const EASE_EXPO_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Style applied to every animated element so the GPU layer stays
 * pinned and text AA doesn't snap when the animation ends.
 */
export const MOTION_LAYER_STYLE = {
  willChange: "transform" as const,
  transform: "translateZ(0)",
  backfaceVisibility: "hidden" as const,
  WebkitFontSmoothing: "antialiased" as const,
};

interface RevealOpts {
  delay?: number;
  duration?: number;
  /** Travel distance for the y offset. */
  y?: number;
}

const PRE_FIRE_MARGIN = "200px 0px 200px 0px";

/** Scroll-into-view fade-up. Use on body content and rows. */
export function fadeInUp({
  delay = 0,
  duration = 0.9,
  y = 24,
}: RevealOpts = {}): MotionProps {
  return {
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: PRE_FIRE_MARGIN },
    transition: { duration, ease: EASE_EXPO_OUT, delay },
    style: MOTION_LAYER_STYLE,
  };
}

/** Slightly heavier reveal for display elements (h2 in section heads). */
export function displayReveal({
  delay = 0,
  duration = 1.1,
  y = 40,
}: RevealOpts = {}): MotionProps {
  return {
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: PRE_FIRE_MARGIN },
    transition: { duration, ease: EASE_EXPO_OUT, delay },
    style: MOTION_LAYER_STYLE,
  };
}
