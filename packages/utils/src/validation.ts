export const isNull = (value: unknown): value is null | undefined =>
  value === null || value === undefined;

export const isFalsy = (value: unknown): boolean => {
  if (isNull(value)) return true;
  if (typeof value === "number" && (value === 0 || Number.isNaN(value)))
    return true;
  if (typeof value === "bigint" && value === BigInt(0)) return true;
  if (typeof value === "boolean" && value === false) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === "object" && value && Object.keys(value).length === 0)
    return true;
  return false;
};

export const isTruthy = (value: unknown): boolean => !isFalsy(value);

export const isEmpty = (value: unknown): boolean => isFalsy(value);

export const hasValue = (value: unknown): boolean => !isEmpty(value);
