import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path) => readFile(resolve(root, path), "utf8");

const requiredFiles = [
  "CONTENT_1.md",
  "src/game/content/adventureCatalog.ts",
  "src/game/content/adventureBook.ts",
  "src/game/content/adventureBook.test.ts",
  "src/game/contentState.ts",
  "src/game/content/dialogue/topicSuggestions.ts",
  "public/release-notes.html",
];

for (const file of requiredFiles) await stat(resolve(root, file));

const [
  pkgRaw,
  release,
  catalog,
  adventure,
  contentState,
  index,
  styles,
  main,
  topics,
  templates,
  notes,
] = await Promise.all([
  read("package.json"),
  read("src/game/release.ts"),
  read("src/game/content/adventureCatalog.ts"),
  read("src/game/content/adventureBook.ts"),
  read("src/game/contentState.ts"),
  read("index.html"),
  read("src/styles.css"),
  read("src/main.ts"),
  read("src/game/content/dialogue/topicSuggestions.ts"),
  read("src/game/content/dialogue/dialogueTemplates.ts"),
  read("public/release-notes.html"),
]);

const pkg = JSON.parse(pkgRaw);
if (pkg.version !== "0.26.0") throw new Error(`Unexpected CONTENT.1 version: ${pkg.version}`);
if (!release.includes('build: "content-1-neighborhood-adventures"')) {
  throw new Error("CONTENT.1 release build metadata is missing.");
}

const adventureCount = (catalog.match(/\bid:\s*"/g) ?? []).length;
if (adventureCount !== 13) {
  throw new Error(`Expected 13 Adventure Book definitions, found ${adventureCount}.`);
}

const checks = [
  [catalog, '"world-explorer"'],
  [adventure, "recordAdventureAction"],
  [adventure, "recordAdventureMemoryEvent"],
  [adventure, "recordAdventureRoom"],
  [adventure, "adventureEncoreCounts"],
  [contentState, "adventureCompleted"],
  [contentState, "adventureVisitedRooms"],
  [contentState, "adventureStickers"],
  [index, 'id="adventure-button"'],
  [index, 'id="adventure-panel"'],
  [index, 'id="adventure-list"'],
  [index, 'id="adventure-stickers"'],
  [styles, ".adventure-panel"],
  [styles, ".adventure-card.is-complete"],
  [main, "renderAdventureBook"],
  [main, "recordAdventureAction"],
  [main, "recordAdventureMemoryEvent"],
  [main, "recordAdventureRoom"],
  [topics, 'context.locationId === "home"'],
  [topics, 'context.locationId === "bedroom"'],
  [topics, 'context.locationId === "street"'],
  [topics, 'context.locationId === "park"'],
  [topics, 'context.locationId === "grocery"'],
  [templates, "Adventure Book"],
  [notes, "Khadija's World 0.26.0"],
];

for (const [source, marker] of checks) {
  if (!source.includes(marker)) throw new Error(`CONTENT.1 marker missing: ${marker}`);
}

console.log("CONTENT.1 check passed: 13 adventures, save progress, stickers, encore play, six-location dialogue, and 0.26.0 release metadata.");
