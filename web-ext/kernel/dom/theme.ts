// In-page UI reads YouTube's own colour tokens, which inherit into shadow
// roots as custom properties, so it follows the page's light or dark theme
// without a theme of its own. Fallbacks are YouTube's dark values.
export const themeTokens = `
  :host {
    --tp-bg: var(--yt-sys-color-baseline--base-background, #0f0f0f);
    --tp-raised: var(--yt-sys-color-baseline--raised-background, #212121);
    --tp-menu: var(--yt-sys-color-baseline--menu-background, #282828);
    --tp-text: var(--yt-sys-color-baseline--text-primary, #f1f1f1);
    --tp-text-2: var(--yt-sys-color-baseline--text-secondary, #aaa);
    --tp-outline: var(--yt-sys-color-baseline--outline, rgba(255, 255, 255, .2));
    --tp-additive: var(--yt-sys-color-baseline--additive-background, rgba(255, 255, 255, .1));
    --tp-accent: var(--yt-sys-color-baseline--call-to-action, #3ea6ff);
    --tp-font: "YouTube Sans", Roboto, Arial, sans-serif;
  }
`;
