import React, { ChangeEvent, useState } from "react";

const Switch = ({
  isEnabled,
  onToggle,
}: {
  isEnabled: boolean;
  onToggle: (isEnabled: boolean) => void;
}) => {
  const [checked, setChecked] = useState(isEnabled);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setChecked(isChecked);
    onToggle(isChecked);
  };

  return (
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
  );
};

export default Switch;
