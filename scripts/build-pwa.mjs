import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(projectRoot, "dist");
const templatePath = path.join(projectRoot, "scripts", "pwa-service-worker.template.js");
const manifestPath = path.join(distRoot, "manifest.webmanifest");

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else files.push(absolute);
  }
  return files;
}

const toWebPath = (absolute) => `./${path.relative(distRoot, absolute).split(path.sep).join("/")}`;

const allFiles = (await walk(distRoot))
  .filter((absolute) => !absolute.endsWith(`${path.sep}sw.js`))
  .filter((absolute) => !absolute.endsWith(`${path.sep}pwa-assets.json`))
  .sort();

const requiredIcons = [
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-192.png",
  "icons/maskable-512.png",
  "icons/apple-touch-icon.png",
];

for (const relative of requiredIcons) {
  await fs.access(path.join(distRoot, relative));
}

const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
if (!Array.isArray(manifest.icons) || manifest.icons.length < 4) {
  throw new Error("PWA manifest must contain standard and maskable PNG icons.");
}

const contentHash = createHash("sha256");
let totalBytes = 0;
for (const absolute of allFiles) {
  const contents = await fs.readFile(absolute);
  totalBytes += contents.byteLength;
  contentHash.update(toWebPath(absolute));
  contentHash.update(contents);
}
const version = contentHash.digest("hex").slice(0, 16);

const critical = [];
const runtime = [];
for (const absolute of allFiles) {
  const relative = toWebPath(absolute);
  const normalized = relative.toLowerCase();
  const isCritical = normalized === "./index.html"
    || normalized === "./offline.html"
    || normalized === "./manifest.webmanifest"
    || normalized === "./favicon.svg"
    || normalized === "./app-icon.svg"
    || normalized.startsWith("./icons/")
    || /^\.\/assets\/[^/]+\.(?:js|css)$/.test(normalized);

  (isCritical ? critical : runtime).push(relative);
}

if (!critical.includes("./index.html") || !critical.some((entry) => entry.endsWith(".js"))) {
  throw new Error("PWA critical shell is missing index.html or JavaScript chunks.");
}

const template = await fs.readFile(templatePath, "utf8");
const serviceWorker = template
  .replace("__PWA_VERSION__", JSON.stringify(version))
  .replace("__PWA_PRECACHE__", JSON.stringify(critical, null, 2))
  .replace("__PWA_RUNTIME__", JSON.stringify(runtime, null, 2));

await fs.writeFile(path.join(distRoot, "sw.js"), serviceWorker, "utf8");
await fs.writeFile(path.join(distRoot, "pwa-assets.json"), `${JSON.stringify({
  version,
  generatedAt: new Date().toISOString(),
  criticalAssets: critical.length,
  runtimeAssets: runtime.length,
  totalAssets: allFiles.length,
  totalBytes,
}, null, 2)}\n`, "utf8");

console.log(`PWA shell ${version}: ${critical.length} critical + ${runtime.length} runtime assets (${(totalBytes / 1024 / 1024).toFixed(1)} MiB).`);
