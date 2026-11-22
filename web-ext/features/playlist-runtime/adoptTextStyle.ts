const TEXT_PROPERTIES = ["font-family", "font-size", "font-weight", "line-height", "letter-spacing", "color"];

// Copies the type of a piece of YouTube's text onto a shadow host. These
// properties inherit across the shadow boundary, so injected text reads
// exactly like its neighbour in any layout, theme or tint.
export function adoptTextStyle(host: HTMLElement, sample: Element | null): void {
  if (!sample) return;
  const style = getComputedStyle(sample);
  for (const property of TEXT_PROPERTIES) host.style.setProperty(property, style.getPropertyValue(property));
}
