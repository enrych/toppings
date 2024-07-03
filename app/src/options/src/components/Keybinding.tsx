import Tooltip from "../../../ui/Tooltip";
import { KeyboardEvent, useState } from "react";

export default function KeybindingBlock({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const [keyCode, setKeyCode] = useState<number>(0);
  const [key, setKey] = useState<string>(String.fromCharCode(keyCode));
  const recordKeyHandler = (e: KeyboardEvent<HTMLInputElement>) => {
    if (
      (e.keyCode >= 48 && e.keyCode <= 57) || // Numbers 0-9
      (e.keyCode >= 65 && e.keyCode <= 90) // Letters A-Z
    ) {
      e.preventDefault();
      e.stopPropagation();
      setKeyCode(e.keyCode);
      const key = String.fromCharCode(e.keyCode);
      setKey(key);
    } else if (e.keyCode === 8 || e.keyCode === 27) {
      const key = "";
      setKey(key);
    }
  };

  const focusHandler = () => {
    setKey("");
  };

  const blurHandler = () => {
    setKey(String.fromCharCode(keyCode));
  };

  return (
    <div className="font-sans w-full flex justify-between items-center px-4">
      <div className="flex items-center space-x-3">
        <label className="text-lg font-medium text-gray-100">{title}</label>
        {description && (
          <Tooltip text={description}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400 hover:text-gray-200 transition-colors duration-200"
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
        className="p-2 bg-black text-white text-center rounded border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
