import Image from "next/image";
import Link from "next/link";
import formIcon from "@/assets/icons/form.png";
import farewellIllustration from "@/assets/illustrations/farewell.webp";
import {
  BROWSER_TARGET,
  WEBSITE_FAREWELL,
  WEBSITE_FEEDBACK_MAILTO_HREF,
  WEBSITE_PRIMARY_BUTTON_HOVER_TW,
} from "toppings-constants";

export default function Farewell() {
  return (
    <div className="relative mx-auto flex justify-center items-center w-screen h-auto py-12 lg:p-0">
      <div className="w-full overflow-x-hidden flex flex-col-reverse lg:flex-row justify-around items-center h-full">
        <div className="flex flex-col items-center justify-center p-8 lg:p-24 w-full lg:w-1/2 h-full overflow-x-hidden text-wrap break-words">
          <h1
            className="text-[70px] max-w-[700px] font-bold text-gray-900 leading-tight text-center "
            style={{ fontVariationSettings: "'wght' 900" }}
          >
            {WEBSITE_FAREWELL.TITLE_GOODBYE}
            <br />
            <span className="text-primary">{WEBSITE_FAREWELL.TITLE_MISS}</span>
          </h1>
          <p className="mt-4 text-lg text-gray-700 text-center">
            {WEBSITE_FAREWELL.BODY}
          </p>
          <div className="py-8">
            <Link
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground h-10 px-6 py-6 gap-2 bg-primary font-bold text-base ${WEBSITE_PRIMARY_BUTTON_HOVER_TW}`}
              href={WEBSITE_FEEDBACK_MAILTO_HREF}
              target={BROWSER_TARGET.BLANK}
            >
              <Image
                src={formIcon}
                alt={WEBSITE_FAREWELL.FORM_ICON_ALT}
                width={24}
                height={24}
              />
              {WEBSITE_FAREWELL.FEEDBACK_BUTTON}
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center w-full lg:w-1/2">
          <Image
            src={farewellIllustration}
            alt={WEBSITE_FAREWELL.ILLUSTRATION_ALT}
            className="max-w-none w-3/4 lg:w-[70vw] lg:h-[90vh] relative lg:transform drop-shadow-md select-none"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
