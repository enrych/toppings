/**
 * Shared motion presets for the marketing site.
 *
 * One easing curve (`EASE_EXPO_OUT`, the brand's expo-out) and two
 * reveal patterns. Both are scroll-triggered via `whileInView` with
 * `viewport.once: true` so they don't re-fire as the user scrolls back
 * up.
 *
 * ─── Tone
 *
 * Motion on this site is "the page settles in" — slow, generous,
 * editorial. Closer to a magazine page typesetting itself than a SaaS
 * dashboard appearing. Defaults reflect that:
 *
 *   - `fadeInUp` body content travels 24px over 900ms.
 *   - `displayReveal` headlines travel 40px over 1100ms.
 *   - Sibling stagger between rows lives in the 90-150ms band, not 50ms.
 *
 * Per the design system: fades and gentle slides only — no springs,
 * no bounces, no parallax. Keep it that way.
 */
import type { MotionProps } from "framer-motion";

export const EASE_EXPO_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface RevealOpts {
  delay?: number;
  duration?: number;
  /** Travel distance for the y offset. */
  y?: number;
}

/**
 * Viewport margin used by every whileInView trigger. POSITIVE margin
 * means we expand the trigger box past the viewport — animations fire
 * BEFORE the element scrolls in. That's the fix for the "render then
 * flicker" feeling: by the time the user is looking at the element,
 * it's already at its final state.
 *
 * Pre-fire by ~25% of viewport height for body content. Display
 * elements (h2) match the same band for consistency.
 */
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
  };
}
