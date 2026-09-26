import { rm } from "node:fs/promises";
import { EXTENSION_VERSION } from "../lib/version";

const browser = process.argv.includes("--firefox") ? "firefox" : "chrome";
const filename = `toppings_v${EXTENSION_VERSION}_${browser}.zip`;

const zip = Bun.spawn(["zip", "-qr", `../${filename}`, "."], { cwd: "dist", stdout: "inherit", stderr: "inherit" });
if ((await zip.exited) !== 0) throw new Error("zip failed");
await rm("dist", { recursive: true, force: true });

console.log(`${filename} is ready for the ${browser === "firefox" ? "Mozilla Add-ons" : "Chrome Web Store"} upload.`);
