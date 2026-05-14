"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import InstallButton from "./InstallButton";

/**
 * Marketing Navbar. Implements the Claude Design handoff exactly:
 *  - Sticky, transparent over hero; gains a 1px hairline border bottom on
 *    scroll. No shadows, no gradients.
 *  - Brand wordmark in Inter 900 with display tracking (the same face as
 *    the headlines, so the lockup feels like a single voice).
 *  - Right side: two muted text links + one ink-filled install CTA with
 *    an amber trailing arrow.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={[
        "sticky top-0 z-50 bg-cream transition-colors duration-200",
        scrolled
          ? "border-b border-[--border-1]"
          : "border-b border-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex h-[76px] max-w-page items-center justify-between px-6 lg:px-14">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand/toppings-logo-512.png"
            alt="Toppings"
            width={36}
            height={36}
            priority
            className="h-9 w-9"
          />
          <span
            className="text-[22px] font-black tracking-[-0.04em] text-ink"
            style={{ fontWeight: 900 }}
          >
            Toppings
          </span>
        </Link>
        <div className="flex items-center gap-7">
          <Link
            href="https://github.com/enrych/toppings/wiki"
            className="hidden text-sm font-medium text-[--fg-2] transition-colors duration-150 hover:text-flame lg:inline"
          >
            Read Wiki
          </Link>
          <Link
            href="https://darhkvoyd.me/sponsor"
            target="_blank"
            className="hidden text-sm font-medium text-[--fg-2] transition-colors duration-150 hover:text-flame lg:inline"
          >
            Become a sponsor
          </Link>
          <InstallButton size="sm" />
        </div>
      </div>
    </nav>
  );
}
