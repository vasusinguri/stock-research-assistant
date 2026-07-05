@echo off
title AI Stock Research Assistant - Master Launcher
echo ======================================================================
echo           Launching AI-Powered Indian Stock Research Assistant
echo ======================================================================
echo.

start "FastAPI Backend API" cmd /k "%~dp0run_backend.bat"
start "React Frontend Web App" cmd /k "%~dp0run_frontend.bat"

echo Servers launched!
echo - Backend API: http://localhost:8000/docs
echo - Frontend App: http://localhost:5173
echo.
pause
