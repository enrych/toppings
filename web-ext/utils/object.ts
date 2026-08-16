export const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Overlay `stored` on top of `defaults`, recursing into nested plain objects.
 * Arrays and primitives are replaced wholesale; keys absent from `defaults`
 * are dropped, so settings removed from the schema don't linger in storage.
 */
export function mergeDefaults<T>(defaults: T, stored: unknown): T {
  if (!isPlainObject(defaults) || !isPlainObject(stored)) {
    return (stored ?? defaults) as T;
  }
  const result = { ...defaults } as Record<string, unknown>;
  for (const key of Object.keys(defaults)) {
    if (key in stored) result[key] = mergeDefaults(defaults[key], stored[key]);
  }
  return result as T;
}
