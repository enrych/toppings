import { useEffect, useState } from "preact/hooks";

// Pages are hash segments ("#watch"), so a page can be linked and the
// browser's back button works, with nothing beyond the platform's own history.
const current = () => location.hash.replace(/^#\/?/, "");

export function useRoute(): string {
  const [segment, setSegment] = useState(current);
  useEffect(() => {
    const onChange = () => setSegment(current());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return segment;
}

export function navigate(segment: string): void {
  location.hash = segment;
}

export const hrefFor = (segment: string) => `#${segment}`;
