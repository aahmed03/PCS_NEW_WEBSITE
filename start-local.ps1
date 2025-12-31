# start-local.ps1
# ✅ FIXES:
# - Avoids -Command "Set-Location ...; & C:\PRIMARY ..." quoting issues
# - Uses Start-Process -WorkingDirectory + -FilePath powershell.exe + -ArgumentList -File
# - Runs backend + frontend reliably even with spaces in paths

$ErrorActionPreference = "Stop"

# ---------------- CONFIG ----------------
$Root = "C:\PRIMARY CARE SERVICES\PCS Website\PCS_NEW_WEBSITE CODE-12-25-2025\PCS_NEW-WEBSITE-main\PCS_NEW-WEBSITE-main\PCS_NEW_WEBSITE"
$BackendDir  = Join-Path $Root "backend"
$FrontendDir = Join-Path $Root "frontend"

$BackendHost = "127.0.0.1"
$BackendPort = 8000
$FrontendUrl = "http://localhost:3000"

# ---------------- VALIDATION ----------------
if (!(Test-Path -LiteralPath $BackendDir))  { throw "Backend folder not found: $BackendDir" }
if (!(Test-Path -LiteralPath $FrontendDir)) { throw "Frontend folder not found: $FrontendDir" }

if (!(Test-Path -LiteralPath (Join-Path $BackendDir "server.py"))) { throw "server.py not found in: $BackendDir" }
if (!(Test-Path -LiteralPath (Join-Path $BackendDir "requirements.txt"))) { throw "requirements.txt not found in: $BackendDir" }
if (!(Test-Path -LiteralPath (Join-Path $FrontendDir "package.json"))) { throw "package.json not found in: $FrontendDir" }

Write-Host "Backend:  $BackendDir"
Write-Host "Frontend: $FrontendDir"

# ---------------- VENV ----------------
$VenvDir   = Join-Path $BackendDir "venv"
$PythonExe = Join-Path $VenvDir "Scripts\python.exe"
$PipExe    = Join-Path $VenvDir "Scripts\pip.exe"

if (!(Test-Path -LiteralPath $PythonExe)) {
  Write-Host "Virtual env not found. Creating venv in: $VenvDir"
  Set-Location -LiteralPath $BackendDir
  & "python" "-m" "venv" "$VenvDir"
}

# ---------------- LOAD backend/.env for THIS process ----------------
$EnvFile = Join-Path $BackendDir ".env"
if (Test-Path -LiteralPath $EnvFile) {
  Write-Host "Loading env vars from: $EnvFile"
  Get-Content -LiteralPath $EnvFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
      $parts = $line.Split("=", 2)
      $k = $parts[0].Trim()
      $v = $parts[1].Trim().Trim('"')
      [System.Environment]::SetEnvironmentVariable($k, $v, "Process")
    }
  }
}

if (-not $env:MONGO_URL) { $env:MONGO_URL = "mongodb://localhost:27017" }
if (-not $env:DB_NAME)   { $env:DB_NAME   = "pcs" }

Write-Host "MONGO_URL = $env:MONGO_URL"
Write-Host "DB_NAME   = $env:DB_NAME"

# ---------------- INSTALL BACKEND DEPS ----------------
Write-Host "Installing backend requirements..."
Set-Location -LiteralPath $BackendDir
& "$PythonExe" "-m" "pip" "install" "--upgrade" "pip"
& "$PipExe" "install" "-r" (Join-Path $BackendDir "requirements.txt")

# ---------------- SEED ----------------
Write-Host "Seeding database..."
& "$PythonExe" (Join-Path $BackendDir "seed_data.py")

# ---------------- CREATE TEMP START SCRIPTS (avoids quoting issues) ----------------
$TmpDir = Join-Path $env:TEMP "pcs-start"
New-Item -ItemType Directory -Force -Path $TmpDir | Out-Null

$BackendStart = Join-Path $TmpDir "start-backend.ps1"
$FrontendStart = Join-Path $TmpDir "start-frontend.ps1"

@"
`$ErrorActionPreference = "Stop"
Set-Location -LiteralPath "$BackendDir"
& "$PythonExe" -m uvicorn server:app --host $BackendHost --port $BackendPort --reload
"@ | Set-Content -LiteralPath $BackendStart -Encoding UTF8

@"
`$ErrorActionPreference = "Stop"
Set-Location -LiteralPath "$FrontendDir"
npm install
npm start
"@ | Set-Content -LiteralPath $FrontendStart -Encoding UTF8

# ---------------- START BACKEND (NEW WINDOW) ----------------
Write-Host "Starting backend..."
Start-Process -FilePath "powershell.exe" -ArgumentList @(
  "-NoExit",
  "-ExecutionPolicy", "Bypass",
  "-File", $BackendStart
) | Out-Null

# ---------------- START FRONTEND (NEW WINDOW) ----------------
Write-Host "Starting frontend..."
Start-Process -FilePath "powershell.exe" -ArgumentList @(
  "-NoExit",
  "-ExecutionPolicy", "Bypass",
  "-File", $FrontendStart
) | Out-Null

Write-Host ""
Write-Host "✅ Started."
Write-Host "Backend:  http://$BackendHost`:$BackendPort/api"
Write-Host "Frontend: $FrontendUrl"






