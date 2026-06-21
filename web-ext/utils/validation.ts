export const isNull = (value: unknown): value is null | undefined =>
  value === null || value === undefined;

export const isNumericInRange = (
  value: string,
  min: number,
  max: number,
): boolean => {
  const n = parseFloat(value);
  return Number.isFinite(n) && n >= min && n <= max;
};
