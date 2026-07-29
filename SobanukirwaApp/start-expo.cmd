@echo off
setlocal EnableDelayedExpansion
set "NODE_OPTIONS="
set "PATH=C:\Users\ELOHOME\AppData\Local\nvm\v20.18.1;C:\Windows\system32;C:\Windows"
cd /d D:\Sobanukirwa\SobanukirwaApp
echo Node: 
node --version
echo.
echo Starting Expo...
npx expo start
