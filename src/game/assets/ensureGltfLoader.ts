let gltfLoaderPromise: Promise<unknown> | null = null;

/**
 * Loads Babylon's glTF plugin only when an imported production asset is needed.
 * The shared promise prevents duplicate registration and duplicate downloads.
 */
export function ensureGltfLoader(): Promise<unknown> {
  gltfLoaderPromise ??= import("@babylonjs/loaders/glTF");
  return gltfLoaderPromise;
}
