// YouTube's own CSS variables, with dark-mode fallbacks for when they are absent.

export function btnStyle(variant: "accent" | "ghost"): Record<string, string> {
  const base: Record<string, string> = {
    cursor: "pointer",
    border: "none",
    borderRadius: "4px",
    padding: "3px 8px",
    fontSize: "12px",
    fontFamily: "inherit",
    lineHeight: "1.4",
    transition: "opacity 0.1s",
  };
  if (variant === "accent") {
    return {
      ...base,
      background: "var(--yt-spec-call-to-action, #3ea6ff)",
      color: "var(--yt-spec-brand-button-text, #fff)",
    };
  }
  return {
    ...base,
    background: "transparent",
    color: "var(--yt-spec-text-secondary, rgba(255,255,255,0.6))",
  };
}

export function menuItemStyle(): Record<string, string> {
  return {
    display: "block",
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
    border: "none",
    borderRadius: "4px",
    padding: "7px 10px",
    fontSize: "12px",
    fontFamily: "inherit",
    background: "transparent",
    color: "var(--yt-spec-text-primary, #fff)",
  };
}

export function numInputStyle(): Record<string, string> {
  return {
    width: "42px",
    background: "var(--yt-spec-10-percent-layer, rgba(255,255,255,0.08))",
    border: "1px solid var(--yt-spec-10-percent-layer, rgba(255,255,255,0.15))",
    borderRadius: "4px",
    color: "var(--yt-spec-text-primary, #fff)",
    fontSize: "11px",
    padding: "2px 4px",
    textAlign: "right",
    fontFamily: "inherit",
  };
}

export function dropdownStyle(align: "left" | "right", minWidth: string): Record<string, string | number> {
  return {
    display: "none",
    position: "absolute",
    [align]: 0,
    top: "calc(100% + 4px)",
    background: "var(--yt-spec-base-background, #0f0f0f)",
    border: "1px solid var(--yt-spec-10-percent-layer, rgba(255,255,255,0.15))",
    borderRadius: "8px",
    padding: "4px",
    zIndex: 9999,
    minWidth,
    boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
  };
}
