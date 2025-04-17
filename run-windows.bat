@echo off
title IP Dropper - Run Script (Windows)

:: Change to the directory where the script is located
cd /d "%~dp0"

echo =====================================
echo   IP Dropper - Run Script (Windows)
echo =====================================
echo.
echo Starting IP Dropper in development mode...
echo The application will open in a new window.
echo.
echo To stop the application, press Ctrl+C in this terminal window and then Y to confirm.
echo.

:: Run the application
call npm run dev

:: Keep terminal open if there's an error
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Application exited with an error.
    echo.
    pause
    exit /b 1
)
