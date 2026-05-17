import { readFileSync, writeFileSync } from "node:fs";
import {
  RELEASE_ITEM_KIND,
  RELEASE_STUB,
  RELEASE_VERSION,
} from "@toppings/constants";
import { formatIsoDate, interpolateTemplate, nowUtc } from "@toppings/utils";
import { repoPath } from "./root";

export function updateReleasesForBump(
  next: string,
  filePath: string = repoPath("releasesTs"),
): void {
  let src = readFileSync(filePath, "utf8");
  const today = formatIsoDate(nowUtc());
  const wip = RELEASE_VERSION.WIP;
  const nextEntryRx = new RegExp(
    `(version:\\s*)"${wip}"(\\s*,\\s*\\n\\s*date:\\s*)"[^"]+"`,
  );

  if (nextEntryRx.test(src)) {
    src = src.replace(nextEntryRx, (_m, a, b) => `${a}"${next}"${b}"${today}"`);
    writeFileSync(filePath, src);
    return;
  }

  const itemText = interpolateTemplate(RELEASE_STUB.ITEM_TEXT, { version: next });
  const insertion = `  {
    version: "${next}",
    date: "${today}",
    title: "${RELEASE_STUB.TITLE}",
    items: [
      { kind: RELEASE_ITEM_KIND.FEAT, text: "${itemText}" },
    ],
  },
  `;
  src = src.replace(
    /(export const RELEASES: ReleaseEntry\[\] = \[\n)/,
    `$1${insertion}`,
  );
  writeFileSync(filePath, src);
}
