const fs = require("fs-extra");
const archiver = require("archiver");
const path = require("path");
const chalk = require("chalk");

const WEB_EXT_DIR = path.join(__dirname, "..");
const DIST_DIR = path.join(WEB_EXT_DIR, "dist");
const MANIFEST_FILE = path.join(DIST_DIR, "manifest.json");
const BROWSER = process.env.BROWSER || "chrome";
const STORE = BROWSER === "chrome" ? "Chrome Web Store" : "Mozilla Add-ons";

async function createArchive() {
  try {
    const manifestData = await fs.readFile(MANIFEST_FILE, "utf8");
    const manifest = JSON.parse(manifestData);
    const RELEASE_VERSION = manifest.version;
    const RELEASE_FILENAME = `toppings_v${RELEASE_VERSION}_${BROWSER}.zip`;

    const writeStream = fs.createWriteStream(RELEASE_FILENAME);
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(writeStream);

    writeStream.on("close", async () => {
      console.clear();
      const message = `
      ┏---------------------------------┓
      |                |
      |   Release Version: ${RELEASE_VERSION}        |
      |                |
      ┗---------------------------------┛

      Congratulations! Toppings has been successfully bundled and prepare for a new release.
      You can now upload the '${RELEASE_FILENAME}' file to the ${STORE} and GitHub releases.
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
