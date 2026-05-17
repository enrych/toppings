import { isNull } from "./validation";

type QueryValue = string | number | boolean | null | undefined;

export function withQuery(
  href: string,
  params: Record<string, QueryValue>,
): string {
  const url = new URL(href);
  for (const [key, value] of Object.entries(params)) {
    if (isNull(value) || value === "") continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}
