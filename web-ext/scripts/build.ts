import { cp, mkdir, rm, watch } from "node:fs/promises";
import autoprefixer from "autoprefixer";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import { BRAND_METADATA } from "../lib/brand";
import { URLS } from "../lib/urls";
import { EXTENSION_VERSION } from "../lib/version";
import tailwindConfig from "../tailwind.config";

const production = process.argv.includes("--production");
const firefox = process.argv.includes("--firefox");
const watching = process.argv.includes("--watch");

// Overridable so a Chrome and a Firefox build can coexist on disk.
const DIST = process.env.DIST ?? "dist";

const scripts = [
  { entry: "app/background/index.ts", out: "background" },
  { entry: "app/content/index.ts", out: "content" },
  { entry: "app/popup/index.tsx", out: "popup/index" },
  { entry: "app/options/index.tsx", out: "options/index" },
];

const styles = [
  { entry: "app/popup/index.css", out: "popup/index.css" },
  { entry: "app/options/index.css", out: "options/index.css" },
];

const copies = ["assets", "_locales", "app/popup/index.html", "app/options/index.html"];

async function bundleScripts() {
  for (const { entry, out } of scripts) {
    const result = await Bun.build({
      entrypoints: [entry],
      outdir: DIST,
      naming: `${out}.[ext]`,
      target: "browser",
      format: "iife",
      sourcemap: production ? "none" : "linked",
      define: {
        "process.env.NODE_ENV": JSON.stringify(production ? "production" : "development"),
        "process.env.TOPPINGS_API": JSON.stringify(process.env.TOPPINGS_API ?? "https://toppings.enry.ch/api"),
        // Firefox's chrome.* namespace is callback-only under MV2 and returns
        // undefined when called for a promise; its browser.* namespace is the
        // same API with promises, which is how the code calls it.
        ...(firefox && { chrome: "browser" }),
      },
    });
    if (!result.success) {
      for (const log of result.logs) console.error(String(log));
      throw new Error(`bundling ${entry} failed`);
    }
  }
}

// Relative @imports are inlined here; the PostCSS pipeline below does not
// resolve them, and a raw @import would point nowhere from dist/.
async function inlineImports(css: string, from: string): Promise<string> {
  const dir = from.slice(0, from.lastIndexOf("/"));
  const imports = [...css.matchAll(/^@import "(\.[^"]+)";\n?/gm)];
  for (const match of imports) {
    const path = `${dir}/${match[1]}`;
    css = css.replace(match[0], await inlineImports(await Bun.file(path).text(), path) + "\n");
  }
  return css;
}

async function buildStyles() {
  const processor = postcss([tailwindcss(tailwindConfig), autoprefixer]);
  for (const { entry, out } of styles) {
    const css = await inlineImports(await Bun.file(entry).text(), entry);
    const result = await processor.process(css, { from: entry, to: `${DIST}/${out}` });
    await Bun.write(`${DIST}/${out}`, result.css);
  }
}

async function copyStatic() {
  for (const source of copies) {
    const target = source.startsWith("app/") ? source.slice("app/".length) : source;
    await cp(source, `${DIST}/${target}`, { recursive: true });
  }
}

// app/manifest.json is the MV3 source of truth; Firefox still ships MV2, so
// the differences are applied here rather than kept as a second manifest.
async function writeManifest() {
  const manifest = await Bun.file("app/manifest.json").json();
  delete manifest.$schema;
  manifest.version = EXTENSION_VERSION;
  manifest.homepage_url = URLS.HOMEPAGE;

  if (firefox) {
    manifest.manifest_version = 2;
    manifest.background = { scripts: ["/background.js"], persistent: false };
    manifest.permissions = [...manifest.host_permissions, ...manifest.permissions];
    delete manifest.host_permissions;
    manifest.browser_action = manifest.action;
    delete manifest.action;
    manifest.web_accessible_resources = manifest.web_accessible_resources.flatMap(
      (resource: { resources: string[] }) => resource.resources,
    );
    manifest.browser_specific_settings = { gecko: { id: BRAND_METADATA.ID } };
  }

  await Bun.write(`${DIST}/manifest.json`, JSON.stringify(manifest, null, 2));
}

async function build() {
  const started = performance.now();
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });
  await Promise.all([bundleScripts(), buildStyles(), copyStatic(), writeManifest()]);
  console.log(
    `built ${firefox ? "firefox" : "chrome"} ${production ? "production" : "development"} in ${Math.round(performance.now() - started)}ms`,
  );
}

await build();

if (watching) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const rebuild = () => {
    clearTimeout(timer);
    timer = setTimeout(() => build().catch(console.error), 150);
  };
  for (const dir of ["app", "features", "kernel", "lib", "ui", "youtube"]) {
    (async () => {
      for await (const _ of watch(dir, { recursive: true })) rebuild();
    })();
  }
  console.log("watching for changes");
}
