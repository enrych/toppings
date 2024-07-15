import React from "react";
import Switch from "../../../../ui/Switch";
import Tooltip from "../../../../ui/Tooltip";

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
  return (
    <div className="font-sans w-full flex justify-between items-center px-4">
      <div className="flex items-center space-x-3">
        <label className="text-lg font-medium text-gray-100">{title}</label>
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
      <Switch isEnabled={isEnabled} onToggle={onToggle} />
    </div>
  );
}
