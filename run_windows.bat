@echo off
echo IP Dropper - Run Script for Windows
echo ==================================
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: npm is not installed or not in the PATH.
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

REM Navigate to the script's directory
cd /d "%~dp0"

echo Starting IP Dropper...
echo.
echo The application will open in your default web browser.
echo Press Ctrl+C to stop the application.
echo.

call npm run dev:web

if %ERRORLEVEL% neq 0 (
    echo.
    echo Error: Failed to start the application.
    exit /b 1
)
