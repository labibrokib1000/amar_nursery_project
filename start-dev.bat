@echo off
title AmarNursery Development Server
echo Starting AmarNursery Development Environment...
echo.

echo Starting Backend Server (Port 5000)...
start cmd /k "cd backend && npm start"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server (Port 3000)...
start cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo  AmarNursery Development Environment
echo ========================================
echo  Frontend: http://localhost:3000
echo  Backend:  http://localhost:5000
echo  API:      http://localhost:5000/api
echo ========================================
echo.
echo Press any key to exit...
pause >nul
