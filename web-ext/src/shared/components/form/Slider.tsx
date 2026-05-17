import React, { ChangeEvent, useEffect, useId, useState } from "react";
import Field from "./Field";

interface SliderProps {
  label: string;
  description?: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  /** Format function for the display value (e.g. "1.5x"). */
  format?: (value: number) => string;
}

/**
 * Range slider with a live-updating value badge. Calls onChange continuously
 * during drag — debounce on the consumer side if storage writes are
 * expensive.
 */
export default function Slider({
  label,
  description,
  hint,
  value,
  min,
  max,
  step = 0.1,
  onChange,
  format = (v) => v.toFixed(2),
}: SliderProps) {
  const id = useId();
  const [internal, setInternal] = useState(value);

  useEffect(() => {
    setInternal(value);
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = parseFloat(e.target.value);
    setInternal(next);
    onChange(next);
  };

  const percent = ((internal - min) / (max - min)) * 100;

  return (
    <Field label={label} description={description} hint={hint} htmlFor={id}>
      <div className="tw-flex tw-items-center tw-gap-3 tw-w-64">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={internal}
          onChange={handleChange}
          className="tw-flex-1 tw-h-1 tw-rounded-full tw-appearance-none tw-cursor-pointer focus:tw-outline-none"
          style={{
            background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${percent}%, var(--color-border-strong) ${percent}%, var(--color-border-strong) 100%)`,
          }}
        />
        <span className="tw-text-sm tw-font-mono tw-text-fg-muted tw-min-w-[3.5rem] tw-text-right">
          {format(internal)}
        </span>
      </div>
    </Field>
  );
}
