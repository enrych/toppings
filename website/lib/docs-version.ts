import { EXTENSION_VERSION } from "./version";

export function docsVersionTag(v: string = EXTENSION_VERSION): string {
  const [major, minor] = v.split(".");
  return `v${major}.${minor}`;
}
