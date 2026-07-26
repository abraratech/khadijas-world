# ART.1I Interior Pack Workflow

The uploaded Ultimate House Interior Pack remains a source and comparison
library. Blend files are not browser assets and are not shipped into the public
runtime automatically.

## Curated ART.1I candidates

```text
Chair_2.blend
Stool.blend
Table_RoundSmall2.blend
Shelf_Large.blend
Kitchen_Cabinet2.blend
Kitchen_Sink.blend
Kitchen_Oven.blend
Kitchen_Fridge.blend
Plate_1.blend
Spoon.blend
Light_CeilingSingle.blend
Trashcan_Small1.blend
```

## Optional local export

```powershell
.\scripts\export-interior-commercial.ps1 `
  -BlendFolder "C:\path\to\extracted\Blends" `
  -BlenderExe "C:\Program Files\Blender Foundation\Blender 4.3\blender.exe"
```

Exports are written to:

```text
art\generated\interior-commercial
```

## Acceptance rule

An exported object can become active only after it:

1. looks clearly better than the approved procedural object;
2. fits the dollhouse camera and proportions;
3. has acceptable triangles, materials, and file size;
4. can be recolored to the project palette;
5. does not replace gameplay collision or interaction proxies;
6. has its source and licence recorded in the asset manifest and credits.

No ART.1I runtime object currently depends on these Blend files.
