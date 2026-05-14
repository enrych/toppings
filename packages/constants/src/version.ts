/**
 * The single source of truth for Toppings's user-facing version.
 *
 * ────────────────────────────────────────────────────────────────────────
 * Bumping the version
 *
 *   bun run scripts/bump-version.ts <patch|minor|major|x.y.z>
 *
 * The script updates EXTENSION_VERSION here PLUS every other file that
 * needs to match (manifest.json, root + child package.jsons, the
 * "current" entry in RELEASES). Never edit those individually.
 *
 * ────────────────────────────────────────────────────────────────────────
 * Who reads this
 *
 *  - web-ext/scripts/build.js  → stamps manifest.json at build time
 *  - web-ext/src/popup/App.tsx → version pill in the popup head
 *  - website/components/Footer.tsx + Navbar pill
 *  - website/components/home/Hero.tsx → eyebrow status line
 *  - website/app/docs/changelog/page.tsx → highlights the current entry
 *  - scripts/check-consistency.ts → fails CI if drift detected
 *
 * Format: SemVer 2.0. Pre-release suffixes ("3.1.0-rc.1") are allowed.
 */
export const EXTENSION_VERSION = "3.0.3";

/** "vMAJOR.MINOR" — used as the folder name for archived doc snapshots. */
export function docsVersionTag(v: string = EXTENSION_VERSION): string {
  const [maj, min] = v.split(".");
  return `v${maj}.${min}`;
}

/** Parse a semver string into its parts. Throws on garbage input. */
export function parseSemver(v: string): {
  major: number;
  minor: number;
  patch: number;
  pre?: string;
} {
  const m = v.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!m) throw new Error(`Bad semver: ${v}`);
  return {
    major: Number(m[1]),
    minor: Number(m[2]),
    patch: Number(m[3]),
    pre: m[4],
  };
}
