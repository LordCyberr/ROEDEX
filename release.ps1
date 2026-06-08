# release.ps1
# Automates the build and zipping process for ROEDEX releases.

Write-Host "Building ROEDEX..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Aborting release." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Build successful." -ForegroundColor Green

# Extract version from package.json
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$version = $packageJson.version

# Ensure stable folder exists
if (!(Test-Path "stable")) {
    New-Item -ItemType Directory -Force -Path "stable"
}

# Define zip names
$sourceZipPath = "stable\roedex-source-v$version.zip"
$distZipPath = "stable\roedex-extension-v$version.zip"

Write-Host "Zipping dist folder to $distZipPath..." -ForegroundColor Cyan
if (Test-Path $distZipPath) { Remove-Item $distZipPath -Force }
Compress-Archive -Path "dist\*" -DestinationPath $distZipPath

Write-Host "Zipping source code to $sourceZipPath..." -ForegroundColor Cyan
if (Test-Path $sourceZipPath) { Remove-Item $sourceZipPath -Force }

# Exclude large/unnecessary folders from source zip
$sourceItems = Get-ChildItem -Path . -Exclude node_modules, dist, stable, old_reference, .git, *.zip
Compress-Archive -Path $sourceItems.FullName -DestinationPath $sourceZipPath

Write-Host "Release v$version successfully created in stable/ directory!" -ForegroundColor Green
