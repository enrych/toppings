"use client";
import Image from "next/image";
import Link from "next/link";
import getExtensionWebStore from "@/lib/getExtensionWebStore";
import { Button } from "./ui/button";

const AddToBrowser = () => {
  const { isSupported, browser, store } = getExtensionWebStore();
  return (
    <Button
      className="px-6 py-6 gap-2 bg-accent hover:bg-[#fc9c26] font-bold text-base"
      asChild
    >
      <Link href={store} target="_blank">
        <Image
          src={`/assets/icons/${isSupported ? browser : "github"}.svg`}
          alt={`${browser} Icon`}
          width={24}
          height={24}
        />
        Add to{" "}
        {isSupported
          ? browser.at(0)?.toUpperCase() + browser.slice(1)
          : "Browser"}
      </Link>
    </Button>
  );
};

export default AddToBrowser;
