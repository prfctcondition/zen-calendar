$widgetDir = "D:\opencodeprojects\widget"

# Киляем старые процессы
Get-Process -Name "electron" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "vite" } | Stop-Process -Force

# Запускаем Vite
Start-Process -WindowStyle Hidden -FilePath "cmd.exe" -ArgumentList "/c cd /d $widgetDir && npx vite"

# Ждём
Write-Host "Waiting for Vite..." -NoNewline
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 1
        if ($r.StatusCode -eq 200) { $ready = $true; break }
    } catch {}
    Start-Sleep -Milliseconds 300
    Write-Host "." -NoNewline
}
Write-Host ""

if (-not $ready) {
    Write-Host "Vite failed to start" -ForegroundColor Red
    pause
    exit
}

Write-Host "Starting Electron..." -ForegroundColor Green
Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d $widgetDir && npx electron ." -WindowStyle Hidden
