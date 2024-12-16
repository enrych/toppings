import React from "react";
import { ChangeEvent, useState, useEffect, useRef } from "react";
import Tooltip from "./Tooltip";

export default function InputBlock({
  title,
  description,
  initialValue,
  validator,
  onChange,
}: {
  title: string;
  description?: string;
  initialValue: string;
  validator: (value: string) => boolean;
  onChange: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setValue(e.target.value);
    setIsValid(null);
    setIsLoading(true);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      const isValid = validator(e.target.value);
      setIsLoading(false);
      setIsValid(isValid);

      if (isValid) {
        onChange(e.target.value);
        // Hide the validation SVG if valid
        setTimeout(() => {
          setIsValid(null);
        }, 1500);
      }
    }, 750);
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <div className="tw-font-sans tw-w-full tw-flex tw-flex-col tw-px-4 tw-py-1">
      <div className="tw-flex tw-justify-between tw-items-center">
        <div className="tw-flex tw-items-center tw-space-x-3">
          <label className="tw-text-lg tw-font-medium tw-text-gray-100">
            {title}
          </label>
          {description && (
            <Tooltip text={description}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="tw-h-5 tw-w-5 tw-text-gray-400 tw-hover:text-gray-200 tw-transition-colors duration-200"
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
        <div className="tw-relative">
          <input
            type="text"
            className="tw-p-2 tw-bg-black tw-text-white tw-text-center tw-rounded tw-border tw-border-gray-600/50 tw-focus:outline-none tw-focus:ring-2 tw-focus:ring-blue-500"
            placeholder="Enter your preferences"
            value={value}
            onChange={onChangeHandler}
          />
          {isLoading && (
            <svg
              className="tw-absolute tw-top-[8px] -tw-right-6 tw-animate-spin tw-h-5 tw-w-5 tw-text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="tw-opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="tw-opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291l-1.707-1.707A7.968 7.968 0 014 12H0c0 3.312 1.344 6.312 3.515 8.485l2.485-2.485z"
              />
            </svg>
          )}
          {isValid === true && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="tw-absolute tw-top-1/2 -tw-translate-y-1/2 -tw-right-6 tw-h-5 tw-w-5 tw-text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          {isValid === false && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="tw-absolute tw-top-1/2 -tw-translate-y-1/2 -tw-right-6 tw-h-5 tw-w-5 tw-text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
