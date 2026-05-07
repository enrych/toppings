import React, { ChangeEvent, useId, useRef } from "react";
import Field from "./Field";
import Button from "../primitives/Button";
import Icon from "../primitives/Icon";

interface FilePickerProps {
  label: string;
  description?: string;
  hint?: string;
  /** Data URL of the currently selected image, if any. */
  value: string | null;
  /** Called with the picked File. Consumer is responsible for converting/saving. */
  onPick: (file: File) => void;
  onClear?: () => void;
  accept?: string;
}

/**
 * Image-aware file picker with thumbnail preview, choose/replace/clear
 * buttons. Renders nothing visually for the file input itself — clicks
 * are forwarded from the styled buttons.
 */
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
    // Reset so picking the same file again still triggers onChange
    e.target.value = "";
  };

  return (
    <Field label={label} description={description} hint={hint} htmlFor={id}>
      <div className="tw-flex tw-items-center tw-gap-3">
        {value ? (
          <img
            src={value}
            alt="Selected"
            className="tw-w-12 tw-h-12 tw-object-cover tw-rounded tw-border tw-border-gray-600/50"
          />
        ) : (
          <div className="tw-w-12 tw-h-12 tw-rounded tw-border tw-border-dashed tw-border-gray-600/40 tw-flex tw-items-center tw-justify-center tw-text-gray-600">
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
