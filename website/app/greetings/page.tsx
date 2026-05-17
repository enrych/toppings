import { GREETINGS, LABEL, ROUTE } from "@toppings/constants";
import ReclaimMini from "@/components/reclaim/ReclaimMini";

/** Post-install page — rebranded onto the Reclaim system. */
export default function Greetings() {
  return (
    <ReclaimMini
      kicker="Toppings installed"
      titleBefore="You’re all "
      titleEm="set"
      titleAfter="."
      body={[GREETINGS.BODY, GREETINGS.BODY_LINE_2]}
      cta={{
        label: LABEL.READ_WIKI,
        href: ROUTE.DOCS,
        internal: true,
      }}
    />
  );
}
