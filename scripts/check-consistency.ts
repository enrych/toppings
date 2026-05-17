#!/usr/bin/env bun
/**
 * scripts/check-consistency.ts
 *
 *   bun run scripts/check-consistency.ts
 *
 * Verifies that the version + release + docs invariants hold across the
 * repo. Run locally before pushing a release; CI runs it on every PR.
 *
 * Exit code:
 *   0 — all checks passed
 *   1 — at least one hard check failed (CI should fail the build)
 *
 * Soft warnings (e.g. "this could be wrong") print but do not fail.
 *
 * Checks:
 *
 *   1. No package.json carries a `version` field (only packages/constants/src/version.ts does).
 *   2. web-ext/src/manifest.json has no `version` field (build stamps it).
 *   3. The newest non-"next" entry in RELEASES.version === EXTENSION_VERSION.
 *   4. /docs/keybindings includes a row for every keybinding default in
 *      EXTENSION_DEFAULT_STORE (warning, not hard fail).
 *   5. Doc snapshots in website/app/docs/v<minor>/ are within the
 *      sliding window (warning if older than current - 2).
 *
 * Deliberately NOT checked: whether a feature's catalog name appears
 * verbatim in docs / release notes. That's an editorial decision (voice,
 * examples, narrative) — it belongs with the agent or maintainer writing
 * the docs. See CLAUDE.md → "When you ship a feature".
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { compact, hasValue, isNull } from "@toppings/utils";

const ROOT = resolve(import.meta.dir, "..");

const { EXTENSION_VERSION, EXTENSION_DEFAULT_STORE, RELEASE_VERSION } =
  await import("../packages/constants/src/index");
const { getLatestRelease } = await import("@toppings/utils");

let hardFailures = 0;
let warnings = 0;

const ok = (msg: string) => console.log(`  ✓ ${msg}`);
const fail = (msg: string) => {
  console.error(`  ✗ ${msg}`);
  hardFailures++;
};
const warn = (msg: string) => {
  console.warn(`  ⚠ ${msg}`);
  warnings++;
};

console.log("\n— Toppings consistency check —\n");
console.log(`EXTENSION_VERSION = ${EXTENSION_VERSION}`);

// 1 & 2 — no duplicate version fields anywhere except version.constants.ts
const PACKAGE_JSONS = [
  "package.json",
  "web-ext/package.json",
  "website/package.json",
  "backend/package.json",
  "packages/constants/package.json",
  "packages/utils/package.json",
];
console.log("\nSingle version source:");
for (const rel of PACKAGE_JSONS) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) continue;
  const j = JSON.parse(readFileSync(p, "utf8"));
  if (hasValue(j.version)) {
    fail(
      `${rel} has "version": "${j.version}" — remove it; bump only packages/constants/src/version.ts`,
    );
  } else {
    ok(`${rel} (no version field)`);
  }
}
const manifest = JSON.parse(
  readFileSync(join(ROOT, "web-ext/src/manifest.json"), "utf8"),
);
if (hasValue(manifest.version)) {
  fail(
    `manifest.json has "version": "${manifest.version}" — remove it; the build stamps from EXTENSION_VERSION`,
  );
} else {
  ok("web-ext/src/manifest.json (no version field; build stamps it)");
}

// 3 — RELEASES topmost concrete entry matches EXTENSION_VERSION
console.log("\nRelease notes:");
const latest = getLatestRelease();
if (isNull(latest)) {
  fail(
    `No concrete release entry in RELEASES — only "${RELEASE_VERSION.WIP}" WIP found`,
  );
} else if (latest.version !== EXTENSION_VERSION) {
  fail(
    `Latest RELEASES entry is v${latest.version}, but EXTENSION_VERSION is ${EXTENSION_VERSION}. Update releases.constants.ts.`,
  );
} else {
  ok(`RELEASES[0] = v${latest.version} (${latest.date})`);
  if (latest.items.length === 0) {
    fail(`RELEASES entry for v${latest.version} has no items`);
  } else if (
    latest.items.every((i) =>
      /^TODO/i.test(i.text),
    )
  ) {
    fail(`RELEASES entry for v${latest.version} still has TODO placeholders`);
  }
}

// 4 — keybindings docs page mentions every default key
console.log("\nDocs cross-checks:");
const kbPagePath = join(ROOT, "website/app/docs/keybindings/page.tsx");
const kbSource = readFileSync(kbPagePath, "utf8");
const w = EXTENSION_DEFAULT_STORE.preferences.watch as Record<string, any>;
const expectedKeys = compact([
  w.togglePlaybackRate?.key,
  w.seekBackward?.key,
  w.seekForward?.key,
  w.increasePlaybackRate?.key,
  w.decreasePlaybackRate?.key,
  w.toggleLoopSegment?.key,
  w.setLoopSegmentBegin?.key,
  w.setLoopSegmentEnd?.key,
  w.audioMode?.toggleAudioMode?.key,
]);
let missingKeys = 0;
for (const k of expectedKeys) {
  if (!kbSource.includes(`"${k}"`)) {
    warn(
      `Keybindings docs page doesn't mention default key "${k}" — add or update the row.`,
    );
    missingKeys++;
  }
}
if (missingKeys === 0) {
  ok(`Keybindings docs reference all ${expectedKeys.length} default keys`);
}

// Note: we deliberately do NOT cross-check that every feature's catalog
// name appears in docs/release-notes. That kind of "does the copy mention
// this feature" check is a voice/editorial decision — it belongs with the
// agent / maintainer writing the docs, not a string-matcher. See
// CLAUDE.md → "When you ship a feature" for the checklist.

// 6 — doc snapshot window (current - 2)
console.log("\nDoc snapshots:");
const docsDir = join(ROOT, "website/app/docs");
const snapshots = readdirSync(docsDir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && /^v\d+\.\d+$/.test(e.name))
  .map((e) => e.name);
if (snapshots.length === 0) {
  ok("No archived snapshots (fresh repo or pre-release)");
} else {
  const [maj, min] = EXTENSION_VERSION.split(".").map(Number);
  const currentKey = maj * 1000 + min;
  for (const name of snapshots) {
    const [m, n] = name.slice(1).split(".").map(Number);
    const key = m * 1000 + n;
    if (currentKey - key > 2) {
      warn(`Doc snapshot ${name} is older than current - 2; consider pruning.`);
    } else {
      ok(`Snapshot ${name} within retention window`);
    }
  }
}

// ─── exit ─────────────────────────────────────────────────────────────
console.log("");
if (hardFailures > 0) {
  console.error(
    `✗ Consistency check FAILED: ${hardFailures} error(s), ${warnings} warning(s)\n`,
  );
  process.exit(1);
} else if (warnings > 0) {
  console.log(`✓ Consistency check passed (${warnings} soft warning(s))\n`);
} else {
  console.log(`✓ Consistency check passed (no warnings)\n`);
}
