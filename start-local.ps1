# start-local.ps1
# FIXES:
# - Uses correct backend module path: backend.server:app
# - Validates the right file locations
# - Uses Corepack to enable Yarn (recommended for packageManager=yarn@1.x)
# - Avoids quoting issues by writing temp start scripts
# - Keeps env vars for backend process (Process scope)
# - Adds clear diagnostics if something fails

$ErrorActionPreference = "Stop"

# ---------------- CONFIG ----------------
$Root = "C:\PRIMARY CARE SERVICES\PCS Website\PCS_NEW_WEBSITE CODE-12-25-2025\PCS_NEW-WEBSITE-main\PCS_NEW-WEBSITE-main\PCS_NEW_WEBSITE"
$BackendDir  = Join-Path $Root "backend"
$FrontendDir = Join-Path $Root "frontend"

$BackendHost = "127.0.0.1"
$BackendPort = 8000
$FrontendUrl = "http://localhost:3000"

# Backend ASGI app import path (matches Azure)
$BackendApp = "backend.server:app"

# ---------------- VALIDATION ----------------
if (!(Test-Path -LiteralPath $Root))       { throw "Root folder not found: $Root" }
if (!(Test-Path -LiteralPath $BackendDir)) { throw "Backend folder not found: $BackendDir" }
if (!(Test-Path -LiteralPath $FrontendDir)) { throw "Frontend folder not found: $FrontendDir" }

# Backend file validation: we expect backend\server.py to exist (module backend.server)
$BackendServerPy = Join-Path $BackendDir "server.py"
if (!(Test-Path -LiteralPath $BackendServerPy)) {
  throw "Expected backend entrypoint not found: $BackendServerPy`nFix: ensure backend/server.py exists (module backend.server)."
}

$BackendReq = Join-Path $BackendDir "requirements.txt"
if (!(Test-Path -LiteralPath $BackendReq)) { throw "requirements.txt not found in: $BackendDir" }

$FrontendPkg = Join-Path $FrontendDir "package.json"
if (!(Test-Path -LiteralPath $FrontendPkg)) { throw "package.json not found in: $FrontendDir" }

Write-Host "Root:     $Root"
Write-Host "Backend:  $BackendDir"
Write-Host "Frontend: $FrontendDir"
Write-Host ""

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

# Safe defaults for local dev
if (-not $env:MONGO_URL) { $env:MONGO_URL = "mongodb://localhost:27017" }
if (-not $env:DB_NAME)   { $env:DB_NAME   = "pcs" }
if (-not $env:ENV)       { $env:ENV       = "local" }

Write-Host "MONGO_URL = $env:MONGO_URL"
Write-Host "DB_NAME   = $env:DB_NAME"
Write-Host "ENV       = $env:ENV"
Write-Host ""

# ---------------- INSTALL BACKEND DEPS ----------------
Write-Host "Installing backend requirements..."
Set-Location -LiteralPath $BackendDir
& "$PythonExe" "-m" "pip" "install" "--upgrade" "pip"
& "$PipExe" "install" "-r" $BackendReq

# ---------------- SEED (optional but keep) ----------------
$SeedScript = Join-Path $BackendDir "seed_data.py"
if (Test-Path -LiteralPath $SeedScript) {
  Write-Host "Seeding database..."
  & "$PythonExe" $SeedScript
} else {
  Write-Host "seed_data.py not found (skipping seed)."
}

Write-Host ""

# ---------------- FRONTEND PACKAGE MANAGER (Yarn via corepack) ----------------
# If yarn isn't available, enable via corepack (ships with modern Node)
# If corepack isn't installed, we'll still try npm fallback.
$HasYarn = $false
try {
  $y = (& yarn --version 2>$null)
  if ($LASTEXITCODE -eq 0 -and $y) { $HasYarn = $true }
} catch {}

if (-not $HasYarn) {
  Write-Host "Yarn not found. Trying to enable via Corepack..."
  try {
    & corepack enable | Out-Null
    & corepack prepare yarn@1.22.22 --activate | Out-Null
    $y = (& yarn --version 2>$null)
    if ($LASTEXITCODE -eq 0 -and $y) { $HasYarn = $true }
  } catch {
    Write-Host "Corepack/yarn enable failed. Will fall back to npm for frontend."
  }
}

# ---------------- CREATE TEMP START SCRIPTS (avoids quoting issues) ----------------
$TmpDir = Join-Path $env:TEMP "pcs-start"
New-Item -ItemType Directory -Force -Path $TmpDir | Out-Null

$BackendStart  = Join-Path $TmpDir "start-backend.ps1"
$FrontendStart = Join-Path $TmpDir "start-frontend.ps1"

# Backend starter: IMPORTANT - use correct module path backend.server:app
@"
`$ErrorActionPreference = "Stop"
Set-Location -LiteralPath "$Root"
Write-Host "Starting backend: $BackendApp"
& "$PythonExe" -m uvicorn $BackendApp --host $BackendHost --port $BackendPort --reload
"@ | Set-Content -LiteralPath $BackendStart -Encoding UTF8

# Frontend starter: yarn preferred; npm fallback
if ($HasYarn) {
@"
`$ErrorActionPreference = "Stop"
Set-Location -LiteralPath "$FrontendDir"
Write-Host "Installing frontend deps (yarn)..."
yarn install
Write-Host "Starting frontend (yarn start)..."
yarn start
"@ | Set-Content -LiteralPath $FrontendStart -Encoding UTF8
} else {
@"
`$ErrorActionPreference = "Stop"
Set-Location -LiteralPath "$FrontendDir"
Write-Host "Installing frontend deps (npm)..."
npm install
Write-Host "Starting frontend (npm start)..."
npm start
"@ | Set-Content -LiteralPath $FrontendStart -Encoding UTF8
}

# ---------------- START BACKEND (NEW WINDOW) ----------------
Write-Host "Starting backend window..."
Start-Process -FilePath "powershell.exe" -ArgumentList @(
  "-NoExit",
  "-ExecutionPolicy", "Bypass",
  "-File", $BackendStart
) | Out-Null

# ---------------- START FRONTEND (NEW WINDOW) ----------------
Write-Host "Starting frontend window..."
Start-Process -FilePath "powershell.exe" -ArgumentList @(
  "-NoExit",
  "-ExecutionPolicy", "Bypass",
  "-File", $FrontendStart
) | Out-Null

Write-Host ""
Write-Host "✅ Started."
Write-Host "Backend:  http://$BackendHost`:$BackendPort/api"
Write-Host "Frontend: $FrontendUrl"







