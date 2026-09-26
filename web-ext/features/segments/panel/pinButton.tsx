/** @jsxImportSource dom-chef-jsx */
import { setAutoLoadPin } from "../segmentStore";
import type { SegmentAutoLoadPin, SegmentConfig } from "../types";
import { attachMenu, closeOpenMenu } from "./menu";
import { currentPin, currentVideoId, render, savedConfigs, setPin } from "./state";
import { btnStyle, dropdownStyle, menuItemStyle } from "./styles";

const PIN_OPTIONS = [
  [null, "○", "Use global setting"],
  ["off", "⊗", "Always off for this video"],
  ["last-used", "↺", "Restore last-used"],
  ["default", "★", "Restore default saved config"],
] as const;

function describePin(pin: SegmentAutoLoadPin): { icon: string; title: string } {
  if (pin !== null && typeof pin === "object") return { icon: "📌", title: "Auto-load pin — click to change" };
  const option = PIN_OPTIONS.find(([value]) => value === pin);
  return option
    ? { icon: option[1], title: `Auto-load: ${option[2].toLowerCase()} — click to change` }
    : { icon: "📌", title: "Auto-load pin — click to change" };
}

export function buildPinButton(config: SegmentConfig): HTMLElement {
  const choose = async (e: MouseEvent, pin: SegmentAutoLoadPin) => {
    e.stopPropagation();
    closeOpenMenu();
    if (!currentVideoId) return;
    setPin(pin);
    await setAutoLoadPin(currentVideoId, pin);
    render(config);
  };

  const info = describePin(currentPin);
  const trigger = (
    <button
      style={{
        ...btnStyle("ghost"),
        padding: "2px 6px",
        fontSize: "11px",
        color:
          currentPin !== null
            ? "var(--yt-spec-call-to-action, #3ea6ff)"
            : "var(--yt-spec-text-secondary, rgba(255,255,255,0.5))",
      }}
      title={info.title}
    >
      {info.icon}
    </button>
  );

  const menu = (
    <div style={dropdownStyle("right", "210px")}>
      <div
        style={{
          padding: "4px 10px 6px",
          fontSize: "11px",
          color: "var(--yt-spec-text-secondary, rgba(255,255,255,0.5))",
          borderBottom: "1px solid var(--yt-spec-10-percent-layer, rgba(255,255,255,0.1))",
          marginBottom: "4px",
        }}
      >
        Auto-load on page open
      </div>

      {PIN_OPTIONS.map(([value, icon, label]) => {
        const isActive = currentPin === value;
        return (
          <button
            style={{
              ...menuItemStyle(),
              color: isActive ? "var(--yt-spec-call-to-action, #3ea6ff)" : "var(--yt-spec-text-primary, #fff)",
              fontWeight: isActive ? 600 : 400,
            }}
            onClick={(e: MouseEvent) => void choose(e, value)}
          >
            {icon} {label}
          </button>
        );
      })}

      {savedConfigs.length > 0 && (
        <div
          style={{
            borderTop: "1px solid var(--yt-spec-10-percent-layer, rgba(255,255,255,0.1))",
            marginTop: "4px",
            paddingTop: "4px",
          }}
        >
          {savedConfigs.map((saved) => {
            const isActive = typeof currentPin === "object" && currentPin !== null && currentPin.configId === saved.id;
            return (
              <button
                style={{
                  ...menuItemStyle(),
                  color: isActive
                    ? "var(--yt-spec-call-to-action, #3ea6ff)"
                    : "var(--yt-spec-text-secondary, rgba(255,255,255,0.7))",
                  fontSize: "11px",
                }}
                onClick={(e: MouseEvent) => void choose(e, { configId: saved.id })}
              >
                📌 {saved.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  attachMenu(trigger, menu);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {trigger}
      {menu}
    </div>
  );
}
