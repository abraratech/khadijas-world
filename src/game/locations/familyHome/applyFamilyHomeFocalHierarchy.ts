import {
  type Mesh,
  type Scene,
  Vector3,
} from "@babylonjs/core";

const rugPivot =
  new Vector3(-2.6, 0, -.4);

const noDynamicShadowNames = new Set([
  "floor",
  "kitchen-floor",
  "rug",
  "rug-inset",
  "back-wall",
  "left-wall",
  "kitchen-divider",
]);

function belongsToFamilyHome(
  mesh: Mesh,
): boolean {
  let node = mesh.parent;

  while (node) {
    if (
      node.name === "location-home-root"
      || node.name
        === "art1g-family-home-high-polish"
    ) {
      return true;
    }

    node = node.parent;
  }

  return false;
}

function scaleRugCluster(
  mesh: Mesh,
): void {
  const scale = .88;
  const offset = new Vector3(
    -.05,
    0,
    .08,
  );

  const relative =
    mesh.position.subtract(rugPivot);

  mesh.position.x =
    rugPivot.x
    + relative.x * scale
    + offset.x;

  mesh.position.z =
    rugPivot.z
    + relative.z * scale
    + offset.z;

  mesh.scaling.x *= scale;
  mesh.scaling.z *= scale;
}

function isRugCluster(
  name: string,
): boolean {
  return (
    name === "rug"
    || name === "rug-inset"
    || name.startsWith("rug-stripe-")
  );
}

function isQuietFloorDetail(
  name: string,
): boolean {
  return (
    name.startsWith("floor-plank-")
    || name.startsWith("tile-line-")
    || name.startsWith("rug-stripe-")
  );
}

/**
 * Establishes a calmer Home focal hierarchy after SCENE.1A and SCENE.1B.
 *
 * Dynamic cascaded shadows are removed from the large flat room receivers,
 * because the Home already has authored soft contact shadows. This eliminates
 * the harsh diagonal bands visible across the wall and floor while preserving
 * character and furniture shading. The rug and interactive cupboard are also
 * reduced without changing their identifiers or child interactions.
 */
export function applyFamilyHomeFocalHierarchy(
  scene: Scene,
  homeDetails: readonly Mesh[],
): Mesh[] {
  const metadata =
    (scene.metadata ?? {}) as Record<string, unknown>;

  if (
    metadata.familyHomeFocalHierarchy
    === "SCENE.1C"
  ) {
    return homeDetails.filter(
      (mesh) => !mesh.isDisposed(),
    );
  }

  for (const mesh of scene.meshes) {
    if (
      mesh.isDisposed()
      || !belongsToFamilyHome(mesh as Mesh)
    ) {
      continue;
    }

    const homeMesh = mesh as Mesh;
    const surfaceRole =
      homeMesh.metadata?.homeSurfaceRole;

    if (
      noDynamicShadowNames.has(homeMesh.name)
      || surfaceRole === "wall"
      || surfaceRole === "floor"
      || surfaceRole === "rug"
    ) {
      homeMesh.receiveShadows = false;
      homeMesh.metadata = {
        ...homeMesh.metadata,
        sceneShadowReceiver:
          "authored-contact-only",
      };
    }

    if (isRugCluster(homeMesh.name)) {
      scaleRugCluster(homeMesh);
      homeMesh.metadata = {
        ...homeMesh.metadata,
        sceneComposition: "SCENE.1C",
      };
    }

    if (isQuietFloorDetail(homeMesh.name)) {
      const limit =
        homeMesh.name.startsWith(
          "rug-stripe-",
        )
          ? .26
          : .36;

      homeMesh.visibility = Math.min(
        homeMesh.visibility,
        limit,
      );
    }
  }

  const cupboard =
    scene.getTransformNodeByName("cupboard");

  if (cupboard) {
    cupboard.scaling.scaleInPlace(.84);
    cupboard.position.x += .18;
    cupboard.position.z += .03;
    cupboard.metadata = {
      ...cupboard.metadata,
      sceneComposition: "SCENE.1C",
    };
  }

  scene.metadata = {
    ...metadata,
    familyHomeFocalHierarchy:
      "SCENE.1C",
  };

  return homeDetails.filter(
    (mesh) => !mesh.isDisposed(),
  );
}
