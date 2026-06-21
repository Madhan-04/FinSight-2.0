@echo off
title FinSight 2.0 - Stop Servers
color 0C
echo.
echo  Stopping all FinSight servers...
echo.
taskkill /F /FI "WINDOWTITLE eq FinSight Backend*" 2>nul
taskkill /F /FI "WINDOWTITLE eq FinSight Frontend*" 2>nul
taskkill /F /IM "python.exe" /FI "WINDOWTITLE eq FinSight*" 2>nul

:: Kill any process using port 8000 or 3000
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul

echo  Servers stopped successfully!
echo.
pause
