import React from "react";

/**
 * Centralized icon library. Pass a `name` and `size`/`className` for styling.
 * Add new icons by appending to PATHS — keeps SVGs out of consumer code and
 * ensures consistent stroke/fill conventions across the app.
 */

type IconName =
  | "info"
  | "check"
  | "x"
  | "settings"
  | "watch"
  | "shorts"
  | "playlist"
  | "audio"
  | "keyboard"
  | "general"
  | "trash"
  | "upload"
  | "image"
  | "search"
  | "alert"
  | "external"
  | "chevron-down"
  | "chevron-right";

const PATHS: Record<IconName, string> = {
  info: "M13 16h-1v-4h-1m1-4h.01M12 18.5A6.5 6.5 0 1118.5 12A6.508 6.508 0 0112 18.5z",
  check: "M5 13l4 4L19 7",
  x: "M6 18L18 6M6 6l12 12",
  settings:
    "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
  watch:
    "M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
  shorts:
    "M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z",
  playlist:
    "M4 6h16M4 10h16M4 14h10M4 18h10M18 14l4 2-4 2v-4z",
  audio:
    "M12 1C8.96 1 6.5 3.46 6.5 6.5V12.5C6.5 15.54 8.96 18 12 18C15.04 18 17.5 15.54 17.5 12.5V6.5C17.5 3.46 15.04 1 12 1ZM4 12.5C4 16.64 7.09 20.06 11 20.45V23H13V20.45C16.91 20.06 20 16.64 20 12.5H18C18 15.81 15.31 18.5 12 18.5C8.69 18.5 6 15.81 6 12.5H4Z",
  keyboard:
    "M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z",
  general:
    "M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm4 0v14h10V5H7zm2 3h6v2H9V8zm0 4h6v2H9v-2z",
  trash:
    "M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
  upload:
    "M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z",
  image:
    "M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z",
  search:
    "M15.5 14h-.79l-.28-.27a6.5 6.5 0 10-.7.7l.27.28v.79l5 4.99L20.49 19zM10 14a4 4 0 110-8 4 4 0 010 8z",
  alert:
    "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  external:
    "M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7zm5 16H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7z",
  "chevron-down": "M6 9l6 6 6-6",
  "chevron-right": "M9 6l6 6-6 6",
};

const FILLED: Set<IconName> = new Set([
  "audio",
  "shorts",
  "watch",
  "general",
  "trash",
  "upload",
  "image",
  "settings",
  "keyboard",
  "search",
  "alert",
  "external",
]);

interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  name: IconName;
  size?: number | string;
}

export default function Icon({
  name,
  size = 20,
  className = "",
  ...rest
}: IconProps) {
  const isFilled = FILLED.has(name);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={isFilled ? "currentColor" : "none"}
      stroke={isFilled ? "none" : "currentColor"}
      strokeWidth={isFilled ? 0 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

export type { IconName };
