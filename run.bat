@echo off
title VisualProof Studio — LinkedIn Showcase Creator
color 0B
echo.
echo ======================================================================
echo             VisualProof Studio — Local Creation Studio
echo ======================================================================
echo.
echo   Automated Headless Browser Agent, Crystal-Clear 1080p GIF Synthesizer,
echo   and SARI-Powered LinkedIn Post Creator.
echo.
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Node.js environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js is not found on your system!
    echo Please download and install Node.js (LTS version) from:
    echo    https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [2/3] Verifying dependencies...
if not exist "node_modules\" (
    echo Dependencies not found. Installing node packages...
    call npm install
)

echo [3/3] Starting VisualProof Studio server on http://localhost:3000...
echo.
echo Opening Studio in your default browser...
start "" "http://localhost:3000"

echo.
echo ----------------------------------------------------------------------
echo  Studio is running at: http://localhost:3000
echo  Press Ctrl+C in this command window to shut down the server.
echo ----------------------------------------------------------------------
echo.

node src/server.js
pause
