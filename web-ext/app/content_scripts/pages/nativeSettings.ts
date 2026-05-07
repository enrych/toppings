/**
 * Native settings page — injects a "Toppings" entry into YouTube's left
 * sidebar and manages a full-page overlay that mirrors the extension options.
 *
 * Entry point: `setupNativeSettings()` called on every YouTube navigation.
 * The sidebar link is injected once (idempotent). The overlay is a lazily-
 * created singleton. Calling `setupNativeSettings(false)` removes the link
 * and hides the overlay (feature disabled flow).
 */

import {
  getAllProfiles,
  getActiveProfile,
  setActiveProfileId,
} from "../../../utils/storage/profileStore";
import { applyWatchProfile } from "../primitives/applyProfile";
import type { Profile } from "../../../data/profiles.data";

// ---------------------------------------------------------------------------
// IDs
// ---------------------------------------------------------------------------

const SIDEBAR_LINK_ID = "tppng-native-sidebar-link";
const OVERLAY_ID = "tppng-native-settings-overlay";

// ---------------------------------------------------------------------------
// Sidebar strategies — ordered by stability/likelihood
// ---------------------------------------------------------------------------

const SIDEBAR_STRATEGIES = [
  "ytd-guide-renderer #sections",
  "ytd-guide-renderer",
  "#guide-inner-content",
  "tp-yt-app-drawer #guide-inner-content",
] as const;

// ---------------------------------------------------------------------------
// CSS vars that mirror YouTube's design tokens
// ---------------------------------------------------------------------------

const YT_STYLES = `
#${OVERLAY_ID} {
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: none;
  overflow-y: auto;
  background: var(--yt-spec-base-background, #0f0f0f);
  color: var(--yt-spec-text-primary, #fff);
  font-family: "YouTube Sans", "Roboto", sans-serif;
  font-size: 14px;
  padding: 0;
}
#${OVERLAY_ID}.tppng-visible {
  display: block;
}
#${OVERLAY_ID} .tppng-ns-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--yt-spec-10-percent-layer, rgba(255,255,255,0.1));
  position: sticky;
  top: 0;
  background: var(--yt-spec-base-background, #0f0f0f);
  z-index: 1;
}
#${OVERLAY_ID} .tppng-ns-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  background: none;
  border: none;
  color: inherit;
  padding: 0;
}
#${OVERLAY_ID} .tppng-ns-back:hover {
  background: var(--yt-spec-10-percent-layer, rgba(255,255,255,0.1));
}
#${OVERLAY_ID} .tppng-ns-title {
  font-size: 20px;
  font-weight: 600;
}
#${OVERLAY_ID} .tppng-ns-body {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 24px 64px;
}
#${OVERLAY_ID} .tppng-ns-section {
  margin-bottom: 32px;
}
#${OVERLAY_ID} .tppng-ns-section-title {
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--yt-spec-text-secondary, rgba(255,255,255,0.7));
  margin-bottom: 12px;
}
#${OVERLAY_ID} .tppng-ns-card {
  background: var(--yt-spec-raised-background, #212121);
  border-radius: 12px;
  overflow: hidden;
}
#${OVERLAY_ID} .tppng-ns-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--yt-spec-10-percent-layer, rgba(255,255,255,0.08));
  cursor: pointer;
  transition: background 0.1s;
}
#${OVERLAY_ID} .tppng-ns-row:last-child {
  border-bottom: none;
}
#${OVERLAY_ID} .tppng-ns-row:hover {
  background: var(--yt-spec-10-percent-layer, rgba(255,255,255,0.08));
}
#${OVERLAY_ID} .tppng-ns-row-label {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}
#${OVERLAY_ID} .tppng-ns-row-desc {
  font-size: 12px;
  color: var(--yt-spec-text-secondary, rgba(255,255,255,0.6));
  margin-top: 2px;
}
#${OVERLAY_ID} .tppng-ns-toggle {
  width: 36px;
  height: 20px;
  border-radius: 10px;
  background: var(--yt-spec-10-percent-layer, rgba(255,255,255,0.2));
  position: relative;
  flex-shrink: 0;
  transition: background 0.15s;
}
#${OVERLAY_ID} .tppng-ns-toggle.on {
  background: var(--yt-spec-call-to-action, #3ea6ff);
}
#${OVERLAY_ID} .tppng-ns-toggle::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.15s;
}
#${OVERLAY_ID} .tppng-ns-toggle.on::after {
  transform: translateX(16px);
}
#${OVERLAY_ID} .tppng-ns-profile-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background 0.1s;
  background: var(--yt-spec-10-percent-layer, rgba(255,255,255,0.1));
  color: var(--yt-spec-text-primary, #fff);
}
#${OVERLAY_ID} .tppng-ns-profile-chip.active {
  background: var(--yt-spec-call-to-action, #3ea6ff);
  color: #fff;
}
#${OVERLAY_ID} .tppng-ns-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px;
}
#${OVERLAY_ID} .tppng-ns-open-options {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--yt-spec-10-percent-layer, rgba(255,255,255,0.2));
  background: none;
  color: inherit;
  transition: background 0.1s;
}
#${OVERLAY_ID} .tppng-ns-open-options:hover {
  background: var(--yt-spec-10-percent-layer, rgba(255,255,255,0.08));
}
`;

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let overlayEl: HTMLElement | null = null;
let stylesInjected = false;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function injectStyles() {
  if (stylesInjected) return;
  const style = document.createElement("style");
  style.id = "tppng-native-settings-styles";
  style.textContent = YT_STYLES;
  document.head.appendChild(style);
  stylesInjected = true;
}

