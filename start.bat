@echo off
title Sobanukirwa - Islamic Learning Platform
color 0A
echo.
echo  ========================================
echo     SOBANUKIRWA - Islamic Learning Platform
echo  ========================================
echo.
echo  Starting Platform...
echo.

:: Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Node.js is not installed!
    echo  Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

:: Check if MySQL is running
echo  [1/3] Checking MySQL connection...
cd /d "%~dp0backend"
node -e "
const mysql = require('mysql2/promise');
require('dotenv').config();
mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
}).then(c => { c.end(); process.exit(0); }).catch(e => { console.error(e.message); process.exit(1); });
" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo  [WARN] MySQL not reachable. Make sure MySQL is running.
    echo  Run: npm run seed  (after MySQL is started)
) else (
    echo  [OK] MySQL is connected.
)

:: Install dependencies if needed
echo  [2/3] Checking dependencies...
if not exist "node_modules" (
    echo  Installing dependencies...
    call npm install
)

:: Run database seed
echo  Running database seed...
call npm run seed

:: Kill any existing process on port 5000
echo  Killing any existing process on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    if not "%%a"=="" (
        taskkill /F /PID %%a >nul 2>&1
    )
)
timeout /t 1 /nobreak >nul

:: Start the backend server
echo  [3/3] Starting API server on port 5000...
echo.
echo  Backend API: http://localhost:5000
echo  Admin Panel: http://localhost:5000/admin
echo  Health Check: http://localhost:5000/api/health
echo.
echo  Login: admin / admin123
echo.
echo  Press Ctrl+C to stop the server
echo  ========================================
echo.
start http://localhost:5000
node server.js
pause
