import { ChangeEvent, useState } from "react";

const Switch = ({
  isEnabled,
  onToggle,
}: {
  isEnabled: boolean;
  onToggle: (isEnabled: boolean) => void;
}) => {
  const [checked, setChecked] = useState(isEnabled);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.checked);
    onToggle(e.target.checked);
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
          checked ? "bg-blue-500" : "bg-white border border-black"
        }`}
      ></div>
      <span
        className={`absolute left-1 top-1 transform transition-transform duration-300 ease-in-out ${
          checked ? "translate-x-5 bg-white" : "translate-x-0 bg-black"
        } inline-block w-4 h-4 rounded-full`}
      />
    </label>
  );
};

export default Switch;
