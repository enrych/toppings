import { defineMessage } from "@/kernel/messaging";

// Content scripts cannot open the options page themselves.
export const openOptions = defineMessage<void, void>("open-options");
