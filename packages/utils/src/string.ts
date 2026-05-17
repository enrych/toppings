import { PLACEHOLDER } from "@toppings/constants";

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const placeholderPattern = (): RegExp => {
  const { OPEN, CLOSE } = PLACEHOLDER;
  return new RegExp(
    `${escapeRegExp(OPEN)}([\\w.]+)${escapeRegExp(CLOSE)}`,
    "g",
  );
};

export function interpolateTemplate(
  template: string,
  values: Record<string, string | number | boolean | null | undefined>,
): string {
  return template.replace(placeholderPattern(), (_, key: string) => {
    const value = values[key];
    if (value === undefined || value === null) return "";
    return String(value);
  });
}
