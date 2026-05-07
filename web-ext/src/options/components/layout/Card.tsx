import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Visual container for a group of related settings. Pair with Section to
 * add a heading.
 */
export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`tw-bg-[#18181b] tw-border tw-border-gray-800 tw-rounded-xl tw-divide-y tw-divide-gray-800/60 ${className}`}
    >
      <div className="tw-px-5 tw-py-1">{children}</div>
    </div>
  );
}
