export interface InteriorPackCandidate {
  sourceBlend: string;
  milestone: "ART.1G" | "ART.1H" | "ART.1I";
  role: string;
  runtimeStatus: "source-only" | "approved-for-export" | "active" | "reviewed-not-selected";
}

/**
 * Curated candidates from the uploaded Ultimate House Interior Pack. Blend
 * sources are not browser assets; selected items must be reviewed and exported
 * to optimized GLB before runtime use.
 */
export const INTERIOR_PACK_CANDIDATES: readonly InteriorPackCandidate[] = [
  { sourceBlend: "Bed_Single.blend", milestone: "ART.1H", role: "bed silhouette reference", runtimeStatus: "reviewed-not-selected" },
  { sourceBlend: "NightStand_1.blend", milestone: "ART.1H", role: "bedside storage shell", runtimeStatus: "active" },
  { sourceBlend: "Drawer_3.blend", milestone: "ART.1H", role: "drawer review candidate", runtimeStatus: "reviewed-not-selected" },
  { sourceBlend: "Shelf_Small1.blend", milestone: "ART.1H", role: "personal display storage shell", runtimeStatus: "active" },
  { sourceBlend: "Light_Desk.blend", milestone: "ART.1H", role: "desk-light shell", runtimeStatus: "active" },
  { sourceBlend: "Curtains_Double.blend", milestone: "ART.1H", role: "window treatment shell", runtimeStatus: "active" },
  { sourceBlend: "Houseplant_6.blend", milestone: "ART.1H", role: "bedroom greenery shell", runtimeStatus: "active" },
  { sourceBlend: "Carpet_2.blend", milestone: "ART.1H", role: "rug review candidate", runtimeStatus: "reviewed-not-selected" },
  { sourceBlend: "Couch_Medium2.blend", milestone: "ART.1G", role: "home seating candidate", runtimeStatus: "source-only" },
  { sourceBlend: "Kitchen_Fridge.blend", milestone: "ART.1G", role: "home appliance shell", runtimeStatus: "active" },
  { sourceBlend: "Chair_2.blend", milestone: "ART.1I", role: "cafe chair shell", runtimeStatus: "active" },
  { sourceBlend: "Stool.blend", milestone: "ART.1I", role: "counter stool shell", runtimeStatus: "active" },
  { sourceBlend: "Table_RoundSmall2.blend", milestone: "ART.1I", role: "cafe table shell", runtimeStatus: "active" },
  { sourceBlend: "Shelf_Large.blend", milestone: "ART.1I", role: "grocery shelving review candidate", runtimeStatus: "reviewed-not-selected" },
  { sourceBlend: "Kitchen_Cabinet2.blend", milestone: "ART.1I", role: "commercial counter cabinet shell", runtimeStatus: "active" },
  { sourceBlend: "Kitchen_Sink.blend", milestone: "ART.1I", role: "cafe work-sink shell", runtimeStatus: "active" },
  { sourceBlend: "Kitchen_Oven.blend", milestone: "ART.1I", role: "cafe and home oven shell", runtimeStatus: "active" },
  { sourceBlend: "Kitchen_Fridge.blend", milestone: "ART.1I", role: "grocery refrigerated display shell", runtimeStatus: "active" },
  { sourceBlend: "Plate_1.blend", milestone: "ART.1I", role: "cafe serving prop review candidate", runtimeStatus: "reviewed-not-selected" },
  { sourceBlend: "Spoon.blend", milestone: "ART.1I", role: "cafe cutlery review candidate", runtimeStatus: "reviewed-not-selected" },
  { sourceBlend: "Light_CeilingSingle.blend", milestone: "ART.1I", role: "commercial pendant-light shell", runtimeStatus: "active" },
  { sourceBlend: "Trashcan_Small1.blend", milestone: "ART.1I", role: "commercial waste-bin shell", runtimeStatus: "active" },
] as const;

export const BEDROOM_INTERIOR_PACK_CANDIDATES = INTERIOR_PACK_CANDIDATES.filter(
  (candidate) => candidate.milestone === "ART.1H",
);

export const COMMERCIAL_INTERIOR_PACK_CANDIDATES = INTERIOR_PACK_CANDIDATES.filter(
  (candidate) => candidate.milestone === "ART.1I",
);
