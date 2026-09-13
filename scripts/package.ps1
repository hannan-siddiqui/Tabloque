$ErrorActionPreference = "Stop"

$distPath = Join-Path $PSScriptRoot "..\dist"
$zipPath = Join-Path $PSScriptRoot "..\TabLoque-v1.0.0.zip"

if (Test-Path $zipPath) {
    Remove-Item -Force $zipPath
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($distPath, $zipPath, [System.IO.Compression.CompressionLevel]::Optimal, $false)

Write-Host "Successfully packaged TabLoque to $zipPath"
