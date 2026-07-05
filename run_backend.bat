@echo off
title AI Stock Research Assistant - FastAPI Backend API
echo ======================================================================
echo           Starting FastAPI Backend API Server (Port 8000)
echo ======================================================================
echo.

cd /d "%~dp0backend"
py -3 -m uvicorn app.main:app --reload --port 8000
pause
