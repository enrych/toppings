import Image from "next/image";
import heroIllustration from "../../public/assets/illustrations/hero.png";
import AddToBrowser from "@/components/AddToBrowser";

export default function Home() {
  return (
    <div className="relative mx-auto flex justify-center items-center w-screen h-auto py-12 lg:p-0">
      <div className="w-full overflow-x-hidden flex flex-col-reverse lg:flex-row justify-around items-center h-full">
        <div className="flex flex-col items-center justify-center p-8 lg:p-24 w-full lg:w-1/2 h-full overflow-x-hidden text-wrap break-words">
          <h1
            className="text-[70px] max-w-[500px] font-bold text-gray-900 leading-tight text-center lg:text-left"
            style={{ fontVariationSettings: "'wght' 900" }}
          >
            Your Web,
            <br />
            <span className="text-accent">Your Way</span>
          </h1>
          <p className="mt-4 text-lg text-gray-700 text-center">
            Unlock a new level of customization, seamlessly enhance your
            favorite websites, and enjoy a more personalized browsing
            experience.
          </p>
          <div className="py-8">
            <AddToBrowser />
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
