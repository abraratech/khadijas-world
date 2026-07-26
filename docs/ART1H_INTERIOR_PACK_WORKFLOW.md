# ART.1H — Ultimate House Interior Pack Workflow

The uploaded archive contains 123 individual Blend files. Browser code cannot
load `.blend` files directly, and no Blender runtime is required by the game.

ART.1H therefore uses the pack as a curated source/reference library while the
approved bedroom remains procedural. Eight bedroom candidates are recorded in
`src/game/assets/interiorPackCatalog.ts`:

- `Bed_Single.blend`
- `NightStand_1.blend`
- `Drawer_4.blend`
- `Shelf_Small1.blend`
- `Light_Desk.blend`
- `Curtains_Double.blend`
- `Houseplant_6.blend`
- `Carpet_2.blend`

An optional local Blender batch helper is included:

```powershell
.\scripts\export-interior-bedroom.ps1 `
  -BlendFolder "C:\path\to\extracted\Blends" `
  -BlenderExe "C:\Program Files\Blender Foundation\Blender 4.3\blender.exe"
```

Exports go to `art/generated/interior-bedroom` for visual review. Exported GLBs
are not automatically copied to `public` and are not activated by the game.
Each candidate must first pass style, scale, material, draw-call, and interaction
proxy review.
