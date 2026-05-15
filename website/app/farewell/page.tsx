import {
  WEBSITE_FAREWELL,
  WEBSITE_FEEDBACK_MAILTO_HREF,
} from "toppings-constants";
import ReclaimMini from "@/components/reclaim/ReclaimMini";

/** Post-uninstall page — rebranded onto the Reclaim system. */
export default function Farewell() {
  return (
    <ReclaimMini
      kicker="Toppings removed"
      titleBefore="We’ll "
      titleEm="miss"
      titleAfter=" you."
      body={[WEBSITE_FAREWELL.BODY]}
      cta={{
        label: WEBSITE_FAREWELL.FEEDBACK_BUTTON,
        href: WEBSITE_FEEDBACK_MAILTO_HREF,
      }}
    />
  );
}
