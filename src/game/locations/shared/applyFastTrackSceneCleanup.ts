import {
  type AbstractMesh,
  type Scene,
} from "@babylonjs/core";

const HIDDEN_DETAIL_RULES: ReadonlyArray<{
  prefix: string;
  tokens: readonly string[];
}> = [
  {
    prefix: "art1h-bedroom-",
    tokens: [
      "bed-",
      "mattress",
      "duvet",
      "pillow",
      "headboard",
      "desk-",
      "chair-",
      "reading-chair",
      "wardrobe-",
      "storage-",
      "nightstand",
      "laundry",
      "slipper",
      "night-light-pool",
    ],
  },
  {
    prefix: "art1j-street-",
    tokens: [
      "house-base",
      "house-door",
      "house-window",
      "house-cornice",
      "house-step",
      "cafe-plinth",
      "cafe-door",
      "cafe-window",
      "cafe-cornice",
      "cafe-awning",
      "cafe-table",
      "bench-shadow",
      "tree-shadow",
      "mailbox-shadow",
    ],
  },
  {
    prefix: "art1i-cafe-",
    tokens: [
      "counter-",
      "back-counter",
      "display-",
      "machine-",
      "toy-basket",
      "toy-book",
      "toy-soft-ball",
      "cup-shelf",
      "counter-shadow",
      "display-shadow",
    ],
  },
  {
    prefix: "art1j-park-",
    tokens: [
      "bench-",
      "picnic-",
      "fountain-",
      "pond-",
      "sandbox-",
      "slide-",
      "swing-",
      "swings-",
      "bin-",
      "sign-",
      "bird-feeder",
    ],
  },
  {
    prefix: "art1i-grocery-",
    tokens: [
      "aisle",
      "shelf",
      "stock",
      "bakery-",
      "produce-",
      "fridge-",
      "household-",
      "checkout-",
      "register-",
      "bag-",
      "belt-",
      "receipt-",
      "lane-",
    ],
  },
];

function shouldHide(name: string): boolean {
  return HIDDEN_DETAIL_RULES.some((rule) => (
    name.startsWith(rule.prefix)
    && rule.tokens.some((token) => (
      name.includes(token)
    ))
  ));
}

function markHidden(mesh: AbstractMesh): void {
  mesh.metadata = {
    ...mesh.metadata,
    fastTrackHidden: true,
  };
  mesh.setEnabled(false);
}

export function applyFastTrackSceneCleanup(
  scene: Scene,
): AbstractMesh[] {
  const hidden: AbstractMesh[] = [];

  for (const mesh of scene.meshes) {
    if (shouldHide(mesh.name)) {
      markHidden(mesh);
      hidden.push(mesh);
    }
  }

  for (const mesh of scene.meshes) {
    if (
      mesh.name === "street-tree-crown"
      || mesh.name.startsWith(
        "park-tree-crown-",
      )
    ) {
      mesh.scaling.scaleInPlace(.82);
      mesh.metadata = {
        ...mesh.metadata,
        fastTrackScaled: true,
      };
    }
  }

  scene.metadata = {
    ...scene.metadata,
    fastTrackSceneCleanup: "SCENE.FAST.1",
    fastTrackHiddenDetailCount:
      hidden.length,
  };

  return hidden;
}

export function fastTrackDetailEnabled(
  mesh: AbstractMesh,
  decorativeDetails: boolean,
): boolean {
  return (
    decorativeDetails
    && mesh.metadata?.fastTrackHidden !== true
  );
}
