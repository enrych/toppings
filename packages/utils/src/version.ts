import {
  BUMP_KIND,
  DOC_SNAPSHOT_DIR_PATTERN,
  DOC_SNAPSHOT_RETENTION_MINORS,
  DOCS_VERSION_TAG,
  ERROR,
  EXTENSION_VERSION,
  SEMVER_PATTERN,
} from "@toppings/constants";
import { interpolateTemplate } from "./string";
import { isNull } from "./validation";

export function docsVersionTag(v: string = EXTENSION_VERSION): string {
  const { major, minor } = parseSemver(v);
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

export function semverDocKey(major: number, minor: number): number {
  return major * 1000 + minor;
}

export function parseDocsSnapshotDir(
  name: string,
): { major: number; minor: number; key: number } | null {
  const m = name.match(DOC_SNAPSHOT_DIR_PATTERN);
  if (isNull(m)) return null;
  const major = Number(m[1]);
  const minor = Number(m[2]);
  return { major, minor, key: semverDocKey(major, minor) };
}

export function isDocsSnapshotStale(
  snapshotKey: number,
  currentKey: number,
  retention: number = DOC_SNAPSHOT_RETENTION_MINORS,
): boolean {
  return currentKey - snapshotKey > retention;
}

export function bumpSemver(current: string, kind: string): string {
  if (SEMVER_PATTERN.test(kind)) return kind;
  const c = parseSemver(current);
  switch (kind) {
    case BUMP_KIND.PATCH:
      return `${c.major}.${c.minor}.${c.patch + 1}`;
    case BUMP_KIND.MINOR:
      return `${c.major}.${c.minor + 1}.0`;
    case BUMP_KIND.MAJOR:
      return `${c.major + 1}.0.0`;
    default:
      throw new Error(
        interpolateTemplate(ERROR.UNKNOWN_BUMP_KIND, { kind }),
      );
  }
}
