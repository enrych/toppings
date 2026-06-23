/**
 * Lightweight DOM toast for on-page feedback in content scripts.
 *
 * Creates a single shared toast element (TPPNG_TOAST_ID) and reuses it
 * across calls, so rapid successive calls replace the current message rather
 * than stacking. Auto-dismisses after `duration` ms.
 */

const TPPNG_TOAST_ID = "tppng-page-toast";
let dismissTimer: ReturnType<typeof setTimeout> | null = null;

export function showPageToast(message: string, duration = 2000): void {
  let el = document.getElementById(TPPNG_TOAST_ID);

  if (!el) {
    el = document.createElement("div");
    el.id = TPPNG_TOAST_ID;

    // Inline styles — no class dependency on YouTube's stylesheet.
    Object.assign(el.style, {
      position: "fixed",
      bottom: "80px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: "2147483647",
      padding: "8px 16px",
      borderRadius: "8px",
      background: "rgba(15,15,15,0.88)",
      backdropFilter: "blur(8px)",
      color: "#fff",
      fontFamily: "system-ui, sans-serif",
      fontSize: "13px",
      fontWeight: "500",
      lineHeight: "1.4",
      letterSpacing: "0.01em",
      boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
      pointerEvents: "none",
      userSelect: "none",
      opacity: "0",
      transition: "opacity 0.15s ease",
      whiteSpace: "nowrap",
    });

    document.body.appendChild(el);
  }

  // Update text and reset timer.
  el.textContent = message;

  // Force reflow so the transition fires even if opacity was already 1.
  void (el as HTMLElement).offsetHeight;
  el.style.opacity = "1";

  if (dismissTimer !== null) clearTimeout(dismissTimer);
  dismissTimer = setTimeout(() => {
    if (el) el.style.opacity = "0";
    dismissTimer = null;
  }, duration);
}
