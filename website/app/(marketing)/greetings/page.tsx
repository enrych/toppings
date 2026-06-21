import { LABEL, ROUTE } from "@/constants/site";
import { ReclaimMini } from "@/components/reclaim";

export default function Greetings() {
  return (
    <ReclaimMini
      kicker="Toppings installed"
      titleBefore="You're all "
      titleEm="set"
      titleAfter="."
      body={[
        "Thank you for installing our extension.",
        "Happy browsing!",
      ]}
      cta={{
        label: LABEL.READ_DOCS,
        href: ROUTE.DOCS,
        internal: true,
      }}
    />
  );
}
