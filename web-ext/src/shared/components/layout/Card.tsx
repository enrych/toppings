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
      className={`tw-bg-surface tw-border tw-border-border-default tw-rounded-xl ${className}`}
    >
      <div className="tw-px-5 tw-py-1 tw-divide-y tw-divide-border-subtle">
        {children}
      </div>
    </div>
  );
}