function makeToggle(on: boolean): HTMLElement {
  const el = document.createElement("div");
  el.className = `tppng-ns-toggle${on ? " on" : ""}`;
  return el;
}

// ---------------------------------------------------------------------------
// Build overlay content
// ---------------------------------------------------------------------------

async function renderOverlay(body: HTMLElement): Promise<void> {
  body.innerHTML = "";

  const [profiles, activeProfile] = await Promise.all([
    getAllProfiles(),
    getActiveProfile(),
  ]);
  const activeId = activeProfile?.id ?? null;

  // --- Profiles section ---
  const profileSection = document.createElement("div");
  profileSection.className = "tppng-ns-section";

  const profileTitle = document.createElement("div");
  profileTitle.className = "tppng-ns-section-title";
  profileTitle.textContent = "Active Profile";
  profileSection.appendChild(profileTitle);

  const chips = document.createElement("div");
  chips.className = "tppng-ns-card tppng-ns-chips";

  // "Default" chip
  const defaultChip = makeProfileChip(null, activeId === null, async () => {
    await setActiveProfileId(null);
    void applyWatchProfile();
    void renderOverlay(body);
  });
  chips.appendChild(defaultChip);

  for (const p of profiles) {
    const isActive = p.id === activeId;
    chips.appendChild(
      makeProfileChip(p, isActive, async () => {
        const next = isActive ? null : p.id;
        await setActiveProfileId(next);
        void applyWatchProfile();
        void renderOverlay(body);
      }),
    );
  }
  profileSection.appendChild(chips);
  body.appendChild(profileSection);

  // --- Watch primitives section ---
  const primSection = document.createElement("div");
  primSection.className = "tppng-ns-section";

  const primTitle = document.createElement("div");
  primTitle.className = "tppng-ns-section-title";
  primTitle.textContent = "Watch Page";
  primSection.appendChild(primTitle);

  const primCard = document.createElement("div");
  primCard.className = "tppng-ns-card";

  const sidebarEl = document.querySelector(
    "#secondary, ytd-watch-next-secondary-results-renderer",
  ) as HTMLElement | null;
  const commentsEl = document.querySelector(
    "ytd-comments#comments, #comments",
  ) as HTMLElement | null;
  const endCardEl = document.querySelector(
    ".ytp-ce-element, .ytp-endscreen-element",
  ) as HTMLElement | null;

  primCard.appendChild(
    makePrimRow(
      "Recommendations sidebar",
      "Show or hide the right-side recommendations",
      !sidebarEl || sidebarEl.style.display !== "none",
      async (next) => {
        const { setSidebarVisible, resetSidebar } = await import(
          "../primitives/watch"
        );
        if (next) void setSidebarVisible(true);
        else void setSidebarVisible(false);
      },
    ),
  );

  primCard.appendChild(
    makePrimRow(
      "Comments",
      "Show or hide the comments section",
      !commentsEl || commentsEl.style.display !== "none",
      async (next) => {
        const { setCommentsVisible } = await import("../primitives/watch");
        void setCommentsVisible(next);
      },
    ),
  );

  primCard.appendChild(
    makePrimRow(
      "End cards",
      "Show or hide video end card overlays",
      !endCardEl || endCardEl.style.display !== "none",
      async (next) => {
        const { setEndCardsVisible } = await import("../primitives/watch");
        void setEndCardsVisible(next);
      },
    ),
  );

  primSection.appendChild(primCard);
  body.appendChild(primSection);

  // --- Open full settings link ---
  const linkSection = document.createElement("div");
  linkSection.className = "tppng-ns-section";

  const openBtn = document.createElement("button");
  openBtn.className = "tppng-ns-open-options";
  openBtn.textContent = "Open full settings ↗";
  openBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "OPEN_OPTIONS" });
  });
  linkSection.appendChild(openBtn);
  body.appendChild(linkSection);
}

