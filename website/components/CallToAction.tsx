"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import chromeIcon from "@/assets/icons/chrome.svg";
import firefoxIcon from "@/assets/icons/firefox.svg";
import githubIcon from "@/assets/icons/github.svg";

const browserStores = {
  chrome: {
    url: "https://chrome.google.com/webstore/detail/toppings/aemiblppibhggpgijajindcmmomboibl",
    icon: chromeIcon,
  },
  firefox: {
    url: "https://addons.mozilla.org/en-US/firefox/addon/toppings/",
    icon: firefoxIcon,
  },
  unknown: {
    url: "https://www.github.com/enrych/toppings",
    icon: githubIcon,
  },
};

const CallToAction = () => {
  const [userAgent, setUserAgent] =
    useState<keyof typeof browserStores>("unknown");

  useEffect(() => {
    let userAgent = navigator.userAgent;
    if (userAgent.match(/chrome|chromium|crios/i)) {
      setUserAgent("chrome");
    } else if (userAgent.match(/edg/i)) {
      setUserAgent("chrome");
    } else if (userAgent.match(/opr\//i)) {
      setUserAgent("chrome");
    } else if (userAgent.match(/firefox|fxios/i)) {
      setUserAgent("firefox");
    } else {
      setUserAgent("unknown");
    }
  }, []);

  return (
    <Link
      className="inline-flex items-center justify-center whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground h-10 px-6 py-6 gap-2 bg-primary hover:bg-[#fc9c26] font-bold text-base"
      href={browserStores[userAgent].url}
      target="_blank"
    >
      Try Now{" "}
      <Image
        src={browserStores[userAgent].icon}
        alt="User Browser"
        width={24}
        height={24}
      />
    </Link>
  );
};

export default CallToAction;
