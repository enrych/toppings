import { GREETINGS } from "./data";
import { LABEL, ROUTE } from "@/lib/site.data";
import ReclaimMini from "@/components/reclaim/ReclaimMini";

export default function Greetings() {
  return (
    <ReclaimMini
      kicker={GREETINGS.KICKER}
      titleBefore={GREETINGS.TITLE_BEFORE}
      titleEm={GREETINGS.TITLE_EM}
      titleAfter={GREETINGS.TITLE_AFTER}
      body={[GREETINGS.BODY, GREETINGS.BODY_LINE_2]}
      cta={{
        label: LABEL.READ_DOCS,
        href: ROUTE.DOCS,
        internal: true,
      }}
    />
  );
}
