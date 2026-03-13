# Stop all GeoFlags dev processes (does NOT touch the database)
# Usage: .\scripts\stop-all.ps1

Write-Host ""
Write-Host "Stopping all GeoFlags dev processes..." -ForegroundColor Yellow

$killed = 0

# Kill by checking node command line
Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction SilentlyContinue).CommandLine
        if ($cmdLine -and ($cmdLine -match "GeoFlags" -or $cmdLine -match "\.output[/\\]server[/\\]index\.mjs" -or $cmdLine -match "backend[/\\]dist[/\\]index\.js" -or $cmdLine -match "concurrently")) {
            Stop-Process -Id $_.Id -Force
            Write-Host "  Killed node process $($_.Id) (matched command line)" -ForegroundColor Green
            $killed++
        }
    } catch {}
}

# Ensure ports 3000 and 3001 are freed (to prevent EADDRINUSE)
$ports = @(3000, 3001)
foreach ($port in $ports) {
    $connections = netstat -ano | Select-String "LISTENING" | Select-String ":$port\b"
    if ($connections) {
        foreach ($conn in $connections) {
            $parts = $conn.ToString().Trim() -split '\s+'
            $pidToKill = $parts[-1]
            if ($pidToKill -and $pidToKill -ne "0") {
                try {
                    Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
                    Write-Host "  Killed process $pidToKill (blocking port $port)" -ForegroundColor Green
                    $killed++
                } catch {}
            }
        }
    }
}

if ($killed -eq 0) {
    Write-Host "  No GeoFlags Node.js processes found." -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "Stopped $killed process(es). Safe to run 'npx prisma generate' now." -ForegroundColor Green
}
