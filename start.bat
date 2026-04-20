@echo off
title CAFE POS STARTER

echo =====================================
echo    STARTING CAFE POS SYSTEM
echo =====================================

:: BACKEND
echo Starting Backend...
start "Cafe POS Backend" cmd /k "cd cafe-pos-backend && npm start"

timeout /t 3 > nul

:: FRONTEND (STOP AUTO OPEN)
echo Starting Frontend...
start "Cafe POS Frontend" cmd /k "cd cafe-pos-frontend && set BROWSER=none && npm start"

echo Waiting for services...
timeout /t 10 > nul

:: OPEN ONLY ONE URL
echo Opening POS System...
start http://localhost:3030

echo =====================================
echo   SYSTEM RUNNING SUCCESSFULLY
echo =====================================

pause