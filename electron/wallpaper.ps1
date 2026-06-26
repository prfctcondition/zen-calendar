# Get wallpaper path from registry
$path = (Get-ItemProperty -Path "HKCU:\Control Panel\Desktop" -Name WallPaper).WallPaper
if (-not $path -or -not (Test-Path $path)) { exit }

# Get file extension
$ext = [System.IO.Path]::GetExtension($path).ToLower()
$mime = @{'.jpg'='image/jpeg';'.jpeg'='image/jpeg';'.png'='image/png';'.bmp'='image/bmp'}

if (-not $mime.ContainsKey($ext)) { exit }

# Read file and convert to base64
$bytes = [System.IO.File]::ReadAllBytes($path)
$base64 = [Convert]::ToBase64String($bytes)
$dataUri = "data:$($mime[$ext]);base64,$base64"

# Output path and data URI
Write-Output "$path|$dataUri"
