import { defineMessage } from "@/kernel/messaging";

// Only the background changes schedule state, so the popup asks it to.
export const skipSchedule = defineMessage<void, void>("skip-schedule");

// Asked by the options page once the user has allowed location there, so the
// answer shows now rather than at the next five-minute check.
export const checkPlaces = defineMessage<void, void>("check-places");
