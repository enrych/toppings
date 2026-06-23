export function formatTabUrlShort(url: string | null): string {
  if (!url) return "—";
  try {
    const u = new URL(url);
    const path =
      u.pathname.length > 28 ? `${u.pathname.slice(0, 28)}…` : u.pathname;
    return `${u.hostname}${path}`;
  } catch {
    return url;
  }
}
