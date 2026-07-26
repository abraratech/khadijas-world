param(
  [Parameter(Mandatory = $true)]
  [string]$BlendFolder,

  [string]$BlenderExe = "C:\Program Files\Blender Foundation\Blender 4.3\blender.exe",

  [string]$OutputFolder = ".\art\generated\interior-bedroom"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BlenderExe)) {
  throw "Blender was not found at: $BlenderExe"
}
if (-not (Test-Path $BlendFolder)) {
  throw "Blend folder was not found at: $BlendFolder"
}

$scriptPath = Join-Path $PSScriptRoot "..\tools\blender\export_interior_candidate.py"
$selected = @(
  "Bed_Single",
  "NightStand_1",
  "Drawer_3",
  "Shelf_Small1",
  "Light_Desk",
  "Curtains_Double",
  "Houseplant_6",
  "Carpet_2"
)

New-Item -ItemType Directory -Force -Path $OutputFolder | Out-Null

foreach ($name in $selected) {
  $source = Join-Path $BlendFolder "$name.blend"
  if (-not (Test-Path $source)) {
    Write-Warning "Skipping missing source: $source"
    continue
  }

  $output = Join-Path $OutputFolder "$($name.ToLower().Replace('_', '-')).glb"
  $env:OUTPUT_GLB = (Resolve-Path (Split-Path $output -Parent)).Path + "\" + (Split-Path $output -Leaf)
  Remove-Item $output -Force -ErrorAction SilentlyContinue
  & $BlenderExe --background $source --python $scriptPath
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path $output)) {
    throw "Blender export failed for $source"
  }
  $exported = Get-Item $output
  if ($exported.Length -lt 12) {
    throw "Blender created an invalid GLB for $source"
  }
}

Remove-Item Env:OUTPUT_GLB -ErrorAction SilentlyContinue
Write-Host "Bedroom candidates exported to $OutputFolder"
