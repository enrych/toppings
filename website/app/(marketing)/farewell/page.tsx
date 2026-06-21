import { ReclaimMini } from "@/components/reclaim";
import { FEEDBACK_MAILTO } from "@/constants/site";

export default function Farewell() {
  return (
    <ReclaimMini
      kicker="Sorry to see you go"
      titleBefore="We'll miss "
      titleEm="you"
      titleAfter="."
      body={[
        "We're sorry to see you go. We'd love to hear about any feedback you may have.",
      ]}
      cta={{
        label: "Help Us Improve!",
        href: FEEDBACK_MAILTO,
      }}
    />
  );
}
