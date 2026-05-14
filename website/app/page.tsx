import Hero from "@/components/home/Hero";
import FeatureGrid from "@/components/home/FeatureGrid";
import InverseSection from "@/components/home/InverseSection";
import Keybindings from "@/components/home/Keybindings";
import Principles from "@/components/home/Principles";
import FinalCTA from "@/components/home/FinalCTA";

/**
 * Home — implements the section order from the Claude Design handoff:
 *   Navbar (in layout)
 *   Hero
 *   FeatureGrid
 *   InverseSection
 *   Keybindings
 *   Principles
 *   FinalCTA
 *   Footer (in layout)
 *
 * The page goes cream → cream → ink → cream → cream → cream → ink (footer).
 * One inverse marketing section, ever.
 */
export default function Home() {
  return (
    <main>
      <Hero />
      <FeatureGrid />
      <InverseSection />
      <Keybindings />
      <Principles />
      <FinalCTA />
    </main>
  );
}
