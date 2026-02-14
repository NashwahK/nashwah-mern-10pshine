$SONAR_HOST = "https://sonarcloud.io"
$SONAR_ORG = "nashwahk"
# Read token from environment variable to avoid committing secrets
$SONAR_TOKEN = $env:SONAR_TOKEN
if (-not $SONAR_TOKEN) {
  Write-Host "Warning: SONAR_TOKEN environment variable is not set. Aborting scan." -ForegroundColor Red
  exit 1
}

# Backend Analysis
Write-Host "=== Scanning Backend Code ===" -ForegroundColor Cyan
Set-Location ./backend
npx sonar-scanner `
  -Dsonar.projectKey=nashwah-notes-backend `
  -Dsonar.organization=$SONAR_ORG `
  -Dsonar.sources=src `
  -Dsonar.host.url=$SONAR_HOST `
  -Dsonar.login=$SONAR_TOKEN

Write-Host ""
Write-Host "Backend scan complete. Check: https://sonarcloud.io/dashboard?id=nashwah-notes-backend" -ForegroundColor Green

# Frontend Analysis
Write-Host ""
Write-Host "=== Scanning Frontend Code ===" -ForegroundColor Cyan
Set-Location ../frontend
npx sonar-scanner `
  -Dsonar.projectKey=nashwah-notes-frontend `
  -Dsonar.organization=$SONAR_ORG `
  -Dsonar.sources=src `
  -Dsonar.host.url=$SONAR_HOST `
  -Dsonar.login=$SONAR_TOKEN

Write-Host ""
Write-Host "Frontend scan complete. Check: https://sonarcloud.io/dashboard?id=nashwah-notes-frontend" -ForegroundColor Green
