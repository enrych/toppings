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

interface MagneticCTAProps {
  size?: "md" | "lg";
}

/**
 * Browser-aware install CTA with a magnetic hover effect — the button gently
 * leans toward the cursor when it enters the trigger area, then snaps back
 * on leave. Uses Framer Motion springs for smooth, physics-y motion.
 */
export default function MagneticCTA({ size = "lg" }: MagneticCTAProps) {
  const [agent, setAgent] = useState<keyof typeof STORES>("unknown");
  const ref = useRef<HTMLAnchorElement>(null);

  // Translation values, smoothed with a spring for organic motion.
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
    // Pull toward cursor, but only a fraction so it stays subtle.
    const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.25;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.25;
    x.set(dx);
    y.set(dy);
  };

  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const sizing =
    size === "lg" ? "h-14 px-7 text-base" : "h-11 px-5 text-sm";

  return (
    <motion.div style={{ x: springX, y: springY }} className="inline-block">
      <Link
        ref={ref}
        href={STORES[agent].url}
        target="_blank"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className={`group relative inline-flex items-center gap-3 ${sizing} font-semibold rounded-full text-white overflow-hidden`}
        style={{
          background:
            "linear-gradient(120deg, rgb(252,169,41), rgb(252,124,41) 40%, rgb(252,64,110))",
          boxShadow:
            "0 10px 30px -8px rgba(252,124,41,0.55), 0 1px 0 0 rgba(255,255,255,0.4) inset",
        }}
      >
        {/* Sheen sweep on hover */}
        <span
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background:
              "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
            backgroundSize: "300% 100%",
            animation: "shimmer 1.8s linear infinite",
          }}
        />
        <span className="relative z-10">{STORES[agent].label}</span>
        <Image
          src={STORES[agent].icon}
          alt=""
          width={size === "lg" ? 22 : 18}
          height={size === "lg" ? 22 : 18}
          className="relative z-10"
        />
      </Link>
    </motion.div>
  );
}
