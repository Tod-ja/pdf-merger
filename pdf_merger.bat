@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

:: Ensure the script is executed in the root directory of the project
cd /d %~dp0


:: Log current directory for debugging
echo Current directory: %~dp0

:: Verify that the src\app.py file exists
if not exist "src\app.py" (
    echo ERROR: src\app.py not found.
    exit /b
)

:: Starting the Flask API
echo Starting Flask API...
start /B "" cmd /C "python src\app.py > flask_log.txt 2>&1"
if %errorlevel% neq 0 (
    echo Failed to start Flask API.
    exit /b
)

:: Verify that package.json exists
if not exist "package.json" (
    echo ERROR: package.json not found.
    exit /b
)

:: Starting the React App
echo Starting React App...
start /B "" cmd /C "npm start > react_log.txt 2>&1"
if %errorlevel% neq 0 (
    echo Failed to start React App.
    exit /b
)

echo Both applications are starting in the background...
exit