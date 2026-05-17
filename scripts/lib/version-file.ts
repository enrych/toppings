import { readFileSync, writeFileSync } from "node:fs";
import { ERROR, EXTENSION_VERSION_DECLARATION } from "@toppings/constants";
import { repoPath } from "./root";

export function readExtensionVersion(
  filePath: string = repoPath("versionTs"),
): string {
  const src = readFileSync(filePath, "utf8");
  const m = src.match(/EXTENSION_VERSION\s*=\s*"([^"]+)"/);
  if (!m) throw new Error(ERROR.EXTENSION_VERSION_NOT_FOUND);
  return m[1];
}

export function writeExtensionVersion(
  next: string,
  filePath: string = repoPath("versionTs"),
): void {
  const src = readFileSync(filePath, "utf8");
  const patched = src.replace(EXTENSION_VERSION_DECLARATION, `$1"${next}"`);
  writeFileSync(filePath, patched);
}
