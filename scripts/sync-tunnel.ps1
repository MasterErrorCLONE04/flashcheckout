# PowerShell script to synchronize the .env app URL with the latest Cloudflare Tunnel URL
$logs = docker logs flashcheckout-tunnel 2>&1
$matches = [regex]::matches($logs, "https://[a-zA-Z0-9-]+\.trycloudflare\.com")
if ($matches.Count -eq 0) {
    Write-Host "No active Cloudflare Tunnel URL found in logs." -ForegroundColor Red
    exit
}
$latestUrl = $matches[$matches.Count - 1].Value
Write-Host "Latest Tunnel URL found: $latestUrl" -ForegroundColor Green

$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "No .env file found in root." -ForegroundColor Red
    exit
}

$content = Get-Content $envFile -Raw
$regexPattern = "NEXT_PUBLIC_APP_URL=https://[a-zA-Z0-9-]+\.trycloudflare\.com"
if ($content -match $regexPattern) {
    $currentMatch = $Matches[0]
    $currentUrl = $currentMatch.Split("=")[1]
    if ($currentUrl -eq $latestUrl) {
        Write-Host "The .env file is already synchronized with the latest tunnel URL. No changes needed." -ForegroundColor Yellow
        exit
    }
    $newContent = $content -replace $regexPattern, "NEXT_PUBLIC_APP_URL=$latestUrl"
    Set-Content -Path $envFile -Value $newContent -NoNewline
    Write-Host "Successfully updated .env with: $latestUrl" -ForegroundColor Green
    Write-Host "Restarting container flashcheckout-web..." -ForegroundColor Cyan
    $restart = docker restart flashcheckout-web
    Write-Host "Done! Web server restarted." -ForegroundColor Green
} else {
    Write-Host "Could not find NEXT_PUBLIC_APP_URL in .env matching a trycloudflare domain." -ForegroundColor Red
}
