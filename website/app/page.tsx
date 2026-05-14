import Hero from "@/components/home/Hero";
import ShortcutMarquee from "@/components/home/ShortcutMarquee";
import AudioModeShowcase from "@/components/home/AudioModeShowcase";
import FeaturesGrid from "@/components/home/FeaturesGrid";
import StatsStrip from "@/components/home/StatsStrip";
import HowItWorks from "@/components/home/HowItWorks";
import FinalCTA from "@/components/home/FinalCTA";

export default function Home() {
  return (
    <main>
      <Hero />
      <ShortcutMarquee />
      <AudioModeShowcase />
      <FeaturesGrid />
      <StatsStrip />
      <HowItWorks />
      <FinalCTA />
    </main>
  );
}
