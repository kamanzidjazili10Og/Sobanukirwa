@echo off
echo ========================================
echo   Sobanukirwa App - Web Mode
echo ========================================
echo.

cd /d "%~dp0"

echo Starting Expo Web on http://localhost:8081 ...
echo Press Ctrl+C to stop.
echo.

npx.cmd expo start --web --port 8081

pause
