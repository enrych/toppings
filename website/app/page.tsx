import ReclaimHome from "@/components/reclaim/ReclaimHome";

/**
 * / (— /toppings) — the "Reclaim, enacted" home.
 *
 * A bespoke full-bleed experience: it deliberately sits OUTSIDE the
 * (marketing) route group so it does not inherit the cream Navbar /
 * Footer — it brings its own chrome and its own ending. /docs and the
 * greetings / farewell pages keep the original cream system untouched.
 *
 * Spine = the reclaim arc (noise → control → quiet).
 * Destination = the quiet layer (every scene resolves calm).
 * Texture = living interface (shader parallax + the live keyboard).
 */
export default function Page() {
  return <ReclaimHome />;
}
