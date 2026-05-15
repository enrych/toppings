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
 *   1. EXTENSION_VERSION matches every package.json's `version` field.
 *   2. EXTENSION_VERSION matches web-ext/src/manifest.json's `version`.
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

const ROOT = resolve(import.meta.dir, "..");

// Lazy imports so this script can run before bun install if needed.
const { EXTENSION_VERSION, RELEASES, EXTENSION_DEFAULT_STORE } = await import(
  "../packages/constants/src/index"
);

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

// 1 & 2 — package.json + manifest.json version sync
const PACKAGE_JSONS = [
  "package.json",
  "web-ext/package.json",
  "website/package.json",
  "backend/package.json",
  "packages/constants/package.json",
];
console.log("\nVersion sync:");
for (const rel of PACKAGE_JSONS) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) continue;
  const j = JSON.parse(readFileSync(p, "utf8"));
  if (j.version === EXTENSION_VERSION) {
    ok(`${rel}@${j.version}`);
  } else {
    // Root package.json sometimes has no version (it's a workspace meta).
    // Treat missing version as soft, mismatched version as hard.
    if (j.version == null) {
      ok(`${rel} (no version field, workspace root — fine)`);
    } else {
      fail(`${rel} version is "${j.version}", expected "${EXTENSION_VERSION}"`);
    }
  }
}
const manifest = JSON.parse(
  readFileSync(join(ROOT, "web-ext/src/manifest.json"), "utf8"),
);
if (manifest.version === EXTENSION_VERSION) {
  ok(`web-ext/src/manifest.json@${manifest.version}`);
} else {
  fail(
    `manifest.json version is "${manifest.version}", expected "${EXTENSION_VERSION}"`,
  );
}

// 3 — RELEASES topmost concrete entry matches EXTENSION_VERSION
console.log("\nRelease notes:");
const latest = RELEASES.find((r) => r.version !== "next");
if (!latest) {
  fail("No concrete release entry in RELEASES — only 'next' WIP found");
} else if (latest.version !== EXTENSION_VERSION) {
  fail(
    `Latest RELEASES entry is v${latest.version}, but EXTENSION_VERSION is ${EXTENSION_VERSION}. Update releases.ts.`,
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
const expectedKeys = [
  w.togglePlaybackRate?.key,
  w.seekBackward?.key,
  w.seekForward?.key,
  w.increasePlaybackRate?.key,
  w.decreasePlaybackRate?.key,
  w.toggleLoopSegment?.key,
  w.setLoopSegmentBegin?.key,
  w.setLoopSegmentEnd?.key,
  w.audioMode?.toggleAudioMode?.key,
].filter(Boolean);
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
