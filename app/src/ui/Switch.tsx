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
    <label className="relative inline-flex items-center h-6 rounded-full w-11 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className="sr-only"
      />
      <div
        className={`block w-full h-full rounded-full transition-colors duration-300 ease-in-out ${
          checked ? "bg-blue-500" : "bg-gray-600 border border-gray-400"
        }`}
      ></div>
      <span
        className={`absolute left-1 top-1 transform transition-transform duration-300 ease-in-out ${
          checked ? "translate-x-5 bg-white" : "translate-x-0 bg-gray-300"
        } inline-block w-4 h-4 rounded-full`}
      />
    </label>
  );
};

export default Switch;
