import React, {
  ChangeEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import Field from "./Field";
import Icon from "../primitives/Icon";

interface InputProps {
  label: string;
  description?: string;
  hint?: string;
  initialValue: string;
  placeholder?: string;
  validator?: (value: string) => boolean;
  errorMessage?: string;
  onChange: (value: string) => void;
  /** Width of the input element in tailwind units. Default w-32. */
  inputWidthClass?: string;
}

/**
 * Text input with debounced validation. Shows a status icon on the right
 * (loading / valid / invalid) once the user types. On valid, calls onChange
 * and briefly shows a check before fading out. On invalid, surfaces an
 * error message via Field.
 */
export default function Input({
  label,
  description,
  hint,
  initialValue,
  placeholder = "Enter value",
  validator,
  errorMessage,
  onChange,
  inputWidthClass = "tw-w-44",
}: InputProps) {
  const id = useId();
  const [value, setValue] = useState(initialValue);
  const [status, setStatus] = useState<"idle" | "loading" | "valid" | "invalid">(
    "idle",
  );
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // Keep input value in sync if the source store updates externally.
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setValue(next);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!validator) {
      onChange(next);
      return;
    }

    setStatus("loading");
    debounceTimer.current = setTimeout(() => {
      const ok = validator(next);
      if (ok) {
        setStatus("valid");
        onChange(next);
        setTimeout(() => setStatus("idle"), 1200);
      } else {
        setStatus("invalid");
      }
    }, 500);
  };

  return (
    <Field
      label={label}
      description={description}
      hint={hint}
      htmlFor={id}
      error={status === "invalid" ? errorMessage ?? "Invalid value" : undefined}
    >
      <div className="tw-relative tw-inline-flex tw-items-center">
        <input
          id={id}
          type="text"
          className={`${inputWidthClass} tw-px-3 tw-py-2 tw-bg-[#0a0a0c] tw-text-white tw-text-sm tw-rounded-md tw-border tw-border-gray-600/50 focus:tw-outline-none focus:tw-border-blue-500 focus:tw-ring-2 focus:tw-ring-blue-500/30 tw-transition-colors`}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
        />
        {status !== "idle" && (
          <span className="tw-absolute tw-right-2 tw-top-1/2 -tw-translate-y-1/2 tw-pointer-events-none">
            {status === "loading" && (
              <svg
                className="tw-animate-spin tw-h-4 tw-w-4 tw-text-blue-400"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            {status === "valid" && (
              <Icon name="check" size={16} className="tw-text-green-400" />
            )}
            {status === "invalid" && (
              <Icon name="x" size={16} className="tw-text-red-400" />
            )}
          </span>
        )}
      </div>
    </Field>
  );
}
