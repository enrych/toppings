import {
  DOCS_VERSION_TAG,
  ERROR,
  EXTENSION_VERSION,
  SEMVER_PATTERN,
} from "@toppings/constants";
import { interpolateTemplate } from "./string";
import { isNull } from "./validation";

export function docsVersionTag(v: string = EXTENSION_VERSION): string {
  const [major, minor] = v.split(".");
  return interpolateTemplate(DOCS_VERSION_TAG, { major, minor });
}

export function parseSemver(v: string): {
  major: number;
  minor: number;
  patch: number;
  pre?: string;
} {
  const m = v.match(SEMVER_PATTERN);
  if (isNull(m)) {
    throw new Error(interpolateTemplate(ERROR.BAD_SEMVER, { version: v }));
  }
  return {
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
    pre: m[4],
  };
}
