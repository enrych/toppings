export const FEEDBACK_MAIL = {
  TO: "divyadityasnaruka@gmail.com",
  SUBJECT: "Feedback for Toppings",
} as const;

export const MAILTO = {
  FEEDBACK: "mailto:{{to}}?subject={{encodedSubject}}",
} as const;
