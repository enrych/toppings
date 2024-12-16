import React, { ChangeEvent, useState } from "react";
import Tooltip from "./Tooltip";

export default function SwitchBlock({
  title,
  description,
  isEnabled,
  onToggle,
}: {
  title: string;
  description?: string;
  isEnabled: boolean;
  onToggle: (isEnabled: boolean) => void;
}) {
  const [checked, setChecked] = useState(isEnabled);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setChecked(isChecked);
    onToggle(isChecked);
  };
  return (
    <div className="tw-font-sans tw-w-full tw-flex tw-justify-between tw-items-center tw-px-4">
      <div className="tw-flex tw-items-center tw-space-x-3">
        <label className="tw-text-lg tw-font-medium tw-text-gray-100">
          {title}
        </label>
        {description && (
          <Tooltip text={description}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors duration-200"
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
      <label className="tw-relative tw-inline-flex tw-items-center tw-h-6 tw-rounded-full tw-w-11 tw-cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          className="tw-sr-only"
        />
        <div
          className={`tw-block tw-w-full tw-h-full tw-rounded-full tw-transition-colors tw-duration-300 tw-ease-in-out ${
            checked
              ? "tw-bg-blue-500"
              : "tw-bg-gray-600 tw-border tw-border-gray-400"
          }`}
        ></div>
        <span
          className={`tw-absolute tw-left-1 tw-top-1 tw-transform tw-transition-transform tw-duration-300 tw-ease-in-out ${
            checked
              ? "tw-translate-x-5 tw-bg-white"
              : "tw-translate-x-0 tw-bg-gray-300"
          } tw-inline-block tw-w-4 tw-h-4 tw-rounded-full`}
        />
      </label>
    </div>
  );
}
