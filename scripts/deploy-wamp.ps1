param(
  [string]$WampWebRoot = "C:\wamp64\www",
  [string]$SiteFolder = "khadijas-world"
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$Destination = Join-Path $WampWebRoot $SiteFolder

Push-Location $ProjectRoot
try {
  Write-Host "Building Khadija's World..." -ForegroundColor Cyan
  & npm.cmd run build
  if ($LASTEXITCODE -ne 0) {
    throw "The production build failed."
  }

  New-Item -ItemType Directory -Force -Path $Destination | Out-Null

  Write-Host "Deploying dist to $Destination..." -ForegroundColor Cyan
  & robocopy "$ProjectRoot\dist" $Destination /MIR /NFL /NDL /NJH /NJS /NP
  if ($LASTEXITCODE -gt 7) {
    throw "Robocopy failed with exit code $LASTEXITCODE."
  }

  Write-Host "Deployment complete: http://localhost/$SiteFolder/" -ForegroundColor Green
}
finally {
  Pop-Location
}
