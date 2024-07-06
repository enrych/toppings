function camelCaseToTitleCase(camelCaseStr: string): string {
  const words = camelCaseStr.replace(/([A-Z])/g, " $1").trim();
  const titleCaseStr = words
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return titleCaseStr;
}

export default camelCaseToTitleCase;
