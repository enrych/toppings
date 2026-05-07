import { FAREWELL } from "./data";
import ReclaimMini from "@/components/reclaim/ReclaimMini";
import { feedbackMailtoHref } from "@/lib/mailto";

export default function Farewell() {
  return (
    <ReclaimMini
      kicker={FAREWELL.KICKER}
      titleBefore={FAREWELL.TITLE_BEFORE}
      titleEm={FAREWELL.TITLE_EM}
      titleAfter={FAREWELL.TITLE_AFTER}
      body={[FAREWELL.BODY]}
      cta={{
        label: FAREWELL.FEEDBACK_BUTTON,
        href: feedbackMailtoHref(),
      }}
    />
  );
}
