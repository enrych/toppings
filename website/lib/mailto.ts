import { FEEDBACK_MAIL, MAILTO } from "@/lib/feedback-mail.data";
import { interpolateTemplate } from "@toppings/utils";

export function feedbackMailtoHref(): string {
  return interpolateTemplate(MAILTO.FEEDBACK, {
    to: FEEDBACK_MAIL.TO,
    encodedSubject: encodeURIComponent(FEEDBACK_MAIL.SUBJECT),
  });
}
