import { ReactNode, useState } from "react";

interface TooltipProps {
  children: ReactNode;
  text: string;
}

const Tooltip = ({ children, text }: TooltipProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative flex items-center">
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="cursor-pointer"
      >
        {children}
      </div>
      {visible && (
        <div className="absolute left-full ml-2 w-40 p-2 text-xs text-white bg-black rounded shadow-lg z-10">
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
