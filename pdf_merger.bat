@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

:: Ensure the script is executed in the root directory of the project
cd /d %~dp0

:: Starting the Flask API
echo Starting Flask API...
start /B "" cmd /C "set FLASK_APP=src\app.py && set FLASK_ENV=development && flask run > flask_log.txt 2>&1"
if %errorlevel% neq 0 (
    echo Failed to start Flask API.
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
