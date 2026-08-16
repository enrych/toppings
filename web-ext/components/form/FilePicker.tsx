import React, { ChangeEvent, useId, useRef } from "react";
import Field from "./Field";
import Button from "../primitives/Button";
import Icon from "../primitives/Icon";

interface FilePickerProps {
  label: string;
  description?: string;
  hint?: string;
  value: string | null; // data URL
  onPick: (file: File) => void; // caller converts and persists
  onClear?: () => void;
  accept?: string;
}

export default function FilePicker({
  label,
  description,
  hint,
  value,
  onPick,
  onClear,
  accept = "image/*",
}: FilePickerProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onPick(file);
    // Cleared so re-picking the same file still fires onChange.
    e.target.value = "";
  };

  return (
    <Field label={label} description={description} hint={hint} htmlFor={id}>
      <div className="tw-flex tw-items-center tw-gap-3">
        {value ? (
          <img
            src={value}
            alt="Selected"
            className="tw-w-12 tw-h-12 tw-object-cover tw-rounded tw-border tw-border-border-default"
          />
        ) : (
          <div className="tw-w-12 tw-h-12 tw-rounded tw-border tw-border-dashed tw-border-border-default tw-flex tw-items-center tw-justify-center tw-text-fg-subtle">
            <Icon name="image" size={20} />
          </div>
        )}
        <input
          id={id}
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="tw-hidden"
        />
        <Button
          variant="secondary"
          size="sm"
          leadingIcon={<Icon name="upload" size={14} />}
          onClick={() => inputRef.current?.click()}
        >
          {value ? "Replace" : "Choose"}
        </Button>
        {value && onClear && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear
          </Button>
        )}
      </div>
    </Field>
  );
}
