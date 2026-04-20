@echo off
title Cafe POS System

echo =====================================
echo        STARTING CAFE POS
echo =====================================

cd /d %~dp0

echo.
echo Starting Backend Server...
cd cafe-pos-backend
start cmd /k "npm start"

echo.
echo Starting Frontend...
cd ../cafe-pos-frontend
start cmd /k "npm start"

echo.
echo Waiting for services...
timeout /t 5 >nul

echo Opening POS in browser...
start http://localhost:3000

echo.
echo =====================================
echo     CAFE POS IS RUNNING
echo =====================================

pause