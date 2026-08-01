import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path) => readFile(resolve(root, path), "utf8");
const requiredFiles = [
  "public/privacy.html",
  "public/accessibility.html",
  "public/release-notes.html",
  "public/_headers",
  "public/.well-known/security.txt",
  "RELEASE_CHECKLIST.md",
  "MOBILE_TEST_MATRIX.md",
  "PRIVACY.md",
  "ACCESSIBILITY.md",
];

for (const file of requiredFiles) await stat(resolve(root, file));

const [packageRaw, release, index, styles, manifestRaw, worker, wrangler] = await Promise.all([
  read("package.json"),
  read("src/game/release.ts"),
  read("index.html"),
  read("src/styles.css"),
  read("public/manifest.webmanifest"),
  read("scripts/pwa-service-worker.template.js"),
  read("wrangler.jsonc"),
]);
const pkg = JSON.parse(packageRaw);
const manifest = JSON.parse(manifestRaw);
const releaseVersion = release.match(/version:\s*"([^"]+)"/)?.[1];
if (releaseVersion !== pkg.version) throw new Error(`Release version ${releaseVersion} does not match package ${pkg.version}.`);

const checks = [
  [release, 'channel: "production"'],
  [release, 'productionPath: "/"'],
  [release, 'privacyDocumentVersion: "1.1"'],
  [release, 'accessibilityDocumentVersion: "1.0"'],
  [index, 'class="skip-link"'],
  [index, 'id="title-privacy-button"'],
  [index, 'id="title-accessibility-button"'],
  [index, 'id="accessibility-panel"'],
  [index, 'id="release-info-panel"'],
  [index, 'aria-keyshortcuts='],
  [styles, 'env(safe-area-inset-top)'],
  [styles, '@media (prefers-reduced-motion: reduce)'],
  [styles, '@media (prefers-contrast: more)'],
  [styles, 'min-height: 44px'],
  [worker, 'API_PATH_PREFIX'],
  [worker, 'appShellNavigation'],
  [wrangler, 'NPC_CHAT_RATE_LIMIT'],
  [wrangler, 'WORLD_SAVE_DB'],
];
for (const [source, marker] of checks) if (!source.includes(marker)) throw new Error(`Release marker missing: ${marker}`);
if (/pending/i.test(release)) throw new Error("Release metadata still contains a pending placeholder.");
if (manifest.display !== "standalone" || manifest.orientation !== "any") throw new Error("Manifest is not mobile-installable in both orientations.");
if (!Array.isArray(manifest.icons) || !manifest.icons.some((icon) => icon.sizes === "512x512")) throw new Error("Manifest lacks a 512px icon.");
console.log(`RELEASE.1 check passed: ${pkg.version}, production metadata, policies, mobile CSS, PWA, and Cloudflare bindings.`);
