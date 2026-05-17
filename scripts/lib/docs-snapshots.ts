import { cpSync, existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { DOC_SNAPSHOT_RETENTION_MINORS } from "@toppings/constants";
import {
  docsVersionTag,
  parseDocsSnapshotDir,
  parseSemver,
  semverDocKey,
} from "@toppings/utils";
import { repoPath } from "./root";

export function listDocsSnapshotDirs(docsDir: string = repoPath("docsDir")) {
  return readdirSync(docsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => parseDocsSnapshotDir(e.name))
    .filter((s): s is NonNullable<typeof s> => s !== null)
    .sort((a, b) => b.key - a.key);
}

export function snapshotDocs(
  prev: string,
  next: string,
  docsDir: string = repoPath("docsDir"),
  keep: number = DOC_SNAPSHOT_RETENTION_MINORS,
): void {
  const prevTag = docsVersionTag(prev);
  const nextTag = docsVersionTag(next);

  if (prevTag === nextTag) {
    console.log(`  (docs snapshot skipped — same minor: ${prevTag})`);
    return;
  }

  const snapshotDir = join(docsDir, prevTag);
  if (existsSync(snapshotDir)) {
    console.log(`  ⚠  snapshot ${prevTag} already exists, skipping copy`);
  } else {
    cpSync(docsDir, snapshotDir, {
      recursive: true,
      filter: (src) => {
        const rel = src.slice(docsDir.length + 1);
        if (rel.startsWith("v")) return false;
        return true;
      },
    });
    console.log(`  ✓ snapshotted docs into app/docs/${prevTag}/`);
  }

  const snapshots = listDocsSnapshotDirs(docsDir);
  if (snapshots.length > keep) {
    for (const s of snapshots.slice(keep)) {
      rmSync(join(docsDir, `v${s.major}.${s.minor}`), {
        recursive: true,
        force: true,
      });
      console.log(`  ✗ pruned old snapshot app/docs/v${s.major}.${s.minor}/`);
    }
  }
}

export function currentDocsSnapshotKey(version: string): number {
  const { major, minor } = parseSemver(version);
  return semverDocKey(major, minor);
}
