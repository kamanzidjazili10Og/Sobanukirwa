$env:NODE_OPTIONS = ''
$env:PATH = "C:\Users\ELOHOME\AppData\Local\nvm\v20.18.1;C:\Windows\system32;C:\Windows"
Write-Host "Node: $(node --version)" -ForegroundColor Green
Write-Host "Starting Expo..." -ForegroundColor Cyan
npx expo start
