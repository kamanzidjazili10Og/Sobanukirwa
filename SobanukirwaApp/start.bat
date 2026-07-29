@echo off
set "NODE_OPTIONS="
set "PATH=C:\Users\ELOHOME\AppData\Local\nvm\v20.18.1;%PATH%"
cd /d "%~dp0"
echo Node version:
node --version
echo Starting Expo...
npx expo start
