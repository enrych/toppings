import Hero from "@/components/home/Hero";
import FeatureGrid from "@/components/home/FeatureGrid";
import StatsStrip from "@/components/home/StatsStrip";
import InverseSection from "@/components/home/InverseSection";
import Keybindings from "@/components/home/Keybindings";
import Principles from "@/components/home/Principles";
import HowItWorks from "@/components/home/HowItWorks";
import FinalCTA from "@/components/home/FinalCTA";

/**
 * Home page rhythm:
 *
 *   Hero            — what it is
 *   FeatureGrid     — the four superpowers in a hairline-grid
 *   StatsStrip      — count-up trust markers (cream)
 *   InverseSection  — the audio-mode proof point on ink, with count-up
 *                     numbers for bandwidth / battery / data-out
 *   Keybindings     — every shortcut, rebindable
 *   Principles      — private / open / restrained
 *   HowItWorks      — three steps, no friction
 *   FinalCTA        — closing install prompt
 *
 *   (Navbar in (marketing)/layout.tsx, Footer in the same.)
 *
 * The page goes cream → cream → cream → ink → cream → cream → cream →
 * cream. Exactly one inverse marketing section, per the design rule.
 */
export default function Home() {
  return (
    <main>
      <Hero />
      <FeatureGrid />
      <StatsStrip />
      <InverseSection />
      <Keybindings />
      <Principles />
      <HowItWorks />
      <FinalCTA />
    </main>
  );
}
