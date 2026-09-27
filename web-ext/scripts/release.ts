import { rm } from "node:fs/promises";
import { join } from "node:path";
import { EXTENSION_VERSION } from "../lib/version";

const DIST = process.env.DIST ?? "dist";
const browser = process.argv.includes("--firefox") ? "firefox" : "chrome";
const filename = `toppings_v${EXTENSION_VERSION}_${browser}.zip`;
const archive = join(import.meta.dir, "..", filename);

// zip adds to an existing archive rather than replacing it, which would carry
// files from an earlier build of the same version into the upload.
await rm(archive, { force: true });
const zip = Bun.spawn(["zip", "-qr", archive, "."], { cwd: DIST, stdout: "inherit", stderr: "inherit" });
if ((await zip.exited) !== 0) throw new Error("zip failed");
await rm(DIST, { recursive: true, force: true });

console.log(`${filename} is ready for the ${browser === "firefox" ? "Mozilla Add-ons" : "Chrome Web Store"} upload.`);
