import React, { ReactNode, useState } from "react";

interface TooltipProps {
  children: ReactNode;
  text: string;
}

const Tooltip = ({ children, text }: TooltipProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="tw-relative tw-flex tw-items-center">
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="tw-cursor-pointer"
      >
        {children}
      </div>
      {visible && (
        <div className="tw-absolute tw-left-full tw-ml-2 tw-w-40 tw-p-2 tw-text-xs tw-text-white tw-bg-black tw-rounded tw-shadow-lg tw-z-10">
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