function makeProfileChip(
  profile: Profile | null,
  isActive: boolean,
  onClick: () => void,
): HTMLElement {
  const chip = document.createElement("button");
  chip.className = `tppng-ns-profile-chip${isActive ? " active" : ""}`;
  chip.textContent = profile ? profile.name : "Default";
  chip.addEventListener("click", onClick);
  return chip;
}

function makePrimRow(
  label: string,
  desc: string,
  on: boolean,
  onChange: (next: boolean) => void,
): HTMLElement {
  const row = document.createElement("div");
  row.className = "tppng-ns-row";

  const text = document.createElement("div");
  text.style.flex = "1";

  const labelEl = document.createElement("div");
  labelEl.className = "tppng-ns-row-label";
  labelEl.textContent = label;

  const descEl = document.createElement("div");
  descEl.className = "tppng-ns-row-desc";
  descEl.textContent = desc;

  text.appendChild(labelEl);
  text.appendChild(descEl);

  const toggle = makeToggle(on);

  row.appendChild(text);
  row.appendChild(toggle);

  let current = on;
  row.addEventListener("click", () => {
    current = !current;
    toggle.classList.toggle("on", current);
    onChange(current);
  });

  return row;
}

// ---------------------------------------------------------------------------
// Overlay lifecycle
// ---------------------------------------------------------------------------

function getOrCreateOverlay(): HTMLElement {
  let el = document.getElementById(OVERLAY_ID);
  if (el) return el as HTMLElement;

  el = document.createElement("div");
  el.id = OVERLAY_ID;

  // Header
  const header = document.createElement("div");
  header.className = "tppng-ns-header";

  const backBtn = document.createElement("button");
  backBtn.className = "tppng-ns-back";
  backBtn.setAttribute("aria-label", "Back to YouTube");
  backBtn.innerHTML =
    '<svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>';
  backBtn.addEventListener("click", hideOverlay);

  const titleEl = document.createElement("div");
  titleEl.className = "tppng-ns-title";
  titleEl.textContent = "Toppings Settings";

  header.appendChild(backBtn);
  header.appendChild(titleEl);
  el.appendChild(header);

  const body = document.createElement("div");
  body.className = "tppng-ns-body";
  el.appendChild(body);

  document.body.appendChild(el);
  overlayEl = el as HTMLElement;
  return overlayEl;
}

function showOverlay(): void {
  const el = getOrCreateOverlay();
  el.classList.add("tppng-visible");
  const body = el.querySelector(".tppng-ns-body") as HTMLElement;
  void renderOverlay(body);
}

function hideOverlay(): void {
  if (overlayEl) {
    overlayEl.classList.remove("tppng-visible");
  }
}

// ---------------------------------------------------------------------------
// Sidebar link injection
// ---------------------------------------------------------------------------

function injectSidebarLink(): void {
  if (document.getElementById(SIDEBAR_LINK_ID)) return;

  // Try each strategy for the sidebar container.
  let container: HTMLElement | null = null;
  for (const sel of SIDEBAR_STRATEGIES) {
    container = document.querySelector(sel) as HTMLElement | null;
    if (container) break;
  }
  if (!container) return;

  const link = document.createElement("div");
  link.id = SIDEBAR_LINK_ID;
  link.style.cssText = `
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 0 24px;
    height: 40px;
    cursor: pointer;
    border-radius: 10px;
    font-family: "YouTube Sans","Roboto",sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: var(--yt-spec-text-primary, #fff);
    margin: 4px 12px;
    transition: background 0.1s;
  `;

  link.innerHTML = `
    <svg height="24" viewBox="0 0 24 24" width="24" fill="currentColor" style="flex-shrink:0;opacity:0.8">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
    </svg>
    <span>Toppings</span>
  `;

  link.addEventListener("mouseenter", () => {
    link.style.background =
      "var(--yt-spec-10-percent-layer, rgba(255,255,255,0.1))";
  });
  link.addEventListener("mouseleave", () => {
    link.style.background = "";
  });
  link.addEventListener("click", showOverlay);

  container.appendChild(link);
}

function removeSidebarLink(): void {
  document.getElementById(SIDEBAR_LINK_ID)?.remove();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Call on every YouTube navigation when the native settings feature is enabled.
 * Safe to call multiple times — idempotent.
 *
 * @param enabled  Whether the feature is currently enabled. Pass false to
 *                 tear down all injections.
 */
export function setupNativeSettings(enabled: boolean): void {
  if (!enabled) {
    removeSidebarLink();
    hideOverlay();
    return;
  }

  injectStyles();

  // The sidebar may not be ready on the first call — retry once after a short
  // delay to handle YouTube's SPA navigation latency.
  injectSidebarLink();
  if (!document.getElementById(SIDEBAR_LINK_ID)) {
    setTimeout(injectSidebarLink, 1500);
  }
}
