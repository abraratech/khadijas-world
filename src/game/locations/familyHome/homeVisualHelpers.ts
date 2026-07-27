import {
  Color3,
  Mesh,
  MeshBuilder,
  type Scene,
  type StandardMaterial,
  TransformNode,
  Vector3,
  VertexData,
} from "@babylonjs/core";
import { createMaterial, type WorldMaterialRegistry } from "../../shared/createMaterials";

export interface HomeMaterialPalette {
  fabricTeal: StandardMaterial;
  fabricMint: StandardMaterial;
  fabricCoral: StandardMaterial;
  woodWarm: StandardMaterial;
  woodLight: StandardMaterial;
  metal: StandardMaterial;
  ceramic: StandardMaterial;
  leaf: StandardMaterial;
  shadow: StandardMaterial;
}

export function createHomeMaterialPalette(
  scene: Scene,
  _materials: WorldMaterialRegistry,
): HomeMaterialPalette {
  const shadow = createMaterial(scene, "home-soft-shadow", new Color3(.08, .05, .07));
  shadow.alpha = .12;
  return {
    fabricTeal: createMaterial(scene, "home-fabric-teal", new Color3(.12, .57, .53)),
    fabricMint: createMaterial(scene, "home-fabric-mint", new Color3(.53, .77, .68)),
    fabricCoral: createMaterial(scene, "home-fabric-coral", new Color3(.95, .43, .55)),
    woodWarm: createMaterial(scene, "home-wood-warm", new Color3(.58, .32, .16)),
    woodLight: createMaterial(scene, "home-wood-light", new Color3(.77, .53, .30)),
    metal: createMaterial(scene, "home-metal", new Color3(.68, .73, .74)),
    ceramic: createMaterial(scene, "home-ceramic", new Color3(.98, .94, .86)),
    leaf: createMaterial(scene, "home-leaf", new Color3(.23, .56, .31)),
    shadow,
  };
}

const component = (vector: Vector3, axis: number): number => (
  axis === 0 ? vector.x : axis === 1 ? vector.y : vector.z
);

const setComponent = (vector: Vector3, axis: number, value: number): void => {
  if (axis === 0) vector.x = value;
  else if (axis === 1) vector.y = value;
  else vector.z = value;
};

/**
 * Builds a single low-poly rounded cuboid. The mesh is generated from six
 * subdivided faces and projected onto a rounded-box surface, avoiding the many
 * draw calls and overlapping faces produced by stacking primitive boxes.
 */
