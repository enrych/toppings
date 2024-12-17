import Image from "next/image";
import Link from "next/link";
import formIcon from "@/assets/icons/form.png";
import farewellIllustration from "@/assets/illustrations/farewell.webp";

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
            We&apos;re sorry to see you go. We&apos;d love to hear about any
            feedback you may have.
          </p>
          <div className="py-8">
            <Link
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground h-10 px-6 py-6 gap-2 bg-primary hover:bg-[#fc9c26] font-bold text-base"
              href="mailto:divyadityasnaruka@gmail.com?subject=Feedback%20for%20Toppings"
              target="_blank"
            >
              <Image src={formIcon} alt="Form" width={24} height={24} />
              Help Us Improve!
            </Link>
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
