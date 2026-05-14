"use client";
import { useState, useEffect, useRef, MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import chromeIcon from "@/assets/icons/chrome.svg";
import firefoxIcon from "@/assets/icons/firefox.svg";
import githubIcon from "@/assets/icons/github.svg";

const STORES = {
  chrome: {
    url: "https://chrome.google.com/webstore/detail/toppings/aemiblppibhggpgijajindcmmomboibl",
    icon: chromeIcon,
    label: "Add to Chrome",
  },
  firefox: {
    url: "https://addons.mozilla.org/en-US/firefox/addon/toppings/",
    icon: firefoxIcon,
    label: "Add to Firefox",
  },
  unknown: {
    url: "https://www.github.com/enrych/toppings",
    icon: githubIcon,
    label: "View on GitHub",
  },
};

interface Props {
  size?: "md" | "lg";
  variant?: "solid" | "outline";
}

/**
 * Browser-aware install CTA. Magnetic hover (button leans toward cursor),
 * single brand accent. No rainbow — just amber on ink, or outline.
 */
export default function MagneticCTA({
  size = "lg",
  variant = "solid",
}: Props) {
  const [agent, setAgent] = useState<keyof typeof STORES>("unknown");
  const ref = useRef<HTMLAnchorElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18 });
  const springY = useSpring(y, { stiffness: 220, damping: 18 });

  useEffect(() => {
    const ua = navigator.userAgent;
    if (/chrome|chromium|crios|edg|opr\//i.test(ua)) setAgent("chrome");
    else if (/firefox|fxios/i.test(ua)) setAgent("firefox");
    else setAgent("unknown");
  }, []);

  const onMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.22);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.22);
  };
  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const sizing = size === "lg" ? "h-14 px-7 text-base" : "h-11 px-5 text-sm";

  const styles =
    variant === "solid"
      ? "bg-ink text-cream hover:bg-ink/90"
      : "bg-transparent text-ink border border-ink/15 hover:bg-ink/5";

  return (
    <motion.div style={{ x: springX, y: springY }} className="inline-block">
      <Link
        ref={ref}
        href={STORES[agent].url}
        target="_blank"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className={`group relative inline-flex items-center gap-3 ${sizing} font-medium rounded-full overflow-hidden transition-colors duration-200 cursor-pointer ${styles}`}
      >
        <span className="relative z-10">{STORES[agent].label}</span>
        {/* Amber dot — the single accent. */}
        <span
          className={`relative z-10 w-2 h-2 rounded-full bg-amber transition-transform duration-300 group-hover:scale-150`}
        />
        <Image
          src={STORES[agent].icon}
          alt=""
          width={size === "lg" ? 20 : 16}
          height={size === "lg" ? 20 : 16}
          className={`relative z-10 ${variant === "solid" ? "invert" : ""}`}
        />
      </Link>
    </motion.div>
  );
}
