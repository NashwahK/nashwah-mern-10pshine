$SONAR_HOST = "https://sonarcloud.io"
$SONAR_ORG = "nashwahk"
$SONAR_TOKEN = "c25d327a8b813cba63027e57f85cffa87033e683"

# Backend Analysis
Write-Host "=== Scanning Backend Code ===" -ForegroundColor Cyan
cd ./backend
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
cd ../frontend
npx sonar-scanner `
  -Dsonar.projectKey=nashwah-notes-frontend `
  -Dsonar.organization=$SONAR_ORG `
  -Dsonar.sources=src `
  -Dsonar.host.url=$SONAR_HOST `
  -Dsonar.login=$SONAR_TOKEN

Write-Host ""
Write-Host "Frontend scan complete. Check: https://sonarcloud.io/dashboard?id=nashwah-notes-frontend" -ForegroundColor Green
