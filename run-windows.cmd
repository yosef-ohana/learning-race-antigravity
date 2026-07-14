@echo off
setlocal

:: 1. Use paths relative to the script location.
cd /d "%~dp0"

:: 3. Check requirements
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: java is missing. Please install Java 17 or compatible.
    exit /b 1
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: node is missing. Please install Node.js.
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm is missing. Please install npm.
    exit /b 1
)

echo Starting Backend...
start "Learning Race Backend" cmd /c "cd backend && mvnw.cmd spring-boot:run"

echo Starting Frontend...
if not exist "frontend\node_modules" (
    echo Installing Frontend dependencies...
    cd frontend
    call npm ci
    if errorlevel 1 (
        echo ERROR: npm ci failed with exit code %errorlevel%.
        exit /b %errorlevel%
    )
    cd ..
)

start "Learning Race Frontend" cmd /c "cd frontend && npm run dev"

echo.
echo =======================================================
echo Backend:       http://localhost:8080
echo Frontend:      http://localhost:3000
echo Teacher Login: http://localhost:3000/teacher/login
echo =======================================================
echo.
