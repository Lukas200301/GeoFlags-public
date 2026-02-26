# Stop all GeoFlags dev processes (does NOT touch the database)
# Usage: .\scripts\stop-all.ps1

Write-Host ""
Write-Host "Stopping all GeoFlags dev processes..." -ForegroundColor Yellow

$killed = 0

Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction SilentlyContinue).CommandLine
        if ($cmdLine -and $cmdLine -like "*GeoFlags*") {
            Stop-Process -Id $_.Id -Force
            Write-Host "  Killed node process $($_.Id)" -ForegroundColor Green
            $killed++
        }
    } catch {}
}

if ($killed -eq 0) {
    Write-Host "  No GeoFlags Node.js processes found." -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "Stopped $killed process(es). Safe to run 'npx prisma generate' now." -ForegroundColor Green
}
