"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Akronim } from "next/font/google";
import toppingsLogo from "@/assets/icons/icon512.png";
import CallToAction from "./CallToAction";

const akronim = Akronim({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const Navbar = () => {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`sticky top-0 bg-background z-50 ${hasScrolled ? "shadow-md" : ""} transition-shadow duration-300`}
    >
      <div className="max-w-[90vw] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[80px]">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image
              src={toppingsLogo}
              alt="Toppings Logo"
              className="h-10 w-auto mr-2"
            />
            <span
              className={`text-4xl font-normal text-brandBlack ${akronim.className}`}
            >
              Toppings
            </span>
          </Link>
        </div>
        <div className="flex items-center">
          <div className="hidden lg:block">
            <Link
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 underline-offset-4 hover:underline h-10 px-6 py-6 text-foreground"
              href="https://github.com/enrych/toppings/wiki"
            >
              Read Wiki
            </Link>
          </div>
          <Link
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 underline-offset-4 hover:underline h-10 px-6 py-6 text-foreground"
            href="https://darhkvoyd.me/sponsor"
            target="_blank"
          >
            Become a sponsor
          </Link>
          <div className="hidden lg:block">
            <CallToAction />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
