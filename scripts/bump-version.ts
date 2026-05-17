#!/usr/bin/env bun
/**
 * scripts/bump-version.ts
 *
 *   bun run scripts/bump-version.ts <patch | minor | major | x.y.z>
 *
 * Updates the version in the one place it lives:
 * `packages/constants/src/version.ts` (`EXTENSION_VERSION`). Builds and
 * UI import that constant; package.json / manifest.json do not carry
 * version fields.
 *
 * What it touches:
 *
 *   • packages/constants/src/version.ts   ← single SemVer constant
 *   • packages/constants/src/releases.ts  ← if the topmost entry has
 *                                            version "next", it gets
 *                                            renamed to the new version
 *                                            and date stamped today.
 *
 *   • Optionally snapshots the docs into `website/app/docs/v<minor>/`
 *     and prunes anything older than `current - 2`, controlled by the
 *     --snapshot flag.
 *
 * Examples:
 *
 *   bun run scripts/bump-version.ts patch              # 3.0.3 → 3.0.4
 *   bun run scripts/bump-version.ts minor --snapshot   # 3.0.3 → 3.1.0 + archive docs
 *   bun run scripts/bump-version.ts 4.0.0-rc.1
 */
import { readFileSync, writeFileSync, existsSync, cpSync, rmSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { RELEASE_ITEM_KIND, RELEASE_VERSION } from "@toppings/constants";
import {
  docsVersionTag,
  formatIsoDate,
  nowUtc,
  parseSemver,
} from "@toppings/utils";

const ROOT = resolve(import.meta.dir, "..");
const VERSION_TS = join(ROOT, "packages/constants/src/version.ts");
const RELEASES_TS = join(ROOT, "packages/constants/src/releases.ts");
const DOCS_DIR = join(ROOT, "website/app/docs");

const SEMVER_RX = /^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/;

function readCurrentVersion(): string {
  const src = readFileSync(VERSION_TS, "utf8");
  const m = src.match(/EXTENSION_VERSION\s*=\s*"([^"]+)"/);
  if (!m) throw new Error("Couldn't find EXTENSION_VERSION in version.ts");
  return m[1];
}

function parse(v: string) {
  const { major, minor, patch, pre } = parseSemver(v);
  return { major, minor, patch, pre };
}

function bump(current: string, kind: string): string {
  if (SEMVER_RX.test(kind)) return kind;
  const c = parse(current);
  switch (kind) {
    case "patch":
      return `${c.major}.${c.minor}.${c.patch + 1}`;
    case "minor":
      return `${c.major}.${c.minor + 1}.0`;
    case "major":
      return `${c.major + 1}.0.0`;
    default:
      throw new Error(`Unknown bump kind: ${kind}`);
  }
}

function todayISO() {
  return formatIsoDate(nowUtc());
}

function updateVersionTs(next: string) {
  const src = readFileSync(VERSION_TS, "utf8");
  const patched = src.replace(
    /(EXTENSION_VERSION\s*=\s*)"[^"]+"/,
    `$1"${next}"`,
  );
  writeFileSync(VERSION_TS, patched);
}

/**
 * If RELEASES has a topmost entry with version "next", rename it to the
 * concrete version and stamp it with today's date. Otherwise inject a
 * fresh placeholder entry so the maintainer can fill it in.
 */
function updateReleasesTs(next: string) {
  let src = readFileSync(RELEASES_TS, "utf8");
  const today = todayISO();

  // Try to find a "version: 'next'" entry to rename.
  const wip = RELEASE_VERSION.WIP;
  const nextEntryRx = new RegExp(
    `(version:\\s*)"${wip}"(\\s*,\\s*\\n\\s*date:\\s*)"[^"]+"`,
  );
  if (nextEntryRx.test(src)) {
    src = src.replace(nextEntryRx, (_m, a, b) => `${a}"${next}"${b}"${today}"`);
    writeFileSync(RELEASES_TS, src);
    return;
  }

  // No WIP entry. Inject a fresh stub at the top of the RELEASES array.
  const insertion = `  {
    version: "${next}",
    date: "${today}",
    title: "TODO: one-line tagline",
    items: [
      { kind: RELEASE_ITEM_KIND.FEAT, text: "TODO: add release notes for ${next}" },
    ],
  },
  `;
  src = src.replace(
    /(export const RELEASES: ReleaseEntry\[\] = \[\n)/,
    `$1${insertion}`,
  );
  writeFileSync(RELEASES_TS, src);
}

/**
 * Snapshot the current /docs surface into /docs/v<major>.<minor>/.
 * Prunes any snapshot that's older than `current - keep`.
 *
 * Note: docs snapshots only happen on minor/major bumps. Patch releases
 * share docs with their parent minor — calling this on a patch bump is a
 * no-op if the snapshot already exists.
 */
function snapshotDocs(prev: string, next: string, keep: number = 2) {
  const prevTag = docsVersionTag(prev);
  const nextTag = docsVersionTag(next);
  // If the tag didn't change (patch bump), nothing to do.
  if (prevTag === nextTag) {
    console.log(`  (docs snapshot skipped — same minor: ${prevTag})`);
    return;
  }

  // Copy current docs into the prev-version folder.
  const snapshotDir = join(DOCS_DIR, prevTag);
  if (existsSync(snapshotDir)) {
    console.log(`  ⚠  snapshot ${prevTag} already exists, skipping copy`);
  } else {
    cpSync(DOCS_DIR, snapshotDir, {
      recursive: true,
      filter: (src) => {
        // Don't recurse into existing vX.Y snapshots, the changelog
        // folder, or the css file.
        const rel = src.slice(DOCS_DIR.length + 1);
        if (rel.startsWith("v")) return false;
        return true;
      },
    });
    console.log(`  ✓ snapshotted docs into app/docs/${prevTag}/`);
  }

  // Prune old snapshots.
  const entries = readdirSync(DOCS_DIR, { withFileTypes: true });
  const snapshots = entries
    .filter((e) => e.isDirectory() && /^v\d+\.\d+$/.test(e.name))
    .map((e) => {
      const [maj, min] = e.name.slice(1).split(".").map(Number);
      return { name: e.name, key: maj * 1000 + min };
    })
    .sort((a, b) => b.key - a.key);

  if (snapshots.length > keep) {
    for (const s of snapshots.slice(keep)) {
      rmSync(join(DOCS_DIR, s.name), { recursive: true, force: true });
      console.log(`  ✗ pruned old snapshot app/docs/${s.name}/`);
    }
  }
}

// ─── main ─────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error(
    "Usage: bun run scripts/bump-version.ts <patch|minor|major|x.y.z> [--snapshot]",
  );
  process.exit(1);
}
const kind = args[0];
const wantSnapshot = args.includes("--snapshot");

const current = readCurrentVersion();
const next = bump(current, kind);
console.log(`Toppings version bump: ${current} → ${next}`);

updateVersionTs(next);
console.log("  ✓ packages/constants/src/version.ts");

updateReleasesTs(next);
console.log("  ✓ packages/constants/src/releases.ts (renamed WIP / inserted stub)");

if (wantSnapshot) {
  snapshotDocs(current, next, 2);
}

console.log(`\nDone. Verify with:`);
console.log(`  git diff`);
console.log(`  bun run scripts/check-consistency.ts`);
console.log(`Then edit RELEASES[0].items to describe what shipped, commit, and tag.`);
