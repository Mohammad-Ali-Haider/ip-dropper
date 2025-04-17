@echo off
title IP Dropper - Setup Script (Windows)

:: Change to the directory where the script is located
cd /d "%~dp0"

echo =====================================
echo   IP Dropper - Setup Script (Windows)
echo =====================================
echo.
echo This script will install all dependencies for IP Dropper.
echo Please wait, this may take a few minutes...
echo.

:: Install dependencies
call npm install

:: Check if installation was successful
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Setup completed successfully!
    echo.
    echo You can now run the application by double-clicking the 'run-windows.bat' file.
    echo.
    pause
) else (
    echo.
    echo Setup failed. Please check the error messages above.
    echo.
    pause
    exit /b 1
)
