import {
  type AbstractMesh,
  type Mesh,
  type Scene,
  Vector3,
} from "@babylonjs/core";

interface CompositionCluster {
  pivot: Vector3;
  scale: number;
  offset: Vector3;
  matches(name: string): boolean;
}

const disposedDetailPrefixes = [
  "art1g-home-sofa-arm-piping-",
  "art1g-home-sofa-tuft-",
  "art1g-home-tv-speaker-",
  "art1g-home-tv-story-",
  "art1g-home-flower-stem-",
  "art1g-home-flower-head-",
  "art1g-home-large-plant-leaf-",
] as const;

const disposedDetailNames = new Set([
  "art1g-home-plant-pot-high",
]);

const backgroundDetailPrefixes = [
  "art1g-home-wall-panel-",
  "art1g-home-photo-frame-",
  "art1g-home-photo-art-",
] as const;

const coffeeTableCluster: CompositionCluster = {
  pivot: new Vector3(-2.6, 0, -1.8),
  scale: .86,
  offset: new Vector3(.10, 0, .10),
  matches: (name) => (
    name === "coffee-table"
    || name === "coffee-table-shadow"
    || name.startsWith("table-leg-")
    || name.startsWith("art1g-home-coffee-")
  ),
};

const mediaCluster: CompositionCluster = {
  pivot: new Vector3(-4.55, 0, -2.55),
  scale: .90,
  offset: new Vector3(-.05, 0, .10),
  matches: (name) => (
    name === "tv"
    || name === "tv-screen"
    || name === "tv-console"
    || name.startsWith("tv-console-door-")
    || name.startsWith("art1g-home-console-knob-")
    || name === "art1g-home-tv-screen-inset"
  ),
};

const islandCluster: CompositionCluster = {
  pivot: new Vector3(3.5, 0, .6),
  scale: .90,
  offset: new Vector3(.22, 0, .05),
  matches: (name) => (
    name === "island"
    || name === "island-top"
    || name === "island-shadow"
    || name.startsWith("island-panel-")
    || name.startsWith("stool-")
    || name.startsWith("stool-leg-")
    || name.startsWith("art1g-home-island-")
    || name === "art1g-home-chopping-board"
    || name === "art1g-home-fruit-bowl"
    || name.startsWith("art1g-home-fruit-")
    || name.startsWith("art1g-home-plate-stack-")
  ),
};

const compositionClusters = [
  coffeeTableCluster,
  mediaCluster,
  islandCluster,
] as const;

function shouldDisposeDetail(name: string): boolean {
  return (
    disposedDetailNames.has(name)
    || disposedDetailPrefixes.some(
      (prefix) => name.startsWith(prefix),
    )
  );
}

function isBackgroundDetail(name: string): boolean {
  return backgroundDetailPrefixes.some(
    (prefix) => name.startsWith(prefix),
  );
}

function applyClusterTransform(
  mesh: AbstractMesh,
  cluster: CompositionCluster,
): void {
  const relative =
    mesh.position.subtract(cluster.pivot);

  mesh.position.copyFrom(
    cluster.pivot
      .add(relative.scale(cluster.scale))
      .add(cluster.offset),
  );

  mesh.scaling.scaleInPlace(cluster.scale);
  mesh.metadata = {
    ...mesh.metadata,
    sceneComposition: "SCENE.1A",
  };
}

/**
 * Curates the existing Home scene without replacing gameplay geometry.
 *
 * The pass removes redundant High-only ornaments, reduces the three largest
 * foreground clusters, and quiets repeated wall details. Seats, collisions,
 * hotspots, save identifiers, and the core room shell remain unchanged.
 */
export function applyFamilyHomeSceneComposition(
  scene: Scene,
  highDetails: readonly Mesh[],
): Mesh[] {
  const metadata =
    (scene.metadata ?? {}) as Record<string, unknown>;

  if (
    metadata.familyHomeSceneComposition
    === "SCENE.1A"
  ) {
    return highDetails.filter(
      (mesh) => !mesh.isDisposed(),
    );
  }

  scene.metadata = {
    ...metadata,
    familyHomeSceneComposition: "SCENE.1A",
  };

  const retainedDetails: Mesh[] = [];

  for (const mesh of highDetails) {
    if (
      mesh.isDisposed()
      || shouldDisposeDetail(mesh.name)
    ) {
      if (!mesh.isDisposed()) {
        mesh.dispose(false, false);
      }
      continue;
    }

    if (isBackgroundDetail(mesh.name)) {
      mesh.visibility = Math.min(
        mesh.visibility,
        .72,
      );
    }

    retainedDetails.push(mesh);
  }

  for (const mesh of scene.meshes) {
    if (mesh.isDisposed()) {
      continue;
    }

    const cluster =
      compositionClusters.find(
        (candidate) =>
          candidate.matches(mesh.name),
      );

    if (cluster) {
      applyClusterTransform(mesh, cluster);
    }
  }

  return retainedDetails;
}
