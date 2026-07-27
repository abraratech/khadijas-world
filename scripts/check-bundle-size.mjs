import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();
const assetsDir = path.join(projectRoot, "dist", "assets");
const maximumChunkBytes = 500 * 1024;

async function main() {
  let entries;
  try {
    entries = await readdir(assetsDir, { withFileTypes: true });
  } catch (error) {
    console.error("Bundle check failed: dist/assets does not exist. Run npm run build first.");
    throw error;
  }

  const chunks = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".js")) continue;
    const filePath = path.join(assetsDir, entry.name);
    const info = await stat(filePath);
    chunks.push({ name: entry.name, bytes: info.size });
  }

  if (chunks.length === 0) {
    throw new Error("Bundle check failed: no JavaScript chunks were found in dist/assets.");
  }

  chunks.sort((left, right) => right.bytes - left.bytes);
  console.log("Largest JavaScript chunks:");
  for (const chunk of chunks.slice(0, 10)) {
    console.log(`  ${(chunk.bytes / 1024).toFixed(2).padStart(8)} KiB  ${chunk.name}`);
  }

  const oversized = chunks.filter((chunk) => chunk.bytes > maximumChunkBytes);
  if (oversized.length > 0) {
    console.error(`\nBundle budget exceeded: ${oversized.length} chunk(s) are larger than 500 KiB.`);
    process.exitCode = 1;
    return;
  }

  console.log(`\nBundle budget passed: ${chunks.length} JavaScript chunk(s), all at or below 500 KiB.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
