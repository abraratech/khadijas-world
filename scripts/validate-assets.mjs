import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(projectRoot, "art", "ASSET_MANIFEST.json");
const errors = [];

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const seenIds = new Set();

function parseGlb(buffer) {
  if (buffer.length < 20 || buffer.toString("ascii", 0, 4) !== "glTF") {
    throw new Error("not a GLB 2.0 file");
  }
  if (buffer.readUInt32LE(4) !== 2) throw new Error("unsupported GLB version");
  let offset = 12;
  let json = null;
  let binary = null;
  while (offset + 8 <= buffer.length) {
    const chunkLength = buffer.readUInt32LE(offset);
    const chunkType = buffer.readUInt32LE(offset + 4);
    offset += 8;
    const chunk = buffer.subarray(offset, offset + chunkLength);
    offset += chunkLength;
    if (chunkType === 0x4e4f534a) {
      json = JSON.parse(chunk.toString("utf8").replace(/\u0000+$/u, "").trim());
    } else if (chunkType === 0x004e4942) {
      binary = chunk;
    }
  }
  if (!json) throw new Error("missing GLB JSON chunk");
  return { json, binary };
}

function embeddedImageDimensions(gltf, binary, image) {
  if (!binary || image?.bufferView === undefined) return null;
  const view = gltf.bufferViews?.[image.bufferView];
  if (!view) return null;
  const start = view.byteOffset ?? 0;
  const data = binary.subarray(start, start + view.byteLength);
  if (
    data.length >= 24
    && data[0] === 0x89
    && data.toString("ascii", 1, 4) === "PNG"
  ) {
    return [data.readUInt32BE(16), data.readUInt32BE(20)];
  }
  return null;
}

for (const asset of manifest.assets ?? []) {
  if (!asset.id || seenIds.has(asset.id)) errors.push(`duplicate or missing asset id: ${asset.id ?? "<missing>"}`);
  seenIds.add(asset.id);
  if (!asset.assetVersion) errors.push(`${asset.id}: missing assetVersion`);
  if (!asset.productionFile) errors.push(`${asset.id}: missing productionFile`);
  if (!asset.fallback) errors.push(`${asset.id}: missing fallback`);
  if (!asset.license) errors.push(`${asset.id}: missing license`);
  if (/^(?:[a-z]:\\|\/home\/|\/users\/)/iu.test(asset.productionFile ?? "")) {
    errors.push(`${asset.id}: productionFile contains an absolute local path`);
  }

  const absolutePath = path.join(projectRoot, asset.productionFile);
  try {
    const fileStat = await stat(absolutePath);
    const fileBuffer = await readFile(absolutePath);
    const digest = createHash("sha256").update(fileBuffer).digest("hex");
    if (fileStat.size !== asset.fileSizeBytes) {
      errors.push(`${asset.id}: expected ${asset.fileSizeBytes} bytes, found ${fileStat.size}`);
    }
    if (digest !== asset.sha256) errors.push(`${asset.id}: SHA-256 does not match manifest`);

    const { json: gltf, binary } = parseGlb(fileBuffer);
    const animations = (gltf.animations ?? []).map((entry) => entry.name).filter(Boolean);
    for (const expected of asset.animations ?? []) {
      if (!animations.includes(expected)) errors.push(`${asset.id}: missing animation ${expected}`);
    }

    const materialCount = (gltf.materials ?? []).length;
    if (materialCount !== asset.materialCount) {
      errors.push(`${asset.id}: expected ${asset.materialCount} material(s), found ${materialCount}`);
    }

    const jointCount = (gltf.skins ?? []).reduce((maximum, skin) => Math.max(maximum, skin.joints?.length ?? 0), 0);
    if (jointCount !== asset.jointCount) {
      errors.push(`${asset.id}: expected ${asset.jointCount} joints, found ${jointCount}`);
    }

    const primitives = (gltf.meshes ?? []).flatMap((mesh) => mesh.primitives ?? []);
    const triangleCount = primitives.reduce((total, primitive) => {
      const indexAccessor = gltf.accessors?.[primitive.indices];
      return total + (indexAccessor ? Math.floor(indexAccessor.count / 3) : 0);
    }, 0);
    if (triangleCount !== asset.triangleCount) {
      errors.push(`${asset.id}: expected ${asset.triangleCount} triangles, found ${triangleCount}`);
    }

    const vertexCount = primitives.reduce((total, primitive) => {
      const positionAccessor = gltf.accessors?.[primitive.attributes?.POSITION];
      return total + (positionAccessor?.count ?? 0);
    }, 0);
    if (vertexCount !== asset.vertexCount) {
      errors.push(`${asset.id}: expected ${asset.vertexCount} vertices, found ${vertexCount}`);
    }

    const images = gltf.images ?? [];
    if (images.length !== asset.textureCount) {
      errors.push(`${asset.id}: expected ${asset.textureCount} texture image(s), found ${images.length}`);
    }
    const expectedDimensions = asset.textureDimensions;
    if (expectedDimensions && images.length > 0) {
      const dimensions = embeddedImageDimensions(gltf, binary, images[0]);
      if (!dimensions || dimensions[0] !== expectedDimensions[0] || dimensions[1] !== expectedDimensions[1]) {
        errors.push(`${asset.id}: expected embedded texture ${expectedDimensions.join("x")}, found ${dimensions?.join("x") ?? "unknown"}`);
      }
    }
  } catch (error) {
    errors.push(`${asset.id}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (errors.length) {
  console.error("Asset validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Asset validation passed for ${seenIds.size} production asset(s).`);
}
