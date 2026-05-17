import path from "node:path";
import archiver from "archiver";
import chalk from "chalk";
import fs from "fs-extra";
import { EXTENSION_VERSION } from "../../packages/constants/src/version.ts";

const DIST_DIR = path.resolve("dist");
const isFirefox = process.argv[2] === "firefox" ? "firefox" : "chrome";

async function createArchive() {
  try {
    if (!fs.existsSync(DIST_DIR)) {
      throw new Error(
        `The 'dist' directory was not found at ${DIST_DIR}. Please ensure it exists before running this script.`,
      );
    }
    const version = EXTENSION_VERSION;
    const filename = `toppings_v${version}_${isFirefox}.zip`;
    const store = isFirefox ? "Mozilla Add-ons" : "Chrome Web Store";

    const writeStream = fs.createWriteStream(filename);
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(writeStream);

    writeStream.on("close", async () => {
      console.clear();
      const message = `
      ┏---------------------------------┓
      |                |
      |   Release Version: ${version}        |
      |                |
      ┗---------------------------------┛

      Congratulations! Toppings has been successfully bundled and prepare for a new release.
      You can now upload the '${filename}' file to the ${store} and GitHub releases.
      `;

      console.log(chalk.yellow(message));
      await fs.rm(DIST_DIR, { recursive: true });
      process.exit(0);
    });

    archive.on("warning", (err) => {
      if (err.code === "ENOENT") {
        console.warn(err);
      } else {
        throw err;
      }
    });

    archive.on("error", (err) => {
      throw err;
    });

    // Add directory to archive
    await archive.directory(DIST_DIR, false);

    // Finalize archive and remove build folder
    await archive.finalize();
  } catch (err) {
    console.error("Error creating archive:", err);
  }
}

createArchive();
