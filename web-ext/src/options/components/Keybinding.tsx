import React from "react";
import { KeyboardEvent, useState } from "react";
import Tooltip from "./Tooltip";

export default function KeybindingBlock({
  title,
  description,
  keybinding,
  onChange,
}: {
  title: string;
  description?: string;
  keybinding: string;
  onChange: (key: string) => void;
}) {
  const [key, setKey] = useState(keybinding);
  const recordKeyHandler = (e: KeyboardEvent<HTMLInputElement>) => {
    if (
      (e.keyCode >= 48 && e.keyCode <= 57) || // Numbers 0-9
      (e.keyCode >= 65 && e.keyCode <= 90) // Letters A-Z
    ) {
      e.preventDefault();
      e.stopPropagation();
      const key = String.fromCharCode(e.keyCode);
      setKey(key);
      onChange(key);
    } else if (e.keyCode === 8 || e.keyCode === 27) {
      const key = "";
      setKey(key);
      onChange(key);
    }
  };

  const focusHandler = () => {
    setKey("");
  };

  const blurHandler = () => {
    setKey(keybinding);
  };

  return (
    <div className="tw-font-sans tw-w-full tw-flex tw-justify-between tw-items-center tw-px-4 tw-py-1">
      <div className="tw-flex tw-items-center tw-space-x-3">
        <label className="tw-text-lg tw-font-medium tw-text-gray-100">
          {title}
        </label>
        {description && (
          <Tooltip text={description}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="tw-h-5 tw-w-5 tw-text-gray-400 hover:tw-text-gray-200 tw-transition-colors tw-duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M12 18.5A6.5 6.5 0 1118.5 12A6.508 6.508 0 0112 18.5z"
              />
            </svg>
          </Tooltip>
        )}
      </div>
      <input
        type="text"
        className="tw-p-2 tw-bg-black tw-text-white tw-text-center tw-rounded tw-border tw-border-gray-600/50 tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-blue-500"
        placeholder="Press a key"
        value={key}
        onKeyDown={recordKeyHandler}
        onFocus={focusHandler}
        onBlur={blurHandler}
        readOnly
      />
    </div>
  );
}
