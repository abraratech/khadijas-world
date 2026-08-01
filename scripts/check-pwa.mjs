import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const required = [
  "index.html",
  "manifest.webmanifest",
  "offline.html",
  "sw.js",
  "pwa-assets.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-192.png",
  "icons/maskable-512.png",
  "icons/apple-touch-icon.png",
];

for (const relative of required) {
  const stat = await fs.stat(path.join(dist, relative));
  if (!stat.isFile() || stat.size === 0) throw new Error(`Missing PWA artifact: ${relative}`);
}

const manifest = JSON.parse(await fs.readFile(path.join(dist, "manifest.webmanifest"), "utf8"));
if (manifest.display !== "standalone") throw new Error("PWA manifest display must be standalone.");
if (!manifest.start_url || !manifest.scope) throw new Error("PWA manifest requires start_url and scope.");
const iconSizes = new Set((manifest.icons ?? []).map((icon) => `${icon.sizes}:${icon.purpose ?? "any"}`));
for (const requiredIcon of ["192x192:any", "512x512:any", "192x192:maskable", "512x512:maskable"]) {
  if (!iconSizes.has(requiredIcon)) throw new Error(`PWA manifest is missing ${requiredIcon}.`);
}

const worker = await fs.readFile(path.join(dist, "sw.js"), "utf8");
for (const marker of ["PWA_WARM_OFFLINE_CACHE", "API_PATH_PREFIX", "appShellNavigation", "refreshAppShell", "PWA_SKIP_WAITING"]) {
  if (!worker.includes(marker)) throw new Error(`Service worker marker missing: ${marker}`);
}

const assets = JSON.parse(await fs.readFile(path.join(dist, "pwa-assets.json"), "utf8"));
if (!assets.version || assets.criticalAssets < 5 || assets.runtimeAssets < 1) {
  throw new Error("Generated PWA asset inventory is incomplete.");
}

console.log(`PWA check passed: ${assets.version}, ${assets.totalAssets} assets, ${(assets.totalBytes / 1024 / 1024).toFixed(1)} MiB.`);
