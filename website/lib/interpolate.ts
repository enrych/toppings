const PLACEHOLDER_OPEN = "{{";
const PLACEHOLDER_CLOSE = "}}";
const REGEXP_METACHARACTER = /[.*+?^${}()|[\]\\]/g;

const escapeRegExp = (value: string): string =>
  value.replace(REGEXP_METACHARACTER, "\\$&");

const placeholderPattern = (): RegExp =>
  new RegExp(
    `${escapeRegExp(PLACEHOLDER_OPEN)}([\\w.]+)${escapeRegExp(PLACEHOLDER_CLOSE)}`,
    "g",
  );

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