export function roundedFootprint(
  scene: Scene,
  name: string,
  size: Vector3,
  position: Vector3,
  material: StandardMaterial,
  radius: number,
  parent?: TransformNode,
): Mesh {
  const mesh = new Mesh(name, scene);
  const half = size.scale(.5);
  const radii = new Vector3(
    Math.max(.005, Math.min(radius, half.x * .92)),
    Math.max(.005, Math.min(radius, half.y * .92)),
    Math.max(.005, Math.min(radius, half.z * .92)),
  );
  const inner = new Vector3(
    Math.max(0, half.x - radii.x),
    Math.max(0, half.y - radii.y),
    Math.max(0, half.z - radii.z),
  );
  const subdivisions = 5;
  const positions: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  const faces: ReadonlyArray<readonly [number, number, number, number]> = [
    [0, 1, 2, 1],
    [0, 2, 1, -1],
    [1, 2, 0, 1],
    [1, 0, 2, -1],
    [2, 0, 1, 1],
    [2, 1, 0, -1],
  ];

  for (const [normalAxis, uAxis, vAxis, direction] of faces) {
    const faceStart = positions.length / 3;
    for (let vIndex = 0; vIndex <= subdivisions; vIndex += 1) {
      const vRatio = vIndex / subdivisions;
      for (let uIndex = 0; uIndex <= subdivisions; uIndex += 1) {
        const uRatio = uIndex / subdivisions;
        const point = Vector3.Zero();
        setComponent(point, normalAxis, component(half, normalAxis) * direction);
        setComponent(point, uAxis, -component(half, uAxis) + component(size, uAxis) * uRatio);
        setComponent(point, vAxis, -component(half, vAxis) + component(size, vAxis) * vRatio);

        const nearest = new Vector3(
          Math.max(-inner.x, Math.min(inner.x, point.x)),
          Math.max(-inner.y, Math.min(inner.y, point.y)),
          Math.max(-inner.z, Math.min(inner.z, point.z)),
        );
        const delta = point.subtract(nearest);
        const scaledDelta = new Vector3(
          delta.x / radii.x,
          delta.y / radii.y,
          delta.z / radii.z,
        );
        const rounded = scaledDelta.lengthSquared() > 1e-8
          ? nearest.add(scaledDelta.normalize().multiply(radii))
          : point;
        const normal = new Vector3(
          delta.x / (radii.x * radii.x),
          delta.y / (radii.y * radii.y),
          delta.z / (radii.z * radii.z),
        ).normalize();
        positions.push(rounded.x, rounded.y, rounded.z);
        normals.push(normal.x, normal.y, normal.z);
        uvs.push(uRatio, 1 - vRatio);
      }
    }

    for (let vIndex = 0; vIndex < subdivisions; vIndex += 1) {
      for (let uIndex = 0; uIndex < subdivisions; uIndex += 1) {
        const row = subdivisions + 1;
        const a = faceStart + vIndex * row + uIndex;
        const b = a + 1;
        const c = a + row;
        const d = c + 1;
        indices.push(a, b, c, b, d, c);
      }
    }
  }

  const data = new VertexData();
  data.positions = positions;
  data.indices = indices;
  data.normals = normals;
  data.uvs = uvs;
  data.applyToMesh(mesh, true);
  mesh.position.copyFrom(position);
  mesh.material = material;
  mesh.parent = parent ?? null;
  mesh.receiveShadows = true;
  return mesh;
}

export function softCushion(
  scene: Scene,
  name: string,
  size: Vector3,
  position: Vector3,
  material: StandardMaterial,
  parent?: TransformNode,
): Mesh {
  const cushion = MeshBuilder.CreateSphere(name, { diameter: 1, segments: 12 }, scene);
  cushion.position.copyFrom(position);
  cushion.scaling.set(size.x, size.y, size.z);
  cushion.material = material;
  cushion.parent = parent ?? null;
  cushion.receiveShadows = true;
  cushion.isPickable = false;
  return cushion;
}

export function addSoftShadow(
  scene: Scene,
  name: string,
  position: Vector3,
  scale: Vector3,
  material: StandardMaterial,
  detailMeshes: Mesh[],
  parent?: TransformNode,
): Mesh {
  const shadow = MeshBuilder.CreateDisc(name, { radius: 1, tessellation: 24 }, scene);
  shadow.rotation.x = Math.PI / 2;
  shadow.position.copyFrom(position);
  shadow.scaling.copyFrom(scale);
  shadow.material = material;
  shadow.parent = parent ?? null;
  shadow.isPickable = false;
  detailMeshes.push(shadow);
  return shadow;
}

export function addPlantLeaves(
  scene: Scene,
  name: string,
  position: Vector3,
  material: StandardMaterial,
  parent?: TransformNode,
): TransformNode {
  const root = new TransformNode(name, scene);
  root.position.copyFrom(position);
  root.parent = parent ?? null;
  for (let index = 0; index < 7; index += 1) {
    const angle = (index / 7) * Math.PI * 2;
    const leaf = MeshBuilder.CreateSphere(`${name}-leaf-${index}`, { diameter: .38, segments: 8 }, scene);
    leaf.scaling.set(.55, 1.15, .34);
    leaf.position.set(Math.cos(angle) * .22, .18 + (index % 2) * .12, Math.sin(angle) * .22);
    leaf.rotation.z = Math.cos(angle) * .45;
    leaf.material = material;
    leaf.parent = root;
    leaf.isPickable = false;
  }
  return root;
}
