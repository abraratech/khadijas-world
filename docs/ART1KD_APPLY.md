# Apply ART.1K-D

Extract the ART.1K-D package and run its guarded installer from PowerShell.

```powershell
cd C:\Projects\khadijas-world

$Zip = "$env:USERPROFILE\Downloads\art1k-d-test-reliability.zip"
$Extracted = "$env:TEMP\art1k-d-test-reliability"

Remove-Item $Extracted -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path $Zip -DestinationPath $Extracted -Force

& "$Extracted\apply-art1k-d.ps1" `
  -ProjectRoot "C:\Projects\khadijas-world"
```

Then validate:

```powershell
npm run check
npm test
npm run build
```

For a browser regression check:

```powershell
npm run dev
```

Open `http://localhost:5173` and hard-refresh.
