@echo off
title FinSight 2.0 - Server Launcher
color 0A

echo.
echo  =============================================
echo    FinSight 2.0 - Starting Servers...
echo  =============================================
echo.

:: Start Backend (FastAPI)
echo  [1/2] Starting Backend API (port 8000)...
start "FinSight Backend - FastAPI" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

:: Wait 3 seconds for backend to initialize
timeout /t 3 /nobreak > nul

:: Start Frontend (Next.js)
echo  [2/2] Starting Frontend (port 3000)...
start "FinSight Frontend - Next.js" cmd /k "cd /d %~dp0frontend && npm run dev"

:: Wait 5 seconds for frontend to boot
timeout /t 5 /nobreak > nul

echo.
echo  =============================================
echo    Both servers are starting up!
echo  =============================================
echo.
echo    Frontend : http://localhost:3000
echo    Backend  : http://127.0.0.1:8000
echo    API Docs : http://127.0.0.1:8000/docs
echo.
echo  Opening browser in 3 seconds...
timeout /t 3 /nobreak > nul

:: Open app in default browser
start http://localhost:3000

echo.
echo  Done! You can close this window.
pause
