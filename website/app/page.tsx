import Image from "next/image";
import CallToAction from "@/components/CallToAction";
import heroIllustration from "@/assets/illustrations/hero.webp";

export default function Home() {
  return (
    <div className="relative mx-auto flex justify-center items-center w-screen h-auto py-12 lg:p-0">
      <div className="w-full overflow-x-hidden flex flex-col-reverse lg:flex-row justify-around items-center h-full">
        <div className="flex flex-col items-center justify-center p-8 lg:p-24 w-full lg:w-1/2 h-full overflow-x-hidden text-wrap break-words">
          <h1
            className="text-[64px] max-w-[500px] font-bold text-gray-900 leading-tight text-center lg:text-left"
            style={{ fontVariationSettings: "'wght' 900" }}
          >
            Your YouTube,
            <br />
            <span className="text-primary">Your Way</span>
          </h1>
          <p className="mt-4 text-lg text-gray-700 text-center">
            A customizable browser extension that gives you total control over
            YouTube—track playlist runtimes, fine-tune playback speed,
            auto-scroll Shorts, set custom seek durations, and more. Take
            control of your YouTube like never before.
          </p>
          <div className="py-8">
            <CallToAction />
          </div>
        </div>
        <div className="flex items-center justify-center w-full lg:w-1/2">
          <Image
            src={heroIllustration}
            alt="hero"
            className="max-w-none w-3/4 lg:w-[70vw] relative lg:transform drop-shadow-md select-none"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
