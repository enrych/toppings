import React, { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
  /** Optional in-page nav rendered as a right rail. */
  rightRail?: ReactNode;
}

/**
 * App shell: persistent sidebar on the left, scrolling content area in the
 * middle, optional right-rail (typically a SectionNav).
 */
export default function AppLayout({ children, rightRail }: AppLayoutProps) {
  return (
    <div className="tw-min-h-screen tw-flex tw-bg-[#0f0f10] tw-text-gray-100">
      <Sidebar />
      {/*
       * No overflow-x-hidden here. position: sticky on the right rail uses
       * the nearest scrolling ancestor as its scroll container — any
       * ancestor with overflow != visible becomes that container, even if
       * it isn't actually scrolling, which silently breaks the sticky.
       */}
      <main className="tw-flex-1 tw-min-w-0">
        <div className="tw-mx-auto tw-max-w-5xl tw-px-10 tw-py-8 tw-flex tw-gap-10 tw-items-start">
          <div className="tw-flex-1 tw-min-w-0">{children}</div>
          {rightRail && (
            <div className="tw-w-44 tw-flex-shrink-0 tw-hidden lg:tw-block tw-self-start tw-sticky tw-top-6">
              {rightRail}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
