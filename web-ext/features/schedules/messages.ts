import { defineMessage } from "@/kernel/messaging";

// Only the background changes schedule state, so the popup asks it to.
export const skipSchedule = defineMessage<void, void>("skip-schedule");
