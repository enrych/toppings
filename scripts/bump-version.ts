#!/usr/bin/env bun
import { REPO_PATH } from "@toppings/constants";
import { bumpSemver } from "@toppings/utils";
import { snapshotDocs } from "./lib/docs-snapshots";
import { updateReleasesForBump } from "./lib/releases-file";
import {
  readExtensionVersion,
  writeExtensionVersion,
} from "./lib/version-file";

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error(
    "Usage: bun run scripts/bump-version.ts <patch|minor|major|x.y.z> [--snapshot]",
  );
  process.exit(1);
}

const kind = args[0];
const wantSnapshot = args.includes("--snapshot");

const current = readExtensionVersion();
const next = bumpSemver(current, kind);

console.log(`Toppings version bump: ${current} → ${next}`);

writeExtensionVersion(next);
console.log(`  ✓ ${REPO_PATH.versionTs}`);

updateReleasesForBump(next);
console.log(`  ✓ ${REPO_PATH.releasesTs} (renamed WIP / inserted stub)`);

if (wantSnapshot) {
  snapshotDocs(current, next);
}

console.log("\nDone. Verify with:");
console.log("  git diff");
console.log("  bun run check");
console.log(
  "Then edit RELEASES[0].items to describe what shipped, commit, and tag.",
);
