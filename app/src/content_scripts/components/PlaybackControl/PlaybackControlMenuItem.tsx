export default function PlaybackControlMenuItem({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: "true" | "false";
  onClick: () => void;
}) {
  return (
    <li
      className={`relative w-full pl-0 list-item list-none cursor-pointer hover:bg-[#4a4a4a]/90 ${isSelected === "true" ? "bg-[#4a4a4a]/90" : ""}`}
      role="none"
      onClick={onClick}
    >
      <button
        className="relative w-[200px] h-auto m-0 py-[12px] px-[64px] bg-transparent text-white border-none outline-0 select-none"
        type="button"
        role="menuitemradio"
        tabIndex={-1}
        aria-checked={isSelected}
      >
        <div className="flex items-center justify-center min-h-4 min-w-[1px] text-left">
          <span className="text-[12px] font-bold font-sans">{label}</span>
        </div>
      </button>
    </li>
  );
}
