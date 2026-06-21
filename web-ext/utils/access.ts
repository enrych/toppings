import { isNull } from "./validation";

export const coalesce = <T>(
  ...values: (T | null | undefined)[]
): T | undefined => values.find((v) => !isNull(v)) as T | undefined;

export const defaultTo = <T>(value: T | null | undefined, defaultValue: T): T =>
  isNull(value) ? defaultValue : value;

export const mergeDefaults = <T>(defaults: T, stored: unknown): T => {
  if (!stored || typeof stored !== "object" || typeof defaults !== "object") {
    return (stored ?? defaults) as T;
  }

  const result = { ...defaults } as Record<string, unknown>;
  const base = defaults as Record<string, unknown>;
  const patch = stored as Record<string, unknown>;

  for (const key of Object.keys(patch)) {
    if (
      key in base &&
      typeof base[key] === "object" &&
      base[key] !== null &&
      !Array.isArray(base[key])
    ) {
      result[key] = mergeDefaults(base[key], patch[key]);
    } else {
      result[key] = patch[key];
    }
  }

  return result as T;
};
