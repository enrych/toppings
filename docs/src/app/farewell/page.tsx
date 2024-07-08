import Image from "next/image";
import farewellIllustration from "../../../public/assets/illustrations/farewell.png";
import formIcon from "../../../public/assets/icons/form.png";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Farewell() {
  return (
    <div className="relative mx-auto flex justify-center items-center w-screen h-auto py-12 lg:p-0">
      <div className="w-full overflow-x-hidden flex flex-col-reverse lg:flex-row justify-around items-center h-full">
        <div className="flex flex-col items-center justify-center p-8 lg:p-24 w-full lg:w-1/2 h-full overflow-x-hidden text-wrap break-words">
          <h1
            className="text-[70px] max-w-[700px] font-bold text-gray-900 leading-tight text-center "
            style={{ fontVariationSettings: "'wght' 900" }}
          >
            Goodbye!
            <br />
            <span className="text-primary">We&apos;ll Miss You!</span>
          </h1>
          <p className="mt-4 text-lg text-gray-700 text-center">
            We&apos;re sorry to see you go, but we understand that circumstances
            change. We&apos;d love to hear about any feedback you may have. Your
            insights help us improve and provide a better experience for our
            users.
          </p>
          <div className="py-8">
            <Button
              className="px-6 py-6 gap-2 bg-primary hover:bg-[#fc9c26] font-bold text-base"
              asChild
            >
              <Link
                href="https://docs.google.com/forms/d/e/1FAIpQLSfjPEHIUiKsMtI8nkM3bNHePT2EVwLg-frOozkWD8PXtO6UlQ/viewform"
                target="_blank"
              >
                <Image src={formIcon} alt="Form" width={24} height={24} />
                Help Us Improve!
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center w-full lg:w-1/2">
          <Image
            src={farewellIllustration}
            alt="hero"
            className="max-w-none w-3/4 lg:w-[70vw] lg:h-[90vh] relative lg:transform drop-shadow-md select-none"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
