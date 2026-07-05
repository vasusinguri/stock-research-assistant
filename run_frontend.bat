@echo off
title AI Stock Research Assistant - React Frontend Web App
echo ======================================================================
echo           Starting React Frontend Development Server (Port 5173)
echo ======================================================================
echo.

set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0frontend"
call npm run dev
pause
