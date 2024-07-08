"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { akronim } from "@/lib/fonts";
import toppingsLogo from "../../public/assets/icons/icon512.png";
import cn from "@/lib/cn";
import AddToBrowser from "./AddToBrowser";

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
              className={cn(
                "text-4xl font-normal text-brandBlack",
                akronim.className,
              )}
            >
              Toppings
            </span>
          </Link>
        </div>
        <div className="flex items-center">
          <Button className="px-6 py-6 text-foreground" asChild variant="link">
            <Link href="/docs">Docs</Link>
          </Button>
          <Button className="px-6 py-6 text-foreground" asChild variant="link">
            <Link href="https://darhkvoyd.me/sponser" target="_blank">
              Become a sponser
            </Link>
          </Button>
          <AddToBrowser />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
