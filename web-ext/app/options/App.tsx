import type { ComponentType } from "preact";
import { useTheme } from "@/ui/useTheme";
import { ToastProvider } from "@/ui/feedback/ToastProvider";
import SectionNav from "@/ui/layout/SectionNav";
import { OPTIONS_PAGES } from "./data";
import { useRoute } from "./router";
import Sidebar from "./layout/Sidebar";
import General from "./routes/General";
import Watch from "./routes/Watch";
import Shorts from "./routes/Shorts";
import Playlist from "./routes/Playlist";
import Profiles from "./routes/Profiles";
import Shortcuts from "./routes/Shortcuts";

const PAGE_BY_SEGMENT: Record<string, ComponentType> = {
  "": General,
  watch: Watch,
  shorts: Shorts,
  playlist: Playlist,
  profiles: Profiles,
  shortcuts: Shortcuts,
};

export default function App() {
  useTheme();
  const segment = useRoute();
  const page = OPTIONS_PAGES.find((p) => p.segment === segment) ?? OPTIONS_PAGES[0];
  const Page = PAGE_BY_SEGMENT[page.segment];

  return (
    <ToastProvider>
      <div class="tw-min-h-screen tw-flex tw-bg-bg tw-text-fg">
        <Sidebar />
        <main class="tw-flex-1 tw-min-w-0">
          <div class="tw-mx-auto tw-max-w-5xl tw-px-10 tw-py-8 tw-flex tw-gap-10 tw-items-start">
            <div class="tw-flex-1 tw-min-w-0">
              <Page key={page.segment} />
            </div>
            {page.sections && (
              <div class="tw-w-44 tw-flex-shrink-0 tw-hidden lg:tw-block tw-sticky tw-top-6">
                <SectionNav items={page.sections} />
              </div>
            )}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
