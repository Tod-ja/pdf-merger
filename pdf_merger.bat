@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

:: Ensure the script is executed in the root directory of the project
cd /d %~dp0

:: Starting the Flask API
echo Starting Flask API...
start /B "" cmd /C "call venv\Scripts\activate && set FLASK_APP=src\app.py && set FLASK_ENV=development && flask run"

:: Starting the React App
echo Starting React App...
start /B "" cmd /C "npm start"

echo Both applications are starting in the background...
exit