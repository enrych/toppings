#!/usr/bin/env bun
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  DOC_SNAPSHOT_RETENTION_MINORS,
  EXTENSION_DEFAULT_STORE,
  EXTENSION_VERSION,
  RELEASE_TODO_PREFIX,
  RELEASE_VERSION,
  VERSIONLESS_PACKAGE_JSONS,
} from "@toppings/constants";
import {
  compact,
  getLatestRelease,
  hasValue,
  isDocsSnapshotStale,
  isNull,
} from "@toppings/utils";
import {
  createCheckReport,
  fail,
  ok,
  printCheckSummary,
  warn,
} from "./lib/check-report";
import {
  currentDocsSnapshotKey,
  listDocsSnapshotDirs,
} from "./lib/docs-snapshots";
import { repoPath, ROOT } from "./lib/root";

const report = createCheckReport();

console.log("\n— Toppings consistency check —\n");
console.log(`EXTENSION_VERSION = ${EXTENSION_VERSION}`);

console.log("\nSingle version source:");
for (const rel of VERSIONLESS_PACKAGE_JSONS) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) continue;
  const j = JSON.parse(readFileSync(p, "utf8"));
  if (hasValue(j.version)) {
    fail(
      report,
      `${rel} has "version": "${j.version}" — remove it; bump only packages/constants/src/version.ts`,
    );
  } else {
    ok(report, `${rel} (no version field)`);
  }
}

const manifest = JSON.parse(readFileSync(repoPath("manifestJson"), "utf8"));
if (hasValue(manifest.version)) {
  fail(
    report,
    `manifest.json has "version": "${manifest.version}" — remove it; the build stamps from EXTENSION_VERSION`,
  );
} else {
  ok(report, "web-ext/src/manifest.json (no version field; build stamps it)");
}

console.log("\nRelease notes:");
const latest = getLatestRelease();
if (isNull(latest)) {
  fail(
    report,
    `No concrete release entry in RELEASES — only "${RELEASE_VERSION.WIP}" WIP found`,
  );
} else if (latest.version !== EXTENSION_VERSION) {
  fail(
    report,
    `Latest RELEASES entry is v${latest.version}, but EXTENSION_VERSION is ${EXTENSION_VERSION}. Update packages/constants/src/releases.ts.`,
  );
} else {
  ok(report, `RELEASES latest = v${latest.version} (${latest.date})`);
  if (latest.items.length === 0) {
    fail(report, `RELEASES entry for v${latest.version} has no items`);
  } else if (
    latest.items.every((i) => i.text.startsWith(RELEASE_TODO_PREFIX))
  ) {
    fail(
      report,
      `RELEASES entry for v${latest.version} still has TODO placeholders`,
    );
  }
}

console.log("\nDocs cross-checks:");
const kbSource = readFileSync(repoPath("keybindingsPage"), "utf8");
const w = EXTENSION_DEFAULT_STORE.preferences.watch;
const expectedKeys = compact([
  w.togglePlaybackRate.key,
  w.seekBackward.key,
  w.seekForward.key,
  w.increasePlaybackRate.key,
  w.decreasePlaybackRate.key,
  w.toggleLoopSegment.key,
  w.setLoopSegmentBegin.key,
  w.setLoopSegmentEnd.key,
  w.audioMode.toggleAudioMode.key,
]);
let missingKeys = 0;
for (const k of expectedKeys) {
  if (!kbSource.includes(`"${k}"`)) {
    warn(
      report,
      `Keybindings docs page doesn't mention default key "${k}" — add or update the row.`,
    );
    missingKeys++;
  }
}
if (missingKeys === 0) {
  ok(
    report,
    `Keybindings docs reference all ${expectedKeys.length} default keys`,
  );
}

console.log("\nDoc snapshots:");
const snapshots = listDocsSnapshotDirs();
if (snapshots.length === 0) {
  ok(report, "No archived snapshots (fresh repo or pre-release)");
} else {
  const currentKey = currentDocsSnapshotKey(EXTENSION_VERSION);
  for (const snapshot of snapshots) {
    const name = `v${snapshot.major}.${snapshot.minor}`;
    if (isDocsSnapshotStale(snapshot.key, currentKey, DOC_SNAPSHOT_RETENTION_MINORS)) {
      warn(
        report,
        `Doc snapshot ${name} is older than current - ${DOC_SNAPSHOT_RETENTION_MINORS}; consider pruning.`,
      );
    } else {
      ok(report, `Snapshot ${name} within retention window`);
    }
  }
}

printCheckSummary(report);
