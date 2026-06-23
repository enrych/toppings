import React, { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
  rightRail?: ReactNode;
}

export default function AppLayout({ children, rightRail }: AppLayoutProps) {
  return (
    <div className="tw-min-h-screen tw-flex tw-bg-bg tw-text-fg">
      <Sidebar />
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
