import { FAREWELL, FEEDBACK_MAIL, MAILTO } from "@toppings/constants";
import { interpolateTemplate } from "@toppings/utils";
import ReclaimMini from "@/components/reclaim/ReclaimMini";

const feedbackMailtoHref = interpolateTemplate(MAILTO.FEEDBACK, {
  to: FEEDBACK_MAIL.TO,
  encodedSubject: encodeURIComponent(FEEDBACK_MAIL.SUBJECT),
});

/** Uninstall page — same Reclaim shell as greetings. */
export default function Farewell() {
  return (
    <ReclaimMini
      kicker="Sorry to see you go"
      titleBefore="We'll miss "
      titleEm="you"
      titleAfter="."
      body={[FAREWELL.BODY]}
      cta={{
        label: FAREWELL.FEEDBACK_BUTTON,
        href: feedbackMailtoHref,
      }}
    />
  );
}
