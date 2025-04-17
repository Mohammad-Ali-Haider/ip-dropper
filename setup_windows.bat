@echo off
echo IP Dropper - Setup Script for Windows
echo ======================================
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

echo Installing dependencies...
call npm install

if %ERRORLEVEL% neq 0 (
    echo.
    echo Error: Failed to install dependencies.
    exit /b 1
)

echo.
echo Setup completed successfully!
echo To run the application, use the run_windows.bat script.
echo.
