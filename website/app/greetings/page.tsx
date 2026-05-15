import { WEBSITE_GREETINGS, WEBSITE_INTERNAL_ROUTE } from "toppings-constants";
import ReclaimMini from "@/components/reclaim/ReclaimMini";

/** Post-install page — rebranded onto the Reclaim system. */
export default function Greetings() {
  return (
    <ReclaimMini
      kicker="Toppings installed"
      titleBefore="You’re all "
      titleEm="set"
      titleAfter="."
      body={[WEBSITE_GREETINGS.BODY, WEBSITE_GREETINGS.BODY_LINE_2]}
      cta={{
        label: WEBSITE_GREETINGS.WIKI_BUTTON,
        href: WEBSITE_INTERNAL_ROUTE.DOCS,
        internal: true,
      }}
    />
  );
}
