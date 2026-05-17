import { isNull } from "./validation";

export const coalesce = <T>(
  ...values: (T | null | undefined)[]
): T | undefined => values.find((v) => !isNull(v));

export const defaultTo = <T>(value: T | null | undefined, defaultValue: T): T =>
  isNull(value) ? defaultValue : value;
