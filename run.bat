@echo off
setlocal
cd /d "%~dp0"
title VisualProof Studio - Local Server
color 0B

echo.
echo ======================================================================
echo             VisualProof Studio - Local Creation Studio
echo ======================================================================
echo.
echo   Automated Headless Browser Agent, Crystal-Clear 1080p GIF Synthesizer,
echo   and SARI-Powered LinkedIn Post Creator.
echo.
echo ======================================================================
echo.

echo [1/3] Checking Node.js environment...
where node >nul 2>&1
if errorlevel 1 goto node_missing

echo [2/3] Verifying dependencies...
if not exist "node_modules\" (
    echo Dependencies not found. Installing node packages...
    call npm install
)

echo [3/3] Starting VisualProof Studio server on http://localhost:3000...
echo.
echo Opening Studio in your default browser...
start http://localhost:3000

echo.
echo ----------------------------------------------------------------------
echo  Studio is running at: http://localhost:3000
echo  Press Ctrl+C in this command window to shut down the server.
echo ----------------------------------------------------------------------
echo.

node src/server.js
pause
goto :eof

:node_missing
echo.
echo ======================================================================
echo [ERROR] Node.js is not installed or not found in PATH!
echo Please download and install Node.js LTS from https://nodejs.org
echo Then restart this script.
echo ======================================================================
echo.
pause
exit /b 1
