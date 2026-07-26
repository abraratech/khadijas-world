import {
  type AbstractMesh,
  Color3,
  Material,
  MultiMaterial,
  PBRMaterial,
  SceneLoader,
  type Scene,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import type { RoomId } from "../storage";
import { resolvePublicAssetUrl } from "./characterAssets";
import type {
  InteriorFurniturePlacementDefinition,
  InteriorFurnitureSelector,
} from "./interiorFurnitureAssets";

export type FurnitureVisualStatus = "idle" | "loading" | "ready" | "failed" | "disposed";

interface FurniturePlacementState {
  definition: InteriorFurniturePlacementDefinition;
  root: TransformNode;
  meshes: AbstractMesh[];
  status: FurnitureVisualStatus;
  error: string | null;
}

export interface SelectiveInteriorFurnitureManager {
  setQualityEnabled(enabled: boolean): void;
  setActiveRoom(room: RoomId): void;
  getStatus(id: string): FurnitureVisualStatus;
  dispose(): void;
}

interface MaterialFinish {
  color: Color3;
  metallic?: number;
  roughness?: number;
  alpha?: number;
  emissive?: Color3;
}

const hex = (value: string): Color3 => Color3.FromHexString(value);

const MATERIAL_FINISHES: Readonly<Record<string, MaterialFinish>> = {
  White: { color: hex("#F6F0E5"), roughness: .58 },
  Red: { color: hex("#DE5E6F"), roughness: .56 },
  DarkRed: { color: hex("#8E3345"), roughness: .62 },
  LightOrange: { color: hex("#F0AD5C"), roughness: .56 },
  Wood: { color: hex("#8C5939"), roughness: .70 },
  Wood_Dark: { color: hex("#56392D"), roughness: .72 },
  Wood_Light: { color: hex("#C58B57"), roughness: .68 },
  Brown: { color: hex("#6E4A32"), roughness: .72 },
  Grey: { color: hex("#A1A7AB"), roughness: .62 },
  Black: { color: hex("#20252C"), roughness: .48 },
  Metal: { color: hex("#ABB4BB"), metallic: .52, roughness: .34 },
  LightMetal: { color: hex("#C4CDD2"), metallic: .58, roughness: .30 },
  DarkMetal: { color: hex("#4C555E"), metallic: .55, roughness: .32 },
  Plant_Green: { color: hex("#3F8B4B"), roughness: .78 },
  Couch_Blue: { color: hex("#4D8EB6"), roughness: .68 },
  Cushin: { color: hex("#E49B74"), roughness: .72 },
  Cushion: { color: hex("#E49B74"), roughness: .72 },
  Kitchen: { color: hex("#67ADA3"), roughness: .57 },
  KitchenTop: { color: hex("#EFE6D7"), roughness: .42 },
  Glass: { color: hex("#9FD4DE"), roughness: .18, alpha: .46 },
  Light: {
    color: hex("#FFF0BC"),
    roughness: .38,
    emissive: hex("#6B4A16"),
  },
};

export function furnitureFinishForMaterial(name: string): MaterialFinish {
  const normalized = name.replace(/\.\d+$/u, "");
  return MATERIAL_FINISHES[normalized] ?? { color: hex("#D8D2C7"), roughness: .58 };
}

function selectorMatches(name: string, selector: InteriorFurnitureSelector | undefined): boolean {
  if (!selector) return false;
  return Boolean(
    selector.names?.includes(name)
    || selector.prefixes?.some((prefix) => name.startsWith(prefix)),
  );
}

function materialLeaves(material: Material | null): Material[] {
  if (!material) return [];
  return material instanceof MultiMaterial
    ? material.subMaterials.filter((entry): entry is Material => entry !== null)
    : [material];
}

function applyFurnitureMaterial(material: Material): void {
  if (!(material instanceof PBRMaterial)) return;
  const finish = furnitureFinishForMaterial(material.name);
  material.albedoColor = finish.color;
  material.metallic = finish.metallic ?? 0;
  material.roughness = finish.roughness ?? .58;
  material.environmentIntensity = .72;
  material.alpha = finish.alpha ?? 1;
  material.transparencyMode = finish.alpha === undefined
    ? Material.MATERIAL_OPAQUE
    : Material.MATERIAL_ALPHABLEND;
  material.emissiveColor = finish.emissive ?? Color3.Black();
  material.backFaceCulling = true;
}

function importedBounds(meshes: readonly AbstractMesh[]): { min: Vector3; max: Vector3 } | null {
  let minimum = new Vector3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
  let maximum = new Vector3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
  let found = false;
  for (const mesh of meshes) {
    if (mesh.getTotalVertices() <= 0) continue;
    mesh.computeWorldMatrix(true);
    const bounds = mesh.getBoundingInfo().boundingBox;
    minimum = Vector3.Minimize(minimum, bounds.minimumWorld);
    maximum = Vector3.Maximize(maximum, bounds.maximumWorld);
    found = true;
  }
  return found ? { min: minimum, max: maximum } : null;
}

function fitToPlacement(
  state: FurniturePlacementState,
): void {
  const { definition, root, meshes } = state;
  root.position.set(0, 0, 0);
  root.rotation.set(0, definition.rotationY, 0);
  root.scaling.setAll(1);
  root.computeWorldMatrix(true);

  let bounds = importedBounds(meshes);
  if (!bounds) throw new Error("Imported furniture has no renderable bounds");
  const sourceSize = bounds.max.subtract(bounds.min);
  const [targetX, targetY, targetZ] = definition.targetSize;
  root.scaling.set(
    targetX / Math.max(sourceSize.x, .0001),
    targetY / Math.max(sourceSize.y, .0001),
    targetZ / Math.max(sourceSize.z, .0001),
  );
  root.computeWorldMatrix(true);

  bounds = importedBounds(meshes);
  if (!bounds) throw new Error("Imported furniture bounds disappeared after fitting");
  const center = bounds.min.add(bounds.max).scale(.5);
  const target = Vector3.FromArray(definition.center);
  root.position.addInPlace(target.subtract(center));
  root.computeWorldMatrix(true);
}

export function createSelectiveInteriorFurnitureManager(
  scene: Scene,
  definitions: readonly InteriorFurniturePlacementDefinition[],
  initialRoom: RoomId,
): SelectiveInteriorFurnitureManager {
  let activeRoom = initialRoom;
  let qualityEnabled = false;
  let disposed = false;
  const originalVisibility = new Map<AbstractMesh, number>();
  const proceduralMeshes = [...scene.meshes];
  for (const mesh of proceduralMeshes) originalVisibility.set(mesh, mesh.visibility);

  const states = new Map<string, FurniturePlacementState>();
  for (const definition of definitions) {
    const root = new TransformNode(`interior-${definition.id}-root`, scene);
    root.setEnabled(false);
    states.set(definition.id, {
      definition,
      root,
      meshes: [],
      status: "idle",
      error: null,
    });
  }

  const shouldShow = (state: FurniturePlacementState): boolean => (
    qualityEnabled
    && state.status === "ready"
    && state.definition.room === activeRoom
  );

  const refreshFallbackVisibility = (): void => {
    for (const mesh of proceduralMeshes) {
      const original = originalVisibility.get(mesh) ?? 1;
      const hidden = [...states.values()].some((state) => (
        shouldShow(state)
        && selectorMatches(mesh.name, state.definition.hide)
      ));
      mesh.visibility = hidden ? 0 : original;
    }
  };

  const refresh = (): void => {
    if (disposed) return;
    for (const state of states.values()) {
      const visible = shouldShow(state);
      state.root.setEnabled(visible);
      if (
        qualityEnabled
        && state.definition.room === activeRoom
        && state.status === "idle"
      ) void load(state);
    }
    refreshFallbackVisibility();
  };

  const load = async (state: FurniturePlacementState): Promise<void> => {
    if (state.status !== "idle" || disposed) return;
    state.status = "loading";
    try {
      const result = await SceneLoader.ImportMeshAsync(
        null,
        "",
        resolvePublicAssetUrl(state.definition.modelPath),
        scene,
        undefined,
        ".glb",
      );
      if (disposed) {
        for (const mesh of result.meshes) mesh.dispose(false, true);
        return;
      }

      state.meshes = result.meshes;
      const importedNodes = [...result.meshes, ...result.transformNodes];
      for (const node of importedNodes) {
        if (!node.parent) node.parent = state.root;
      }

      const seenMaterials = new Set<Material>();
      for (const mesh of result.meshes) {
        mesh.isPickable = false;
        mesh.receiveShadows = true;
        mesh.metadata = {
          ...mesh.metadata,
          interiorFurnitureAssetId: state.definition.id,
          interiorFurnitureAssetVersion: "art1ka-1",
          decorativeDetail: true,
          qualityTier: "high",
        };
        for (const material of materialLeaves(mesh.material)) {
          if (seenMaterials.has(material)) continue;
          seenMaterials.add(material);
          applyFurnitureMaterial(material);
        }
      }

      state.root.setEnabled(true);
      fitToPlacement(state);
      state.root.setEnabled(false);
      state.status = "ready";
      refresh();
    } catch (error) {
      state.status = "failed";
      state.error = error instanceof Error ? error.message : String(error);
      state.root.setEnabled(false);
      console.warn(
        `[ART.1K-A] ${state.definition.id} kept its procedural fallback: ${state.error}`,
      );
      refreshFallbackVisibility();
    }
  };

  return {
    setQualityEnabled(enabled: boolean): void {
      qualityEnabled = enabled;
      refresh();
    },
    setActiveRoom(room: RoomId): void {
      activeRoom = room;
      refresh();
    },
    getStatus(id: string): FurnitureVisualStatus {
      return states.get(id)?.status ?? "failed";
    },
    dispose(): void {
      if (disposed) return;
      disposed = true;
      for (const [mesh, visibility] of originalVisibility) mesh.visibility = visibility;
      for (const state of states.values()) {
        state.status = "disposed";
        state.root.dispose(false, true);
      }
      states.clear();
    },
  };
}
